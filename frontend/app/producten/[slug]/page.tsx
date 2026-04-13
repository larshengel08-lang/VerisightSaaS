import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { trustItems } from '@/components/marketing/site-content'
import { ALL_MARKETING_PRODUCTS, getMarketingProductBySlug } from '@/lib/marketing-products'

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
      ? `${product.label} productpagina van Verisight`
      : `${product.label} binnenkort bij Verisight`

  return {
    title: product.label,
    description,
    alternates: {
      canonical: product.href,
    },
    openGraph: {
      type: 'website',
      url,
      title: `${product.label} | Verisight`,
      description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.label} | Verisight`,
      description,
      images: ['/og-image.png'],
    },
  } satisfies Metadata
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)

  if (!product) notFound()

  if (slug === 'retentiescan') return <RetentionScanPage />
  if (slug === 'exitscan') return <ExitScanPage />
  if (slug === 'combinatie') return <CombinatiePage />
  return <UpcomingProductPage slug={slug} />
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
      <FeatureSplit
        leftEyebrow="Wanneer past ExitScan?"
        leftTitle="Als je wilt leren van uitstroom zonder te blijven hangen in losse verhalen."
        leftBody="ExitScan helpt patronen zichtbaar te maken in werkfactoren, vertrekredenen en managementsignalen. Daarmee wordt vertrekduiding vergelijkbaar en bespreekbaar."
        leftPoints={[
          'Voor terugkijkende analyse op ex-medewerkers',
          'Meer dan losse exitgesprekken of spreadsheetduiding',
          'Logisch als nulmeting of eerste patroonanalyse',
        ]}
        rightEyebrow="Wat management krijgt"
        rightTitle="Een serieus managementinstrument voor uitstroomduiding."
        rightBody="Geen losse verzameling exitinput, maar een compacte rapportvorm waarmee HR, MT en directie sneller zien welke thema's terugkeren en waar vervolgactie logisch is."
        theme="dark"
      />

      <ThreeLensBlock
        eyebrow="Waar ExitScan sterk in is"
        title="Drie redenen waarom ExitScan anders leest dan een gewone exitinventarisatie."
        cards={[
          {
            title: 'Terugkijkend patroonbeeld',
            text: 'ExitScan helpt organisaties begrijpen waarom mensen gingen en welke werkfactoren daar het vaakst in terugkomen.',
          },
          {
            title: 'Meer dan losse exitgesprekken',
            text: 'De scan vertaalt meerdere reacties naar een vergelijkbaar managementbeeld, zodat HR en MT sneller prioriteren.',
          },
          {
            title: 'Gericht op beïnvloedbare werkfactoren',
            text: 'Leiderschap, cultuur, groei, werkbelasting en rolhelderheid worden zichtbaar als terugkerende vertrekduiding.',
          },
        ]}
      />

      <ProductUseMatrix
        eyebrow="Hoe je het leest"
        title="ExitScan is sterk als de vraag achteraf duiden is."
        rows={[
          ['Hoofdvraag', 'Waarom gingen mensen weg en welke factoren keren terug?'],
          ['Leesrichting', 'Terugkijkend patroonbeeld op uitstroom'],
          ['Managementoutput', 'Frictiescore, vertrekduiding en prioritaire werkfactoren'],
          ['Niet bedoeld als', 'Vroegsignalering in de actieve populatie'],
        ]}
      />

      <PreviewBlock
        variant="exit"
        eyebrow="Voorbeeldweergave"
        title="Zo ziet ExitScan eruit voor management."
        body="De output combineert frictiescore, vertrekduiding en prioritaire werkfactoren in een compacte managementstructuur."
      />

      <ProductComparisonBlock
        theme="exit"
        eyebrow="Verschil met RetentieScan"
        title="ExitScan kijkt terug. RetentieScan signaleert eerder."
        body="ExitScan helpt begrijpen waarom mensen gingen. RetentieScan helpt eerder zien waar behoud onder druk staat. Samen vormen ze een logisch portfolio."
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
      <FeatureSplit
        leftEyebrow="Waarom nu"
        leftTitle="ExitScan kijkt terug. RetentieScan kijkt eerder vooruit."
        leftBody="Waar ExitScan helpt begrijpen waarom mensen gingen, helpt RetentieScan om eerder te zien waar behoud onder druk staat. Zo kan HR eerder prioriteren op de werkfactoren die nog beïnvloedbaar zijn."
        leftPoints={[
          'Vroegtijdig zien waar behoud onder druk staat',
          'Managementinformatie over beïnvloedbare werkfactoren',
          'Dashboard en rapport in dezelfde professionele Verisight-vorm',
        ]}
        rightEyebrow="Wat je krijgt"
        rightTitle="Een vroegsignaal dat bruikbaar is voor management."
        rightBody="Geen individuele risicovoorspelling, maar een groepsweergave van retentiesignalen, bevlogenheid, vertrekintentie en de factoren die behoud waarschijnlijk het meest beïnvloeden."
        theme="dark"
      />

      <ThreeLensBlock
        eyebrow="Waar RetentieScan sterk in is"
        title="Drie redenen waarom RetentieScan meer doet dan een generieke pulse of MTO."
        cards={[
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
        ]}
      />

      <ProductUseMatrix
        eyebrow="Hoe je het leest"
        title="RetentieScan is sterk als de vraag eerder signaleren is."
        rows={[
          ['Hoofdvraag', 'Waar staat behoud nu onder druk in de actieve populatie?'],
          ['Leesrichting', 'Vroegsignalering op groeps- en segmentniveau'],
          ['Managementoutput', 'Retentiesignaal, bevlogenheid, vertrekintentie en topfactoren'],
          ['Niet bedoeld als', 'Persoonsgerichte voorspeller of performance-instrument'],
        ]}
      />

      <PreviewBlock
        variant="retention"
        eyebrow="Voorbeeldweergave"
        title="Zo ziet RetentieScan eruit voor management."
        body="De output combineert retentiesignaal, bevlogenheid, vertrekintentie en prioritaire werkfactoren in een compacte rapportstructuur."
      />

      <ProductComparisonBlock
        theme="retention"
        eyebrow="Combinatie met ExitScan"
        title="Samen vormen ze een logisch portfolio."
        body="ExitScan helpt begrijpen waarom mensen gingen. RetentieScan helpt eerder zien waar behoud onder druk staat. Samen geven ze een scherper beeld van zowel achteraf duiden als vooruit kijken."
      />
    </MarketingPageShell>
  )
}

function CombinatiePage() {
  return (
    <MarketingPageShell
      eyebrow="Combinatie"
      title="Kijk terug en vooruit in dezelfde managementtaal."
      description="De combinatie van ExitScan en RetentieScan is logisch voor organisaties die zowel willen leren van uitstroom als eerder willen signaleren waar behoud nu onder druk staat."
      theme="combination"
      highlightItems={['Portfolio-aanpak', 'Twee producten', 'Eén platform']}
      contextTitle="Een route voor organisaties waar uitstroom en behoud tegelijk op tafel liggen."
      contextBody="De combinatie is vooral sterk wanneer management zowel oorzaken achteraf wil begrijpen als eerder wil weten waar behoud in de actieve populatie begint te schuiven."
    >
      <FeatureSplit
        leftEyebrow="Wanneer kies je de combinatie?"
        leftTitle="Als uitstroom en behoud allebei op tafel liggen."
        leftBody="Voor organisaties die niet alleen willen begrijpen waarom mensen zijn gegaan, maar ook eerder willen weten waar behoud in de actieve populatie aandacht vraagt."
        leftPoints={[
          'ExitScan voor terugkijkende vertrekduiding',
          'RetentieScan voor vroegsignalering op behoud',
          'Een platform, een managementtaal en heldere productscheiding',
        ]}
        rightEyebrow="Portfolio-aanpak"
        rightTitle="Niet één meting, maar twee gerichte managementsporen."
        rightBody="De combinatie is sterk voor organisaties die willen schakelen tussen leren van vertrek en eerder bijsturen op behoud, zonder dat beide producten inhoudelijk door elkaar gaan lopen."
        theme="dark"
      />

      <ThreeLensBlock
        eyebrow="Hoe de combinatie werkt"
        title="Gebruik de combinatie als een gefaseerde portfolio-aanpak."
        cards={[
          {
            title: 'Stap 1: duid vertrek',
            text: 'Gebruik ExitScan om vertrekpatronen en terugkerende werkfactoren achteraf scherp te krijgen.',
          },
          {
            title: 'Stap 2: signaleer behoud',
            text: "Gebruik RetentieScan om eerder zichtbaar te maken waar dezelfde thema's nu nog doorwerken in actieve teams.",
          },
          {
            title: 'Stap 3: stuur in één lijn',
            text: 'Gebruik een gedeelde managementtaal voor prioritering, opvolging en herhaalmeting.',
          },
        ]}
      />

      <ProductUseMatrix
        eyebrow="Wanneer logisch"
        title="De combinatie is geen extra feature, maar een eigen koopreden."
        rows={[
          ['Hoofdvraag', 'Hoe verbinden we vertrekduiding en vroegsignalering in dezelfde lijn?'],
          ['Leesrichting', 'Achteraf begrijpen en vooruit kijken'],
          ['Managementoutput', 'Twee gerichte scans in een gedeeld portfolio'],
          ['Niet bedoeld als', 'Een algemene survey waar alles tegelijk in wordt gepropt'],
        ]}
      />

      <ProductComparisonBlock
        theme="combination"
        eyebrow="Volgende stap"
        title="Wil je bepalen of de combinatie logisch is?"
        body="In een kort gesprek kijken we of jullie vooral met een product moeten starten of direct baat hebben bij een portfolio-aanpak met beide scans."
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
      highlightItems={['Productroute gereserveerd', 'Portfolio-proof', 'Nog niet live']}
      contextTitle="Deze productroute staat klaar binnen dezelfde productstructuur."
      contextBody="Zo groeit het portfolio straks door zonder dat live producten onduidelijk worden of de navigatie opnieuw moet worden uitgevonden."
    >
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
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

function FeatureSplit({
  leftEyebrow,
  leftTitle,
  leftBody,
  leftPoints,
  rightEyebrow,
  rightTitle,
  rightBody,
  theme,
}: {
  leftEyebrow: string
  leftTitle: string
  leftBody: string
  leftPoints: string[]
  rightEyebrow: string
  rightTitle: string
  rightBody: string
  theme: 'dark'
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">{leftEyebrow}</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">{leftTitle}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">{leftBody}</p>
        <div className="mt-8 space-y-3">
          {leftPoints.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">+</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">{rightEyebrow}</p>
        <h2 className="font-display mt-4 text-4xl text-white">{rightTitle}</h2>
        <p className="mt-5 text-base leading-8 text-slate-300">{rightBody}</p>
        {theme === 'dark' ? (
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ThreeLensBlock({
  eyebrow,
  title,
  cards,
}: {
  eyebrow: string
  title: string
  cards: { title: string; text: string }[]
}) {
  return (
    <div className="mt-16">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {cards.map(({ title: cardTitle, text }) => (
          <div key={cardTitle} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7">
            <h3 className="text-xl font-semibold text-slate-950">{cardTitle}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductUseMatrix({
  eyebrow,
  title,
  rows,
}: {
  eyebrow: string
  title: string
  rows: [string, string][]
}) {
  return (
    <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
        {rows.map(([label, value], index) => (
          <div
            key={label}
            className={`grid gap-3 px-5 py-5 md:grid-cols-[0.75fr_1.25fr] ${index < rows.length - 1 ? 'border-b border-slate-200' : ''}`}
          >
            <div className="text-sm font-semibold text-slate-900">{label}</div>
            <div className="text-sm leading-7 text-slate-600">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewBlock({
  variant,
  eyebrow,
  title,
  body,
}: {
  variant: 'exit' | 'retention'
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <PreviewSlider variant={variant} />
      </div>
    </div>
  )
}

function ProductComparisonBlock({
  theme,
  eyebrow,
  title,
  body,
}: {
  theme: 'exit' | 'retention' | 'combination'
  eyebrow: string
  title: string
  body: string
}) {
  const shellClass =
    theme === 'retention'
      ? 'border-emerald-100 bg-emerald-50'
      : theme === 'combination'
        ? 'border-sky-100 bg-sky-50'
        : 'border-blue-100 bg-blue-50'

  return (
    <div className={`mt-16 rounded-[2rem] border p-8 md:p-10 ${shellClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{body}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/#kennismaking"
          className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Plan mijn gesprek
        </Link>
        <Link
          href="/producten"
          className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
        >
          Bekijk alle producten
        </Link>
      </div>
    </div>
  )
}
