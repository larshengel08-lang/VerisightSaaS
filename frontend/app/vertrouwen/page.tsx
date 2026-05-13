import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { VertrouwenContent } from '@/components/marketing/vertrouwen-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Vertrouwen',
  description:
    'Wat u publiek kunt toetsen voordat u start. Privacy, rapportage en duidelijke grenzen in wat Loep laat zien.',
  alternates: { canonical: '/vertrouwen' },
  openGraph: {
    title: 'Vertrouwen | Loep',
    description:
      'Wat u publiek kunt toetsen voordat u start. Privacy, rapportage en duidelijke grenzen in wat Loep laat zien.',
    url: 'https://www.verisight.nl/vertrouwen',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertrouwen | Loep',
    description:
      'Wat u publiek kunt toetsen voordat u start. Privacy, rapportage en duidelijke grenzen in wat Loep laat zien.',
    images: ['/opengraph-image'],
  },
}

export default function VertrouwenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Vertrouwen', item: 'https://www.verisight.nl/vertrouwen' },
    ],
  }

  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'trust_primary_cta' })

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

