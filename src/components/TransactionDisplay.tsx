import { ParsedTransaction, NetBalanceChange, TransactionCategory } from '../types/transaction'
import { useT, Language } from '../i18n'
import { TransactionInput } from './TransactionInput'

// ── Figma assets (valid 7 days — replace with permanent hosted assets) ──────
const imgWallet       = '../../public/imgWallet.svg'
const imgObjects      = '../../public/imgObjects.svg'
const imgNFT          = '../../public/imgNFT.svg'
const imgFailIcon     = '../../public/imgFailIcon.svg'
const imgArrow        = '../../public/imgArrow.svg'
// Token transfer
const imgToken        = '../../public/imgToken.svg'
const imgTokenArrow   = '../../public/imgTokenArrow.svg'
const imgCardArrowOut = '../../public/imgCardArrowOut.svg'
const imgCardArrowIn  = '../../public/imgCardArrowIn.svg'
// Contract interaction
const imgContract     = '../../public/imgContract.svg'
const imgContractArrow = '../../public/imgContractArrow.svg'
// Footer
const imgLinkedIn = '../../public/imgLinkedIn.svg'
const imgTwitterX = '../../public/imgTwitterX.svg'

const mono = { fontFamily: "'DM Mono', monospace" }

// ── Known protocol registry ───────────────────────────────────────────────────

const KNOWN_PROTOCOL_KEYS = [
  'cetus_clmm', 'cetus', 'turbos', 'kriya', 'deepbook', 'aftermath',
  'flashloan', 'flash_loan', 'pool', 'router', 'lending', 'borrow',
  'dex', 'swap', 'amm', 'market', 'staking', 'stake', 'vault',
  'bridge', 'governance', 'nft',
]

function isKnownProtocol(moduleName: string): boolean {
  const lower = moduleName.toLowerCase()
  return KNOWN_PROTOCOL_KEYS.some(key => lower.includes(key))
}

// ── Card content types ────────────────────────────────────────────────────────
type CardContent =
  | { type: 'objects'; count: number }
  | { type: 'nfts'; count: number }
  | { type: 'token'; formattedAmount: string; symbol: string; direction: 'out' | 'in' }
  | { type: 'wallet-action'; actionLabel: string }   // wallet doing something (arbitrage, swap, etc.)
  | { type: 'protocol'; name: string; outcomeText: string; steps?: number }
  | { type: 'failed' }
  | { type: 'empty' }

// ── ExplanationText: renders {{User A}} markers as blue underlined spans ──────

