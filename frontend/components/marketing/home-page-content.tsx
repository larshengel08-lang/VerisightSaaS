'use client'

import Link from 'next/link'
import { buildContactHref } from '@/lib/contact-funnel'

const SURFACE = {
  paper: '#f4e8df',
  paperSoft: '#f7eee7',
  surface: '#fffdf9',
  surfaceSoft: '#fbf7f2',
  border: '#d9cebf',
  borderSoft: '#e8ddd0',
  ink: '#162238',
  text: '#4e5d6f',
  muted: '#78818a',
  subtle: '#97a0ab',
  teal: '#1f958a',
  tealSoft: '#dff2ef',
  amber: '#b9571f',
  amberSoft: '#f4ddd0',
  amberGlow: '#e39a63',
  charcoal: '#0d1118',
  charcoalSoft: '#181e27',
} as const

const SHELL = {
  margin: '0 auto',
  maxWidth: 1240,
  padding: '0 clamp(20px, 4vw, 48px)',
} as const

const displayFont = 'var(--font-fraunces), Georgia, serif'
const bodyFont = 'var(--font-ibm-plex-sans), system-ui, sans-serif'

const heroTrustItems = [
  'Op groepsniveau',
  'Geen individuele voorspellingen',
  'Dashboard, samenvatting en rapport',
]

const marqueeLine = 'Van eerste inzicht naar concrete opvolging in dezelfde leeslijn'

const suiteFlowPoints = [
  {
    index: '01',
    title: 'Zie wat opvalt',
    body: 'Patronen en verschillen worden snel zichtbaar.',
  },
  {
    index: '02',
    title: 'Begrijp wat eerst telt',
    body: 'Niet alles tegelijk, maar focus op wat nu aandacht vraagt.',
  },
  {
    index: '03',
    title: 'Maak opvolging concreet',
    body: 'Leg vast wie iets oppakt en wat de eerste stap is.',
  },
  {
    index: '04',
    title: 'Plan het reviewmoment',
    body: 'Zo blijft inzicht niet hangen in rapportage.',
  },
]

const routeCards = [
  {
    index: '01',
    eyebrow: 'Vertrek & uitstroom',
    title: 'ExitScan',
    body: 'Begrijp waarom medewerkers vertrekken en welke patronen terugkomen. Helder beeld in weken, niet maanden.',
    accent: SURFACE.amber,
  },
  {
    index: '02',
    eyebrow: 'Behoud & vroegsignalering',
    title: 'RetentieScan',
    body: 'Zie waar behoud onder druk staat voordat het te laat is. Vroege signalering op groepsniveau.',
    accent: SURFACE.teal,
  },
  {
    index: '03',
    eyebrow: 'Onboarding',
    title: 'Onboarding 30-60-90',
    body: 'Zie vroeg hoe nieuwe medewerkers landen en waar uitval kan ontstaan.',
    accent: '#9b5f1e',
  },
]

const trustPrinciples = [
  'Verisight helpt patronen op groepsniveau zichtbaar maken, niet om individuele medewerkers te beoordelen.',
  'Dashboard, samenvatting en rapport dragen dezelfde managementlijn, zonder dat elk detail overal terug hoeft te komen.',
  'Methodologische zorgvuldigheid blijft zichtbaar in de output: patronen, geen grote causaliteitsclaims.',
  'Opvolging wordt concreet gemaakt, maar blijft een begeleid gesprek in plaats van een automatisch oordeel.',
]

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
      <span style={{ color: SURFACE.subtle, fontSize: 11 }}>{index}</span>
      <span
        style={{
          color: SURFACE.muted,
          fontFamily: bodyFont,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: SURFACE.border }} />
    </div>
  )
}

