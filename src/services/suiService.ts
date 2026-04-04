import { SuiClient } from '@mysten/sui.js/client'
import {
  ParsedTransaction,
  ObjectChange,
  TransferChange,
  PackageCall,
  ParsedEvent,
  NetBalanceChange,
  ParsedCommand,
  TransactionCategory,
  TransactionNarrative,
  ConfidenceLevel,
} from '../types/transaction'
import { Language, Translations, allTranslations } from '../i18n'

// ── Client setup ──────────────────────────────────────────────────────────────

const getRpcUrl = () => {
  if (import.meta.env.DEV) return '/sui-rpc'
  return '/api/sui-rpc'
}

const FALLBACK_RPC_URLS = [
  'https://fullnode.mainnet.sui.io:443',
  'https://sui-mainnet-rpc.nodereal.io',
  'https://sui-mainnet.nodeinfra.com',
]

let client = new SuiClient({ url: getRpcUrl() })

async function tryAlternativeEndpoint(): Promise<boolean> {
  if (import.meta.env.DEV) return false
  for (const url of FALLBACK_RPC_URLS) {
    try {
      const testClient = new SuiClient({ url })
      await withTimeout(testClient.getLatestSuiSystemState(), 5000, 'Health check timeout')
      client = testClient
      return true
    } catch {
      // try next
    }
  }
  return false
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<T> {
  let lastError: Error | null = null
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError || new Error('All retry attempts failed')
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchTransactionDetails(digest: string, language: Language = 'en'): Promise<ParsedTransaction> {
  let attemptedFallback = false

  try {
    const txBlock = await retryWithBackoff(async () => {
      return await withTimeout(
        client.getTransactionBlock({
          digest,
          options: {
            showInput: true,
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showBalanceChanges: true,
          },
        }),
        20000,
        'Transaction fetch timed out after 20 seconds',
      )
    }, 3, 2000)

    let enrichedTxBlock = { ...txBlock, enrichedObjects: new Map() }
    try {
      enrichedTxBlock = await enrichWithObjectData(txBlock, client)
    } catch (enrichError) {
      console.warn('Enrichment failed, continuing:', enrichError)
    }

    return parseTransaction(enrichedTxBlock, language)
  } catch (error) {
    if (!attemptedFallback && !import.meta.env.DEV) {
      attemptedFallback = true
      const switched = await tryAlternativeEndpoint()
      if (switched) return fetchTransactionDetails(digest, language)
    }

    if (error instanceof Error) {
      if (error.message.includes('504') || error.message.toLowerCase().includes('timeout')) {
        throw new Error('⏱️ The Sui network is slow to respond. Please try again in a moment.')
      }
      if (error.message.includes('404') || error.message.includes('not found')) {
        throw new Error('❌ Transaction not found. Please check the transaction ID and try again.')
      }
      if (error.message.includes('429')) {
        throw new Error('⚠️ Rate limit exceeded. Please wait a moment and try again.')
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        throw new Error('🌐 Cannot connect to Sui network. Please check your internet connection.')
      }
      throw new Error(`Failed to fetch transaction: ${error.message}`)
    }
    throw new Error('Failed to fetch transaction: Unknown error')
  }
}

// ── Object enrichment (for NFT metadata) ─────────────────────────────────────

async function enrichWithObjectData(txBlock: any, suiClient: SuiClient): Promise<any> {
  try {
    const coinObjects = (txBlock.objectChanges || [])
      .filter((c: any) => c.type === 'transferred' && c.objectType?.includes('coin::Coin'))
      .slice(0, 3)

    const createdObjects = (txBlock.objectChanges || [])
      .filter((c: any) => c.type === 'created')
      .slice(0, 5)

    const transferredNonCoin = (txBlock.objectChanges || [])
      .filter((c: any) => c.type === 'transferred' && !c.objectType?.includes('coin::Coin'))
      .slice(0, 5)

    const allObjects = [...coinObjects, ...createdObjects, ...transferredNonCoin]
    if (allObjects.length === 0) return { ...txBlock, enrichedObjects: new Map() }

    const results = await Promise.race([
      Promise.all(
        allObjects.map(async (obj: any) => {
          try {
            const data = await Promise.race([
              suiClient.getObject({
                id: obj.objectId,
                options: { showContent: true, showType: true, showDisplay: true },
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
            ])
            return { objectId: obj.objectId, data }
          } catch {
            return null
          }
        })
      ),
      new Promise<null[]>((_, reject) =>
        setTimeout(() => reject(new Error('Overall timeout')), 4000)
      ),
    ])

    const enrichedObjects = new Map(
      (results as any[])
        .filter(r => r !== null)
        .map(r => [r!.objectId, r!.data])
    )

    return { ...txBlock, enrichedObjects }
  } catch {
    return { ...txBlock, enrichedObjects: new Map() }
  }
}

// ── Core parser ───────────────────────────────────────────────────────────────

function parseTransaction(txBlock: any, language: Language = 'en'): ParsedTransaction {
  const effects = txBlock.effects
  const objectChanges: any[] = txBlock.objectChanges || []
  const rawBalanceChanges: any[] = txBlock.balanceChanges || []

  const sender: string = txBlock.transaction?.data?.sender || 'Unknown'

  // Gas
  const gasUsed = effects?.gasUsed
  const totalGas = gasUsed
    ? BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost) - BigInt(gasUsed.storageRebate)
    : BigInt(0)
  const gasCostSui = (Number(totalGas) / 1_000_000_000).toFixed(6)

  const success: boolean = effects?.status?.status === 'success'

  // ── Object changes ────────────────────────────────────────────────────────
  const objectsCreated: ObjectChange[] = []
  const objectsDeleted: ObjectChange[] = []
  const objectsMutated: ObjectChange[] = []
  const objectsTransferred: TransferChange[] = []

  for (const change of objectChanges) {
    if (change.type === 'created') {
      const enriched = txBlock.enrichedObjects?.get(change.objectId)
      const isNFT = isNFTObject(change.objectType, enriched)
      objectsCreated.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        version: change.version,
        digest: change.digest,
        owner: formatOwner(change.owner),
        fullOwnerAddress: getFullAddress(change.owner),
        isNFT,
        nftMetadata: isNFT ? extractNFTMetadata(enriched) : undefined,
      })
    } else if (change.type === 'deleted') {
      objectsDeleted.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        version: change.version,
        digest: change.digest,
      })
    } else if (change.type === 'mutated') {
      objectsMutated.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        version: change.version,
        digest: change.digest,
        owner: formatOwner(change.owner),
      })
    } else if (change.type === 'transferred') {
      let amount: string | undefined
      let tokenSymbol: string | undefined
      let tokenDecimals: number | undefined

      if (change.objectType?.includes('coin::Coin')) {
        const coinInfo = extractCoinInfo(change.objectType, txBlock.enrichedObjects?.get(change.objectId))
        amount = coinInfo.amount
        tokenSymbol = coinInfo.symbol
        tokenDecimals = coinInfo.decimals
      }

      const enriched = txBlock.enrichedObjects?.get(change.objectId)
      const isNFT = isNFTObject(change.objectType, enriched)
      objectsTransferred.push({
        objectId: change.objectId,
        objectType: change.objectType || 'Unknown',
        from: formatOwner(change.sender),
        to: formatOwner(change.recipient),
        version: change.version,
        amount,
        tokenSymbol,
        tokenDecimals,
        isNFT,
        nftMetadata: isNFT ? extractNFTMetadata(enriched) : undefined,
      })
    }
  }

  // ── New: events, commands, net balance changes ────────────────────────────
  const events = parseEvents(txBlock.events || [])
  const commands = parseCommands(txBlock.transaction?.data?.transaction?.transactions || [])
  const netBalanceChanges = buildNetBalanceChanges(rawBalanceChanges)

  // Legacy packageCalls (still used by some UI paths)
  const packageCalls: PackageCall[] = commands
    .filter(c => c.commandType === 'MoveCall')
    .map(c => ({
      package: c.package!,
      module: c.module!,
      function: c.function!,
      displayName: c.displayName!,
    }))

  // ── Address mapping ───────────────────────────────────────────────────────
  const { addressToUser, userAddressMap } = buildAddressMap(
    sender,
    objectsCreated,
    rawBalanceChanges,
    objectChanges,
  )
  const getUserLabel = (addr: string) => addressToUser.get(addr) || truncateAddress(addr)

  // ── Category, confidence & narrative ─────────────────────────────────────
  const category: TransactionCategory = success
    ? detectCategory(events, commands, objectsTransferred, objectsCreated, rawBalanceChanges)
    : 'failed'

  const confidence = computeConfidence(category, events, commands)

  const narrative = buildNarrative({
    category,
    events,
    commands,
    netBalanceChanges,
    sender,
    getUserLabel,
    userAddressMap,
    objectsTransferred,
    objectsCreated,
    success,
    t: allTranslations[language],
  })

  return {
    digest: txBlock.digest,
    timestamp: txBlock.timestampMs ? Number(txBlock.timestampMs) : undefined,
    sender,
    success,
    gasUsed: totalGas.toString(),
    gasCostSui,
    category,
    confidence,
    narrative,
    events,
    netBalanceChanges,
    commands,
    objectsCreated,
    objectsDeleted,
    objectsMutated,
    objectsTransferred,
    packageCalls,
    summary: [],
    userAddressMap,
    aiSummary: narrative.what,
    rawEffects: effects,
  }
}

