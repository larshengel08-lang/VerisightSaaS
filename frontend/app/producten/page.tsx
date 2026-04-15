import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { productOverviewComparisonRows } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { CORE_MARKETING_PRODUCTS, PORTFOLIO_ROUTE_MARKETING_PRODUCTS } from '@/lib/marketing-products'
import { SEO_SOLUTION_PAGES } from '@/lib/seo-solution-pages'

export const metadata: Metadata = {
  title: 'Producten',
  description: 'Bekijk twee kernproducten en een bewuste portfolioroute in een heldere productstructuur voor HR-teams.',
  alternates: {
    canonical: '/producten',
  },
  openGraph: {
    title: 'Producten | Verisight',
    description: 'Bekijk twee kernproducten en een bewuste portfolioroute in een heldere productstructuur voor HR-teams.',
    url: 'https://www.verisight.nl/producten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten | Verisight',
    description: 'Bekijk twee kernproducten en een bewuste portfolioroute in een heldere productstructuur voor HR-teams.',
    images: ['/opengraph-image'],
  },
}

export default function ProductenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.verisight.nl/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Producten',
        item: 'https://www.verisight.nl/producten',
      },
    ],
  }

  const primaryProducts = CORE_MARKETING_PRODUCTS
  const combinationProduct = PORTFOLIO_ROUTE_MARKETING_PRODUCTS[0]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingPageShell
        theme="neutral"
        pageType="overview"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_hero' })}
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-blue-600">Producten</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-slate-950">
              Twee kernproducten en een bewuste portfolioroute.
            </h1>
            <p className="marketing-hero-copy text-slate-600">
              Gebruik deze pagina om snel te bepalen of jullie eerst vertrek willen duiden, eerder willen signaleren
              waar behoud schuift, of beide vragen pas daarna bewust naast elkaar willen organiseren zonder daar een
              derde kernproduct van te maken.
            </p>
            <div className="marketing-hero-actions">
              <div className="marketing-hero-cta-row">
                <a
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_hero' })}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Plan kennismaking
                </a>
                <Link
                  href="/tarieven"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage>
            <div className="space-y-5">
              <span className="marketing-stage-tag bg-blue-400/12 text-blue-100">2 kernproducten + 1 route</span>
              <h2 className="marketing-stage-title font-display text-white">
                Begin met de vraag die nu bestuurlijk het meeste gewicht heeft.
              </h2>
              <p className="marketing-stage-copy text-slate-300">
                De producten zijn niet symmetrisch bedoeld. ExitScan blijft meestal de eerste wedge. RetentieScan
                wordt sterker zodra de actieve behoudsvraag expliciet op tafel ligt.
              </p>
              <div className="grid gap-3">
                {primaryProducts.map((product, index) => (
                  <Link
                    key={product.slug}
                    href={product.href}
                    className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                      {index === 0 ? 'Kernproduct - primair' : 'Kernproduct - complementair'}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">{product.label}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{product.description}</p>
                  </Link>
                ))}
                <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                        Portfolioroute
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">{combinationProduct.label}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                      Route
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    De combinatie is een bewuste vervolgstap zodra beide managementvragen echt bestaan.
                  </p>
                </div>
              </div>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note text-sm leading-7 text-slate-600">
              Deze overzichtspagina hoeft niet alle proof zelf te dragen. Zijn taak is kiezen versnellen en daarna
              doorsturen naar de detailpagina waar de deliverable en sample-output echt landen. Andere proposities
              blijven bewust buiten deze actieve kernportfolio.
            </div>
            <div className="marketing-link-grid">
              <Link
                href="/producten/exitscan"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk ExitScan
              </Link>
              <Link
                href="/producten/retentiescan"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk RetentieScan
              </Link>
              <Link
                href="/aanpak"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk aanpak
              </Link>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="plain">
          <div className="grid gap-6 lg:grid-cols-2">
            {primaryProducts.map((product, index) => (
              <div
                key={product.slug}
                className={`rounded-[2rem] border p-8 shadow-sm ${
                  index === 0 ? 'border-blue-200 bg-blue-50' : 'border-emerald-200 bg-emerald-50'
                }`}
              >
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${index === 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {index === 0 ? 'Kernproduct - primair' : 'Kernproduct - complementair'}
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950">{product.label}</h2>
                <p className={`mt-3 text-sm font-semibold ${index === 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {product.tagline}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-700">{product.description}</p>
                <Link
                  href={product.href}
                  className="mt-8 inline-flex rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk {product.shortLabel}
                </Link>
              </div>
            ))}
          </div>

            <div className="mt-6 rounded-[2rem] border border-sky-200 bg-sky-50 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Portfolioroute</p>
                  <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                    {combinationProduct.label} als bewuste vervolgstap
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    De combinatie is geen derde hoofdproduct dat even zwaar meeweegt in de eerste keuze. Hij wordt
                    logisch wanneer beide managementvragen echt bestaan en de eerste route al duidelijk staat.
                  </p>
                </div>
              <Link
                href={combinationProduct.href}
                className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk combinatie
              </Link>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Vergelijking"
                title="Niet elk HR-vraagstuk vraagt dezelfde scan."
                description="De productkeuze bepaalt hoe management de uitkomst leest, welke vragen logisch zijn en welke eerste stap intern geloofwaardig voelt."
              />
              <MarketingComparisonTable
                className="mt-8"
                columns={['Product', 'Belofte', 'Hoofdvraag', 'Wanneer logisch']}
                rows={productOverviewComparisonRows}
              />
            </div>

            <div>
              <SectionHeading
                eyebrow="Proofteaser"
                title="Gebruik preview als teaser, niet als tweede hero."
                description="De overview laat alvast de managementweergave zien, maar stuurt voor echte proof en sample-output door naar de detailpagina’s."
              />
              <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6">
                <PreviewSlider variant="portfolio" />
              </div>
              <PreviewEvidenceRail className="mt-6" variant="portfolio" />
            </div>
          </div>
        </MarketingSection>

        {SEO_SOLUTION_PAGES.length > 0 ? (
          <MarketingSection tone="plain">
            <div className="marketing-panel-soft p-8 md:p-10">
              <SectionHeading
                eyebrow="Veelgezochte insteken"
                title="Gebruik een gerichte oplossingspagina als de vraag al scherp is."
                description="Deze routes zijn compact opgezet voor buyers die niet eerst het hele portfolio willen vergelijken, maar meteen willen landen op de juiste managementvraag."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {SEO_SOLUTION_PAGES.map((page) => (
                  <Link
                    key={page.slug}
                    href={page.canonical}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-slate-950">{page.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{page.heroDescription}</p>
                  </Link>
                ))}
              </div>
            </div>
          </MarketingSection>
        ) : null}

        <MarketingSection tone="plain">
          <div className="marketing-panel-soft p-8 md:p-10">
              <SectionHeading
                eyebrow="Handoff"
                title="Na routekeuze volgt geen losse demo, maar een begeleide intake."
                description="Na kennismaking bevestigen we eerst welk kernproduct nu past, welke respondentbasis beschikbaar is en hoe de eerste waarde geloofwaardig wordt opgebouwd."
              />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                'ExitScan blijft de default eerste stap als de vraag vooral vertrek achteraf begrijpen is.',
                'RetentieScan wordt alleen de eerste route wanneer de actieve behoudsvraag expliciet op tafel ligt.',
                'De combinatie blijft een bewuste tweede route, niet de standaard eerste contactinsteek.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Volgende stap"
            title="Twijfel je welke route nu het best past?"
            body="In een kort gesprek bepalen we of jullie vooral terugkijken naar vertrek, eerder willen signaleren op behoud of beide productsporen slim naast elkaar willen inzetten."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_callout' })}
            primaryLabel="Plan kennismaking"
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk tarieven"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
