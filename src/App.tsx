import { useState, useRef, useEffect } from 'react'
import { TransactionInput } from './components/TransactionInput'
import { TransactionDisplay, TransactionResultFooter } from './components/TransactionDisplay'
import { fetchTransactionDetails } from './services/suiService'
import { ParsedTransaction } from './types/transaction'
import { ChevronDown } from 'lucide-react'
import {
  Language,
  LanguageContext,
  LANGUAGE_LABELS,
  allTranslations,
  useT,
} from './i18n'

// Figma assets — valid for 7 days; replace with permanent hosted assets
const imgSuiLogoMask = 'https://www.figma.com/api/mcp/asset/79e64386-46d2-44cd-8d06-77911c820ee0'
const imgSuiLogo = 'https://www.figma.com/api/mcp/asset/152f6d89-1a01-439d-91cb-61ecbe5a36dc'

// ── Animated dot grid background ─────────────────────────────────────────────
function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const GAP = 22       // px between dot centres
    const R   = 1.2      // dot radius
    const GRAY  = 'rgba(108, 117, 132, 0.35)'
    const BLUE  = [41, 141, 255] as const

    // key → current alpha (1 → 0 as it fades)
    const live = new Map<string, number>()

    let frame: number
    let lastSpawn = 0

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = (ts: number) => {
      const cols = Math.ceil(canvas.width  / GAP) + 1
      const rows = Math.ceil(canvas.height / GAP) + 1

      // Spawn 1-4 new blue dots every ~500 ms (+30% more dots)
      if (ts - lastSpawn > 500) {
        const n = Math.floor(Math.random() * 4) + 2
        for (let i = 0; i < n; i++) {
          const c = Math.floor(Math.random() * cols)
          const r = Math.floor(Math.random() * rows)
          live.set(`${c},${r}`, 1)
        }
        lastSpawn = ts
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * GAP
          const y = r * GAP
          const key = `${c},${r}`
          const alpha = live.get(key)

          ctx.beginPath()
          ctx.arc(x, y, R, 0, Math.PI * 2)

          if (alpha !== undefined) {
            ctx.fillStyle = `rgba(${BLUE[0]},${BLUE[1]},${BLUE[2]},${alpha})`
            const next = alpha - 0.0015   // ~11 s fade at 60 fps
            next <= 0 ? live.delete(key) : live.set(key, next)
          } else {
            ctx.fillStyle = GRAY
          }

          ctx.fill()
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

function SuiLogo() {
  return (
    <div className="h-[32.557px] overflow-hidden relative w-[63.14px] shrink-0">
      <div
        className="absolute inset-0"
        style={{
          maskImage: `url('${imgSuiLogoMask}')`,
          WebkitMaskImage: `url('${imgSuiLogoMask}')`,
          maskSize: '62.3px 32.557px',
          WebkitMaskSize: '62.3px 32.557px',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: '0px 0px',
          WebkitMaskPosition: '0px 0px',
        }}
      >
        <img alt="Sui" className="absolute block w-full h-full object-cover" src={imgSuiLogo} />
      </div>
    </div>
  )
}

// ── DocsSidePanel ─────────────────────────────────────────────────────────────

const mono = { fontFamily: "'DM Mono', monospace" }

function DocsSidePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[400px] max-w-[100vw] z-50 bg-[#0d0e10] border-l border-[#1e2026] flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Panel header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#1e2026] shrink-0">
          <div className="flex flex-col gap-[3px]">
            <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.15em]" style={mono}>
              Documentation
            </span>
            <span className="text-[14px] text-white" style={mono}>
              How the explainer works
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#6c7584] hover:text-white transition-colors text-[18px] leading-none mt-[2px]"
            aria-label="Close docs"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e2026]">

          {/* About */}
          <div className="px-6 py-6 flex flex-col gap-3">
            <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>About</span>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>
              Transaction Explainer reads raw on-chain data from Sui mainnet and translates it into plain language — no blockchain knowledge required.
            </p>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>
              Paste any transaction digest or a full explorer URL from SuiScan, SuiVision, or Sui Explorer. The tool fetches the transaction, classifies what happened, and generates a step-by-step explanation backed entirely by on-chain events.
            </p>
            <p className="text-[12px] text-[#6c7584] leading-[1.7]" style={mono}>
              No signup. No wallet connection. Read-only.
            </p>
          </div>

          {/* Interpretation quality */}
          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>Interpretation quality</span>
              <span className="text-[12px] text-[#a1a7b2] leading-[1.6]" style={mono}>
                Every result shows how completely the explanation was reconstructed from on-chain events.
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {([
                {
                  dot: 'bg-[#298dff]',
                  label: 'High confidence',
                  desc: 'All steps were identified from on-chain events. The explanation is a direct read of what happened.',
                },
                {
                  dot: 'bg-[#6c7584]',
                  label: 'Partial interpretation',
                  desc: 'Most steps are identified. Some details (token amounts, protocol names) may be simplified or inferred.',
                },
                {
                  dot: 'bg-[#a1a7b2]/50',
                  label: 'Complex transaction',
                  desc: "The transaction involves patterns the tool couldn't fully decode. The explanation covers what was visible.",
                },
              ] as const).map(({ dot, label, desc }) => (
                <div key={label} className="flex gap-3 items-start">
                  <div className={`mt-[5px] size-[5px] rounded-full shrink-0 ${dot}`} />
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#a1a7b2] font-medium leading-none" style={mono}>{label}</span>
                    <span className="text-[11px] text-[#6c7584] leading-[1.5]" style={mono}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract verification */}
          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>Contract verification</span>
              <span className="text-[12px] text-[#a1a7b2] leading-[1.6]" style={mono}>
                When a transaction interacts with a smart contract, the receiver card shows a trust badge.
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {([
                {
                  dot: 'bg-[#298dff]',
                  label: 'Verified',
                  desc: "The contract's module name matches a known Sui DeFi protocol — Cetus, DeepBook, Turbos, Kriya, Aftermath, and others.",
                },
                {
                  dot: 'bg-[#f5a623]',
                  label: 'Unverified',
                  desc: "Not in the known-protocol list. It may be legitimate but isn't recognized. Always verify the package address on SuiScan before trusting it with funds.",
                },
              ] as const).map(({ dot, label, desc }) => (
                <div key={label} className="flex gap-3 items-start">
                  <div className={`mt-[5px] size-[5px] rounded-full shrink-0 ${dot}`} />
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#a1a7b2] font-medium leading-none" style={mono}>{label}</span>
                    <span className="text-[11px] text-[#6c7584] leading-[1.5]" style={mono}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#6c7584]/60 leading-[1.5] border-t border-[#1e2026] pt-4" style={mono}>
              Verification is name-based — not a security audit. A verified badge means the module matches a known name pattern, not that the contract is bug-free or safe.
            </p>
          </div>

        </div>

        {/* Panel footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[#1e2026]">
          <p className="text-[10px] text-[#6c7584]/50" style={mono}>
            ©2026 Kmino · Data from Sui mainnet public RPC
          </p>
        </div>
      </div>
    </>
  )
}

function AppInner() {
  const { t, language, setLanguage } = useT()
  const [transaction, setTransaction] = useState<ParsedTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentDigest, setCurrentDigest] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)

  const handleFetchTransaction = async (digest: string) => {
    setLoading(true)
    setError(null)
    setTransaction(null)
    setCurrentDigest(digest)

    try {
      if (!digest || digest.length < 32) {
        throw new Error('Invalid transaction digest format')
      }
      const txData = await fetchTransactionDetails(digest, language)
      setTransaction(txData)
    } catch (err) {
      console.error('Transaction fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated dot grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <DotBackground />
      </div>

      {/* Navbar */}
      <div className="relative z-50 p-5">
        <nav className="backdrop-blur-[6px] bg-[#131518] flex items-center justify-between px-4 sm:px-10 md:px-[60px] lg:px-[100px] py-[11.5px]">
          <SuiLogo />
          <span
            className="hidden sm:block text-white text-[17px] md:text-[20px] font-bold tracking-wide"
            style={{ fontFamily: "'TWK Everett', sans-serif" }}
          >
            {t.appTitle}
          </span>
          {/* Right controls */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* Docs */}
            <button
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => { setDocsOpen(o => !o); setLangOpen(false) }}
            >
              <span
                className={`text-[13px] sm:text-[16px] transition-colors ${docsOpen ? 'text-[#298dff]' : 'text-white'}`}
                style={mono}
              >
                Docs
              </span>
            </button>

            {/* Language switcher */}
            <div className="relative">
              <button
                className="flex items-center gap-1 sm:gap-2 cursor-pointer"
                onClick={() => { setLangOpen(o => !o); setDocsOpen(false) }}
              >
                <span
                  className="text-white text-[13px] sm:text-[16px]"
                  style={mono}
                >
                  {LANGUAGE_LABELS[language]}
                </span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-[#131518] border border-[#1e2026] z-50 min-w-[160px]">
                  {(Object.keys(LANGUAGE_LABELS) as Language[]).map(lang => (
                    <button
                      key={lang}
                      className={`w-full text-left px-4 py-2 text-[14px] hover:bg-[#1e2026] transition-colors ${lang === language ? 'text-[#298dff]' : 'text-white'}`}
                      style={mono}
                      onClick={() => { setLanguage(lang); setLangOpen(false) }}
                    >
                      {LANGUAGE_LABELS[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-[calc(100vh-76px)]">
        {/* Empty state: centered input */}
        {!loading && !error && !transaction && (
          <div className="flex items-center justify-center min-h-[calc(100vh-76px)]">
            <div className="w-[1000px] max-w-full px-6">
              <TransactionInput
                onSubmit={handleFetchTransaction}
                onError={setError}
                loading={false}
              />
            </div>
          </div>
        )}

        {/* Loading state: centered message + dots */}
        {loading && (
          <div className="flex items-center justify-center min-h-[calc(100vh-76px)]">
            <div className="flex flex-col items-center gap-4 w-[1000px] max-w-full px-6">
              <p
                className="text-[#298dff] text-[14px] text-center leading-[20.8px] tracking-[-0.16px]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {t.loading(currentDigest)}<br />
                {t.loadingWait}
              </p>
              <div className="flex gap-2 items-center h-[10px]">
                <div className="bg-[#298dff] size-[10px] animate-bounce [animation-delay:0ms]" />
                <div className="bg-[#298dff] size-[10px] animate-bounce [animation-delay:150ms]" />
                <div className="bg-[#298dff] size-[10px] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[calc(100vh-76px)]">
            <div className="flex flex-col items-center gap-6 w-[1000px] max-w-full px-6">
              <TransactionInput
                onSubmit={handleFetchTransaction}
                onError={setError}
                loading={false}
              />
              <div className="p-6 bg-red-900/50 border-2 border-red-700 rounded-xl backdrop-blur-md w-full">
                <p className="text-red-200 text-lg text-center">
                  <strong>Error:</strong> {error}
                </p>
                <p className="text-red-300 text-sm text-center mt-3">
                  {t.errorHint}
                </p>
                {(error.includes('timeout') || error.includes('slow')) && (
                  <div className="mt-4 p-3 bg-red-800/30 rounded-lg">
                    <p className="text-red-200 text-sm font-medium">{t.errorTipsTitle}</p>
                    <ul className="text-red-300 text-xs mt-2 space-y-1">
                      <li>• {t.tipWait}</li>
                      <li>• {t.tipNetwork}</li>
                      <li>• {t.tipCheck}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction result */}
        {transaction && !loading && (
          <div className="flex items-start justify-center py-6 md:py-10">
            <TransactionDisplay
              transaction={transaction}
              onNewTransaction={handleFetchTransaction}
              onError={setError}
            />
          </div>
        )}
      </div>

      {/* Footer — shown only after a result */}
      {transaction && !loading && <TransactionResultFooter />}

      {/* Docs side panel */}
      <DocsSidePanel open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  )
}

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const t = allTranslations[language]
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <AppInner />
    </LanguageContext.Provider>
  )
}

export default App