// ── Address mapping ───────────────────────────────────────────────────────────

function buildAddressMap(
  sender: string,
  objectsCreated: ObjectChange[],
  rawBalanceChanges: any[],
  rawObjectChanges: any[],
): { addressToUser: Map<string, string>; userAddressMap: Map<string, string> } {
  const addressToUser = new Map<string, string>()
  const labels = ['A', 'B', 'C', 'D', 'E', 'F']
  let idx = 0

  const assign = (address: string) => {
    if (
      !address ||
      address === 'Unknown' ||
      address === 'Shared' ||
      address === 'Immutable' ||
      address.startsWith('Object(')
    ) return

    if (!addressToUser.has(address)) {
      addressToUser.set(
        address,
        idx < labels.length ? `Wallet ${labels[idx++]}` : truncateAddress(address),
      )
    }
  }

  assign(sender)

  for (const obj of objectsCreated) {
    if (obj.isNFT && obj.fullOwnerAddress) assign(obj.fullOwnerAddress)
  }

  for (const change of rawObjectChanges) {
    if (change.type === 'transferred') {
      assign(getFullAddress(change.sender))
      assign(getFullAddress(change.recipient))
    }
  }

  for (const bc of rawBalanceChanges) {
    if (bc.owner?.AddressOwner) assign(bc.owner.AddressOwner)
  }

  const userAddressMap = new Map<string, string>()
  for (const [addr, label] of addressToUser.entries()) {
    userAddressMap.set(label, addr)
  }

  return { addressToUser, userAddressMap }
}

