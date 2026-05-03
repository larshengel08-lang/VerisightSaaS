import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { ProductenContent } from '@/components/marketing/producten-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Producten',
  description:
    'Kies ExitScan als u vertrek achteraf wilt begrijpen. Kies RetentieScan als u eerder wilt zien waar behoud onder druk staat. Andere routes komen pas in beeld als de volgende vraag echt speelt.',
  alternates: {
    canonical: '/producten',
  },
  openGraph: {
    title: 'Producten | Verisight',
    description:
      'Kies ExitScan als u vertrek achteraf wilt begrijpen. Kies RetentieScan als u eerder wilt zien waar behoud onder druk staat. Andere routes komen pas in beeld als de volgende vraag echt speelt.',
    url: 'https://www.verisight.nl/producten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten | Verisight',
    description:
      'Kies ExitScan als u vertrek achteraf wilt begrijpen. Kies RetentieScan als u eerder wilt zien waar behoud onder druk staat. Andere routes komen pas in beeld als de volgende vraag echt speelt.',
    images: ['/opengraph-image'],
  },
}

export default function ProductenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Producten', item: 'https://www.verisight.nl/producten' },
    ],
  }

  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_primary_cta' })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen">
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
        <main id="hoofdinhoud">
          <ProductenContent />
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
