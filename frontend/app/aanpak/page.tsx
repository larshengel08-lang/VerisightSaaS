import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SectionHeading } from '@/components/marketing/section-heading'
import { included, trustItems } from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Bekijk hoe Verisight ExitScan, RetentieScan en combinatie-trajecten opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
  openGraph: {
    title: 'Aanpak | Verisight',
    description:
      'Bekijk hoe Verisight ExitScan, RetentieScan en combinatie-trajecten opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
    url: 'https://www.verisight.nl/aanpak',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Verisight aanpak voor ExitScan en RetentieScan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aanpak | Verisight',
    description:
      'Bekijk hoe Verisight ExitScan, RetentieScan en combinatie-trajecten opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
    images: ['/og-image.png'],
  },
}

const steps = [
  {
    title: '1. Intake en scan-keuze',
    body: 'We bepalen samen of de vraag vooral om ExitScan, RetentieScan of een combinatie vraagt, en welke respondentdata nodig is.',
  },
  {
    title: '2. Uitnodigen en uitvoeren',
    body: 'Verisight richt de flow in, verstuurt uitnodigingen en bewaakt de dataverzameling zonder extra toolbeheer voor HR.',
  },
  {
    title: '3. Duiden en opvolgen',
    body: 'Je krijgt een dashboard en rapport waarmee HR, MT en directie sneller zien waar gesprek, validatie of vervolgactie logisch is.',
  },
] as const

const routes = [
  {
    eyebrow: 'ExitScan Baseline',
    title: 'De standaard eerste instap voor vertrekduiding',
    body: 'Retrospectief traject op ex-medewerkers van bijvoorbeeld de afgelopen 12 maanden. Geschikt als eerste patroonbeeld en startpunt voor actie.',
    bullets: [
      'Eenmalige aanlevering van respondentbestand',
      'Bij voorkeur inclusief afdeling, functieniveau en exitmaand',
      'Sterk als nulmeting en managementbeeld op uitstroom',
    ],
    shellClass: 'border-blue-200 bg-blue-50',
    eyebrowClass: 'text-blue-700',
    bodyClass: 'text-slate-700',
  },
  {
    eyebrow: 'ExitScan Live',
    title: 'Voor organisaties die uitstroom doorlopend willen volgen',
    body: 'Doorlopende ExitScan voor nieuwe vertrekkers. Past vooral wanneer je uitstroom structureel wilt monitoren en periodiek wilt verversen.',
    bullets: [
      'Vast proces met HR voor nieuwe vertrekkers',
      'Actuelere signalen, trends pas zinvol bij voldoende volume',
      'Vooral geschikt als vervolg of op aanvraag',
    ],
    shellClass: 'border-slate-200 bg-slate-50',
    eyebrowClass: 'text-slate-500',
    bodyClass: 'text-slate-700',
  },
  {
    eyebrow: 'RetentieScan Baseline',
    title: 'De eerste meetvorm voor actieve medewerkers',
    body: 'Een eenmalige RetentieScan om te zien waar behoud onder druk staat, welke werkfactoren prioriteit vragen en hoe bevlogenheid en vertrekintentie zich verhouden.',
    bullets: [
      'Actieve medewerkers in plaats van ex-medewerkers',
      'Groepsinzichten, geen individuele retention-scores',
      'Sterk als startpunt voor gerichte opvolging en herhaalmeting',
    ],
    shellClass: 'border-emerald-200 bg-emerald-50',
    eyebrowClass: 'text-emerald-700',
    bodyClass: 'text-slate-700',
  },
  {
    eyebrow: 'RetentieScan ritme',
    title: 'Voor organisaties die periodiek willen volgen',
    body: 'Herhaalmeting per kwartaal of halfjaar om te zien of retentiesignalen, bevlogenheid en prioritaire werkfactoren verbeteren.',
    bullets: [
      'Compacter vervolg op een baseline',
      'Geschikt om effect van acties zichtbaar te maken',
      'Blijft groeps- en segmentgericht, niet persoonsgericht',
    ],
    shellClass: 'border-amber-200 bg-amber-50',
    eyebrowClass: 'text-amber-700',
    bodyClass: 'text-slate-700',
  },
] as const

export default function AanpakPage() {
  return (
    <MarketingPageShell
      eyebrow="Aanpak"
      title="Een duidelijke aanpak zonder dat ExitScan en RetentieScan door elkaar gaan lopen."
      description="Verisight is geen losse surveytool en ook geen zwaar consultancytraject. Je koopt een begeleide productvorm met duidelijke scan-keuze, uitvoering, rapportage en opvolging."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {steps.map(({ title, body }) => (
          <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{title}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        {routes.map((route) => (
          <div
            key={route.title}
            className={`rounded-[2rem] border p-8 ${route.shellClass}`}
          >
            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${route.eyebrowClass}`}>
              {route.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">{route.title}</h2>
            <p className={`mt-4 text-sm leading-7 ${route.bodyClass}`}>{route.body}</p>
            <ul className={`mt-6 space-y-3 text-sm leading-7 ${route.bodyClass}`}>
              {route.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
        <SectionHeading
          eyebrow="Trustlaag"
          title="Duidelijk proces, Europese hosting en output die intern bruikbaar blijft."
          description="Voor organisaties vanaf circa 200 medewerkers is niet alleen de analyse belangrijk, maar ook dat de productvorm netjes, voorspelbaar en privacybewust blijft."
          light
        />
        <div className="mt-8">
          <TrustStrip items={trustItems} tone="dark" />
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
        <SectionHeading
          eyebrow="Wat standaard inbegrepen is"
          title="Een traject van scan-keuze tot rapportage."
          description="Je koopt geen losse tool en geen open eind aan consultancy-uren, maar een duidelijke productvorm met vaste output."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {included.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                +
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
        <h2 className="text-3xl font-semibold text-slate-950">Wil je weten welke vorm nu het best past?</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek bepalen we of jullie beter starten met ExitScan, RetentieScan of een combinatie, en of een herhaalritme of segment deep dive logisch is.
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
