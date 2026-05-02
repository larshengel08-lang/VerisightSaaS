'use client'

import Link from 'next/link'
import { Reveal } from '@/components/marketing/design-tokens'
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
  'Dashboard voor inzicht \u2022 Managementrapport voor duiding \u2022 Action Center voor opvolging',
]

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

const suiteSignalMetrics = [
  ['Vertreksignaal', '12%', '+1.4 pp'],
  ['Betrokkenheid', '7,4', 'Stabiel'],
  ['Behoudssignaal 12 mnd', '+3,1', 'Positieve richting'],
] as const

const suitePriorityRows = [
  ['01', 'Groei en ontwikkeling blijft achter', 'Operations en Finance', 'Direct', SURFACE.amberSoft, SURFACE.amber],
  ['02', 'Werkdruk loopt op', 'Piekperiode in Operations', 'Verhoogd', '#f1dfcf', '#9a5b19'],
  ['03', 'Loopbaanperspectief blijft achter', 'Organisatiebreed signaal', 'Aandacht', SURFACE.tealSoft, SURFACE.teal],
] as const

const routeCards = [
  {
    index: '01',
    eyebrow: 'Als vertrek de vraag is',
    title: 'ExitScan',
    body: 'Begrijp waarom medewerkers vertrekken en welke patronen terugkomen. Helder beeld in weken, niet maanden.',
    accent: SURFACE.amber,
  },
  {
    index: '02',
    eyebrow: 'Als behoud in actieve teams de vraag is',
    title: 'RetentieScan',
    body: 'Zie waar behoud onder druk staat voordat het te laat is. Vroege signalering op groepsniveau.',
    accent: SURFACE.teal,
  },
  {
    index: '03',
    eyebrow: 'Als vroege landing aandacht vraagt',
    title: 'Onboarding 30-60-90',
    body: 'Zie vroeg hoe nieuwe medewerkers landen en waar uitval kan ontstaan.',
    accent: '#9b5f1e',
  },
]

const problemSignalPoints = [
  {
    title: 'Verspreide signalen',
    body: 'Signalen rond vertrek, behoud en onboarding zijn er, maar verspreid over gesprekken, systemen en momenten. Geen helder totaalbeeld.',
    accent: SURFACE.amber,
  },
  {
    title: 'Onduidelijke prioriteit',
    body: 'Zonder duidelijke vertaalslag blijft onduidelijk welk signaal eerst geverifieerd, besproken of opgepakt moet worden.',
    accent: SURFACE.teal,
  },
  {
    title: 'Opvolging blijft te los',
    body: 'Opvolging wordt daardoor ad hoc, breed of ongericht, terwijl management juist scherpe keuzes en gedeeld eigenaarschap nodig heeft.',
    accent: '#98a4b3',
  },
]

const managementFlowSteps = [
  {
    step: '1',
    label: 'Begrijpen',
    title: 'Dashboard',
    body: "Laat direct zien waar signalen terugkomen, welke thema's of afdelingen aandacht vragen en wat nu bestuurlijk het meeste gewicht heeft.",
  },
  {
    step: '2',
    label: 'Prioriteren',
    title: 'Managementrapport',
    body: 'Maakt de hoofdboodschap, eerste prioriteit en eerste vervolgrichting bestuurlijk leesbaar, zodat management sneller kan wegen wat eerst telt.',
  },
  {
    step: '3',
    label: 'Handelen',
    title: 'Action Center',
    body: 'Maakt opvolging concreet zodra HR of leiding besluit dat een echte vervolgstap nodig is, van toewijzing aan een manager tot het openen en volgen van acties.',
  },
] as const

