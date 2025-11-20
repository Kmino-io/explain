import { useState } from 'react'
import { TransactionInput } from './components/TransactionInput'
import { TransactionDisplay } from './components/TransactionDisplay'
import { fetchTransactionDetails } from './services/suiService'
import { ParsedTransaction } from './types/transaction'
import { Waves, Loader2 } from 'lucide-react'

function App() {
  const [transaction, setTransaction] = useState<ParsedTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchTransaction = async (digest: string) => {
    setLoading(true)
    setError(null)
    setTransaction(null)
    
    try {
      // Basic validation
      if (!digest || digest.length < 32) {
        throw new Error('Invalid transaction digest format')
      }
      
      const txData = await fetchTransactionDetails(digest)
      setTransaction(txData)
    } catch (err) {
      console.error('Transaction fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Waves className="w-12 h-12 text-sui-blue" />
            <h1 className="text-5xl font-bold text-white">
              Sui Transaction Explainer
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Enter a transaction digest to see what happened in plain language
          </p>
        </header>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto">
          <TransactionInput 
            onSubmit={handleFetchTransaction} 
            loading={loading}
          />

          {/* Loading Indicator */}
          {loading && (
            <div className="mt-6 p-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <Loader2 className="w-12 h-12 text-sui-blue animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Fetching transaction data...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
            </div>
          )}

          {/* Error Display */}
          {error && !loading && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-200 text-center">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-red-300 text-sm text-center mt-2">
                Make sure the transaction digest is valid and from Sui mainnet.
              </p>
            </div>
          )}

          {/* Transaction Display */}
          {transaction && !loading && (
            <TransactionDisplay transaction={transaction} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>Powered by Sui RPC • Open Source</p>
        </footer>
      </div>
    </div>
  )
}

export default App

