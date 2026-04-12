import Link from 'next/link'
import { PublicFooter } from '@/components/marketing/public-footer'
import { ContactForm } from '@/components/marketing/contact-form'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { Wordmark } from '@/components/marketing/wordmark'
import { ExpandablePreview } from '@/components/marketing/expandable-preview'
import { SolutionsDropdown } from '@/components/marketing/solutions-dropdown'

// ─── Data ────────────────────────────────────────────────────────────────────

const navLinks = [
  { href: '#vergelijking', label: 'Waarom Verisight' },
  { href: '#resultaten', label: 'Wat HR-teams ermee doen' },
  { href: '#tarieven', label: 'Tarieven' },
  { href: '#kennismaking', label: 'Kennismaking' },
]

const heroHighlights = [
  {
    eyebrow: 'Inzicht',
    title: 'Van losse exits naar één organisatiebeeld',
    description:
      'Je ziet welke vertrekpatronen en werkfactoren terugkeren, niet alleen losse notities per exit.',
  },
  {
    eyebrow: 'Aanpak',
    title: 'Begeleid traject, geen extra toolbeheer',
    description:
      'Wij richten ExitScan in, versturen uitnodigingen en duiden de uitkomsten. HR hoeft geen surveyproces op te tuigen.',
  },
  {
    eyebrow: 'Output',
    title: 'Dashboard en rapport waarmee je kunt prioriteren',
    description:
      'Je krijgt een dashboard, rapport in gewone taal en focusvragen waarmee HR en MT sneller kunnen bepalen waar gerichte actie nodig is.',
  },
] as const

const signalen = [
  {
    n: '1',
    title: 'Exitgesprekken leveren input, maar geen patroon',
    description:
      'Teams houden vaak wel gesprekken, maar niet in een vorm die je betrouwbaar kunt vergelijken over afdelingen of perioden heen.',
  },
  {
    n: '2',
    title: 'De kosten lopen door terwijl de rode draad onduidelijk blijft',
    description:
      'Tegen de tijd dat patronen zichtbaar worden, zijn werving, inwerken en productiviteitsverlies vaak al meerdere keren gemaakt.',
  },
  {
    n: '3',
    title: 'Management wil keuzes, HR mist een harde basis',
    description:
      'Zonder structuur blijft het gesprek hangen in indrukken, terwijl je juist richting wilt geven aan leiderschap, groei of werkdruk.',
  },
] as const

const comparisonCards = [
  {
    title: 'Losse exitgesprekken',
    description:
      'Geven context per persoon, maar zolang ze niet vergelijkbaar zijn over afdelingen en perioden, blijft het organisatiepatroon onzichtbaar. ExitScan voegt dat toe aan wat je al doet.',
    outcome: 'Verisight bundelt losse signalen tot patronen en prioriteiten.',
  },
  {
    title: 'Standaard surveytool',
    description:
      'Geeft software, maar laat inrichting, opvolging en duiding vaak bij HR liggen.',
    outcome: 'Verisight combineert tooling met begeleiding en rapportage.',
  },
  {
    title: 'Consultancytraject',
    description:
      'Kan waardevol zijn, maar voelt vaak zwaarder en duurder dan nodig voor structureel uitstroominzicht.',
    outcome: 'Verisight is compacter, sneller te starten en duidelijker geprijsd.',
  },
] as const

const outcomeCards = [
  [
    'Sneller prioriteiten stellen voor MT-gesprek',
    "Je krijgt een duidelijker beeld van welke thema's eerst aandacht vragen, als stevige basis voor de agenda met leidinggevenden en management.",
  ],
  [
    'Gerichtere verbeteracties',
    'Je ziet of vertrek vooral wijst op leiderschap, groei, cultuur, onboarding of werkbelasting.',
  ],
  [
    'Minder discussie, meer gedeelde taal',
    'Rapportage in gewone taal helpt HR, leidinggevenden en management sneller op een lijn.',
  ],
  [
    'Geen extra toolbeheer voor HR',
    'Verisight begeleidt de uitvoering, zodat jouw team niet ook nog een surveyproces hoeft te beheren.',
  ],
  [
    'Output die intern doorgezet kan worden',
    'Het traject levert iets op dat bruikbaar is voor MT-overleg, prioritering en vervolgkeuzes.',
  ],
  [
    'Basis voor retentiebeleid',
    'Als patronen duidelijk zijn, kun je gerichter bepalen waar vervolgonderzoek of interventie nodig is.',
  ],
] as const

