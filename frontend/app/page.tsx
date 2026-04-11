import Link from 'next/link'
import Image from 'next/image'
import { PublicFooter } from '@/components/marketing/public-footer'
import { ContactForm } from '@/components/marketing/contact-form'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { Wordmark } from '@/components/marketing/wordmark'

const navLinks = [
  { href: '#vergelijking', label: 'Waarom Verisight' },
  { href: '#resultaten', label: 'Wat HR-teams ermee doen' },
  { href: '#tarieven', label: 'Tarieven' },
  { href: '#kennismaking', label: 'Kennismaking' },
]

const heroHighlights = [
  ['Inzicht', 'Zie welke uitstroom terugkeert', 'Je ziet terugkerende vertrekredenen en werkfactoren, niet alleen losse notities per exit.', 'blue'],
  ['Aanpak', 'Geen extra tool of zwaar adviestraject', 'Wij richten ExitScan in, versturen uitnodigingen en duiden de uitkomsten. HR hoeft geen surveytool op te tuigen.', 'emerald'],
  ['Output', 'Direct bruikbaar voor HR en MT', 'Je krijgt een dashboard, rapport in gewone taal en een toelichting waarmee je sneller kunt prioriteren.', 'amber'],
] as const

const comparisonCards = [
  ['Losse exitgesprekken', 'Geven context per persoon, maar zolang ze niet vergelijkbaar zijn over afdelingen en perioden, blijft het organisatiepatroon onzichtbaar. ExitScan voegt dat toe aan wat je al doet.', 'Verisight bundelt losse signalen tot patronen en prioriteiten.'],
  ['Standaard surveytool', 'Geeft software, maar laat inrichting, opvolging en duiding vaak bij HR liggen.', 'Verisight combineert tooling met begeleiding en rapportage.'],
  ['Consultancytraject', 'Kan waardevol zijn, maar voelt vaak zwaarder en duurder dan nodig voor structureel uitstroominzicht.', 'Verisight is compacter, sneller te starten en duidelijker geprijsd.'],
] as const

const outcomeCards = [
  ['Sneller prioriteiten stellen voor MT-gesprek', "Je krijgt een duidelijker beeld van welke thema's eerst aandacht vragen, als stevige basis voor de agenda met leidinggevenden en management."],
  ['Gerichtere verbeteracties', 'Je ziet of vertrek vooral wijst op leiderschap, groei, cultuur, onboarding of werkbelasting.'],
  ['Minder discussie, meer gedeelde taal', 'Rapportage in gewone taal helpt HR, leidinggevenden en management sneller op een lijn.'],
  ['Geen extra toolbeheer voor HR', 'Verisight begeleidt de uitvoering, zodat jouw team niet ook nog een surveyproces hoeft te beheren.'],
  ['Output die intern doorgezet kan worden', 'Het traject levert iets op dat bruikbaar is voor MT-overleg, prioritering en vervolgkeuzes.'],
  ['Basis voor retentiebeleid', 'Als patronen duidelijk zijn, kun je gerichter bepalen waar vervolgonderzoek of interventie nodig is.'],
] as const

const faqs = [
  ['Hoe snel kunnen we starten?', 'Na een kort verkennend gesprek kunnen we meestal snel aangeven of ExitScan past en welke planning logisch is.'],
  ['Hoeveel werk vraagt dit van HR?', 'Beperkt. Wij begeleiden inrichting, uitnodigingen en rapportage; HR levert vooral context en interne afstemming.'],
  ['Vanaf hoeveel exits is dit zinvol?', 'ExitScan werkt het best wanneer er doorlopend uitstroom is en je patronen wilt herkennen in plaats van losse incidenten wilt bespreken.'],
  ['Wat als de respons lager uitvalt dan gehoopt?', 'Dan laten we dat expliciet terugkomen in de duiding, zodat de output niet stelliger wordt dan de data toelaat.'],
  ['Is Verisight een tool of een dienst?', 'Het is een begeleide dienst met software. Je krijgt dashboard en rapportage, zonder self-service implementatie.'],
  ['Zijn antwoorden herleidbaar naar individuen?', 'De output is bedoeld voor groepsinzichten. Privacy, minimum aantallen en zorgvuldige interpretatie worden expliciet meegenomen.'],
] as const

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
}

const baseOffer = {
  title: 'ExitScan',
  price: 'EUR 6.499',
  discountedPrice: 'EUR 2.925',
  note: 'Standaard trajectprijs voor inrichting, analyse en rapportage',
}

const contactExpectations = [
  'Een reactie binnen ongeveer 1 werkdag',
  'Een verkennend gesprek van circa 20 minuten',
  'Een eerste inschatting of ExitScan nu passend is',
  'Helderheid over timing, aanpak en prijs',
]

