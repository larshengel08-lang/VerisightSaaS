import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { AanpakContent } from '@/components/marketing/aanpak-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Van kennismaking tot bruikbaar managementinzicht in gemiddeld drie weken. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
  alternates: { canonical: '/aanpak' },
  openGraph: {
    title: 'Aanpak | Verisight',
    description:
      'Van kennismaking tot bruikbaar managementinzicht in gemiddeld drie weken. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
    url: 'https://www.verisight.nl/aanpak',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aanpak | Verisight',
    description:
      'Van kennismaking tot bruikbaar managementinzicht in gemiddeld drie weken. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
    images: ['/opengraph-image'],
  },
}

export default function AanpakPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Aanpak', item: 'https://www.verisight.nl/aanpak' },
    ],
  }

  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_primary_cta' })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen">
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan suite-demo" />
        <main id="hoofdinhoud">
          <AanpakContent />
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
