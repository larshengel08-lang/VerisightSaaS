import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
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
      {
        '@type': 'ListItem',
        position: 3,
        name: product.label,
        item: fullUrl,
      },
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
    areaServed: {
      '@type': 'Country',
      name: 'Nederland',
    },
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
          itemOffered: {
            '@type': 'Service',
            name: product.serviceOutput ?? 'Dashboard en managementrapport',
          },
        },
      ],
    },
  }

  return [webpageSchema, breadcrumbSchema, serviceSchema]
}

function ExitScanPage() {
  return (
    <MarketingPageShell
      eyebrow="ExitScan"
      title="Maak vertrek bestuurlijk leesbaar."
      description="ExitScan helpt organisaties vertrekduiding opbouwen uit terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie. Geen harde oorzaakverklaring, wel een managementbeeld dat helpt prioriteren."
      theme="exit"
      highlightItems={['Primaire wedge', 'Vertrekduiding', 'Bestuurlijke handoff']}
      contextTitle="ExitScan verkoopt het sterkst wanneer de vraag eerst achteraf begrijpen is."
      contextBody="Deze pagina moet snel laten zien waarom ExitScan meestal de eerste route is: het product maakt losse exitinput bestuurlijk leesbaar en intern doorvertelbaar."
      heroNote="ExitScan blijft terugkijkend, groepsgericht en methodisch begrensd. Dat maakt de route scherper, niet smaller."
      ctaHref="#kennismaking"
    >
      <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="marketing-panel p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Wanneer past ExitScan?</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            Als je wilt leren van uitstroom zonder te blijven hangen in losse verhalen.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            ExitScan helpt patronen zichtbaar te maken in werkfactoren, vertrekredenen en signalen van
            werkfrictie. Daarmee wordt vertrekduiding bestuurlijk leesbaar, vergelijkbaar en beter bespreekbaar,
            zonder van de scan een diagnose of voorspelproduct te maken.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Voor terugkijkende analyse op ex-medewerkers',
              'Meer dan losse exitgesprekken of spreadsheetduiding',
              'Sterk als eerste nulmeting met gegroepeerde managementoutput',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                  +
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="marketing-panel-dark p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Wat management krijgt</p>
          <h2 className="font-display mt-4 text-4xl text-white">Een serieus managementinstrument voor uitstroomduiding.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Geen losse verzameling exitinput, maar een compacte rapportvorm die opent met managementsamenvatting,
            bestuurlijke handoff, eerste managementvraag en eerste logische stap. Zo zien HR, sponsor, MT en
            directie sneller welk vertrekbeeld terugkeert en waar vervolgactie logisch is.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Vertrekbeeld, werkfrictie en topfactoren in een leeslijn',
              'Bestuurlijke handoff voor sponsor, MT of directie',
              'Expliciete claims-, privacy- en interpretatiegrenzen',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="marketing-panel p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldoutput</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Laat de deliverable vroeg in het verhaal landen.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            De output combineert managementsamenvatting, bestuurlijke handoff, vertrekduiding, signalen van
            werkfrictie en prioritaire werkfactoren in een compacte managementstructuur.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <PreviewSlider variant="exit" />
          </div>
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

      <MarketingProofStrip
        className="mt-16"
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
              'Geen harde oorzaakverklaring van individueel vertrek',
              'Geen predictor van toekomstig verloop',
              'Geen ROI-theater of garantie op lager verloop',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Plan een gesprek over ExitScan"
          body="Beschrijf kort welke vertrekvraag nu bestuurlijk aandacht vraagt. Dan toetsen we of ExitScan Baseline de juiste eerste stap is en hoe jullie route naar een eerste managementread eruitziet."
          defaultRouteInterest="exitscan"
          defaultCtaSource="product_exit_form"
        />
      </div>

      <MarketingCalloutBand
        className="mt-16"
        eyebrow="Verschil met RetentieScan"
        title="ExitScan kijkt terug. RetentieScan signaleert eerder."
        body="ExitScan helpt vertrek achteraf duiden en is meestal het eerste traject. RetentieScan helpt eerder zien waar behoud onder druk staat. Samen vormen ze een logisch portfolio, maar ExitScan blijft de primaire wedge."
        primaryHref="#kennismaking"
        primaryLabel="Plan kennismaking"
        secondaryHref="/producten/retentiescan"
        secondaryLabel="Bekijk RetentieScan"
      />
    </MarketingPageShell>
  )
}

