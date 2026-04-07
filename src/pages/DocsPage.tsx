import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useT, Language, LANGUAGE_LABELS } from '../i18n'

const mono = { fontFamily: "'DM Mono', monospace" }

// ── Protocol data (proper nouns — no translation needed) ──────────────────────

type ProtocolCategory = 'DEX' | 'Swap' | 'Liquidity' | 'Lending' | 'Oracle' | 'Staking' | 'NFT' | 'Bridge'

const SUI_PROTOCOLS: { name: string; category: ProtocolCategory }[] = [
  { name: 'Cetus',             category: 'DEX' },
  { name: 'Turbos',            category: 'DEX' },
  { name: 'Kriya',             category: 'DEX' },
  { name: 'DeepBook',          category: 'DEX' },
  { name: 'Aftermath Finance', category: 'DEX' },
  { name: 'FlowX',             category: 'DEX' },
  { name: 'SuiSwap',           category: 'DEX' },
  { name: 'BlueMove',          category: 'DEX' },
  { name: 'Scallop',           category: 'Lending' },
  { name: 'Navi Protocol',     category: 'Lending' },
  { name: 'SuiLend',           category: 'Lending' },
  { name: 'Bucket Protocol',   category: 'Lending' },
  { name: 'Pyth',              category: 'Oracle' },
  { name: 'Switchboard',       category: 'Oracle' },
  { name: 'Stork',             category: 'Oracle' },
  { name: 'Supra Oracle',      category: 'Oracle' },
]

const SOLANA_PROGRAMS: { name: string; category: ProtocolCategory }[] = [
  { name: 'Jupiter',                category: 'Swap' },
  { name: 'Raydium AMM',            category: 'Swap' },
  { name: 'Raydium CLMM',           category: 'Swap' },
  { name: 'Orca Whirlpool',         category: 'Swap' },
  { name: 'OpenBook v2',            category: 'Swap' },
  { name: 'Pump.fun',               category: 'Swap' },
  { name: 'Meteora',                category: 'Liquidity' },
  { name: 'Meteora DLMM',           category: 'Liquidity' },
  { name: 'Marinade',               category: 'Staking' },
  { name: 'Lido',                   category: 'Staking' },
  { name: 'Jito',                   category: 'Staking' },
  { name: 'Metaplex',               category: 'NFT' },
  { name: 'Metaplex Bubblegum',     category: 'NFT' },
  { name: 'Candy Machine v3',       category: 'NFT' },
  { name: 'Kamino',                 category: 'Lending' },
  { name: 'MarginFi',               category: 'Lending' },
  { name: 'Solend',                 category: 'Lending' },
  { name: 'Wormhole',               category: 'Bridge' },
  { name: 'Wormhole Token Bridge',  category: 'Bridge' },
  { name: 'Mayan Bridge',           category: 'Bridge' },
]

const CATEGORY_COLORS: Record<ProtocolCategory, string> = {
  DEX:       'text-[#298dff]  border-[#298dff]/25',
  Swap:      'text-[#298dff]  border-[#298dff]/25',
  Liquidity: 'text-[#43B4CA] border-[#43B4CA]/25',
  Lending:   'text-[#f5a623] border-[#f5a623]/25',
  Oracle:    'text-[#9945ff] border-[#9945ff]/25',
  Staking:   'text-[#28E0B9] border-[#28E0B9]/25',
  NFT:       'text-[#ff6b9d] border-[#ff6b9d]/25',
  Bridge:    'text-[#fbbf24] border-[#fbbf24]/25',
}

// ── Section components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="text-[9px] text-[#6c7584] uppercase tracking-[0.15em]" style={mono}>
      {children}
    </span>
  )
}

function ConceptItem({ term, desc }: { term: string; desc: string }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span className="text-[12px] text-white font-medium" style={mono}>{term}</span>
      <span className="text-[11px] text-[#6c7584] leading-[1.6]" style={mono}>{desc}</span>
    </div>
  )
}

