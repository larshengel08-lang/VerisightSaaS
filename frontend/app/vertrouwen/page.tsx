import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { VertrouwenContent } from '@/components/marketing/vertrouwen-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Privacy & dataveiligheid',
  description:
    'Zo gaat Loep met jullie data om: privacy, rapportlezing, DPA en productgrenzen, publiek te controleren voordat je begint.',
  alternates: { canonical: '/vertrouwen' },
  openGraph: {
    title: 'Privacy & dataveiligheid | Loep',
    description:
      'Zo gaat Loep met jullie data om: privacy, rapportlezing, DPA en productgrenzen, publiek te controleren voordat je begint.',
    url: 'https://www.getloep.nl/vertrouwen',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy & dataveiligheid | Loep',
    description:
      'Zo gaat Loep met jullie data om: privacy, rapportlezing, DPA en productgrenzen, publiek te controleren voordat je begint.',
    images: ['/opengraph-image'],
  },
}

export default function VertrouwenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.getloep.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Privacy', item: 'https://www.getloep.nl/vertrouwen' },
    ],
  }

  const ctaHref = buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'trust_primary_cta' })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen">
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
        <main id="hoofdinhoud">
          <VertrouwenContent />
        </main>
        <PublicFooter />
      </div>
    </>
  )
}

