import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client'
import { ParsedTransaction, ObjectChange, TransferChange, PackageCall } from '../types/transaction'

// Initialize Sui client with proper configuration
// In development, use the Vite proxy to avoid CORS issues
// In production, this will need to be configured differently
const getRpcUrl = () => {
  if (import.meta.env.DEV) {
    // Use Vite proxy in development
    return '/sui-rpc'
  }
  // In production, use the direct URL
  return 'https://fullnode.mainnet.sui.io:443'
}

const client = new SuiClient({ 
  url: getRpcUrl()
})

export async function fetchTransactionDetails(digest: string): Promise<ParsedTransaction> {
  try {
    console.log('Fetching transaction:', digest)
    
    // Fetch transaction block
    const txBlock = await client.getTransactionBlock({
      digest: digest,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    })

    console.log('Transaction fetched successfully, attempting enrichment...')

    // Try to fetch object details for transferred coins and NFTs
    // This is optional - if it fails, we'll still show the transaction
    let enrichedTxBlock = { ...txBlock, enrichedObjects: new Map() }
    try {
      enrichedTxBlock = await enrichWithObjectData(txBlock, client)
    } catch (enrichError) {
      console.warn('Failed to enrich with object data, continuing without it:', enrichError)
      // Continue with empty enrichedObjects map
    }
    
    console.log('Parsing transaction...')
    // Parse the transaction
    const parsed = parseTransaction(enrichedTxBlock)
    console.log('Transaction parsed successfully')
    return parsed
  } catch (error) {
    console.error('Error fetching transaction:', error)
    if (error instanceof Error && error.message) {
      throw new Error(`Failed to fetch transaction: ${error.message}`)
    }
    throw new Error('Failed to fetch transaction: Unknown error')
  }
}

async function enrichWithObjectData(txBlock: any, client: SuiClient): Promise<any> {
  try {
    // Get transferred coin objects
    const coinObjects = (txBlock.objectChanges || [])
      .filter((change: any) => change.type === 'transferred' && change.objectType?.includes('coin::Coin'))
      .slice(0, 3) // Reduced to 3 coins
    
    // Get created objects (for NFTs that were just minted)
    const createdObjects = (txBlock.objectChanges || [])
      .filter((change: any) => change.type === 'created')
      .slice(0, 5) // Reduced to 5 created objects
    
    // Get transferred non-coin objects (for NFT transfers)
    const transferredNonCoinObjects = (txBlock.objectChanges || [])
      .filter((change: any) => change.type === 'transferred' && !change.objectType?.includes('coin::Coin'))
      .slice(0, 5) // Fetch up to 5 transferred NFTs
    
    const allObjectsToFetch = [...coinObjects, ...createdObjects, ...transferredNonCoinObjects]
    
    if (allObjectsToFetch.length === 0) {
      return { ...txBlock, enrichedObjects: new Map() }
    }
    
    console.log(`Attempting to enrich ${allObjectsToFetch.length} objects`, {
      coins: coinObjects.length,
      created: createdObjects.length,
      transferredNonCoin: transferredNonCoinObjects.length
    })
    
    // Fetch object data for each object with individual timeouts
    const objectDataPromises = allObjectsToFetch.map(async (obj: any) => {
      try {
        // Shorter timeout per object
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
        
        const fetchPromise = client.getObject({
          id: obj.objectId,
          options: { showContent: true, showType: true, showDisplay: true }
        })
        
        const objectData = await Promise.race([fetchPromise, timeoutPromise])
        console.log(`Successfully fetched object ${obj.objectId}`)
        return { objectId: obj.objectId, data: objectData }
      } catch (e) {
        console.warn(`Failed to fetch object ${obj.objectId}:`, e instanceof Error ? e.message : 'Unknown error')
        return null
      }
    })
    
    // Overall timeout for all fetches - reduced to 4 seconds
    const allFetchesPromise = Promise.all(objectDataPromises)
    const overallTimeoutPromise = new Promise<any[]>((_, reject) => 
      setTimeout(() => reject(new Error('Overall timeout')), 4000)
    )
    
    const objectDataResults = await Promise.race([allFetchesPromise, overallTimeoutPromise])
    
    const objectDataMap = new Map(
      objectDataResults
        .filter(r => r !== null)
        .map(r => [r!.objectId, r!.data])
    )
    
    console.log(`Successfully enriched ${objectDataMap.size} objects`)
    return { ...txBlock, enrichedObjects: objectDataMap }
  } catch (e) {
    console.warn('Failed to enrich objects, continuing without enrichment:', e instanceof Error ? e.message : 'Unknown error')
    return { ...txBlock, enrichedObjects: new Map() }
  }
}

