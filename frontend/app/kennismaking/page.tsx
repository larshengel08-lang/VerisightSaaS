import type { Metadata } from 'next'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'

export const metadata: Metadata = {
  title: 'Kennismaking',
  description:
    'Plan een korte kennismaking om te bepalen welke Verisight-route het best past en hoe dashboard, samenvatting, rapport en opvolging logisch samenkomen.',
  alternates: { canonical: '/kennismaking' },
  openGraph: {
    title: 'Kennismaking | Verisight',
    description:
      'Plan een korte kennismaking om te bepalen welke Verisight-route het best past en hoe dashboard, samenvatting, rapport en opvolging logisch samenkomen.',
    url: 'https://www.verisight.nl/kennismaking',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kennismaking | Verisight',
    description:
      'Plan een korte kennismaking om te bepalen welke Verisight-route het best past en hoe dashboard, samenvatting, rapport en opvolging logisch samenkomen.',
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
    <div className="min-h-screen bg-[#f7eee7]">
      <PublicHeader ctaHref="#kennismaking" ctaLabel="Plan een kennismaking" />
      <main id="hoofdinhoud">
        <section
          style={{
            background:
              'radial-gradient(circle at top right, rgba(244, 221, 208, 0.7) 0%, rgba(244, 221, 208, 0) 28%), linear-gradient(180deg, #fffdf9 0%, #f7eee7 100%)',
            borderBottom: '1px solid #d9cebf',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ ...shellStyle, paddingTop: 'clamp(72px, 8vw, 120px)', paddingBottom: 'clamp(60px, 7vw, 90px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
              <span style={{ color: '#97a0ab', fontSize: 11 }}>01</span>
              <span
                style={{
                  color: '#78818a',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Plan een kennismaking
              </span>
              <div style={{ flex: 1, height: 1, background: '#d9cebf' }} />
            </div>

            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  color: '#162238',
                  fontFamily: displayFont,
                  fontSize: 'clamp(3rem, 5vw, 5rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.92,
                  marginBottom: 18,
                  maxWidth: '8.6ch',
                }}
              >
                Vertel kort
                <br />
                <span style={{ color: '#b9571f', fontStyle: 'italic', fontWeight: 300 }}>
                  welke managementvraag
                </span>
                <br />
                nu speelt.
              </h1>
              <p style={{ color: '#4e5d6f', fontSize: 16, lineHeight: 1.8, maxWidth: '33rem' }}>
                In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy, prijs en hoe dashboard, samenvatting, rapport en Action Center daarna samen werken.
              </p>
            </div>

            <div style={{ marginTop: 40, maxWidth: 1140 }}>
              <MarketingInlineContactPanel
                badge={null}
                body="Gebruik dit formulier om snel te bepalen welke eerste route nu het best past en welke Verisight-output daarna logisch wordt."
                defaultCtaSource="kennismaking_page_form"
                defaultRouteInterest="exitscan"
                eyebrow="Kennismaking"
                id="kennismaking"
                title="Plan een korte intake."
              />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
