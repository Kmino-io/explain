import { useState, useRef, useEffect } from 'react'
import { TransactionInput } from './components/TransactionInput'
import { TransactionDisplay, TransactionResultFooter } from './components/TransactionDisplay'
import { fetchTransaction } from './services/chainRouter'
import { ParsedTransaction } from './types/transaction'
import { ChevronDown } from 'lucide-react'
import {
  Language,
  LanguageContext,
  LANGUAGE_LABELS,
  allTranslations,
  useT,
} from './i18n'


// ── Animated dot grid background ─────────────────────────────────────────────
type LiveDot = { alpha: number; rgb: readonly [number, number, number] }

const SUI_LIVE_COLORS: readonly (readonly [number, number, number])[] = [[41, 141, 255]]
const SOL_LIVE_COLORS: readonly (readonly [number, number, number])[] = [
  [153, 69, 255],   // Solana purple
  [20, 241, 149],   // Solana green
]

function DotBackground({ chain }: { chain?: 'sui' | 'solana' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chainRef  = useRef(chain)
  useEffect(() => { chainRef.current = chain }, [chain])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const GAP  = 22    // px between dot centres
    const R    = 1.2   // dot radius
    const GRAY = 'rgba(108, 117, 132, 0.35)'

    const live = new Map<string, LiveDot>()

    let frame: number
    let lastSpawn = 0

    const resize = () => {
      const parent = canvas.parentElement
      canvas.width  = parent ? parent.clientWidth  : window.innerWidth
      canvas.height = parent ? parent.clientHeight : window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const tick = (ts: number) => {
      const cols = Math.ceil(canvas.width  / GAP) + 1
      const rows = Math.ceil(canvas.height / GAP) + 1

      if (ts - lastSpawn > 500) {
        const palette = chainRef.current === 'solana' ? SOL_LIVE_COLORS : SUI_LIVE_COLORS
        const n = Math.floor(Math.random() * 4) + 2
        for (let i = 0; i < n; i++) {
          const c   = Math.floor(Math.random() * cols)
          const r   = Math.floor(Math.random() * rows)
          const rgb = palette[Math.floor(Math.random() * palette.length)]
          live.set(`${c},${r}`, { alpha: 1, rgb })
        }
        lastSpawn = ts
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x   = c * GAP
          const y   = r * GAP
          const key = `${c},${r}`
          const dot = live.get(key)

          ctx.beginPath()
          ctx.arc(x, y, R, 0, Math.PI * 2)

          if (dot !== undefined) {
            ctx.fillStyle = `rgba(${dot.rgb[0]},${dot.rgb[1]},${dot.rgb[2]},${dot.alpha})`
            const next = dot.alpha - 0.0015   // ~11 s fade at 60 fps
            next <= 0 ? live.delete(key) : live.set(key, { ...dot, alpha: next })
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
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

function SuiLogo({ active }: { active?: boolean }) {
  return (
    <img
      alt="Sui"
      src={active ? '/Logo_Sui_Droplet_Sui Blue.svg' : '/Logo_Sui_Droplet_White.svg'}
      style={{ height: '28px', width: 'auto', display: 'block', flexShrink: 0 }}
    />
  )
}

function SolanaLogoMark({ active }: { active?: boolean }) {
  return (
    <img
      src="/solanaLogoMark.svg"
      alt="Solana"
      style={{ height: '22px', width: 'auto', filter: active ? undefined : 'brightness(0) invert(1)' }}
    />
  )
}

// ── DocsSidePanel ─────────────────────────────────────────────────────────────

const mono = { fontFamily: "'DM Mono', monospace" }

function DocsSidePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()

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
              {t.docsTitle}
            </span>
            <span className="text-[14px] text-white" style={mono}>
              {t.docsSubtitle}
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
            <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>{t.docsAboutTitle}</span>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>{t.docsAboutP1}</p>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>{t.docsAboutP2}</p>
            <p className="text-[12px] text-[#6c7584] leading-[1.7]" style={mono}>{t.docsAboutReadOnly}</p>
          </div>

          {/* Solana transactions */}
          <div className="px-6 py-6 flex flex-col gap-3">
            <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>{t.docsSolanaTitle}</span>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>{t.docsSolanaP1}</p>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>{t.docsSolanaP2}</p>
          </div>

          {/* Interpretation quality */}
          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>{t.docsQualityTitle}</span>
              <span className="text-[12px] text-[#a1a7b2] leading-[1.6]" style={mono}>{t.docsQualitySubtitle}</span>
            </div>
            <div className="flex flex-col gap-4">
              {([
                { dot: 'bg-[#298dff]',    label: t.docsHighLabel,    desc: t.docsHighDesc },
                { dot: 'bg-[#6c7584]',    label: t.docsPartialLabel, desc: t.docsPartialDesc },
                { dot: 'bg-[#a1a7b2]/50', label: t.docsComplexLabel, desc: t.docsComplexDesc },
              ]).map(({ dot, label, desc }) => (
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
              <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>{t.docsContractTitle}</span>
              <span className="text-[12px] text-[#a1a7b2] leading-[1.6]" style={mono}>{t.docsContractSubtitle}</span>
            </div>
            <div className="flex flex-col gap-4">
              {([
                { dot: 'bg-[#298dff]', label: t.docsVerifiedLabel,   desc: t.docsVerifiedDesc },
                { dot: 'bg-[#f5a623]', label: t.docsUnverifiedLabel, desc: t.docsUnverifiedDesc },
              ]).map(({ dot, label, desc }) => (
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
              {t.docsContractDisclaimer}
            </p>
          </div>

        </div>

        {/* Panel footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[#1e2026]">
          <p className="text-[10px] text-[#6c7584]/50" style={mono}>{t.docsFooter}</p>
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

  // Re-fetch when language changes if a transaction is already shown
  useEffect(() => {
    if (currentDigest && !loading) {
      handleFetchTransaction(currentDigest)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const handleFetchTransaction = async (digest: string) => {
    setLoading(true)
    setError(null)
    setTransaction(null)
    setCurrentDigest(digest)

    try {
      if (!digest || digest.length < 32) {
        throw new Error('Invalid transaction hash format')
      }
      const txData = await fetchTransaction(digest, language)
      setTransaction(txData)
    } catch (err) {
      console.error('Transaction fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction')
    } finally {
      setLoading(false)
    }
  }

  const isSolana = transaction?.chain === 'solana'

  return (
    <div className={`${transaction && !loading ? 'min-h-screen' : 'h-screen overflow-hidden'} bg-black relative`}>
      {/* Animated dot grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <DotBackground chain={isSolana ? 'solana' : 'sui'} />
      </div>

      {/* Navbar */}
      <div className="relative z-50 p-5">
        <nav className="relative backdrop-blur-[6px] bg-[#131518] flex items-center justify-between px-4 sm:px-10 md:px-[60px] lg:px-[100px] py-[11.5px]">
          {/* Left: Sui logo + Solana mark */}
          <div className="flex items-center gap-3 shrink-0">
            <SuiLogo active={!!transaction && !isSolana} />
            <div className="w-px h-[20px] bg-[#2a2d35]" />
            <SolanaLogoMark active={isSolana} />
          </div>
          {/* Title: truly centred over the full nav width */}
          <span
            className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-white text-[17px] md:text-[20px] font-bold tracking-wide pointer-events-none select-none"
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
                className={`text-[13px] sm:text-[16px] transition-colors ${docsOpen ? (isSolana ? 'text-[#9945ff]' : 'text-[#298dff]') : 'text-white'}`}
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
                      className={`w-full text-left px-4 py-2 text-[14px] hover:bg-[#1e2026] transition-colors ${lang === language ? (isSolana ? 'text-[#9945ff]' : 'text-[#298dff]') : 'text-white'}`}
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
          <div className="flex items-center justify-center h-full pb-[12vh]" style={{ minHeight: 'calc(100vh - 76px)' }}>
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
              <div className="p-6 bg-[#1a0a0a] border border-[#7f1d1d] w-full">
                <p className="text-red-200 text-[14px] text-center" style={mono}>
                  {error}
                </p>
                <p className="text-[#6c7584] text-[12px] text-center mt-3" style={mono}>
                  {t.errorHint}
                </p>
                {(error.includes('timeout') || error.includes('slow')) && (
                  <div className="mt-4 p-3 border border-[#7f1d1d]/50 bg-[#7f1d1d]/10">
                    <p className="text-[#a1a7b2] text-[11px] font-medium" style={mono}>{t.errorTipsTitle}</p>
                    <ul className="text-[#6c7584] text-[11px] mt-2 space-y-1" style={mono}>
                      <li>· {t.tipWait}</li>
                      <li>· {t.tipNetwork}</li>
                      <li>· {t.tipCheck}</li>
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
