import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { trustItems } from '@/components/marketing/site-content'
import { LIVE_MARKETING_PRODUCTS, UPCOMING_MARKETING_PRODUCTS } from '@/lib/marketing-products'

const comparisonRows = [
  [
    'ExitScan',
    'Vertrekduiding',
    'Waarom gingen mensen weg en welke werkfactoren keren terug?',
    'Voor terugkijkende analyse op uitstroom',
  ],
  [
    'RetentieScan',
    'Behoudsignalering',
    'Waar staat behoud nu onder druk in de actieve populatie?',
    'Voor vroegsignalering en prioritering',
  ],
  [
    'Combinatie',
    'Portfolio-aanpak',
    'Hoe verbinden we vertrekduiding en vroegsignalering in een managementlijn?',
    'Voor organisaties met beide vraagstukken',
  ],
] as const

export default function ProductenPage() {
  return (
    <MarketingPageShell
      eyebrow="Producten"
      title="Een productportfolio voor uitstroom, behoud en volgende luistervragen."
      description="Verisight is een platform met meerdere productvormen. Elk product heeft een eigen managementbelofte, maar gebruikt dezelfde professionele structuur van dashboard, rapportage en begeleiding."
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
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Belofte</th>
                <th className="px-5 py-4 font-semibold">Hoofdvraag</th>
                <th className="px-5 py-4 font-semibold">Wanneer logisch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {comparisonRows.map(([product, promise, question, fit]) => (
                <tr key={product}>
                  <td className="px-5 py-4 font-semibold text-slate-950">{product}</td>
                  <td className="px-5 py-4">{promise}</td>
                  <td className="px-5 py-4">{question}</td>
                  <td className="px-5 py-4">{fit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Binnenkort</p>
          <h2 className="font-display mt-4 text-4xl text-white">De site is nu ook voorbereid op volgende producten.</h2>
          <div className="mt-6 grid gap-3">
            {UPCOMING_MARKETING_PRODUCTS.map((product) => (
              <div key={product.slug} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{product.shortLabel}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{product.tagline}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Volgende stap</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Twijfel je welk product nu het best past?</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek bepalen we of jullie vooral terugkijken naar vertrek, eerder willen signaleren op behoud of beide productsporen slim naast elkaar willen inzetten.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#kennismaking"
            className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Plan mijn gesprek
          </Link>
          <Link
            href="/tarieven"
            className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
          >
            Bekijk tarieven
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  )
}
