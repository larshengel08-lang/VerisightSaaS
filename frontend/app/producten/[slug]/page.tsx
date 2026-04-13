import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { trustItems } from '@/components/marketing/site-content'
import { ALL_MARKETING_PRODUCTS, getMarketingProductBySlug } from '@/lib/marketing-products'

type Props = { params: Promise<{ slug: string }> }

const exitCards = [
  {
    title: 'Terugkijkend patroonbeeld op vertrek',
    text: 'ExitScan helpt organisaties begrijpen waarom mensen gingen en welke werkfactoren daar het vaakst in terugkomen.',
  },
  {
    title: 'Meer dan losse exitgesprekken',
    text: 'De scan vertaalt meerdere reacties naar een vergelijkbaar managementbeeld, zodat HR en MT sneller prioriteren.',
  },
  {
    title: 'Gericht op beinvloedbare werkfactoren',
    text: 'Leiderschap, cultuur, groei, werkbelasting en rolhelderheid worden zichtbaar als terugkerende vertrekduiding.',
  },
] as const

const retentionCards = [
  {
    title: 'Eerder signaleren, niet pas achteraf verklaren',
    text: 'RetentieScan maakt zichtbaar waar behoud al begint te schuiven, voordat verloop zichtbaar wordt in vacatures, uitval of exitgesprekken.',
  },
  {
    title: 'Focus op factoren die de organisatie kan beinvloeden',
    text: 'De scan kijkt niet alleen naar sentiment, maar naar leiderschap, cultuur, groei, werkbelasting, rolhelderheid en SDT-werkbeleving.',
  },
  {
    title: 'Gebouwd om managementgesprekken scherper te maken',
    text: 'De uitkomst is geen losse survey-export, maar een gedeelde taal voor HR, MT en directie over waar retentie nu aandacht vraagt.',
  },
] as const

export async function generateStaticParams() {
  return ALL_MARKETING_PRODUCTS.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)
  if (!product) return {}

  return {
    title: `${product.label} - Verisight`,
    description: product.description,
  }
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
    >
      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Wanneer past ExitScan?</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Als je wilt leren van vertrek dat al heeft plaatsgevonden.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            ExitScan is logisch wanneer exitgesprekken te anekdotisch blijven, patronen onzichtbaar zijn en management behoefte heeft aan een beter overzicht van terugkerende werkfactoren.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Vertrekredenen en werkfactoren in een managementbeeld',
              'Dashboard en rapport in dezelfde professionele structuur',
              'Geschikt als nulmeting of eerste patroonanalyse',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">+</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Wat je krijgt</p>
          <h2 className="font-display mt-4 text-4xl text-white">Een serieus managementinstrument voor uitstroomduiding.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Geen losse verzameling exitinput, maar een compacte rapportvorm waarmee HR, MT en directie sneller zien welke thema&apos;s terugkeren en waar vervolgactie logisch is.
          </p>
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {exitCards.map(({ title, text }) => (
          <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldweergave</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Zo ziet ExitScan eruit voor management.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          De output combineert frictiescore, vertrekduiding en prioritaire werkfactoren in een compacte managementstructuur.
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <PreviewSlider variant="exit" />
        </div>
      </div>

      <ProductComparisonBlock
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
      description="RetentieScan helpt organisaties om retentiesignalen en beinvloedbare werkfactoren eerder zichtbaar te maken, met dashboard en rapport in dezelfde professionele Verisight-structuur."
    >
      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Waarom nu</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">ExitScan kijkt terug. RetentieScan kijkt eerder vooruit.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Waar ExitScan helpt begrijpen waarom mensen gingen, helpt RetentieScan om eerder te zien waar behoud onder druk staat. Zo kan HR eerder prioriteren op de werkfactoren die nog beinvloedbaar zijn.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Vroegtijdig zien waar behoud onder druk staat',
              'Managementinformatie over beinvloedbare werkfactoren',
              'Dashboard en rapport in dezelfde professionele Verisight-vorm',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">+</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Wat je krijgt</p>
          <h2 className="font-display mt-4 text-4xl text-white">Een vroegsignaal dat bruikbaar is voor management.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Geen individuele risicovoorspelling, maar een groepsweergave van retentiesignalen, bevlogenheid, vertrekintentie en de factoren die behoud waarschijnlijk het meest beinvloeden.
          </p>
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {retentionCards.map(({ title, text }) => (
          <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldweergave</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Zo ziet RetentieScan eruit voor management.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          De output combineert retentiesignaal, bevlogenheid, vertrekintentie en prioritaire werkfactoren in een compacte rapportstructuur.
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <PreviewSlider variant="retention" />
        </div>
      </div>

      <ProductComparisonBlock
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
    >
      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Wanneer kies je de combinatie?</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Als uitstroom en behoud allebei op tafel liggen.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Voor organisaties die niet alleen willen begrijpen waarom mensen zijn gegaan, maar ook eerder willen weten waar behoud in de actieve populatie aandacht vraagt.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'ExitScan voor terugkijkende vertrekduiding',
              'RetentieScan voor vroegsignalering op behoud',
              'Een platform, een managementtaal en heldere productscheiding',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">+</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Portfolio-aanpak</p>
          <h2 className="font-display mt-4 text-4xl text-white">Niet een meting, maar twee gerichte managementsporen.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            De combinatie is vooral sterk voor organisaties die willen schakelen tussen leren van vertrek en eerder bijsturen op behoud, zonder dat beide producten inhoudelijk door elkaar gaan lopen.
          </p>
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-5 lg:grid-cols-3">
        {[
          ['Stap 1', 'Gebruik ExitScan om vertrekpatronen en terugkerende werkfactoren achteraf scherp te krijgen.'],
          ['Stap 2', "Gebruik RetentieScan om eerder zichtbaar te maken waar dezelfde thema's nu nog doorwerken in actieve teams."],
          ['Stap 3', 'Gebruik een managementlijn voor prioritering, opvolging en herhaalmeting.'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Volgende stap</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Wil je bepalen of de combinatie logisch is?</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek kijken we of jullie vooral met een product moeten starten of direct baat hebben bij een portfolio-aanpak met beide scans.
        </p>
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
    </MarketingPageShell>
  )
}

function UpcomingProductPage({ slug }: { slug: string }) {
  const product = getMarketingProductBySlug(slug)
  if (!product) notFound()

  return (
    <MarketingPageShell eyebrow="Binnenkort" title={product.label} description={product.description}>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
          Binnenkort beschikbaar
        </span>
        <h2 className="mt-6 text-3xl font-semibold text-slate-950">{product.tagline}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Deze productpagina is alvast gereserveerd binnen de nieuwe productstructuur. Zo groeit het portfolio straks door zonder dat de live producten onduidelijk worden.
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

function ProductComparisonBlock({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="mt-16 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
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
