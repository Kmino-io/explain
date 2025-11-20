import { useState } from 'react'

interface TokenIconProps {
  symbol: string
  className?: string
}

export function TokenIcon({ symbol, className = "w-6 h-6" }: TokenIconProps) {
  const [imageError, setImageError] = useState(false)
  
  // Get token logo URL from various sources
  const getTokenLogoUrl = (symbol: string): string | null => {
    const upperSymbol = symbol.toUpperCase()
    
    // Map of token symbols to their logo URLs
    const tokenLogos: Record<string, string> = {
      // Sui native
      'SUI': 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg',
      
      // Stablecoins
      'USDC': 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
      'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      'DAI': 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
      
      // Major cryptos
      'WETH': 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
      'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      'WBTC': 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      'BTC': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      
      // Add more as needed
    }
    
    return tokenLogos[upperSymbol] || null
  }

  const logoUrl = getTokenLogoUrl(symbol)
  
  // If we have a logo URL and it hasn't errored, show the image
  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={symbol}
        className={`${className} rounded-full object-cover`}
        onError={() => setImageError(true)}
        title={symbol}
      />
    )
  }
  
  // Fallback: Show colored badge with symbol letters
  const getColorForSymbol = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()
    
    // Assign colors based on token type
    if (upperSymbol === 'SUI') return 'bg-sui-blue text-white'
    if (upperSymbol === 'USDC') return 'bg-blue-500 text-white'
    if (upperSymbol === 'USDT') return 'bg-green-500 text-white'
    if (upperSymbol.includes('ETH')) return 'bg-purple-500 text-white'
    if (upperSymbol.includes('BTC')) return 'bg-orange-500 text-white'
    
    // Default: Generate color from symbol hash
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = [
      'bg-red-500 text-white',
      'bg-yellow-500 text-white',
      'bg-green-500 text-white',
      'bg-blue-500 text-white',
      'bg-indigo-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
    ]
    return colors[hash % colors.length]
  }
  
  const colorClass = getColorForSymbol(symbol)
  const initials = symbol.slice(0, 2).toUpperCase()
  
  return (
    <span 
      className={`${className} ${colorClass} rounded-full flex items-center justify-center font-bold text-xs`}
      title={symbol}
    >
      {initials}
    </span>
  )
}