function ProtocolRow({ name, category }: { name: string; category: ProtocolCategory }) {
  const colors = CATEGORY_COLORS[category]
  return (
    <div className="flex items-center justify-between gap-3 py-[7px] border-b border-[#1e2026]">
      <span className="text-[12px] text-[#a1a7b2]" style={mono}>{name}</span>
      <span className={`text-[9px] px-[6px] py-[2px] border tracking-[0.06em] uppercase shrink-0 ${colors}`} style={mono}>
        {category}
      </span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DocsPage({ onBack }: { onBack: () => void }) {
  const { t, language, setLanguage } = useT()
  const [langOpen, setLangOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <div className="relative z-50 p-5">
        <nav className="relative backdrop-blur-[6px] bg-[#131518] flex items-center justify-between px-4 sm:px-10 md:px-[60px] lg:px-[100px] py-[11.5px]">
          {/* Left: back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#6c7584] hover:text-white transition-colors shrink-0"
            style={mono}
          >
            <span className="text-[14px]">←</span>
            <span className="text-[13px] sm:text-[15px]">{t.docsBack}</span>
          </button>

          {/* Center: title */}
          <span
            className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-white text-[17px] md:text-[20px] font-bold tracking-wide pointer-events-none select-none"
            style={{ fontFamily: "'TWK Everett', sans-serif" }}
          >
            {t.docsTitle}
          </span>

          {/* Right: language */}
          <div className="relative">
            <button
              className="flex items-center gap-1 sm:gap-2 cursor-pointer"
              onClick={() => setLangOpen(o => !o)}
            >
              <span className="text-white text-[13px] sm:text-[16px]" style={mono}>
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
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-[920px] mx-auto px-6 pb-20 flex flex-col divide-y divide-[#1e2026]">

        {/* About */}
        <section className="py-10 flex flex-col gap-4">
          <SectionLabel>{t.docsAboutTitle}</SectionLabel>
          <p className="text-[13px] text-[#a1a7b2] leading-[1.75]" style={mono}>{t.docsAboutP1}</p>
          <p className="text-[13px] text-[#a1a7b2] leading-[1.75]" style={mono}>{t.docsAboutP2}</p>
          <p className="text-[12px] text-[#6c7584]" style={mono}>{t.docsAboutReadOnly}</p>
        </section>

        {/* Chain concepts */}
        <section className="py-10 flex flex-col gap-6">
          <SectionLabel>{t.docsConceptsTitle}</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10">

            {/* Sui */}
            <div className="flex flex-col gap-1 pb-8 md:pb-0">
              <div className="flex items-center gap-2 mb-4">
                <img src="/Logo_Sui_Droplet_White.svg" style={{ height: '16px', width: 'auto', opacity: 0.6 }} alt="Sui" />
                <span className="text-[10px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>Sui</span>
              </div>
              <div className="flex flex-col gap-5">
                <ConceptItem term={t.cSuiDigestTerm}  desc={t.cSuiDigestDesc} />
                <ConceptItem term={t.cSuiPackageTerm} desc={t.cSuiPackageDesc} />
                <ConceptItem term={t.cSuiObjectTerm}  desc={t.cSuiObjectDesc} />
                <ConceptItem term={t.cSuiGasTerm}     desc={t.cSuiGasDesc} />
              </div>
            </div>

            {/* Divider on mobile */}
            <div className="md:hidden border-t border-[#1e2026] mb-8" />

            {/* Solana */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/solanaLogoMark.svg" style={{ height: '13px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.6 }} alt="Solana" />
                <span className="text-[10px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>Solana</span>
              </div>
              <div className="flex flex-col gap-5">
                <ConceptItem term={t.cSolSignatureTerm}    desc={t.cSolSignatureDesc} />
                <ConceptItem term={t.cSolProgramTerm}      desc={t.cSolProgramDesc} />
                <ConceptItem term={t.cSolAccountTerm}      desc={t.cSolAccountDesc} />
                <ConceptItem term={t.cSolLamportTerm}      desc={t.cSolLamportDesc} />
                <ConceptItem term={t.cSolInstructionTerm}  desc={t.cSolInstructionDesc} />
              </div>
            </div>

          </div>
        </section>

        {/* Trusted protocols */}
        <section className="py-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <SectionLabel>{t.docsTrustedTitle}</SectionLabel>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>{t.docsTrustedSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

            {/* Sui protocols */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/Logo_Sui_Droplet_White.svg" style={{ height: '14px', width: 'auto', opacity: 0.6 }} alt="Sui" />
                <span className="text-[10px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>Sui</span>
              </div>
              <div>
                {SUI_PROTOCOLS.map(p => <ProtocolRow key={p.name} name={p.name} category={p.category} />)}
              </div>
            </div>

            {/* Solana programs */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/solanaLogoMark.svg" style={{ height: '11px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.6 }} alt="Solana" />
                <span className="text-[10px] text-[#6c7584] uppercase tracking-[0.12em]" style={mono}>Solana</span>
              </div>
              <div>
                {SOLANA_PROGRAMS.map(p => <ProtocolRow key={p.name} name={p.name} category={p.category} />)}
              </div>
            </div>

          </div>

          <p className="text-[11px] text-[#6c7584]/60 leading-[1.6] border-t border-[#1e2026] pt-5" style={mono}>
            {t.docsTrustedNote}
          </p>
        </section>

        {/* Interpretation quality */}
        <section className="py-10 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <SectionLabel>{t.docsQualityTitle}</SectionLabel>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>{t.docsQualitySubtitle}</p>
          </div>
          <div className="flex flex-col gap-5">
            {([
              { dot: 'bg-[#298dff]',    label: t.docsHighLabel,    desc: t.docsHighDesc },
              { dot: 'bg-[#6c7584]',    label: t.docsPartialLabel, desc: t.docsPartialDesc },
              { dot: 'bg-[#a1a7b2]/50', label: t.docsComplexLabel, desc: t.docsComplexDesc },
            ]).map(({ dot, label, desc }) => (
              <div key={label} className="flex gap-3 items-start">
                <div className={`mt-[5px] size-[5px] rounded-full shrink-0 ${dot}`} />
                <div className="flex flex-col gap-[5px]">
                  <span className="text-[12px] text-[#a1a7b2] font-medium leading-none" style={mono}>{label}</span>
                  <span className="text-[11px] text-[#6c7584] leading-[1.5]" style={mono}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contract verification */}
        <section className="py-10 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <SectionLabel>{t.docsContractTitle}</SectionLabel>
            <p className="text-[12px] text-[#a1a7b2] leading-[1.7]" style={mono}>{t.docsContractSubtitle}</p>
          </div>
          <div className="flex flex-col gap-5">
            {([
              { dot: 'bg-[#298dff]', label: t.docsVerifiedLabel,   desc: t.docsVerifiedDesc },
              { dot: 'bg-[#f5a623]', label: t.docsUnverifiedLabel, desc: t.docsUnverifiedDesc },
            ]).map(({ dot, label, desc }) => (
              <div key={label} className="flex gap-3 items-start">
                <div className={`mt-[5px] size-[5px] rounded-full shrink-0 ${dot}`} />
                <div className="flex flex-col gap-[5px]">
                  <span className="text-[12px] text-[#a1a7b2] font-medium leading-none" style={mono}>{label}</span>
                  <span className="text-[11px] text-[#6c7584] leading-[1.5]" style={mono}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#6c7584]/60 leading-[1.5] border-t border-[#1e2026] pt-4" style={mono}>
            {t.docsContractDisclaimer}
          </p>
        </section>

      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2026] px-6 py-5 flex justify-center">
        <p className="text-[10px] text-[#6c7584]/50" style={mono}>{t.docsFooter}</p>
      </div>

    </div>
  )
}
