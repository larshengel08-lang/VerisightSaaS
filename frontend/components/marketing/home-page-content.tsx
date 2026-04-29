'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { buildContactHref } from '@/lib/contact-funnel'

void PreviewSlider

// Tokens used by HeroSection (De Rapporteur palette)
const T = {
  paper: 'oklch(0.978 0.01 62)',
  paperSoft: 'oklch(0.956 0.018 60)',
  white: '#FFFCF8',
  ink: 'oklch(0.16 0.012 250)',
  inkSoft: 'oklch(0.32 0.01 250)',
  inkMuted: 'oklch(0.52 0.008 250)',
  inkFaint: 'oklch(0.7 0.006 250)',
  rule: 'oklch(0.875 0.012 62)',
  teal: 'oklch(0.5 0.12 188)',
  tealMid: 'oklch(0.62 0.1 185)',
  tealFaint: 'oklch(0.972 0.018 185)',
} as const
const AC = {
  deep: 'oklch(0.45 0.18 50)',
  mid: 'oklch(0.76 0.14 53)',
  light: 'oklch(0.86 0.10 55)',
  soft: 'oklch(0.95 0.045 50)',
  faint: 'oklch(0.976 0.018 50)',
} as const
const FF = 'var(--font-fraunces), serif'

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } }, { threshold })
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

