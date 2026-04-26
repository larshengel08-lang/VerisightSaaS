'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { buildContactHref } from '@/lib/contact-funnel'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'

// ── Design tokens ────────────────────────────────────────────────
const T = {
  paper:      'oklch(0.978 0.010 62)',
  paperSoft:  'oklch(0.956 0.018 60)',
  paperBlush: 'oklch(0.962 0.025 32)',
  white:      '#FFFCF8',
  navy:       'oklch(0.13 0.032 250)',
  ink:        'oklch(0.16 0.012 250)',
  inkSoft:    'oklch(0.32 0.010 250)',
  inkMuted:   'oklch(0.52 0.008 250)',
  inkFaint:   'oklch(0.70 0.006 250)',
  rule:       'oklch(0.875 0.012 62)',
  ruleLight:  'oklch(0.918 0.008 62)',
  teal:       'oklch(0.50 0.12 188)',
  tealMid:    'oklch(0.62 0.10 185)',
  tealSoft:   'oklch(0.94 0.04 185)',
  tealFaint:  'oklch(0.972 0.018 185)',
} as const

const AC = {
  deep:  'oklch(0.45 0.18 50)',
  mid:   'oklch(0.76 0.14 53)',
  light: 'oklch(0.86 0.10 55)',
  soft:  'oklch(0.95 0.045 50)',
  faint: 'oklch(0.976 0.018 50)',
} as const

const FF = 'var(--font-fraunces), serif'
const SHELL = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' } as const

// ── Hooks ────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

function useCountUp(target: number, inView: boolean, duration = 1100) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf: number
    let start: number | undefined
    raf = requestAnimationFrame(function step(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])
  return val
}

