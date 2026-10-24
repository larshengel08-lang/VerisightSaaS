'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/marketing/design-tokens'
import { SURVEY_DURATION_LABEL, SURVEY_MINUTES } from '@/lib/campaign-setup'
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

const displayFont = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const bodyFont = "var(--font-ibm-plex-sans), system-ui, sans-serif"

const routeCards = [
  {
    index: '01',
    eyebrow: 'Behoud onder druk',
    title: 'Loep Behoud',
    body: `Het korte medewerkersonderzoek (${SURVEY_DURATION_LABEL.retention}): waar het wringt en waar je begint. Een alternatief voor het grote jaarlijkse MTO.`,
    href: '/producten#loep-behoud',
    accent: SURFACE.teal,
  },
  {
    index: '02',
    eyebrow: 'Vertrek begrijpen',
    title: 'Loep Vertrek',
    body: 'Waarom mensen écht weggingen, volgens henzelf, en wat je als eerste aanpakt. Het rapport leidt je MT-gesprek.',
    href: '/producten#loep-vertrek',
    accent: SURFACE.amber,
  },
  {
    index: '03',
    eyebrow: 'Nieuwe medewerkers laten landen',
    title: 'Loep Start',
    body: 'Loep meet vroeg hoe nieuwe medewerkers landen. Helder groepsbeeld, geen individuele beoordeling. De verdieping (waarom, volgens je mensen) en het blok "wat er moet gebeuren" komen in een volgende versie.',
    href: '/producten#loep-start',
    accent: '#9b5f1e',
  },
]

const problemSignalPoints = [
  {
    title: 'Verspreide signalen',
    body: 'Signalen rond vertrek, behoud en onboarding zijn er, maar verspreid over gesprekken, systemen en momenten. Geen helder totaalbeeld.',
    accent: SURFACE.border,
  },
  {
    title: 'Onduidelijke prioriteit',
    body: 'Zonder duidelijke vertaalslag blijft onduidelijk welk signaal eerst geverifieerd, besproken of opgepakt moet worden.',
    accent: SURFACE.border,
  },
  {
    title: 'Opvolging blijft te los',
    body: 'Opvolging wordt daardoor ad hoc, breed of ongericht, terwijl management juist scherpe keuzes en gedeeld eigenaarschap nodig heeft.',
    accent: '#98a4b3',
  },
]

// Invultijd uit dezelfde bron als de vragenlijst zelf (SURVEY_MINUTES), zodat de
// homepage niet iets anders belooft dan de respondent leest.
// De drie scans die de homepage aanbiedt worden expliciet genoemd: ontbreekt er
// een, dan faalt de pagina zichtbaar in plaats van een verkeerd bereik te tonen.
function surveyMinutesFor(scan: 'exit' | 'retention' | 'onboarding'): number {
  const minutes = SURVEY_MINUTES[scan]
  if (typeof minutes !== 'number') {
    throw new Error(`SURVEY_MINUTES mist de invultijd voor ${scan}`)
  }
  return minutes
}
const surveyMinutes = [surveyMinutesFor('exit'), surveyMinutesFor('retention'), surveyMinutesFor('onboarding')]
const minSurveyMinutes = Math.min(...surveyMinutes)
const maxSurveyMinutes = Math.max(...surveyMinutes)

