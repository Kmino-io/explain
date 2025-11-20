import { ParsedTransaction } from '../types/transaction'
import { TokenIcon } from './TokenIcon'
import { ArrowRight, User } from 'lucide-react'

interface TransactionVisualizationProps {
  transaction: ParsedTransaction
}

export function TransactionVisualization({ transaction }: TransactionVisualizationProps) {
  const transfers = transaction.objectsTransferred.slice(0, 5) // Show max 5 for clarity

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6">Transfer Flow Visualization</h3>
      
      <div className="space-y-6">
        {transfers.map((transfer, index) => (
          <div key={index} className="relative">
            {/* Flow visualization */}
            <div className="flex items-center justify-between gap-4">
              {/* Sender */}
              <div className="flex-1 min-w-0">
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-purple-300" />
                    <span className="text-xs text-purple-300 font-medium">From</span>
                  </div>
                  <p className="text-white font-mono text-sm truncate">{transfer.from}</p>
                </div>
              </div>

              {/* Arrow with object info */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="relative">
                  <ArrowRight className="w-8 h-8 text-sui-blue animate-pulse" />
                  <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-sui-blue/20 border border-sui-blue/50 rounded px-3 py-2 flex items-center gap-2">
                      {transfer.tokenSymbol && transfer.amount && transfer.tokenDecimals ? (
                        <>
                          <TokenIcon symbol={transfer.tokenSymbol} className="w-5 h-5" />
                          <p className="text-sm text-white font-medium">
                            {(Number(transfer.amount) / Math.pow(10, transfer.tokenDecimals)).toFixed(transfer.tokenDecimals === 6 ? 2 : 4)} {transfer.tokenSymbol}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-white font-medium">
                          {transfer.objectType.split('::').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient */}
              <div className="flex-1 min-w-0">
                <div className="p-4 bg-gradient-to-l from-green-500/20 to-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-300" />
                    <span className="text-xs text-green-300 font-medium">To</span>
                  </div>
                  <p className="text-white font-mono text-sm truncate">{transfer.to}</p>
                </div>
              </div>
            </div>

            {/* Object ID below */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400 font-mono">Object: {transfer.objectId}</p>
            </div>
          </div>
        ))}

        {transaction.objectsTransferred.length > 5 && (
          <div className="text-center text-gray-400 text-sm">
            + {transaction.objectsTransferred.length - 5} more transfers
          </div>
        )}
      </div>
    </div>
  )
}

