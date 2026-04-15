import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { buildContactHref } from '@/lib/contact-funnel'
import { ALL_MARKETING_PRODUCTS, type MarketingProduct, getMarketingProductBySlug } from '@/lib/marketing-products'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

type Props = { params: Promise<{ slug: string }> }

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export async function generateStaticParams() {
  return ALL_MARKETING_PRODUCTS.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)
  if (!product) return {}

  const description = product.description
  const url = `https://www.verisight.nl${product.href}`
  const imageAlt =
    product.status === 'live'
      ? product.ogAlt ?? `${product.label} productpagina van Verisight`
      : `${product.label} binnenkort bij Verisight`
  const imageUrl = `${product.href}/opengraph-image`

  return {
    title: product.seoTitle ?? `${product.label} | Verisight`,
    description,
    alternates: {
      canonical: product.href,
    },
    openGraph: {
      type: 'website',
      url,
      title: product.seoTitle ?? `${product.label} | Verisight`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seoTitle ?? `${product.label} | Verisight`,
      description,
      images: [imageUrl],
    },
  } satisfies Metadata
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)

  if (!product) notFound()

  const structuredData = getProductStructuredData(product)

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={`${product.slug}-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {slug === 'retentiescan' ? <RetentionScanPage /> : null}
      {slug === 'exitscan' ? <ExitScanPage /> : null}
      {slug === 'combinatie' ? <CombinatiePage /> : null}
      {!['retentiescan', 'exitscan', 'combinatie'].includes(slug) ? <UpcomingProductPage slug={slug} /> : null}
    </>
  )
}

function getProductStructuredData(product: MarketingProduct) {
  const fullUrl = `https://www.verisight.nl${product.href}`
  const imageUrl = `https://www.verisight.nl${product.href}/opengraph-image`

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: product.seoTitle ?? `${product.label} | Verisight`,
    description: product.description,
    url: fullUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Verisight',
      url: 'https://www.verisight.nl',
    },
    primaryImageOfPage: imageUrl,
    inLanguage: 'nl-NL',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Producten', item: 'https://www.verisight.nl/producten' },
      { '@type': 'ListItem', position: 3, name: product.label, item: fullUrl },
    ],
  }

  if (product.status !== 'live') {
    return [webpageSchema, breadcrumbSchema]
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: product.label,
    serviceType: product.serviceType ?? product.label,
    description: product.description,
    url: fullUrl,
    image: imageUrl,
    provider: {
      '@type': 'Organization',
      name: 'Verisight',
      url: 'https://www.verisight.nl',
    },
    areaServed: { '@type': 'Country', name: 'Nederland' },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: product.serviceAudience ?? 'HR-teams en directies',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${product.label} output`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: product.serviceOutput ?? 'Dashboard en managementrapport' },
        },
      ],
    },
  }

  return [webpageSchema, breadcrumbSchema, serviceSchema]
}

function ExitScanPage() {
  return (
    <MarketingPageShell
      theme="exit"
      pageType="product"
      ctaHref="#kennismaking"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-blue-600">ExitScan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Maak vertrek bestuurlijk leesbaar.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            ExitScan helpt organisaties vertrekduiding opbouwen uit terugkerende werkfactoren, vertrekredenen en
            signalen van werkfrictie. Geen harde oorzaakverklaring, wel een managementbeeld dat helpt prioriteren.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href="#kennismaking"
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
            <span className="marketing-stage-tag bg-blue-400/12 text-blue-100">Productfit</span>
            <h2 className="marketing-stage-title font-display text-white">
              ExitScan verkoopt het sterkst wanneer de vraag eerst achteraf begrijpen is.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Deze pagina moet snel laten zien waarom ExitScan meestal de eerste route is: het product maakt losse
              exitinput bestuurlijk leesbaar en intern doorvertelbaar.
            </p>
            <div className="marketing-stage-list">
              {[
                'Voor terugkijkende analyse op ex-medewerkers.',
                'Meer dan losse exitgesprekken of spreadsheetduiding.',
                'Sterk als eerste nulmeting met gegroepeerde managementoutput.',
              ].map((item) => (
                <div key={item} className="marketing-stage-list-item text-sm leading-7 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note text-sm leading-7 text-slate-600">
            ExitScan blijft terugkijkend, groepsgericht en methodisch begrensd. Dat maakt de route scherper, niet
            smaller.
          </div>
          <div className="marketing-link-grid">
            <Link
              href="/producten/retentiescan"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk RetentieScan
            </Link>
            <Link
              href="/vertrouwen"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk trustlaag
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
            <div className="marketing-panel p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldoutput</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                Laat de deliverable direct na de hero landen.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                De output combineert managementsamenvatting, bestuurlijke handoff, vertrekduiding, signalen van
                werkfrictie en prioritaire werkfactoren in een compacte managementstructuur.
              </p>
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <PreviewSlider variant="exit" />
              </div>
            </div>
            <PreviewEvidenceRail className="mt-6" variant="exit" />
          </div>

          {exitSampleAsset ? (
            <SampleShowcaseCard
              eyebrow="Volledig voorbeeldrapport"
              title="Open de canonieke ExitScan showcase."
              body="Gebruik de preview als teaser en dit buyer-facing voorbeeldrapport als echte prooflaag voor sales, pricing en interne doorvertaling."
              asset={exitSampleAsset}
              linkLabel="Open ExitScan-voorbeeldrapport"
            />
          ) : null}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingProofStrip
          items={[
            {
              title: 'Terugkijkend patroonbeeld',
              body: 'ExitScan helpt organisaties vertrek duiden op basis van terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie.',
            },
            {
              title: 'Meer dan losse exitgesprekken',
              body: 'Meerdere responses worden vertaald naar een vergelijkbaar managementbeeld dat intern beter te bespreken is.',
            },
            {
              title: 'Gericht op beinvloedbare factoren',
              body: 'Leiderschap, cultuur, groei, werkbelasting en rolhelderheid worden zichtbaar zonder harde diagnose of causaliteitsclaim.',
            },
          ]}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <MarketingComparisonTable
            columns={['Leeslens', 'Betekenis']}
            rows={[
              ['Hoofdvraag', 'Welk vertrekbeeld keert terug en welke werkfactoren wegen daarin mee?'],
              ['Leesrichting', 'Terugkijkend patroonbeeld op uitstroom'],
              ['Managementoutput', 'Vertrekduiding, signalen van werkfrictie en prioritaire werkfactoren'],
              ['Niet bedoeld als', 'Vroegsignalering in de actieve populatie of een diagnose-instrument'],
            ]}
          />

          <div className="marketing-panel-soft p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Wat ExitScan niet doet</p>
            <div className="mt-5 space-y-3">
              {[
                'Geen harde oorzaakverklaring van individueel vertrek.',
                'Geen predictor van toekomstig verloop.',
                'Geen ROI-theater of garantie op lager verloop.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Plan een gesprek over ExitScan"
          body="Beschrijf kort welke vertrekvraag nu bestuurlijk aandacht vraagt. Dan toetsen we of ExitScan Baseline de juiste eerste stap is en hoe jullie route naar een eerste managementread eruitziet."
          defaultRouteInterest="exitscan"
          defaultCtaSource="product_exit_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Verschil met RetentieScan"
          title="ExitScan kijkt terug. RetentieScan signaleert eerder."
          body="ExitScan helpt vertrek achteraf duiden en is meestal het eerste traject. Daarna wordt RetentieScan logisch zodra dezelfde thema's eerder in de actieve populatie moeten worden gesignaleerd. Samen vormen ze een logisch portfolio, maar ExitScan blijft de primaire wedge."
          primaryHref="#kennismaking"
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten/retentiescan"
          secondaryLabel="Bekijk RetentieScan"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function RetentionScanPage() {
  return (
    <MarketingPageShell
      theme="retention"
      pageType="product"
      ctaHref="#kennismaking"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-emerald-700">RetentieScan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Zie eerder waar behoud onder druk staat.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            RetentieScan helpt organisaties om op groeps- en segmentniveau eerder zichtbaar te maken waar behoud onder
            druk staat, met dashboard, rapport en bestuurlijke handoff in dezelfde professionele Verisight-structuur.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href="#kennismaking"
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
            <span className="marketing-stage-tag bg-emerald-400/12 text-emerald-100">Verification-first</span>
            <h2 className="marketing-stage-title font-display text-white">
              RetentieScan verkoopt het sterkst wanneer de actieve behoudsvraag expliciet op tafel ligt.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Deze pagina moet snel laten zien waarom RetentieScan geen brede MTO is, maar een gerichte managementroute
              voor vroegsignalering, verificatie en prioritering.
            </p>
            <div className="marketing-stage-list">
              {[
                'Vroegtijdig zien waar behoud onder druk staat.',
                'Managementinformatie over beinvloedbare werkfactoren.',
                'Geen individuele signalen of persoonsgerichte actieroutes naar management.',
              ].map((item) => (
                <div key={item} className="marketing-stage-list-item text-sm leading-7 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note text-sm leading-7 text-slate-600">
            RetentieScan blijft groepsgericht, privacybewust en niet-predictief. Dat houdt de route geloofwaardig en
            bestuurlijk bruikbaar.
          </div>
          <div className="marketing-link-grid">
            <Link
              href="/producten/exitscan"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk ExitScan
            </Link>
            <Link
              href="/vertrouwen"
              className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              Bekijk trustlaag
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
            <div className="marketing-panel p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldoutput</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                Laat de verification-first output direct na de hero zien.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                De preview laat zien hoe retentiesignaal, stay-intent, bevlogenheid, vertrekintentie en topfactoren
                samenkomen in een compacte managementweergave.
              </p>
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <PreviewSlider variant="retention" />
              </div>
            </div>
            <PreviewEvidenceRail className="mt-6" variant="retention" />
          </div>

          {retentionSampleAsset ? (
            <SampleShowcaseCard
              eyebrow="Volledig voorbeeldrapport"
              title="Open de buyer-facing RetentieScan showcase."
              body="Deze pdf laat dezelfde verification-first managementstructuur zien als live RetentieScan-output. Daarmee blijft de demo bruikbaar voor buyers die expliciet een behoudsvraag op groepsniveau willen toetsen."
              asset={retentionSampleAsset}
              linkLabel="Open RetentieScan-voorbeeldrapport"
            />
          ) : null}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingProofStrip
          items={[
            {
              title: 'Eerder signaleren',
              body: 'RetentieScan maakt zichtbaar waar behoud begint te schuiven voordat verloop zichtbaar wordt in vacatures, uitval of exitgesprekken.',
            },
            {
              title: 'Focus op beinvloedbare factoren',
              body: 'De scan kijkt naar leiderschap, cultuur, groei, werkbelasting, rolhelderheid en SDT-werkbeleving als werkbare managementthema\'s.',
            },
            {
              title: 'Gebouwd voor managementactie',
              body: 'De uitkomst is geen losse survey-export of brede MTO, maar een gedeelde taal voor HR, sponsor, MT en directie.',
            },
          ]}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="marketing-panel-dark p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Hoe je het leest</p>
            <h2 className="font-display mt-4 text-4xl text-white">Sterk als de vraag eerder signaleren is.</h2>
            <div className="mt-8 space-y-3">
              {[
                'Retentiesignaal op groeps- en segmentniveau.',
                'Stay-intent, bevlogenheid, vertrekintentie en beinvloedbare topfactoren.',
                'Niet bedoeld als performance-instrument, brede MTO of individuele voorspeller.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <MarketingComparisonTable
            columns={['Leeslens', 'Betekenis']}
            rows={[
              ['Hoofdvraag', 'Waar staat behoud nu onder druk in de actieve populatie?'],
              ['Leesrichting', 'Vroegsignalering op groeps- en segmentniveau'],
              ['Managementoutput', 'Retentiesignaal, stay-intent, bevlogenheid, vertrekintentie en topfactoren'],
              ['Niet bedoeld als', 'Persoonsgerichte voorspeller, brede MTO of performance-instrument'],
            ]}
          />
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Plan een gesprek over RetentieScan"
          body="Beschrijf kort waar behoud nu onder druk staat. Dan toetsen we of RetentieScan Baseline de juiste eerste stap is en hoe jullie eerste meetroute geloofwaardig kan landen."
          defaultRouteInterest="retentiescan"
          defaultCtaSource="product_retention_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Combinatie met ExitScan"
          title="Samen vormen ze een logisch portfolio."
          body="ExitScan helpt begrijpen waarom mensen gingen. RetentieScan helpt eerder zien waar behoud onder druk staat. Meestal start je met een baseline, daarna wordt RetentieScan ritme logisch en pas daarna eventueel ExitScan of combinatie als tweede route."
          primaryHref="#kennismaking"
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten/combinatie"
          secondaryLabel="Bekijk combinatie"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function CombinatiePage() {
  return (
    <MarketingPageShell
      theme="combination"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_hero' })}
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-sky-700">Combinatie</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Gebruik ExitScan en RetentieScan als bewuste portfolioroute.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            De combinatie is logisch voor organisaties die zowel willen leren van uitstroom als eerder willen
            signaleren waar behoud nu onder druk staat, zonder daarvan een bundel of derde standaardpakket te maken.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_hero' })}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Plan kennismaking
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-sky-400/12 text-sky-100">Portfolioroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              De combinatie is geen verplichte instap, maar een route voor twee echte managementvragen.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Deze pagina moet duidelijk maken dat het portfolio pas sterker wordt zodra beide vragen bestaan en de
              eerste route al scherp staat.
            </p>
            <div className="marketing-stage-list">
              {[
                'Stap 1: duid vertrek met ExitScan.',
                'Stap 2: signaleer behoud met RetentieScan.',
                'Stap 3: stuur in een gedeelde managementtaal.',
              ].map((item) => (
                <div key={item} className="marketing-stage-list-item text-sm leading-7 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note text-sm leading-7 text-slate-600">
            Combinatie betekent niet meer features, maar twee gerichte routes die pas logisch naast elkaar komen te
            staan wanneer de eerste keuze al landt.
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
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
            <div className="marketing-panel p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Portfolio-proof</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                Laat de gedeelde managementweergave pas na de keuze zien.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                De combinatie gebruikt dezelfde previewstructuur, maar de echte sample-output blijft via ExitScan en
                RetentieScan publiek verifieerbaar.
              </p>
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <PreviewSlider variant="portfolio" />
              </div>
            </div>
            <PreviewEvidenceRail className="mt-6" variant="portfolio" />
          </div>

          <div className="grid gap-5">
            {exitSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="ExitScan-proof"
                title="ExitScan blijft de eerste sample-anchor."
                body="Gebruik de ExitScan-showcase om de primaire wedge te bewijzen voordat de portfolio-aanpak in beeld komt."
                asset={exitSampleAsset}
                linkLabel="Open ExitScan-voorbeeldrapport"
              />
            ) : null}
            {retentionSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="RetentieScan-proof"
                title="RetentieScan bevestigt de tweede route."
                body="Gebruik de RetentieScan-showcase om te laten zien hoe vroegsignalering op behoud aansluit zodra de actieve behoudsvraag echt bestaat."
                asset={retentionSampleAsset}
                linkLabel="Open RetentieScan-voorbeeldrapport"
              />
            ) : null}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingProofStrip
          items={[
            {
              title: 'Stap 1: duid vertrek',
              body: 'Gebruik ExitScan om vertrekpatronen en terugkerende werkfactoren achteraf scherp te krijgen.',
            },
            {
              title: 'Stap 2: signaleer behoud',
              body: 'Gebruik RetentieScan om eerder zichtbaar te maken waar dezelfde thema\'s nu nog doorwerken in actieve teams.',
            },
            {
              title: 'Stap 3: stuur in een lijn',
              body: 'Gebruik een gedeelde managementtaal voor prioritering, opvolging en herhaalmeting.',
            },
          ]}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <MarketingComparisonTable
            columns={['Routevraag', 'Betekenis']}
            rows={[
              ['Hoofdvraag', 'Hoe verbinden we vertrekduiding en vroegsignalering in dezelfde lijn?'],
              ['Leesrichting', 'Achteraf begrijpen en vooruit kijken'],
              ['Managementoutput', 'Twee gerichte scans in een gedeeld portfolio'],
              ['Niet bedoeld als', 'Een algemene survey waar alles tegelijk in wordt gepropt'],
            ]}
          />

          <div className="marketing-panel-dark p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Hoe je het verkoopt</p>
            <h2 className="font-display mt-4 text-4xl text-white">
              Start vaak met een product, maar houd de tweede route bewust klaar.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              De combinatie is geen verplichte instap. Het is een koopreden voor organisaties die beide vragen tegelijk
              serieus willen adresseren in dezelfde managementtaal.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Plan een gesprek over de combinatieroute"
          body="Beschrijf kort of jullie vooral met een product willen starten of dat beide managementvragen nu al tegelijk spelen. Dan bepalen we welke route logisch is."
          defaultRouteInterest="combinatie"
          defaultCtaSource="product_combination_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Volgende stap"
          title="Wil je bepalen of de combinatie logisch is?"
          body="In een kort gesprek kijken we of jullie vooral met een product moeten starten of dat beide managementvragen pas na de eerste route genoeg onderbouwd zijn voor een portfolio-aanpak."
          primaryHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_callout' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk producten"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function UpcomingProductPage({ slug }: { slug: string }) {
  const product = getMarketingProductBySlug(slug)
  if (!product) notFound()
  return (
    <MarketingPageShell
      theme="support"
      pageType="support"
      ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: `upcoming_${slug}_hero` })}
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-slate-600">Binnenkort</p>
          <h1 className="marketing-hero-title marketing-hero-title-page font-display text-slate-950">{product.label}</h1>
          <p className="marketing-hero-copy text-slate-600">{product.description}</p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: `upcoming_${slug}_contact` })}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Neem contact op
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Terug naar producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-white/10 text-slate-200">Gereseveerde route</span>
            <h2 className="marketing-stage-title font-display text-white">
              Deze productroute blijft ondersteunend zolang ExitScan en RetentieScan de live propositie dragen.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Zo kan het portfolio later groeien zonder dat de huidige publieke navigatie of verkoopflow
              productverwarring krijgt.
            </p>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note text-sm leading-7 text-slate-600">
            Deze route is nog geen onderdeel van de primaire publieke verkoopflow.
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="plain">
        <div className="marketing-panel p-8 text-center md:p-12">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
            Binnenkort beschikbaar
          </span>
          <h2 className="mt-6 text-3xl font-semibold text-slate-950">{product.tagline}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Deze productpagina is alvast gereserveerd binnen de bredere productstructuur. Daardoor kan Verisight later
            groeien zonder dat de huidige live propositie opnieuw op de schop hoeft.
          </p>
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}
