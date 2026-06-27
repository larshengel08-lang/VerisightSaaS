import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { ProductenContent } from '@/components/marketing/producten-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Producten',
  description:
    'Loep Vertrek als vertrek de vraag is. Loep Behoud als behoud eerder zichtbaar moet zijn. Loep Start als vroege landing aandacht vraagt.',
  alternates: {
    canonical: '/producten',
  },
  openGraph: {
    title: 'Producten | Loep',
    description:
      'Loep Vertrek als vertrek de vraag is. Loep Behoud als behoud eerder zichtbaar moet zijn. Loep Start als vroege landing aandacht vraagt.',
    url: 'https://www.getloep.nl/producten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten | Loep',
    description:
      'Loep Vertrek als vertrek de vraag is. Loep Behoud als behoud eerder zichtbaar moet zijn. Loep Start als vroege landing aandacht vraagt.',
    images: ['/opengraph-image'],
  },
}

export default function ProductenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.getloep.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Producten', item: 'https://www.getloep.nl/producten' },
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

