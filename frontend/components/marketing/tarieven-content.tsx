'use client'

import Link from 'next/link'
import { AC, Arrow, FF, Reveal, SHELL, T } from '@/components/marketing/design-tokens'
import { buildContactHref } from '@/lib/contact-funnel'
import { pricingCards } from '@/components/marketing/site-content'

const primaryPricingCards = pricingCards.filter(
  (item) =>
    item.eyebrow === 'ExitScan Baseline' ||
    item.eyebrow === 'RetentieScan Baseline' ||
    item.eyebrow === 'Onboarding 30-60-90 Baseline',
)

// Identity pass-through: prices are display-ready in site-content; kept as the
// single seam for any future formatting. Do not inline at call sites.
function formatPricingPrice(price: string) {
  return price
}

function HeroSection() {
  return (
    <section
      style={{
        background: T.white,
        padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)',
        borderBottom: `1px solid ${T.rule}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`,
          backgroundSize: '72px 72px',
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 500,
          height: 500,
          background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ ...SHELL, position: 'relative' }}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px] lg:gap-16 items-start">
          <Reveal>
            <div>
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
              Tarieven
            </p>
            <h1
              style={{
                fontFamily: FF,
                fontWeight: 800,
                fontSize: 'clamp(42px,5.5vw,76px)',
                lineHeight: 0.97,
                letterSpacing: '-.032em',
                color: T.ink,
              }}
            >
              Transparante prijs.
              <br />
              <em className="shimmer-text" style={{ fontStyle: 'italic' }}>
                Heldere eerste stap.
              </em>
            </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '28px 0 0' }}>
            U koopt geen licentie. U koopt een uitgevoerde scan, een scherp managementrapport met prioriteiten en een begeleide managementbespreking.
          </p>
            </div>
          </Reveal>
          <Reveal delay={0.08} from="right">
            <div>
            <div style={{ display: 'grid', gap: 10 }}>
              {primaryPricingCards.map((item, index) => (
                <Reveal key={item.eyebrow} delay={index * 0.05}>
                  <div style={{ padding: '18px 20px', background: T.paperSoft, border: `1px solid ${T.rule}` }}>
                    <div
                      style={{
                        fontSize: 9.5,
                        fontWeight: 600,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        color: AC.deep,
                        marginBottom: 6,
                      }}
                    >
                      {item.eyebrow}
                    </div>
                    <div style={{ fontFamily: FF, fontSize: 28, fontWeight: 400, color: T.ink, letterSpacing: '-.02em' }}>
                      {formatPricingPrice(item.price)}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: T.inkMuted, fontStyle: 'italic' }}>
              Een volledige Scan-campagne, inclusief setup, rapportage en begeleiding. Maatwerk op aanvraag.
            </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FirstBuySection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(56px,7vw,88px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <Reveal>
          <div style={{ marginBottom: 34 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>
            Uw startpunt
          </div>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(28px,3.5vw,42px)',
              fontWeight: 700,
              letterSpacing: '-.026em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.06,
            }}
          >
            Start met één duidelijke Baseline.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '56ch' }}>
            U kiest eerst of de managementvraag over vertrek, behoud of de vroege landing van nieuwe medewerkers gaat.
            Loep vertaalt die vraag naar een Baseline met managementrapport, prioriteiten en een begeleide
            managementbespreking.
          </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" style={{ marginBottom: 24 }}>
          {primaryPricingCards.map((item, index) => (
            <Reveal key={item.eyebrow} delay={index * 0.06}>
              <article
                style={{
                  background: T.white,
                  border: `1px solid ${T.rule}`,
                  borderTop: `3px solid ${AC.deep}`,
                  padding: '34px',
                }}
              >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 12 }}>
                {item.eyebrow}
              </div>
              <div style={{ fontFamily: FF, fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, letterSpacing: '-.03em', color: T.ink, marginBottom: 14, lineHeight: 1 }}>
                {formatPricingPrice(item.price)}
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft, marginBottom: 24 }}>{item.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {item.bullets.map((bullet) => (
                  <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: T.inkSoft, padding: '10px 14px', background: T.paperSoft }}>
                    <div style={{ width: 4, height: 4, background: AC.deep, flexShrink: 0, marginTop: 5 }} />
                    {bullet}
                  </div>
                ))}
              </div>
              <Link
                href={
                  item.eyebrow.startsWith('ExitScan')
                    ? '/producten/exitscan'
                    : item.eyebrow.startsWith('RetentieScan')
                      ? '/producten/retentiescan'
                      : '/producten/onboarding-30-60-90'
                }
                style={{ fontSize: 13, fontWeight: 600, color: AC.deep, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {item.eyebrow.startsWith('ExitScan')
                  ? 'Meer over ExitScan'
                  : item.eyebrow.startsWith('RetentieScan')
                    ? 'Meer over RetentieScan'
                    : 'Meer over Onboarding 30-60-90'} <Arrow />
              </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBand() {
  const ctaHref = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'pricing_closing_cta' })

  return (
    <section style={{ background: T.white, padding: 'clamp(48px,5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] items-center">
          <Reveal>
            <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>
              Prijs in context
            </div>
            <h2 style={{ fontFamily: FF, fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 400, letterSpacing: '-.02em', color: T.ink, lineHeight: 1.15, marginBottom: 12 }}>
              Twijfelt u welke eerste route nu het best past?
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: T.inkSoft, maxWidth: '52ch' }}>
              Gebruik het kennismakingsgesprek om route, timing en privacy kort te toetsen. Zo blijft de eerste stap
              overzichtelijk en weet u wat u direct terugkrijgt.
            </p>
            </div>
          </Reveal>
          <Reveal delay={0.08} from="right">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={ctaHref} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '12px 26px', color: '#fff', background: AC.deep }}>
              Plan een kennismaking <Arrow />
            </Link>
            <Link href="/aanpak" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
              Bekijk de aanpak
            </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function TarievenContent() {
  return (
    <div style={{ background: T.white, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <FirstBuySection />
      <CtaBand />
    </div>
  )
}

