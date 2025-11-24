import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the RPC endpoint (with fallback)
    const rpcUrl = process.env.SUI_RPC_URL || 'https://fullnode.mainnet.sui.io:443'
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    // Forward the request to Sui RPC
    const rpcResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!rpcResponse.ok) {
      const errorText = await rpcResponse.text()
      console.error('RPC error:', rpcResponse.status, errorText)
      return response.status(rpcResponse.status).json({ 
        error: 'RPC request failed',
        status: rpcResponse.status,
        message: errorText
      })
    }

    const data = await rpcResponse.json()

    // Forward the response with proper status
    return response.status(200).json(data)
  } catch (error) {
    console.error('RPC proxy error:', error)
    
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return response.status(504).json({ 
        error: 'Gateway Timeout',
        message: 'The Sui RPC endpoint did not respond in time'
      })
    }
    
    return response.status(500).json({ 
      error: 'Failed to proxy RPC request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

