import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { productOverviewComparisonRows, trustItems } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { LIVE_MARKETING_PRODUCTS } from '@/lib/marketing-products'

export const metadata: Metadata = {
  title: 'Producten',
  description: 'Bekijk ExitScan, RetentieScan en de combinatie in een heldere productstructuur voor HR-teams.',
  alternates: {
    canonical: '/producten',
  },
  openGraph: {
    title: 'Producten | Verisight',
    description: 'Bekijk ExitScan, RetentieScan en de combinatie in een heldere productstructuur voor HR-teams.',
    url: 'https://www.verisight.nl/producten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten | Verisight',
    description: 'Bekijk ExitScan, RetentieScan en de combinatie in een heldere productstructuur voor HR-teams.',
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

  const primaryProducts = LIVE_MARKETING_PRODUCTS.slice(0, 2)
  const combinationProduct = LIVE_MARKETING_PRODUCTS[2]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingPageShell
        eyebrow="Producten"
        title="Twee live routes en een bewuste combinatieroute."
        description="Gebruik deze pagina om snel te bepalen of jullie eerst vertrek willen duiden, eerder willen signaleren waar behoud schuift, of beide vragen pas daarna bewust naast elkaar willen organiseren."
        contextTitle="Begin met de vraag die nu bestuurlijk het meeste gewicht heeft."
        contextBody="De producten zijn niet symmetrisch bedoeld. ExitScan blijft meestal de eerste wedge. RetentieScan wordt sterker zodra de actieve behoudsvraag expliciet op tafel ligt."
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_hero' })}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {primaryProducts.map((product, index) => (
            <div
              key={product.slug}
              className={`rounded-[2rem] border p-8 shadow-sm ${index === 0 ? 'border-blue-200 bg-blue-50' : 'border-emerald-200 bg-emerald-50'}`}
            >
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${index === 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
                {index === 0 ? 'Primaire route' : 'Gerichte route'}
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">{product.label}</h2>
              <p className={`mt-3 text-sm font-semibold ${index === 0 ? 'text-blue-700' : 'text-emerald-700'}`}>{product.tagline}</p>
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Combinatieroute</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">{combinationProduct.label} als bewuste vervolgstap</h2>
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

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <SectionHeading
              eyebrow="Kies bewust"
              title="Niet elk HR-vraagstuk vraagt dezelfde scan."
              description="De productkeuze bepaalt hoe management de uitkomst leest, welke vragen logisch zijn en welke eerste stap intern geloofwaardig voelt."
            />
            <MarketingComparisonTable
              className="mt-8"
              columns={['Product', 'Belofte', 'Hoofdvraag', 'Wanneer logisch']}
              rows={productOverviewComparisonRows}
            />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Prooflaag</p>
            <h2 className="font-display mt-4 text-4xl text-white">Laat eerst de deliverable zien.</h2>
            <p className="mt-5 text-sm leading-8 text-slate-300">
              De keuze wordt sterker wanneer buyers direct zien hoe dashboard, managementrapport en bestuurlijke
              handoff in elkaar grijpen. Daarom staat sample-output hier als proof, niet als losse demo.
            </p>
            <div className="mt-8">
              <TrustStrip items={trustItems} tone="dark" />
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
          <SectionHeading
            eyebrow="Voorbeeldweergave"
            title="Zo ziet de managementweergave eruit voordat je een gesprek plant."
            description="Gebruik de preview als snelle teaser. Op de productpagina's vind je daarna de productspecifieke voorbeeldrapporten."
          />
          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <PreviewSlider variant="portfolio" />
          </div>
        </div>

        <div className="mt-16 marketing-panel-soft p-8 md:p-10">
          <SectionHeading
            eyebrow="Handoff"
            title="Na routekeuze volgt geen losse demo, maar een begeleide intake."
            description="Na kennismaking bevestigen we eerst welke route nu past, welke respondentbasis beschikbaar is en hoe de eerste waarde geloofwaardig wordt opgebouwd."
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

        <MarketingCalloutBand
          className="mt-16"
          eyebrow="Volgende stap"
          title="Twijfel je welke route nu het best past?"
          body="In een kort gesprek bepalen we of jullie vooral terugkijken naar vertrek, eerder willen signaleren op behoud of beide productsporen slim naast elkaar willen inzetten."
          primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_callout' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingPageShell>
    </>
  )
}
