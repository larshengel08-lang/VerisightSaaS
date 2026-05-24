import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { TarievenContent } from '@/components/marketing/tarieven-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Transparante prijzen voor ExitScan, RetentieScan en vervolgstappen. Zo blijft de eerste keuze helder en weet u wat u direct terugkrijgt.',
  alternates: { canonical: '/tarieven' },
  openGraph: {
    title: 'Tarieven | Loep',
    description:
      'Transparante prijzen voor ExitScan, RetentieScan en vervolgstappen. Zo blijft de eerste keuze helder en weet u wat u direct terugkrijgt.',
    url: 'https://www.verisight.nl/tarieven',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Loep tarieven voor ExitScan en RetentieScan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven | Loep',
    description:
      'Transparante prijzen voor ExitScan, RetentieScan en vervolgstappen. Zo blijft de eerste keuze helder en weet u wat u direct terugkrijgt.',
    images: ['/opengraph-image'],
  },
}

export default function TarievenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Tarieven', item: 'https://www.verisight.nl/tarieven' },
    ],
  }

  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_primary_cta' })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen">
        <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
        <main id="hoofdinhoud">
          <TarievenContent />
        </main>
        <PublicFooter />
      </div>
    </>
  )
}

