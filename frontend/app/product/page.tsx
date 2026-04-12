import Link from 'next/link'
import { ExpandablePreview } from '@/components/marketing/expandable-preview'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SectionHeading } from '@/components/marketing/section-heading'
import { comparisonCards, outcomeCards, trustItems } from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'

export default function ProductPage() {
  return (
    <MarketingPageShell
      eyebrow="Product"
      title="Een exitscan die meer oplevert dan losse gesprekken of een generieke surveytool."
      description="Verisight bundelt vertrekinput tot één vergelijkbaar organisatiebeeld, met dashboard, rapport en prioriteiten voor HR, MT en directie."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {comparisonCards.map(({ title, description, outcome }) => (
          <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-950">
              {outcome}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
        <SectionHeading
          eyebrow="Wat je krijgt"
          title="Een serieus managementinstrument in plaats van losse exitinput."
          description="Het product is ontworpen om sneller richting te geven aan gesprek en vervolgactie, niet om HR achter te laten met ruwe survey-output."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {outcomeCards.map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-semibold text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Waarom dit werkt</p>
          <h2 className="font-display mt-4 text-4xl text-white">Trust zonder theater.</h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Verisight hoeft niet te leunen op vage AI-claims of losse interviewnotities. De waarde zit in een duidelijke structuur, methodische onderbouwing en output die direct bruikbaar is voor besluitvorming.
          </p>
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Voorbeeldrapport</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">Zo ziet de verdiepte segmentanalyse eruit.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            De output blijft in gewone taal, maar laat wel zien waar verschillen tussen afdelingen, functieniveaus of diensttijd verdere validatie verdienen.
          </p>
          <ExpandablePreview
            src="/segment-deep-dive-preview.png"
            alt="Voorbeeld van segmentanalyse in het Verisight-rapport"
            className="mt-6"
            badge="Voorbeeld"
          />
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Volgende stap</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Wil je zien of dit voor jullie organisatie past?</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek kijken we of ExitScan nu zinvol is, welk scan-type past en welke output voor HR en management het meest bruikbaar zal zijn.
        </p>
        <Link
          href="/#kennismaking"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Plan mijn gesprek
        </Link>
      </div>
    </MarketingPageShell>
  )
}
