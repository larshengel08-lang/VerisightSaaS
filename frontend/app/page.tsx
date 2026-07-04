import type { Metadata } from 'next'
import { PublicHeader } from '@/components/marketing/public-header'
import { PublicFooter } from '@/components/marketing/public-footer'
import { HomePageContent } from '@/components/marketing/home-page-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { faqSchema } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Loep | Begeleide analyse van behoud, vertrek en onboarding',
  description:
    'Zie eerder waar behoud onder druk staat, waarom medewerkers vertrekken en hoe nieuwe mensen landen. Begeleide analyse voor HR en management, met rapport en managementbespreking inbegrepen.',
  alternates: { canonical: '/' },
}

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Loep',
    description:
      'Begeleide analyse van behoud, vertrek en onboarding voor HR en management, met managementrapport en begeleide bespreking per scan.',
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
