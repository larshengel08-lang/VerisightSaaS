import Link from 'next/link'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { AC, T } from '@/components/marketing/design-tokens'
import { buildContactHref } from '@/lib/contact-funnel'
import type { FollowOnRouteContent } from '@/lib/follow-on-route-content'

interface FollowOnRoutePageProps {
  route: FollowOnRouteContent
}

export function FollowOnRoutePage({ route }: FollowOnRoutePageProps) {
  const palette = getRoutePalette(route.slug)
  const ctaHref = buildContactHref({
    routeInterest: route.routeInterest,
    ctaSource: `product_${route.slug}_hero`,
  })

  return (
    <div style={{ background: palette.white, color: palette.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
      <main>
        <section
          style={{
            background: palette.white,
            padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)',
            borderBottom: `1px solid ${palette.rule}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: `linear-gradient(${palette.rule}60 1px,transparent 1px),linear-gradient(90deg,${palette.rule}60 1px,transparent 1px)`,
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
              background: `radial-gradient(circle,${palette.accentSoft} 0%,transparent 65%)`,
              pointerEvents: 'none',
            }}
          />
          <div style={{ ...SHELL, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: palette.accent,
                }}
              >
                {route.title}
              </span>
              <div style={{ flex: 1, height: '1px', background: palette.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: palette.inkMuted, textDecoration: 'none' }}>
                Terug naar producten
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <h1
                  style={{
                    fontFamily: FF,
                    fontWeight: 400,
                    fontSize: 'clamp(42px,5.5vw,76px)',
                    lineHeight: 0.97,
                    letterSpacing: '-.032em',
                    color: palette.ink,
                    maxWidth: '12ch',
                  }}
                >
                  {route.heroTitle}
                </h1>
                <p
                  style={{
                    fontSize: 16.5,
                    lineHeight: 1.72,
                    color: palette.inkSoft,
                    maxWidth: '48ch',
                    margin: '26px 0 36px',
                  }}
                >
                  {route.heroBody}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a
                    href="#kennismaking"
                    style={{
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 14.5,
                      fontWeight: 600,
                      padding: '12px 28px',
                      color: '#fff',
                      background: palette.accent,
                    }}
                  >
                    Plan een kennismaking
                  </a>
                  <Link
                    href="/producten"
                    style={{
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      padding: '11px 24px',
                      color: palette.inkSoft,
                      border: `1px solid ${palette.rule}`,
                    }}
                  >
                    Bekijk producten
                  </Link>
                </div>
              </div>
              <div>
                <div style={{ padding: '28px', background: palette.paperSoft, border: `1px solid ${palette.rule}` }}>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                      color: palette.accent,
                      marginBottom: 16,
                    }}
                  >
                    Begrensde vervolgronde
                  </div>
                  {[
                    route.rowSummary,
                    route.whatYouGet[0],
                    route.whyLater,
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '9px 0',
                        borderTop: i > 0 ? `1px solid ${palette.rule}` : 'none',
                        fontSize: 13,
                        color: palette.inkSoft,
                        lineHeight: 1.6,
                      }}
                    >
                      <div style={{ width: 4, height: 4, background: palette.accentSoftDot, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: palette.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${palette.rule}` }}>
          <div style={SHELL}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: palette.accent, marginBottom: 16 }}>
                Wanneer logisch
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {route.whenLogical.map((text) => (
                  <div
                    key={text}
                    style={{
                      alignItems: 'flex-start',
                      background: palette.white,
                      border: `1px solid ${palette.rule}`,
                      display: 'flex',
                      gap: 12,
                      padding: '18px 20px',
                    }}
                  >
                    <div style={{ width: 6, height: 6, background: palette.accent, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: palette.inkSoft }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${palette.rule}`, paddingTop: 28 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: palette.accent, marginBottom: 14 }}>
                Waarom later
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: palette.inkSoft, marginBottom: 26, maxWidth: '54ch' }}>
                {route.whyLater}
              </p>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {[
                  {
                    label: 'Begrensde vervolgronde',
                    accent: palette.accent,
                    points: [
                      route.positioning,
                      route.whenLogical[0],
                      route.whenLogical[1],
                    ],
                  },
                  {
                    label: 'Geen eerste kernroute',
                    accent: palette.inkMuted,
                    points: [
                      route.whyLater,
                      `Gebruik ${route.title} pas zodra de volgende vraag smaller en gerichter wordt.`,
                      `Start eerst scherper met ${route.relatedRouteLabel.replace('Bekijk ', '')} als de kernvraag nog niet helder staat.`,
                    ],
                  },
                ].map(({ label, accent, points }) => (
                  <div
                    key={label}
                    style={{
                      padding: '28px',
                      background: palette.white,
                      border: `1px solid ${palette.rule}`,
                      borderTop: `3px solid ${accent}`,
                    }}
                  >
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: palette.ink, marginBottom: 16 }}>{label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {points.map((p) => (
                        <div key={p} style={{ display: 'flex', gap: 10, fontSize: 13, color: palette.inkSoft, lineHeight: 1.6 }}>
                          <div style={{ width: 4, height: 4, background: accent, flexShrink: 0, marginTop: 5 }} />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: palette.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${palette.rule}` }}>
          <div style={SHELL}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: palette.accent, marginBottom: 16 }}>
                Wat u ontvangt
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: palette.inkSoft }}>{route.receiveIntro}</p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {route.whatYouGet.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '14px 16px',
                        background: palette.paperSoft,
                        border: `1px solid ${palette.rule}`,
                        fontSize: 13.5,
                        color: palette.inkSoft,
                        lineHeight: 1.6,
                      }}
                    >
                      <div style={{ width: 4, height: 4, background: palette.accentSoftDot, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div id="bounded-route-note" style={{ marginTop: 22, padding: '18px 20px', border: `1px solid ${palette.rule}`, background: palette.white }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: palette.inkFaint, marginBottom: 8 }}>
                    Begrensde vervolgronde
                  </div>
                  <p style={{ fontSize: 13.5, color: palette.inkMuted, lineHeight: 1.65 }}>{route.whyLater}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
                <a
                  href="#kennismaking"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    fontSize: 14,
                    fontWeight: 600,
                    padding: '14px 28px',
                    color: '#fff',
                    background: palette.accent,
                    whiteSpace: 'nowrap',
                  }}
                >
                    Plan een kennismaking
                </a>
                <Link
                  href="/producten"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 500,
                    padding: '12px 24px',
                    color: palette.inkSoft,
                    border: `1px solid ${palette.rule}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Bekijk producten
                </Link>
              </div>
            </div>
          </div>
        </section>

        <MarketingClosingCta
          href={buildContactHref({ routeInterest: route.routeInterest, ctaSource: `product_${route.slug}_form` })}
          showSectionMark={false}
          backdropNumber={null}
          title={`Toets of ${route.title}`}
          accentTitle="nu de juiste vervolgstap is."
          body={route.ctaBody}
          buttonLabel="Plan een kennismaking"
          note="U krijgt eerst een route-inschatting, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

const FF = 'var(--font-inter-tight), serif'
const SHELL = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }

function getRoutePalette(slug: FollowOnRouteContent['slug']) {
  const base = {
    paper: T.paper,
    paperSoft: T.paperSoft,
    white: T.white,
    ink: T.ink,
    inkSoft: T.inkSoft,
    inkMuted: T.inkMuted,
    inkFaint: T.inkFaint,
    rule: T.rule,
    accentSoftDot: AC.mid,
    accent: AC.deep,
    accentSoft: AC.soft,
  }

  return base
}