function parseTransaction(txBlock: any): ParsedTransaction {
  const effects = txBlock.effects
  const objectChanges = txBlock.objectChanges || []
  const balanceChanges = txBlock.balanceChanges || []
  
  // Extract sender
  const sender = txBlock.transaction?.data?.sender || 'Unknown'
  
  // Extract gas information
  const gasUsed = effects?.gasUsed
  const totalGas = gasUsed 
    ? BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost) - BigInt(gasUsed.storageRebate)
    : BigInt(0)
  const gasCostSui = (Number(totalGas) / 1_000_000_000).toFixed(6)
  
  // Parse object changes
  const objectsCreated: ObjectChange[] = []
  const objectsDeleted: ObjectChange[] = []
  const objectsMutated: ObjectChange[] = []
  const objectsTransferred: TransferChange[] = []
  
  for (const change of objectChanges) {
    if (change.type === 'created') {
      const enrichedData = txBlock.enrichedObjects?.get(change.objectId)
      const isNFT = isNFTObject(change.objectType, enrichedData)
      const nftMetadata = isNFT ? extractNFTMetadata(enrichedData) : undefined
      
      // Debug logging
      console.log('Created object:', {
        objectId: change.objectId,
        objectType: change.objectType,
        isNFT,
        hasEnrichedData: !!enrichedData,
        hasDisplay: !!enrichedData?.data?.display?.data,
        hasContent: !!enrichedData?.data?.content?.fields,
      })
      
      objectsCreated.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        version: change.version,
        digest: change.digest,
        owner: formatOwner(change.owner),
        isNFT,
        nftMetadata,
      })
    } else if (change.type === 'deleted') {
      objectsDeleted.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        version: change.version,
        digest: change.digest,
      })
    } else if (change.type === 'mutated') {
      objectsMutated.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        version: change.version,
        digest: change.digest,
        owner: formatOwner(change.owner),
      })
    } else if (change.type === 'transferred') {
      // Extract coin information if available
      let amount: string | undefined
      let tokenSymbol: string | undefined
      let tokenDecimals: number | undefined
      
      if (change.objectType?.includes('coin::Coin')) {
        const coinInfo = extractCoinInfo(change.objectType, txBlock.enrichedObjects?.get(change.objectId))
        amount = coinInfo.amount
        tokenSymbol = coinInfo.symbol
        tokenDecimals = coinInfo.decimals
      }
      
      // Check if this is an NFT transfer
      const enrichedData = txBlock.enrichedObjects?.get(change.objectId)
      const isNFT = isNFTObject(change.objectType, enrichedData)
      const nftMetadata = isNFT ? extractNFTMetadata(enrichedData) : undefined
      
      console.log('Transferred object:', {
        objectId: change.objectId,
        objectType: change.objectType,
        isNFT,
        hasEnrichedData: !!enrichedData,
        nftMetadata: nftMetadata ? 'yes' : 'no'
      })
      
      objectsTransferred.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        from: formatOwner(change.sender),
        to: formatOwner(change.recipient),
        version: change.version,
        amount,
        tokenSymbol,
        tokenDecimals,
        isNFT,
        nftMetadata,
      })
    }
  }
  
  // Extract package calls
  const packageCalls: PackageCall[] = []
  const transactions = txBlock.transaction?.data?.transaction?.transactions || []
  
  for (const tx of transactions) {
    if (tx.MoveCall) {
      const call = tx.MoveCall
      packageCalls.push({
        package: call.package,
        module: call.module,
        function: call.function,
        displayName: `${call.module}::${call.function}`,
      })
    }
  }
  
  // Create user mapping for addresses
  const addressToUser = new Map<string, string>()
  const userLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  let userIndex = 0
  
  const getOrCreateUserLabel = (address: string): string => {
    if (address === 'Unknown' || address === 'Shared' || address === 'Immutable' || address.startsWith('Object(')) {
      return address
    }
    if (!addressToUser.has(address)) {
      if (userIndex < userLabels.length) {
        addressToUser.set(address, `User ${userLabels[userIndex++]}`)
      } else {
        addressToUser.set(address, truncateAddress(address))
      }
    }
    return addressToUser.get(address)!
  }
  
  // Map sender first
  getOrCreateUserLabel(sender)
  
  // Map all involved addresses
  for (const transfer of objectsTransferred) {
    const fromAddr = txBlock.objectChanges?.find((c: any) => 
      c.objectId === transfer.objectId && c.type === 'transferred'
    )?.sender
    const toAddr = txBlock.objectChanges?.find((c: any) => 
      c.objectId === transfer.objectId && c.type === 'transferred'
    )?.recipient
    
    if (fromAddr) {
      const fullFrom = getFullAddress(fromAddr)
      getOrCreateUserLabel(fullFrom)
    }
    if (toAddr) {
      const fullTo = getFullAddress(toAddr)
      getOrCreateUserLabel(fullTo)
    }
  }
  
  for (const change of balanceChanges) {
    const addr = change.owner?.AddressOwner
    if (addr) {
      getOrCreateUserLabel(addr)
    }
  }
  
  // Generate human-readable summary
  const summaryData = generateSummary({
    sender,
    objectsCreated,
    objectsDeleted,
    objectsMutated,
    objectsTransferred,
    packageCalls,
    balanceChanges,
    addressToUser,
    rawObjectChanges: txBlock.objectChanges,
  })
  
  // Generate AI-style transaction summary
  const aiSummary = generateAISummary({
    sender,
    objectsCreated,
    objectsTransferred,
    packageCalls,
    balanceChanges,
    addressToUser,
  })

  return {
    digest: txBlock.digest,
    timestamp: txBlock.timestampMs ? Number(txBlock.timestampMs) : undefined,
    sender,
    success: effects?.status?.status === 'success',
    gasUsed: totalGas.toString(),
    gasCostSui,
    objectsCreated,
    objectsDeleted,
    objectsMutated,
    objectsTransferred,
    packageCalls,
    summary: summaryData.summary,
    userAddressMap: summaryData.userAddressMap,
    aiSummary,
    rawEffects: effects,
  }
}

