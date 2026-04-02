import { useState, useRef, useEffect } from 'react'
import { TransactionInput } from './components/TransactionInput'
import { TransactionDisplay, TransactionResultFooter } from './components/TransactionDisplay'
import { fetchTransactionDetails } from './services/suiService'
import { ParsedTransaction } from './types/transaction'
import { ChevronDown } from 'lucide-react'

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

function App() {
  const [transaction, setTransaction] = useState<ParsedTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentDigest, setCurrentDigest] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleFetchTransaction = async (digest: string) => {
    setLoading(true)
    setError(null)
    setTransaction(null)
    setCurrentDigest(digest)

    try {
      if (!digest || digest.length < 32) {
        throw new Error('Invalid transaction digest format')
      }
      const txData = await fetchTransactionDetails(digest)
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
      <div className="relative z-10 p-5">
        <nav className="backdrop-blur-[6px] bg-[#131518] flex items-center justify-between px-[100px] py-[11.5px]">
          <SuiLogo />
          <span
            className="text-white text-[20px] font-bold tracking-wide"
            style={{ fontFamily: "'TWK Everett', sans-serif" }}
          >
            Transaction Explainer
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-white text-[16px]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              English
            </span>
            <ChevronDown className="w-5 h-5 text-white" />
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="relative z-10" style={{ height: 'calc(100vh - 76px)' }}>
        {/* Empty state: centered input */}
        {!loading && !error && !transaction && (
          <div className="flex items-center justify-center h-full">
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
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 w-[1000px] max-w-full px-6">
              <p
                className="text-[#298dff] text-[14px] text-center leading-[20.8px] tracking-[-0.16px]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                I'm fetching data from {currentDigest}.<br />
                This may take up to 30 seconds, please wait
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
          <div className="flex items-center justify-center h-full">
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
                  Make sure the transaction digest is valid and from Sui mainnet.
                </p>
                {(error.includes('timeout') || error.includes('slow')) && (
                  <div className="mt-4 p-3 bg-red-800/30 rounded-lg">
                    <p className="text-red-200 text-sm font-medium">Tips:</p>
                    <ul className="text-red-300 text-xs mt-2 space-y-1">
                      <li>• Wait a few seconds and try again</li>
                      <li>• The Sui network might be experiencing high load</li>
                      <li>• Check if the transaction ID is correct</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction result */}
        {transaction && !loading && (
          <div className="flex items-start justify-center h-full overflow-y-auto py-10">
            <TransactionDisplay transaction={transaction} />
          </div>
        )}
      </div>

      {/* Footer — shown only after a result */}
      {transaction && !loading && <TransactionResultFooter />}
    </div>
  )
}

export default App
