import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { TarievenContent } from '@/components/marketing/tarieven-content'
import { getBillingReadinessCopy } from '@/lib/billing-registry'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450 en bounded vervolgroutes alleen wanneer die echt logisch worden.',
  alternates: { canonical: '/tarieven' },
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450 en bounded vervolgroutes alleen wanneer die echt logisch worden.',
    url: 'https://www.verisight.nl/tarieven',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Verisight tarieven voor ExitScan en RetentieScan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven | Verisight',
    description:
      'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450 en bounded vervolgroutes alleen wanneer die echt logisch worden.',
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
  const billingReadinessCopy = getBillingReadinessCopy({
    contractSigned: false,
    paymentMethodConfirmed: false,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen">
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een eerste route-inschatting" />
        <main id="hoofdinhoud">
          <section className="border-b border-[#e7dfd2] bg-[#f7f4ee] px-6 py-4 text-sm text-slate-700 sm:px-10">
            <div className="mx-auto max-w-6xl">
              <strong className="font-semibold text-slate-900">Billing en activatie blijven assisted.</strong>{' '}
              {billingReadinessCopy}
            </div>
          </section>
          <TarievenContent />
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
