import { useState } from 'react'
import { ObjectChange } from '../types/transaction'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'

interface NFTCardProps {
  nft: ObjectChange
}

export function NFTCard({ nft }: NFTCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleClick = () => {
    const explorerUrl = `https://suiscan.xyz/mainnet/object/${nft.objectId}`
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

  const nftName = nft.nftMetadata?.name || nft.objectType.split('::').pop() || 'NFT'
  const hasImage = nft.nftMetadata?.imageUrl && !imageError

  return (
    <div
      className="relative p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-sui-blue/50 transition-all cursor-pointer group"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* NFT Image or Placeholder */}
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/20">
          {hasImage ? (
            <img
              src={nft.nftMetadata!.imageUrl}
              alt={nftName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-purple-300" />
          )}
        </div>

        {/* NFT Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-white truncate">{nftName}</h4>
            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-gray-400 font-mono truncate">{nft.objectId}</p>
          {nft.owner && (
            <p className="text-xs text-gray-500 mt-1">Owner: {nft.owner}</p>
          )}
        </div>
      </div>

      {/* Hover Details - Fixed positioning */}
      {showDetails && nft.nftMetadata && (
        <div className="fixed z-[9999] w-80 p-4 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Large Image Preview */}
          {hasImage && (
            <div className="mb-3 w-full h-48 bg-slate-700 rounded-lg overflow-hidden">
              <img
                src={nft.nftMetadata.imageUrl}
                alt={nftName}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Name */}
          <h3 className="text-lg font-bold text-white mb-2">{nftName}</h3>

          {/* Description */}
          {nft.nftMetadata.description && (
            <p className="text-sm text-gray-300 mb-3 line-clamp-3">
              {nft.nftMetadata.description}
            </p>
          )}

          {/* Attributes */}
          {nft.nftMetadata.attributes && Object.keys(nft.nftMetadata.attributes).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 mb-2">Attributes:</p>
              {Object.entries(nft.nftMetadata.attributes).slice(0, 5).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Click hint */}
          <p className="text-xs text-gray-500 mt-3 text-center">Click to view in explorer</p>
        </div>
      )}
    </div>
  )
}

