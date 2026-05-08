import type { Metadata } from 'next'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'

export const metadata: Metadata = {
  title: 'Kennismaking',
  description:
    'Plan een korte intake om te bepalen welke eerste route het best past en welke eerste output daarna logisch is.',
  alternates: { canonical: '/kennismaking' },
  openGraph: {
    title: 'Kennismaking | Verisight',
    description:
      'Plan een korte intake om te bepalen welke eerste route het best past en welke eerste output daarna logisch is.',
    url: 'https://www.verisight.nl/kennismaking',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kennismaking | Verisight',
    description:
      'Plan een korte intake om te bepalen welke eerste route het best past en welke eerste output daarna logisch is.',
    images: ['/opengraph-image'],
  },
}

const shellStyle = {
  margin: '0 auto',
  maxWidth: 1240,
  padding: '0 clamp(20px, 4vw, 48px)',
} as const

const displayFont = 'var(--font-fraunces), Georgia, serif'

export default function KennismakingPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF8]">
      <PublicHeader ctaHref="#kennismaking" ctaLabel="Plan een kennismaking" />
      <main id="hoofdinhoud">
        <section
          style={{
            background:
              'radial-gradient(circle at top right, rgba(244, 221, 208, 0.55) 0%, rgba(244, 221, 208, 0) 28%), #FFFCF8',
            borderBottom: '1px solid #d9cebf',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ ...shellStyle, paddingTop: 'clamp(58px, 6.5vw, 92px)', paddingBottom: 'clamp(48px, 6vw, 70px)' }}>
            <div style={{ maxWidth: 1080, minWidth: 0, margin: '0 auto', textAlign: 'center' }}>
              <h1
                style={{
                  color: '#162238',
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