function Reveal({
  children,
  delay = 0,
  from = 'bottom',
}: {
  children: ReactNode
  delay?: number
  from?: 'bottom' | 'right'
}) {
  const [ref, inView] = useInView(0.08)
  const hiddenTransform = from === 'right' ? 'translateX(16px)' : 'translateY(16px)'
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : hiddenTransform,
        transition: `opacity .65s ease ${delay}s, transform .65s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SURFACE = {
  paper: '#f5f0e8',
  surface: '#fffdf9',
  soft: '#f2ece2',
  border: '#ddd6ca',
  ink: '#132033',
  text: '#4d5a66',
  muted: '#7d887f',
  navy: '#162534',
  teal: '#3a7f7d',
  tealSoft: '#e7f0ec',
  amber: '#b95b1f',
  amberSoft: '#f6e4d8',
} as const

const SHELL = {
  maxWidth: 1220,
  margin: '0 auto',
  padding: '0 clamp(20px, 4vw, 44px)',
} as const

const displayFont = 'var(--font-fraunces), Georgia, serif'

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <span style={{ fontSize: 11, color: SURFACE.muted }}>{index}</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: SURFACE.muted,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: SURFACE.border }} />
    </div>
  )
}

function Tag({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'accent' }) {
  const palette =
    tone === 'accent'
      ? { background: SURFACE.tealSoft, border: '#c7ddd7', color: SURFACE.teal }
      : { background: SURFACE.surface, border: SURFACE.border, color: SURFACE.text }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        border: `1px solid ${palette.border}`,
        background: palette.background,
        color: palette.color,
        padding: '6px 11px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  )
}

function PreviewMetric({
  label,
  value,
  body,
}: {
  label: string
  value: string
  body: string
}) {
  return (
    <div
      style={{
        border: `1px solid ${SURFACE.border}`,
        borderRadius: 14,
        background: SURFACE.surface,
        padding: '16px 18px',
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: SURFACE.muted,
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        className="dash-number"
        style={{
          fontSize: 30,
          lineHeight: 1,
          color: SURFACE.ink,
          marginBottom: 8,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: SURFACE.text }}>{body}</p>
    </div>
  )
}

function DashboardSuitePreview() {
  return (
    <div
      style={{
        border: `1px solid ${SURFACE.border}`,
        borderRadius: 18,
        background: SURFACE.surface,
        overflow: 'hidden',
        boxShadow: '0 16px 38px rgba(19, 32, 51, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: SURFACE.soft,
          borderBottom: `1px solid ${SURFACE.border}`,
        }}
      >
        <Tag>Overview</Tag>
        <Tag>ExitScan</Tag>
        <Tag>Reports</Tag>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: SURFACE.muted }}>Shared suite shell</div>
      </div>
      <div style={{ padding: '20px 22px 22px' }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: SURFACE.muted,
            marginBottom: 10,
          }}
        >
          Dashboard
        </p>
        <h3
          style={{
            fontFamily: displayFont,
            fontSize: 28,
            lineHeight: 1,
            letterSpacing: '-.03em',
            color: SURFACE.ink,
            marginBottom: 12,
          }}
        >
          Zie wat aandacht vraagt.
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: SURFACE.text, maxWidth: 540, marginBottom: 18 }}>
          Start met een rustige first read: welk product of welke campaign nu het belangrijkst is, welk signaal eerst telt en
          wat de eerstvolgende managementstap is.
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <PreviewMetric label="Vertrekdruk" value="6.4" body="Drie teams vragen nadere duiding." />
          <PreviewMetric label="Behoudsdruk" value="3.1" body="Stabiel, nog geen extra route nodig." />
          <PreviewMetric label="Respons" value="86%" body="Breed genoeg voor een managementread." />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div
            style={{
              border: `1px solid ${SURFACE.border}`,
              borderRadius: 14,
              background: SURFACE.surface,
              padding: '16px 18px',
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: SURFACE.muted,
                marginBottom: 8,
              }}
            >
              Hoofdread
            </p>
            <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: SURFACE.ink, marginBottom: 8 }}>
              Operations laat de duidelijkste stijging in werkdruk en vertrekfrictie zien.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: SURFACE.text }}>
              Gebruik dashboard en rapport als gedeelde managementread. Daarna volgt de werkafspraak in Action Center.
            </p>
          </div>
          <div
            style={{
              border: `1px solid ${SURFACE.border}`,
              borderRadius: 14,
              background: SURFACE.soft,
              padding: '16px 18px',
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: SURFACE.muted,
                marginBottom: 8,
              }}
            >
              Rapport
            </p>
            <p style={{ fontSize: 18, fontWeight: 600, color: SURFACE.ink, marginBottom: 8 }}>Klaar voor MT-overleg</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: SURFACE.text }}>
              Eenzelfde waarheid, compacter verpakt voor besluitvorming en handoff.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

void DashboardSuitePreview

function ActionCenterSuitePreview() {
  return (
    <div
      style={{
        border: `1px solid ${SURFACE.border}`,
        borderRadius: 18,
        background: SURFACE.surface,
        overflow: 'hidden',
        boxShadow: '0 16px 38px rgba(19, 32, 51, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: SURFACE.soft,
          borderBottom: `1px solid ${SURFACE.border}`,
        }}
      >
        <Tag tone="accent">Action Center</Tag>
        <Tag>Acties</Tag>
        <Tag>Managers</Tag>
        <Tag>Reviewmomenten</Tag>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: SURFACE.muted }}>Top-level suite module</div>
      </div>
      <div style={{ padding: '20px 22px 22px' }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: SURFACE.muted,
            marginBottom: 10,
          }}
        >
          Action Center
        </p>
        <h3
          style={{
            fontFamily: displayFont,
            fontSize: 28,
            lineHeight: 1,
            letterSpacing: '-.03em',
            color: SURFACE.ink,
            marginBottom: 12,
          }}
        >
          Organiseer wat er nu moet gebeuren.
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: SURFACE.text, maxWidth: 540, marginBottom: 18 }}>
          Maak acties expliciet, wijs managers toe per afdeling en bewaak vervolg zonder de surveylaag te verwarren met de
          opvolglaag.
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <PreviewMetric label="Open acties" value="23" body="Nog in beweging." />
          <PreviewMetric label="Te bespreken" value="6" body="Moet deze week op tafel." />
          <PreviewMetric label="Managers" value="10" body="Toegekend per afdeling." />
          <PreviewMetric label="Reviews" value="4" body="Komende zeven dagen." />
        </div>

        <div
          style={{
            marginTop: 16,
            border: `1px solid ${SURFACE.border}`,
            borderRadius: 14,
            background: SURFACE.surface,
            overflow: 'hidden',
          }}
        >
          {[
            ['ExitScan', 'Customer Care', 'Bespreek werkdrukpatroon Customer Care in MT', 'Te bespreken'],
            ['RetentieScan', 'Field Service', 'Start roosterpilot en leg eerste reviewmoment vast', 'In uitvoering'],
          ].map(([route, team, title, status], index) => (
            <div
              key={title}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) auto',
                gap: 16,
                padding: '16px 18px',
                borderTop: index === 0 ? 'none' : `1px solid ${SURFACE.border}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <Tag>{route}</Tag>
                  <span style={{ fontSize: 13, color: SURFACE.muted }}>{team}</span>
                </div>
                <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, color: SURFACE.ink, marginBottom: 4 }}>
                  {title}
                </p>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: SURFACE.text }}>
                  Eigenaar en reviewdatum horen hier samen zichtbaar te blijven.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'start' }}>
                <Tag tone="accent">{status}</Tag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Interactive report preview ───────────────────────────────────
