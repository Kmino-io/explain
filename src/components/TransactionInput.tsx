import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface TransactionInputProps {
  onSubmit: (digest: string) => void
  loading: boolean
}

export function TransactionInput({ onSubmit, loading }: TransactionInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let digest = input.trim()

    // Extract digest from full explorer URLs
    if (
      digest.includes('suiscan.xyz') ||
      digest.includes('suivision.xyz') ||
      digest.includes('explorer.sui.io')
    ) {
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
      <div className="flex items-center justify-center h-[54px] px-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a transaction hash or a full explorer URL from SuiScan, SuiVision, or Sui Explorer"
          className="w-full bg-transparent border-none outline-none text-center text-[14px] text-[#6c7584] placeholder-[#6c7584] caret-[#298dff] tracking-[-0.16px]"
          style={{ fontFamily: "'DM Mono', monospace" }}
          disabled={loading}
        />
        {loading && <Loader2 className="w-5 h-5 text-[#298dff] animate-spin ml-3 shrink-0" />}
      </div>
    </form>
  )
}
