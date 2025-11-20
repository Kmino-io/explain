export interface ParsedTransaction {
  digest: string
  timestamp?: number
  sender: string
  success: boolean
  
  // Gas information
  gasUsed: string
  gasCostSui: string
  
  // Object changes
  objectsCreated: ObjectChange[]
  objectsDeleted: ObjectChange[]
  objectsMutated: ObjectChange[]
  objectsTransferred: TransferChange[]
  
  // Package and module information
  packageCalls: PackageCall[]
  
  // Summary
  summary: string[]
  userAddressMap: Map<string, string>
  aiSummary: string
  
  // Raw data (for advanced users)
  rawEffects?: unknown
}

export interface ObjectChange {
  objectId: string
  objectType: string
  version?: string
  digest?: string
  owner?: string
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

