import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { HomePageContent } from '@/components/marketing/home-page-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { faqSchema } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Verisight helpt HR en management sneller zien wat speelt, bepalen wat eerst telt en opvolging organiseren - met dashboard, rapport en Action Center in een suite.',
  alternates: { canonical: '/' },
}

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight',
    description:
      'Van people insights naar prioriteit, actie en follow-up voor HR en management. Verisight verbindt dashboard, rapport en Action Center in een suite.',
    url: 'https://www.verisight.nl/',
    inLanguage: 'nl-NL',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ExitScan', url: 'https://www.verisight.nl/producten/exitscan' },
        { '@type': 'ListItem', position: 2, name: 'RetentieScan', url: 'https://www.verisight.nl/producten/retentiescan' },
        { '@type': 'ListItem', position: 3, name: 'Onboarding 30-60-90', url: 'https://www.verisight.nl/producten/onboarding-30-60-90' },
      ],
    },
  }

  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_primary_cta' })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#132033] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <div className="min-h-screen">
        <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
        <main id="hoofdinhoud">
          <HomePageContent />
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