const included = [
  'Inrichting van het ExitScan-traject',
  'Uitnodigingen en twee herinneringen voor respondenten',
  'Dashboard met terugkerende vertrekpatronen',
  'Managementrapport met focusvragen en nuance',
  'Zelfstandig leesbare output voor HR en MT',
  'Publieke privacy- en voorwaardenpagina voor interne afstemming',
  'Binnen enkele weken eerste inzichten — geen implementatietraject nodig',
  'Methodische basis vanuit arbeids- en organisatiepsychologie',
] as const

const faqs = [
  [
    'Hoe snel kunnen we starten?',
    'Na een kort verkennend gesprek kunnen we meestal snel aangeven of ExitScan past en welke planning logisch is.',
  ],
  [
    'Hoeveel werk vraagt dit van HR?',
    'Beperkt. Wij begeleiden inrichting, uitnodigingen en rapportage; HR levert vooral context en interne afstemming.',
  ],
  [
    'Vanaf hoeveel exits is dit zinvol?',
    'ExitScan werkt het best wanneer er doorlopend uitstroom is en je patronen wilt herkennen in plaats van losse incidenten wilt bespreken.',
  ],
  [
    'Wat als de respons lager uitvalt dan gehoopt?',
    'Dan laten we dat expliciet terugkomen in de duiding, zodat de output niet stelliger wordt dan de data toelaat.',
  ],
  [
    'Is Verisight een tool of een dienst?',
    'Het is een begeleide dienst met software. Je krijgt dashboard en rapportage, zonder self-service implementatie.',
  ],
  [
    'Zijn antwoorden herleidbaar naar individuen?',
    'De output is bedoeld voor groepsinzichten. Privacy, minimum aantallen en zorgvuldige interpretatie worden expliciet meegenomen.',
  ],
] as const

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

// ─── Shared components ────────────────────────────────────────────────────────