function formatOwner(owner: any): string {
  if (!owner) return 'Unknown'
  if (typeof owner === 'string') return truncateAddress(owner)
  if (owner.AddressOwner) return truncateAddress(owner.AddressOwner)
  if (owner.ObjectOwner) return `Object(${truncateAddress(owner.ObjectOwner)})`
  if (owner.Shared) return 'Shared'
  if (owner.Immutable) return 'Immutable'
  return 'Unknown'
}

function getFullAddress(owner: any): string {
  if (!owner) return 'Unknown'
  if (typeof owner === 'string') return owner
  if (owner.AddressOwner) return owner.AddressOwner
  if (owner.ObjectOwner) return owner.ObjectOwner
  if (owner.Shared) return 'Shared'
  if (owner.Immutable) return 'Immutable'
  return 'Unknown'
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function generateSummary(data: any): { summary: string[], userAddressMap: Map<string, string> } {
  const summary: string[] = []
  const userAddressMap = new Map<string, string>()
  
  // Helper to get user label
  const getUserLabel = (address: string): string => {
    if (!address || address === 'Unknown') return 'Unknown'
    
    // Check if we have a mapping
    for (const [addr, label] of data.addressToUser.entries()) {
      if (addr === address) {
        userAddressMap.set(label, address)
        return label
      }
    }
    
    // Fallback
    return truncateAddress(address)
  }
  
  // Transaction sender
  const senderLabel = getUserLabel(data.sender)
  summary.push(`{{${senderLabel}}} initiated the transaction`)
  
  // Package calls
  if (data.packageCalls.length > 0) {
    const calls = data.packageCalls.map((c: PackageCall) => c.displayName).join(', ')
    summary.push(`Called functions: ${calls}`)
  }
  
  // NFTs created
  const nftsCreated = data.objectsCreated.filter((obj: any) => obj.isNFT)
  if (nftsCreated.length > 0) {
    const count = nftsCreated.length
    summary.push(`{{${count} NFT${count > 1 ? 's' : ''}}} created`)
  }
  
  // Non-NFT objects created
  const objectsCreated = data.objectsCreated.filter((obj: any) => !obj.isNFT)
  if (objectsCreated.length > 0) {
    const count = objectsCreated.length
    summary.push(`{{${count} object${count > 1 ? 's' : ''}}} created`)
  }
  
  // Objects transferred
  if (data.objectsTransferred.length > 0) {
    // Separate NFTs from other transfers
    const nftTransfers = data.objectsTransferred.filter((t: any) => t.isNFT)
    const otherTransfers = data.objectsTransferred.filter((t: any) => !t.isNFT)
    
    // Show NFT transfers first
    for (const transfer of nftTransfers.slice(0, 3)) {
      const rawChange = data.rawObjectChanges?.find((c: any) => 
        c.objectId === transfer.objectId && c.type === 'transferred'
      )
      
      let fromLabel = transfer.from
      let toLabel = transfer.to
      
      if (rawChange) {
        const fromAddr = getFullAddress(rawChange.sender)
        const toAddr = getFullAddress(rawChange.recipient)
        fromLabel = getUserLabel(fromAddr)
        toLabel = getUserLabel(toAddr)
      }
      
      const nftName = transfer.nftMetadata?.name || 'NFT'
      summary.push(`{{${toLabel}}} received ${nftName} from {{${fromLabel}}}`)
    }
    
    if (nftTransfers.length > 3) {
      summary.push(`  ... and ${nftTransfers.length - 3} more NFT transfers`)
    }
    
    // Show other transfers
    for (const transfer of otherTransfers.slice(0, 3)) {
      const typeName = extractTypeName(transfer.objectType)
      
      const rawChange = data.rawObjectChanges?.find((c: any) => 
        c.objectId === transfer.objectId && c.type === 'transferred'
      )
      
      let fromLabel = transfer.from
      let toLabel = transfer.to
      
      if (rawChange) {
        const fromAddr = getFullAddress(rawChange.sender)
        const toAddr = getFullAddress(rawChange.recipient)
        fromLabel = getUserLabel(fromAddr)
        toLabel = getUserLabel(toAddr)
      }
      
      // If it's a coin transfer with amount, show the amount
      if (transfer.tokenSymbol && transfer.amount && transfer.tokenDecimals) {
        const amount = (Number(transfer.amount) / Math.pow(10, transfer.tokenDecimals)).toFixed(transfer.tokenDecimals === 6 ? 2 : 4)
        summary.push(`{{${fromLabel}}} transferred ${amount} ${transfer.tokenSymbol} to {{${toLabel}}}`)
      } else {
        summary.push(`{{${fromLabel}}} transferred ${typeName} to {{${toLabel}}}`)
      }
    }
  }
  
  // Objects mutated
  if (data.objectsMutated.length > 0) {
    const count = data.objectsMutated.length
    summary.push(`{{${count} object${count > 1 ? 's' : ''}}} modified`)
  }
  
  // Objects deleted
  if (data.objectsDeleted.length > 0) {
    const count = data.objectsDeleted.length
    summary.push(`${count} object${count > 1 ? 's' : ''} deleted`)
  }
  
  // Balance changes (all token types)
  if (data.balanceChanges && data.balanceChanges.length > 0) {
    for (const change of data.balanceChanges.slice(0, 5)) {
      // Get token info from coinType
      const coinType = change.coinType || '0x2::sui::SUI'
      const tokenInfo = getTokenInfoFromType(coinType)
      
      // Only show significant amounts (not gas-only changes for SUI)
      const amount = Number(change.amount) / Math.pow(10, tokenInfo.decimals)
      
      // Skip tiny SUI amounts (likely just gas)
      if (tokenInfo.symbol === 'SUI' && Math.abs(amount) < 0.01) {
        continue
      }
      
      const action = amount > 0 ? 'received' : 'sent'
      const absAmount = Math.abs(amount).toFixed(tokenInfo.decimals === 6 ? 2 : 4)
      const addr = change.owner?.AddressOwner || 'Unknown'
      const userLabel = getUserLabel(addr)
      summary.push(`{{${userLabel}}} ${action} ${absAmount} ${tokenInfo.symbol}`)
    }
  }
  
  return { summary, userAddressMap }
}

function getTokenInfoFromType(coinType: string): { symbol: string, decimals: number } {
  // Common token mappings - most comprehensive list
  const tokenMappings: Record<string, { symbol: string, decimals: number }> = {
    // Native SUI
    '0x2::sui::SUI': { symbol: 'SUI', decimals: 9 },
    
    // USDC variants
    '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN': { symbol: 'USDC', decimals: 6 },
    '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC': { symbol: 'USDC', decimals: 6 },
    
    // USDT
    '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN': { symbol: 'USDT', decimals: 6 },
    
    // WETH (Wormhole)
    '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN': { symbol: 'WETH', decimals: 8 },
    
    // Add more as needed
  }
  
  // Check known mappings
  if (tokenMappings[coinType]) {
    return tokenMappings[coinType]
  }
  
  // For unknown tokens, try to extract symbol from the type path
  const parts = coinType.split('::')
  const lastPart = parts[parts.length - 1]?.toUpperCase() || 'TOKEN'
  
  // Clean up common suffixes
  const symbol = lastPart.replace('_TOKEN', '').replace('TOKEN', '') || 'TOKEN'
  
  // Default to 6 decimals for unknown tokens (common for stablecoins)
  return { symbol, decimals: 6 }
}

function extractCoinInfo(coinType: string, objectData?: any): { amount?: string, symbol: string, decimals: number } {
  // Extract coin type from the generic parameter
  const match = coinType.match(/Coin<(.+)>/)
  if (!match) return { amount: undefined, symbol: 'Unknown', decimals: 9 }
  
  const innerType = match[1]
  
  // Get token info using shared function
  const tokenInfo = getTokenInfoFromType(innerType)
  
  // Try to extract amount from object data if available
  let amount: string | undefined
  if (objectData?.data?.content?.fields?.balance) {
    amount = objectData.data.content.fields.balance
  }
  
  return { amount, ...tokenInfo }
}

function isNFTObject(objectType: string, objectData?: any): boolean {
  if (!objectType) return false
  
  // Skip if it's a coin
  if (objectType.includes('coin::Coin')) return false
  
  // Check for display metadata (strong indicator of NFT)
  if (objectData?.data?.display?.data) {
    console.log('NFT detected via display metadata:', objectType)
    return true
  }
  
  // Check for explicit NFT patterns in type (case insensitive)
  const lowerType = objectType.toLowerCase()
  if (lowerType.includes('nft')) return true
  
  // Check for common NFT type patterns
  const nftPatterns = [
    '::nft::',
    '::NFT::',
    '::collectible::',
    '::asset::',
    '::token::Token',
    '::item::',
    '::agent::',  // Added for Swarm Network Agents
    '::character::',
    '::card::',
    '::badge::',
  ]
  
  if (nftPatterns.some(pattern => objectType.includes(pattern))) {
    console.log('NFT detected via pattern:', objectType)
    return true
  }
  
  // Check if object data has typical NFT fields
  const content = objectData?.data?.content?.fields
  if (content && (content.name || content.image_url || content.url || content.description)) {
    // Has NFT-like metadata but not a coin
    console.log('NFT detected via content fields:', objectType)
    return true
  }
  
  return false
}

function extractNFTMetadata(objectData?: any): { name?: string, description?: string, imageUrl?: string, attributes?: Record<string, string> } | undefined {
  if (!objectData) {
    console.log('No object data for NFT metadata extraction')
    return undefined
  }
  
  const display = objectData.data?.display?.data
  const content = objectData.data?.content?.fields
  
  console.log('Extracting NFT metadata:', {
    hasDisplay: !!display,
    hasContent: !!content,
    displayData: display,
    contentFields: content ? Object.keys(content) : []
  })
  
  if (!display && !content) return undefined
  
  return {
    name: display?.name || content?.name || 'NFT',
    description: display?.description || content?.description,
    imageUrl: display?.image_url || display?.img_url || content?.image_url || content?.url,
    attributes: content ? Object.entries(content)
      .filter(([key]) => !['id', 'name', 'description', 'image_url', 'url'].includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
      : undefined,
  }
}

function extractTypeName(fullType: string): string {
  // Extract just the type name from a full type path like "0x2::coin::Coin<0x2::sui::SUI>"
  if (!fullType) return 'Object'
  
  // Check for NFT-like patterns
  if (isNFTObject(fullType)) {
    return 'NFT'
  }
  
  // Check for Coin
  if (fullType.includes('coin::Coin')) {
    const coinInfo = extractCoinInfo(fullType)
    return `${coinInfo.symbol} Coin`
  }
  
  // Extract the last part of the type path
  const parts = fullType.split('::')
  const lastPart = parts[parts.length - 1]
  
  // Remove generic parameters
  const withoutGenerics = lastPart.split('<')[0]
  
  return withoutGenerics || 'Object'
}

function generateAISummary(data: any): string {
  // Analyze the transaction to generate a simple, high-level summary
  
  // Helper to get user label
  const getUserLabel = (address: string): string => {
    if (!address || address === 'Unknown') return 'Unknown'
    for (const [addr, label] of data.addressToUser.entries()) {
      if (addr === address) return label
    }
    return truncateAddress(address)
  }
  
  // Priority 1: Look for NFT transfers (most interesting!)
  if (data.objectsTransferred && data.objectsTransferred.length > 0) {
    const nftTransfers = data.objectsTransferred.filter((t: any) => t.isNFT)
    
    if (nftTransfers.length > 0) {
      // Group by recipient to see who received what
      const recipientMap = new Map<string, any[]>()
      for (const transfer of nftTransfers) {
        const rawChange = data.rawObjectChanges?.find((c: any) => 
          c.objectId === transfer.objectId && c.type === 'transferred'
        )
        const toAddr = rawChange ? getFullAddress(rawChange.recipient) : transfer.to
        
        if (!recipientMap.has(toAddr)) {
          recipientMap.set(toAddr, [])
        }
        recipientMap.get(toAddr)!.push(transfer)
      }
      
      // Find the recipient with the most NFTs
      let maxRecipient = null
      let maxCount = 0
      for (const [addr, transfers] of recipientMap.entries()) {
        if (transfers.length > maxCount) {
          maxCount = transfers.length
          maxRecipient = addr
        }
      }
      
      if (maxRecipient && maxCount > 0) {
        const recipientLabel = getUserLabel(maxRecipient)
        const transfers = recipientMap.get(maxRecipient)!
        const firstTransfer = transfers[0]
        
        if (maxCount === 1) {
          const nftName = firstTransfer.nftMetadata?.name || 'NFT'
          const fromAddr = data.rawObjectChanges?.find((c: any) => 
            c.objectId === firstTransfer.objectId && c.type === 'transferred'
          )?.sender
          const fromLabel = fromAddr ? getUserLabel(getFullAddress(fromAddr)) : 'Unknown'
          return `{{${recipientLabel}}} receives ${nftName} from {{${fromLabel}}}`
        } else {
          // Multiple NFTs to same recipient
          const collectionName = firstTransfer.nftMetadata?.name?.split('#')[0]?.trim() || 'NFT'
          return `{{${recipientLabel}}} receives ${maxCount} ${collectionName}${maxCount > 1 ? 's' : ''}`
        }
      }
    }
    
    // Priority 2: Look for token/coin transfers
    const coinTransfers = data.objectsTransferred.filter((t: any) => 
      t.tokenSymbol && t.amount && t.tokenSymbol !== 'SUI'
    )
    
    if (coinTransfers.length > 0) {
      // Use the first significant coin transfer
      const transfer = coinTransfers[0]
      const amount = transfer.amount && transfer.tokenDecimals 
        ? (Number(transfer.amount) / Math.pow(10, transfer.tokenDecimals)).toFixed(transfer.tokenDecimals === 6 ? 2 : 4)
        : '?'
      
      return `{{${transfer.from}}} sends ${amount} ${transfer.tokenSymbol} to {{${transfer.to}}}`
    }
  }
  
  // Priority 3: Look for significant balance changes (all tokens)
  if (data.balanceChanges && data.balanceChanges.length > 0) {
    // Group balance changes by token type
    const tokenTransfers = new Map<string, { send: any, receive: any }>()
    
    for (const change of data.balanceChanges) {
      const coinType = change.coinType || '0x2::sui::SUI'
      const amount = Number(change.amount)
      
      if (!tokenTransfers.has(coinType)) {
        tokenTransfers.set(coinType, { send: null, receive: null })
      }
      
      const transfers = tokenTransfers.get(coinType)!
      
      if (amount < 0 && (!transfers.send || Math.abs(amount) > Math.abs(transfers.send.amount))) {
        transfers.send = { ...change, amount }
      }
      if (amount > 0 && (!transfers.receive || amount > transfers.receive.amount)) {
        transfers.receive = { ...change, amount }
      }
    }
    
    // Prioritize non-SUI tokens first
    for (const [coinType, { send, receive }] of tokenTransfers.entries()) {
      if (!send || !receive) continue
      
      const tokenInfo = getTokenInfoFromType(coinType)
      const sendAmount = Math.abs(send.amount / Math.pow(10, tokenInfo.decimals))
      const receiveAmount = receive.amount / Math.pow(10, tokenInfo.decimals)
      
      // Skip tiny SUI amounts (likely gas)
      if (tokenInfo.symbol === 'SUI' && sendAmount < 0.1) continue
      
      // If amounts are close (likely a transfer), generate summary
      if (Math.abs(sendAmount - receiveAmount) < 0.01 * sendAmount) {
        const senderAddr = send.owner?.AddressOwner
        const receiverAddr = receive.owner?.AddressOwner
        
        if (senderAddr && receiverAddr && senderAddr !== receiverAddr) {
          const senderLabel = getUserLabel(senderAddr)
          const receiverLabel = getUserLabel(receiverAddr)
          const formattedAmount = sendAmount.toFixed(tokenInfo.decimals === 6 ? 2 : 4)
          return `{{${senderLabel}}} sends ${formattedAmount} ${tokenInfo.symbol} to {{${receiverLabel}}}`
        }
      }
    }
  }
  
  // Priority 4: Look for other object transfers (non-NFT, non-coin)
  if (data.objectsTransferred && data.objectsTransferred.length > 0) {
    const transfer = data.objectsTransferred[0]
    const typeName = extractTypeName(transfer.objectType)
    
    if (typeName === 'NFT' || typeName.toLowerCase().includes('nft')) {
      return `{{${transfer.from}}} transfers an NFT to {{${transfer.to}}}`
    }
    
    if (data.objectsTransferred.length === 1 && !typeName.includes('Coin')) {
      return `{{${transfer.from}}} transfers a ${typeName} to {{${transfer.to}}}`
    }
    
    const nonCoinTransfers = data.objectsTransferred.filter((t: any) => !t.tokenSymbol)
    if (nonCoinTransfers.length > 0) {
      return `{{${transfer.from}}} transfers ${nonCoinTransfers.length} object${nonCoinTransfers.length > 1 ? 's' : ''} to {{${transfer.to}}}`
    }
  }
  
  // Priority 5: Look at what was created (prioritize NFTs)
  if (data.objectsCreated && data.objectsCreated.length > 0) {
    const senderLabel = getUserLabel(data.sender)
    
    // Check for NFTs first
    const nfts = data.objectsCreated.filter((obj: any) => obj.isNFT)
    if (nfts.length > 0) {
      if (nfts.length === 1) {
        const nftName = nfts[0].nftMetadata?.name || 'NFT'
        return `{{${senderLabel}}} creates ${nftName}`
      }
      return `{{${senderLabel}}} creates ${nfts.length} NFTs`
    }
    
    // Regular objects
    const created = data.objectsCreated[0]
    const typeName = extractTypeName(created.objectType)
    
    if (data.objectsCreated.length === 1) {
      return `{{${senderLabel}}} creates a ${typeName}`
    }
    
    return `{{${senderLabel}}} creates ${data.objectsCreated.length} new objects`
  }
  
  // Priority 6: Look at package calls
  if (data.packageCalls && data.packageCalls.length > 0) {
    const call = data.packageCalls[0]
    const senderLabel = getUserLabel(data.sender)
    
    // Interpret common function names
    if (call.function.includes('mint')) {
      return `{{${senderLabel}}} mints a new token or NFT`
    }
    if (call.function.includes('swap')) {
      return `{{${senderLabel}}} performs a token swap`
    }
    if (call.function.includes('stake')) {
      return `{{${senderLabel}}} stakes tokens`
    }
    if (call.function.includes('claim')) {
      return `{{${senderLabel}}} claims rewards or tokens`
    }
    if (call.function.includes('deposit')) {
      return `{{${senderLabel}}} deposits into a protocol`
    }
    if (call.function.includes('withdraw')) {
      return `{{${senderLabel}}} withdraws from a protocol`
    }
    
    // Generic function call
    return `{{${senderLabel}}} calls ${call.module}::${call.function}`
  }
  
  // Fallback
  const senderLabel = getUserLabel(data.sender)
  return `{{${senderLabel}}} executes a transaction on Sui`
}