function RetentionScanPage() {
  return (
    <MarketingPageShell
      eyebrow="RetentieScan"
      title="Zie eerder waar behoud onder druk staat."
      description="RetentieScan helpt organisaties om op groeps- en segmentniveau eerder zichtbaar te maken waar behoud onder druk staat, met dashboard, rapport en bestuurlijke handoff in dezelfde professionele Verisight-structuur."
      theme="retention"
      highlightItems={['Complementaire route', 'Groepsniveau', 'Verification-first']}
      contextTitle="RetentieScan verkoopt het sterkst wanneer de actieve behoudsvraag expliciet op tafel ligt."
      contextBody="Deze pagina moet snel laten zien waarom RetentieScan geen brede MTO is, maar een gerichte managementroute voor vroegsignalering, verificatie en prioritering."
      heroNote="RetentieScan blijft groepsgericht, privacybewust en niet-predictief. Dat houdt de route geloofwaardig en bestuurlijk bruikbaar."
      ctaHref="#kennismaking"
    >
      <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="marketing-panel-soft p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Wanneer past RetentieScan?</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            Als je eerder wilt zien waar behoud op groepsniveau begint te schuiven.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Waar ExitScan helpt begrijpen waarom mensen gingen, helpt RetentieScan om eerder te zien waar behoud
            onder druk staat. Zo kan HR eerder prioriteren op de werkfactoren die nu aandacht vragen, zonder van de
            scan een brede MTO, performance-instrument of voorspelproduct te maken.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Vroegtijdig zien waar behoud onder druk staat',
              'Managementinformatie over beinvloedbare werkfactoren',
              'Geen individuele signalen of persoonsgerichte actieroutes naar management',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="marketing-panel p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Wat je krijgt</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Een vroegsignaal dat bestuurlijk bruikbaar blijft.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Geen individuele voorspelling en geen brede tevredenheidsmeting, maar een groepsweergave die opent met
            managementsamenvatting, bestuurlijke handoff, eerste verificatiespoor en eerste logische stap.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie in een leeslijn',
              'Bestuurlijke handoff voor sponsor, MT of directie',
              'Expliciete privacy-, claims- en bewijsstatuskaders',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="marketing-panel p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldoutput</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Laat de verification-first output vroeg zien.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            De preview laat zien hoe retentiesignaal, stay-intent, bevlogenheid, vertrekintentie en topfactoren
            samenkomen in een compacte managementweergave.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <PreviewSlider variant="retention" />
          </div>
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

      <MarketingProofStrip
        className="mt-16"
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
              'Retentiesignaal op groeps- en segmentniveau',
              'Stay-intent, bevlogenheid, vertrekintentie en beinvloedbare topfactoren',
              'Niet bedoeld als performance-instrument, brede MTO of individuele voorspeller',
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

      <div className="mt-16">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Plan een gesprek over RetentieScan"
          body="Beschrijf kort waar behoud nu onder druk staat. Dan toetsen we of RetentieScan Baseline de juiste eerste stap is en hoe jullie eerste meetroute geloofwaardig kan landen."
          defaultRouteInterest="retentiescan"
          defaultCtaSource="product_retention_form"
        />
      </div>

      <MarketingCalloutBand
        className="mt-16"
        eyebrow="Combinatie met ExitScan"
        title="Samen vormen ze een logisch portfolio."
        body="ExitScan helpt begrijpen waarom mensen gingen. RetentieScan helpt eerder zien waar behoud onder druk staat. Samen geven ze een scherper beeld van zowel achteraf duiden als vooruitkijken, meestal eerst via een baseline en pas daarna via ritme of combinatie."
        primaryHref="#kennismaking"
        primaryLabel="Plan kennismaking"
        secondaryHref="/producten/combinatie"
        secondaryLabel="Bekijk combinatie"
      />
    </MarketingPageShell>
  )
}

