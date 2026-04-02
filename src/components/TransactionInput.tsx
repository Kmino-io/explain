import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface TransactionInputProps {
  onSubmit: (digest: string) => void
  onError: (message: string) => void
  loading: boolean
}

const SUPPORTED_EXPLORER_HOSTS = new Set([
  'suiscan.xyz',
  'www.suiscan.xyz',
  'suivision.xyz',
  'www.suivision.xyz',
  'explorer.sui.io',
])

function parseTransactionInput(rawInput: string): { digest?: string; error?: string } {
  const trimmed = rawInput.trim()

  if (!trimmed) {
    return { error: 'Please paste a Sui transaction ID or a supported explorer URL.' }
  }

  const looksLikeUrl = /^https?:\/\//i.test(trimmed)
  if (!looksLikeUrl) {
    return { digest: trimmed }
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { error: 'That link is not a valid URL.' }
  }

  if (!SUPPORTED_EXPLORER_HOSTS.has(url.hostname)) {
    return {
      error: 'Only SuiScan, SuiVision, and Sui Explorer transaction URLs are supported.',
    }
  }

  const parts = url.pathname.split('/').filter(Boolean)

  if (url.hostname.includes('suiscan')) {
    const txIndex = parts.findIndex(part => part === 'tx')
    const digest = txIndex >= 0 ? parts[txIndex + 1] : undefined
    if (digest) return { digest }
  }

  if (url.hostname.includes('suivision') || url.hostname === 'explorer.sui.io') {
    const txBlockIndex = parts.findIndex(part => part === 'txblock')
    const digest = txBlockIndex >= 0 ? parts[txBlockIndex + 1] : undefined
    if (digest) return { digest }
  }

  return {
    error: 'This URL does not look like a Sui transaction page. Paste a transaction link or ID.',
  }
}

export function TransactionInput({ onSubmit, onError, loading }: TransactionInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { digest, error } = parseTransactionInput(input)
    if (error) {
      onError(error)
      return
    }

    onSubmit(digest!)
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