// ── Event parsing ─────────────────────────────────────────────────────────────

function parseEvents(rawEvents: any[]): ParsedEvent[] {
  return rawEvents.map(e => {
    const parts = (e.type || '').split('::')
    return {
      type: e.type || '',
      eventName: parts[parts.length - 1] || 'UnknownEvent',
      module: e.transactionModule || '',
      packageId: e.packageId || '',
      parsedJson: e.parsedJson || {},
    }
  })
}

// ── Command parsing ───────────────────────────────────────────────────────────

function parseCommands(rawTxs: any[]): ParsedCommand[] {
  return rawTxs.map((tx: any, index: number) => {
    const key = Object.keys(tx)[0] || 'Other'

    if (key === 'MoveCall') {
      const mc = tx.MoveCall
      const typeSymbols = (mc.type_arguments || []).map((t: string) => {
        const parts = t.split('::')
        return parts[parts.length - 1] || t
      })
      return {
        index,
        commandType: 'MoveCall' as const,
        package: mc.package,
        module: mc.module,
        function: mc.function,
        typeArguments: mc.type_arguments || [],
        typeSymbols,
        displayName: humanizeFunctionName(mc.function),
      }
    }

    const typeMap: Record<string, ParsedCommand['commandType']> = {
      TransferObjects: 'TransferObjects',
      SplitCoins: 'SplitCoins',
      MergeCoins: 'MergeCoins',
      Publish: 'Publish',
    }

    return { index, commandType: typeMap[key] ?? ('Other' as const) }
  })
}

// ── Net balance changes ───────────────────────────────────────────────────────

function buildNetBalanceChanges(rawBalanceChanges: any[]): NetBalanceChange[] {
  return rawBalanceChanges
    .map((bc: any): NetBalanceChange => {
      const coinType: string = bc.coinType || '0x2::sui::SUI'
      const { symbol, decimals } = getTokenInfoFromType(coinType)
      const raw = BigInt(bc.amount || 0)
      const direction: 'in' | 'out' = raw >= 0n ? 'in' : 'out'
      const absRaw = raw < 0n ? -raw : raw

      return {
        coinType,
        symbol,
        decimals,
        rawAmount: bc.amount?.toString() || '0',
        formattedAmount: formatCoinAmount(absRaw.toString(), decimals),
        direction,
        ownerAddress: bc.owner?.AddressOwner ?? undefined,
      }
    })
    .filter(bc => {
      // Drop dust-level SUI changes that are just gas
      if (bc.symbol === 'SUI') {
        return Math.abs(Number(bc.rawAmount)) / 1e9 >= 0.001
      }
      return true
    })
}

function formatCoinAmount(rawAbs: string, decimals: number): string {
  const value = Number(rawAbs) / Math.pow(10, decimals)
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M'
  if (value >= 1_000) return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (value >= 1) return parseFloat(value.toFixed(4)).toString()
  if (value >= 0.0001) return parseFloat(value.toFixed(6)).toString()
  return value.toFixed(8)
}

// ── Category detection (event-first) ─────────────────────────────────────────

