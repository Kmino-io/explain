import type {
  ParsedTransaction, TransactionCategory, NetBalanceChange,
  ParsedCommand, PackageCall,
} from '../types/transaction'
import type { Language } from '../i18n'

// In dev, Vite proxies /solana-rpc → https://api.mainnet-beta.solana.com
// In production, /api/solana-rpc is a Vercel serverless function that proxies the RPC
// (avoids browser-side CORS / rate-limit issues with direct RPC calls)
const getSolanaRpcUrl = () =>
  import.meta.env.DEV ? '/solana-rpc' : '/api/solana-rpc'

// ── Known Solana programs ─────────────────────────────────────────────────────

type ProgramCategory =
  | 'system' | 'token' | 'swap' | 'liquidity' | 'staking'
  | 'nft' | 'lending' | 'bridge' | 'other'

interface ProgramInfo { name: string; category: ProgramCategory }

const KNOWN_PROGRAMS: Record<string, ProgramInfo> = {
  // Infrastructure
  '11111111111111111111111111111111':                        { name: 'System Program',           category: 'system' },
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA':           { name: 'Token Program',             category: 'token' },
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb':           { name: 'Token Program 2022',        category: 'token' },
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bBZ':          { name: 'Associated Token Program',  category: 'token' },
  'ComputeBudget111111111111111111111111111111':             { name: 'Compute Budget',            category: 'other' },
  'Vote111111111111111111111111111111111111111':             { name: 'Vote Program',              category: 'other' },
  // DEXes / Aggregators
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4':          { name: 'Jupiter',                   category: 'swap' },
  'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB':           { name: 'Jupiter',                   category: 'swap' },
  'JUP2jxvXaqu7NQY1GmNF4m1vodkL2F8k1t6bBSgkhe':           { name: 'Jupiter',                   category: 'swap' },
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8':         { name: 'Raydium AMM',               category: 'swap' },
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK':         { name: 'Raydium CLMM',              category: 'swap' },
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3sFjJ4D':          { name: 'Orca Whirlpool',            category: 'swap' },
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP':         { name: 'Orca',                      category: 'swap' },
  'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EkAW7vAR':        { name: 'Meteora',                   category: 'liquidity' },
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo':         { name: 'Meteora DLMM',              category: 'liquidity' },
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBymQ68H':         { name: 'Pump.fun',                  category: 'swap' },
  'opnb2LAfJYbRMAHHvqjCwQxanZn7n89g9nD2HksU1Dj':          { name: 'OpenBook v2',               category: 'swap' },
  'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX':          { name: 'OpenBook v1',               category: 'swap' },
  // Staking
  'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD':          { name: 'Marinade',                  category: 'staking' },
  'CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi':        { name: 'Lido',                      category: 'staking' },
  'Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Posze':         { name: 'Jito',                      category: 'staking' },
  'StakeConfig11111111111111111111111111111111':             { name: 'Stake Program',             category: 'staking' },
  'Stake11111111111111111111111111111111111111':             { name: 'Stake Program',             category: 'staking' },
  // NFTs
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s':          { name: 'Metaplex',                  category: 'nft' },
  'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY':         { name: 'Metaplex Bubblegum',        category: 'nft' },
  'cndy3Z4yapfJBmL3ShUp5exZkqLc1VZjKZCiogAi1yR':          { name: 'Candy Machine v2',          category: 'nft' },
  'CndyV3LdqHUfDLmd1X2Rx24bpo7EKsA2KBNH6fX5WKE':         { name: 'Candy Machine v3',          category: 'nft' },
  // Lending
  'KLend2g3cP87fffoy8q1mQqGKjrL1AyFArM3mZVZ1Kex3':       { name: 'Kamino',                    category: 'lending' },
  'MFv2hWf31Z9kbCa1snEPdcgp7uGNOoHMnKgpZZgBzaH':         { name: 'MarginFi',                  category: 'lending' },
  'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo':         { name: 'Solend',                    category: 'lending' },
  // Bridges
  'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth':          { name: 'Wormhole',                  category: 'bridge' },
  'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb':         { name: 'Wormhole Token Bridge',     category: 'bridge' },
  'mbridge2RtZPZQeeTdmwK2ZaFW3WCfN1R4K4FzpaxGK':         { name: 'Mayan Bridge',              category: 'bridge' },
}

