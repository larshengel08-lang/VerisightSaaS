'use client'

import Link from 'next/link'
import { AC, Arrow, FF, Reveal, SHELL, T } from '@/components/marketing/design-tokens'
import { buildContactHref } from '@/lib/contact-funnel'
import { pricingAddOns, pricingCards, pricingFollowOnRoutes } from '@/components/marketing/site-content'

const primaryPricingCards = pricingCards.filter((card) => card.eyebrow !== 'Onboarding 30-60-90 Baseline')
const onboardingPricingCard = pricingCards.find((card) => card.eyebrow === 'Onboarding 30-60-90 Baseline')!
const actionCenterStartCard = pricingAddOns[0]

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
                fontWeight: 400,
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
            U start met een duidelijke Baseline: intake, scan, dashboard en managementrapport. Daarna kiest u pas of
            opvolging of ritme nodig is. Zo blijft de eerste koop overzichtelijk en direct bruikbaar.
          </p>
            </div>
          </Reveal>
          <Reveal delay={0.08} from="right">
            <div>
            <div style={{ display: 'grid', gap: 10 }}>
              {pricingCards.map((item, index) => (
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
                      {item.price}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: T.inkMuted, fontStyle: 'italic' }}>
              Per traject, geen licenties. Vervolg komt pas in beeld als de volgende vraag echt speelt.
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
              fontWeight: 400,
              letterSpacing: '-.026em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.06,
            }}
          >
            Start met één duidelijke Baseline.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '56ch' }}>
            U kiest eerst de managementvraag: vertrek, behoud of onboarding. Verisight vertaalt die vraag naar een
            Baseline met dashboard, managementrapport en een compacte review van de eerste vervolgrichting.
          </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" style={{ marginBottom: 24 }}>
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
                {item.price}
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
              <Link href={item.eyebrow.startsWith('ExitScan') ? '/producten/exitscan' : '/producten/retentiescan'} style={{ fontSize: 13, fontWeight: 600, color: AC.deep, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {item.eyebrow.startsWith('ExitScan') ? 'Meer over ExitScan' : 'Meer over RetentieScan'} <Arrow />
              </Link>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <article
            style={{
              background: T.paperSoft,
              border: `1px solid ${T.rule}`,
              padding: '30px 32px',
            }}
          >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 12 }}>
                Gerichte eerste route
              </div>
              <h3
                style={{
                  fontFamily: FF,
                  fontSize: 'clamp(24px,2.8vw,34px)',
                  fontWeight: 400,
                  letterSpacing: '-.022em',
                  color: T.ink,
                  lineHeight: 1.08,
                  marginBottom: 12,
                }}
              >
                {onboardingPricingCard.eyebrow}
              </h3>
              <div style={{ fontFamily: FF, fontSize: 'clamp(1.7rem,3vw,2.4rem)', fontWeight: 400, color: T.ink, marginBottom: 14 }}>
                {onboardingPricingCard.price}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.72, color: T.inkSoft, marginBottom: 16 }}>
                {onboardingPricingCard.description}
              </p>
              <Link href="/producten/onboarding-30-60-90" style={{ fontSize: 13, fontWeight: 600, color: AC.deep, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Meer over Onboarding 30-60-90 <Arrow />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {onboardingPricingCard.bullets.map((bullet) => (
                <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: T.inkSoft, padding: '10px 14px', background: T.white, border: `1px solid ${T.rule}` }}>
                  <div style={{ width: 4, height: 4, background: AC.deep, flexShrink: 0, marginTop: 5 }} />
                  {bullet}
                </div>
              ))}
            </div>
          </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}

function OptionalExpansionSection() {
  const href = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'pricing_action_center_start' })

  return (
    <section style={{ background: T.white, padding: 'clamp(50px,5.8vw,76px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <Reveal>
          <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>
            Optionele uitbreiding
          </div>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(26px,3vw,38px)',
              fontWeight: 400,
              letterSpacing: '-.022em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.08,
            }}
          >
            Borg opvolging alleen als daar aanleiding voor is.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '54ch' }}>
            Na een Baseline kunt u Action Center Start toevoegen om één gekozen vervolgrichting zichtbaar te houden:
            wie pakt dit op, wat loopt er en wanneer kijken we terug? Het blijft begrensd en is geen breed
            workflowplatform.
          </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <article
            style={{
              background: T.ink,
              border: `1px solid ${T.ink}`,
              color: '#fff',
              padding: '34px',
            }}
          >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.mid, marginBottom: 12 }}>
                {actionCenterStartCard[0]}
              </div>
              <div style={{ fontFamily: FF, fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 400, letterSpacing: '-.025em', marginBottom: 12 }}>
                {actionCenterStartCard[1]}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.72, color: 'rgba(255,255,255,0.8)', maxWidth: '46ch' }}>
                {actionCenterStartCard[2]}
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {[
                  'Eén gekozen vervolgrichting',
                  'Beperkte manager- of eigenaartoegang',
                  'Zichtbare status en één reviewmoment',
                  'Geen breed workflowplatform',
                ].map((bullet) => (
                  <div key={bullet} style={{ display: 'flex', gap: 10, fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.82)', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 7 }} />
                    {bullet}
                  </div>
                ))}
              </div>
              <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '12px 24px', color: '#fff', background: AC.deep }}>
                Bespreek Action Center Start <Arrow />
              </Link>
            </div>
          </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}

function FollowOnSection() {
  return (
    <section style={{ background: T.white, padding: 'clamp(52px,6vw,80px) 0', borderBottom: `1px solid ${T.rule}` }}>
      <div style={SHELL}>
        <Reveal>
          <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkMuted, marginBottom: 12 }}>
            Vervolg op aanvraag
          </div>
          <h2
            style={{
              fontFamily: FF,
              fontSize: 'clamp(26px,3vw,38px)',
              fontWeight: 400,
              letterSpacing: '-.022em',
              color: T.ink,
              marginBottom: 14,
              lineHeight: 1.1,
            }}
          >
            Verder bouwen kan, maar pas na de eerste Baseline.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: T.inkSoft, maxWidth: '54ch' }}>
            Na de eerste Baseline kunt u gericht kiezen of dezelfde vraag structureel gevolgd, herijkt of verdiept moet
            worden. Zo blijft de eerste koop licht.
          </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div style={{ border: `1px solid ${T.rule}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 140px 1fr', background: T.paperSoft, borderBottom: `1px solid ${T.rule}` }}>
            {['Route', 'Prijs', 'Wanneer logisch'].map((heading) => (
              <div key={heading} style={{ padding: '12px 18px', fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkMuted }}>
                {heading}
              </div>
            ))}
          </div>
          {pricingFollowOnRoutes.map((route, index) => (
            <div key={route.title} style={{ display: 'grid', gridTemplateColumns: '220px 140px 1fr', borderTop: index > 0 ? `1px solid ${T.rule}` : 'none' }}>
              <div style={{ padding: '14px 18px', fontSize: 13.5, fontWeight: 600, color: T.ink }}>{route.title}</div>
              <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkMuted }}>{route.price}</div>
              <div style={{ padding: '14px 18px', fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>{route.description}</div>
            </div>
          ))}
          </div>
        </Reveal>
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
              Plan een eerste route-inschatting <Arrow />
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
      <OptionalExpansionSection />
      <FollowOnSection />
      <CtaBand />
    </div>
  )
}
