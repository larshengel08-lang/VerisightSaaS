import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SectionHeading } from '@/components/marketing/section-heading'
import { trustItems } from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Bekijk de prijsankers voor ExitScan, RetentieScan en de combinatie, inclusief baseline, deep dive en periodieke opvolging.',
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Bekijk de prijsankers voor ExitScan, RetentieScan en de combinatie, inclusief baseline, deep dive en periodieke opvolging.',
    url: 'https://www.verisight.nl/tarieven',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Verisight tarieven voor ExitScan en RetentieScan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven | Verisight',
    description:
      'Bekijk de prijsankers voor ExitScan, RetentieScan en de combinatie, inclusief baseline, deep dive en periodieke opvolging.',
    images: ['/og-image.png'],
  },
}

const pricingCards = [
  {
    eyebrow: 'ExitScan Baseline',
    price: 'EUR 2.950',
    description:
      'De standaard eerste instap voor organisaties die snel een betrouwbaar organisatiebeeld, duidelijke prioriteiten en een professioneel managementrapport over uitstroom willen.',
    bullets: [
      'Inrichting van de exit-campaign en respondentflow',
      'Dashboard en rapport voor vertrekduiding',
      'Geschikt als eerste nulmeting of start van structurele opvolging',
    ],
  },
  {
    eyebrow: 'RetentieScan Baseline',
    price: 'EUR 3.450',
    description:
      'De standaard eerste instap voor organisaties die eerder willen zien waar behoud onder druk staat, met extra nadruk op privacy, groepsduiding en managementinformatie.',
    bullets: [
      'Retentiesignaal, bevlogenheid en vertrekintentie in een rapport',
      'Geen individuele retention-scores naar management',
      'Geschikt als basis voor vervolgmeting of gerichte opvolging',
    ],
  },
  {
    eyebrow: 'Retention Loop',
    price: 'vanaf EUR 4.950',
    description:
      'Voor organisaties die van een eerste RetentieScan willen doorgroeien naar een ritme met herhaalmeting, trendduiding en beter onderbouwde opvolging op behoud.',
    bullets: [
      'Baseline plus herhaalmeting per kwartaal of halfjaar',
      'Trendbeeld op retentiesignaal, bevlogenheid en stay-intent',
      'Geschikt voor organisaties die retentie actief willen sturen',
    ],
  },
] as const

const retentionPackages = [
  {
    title: 'Baseline',
    fit: 'Voor een eerste groepsbeeld',
    body: 'Een compacte retentie-baseline voor organisaties die snel willen zien waar behoud aandacht vraagt.',
    bullets: [
      'Eenmalige scan',
      'Dashboard en managementrapport',
      'Topfactoren en focusvragen',
    ],
  },
  {
    title: 'Baseline + Deep Dive',
    fit: 'Voor scherpere segmentprioritering',
    body: 'Voor organisaties die niet alleen het totaalbeeld willen zien, maar ook welke afdelingen of functieniveaus het meest afwijken.',
    bullets: [
      'Alles uit Baseline',
      'Segmentanalyse op afdeling en functieniveau',
      'Extra duiding op afwijkende groepen',
    ],
  },
  {
    title: 'Retention Loop',
    fit: 'Voor structurele opvolging',
    body: 'Voor organisaties die retentie niet als momentopname maar als terugkerend stuurthema willen benaderen.',
    bullets: [
      'Herhaalmeting en trendduiding',
      'Betere opvolging van acties',
      'Basis voor latere validatie en vergelijking',
    ],
  },
] as const

const choiceGuide = [
  ['ExitScan', 'Je wilt begrijpen waarom mensen zijn gegaan en wat vertrek achteraf verklaart.'],
  ['RetentieScan', 'Je wilt eerder zien waar behoud in de actieve populatie onder druk staat.'],
  ['Combinatie', 'Je wilt zowel leren van vertrek als eerder kunnen bijsturen op behoud.'],
] as const

const addOns = [
  [
    'Segment deep dive',
    'EUR 950',
    'Extra segmentanalyse voor ExitScan of RetentieScan, met scherpere uitsplitsing naar afdeling en functieniveau wanneer de metadata daar geschikt voor is.',
  ],
  [
    'Retentie vervolgmeting',
    'vanaf EUR 1.250',
    'Compactere herhaalmeting na een RetentieScan Baseline, bijvoorbeeld per kwartaal of halfjaar, om voortgang te volgen zonder de baseline opnieuw op te tuigen.',
  ],
  [
    'Combinatiepakket',
    'op aanvraag',
    'Voor organisaties die ExitScan en RetentieScan bewust naast elkaar willen inzetten. We prijzen dit niet als korting op inhoud, maar als logische pakketvorming in een gedeeld platform.',
  ],
] as const

