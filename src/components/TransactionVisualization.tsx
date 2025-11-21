import { useState } from 'react'
import { ParsedTransaction } from '../types/transaction'
import { TokenIcon } from './TokenIcon'
import { AddressTooltip } from './AddressTooltip'
import { ArrowRight, User, Image as ImageIcon } from 'lucide-react'

interface TransactionVisualizationProps {
  transaction: ParsedTransaction
}

export function TransactionVisualization({ transaction }: TransactionVisualizationProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  
  // Combine transfers and created objects for visualization
  const visualizationItems: Array<{
    type: 'transfer' | 'created'
    from: string
    to: string
    objectId: string
    objectType: string
    isNFT?: boolean
    nftMetadata?: any
    tokenSymbol?: string
    amount?: string
    tokenDecimals?: number
  }> = []
  
  // Add regular transfers
  transaction.objectsTransferred.forEach(transfer => {
    visualizationItems.push({
      type: 'transfer',
      from: transfer.from,
      to: transfer.to,
      objectId: transfer.objectId,
      objectType: transfer.objectType,
      isNFT: transfer.isNFT,
      nftMetadata: transfer.nftMetadata,
      tokenSymbol: transfer.tokenSymbol,
      amount: transfer.amount,
      tokenDecimals: transfer.tokenDecimals,
    })
  })
  
  // Add created NFTs that went to non-sender recipients
  const sender = transaction.sender
  
  console.log('=== VISUALIZATION COMPONENT ===')
  console.log('Sender:', sender)
  console.log('userAddressMap entries:', Array.from(transaction.userAddressMap.entries()))
  console.log('Created objects with NFTs:', transaction.objectsCreated.filter(o => o.isNFT).map(o => ({
    objectId: o.objectId,
    fullOwnerAddress: o.fullOwnerAddress
  })))
  
  // Get sender label
  let senderLabel = 'Unknown'
  for (const [label, address] of transaction.userAddressMap.entries()) {
    if (address === sender) {
      senderLabel = label
      break
    }
  }
  console.log('Sender label:', senderLabel)
  
  // Check each created NFT
  transaction.objectsCreated.forEach(created => {
    if (created.isNFT && created.fullOwnerAddress) {
      console.log('Checking NFT:', created.objectId, 'Owner:', created.fullOwnerAddress)
      
      // Find the recipient label using the full address
      let recipientLabel = null
      let recipientAddr = null
      
      for (const [label, address] of transaction.userAddressMap.entries()) {
        console.log('  Comparing with map entry:', label, '→', address)
        console.log('  Match?:', address === created.fullOwnerAddress, 'Different from sender?:', address !== sender)
        
        // Direct address match
        if (address === created.fullOwnerAddress && address !== sender) {
          recipientLabel = label
          recipientAddr = address
          console.log('  ✓ FOUND RECIPIENT:', label)
          break
        }
      }
      
      if (recipientLabel && recipientAddr) {
        console.log('✓✓ Adding visualization item:', senderLabel, '→', recipientLabel)
        visualizationItems.push({
          type: 'created',
          from: senderLabel,
          to: recipientLabel,
          objectId: created.objectId,
          objectType: created.objectType,
          isNFT: created.isNFT,
          nftMetadata: created.nftMetadata,
        })
      } else {
        console.log('❌ No recipient found for NFT', created.objectId)
      }
    }
  })
  
  console.log('Total visualization items created:', visualizationItems.length)
  console.log('=== END VISUALIZATION ===')
  console.log('')
  
  const transfers = visualizationItems.slice(0, 5) // Show max 5 for clarity

  // Get user label for an address
  const getUserLabel = (addressOrLabel: string): { label: string, address?: string } => {
    // Check if it's already a user label (like "User A" or "User B")
    for (const [label, address] of transaction.userAddressMap.entries()) {
      // Check if the input matches the label exactly
      if (addressOrLabel === label) {
        return { label, address }
      }
      // Check if it contains part of the address
      if (addressOrLabel.includes(address.slice(0, 10)) || address.includes(addressOrLabel.slice(0, 10))) {
        return { label, address }
      }
    }
    // Return as-is if not found
    return { label: addressOrLabel }
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index))
  }
  
  if (transfers.length === 0) return null

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <ArrowRight className="w-6 h-6 text-sui-blue" />
        Transfer Flow
      </h3>
      
      <div className="space-y-8">
        {transfers.map((transfer, index) => {
          const from = getUserLabel(transfer.from)
          const to = getUserLabel(transfer.to)
          const isNFT = transfer.isNFT
          const hasImage = isNFT && transfer.nftMetadata?.imageUrl && !imageErrors.has(index)
          
          return (
            <div key={index} className="relative">
              {/* Flow visualization */}
              <div className="flex items-center gap-4">
                {/* Sender */}
                <div className="flex-shrink-0 w-32">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border-2 border-purple-500/40 text-center">
                    <User className="w-6 h-6 text-purple-300 mx-auto mb-1" />
                    {from.address ? (
                      <AddressTooltip label={from.label} address={from.address} />
                    ) : (
                      <p className="text-white font-semibold text-sm">{from.label}</p>
                    )}
                  </div>
                </div>

                {/* Arrow with object info */}
                <div className="flex-1 flex items-center justify-center relative">
                  {/* Animated arrow background */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-purple-500/50 via-sui-blue to-green-500/50"></div>
                  </div>
                  
                  {/* Object card */}
                  <div className="relative z-10 bg-slate-800/90 backdrop-blur-md border-2 border-sui-blue rounded-xl p-3 shadow-xl max-w-md">
                    <div className="flex items-center gap-3">
                      {/* NFT Image or Token Icon */}
                      {isNFT ? (
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/20">
                          {hasImage ? (
                            <img
                              src={transfer.nftMetadata!.imageUrl}
                              alt={transfer.nftMetadata?.name || 'NFT'}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(index)}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-purple-300" />
                          )}
                        </div>
                      ) : transfer.tokenSymbol ? (
                        <TokenIcon symbol={transfer.tokenSymbol} className="w-12 h-12" />
                      ) : null}
                      
                      {/* Transfer details */}
                      <div className="flex-1 min-w-0">
                        {isNFT ? (
                          <>
                            <p className="text-sm font-semibold text-white truncate">
                              {transfer.nftMetadata?.name || 'NFT'}
                            </p>
                            <p className="text-xs text-purple-300">NFT Transfer</p>
                          </>
                        ) : transfer.tokenSymbol && transfer.amount && transfer.tokenDecimals ? (
                          <>
                            <p className="text-base font-bold text-white">
                              {(Number(transfer.amount) / Math.pow(10, transfer.tokenDecimals)).toFixed(transfer.tokenDecimals === 6 ? 2 : 4)} {transfer.tokenSymbol}
                            </p>
                            <p className="text-xs text-gray-400">Token Transfer</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-white truncate">
                              {transfer.objectType.split('::').pop()}
                            </p>
                            <p className="text-xs text-gray-400">Object Transfer</p>
                          </>
                        )}
                      </div>
                      
                      {/* Arrow icon */}
                      <ArrowRight className="w-5 h-5 text-sui-blue flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Recipient */}
                <div className="flex-shrink-0 w-32">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border-2 border-green-500/40 text-center">
                    <User className="w-6 h-6 text-green-300 mx-auto mb-1" />
                    {to.address ? (
                      <AddressTooltip label={to.label} address={to.address} />
                    ) : (
                      <p className="text-white font-semibold text-sm">{to.label}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Object ID below - compact */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500 font-mono truncate">
                  {transfer.objectId}
                </p>
              </div>
            </div>
          )
        })}

        {visualizationItems.length > 5 && (
          <div className="text-center py-3 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">
              + {visualizationItems.length - 5} more transfer{visualizationItems.length - 5 !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

