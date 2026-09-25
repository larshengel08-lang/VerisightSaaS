import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { HomePageContent } from '@/components/marketing/home-page-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { HOME_SCHEMA_DESCRIPTION, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site-meta'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Loep',
    description: HOME_SCHEMA_DESCRIPTION,
    url: 'https://www.getloep.nl/',
    inLanguage: 'nl-NL',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Loep Vertrek', url: 'https://www.getloep.nl/producten#loep-vertrek' },
        { '@type': 'ListItem', position: 2, name: 'Loep Behoud', url: 'https://www.getloep.nl/producten#loep-behoud' },
        { '@type': 'ListItem', position: 3, name: 'Loep Start', url: 'https://www.getloep.nl/producten#loep-start' },
      ],
    },
  }

  // retentiescan: de lead-labeling volgt de retentie-geleide homepage-hero
  const ctaHref = buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'homepage_primary_cta' })

  return (
    <>
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