const faqs = [
  [
    'Waarom is RetentieScan niet goedkoper dan ExitScan?',
    'Omdat RetentieScan geen lichtere algemene survey is. Het product vraagt juist scherpere privacykaders, actieve-medewerkersduiding en een eigen managementverhaal.',
  ],
  [
    'Is RetentieScan een MTO-vervanger?',
    'Nee. Het product is smaller en scherper: het richt zich op behoudssignalen, vertrekintentie en beïnvloedbare werkfactoren.',
  ],
  [
    'Wanneer kies je voor een combinatiepakket?',
    'Als je zowel achteraf wilt begrijpen waarom mensen gingen als eerder wilt zien waar behoud nu onder druk staat.',
  ],
  [
    'Wat ziet management wel en niet?',
    'Management ziet groeps- en segmentinzichten. Bij RetentieScan tonen we geen individuele retention-scores of vertrekintentie op persoonsniveau.',
  ],
  [
    'Hoe vaak herhaal je RetentieScan?',
    'Voor v1 is een baseline het logische startpunt. Daarna is een ritme per kwartaal of halfjaar het meest logisch als je effect van acties wilt volgen.',
  ],
  [
    'Beloof je hiermee lager verloop?',
    'Nee. Verisight verkoopt geen garantie op lager verloop, maar scherpere duiding, betere prioritering en een sterkere basis voor managementbeslissingen.',
  ],
] as const

export default function TarievenPage() {
  return (
    <MarketingPageShell
      eyebrow="Tarieven"
      title="Heldere prijsankers per product, zonder dat ExitScan en RetentieScan elkaar kannibaliseren."
      description="Verisight verkoopt duidelijke productvormen met dashboard, rapportage en begeleiding. Geen licentieconstructie met losse modules en geen open eind aan consultancy-uren."
    >
      <div className="grid items-start gap-6 xl:grid-cols-3">
        {pricingCards.map((card) => (
          <div
            key={card.eyebrow}
            className="rounded-[2rem] border border-slate-900 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)] md:p-10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">{card.eyebrow}</p>
            <h2 className="font-display mt-4 text-5xl text-white md:text-6xl">{card.price}</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{card.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-1">
              {card.bullets.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <SectionHeading
          eyebrow="RetentieScan pakketten"
          title="Drie logische productvormen voor behoudssignalering."
          description="Zo blijft RetentieScan een eigen product met een eigen opbouw, in plaats van een afgeleide feature van ExitScan."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {retentionPackages.map((pkg) => (
            <div key={pkg.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-950">{pkg.title}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{pkg.fit}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{pkg.body}</p>
              <div className="mt-5 grid gap-2">
                {pkg.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-xl border border-white bg-white px-3 py-3 text-sm leading-6 text-slate-700">
                    {bullet}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <SectionHeading
          eyebrow="Add-ons en vervolg"
          title="Breid uit waar het inhoudelijk klopt."
          description="Zo blijft RetentieScan geen goedkope algemene variant van ExitScan, maar een eigen product met een eigen prijslogica."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {addOns.map(([title, price, body]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-sm font-bold text-blue-700">{price}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
        <SectionHeading
          eyebrow="Keuzehulp"
          title="Welke productvorm past bij jouw vraag?"
          description="Zo houd je ExitScan en RetentieScan inhoudelijk zuiver en commercieel goed uitlegbaar."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {choiceGuide.map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
        <SectionHeading
          eyebrow="Sales FAQ"
          title="Veelgestelde commerciële vragen"
          description="Deze antwoorden helpen de productkeuze en prijsuitleg zuiver te houden."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">{question}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] md:p-10">
        <SectionHeading
          eyebrow="Trustlaag"
          title="Een duidelijke prijs, een begeleid proces en output die intern overeind blijft."
          description="Voor een eerste traject is vertrouwen vaak belangrijker dan maximale productbreedte. Daarom blijft Verisight bewust compact, begeleid en methodisch helder opgezet."
          light
        />
        <div className="mt-8">
          <TrustStrip items={trustItems} tone="dark" />
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Volgende stap</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">Wil je bepalen welk prijsanker nu past?</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          In een kort gesprek kijken we of ExitScan, RetentieScan of een combinatie logisch is, wanneer een herhaalmeting zinvol wordt en of de segment deep dive echt meerwaarde heeft.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#kennismaking"
            className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Plan mijn gesprek
          </Link>
          <Link
            href="/aanpak"
            className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
          >
            Bekijk aanpak
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  )
}