const optionalAddOns = [
  [
    'Segment deep dive',
    'Extra segmentanalyse in het rapport, met scherpere uitsplitsing naar afdeling, functieniveau en diensttijd. Je ziet explicieter welke subgroepen afwijken van het organisatieniveau.',
    'Meerprijs: EUR 950. Werkt het best als afdeling en functieniveau netjes zijn aangeleverd in het respondentbestand.',
  ],
] as const

function AccentTile({ tone }: { tone: 'blue' | 'red' | 'amber' | 'emerald' }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  }
  const dotStyles = {
    blue: 'bg-blue-700',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }

  return (
    <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border ${styles[tone]}`}>
      <div className={`h-4 w-4 rounded-full ${dotStyles[tone]}`} />
      <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white/80" />
    </div>
  )
}

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

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Wordmark size="md" />
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-blue-700">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 md:inline-flex">
              Inloggen
            </Link>
            <a href="#kennismaking" className="inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
              Plan mijn gesprek
            </a>
          </div>
        </div>
        <nav className="border-t border-slate-100 px-5 py-3 lg:hidden">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1.5 transition-colors hover:border-blue-200 hover:text-blue-700">
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main id="hoofdinhoud">
        <section className="bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_38%,#ffffff_100%)]">
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
                Zie waarom medewerkers vertrekken. Stuur eerder bij.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
                Verisight zet een gestructureerde ExitScan op, analyseert de uitkomsten en levert een rapport dat HR en MT direct kunnen gebruiken.
              </p>
              <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
                {heroHighlights.map(([eyebrow, title, description, tone]) => (
                  <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                    <AccentTile tone={tone} />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#kennismaking" className="inline-flex rounded-2xl bg-blue-700 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-800">
                  Plan mijn gesprek
                </a>
                <a href="#vergelijking" className="inline-flex rounded-2xl border border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950">
                  Waarom niet gewoon exitgesprekken?
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">Reactie binnen 1 werkdag · Geen implementatietraject nodig</p>
            </div>

            <div className="mt-14 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Voorbeeld van de managementweergave</p>
                  <p className="mt-1 text-sm text-slate-600">Geen live klantdata - deze voorbeelden laten zien hoe Verisight signalen, hypotheses en focusvragen samenvat.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">ExitScan</span>
              </div>
              <div className="mt-6">
                <PreviewSlider />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-6 sm:px-6 md:pt-10">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-8 md:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Wat is een ExitScan?</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950 md:text-3xl">
                Een ExitScan maakt uitstroom vergelijkbaar, zodat HR sneller patronen ziet dan met losse exitgesprekken.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Verisight zet een gestructureerde exitscan op voor organisaties met doorlopende uitstroom. Medewerkers
                vullen een vaste vragenlijst in, waarna Verisight de antwoorden bundelt tot een dashboard en rapport
                met terugkerende werkfactoren, vertrekredenen en focusvragen voor HR en MT.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Waarom organisaties starten</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Losse exitgesprekken geven context. Geen patroon.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Pas als je uitstroom vergelijkbaar maakt, zie je waar het patroon zit - voordat de kosten doorlopen.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ['Signaal 01', 'Exitgesprekken leveren input, maar geen patroon', 'Teams houden vaak wel gesprekken, maar niet in een vorm die je betrouwbaar kunt vergelijken over afdelingen of perioden heen.'],
              ['Signaal 02', 'De kosten lopen door terwijl de rode draad onduidelijk blijft', 'Tegen de tijd dat patronen zichtbaar worden, zijn werving, inwerken en productiviteitsverlies vaak al meerdere keren gemaakt.'],
              ['Signaal 03', 'Management wil keuzes, HR mist een harde basis', 'Zonder structuur blijft het gesprek hangen in indrukken, terwijl je juist richting wilt geven aan leiderschap, groei of werkdruk.'],
            ].map(([eyebrow, title, description]) => (
              <div key={title} className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">{eyebrow}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">Waarom de businesscase vaak snel klopt</p>
            <p className="mt-3 max-w-4xl text-base leading-8 text-blue-950">Stel: 300 medewerkers, 10% verloop = 30 exits per jaar. Bij een gemiddelde vervangingskost van EUR 15.000 per FTE - werving, inwerken en productiviteitsverlies - staat er EUR 450.000 op het spel. Twee vermijdbare exits per jaar voorkomen dekt het trajectbedrag ruimschoots. Dat is een aanname die HR zelf met MT kan toetsen.</p>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-blue-900">Verisight verkoopt geen garantie op minder verloop, maar wel een snellere en stevigere basis om gerichter te beslissen waar je als eerste moet ingrijpen.</p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20" id="vergelijking">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Waarom Verisight</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Beter passend dan losse exitgesprekken, een generieke surveytool of een zwaar consultancytraject.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">De kracht zit in de combinatie: een duidelijke ExitScan, begeleiding in de uitvoering en output die intern meteen bruikbaar is.</p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {comparisonCards.map(([title, description, outcome], index) => (
                <div key={title} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <AccentTile tone={index === 0 ? 'red' : index === 1 ? 'amber' : 'blue'} />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{description}</p>
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">{outcome}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white md:py-20" id="resultaten">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Wat HR-teams ermee doen</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Geen losse tooloutput, maar een duidelijker basis voor actie en besluitvorming.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">Verisight levert inzicht en duiding waarmee uitstroom sneller bespreekbaar en prioriteerbaar wordt voor HR en MT.</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {outcomeCards.map(([title, description]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-20" id="tarieven">
          <div className="mx-auto max-w-5xl px-5 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Tarieven</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Een vaste trajectprijs voor ExitScan, met één optionele verdieping.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">Heldere standaardprijs, geen abonnement en tijdelijk early-adoptertarief voor de eerste organisaties.</p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-blue-700 bg-blue-700 px-8 py-10 text-center text-white shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">{baseOffer.title}</p>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Standaardprijs</p>
                <p className="mt-2 text-3xl font-bold text-blue-100/70 line-through">{baseOffer.price}</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-white">Early adoptertarief (55% korting)</p>
                <p className="mt-2 text-5xl font-bold">{baseOffer.discountedPrice}</p>
                <p className="mt-3 text-sm leading-6 text-blue-100">{baseOffer.note}</p>
                <p className="mt-5 text-sm leading-6 text-blue-50">
                  Geschikt voor organisaties die losse exitgesprekken willen omzetten naar één vergelijkbaar organisatiebeeld met dashboard en rapport.
                </p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Optionele add-on</p>
                {optionalAddOns.map(([title, description, note]) => (
                  <div key={title}>
                    <h3 className="mt-4 text-2xl font-bold text-slate-950">{title}</h3>
                    <p className="mt-3 text-base leading-8 text-slate-600">{description}</p>
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                      <p className="text-sm font-semibold text-blue-950">Meerprijs: EUR 950</p>
                      <p className="mt-2 text-sm leading-6 text-blue-900">{note.replace('Meerprijs: EUR 950. ', '')}</p>
                    </div>
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Voorbeeld uit het rapport</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Met Segment deep dive zie je extra uitsplitsingen naar afdeling, diensttijd en functieniveau in dezelfde rapportstijl als hieronder.
                      </p>
                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <Image
                          src="/segment-deep-dive-preview.png"
                          alt="Voorbeeld van segmentatie in het ExitScan-rapport"
                          width={1000}
                          height={1200}
                          className="h-auto w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Altijd inbegrepen</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      'Inrichting van het ExitScan-traject',
                      'Uitnodigingen en twee herinneringen voor respondenten',
                      'Dashboard met terugkerende vertrekpatronen',
                      'Managementrapport met focusvragen en nuance',
                      'Zelfstandig leesbare output voor HR en MT',
                      'Publieke privacy- en voorwaardenpagina voor interne afstemming',
                      'Binnen enkele weken eerste inzichten - geen implementatietraject nodig',
                      'Methodische basis vanuit arbeids- en organisatiepsychologie',
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">Past vaak goed bij</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">Organisaties met doorlopende uitstroom die sneller van losse signalen naar een gedeeld organisatiebeeld willen.</p>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-900">Eerst bespreken als</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">Je uitstroom nog erg beperkt is, of als je eigenlijk een breder medewerkeronderzoek zoekt in plaats van een uitstroomanalyse.</p>
                  <a href="#kennismaking" className="mt-6 inline-flex rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800">Plan mijn gesprek</a>
                  <p className="mt-3 text-sm text-slate-600">Prijzen exclusief btw. Early adoptertarief geldt voor de eerste trajecten die nu starten.</p>
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-800">Beschikbaarheid Q2 2026</p>
                    <p className="mt-1 text-xs leading-5 text-amber-700">We begeleiden maximaal 4 trajecten per kwartaal. Momenteel nog 2 plekken beschikbaar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Veelgestelde vragen</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Korte antwoorden op de vragen die vaak een koopbeslissing blokkeren.</h2>
          </div>
          <div className="mt-10 space-y-4">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950">{question}</summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white md:py-20" id="kennismaking">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Kennismaking</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Binnen een kort gesprek weet je of ExitScan nu voor jullie zinvol is.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">Deel kort je organisatieomvang en wat je nu vooral wilt begrijpen van uitstroom. Daarna weet je snel of dit traject past - en of er nog een plek beschikbaar is dit kwartaal.</p>
              <div className="mt-8 space-y-4">
                {contactExpectations.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{item}</div>
                ))}
              </div>
            </div>
            <div><ContactForm /></div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