// ── SPL token registry ────────────────────────────────────────────────────────

interface TokenInfo { symbol: string; decimals: number }

const SPL_TOKENS: Record<string, TokenInfo> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC',     decimals: 6 },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT',     decimals: 6 },
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'RAY',      decimals: 6 },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN':  { symbol: 'JUP',      decimals: 6 },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK',     decimals: 5 },
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': { symbol: 'WIF',      decimals: 6 },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So':  { symbol: 'mSOL',     decimals: 9 },
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': { symbol: 'stSOL',    decimals: 9 },
  'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE':  { symbol: 'ORCA',     decimals: 6 },
  'So11111111111111111111111111111111111111112':    { symbol: 'wSOL',     decimals: 9 },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': { symbol: 'PYTH',     decimals: 6 },
  'SHDWyBxihqiCj6YekG2GUr7wqKLeLAQLcoGoJrHsFt5':  { symbol: 'SHDW',     decimals: 9 },
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof':  { symbol: 'RNDR',     decimals: 8 },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1':  { symbol: 'bSOL',     decimals: 9 },
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': { symbol: 'jitoSOL',  decimals: 9 },
  'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk':  { symbol: 'WEN',      decimals: 5 },
  'nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7':  { symbol: 'NOS',      decimals: 6 },
  'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM':  { symbol: 'USDCpo',   decimals: 6 },
  'MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21u':  { symbol: 'MEME',     decimals: 6 },
}

function getTokenInfo(mint: string): TokenInfo {
  return SPL_TOKENS[mint] ?? { symbol: mint.slice(0, 4) + '…', decimals: 9 }
}

// ── Amount formatting ─────────────────────────────────────────────────────────

function formatAmount(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M'
  if (value >= 1_000) return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (value >= 1) return parseFloat(value.toFixed(4)).toString()
  if (value >= 0.0001) return parseFloat(value.toFixed(6)).toString()
  return value.toFixed(8)
}

// ── Raw RPC types ─────────────────────────────────────────────────────────────

interface SolanaAccountKey {
  pubkey: string
  signer: boolean
  writable: boolean
  source?: string
}

interface SolanaInstruction {
  programId: string
  parsed?: { type: string; info: Record<string, unknown> }
  program?: string
  accounts?: string[]
  data?: string
}

interface SolanaTokenBalance {
  accountIndex: number
  mint: string
  owner?: string
  uiTokenAmount: { uiAmount: number | null; decimals: number; amount: string }
}

interface SolanaRawTx {
  blockTime: number | null
  meta: {
    err: unknown
    fee: number
    preBalances: number[]
    postBalances: number[]
    preTokenBalances: SolanaTokenBalance[]
    postTokenBalances: SolanaTokenBalance[]
    logMessages?: string[]
  } | null
  transaction: {
    message: {
      accountKeys: SolanaAccountKey[]
      instructions: SolanaInstruction[]
    }
    signatures: string[]
  }
}

// ── Net balance change builder ────────────────────────────────────────────────

