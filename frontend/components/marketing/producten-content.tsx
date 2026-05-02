'use client'

import Link from 'next/link'
import { AC, Arrow, FF, SHELL, T } from '@/components/marketing/design-tokens'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { buildContactHref } from '@/lib/contact-funnel'

const primaryRoutes = [
  {
    title: 'ExitScan',
    eyebrow: 'Als vertrek de vraag is',
    body:
      'Voor organisaties die scherp willen begrijpen waarom medewerkers vertrekken, welke patronen terugkomen en waar actie het eerst telt.',
    bullets: [
      'Kies dit als vertrek al zichtbaar is',
      'Geeft snel een eerste vertrekbeeld op groepsniveau',
      'Leidt naar dashboard, rapport en eerste managementbespreking',
    ],
    href: '/producten/exitscan',
    accent: AC.deep,
    accentSoft: AC.faint,
  },
  {
    title: 'RetentieScan',
    eyebrow: 'Als behoud in actieve teams de vraag is',
    body:
      'Voor organisaties die eerder willen zien waar behoud onder druk komt te staan, voordat verloop zichtbaar oploopt en het gesprek te laat begint.',
    bullets: [
      'Kies dit als u eerder wilt signaleren',
      'Maakt behoudsdruk zichtbaar op groepsniveau',
      'Leidt naar dashboard, rapport en eerste managementbespreking',
    ],
    href: '/producten/retentiescan',
    accent: 'oklch(0.50 0.12 188)' as string,
    accentSoft: 'oklch(0.972 0.018 185)' as string,
  },
] as const

const comparisonColumns = [
  {
    title: 'Kies ExitScan als',
    bullets: [
      'Vertrek is al zichtbaar of terugkerend',
      'U wilt begrijpen welke patronen terugkomen',
      'U wilt een eerste managementbeeld van vertrekredenen en drivers',
      'U zoekt een eerste handoff voor gesprek en vervolgsturing',
    ],
    accent: AC.deep,
  },
  {
    title: 'Kies RetentieScan als',
    bullets: [
      'U wilt eerder signaleren voordat verloop oploopt',
      'U vermoedt behoudsdruk maar ziet nog geen volledig vertrekbeeld',
      'U wilt groepsniveau vroegsignalering in plaats van terugblik',
      'U wilt eerder zien waar gesprek en verificatie nodig zijn',
    ],
    accent: 'oklch(0.50 0.12 188)' as string,
  },
] as const

const deferredRoutes = [
  {
    title: 'Onboarding 30-60-90',
    body: 'Als vroege landing aandacht vraagt',
    href: '/producten/onboarding-30-60-90',
  },
  {
    title: 'Pulse',
    body: 'Compacte vervolgroute nadat een eerste baseline of managementread al staat.',
    href: '/producten/pulse',
  },
  {
    title: 'Leadership Scan',
    body: 'Begrensde vervolgrichting zodra managementcontext als volgende vraag echt speelt.',
    href: '/producten/leadership-scan',
  },
] as const

