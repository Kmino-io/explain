import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface TransactionInputProps {
  onSubmit: (digest: string) => void
  loading: boolean
}

export function TransactionInput({ onSubmit, loading }: TransactionInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Extract digest from input (could be just hash or full explorer URL)
    let digest = input.trim()
    
    // If it's a URL, extract the transaction hash
    if (digest.includes('suiscan.xyz') || digest.includes('suivision.xyz') || digest.includes('explorer.sui.io')) {
      const match = digest.match(/txblock\/([a-zA-Z0-9]+)/)
      if (match) {
        digest = match[1]
      }
    }
    
    if (digest) {
      onSubmit(digest)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
        <label htmlFor="transaction-input" className="block text-sm font-medium text-gray-300 mb-2">
          Transaction Digest or Explorer Link
        </label>
        <div className="flex gap-3">
          <input
            id="transaction-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter transaction digest (e.g., AhGj3Kp... or paste explorer link)"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sui-blue focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-sui-blue hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Explain
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Tip: You can paste a transaction hash or a full explorer URL from SuiScan, SuiVision, or Sui Explorer
        </p>
      </div>
    </form>
  )
}