function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode
  light?: boolean
}) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-widest ${light ? 'text-blue-300' : 'text-blue-600'}`}
    >
      {children}
    </p>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Wordmark size="md" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <SolutionsDropdown />
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-slate-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 md:inline-flex"
            >
              Inloggen
            </Link>
            <a
              href="#kennismaking"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Plan mijn gesprek
            </a>
          </div>
        </div>
      </header>

      <main id="hoofdinhoud">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="bg-[#f8f9fb] pb-0 pt-20 md:pt-28">
          <div className="mx-auto max-w-6xl px-6">
            {/* Headline */}
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-display text-balance text-[2.75rem] leading-[1.15] text-slate-950 md:text-[3.75rem]">
                Maak uitstroompatronen zichtbaar. Zie waar gerichte actie het meeste oplevert.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Verisight bundelt exitinput tot één vergelijkbaar organisatiebeeld, met dashboard,
                managementrapport en concrete prioriteiten voor HR en MT.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <a
                  href="#kennismaking"
                  className="inline-flex rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Plan mijn gesprek
                </a>
                <a
                  href="#vergelijking"
                  className="inline-flex rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Waarom niet gewoon exitgesprekken?
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Reactie binnen 1 werkdag · Begeleid traject zonder implementatietraject
              </p>
            </div>

            {/* Product preview — top card only (no bottom border), continues below fold */}
            <div className="mx-auto mt-14 max-w-5xl">
              <div className="rounded-t-2xl border border-b-0 border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Voorbeeld van de managementweergave
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Geen live klantdata — laat zien hoe Verisight signalen, hypotheses en
                      focusvragen samenvat.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    ExitScan
                  </span>
                </div>
                <div className="p-6">
                  <PreviewSlider />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Wat bied je ─────────────────────────────────────────────────── */}
        {/* Visually connects to the preview card above */}
        <section className="bg-white pb-20 pt-0">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-b-2xl border border-t-0 border-slate-200 md:grid md:grid-cols-3 md:divide-x md:divide-slate-200">
                {heroHighlights.map(({ eyebrow, title, description }) => (
                  <div key={eyebrow} className="border-t border-slate-200 bg-white p-6 md:border-t-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                      {eyebrow}
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Signalen ────────────────────────────────────────────────────── */}
        <section className="bg-[#f8f9fb] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Waarom organisaties starten</SectionLabel>
              <h2 className="font-display mt-4 text-3xl text-slate-950 md:text-4xl">
                Losse exitgesprekken geven context. Geen patroon.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Pas als je uitstroom vergelijkbaar maakt, zie je waar dezelfde frictie terugkeert en
                waar gerichte actie waarschijnlijk het meeste oplevert.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {signalen.map(({ n, title, description }) => (
                <div
                  key={n}
                  className="rounded-2xl border border-red-100 bg-red-50 p-6"
                >
                  <span className="inline-flex rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-600">
                    Signaal {n}
                  </span>
                  <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{description}</p>
                </div>
              ))}
            </div>

            {/* Business case */}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Waarom de businesscase vaak snel klopt
              </p>
              <p className="mt-3 max-w-4xl text-base leading-8 text-blue-950">
                Stel: 300 medewerkers, 10% verloop = 30 exits per jaar. Bij een gemiddelde
                vervangingskost van EUR&nbsp;15.000 per FTE — werving, inwerken en
                productiviteitsverlies — staat er EUR&nbsp;450.000 op het spel. Twee vermijdbare
                exits per jaar voorkomen dekt het trajectbedrag ruimschoots. Dat is een aanname die
                HR zelf met MT kan toetsen.
              </p>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-blue-800">
                Verisight verkoopt geen garantie op minder verloop, maar wel een snellere en
                stevigere basis om gerichter te beslissen waar je als eerste moet ingrijpen.
              </p>
            </div>
          </div>
        </section>

        {/* ── Vergelijking ─────────────────────────────────────────────────── */}
        <section className="bg-white py-20" id="vergelijking">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Waarom Verisight</SectionLabel>
              <h2 className="font-display mt-4 text-3xl text-slate-950 md:text-4xl">
                Beter passend dan losse exitgesprekken, een generieke surveytool of een zwaar
                consultancytraject.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                De kracht zit in de combinatie: een duidelijke ExitScan, begeleiding in de uitvoering
                en output die intern direct bruikbaar is voor HR en MT.
              </p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {comparisonCards.map(({ title, description, outcome }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{description}</p>
                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                    {outcome}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Resultaten ───────────────────────────────────────────────────── */}
        <section className="bg-[#0d1b2e] py-20 text-white" id="resultaten">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel light>Wat HR-teams ermee doen</SectionLabel>
              <h2 className="font-display mt-4 text-3xl text-white md:text-4xl">
                Geen losse tooloutput, maar een duidelijker basis voor actie en besluitvorming.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                Verisight levert inzicht en duiding waarmee uitstroom sneller bespreekbaar en
                prioriteerbaar wordt voor HR en MT.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {outcomeCards.map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tarieven ─────────────────────────────────────────────────────── */}
        <section className="bg-[#f8f9fb] py-20" id="tarieven">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Tarieven</SectionLabel>
              <h2 className="font-display mt-4 text-3xl text-slate-950 md:text-4xl">
                Een vaste launchprijs voor ExitScan, met één optionele verdieping.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Geen abonnement, geen licentiegedoe en geen losse consultancy-uren achteraf. Je koopt
                één duidelijk traject met één optionele add-on.
              </p>
            </div>

            <div className="mt-12 grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Main offer */}
              <div className="rounded-2xl bg-[#0d1b2e] px-8 py-10 text-center text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  ExitScan
                </p>
                <p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-300">
                  Launchprijs
                </p>
                <p className="mt-2 text-[3.25rem] font-bold leading-none text-white">
                  EUR 2.950
                </p>
                <p className="mt-4 text-sm leading-6 text-white/50">
                  Vaste trajectprijs voor inrichting, uitvoering, analyse en rapportage
                </p>
                <p className="mt-5 text-sm leading-7 text-white/70">
                  Voor organisaties die uitstroom niet langer alleen per casus willen bespreken, maar
                  als terugkerend organisatiepatroon willen begrijpen en prioriteren.
                </p>
                <a
                  href="#kennismaking"
                  className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Plan mijn gesprek
                </a>
                <p className="mt-4 text-xs text-white/30">
                  Prijs exclusief btw. Geldt voor trajecten die in deze launchfase starten.
                </p>
              </div>

              {/* Add-on */}
              <div className="rounded-2xl border border-slate-200 bg-white px-7 py-9">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Optionele add-on
                </p>
                <h3 className="mt-4 text-2xl font-bold text-slate-950">Segment deep dive</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Extra segmentanalyse in het rapport, met scherpere uitsplitsing naar afdeling,
                  functieniveau en diensttijd. Je ziet explicieter welke subgroepen afwijken van het
                  organisatieniveau.
                </p>
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
                  <p className="text-sm font-semibold text-blue-950">Meerprijs: EUR 950</p>
                  <p className="mt-2 text-sm leading-6 text-blue-900">
                    Werkt het best als afdeling en functieniveau netjes zijn aangeleverd in het
                    respondentbestand.
                  </p>
                </div>
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Voorbeeld uit het rapport
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Met Segment deep dive zie je extra uitsplitsingen naar afdeling, diensttijd en
                    functieniveau in dezelfde rapportstijl als hieronder.
                  </p>
                  <ExpandablePreview
                    src="/segment-deep-dive-preview.png"
                    alt="Voorbeeld van segmentatie in het ExitScan-rapport"
                    className="mt-4"
                  />
                </div>
              </div>
            </div>

            {/* Baseline / Live */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Uitvoeringsvorm
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                ExitScan is beschikbaar als Baseline of Live
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-950">ExitScan Baseline</span>
                    <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Standaard instap
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Retrospectief — kijkt terug op de afgelopen 12 maanden. Eenmalig traject dat een
                    patroonbeeld, nulmeting en eerste prioriteiten oplevert.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-950">ExitScan Live</span>
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      Op aanvraag
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Doorlopend — uitnodiging bij elke nieuwe vertrekker. Terugkerende rapportage of
                    dashboardverversing zodat je eerder signaleert en over tijd kunt volgen.
                  </p>
                </div>
              </div>
            </div>

            {/* Included features */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-lg font-semibold text-slate-950">Wat je koopt</h3>
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
              <div className="mt-6 grid gap-5 rounded-xl border border-blue-100 bg-blue-50 p-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                    Past vaak goed bij
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    Organisaties met doorlopende uitstroom die van losse exits naar één gedeeld
                    managementbeeld willen over waar frictie terugkeert.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                    Eerst bespreken als
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    Je uitstroom nog erg beperkt is, of als je vooral op zoek bent naar een breed
                    medewerkeronderzoek in plaats van een gerichte uitstroomanalyse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center">
              <SectionLabel>Veelgestelde vragen</SectionLabel>
              <h2 className="font-display mt-4 text-3xl text-slate-950 md:text-4xl">
                Korte antwoorden op de vragen die vaak een koopbeslissing blokkeren.
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map(([question, answer]) => (
                <details
                  key={question}
                  className="group rounded-2xl border border-slate-200 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold text-slate-950">
                    {question}
                    <span className="shrink-0 text-xl font-light text-slate-300 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="border-t border-slate-100 px-6 pb-6 pt-4 text-sm leading-7 text-slate-600">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kennismaking ─────────────────────────────────────────────────── */}
        <section className="bg-[#0d1b2e] py-20 text-white" id="kennismaking">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
            <div>
              <SectionLabel light>Kennismaking</SectionLabel>
              <h2 className="font-display mt-4 text-3xl text-white md:text-4xl">
                Binnen een kort gesprek weet je of ExitScan nu voor jullie zinvol is.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                Deel kort je organisatieomvang en wat je nu vooral wilt begrijpen van uitstroom.
                Daarna weet je snel of dit traject past en welke aanpak logisch is.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Een reactie binnen ongeveer 1 werkdag',
                  'Een verkennend gesprek van circa 20 minuten',
                  'Een eerste inschatting of ExitScan nu passend is',
                  'Helderheid over timing, aanpak en prijs',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