function BackdropNumber({ value, tone = 'warm' }: { value: string; tone?: 'warm' | 'cool' }) {
  const color = tone === 'cool' ? 'rgba(22, 34, 56, 0.04)' : 'rgba(185, 87, 31, 0.07)'

  return (
    <div
      aria-hidden
      style={{
        color,
        fontFamily: displayFont,
        fontSize: 'clamp(12rem, 22vw, 24rem)',
        fontWeight: 300,
        letterSpacing: '-0.08em',
        lineHeight: 0.8,
        pointerEvents: 'none',
        position: 'absolute',
        right: '-2vw',
        top: '20%',
        userSelect: 'none',
      }}
    >
      {value}
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

function Tag({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'accent' }) {
  const palette =
    tone === 'accent'
      ? { background: SURFACE.tealSoft, border: '#c5e0da', color: SURFACE.teal }
      : { background: SURFACE.surface, border: SURFACE.borderSoft, color: SURFACE.text }

  return (
    <span
      style={{
        alignItems: 'center',
        background: palette.background,
        border: `1px solid ${palette.border}`,
        borderRadius: 999,
        color: palette.color,
        display: 'inline-flex',
        fontFamily: bodyFont,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.12em',
        padding: '6px 12px',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  )
}

function OutputMetric({
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
        background: SURFACE.surfaceSoft,
        border: `1px solid ${SURFACE.border}`,
        padding: '16px 16px 18px',
      }}
    >
      <p
        style={{
          color: SURFACE.muted,
          fontFamily: bodyFont,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.16em',
          marginBottom: 10,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p
        className="dash-number"
        style={{
          color: SURFACE.ink,
          fontSize: 30,
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </p>
      <p style={{ color: SURFACE.text, fontSize: 13.5, lineHeight: 1.55 }}>{body}</p>
    </div>
  )
}

function MarqueeBand() {
  return (
    <section
      aria-label="Suite-leeslijn"
      style={{
        background: SURFACE.charcoal,
        borderBottom: `1px solid ${SURFACE.charcoalSoft}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ ...SHELL, paddingTop: 16, paddingBottom: 16 }}>
        <div
          style={{
            alignItems: 'center',
            color: '#efe5d8',
            display: 'flex',
            fontFamily: bodyFont,
            fontSize: 12,
            fontWeight: 700,
            justifyContent: 'center',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          <span>{marqueeLine}</span>
        </div>
      </div>
    </section>
  )
}

function HeroSection() {
  const primaryHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })
  const dashboardBars = [
    { height: '45%', color: '#f8e7dc' },
    { height: '62%', color: '#f3ba8e' },
    { height: '54%', color: '#ef944f' },
    { height: '84%', color: SURFACE.teal },
    { height: '100%', color: SURFACE.amber },
    { height: '88%', color: '#327f79' },
    { height: '70%', color: '#f6a55f' },
  ]
  const reportRows = [
    ['Groei en ontwikkeling', '82%', SURFACE.amber],
    ['Werkdruk in operatie', '54%', SURFACE.teal],
    ['Loopbaanperspectief', '28%', SURFACE.border],
  ] as const
  const actionItems = [
    ['Herzie mentorshipprogramma', 'Gevolg van: lage onboarding-score', 'Critical', '#d45a51', '#ffdad6'],
    ['Verifieer werkdruk in Operations', 'Besluit: eerste teamreview', 'Deze week', SURFACE.teal, '#dff2ef'],
  ] as const

  return (
    <section
      style={{
        background: `radial-gradient(circle at top right, rgba(244, 221, 208, 0.42) 0%, rgba(244, 221, 208, 0) 34%), linear-gradient(180deg, ${SURFACE.surface} 0%, ${SURFACE.paperSoft} 100%)`,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, paddingTop: 'clamp(74px, 8vw, 120px)', paddingBottom: 'clamp(70px, 8vw, 104px)', position: 'relative' }}>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_640px]">
          <div style={{ maxWidth: 560 }}>
            <div style={{ marginBottom: 18 }}>
              <p
                style={{
                  color: SURFACE.muted,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '.16em',
                  marginBottom: 20,
                  textTransform: 'uppercase',
                }}
              >
                Voor organisaties die sneller willen zien wat nu echt aandacht vraagt.
              </p>
              <h1
                style={{
                  color: SURFACE.ink,
                  fontFamily: displayFont,
                  fontSize: 'clamp(3.4rem, 5.2vw, 5.9rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.045em',
                  lineHeight: 0.98,
                  marginBottom: 0,
                }}
              >
                Zien.
                <br />
                <span style={{ color: SURFACE.amber, fontStyle: 'italic' }}>Prioriteren.</span>
                <br />
                Handelen.
              </h1>
            </div>

            <p
              style={{
                color: SURFACE.ink,
                fontSize: 17,
                lineHeight: 1.55,
                marginBottom: 14,
                maxWidth: '32rem',
              }}
            >
              Zie waar vertrek, behoud of vroege uitval aandacht vraagt. U krijgt geen losse data, maar een helder dashboard, een managementsamenvatting en een eerste actieroute.
            </p>

            <p
              style={{
                color: SURFACE.text,
                fontSize: 17,
                lineHeight: 1.6,
                marginBottom: 28,
                maxWidth: '32rem',
              }}
            >
              Verisight laat zien waar vertrek, behoud of vroege uitval echt aandacht vraagt. Geen losse surveydata, maar een scherp dashboard, een korte managementsamenvatting en een eerste route voor opvolging.
            </p>

            <div className="flex flex-wrap items-center gap-4" style={{ marginBottom: 34 }}>
              <Link
                href={primaryHref}
                style={{
                  background: SURFACE.amber,
                  borderRadius: 2,
                  color: '#fff',
                  display: 'inline-flex',
                  fontFamily: bodyFont,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '16px 28px',
                  textDecoration: 'none',
                }}
              >
                Bespreek de juiste eerste route
              </Link>
              <Link
                href="/#suite"
                style={{
                  background: SURFACE.surface,
                  border: `1px solid ${SURFACE.border}`,
                  borderRadius: 2,
                  color: SURFACE.ink,
                  display: 'inline-flex',
                  fontFamily: bodyFont,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '16px 28px',
                  textDecoration: 'none',
                }}
              >
                Bekijk voorbeeldoutput
              </Link>
            </div>

            <div
              style={{
                borderTop: `1px solid ${SURFACE.border}`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px 28px',
                paddingTop: 22,
              }}
            >
              {heroTrustItems.map((item, index) => (
                <div
                  key={item}
                  style={{
                    alignItems: 'center',
                    color: SURFACE.muted,
                    display: 'flex',
                    fontFamily: bodyFont,
                    fontSize: 13,
                    fontWeight: 500,
                    gap: 10,
                  }}
                >
                  {index === 1 ? (
                    <span style={{ color: SURFACE.teal, fontSize: 15, lineHeight: 1 }}>○</span>
                  ) : (
                    <span style={{ background: index === 0 ? '#d45a51' : SURFACE.amber, borderRadius: 999, height: 4, width: 4 }} />
                  )}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden h-[620px] select-none lg:block">
            <div
              style={{
                background: SURFACE.surface,
                border: `1px solid ${SURFACE.borderSoft}`,
                borderRadius: 8,
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                height: 286,
                padding: '24px 28px',
                position: 'absolute',
                right: 18,
                top: 0,
                width: 452,
                zIndex: 10,
              }}
            >
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
                <span />
                <span
                  style={{
                    background: SURFACE.tealSoft,
                    borderRadius: 4,
                    color: SURFACE.teal,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                  }}
                >
                  +12%
                </span>
              </div>

              <div style={{ alignItems: 'flex-end', display: 'flex', gap: 10, height: 132, marginBottom: 28 }}>
                {dashboardBars.map((bar) => (
                  <div
                    key={`${bar.height}-${bar.color}`}
                    style={{
                      background: bar.color,
                      borderRadius: '2px 2px 0 0',
                      flex: 1,
                      height: bar.height,
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div style={{ background: SURFACE.paperSoft, borderRadius: 999, height: 10, width: '100%' }} />
                <div style={{ background: SURFACE.paperSoft, borderRadius: 999, height: 10, width: '68%' }} />
              </div>
            </div>

            <div
              style={{
                background: '#fef8f1',
                border: `1px solid ${SURFACE.borderSoft}`,
                borderRadius: 4,
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                height: 360,
                overflow: 'hidden',
                padding: '30px 32px',
                position: 'absolute',
                left: 6,
                top: 118,
                width: 438,
                zIndex: 20,
              }}
            >
              <div style={{ borderBottom: `1px solid ${SURFACE.border}`, marginBottom: 22, paddingBottom: 14 }}>
                <h3
                  style={{
                    color: SURFACE.ink,
                    fontFamily: displayFont,
                    fontSize: 'clamp(2.2rem, 2.7vw, 3rem)',
                    fontWeight: 600,
                    letterSpacing: '-0.035em',
                    lineHeight: 0.98,
                    marginBottom: 6,
                    textWrap: 'balance',
                  }}
                >
                  Exit-analyse Q3
                </h3>
                <p style={{ color: SURFACE.muted, fontSize: 12.5, lineHeight: 1.5 }}>
                  Redenen van Vertrek - Senior Staff
                </p>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {reportRows.map(([label, value, color]) => (
                  <div key={label} style={{ alignItems: 'center', display: 'grid', gap: 14, gridTemplateColumns: 'minmax(0,1fr) 132px' }}>
                    <span style={{ color: SURFACE.ink, fontSize: 14, fontWeight: 500 }}>{label}</span>
                    <div style={{ background: color === SURFACE.border ? SURFACE.borderSoft : `${color}20`, borderRadius: 999, height: 4, overflow: 'hidden' }}>
                      <div style={{ background: color, borderRadius: 999, height: '100%', width: value }} />
                    </div>
                  </div>
                ))}
              </div>

              <p
                style={{
                  borderLeft: `2px solid ${SURFACE.amber}`,
                  color: SURFACE.ink,
                  fontFamily: displayFont,
                  fontSize: 18,
                  fontStyle: 'italic',
                  lineHeight: 1.65,
                  marginTop: 32,
                  paddingLeft: 16,
                }}
              >
                &ldquo;Op groepsniveau wordt zichtbaar wat nu prioriteit vraagt, zodat opvolging bestuurlijk eenvoudiger wordt.&rdquo;
              </p>
            </div>

            <div
              style={{
                background: SURFACE.charcoal,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18,
                boxShadow: '0 14px 34px rgba(13, 17, 24, 0.18)',
                color: '#fff',
                left: -28,
                padding: '24px 28px 22px',
                position: 'absolute',
                top: 346,
                width: 470,
                zIndex: 30,
              }}
            >
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ alignItems: 'center', display: 'flex', gap: 14 }}>
                  <div
                    style={{
                      alignItems: 'center',
                      background: SURFACE.amber,
                      borderRadius: 10,
                      boxShadow: '0 10px 22px rgba(185, 87, 31, 0.18)',
                      display: 'flex',
                      height: 40,
                      justifyContent: 'center',
                      width: 40,
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: 20, lineHeight: 1 }}>⚡</span>
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '.02em', marginBottom: 2, textTransform: 'uppercase' }}>
                      Action Center
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                      Prioriteit-gestuurde opvolging
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '4px 8px',
                    textTransform: 'uppercase',
                  }}
                >
                  3 taken
                </span>
              </div>

              <div style={{ display: 'grid', gap: 2, marginBottom: 18 }}>
                {actionItems.map(([title, body, badge, dotColor, badgeBg]) => (
                  <div
                    key={title}
                    style={{
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '14px 0',
                    }}
                  >
                    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
                      <span style={{ background: dotColor, borderRadius: 999, flexShrink: 0, height: 6, width: 6 }} />
                      <div>
                        <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{title}</p>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11.5 }}>{body}</p>
                      </div>
                    </div>
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: `1px solid ${badgeBg}30`,
                        borderRadius: 6,
                        color: badgeBg,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '4px 8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {badge}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
                  <div
                    style={{
                      alignItems: 'center',
                      background: SURFACE.teal,
                      borderRadius: 999,
                      color: '#fff',
                      display: 'flex',
                      fontSize: 11,
                      fontWeight: 700,
                      height: 28,
                      justifyContent: 'center',
                      width: 28,
                    }}
                  >
                    JD
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12 }}>
                    J. de Wit <span style={{ color: 'rgba(255,255,255,0.38)' }}>· VP Talent</span>
                  </p>
                </div>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    color: SURFACE.ink,
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '10px 16px',
                  }}
                >
                  Beheer opvolging
                </div>
              </div>
            </div>

            <div
              aria-hidden
              style={{
                background: 'rgba(245, 232, 220, 0.6)',
                borderRadius: '999px',
                filter: 'blur(100px)',
                height: '120%',
                left: '50%',
                position: 'absolute',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                zIndex: 0,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SuitePreviewSection() {
  return (
    <section
      id="suite"
      style={{
        background: `linear-gradient(180deg, ${SURFACE.paperSoft} 0%, ${SURFACE.paper} 100%)`,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <BackdropNumber value="02" />
      <div style={{ ...SHELL, paddingTop: 'clamp(54px, 6vw, 84px)', paddingBottom: 'clamp(62px, 7vw, 96px)', position: 'relative' }}>
        <SectionLabel index="02" label="Van inzicht naar eerste opvolging" />

        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(3rem, 5vw, 4.9rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 0.95,
                marginBottom: 22,
                maxWidth: '11.5ch',
                textWrap: 'pretty',
              }}
            >
              Geen losse rapportage.
              <br />
              <span style={{ color: SURFACE.amberGlow, fontStyle: 'italic', fontWeight: 300 }}>
                Wel een helder besluitspoor.
              </span>
            </h2>

            <p
              style={{
                color: SURFACE.text,
                fontSize: 16,
                lineHeight: 1.78,
                marginBottom: 34,
                maxWidth: '33rem',
              }}
            >
              Verisight brengt signalen samen in dashboard, samenvatting en rapport, en helpt vervolgens om prioriteit, eigenaar en eerste actie zichtbaar te maken.
            </p>

            <div style={{ borderTop: `1px solid ${SURFACE.border}`, display: 'grid', gap: 0 }}>
              {suiteFlowPoints.map((item) => (
                <div
                  key={item.index}
                  style={{
                    borderBottom: `1px solid ${SURFACE.border}`,
                    display: 'grid',
                    gap: 12,
                    gridTemplateColumns: '44px 1fr',
                    padding: '20px 0',
                  }}
                >
                  <span style={{ color: SURFACE.subtle, fontSize: 13 }}>{item.index}</span>
                  <div>
                    <p style={{ color: SURFACE.ink, fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{item.title}</p>
                    <p style={{ color: SURFACE.text, fontSize: 14.5, lineHeight: 1.72 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="suite-motion-shell">
              <div className="suite-phase-tabs" aria-label="Visual flow">
                {['Zien', 'Prioriteren', 'Handelen'].map((phase, index) => (
                  <span key={phase} className={`suite-phase-tab suite-phase-tab-${index + 1}`}>
                    {phase}
                  </span>
                ))}
              </div>

              <div className="suite-motion-stage">
                <div className="suite-motion-aura" aria-hidden />

                <div className="suite-motion-frame">
                  <div className="suite-motion-frame-head">
                    <div>
                      <p className="suite-phase-eyebrow">Motion graphic</p>
                      <p className="suite-motion-frame-title">Van zien naar eerste opvolging</p>
                    </div>

                    <div className="suite-motion-progress" aria-hidden>
                      <span className="suite-motion-progress-fill" />
                    </div>
                  </div>

                  <div className="suite-motion-window">
                    <div className="suite-motion-track">
                      <section className="suite-motion-screen suite-motion-screen-see">
                        <div className="suite-screen-head">
                          <p className="suite-phase-eyebrow">Eerste signalen</p>
                          <span className="suite-phase-chip suite-phase-chip-amber">Zien</span>
                        </div>

                        <div className="suite-phase-title">
                          <p>Signalen eerst</p>
                          <p className="suite-phase-title-accent">in beeld.</p>
                        </div>

                        <div className="suite-metrics-grid">
                          <OutputMetric label="Vertreksignaal" value="12%" body="+1.4 pp" />
                          <OutputMetric label="Betrokkenheid" value="7,4" body="Stabiel" />
                          <OutputMetric label="Behoudssignaal 12 mnd" value="+3,1" body="Positieve richting" />
                        </div>

                        <div className="suite-phase-list">
                          {[
                            ['01', 'Groei en ontwikkeling blijft achter', 'Operations en Finance', 'Direct', SURFACE.amberSoft, SURFACE.amber],
                            ['02', 'Werkdruk loopt op', 'Piekperiode in Operations', 'Verhoogd', '#f1dfcf', '#9a5b19'],
                            ['03', 'Loopbaanperspectief blijft achter', 'Organisatiebreed signaal', 'Aandacht', SURFACE.tealSoft, SURFACE.teal],
                          ].map(([index, title, body, badge, bg, color]) => (
                            <div key={title} className="suite-list-row">
                              <span className="suite-list-index">{index}</span>
                              <div>
                                <p className="suite-list-title">{title}</p>
                                <p className="suite-list-body">{body}</p>
                              </div>
                              <span className="suite-list-badge" style={{ background: String(bg), color: String(color) }}>
                                {badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="suite-motion-screen suite-motion-screen-prioritize">
                        <div className="suite-screen-head">
                          <p className="suite-phase-eyebrow">Finance Department</p>
                          <span className="suite-phase-chip suite-phase-chip-teal">Prioriteren</span>
                        </div>

                        <div className="suite-priority-spotlight">
                          <div>
                            <p className="suite-priority-title">Van breed signaal naar eerste prioriteit.</p>
                            <p className="suite-priority-theme">Leren &amp; ontwikkeling</p>
                            <p className="suite-priority-copy">
                              Binnen Finance komt dit signaal het sterkst terug. Daarom wordt dit het eerste gesprekspunt voor management.
                            </p>
                          </div>

                          <div className="suite-priority-note">
                            <div className="suite-priority-note-row">
                              <span>Afdeling</span>
                              <strong>Finance</strong>
                            </div>
                            <div className="suite-priority-note-row">
                              <span>Signaal</span>
                              <strong>Ontwikkelkansen blijven achter</strong>
                            </div>
                            <div className="suite-priority-note-row">
                              <span>Volgorde</span>
                              <strong>Eerste bespreking in MT</strong>
                            </div>
                          </div>
                        </div>

                        <div className="suite-priority-ladder">
                          {[
                            ['01', 'Groei en ontwikkeling blijft achter', 'Operations en Finance', 'Direct', SURFACE.amberSoft, SURFACE.amber],
                            ['02', 'Werkdruk loopt op', 'Piekperiode in Operations', 'Verhoogd', '#f1dfcf', '#9a5b19'],
                            ['03', 'Loopbaanperspectief blijft achter', 'Organisatiebreed signaal', 'Aandacht', SURFACE.tealSoft, SURFACE.teal],
                          ].map(([index, title, body, badge, bg, color]) => (
                            <div key={`${index}-${title}`} className={`suite-ladder-row ${index === '01' ? 'suite-ladder-row-active' : ''}`}>
                              <span className="suite-list-index">{index}</span>
                              <div>
                                <p className="suite-list-title">{title}</p>
                                <p className="suite-list-body">{body}</p>
                              </div>
                              <span className="suite-list-badge" style={{ background: String(bg), color: String(color) }}>
                                {badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="suite-motion-screen suite-motion-screen-act">
                        <div className="suite-action-panel">
                          <div className="suite-screen-head">
                            <p className="suite-phase-eyebrow">Action Center</p>
                            <span className="suite-phase-chip suite-phase-chip-dark">Handelen</span>
                          </div>

                          <div className="suite-action-head">
                            <div>
                              <p className="suite-action-title">Niet alleen zien.</p>
                              <p className="suite-action-accent">Ook handelen.</p>
                              <p className="suite-action-subcopy">Van prioriteit naar eerste concrete opvolging.</p>
                            </div>
                          </div>

                          <div className="suite-action-list">
                            {[
                              ['Prioriteit', 'Ontwikkelkansen blijven achter, Finance', 'Bevestigd'],
                              ['Eigenaar', 'HRBP Finance', 'Toegewezen'],
                              ['Eerste actie', 'Bespreken in teamoverleg, daarna verdiepend gesprek', 'Deze week'],
                              ['Reviewmoment', 'Hercheck over 21 dagen', 'Ingepland'],
                            ].map(([label, body, badge]) => (
                              <div key={label} className={`suite-action-row ${label === 'Prioriteit' ? 'suite-action-row-primary' : ''}`}>
                                <div>
                                  <p className="suite-action-label">{label}</p>
                                  <p className="suite-action-body">{body}</p>
                                </div>
                                <span className={`suite-action-badge ${badge === 'Deze week' ? 'suite-action-badge-urgent' : ''}`}>{badge}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, marginTop: 18 }}>
                <Tag tone="accent">Dashboard</Tag>
                <Tag>Samenvatting</Tag>
                <Tag>Rapport</Tag>
                <Tag>Action Center</Tag>
              </div>
              <p style={{ color: SURFACE.subtle, fontSize: 12.5 }}>
                Voorbeeldoutput is illustratief en gebaseerd op fictieve data.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          .suite-motion-shell {
            --suite-window-height: 592px;
            --suite-cycle-duration: 9s;
            position: relative;
          }

          .suite-phase-tabs {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 16px;
          }

          .suite-phase-tab {
            border: 1px solid ${SURFACE.border};
            border-radius: 999px;
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.12em;
            padding: 7px 12px;
            text-transform: uppercase;
          }

          .suite-phase-tab-1 {
            animation: suite-pill-see var(--suite-cycle-duration) infinite both;
            animation-timing-function: cubic-bezier(.65, 0, .35, 1);
          }

          .suite-phase-tab-2 {
            animation: suite-pill-prioritize var(--suite-cycle-duration) infinite both;
            animation-timing-function: cubic-bezier(.65, 0, .35, 1);
          }

          .suite-phase-tab-3 {
            animation: suite-pill-act var(--suite-cycle-duration) infinite both;
            animation-timing-function: cubic-bezier(.65, 0, .35, 1);
          }

          .suite-motion-stage {
            position: relative;
          }

          .suite-motion-aura {
            background: rgba(244, 221, 208, 0.56);
            border-radius: 999px;
            filter: blur(84px);
            height: 72%;
            position: absolute;
            right: 6%;
            top: 10%;
            width: 72%;
            z-index: 0;
          }

          .suite-motion-frame {
            backdrop-filter: blur(10px);
            background: rgba(255, 251, 247, 0.72);
            border: 1px solid ${SURFACE.borderSoft};
            box-shadow: 0 34px 78px rgba(19, 32, 51, 0.08);
            padding: 18px;
            position: relative;
            z-index: 1;
          }

          .suite-motion-frame-head {
            align-items: flex-end;
            display: flex;
            gap: 20px;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .suite-motion-frame-title {
            color: ${SURFACE.ink};
            font-family: ${displayFont};
            font-size: clamp(1.2rem, 1.7vw, 1.55rem);
            letter-spacing: -0.03em;
            line-height: 1;
            margin-top: 6px;
          }

          .suite-motion-progress {
            background: ${SURFACE.surface};
            border: 1px solid ${SURFACE.border};
            border-radius: 999px;
            flex-shrink: 0;
            height: 10px;
            overflow: hidden;
            position: relative;
            width: 148px;
          }

          .suite-motion-progress-fill {
            animation: suite-progress-flow var(--suite-cycle-duration) infinite both;
            animation-timing-function: cubic-bezier(.65, 0, .35, 1);
            background: linear-gradient(90deg, ${SURFACE.amber} 0%, ${SURFACE.teal} 100%);
            border-radius: inherit;
            height: 100%;
            left: 0;
            position: absolute;
            top: 0;
            width: 44px;
          }

          .suite-motion-window {
            background: ${SURFACE.surface};
            border: 1px solid ${SURFACE.border};
            height: var(--suite-window-height);
            overflow: hidden;
            position: relative;
          }

          .suite-motion-track {
            animation: suite-track-flow var(--suite-cycle-duration) infinite both;
            animation-timing-function: cubic-bezier(.65, 0, .35, 1);
            display: flex;
            flex-direction: column;
            will-change: transform;
          }

          .suite-motion-screen {
            background: linear-gradient(180deg, rgba(255, 251, 247, 0.98) 0%, rgba(247, 238, 231, 0.98) 100%);
            box-sizing: border-box;
            flex: 0 0 var(--suite-window-height);
            height: var(--suite-window-height);
            overflow: hidden;
            padding: 22px 24px 24px;
          }

          .suite-motion-screen-prioritize {
            background: linear-gradient(180deg, rgba(255, 250, 245, 0.98) 0%, rgba(247, 238, 231, 0.98) 100%);
          }

          .suite-motion-screen-act {
            background: linear-gradient(180deg, rgba(255, 250, 245, 0.98) 0%, rgba(246, 238, 231, 0.98) 100%);
          }

          .suite-screen-head,
          .suite-action-head {
            align-items: center;
            display: flex;
            gap: 18px;
            justify-content: space-between;
          }

          .suite-action-head {
            margin-bottom: 18px;
          }

          .suite-phase-eyebrow {
            color: ${SURFACE.muted};
            font-family: ${bodyFont};
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.18em;
            margin-bottom: 0;
            text-transform: uppercase;
          }

          .suite-phase-chip {
            border-radius: 999px;
            font-family: ${bodyFont};
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.14em;
            padding: 6px 10px;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .suite-phase-chip-amber {
            background: ${SURFACE.amberSoft};
            color: ${SURFACE.amber};
          }

          .suite-phase-chip-teal {
            background: ${SURFACE.tealSoft};
            color: ${SURFACE.teal};
          }

          .suite-phase-chip-dark {
            background: rgba(22, 34, 56, 0.08);
            color: ${SURFACE.ink};
          }

          .suite-phase-title {
            margin: 18px 0 22px;
          }

          .suite-phase-title p,
          .suite-action-title,
          .suite-action-accent {
            font-family: ${displayFont};
            font-size: clamp(2rem, 3vw, 2.7rem);
            letter-spacing: -0.04em;
            line-height: 0.98;
          }

          .suite-phase-title-accent,
          .suite-action-accent {
            color: ${SURFACE.amberGlow};
            font-style: italic;
            font-weight: 300;
          }

          .suite-metrics-grid {
            display: grid;
            gap: 8px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-bottom: 10px;
          }

          .suite-phase-list,
          .suite-priority-ladder,
          .suite-action-list {
            display: grid;
            gap: 8px;
          }

          .suite-list-row,
          .suite-ladder-row {
            align-items: center;
            background: ${SURFACE.surfaceSoft};
            display: grid;
            gap: 14px;
            grid-template-columns: 40px minmax(0, 1fr) auto;
            padding: 14px 16px;
          }

          .suite-ladder-row {
            background: rgba(255, 255, 255, 0.58);
            border: 1px solid ${SURFACE.borderSoft};
          }

          .suite-ladder-row-active {
            background: rgba(255, 248, 241, 0.96);
            border-color: rgba(191, 148, 110, 0.38);
            box-shadow: inset 0 0 0 1px rgba(185, 87, 31, 0.11);
          }

          .suite-list-index {
            color: ${SURFACE.subtle};
            font-size: 13px;
          }

          .suite-list-title {
            color: ${SURFACE.ink};
            font-family: ${bodyFont};
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 3px;
          }

          .suite-list-body {
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 13.5px;
            line-height: 1.5;
          }

          .suite-list-badge {
            font-family: ${bodyFont};
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.14em;
            padding: 5px 10px;
            text-transform: uppercase;
          }

          .suite-priority-spotlight {
            align-items: stretch;
            background: rgba(255, 252, 249, 0.88);
            border: 1px solid ${SURFACE.border};
            box-shadow: 0 24px 42px rgba(19, 32, 51, 0.06);
            display: grid;
            gap: 14px;
            grid-template-columns: minmax(0, 1.08fr) minmax(196px, 0.72fr);
            margin-top: 12px;
            padding: 16px 16px 18px;
          }

          .suite-priority-title {
            color: ${SURFACE.ink};
            font-family: ${displayFont};
            font-size: clamp(1.86rem, 2.5vw, 2.18rem);
            letter-spacing: -0.04em;
            line-height: 0.98;
            margin-bottom: 10px;
            max-width: 11ch;
          }

          .suite-priority-theme {
            color: ${SURFACE.teal};
            font-family: ${bodyFont};
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.16em;
            margin-bottom: 10px;
            text-transform: uppercase;
          }

          .suite-priority-copy {
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 14.5px;
            line-height: 1.68;
            max-width: 27ch;
          }

          .suite-priority-note {
            background: ${SURFACE.tealSoft};
            display: grid;
            gap: 10px;
            padding: 16px 16px 18px;
          }

          .suite-priority-note-row {
            align-items: baseline;
            display: flex;
            gap: 16px;
            justify-content: space-between;
          }

          .suite-priority-note-row span {
            color: ${SURFACE.teal};
            font-family: ${bodyFont};
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .suite-priority-note-row strong {
            color: ${SURFACE.ink};
            font-family: ${bodyFont};
            font-size: 14px;
            font-weight: 600;
            text-align: right;
          }

          .suite-action-panel {
            background: rgba(255, 252, 249, 0.9);
            border: 1px solid ${SURFACE.border};
            box-shadow: 0 24px 42px rgba(19, 32, 51, 0.06);
            box-sizing: border-box;
            height: 100%;
            padding: 22px 22px 24px;
          }

          .suite-action-title {
            color: ${SURFACE.ink};
          }

          .suite-action-subcopy {
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 14px;
            line-height: 1.68;
            margin-top: 10px;
            max-width: 31ch;
          }

          .suite-action-row {
            align-items: center;
            background: rgba(255, 255, 255, 0.62);
            border: 1px solid ${SURFACE.borderSoft};
            display: grid;
            gap: 12px;
            grid-template-columns: minmax(0, 1fr) auto;
            padding: 14px 16px;
          }

          .suite-action-row-primary {
            background: rgba(255, 248, 241, 0.96);
            border-color: rgba(191, 148, 110, 0.38);
            box-shadow: inset 0 0 0 1px rgba(185, 87, 31, 0.11);
          }

          .suite-action-label {
            color: ${SURFACE.muted};
            font-family: ${bodyFont};
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.14em;
            margin-bottom: 8px;
            text-transform: uppercase;
          }

          .suite-action-body {
            color: ${SURFACE.ink};
            font-family: ${bodyFont};
            font-size: 14px;
            line-height: 1.55;
          }

          .suite-action-badge {
            background: rgba(22, 34, 56, 0.06);
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            padding: 5px 8px;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .suite-action-badge-urgent {
            background: ${SURFACE.amberSoft};
            color: ${SURFACE.amber};
          }

          @keyframes suite-track-flow {
            0%, 33.2% {
              transform: translateY(0);
            }
            33.34%, 66.5% {
              transform: translateY(calc(var(--suite-window-height) * -1));
            }
            66.67%, 99.9% {
              transform: translateY(calc(var(--suite-window-height) * -2));
            }
            100% {
              transform: translateY(0);
            }
          }

          @keyframes suite-pill-see {
            0%, 33.2% {
              background: ${SURFACE.amberSoft};
              border-color: ${SURFACE.amberSoft};
              color: ${SURFACE.amber};
            }
            33.34%, 100% {
              background: transparent;
              border-color: ${SURFACE.border};
              color: ${SURFACE.text};
            }
          }

          @keyframes suite-pill-prioritize {
            0%, 33.2%,
            66.67%, 100% {
              background: transparent;
              border-color: ${SURFACE.border};
              color: ${SURFACE.text};
            }
            33.34%, 66.5% {
              background: ${SURFACE.tealSoft};
              border-color: #cbe7e2;
              color: ${SURFACE.teal};
            }
          }

          @keyframes suite-pill-act {
            0%, 66.5% {
              background: transparent;
              border-color: ${SURFACE.border};
              color: ${SURFACE.text};
            }
            66.67%, 99.9% {
              background: ${SURFACE.ink};
              border-color: ${SURFACE.ink};
              color: #fff7ef;
            }
            100% {
              background: transparent;
              border-color: ${SURFACE.border};
              color: ${SURFACE.text};
            }
          }

          @keyframes suite-progress-flow {
            0%, 33.2% {
              transform: translateX(0);
            }
            33.34%, 66.5% {
              transform: translateX(50px);
            }
            66.67%, 99.9% {
              transform: translateX(102px);
            }
            100% {
              transform: translateX(0);
            }
          }

          @media (max-width: 1180px) {
            .suite-motion-shell {
              --suite-window-height: 560px;
            }

            .suite-priority-spotlight {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 820px) {
            .suite-motion-shell {
              --suite-window-height: 620px;
            }

            .suite-metrics-grid,
            .suite-priority-spotlight {
              grid-template-columns: 1fr;
            }

            .suite-screen-head,
            .suite-action-head,
            .suite-motion-frame-head {
              align-items: flex-start;
              flex-direction: column;
            }

            .suite-motion-progress {
              width: 100%;
            }

            .suite-ladder-row,
            .suite-list-row,
            .suite-action-row {
              grid-template-columns: 1fr;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .suite-phase-tab-1,
            .suite-phase-tab-2,
            .suite-phase-tab-3,
            .suite-motion-track,
            .suite-motion-progress-fill {
              animation: none;
            }
          }
        `}</style>
      </div>
    </section>
  )
}

function RoutesSection() {
  const primaryHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_routes_primary' })

  return (
    <section
      style={{
        background: SURFACE.paperSoft,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <BackdropNumber value="04" />
      <div style={{ ...SHELL, paddingTop: 'clamp(58px, 7vw, 92px)', paddingBottom: 'clamp(58px, 7vw, 92px)', position: 'relative' }}>
        <SectionLabel index="04" label="Routes" />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.72fr)] xl:items-end">
          <div>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(3rem, 5vw, 4.85rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 0.95,
                marginBottom: 14,
                maxWidth: '11.5ch',
              }}
            >
              Kies de route
              <br />
              <span style={{ color: SURFACE.amber, fontStyle: 'italic', fontWeight: 300 }}>
                die past bij uw vraagstuk.
              </span>
            </h2>
          </div>
          <p style={{ color: SURFACE.text, fontSize: 16, lineHeight: 1.75, maxWidth: '26rem' }}>
            Drie hoofdroutes. Aanvullende routes sluiten later aan. Zo blijft de eerste stap overzichtelijk en bestuurlijk logisch.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-3" style={{ marginTop: 48 }}>
          {routeCards.map((route) => (
            <article
              key={route.title}
              style={{
                borderBottom: `1px solid ${SURFACE.border}`,
                minWidth: 0,
                paddingBottom: 20,
              }}
            >
              <div
                style={{
                  alignItems: 'center',
              color: route.accent,
              display: 'flex',
              fontFamily: bodyFont,
              fontSize: 11,
              fontWeight: 700,
                  gap: 12,
                  letterSpacing: '.16em',
                  marginBottom: 18,
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ color: SURFACE.subtle }}>{route.index}</span>
                <span>{route.eyebrow}</span>
              </div>

              <div style={{ alignItems: 'flex-start', display: 'flex', gap: 18 }}>
                <span
                  aria-hidden
                  style={{
                    background: route.accent,
                    display: 'block',
                    flexShrink: 0,
                    height: 146,
                    marginTop: 6,
                    opacity: 0.96,
                    width: 3,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      color: SURFACE.ink,
                      fontFamily: displayFont,
                      fontSize: 'clamp(2rem, 3vw, 3rem)',
                      letterSpacing: '-0.04em',
                      lineHeight: 0.98,
                      marginBottom: 14,
                    }}
                  >
                    {route.title}
                  </h3>
                  <p style={{ color: SURFACE.text, fontSize: 15, lineHeight: 1.75, maxWidth: '18rem' }}>{route.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,0.88fr)] xl:items-center"
          style={{
            borderTop: `1px solid ${SURFACE.border}`,
            marginTop: 40,
            paddingTop: 26,
          }}
        >
          <div>
            <p
              style={{
                color: SURFACE.muted,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.18em',
                marginBottom: 12,
                textTransform: 'uppercase',
              }}
            >
              Vervolgvragen
            </p>
            <p style={{ color: SURFACE.text, fontSize: 15, lineHeight: 1.75, maxWidth: '38rem' }}>
              Pulse voor compacte vervolgmetingen, Leadership Scan voor extra managementcontext en een combinatieroute wanneer meerdere vragen tegelijk spelen.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 xl:justify-end">
            {[
              ['Pulse', SURFACE.tealSoft, SURFACE.teal],
              ['Leadership Scan', SURFACE.amberSoft, SURFACE.amber],
              ['Combinatie', '#ece7df', SURFACE.ink],
            ].map(([label, bg, color]) => (
              <div key={label} style={{ minWidth: 132 }}>
                <div style={{ background: String(bg), color: String(color), display: 'inline-block', fontFamily: bodyFont, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', marginBottom: 10, padding: '5px 10px', textTransform: 'uppercase' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 34 }}>
          <Link
            href={primaryHref}
            style={{
              alignItems: 'center',
              background: SURFACE.charcoal,
              color: '#fff',
              display: 'inline-flex',
              fontFamily: bodyFont,
              fontSize: 15,
              fontWeight: 600,
              gap: 10,
              justifyContent: 'space-between',
              padding: '16px 22px',
              textDecoration: 'none',
            }}
          >
            Bespreek de juiste eerste route <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section
      style={{
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <BackdropNumber value="05" tone="cool" />
      <div style={{ ...SHELL, paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(56px, 7vw, 88px)', position: 'relative' }}>
        <SectionLabel index="05" label="Vertrouwen" />

        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:items-start">
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(2.9rem, 4.8vw, 4.65rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 0.96,
                marginBottom: 20,
                maxWidth: '11ch',
              }}
            >
              Zorgvuldig meten.
              <br />
              <span style={{ color: SURFACE.amberGlow, fontStyle: 'italic', fontWeight: 300 }}>
                Nuchter duiden.
              </span>
            </h2>
            <p style={{ color: SURFACE.text, fontSize: 16, lineHeight: 1.8, maxWidth: '32rem' }}>
              Verisight helpt patronen op groepsniveau zichtbaar maken. Niet om individuele medewerkers te beoordelen, wel om betere gesprekken en keuzes mogelijk te maken.
            </p>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ borderTop: `1px solid ${SURFACE.border}`, display: 'grid' }}>
              {trustPrinciples.map((item, index) => (
                <div
                  key={item}
                  style={{
                    borderBottom: `1px solid ${SURFACE.border}`,
                    display: 'grid',
                    gap: 12,
                    gridTemplateColumns: '46px 1fr',
                    padding: '18px 0',
                  }}
                >
                  <span style={{ color: SURFACE.subtle, fontSize: 13 }}>{String(index + 1).padStart(2, '0')}</span>
                  <p style={{ color: SURFACE.text, fontSize: 15, lineHeight: 1.78 }}>{item}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                background: SURFACE.paperSoft,
                marginTop: 24,
                padding: '20px 22px',
              }}
            >
              <p
                style={{
                  color: SURFACE.muted,
                  fontFamily: bodyFont,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '.18em',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                Onderregel
              </p>
              <p
                style={{
                  color: SURFACE.ink,
                  fontFamily: displayFont,
                  fontSize: 'clamp(1.8rem, 2.4vw, 2.35rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  maxWidth: '19ch',
                }}
              >
                De score opent het gesprek, maar sluit het niet af.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const kennismakingHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_final_cta' })

  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${SURFACE.paper} 0%, ${SURFACE.paperSoft} 100%)`,
        overflow: 'hidden',
        padding: 'clamp(56px, 7vw, 92px) 0',
        position: 'relative',
      }}
    >
      <BackdropNumber value="06" />
      <div style={{ ...SHELL, position: 'relative' }}>
        <SectionLabel index="06" label="Plan een kennismaking" />
        <div
          className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,0.78fr)] xl:items-end"
          style={{ minHeight: 320 }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(3rem, 5vw, 4.9rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 0.95,
                marginBottom: 18,
                maxWidth: '10.5ch',
              }}
            >
              Wilt u zien
              <br />
              <span style={{ color: SURFACE.amber, fontStyle: 'italic', fontWeight: 300 }}>
                welke route nu het meest logisch is?
              </span>
            </h2>
          </div>

          <div style={{ minWidth: 0, maxWidth: '31rem' }}>
            <p style={{ color: SURFACE.text, fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
              Plan een korte kennismaking. Dan ziet u of Verisight past, welke eerste route logisch is en hoe de output er in uw situatie uit kan zien.
            </p>

            <Link
              href={kennismakingHref}
              style={{
                alignItems: 'center',
                background: SURFACE.charcoal,
                color: '#fff',
                display: 'inline-flex',
                fontFamily: bodyFont,
                fontSize: 15,
                fontWeight: 600,
                gap: 10,
                justifyContent: 'space-between',
                padding: '16px 22px',
                textDecoration: 'none',
              }}
            >
              Plan een kennismaking <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomePageContent() {
  return (
    <div style={{ background: SURFACE.paper, color: SURFACE.ink }}>
      <HeroSection />
      <MarqueeBand />
      <SuitePreviewSection />
      <RoutesSection />
      <TrustSection />
      <ContactSection />
    </div>
  )
}
