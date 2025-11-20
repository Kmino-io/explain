import { ParsedTransaction } from '../types/transaction'
import { TransactionVisualization } from './TransactionVisualization'
import { AddressTooltip } from './AddressTooltip'
import { ExpandableObjectList } from './ExpandableObjectList'
import { TokenIcon } from './TokenIcon'
import { NFTCard } from './NFTCard'
import { 
  CheckCircle2, 
  XCircle, 
  Fuel, 
  Package, 
  Plus, 
  Minus, 
  Edit, 
  ArrowRightLeft,
  Clock,
  User,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

interface TransactionDisplayProps {
  transaction: ParsedTransaction
}

function parseSummaryItem(item: string, transaction: ParsedTransaction) {
  // Parse items with {{...}} markers for tooltips or expandable content
  const parts = item.split(/(\{\{[^}]+\}\})/)
  
  return parts.map((part, idx) => {
    // Check if this is a marked item
    if (part.startsWith('{{') && part.endsWith('}}')) {
      const content = part.slice(2, -2)
      
      // Check if it's a user label (exists in userAddressMap)
      const address = transaction.userAddressMap.get(content)
      if (address) {
        return (
          <AddressTooltip 
            key={idx} 
            label={content} 
            address={address} 
          />
        )
      }
      
      // Check if it's an object count (for expandable list)
      const objectMatch = content.match(/^(\d+) object(s?)$/)
      const nftMatch = content.match(/^(\d+) NFT(s?)$/)
      
      if (objectMatch) {
        const count = parseInt(objectMatch[1])
        const isCreated = item.includes('created')
        const isMutated = item.includes('modified')
        
        if (isCreated && transaction.objectsCreated.filter(obj => !obj.isNFT).length === count) {
          return (
            <ExpandableObjectList
              key={idx}
              objects={transaction.objectsCreated.filter(obj => !obj.isNFT)}
              title={content}
              count={count}
            />
          )
        } else if (isMutated && transaction.objectsMutated.length === count) {
          return (
            <ExpandableObjectList
              key={idx}
              objects={transaction.objectsMutated}
              title={content}
              count={count}
            />
          )
        }
      } else if (nftMatch) {
        const count = parseInt(nftMatch[1])
        const nfts = transaction.objectsCreated.filter(obj => obj.isNFT)
        
        if (nfts.length === count) {
          return (
            <span key={idx} className="inline-flex items-center gap-1">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-semibold">{content}</span>
            </span>
          )
        }
      }
      
      // Default: just return the content
      return <span key={idx}>{content}</span>
    }
    
    // Check for token symbols in the text (e.g., "249.50 USDC", "15 SUI")
    const tokenMatch = part.match(/(\d+\.?\d*)\s+(SUI|USDC|USDT|WETH|ETH|BTC|WBTC|[A-Z]{2,6})(?=\s|$|,|\.)/g)
    if (tokenMatch) {
      const subParts = part.split(/(\d+\.?\d*\s+(?:SUI|USDC|USDT|WETH|ETH|BTC|WBTC|[A-Z]{2,6})(?=\s|$|,|\.))/g)
      return (
        <span key={idx}>
          {subParts.map((subPart, subIdx) => {
            const match = subPart.match(/^(\d+\.?\d*)\s+([A-Z]{2,6})$/)
            if (match) {
              const [, amount, symbol] = match
              return (
                <span key={subIdx} className="inline-flex items-center gap-2">
                  <span>{amount}</span>
                  <TokenIcon symbol={symbol} className="w-6 h-6 inline-block" />
                  <span className="font-semibold">{symbol}</span>
                </span>
              )
            }
            return <span key={subIdx}>{subPart}</span>
          })}
        </span>
      )
    }
    
    return <span key={idx}>{part}</span>
  })
}