function Reveal({
  children, delay = 0, from = 'up' as 'up' | 'right' | 'none', threshold = 0.1,
}: {
  children: React.ReactNode; delay?: number; from?: 'up' | 'right' | 'none'; threshold?: number
}) {
  const [ref, inView] = useInView(threshold)
  const tr = { up: 'translateY(22px)', right: 'translateX(24px)', none: 'none' }
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : tr[from],
      transition: `opacity .75s ease ${delay}s, transform .75s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  )
}

// ── Shared primitives ────────────────────────────────────────────
function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SectionMark({ num, label, inView = true }: { num: string; label: string; inView?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
      <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 400, color: T.inkFaint, letterSpacing: '.03em', minWidth: 18 }}>{num}</span>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: T.inkMuted, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{
        flex: 1, height: '1px', background: T.rule, transformOrigin: 'left',
        transform: inView ? 'scaleX(1)' : 'scaleX(0)',
        opacity: inView ? 1 : 0,
        transition: 'transform .9s cubic-bezier(.4,0,0,1) .1s, opacity .4s ease .1s',
      }} />
    </div>
  )
}

// ── ① Hero ───────────────────────────────────────────────────────
type TabId = 'samenvatting' | 'themas' | 'rapportage'

function SamenvattingTab() {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 120); return () => clearTimeout(t) }, [])
  const rows = [
    { label: 'Groei en ontwikkeling', tag: 'Direct',   tagBg: AC.faint,                     tagColor: AC.deep,                   delay: 0 },
    { label: 'Werkdruk in operatie',  tag: 'Verhoogd', tagBg: 'oklch(.88 .06 75 / .32)',     tagColor: 'oklch(.40 .12 65)',        delay: .07 },
    { label: 'Loopbaanperspectief',   tag: 'Aandacht', tagBg: T.tealFaint,                   tagColor: T.teal,                    delay: .14 },
  ]
  const kpis = [
    { label: 'Vertrekrisico',   disp: '12%',  sub: '+1.4 pp',         subColor: T.inkMuted },
    { label: 'Engagement',      disp: '7,4',  sub: 'Stabiel',         subColor: T.inkMuted },
    { label: 'Behoud +12 mnd',  disp: '+3,1', sub: 'Positief signaal', subColor: AC.deep },
  ]
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 5 }}>Voorbeeldoutput · Q2 2025</div>
      <div style={{ fontFamily: FF, fontSize: 17, fontWeight: 400, color: T.ink, marginBottom: 22, lineHeight: 1.25 }}>
        Managementsamenvatting. Topprioriteiten, trend en eerste actie.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>
        {rows.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 13px', background: T.paperSoft, fontSize: 13,
            opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateX(-8px)',
            transition: `opacity .5s ease ${item.delay}s, transform .5s cubic-bezier(.16,1,.3,1) ${item.delay}s`,
          }}>
            <span style={{ color: T.ink, fontWeight: 500 }}>{item.label}</span>
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 8px', background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{
            padding: '12px 14px', background: T.paperSoft,
            opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(8px)',
            transition: `opacity .5s ease ${.25 + i * .07}s, transform .5s cubic-bezier(.16,1,.3,1) ${.25 + i * .07}s`,
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: T.inkMuted, marginBottom: 5 }}>{k.label}</div>
            <div style={{ fontFamily: FF, fontSize: 24, color: T.ink, lineHeight: 1, letterSpacing: '-.02em' }}>{k.disp}</div>
            <div style={{ fontSize: 9.5, color: k.subColor, marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 9.5, color: T.inkMuted, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 7 }}>Trend afgelopen 4 kwartalen</div>
        <div style={{ height: 52, background: T.paperSoft, display: 'flex', alignItems: 'flex-end', padding: '8px 12px', gap: 6, overflow: 'hidden' }}>
          {[42, 55, 50, 63, 78].map((h, i) => (
            <div key={i} style={{ flex: 1, background: AC.mid, height: ready ? `${h}%` : '0%', opacity: .28 + i * .18, transition: `height .7s cubic-bezier(.4,0,0,1) ${.35 + i * .06}s` }} />
          ))}
        </div>
        <div style={{ fontSize: 9.5, color: T.inkMuted, marginTop: 6, fontStyle: 'italic' }}>Resultaten op groepsniveau · n ≥ 8 per categorie</div>
      </div>
    </div>
  )
}

function ThemasTab() {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 100); return () => clearTimeout(t) }, [])
  const themes = [
    { label: 'Groei & ontwikkeling', pct: 68, color: AC.deep },
    { label: 'Werkdruk',             pct: 54, color: 'oklch(.60 .12 65)' },
    { label: 'Loopbaan',             pct: 47, color: T.tealMid },
    { label: 'Samenwerking',         pct: 32, color: T.inkFaint },
    { label: 'Leiderschap',          pct: 28, color: T.inkFaint },
  ]
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 5 }}>Thema-analyse · ExitScan</div>
      <div style={{ fontFamily: FF, fontSize: 17, fontWeight: 400, color: T.ink, marginBottom: 24, lineHeight: 1.25 }}>{"Vertrekthema's op frequentie."}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {themes.map((t, i) => (
          <div key={i} style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(6px)', transition: `opacity .5s ease ${i * .07}s, transform .5s cubic-bezier(.16,1,.3,1) ${i * .07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: T.ink, fontWeight: 500 }}>{t.label}</span>
              <span style={{ color: T.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{t.pct}%</span>
            </div>
            <div style={{ height: 5, background: T.paperSoft, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: t.color, width: ready ? `${t.pct}%` : '0%', transition: `width .8s cubic-bezier(.4,0,0,1) ${.1 + i * .08}s` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, padding: '13px 15px', background: T.tealFaint, borderLeft: `2px solid ${T.teal}`, opacity: ready ? 1 : 0, transition: 'opacity .5s ease .5s' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.teal, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Eerste prioriteit</div>
        <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.62 }}>Verifieer werkdruk-patroon Operations. Groei en ontwikkeling vraagt in drie teams tegelijkertijd aandacht.</div>
      </div>
      <div style={{ fontSize: 9.5, color: T.inkMuted, marginTop: 12, fontStyle: 'italic' }}>Groepsdata · n ≥ 8 · geen individuele herleidbaarheid</div>
    </div>
  )
}

function RapportageTab() {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t) }, [])
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 5 }}>Rapportage-output</div>
      <div style={{ fontFamily: FF, fontSize: 17, fontWeight: 400, color: T.ink, marginBottom: 22, lineHeight: 1.25 }}>Leesbaar, gegroepeerd en direct bruikbaar.</div>
      <div style={{ background: T.paperSoft, padding: 16, border: `1px solid ${T.rule}`, opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(10px)', transition: 'opacity .5s ease, transform .5s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ background: T.ink, padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: AC.soft, marginBottom: 10 }}>Verisight · ExitScan · Q2 2025</div>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 400, color: '#fff', lineHeight: 1.2, letterSpacing: '-.015em' }}>
            Managementrapport.<br />
            <em style={{ fontStyle: 'italic', fontWeight: 300, color: AC.light, opacity: .85 }}>Eerste beeld en prioriteiten.</em>
          </div>
        </div>
        {['Executive samenvatting', 'Thema-analyse', 'Teamoverzicht', 'Eerste acties'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? `1px solid ${T.rule}` : 'none', opacity: ready ? 1 : 0, transition: `opacity .4s ease ${.15 + i * .07}s` }}>
            <div style={{ width: 18, height: 18, background: i === 0 ? AC.mid : T.rule, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: T.ink }}>{s}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10.5, color: T.inkMuted, fontVariantNumeric: 'tabular-nums' }}>p.{i + 2}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {[{ label: 'PDF-rapport', bg: T.paperSoft, color: T.inkSoft, bold: false }, { label: 'Dashboard', bg: AC.faint, color: AC.deep, bold: true }, { label: 'Presentatie', bg: T.paperSoft, color: T.inkSoft, bold: false }].map((b, i) => (
          <div key={i} style={{ flex: 1, padding: '9px 12px', background: b.bg, fontSize: 12, color: b.color, fontWeight: b.bold ? 600 : 400, opacity: ready ? 1 : 0, transition: `opacity .4s ease ${.45 + i * .06}s` }}>{b.label}</div>
        ))}
      </div>
    </div>
  )
}

