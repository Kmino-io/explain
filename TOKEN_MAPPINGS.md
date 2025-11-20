# Token Mappings for Sui

This document tracks known token contract addresses and logos on Sui mainnet.

## How to Add New Tokens

When you encounter a new token that isn't being recognized correctly:

1. Find the transaction in SuiScan or Sui Explorer
2. Look at the object type - it will be something like `0x...::coin::COIN` or `0x...::module::TOKEN`
3. Add it to the `tokenMappings` in `src/services/suiService.ts`
4. Add the token logo URL to `tokenLogos` in `src/components/TokenIcon.tsx`

## How to Add Token Logos

Token logos are fetched from CoinGecko's CDN. To add a new token logo:

1. Go to [CoinGecko](https://www.coingecko.com/)
2. Search for the token
3. Right-click on the token image and copy image address
4. Add to the `tokenLogos` object in `TokenIcon.tsx`:

```typescript
'TOKEN_SYMBOL': 'https://assets.coingecko.com/coins/images/XXXXX/small/token.png',
```

### Alternative Logo Sources
- **Trust Wallet**: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/[ADDRESS]/logo.png`
- **CoinGecko**: `https://assets.coingecko.com/coins/images/[ID]/small/[name].png`
- **1inch**: `https://tokens.1inch.io/[ADDRESS].png`

## Known Token Addresses

### USDC (Circle)
- **Address**: `0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN`
- **Symbol**: USDC
- **Decimals**: 6

### USDC (Wormhole)
- **Address**: `0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC`
- **Symbol**: USDC
- **Decimals**: 6

### USDT (Tether)
- **Address**: `0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN`
- **Symbol**: USDT
- **Decimals**: 6

### SUI (Native)
- **Address**: `0x2::sui::SUI`
- **Symbol**: SUI
- **Decimals**: 9

## How the App Detects Tokens

The app detects token transfers in two ways:

### 1. Balance Changes (Primary Method)
The most reliable way - looks at `balanceChanges` in the transaction:
1. Checks the `coinType` field for each balance change
2. Matches against known token mappings
3. Uses the `amount` field directly from the balance change
4. Formats with correct decimals

This method works for all token transfers and is fast!

### 2. Object Transfers (Fallback)
For transferred Coin objects:
1. Extracts the inner type from `Coin<TYPE>`
2. Checks against known mappings
3. Fetches the object data to get the balance (slower)
4. Formats the amount using the correct decimals

## Adding More Tokens

To add support for more tokens, update the `tokenMappings` object in `src/services/suiService.ts`:

```typescript
const tokenMappings: Record<string, { symbol: string, decimals: number }> = {
  '0x...::coin::COIN': { symbol: 'TOKEN_SYMBOL', decimals: 6 },
  // Add more here
}
```

Common decimal values:
- Stablecoins (USDC, USDT, DAI): 6 decimals
- SUI and most native tokens: 9 decimals
- Some tokens: 8 decimals (like wrapped BTC)