function buildNetBalanceChanges(
  accountKeys: SolanaAccountKey[],
  meta: NonNullable<SolanaRawTx['meta']>,
): NetBalanceChange[] {
  const changes: NetBalanceChange[] = []
  const feePayer = accountKeys[0]?.pubkey ?? ''

  // SOL changes per account
  for (let i = 0; i < accountKeys.length; i++) {
    const key = accountKeys[i]
    let delta = meta.postBalances[i] - meta.preBalances[i]
    // For the fee payer, add back the fee so we see the "transfer amount" not "transfer + fee"
    if (key.pubkey === feePayer) delta += meta.fee
    // Skip dust changes (rent changes, compute budget, etc.) < 0.0001 SOL
    if (Math.abs(delta) < 100_000) continue

    changes.push({
      coinType: 'native::sol::SOL',
      symbol: 'SOL',
      decimals: 9,
      rawAmount: String(delta),
      formattedAmount: formatAmount(Math.abs(delta) / 1e9),
      direction: delta > 0 ? 'in' : 'out',
      ownerAddress: key.pubkey,
    })
  }

  // SPL token changes per (owner, mint) pair
  const tokenMap = new Map<string, {
    pre: number; post: number; decimals: number; symbol: string; owner: string
  }>()

  const mkKey = (b: SolanaTokenBalance) =>
    `${b.owner ?? accountKeys[b.accountIndex]?.pubkey ?? b.accountIndex}:${b.mint}`

  for (const b of meta.preTokenBalances) {
    const info = getTokenInfo(b.mint)
    const owner = b.owner ?? accountKeys[b.accountIndex]?.pubkey ?? ''
    tokenMap.set(mkKey(b), { pre: b.uiTokenAmount.uiAmount ?? 0, post: 0, decimals: info.decimals, symbol: info.symbol, owner })
  }
  for (const b of meta.postTokenBalances) {
    const info = getTokenInfo(b.mint)
    const owner = b.owner ?? accountKeys[b.accountIndex]?.pubkey ?? ''
    const key = mkKey(b)
    const existing = tokenMap.get(key)
    if (existing) {
      existing.post = b.uiTokenAmount.uiAmount ?? 0
    } else {
      tokenMap.set(key, { pre: 0, post: b.uiTokenAmount.uiAmount ?? 0, decimals: info.decimals, symbol: info.symbol, owner })
    }
  }

  for (const entry of tokenMap.values()) {
    const net = entry.post - entry.pre
    if (Math.abs(net) < 1e-9) continue  // dust
    changes.push({
      coinType: `spl::${entry.symbol}::${entry.symbol}`,
      symbol: entry.symbol,
      decimals: entry.decimals,
      rawAmount: String(Math.round(net * Math.pow(10, entry.decimals))),
      formattedAmount: formatAmount(Math.abs(net)),
      direction: net > 0 ? 'in' : 'out',
      ownerAddress: entry.owner,
    })
  }

  return changes
}

// ── Categorization ────────────────────────────────────────────────────────────

function detectCategory(programIds: string[], hasBalanceChanges: boolean): TransactionCategory {
  const cats = programIds
    .map(id => KNOWN_PROGRAMS[id]?.category)
    .filter((c): c is ProgramCategory => !!c)
  const catSet = new Set(cats)

  if (catSet.has('bridge'))    return 'bridge'
  if (catSet.has('swap'))      return 'swap'
  if (catSet.has('liquidity')) return 'liquidity'
  if (catSet.has('staking'))   return 'staking'
  if (catSet.has('nft'))       return 'nft-mint'
  if (catSet.has('lending'))   return 'contract-call'

  // All programs are infra (system/token/budget) — simple transfer
  const isOnlyInfra = cats.length > 0 && cats.every(c => c === 'system' || c === 'token' || c === 'other')
  if (isOnlyInfra && hasBalanceChanges) return 'coin-transfer'

  // Unknown programs
  const hasUnknown = programIds.some(id => !KNOWN_PROGRAMS[id])
  if (hasUnknown || catSet.has('other')) return 'contract-call'

  return 'unknown'
}

// ── Narrative builder ─────────────────────────────────────────────────────────

