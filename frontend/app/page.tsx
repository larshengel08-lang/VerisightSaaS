import Link from 'next/link'
import { PublicFooter } from '@/components/marketing/public-footer'
import { ContactForm } from '@/components/marketing/contact-form'
import { PreviewSlider } from '@/components/marketing/preview-slider'

const navLinks = [
  { href: '#vergelijking', label: 'Waarom Verisight' },
  { href: '#resultaten', label: 'Wat dit oplevert' },
  { href: '#tarieven', label: 'Tarieven' },
  { href: '#kennismaking', label: 'Kennismaking' },
]

const heroHighlights = [
  ['Inzicht', 'Zie welke uitstroom terugkeert', 'Je ziet terugkerende vertrekredenen en werkfactoren, niet alleen losse notities per exit.', 'blue'],
  ['Aanpak', 'Geen extra tool of zwaar adviestraject', 'Wij richten ExitScan in, versturen uitnodigingen en duiden de uitkomsten. HR hoeft geen surveytool op te tuigen.', 'emerald'],
  ['Output', 'Direct bruikbaar voor HR en MT', 'Je krijgt een dashboard, rapport in gewone taal en een toelichting waarmee je sneller kunt prioriteren.', 'amber'],
] as const

const trustItems = [
  ['Voor HR-teams in middelgrote organisaties', 'Past vooral bij organisaties met 200 tot 1.000 medewerkers en meerdere exits per jaar.'],
  ['Binnen enkele weken eerste inzichten', 'Je hoeft geen lang implementatietraject of interne toolselectie te doorlopen.'],
  ['Data in Europa', 'Met publieke privacy- en voorwaardenpagina\'s die je intern kunt delen.'],
  ['Methodische basis', 'Opgezet vanuit arbeids- en organisatiepsychologie om uitstroom vergelijkbaar en bruikbaar te maken.'],
] as const

const comparisonCards = [
  ['Losse exitgesprekken', 'Geven context per medewerker, maar zelden een vergelijkbaar organisatiebeeld.', 'Verisight bundelt signalen tot patronen en prioriteiten.'],
  ['Standaard surveytool', 'Geeft software, maar laat inrichting, opvolging en duiding vaak bij HR liggen.', 'Verisight combineert tooling met begeleiding en rapportage.'],
  ['Consultancytraject', 'Kan waardevol zijn, maar voelt vaak zwaarder en duurder dan nodig voor structureel uitstroominzicht.', 'Verisight is compacter, sneller te starten en duidelijker geprijsd.'],
] as const

