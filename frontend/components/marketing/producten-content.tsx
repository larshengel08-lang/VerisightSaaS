'use client'

import Link from 'next/link'
import { AC, Arrow, FF, SHELL, T } from '@/components/marketing/design-tokens'
import { FollowOnRoutesAccordion } from '@/components/marketing/follow-on-routes-accordion'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import {
  actionCenterStartPositioning,
  productFollowOnRouteRows,
  productPrimaryRouteCards,
  productSecondaryFirstBuyRoute,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { FOLLOW_ON_ROUTE_CONTENT } from '@/lib/follow-on-route-content'

const laterFollowOnForms = productFollowOnRouteRows.filter(
  ([title]) => title === 'ExitScan Live Start' || title === 'Reviewcadans',
)

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
        <div style={{ maxWidth: '72ch', margin: '0 auto', textAlign: 'center' }}>
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
              margin: '0 auto',
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
              margin: '26px auto 36px',
              maxWidth: '60ch',
            }}
          >
            ExitScan Baseline en RetentieScan Baseline blijven de twee hoofdinstappen. Onboarding 30-60-90
            Baseline is een gerichtere startroute. Action Center Start en latere vervolgroutes komen pas daarna in
            beeld.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link
              href={primaryHref}
              style={{
                alignItems: 'center',
                background: AC.deep,
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
              Bekijk de hoofdinstappen
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PrimaryRoutesSection() {
  return (
    <section
      id="route-vergelijking"
      style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(52px,6vw,82px) 0' }}
    >
      <div style={SHELL}>
        <div style={{ marginBottom: 30, textAlign: 'center' }}>
          <h2
            style={{
              color: T.ink,
              fontFamily: FF,
              fontSize: 'clamp(28px,3.2vw,40px)',
              fontWeight: 400,
              letterSpacing: '-.024em',
              lineHeight: 1.06,
              marginBottom: 14,
              marginLeft: 'auto',
              marginRight: 'auto',
              maxWidth: '15ch',
            }}
          >
            Welke hoofdroute past bij uw vraag?
          </h2>
          <p style={{ color: T.inkSoft, fontSize: 15, lineHeight: 1.74, maxWidth: '58ch', margin: '0 auto' }}>
            Kies ExitScan Baseline als u vertrek wilt duiden. Kies RetentieScan Baseline als u eerder wilt zien waar
            behoud onder druk staat.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {productPrimaryRouteCards.map((route) => (
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
                  background: route.accentSoft,
                  color: route.accent,
                  display: 'inline-flex',
                  gap: 8,
                  marginBottom: 18,
                  padding: '4px 10px',
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
                  <div
                    key={bullet}
                    style={{ alignItems: 'center', color: T.inkSoft, display: 'flex', fontSize: 13.5, gap: 10 }}
                  >
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

function SecondaryFirstBuySection() {
  return (
    <section style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(48px,5.5vw,72px) 0' }}>
      <div style={SHELL}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h2
            style={{
              color: T.ink,
              fontFamily: FF,
              fontSize: 'clamp(24px,2.8vw,34px)',
              fontWeight: 400,
              letterSpacing: '-.022em',
              lineHeight: 1.08,
              marginBottom: 12,
            }}
          >
            Onboarding blijft een gerichte startroute.
          </h2>
          <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.72, maxWidth: '54ch', margin: '0 auto' }}>
            Onboarding 30-60-90 Baseline blijft zichtbaar als specifiekere eerste route: gerichter dan ExitScan en
            RetentieScan, maar wel een volwaardige start wanneer onboarding nu de eerste vraag is.
          </p>
        </div>

        <article
          style={{
            background: T.paperSoft,
            border: `1px solid ${T.rule}`,
            padding: 'clamp(24px,3vw,34px)',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              color: AC.deep,
              display: 'inline-flex',
              gap: 8,
              marginBottom: 18,
              padding: '4px 10px',
              background: AC.faint,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
            }}
          >
            {productSecondaryFirstBuyRoute.eyebrow}
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div>
              <h3
                style={{
                  color: T.ink,
                  fontFamily: FF,
                  fontSize: 'clamp(24px,2.8vw,34px)',
                  fontWeight: 400,
                  letterSpacing: '-.022em',
                  lineHeight: 1.08,
                  marginBottom: 12,
                }}
              >
                {productSecondaryFirstBuyRoute.title} Baseline
              </h3>
              <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.72, marginBottom: 20 }}>
                {productSecondaryFirstBuyRoute.body}
              </p>
              <Link
                href={productSecondaryFirstBuyRoute.href}
                style={{
                  alignItems: 'center',
                  color: AC.deep,
                  display: 'inline-flex',
                  fontSize: 13,
                  fontWeight: 600,
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                Bekijk Onboarding 30-60-90 <Arrow />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {productSecondaryFirstBuyRoute.bullets.map((bullet) => (
                <div
                  key={bullet}
                  style={{
                    background: T.white,
                    border: `1px solid ${T.rule}`,
                    color: T.inkSoft,
                    display: 'flex',
                    gap: 10,
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ width: 4, height: 4, background: AC.deep, flexShrink: 0, marginTop: 7 }} />
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function ActionCenterStartSection() {
  const href = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'products_action_center_start' })

  return (
    <section style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(48px,5.5vw,72px) 0' }}>
      <div style={SHELL}>
        <article
          style={{
            background: T.ink,
            border: `1px solid ${T.ink}`,
            color: '#fff',
            padding: 'clamp(28px,3.5vw,40px)',
          }}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
            <div>
              <div
                style={{
                  color: AC.mid,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '.18em',
                  marginBottom: 14,
                  textTransform: 'uppercase',
                }}
              >
                {actionCenterStartPositioning.eyebrow}
              </div>
              <h2
                style={{
                  color: '#fff',
                  fontFamily: FF,
                  fontSize: 'clamp(28px,3vw,40px)',
                  fontWeight: 400,
                  letterSpacing: '-.024em',
                  lineHeight: 1.06,
                  marginBottom: 16,
                  maxWidth: '14ch',
                }}
              >
                {actionCenterStartPositioning.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14.5, lineHeight: 1.72, maxWidth: '52ch' }}>
                {actionCenterStartPositioning.body}
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {actionCenterStartPositioning.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.82)',
                      display: 'flex',
                      gap: 10,
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 7 }} />
                    {bullet}
                  </div>
                ))}
              </div>
              <Link
                href={href}
                style={{
                  alignItems: 'center',
                  background: AC.deep,
                  color: '#fff',
                  display: 'inline-flex',
                  fontSize: 14,
                  fontWeight: 600,
                  gap: 7,
                  padding: '12px 24px',
                  textDecoration: 'none',
                }}
              >
                Toets of Action Center Start logisch is <Arrow />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function LaterRoutesSection() {
  return (
    <section style={{ background: T.white, borderBottom: `1px solid ${T.rule}`, padding: 'clamp(50px,5.8vw,76px) 0' }}>
      <div style={SHELL}>
        <div style={{ marginBottom: 26, textAlign: 'center' }}>
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
            Vervolg en verdieping komen pas later in beeld.
          </h2>
          <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.72, maxWidth: '56ch', margin: '0 auto' }}>
            Live Start, Reviewcadans en latere vervolgroutes komen pas in beeld nadat de eerste route al richting
            heeft gegeven.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" style={{ marginBottom: 28 }}>
          {laterFollowOnForms.map(([title, body]) => (
            <article
              key={title}
              style={{
                background: T.paperSoft,
                border: `1px solid ${T.rule}`,
                padding: '24px 24px 22px',
              }}
            >
              <div
                style={{
                  color: T.inkMuted,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '.16em',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}
              >
                Later vervolg
              </div>
              <h3
                style={{
                  color: T.ink,
                  fontFamily: FF,
                  fontSize: 'clamp(22px,2.6vw,30px)',
                  fontWeight: 400,
                  letterSpacing: '-.02em',
                  lineHeight: 1.08,
                  marginBottom: 10,
                }}
              >
                {title}
              </h3>
              <p style={{ color: T.inkSoft, fontSize: 14, lineHeight: 1.68 }}>{body}</p>
            </article>
          ))}
        </div>

        <FollowOnRoutesAccordion routes={FOLLOW_ON_ROUTE_CONTENT} />
      </div>
    </section>
  )
}

function ContactSection() {
  const href = buildContactHref({
    routeInterest: 'nog-onzeker',
    ctaSource: 'products_closing_cta',
  })

  return (
    <MarketingClosingCta
      href={href}
      accentTitle="nu de eerste stap is?"
      backdropNumber={null}
      body="In een eerste gesprek toetsen we welke baseline nu het best past, of Action Center Start logisch is en welk vervolg pas later nodig wordt."
      buttonLabel="Plan een eerste route-inschatting"
      sectionIndex=""
      sectionLabel=""
      showSectionMark={false}
      title="Twijfelt u welke route"
    />
  )
}

export function ProductenContent() {
  return (
    <div style={{ background: T.white, color: T.ink, overflowX: 'hidden' }}>
      <HeroSection />
      <PrimaryRoutesSection />
      <SecondaryFirstBuySection />
      <ActionCenterStartSection />
      <LaterRoutesSection />
      <ContactSection />
    </div>
  )
}
