import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { ExpandablePreview } from '@/components/marketing/expandable-preview'

export default function TarievenPage() {
  return (
    <MarketingPageShell
      eyebrow="Tarieven"
      title="Een duidelijke launchprijs, met één optionele verdieping."
      description="Je koopt één helder traject met dashboard, rapportage en begeleiding. Geen licentiegedoe, geen losse consultancy-uren achteraf."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl bg-[#0d1b2e] px-8 py-10 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300">exitscan</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-blue-300">Launchprijs</p>
          <p className="mt-2 text-[3.25rem] font-bold leading-none">€2.950</p>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Vaste trajectprijs voor inrichting, uitvoering, analyse en rapportage.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-white/85">
            <li>Geschikt als eerste instap voor organisaties vanaf circa 200 medewerkers</li>
            <li>Meestal gestart als ExitScan Baseline</li>
            <li>Inclusief dashboard, managementrapport en begeleiding</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Optionele add-on</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Segment deep dive</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Extra segmentanalyse in het rapport, met scherpere uitsplitsing naar afdeling, functieniveau en diensttijd.
          </p>
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
            <p className="text-sm font-semibold text-blue-950">Meerprijs: €950</p>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              Werkt het best als afdeling, functieniveau en bij retrospectieve batches ook exitmaand netjes zijn aangeleverd.
            </p>
          </div>
          <ExpandablePreview
            src="/segment-deep-dive-preview.png"
            alt="Voorbeeld van de segment deep dive add-on"
            className="mt-5"
            badge="Voorbeeld"
          />
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-blue-100 bg-blue-50 p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Waarom de businesscase vaak snel klopt</p>
        <p className="mt-3 max-w-4xl text-base leading-8 text-blue-950">
          Stel: 300 medewerkers, 10% verloop en circa 30 exits per jaar. Bij gemiddelde vervangingskosten van €15.000 per FTE kan één beter gekozen verbeterprioriteit al snel veel meer opleveren dan het traject kost.
        </p>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-blue-900">
          Verisight verkoopt geen garantie op minder verloop, maar wel een veel sterkere basis om gericht te beslissen waar je als eerste ingrijpt.
        </p>
      </div>

      <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Wil je weten of deze prijsstructuur voor jullie past?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          In een kort gesprek kijken we welke scanvorm logisch is, of de add-on zinvol is en wat je concreet nodig hebt om te starten.
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