function buildNarrative(
  category: TransactionCategory,
  senderLabel: string,
  feePayer: string,
  netChanges: NetBalanceChange[],
  programIds: string[],
  instructions: SolanaInstruction[],
  success: boolean,
): { headline: string; what: string; outcome: string; steps?: string[] } {
  if (!success) {
    return {
      headline: 'Failed Transaction',
      what: `{{${senderLabel}}}'s transaction failed.`,
      outcome: 'Failed',
    }
  }

  const senderChanges = netChanges.filter(c => c.ownerAddress === feePayer)
  const outChange = senderChanges.find(c => c.direction === 'out' && c.symbol !== 'SOL')
    ?? senderChanges.find(c => c.direction === 'out')
  const receiverInChange = netChanges.find(c => c.direction === 'in' && c.ownerAddress !== feePayer)
  const senderInChange = senderChanges.find(c => c.direction === 'in')

  // Pick the most descriptive program (skip infra)
  const mainProgramId = programIds.find(id => {
    const cat = KNOWN_PROGRAMS[id]?.category
    return cat && !['system', 'token', 'other'].includes(cat)
  })
  const mainProgram = mainProgramId ? KNOWN_PROGRAMS[mainProgramId].name : null

  if (category === 'swap') {
    const dex = mainProgram ?? 'DEX'
    const sent = outChange ? `${outChange.formattedAmount} ${outChange.symbol}` : 'tokens'
    const received = senderInChange
      ? `${senderInChange.formattedAmount} ${senderInChange.symbol}`
      : receiverInChange
        ? `${receiverInChange.formattedAmount} ${receiverInChange.symbol}`
        : 'tokens'
    return {
      headline: `${dex} Swap`,
      what: `{{${senderLabel}}} swapped ${sent} for ${received} on ${dex}.`,
      outcome: `+${received}`,
    }
  }

  if (category === 'coin-transfer') {
    const sent = senderChanges.find(c => c.direction === 'out' && c.symbol !== 'SOL')
      ?? senderChanges.find(c => c.direction === 'out')
    const recipientChange = netChanges.find(c => c.direction === 'in' && c.ownerAddress !== feePayer)
    const amountText = sent ? `${sent.formattedAmount} ${sent.symbol}` : '?'
    const recipientLabel = recipientChange ? ' to {{Wallet B}}' : ''
    return {
      headline: 'Token Transfer',
      what: `{{${senderLabel}}} sent ${amountText}${recipientLabel}.`,
      outcome: sent ? `-${amountText}` : 'Completed',
    }
  }

  if (category === 'staking') {
    const protocol = mainProgram ?? 'Staking Protocol'
    const stakeChange = senderChanges.find(c => c.direction === 'out' && c.symbol === 'SOL')
    const amountText = stakeChange ? ` ${stakeChange.formattedAmount} SOL` : ''
    return {
      headline: `${protocol} Stake`,
      what: `{{${senderLabel}}} staked${amountText} via ${protocol}.`,
      outcome: amountText ? `${amountText} staked` : 'Staking updated',
    }
  }

  if (category === 'liquidity') {
    const protocol = mainProgram ?? 'Liquidity Protocol'
    const tokensIn = senderChanges.filter(c => c.direction === 'out' && c.symbol !== 'SOL')
    const tokenText = tokensIn.length > 0
      ? tokensIn.map(c => `${c.formattedAmount} ${c.symbol}`).join(' + ')
      : 'tokens'
    return {
      headline: 'Liquidity Provision',
      what: `{{${senderLabel}}} provided ${tokenText} to ${protocol}.`,
      outcome: 'Position updated',
    }
  }

  if (category === 'nft-mint') {
    return {
      headline: 'NFT Mint',
      what: `{{${senderLabel}}} minted an NFT.`,
      outcome: '1 NFT minted',
    }
  }

  if (category === 'bridge') {
    const protocol = mainProgram ?? 'Bridge'
    const sent = outChange ? `${outChange.formattedAmount} ${outChange.symbol}` : 'tokens'
    return {
      headline: 'Bridge Transfer',
      what: `{{${senderLabel}}} bridged ${sent} via ${protocol}.`,
      outcome: `${sent} bridged`,
    }
  }

  // Generic contract call
  const protocol = mainProgram ?? 'Contract'
  const topIx = instructions.find(ix => {
    const cat = KNOWN_PROGRAMS[ix.programId]?.category
    return cat && !['system', 'token', 'other'].includes(cat)
  })
  const fnText = topIx?.parsed?.type
    ? ` (${topIx.parsed.type.replace(/_/g, ' ')})`
    : ''
  return {
    headline: protocol,
    what: `{{${senderLabel}}} interacted with ${protocol}${fnText}.`,
    outcome: netChanges.length > 0
      ? netChanges
          .filter(c => c.ownerAddress === feePayer)
          .map(c => `${c.direction === 'in' ? '+' : '-'}${c.formattedAmount} ${c.symbol}`)
          .join(', ') || 'State updated'
      : 'State updated',
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchSolanaTransaction(
  signature: string,
  _language: Language,
): Promise<ParsedTransaction> {
  const response = await fetch(getSolanaRpcUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [signature, {
        encoding: 'jsonParsed',
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      }],
    }),
  })

  // Non-OK HTTP (e.g. 403 from RPC before we parse JSON)
  if (!response.ok) {
    throw new Error(
      `Could not reach the Solana RPC (HTTP ${response.status}). ` +
      `If you are running locally, restart the dev server so the proxy takes effect. ` +
      `For a reliable RPC, set VITE_SOLANA_RPC_URL in .env.local (e.g. a free Helius key).`
    )
  }

  const json = await response.json()
  if (json.error) {
    const msg: string = json.error.message ?? String(json.error)
    if (msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('access')) {
      throw new Error(
        `Solana RPC access denied. Restart the dev server to activate the proxy, ` +
        `or set VITE_SOLANA_RPC_URL in .env.local to a Helius/QuickNode free-tier URL.`
      )
    }
    throw new Error(`Solana RPC error: ${msg}`)
  }

  const raw = json.result as SolanaRawTx | null
  if (!raw) throw new Error('Transaction not found on Solana mainnet. Very old transactions may not be available on free RPC nodes.')
  if (!raw.meta) throw new Error('Transaction metadata unavailable')

  const { meta, transaction } = raw
  const accountKeys = transaction.message.accountKeys
  const instructions = transaction.message.instructions
  const feePayer = accountKeys[0]?.pubkey ?? ''
  const success = meta.err === null

  const netBalanceChanges = buildNetBalanceChanges(accountKeys, meta)
  const programIds = [...new Set(instructions.map(ix => ix.programId))]
  const category: TransactionCategory = success
    ? detectCategory(programIds, netBalanceChanges.length > 0)
    : 'failed'

  // User address map: Wallet A = fee payer; Wallet B = main recipient (if different)
  const userAddressMap = new Map<string, string>()
  userAddressMap.set('Wallet A', feePayer)
  const recipient = netBalanceChanges.find(
    c => c.direction === 'in' && c.ownerAddress && c.ownerAddress !== feePayer
  )?.ownerAddress
  if (recipient) userAddressMap.set('Wallet B', recipient)

  const narrative = buildNarrative(
    category, 'Wallet A', feePayer, netBalanceChanges, programIds, instructions, success
  )

  // Commands: map each instruction to a ParsedCommand
  const commands: ParsedCommand[] = instructions.map((ix, index) => {
    const prog = KNOWN_PROGRAMS[ix.programId]
    const isTransfer = prog?.category === 'system' || prog?.category === 'token'
    return {
      index,
      commandType: isTransfer ? 'TransferObjects' : 'MoveCall',
      package: ix.programId,
      module: prog?.name ?? ix.programId.slice(0, 8) + '…',
      function: ix.parsed?.type ?? '',
      displayName: prog?.name ?? 'Unknown Program',
    }
  })

  // PackageCalls: non-infrastructure programs only
  const seenPkgs = new Set<string>()
  const packageCalls: PackageCall[] = programIds
    .filter(id => {
      const cat = KNOWN_PROGRAMS[id]?.category
      return cat && !['system', 'token', 'other'].includes(cat) && !seenPkgs.has(id)
    })
    .map(id => {
      seenPkgs.add(id)
      return {
        package: id,
        module: KNOWN_PROGRAMS[id].name,
        function: '',
        displayName: KNOWN_PROGRAMS[id].name,
      }
    })

  const gasCostSol = formatAmount(meta.fee / 1e9)

  return {
    digest: signature,
    chain: 'solana',
    timestamp: raw.blockTime ? raw.blockTime * 1000 : undefined,
    sender: feePayer,
    success,
    gasUsed: String(meta.fee),
    gasCostSui: gasCostSol,

    category,
    confidence: 'partial',
    narrative: {
      headline: narrative.headline,
      what: narrative.what,
      outcome: narrative.outcome,
      steps: narrative.steps,
    },
    events: [],
    netBalanceChanges,
    commands,

    objectsCreated: [],
    objectsDeleted: [],
    objectsMutated: [],
    objectsTransferred: [],

    packageCalls,
    summary: [narrative.what],
    userAddressMap,
    aiSummary: narrative.what,
  }
}
