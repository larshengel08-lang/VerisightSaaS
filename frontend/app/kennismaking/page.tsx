import type { Metadata } from 'next'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'

export const metadata: Metadata = {
  title: 'Kennismaking',
  description:
    'Plan een vrijblijvend gesprek van 20 minuten. We bekijken samen welk vraagstuk nu speelt en welke scan daar het beste bij past. Reactie binnen 1 werkdag.',
  alternates: { canonical: '/kennismaking' },
  openGraph: {
    title: 'Kennismaking | Loep',
    description:
      'Plan een vrijblijvend gesprek van 20 minuten. We bekijken samen welk vraagstuk nu speelt en welke scan daar het beste bij past. Reactie binnen 1 werkdag.',
    url: 'https://www.getloep.nl/kennismaking',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kennismaking | Loep',
    description:
      'Plan een vrijblijvend gesprek van 20 minuten. We bekijken samen welk vraagstuk nu speelt en welke scan daar het beste bij past. Reactie binnen 1 werkdag.',
    images: ['/opengraph-image'],
  },
}

const shellStyle = {
  margin: '0 auto',
  maxWidth: 1240,
  padding: '0 clamp(20px, 4vw, 48px)',
} as const

const displayFont = 'var(--font-inter-tight), Inter, sans-serif'

export default function KennismakingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicHeader ctaHref="#kennismaking" ctaLabel="Plan een kennismaking" />
      <main id="hoofdinhoud">
        <section
          style={{
            background:
              'radial-gradient(circle at top right, rgba(232, 160, 32, 0.16) 0%, rgba(232, 160, 32, 0) 28%), var(--bg)',
            borderBottom: '1px solid rgba(13,27,42,0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ ...shellStyle, paddingTop: 'clamp(58px, 6.5vw, 92px)', paddingBottom: 'clamp(48px, 6vw, 70px)' }}>
            <div style={{ maxWidth: 1080, minWidth: 0, margin: '0 auto', textAlign: 'center' }}>
              <h1
                style={{
                  color: '#0D1B2A',
                  fontFamily: displayFont,
                  fontSize: 'clamp(2.8rem, 4.8vw, 4.7rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.92,
                  marginBottom: 0,
                }}
              >
                Plan een kennismaking
              </h1>
              <div style={{ alignItems: 'center', display: 'inline-flex', gap: 14, marginTop: 24 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/lars-kennismaking.png"
                  alt="Lars van den Hengel, oprichter van Loep"
                  style={{ borderRadius: '50%', flexShrink: 0, height: 120, objectFit: 'cover', objectPosition: 'center 28%', width: 120 }}
                />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: '#0D1B2A', fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                    Je spreekt met Lars van den Hengel
                  </p>
                  <p style={{ color: 'rgba(13,27,42,0.55)', fontSize: 12.5, lineHeight: 1.4, marginTop: 2 }}>
                    Oprichter &amp; HR-specialist · Reactie binnen 1 werkdag
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 30, maxWidth: 1140 }}>
              <MarketingInlineContactPanel
                badge={null}
                body=""
                defaultCtaSource="kennismaking_page_form"
                defaultRouteInterest="exitscan"
                eyebrow=""
                id="kennismaking"
                title=""
              />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

