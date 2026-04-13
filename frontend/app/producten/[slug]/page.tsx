import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { ALL_MARKETING_PRODUCTS, type MarketingProduct, getMarketingProductBySlug } from '@/lib/marketing-products'

type Props = { params: Promise<{ slug: string }> }

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
    title: product.label,
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
      title="Begrijp waarom mensen zijn vertrokken."
      description="ExitScan helpt organisaties vertrekduiding opbouwen uit terugkerende werkfactoren, vertrekredenen en managementrapportage."
      theme="exit"
      highlightItems={['Terugkijkend', 'Vertrekduiding', 'Managementrapport']}
      contextTitle="Een product voor organisaties die willen leren van vertrek dat al heeft plaatsgevonden."
      contextBody="ExitScan is het sterkst wanneer losse exitgesprekken te anekdotisch blijven en management sneller een terugkerend patroonbeeld nodig heeft."
    >
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="marketing-panel p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Wanneer past ExitScan?</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            Als je wilt leren van uitstroom zonder te blijven hangen in losse verhalen.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            ExitScan helpt patronen zichtbaar te maken in werkfactoren, vertrekredenen en managementsignalen. Daarmee wordt vertrekduiding vergelijkbaar en bespreekbaar.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Voor terugkijkende analyse op ex-medewerkers',
              'Meer dan losse exitgesprekken of spreadsheetduiding',
              'Logisch als nulmeting of eerste patroonanalyse',
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
            Geen losse verzameling exitinput, maar een compacte rapportvorm waarmee HR, MT en directie sneller zien welke thema&apos;s terugkeren en waar vervolgactie logisch is.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Frictiescore en vertrekduiding in één overzicht',
              'Werkfactoren die terugkomen in vrijwillig vertrek',
              'Een rapport dat direct bespreekbaar is in MT en directie',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <MarketingProofStrip
        className="mt-16"
        items={[
          {
            title: 'Terugkijkend patroonbeeld',
            body: 'ExitScan helpt organisaties begrijpen waarom mensen gingen en welke werkfactoren daar het vaakst in terugkomen.',
          },
          {
            title: 'Meer dan losse exitgesprekken',
            body: 'De scan vertaalt meerdere reacties naar een vergelijkbaar managementbeeld, zodat HR en MT sneller prioriteren.',
          },
          {
            title: 'Gericht op beïnvloedbare factoren',
            body: 'Leiderschap, cultuur, groei, werkbelasting en rolhelderheid worden zichtbaar als terugkerende vertrekduiding.',
          },
        ]}
      />

      <div className="mt-16 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <MarketingComparisonTable
          columns={['Leeslens', 'Betekenis']}
          rows={[
            ['Hoofdvraag', 'Waarom gingen mensen weg en welke factoren keren terug?'],
            ['Leesrichting', 'Terugkijkend patroonbeeld op uitstroom'],
            ['Managementoutput', 'Frictiescore, vertrekduiding en prioritaire werkfactoren'],
            ['Niet bedoeld als', 'Vroegsignalering in de actieve populatie'],
          ]}
        />
        <div className="marketing-panel p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldoutput</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Zo ziet ExitScan eruit voor management.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            De output combineert frictiescore, vertrekduiding en prioritaire werkfactoren in een compacte managementstructuur.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <PreviewSlider variant="exit" />
          </div>
        </div>
      </div>

      <MarketingCalloutBand
        className="mt-16"
        eyebrow="Verschil met RetentieScan"
        title="ExitScan kijkt terug. RetentieScan signaleert eerder."
        body="ExitScan helpt begrijpen waarom mensen gingen. RetentieScan helpt eerder zien waar behoud onder druk staat. Samen vormen ze een logisch portfolio, maar ExitScan blijft het product voor vertrekduiding achteraf."
        primaryHref="/#kennismaking"
        primaryLabel="Plan mijn gesprek"
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
      description="RetentieScan helpt organisaties om retentiesignalen en beïnvloedbare werkfactoren eerder zichtbaar te maken, met dashboard en rapport in dezelfde professionele Verisight-structuur."
      theme="retention"
      highlightItems={['Vroegsignalering', 'Groepsniveau', 'Behoudssignalen']}
      contextTitle="Een product voor organisaties die eerder willen zien waar behoud begint te schuiven."
      contextBody="RetentieScan is geen individuele voorspeller, maar een managementroute die zichtbaar maakt waar retentiesignalen, bevlogenheid en vertrekintentie nu aandacht vragen."
    >
      <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="marketing-panel-soft p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Waarom nu</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            ExitScan kijkt terug. RetentieScan kijkt eerder vooruit.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Waar ExitScan helpt begrijpen waarom mensen gingen, helpt RetentieScan om eerder te zien waar behoud onder druk staat. Zo kan HR eerder prioriteren op de werkfactoren die nog beïnvloedbaar zijn.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Vroegtijdig zien waar behoud onder druk staat',
              'Managementinformatie over beïnvloedbare werkfactoren',
              'Geen individuele risicoscores naar management',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="marketing-panel p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Wat je krijgt</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Een vroegsignaal dat bruikbaar is voor management.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Geen individuele risicovoorspelling, maar een groepsweergave van retentiesignalen, bevlogenheid, vertrekintentie en de factoren die behoud waarschijnlijk het meest beïnvloeden.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <PreviewSlider variant="retention" />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {[
          {
            title: 'Eerder signaleren',
            text: 'RetentieScan maakt zichtbaar waar behoud al begint te schuiven, voordat verloop zichtbaar wordt in vacatures, uitval of exitgesprekken.',
          },
          {
            title: 'Focus op beïnvloedbare factoren',
            text: 'De scan kijkt niet alleen naar sentiment, maar naar leiderschap, cultuur, groei, werkbelasting, rolhelderheid en SDT-werkbeleving.',
          },
          {
            title: 'Gebouwd voor managementactie',
            text: 'De uitkomst is geen losse survey-export, maar een gedeelde taal voor HR, MT en directie over waar retentie nu aandacht vraagt.',
          },
        ].map((card) => (
          <div key={card.title} className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-7">
            <h2 className="text-2xl font-semibold text-slate-950">{card.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">{card.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="marketing-panel-dark p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Hoe je het leest</p>
          <h2 className="font-display mt-4 text-4xl text-white">Sterk als de vraag eerder signaleren is.</h2>
          <div className="mt-8 space-y-3">
            {[
              'Retentiesignaal op groeps- en segmentniveau',
              'Bevlogenheid, vertrekintentie en beïnvloedbare topfactoren',
              'Niet bedoeld als performance-instrument of individuele voorspeller',
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
            ['Managementoutput', 'Retentiesignaal, bevlogenheid, vertrekintentie en topfactoren'],
            ['Niet bedoeld als', 'Persoonsgerichte voorspeller of performance-instrument'],
          ]}
        />
      </div>

      <MarketingCalloutBand
        className="mt-16"
        eyebrow="Combinatie met ExitScan"
        title="Samen vormen ze een logisch portfolio."
        body="ExitScan helpt begrijpen waarom mensen gingen. RetentieScan helpt eerder zien waar behoud onder druk staat. Samen geven ze een scherper beeld van zowel achteraf duiden als vooruit kijken, zonder dat RetentieScan een diagnose- of voorspelproduct hoeft te worden."
        primaryHref="/#kennismaking"
        primaryLabel="Plan mijn gesprek"
        secondaryHref="/producten/combinatie"
        secondaryLabel="Bekijk Combinatie"
      />
    </MarketingPageShell>
  )
}

function CombinatiePage() {
  return (
    <MarketingPageShell
      eyebrow="Combinatie"
      title="Gebruik ExitScan en RetentieScan als bewuste portfolioroute."
      description="De combinatie is logisch voor organisaties die zowel willen leren van uitstroom als eerder willen signaleren waar behoud nu onder druk staat."
      theme="combination"
      highlightItems={['Portfolio-aanpak', 'Twee producten', 'Eén platform']}
      contextTitle="Een route voor organisaties waar uitstroom en behoud tegelijk op tafel liggen."
      contextBody="De combinatie is vooral sterk wanneer management zowel oorzaken achteraf wil begrijpen als eerder wil weten waar behoud in de actieve populatie begint te schuiven."
    >
      <div className="marketing-panel-soft p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Wanneer kies je de combinatie?</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Niet als derde losse scan, maar als route tussen twee gerichte producten.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Voor organisaties die niet alleen willen begrijpen waarom mensen zijn gegaan, maar ook eerder willen weten waar behoud in de actieve populatie aandacht vraagt. De combinatie is vooral sterk wanneer beide managementvragen tegelijk bestaan.
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
            body: 'Gebruik RetentieScan om eerder zichtbaar te maken waar dezelfde thema’s nu nog doorwerken in actieve teams.',
          },
          {
            title: 'Stap 3: stuur in één lijn',
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
          <h2 className="font-display mt-4 text-4xl text-white">Start vaak met één product, maar houd de tweede route bewust klaar.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            De combinatie is geen verplichte instap. Het is een koopreden voor organisaties die beide vragen tegelijk serieus willen adresseren in dezelfde managementtaal.
          </p>
        </div>
      </div>

      <MarketingCalloutBand
        className="mt-16"
        eyebrow="Volgende stap"
        title="Wil je bepalen of de combinatie logisch is?"
        body="In een kort gesprek kijken we of jullie vooral met één product moeten starten of direct baat hebben bij een portfolio-aanpak met beide scans."
        primaryHref="/#kennismaking"
        primaryLabel="Plan mijn gesprek"
        secondaryHref="/producten"
        secondaryLabel="Bekijk alle producten"
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
      highlightItems={['Productroute gereserveerd', 'Nog niet live', 'Portfolio-proof']}
      contextTitle="Deze productroute staat klaar binnen dezelfde productstructuur."
      contextBody="Zo groeit het portfolio straks door zonder dat live producten onduidelijk worden of de navigatie opnieuw moet worden uitgevonden."
    >
      <div className="marketing-panel p-8 text-center md:p-12">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
          Binnenkort beschikbaar
        </span>
        <h2 className="mt-6 text-3xl font-semibold text-slate-950">{product.tagline}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Deze productpagina is alvast gereserveerd binnen de nieuwe productstructuur. Daardoor kan Verisight nieuwe producten live zetten zonder dat de huidige portfolio-ervaring opnieuw op de schop hoeft.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/#kennismaking"
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
