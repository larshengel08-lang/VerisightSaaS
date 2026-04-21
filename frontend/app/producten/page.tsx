import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  productOverviewAddOnRoutes,
  productOverviewComparisonRows,
  productOverviewPortfolioRoute,
  productOverviewPrimaryRoutes,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Producten',
  description:
    'Kies de route die past bij uw vraag: ExitScan voor vertrekduiding, RetentieScan voor vroegsignalering op behoud en compacte vervolgroutes voor verdieping.',
  alternates: {
    canonical: '/producten',
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

      <MarketingPageShell
        theme="combination"
        pageType="overview"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">Producten</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[#132033]">
              Drie hoofdproducten, twee add-ons en een portfolioroute.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight verkoopt niet een brede people-tool. U kiest de route die past bij de vraag: vertrek, behoud
              of onboarding. Pulse en Leadership blijven add-ons. Combinatie blijft een portfolioroute, geen bundel.
            </p>
            <div className="marketing-hero-cta-row marketing-hero-actions">
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_hero_primary' })}
                className="marketing-button-primary"
              >
                Plan een kennismaking
              </Link>
              <Link href="/tarieven" className="marketing-button-secondary">
                Bekijk prijzen
              </Link>
            </div>
          </MarketingHeroIntro>
        }
      >
        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Hoofdproducten"
            title="De drie routes die zelfstandig commercieel kunnen openen."
            description="Deze producten mogen als eerste entree werken, maar blijven elk scherp begrensd in hun eigen vraag."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.08rem] border border-[#E5E0D6] bg-[#E5E0D6] md:grid-cols-2 xl:grid-cols-3">
            {productOverviewPrimaryRoutes.map((route) => (
              <div key={route.name} className="flex h-full flex-col bg-[#FFFCF7] p-7 md:p-8">
                <span className="marketing-chip self-start">{route.chip}</span>
                <h2 className="mt-5 text-[1.16rem] font-medium text-[#132033]">{route.name}</h2>
                <p className="mt-3 text-[1.12rem] leading-8 text-[#132033]">{route.title}</p>
                <p className="mt-3 text-[0.95rem] leading-7 text-[#4A5563]">{route.body}</p>
                <Link
                  href={route.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#132033] hover:underline"
                >
                  Meer over {route.name} <span aria-hidden>{'->'}</span>
                </Link>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="marketing-panel p-8 md:p-9">
            <SectionHeading
              eyebrow={productOverviewPortfolioRoute.eyebrow}
              title={productOverviewPortfolioRoute.headline}
              description={productOverviewPortfolioRoute.body}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={productOverviewPortfolioRoute.href} className="marketing-button-secondary">
                Bekijk Combinatie
              </Link>
              <Link href="/contact" className="marketing-button-secondary">
                Bespreek mijn route
              </Link>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Add-ons"
              title="Kleiner, gerichter en pas logisch na een eerste route."
              description="Pulse en Leadership openen niet het portfolio. Ze verdiepen of herijken pas nadat een eerste vraag al liep."
            />
            <Link href="/contact" className="text-[14px] font-medium text-[#132033] hover:underline">
              Bespreek de vervolgstap {'->'}
            </Link>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.08rem] border border-[#E5E0D6] bg-[#E5E0D6] md:grid-cols-2">
            {productOverviewAddOnRoutes.map((route) => (
              <Link
                key={route.title}
                href={route.href}
                className="group flex items-center justify-between gap-4 bg-[#FFFCF7] px-6 py-6 transition-colors hover:bg-white"
              >
                <div>
                  <p className="text-[15px] font-medium text-[#132033]">{route.title}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[#4A5563]">{route.body}</p>
                </div>
                <span className="shrink-0 text-[14px] text-[#4A5563] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  {'->'}
                </span>
              </Link>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Welke route past?"
            title="Kort commercieel overzicht."
            description="Zo blijft zichtbaar wat hoofdproduct, add-on en portfolioroute is."
          />
          <div className="mt-10">
            <MarketingComparisonTable
              columns={['Route', 'Rol', 'Type vraag', 'Waar helpt het bij?', 'Commerciële plek']}
              rows={productOverviewComparisonRows}
            />
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Kennismaking"
            title="Twijfelt u welke route nu past?"
            body="In een eerste gesprek maken we snel duidelijk welke route nu logisch is en welke vervolgstap u beter nog even laat wachten."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk prijzen"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