function HeroSection() {
  const primaryHref = buildContactHref({
    routeInterest: 'exitscan',
    ctaSource: 'products_hero_primary',
  })

  return (
    <section
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.rule}`,
        overflow: 'hidden',
        padding: 'clamp(52px,6.5vw,80px) 0 clamp(44px,5.5vw,68px)',
        position: 'relative',
      }}
    >
      <div
        style={{
          backgroundImage: `linear-gradient(${T.rule}55 1px,transparent 1px),linear-gradient(90deg,${T.rule}55 1px,transparent 1px)`,
          backgroundSize: '72px 72px',
          inset: 0,
          opacity: 0.32,
          pointerEvents: 'none',
          position: 'absolute',
        }}
      />
      <div
        style={{
          background: `radial-gradient(circle, ${AC.soft} 0%, transparent 65%)`,
          height: 480,
          pointerEvents: 'none',
          position: 'absolute',
          right: -40,
          top: -90,
          width: 480,
        }}
      />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div style={{ maxWidth: '70ch' }}>
          <p
            style={{
              color: AC.deep,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.18em',
              marginBottom: 18,
              textTransform: 'uppercase',
            }}
          >
            Producten
          </p>
          <h1
            style={{
              color: T.ink,
              fontFamily: FF,
              fontSize: 'clamp(42px,5.5vw,76px)',
              fontWeight: 400,
              letterSpacing: '-.032em',
              lineHeight: 0.97,
              maxWidth: '11ch',
            }}
          >
            Kies de route die nu het meeste duidelijkheid geeft.
          </h1>
          <p
            style={{
              color: T.inkSoft,
              fontSize: 16.5,
              lineHeight: 1.72,
              margin: '26px 0 36px',
              maxWidth: '58ch',
            }}
          >
            Kies ExitScan als u vertrek achteraf wilt begrijpen. Kies RetentieScan als u eerder wilt zien waar
            behoud onder druk staat. Andere routes komen pas in beeld als de volgende vraag echt speelt.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link
              href={primaryHref}
              style={{
                alignItems: 'center',
                background: T.ink,
                color: '#fff',
                display: 'inline-flex',
                fontSize: 14.5,
                fontWeight: 600,
                gap: 8,
                padding: '12px 28px',
                textDecoration: 'none',
              }}
            >
              Toets uw eerste route <Arrow />
            </Link>
            <Link
              href="#route-vergelijking"
              style={{
                alignItems: 'center',
                border: `1px solid ${T.rule}`,
                color: T.inkSoft,
                display: 'inline-flex',
                fontSize: 14.5,
                fontWeight: 500,
                gap: 8,
                padding: '11px 26px',
                textDecoration: 'none',
              }}
            >
              Vergelijk ExitScan en RetentieScan
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PrimaryRoutesSection() {
  return (
    <section style={{ background: T.paperSoft, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(52px,6vw,82px) 0' }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {primaryRoutes.map((route) => (
            <article
              key={route.title}
              style={{
                background: T.white,
                border: `1px solid ${T.rule}`,
                borderTop: `3px solid ${route.accent}`,
                padding: 'clamp(24px,3vw,34px)',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  display: 'inline-flex',
                  gap: 8,
                  marginBottom: 18,
                  padding: '4px 10px',
                  background: route.accentSoft,
                  color: route.accent,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                }}
              >
                {route.eyebrow}
              </div>
              <h2
                style={{
                  color: T.ink,
                  fontFamily: FF,
                  fontSize: 'clamp(28px,3vw,38px)',
                  fontWeight: 400,
                  letterSpacing: '-.022em',
                  lineHeight: 1.06,
                  marginBottom: 14,
                }}
              >
                {route.title}
              </h2>
              <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.72, marginBottom: 22 }}>{route.body}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {route.bullets.map((bullet) => (
                  <div key={bullet} style={{ alignItems: 'center', color: T.inkSoft, display: 'flex', fontSize: 13.5, gap: 10 }}>
                    <div style={{ width: 4, height: 4, background: route.accent, flexShrink: 0 }} />
                    {bullet}
                  </div>
                ))}
              </div>
              <Link
                href={route.href}
                style={{
                  alignItems: 'center',
                  color: route.accent,
                  display: 'inline-flex',
                  fontSize: 13,
                  fontWeight: 600,
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                Bekijk {route.title} <Arrow />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComparisonSection() {
  return (
    <section
      id="route-vergelijking"
      style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(50px,5.6vw,76px) 0' }}
    >
      <div style={SHELL}>
        <h2
          style={{
            color: T.ink,
            fontFamily: FF,
            fontSize: 'clamp(28px,3.2vw,40px)',
            fontWeight: 400,
            letterSpacing: '-.024em',
            lineHeight: 1.06,
            marginBottom: 14,
            maxWidth: '14ch',
          }}
        >
          Welke route past bij uw vraag?
        </h2>
        <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.74, marginBottom: 34, maxWidth: '58ch' }}>
          Gebruik ExitScan als u vertrek wilt duiden nadat het zichtbaar is. Gebruik RetentieScan als u eerder wilt
          zien waar behoud onder druk komt te staan, voordat verloop zichtbaar oploopt.
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {comparisonColumns.map((column) => (
            <div key={column.title} style={{ borderTop: `1px solid ${T.rule}`, paddingTop: 18 }}>
              <h3
                style={{
                  color: column.accent,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '.16em',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                }}
              >
                {column.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {column.bullets.map((bullet) => (
                  <div key={bullet} style={{ alignItems: 'flex-start', color: T.inkSoft, display: 'flex', fontSize: 14, gap: 12, lineHeight: 1.66 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: column.accent, flexShrink: 0, marginTop: 9 }} />
                    {bullet}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UtilityRoutesSection() {
  return (
    <section style={{ background: T.paperSoft, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(50px,5.8vw,76px) 0' }}>
      <div style={SHELL}>
        <div style={{ marginBottom: 26 }}>
          <h2
            style={{
              color: T.ink,
              fontFamily: FF,
              fontSize: 'clamp(26px,3vw,36px)',
              fontWeight: 400,
              letterSpacing: '-.022em',
              lineHeight: 1.08,
              marginBottom: 12,
            }}
          >
            Andere routes komen later in beeld
          </h2>
          <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.72, maxWidth: '52ch' }}>
            Kleinere vervolgroutes worden pas relevant als de volgende vraag echt speelt, niet als eerste productkeuze.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {deferredRoutes.map((route) => (
            <div key={route.title} style={{ background: T.white, borderTop: `1px solid ${T.rule}`, padding: '20px 0 0' }}>
              <h3 style={{ color: T.ink, fontFamily: FF, fontSize: 20, fontWeight: 400, marginBottom: 8 }}>{route.title}</h3>
              <p style={{ color: T.inkMuted, fontSize: 13.5, lineHeight: 1.64, marginBottom: 14 }}>{route.body}</p>
              <Link href={route.href} style={{ color: T.inkSoft, fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>
                Meer informatie
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const href = buildContactHref({
    routeInterest: 'exitscan',
    ctaSource: 'products_closing_cta',
  })

  return (
    <MarketingClosingCta
      href={href}
      accentTitle="en RetentieScan?"
      backdropNumber={null}
      body="In een eerste gesprek toetsen we welke route nu de juiste eerste stap is en welke vervolgstap pas later nodig is."
      buttonLabel="Plan een eerste route-inschatting"
      sectionIndex=""
      sectionLabel=""
      showSectionMark={false}
      title="Twijfelt u tussen ExitScan"
    />
  )
}

export function ProductenContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <PrimaryRoutesSection />
      <ComparisonSection />
      <UtilityRoutesSection />
      <ContactSection />
    </div>
  )
}
