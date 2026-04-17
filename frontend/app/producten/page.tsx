import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Producten',
  description: 'Kies de scan die past bij uw vraagstuk: ExitScan voor vertrekduiding of RetentieScan voor vroegsignalering op behoud.',
  alternates: {
    canonical: '/producten',
  },
  openGraph: {
    title: 'Producten | Verisight',
    description: 'Kies de scan die past bij uw vraagstuk: ExitScan voor vertrekduiding of RetentieScan voor vroegsignalering op behoud.',
    url: 'https://www.verisight.nl/producten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten | Verisight',
    description: 'Kies de scan die past bij uw vraagstuk: ExitScan voor vertrekduiding of RetentieScan voor vroegsignalering op behoud.',
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main>

          {/* Hero */}
          <section className="bg-[#F7F5F1] border-b border-[#E5E0D6]">
            <div className="marketing-shell py-14">
              <SectionHeading
                eyebrow="Twee scans, één richting"
                title="Kies de scan die past bij uw vraagstuk"
                description="ExitScan helpt vertrek achteraf begrijpen. RetentieScan helpt eerder signaleren waar behoud onder druk staat. Beide producten zijn gericht op een concrete managementvraag."
              />
            </div>
          </section>

          {/* Product blocks */}
          <MarketingSection tone="tint">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ExitScan */}
              <div className="flex flex-col rounded-xl border border-[#E5E0D6] bg-white p-8">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Uitstroom</p>
                <h2 className="mt-3 text-2xl font-medium text-[#132033]">ExitScan</h2>
                <p className="mt-2 text-base font-medium text-[#132033]">Begrijp waarom medewerkers vertrekken</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {[
                    'Retrospectief — analyse van vertrek in de afgelopen periode',
                    'Live — doorlopende scan bij nieuwe vertrekkers',
                    'Segment Deep Dive — add-on voor verdieping op afdeling of functiegroep',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/producten/exitscan"
                  className="mt-6 inline-flex self-start rounded-md bg-[#3C8D8A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
                >
                  Meer over ExitScan →
                </Link>
              </div>

              {/* RetentieScan */}
              <div className="flex flex-col rounded-xl border border-[#E5E0D6] bg-white p-8">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Behoud</p>
                <h2 className="mt-3 text-2xl font-medium text-[#132033]">RetentieScan</h2>
                <p className="mt-2 text-base font-medium text-[#132033]">Zie waar behoud onder druk staat</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {[
                    'Live meting — actuele signalen bij actieve medewerkers',
                    'Momentopname — gerichte baseline om retentierisico\'s in kaart te brengen',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/producten/retentiescan"
                  className="mt-6 inline-flex self-start rounded-md bg-[#3C8D8A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
                >
                  Meer over RetentieScan →
                </Link>
              </div>
            </div>

            {/* Keuzehulp */}
            <div className="mt-12 text-center">
              <p className="text-sm text-[#4A5563]">Twijfelt u welke scan past? Wij helpen u kiezen.</p>
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_overview_help' })}
                className="mt-3 inline-flex rounded-md bg-[#3C8D8A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </Link>
            </div>
          </MarketingSection>

        </main>
        <PublicFooter />
      </div>
    </>
  )
}