function detectCategory(
  events: ParsedEvent[],
  commands: ParsedCommand[],
  objectsTransferred: TransferChange[],
  objectsCreated: ObjectChange[],
  balanceChanges: any[],
): TransactionCategory {
  const names = events.map(e => e.eventName.toLowerCase())
  const modules = events.map(e => e.module.toLowerCase())
  const all = [...names, ...modules]

  const hasFlashLoan = all.some(s =>
    s.includes('flashloan') || s.includes('flash_loan') || s.includes('borrowed')
  )
  const swapCount = names.filter(n => n.includes('swap') || n.includes('swapevent')).length

  if (hasFlashLoan && swapCount > 0) return 'arbitrage'
  if (hasFlashLoan) return 'flash-loan'
  if (swapCount > 0) return 'swap'

  if (all.some(s =>
    s.includes('liquidity') || s.includes('addlp') || s.includes('removelp') ||
    s.includes('provide') || s.includes('withdraw_lp')
  )) return 'liquidity'

  if (all.some(s =>
    s.includes('stake') || s.includes('unstake') || s.includes('delegat') || s.includes('staking')
  )) return 'staking'

  if (all.some(s =>
    s.includes('vote') || s.includes('proposal') || s.includes('govern')
  )) return 'governance'

  if (all.some(s =>
    s.includes('bridge') || s.includes('wormhole') || s.includes('portal')
  )) return 'bridge'

  // Object-change based detection
  if (objectsCreated.some(o => o.isNFT)) return 'nft-mint'
  if (objectsTransferred.some(o => o.isNFT)) return 'nft-transfer'

  // Simple coin transfer: coin objects transferred, or 2+ addresses with balance changes
  const hasCoinTransfer = objectsTransferred.some(o => o.objectType?.includes('coin::Coin'))
  if (hasCoinTransfer) return 'coin-transfer'

  const uniqueAddrs = new Set(
    balanceChanges.map((b: any) => b.owner?.AddressOwner).filter(Boolean)
  )
  const moveCallCount = commands.filter(c => c.commandType === 'MoveCall').length
  if (uniqueAddrs.size >= 2 && moveCallCount === 0) return 'coin-transfer'

  if (moveCallCount > 0) return 'contract-call'
  if (objectsCreated.length > 0) return 'object-creation'

  return 'unknown'
}

// ── Confidence ────────────────────────────────────────────────────────────────

function computeConfidence(
  category: TransactionCategory,
  events: ParsedEvent[],
  commands: ParsedCommand[],
): ConfidenceLevel {
  if (category === 'failed') return 'high'
  // Simple transfer categories are always high-confidence — no events needed
  const alwaysHighCategories: TransactionCategory[] = ['coin-transfer', 'nft-mint', 'nft-transfer']
  if (alwaysHighCategories.includes(category)) return 'high'
  const highCategories: TransactionCategory[] = ['arbitrage', 'swap', 'staking', 'governance', 'bridge']
  if (highCategories.includes(category) && events.length > 0) return 'high'
  const partialCategories: TransactionCategory[] = ['flash-loan', 'liquidity', 'contract-call']
  if (partialCategories.includes(category) && commands.some(c => c.commandType === 'MoveCall')) return 'partial'
  return 'complex'
}

// ── Narrative building ────────────────────────────────────────────────────────

interface NarrativeInput {
  category: TransactionCategory
  events: ParsedEvent[]
  commands: ParsedCommand[]
  netBalanceChanges: NetBalanceChange[]
  sender: string
  getUserLabel: (addr: string) => string
  userAddressMap: Map<string, string>
  objectsTransferred: TransferChange[]
  objectsCreated: ObjectChange[]
  success: boolean
  t: Translations
}

