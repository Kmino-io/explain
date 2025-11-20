import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface AddressTooltipProps {
  label: string
  address: string
  color?: string
}

export function AddressTooltip({ label, address, color = 'text-sui-blue' }: AddressTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Open in SuiScan explorer
    const explorerUrl = `https://suiscan.xyz/mainnet/account/${address}`
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <span className="relative inline-block">
      <button
        className={`${color} font-semibold cursor-pointer underline decoration-dotted hover:brightness-125 transition-all inline-flex items-center gap-1`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleClick}
      >
        {label}
        <ExternalLink className="w-3 h-3 opacity-60" />
      </button>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 border border-slate-600 pointer-events-none">
          <div className="flex items-center gap-2">
            <span>{address}</span>
          </div>
          <div className="text-gray-400 text-[10px] mt-1">Click to view in explorer</div>
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></span>
        </span>
      )}
    </span>
  )
}