const managementFlowSteps = [
  {
    step: '1',
    label: 'Luisteren',
    title: 'Medewerkers vullen de scan in',
    body: `Anoniem, in ${minSurveyMinutes} tot ${maxSurveyMinutes} minuten ingevuld, afhankelijk van de scan. Loep zet alles klaar; jij stuurt één mail vanuit je eigen mailbox. Loep ziet de adressen van je mensen nooit. De respons volg je in je eigen omgeving.`,
  },
  {
    step: '2',
    label: 'Begrijpen',
    title: 'Loep levert een rapport met een antwoord',
    body: 'Een rapport dat laat zien wat laag scoort en waar je begint. Bij Loep Vertrek en Loep Behoud zie je ook waarom iets bovenaan staat, wat je mensen zelf als reden kozen en wat er volgens hen moet gebeuren.',
  },
  {
    step: '3',
    label: 'Kiezen',
    title: 'Kiezen met je MT: wat, wie, wanneer',
    body: 'Jij leidt het gesprek met je MT; het rapport is je leidraad van 45 minuten. Samen kiezen jullie wat er gebeurt, wie het oppakt en wanneer jullie terugkijken. Geen actieplan uit een computer, wel de feiten erbij.',
  },
] as const

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ManagementFlowVisual({ step }: { step: string }) {
  if (step === '1') {
    return (
      <div
        style={{
          background: '#f5f0e9',
          border: `1px solid ${SURFACE.borderSoft}`,
          borderRadius: 22,
          minHeight: 126,
          padding: '18px 18px 16px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          {['Doelgroep', 'Vragenlijst', 'Planning'].map((label, index) => (
            <span
              key={label}
              style={{
                background: index === 1 ? SURFACE.amberSoft : SURFACE.surface,
                border: `1px solid ${index === 1 ? '#ebc7b0' : SURFACE.borderSoft}`,
                borderRadius: 999,
                color: SURFACE.ink,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '.08em',
                padding: '6px 10px',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[72, 88, 64].map((width, index) => (
            <div
              key={width}
              style={{
                alignItems: 'center',
                display: 'grid',
                gap: 10,
                gridTemplateColumns: '18px minmax(0, 1fr)',
              }}
            >
              <div
                style={{
                  background: index === 0 ? SURFACE.amber : SURFACE.tealSoft,
                  borderRadius: 999,
                  height: 18,
                  width: 18,
                }}
              />
              <div style={{ background: SURFACE.surface, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    background: index === 0 ? SURFACE.amber : '#92b0aa',
                    borderRadius: 999,
                    height: '100%',
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (step === '2') {
    return (
      <div
        style={{
          background: '#f5f0e9',
          border: `1px solid ${SURFACE.borderSoft}`,
          borderRadius: 22,
          minHeight: 126,
          padding: '18px 18px 16px',
        }}
      >
        <div
          style={{
            color: SURFACE.muted,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.16em',
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          Managementrapport
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ background: SURFACE.surface, borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ color: SURFACE.ink, fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
              Gespreksopener
            </div>
            <div style={{ background: SURFACE.borderSoft, borderRadius: 999, height: 7, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ background: SURFACE.teal, borderRadius: 999, height: '100%', width: '78%' }} />
            </div>
            <div style={{ background: SURFACE.borderSoft, borderRadius: 999, height: 7, overflow: 'hidden', width: '62%' }}>
              <div style={{ background: SURFACE.amber, borderRadius: 999, height: '100%', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {['Patronen', 'Prioriteiten', 'Segmenten'].map((label) => (
              <div key={label} style={{ background: SURFACE.surface, borderRadius: 14, padding: '10px 10px 12px' }}>
                <div style={{ color: SURFACE.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#f5f0e9',
        border: `1px solid ${SURFACE.borderSoft}`,
        borderRadius: 22,
        minHeight: 126,
        padding: '18px 18px 16px',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ color: SURFACE.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', marginBottom: 6, textTransform: 'uppercase' }}>
            Besluit
          </div>
          <div style={{ color: SURFACE.ink, fontSize: 14, fontWeight: 700 }}>Eerste keuze vastgesteld</div>
        </div>
        <span
          style={{
            background: SURFACE.surface,
            border: `1px solid ${SURFACE.borderSoft}`,
            borderRadius: 999,
            color: SURFACE.ink,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.12em',
            padding: '6px 10px',
            textTransform: 'uppercase',
          }}
        >
          Gereed
        </span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {[
          ['Prioriteit', 'Groei en ontwikkeling'],
          ['Eigenaar', 'HR + management'],
          ['Volgende stap', 'Besluit vastgelegd'],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              alignItems: 'center',
              background: SURFACE.surface,
              borderRadius: 14,
              display: 'grid',
              gap: 8,
              gridTemplateColumns: '104px minmax(0, 1fr)',
              padding: '10px 12px',
            }}
          >
            <span style={{ color: SURFACE.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              {label}
            </span>
            <span style={{ color: SURFACE.ink, fontSize: 12.5, fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
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
                fontWeight: 700,
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
              Organisaties zien signalen, rond uitstroom, behoud of vroege landing, maar missen de stap naar een
              heldere eerste keuze en concrete opvolging. Intussen loopt de teller: de vervanging van één vertrokken
              medewerker kost al snel tienduizenden euro&rsquo;s aan werving, inwerktijd en verloren kennis, nog los van de
              druk op het team dat achterblijft.
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

// minmax(0, 1fr) als enige kolom: zonder die regel krijgt het grid een
// auto-kolom die meegroeit met de min-content van de mini-visual, en dan
// schuift kaart 1 op 375 px buiten de kolom (zie ook .management-flow-grid).
const FLOW_CARD_SUBGRID = {
  display: 'grid',
  gridRow: 'span 2',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateRows: 'subgrid',
  rowGap: 0,
} as const

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
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.94,
                marginBottom: 30,
                textWrap: 'balance',
              }}
            >
              Luisteren. Begrijpen. Kiezen.
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
              Loep meet niet alleen. Het rapport brengt je MT tot één eerste keuze.
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
            // Kaart en Reveal zijn subgrids over twee rijen (tekst, mini-visual): zo
            // zijn de drie kaarten even hoog en beginnen de mini-visuals op één lijn,
            // ook als de teksten of de visuals onderling verschillen in hoogte.
            <Reveal key={item.title} delay={0.1 + index * 0.05} style={FLOW_CARD_SUBGRID}>
              <article
                style={{
                  background: SURFACE.surface,
                  border: `1px solid ${SURFACE.borderSoft}`,
                  borderRadius: 28,
                  boxShadow: '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)',
                  ...FLOW_CARD_SUBGRID,
                  padding: '22px 24px 24px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div>
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
                      fontWeight: 600,
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
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>
                  <ManagementFlowVisual step={item.step} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 1120px) {
          .management-flow-grid {
            /* minmax(0,1fr) i.p.v. 1fr: anders rekt de min-content van de
               kaart-mockups de kolom breder dan de viewport (17px overflow op 375px). */
            grid-template-columns: minmax(0, 1fr) !important;
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
  const primaryHref = buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'homepage_hero_primary' })
  const secondaryHref = '/producten#loep-behoud'

  return (
    <section
      style={{
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, paddingTop: 'clamp(80px, 9vw, 120px)', paddingBottom: 'clamp(80px, 9vw, 120px)', position: 'relative' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:items-center" style={{ gap: 'clamp(40px, 5vw, 72px)' }}>
          <div style={{ textAlign: 'left' }}>
              <div className="marketing-home-hero-reveal-1" style={{ marginBottom: 18 }}>
              <p
                style={{
                  color: SURFACE.amber,
                  fontFamily: bodyFont,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '.18em',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                }}
              >
                Meting en rapport · Het gesprek voer je zelf
              </p>
              <h1
                style={{
                  color: SURFACE.ink,
                  fontFamily: displayFont,
                  fontSize: 'clamp(2.6rem, 4vw, 4.6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.045em',
                  lineHeight: 0.98,
                  margin: 0,
                  maxWidth: '15ch',
                  textWrap: 'balance',
                }}
              >
                Wacht niet tot vertrek het signaal is.
              </h1>
              </div>

              <p
                className="marketing-home-hero-reveal-2"
                style={{
                  color: SURFACE.text,
                  fontSize: 17,
                  lineHeight: 1.6,
                  margin: '0 0 28px',
                  maxWidth: '34rem',
                }}
              >
                Loep laat zien waar het wringt voordat mensen vertrekken, laat je mensen zelf vertellen waarom, en wijst aan waar je begint. Loep zet de meting klaar en levert het rapport; jij krijgt een antwoord.
              </p>

              <div
                className="marketing-home-hero-reveal-4 flex flex-wrap items-center gap-4"
                style={{ justifyContent: 'flex-start', marginBottom: 34 }}
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
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 2,
                  color: SURFACE.ink,
                  display: 'inline-flex',
                  fontFamily: bodyFont,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 0',
                  textDecoration: 'none',
                }}
              >
                Bekijk de retentie-analyse
              </Link>
              </div>

              <p
                style={{
                  color: SURFACE.muted,
                  fontFamily: bodyFont,
                  fontSize: 12.5,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '34rem',
                }}
              >
                Een alternatief voor het grote jaarlijkse MTO.
                <br />
                Reactie binnen 1 werkdag · Vrijblijvend gesprek van 20 min.
              </p>
          </div>

            <div
              className="marketing-home-hero-reveal-visual select-none"
              style={{ margin: '0 auto', maxWidth: 560, position: 'relative', width: '100%' }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: 'translate(14px, 14px)',
                  background: '#16263a',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
              <figure style={{ margin: 0, position: 'relative' }}>
                <div
                  style={{
                    background: '#f4efe6',
                    border: '1px solid rgba(13, 27, 42, 0.12)',
                    boxShadow: '0 30px 70px rgba(13, 27, 42, 0.28)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    src="/images/voorbeeld-loep-behoud-p02.webp"
                    alt="Voorbeeld van pagina twee uit een Loep Behoud-rapport: waarom Groeiperspectief bovenaan staat, de gespreksopener en wat er volgens de mensen moet gebeuren."
                    width={1319}
                    height={508}
                    sizes="(max-width: 600px) 100vw, 560px"
                    priority
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                  {/* Rechtsboven: de afbeelding begint direct bij de paginakop, die
                      links staat; rechts naast de kop is het vlak leeg. */}
                  <span
                    aria-hidden
                    style={{
                      background: '#0d1b2a',
                      color: '#f4ece0',
                      fontFamily: bodyFont,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '.18em',
                      padding: '7px 11px',
                      position: 'absolute',
                      right: 0,
                      textTransform: 'uppercase',
                      top: 0,
                    }}
                  >
                    Voorbeeld
                  </span>
                </div>
              </figure>
            </div>
        </div>
      </div>
    </section>
  )
}

function RoutesSection() {
  const primaryHref = buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'homepage_routes_primary' })

  return (
    <section
      id="scans"
      style={{
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, paddingTop: 'clamp(58px, 7vw, 92px)', paddingBottom: 'clamp(58px, 7vw, 92px)', position: 'relative' }}>
        <div style={{ margin: '0 auto', maxWidth: '68rem', textAlign: 'center' }}>
          <Reveal delay={0.04}>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(3rem, 5vw, 4.85rem)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.95,
                marginBottom: 0,
              }}
            >
              Welke scan past het best bij jouw situatie?
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-3" style={{ marginTop: 48 }}>
          {routeCards.map((route, index) => (
            <Reveal key={route.title} delay={0.12 + index * 0.08}>
              <article
              key={route.title}
              style={{
                minWidth: 0,
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
                  <Link
                    href={route.href}
                    style={{
                      alignItems: 'center',
                      color: route.accent,
                      display: 'inline-flex',
                      fontFamily: bodyFont,
                      fontSize: 13,
                      fontWeight: 600,
                      gap: 6,
                      marginTop: 16,
                      textDecoration: 'none',
                    }}
                  >
                    Meer over {route.title} <Arrow />
                  </Link>
                </div>
              </div>
              </article>
            </Reveal>
          ))}
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
              Bespreek welke scan past <Arrow />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const proofPoints = [
  'Rapportage alleen op groepsniveau, geen individuele data',
  'Minimum aantal respondenten vereist voor veilige rapportage',
  'Geen individuele voorspellingen of profielen',
  'Gespreksleidraad en besluitpagina in Loep Vertrek, Loep Behoud en Loep Start',
] as const

function PositioningCalloutSection() {
  return (
    <section
      style={{
        background: SURFACE.charcoal,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          ...SHELL,
          paddingBottom: 'clamp(48px, 5vw, 68px)',
          paddingTop: 'clamp(48px, 5vw, 68px)',
          textAlign: 'center',
        }}
      >
        <Reveal>
          <p
            style={{
              color: 'rgba(255,255,255,0.42)',
              fontFamily: bodyFont,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '.22em',
              marginBottom: 22,
              textTransform: 'uppercase',
            }}
          >
            Meting en rapport · Het gesprek voer je zelf
          </p>
          <p
            style={{
              color: '#fffdf8',
              fontFamily: displayFont,
              fontSize: 'clamp(1.9rem, 3.6vw, 3.1rem)',
              fontWeight: 700,
              letterSpacing: '-0.045em',
              lineHeight: 1.05,
              margin: '0 auto',
              maxWidth: '28ch',
              textWrap: 'balance',
            }}
          >
            Een tool geeft je grafieken. Loep geeft je de conclusie{' '}
            <span style={{ color: SURFACE.amberGlow, fontStyle: 'italic', fontWeight: 300 }}>
              én de leidraad voor je MT-gesprek.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function ProofSection() {
  return (
    <section
      style={{
        background: SURFACE.surface,
        borderBottom: `1px solid ${SURFACE.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ ...SHELL, paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(56px, 7vw, 88px)' }}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <h2
              style={{
                color: SURFACE.ink,
                fontFamily: displayFont,
                fontSize: 'clamp(2.6rem, 4.2vw, 4.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 0.96,
                maxWidth: '16ch',
              }}
            >
              Veilig op groepsniveau. Niets op de persoon.
            </h2>
          </Reveal>
          <div style={{ minWidth: 0 }}>
            <div style={{ borderTop: `1px solid ${SURFACE.border}`, display: 'grid', gap: 0 }}>
              {proofPoints.map((point, index) => (
                <Reveal key={point} delay={0.08 + index * 0.05}>
                  <div
                    style={{
                      alignItems: 'flex-start',
                      borderBottom: `1px solid ${SURFACE.border}`,
                      display: 'grid',
                      gap: 14,
                      gridTemplateColumns: '20px 1fr',
                      padding: '18px 0',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{ background: SURFACE.teal, borderRadius: 999, height: 8, marginTop: 8, width: 8 }}
                    />
                    <p style={{ color: SURFACE.ink, fontSize: 16, lineHeight: 1.6 }}>{point}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.28}>
              <div
                style={{
                  background: SURFACE.surfaceSoft,
                  border: `1px solid ${SURFACE.border}`,
                  marginTop: 24,
                  padding: '16px 20px',
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
                  Methode
                </p>
                <p style={{ color: SURFACE.text, fontSize: 14.5, lineHeight: 1.7 }}>
                  Loep gebruikt gevalideerde vragenlijsten. De vertaling naar jullie situatie maak je zelf,
                  met de werkvragen in het rapport van Loep Behoud en Loep Vertrek. Daar staat ook per
                  onderwerp waarom het bovenaan staat: de score, de spreiding en wat je mensen zelf als
                  reden kozen. Geen cijfer dat je maar moet geloven.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.34}>
              <div style={{ marginTop: 24 }}>
                <a
                  href="/examples/voorbeeldrapport_retentiescan.pdf"
                  target="_blank"
                  rel="noopener"
                  style={{
                    alignItems: 'center',
                    background: SURFACE.amber,
                    borderRadius: 6,
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    fontFamily: displayFont,
                    fontSize: 15,
                    fontWeight: 700,
                    gap: 10,
                    padding: '13px 22px',
                    textDecoration: 'none',
                  }}
                >
                  Bekijk een voorbeeldrapport (pdf)
                </a>
                <p style={{ color: SURFACE.muted, fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>
                  Gesynthetiseerde cijfers, zelfde opbouw als het echte managementrapport.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const kennismakingHref = buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'homepage_final_cta' })

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
                fontWeight: 700,
                letterSpacing: '-0.05em',
                lineHeight: 1.02,
                margin: '0 auto 22px',
                maxWidth: '14.2ch',
                textWrap: 'balance',
              }}
            >
              Weet je nog niet welke scan past?
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
              We bekijken samen welk vraagstuk nu speelt (vertrek, behoud of onboarding) en welke scan daar het beste bij past.
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
      <PositioningCalloutSection />
      <RoutesSection />
      <ProofSection />
      <ContactSection />
    </div>
  )
}


