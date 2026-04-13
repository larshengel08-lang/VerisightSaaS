import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { productOverviewComparisonRows, trustItems } from '@/components/marketing/site-content'
import { LIVE_MARKETING_PRODUCTS } from '@/lib/marketing-products'

export const metadata: Metadata = {
  title: 'Producten',
  description:
    'Bekijk ExitScan, RetentieScan en de combinatie in één heldere productstructuur voor HR-teams.',
  alternates: {
    canonical: '/producten',
  },
  openGraph: {
    title: 'Producten | Verisight',
    description:
      'Bekijk ExitScan, RetentieScan en de combinatie in één heldere productstructuur voor HR-teams.',
    url: 'https://www.verisight.nl/producten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten | Verisight',
    description:
      'Bekijk ExitScan, RetentieScan en de combinatie in één heldere productstructuur voor HR-teams.',
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingPageShell
        eyebrow="Producten"
        title="Twee live producten en een duidelijke combinatieroute."
        description="Verisight helpt HR-teams kiezen tussen ExitScan, RetentieScan en een bewuste combinatie van beide. Elk product heeft een eigen managementbelofte, maar gebruikt dezelfde professionele structuur van dashboard, rapportage en begeleiding."
      >
        <div className="grid gap-5 lg:grid-cols-3">
        {LIVE_MARKETING_PRODUCTS.map((product) => (
          <div key={product.slug} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Live product</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{product.label}</h2>
            <p className="mt-3 text-sm font-medium text-blue-700">{product.tagline}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
            <Link
              href={product.href}
              className="mt-8 inline-flex rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-950"
            >
              Bekijk {product.shortLabel}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
        <SectionHeading
          eyebrow="Kies bewust"
          title="Niet elk HR-vraagstuk vraagt dezelfde scan."
          description="De productkeuze bepaalt hoe management de uitkomst leest, welke vragen logisch zijn en welke acties je als eerste wilt uitwerken."
        />
        <MarketingComparisonTable
          className="mt-8"
          columns={['Product', 'Belofte', 'Hoofdvraag', 'Wanneer logisch']}
          rows={productOverviewComparisonRows}
        />
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldweergave</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Zo ziet een productoutput eruit voor management.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Verisight laat niet alleen antwoorden zien, maar vertaalt data naar managementduiding, prioriteiten en vervolgvraagstukken.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <PreviewSlider variant="portfolio" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Waarom dit werkt</p>
          <h2 className="font-display mt-4 text-4xl text-white">Je kiest eerst de juiste leesrichting en pas daarna de analyse.</h2>
          <p className="mt-5 text-sm leading-8 text-slate-300">
            Daardoor blijven ExitScan en RetentieScan inhoudelijk zuiver. De combinatie is geen derde losse survey, maar een bewuste route voor organisaties die zowel vertrek willen duiden als behoud eerder willen signaleren.
          </p>
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        </div>
      </div>

        <MarketingCalloutBand
          className="mt-16"
          eyebrow="Volgende stap"
          title="Twijfel je welk product nu het best past?"
          body="In een kort gesprek bepalen we of jullie vooral terugkijken naar vertrek, eerder willen signaleren op behoud of beide productsporen slim naast elkaar willen inzetten."
          primaryHref="/#kennismaking"
          primaryLabel="Plan mijn gesprek"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingPageShell>
    </>
  )
}
