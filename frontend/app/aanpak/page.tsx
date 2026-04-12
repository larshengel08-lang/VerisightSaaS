import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { included } from '@/components/marketing/site-content'

const steps = [
  {
    title: '1. Intake en inrichting',
    body: 'We bepalen samen of jullie starten met een Baseline of Live exitscan en welke respondentdata nodig is.',
  },
  {
    title: '2. Uitnodigen en verzamelen',
    body: 'Verisight richt de flow in, verstuurt uitnodigingen en bewaakt de dataverzameling.',
  },
  {
    title: '3. Duiden en prioriteren',
    body: 'Je krijgt een dashboard en rapport waarmee HR, MT en directie sneller zien waar vervolgactie het meeste oplevert.',
  },
] as const

export default function AanpakPage() {
  return (
    <MarketingPageShell
      eyebrow="Aanpak"
      title="Een duidelijke aanpak zonder extra toolbeheer voor HR."
      description="Verisight is geen losse surveytool en ook geen zwaar consultancytraject. Je koopt een begeleide exitscan met inrichting, uitvoering, rapportage en duidelijke opvolging."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {steps.map(({ title, body }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">{title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">ExitScan Baseline</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">De standaard eerste instap</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Retrospectief traject op ex-medewerkers van bijvoorbeeld de afgelopen 12 maanden. Ideaal als je eerst patroonbeeld, nulmeting en prioriteiten wilt opbouwen.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            <li>Eenmalige aanlevering van respondentbestand</li>
            <li>Bij voorkeur inclusief afdeling, functieniveau en exitmaand</li>
            <li>Geschikt als eerste managementbeeld en startpunt voor actie</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">ExitScan Live</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Voor organisaties die doorlopend willen volgen</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Doorlopende exitscan voor nieuwe vertrekkers. Past vooral wanneer je uitstroom structureel wilt volgen en periodiek wilt verversen.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            <li>Vast proces met HR voor nieuwe vertrekkers</li>
            <li>Actuelere signalen, maar trends pas zinvol bij voldoende volume</li>
            <li>Nu vooral geschikt als vervolg of op aanvraag</li>
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Wat standaard inbegrepen is</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {included.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-blue-100 bg-blue-50 p-8">
        <h2 className="text-2xl font-semibold text-slate-950">Wil je weten welke vorm nu het best past?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek bepalen we of jullie beter starten met een eenmalige Baseline of dat een Live exitscan al logisch is.
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
