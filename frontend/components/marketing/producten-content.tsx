'use client'

import Link from 'next/link'
import { AC, Arrow, FF, SHELL, T } from '@/components/marketing/design-tokens'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { buildContactHref } from '@/lib/contact-funnel'

const primaryRoutes = [
  {
    title: 'ExitScan',
    eyebrow: 'Vertrek begrijpen',
    body: 'Wij brengen vertrekpatronen in beeld en leveren een managementrapport met prioriteiten en een begeleide bespreking.',
    gets: 'Managementrapport met vertrekduiding en prioriteiten + begeleide managementbespreking.',
    price: 'Vanaf €4.500',
    href: '/producten/exitscan',
    contactRoute: 'exitscan',
    accent: AC.deep,
    accentSoft: AC.faint,
  },
  {
    title: 'RetentieScan',
    eyebrow: 'Behoud versterken',
    body: 'Wij laten zien waar behoud onder druk komt te staan voordat uitstroom zichtbaar wordt — met rapport en bespreking.',
    gets: 'Managementrapport met retentiesignaal en prioriteiten + begeleide managementbespreking.',
    price: 'Vanaf €4.500',
    href: '/producten/retentiescan',
    contactRoute: 'retentiescan',
    accent: 'oklch(0.50 0.12 188)' as string,
    accentSoft: 'oklch(0.972 0.018 185)' as string,
  },
  {
    title: 'Onboarding 30-60-90',
    eyebrow: 'Goed landen',
    body: 'Wij meten vroeg hoe nieuwe medewerkers landen en leveren een groepsbeeld met een eerste vervolgrichting.',
    gets: 'Managementrapport met vroege landingsduiding + begeleide managementbespreking.',
    price: 'Vanaf €4.500',
    href: '/producten/onboarding-30-60-90',
    contactRoute: 'onboarding',
    accent: '#9b5f1e' as string,
    accentSoft: 'oklch(0.97 0.03 70)' as string,
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
        <div style={{ maxWidth: '70ch', margin: '0 auto', textAlign: 'center' }}>
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
              fontWeight: 800,
              letterSpacing: '-.032em',
              lineHeight: 0.97,
              maxWidth: '11ch',
              margin: '0 auto',
            }}
          >
            Welke vraag speelt nu het sterkst?
          </h1>
          <p
            style={{
              color: T.inkSoft,
              fontSize: 16.5,
              lineHeight: 1.72,
              margin: '26px 0 36px',
              maxWidth: '58ch',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            ExitScan als vertrek de vraag is. RetentieScan als behoud eerder zichtbaar moet zijn. Onboarding 30-60-90
            als vroege landing aandacht vraagt.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
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
              Bespreek uw vraagstuk <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PrimaryRoutesSection() {
  return (
    <section style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(52px,6vw,82px) 0' }}>
      <div style={SHELL}>
        <div style={{ marginBottom: 30, textAlign: 'center' }}>
          <h2
            style={{
              color: T.ink,
              fontFamily: FF,
              fontSize: 'clamp(28px,3.2vw,40px)',
              fontWeight: 700,
              letterSpacing: '-.024em',
              lineHeight: 1.06,
              marginBottom: 14,
              maxWidth: '14ch',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Welke scan past bij uw vraag?
          </h2>
          <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.74, maxWidth: '58ch', margin: '0 auto' }}>
            Drie gelijkwaardige scans, elk met managementrapport en begeleide bespreking. Kies de vraag die nu het
            sterkst speelt.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                  fontWeight: 700,
                  letterSpacing: '-.022em',
                  lineHeight: 1.06,
                  marginBottom: 14,
                }}
              >
                {route.title}
              </h2>
              <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.72, marginBottom: 18 }}>{route.body}</p>
              <p style={{ color: T.inkSoft, fontSize: 13.5, lineHeight: 1.7, marginBottom: 18 }}>
                <span style={{ fontWeight: 600, color: T.ink }}>Wat HR en management krijgen: </span>
                {route.gets}
              </p>
              <div style={{ color: T.ink, fontFamily: FF, fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', marginBottom: 22 }}>
                {route.price}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  href={buildContactHref({ routeInterest: route.contactRoute, ctaSource: `products_card_${route.contactRoute}` })}
                  style={{
                    alignItems: 'center',
                    background: T.ink,
                    color: '#fff',
                    display: 'inline-flex',
                    fontSize: 13.5,
                    fontWeight: 600,
                    gap: 6,
                    justifyContent: 'center',
                    padding: '12px 20px',
                    textDecoration: 'none',
                  }}
                >
                  Bespreek of deze scan past <Arrow />
                </Link>
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
              </div>
            </article>
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
      accentTitle="scan nu past?"
      backdropNumber={null}
      body="In een eerste kennismaking toetsen we welke scan nu de juiste eerste stap is en wat u als eerste terugkrijgt."
      buttonLabel="Bespreek uw vraagstuk"
      sectionIndex=""
      sectionLabel=""
      showSectionMark={false}
      title="Twijfelt u welke"
    />
  )
}

export function ProductenContent() {
  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <PrimaryRoutesSection />
      <ContactSection />
    </div>
  )
}
