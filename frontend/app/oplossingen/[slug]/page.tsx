import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Wordmark } from '@/components/marketing/wordmark'
import { PublicFooter } from '@/components/marketing/public-footer'

type Props = { params: Promise<{ slug: string }> }

const products: Record<
  string,
  { title: string; description: string; tagline: string }
> = {
  retentiescan: {
    title: 'Retentiescan',
    tagline: 'Vertrekrisico per medewerker inzichtelijk',
    description:
      'De Retentiescan helpt HR-teams om vroegtijdig te signaleren welke medewerkers risico lopen te vertrekken, zodat je gericht kunt interveniëren voordat het te laat is.',
  },
  mto: {
    title: 'Medewerkerstevredenheidsonderzoek',
    tagline: 'Brede tevredenheidsmeting voor je team',
    description:
      'Een gestructureerd medewerkerstevredenheidsonderzoek dat verder gaat dan een eenmalige meting — met benchmarks, factoranalyse en een helder rapport voor HR en management.',
  },
  pulse: {
    title: 'Pulse',
    tagline: 'Korte, frequente peilingen tussen teams',
    description:
      'Pulse maakt het makkelijk om in korte vragen de vinger aan de pols te houden. Wekelijks, maandelijks of op maat — zonder de last van een groot onderzoek.',
  },
  teamscan: {
    title: 'Teamscan',
    tagline: 'Samenwerking en dynamiek per team meten',
    description:
      'De Teamscan brengt samenwerking, rolverdeling en teamdynamiek gestructureerd in beeld, zodat teamleiders en HR samen kunnen werken aan een gezonder teamklimaat.',
  },
  'leadership-scan': {
    title: 'Leadership scan',
    tagline: 'Leiderschapsstijl en -effectiviteit in beeld',
    description:
      'De Leadership scan combineert zelfreflectie met 360°-feedback om leiderschapsgedrag te meten op de factoren die er het meest toe doen voor teamresultaten.',
  },
  'customer-feedback': {
    title: 'Customer feedback',
    tagline: 'Klantfeedback structureel verzamelen',
    description:
      'Meer dan een NPS-score: Customer feedback geeft je een gestructureerd beeld van wat klanten drijft, wat hen tegenhoudt en waar de grootste verbeterkansen liggen.',
  },
}

export async function generateStaticParams() {
  return Object.keys(products).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = products[slug]
  if (!product) return {}
  return {
    title: `${product.title} — Verisight`,
    description: product.description,
  }
}

export default async function OplossingSoonPage({ params }: Props) {
  const { slug } = await params
  const product = products[slug]
  if (!product) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Wordmark size="md" href="/" />
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            ← Terug naar ExitScan
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        {/* Badge */}
        <span className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
          Binnenkort live
        </span>

        <h1 className="font-display text-balance text-4xl font-bold text-slate-950 md:text-5xl">
          {product.title}
        </h1>
        <p className="mt-3 text-lg font-medium text-blue-600">{product.tagline}</p>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600">
          {product.description}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="mailto:hallo@verisight.nl?subject=Interesse in {product.title}"
            className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Neem contact op
          </a>
          <Link
            href="/"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Bekijk ExitScan
          </Link>
        </div>

        {/* Subtle note */}
        <p className="mt-8 text-xs text-slate-400">
          Wil je als eerste toegang? Stuur ons een mail —{' '}
          <a
            href="mailto:hallo@verisight.nl"
            className="underline underline-offset-2 hover:text-slate-600"
          >
            hallo@verisight.nl
          </a>
        </p>
      </main>

      <PublicFooter />
    </div>
  )
}
