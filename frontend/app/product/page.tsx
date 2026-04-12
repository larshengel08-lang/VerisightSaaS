import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { ExpandablePreview } from '@/components/marketing/expandable-preview'
import { comparisonCards, outcomeCards } from '@/components/marketing/site-content'

export default function ProductPage() {
  return (
    <MarketingPageShell
      eyebrow="Product"
      title="Een exitscan die meer oplevert dan losse gesprekken of een generieke surveytool."
      description="Verisight bundelt vertrekinput tot één vergelijkbaar organisatiebeeld, met dashboard, rapport en prioriteiten voor HR, MT en directie."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {comparisonCards.map(({ title, description, outcome }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
              {outcome}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Wat je krijgt</p>
          <h2 className="font-display mt-4 text-4xl text-slate-950">Een serieus managementinstrument in plaats van losse input.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {outcomeCards.map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Voorbeeldrapport</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Zo ziet de verdiepte segmentanalyse eruit</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            De output blijft in gewone taal, maar laat wel zien waar verschillen tussen afdelingen, functieniveaus of diensttijd verdere validatie verdienen.
          </p>
          <ExpandablePreview
            src="/segment-deep-dive-preview.png"
            alt="Voorbeeld van segmentanalyse in het Verisight-rapport"
            className="mt-5"
            badge="Voorbeeld"
          />
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-blue-100 bg-blue-50 p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Volgende stap</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">Wil je zien of dit voor jullie organisatie past?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek kijken we of ExitScan nu zinvol is, welk scan-type past en welke output voor HR en management het meest bruikbaar zal zijn.
        </p>
        <Link
          href="/#kennismaking"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Plan mijn gesprek
        </Link>
      </div>
    </MarketingPageShell>
  )
}
