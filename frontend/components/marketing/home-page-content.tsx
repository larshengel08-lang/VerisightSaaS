'use client'

import Link from 'next/link'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { buildContactHref } from '@/lib/contact-funnel'

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

function HeroSection() {
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })

  return (
    <section style={{ background: SURFACE.surface, borderBottom: `1px solid ${SURFACE.border}` }}>
      <div style={{ ...SHELL, paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(36px, 5vw, 52px)' }}>
        <SectionLabel index="01" label="People suite, insight and follow-through" />

        <div style={{ maxWidth: 980 }}>
          <h1
            style={{
              fontFamily: displayFont,
              fontSize: 'clamp(58px, 10vw, 124px)',
              lineHeight: 0.9,
              letterSpacing: '-.05em',
              color: SURFACE.ink,
              marginBottom: 24,
            }}
          >
            Van people insights naar prioriteit en opvolging voor HR en management.
          </h1>

          <p
            style={{
              maxWidth: 760,
              fontSize: 20,
              lineHeight: 1.65,
              color: SURFACE.text,
              marginBottom: 28,
            }}
          >
            Verisight helpt teams niet alleen zien wat speelt, maar ook bepalen wat eerst telt, acties expliciet maken,
            managers toewijzen en reviewmomenten bewaken in een gedeelde suite.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            <Tag tone="accent">Prioriteren</Tag>
            <Tag tone="accent">Acties maken</Tag>
            <Tag tone="accent">Toewijzen</Tag>
            <Tag tone="accent">Opvolging bewaken</Tag>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link
              href={ctaHref}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                padding: '14px 26px',
                background: SURFACE.ink,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Plan suite-demo
            </Link>
            <Link
              href="/#suite"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                padding: '14px 24px',
                border: `1px solid ${SURFACE.border}`,
                color: SURFACE.ink,
                fontSize: 15,
                fontWeight: 600,
                background: SURFACE.surface,
              }}
            >
              Bekijk de suite
            </Link>
          </div>
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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DashboardSuitePreview />
          <ActionCenterSuitePreview />
        </div>
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