const firstDeliveryItems = [
  {
    index: '01',
    title: 'Een dashboard met hoofdbeeld en prioriteiten',
    body: 'Zodat direct zichtbaar wordt waar signalen terugkomen en wat bestuurlijk aandacht vraagt.',
  },
  {
    index: '02',
    title: 'Een managementrapport met duiding en vervolgrichting',
    body: 'Zodat management sneller begrijpt wat de kern is en welke eerste vraag of keuze voorligt.',
  },
  {
    index: '03',
    title: 'Een gerichte bespreking van wat eerst telt',
    body: 'Zodat signalen niet blijven hangen in interpretatie, maar leiden tot scherpere weging en besluitvorming.',
  },
  {
    index: '04',
    title: 'Een Action Center voor georganiseerde opvolging',
    body: 'Zodat vervolg niet in losse afspraken verdwijnt, maar zichtbaar, toegewezen en concreet wordt.',
  },
] as const

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
        padding: '12px 12px 14px',
      }}
    >
      <p
        style={{
          color: SURFACE.muted,
          fontFamily: bodyFont,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.16em',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p
        className="dash-number"
        style={{
          color: SURFACE.ink,
          fontSize: 24,
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </p>
      <p style={{ color: SURFACE.text, fontSize: 12.5, lineHeight: 1.45 }}>{body}</p>
    </div>
  )
}

function ProblemSection() {
  return (
    <section
      style={{
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
      }}
    >
      <div
        style={{
          ...SHELL,
          paddingBottom: 'clamp(56px, 7vw, 88px)',
          paddingTop: 'clamp(56px, 7vw, 88px)',
        }}
      >
        <div style={{ margin: '0 auto', maxWidth: 1180, textAlign: 'center' }}>
          <Reveal>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(3rem, 5vw, 5.45rem)',
                fontWeight: 400,
                letterSpacing: '-0.055em',
                lineHeight: 0.93,
                marginBottom: 28,
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '24ch',
              }}
            >
              Veel signalen. Te weinig scherpte
              <br />
              in wat eerst aandacht vraagt.
            </h2>
          </Reveal>

          <Reveal delay={0.06}>
            <p
              style={{
                color: SURFACE.text,
                fontSize: 17,
                lineHeight: 1.72,
                marginBottom: 56,
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '54rem',
              }}
            >
              Organisaties zien signalen, rond uitstroom, behoud of vroege landing, maar missen de vertaalslag naar
              een heldere managementprioriteit en concrete opvolging.
            </p>
          </Reveal>
        </div>

        <div
          className="problem-signal-grid"
          style={{
            borderTop: `1px solid ${SURFACE.borderSoft}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
        >
          {problemSignalPoints.map((item, index) => (
            <Reveal key={item.title} delay={0.1 + index * 0.05}>
              <div
                style={{
                  borderRight: index < problemSignalPoints.length - 1 ? `1px solid ${SURFACE.borderSoft}` : 'none',
                  minHeight: 272,
                  padding: '36px 44px 18px 0',
                  paddingLeft: index > 0 ? 44 : 0,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    background: item.accent,
                    borderRadius: 999,
                    display: 'block',
                    height: 4,
                    marginBottom: 28,
                    width: 26,
                  }}
                />
                <h3
                  style={{
                    color: SURFACE.ink,
                    fontFamily: bodyFont,
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.35,
                    marginBottom: 16,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: SURFACE.text,
                    fontSize: 15.5,
                    lineHeight: 1.95,
                    maxWidth: '21rem',
                  }}
                >
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .problem-signal-grid {
            grid-template-columns: 1fr !important;
          }

          .problem-signal-grid > div {
            border-right: none !important;
            border-bottom: 1px solid ${SURFACE.borderSoft};
            min-height: unset !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .problem-signal-grid > div:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>
    </section>
  )
}

function ManagementFlowSection() {
  return (
    <section
      style={{
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
      }}
    >
      <div
        style={{
          ...SHELL,
          paddingBottom: 'clamp(56px, 7vw, 92px)',
          paddingTop: 'clamp(56px, 7vw, 92px)',
        }}
      >
        <div style={{ margin: '0 auto', maxWidth: 980, textAlign: 'center' }}>
          <Reveal>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(3rem, 5vw, 5rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 0.94,
                marginBottom: 30,
                textWrap: 'balance',
              }}
            >
              Van signaal naar gerichte opvolging
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p
              style={{
                color: SURFACE.text,
                fontSize: 17,
                lineHeight: 1.72,
                margin: '0 auto',
                maxWidth: '54rem',
              }}
            >
              Verisight brengt analyse en vervolg samen in één heldere managementflow. Zo blijft het niet bij losse
              signalen of losse rapportage, maar wordt ook de stap naar gerichte opvolging ondersteund.
            </p>
          </Reveal>
        </div>

        <div
          className="management-flow-grid"
          style={{
            alignItems: 'stretch',
            display: 'grid',
            gap: 22,
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            marginTop: 56,
            position: 'relative',
          }}
        >
          <div
            aria-hidden
            style={{
              background: SURFACE.borderSoft,
              height: 1,
              left: '16.66%',
              position: 'absolute',
              right: '16.66%',
              top: 66,
              zIndex: 0,
            }}
          />

          {managementFlowSteps.map((item, index) => (
            <Reveal key={item.title} delay={0.1 + index * 0.05}>
              <article
                style={{
                  background: SURFACE.surface,
                  border: `1px solid ${SURFACE.borderSoft}`,
                  borderRadius: 28,
                  boxShadow: '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)',
                  minHeight: 408,
                  padding: '22px 24px 24px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div style={{ alignItems: 'center', display: 'flex', gap: 14, marginBottom: 24 }}>
                  <div
                    style={{
                      alignItems: 'center',
                      background: SURFACE.ink,
                      borderRadius: '999px',
                      color: SURFACE.surface,
                      display: 'inline-flex',
                      fontFamily: bodyFont,
                      fontSize: 15,
                      fontWeight: 700,
                      height: 36,
                      justifyContent: 'center',
                      width: 36,
                    }}
                  >
                    {item.step}
                  </div>
                  <span
                    style={{
                      color: SURFACE.ink,
                      fontFamily: bodyFont,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                <h3
                  style={{
                    color: SURFACE.ink,
                    fontFamily: displayFont,
                    fontSize: 'clamp(2rem, 2.35vw, 2.6rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.03,
                    marginBottom: 16,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: SURFACE.text,
                    fontSize: 15.5,
                    lineHeight: 1.62,
                    marginBottom: 28,
                    maxWidth: '25rem',
                  }}
                >
                  {item.body}
                </p>

                {item.title === 'Dashboard' ? (
                  <div
                    style={{
                      background: '#f2efe8',
                      border: `1px solid ${SURFACE.borderSoft}`,
                      borderRadius: 22,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginTop: 'auto',
                      minHeight: 116,
                      padding: '18px 16px 16px',
                    }}
                  >
                    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: 16 }}>
                      {[
                        ['Behoud', '#cfe7dd'],
                        ['Onboarding', '#d8e4ea'],
                        ['Vertrek', '#eaded6'],
                      ].map(([label, accent]) => (
                        <div
                          key={label}
                          style={{
                            background: SURFACE.surface,
                            borderRadius: 14,
                            padding: '10px 10px 8px',
                          }}
                        >
                          <div
                            style={{
                              color: SURFACE.muted,
                              fontFamily: bodyFont,
                              fontSize: 10,
                              fontWeight: 500,
                              letterSpacing: '.08em',
                              marginBottom: 10,
                              textTransform: 'uppercase',
                            }}
                          >
                            {label}
                          </div>
                          <div style={{ background: String(accent), borderRadius: 999, height: 4, width: '100%' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ alignItems: 'end', display: 'grid', gap: 6, gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
                      {[
                        20, 34, 26, 42, 30, 50, 38, 40,
                      ].map((height, chartIndex) => (
                        <div
                          key={chartIndex}
                          style={{
                            background: '#597b74',
                            borderRadius: '4px 4px 0 0',
                            height,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.title === 'Managementrapport' ? (
                  <div
                    style={{
                      background: '#f2efe8',
                      border: `1px solid ${SURFACE.borderSoft}`,
                      borderRadius: 22,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginTop: 'auto',
                      minHeight: 116,
                      padding: '16px 18px',
                    }}
                  >
                    <div
                      style={{
                        color: '#7f7b74',
                        fontFamily: bodyFont,
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: '.12em',
                        marginBottom: 10,
                        textTransform: 'uppercase',
                      }}
                    >
                      Hoofdboodschap
                    </div>
                    <div style={{ background: '#59626d', borderRadius: 999, height: 6, marginBottom: 10, width: '100%' }} />
                    <div style={{ background: '#cfc9bf', borderRadius: 999, height: 5, marginBottom: 8, width: '86%' }} />
                    <div style={{ background: '#dcd5cb', borderRadius: 999, height: 5, marginBottom: 16, width: '71%' }} />
                    <div
                      style={{
                        alignItems: 'center',
                        background: SURFACE.surface,
                        borderRadius: 16,
                        color: SURFACE.text,
                        display: 'flex',
                        fontFamily: bodyFont,
                        fontSize: 14,
                        gap: 10,
                        padding: '9px 14px',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          background: '#bfe5c7',
                          borderRadius: 999,
                          display: 'inline-block',
                          height: 8,
                          width: 8,
                        }}
                      />
                      Eerste prioriteit
                    </div>
                  </div>
                ) : null}

                {item.title === 'Action Center' ? (
                  <div
                    style={{
                      background: '#f2efe8',
                      border: `1px solid ${SURFACE.borderSoft}`,
                      borderRadius: 22,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginTop: 'auto',
                      minHeight: 116,
                      padding: '14px 14px 16px',
                    }}
                  >
                    {[
                      ['Bespreek signalen Sales', '#bfe5c7'],
                      ['Verifieer onboarding', '#e7ded4'],
                      ['Plan vervolg met team', '#e7ded4'],
                    ].map(([label, dot], rowIndex) => (
                      <div
                        key={label}
                        style={{
                          alignItems: 'center',
                          background: SURFACE.surface,
                          borderRadius: 16,
                          color: SURFACE.ink,
                          display: 'flex',
                          fontFamily: bodyFont,
                          fontSize: 14,
                          gap: 10,
                          marginTop: rowIndex === 0 ? 0 : 10,
                          padding: '11px 12px',
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            background: String(dot),
                            border: `1px solid ${rowIndex === 0 ? '#82bb8e' : SURFACE.border}`,
                            borderRadius: 999,
                            display: 'inline-block',
                            height: 12,
                            width: 12,
                          }}
                        />
                        {label}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <p
            style={{
              color: SURFACE.text,
              fontSize: 16,
              lineHeight: 1.72,
              margin: '46px auto 0',
              maxWidth: '58rem',
              textAlign: 'center',
            }}
          >
            Verisight vult interpretatie of eigenaarschap niet automatisch voor u in. Het helpt signalen zichtbaar
            maken, prioriteiten wegen en opvolging organiseren in een duidelijke managementflow.
          </p>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 1120px) {
          .management-flow-grid {
            grid-template-columns: 1fr !important;
          }

          .management-flow-grid > div[aria-hidden="true"] {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}

function HeroSection() {
  const primaryHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })
  const secondaryHref = '/#first-delivery'
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
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, paddingTop: 'clamp(74px, 8vw, 120px)', paddingBottom: 'clamp(70px, 8vw, 104px)', position: 'relative' }}>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_640px]">
          <div style={{ maxWidth: 560 }}>
              <div className="marketing-home-hero-reveal-1" style={{ marginBottom: 18 }}>
              <h1
                style={{
                  color: SURFACE.ink,
                  fontFamily: displayFont,
                  fontSize: 'clamp(3rem, 4.8vw, 5.2rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.045em',
                  lineHeight: 0.98,
                  marginBottom: 0,
                  maxWidth: '12ch',
                  textWrap: 'balance',
                }}
              >
                Zie sneller waar vertrek, behoud of onboarding aandacht vragen
              </h1>
              </div>

              <p
                className="marketing-home-hero-reveal-2"
                style={{
                  color: SURFACE.text,
                  fontSize: 17,
                  lineHeight: 1.6,
                  marginBottom: 28,
                  maxWidth: '32rem',
                }}
              >
                Verisight helpt HR en leiding signalen zichtbaar maken, prioriteren wat eerst telt en opvolging organiseren in het Action Center.
              </p>

              <div
                className="marketing-home-hero-reveal-4 flex flex-wrap items-center gap-4"
                style={{ marginBottom: 34 }}
              >
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
                Plan een kennismaking
              </Link>
              <Link
                href={secondaryHref}
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
                className="marketing-home-hero-reveal-5"
                style={{
                  borderTop: `1px solid ${SURFACE.border}`,
                  display: 'grid',
                  gap: 10,
                  paddingTop: 22,
                }}
              >
                {heroTrustItems.map((item) => (
                  <div
                    key={item}
                    style={{
                      color: SURFACE.muted,
                      display: 'block',
                      fontFamily: bodyFont,
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.7,
                    }}
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </div>
          </div>

            <div className="marketing-home-hero-reveal-visual relative hidden h-[620px] translate-x-[42px] select-none lg:block">
            <div
              style={{
                background: SURFACE.surface,
                border: `1px solid ${SURFACE.borderSoft}`,
                borderRadius: 8,
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                height: 286,
                padding: '24px 28px',
                position: 'absolute',
                right: -6,
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
                left: 30,
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
                    <svg width="17" height="21" viewBox="0 0 17 21" fill="none" aria-hidden>
                      <path
                        d="M9.911 0.75L3.489 10.197H7.653L6.723 20.25L13.145 10.803H8.981L9.911 0.75Z"
                        fill="white"
                      />
                    </svg>
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
                    J. de Wit <span style={{ color: 'rgba(255,255,255,0.38)' }}>Â· VP Talent</span>
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

// Kept intentionally as archived in-file reference; live homepage no longer renders this section.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <Reveal>
          <SectionLabel index="02" label="Van inzicht naar eerste opvolging" />
        </Reveal>

        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
          <div style={{ minWidth: 0 }}>
            <Reveal delay={0.04}>
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
                Geen losse output.
                <br />
                <span style={{ color: SURFACE.amberGlow, fontStyle: 'italic', fontWeight: 300 }}>
                  Wel een helder besluitspoor.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p
                style={{
                  color: SURFACE.text,
                  fontSize: 16,
                  lineHeight: 1.78,
                  marginBottom: 34,
                  maxWidth: '33rem',
                }}
              >
                Verisight brengt signalen samen in dashboard, samenvatting en rapport, en helpt vervolgens om prioriteit, eigenaar en eerste actie vast te leggen.
              </p>
            </Reveal>

            <div style={{ borderTop: `1px solid ${SURFACE.border}`, display: 'grid', gap: 0 }}>
              {suiteFlowPoints.map((item, index) => (
                <Reveal key={item.index} delay={0.12 + index * 0.06}>
                  <div
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
                </Reveal>
              ))}
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <Reveal delay={0.08} from="right">
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
                      <p className="suite-motion-frame-title">Van eerste signalen naar eerste actie</p>
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
                        </div>

                        <div className="suite-phase-title">
                          <p>Signalen eerst</p>
                          <p className="suite-phase-title-accent">in beeld.</p>
                        </div>

                        <div className="suite-metrics-grid">
                          {suiteSignalMetrics.map(([label, value, body]) => (
                            <OutputMetric key={label} label={label} value={value} body={body} />
                          ))}
                        </div>
                      </section>

                      <section className="suite-motion-screen suite-motion-screen-prioritize">
                        <div className="suite-screen-head">
                          <p className="suite-phase-eyebrow">Eerste prioriteiten</p>
                        </div>

                        <div className="suite-prioritize-intro">
                          <div className="suite-priority-title">
                            <p>Kies</p>
                            <p className="suite-phase-title-accent">wat nu eerst telt.</p>
                          </div>
                        </div>

                        <div className="suite-priority-ladder">
                          {suitePriorityRows.slice(0, 2).map(([index, title, body, badge, bg, color]) => (
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
                          </div>

                          <div className="suite-action-head">
                            <div>
                              <p className="suite-action-title">Niet alleen zien.</p>
                              <p className="suite-action-accent">Ook handelen.</p>
                            </div>
                          </div>

                          <div className="suite-action-list">
                            {[
                              ['Prioriteit', 'Ontwikkelkansen blijven achter, Finance', 'Bevestigd'],
                              ['Eerste actie', 'Bespreken in teamoverleg, daarna verdiepend gesprek', 'Deze week'],
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

              </div>
            </Reveal>
          </div>
        </div>

        <style>{`
          .suite-motion-shell {
            --suite-window-height: 308px;
            --suite-cycle-duration: 9s;
            position: relative;
          }

          .suite-phase-tabs {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
          }

          .suite-phase-tab {
            border: 1px solid ${SURFACE.border};
            border-radius: 999px;
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            padding: 6px 10px;
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
            padding: 12px;
            position: relative;
            z-index: 1;
          }

          .suite-motion-frame-head {
            align-items: flex-end;
            display: flex;
            gap: 16px;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .suite-motion-frame-title {
            color: ${SURFACE.ink};
            font-family: ${displayFont};
            font-size: clamp(1.05rem, 1.45vw, 1.35rem);
            letter-spacing: -0.03em;
            line-height: 1;
            margin-top: 2px;
          }

          .suite-motion-progress {
            background: ${SURFACE.surface};
            border: 1px solid ${SURFACE.border};
            border-radius: 999px;
            flex-shrink: 0;
            height: 8px;
            overflow: hidden;
            position: relative;
            width: 136px;
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
            width: 40px;
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
            display: flex;
            flex-direction: column;
            flex: 0 0 var(--suite-window-height);
            height: var(--suite-window-height);
            overflow: hidden;
            padding: 14px 16px 16px;
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
            gap: 14px;
            justify-content: space-between;
          }

          .suite-action-head {
            margin-bottom: 12px;
          }

          .suite-phase-eyebrow {
            color: ${SURFACE.muted};
            font-family: ${bodyFont};
            font-size: 9.5px;
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
            padding: 5px 9px;
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
            margin: 10px 0 12px;
          }

          .suite-phase-title p,
          .suite-action-title,
          .suite-action-accent {
            font-family: ${displayFont};
            font-size: clamp(1.55rem, 2.15vw, 2rem);
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
            gap: 6px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-bottom: 0;
            margin-top: auto;
          }

          .suite-motion-screen-see .suite-metrics-grid {
            margin-top: 34px;
          }

          .suite-phase-list,
          .suite-priority-ladder,
          .suite-action-list {
            display: grid;
            gap: 6px;
          }

          .suite-priority-ladder {
            margin-top: 18px;
          }

          .suite-list-row,
          .suite-ladder-row {
            align-items: center;
            background: ${SURFACE.surfaceSoft};
            display: grid;
            gap: 10px;
            grid-template-columns: 30px minmax(0, 1fr) auto;
            padding: 10px 12px;
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
            font-size: 12px;
          }

          .suite-list-title {
            color: ${SURFACE.ink};
            font-family: ${bodyFont};
            font-size: 13.5px;
            font-weight: 600;
            margin-bottom: 2px;
          }

          .suite-list-body {
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 12.5px;
            line-height: 1.42;
          }

          .suite-list-badge {
            font-family: ${bodyFont};
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.14em;
            padding: 4px 8px;
            text-transform: uppercase;
          }

          .suite-priority-title {
            color: ${SURFACE.ink};
            font-family: ${displayFont};
            font-size: clamp(1.45rem, 1.95vw, 1.7rem);
            letter-spacing: -0.04em;
            line-height: 0.98;
            margin-bottom: 0;
            max-width: 11ch;
          }

          .suite-priority-title p {
            margin: 0;
          }

          .suite-priority-copy {
            color: ${SURFACE.text};
            font-family: ${bodyFont};
            font-size: 14px;
            line-height: 1.66;
            max-width: 34ch;
          }

          .suite-prioritize-intro {
            margin: 8px 0 0;
          }

          .suite-action-panel {
            box-sizing: border-box;
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            height: 100%;
            padding: 0;
          }

          .suite-action-title {
            color: ${SURFACE.ink};
          }

          .suite-action-list {
            margin-top: 18px;
          }

          .suite-action-row {
            align-items: center;
            background: rgba(255, 255, 255, 0.62);
            border: 1px solid ${SURFACE.borderSoft};
            display: grid;
            gap: 10px;
            grid-template-columns: minmax(0, 1fr) auto;
            padding: 10px 12px;
          }

          .suite-action-row-primary {
            background: rgba(255, 248, 241, 0.96);
            border-color: rgba(191, 148, 110, 0.38);
            box-shadow: inset 0 0 0 1px rgba(185, 87, 31, 0.11);
          }

          .suite-action-label {
            color: ${SURFACE.muted};
            font-family: ${bodyFont};
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.14em;
            margin-bottom: 4px;
            text-transform: uppercase;
          }

          .suite-action-body {
            color: ${SURFACE.ink};
            font-family: ${bodyFont};
            font-size: 12.5px;
            line-height: 1.4;
          }

          .suite-action-badge {
            background: rgba(22, 34, 56, 0.1);
            border: 1px solid rgba(22, 34, 56, 0.12);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
            color: ${SURFACE.ink};
            font-family: ${bodyFont};
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.12em;
            padding: 5px 8px;
            border-radius: 999px;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .suite-action-badge-urgent {
            background: rgba(244, 221, 208, 0.92);
            border-color: rgba(185, 87, 31, 0.2);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
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
              --suite-window-height: 332px;
            }
          }

          @media (max-width: 820px) {
            .suite-motion-shell {
              --suite-window-height: 408px;
            }

            .suite-metrics-grid {
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
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, paddingTop: 'clamp(58px, 7vw, 92px)', paddingBottom: 'clamp(58px, 7vw, 92px)', position: 'relative' }}>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.72fr)] xl:items-end">
          <div>
            <Reveal delay={0.04}>
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
                die past bij uw vraagstuk.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p style={{ color: SURFACE.text, fontSize: 16, lineHeight: 1.75, maxWidth: '26rem' }}>
              Drie hoofdroutes. Aanvullende routes sluiten later aan. Zo blijft de eerste stap overzichtelijk en bestuurlijk logisch.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-3" style={{ marginTop: 48 }}>
          {routeCards.map((route, index) => (
            <Reveal key={route.title} delay={0.12 + index * 0.08}>
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
            </Reveal>
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
            <Reveal delay={0.22}>
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
            </Reveal>
            <Reveal delay={0.26}>
              <p style={{ color: SURFACE.text, fontSize: 15, lineHeight: 1.75, maxWidth: '38rem' }}>
                Pulse voor compacte vervolgmetingen, Leadership Scan voor extra managementcontext en een combinatieroute wanneer meerdere vragen tegelijk spelen.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-wrap gap-8 xl:justify-end">
            {[
              ['Pulse', SURFACE.tealSoft, SURFACE.teal],
              ['Leadership Scan', SURFACE.amberSoft, SURFACE.amber],
              ['Combinatie', '#ece7df', SURFACE.ink],
            ].map(([label, bg, color], index) => (
              <Reveal key={label} delay={0.28 + index * 0.05}>
                <div style={{ minWidth: 132 }}>
                <div style={{ background: String(bg), color: String(color), display: 'inline-block', fontFamily: bodyFont, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', marginBottom: 10, padding: '5px 10px', textTransform: 'uppercase' }}>
                  {label}
                </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 34 }}>
          <Reveal delay={0.34}>
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
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FirstDeliverySection() {
  return (
    <section
      id="first-delivery"
      style={{
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
      }}
    >
      <div style={{ ...SHELL, paddingTop: 'clamp(56px, 7vw, 90px)', paddingBottom: 'clamp(56px, 7vw, 92px)' }}>
        <div style={{ maxWidth: 1040 }}>
          <Reveal>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(2.8rem, 4.7vw, 4.55rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 0.95,
                marginBottom: 22,
                maxWidth: '11.5ch',
              }}
            >
              Wat u als eerste krijgt
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p style={{ color: SURFACE.text, fontSize: 16, lineHeight: 1.78, marginBottom: 40, maxWidth: '58rem' }}>
              Verisight geeft u geen losse analyse zonder vervolg, maar een eerste managementflow die helpt om sneller
              te begrijpen wat speelt, te bepalen wat eerst telt en gerichte opvolging op gang te brengen.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {firstDeliveryItems.map((item, index) => (
            <Reveal key={item.title} delay={0.08 + index * 0.04}>
              <article
                style={{
                  background: SURFACE.surface,
                  border: `1px solid ${SURFACE.borderSoft}`,
                  borderRadius: 28,
                  boxShadow: '0 10px 24px rgba(22, 34, 56, 0.06), 0 2px 5px rgba(22, 34, 56, 0.04)',
                  minHeight: 132,
                  padding: '28px 28px 26px',
                }}
              >
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '56px minmax(0, 1fr)' }}>
                  <span
                    style={{
                      color: SURFACE.subtle,
                      fontFamily: displayFont,
                      fontSize: 24,
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}
                  >
                    {item.index}
                  </span>
                  <div>
                    <h3
                      style={{
                        color: SURFACE.ink,
                        fontFamily: displayFont,
                        fontSize: 'clamp(1.7rem, 2.1vw, 2.2rem)',
                        fontWeight: 400,
                        letterSpacing: '-0.035em',
                        lineHeight: 1.08,
                        marginBottom: 10,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ color: SURFACE.text, fontSize: 15, lineHeight: 1.72, maxWidth: '34rem' }}>{item.body}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const kennismakingHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_final_cta' })
  const exampleHref = '/#first-delivery'

  return (
    <section
      style={{
        background: SURFACE.surface,
        overflow: 'hidden',
        padding: 'clamp(56px, 7vw, 92px) 0',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, position: 'relative' }}>
        <Reveal>
          <div
            style={{
              background:
                'radial-gradient(circle at left bottom, rgba(21, 101, 88, 0.34) 0%, rgba(21, 101, 88, 0) 28%), linear-gradient(135deg, #0d1724 0%, #122133 56%, #162634 100%)',
              borderRadius: 38,
              boxShadow: '0 22px 48px rgba(13, 23, 36, 0.16)',
              margin: '0 auto',
              maxWidth: 1200,
              padding: 'clamp(40px, 6vw, 72px) clamp(26px, 5vw, 64px)',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                color: '#fffdf8',
                fontFamily: displayFont,
                fontSize: 'clamp(2.05rem, 3vw, 2.9rem)',
                fontWeight: 400,
                letterSpacing: '-0.05em',
                lineHeight: 1.02,
                margin: '0 auto 22px',
                maxWidth: '14.2ch',
                textWrap: 'balance',
              }}
            >
              Wilt u scherper zien wat aandacht vraagt, en opvolging beter organiseren?
            </h2>

            <p
              style={{
                color: 'rgba(255, 250, 242, 0.86)',
                fontSize: 16.5,
                lineHeight: 1.8,
                margin: '0 auto 34px',
                maxWidth: '48rem',
              }}
            >
              Plan een kennismaking en ontdek hoe Verisight helpt om signalen zichtbaar te maken, prioriteiten scherper
              te wegen en opvolging concreet te faciliteren.
            </p>

            <div
              className="contact-cta-actions"
              style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}
            >
              <Link
                href={kennismakingHref}
                style={{
                  alignItems: 'center',
                  background: '#fffdf8',
                  borderRadius: 999,
                  color: SURFACE.ink,
                  display: 'inline-flex',
                  fontFamily: bodyFont,
                  fontSize: 15,
                  fontWeight: 600,
                  justifyContent: 'center',
                  minWidth: 236,
                  padding: '16px 28px',
                  textDecoration: 'none',
                }}
              >
                Plan een kennismaking
              </Link>
              <Link
                href={exampleHref}
                style={{
                  alignItems: 'center',
                  background: 'transparent',
                  border: '1px solid rgba(255, 250, 242, 0.22)',
                  borderRadius: 999,
                  color: '#fffdf8',
                  display: 'inline-flex',
                  fontFamily: bodyFont,
                  fontSize: 15,
                  fontWeight: 600,
                  justifyContent: 'center',
                  minWidth: 204,
                  padding: '16px 28px',
                  textDecoration: 'none',
                }}
              >
                Bekijk voorbeeldoutput
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function HomePageContent() {
  return (
    <div style={{ background: SURFACE.surface, color: SURFACE.ink }}>
      <HeroSection />
      <ProblemSection />
      <ManagementFlowSection />
      <RoutesSection />
      <FirstDeliverySection />
      <ContactSection />
    </div>
  )
}