const outcomeCards = [
  ['Sneller zien waar HR moet beginnen', 'Je krijgt een duidelijker beeld van welke thema\'s eerst aandacht vragen.'],
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

const pricingTiers = [
  ['200 - 400 medewerkers', 'EUR 1.750', 'Vaak passend bij ongeveer 20 tot 40 exits per jaar'],
  ['400 - 700 medewerkers', 'EUR 2.250', 'Vaak passend bij ongeveer 40 tot 70 exits per jaar'],
  ['700 - 1.000 medewerkers', 'EUR 2.950', 'Vaak passend bij ongeveer 70 tot 100 exits per jaar'],
] as const

const contactExpectations = [
  'Een reactie binnen ongeveer 1 werkdag',
  'Een verkennend gesprek van circa 20 minuten',
  'Een eerste inschatting of ExitScan nu passend is',
  'Helderheid over timing, aanpak en prijs',
]

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
      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-blue-700">
            Verisight
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-blue-700">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 md:inline-flex">
              Voor klanten: inloggen
            </Link>
            <a href="#kennismaking" className="inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
              Plan een verkennend gesprek
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
              <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-blue-700 shadow-sm">
                Voor HR-teams bij organisaties met 200 tot 1.000 medewerkers
              </div>
              <h1 className="text-balance text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
                Zie waarom medewerkers vertrekken. Stuur eerder bij.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
                Verisight begeleidt HR van ExitScan tot rapport — zonder dat je zelf een surveytool hoeft in te richten. Je krijgt inzicht en managementtaal die direct bruikbaar zijn.
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
                  Plan een verkennend gesprek
                </a>
                <a href="#vergelijking" className="inline-flex rounded-2xl border border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950">
                  Waarom niet gewoon exitgesprekken?
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">Reactie binnen 1 werkdag. Geen implementatietraject nodig. Publieke privacyverklaring beschikbaar.</p>
            </div>

            <div className="mt-14 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Voorbeeld van de managementweergave</p>
                  <p className="mt-1 text-sm text-slate-600">Geen live klantdata — deze voorbeelden laten zien hoe Verisight signalen, hypotheses en focusvragen samenvat.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">ExitScan</span>
              </div>
              <div className="mt-6">
                <PreviewSlider />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-6">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
            {trustItems.map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 5.296a1 1 0 0 1 0 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.086l6.79-6.79a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Waarom organisaties starten</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Losse exitgesprekken geven context. Geen patroon.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Pas als je uitstroom vergelijkbaar maakt, zie je waar het patroon zit — voordat de kosten doorlopen.</p>
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
            <p className="mt-3 max-w-4xl text-base leading-8 text-blue-950">Stel: een organisatie met 300 medewerkers heeft jaarlijks 30 exits. Als vervanging, inwerken en productiviteitsverlies per vertrek al snel enkele duizenden euro&apos;s kosten, hoeft je maar beperkt beter te begrijpen waar werkfactoren waarschijnlijk meespelen om de trajectprijs terug te verdienen.</p>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-blue-900">Verisight verkoopt geen garantie op minder verloop, maar wel een snellere en stevigere basis om gerichter te beslissen waar je moet ingrijpen.</p>
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
                <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <AccentTile tone={index === 0 ? 'red' : index === 1 ? 'amber' : 'blue'} />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">{outcome}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white md:py-20" id="resultaten">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Wat dit oplevert</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Geen losse tooloutput, maar een duidelijker basis voor actie en besluitvorming.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">Verisight levert inzicht, managementtaal en duiding waarmee uitstroom sneller bespreekbaar en prioriteerbaar wordt.</p>
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
              <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Een vaste trajectprijs voor inrichting, analyse en toelichting.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">Geen abonnement en geen extra implementatieproject. Je betaalt voor een begeleide ExitScan met duidelijke output.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {pricingTiers.map(([range, price, note], index) => (
                <div key={range} className={`rounded-3xl border p-6 text-center ${index === 1 ? 'border-blue-700 bg-blue-700 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-900'}`}>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-current/10 bg-white/10"><div className={`h-4 w-4 rounded-full ${index === 1 ? 'bg-white' : 'bg-blue-700'}`} /></div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${index === 1 ? 'text-blue-100' : 'text-slate-500'}`}>{range}</p>
                  <p className="mt-4 text-4xl font-bold">{price}</p>
                  <p className={`mt-3 text-sm leading-6 ${index === 1 ? 'text-blue-100' : 'text-slate-600'}`}>{note}</p>
                </div>
              ))}
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
                  <a href="#kennismaking" className="mt-6 inline-flex rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800">Plan een verkennend gesprek</a>
                  <p className="mt-3 text-sm text-slate-600">Prijzen exclusief btw. Reactie meestal binnen 1 werkdag.</p>
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
              <p className="mt-4 text-lg leading-8 text-slate-300">Deel kort je organisatieomvang en wat je nu vooral wilt begrijpen van uitstroom. Daarna weet je snel of dit traject past, wat de logische omvang is en hoe snel je kunt starten.</p>
              <div className="mt-8 space-y-4">
                {contactExpectations.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{item}</div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-200">Publieke informatie direct beschikbaar</p>
                <p className="mt-2 text-sm leading-6 text-emerald-100">Bekijk vooraf ook het <Link href="/privacy" className="underline">privacybeleid</Link> en de <Link href="/voorwaarden" className="underline">algemene voorwaarden</Link>.</p>
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
