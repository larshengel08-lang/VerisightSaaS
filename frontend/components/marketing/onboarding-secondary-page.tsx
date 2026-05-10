import Link from 'next/link'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { AC, FF, T } from '@/components/marketing/design-tokens'
import { buildContactHref } from '@/lib/contact-funnel'

const SHELL = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
const cardShadow = '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)'
const featureCardStyle = {
  background: T.white,
  border: `1px solid ${T.rule}`,
  borderRadius: 28,
  boxShadow: cardShadow,
} as const
const rowCardStyle = {
  background: T.paperSoft,
  border: `1px solid ${T.rule}`,
  borderRadius: 22,
} as const

export function OnboardingSecondaryPage() {
  const ctaHref = buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_hero' })

  return (
    <div style={{ background: T.white, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
      <main>
        <section
          style={{
            background: T.white,
            padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)',
            borderBottom: `1px solid ${T.rule}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ ...SHELL, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: AC.deep }}>
                Onboarding 30-60-90
              </span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>
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
                    color: T.ink,
                    maxWidth: '12ch',
                  }}
                >
                  Nieuwe medewerkers sneller goed laten landen
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Voor organisaties die vroeg willen zien of nieuwe medewerkers goed landen en waar eerste frictie
                  aandacht vraagt voordat die uitgroeit tot uitval, verloop of langdurige onzekerheid.
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
                      background: AC.deep,
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
                      color: T.inkSoft,
                      border: `1px solid ${T.rule}`,
                    }}
                  >
                    Bekijk producten
                  </Link>
                </div>
              </div>
              <div>
                <div style={{ ...featureCardStyle, padding: '28px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>
                    Voor vragen rond de eerste 30, 60 en 90 dagen
                  </div>
                  {[
                    'Dashboard en managementrapport als eerste output',
                    'Maakt vroege frictie in rol, team en leiding zichtbaar',
                    'Startpunt wanneer onboarding nu de belangrijkste vraag is',
                  ].map((item, index) => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '9px 0',
                        borderTop: index > 0 ? `1px solid ${T.rule}` : 'none',
                        fontSize: 13,
                        color: T.inkSoft,
                        lineHeight: 1.6,
                      }}
                    >
                      <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={SHELL}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>
                Wanneer logisch
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[
                  'De eerste maanden van nieuwe medewerkers vragen nu als eerste managementvraag aandacht.',
                  'U wilt onboarding scherper openen zonder meteen een brede people-route te starten.',
                  'Vroege landing, eerste frictie of eerste uitval zijn nu urgenter dan brede uitstroom of behoudsdruk.',
                  'U zoekt een volwaardige baseline, maar wel kleiner en specifieker dan de twee kernroutes.',
                ].map((text) => (
                  <div key={text} style={{ ...featureCardStyle, alignItems: 'flex-start', display: 'flex', gap: 12, padding: '20px 22px' }}>
                    <div style={{ width: 6, height: 6, background: AC.deep, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.rule}`, paddingTop: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 14 }}>
                Wat u ontvangt
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft, marginBottom: 26, maxWidth: '56ch' }}>
                U ontvangt een compacte onboarding baseline met dashboard, managementrapport en een eerste
                vervolgrichting voor wat in de eerste 30, 60 en 90 dagen nu aandacht vraagt.
              </p>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {[
                  'Een eerste beeld van vroege landing, eerste frictie en eerste uitval.',
                  'Dashboard en managementrapport in dezelfde leeslijn.',
                  'Een compacte review van wat nu opvalt en wat eerst telt.',
                  'Een kleinere, gerichte startroute die onboarding opent zonder brede lifecycle-suite.',
                ].map((item) => (
                  <div key={item} style={{ ...rowCardStyle, display: 'flex', gap: 12, padding: '16px 18px', fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                    <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 5 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MarketingClosingCta
          href={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_form' })}
          showSectionMark={false}
          backdropNumber={null}
          title="Toets of Onboarding 30-60-90"
          accentTitle="nu de juiste eerste route is."
          body="Beschrijf kort waarom de eerste maanden van nieuwe medewerkers nu als eerste managementvraag spelen. Dan toetsen we of Onboarding 30-60-90 Baseline de juiste eerste route is."
          buttonLabel="Plan een eerste route-inschatting"
          note="U krijgt eerst een route-inschatting, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}
