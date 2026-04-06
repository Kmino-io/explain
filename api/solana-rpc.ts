import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    // Only forward Content-Type — strip browser headers (Origin, Referer, etc.)
    // so the Solana Foundation RPC doesn't block the request
    const rpcResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!rpcResponse.ok) {
      const errorText = await rpcResponse.text()
      return response.status(rpcResponse.status).json({
        error: 'RPC request failed',
        status: rpcResponse.status,
        message: errorText,
      })
    }

    const data = await rpcResponse.json()
    return response.status(200).json(data)
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return response.status(504).json({
        error: 'Gateway Timeout',
        message: 'The Solana RPC endpoint did not respond in time',
      })
    }
    return response.status(500).json({
      error: 'Failed to proxy RPC request',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