function ExplanationText({ text, transaction }: { text: string; transaction: ParsedTransaction }) {
  const parts = text.split(/(\{\{[^}]+\}\})/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          const label = part.slice(2, -2)
          const address = transaction.userAddressMap.get(label)
          return (
            <span
              key={i}
              className="text-[#298dff] underline decoration-solid cursor-pointer font-medium"
              title={address}
            >
              {label}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// ── ContractTrustBadge ────────────────────────────────────────────────────────

function ContractTrustBadge({ trust }: { trust: TrustLevel }) {
  if (trust === 'wallet') return null

  const isKnown = trust === 'known'
  return (
    <div className="relative group cursor-default">
      <div className={`flex items-center gap-[5px] px-2 py-[3px] border ${isKnown ? 'border-[#298dff]/25' : 'border-[#f5a623]/30'}`}>
        <div className={`size-[5px] rounded-full shrink-0 ${isKnown ? 'bg-[#298dff]' : 'bg-[#f5a623]'}`} />
        <span className={`text-[9px] tracking-[0.08em] uppercase ${isKnown ? 'text-[#298dff]' : 'text-[#f5a623]'}`} style={mono}>
          {isKnown ? 'Verified' : 'Unverified'}
        </span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-[220px]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0
          border-l-[5px] border-l-transparent
          border-r-[5px] border-r-transparent
          border-t-[5px] border-t-[#1e2026]"
        />
        <div className={`bg-[#0d0e10] border p-3 flex flex-col gap-1 ${isKnown ? 'border-[#1e2026]' : 'border-[#f5a623]/20]'}`}>
          {isKnown ? (
            <>
              <span className="text-[10px] text-[#298dff] font-medium" style={mono}>Recognized protocol</span>
              <span className="text-[10px] text-[#6c7584] leading-[1.4]" style={mono}>
                This contract matches a known DeFi protocol on Sui.
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-[#f5a623] font-medium" style={mono}>Unverified contract</span>
              <span className="text-[10px] text-[#6c7584] leading-[1.4]" style={mono}>
                This contract isn't in our list of known protocols. Double-check the address before trusting it.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── WalletCard ────────────────────────────────────────────────────────────────

function WalletCard({ label, isError, content, linkUrl, roleLabel, trust, t }: {
  label: string
  isError: boolean
  content: CardContent
  linkUrl?: string
  roleLabel: string
  trust?: TrustLevel
  t: ReturnType<typeof useT>['t']
}) {
  const borderCls  = isError ? 'border-[#ff2937]' : 'border-[#298dff]'
  const labelColor = isError ? 'text-[#ff2937]' : 'text-[#298dff]'
  const letter     = label.replace('Wallet ', '')

  return (
    <div
      className={`bg-[#18191c] border ${borderCls} flex flex-col gap-2 items-center justify-center p-4 relative w-full max-w-[300px] md:w-[225px] md:max-w-none`}
    >
      {/* Role label */}
      <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>
        {roleLabel}
      </span>

      {/* Trust badge — only for contracts/protocols */}
      {trust && trust !== 'wallet' && <ContractTrustBadge trust={trust} />}

      {/* Label — clickable if linkUrl provided */}
      {linkUrl ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[12px] text-center tracking-[-0.16px] leading-[20.8px] underline hover:opacity-70 transition-opacity ${labelColor}`}
          style={mono}
        >
          {label} ↗
        </a>
      ) : (
        <span className={`text-[12px] text-center tracking-[-0.16px] leading-[20.8px] ${labelColor}`} style={mono}>
          {label}
        </span>
      )}

      {/* Icon */}
      {content.type === 'token' ? (
        <div className="relative size-[44px] shrink-0">
          <img alt="" className="block w-full h-full object-contain" src={imgToken} />
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '57.69px', top: '19px', width: '17.96px', height: '17.3px',
              transform: content.direction === 'out' ? 'rotate(-30deg)' : 'rotate(150deg) scaleY(-1)',
            }}
          >
            <img
              alt=""
              className="block w-[13.8px] h-[12px] object-contain"
              src={content.direction === 'out' ? imgCardArrowOut : imgCardArrowIn}
            />
          </div>
        </div>
      ) : content.type === 'protocol' ? (
        <div className="relative size-[44px] shrink-0">
          <img alt="" className="block w-full h-full object-contain" src={imgContract} />
        </div>
      ) : content.type === 'failed' ? (
        <div className="relative size-[44px] shrink-0">
          <img alt="" className="block w-full h-full object-contain" src={imgFailIcon} />
        </div>
      ) : (
        <div className="relative size-[44px] shrink-0">
          <img alt="" className="absolute inset-0 w-full h-full object-contain" src={imgWallet} />
          {/* Only show the letter for simple wallet cards, not protocol-interaction ones */}
          {letter && content.type !== 'wallet-action' && (
            <span
              className={`absolute bottom-0 left-[11px] text-[13.8px] font-bold tracking-[-0.69px] leading-none ${labelColor}`}
              style={{ fontFamily: "'TWK Everett', sans-serif" }}
            >
              {letter}
            </span>
          )}
        </div>
      )}

      {/* ── Content ── */}

      {content.type === 'objects' && (
        <>
          <div className="h-[32px] w-[111px] relative shrink-0">
            <img alt="" className="absolute block w-full h-full object-contain" src={imgObjects} />
          </div>
          <span className="text-[10px] text-[#a1a7b2] text-center leading-[1.3]" style={mono}>
            <span className="underline">{t.cardObjectsCreated(content.count)}</span>
          </span>
        </>
      )}

      {content.type === 'nfts' && (
        <>
          <div className="flex gap-2 items-center justify-center flex-wrap">
            {Array.from({ length: Math.min(content.count, 4) }).map((_, i) => (
              <div key={i} className="relative overflow-hidden size-[32px]">
                <img alt="NFT" className="block w-full h-full object-contain" src={imgNFT} />
              </div>
            ))}
          </div>
          <span className="text-[10px] text-[#a1a7b2] text-center leading-[1.3]" style={mono}>
            <span className="underline">{t.cardNftsReceived(content.count)}</span>
          </span>
        </>
      )}

      {content.type === 'token' && (
        <span className="text-[10px] text-[#a1a7b2] text-center leading-[1.3]" style={mono}>
          {content.direction === 'out' ? t.cardSends : t.cardReceives}{' '}
          <span className="underline">{content.formattedAmount} {content.symbol}</span>{' '}
          <span className="underline">↗</span>
        </span>
      )}

      {content.type === 'wallet-action' && (
        <>
          <div className="bg-[rgba(41,141,255,0.5)] rounded-[48px] px-3 py-1 shrink-0 max-w-full">
            <span className="text-[10px] text-white tracking-[-0.16px] leading-[1.3] block truncate max-w-[180px]" style={mono}>
              {content.actionLabel}
            </span>
          </div>
        </>
      )}

      {content.type === 'protocol' && (
        <>
          <span className="text-[10px] text-white text-center leading-[1.3] font-medium" style={mono}>
            {content.name}
          </span>
          <span className="text-[10px] text-[#a1a7b2] text-center leading-[1.3]" style={mono}>
            <span className="underline">{content.outcomeText}</span>{' '}
            <span className="underline">↗</span>
          </span>
          {content.steps !== undefined && content.steps > 1 && (
            <span className="text-[9px] text-[#6c7584] text-center leading-[1.3]" style={mono}>
              {t.stepsCount(content.steps)}
            </span>
          )}
        </>
      )}

      {content.type === 'failed' && (
        <span className="text-[10px] text-[#a1a7b2] text-center leading-[1.3] mt-auto pb-1" style={mono}>
          {t.cardTxFailed}
        </span>
      )}
    </div>
  )
}

// ── OutcomeRow: net balance changes shown below the diagram ───────────────────

function OutcomeRow({ changes }: { changes: NetBalanceChange[] }) {
  const { t } = useT()
  if (changes.length === 0) return null

  // Separate gas (small SUI outflow) from meaningful changes
  const gasChange = changes.find(
    c => c.symbol === 'SUI' && c.direction === 'out' && Number(c.rawAmount) / -1e9 < 0.1
  )
  const meaningful = changes.filter(c => c !== gasChange)

  return (
    <div className="flex flex-col items-center gap-2">
      {meaningful.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-[11px] text-[#6c7584]" style={mono}>{t.netResult}</span>
          {meaningful.map((c, i) => {
            const isGain = c.direction === 'in'
            return (
              <div
                key={i}
                className={`px-3 py-1 border text-[11px] ${isGain ? 'border-[#298dff] text-[#298dff]' : 'border-[#6c7584] text-[#a1a7b2]'}`}
                style={mono}
              >
                {isGain ? '+' : '-'}{c.formattedAmount} {c.symbol}
              </div>
            )
          })}
        </div>
      )}
      {gasChange && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6c7584]" style={mono}>
            {t.gasFee} {gasChange.formattedAmount} SUI
          </span>
        </div>
      )}
    </div>
  )
}

// ── StepsBreakdown: for multi-step transactions ───────────────────────────────

function StepsBreakdown({
  steps,
  transaction,
}: {
  steps: string[]
  transaction: ParsedTransaction
}) {
  const { t } = useT()
  return (
    <div className="w-full border border-[#1e2026] bg-[#0d0e10] p-4 flex flex-col gap-2">
      <span className="text-[11px] text-[#6c7584] uppercase tracking-widest" style={mono}>
        {t.stepByStep}
      </span>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 items-start">
          <span className="text-[10px] text-[#298dff] shrink-0 mt-[2px]" style={mono}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-[11px] text-[#a1a7b2] leading-[1.5]" style={mono}>
            <ExplanationText text={step} transaction={transaction} />
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const { t } = useT()
  return (
    <div className="bg-black px-6 sm:px-12 md:px-[80px] lg:px-[120px] py-6 flex flex-col gap-6 items-start">
      <div className="flex gap-2 items-center">
        {[imgLinkedIn, imgTwitterX].map((src, i) => (
          <div key={i} className="bg-[#6c7584] flex items-center justify-center p-[7px] size-[32px] shrink-0">
            <img alt="" className="block w-full h-full object-contain" src={src} />
          </div>
        ))}
      </div>
      <p className="text-[#6c7584] text-[13px] leading-[16.25px] whitespace-nowrap" style={{ fontFamily: 'Arial, sans-serif' }}>
        {t.footer}
      </p>
    </div>
  )
}

// ── Diagram builder ───────────────────────────────────────────────────────────

const SUISCAN = 'https://suiscan.xyz/mainnet'

type TrustLevel = 'known' | 'unknown' | 'wallet'

type DiagramSpec = {
  senderContent: CardContent
  receiverContent: CardContent
  receiverLabel: string
  arrowSrc: string
  senderLink: string
  receiverLink?: string
  receiverRole: 'recipient' | 'protocol' | 'contract' | 'same'
  receiverTrust?: TrustLevel
}

function buildDiagram(tx: ParsedTransaction): DiagramSpec {
  const wallets = Array.from(tx.userAddressMap.entries())
  const senderEntry = wallets.find(([, addr]) => addr === tx.sender) ?? wallets[0]
  const senderLabel = senderEntry?.[0] ?? 'Wallet A'
  const otherLabels = wallets.filter(([l]) => l !== senderLabel).map(([l]) => l)

  const senderLink = `${SUISCAN}/account/${tx.sender}`

  // Helper: link to a package/object on SuiScan
  const packageLink = (pkg?: string) =>
    pkg ? `${SUISCAN}/object/${pkg}` : undefined

  // Helper: link to a wallet address on SuiScan
  const walletLink = (label: string) => {
    const addr = tx.userAddressMap.get(label)
    return addr ? `${SUISCAN}/account/${addr}` : undefined
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (!tx.success) {
    return {
      senderContent: { type: 'failed' },
      receiverContent: { type: 'failed' },
      receiverLabel: otherLabels[0] ?? 'Wallet B',
      arrowSrc: imgArrow,
      senderLink,
      receiverRole: 'recipient',
    }
  }

  // ── Arbitrage ─────────────────────────────────────────────────────────────
  if (tx.category === 'arbitrage') {
    const swapCount = tx.events.filter(e =>
      e.eventName.toLowerCase().includes('swap')
    ).length
    const arbModule = tx.packageCalls[0]?.module ?? ''
    return {
      senderContent: { type: 'wallet-action', actionLabel: `${swapCount}-swap arbitrage` },
      receiverContent: {
        type: 'protocol',
        name: tx.narrative.headline,
        outcomeText: tx.narrative.outcome,
        steps: tx.narrative.steps?.length,
      },
      receiverLabel: 'Flash Loan Protocol',
      arrowSrc: imgContractArrow,
      senderLink,
      receiverLink: packageLink(tx.packageCalls[0]?.package),
      receiverRole: 'protocol',
      receiverTrust: isKnownProtocol(arbModule) ? 'known' : 'unknown',
    }
  }

  // ── Flash loan ────────────────────────────────────────────────────────────
  if (tx.category === 'flash-loan') {
    const call = tx.packageCalls[0]
    const protocolName = call ? humanizeModuleName(call.module) : 'Flash Loan Protocol'
    return {
      senderContent: { type: 'wallet-action', actionLabel: 'flash loan' },
      receiverContent: { type: 'protocol', name: protocolName, outcomeText: 'borrows and repays' },
      receiverLabel: protocolName,
      arrowSrc: imgContractArrow,
      senderLink,
      receiverLink: packageLink(call?.package),
      receiverRole: 'protocol',
      receiverTrust: call ? (isKnownProtocol(call.module) ? 'known' : 'unknown') : 'unknown',
    }
  }

  // ── Swap ──────────────────────────────────────────────────────────────────
  if (tx.category === 'swap') {
    const outChange = tx.netBalanceChanges.find(c => c.direction === 'out' && c.symbol !== 'SUI')
      ?? tx.netBalanceChanges.find(c => c.direction === 'out')
    const inChange = tx.netBalanceChanges.find(c => c.direction === 'in')
    const dexEvent = tx.events.find(e => e.eventName.toLowerCase().includes('swap'))
    const dexLabel = dexEvent ? humanizeModuleName(dexEvent.module) : 'DEX'
    const swapModule = dexEvent?.module ?? tx.packageCalls[0]?.module ?? ''

    return {
      senderContent: outChange
        ? { type: 'token', formattedAmount: outChange.formattedAmount, symbol: outChange.symbol, direction: 'out' }
        : { type: 'wallet-action', actionLabel: 'token swap' },
      receiverContent: inChange
        ? { type: 'token', formattedAmount: inChange.formattedAmount, symbol: inChange.symbol, direction: 'in' }
        : { type: 'protocol', name: dexLabel, outcomeText: 'swap executed' },
      receiverLabel: dexLabel,
      arrowSrc: imgTokenArrow,
      senderLink,
      receiverLink: packageLink(tx.packageCalls[0]?.package),
      receiverRole: 'protocol',
      receiverTrust: isKnownProtocol(swapModule) ? 'known' : 'unknown',
    }
  }

  // ── Coin / token transfer ─────────────────────────────────────────────────
  if (tx.category === 'coin-transfer') {
    const outChange = tx.netBalanceChanges.find(c => c.direction === 'out')
    const inChange  = tx.netBalanceChanges.find(c => c.direction === 'in')
    const symbol = outChange?.symbol ?? 'SUI'
    const amount = outChange?.formattedAmount ?? '?'
    const receiverWalletLabel = otherLabels[0] ?? 'Wallet B'

    return {
      senderContent:   { type: 'token', formattedAmount: amount, symbol, direction: 'out' },
      receiverContent: { type: 'token', formattedAmount: inChange?.formattedAmount ?? amount, symbol: inChange?.symbol ?? symbol, direction: 'in' },
      receiverLabel: receiverWalletLabel,
      arrowSrc: imgTokenArrow,
      senderLink,
      receiverLink: walletLink(receiverWalletLabel),
      receiverRole: 'recipient',
    }
  }

  // ── NFT transfer ──────────────────────────────────────────────────────────
  if (tx.category === 'nft-transfer') {
    const nfts = tx.objectsTransferred.filter(o => o.isNFT)
    const receiverWalletLabel = otherLabels[0] ?? 'Wallet B'
    return {
      senderContent:   { type: 'objects', count: tx.objectsMutated.length || 1 },
      receiverContent: { type: 'nfts', count: nfts.length },
      receiverLabel: receiverWalletLabel,
      arrowSrc: imgArrow,
      senderLink,
      receiverLink: walletLink(receiverWalletLabel),
      receiverRole: 'recipient',
    }
  }

  // ── NFT mint ──────────────────────────────────────────────────────────────
  if (tx.category === 'nft-mint') {
    const nfts = tx.objectsCreated.filter(o => o.isNFT)
    return {
      senderContent:   { type: 'objects', count: tx.objectsCreated.length },
      receiverContent: { type: 'nfts', count: nfts.length },
      receiverLabel: senderLabel,
      arrowSrc: imgArrow,
      senderLink,
      receiverRole: 'same',
    }
  }

  // ── Generic contract call ─────────────────────────────────────────────────
  if (tx.category === 'contract-call') {
    const calls = tx.commands.filter(c => c.commandType === 'MoveCall')
    const firstCall = calls[0]
    const protocol = firstCall ? humanizeModuleName(firstCall.module ?? '') : 'Contract'
    const typeText = firstCall?.typeSymbols?.length
      ? firstCall.typeSymbols.join(' → ')
      : tx.narrative.outcome
    const contractModule = firstCall?.module ?? ''

    return {
      senderContent: {
        type: 'wallet-action',
        actionLabel: firstCall ? humanizeFunctionName(firstCall.function ?? '') : 'contract call',
      },
      receiverContent: {
        type: 'protocol',
        name: protocol,
        outcomeText: typeText,
        steps: calls.length > 1 ? calls.length : undefined,
      },
      receiverLabel: protocol,
      arrowSrc: imgContractArrow,
      senderLink,
      receiverLink: packageLink(firstCall?.package),
      receiverRole: 'contract',
      receiverTrust: isKnownProtocol(contractModule) ? 'known' : 'unknown',
    }
  }

  // ── Object creation ───────────────────────────────────────────────────────
  if (tx.category === 'object-creation') {
    return {
      senderContent:   { type: 'objects', count: tx.objectsCreated.length },
      receiverContent: { type: 'empty' },
      receiverLabel: senderLabel,
      arrowSrc: imgArrow,
      senderLink,
      receiverRole: 'same',
    }
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return {
    senderContent:   { type: 'empty' },
    receiverContent: { type: 'empty' },
    receiverLabel: otherLabels[0] ?? 'Wallet B',
    arrowSrc: imgArrow,
    senderLink,
    receiverRole: 'recipient',
  }
}

// ── Helper: decide which categories should show the outcome row ───────────────
function showOutcomeRow(category: TransactionCategory): boolean {
  return ['arbitrage', 'swap', 'flash-loan', 'liquidity', 'staking', 'bridge', 'coin-transfer'].includes(category)
}

// ── Helper: decide which categories should show the steps breakdown ───────────
function showSteps(category: TransactionCategory): boolean {
  return ['arbitrage', 'swap', 'contract-call'].includes(category)
}

// ── Local helpers (mirror of service helpers for display-side use) ─────────────
function humanizeModuleName(moduleName: string): string {
  const lower = moduleName.toLowerCase()
  const known: [string, string][] = [
    ['cetus_clmm', 'Cetus DEX'], ['cetus', 'Cetus DEX'], ['turbos', 'Turbos DEX'],
    ['kriya', 'Kriya DEX'], ['deepbook', 'DeepBook DEX'], ['aftermath', 'Aftermath Finance'],
    ['flashloan', 'Flash Loan Protocol'], ['flash_loan', 'Flash Loan Protocol'],
    ['pool', 'Liquidity Pool'], ['router', 'DEX Router'],
    ['lending', 'Lending Protocol'], ['borrow', 'Borrowing Protocol'],
    ['dex', 'DEX'], ['swap', 'Swap Protocol'], ['amm', 'AMM Protocol'],
    ['market', 'Marketplace'], ['staking', 'Staking Protocol'], ['stake', 'Staking Protocol'],
    ['vault', 'Vault Protocol'], ['bridge', 'Bridge Protocol'],
    ['governance', 'Governance Contract'], ['nft', 'NFT Contract'],
  ]
  for (const [key, label] of known) {
    if (lower.includes(key)) return label
  }
  return humanizeFunctionName(moduleName) + ' Contract'
}

function humanizeFunctionName(fnName: string): string {
  return fnName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// ── Timestamp helper ──────────────────────────────────────────────────────────

const LOCALE_MAP: Record<Language, string> = { en: 'en-US', 'pt-BR': 'pt-BR', es: 'es' }

function useTimestamp(ts: number | undefined) {
  const { t, language } = useT()
  if (!ts) return null

  const date = new Date(ts)
  const diffSec = Math.floor((Date.now() - ts) / 1000)
  let relative: string
  if (diffSec < 60) relative = t.tsJustNow
  else if (diffSec < 3600) relative = t.tsMinAgo(Math.floor(diffSec / 60))
  else if (diffSec < 86400) relative = t.tsHoursAgo(Math.floor(diffSec / 3600))
  else relative = t.tsDaysAgo(Math.floor(diffSec / 86400))

  const absolute = date.toLocaleString(LOCALE_MAP[language], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC', timeZoneName: 'short',
  })

  return { absolute, relative }
}

// ── Confidence badge ──────────────────────────────────────────────────────────

const CONFIDENCE_ALL = ['high', 'partial', 'complex'] as const

function ConfidenceBadge({ level }: { level: 'high' | 'partial' | 'complex' }) {
  const { t } = useT()

  const cfg = {
    high:    { label: t.confidenceHigh,    desc: t.confidenceHighDesc,    dot: 'bg-[#298dff]',      text: 'text-[#298dff]',      border: 'border-[#298dff]/30',    row: 'text-[#298dff]' },
    partial: { label: t.confidencePartial, desc: t.confidencePartialDesc, dot: 'bg-[#6c7584]',      text: 'text-[#6c7584]',      border: 'border-[#6c7584]/30',    row: 'text-[#6c7584]' },
    complex: { label: t.confidenceComplex, desc: t.confidenceComplexDesc, dot: 'bg-[#a1a7b2]/50',   text: 'text-[#a1a7b2]',      border: 'border-[#a1a7b2]/20',    row: 'text-[#a1a7b2]/70' },
  }

  const active = cfg[level]

  return (
    <div className="relative group cursor-default">
      {/* Badge */}
      <div className={`flex items-center gap-2 px-3 py-1 border ${active.border}`}>
        <div className={`size-[5px] rounded-full shrink-0 ${active.dot}`} />
        <span className={`text-[10px] tracking-[-0.16px] ${active.text}`} style={mono}>
          {active.label}
        </span>
      </div>

      {/* Tooltip — appears on hover, positioned above */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-[260px] sm:w-[280px]">
        {/* Arrow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0
          border-l-[6px] border-l-transparent
          border-r-[6px] border-r-transparent
          border-t-[6px] border-t-[#1e2026]"
        />
        <div className="bg-[#0d0e10] border border-[#1e2026] p-4 flex flex-col gap-3">
          <span className="text-[10px] text-[#6c7584] uppercase tracking-widest" style={mono}>
            Interpretation quality
          </span>
          {CONFIDENCE_ALL.map(lvl => (
            <div key={lvl} className="flex gap-3 items-start">
              <div className={`mt-[5px] size-[5px] rounded-full shrink-0 ${cfg[lvl].dot}`} />
              <div className="flex flex-col gap-[2px]">
                <span className={`text-[11px] font-medium leading-none ${lvl === level ? cfg[lvl].row : 'text-[#6c7584]'}`} style={mono}>
                  {cfg[lvl].label}
                </span>
                <span className="text-[10px] text-[#6c7584] leading-[1.4]" style={mono}>
                  {cfg[lvl].desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TransactionDisplay({
  transaction,
  onNewTransaction,
  onError,
}: {
  transaction: ParsedTransaction
  onNewTransaction: (digest: string) => void
  onError: (msg: string) => void
}) {
  const { t } = useT()
  const wallets = Array.from(transaction.userAddressMap.entries())
  const senderEntry = wallets.find(([, addr]) => addr === transaction.sender) ?? wallets[0]
  const senderLabel = senderEntry?.[0] ?? 'Wallet A'

  const { senderContent, receiverContent, receiverLabel, arrowSrc, senderLink, receiverLink, receiverRole, receiverTrust } = buildDiagram(transaction)

  const steps = transaction.narrative.steps
  const hasSteps = steps && steps.length > 1 && showSteps(transaction.category)
  const shortDigest = `${transaction.digest.slice(0, 6)}...${transaction.digest.slice(-4)}`
  const timestamp = useTimestamp(transaction.timestamp)

  const roleLabel = (role: DiagramSpec['receiverRole']) => {
    if (role === 'recipient') return t.roleRecipient
    if (role === 'protocol') return t.roleProtocol
    if (role === 'contract') return t.roleContract
    return t.roleSender
  }

  return (
    <div className="w-[1000px] max-w-full px-3 sm:px-6 flex flex-col items-center gap-6">

      {/* ── Explain another transaction ─────────────────────────────────────── */}
      <div className="w-full border border-[#1e2026] bg-[#0d0e10]">
        <TransactionInput onSubmit={onNewTransaction} onError={onError} loading={false} />
      </div>

      {/* ── Narrative explanation ────────────────────────────────────────────── */}
      <p className="text-white text-[14px] text-center leading-[20.8px] tracking-[-0.16px]" style={mono}>
        <ExplanationText text={transaction.narrative.what} transaction={transaction} />
      </p>

      {/* ── Diagram ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-stretch justify-center py-4 w-full">
        <WalletCard
          label={senderLabel}
          isError={!transaction.success}
          content={senderContent}
          linkUrl={senderLink}
          roleLabel={t.roleSender}
          t={t}
        />

        {/* Arrow — rotated vertically on mobile, horizontal on desktop */}
        <div className={`shrink-0 flex items-center justify-center ${
          transaction.success
            ? 'w-[26px] h-[26px] md:w-[65px] md:h-[26px] md:self-center'
            : 'w-[26px] h-[26px] md:self-center'
        }`}>
          <img
            alt=""
            className={`block w-full h-full object-contain ${
              transaction.success ? 'rotate-90 md:rotate-0' : 'rotate-90'
            }`}
            src={transaction.success ? arrowSrc : imgFailIcon}
          />
        </div>

        <WalletCard
          label={receiverLabel}
          isError={!transaction.success}
          content={receiverContent}
          linkUrl={receiverLink}
          roleLabel={roleLabel(receiverRole)}
          trust={receiverTrust}
          t={t}
        />
      </div>

      {/* ── Transaction meta row (link + timestamp + confidence) ─────────────── */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <a
          href={`${SUISCAN}/tx/${transaction.digest}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#6c7584] hover:text-[#a1a7b2] transition-colors tracking-[-0.16px]"
          style={mono}
        >
          {t.txLink(shortDigest)}
        </a>

        {timestamp && (
          <>
            <span className="text-[#1e2026] text-[10px]">·</span>
            <span
              className="text-[11px] text-[#6c7584] tracking-[-0.16px]"
              style={mono}
              title={timestamp.absolute}
            >
              {timestamp.relative}
            </span>
            <span className="hidden sm:inline text-[#1e2026] text-[10px]">·</span>
            <span className="hidden sm:inline text-[11px] text-[#6c7584] tracking-[-0.16px]" style={mono}>
              {timestamp.absolute}
            </span>
          </>
        )}

        <ConfidenceBadge level={transaction.confidence} />
      </div>

      {/* ── Outcome row (net balance changes) ────────────────────────────────── */}
      {showOutcomeRow(transaction.category) && transaction.netBalanceChanges.length > 0 && (
        <OutcomeRow changes={transaction.netBalanceChanges} />
      )}

      {/* ── Step-by-step breakdown ────────────────────────────────────────────── */}
      {hasSteps && (
        <StepsBreakdown steps={steps!} transaction={transaction} />
      )}

      {/* ── Follow-up prompt ─────────────────────────────────────────────────── */}
      <p className="text-white text-[14px] text-center leading-[20.8px] tracking-[-0.16px]" style={mono}>
        {t.followUpPrompt}
      </p>

      <div className="w-full h-[54px] flex items-center justify-center px-6">
        <input
          type="text"
          placeholder={t.followUpPlaceholder}
          className="w-full bg-transparent border-none outline-none text-center text-[14px] text-[#6c7584] placeholder-[#6c7584] caret-[#298dff] tracking-[-0.16px]"
          style={mono}
        />
      </div>
    </div>
  )
}

export function TransactionResultFooter() {
  return <Footer />
}