function CombinatiePage() {
  return (
    <MarketingPageShell
      eyebrow="Combinatie"
      title="Gebruik ExitScan en RetentieScan als bewuste portfolioroute."
      description="De combinatie is logisch voor organisaties die zowel willen leren van uitstroom als eerder willen signaleren waar behoud nu onder druk staat, zonder daarvan een bundel of derde standaardpakket te maken."
      theme="combination"
      highlightItems={['Portfolio-aanpak', 'Twee producten', 'Secundaire route']}
      contextTitle="De combinatie is geen verplichte instap, maar een route voor organisaties met twee echte managementvragen."
      contextBody="Deze pagina moet duidelijk maken dat het portfolio pas sterker wordt zodra beide vragen bestaan en de eerste route al scherp staat."
      heroNote="Combinatie betekent niet 'meer features'. Het betekent twee gerichte routes in een gedeelde managementtaal."
      ctaHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_hero' })}
    >
      <div className="marketing-panel-soft p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Wanneer kies je de combinatie?</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">
          Niet als derde losse scan, maar als route tussen twee gerichte producten.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Voor organisaties die niet alleen willen begrijpen waarom mensen zijn gegaan, maar ook eerder willen weten
          waar behoud in de actieve populatie aandacht vraagt. De combinatie is vooral sterk wanneer beide
          managementvragen tegelijk bestaan.
        </p>
      </div>

      <MarketingProofStrip
        className="mt-12"
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
          <h2 className="font-display mt-4 text-4xl text-white">Start vaak met een product, maar houd de tweede route bewust klaar.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            De combinatie is geen verplichte instap. Het is een koopreden voor organisaties die beide vragen tegelijk
            serieus willen adresseren in dezelfde managementtaal.
          </p>
        </div>
      </div>

      <MarketingCalloutBand
        className="mt-16"
        eyebrow="Volgende stap"
        title="Wil je bepalen of de combinatie logisch is?"
        body="In een kort gesprek kijken we of jullie vooral met een product moeten starten of direct baat hebben bij een portfolio-aanpak met beide scans."
        primaryHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_callout' })}
        primaryLabel="Plan kennismaking"
        secondaryHref="/producten"
        secondaryLabel="Bekijk producten"
      />
    </MarketingPageShell>
  )
}

function UpcomingProductPage({ slug }: { slug: string }) {
  const product = getMarketingProductBySlug(slug)
  if (!product) notFound()

  return (
    <MarketingPageShell
      eyebrow="Binnenkort"
      title={product.label}
      description={product.description}
      theme="coming-soon"
      highlightItems={['Productroute gereserveerd', 'Nog niet live', 'Buiten primaire salesflow']}
      contextTitle="Deze productroute blijft bewust ondersteunend zolang ExitScan en RetentieScan de live propositie dragen."
      contextBody="Zo kan het portfolio later groeien zonder dat de huidige publieke navigatie of verkoopflow productverwarring krijgt."
      heroNote="Deze route is nog geen onderdeel van de primaire publieke verkoopflow."
      ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: `upcoming_${slug}_hero` })}
    >
      <div className="marketing-panel p-8 text-center md:p-12">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
          Binnenkort beschikbaar
        </span>
        <h2 className="mt-6 text-3xl font-semibold text-slate-950">{product.tagline}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Deze productpagina is alvast gereserveerd binnen de bredere productstructuur. Daardoor kan Verisight later
          groeien zonder dat de huidige live propositie opnieuw op de schop hoeft.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={buildContactHref({ routeInterest: 'exitscan', ctaSource: `upcoming_${slug}_contact` })}
            className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Neem contact op
          </Link>
          <Link
            href="/producten"
            className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
          >
            Terug naar producten
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  )
}
