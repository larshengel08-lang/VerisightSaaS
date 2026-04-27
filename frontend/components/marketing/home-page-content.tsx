'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { buildContactHref } from '@/lib/contact-funnel'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'

const T = {
  paper: 'oklch(0.978 0.01 62)',
  paperSoft: 'oklch(0.956 0.018 60)',
  paperBlush: 'oklch(0.962 0.025 32)',
  white: '#FFFCF8',
  ink: 'oklch(0.16 0.012 250)',
  inkSoft: 'oklch(0.32 0.01 250)',
  inkMuted: 'oklch(0.52 0.008 250)',
  inkFaint: 'oklch(0.7 0.006 250)',
  rule: 'oklch(0.875 0.012 62)',
  teal: 'oklch(0.5 0.12 188)',
  tealMid: 'oklch(0.62 0.1 185)',
  tealSoft: 'oklch(0.94 0.04 185)',
  tealFaint: 'oklch(0.972 0.018 185)',
} as const

const AC = {
  deep: 'oklch(0.45 0.18 50)',
  mid: 'oklch(0.76 0.14 53)',
  light: 'oklch(0.86 0.1 55)',
  faint: 'oklch(0.976 0.018 50)',
} as const

const FF = 'var(--font-fraunces), serif'
const SHELL = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' } as const

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  const [ref, inView] = useInView(0.08)

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(18px)',
        transition: `opacity .7s ease ${delay}s, transform .7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SectionMark({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
      <span style={{ fontFamily: FF, fontSize: 11, color: T.inkFaint, minWidth: 18 }}>{num}</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: T.inkMuted,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: T.rule }} />
    </div>
  )
}

function DashboardPreview() {
  const [tab, setTab] = useState<'overview' | 'signals' | 'report'>('overview')
  const cards = [
    { label: 'Vertrekdruk', value: '6,4', detail: '3 thema`s gestegen', tone: 'oklch(0.86 0.05 18)' },
    { label: 'Behoudsdruk', value: '3,1', detail: 'Stabiel in 4 teams', tone: T.rule },
    { label: 'Teams met aandacht', value: '4', detail: 'Sinds vorig kwartaal', tone: 'oklch(0.88 0.03 18)' },
  ]

  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.rule}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 24px 60px -24px rgba(20,14,10,.24)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: T.paperSoft,
          borderBottom: `1px solid ${T.rule}`,
        }}
      >
        {[
          ['overview', 'Overview'],
          ['signals', 'Signalen'],
          ['report', 'Rapport'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as 'overview' | 'signals' | 'report')}
            style={{
              border: 'none',
              background: tab === id ? T.white : 'transparent',
              color: tab === id ? T.ink : T.inkMuted,
              fontSize: 12,
              fontWeight: tab === id ? 600 : 500,
              padding: '7px 12px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: T.inkMuted }}>ExitScan - Q3 2025</div>
      </div>
      <div style={{ padding: '22px 24px 24px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 10 }}>
          Samenvatting · gegroepeerde inzichten
        </div>
        <div style={{ fontFamily: FF, fontSize: 28, lineHeight: 1.08, color: T.ink, maxWidth: '13ch', marginBottom: 16 }}>
          Wat staat er deze maand op de bestuurstafel.
        </div>
        <div style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.7, marginBottom: 18 }}>
          Een rustige eerste read van wat opvalt, wat eerst telt en welke managementfocus nu logisch is.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 18 }}>
          {cards.map((card) => (
            <div key={card.label} style={{ border: `1px solid ${T.rule}`, background: T.white, padding: '14px 16px', borderLeft: `3px solid ${card.tone}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', color: T.inkMuted, marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontFamily: FF, fontSize: 28, color: T.ink, lineHeight: 1, marginBottom: 6 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: T.inkSoft }}>{card.detail}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(280px,.75fr)', gap: 14 }}>
          <div style={{ border: `1px solid ${T.rule}`, background: T.white, padding: '18px 18px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 10 }}>
              Wat valt op
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ fontFamily: FF, fontSize: 34, lineHeight: 1, color: T.tealMid }}>01</span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Werkdruk neemt toe binnen Operations.</div>
                <div style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.7 }}>
                  Drie teams laten een gegroepeerde stijging zien in vertreksignalen. Dat maakt dit de eerste managementfocus.
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: T.ink, color: '#fff', padding: '18px 18px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.light, marginBottom: 12 }}>
              Aanbevolen focus
            </div>
            <div style={{ fontFamily: FF, fontSize: 22, lineHeight: 1.12, marginBottom: 14 }}>
              Aanbevolen eerste managementfocus.
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,.78)' }}>
              Bespreek werkdrukpieken in Operations en gebruik het rapport als managementread voor het eerstvolgende MT-overleg.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionCenterPreview() {
  const rows = [
    {
      route: 'ExitScan',
      team: 'Customer Care',
      title: 'Vertrekredenen Customer Care bespreken in MT',
      detail: "Patroon 'werkdruk & planning' (4 van 6 exits, Q1)",
      state: 'Te bespreken',
      stateBg: T.tealFaint,
      stateColor: T.teal,
      review: 'review 28 apr',
    },
    {
      route: 'RetentieScan',
      team: 'Field Service',
      title: 'Retentierisico Field Service: roosterpilot opstarten',
      detail: 'Risicoscore 7,4 / 10 (Field Service)',
      state: 'Geblokkeerd',
      stateBg: 'oklch(0.95 0.03 28)',
      stateColor: 'oklch(0.62 0.16 28)',
      review: 'review 28 apr',
    },
  ]

  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.rule}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 20px 52px -22px rgba(20,14,10,.18)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: T.paperSoft, borderBottom: `1px solid ${T.rule}` }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted }}>Action Center</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 170, height: 34, border: `1px solid ${T.rule}`, background: T.white, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 11.5, color: T.inkMuted }}>
            Zoek actie, team of eigenaar
          </div>
          <div style={{ background: T.ink, color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '8px 14px' }}>Actie aanmaken</div>
        </div>
      </div>
      <div style={{ padding: '18px 20px 22px' }}>
        <div style={{ fontFamily: FF, fontSize: 18, color: T.ink, marginBottom: 10, letterSpacing: '-.02em' }}>Van inzicht naar opvolging.</div>
        <div style={{ fontSize: 13, lineHeight: 1.65, color: T.inkSoft, marginBottom: 18 }}>
          Houd zichtbaar wat aandacht vraagt, wie het oppakt en wanneer het terugkomt.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, marginBottom: 18 }}>
          {[
            { label: 'Acties open', value: '23', detail: '3 nieuw deze week', tone: T.rule },
            { label: 'Te bespreken', value: '6', detail: 'deze week', tone: 'oklch(0.82 0.12 53)' },
            { label: 'Geblokkeerd', value: '2', detail: 'vraagt actie', tone: 'oklch(0.72 0.16 28)' },
          ].map((item) => (
            <div key={item.label} style={{ border: `1px solid ${T.rule}`, background: T.white, padding: '12px 14px', borderLeft: `3px solid ${item.tone}` }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 7 }}>{item.label}</div>
              <div style={{ fontFamily: FF, fontSize: 25, color: T.ink, lineHeight: 1, marginBottom: 6 }}>{item.value}</div>
              <div style={{ fontSize: 10.5, color: T.inkSoft }}>{item.detail}</div>
            </div>
          ))}
        </div>
        <div style={{ border: `1px solid ${T.rule}`, background: T.white }}>
          {rows.map((row, index) => (
            <div key={row.title} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '14px 16px', borderTop: index === 0 ? 'none' : `1px solid ${T.rule}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                  <span style={{ border: `1px solid ${T.rule}`, background: T.paperSoft, padding: '2px 8px', fontSize: 10.5, color: T.inkMuted }}>{row.route}</span>
                  <span style={{ fontSize: 11.5, color: T.inkMuted }}>{row.team}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 5 }}>{row.title}</div>
                <div style={{ fontSize: 12, color: T.inkSoft }}>{row.detail}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ padding: '4px 10px', fontSize: 10.5, fontWeight: 600, color: row.stateColor, background: row.stateBg }}>{row.state}</span>
                <span style={{ fontSize: 11.5, color: T.inkMuted }}>{row.review}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })

  const flowSteps = [
    { label: 'Inzicht', accent: true },
    { label: 'Prioriteit', accent: false },
    { label: 'Actie', accent: false },
    { label: 'Toewijzing', accent: false },
    { label: 'Opvolging', teal: true },
  ]

  return (
    <section
      style={{
        background: T.white,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${T.rule}`,
      }}
    >
      {/* Grid texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `linear-gradient(${T.rule}70 1px,transparent 1px),linear-gradient(90deg,${T.rule}70 1px,transparent 1px)`,
          backgroundSize: '72px 72px',
          opacity: 0.38,
        }}
      />
      {/* Ambient glow top-right */}
      <div
        style={{
          position: 'absolute',
          top: -140,
          right: -100,
          width: 700,
          height: 700,
          background: `radial-gradient(circle,${AC.faint} 0%,transparent 62%)`,
          pointerEvents: 'none',
        }}
      />
      {/* Ambient glow bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          left: -60,
          width: 480,
          height: 480,
          background: `radial-gradient(circle,${T.tealFaint} 0%,transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Text block ─────────────────────────────────────── */}
      <div
        style={{
          ...SHELL,
          position: 'relative',
          paddingTop: 'clamp(52px,6.5vw,80px)',
          paddingBottom: 'clamp(40px,5vw,60px)',
        }}
      >
        <Reveal delay={0.02}>
          <SectionMark num="01" label="People suite · inzicht en opvolging" />
        </Reveal>

        {/* Headline — full width, dominant */}
        <Reveal delay={0.07}>
          <h1
            style={{
              fontFamily: FF,
              fontWeight: 400,
              fontSize: 'clamp(54px,7.8vw,104px)',
              lineHeight: 0.93,
              letterSpacing: '-.038em',
              color: T.ink,
              marginBottom: 24,
              maxWidth: '18ch',
            }}
          >
            Van people insights
            <br />
            <em className="shimmer-text" style={{ fontStyle: 'italic' }}>
              naar prioriteit,
            </em>
            <br />
            actie en opvolging.
          </h1>
        </Reveal>

        {/* Flow chain */}
        <Reveal delay={0.14}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 30 }}>
            {flowSteps.map((step, i) => (
              <span key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    padding: '4px 11px',
                    color: step.accent ? AC.deep : step.teal ? T.teal : T.inkMuted,
                    background: step.accent ? AC.faint : step.teal ? T.tealFaint : 'transparent',
                    border: `1px solid ${step.accent ? AC.light : step.teal ? T.tealSoft : T.rule}`,
                  }}
                >
                  {step.label}
                </span>
                {i < flowSteps.length - 1 && (
                  <span style={{ color: T.inkFaint, fontSize: 13, lineHeight: 1 }}>→</span>
                )}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Supporting copy — wider, Action Center explicit */}
        <Reveal delay={0.2}>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.72,
              color: T.inkSoft,
              maxWidth: '60ch',
              marginBottom: 34,
            }}
          >
            Verisight helpt HR en management sneller zien wat speelt, bepalen wat eerst telt en — met het{' '}
            <strong style={{ color: T.ink, fontWeight: 600 }}>Action Center</strong> — acties expliciet maken, toewijzen
            aan managers en opvolging bewaken. Dashboard, rapport en Action Center in één suite.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={0.26}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 34 }}>
            <Link
              href={ctaHref}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 14.5,
                fontWeight: 600,
                padding: '13px 30px',
                color: '#fff',
                background: T.ink,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = AC.deep }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.ink }}
            >
              Plan suite-demo <Arrow />
            </Link>
            <Link
              href="/#suite"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 14.5,
                fontWeight: 500,
                padding: '12px 28px',
                color: T.inkSoft,
                border: `1px solid ${T.rule}`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.inkMuted }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.rule }}
            >
              Bekijk de suite
            </Link>
          </div>
        </Reveal>

        {/* Trust pills */}
        <Reveal delay={0.32}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', paddingTop: 22, borderTop: `1px solid ${T.rule}` }}>
            {[
              { label: 'Eén suite-login', dot: T.tealMid },
              { label: 'Action Center follow-through', dot: AC.mid },
              { label: 'AVG-conform op groepsniveau', dot: T.tealMid },
            ].map(({ label, dot }) => (
              <span key={label} style={{ fontSize: 11.5, color: T.inkFaint, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ── Suite preview — direct under text ──────────────── */}
      <div style={{ background: T.paperSoft, borderTop: `1px solid ${T.rule}` }}>
        <div style={{ ...SHELL, paddingTop: 'clamp(32px,4vw,48px)', paddingBottom: 'clamp(40px,5vw,60px)' }}>
          {/* Suite label bar */}
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: T.inkFaint, whiteSpace: 'nowrap' }}>
                Suite-preview
              </span>
              <div style={{ flex: 1, height: 1, background: T.rule }} />
              <span style={{ fontSize: 11.5, color: T.inkMuted, whiteSpace: 'nowrap' }}>Dashboard · Rapport · Action Center</span>
            </div>
          </Reveal>

          {/* Two-column preview */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Reveal delay={0.34}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: T.teal,
                  }}
                >
                  <span style={{ width: 6, height: 6, background: T.tealMid, display: 'inline-block', flexShrink: 0 }} />
                  Dashboard & Rapport — inzicht en prioriteit
                </div>
                <DashboardPreview />
              </div>
            </Reveal>
            <Reveal delay={0.42}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: AC.deep,
                  }}
                >
                  <span style={{ width: 6, height: 6, background: AC.deep, display: 'inline-block', flexShrink: 0 }} />
                  Action Center — actie, toewijzing en opvolging
                </div>
                <ActionCenterPreview />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeSection() {
  const items = [
    { text: 'ExitScan', serif: true },
    { text: 'Vertrekduiding', serif: false },
    { text: 'RetentieScan', serif: true },
    { text: 'Behoudsignalering', serif: false },
    { text: 'Dashboard', serif: true },
    { text: 'Rapport', serif: false },
    { text: 'Action Center', serif: true },
    { text: 'Opvolging', serif: false },
  ]

  return (
    <div style={{ background: T.ink, padding: '13px 0', overflow: 'hidden', borderTop: `1px solid ${T.rule}40`, borderBottom: `1px solid ${T.rule}40` }}>
      <div style={{ display: 'flex', animation: 'marqueeScroll 28s linear infinite', width: 'max-content' }}>
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item.text}-${index}`}
            style={{
              whiteSpace: 'nowrap',
              padding: '0 18px',
              fontSize: item.serif ? 16 : 10,
              fontFamily: item.serif ? FF : 'inherit',
              fontWeight: item.serif ? 400 : 700,
              fontStyle: item.serif ? 'italic' : 'normal',
              letterSpacing: item.serif ? '-.01em' : '.16em',
              textTransform: item.serif ? 'none' : 'uppercase',
              color: item.serif ? AC.light : 'rgba(255,255,255,.28)',
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  )
}

function SuiteSection() {
  const pillars = [
    {
      label: 'Dashboard',
      title: 'Zie wat er speelt.',
      body: 'Geaggregeerde signalen, metrics en eerste prioriteiten per route, zonder losse ruwe data of dashboardruis.',
    },
    {
      label: 'Rapport',
      title: 'Deel de managementread.',
      body: 'Een compacte handoff voor HR, MT en directie die dezelfde waarheid vertelt als de suite zelf.',
    },
    {
      label: 'Action Center',
      title: 'Organiseer de opvolging.',
      body: 'HR kan acties expliciet toewijzen, managers per afdeling laten opvolgen en reviewmomenten bewaken zonder dat managers survey-inzicht hoeven te krijgen.',
    },
  ]

  return (
    <section id="suite" style={{ background: T.paperSoft, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ ...SHELL }}>
        <Reveal delay={0.04}>
          <SectionMark num="02" label="Eén suite, drie lagen" />
        </Reveal>
        <div className="grid grid-cols-1 gap-16 xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] xl:gap-18 items-start">
          <div>
            <Reveal delay={0.08}>
              <h2 style={{ fontFamily: FF, fontSize: 'clamp(30px,3.8vw,46px)', fontWeight: 400, lineHeight: 1.06, letterSpacing: '-.026em', color: T.ink, maxWidth: '13ch', marginBottom: 18 }}>
                Een people suite die niet stopt bij inzicht.
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p style={{ fontSize: 15.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '44ch', marginBottom: 34 }}>
                Verisight opent met twee people-insight routes, maar de waarde eindigt niet bij de eerste scan. Dashboard, rapport en Action Center blijven samen dezelfde managementlijn dragen.
              </p>
            </Reveal>
            <div style={{ display: 'grid', gap: 12 }}>
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.label} delay={0.18 + index * 0.08}>
                  <div style={{ border: `1px solid ${T.rule}`, background: T.white, padding: '18px 20px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: pillar.label === 'Action Center' ? AC.deep : T.inkMuted, marginBottom: 10 }}>
                      {pillar.label}
                    </div>
                    <div style={{ fontFamily: FF, fontSize: 24, lineHeight: 1.12, color: T.ink, marginBottom: 10 }}>{pillar.title}</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft }}>{pillar.body}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            <Reveal delay={0.12}>
              <DashboardPreview />
            </Reveal>
            <Reveal delay={0.2}>
              <ActionCenterPreview />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function RoutesSection() {
  const coreRoutes = [
    {
      eyebrow: 'Kernroute',
      title: 'ExitScan',
      body: 'Terugkijkende vertrekduiding op groepsniveau, met werkfactoren, eerste managementfocus en bounded vervolg.',
      bullets: ['Vertrekredenen op themaniveau', 'Patronen per team of afdeling', 'Dashboard, rapport en Action Center als follow-through'],
      href: '/producten/exitscan',
      color: AC.deep,
    },
    {
      eyebrow: 'Kernroute',
      title: 'RetentieScan',
      body: 'Vroegsignalering op behoud op groeps- en segmentniveau, met retentiesignaal, managementread en opvolging in dezelfde suite.',
      bullets: ['Stay-intent en vertrekintentie', 'Signalen per team of segment', 'Dashboard, rapport en Action Center als reviewritme'],
      href: '/producten/retentiescan',
      color: T.teal,
    },
  ]

  const boundedRoutes = [
    { label: 'Bounded peer', title: 'Onboarding 30-60-90', body: 'Vroege lifecycle-check naast de kernroutes, niet als brede suite op zichzelf.', href: '/producten/onboarding-30-60-90' },
    { label: 'Portfolioroute', title: 'Combinatie', body: 'Voeg pas een tweede route toe wanneer beide managementvragen echt actief zijn.', href: '/producten/combinatie' },
    { label: 'Vervolgroute', title: 'Pulse + Leadership', body: 'Compacte review en extra managementduiding na de eerste scan of eerste actie, terwijl managers alleen de opvolglaag zien.', href: '/producten' },
  ]

  return (
    <section style={{ background: T.white, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ ...SHELL }}>
        <Reveal delay={0.04}>
          <SectionMark num="03" label="Eerste routes" />
        </Reveal>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end mb-12">
          <Reveal delay={0.08}>
            <h2 style={{ fontFamily: FF, fontSize: 'clamp(30px,3.6vw,44px)', fontWeight: 400, lineHeight: 1.06, letterSpacing: '-.026em', color: T.ink, maxWidth: '15ch' }}>
              Kies eerst de managementvraag. De suite erachter blijft dezelfde.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
              ExitScan en RetentieScan blijven de twee eerste routes. Daarna delen dashboard, rapport en Action Center dezelfde bounded follow-through laag.
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {coreRoutes.map((route, index) => (
            <Reveal key={route.title} delay={0.18 + index * 0.08}>
              <div style={{ border: `1px solid ${T.rule}`, background: T.white, padding: '24px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: route.color }}>{route.eyebrow}</span>
                  <div style={{ flex: 1, height: 1, background: T.rule }} />
                </div>
                <div style={{ fontFamily: FF, fontSize: 36, lineHeight: 1.04, letterSpacing: '-.025em', color: T.ink, marginBottom: 12 }}>{route.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.72, color: T.inkSoft, marginBottom: 16 }}>{route.body}</div>
                <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
                  {route.bullets.map((bullet) => (
                    <div key={bullet} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.inkSoft }}>
                      <span style={{ width: 4, height: 4, background: route.color, display: 'inline-block', flexShrink: 0 }} />
                      {bullet}
                    </div>
                  ))}
                </div>
                <Link href={route.href} style={{ fontSize: 13, fontWeight: 600, color: route.color, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Bekijk {route.title} <Arrow />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: 18, borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}` }}>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {boundedRoutes.map((route, index) => (
              <Reveal key={route.title} delay={0.24 + index * 0.06}>
                <div style={{ padding: '18px 22px', borderRight: index < boundedRoutes.length - 1 ? `1px solid ${T.rule}` : 'none' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 7 }}>{route.label}</div>
                  <div style={{ fontFamily: FF, fontSize: 22, lineHeight: 1.12, color: T.ink, marginBottom: 8 }}>{route.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: T.inkSoft, marginBottom: 12 }}>{route.body}</div>
                  <Link href={route.href} style={{ fontSize: 12.5, fontWeight: 600, color: T.teal, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
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

function TrustSection() {
  const items = [
    'Groepsniveau en expliciete n-grenzen',
    'Geen individuele voorspellingen of performanceframing',
    'Dashboard, rapport en Action Center vertellen dezelfde bounded waarheid',
    'Managers kunnen na HR-toewijzing alleen de opvolglaag zien',
    'AVG-conform en begeleid in plaats van losse surveysoftware',
  ]

  return (
    <section style={{ background: T.paperBlush, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={{ ...SHELL }}>
        <Reveal delay={0.04}>
          <SectionMark num="04" label="Vertrouwen en privacy" />
        </Reveal>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[280px_1fr] lg:gap-20 items-start">
          <Reveal delay={0.08}>
            <div>
              <h2 style={{ fontFamily: FF, fontSize: 'clamp(28px,3.2vw,38px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-.022em', color: T.ink, marginBottom: 16 }}>
                Een bounded suite,
                <br />
                geen schijnzekerheid.
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.72, color: T.inkSoft, marginBottom: 18 }}>
                De publieke trustlaag moet laten zien waarom inzichten, rapport en opvolging samen geloofwaardig blijven.
              </p>
              <Link href="/vertrouwen" style={{ fontSize: 13, fontWeight: 600, color: T.teal, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Meer over vertrouwen <Arrow />
              </Link>
            </div>
          </Reveal>
          <div>
            {items.map((item, index) => (
              <Reveal key={item} delay={0.12 + index * 0.07}>
                <div style={{ display: 'flex', gap: 18, padding: '18px 0', borderTop: `1px solid ${T.rule}` }}>
                  <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, minWidth: 24 }}>{`0${index + 1}`}</span>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: T.inkSoft }}>{item}</div>
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

function CTASection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_cta' })

  return (
    <section
      style={{
        padding: 'clamp(72px,9vw,120px) 0',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,oklch(.13 .032 250) 0%,oklch(.1 .022 244) 50%,oklch(.13 .032 250) 100%)',
      }}
    >
      <div style={{ ...SHELL, textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 820 }}>
        <Reveal>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.32)', marginBottom: 24 }}>
            05 · Volgende stap
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 style={{ fontFamily: FF, fontSize: 'clamp(36px,5.5vw,64px)', fontWeight: 400, letterSpacing: '-.03em', color: '#fff', lineHeight: 1, marginBottom: 22 }}>
            Plan een suite-demo
            <br />
            <em style={{ fontStyle: 'italic', fontWeight: 300, color: AC.light }}>en maak de juiste route scherp.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(255,255,255,.6)', maxWidth: '42ch', margin: '0 auto 38px' }}>
            In een suite-demo toetsen we niet alleen welke scan past, maar ook hoe prioritering, actie en follow-through daarna bounded samenkomen.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={ctaHref} style={{ fontSize: 15, fontWeight: 700, color: T.ink, textDecoration: 'none', padding: '15px 36px', borderRadius: 999, background: AC.mid, display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              Plan suite-demo <Arrow />
            </Link>
            <Link href="/#suite" style={{ fontSize: 15, fontWeight: 500, borderRadius: 999, color: 'rgba(255,255,255,.78)', textDecoration: 'none', padding: '15px 30px', border: '1.5px solid rgba(255,255,255,.24)', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              Bekijk de suite
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0', borderTop: `1px solid ${T.rule}` }}>
      <div style={{ ...SHELL, maxWidth: 1180 }}>
        <MarketingInlineContactPanel
          eyebrow="Plan suite-demo"
          title="Vertel kort welke managementvraag nu speelt."
          body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy, prijs en welke opvolging daarna logisch wordt."
          defaultRouteInterest="exitscan"
          defaultCtaSource="homepage_form"
        />
      </div>
    </section>
  )
}

export function HomePageContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <MarqueeSection />
      <SuiteSection />
      <RoutesSection />
      <TrustSection />
      <CTASection />
      <ContactSection />
    </div>
  )
}