function buildNarrative(input: NarrativeInput): TransactionNarrative {
  const {
    category, events, commands, netBalanceChanges,
    sender, getUserLabel, userAddressMap, objectsTransferred, objectsCreated, success, t,
  } = input

  const senderLabel = getUserLabel(sender)

  if (!success) {
    return {
      headline: t.headlineFailed,
      what: t.narrativeFailed(senderLabel),
      outcome: t.narrativeFailedOutcome,
    }
  }

  const outcomeFromChanges = (): string => {
    const parts: string[] = []
    for (const c of netBalanceChanges) {
      const prefix = c.direction === 'in' ? '+' : '-'
      parts.push(`${prefix}${c.formattedAmount} ${c.symbol}`)
    }
    return parts.join(', ') || 'No net change'
  }

  // ── Arbitrage ──────────────────────────────────────────────────────────────
  if (category === 'arbitrage') {
    const swapEvents = events.filter(e =>
      e.eventName.toLowerCase().includes('swap') || e.eventName.toLowerCase().includes('swapevent')
    )
    const profit = netBalanceChanges.find(c => c.direction === 'in' && c.symbol !== 'SUI')
      ?? netBalanceChanges.find(c => c.direction === 'in')
    const profitText = profit ? `+${profit.formattedAmount} ${profit.symbol}` : 'an unknown profit'
    const swapCount = swapEvents.length

    const steps: string[] = []

    const borrowEvent = events.find(e => {
      const n = e.eventName.toLowerCase()
      return n.includes('flashloan') || n.includes('flash_loan') || n.includes('borrowed')
    })
    if (borrowEvent) {
      const qty = borrowEvent.parsedJson['borrow_quantity'] as string | undefined
      const typeNameRaw = (borrowEvent.parsedJson['type_name'] as any)?.name as string | undefined
      const fullType = typeNameRaw ? ('0x' + typeNameRaw) : ''
      const { symbol: sym, decimals } = fullType ? getTokenInfoFromType(fullType) : { symbol: 'tokens', decimals: 6 }
      const amount = qty ? formatCoinAmount(qty, decimals) : '?'
      steps.push(t.narrativeArbitrageStepBorrow(amount, sym))
    }

    swapEvents.forEach((e, i) => {
      const dex = humanizeModuleName(e.module)
      const matchingCmd = commands.find(
        c => c.commandType === 'MoveCall' && c.module === e.module
      )
      const typeText = matchingCmd?.typeSymbols?.length
        ? ` — ${matchingCmd.typeSymbols.join(' → ')}`
        : ''
      steps.push(t.narrativeArbitrageStepSwap(i, dex, typeText))
    })

    steps.push(t.narrativeArbitrageStepRepay(profitText))

    return {
      headline: t.headlineArbitrage,
      what: t.narrativeArbitrage(senderLabel, swapCount, profitText),
      outcome: profitText,
      steps,
    }
  }

  // ── Flash loan (no clear arbitrage) ───────────────────────────────────────
  if (category === 'flash-loan') {
    const call = commands.find(c => c.commandType === 'MoveCall')
    const protocol = call ? humanizeModuleName(call.module ?? '') : 'a lending protocol'
    return {
      headline: t.headlineFlashLoan,
      what: t.narrativeFlashLoan(senderLabel, protocol),
      outcome: outcomeFromChanges(),
    }
  }

  // ── Token swap ─────────────────────────────────────────────────────────────
  if (category === 'swap') {
    const swapEvents = events.filter(e =>
      e.eventName.toLowerCase().includes('swap') || e.eventName.toLowerCase().includes('swapevent')
    )
    const outChange = netBalanceChanges.find(c => c.direction === 'out' && c.symbol !== 'SUI')
      ?? netBalanceChanges.find(c => c.direction === 'out')
    const inChange = netBalanceChanges.find(c => c.direction === 'in')

    const dexModules = [...new Set(swapEvents.map(e => humanizeModuleName(e.module)))]
    const dexText = dexModules.length ? ` on ${dexModules[0]}` : ''
    const swapDesc = outChange && inChange
      ? `${outChange.formattedAmount} ${outChange.symbol} for ${inChange.formattedAmount} ${inChange.symbol}`
      : 'tokens'

    const steps = swapEvents.length > 1
      ? swapEvents.map((e, i) => t.narrativeSwapStep(i, humanizeModuleName(e.module)))
      : undefined

    return {
      headline: swapEvents.length > 1 ? t.headlineMultiSwap : t.headlineSwap,
      what: t.narrativeSwap(senderLabel, swapDesc, dexText),
      outcome: inChange ? `+${inChange.formattedAmount} ${inChange.symbol}` : outcomeFromChanges(),
      steps,
    }
  }

  // ── Coin / token transfer ──────────────────────────────────────────────────
  if (category === 'coin-transfer') {
    const coinTransfer = objectsTransferred.find(o => o.objectType?.includes('coin::Coin'))
    const suiInflow  = netBalanceChanges.find(c => c.direction === 'in'  && c.symbol === 'SUI')
    const suiOutflow = netBalanceChanges.find(c => c.direction === 'out' && c.symbol === 'SUI')

    // Only treat a SUI outflow as gas when no SUI was actually received by another wallet.
    // When SUI is being transferred the outflow = (sent amount + gas), so the correct
    // "sent amount" is the recipient's inflow.
    const isSuiToSui = !!suiInflow && !!suiOutflow
    const nonGasOut =
      netBalanceChanges.find(c => c.direction === 'out' && c.symbol !== 'SUI') ??
      (isSuiToSui ? null : netBalanceChanges.find(c => c.direction === 'out'))
    const outChange = nonGasOut ?? netBalanceChanges.find(c => c.direction === 'out')

    let amount = ''
    if (isSuiToSui && suiInflow) {
      // Use what the recipient actually received, not sender's gas-inclusive outflow
      amount = `${suiInflow.formattedAmount} ${suiInflow.symbol}`
    } else if (outChange) {
      amount = `${outChange.formattedAmount} ${outChange.symbol}`
    } else if (coinTransfer?.tokenSymbol && coinTransfer.amount) {
      amount = `${formatCoinAmount(coinTransfer.amount, coinTransfer.tokenDecimals ?? 9)} ${coinTransfer.tokenSymbol}`
    } else {
      amount = 'tokens'
    }

    const recipientRaw = (() => {
      // 1. Coin object transfer
      if (coinTransfer) {
        const addr = getFullAddress(txBlock_findTransferRecipient(coinTransfer.objectId) ?? coinTransfer.to)
        if (addr && addr !== 'Unknown' && addr !== sender) return addr
      }
      // 2. Any object transferred to a non-sender address
      const anyTransfer = objectsTransferred.find(o => o.to && o.to !== sender)
      if (anyTransfer) return getFullAddress(anyTransfer.to)
      // 3. Any address in the userAddressMap that isn't the sender
      for (const [, addr] of userAddressMap) {
        if (addr !== sender) return addr
      }
      return null
    })()
    const recipientLabel = recipientRaw ? getUserLabel(recipientRaw) : null

    return {
      headline: t.headlineCoinTransfer,
      what: t.narrativeCoinTransfer(senderLabel, amount, recipientLabel ?? ''),
      outcome: outChange ? `-${outChange.formattedAmount} ${outChange.symbol}` : `-${amount}`,
    }
  }

  // ── NFT mint ───────────────────────────────────────────────────────────────
  if (category === 'nft-mint') {
    const nfts = objectsCreated.filter(o => o.isNFT)
    const count = nfts.length
    const firstName = nfts[0]?.nftMetadata?.name
    const objectId = nfts[0]?.objectId
    const collectionName = firstName
      ? (firstName.split('#')[0].trim() || firstName)
      : 'NFT'

    let whatText = count === 1
      ? t.narrativeNftMint1(senderLabel, collectionName)
      : t.narrativeNftMintN(senderLabel, count, collectionName)

    // Embed clickable object link: replace the quoted name with [[OBJ:id:name]] marker
    if (count === 1 && objectId && collectionName) {
      whatText = whatText.replace(`"${collectionName}"`, `"[[OBJ:${objectId}:${collectionName}]]"`)
    }

    return {
      headline: t.headlineNftMint,
      what: whatText,
      outcome: t.narrativeNftMintOutcome(count),
    }
  }

  // ── NFT transfer ───────────────────────────────────────────────────────────
  if (category === 'nft-transfer') {
    const nfts = objectsTransferred.filter(o => o.isNFT)
    const count = nfts.length
    const name = nfts[0]?.nftMetadata?.name || 'NFT'
    const recipientLabel = nfts[0]?.to ? getUserLabel(nfts[0].to) : null

    return {
      headline: t.headlineNftTransfer,
      what: count === 1
        ? t.narrativeNftTransfer1(senderLabel, name, recipientLabel ?? '')
        : t.narrativeNftTransferN(senderLabel, count, recipientLabel ?? ''),
      outcome: t.narrativeNftTransferOutcome(count),
    }
  }

  // ── Liquidity ──────────────────────────────────────────────────────────────
  if (category === 'liquidity') {
    const isAdd = events.some(e => {
      const n = e.eventName.toLowerCase()
      return n.includes('add') || n.includes('provide') || n.includes('deposit')
    })
    const call = commands.find(c => c.commandType === 'MoveCall')
    const protocol = call ? humanizeModuleName(call.module ?? '') : 'a DEX'

    return {
      headline: isAdd ? t.headlineAddLiquidity : t.headlineRemoveLiquidity,
      what: isAdd
        ? t.narrativeAddLiquidity(senderLabel, protocol)
        : t.narrativeRemoveLiquidity(senderLabel, protocol),
      outcome: outcomeFromChanges(),
    }
  }

  // ── Staking ────────────────────────────────────────────────────────────────
  if (category === 'staking') {
    const isUnstake = events.some(e => e.eventName.toLowerCase().includes('unstake'))
    const suiChange = netBalanceChanges.find(c => c.symbol === 'SUI')
    const amountText = suiChange ? `${suiChange.formattedAmount} SUI` : 'SUI'

    return {
      headline: isUnstake ? t.headlineUnstake : t.headlineStake,
      what: isUnstake
        ? t.narrativeUnstake(senderLabel)
        : t.narrativeStake(senderLabel, amountText),
      outcome: outcomeFromChanges(),
    }
  }

  // ── Governance ─────────────────────────────────────────────────────────────
  if (category === 'governance') {
    return {
      headline: t.headlineGovernance,
      what: t.narrativeGovernance(senderLabel),
      outcome: t.narrativeGovernanceOutcome,
    }
  }

  // ── Bridge ─────────────────────────────────────────────────────────────────
  if (category === 'bridge') {
    const outChange = netBalanceChanges.find(c => c.direction === 'out')
    const amountText = outChange ? `${outChange.formattedAmount} ${outChange.symbol}` : 'tokens'
    return {
      headline: t.headlineBridge,
      what: t.narrativeBridge(senderLabel, amountText),
      outcome: outcomeFromChanges(),
    }
  }

  // ── Generic contract call ──────────────────────────────────────────────────
  if (category === 'contract-call') {
    const calls = commands.filter(c => c.commandType === 'MoveCall')
    if (calls.length > 0) {
      const outcomeText = netBalanceChanges.length > 0 ? outcomeFromChanges() : 'State updated'

      if (calls.length === 1) {
        const call = calls[0]
        const protocol = humanizeModuleName(call.module ?? '')
        const fn = humanizeFunctionName(call.function ?? '')
        const typeText = call.typeSymbols?.length ? ` with ${call.typeSymbols.join(' and ')}` : ''
        return {
          headline: protocol,
          what: t.narrativeContractCall1(senderLabel, fn, typeText, protocol),
          outcome: outcomeText,
        }
      }

      const protocols = [...new Set(calls.map(c => humanizeModuleName(c.module ?? '')))]
      const protocolText = protocols.slice(0, 2).join(' and ')
      return {
        headline: 'Contract Interaction',
        what: t.narrativeContractCallN(senderLabel, calls.length, protocolText),
        outcome: outcomeText,
        steps: calls.map(c => {
          const fn = humanizeFunctionName(c.function ?? '')
          const mod = humanizeModuleName(c.module ?? '')
          const types = c.typeSymbols?.length ? ` (${c.typeSymbols.join(' → ')})` : ''
          return t.narrativeContractCallStep(fn, types, mod)
        }),
      }
    }
  }

  // ── Object creation ────────────────────────────────────────────────────────
  if (category === 'object-creation') {
    const count = objectsCreated.length
    return {
      headline: t.headlineObjectCreation,
      what: t.narrativeObjectCreation(senderLabel, count),
      outcome: t.narrativeObjectCreationOutcome(count),
    }
  }

  // ── Unknown fallback ───────────────────────────────────────────────────────
  return {
    headline: t.headlineUnknown,
    what: t.narrativeUnknown(senderLabel),
    outcome: outcomeFromChanges() || 'Completed',
  }
}