type TabId = 'samenvatting' | 'themas' | 'rapportage'

function SamenvattingTab() {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 120); return () => clearTimeout(t) }, [])
  const rows = [
    { label: 'Groei en ontwikkeling', tag: 'Hoog',     tagBg: AC.faint,                  tagColor: AC.deep,             delay: 0 },
    { label: 'Werkdruk in operatie',  tag: 'Verhoogd', tagBg: 'oklch(.88 .06 75 / .32)', tagColor: 'oklch(.40 .12 65)', delay: .07 },
    { label: 'Loopbaanperspectief',   tag: 'Aandacht', tagBg: T.tealFaint,               tagColor: T.teal,              delay: .14 },
  ]
  const kpis = [
    { label: 'Vertrekrisico',  disp: '12%',  sub: '+1.4 pp',          subColor: T.inkMuted },
    { label: 'Engagement',     disp: '7,4',  sub: 'Stabiel',          subColor: T.inkMuted },
    { label: 'Behoud +12 mnd', disp: '+3,1', sub: 'Positief signaal', subColor: AC.deep },
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
        {themes.map((th, i) => (
          <div key={i} style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(6px)', transition: `opacity .5s ease ${i * .07}s, transform .5s cubic-bezier(.16,1,.3,1) ${i * .07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: T.ink, fontWeight: 500 }}>{th.label}</span>
              <span style={{ color: T.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{th.pct}%</span>
            </div>
            <div style={{ height: 5, background: T.paperSoft, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: th.color, width: ready ? `${th.pct}%` : '0%', transition: `width .8s cubic-bezier(.4,0,0,1) ${.1 + i * .08}s` }} />
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
        {[
          { label: 'PDF-rapport', bg: T.paperSoft, color: T.inkSoft, bold: false },
          { label: 'Dashboard',   bg: AC.faint,    color: AC.deep,   bold: true },
          { label: 'Presentatie', bg: T.paperSoft, color: T.inkSoft, bold: false },
        ].map((b, i) => (
          <div key={i} style={{ flex: 1, padding: '9px 12px', background: b.bg, fontSize: 12, color: b.color, fontWeight: b.bold ? 600 : 400, opacity: ready ? 1 : 0, transition: `opacity .4s ease ${.45 + i * .06}s` }}>{b.label}</div>
        ))}
      </div>
    </div>
  )
}

void ActionCenterSuitePreview

function DashboardPreview() {
  const [tab, setTab] = useState<TabId>('samenvatting')
  const tabs: { id: TabId; label: string }[] = [
    { id: 'samenvatting', label: 'Samenvatting' },
    { id: 'themas',       label: "Thema's" },
    { id: 'rapportage',   label: 'Rapportage' },
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
        {tab === 'themas'       && <ThemasTab />}
        {tab === 'rapportage'   && <RapportageTab />}
      </div>
    </div>
  )
}

function HeroSection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })

  return (
    <section style={{ background: T.white, position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}50 1px,transparent 1px),linear-gradient(90deg,${T.rule}50 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.28 }} />
      <div style={{ position: 'absolute', top: -120, right: -80, width: 600, height: 600, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none', animation: 'ctaPulse 6s ease-in-out infinite' }} />

      <div style={{ ...SHELL, position: 'relative', paddingTop: 'clamp(56px,7vw,88px)', paddingBottom: 'clamp(56px,7vw,88px)' }}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_520px] lg:gap-16 xl:grid-cols-[1fr_560px] xl:gap-20 items-start">

          {/* ── Left: text ───────────────────────────────── */}
          <div>
            <Reveal delay={0.02}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: T.inkFaint }}>Verisight</span>
                <span style={{ fontSize: 9.5, color: T.rule }}>—</span>
                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint }}>People suite</span>
              </div>
            </Reveal>

            <Reveal delay={0.07}>
              <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(44px,6.2vw,84px)', lineHeight: 0.95, letterSpacing: '-.034em', color: T.ink, marginBottom: 20 }}>
                Van people insights
                <br />
                <em className="shimmer-text" style={{ fontStyle: 'italic' }}>naar prioriteit,</em>
                <br />
                actie en opvolging.
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                {['Inzicht', 'Prioriteit', 'Actie', 'Toewijzing', 'Opvolging'].map((step, i, arr) => (
                  <span key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: i === 0 ? AC.deep : i === arr.length - 1 ? T.teal : T.inkFaint }}>
                      {step}
                    </span>
                    {i < arr.length - 1 && <span style={{ fontSize: 10, color: T.rule, lineHeight: 1 }}>→</span>}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{ fontSize: 16, lineHeight: 1.76, color: T.inkSoft, maxWidth: '44ch', marginBottom: 32 }}>
                Verisight helpt HR en management zien wat speelt, bepalen wat eerst telt en opvolging daadwerkelijk organiseren. Dashboard, rapport en Action Center — van eerste inzicht tot aantoonbare actie.
              </p>
            </Reveal>

            <Reveal delay={0.26}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                <Link href={ctaHref}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '13px 30px', color: '#fff', background: T.ink, transition: 'background .18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = AC.deep }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.ink }}>
                  Plan suite-demo <Arrow />
                </Link>
                <Link href="/#suite"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 500, padding: '12px 28px', color: T.inkSoft, border: `1px solid ${T.rule}`, transition: 'border-color .18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.inkMuted }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.rule }}>
                  Bekijk de suite
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', paddingTop: 22, borderTop: `1px solid ${T.rule}` }}>
                {[
                  { label: 'Eén suite-login', dot: T.tealMid },
                  { label: 'Action Center inbegrepen', dot: AC.mid },
                  { label: 'AVG-conform op groepsniveau', dot: T.tealMid },
                ].map(({ label, dot }) => (
                  <span key={label} style={{ fontSize: 11.5, color: T.inkFaint, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ── Right: interactive preview ───────────────── */}
          <Reveal delay={0.36} from="right">
            <DashboardPreview />
          </Reveal>

        </div>
      </div>
    </section>
  )
}

function SuitePreviewSection() {
  return (
    <section id="suite" style={{ background: SURFACE.paper, borderBottom: `1px solid ${SURFACE.border}` }}>
      <div style={{ ...SHELL, paddingTop: 'clamp(32px, 4vw, 48px)', paddingBottom: 'clamp(52px, 6vw, 78px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <SectionLabel index="02" label="Dashboard, rapport en Action Center" />
        </div>
        <DashboardPreview />
      </div>
    </section>
  )
}

function ValueSection() {
  const pillars = [
    {
      title: 'Dashboard',
      body: 'Begin met een first read van signalen, metrics en eerstvolgende focus. Niet alles tegelijk, wel genoeg om te sturen.',
    },
    {
      title: 'Rapport',
      body: 'Gebruik dezelfde waarheid compact in MT, directie of handoff. Minder ruis, meer besluitkracht.',
    },
    {
      title: 'Action Center',
      body: 'Maak acties expliciet, wijs verantwoordelijken toe en bewaak reviewmomenten zonder dat managers de volledige insightlaag hoeven te zien.',
    },
  ]

  return (
    <section style={{ background: SURFACE.surface, borderBottom: `1px solid ${SURFACE.border}` }}>
      <div style={{ ...SHELL, paddingTop: 'clamp(56px, 7vw, 84px)', paddingBottom: 'clamp(56px, 7vw, 84px)' }}>
        <SectionLabel index="03" label="Een suite, drie lagen" />
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2
              style={{
                fontFamily: displayFont,
                fontSize: 'clamp(34px, 4.4vw, 50px)',
                lineHeight: 1.02,
                letterSpacing: '-.03em',
                color: SURFACE.ink,
                marginBottom: 18,
                maxWidth: 460,
              }}
            >
              Niet alleen insight, maar ook prioriteit en opvolging.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: SURFACE.text, maxWidth: 540 }}>
              De waarde van Verisight zit in de samenhang. Eerst zie je wat speelt. Daarna bepaal je wat eerst telt. Dan
              wordt dezelfde managementlijn doorgezet in rapport en Action Center.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                style={{
                  border: `1px solid ${SURFACE.border}`,
                  borderRadius: 16,
                  background: SURFACE.surface,
                  padding: '18px 18px 20px',
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.16em',
                    textTransform: 'uppercase',
                    color: pillar.title === 'Action Center' ? SURFACE.amber : SURFACE.muted,
                    marginBottom: 10,
                  }}
                >
                  {pillar.title}
                </p>
                <p style={{ fontSize: 20, fontWeight: 600, color: SURFACE.ink, marginBottom: 10 }}>{pillar.title}</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: SURFACE.text }}>{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RoutesSection() {
  const primaryHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_routes_primary' })

  return (
    <section style={{ background: SURFACE.paper, borderBottom: `1px solid ${SURFACE.border}` }}>
      <div style={{ ...SHELL, paddingTop: 'clamp(56px, 7vw, 84px)', paddingBottom: 'clamp(56px, 7vw, 84px)' }}>
        <SectionLabel index="04" label="Eerste routes" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[
            {
              name: 'ExitScan',
              body: 'Voor vertrekduiding op groepsniveau. Zie waar werkfrictie en vertrekdruk samenkomen, en organiseer daarna bounded opvolging.',
            },
            {
              name: 'RetentieScan',
              body: 'Voor vroegsignalering op behoud. Zie waar behoud onder druk staat, bepaal de eerste prioriteit en leg vervolg direct vast in dezelfde suite.',
            },
          ].map((route) => (
            <div
              key={route.name}
              style={{
                border: `1px solid ${SURFACE.border}`,
                borderRadius: 18,
                background: SURFACE.surface,
                padding: '22px 22px 24px',
              }}
            >
              <Tag>{route.name}</Tag>
              <h3
                style={{
                  fontFamily: displayFont,
                  fontSize: 34,
                  lineHeight: 1.02,
                  letterSpacing: '-.03em',
                  color: SURFACE.ink,
                  marginTop: 16,
                  marginBottom: 12,
                }}
              >
                {route.name}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: SURFACE.text }}>{route.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ['Onboarding 30-60-90', 'Bounded peer route naast de kernroutes.'],
            ['Combinatie', 'Pas logisch als twee managementvragen tegelijk actief zijn.'],
            ['Pulse en Leadership', 'Compacte vervolgroutes na de eerste hoofdread.'],
          ].map(([title, body]) => (
            <div
              key={title}
              style={{
                border: `1px solid ${SURFACE.border}`,
                borderRadius: 14,
                background: SURFACE.surface,
                padding: '16px 18px',
              }}
            >
              <p style={{ fontSize: 18, fontWeight: 600, color: SURFACE.ink, marginBottom: 8 }}>{title}</p>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: SURFACE.text }}>{body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <Link
            href={primaryHref}
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              padding: '14px 24px',
              background: SURFACE.ink,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Bespreek de juiste eerste route
          </Link>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section style={{ background: SURFACE.surface, borderBottom: `1px solid ${SURFACE.border}` }}>
      <div style={{ ...SHELL, paddingTop: 'clamp(52px, 6vw, 76px)', paddingBottom: 'clamp(52px, 6vw, 76px)' }}>
        <SectionLabel index="05" label="Waarom dit geloofwaardig blijft" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            'Groepsniveau en expliciete privacygrenzen blijven leidend.',
            'Managers zien alleen de opvolglaag, niet automatisch de volledige insightlaag.',
            'Dashboard, rapport en Action Center dragen dezelfde bounded waarheid.',
            'Action Center is geen generiek workflowplatform, maar een gerichte follow-through laag.',
          ].map((item) => (
            <div
              key={item}
              style={{
                border: `1px solid ${SURFACE.border}`,
                borderRadius: 14,
                background: SURFACE.paper,
                padding: '16px 18px',
                fontSize: 14.5,
                lineHeight: 1.7,
                color: SURFACE.text,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section style={{ background: SURFACE.paper, padding: 'clamp(52px, 6vw, 76px) 0' }}>
      <div style={{ ...SHELL }}>
        <MarketingInlineContactPanel
          eyebrow="Plan suite-demo"
          title="Vertel kort welke managementvraag nu speelt."
          body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy, prijs en hoe dashboard, rapport en Action Center daarna samen werken."
          defaultRouteInterest="exitscan"
          defaultCtaSource="homepage_form"
        />
      </div>
    </section>
  )
}

export function HomePageContent() {
  return (
    <div style={{ background: SURFACE.paper, color: SURFACE.ink }}>
      <HeroSection />
      <SuitePreviewSection />
      <ValueSection />
      <RoutesSection />
      <TrustSection />
      <ContactSection />
    </div>
  )
}
