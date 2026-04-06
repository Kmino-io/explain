// ── Category ──────────────────────────────────────────────────────────────────
export type TransactionCategory =
  | 'coin-transfer'
  | 'nft-mint'
  | 'nft-transfer'
  | 'swap'
  | 'arbitrage'      // flash loan + swaps for profit
  | 'flash-loan'     // flash loan without clear arbitrage
  | 'liquidity'      // add / remove liquidity
  | 'staking'        // stake / unstake
  | 'governance'     // vote / proposal
  | 'bridge'         // cross-chain transfer
  | 'contract-call'  // generic smart-contract interaction
  | 'object-creation'
  | 'failed'
  | 'unknown'

// ── Events (primary data source for DeFi) ────────────────────────────────────
export interface ParsedEvent {
  type: string           // full type path e.g. "0x...::vault::FlashLoanBorrowed"
  eventName: string      // last segment e.g. "FlashLoanBorrowed"
  module: string         // e.g. "pool"
  packageId: string
  parsedJson: Record<string, unknown>
}

// ── Net balance changes (what actually changed in the wallet) ─────────────────
export interface NetBalanceChange {
  coinType: string
  symbol: string
  decimals: number
  rawAmount: string        // string to avoid BigInt serialisation issues; may be negative
  formattedAmount: string  // absolute value, human-formatted e.g. "18.852"
  direction: 'in' | 'out'
  ownerAddress?: string    // address of the wallet this change belongs to
}

// ── Parsed commands (full PTB step list) ──────────────────────────────────────
export interface ParsedCommand {
  index: number
  commandType: 'MoveCall' | 'TransferObjects' | 'SplitCoins' | 'MergeCoins' | 'Publish' | 'Other'
  // MoveCall fields
  package?: string
  module?: string
  function?: string
  typeArguments?: string[]   // full type paths
  typeSymbols?: string[]     // human-readable e.g. ["SUI", "USDC"]
  displayName?: string
}

// ── Human-readable narrative ──────────────────────────────────────────────────
export interface TransactionNarrative {
  headline: string   // 2-4 words, e.g. "Flash Loan Arbitrage"
  what: string       // 1-2 sentences with {{User A}} markers
  outcome: string    // net result, plain text e.g. "+18.85 USDC profit"
  steps?: string[]   // step-by-step breakdown with {{markers}} where useful
}

// ── Object change types (kept for NFT support) ────────────────────────────────
export interface ObjectChange {
  objectId: string
  objectType: string
  version?: string
  digest?: string
  owner?: string
  fullOwnerAddress?: string
  isNFT?: boolean
  nftMetadata?: {
    name?: string
    description?: string
    imageUrl?: string
    attributes?: Record<string, string>
  }
}

export interface TransferChange {
  objectId: string
  objectType: string
  from: string
  to: string
  version?: string
  amount?: string
  tokenSymbol?: string
  tokenDecimals?: number
  isNFT?: boolean
  nftMetadata?: {
    name?: string
    description?: string
    imageUrl?: string
    attributes?: Record<string, string>
  }
}

export interface PackageCall {
  package: string
  module: string
  function: string
  displayName: string
}

// ── Confidence level ──────────────────────────────────────────────────────────
export type ConfidenceLevel = 'high' | 'partial' | 'complex'

// ── Main type ─────────────────────────────────────────────────────────────────
export interface ParsedTransaction {
  digest: string
  chain?: 'sui' | 'solana'   // defaults to 'sui' when absent
  timestamp?: number
  sender: string
  success: boolean
  gasUsed: string
  gasCostSui: string          // native fee amount (SOL for Solana, SUI for Sui)

  // Rich data layer
  category: TransactionCategory
  confidence: ConfidenceLevel
  narrative: TransactionNarrative
  events: ParsedEvent[]
  netBalanceChanges: NetBalanceChange[]
  commands: ParsedCommand[]

  // Object changes
  objectsCreated: ObjectChange[]
  objectsDeleted: ObjectChange[]
  objectsMutated: ObjectChange[]
  objectsTransferred: TransferChange[]

  // Legacy / compat
  packageCalls: PackageCall[]
  summary: string[]
  userAddressMap: Map<string, string>   // label → full address (for tooltips)
  aiSummary: string                     // = narrative.what (for ExplanationText)
  rawEffects?: unknown
}