/** Stub: real implementation would search rawObjectChanges; we fall back to the formatted address */
function txBlock_findTransferRecipient(_objectId: string): string | null {
  return null
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatOwner(owner: any): string {
  if (!owner) return 'Unknown'
  if (typeof owner === 'string') return truncateAddress(owner)
  if (owner.AddressOwner) return truncateAddress(owner.AddressOwner)
  if (owner.ObjectOwner) return `Object(${truncateAddress(owner.ObjectOwner)})`
  if (owner.Shared) return 'Shared'
  if (owner.Immutable) return 'Immutable'
  return 'Unknown'
}

function getFullAddress(owner: any): string {
  if (!owner) return 'Unknown'
  if (typeof owner === 'string') return owner
  if (owner.AddressOwner) return owner.AddressOwner
  if (owner.ObjectOwner) return owner.ObjectOwner
  if (owner.Shared) return 'Shared'
  if (owner.Immutable) return 'Immutable'
  return 'Unknown'
}

function truncateAddress(address: string): string {
  if (!address || address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/** snake_case → "Title Case" */
function humanizeFunctionName(fnName: string): string {
  return fnName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/** Returns a plain-English protocol label for a smart contract module */
function humanizeModuleName(moduleName: string): string {
  const lower = moduleName.toLowerCase()
  const known: [string, string][] = [
    ['cetus_clmm', 'Cetus DEX'],
    ['cetus', 'Cetus DEX'],
    ['turbos', 'Turbos DEX'],
    ['kriya', 'Kriya DEX'],
    ['deepbook', 'DeepBook DEX'],
    ['aftermath', 'Aftermath Finance'],
    ['scallop', 'Scallop Lending'],
    ['navi', 'Navi Protocol'],
    ['bucket', 'Bucket Protocol'],
    ['flashloan', 'Flash Loan Protocol'],
    ['flash_loan', 'Flash Loan Protocol'],
    ['pool', 'Liquidity Pool'],
    ['router', 'DEX Router'],
    ['lending', 'Lending Protocol'],
    ['borrow', 'Borrowing Protocol'],
    ['dex', 'DEX'],
    ['swap', 'Swap Protocol'],
    ['amm', 'AMM Protocol'],
    ['market', 'Marketplace'],
    ['auction', 'Auction Contract'],
    ['staking', 'Staking Protocol'],
    ['stake', 'Staking Protocol'],
    ['vault', 'Vault Protocol'],
    ['bridge', 'Bridge Protocol'],
    ['governance', 'Governance Contract'],
    ['vote', 'Governance Contract'],
    ['nft', 'NFT Contract'],
    ['token', 'Token Contract'],
    ['coin', 'Coin Contract'],
    ['game', 'Game Contract'],
  ]
  for (const [key, label] of known) {
    if (lower.includes(key)) return label
  }
  return humanizeFunctionName(moduleName) + ' Contract'
}

// ── Token info ────────────────────────────────────────────────────────────────

function getTokenInfoFromType(coinType: string): { symbol: string; decimals: number } {
  const known: Record<string, { symbol: string; decimals: number }> = {
    '0x2::sui::SUI': { symbol: 'SUI', decimals: 9 },
    // USDC (Circle native + Wormhole)
    '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC': { symbol: 'USDC', decimals: 6 },
    '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN': { symbol: 'USDC', decimals: 6 },
    // USDT
    '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN': { symbol: 'USDT', decimals: 6 },
    // WETH
    '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN': { symbol: 'WETH', decimals: 8 },
    // CETUS
    '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS': { symbol: 'CETUS', decimals: 9 },
    // WBTC
    '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN': { symbol: 'WBTC', decimals: 8 },
  }

  if (known[coinType]) return known[coinType]

  const parts = coinType.split('::')
  const last = parts[parts.length - 1]?.toUpperCase() || 'TOKEN'
  const symbol = last.replace('_TOKEN', '').replace('TOKEN', '') || 'TOKEN'
  // Assume 6 decimals for stablecoins, 9 for everything else
  const decimals = ['USDC', 'USDT', 'DAI', 'BUSD', 'USDA'].includes(symbol) ? 6 : 9
  return { symbol, decimals }
}

function extractCoinInfo(
  coinType: string,
  objectData?: any,
): { amount?: string; symbol: string; decimals: number } {
  const match = coinType.match(/Coin<(.+)>/)
  if (!match) return { symbol: 'Unknown', decimals: 9 }

  const { symbol, decimals } = getTokenInfoFromType(match[1])
  const amount = objectData?.data?.content?.fields?.balance

  return { amount, symbol, decimals }
}

// ── NFT helpers ───────────────────────────────────────────────────────────────

function isNFTObject(objectType: string, objectData?: any): boolean {
  if (!objectType) return false
  if (objectType.includes('coin::Coin')) return false
  if (objectType.includes('::dynamic_field::') || objectType.includes('::dynamic_object_field::')) return false

  if (objectData?.data?.display?.data) return true

  const lower = objectType.toLowerCase()
  if (lower.includes('nft')) return true

  const patterns = [
    '::nft::', '::NFT::', '::collectible::', '::asset::', '::token::Token',
    '::item::', '::agent::', '::character::', '::card::', '::badge::', '::license::',
  ]
  if (patterns.some(p => objectType.includes(p))) return true

  const content = objectData?.data?.content?.fields
  if (content && (content.name || content.image_url || content.url || content.description)) {
    if (!objectType.includes('::dynamic_field::')) return true
  }

  return false
}

function extractNFTMetadata(objectData?: any): {
  name?: string; description?: string; imageUrl?: string; attributes?: Record<string, string>
} | undefined {
  if (!objectData) return undefined

  const display = objectData.data?.display?.data
  const content = objectData.data?.content?.fields

  if (!display && !content) return undefined

  const stringify = (v: any): string => {
    if (v === null || v === undefined) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    if (Array.isArray(v)) return v.join(', ')
    try { return JSON.stringify(v) } catch { return '' }
  }

  const excluded = ['id', 'name', 'description', 'image_url', 'img_url', 'url',
    'value', 'balance', 'type', 'owner', 'version', 'digest']

  return {
    name: display?.name || content?.name || 'NFT',
    description: display?.description || content?.description,
    imageUrl: display?.image_url || display?.img_url || content?.image_url || content?.url,
    attributes: content
      ? Object.fromEntries(
          Object.entries(content)
            .filter(([k]) => !excluded.includes(k.toLowerCase()))
            .filter(([, v]) => v !== null && v !== undefined)
            .map(([k, v]) => [k, stringify(v)])
            .filter(([, v]) => v.length > 0 && v.length < 100)
        )
      : undefined,
  }
}