function DashboardPreview() {
  const [tab, setTab] = useState<TabId>('samenvatting')
  const tabs: { id: TabId; label: string }[] = [
    { id: 'samenvatting', label: 'Samenvatting' },
    { id: 'themas', label: "Thema's" },
    { id: 'rapportage', label: 'Rapportage' },
  ]
  return (
    <div style={{ background: T.white, border: `1px solid ${T.rule}`, borderRadius: 14, overflow: 'hidden', boxShadow: `0 2px 4px rgba(0,0,0,.04),0 32px 72px -16px rgba(20,14,10,.22),0 0 0 1px ${AC.soft}` }}>
      <div style={{ display: 'flex', gap: 2, padding: '10px 14px', background: T.paperSoft, borderBottom: `1px solid ${T.rule}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontSize: 12, fontWeight: t.id === tab ? 600 : 400, padding: '6px 14px',
            border: 'none', cursor: 'pointer', borderRadius: 5,
            background: t.id === tab ? T.white : 'transparent',
            color: t.id === tab ? T.ink : T.inkMuted,
            boxShadow: t.id === tab ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            transition: 'all .12s',
          }}>{t.label}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: AC.mid, boxShadow: `0 0 0 3px ${AC.soft}` }} />
          <span style={{ fontSize: 10.5, color: T.inkMuted, fontWeight: 500 }}>ExitScan · Q2</span>
        </div>
      </div>
      <div key={tab} style={{ padding: '26px 28px', animation: 'scaleIn .3s ease both' }}>
        {tab === 'samenvatting' && <SamenvattingTab />}
        {tab === 'themas' && <ThemasTab />}
        {tab === 'rapportage' && <RapportageTab />}
      </div>
    </div>
  )
}

function HeroSection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })
  return (
    <section style={{ background: T.white, padding: 'clamp(48px,6vw,72px) 0 clamp(56px,7vw,80px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${T.rule}80 1px,transparent 1px),linear-gradient(90deg,${T.rule}80 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .4 }} />
      <div style={{ position: 'absolute', top: -120, right: -80, width: 600, height: 600, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none', zIndex: 0, animation: 'ctaPulse 6s ease-in-out infinite' }} />

      <div style={{ ...SHELL, position: 'relative', zIndex: 1 }}>
        <div style={{ animation: 'slideDownFade .6s cubic-bezier(.16,1,.3,1) .05s both' }}>
          <SectionMark num="01" label="People insight · HR & management" inView />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_520px] lg:gap-16 xl:grid-cols-[1fr_572px] xl:gap-20 items-start">
          <div>
            <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .15s both' }}>
              <div style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(48px,6.5vw,88px)', lineHeight: .95, letterSpacing: '-.034em', color: T.ink }}>
                Van losse<br />signalen naar
              </div>
            </div>
            <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .28s both', marginBottom: 28 }}>
              <div style={{ fontFamily: FF, fontWeight: 300, fontSize: 'clamp(48px,6.5vw,88px)', lineHeight: .95, letterSpacing: '-.034em' }}>
                <em className="shimmer-text" style={{ fontStyle: 'italic' }}>eerste prioriteiten<br />voor HR en management.</em>
              </div>
            </div>
            <div style={{ width: 40, height: 3, background: AC.deep, marginBottom: 28, animation: 'scaleXIn .7s cubic-bezier(.4,0,0,1) .52s both', transformOrigin: 'left' }} />
            <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .60s both' }}>
              <p style={{ fontSize: 16.5, lineHeight: 1.7, color: T.inkSoft, maxWidth: '44ch', marginBottom: 36 }}>
                Verisight helpt HR en management sneller zien wat speelt, wat eerst telt en waar vervolg logisch is. Met dashboard, samenvatting en rapport in één leeslijn.
              </p>
            </div>
            <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .72s both', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href={ctaHref} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink, transition: 'all .18s cubic-bezier(.4,0,0,1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.background = AC.deep }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.background = T.ink }}>
                Plan een kennismaking <Arrow />
              </Link>
              <Link href="#voorbeeldoutput" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 500, padding: '11px 27px', color: T.inkSoft, border: `1px solid ${T.rule}`, background: 'transparent', transition: 'all .18s cubic-bezier(.4,0,0,1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.inkMuted; (e.currentTarget as HTMLElement).style.color = T.ink }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.rule; (e.currentTarget as HTMLElement).style.color = T.inkSoft }}>
                Bekijk voorbeeldoutput
              </Link>
            </div>
            <div style={{ animation: 'fadeIn .8s ease .88s both', marginTop: 36, paddingTop: 24, borderTop: `1px solid ${T.rule}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {['Geen individuele data', 'AVG-conform', 'Resultaat binnen weken'].map((label, i) => (
                <span key={i} style={{ fontSize: 11.5, color: T.inkFaint, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.tealMid, display: 'inline-block', flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="float-anim hidden lg:block" style={{ animation: 'slideRightFade 1s cubic-bezier(.16,1,.3,1) .22s both' }}>
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── ② Marquee ────────────────────────────────────────────────────
function MarqueeSection() {
  const items = [
    { text: 'ExitScan', serif: true },
    { text: '·  Vertrek & Uitstroom  ·', serif: false },
    { text: 'RetentieScan', serif: true },
    { text: '·  Behoud & Vroegsignalering  ·', serif: false },
    { text: 'Onboarding 30·60·90', serif: true },
    { text: '·  Instroom & Eerste Weken  ·', serif: false },
    { text: 'Pulse', serif: true },
    { text: '·  People Insight · HR & MT  ·', serif: false },
  ]
  const full = [...items, ...items]
  return (
    <div style={{ background: T.ink, padding: '13px 0', overflow: 'hidden', borderTop: `1px solid ${T.rule}40`, borderBottom: `1px solid ${T.rule}40` }}>
      <div className="marquee-mask" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'marqueeScroll 30s linear infinite', willChange: 'transform' }}>
          {full.map((item, i) => (
            <span key={i} style={{
              whiteSpace: 'nowrap', padding: '0 18px',
              fontSize: item.serif ? 16 : 10,
              fontFamily: item.serif ? FF : 'inherit',
              fontWeight: item.serif ? 400 : 700,
              fontStyle: item.serif ? 'italic' : 'normal',
              letterSpacing: item.serif ? '-.01em' : '.16em',
              textTransform: item.serif ? 'none' : 'uppercase',
              color: item.serif ? AC.light : 'rgba(255,255,255,.28)',
            }}>{item.text}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ③ Proof section ──────────────────────────────────────────────
function OutputCard({ statsRef, statsInView, c1, c2, c3 }: {
  statsRef: React.RefObject<HTMLDivElement | null>
  statsInView: boolean
  c1: number; c2: number; c3: number
}) {
  const [barsReady, setBarsReady] = useState(false)
  useEffect(() => {
    if (!statsInView) return
    const t = setTimeout(() => setBarsReady(true), 400)
    return () => clearTimeout(t)
  }, [statsInView])

  return (
    <div ref={statsRef} style={{ background: T.white, border: `1px solid ${T.rule}`, overflow: 'hidden', boxShadow: `0 2px 8px rgba(0,0,0,.04),0 28px 56px -8px rgba(20,14,10,.14),0 0 0 1px ${AC.soft}` }}>
      <div style={{ background: T.ink, padding: '26px 28px 22px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: AC.soft, marginBottom: 12, opacity: .88 }}>Managementsamenvatting · ExitScan</div>
        <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 400, color: '#fff', lineHeight: 1.15, letterSpacing: '-.015em' }}>
          Drie aandachtspunten.<br />
          <em style={{ fontStyle: 'italic', fontWeight: 300, color: AC.light, opacity: .8 }}>Één eerste stap.</em>
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.36)', marginTop: 10 }}>Verwerkt op groepsniveau · geen individuele herleidbaarheid</div>
      </div>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
          {[
            { label: 'Vertrekrisico',   val: statsInView ? `${c1}%` : '—',                                      sub: '+1.4 pp',         subColor: T.inkMuted },
            { label: 'Engagement',      val: statsInView ? (c2 / 10).toFixed(1).replace('.', ',') : '—',         sub: 'Stabiel',         subColor: T.inkMuted },
            { label: 'Behoud +12 mnd',  val: statsInView ? `+${(c3 / 10).toFixed(1).replace('.', ',')}` : '—',  sub: 'Positief signaal', subColor: AC.deep },
          ].map((k, i) => (
            <div key={i} style={{ padding: '12px 14px', background: T.paperSoft }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: T.inkMuted, marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontFamily: FF, fontSize: 26, color: T.ink, lineHeight: 1, letterSpacing: '-.025em' }}>{k.val}</div>
              <div style={{ fontSize: 9.5, color: k.subColor, marginTop: 3 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>Topprioriteiten</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
          {[
            { num: '01', label: 'Groei en ontwikkeling', sub: 'Operations, Finance · 3 teams', tag: 'Direct',   tagBg: AC.faint,                     tagColor: AC.deep },
            { num: '02', label: 'Werkdruk',              sub: 'Operations · piekperiode',      tag: 'Verhoogd', tagBg: 'oklch(.88 .06 75 / .32)',     tagColor: 'oklch(.40 .12 65)' },
            { num: '03', label: 'Loopbaanperspectief',   sub: 'Organisatiebreed signaal',      tag: 'Aandacht', tagBg: T.tealFaint,                   tagColor: T.teal },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: T.paperSoft, transition: 'background .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = AC.faint }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.paperSoft }}>
              <span style={{ fontFamily: FF, fontSize: 13, color: T.inkFaint, fontWeight: 400, minWidth: 24 }}>{item.num}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>{item.sub}</div>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', padding: '3px 9px', background: item.tagBg, color: item.tagColor, flexShrink: 0 }}>{item.tag}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9.5, color: T.inkMuted, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 7 }}>Trend afgelopen 4 kwartalen</div>
          <div style={{ height: 44, background: T.paperSoft, display: 'flex', alignItems: 'flex-end', padding: '6px 10px', gap: 5, overflow: 'hidden' }}>
            {[42, 55, 50, 63, 78].map((h, i) => (
              <div key={i} style={{ flex: 1, background: AC.mid, height: barsReady ? `${h}%` : '0%', opacity: .28 + i * .18, transition: `height .75s cubic-bezier(.4,0,0,1) ${i * .07}s` }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 18px', background: T.tealFaint, borderLeft: `2px solid ${T.teal}` }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: T.teal, marginBottom: 9 }}>Eerste actie</div>
          <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.65 }}>
            Verifieer het werkdruk-patroon in Operations vóór het volgende teamoverleg. Groei en ontwikkeling vraagt in drie teams aandacht.
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: T.inkMuted, fontStyle: 'italic' }}>
          Dit is een illustratief voorbeeld. Echte output varieert naar organisatie en route.
        </div>
      </div>
    </div>
  )
}

function ProofSection() {
  const [sRef, sInView] = useInView(.1)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsInView, setStatsInView] = useState(false)
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsInView(true); obs.disconnect() } }, { threshold: .2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  const c1 = useCountUp(12, statsInView, 900)
  const c2 = useCountUp(74, statsInView, 1000)
  const c3 = useCountUp(31, statsInView, 1100)

  const bullets = [
    { num: '01', label: 'Gegroepeerd en leesbaar',               body: 'Signalen op team- of organisatieniveau, niet als losse incidenten.' },
    { num: '02', label: 'Gemaakt voor gesprek en prioritering',   body: 'Zodat HR en management sneller weten wat eerst besproken moet worden.' },
    { num: '03', label: 'Zorgvuldig in wat het wel en niet zegt', body: 'Bruikbaar voor richting en toetsing, niet voor harde causaliteit of individuele beoordeling.' },
  ]

  return (
    <section id="voorbeeldoutput" style={{ background: T.paperSoft, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .45 }}>02</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="02" label="Dit krijgt u" inView={sInView} />
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20 items-start">
          <div>
            <Reveal delay={.05}>
              <h2 style={{ fontFamily: FF, fontSize: 'clamp(30px,3.5vw,44px)', fontWeight: 400, letterSpacing: '-.026em', color: T.ink, marginBottom: 18, lineHeight: 1.06 }}>
                Geen datadump.<br />
                <em className="shimmer-text" style={{ fontStyle: 'italic' }}>Wel een duidelijke eerste managementlijn.</em>
              </h2>
            </Reveal>
            <Reveal delay={.12}>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, marginBottom: 36, maxWidth: '44ch' }}>
                U krijgt output die helpt bepalen wat nu eerst aandacht vraagt.
              </p>
            </Reveal>
            <div>
              {bullets.map((item, i) => (
                <Reveal key={i} delay={.18 + i * .09}>
                  <div style={{ display: 'flex', gap: 20, padding: '20px 0', borderTop: `1px solid ${T.rule}` }}>
                    <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, fontWeight: 400, minWidth: 24, paddingTop: 2, flexShrink: 0 }}>{item.num}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.62 }}>{item.body}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
              <div style={{ borderTop: `1px solid ${T.rule}` }} />
            </div>
          </div>
          <Reveal delay={.1} from="right">
            <OutputCard statsRef={statsRef} statsInView={statsInView} c1={c1} c2={c2} c3={c3} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ── ④ Routes ─────────────────────────────────────────────────────
type RouteConfig = {
  num: string; tag: string; title: string
  accentColor: string; accentMid: string; accentFaint: string
  desc: string; bullets: string[]; href: string
}

function RouteColumn({ route }: { route: RouteConfig }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 22 }}>
        <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 400, color: T.inkFaint }}>{route.num}</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: route.accentColor }}>{route.tag}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, paddingBottom: 22, borderBottom: `1px solid ${T.rule}`, marginBottom: 22 }}>
        <div style={{ width: 2.5, background: route.accentColor, flexShrink: 0, borderRadius: 1.5 }} />
        <div>
          <div style={{ fontFamily: FF, fontSize: 34, fontWeight: 400, color: T.ink, letterSpacing: '-.022em', lineHeight: 1.1, marginBottom: 12 }}>{route.title}</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft }}>{route.desc}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
        {route.bullets.map((b, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11, fontSize: 13, color: T.inkSoft,
            opacity: hov ? 1 : .85,
            transform: hov && i === 0 ? 'translateX(3px)' : 'none',
            transition: `opacity .2s ease ${i * .05}s, transform .3s cubic-bezier(.16,1,.3,1) ${i * .05}s`,
          }}>
            <div style={{ width: 4, height: 4, background: route.accentColor, flexShrink: 0 }} />
            {b}
          </div>
        ))}
      </div>
      <Link href={route.href} style={{ fontSize: 13, fontWeight: 600, color: route.accentColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, borderBottom: `1px solid transparent`, transition: 'border-color .2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = route.accentColor }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}>
        Bekijk {route.title} <Arrow />
      </Link>
    </div>
  )
}

function RoutesSection() {
  const [sRef, sInView] = useInView(.08)

  const mainRoutes: RouteConfig[] = [
    {
      num: '01', tag: 'Vertrek & uitstroom', title: 'ExitScan',
      accentColor: AC.deep, accentMid: AC.mid, accentFaint: AC.faint,
      desc: 'Begrijp waarom medewerkers vertrekken en waar gerichte actie het meeste effect heeft.',
      bullets: ['Vertrekredenen op themaniveau', 'Patronen per team of afdeling', 'Eerste concrete verbeterpunten'],
      href: '/producten/exitscan',
    },
    {
      num: '02', tag: 'Behoud & vroegsignalering', title: 'RetentieScan',
      accentColor: T.teal, accentMid: T.tealMid, accentFaint: T.tealFaint,
      desc: 'Zie eerder waar behoud onder druk staat en welke signalen nu aandacht vragen.',
      bullets: ['Risicozones per team', 'Drijfveren voor blijven', 'Prioriteiten voor HR en MT'],
      href: '/producten/retentiescan',
    },
    {
      num: '03', tag: 'Onboarding', title: 'Onboarding 30·60·90',
      accentColor: 'oklch(.46 .14 72)', accentMid: 'oklch(.68 .13 74)', accentFaint: 'oklch(.966 .022 72)',
      desc: 'Zie vroeg waar nieuwe medewerkers goed landen — en waar frictie al in de eerste weken ontstaat.',
      bullets: ['Ervaringen op 30, 60 en 90 dagen', 'Patronen per cohort of team', 'Vroeg signaleren waar binding achterblijft'],
      href: '/producten/onboarding-30-60-90',
    },
  ]

  const primaryRoutes = mainRoutes.slice(0, 2)

  const supportRoutes = [
    { tag: 'Bounded peer', title: 'Onboarding 30-60-90', desc: 'Vroege checkpoint-read voor nieuwe medewerkers, naast de kernroutes maar kleiner dan een hoofdproduct.', color: 'oklch(.46 .14 72)', href: '/producten/onboarding-30-60-90' },
    { tag: 'Vervolgstap', title: 'Pulse', desc: 'Korte hercheck na een traject. Snel zichtbaar of de beweging zet.', color: AC.mid, href: '/producten/pulse' },
    { tag: 'Extra duiding voor management', title: 'Leadership Scan', desc: 'Alleen als vervolgstap na een bestaand people-signaal.', color: 'oklch(.42 .12 290)', href: '/producten/leadership-scan' },
  ]

  return (
    <section style={{ background: T.white, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .45 }}>03</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="03" label="Routes" inView={sInView} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] items-end mb-14">
          <Reveal delay={.05}>
            <h2 style={{ fontFamily: FF, fontSize: 'clamp(30px,3.5vw,44px)', fontWeight: 400, letterSpacing: '-.026em', color: T.ink, lineHeight: 1.06, maxWidth: '20ch' }}>
              Kies de route<br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>die past bij uw vraagstuk.</em>
            </h2>
          </Reveal>
          <Reveal delay={.14}>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '32ch' }}>
              Twee hoofdroutes. Onboarding staat daarnaast als bounded peer. Pulse en Leadership sluiten later aan.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-0" style={{ borderBottom: `1px solid ${T.rule}`, paddingBottom: 0 }}>
          {primaryRoutes.map((r, i) => (
            <Reveal key={i} delay={.08 + i * .1}>
              <div style={{ paddingRight: i < 1 ? 'clamp(0px,3vw,44px)' : 0, paddingLeft: i > 0 ? 'clamp(0px,3vw,44px)' : 0, borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none', paddingBottom: 32 }}>
                <RouteColumn route={r} />
              </div>
            </Reveal>
          ))}
        </div>

        <div style={{ marginTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1, height: '1px', background: T.rule }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, whiteSpace: 'nowrap', padding: '0 4px' }}>Bounded peer en vervolgroutes</span>
            <div style={{ flex: 1, height: '1px', background: T.rule }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {supportRoutes.map((r, i) => (
              <Reveal key={i} delay={.1 + i * .08}>
                <div style={{ padding: '20px 24px', borderTop: `1px solid ${T.rule}`, borderRight: i < supportRoutes.length - 1 ? `1px solid ${T.rule}` : 'none' }}
                  className="transition-colors hover:bg-[oklch(0.956_0.018_60)]">
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 7 }}>{r.tag}</div>
                  <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 400, color: T.inkMuted, marginBottom: 6 }}>{r.title}</div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.6, color: T.inkMuted, marginBottom: 12 }}>{r.desc}</p>
                  <Link href={r.href} style={{ fontSize: 12, fontWeight: 600, color: r.color, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    Meer informatie <Arrow />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── ⑤ Trust ──────────────────────────────────────────────────────
function TrustSection() {
  const [sRef, sInView] = useInView(.1)
  const items = [
    { num: '01', title: 'Groepsniveau',                   body: 'Resultaten zijn altijd op groeps- en teamniveau. Drempelwaarden zijn standaard ingebouwd.' },
    { num: '02', title: 'Geen individuele voorspellingen', body: 'Verisight ondersteunt prioritering en gesprek, niet diagnose of beoordeling op persoonsniveau.' },
    { num: '03', title: 'AVG-conform',                    body: 'Zorgvuldige verwerking, gegroepeerde output en heldere documentatie beschikbaar op aanvraag.' },
    { num: '04', title: 'Begeleid traject',               body: 'Een professional begeleidt het traject van start tot eerste bespreking.' },
  ]
  return (
    <section style={{ background: T.paperBlush, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: FF, fontSize: 260, fontWeight: 400, color: T.rule, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', opacity: .4 }}>04</div>
      <div ref={sRef} style={{ ...SHELL, position: 'relative' }}>
        <SectionMark num="04" label="Vertrouwen en privacy" inView={sInView} />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-20 items-start">
          <Reveal delay={.05}>
            <div>
              <h2 style={{ fontFamily: FF, fontSize: 'clamp(26px,3vw,34px)', fontWeight: 400, letterSpacing: '-.022em', color: T.ink, lineHeight: 1.15, marginBottom: 18 }}>
                Vertrouwen en privacy,<br />
                <em className="shimmer-text" style={{ fontStyle: 'italic' }}>zonder ruis.</em>
              </h2>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft, marginBottom: 22 }}>
                Privacy en zorgvuldigheid zijn standaard onderdeel van de route.
              </p>
              <Link href="/vertrouwen" style={{ fontSize: 13, fontWeight: 500, color: T.teal, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, borderBottom: `1px solid transparent`, transition: 'border-color .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = T.teal }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}>
                Meer over privacy <Arrow />
              </Link>
            </div>
          </Reveal>
          <div>
            {items.map((item, i) => (
              <Reveal key={i} delay={.1 + i * .08}>
                <div style={{ display: 'flex', gap: 20, padding: '20px 0', borderTop: `1px solid ${T.rule}` }}>
                  <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, fontWeight: 400, minWidth: 24, paddingTop: 2, flexShrink: 0 }}>{item.num}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.tealMid, flexShrink: 0 }} />
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{item.title}</div>
                    </div>
                    <p style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.62 }}>{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <div style={{ borderTop: `1px solid ${T.rule}` }} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── ⑥ CTA ────────────────────────────────────────────────────────
function CTASection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_cta' })
  const [btn1, setBtn1] = useState(false)
  const [btn2, setBtn2] = useState(false)
  return (
    <section style={{
      padding: 'clamp(72px,9vw,120px) 0', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg,oklch(.13 .032 250) 0%,oklch(.10 .022 244) 50%,oklch(.13 .032 250) 100%)',
      backgroundSize: '300% 300%', animation: 'gradFlow 10s ease infinite',
    }}>
      <div style={{ position: 'absolute', top: -100, right: '12%', width: 520, height: 520, background: `radial-gradient(circle,${AC.mid}2A 0%,transparent 62%)`, pointerEvents: 'none', animation: 'ctaPulse 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: -80, left: '8%', width: 400, height: 400, background: `radial-gradient(circle,${AC.soft}50 0%,transparent 62%)`, pointerEvents: 'none', animation: 'ctaPulse 7s ease-in-out 1.5s infinite' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />

      <div style={{ ...SHELL, textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 800 }}>
        <Reveal threshold={.2}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.32)', marginBottom: 28 }}>05 · Volgende stap</div>
        </Reveal>
        <Reveal delay={.08} threshold={.2}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(36px,5.5vw,64px)', fontWeight: 400, letterSpacing: '-.03em', color: '#fff', lineHeight: 1.0, marginBottom: 24 }}>
            Plan een kennismaking<br />
            <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'oklch(.76 .14 53)' }}>en ontdek welke eerste stap logisch is.</em>
          </h2>
        </Reveal>
        <Reveal delay={.16} threshold={.2}>
          <p style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(255,255,255,.55)', maxWidth: '44ch', margin: '0 auto 48px' }}>
            In 30 minuten krijgt u scherp welke eerste stap logisch is. Direct antwoord op uw vraag, zonder onnodige omweg.
          </p>
        </Reveal>
        <Reveal delay={.24} threshold={.2}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            <Link href={ctaHref}
              onMouseEnter={() => setBtn1(true)} onMouseLeave={() => setBtn1(false)}
              style={{
                fontSize: 15, fontWeight: 700, color: 'oklch(.13 .032 250)',
                textDecoration: 'none', padding: '15px 36px', borderRadius: 999,
                background: btn1 ? 'oklch(.82 .13 53)' : 'oklch(.76 .14 53)',
                display: 'inline-flex', alignItems: 'center', gap: 9,
                transform: btn1 ? 'translateY(-2px) scale(1.03)' : 'none',
                boxShadow: btn1 ? '0 14px 40px -4px oklch(.76 .14 53 / .55)' : '0 4px 20px -2px oklch(.76 .14 53 / .4)',
                transition: 'all .2s cubic-bezier(.16,1,.3,1)',
              }}>
              Plan een kennismaking <Arrow />
            </Link>
            <Link href="/producten"
              onMouseEnter={() => setBtn2(true)} onMouseLeave={() => setBtn2(false)}
              style={{
                fontSize: 15, fontWeight: 500, borderRadius: 999,
                color: btn2 ? '#fff' : 'rgba(255,255,255,.72)',
                textDecoration: 'none', padding: '15px 30px',
                border: `1.5px solid ${btn2 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.25)'}`,
                display: 'inline-flex', alignItems: 'center', gap: 9,
                transform: btn2 ? 'translateY(-1px)' : 'none',
                transition: 'all .18s ease',
              }}>
              Bekijk de routes
            </Link>
          </div>
        </Reveal>
        <Reveal delay={.34} threshold={.2}>
          <div style={{ paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.10)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['Geen verplichtingen', '30 minuten', 'Direct antwoord op uw vraag'].map((s, i) => (
              <span key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,.30)', letterSpacing: '.03em' }}>
                {i > 0 && <span style={{ marginRight: 8, opacity: .4 }}>·</span>}{s}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── ⑦ Contact ─────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0', borderTop: `1px solid ${T.rule}` }}>
      <div style={{ ...SHELL, maxWidth: 820 }}>
        <MarketingInlineContactPanel
          eyebrow="Plan kennismaking"
          title="Vertel kort welke managementvraag nu speelt."
          body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy en prijs."
          defaultRouteInterest="exitscan"
          defaultCtaSource="homepage_form"
        />
      </div>
    </section>
  )
}

// ── Export ───────────────────────────────────────────────────────
export function HomePageContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <MarqueeSection />
      <ProofSection />
      <RoutesSection />
      <TrustSection />
      <CTASection />
      <ContactSection />
    </div>
  )
}