export function TransactionDisplay({ transaction }: TransactionDisplayProps) {
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="mt-8 space-y-6">
      {/* AI Summary Card - Main highlight */}
      <div className="bg-gradient-to-r from-sui-blue/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-sui-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-sui-blue/30 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-sui-blue" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300">Transaction Summary</h3>
        </div>
        <p className="text-2xl font-bold text-white leading-relaxed">
          {parseSummaryItem(transaction.aiSummary, transaction)}
        </p>
      </div>

      {/* Status and Overview Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Transaction Overview</h2>
            <p className="text-sm text-gray-400 font-mono break-all">{transaction.digest}</p>
          </div>
          <div className="flex items-center gap-2">
            {transaction.success ? (
              <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Success
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Failed
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <User className="w-5 h-5 text-sui-blue" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">Sender</p>
              <p className="text-sm text-white font-mono break-all">{transaction.sender}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Fuel className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-xs text-gray-400">Gas Used</p>
              <p className="text-sm text-white font-semibold">{transaction.gasCostSui} SUI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Clock className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">Timestamp</p>
              <p className="text-sm text-white">{formatTimestamp(transaction.timestamp)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Human-Readable Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-sui-blue" />
          <h3 className="text-xl font-bold text-white">What Happened</h3>
        </div>
        <div className="space-y-2">
          {transaction.summary.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-2 h-2 bg-sui-blue rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-200">
                {parseSummaryItem(item, transaction)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Visualization */}
      {transaction.objectsTransferred.length > 0 && (
        <TransactionVisualization transaction={transaction} />
      )}

      {/* Package Calls */}
      {transaction.packageCalls.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-sui-blue" />
            <h3 className="text-xl font-bold text-white">Smart Contract Calls</h3>
          </div>
          <div className="space-y-3">
            {transaction.packageCalls.map((call, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-sui-blue">{call.displayName}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Package:</span>
                    <span className="ml-2 text-gray-200 font-mono">{call.package.slice(0, 20)}...</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Module:</span>
                    <span className="ml-2 text-gray-200">{call.module}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Object Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NFTs Transferred */}
        {transaction.objectsTransferred.filter(obj => obj.isNFT).length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">NFTs Transferred</h3>
              <span className="ml-auto text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                {transaction.objectsTransferred.filter(obj => obj.isNFT).length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {transaction.objectsTransferred.filter(obj => obj.isNFT).map((obj, index) => (
                <NFTCard key={index} nft={obj} />
              ))}
            </div>
          </div>
        )}

        {/* NFTs Created (only show if there are created NFTs that weren't transferred) */}
        {transaction.objectsCreated.filter(obj => obj.isNFT).length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">NFTs Created</h3>
              <span className="ml-auto text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                {transaction.objectsCreated.filter(obj => obj.isNFT).length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {transaction.objectsCreated.filter(obj => obj.isNFT).map((obj, index) => (
                <NFTCard key={index} nft={obj} />
              ))}
            </div>
          </div>
        )}

        {/* Non-NFT Created Objects */}
        {transaction.objectsCreated.filter(obj => !obj.isNFT).length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-bold text-white">Objects Created</h3>
              <span className="ml-auto text-sm bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                {transaction.objectsCreated.filter(obj => !obj.isNFT).length}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transaction.objectsCreated.filter(obj => !obj.isNFT).map((obj, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg text-sm">
                  <p className="text-sui-blue font-medium mb-1">{obj.objectType.split('::').pop()}</p>
                  <p className="text-gray-400 font-mono text-xs">{obj.objectId}</p>
                  {obj.owner && (
                    <p className="text-gray-400 text-xs mt-1">Owner: {obj.owner}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mutated Objects */}
        {transaction.objectsMutated.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Edit className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Objects Modified</h3>
              <span className="ml-auto text-sm bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                {transaction.objectsMutated.length}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transaction.objectsMutated.map((obj, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg text-sm">
                  <p className="text-sui-blue font-medium mb-1">{obj.objectType.split('::').pop()}</p>
                  <p className="text-gray-400 font-mono text-xs">{obj.objectId}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transferred Objects */}
        {transaction.objectsTransferred.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightLeft className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Objects Transferred</h3>
              <span className="ml-auto text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                {transaction.objectsTransferred.length}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transaction.objectsTransferred.map((obj, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {obj.tokenSymbol && obj.amount && obj.tokenDecimals ? (
                      <>
                        <TokenIcon symbol={obj.tokenSymbol} className="w-7 h-7" />
                        <p className="text-sui-blue font-medium text-base">
                          {(Number(obj.amount) / Math.pow(10, obj.tokenDecimals)).toFixed(obj.tokenDecimals === 6 ? 2 : 4)} {obj.tokenSymbol}
                        </p>
                      </>
                    ) : (
                      <p className="text-sui-blue font-medium">
                        {obj.objectType.split('::').pop()}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-400 font-mono text-xs mb-2">{obj.objectId}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">{obj.from}</span>
                    <ArrowRightLeft className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-400">{obj.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deleted Objects */}
        {transaction.objectsDeleted.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Minus className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">Objects Deleted</h3>
              <span className="ml-auto text-sm bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                {transaction.objectsDeleted.length}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transaction.objectsDeleted.map((obj, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg text-sm">
                  <p className="text-sui-blue font-medium mb-1">{obj.objectType.split('::').pop()}</p>
                  <p className="text-gray-400 font-mono text-xs">{obj.objectId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

