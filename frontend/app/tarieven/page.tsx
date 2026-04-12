import Link from 'next/link'
import { ExpandablePreview } from '@/components/marketing/expandable-preview'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SectionHeading } from '@/components/marketing/section-heading'
import { trustItems } from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'

const included = [
  'Inrichting van de exitscan en campagneflow',
  'Uitnodigen en bewaken van de respons',
  'Dashboard met managementoverzicht',
  'Volledig rapport in gewone taal',
  'Basissegmentatie en focuspunten voor vervolg',
] as const

export default function TarievenPage() {
  return (
    <MarketingPageShell
      eyebrow="Tarieven"
      title="Een duidelijke launchprijs, met een optionele verdieping als die echt meerwaarde heeft."
      description="Verisight verkoopt een helder traject met dashboard, rapportage en begeleiding. Geen licentieconstructie met losse modules en geen open eind aan consultancy-uren."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-slate-900 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">ExitScan Baseline</p>
          <h2 className="font-display mt-4 text-5xl text-white md:text-6xl">€ 2.950</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
            Dit is de standaard eerste instap voor organisaties die snel een betrouwbaar organisatiebeeld, duidelijke prioriteiten en een professioneel managementrapport willen.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-5">
            <p className="text-sm font-semibold text-white">Beschikbaar als Baseline of Live</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              De launchprijs sluit in de praktijk meestal aan op een Baseline-traject. Een Live exitscan is mogelijk als vervolg of op aanvraag, afhankelijk van volume en werkwijze.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#kennismaking"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Plan mijn gesprek
            </Link>
            <Link
              href="/aanpak"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Bekijk aanpak
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Optionele add-on</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Segment deep dive</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Extra segmentanalyse in het rapport, met scherpere uitsplitsing naar afdeling, functieniveau en diensttijd. Zinnig als je niet alleen het totaalbeeld wilt zien, maar ook waar verschillen extra validatie verdienen.
            </p>
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
              <p className="text-sm font-semibold text-blue-950">Meerprijs: € 950</p>
              <p className="mt-2 text-sm leading-7 text-blue-900">
                Werkt het best wanneer afdeling, functieniveau en bij retrospectieve batches ook exitmaand netjes zijn aangeleverd.
              </p>
            </div>
            <ExpandablePreview
              src="/segment-deep-dive-preview.png"
              alt="Voorbeeld van de segment deep dive add-on"
              className="mt-6"
              badge="Voorbeeld"
            />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Commerciële fit</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">Deze prijs werkt vooral als je nu richting wilt aanbrengen.</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Verisight is geen tool die vooral meer data produceert. Het traject is bedoeld om sneller te zien welke terugkerende patronen aandacht vragen en waar verdere actie of validatie het meest oplevert.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <SectionHeading
          eyebrow="Waarom dit vaak snel logisch wordt"
          title="De businesscase hoeft niet spectaculair te zijn om commercieel al te kloppen."
          description="Bij organisaties met enkele honderden medewerkers en structureel verloop kan een beter gekozen verbeterprioriteit al snel meer opleveren dan het traject kost."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-sm font-semibold text-blue-950">Voorbeeld</p>
            <p className="mt-3 text-sm leading-7 text-blue-950">
              Denk aan 300 medewerkers, 10 procent verloop en circa 30 exits per jaar. Als vervanging, inwerken en productiviteitsverlies per exit al snel in de duizenden euro per persoon lopen, hoeft een betere prioriteit maar beperkt effect te hebben om financieel zinvol te zijn.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-950">Belangrijke nuance</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Verisight verkoopt geen garantie op lager verloop. De waarde zit in sneller zicht op patronen, betere prioritering en een sterkere basis voor managementbeslissingen.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] md:p-10">
        <SectionHeading
          eyebrow="Trustlaag"
          title="Een duidelijke prijs, een begeleid proces en output die intern overeind blijft."
          description="Voor een eerste traject is vertrouwen vaak belangrijker dan maximale productbreedte. Daarom is Verisight bewust compact, begeleid en methodisch helder opgezet."
          light
        />
        <div className="mt-8">
          <TrustStrip items={trustItems} tone="dark" />
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Volgende stap</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Wil je weten of deze vorm nu past bij jullie organisatie?</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek kijken we of een Baseline logisch is, wanneer een Live exitscan zinnig wordt en of de segment deep dive voor jullie echt extra waarde toevoegt.
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
