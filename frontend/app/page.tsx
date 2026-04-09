import Link from 'next/link'
import { PublicFooter } from '@/components/marketing/public-footer'

const meetingMailto =
  'mailto:hallo@verisight.nl?subject=Kennismakingsgesprek%20Verisight&body=Hallo%20Verisight%2C%0A%0AIk%20wil%20graag%20een%20kennismakingsgesprek%20plannen%20over%20ExitScan.%0A%0AOrganisatie%3A%0AAantal%20medewerkers%3A%0AHuidige%20vraag%20rond%20uitstroom%3A%0A%0AMet%20vriendelijke%20groet%2C'

const navLinks = [
  { href: '#aanpak', label: 'Aanpak' },
  { href: '#resultaten', label: 'Wat je krijgt' },
  { href: '#tarieven', label: 'Tarieven' },
  { href: '#kennismaking', label: 'Kennismaking' },
]

const deliverables = [
  {
    title: 'Heldere vertrekredenen',
    description:
      'Je ziet niet alleen dat mensen vertrekken, maar ook welke redenen steeds terugkomen en waar HR waarschijnlijk kan bijsturen.',
  },
  {
    title: 'Patronen per team of thema',
    description:
      'Je krijgt overzicht op organisatieniveau: bijvoorbeeld leiderschap, groei, cultuur of werkbelasting.',
  },
  {
    title: 'Dashboard, rapport en toelichting',
    description:
      'Je ontvangt een dashboard, een managementrapport en een persoonlijke toelichting op de belangrijkste aandachtspunten.',
  },
]

const frictionPoints = [
  {
    title: 'Exitgesprekken blijven los zand',
    description:
      'Notities uit gesprekken zijn lastig te vergelijken. Daardoor blijven terugkerende oorzaken van vertrek onzichtbaar.',
  },
  {
    title: 'De echte schade zie je te laat',
    description:
      'Als patronen pas opvallen na meerdere exits, zijn kosten voor werving, inwerken en productiviteit vaak al gemaakt.',
  },
  {
    title: 'HR krijgt vragen zonder harde basis',
    description:
      'Management wil weten wat er speelt, maar zonder structuur blijft het vaak bij indrukken in plaats van bruikbare inzichten.',
  },
]

const fitSignals = [
  'Je organisatie heeft 200 tot 1.000 medewerkers en wil uitstroom professioneler volgen.',
  'Er zijn meerdere exits per jaar, maar de rode draad achter vertrek is nog niet scherp.',
  'HR of directie wil sturen op behoud, maar mist een consistente manier om vertrek te analyseren.',
]

const processSteps = [
  {
    step: '01',
    title: 'Korte intake en inrichting',
    description:
      'We stemmen af hoe jullie uitstroom eruitziet, richten ExitScan in en bepalen hoe uitnodigingen worden verstuurd.',
  },
  {
    step: '02',
    title: 'Versturen en verzamelen',
    description:
      'Vertrekkende medewerkers ontvangen een vertrouwelijke, mobiel leesbare vragenlijst. Jouw team hoeft daar geen extra tooling voor te beheren.',
  },
  {
    step: '03',
    title: 'Analyse en persoonlijke toelichting',
    description:
      'Je ontvangt een dashboard, een rapport en een gesprek waarin we uitleggen wat de uitkomsten betekenen en waar je het beste kunt beginnen.',
  },
]

const resultCards = [
  {
    title: 'Dashboard met groepsinzichten',
    description:
      'Zie welke vertrekredenen en werkfactoren terugkomen op organisatie- of afdelingsniveau.',
  },
  {
    title: 'Managementrapport in gewone taal',
    description:
      'Een rapport met hoofdbevindingen, aandachtspunten en concrete aanbevelingen voor HR en management.',
  },
  {
    title: 'Respons- en betrouwbaarheidsduiding',
    description:
      'Je ziet niet alleen de uitkomst, maar ook wanneer voorzichtigheid nodig is door beperkte aantallen.',
  },
  {
    title: 'Volledig begeleid traject',
    description:
      'Geen losse tool die je zelf moet uitvinden. Wij begeleiden de uitvoering van uitnodiging tot toelichting.',
  },
  {
    title: 'Publieke privacy- en voorwaardenpagina',
    description:
      'Je kunt intern direct verwijzen naar publieke informatie over privacy, hosting en voorwaarden.',
  },
  {
    title: 'Uitbreidbaar na ExitScan',
    description:
      'Als de basis staat, kan Verisight later worden uitgebreid met retentieonderzoek voor zittende medewerkers.',
  },
]

const trustItems = [
  'Voor HR-teams bij organisaties met 200 tot 1.000 medewerkers',
  'Data gehost in Europa en publieke privacyverklaring beschikbaar',
  'Volledig begeleid traject in plaats van een losse self-service tool',
  'Methodiek gebaseerd op gevalideerde arbeids- en organisatiepsychologie',
]

const faqs = [
  {
    question: 'Is Verisight een platform of een dienst?',
    answer:
      'Verisight is een begeleide dienst met software. Jij krijgt toegang tot dashboard en rapportage, maar wij begeleiden de inrichting, uitnodigingen en toelichting.',
  },
  {
    question: 'Hoeveel werk vraagt dit van HR?',
    answer:
      'Beperkt. Na de intake regelen wij de operationele inrichting. HR hoeft dus niet zelf een nieuwe surveytool te beheren.',
  },
  {
    question: 'Zijn antwoorden herleidbaar naar individuen?',
    answer:
      'Nee, rapportages zijn bedoeld voor geaggregeerde inzichten. Privacy en groepsgrootte worden expliciet meegewogen in de rapportage.',
  },
]

const pricingTiers = [
  {
    range: '200 - 400 medewerkers',
    price: 'EUR 1.750',
    note: 'Geschikt bij ongeveer 20 tot 40 exits per jaar',
  },
  {
    range: '400 - 700 medewerkers',
    price: 'EUR 2.250',
    note: 'Geschikt bij ongeveer 40 tot 70 exits per jaar',
    featured: true,
  },
  {
    range: '700 - 1.000 medewerkers',
    price: 'EUR 2.950',
    note: 'Geschikt bij ongeveer 70 tot 100 exits per jaar',
  },
]

const includedItems = [
  'Volledige inrichting van het ExitScan-traject',
  'Uitnodigingen en twee herinneringen voor respondenten',
  'Dashboard met terugkerende vertrekpatronen',
  'Managementrapport met aanbevelingen',
  'Persoonlijke toelichting op de uitkomsten',
  'Privacy- en betrouwbaarheidsduiding in de rapportage',
]

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
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 md:inline-flex"
            >
              Voor klanten: inloggen
            </Link>
            <a
              href="#kennismaking"
              className="inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Plan een kennismakingsgesprek
            </a>
          </div>
        </div>

        <nav className="border-t border-slate-100 px-5 py-3 lg:hidden">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1.5 transition-colors hover:border-blue-200 hover:text-blue-700"
              >
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
                Volledig begeleide uitstroomanalyse die laat zien waarom medewerkers vertrekken.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
                Verisight combineert een duidelijke ExitScan met begeleiding. Wij richten het traject in,
                versturen uitnodigingen, analyseren de antwoorden en leveren een dashboard, rapport en
                persoonlijke toelichting op.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-medium text-slate-700">
                {deliverables.map((item) => (
                  <span
                    key={item.title}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
                  >
                    {item.title}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#kennismaking"
                  className="inline-flex rounded-2xl bg-blue-700 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Plan een kennismakingsgesprek
                </a>
                <a
                  href="#aanpak"
                  className="inline-flex rounded-2xl border border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk hoe het traject werkt
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Reactie binnen 1 werkdag. Geen implementatietraject nodig. Publieke privacyverklaring beschikbaar.
              </p>
            </div>

            <div className="mt-14 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Voorbeeld van de managementweergave</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Geen live klantdata: dit voorbeeld laat zien welk soort inzichten je ontvangt.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  ExitScan
                </span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                      dashboard.verisight.nl
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    {[
                      { label: 'Responses', value: '14 van 18', detail: '78% respons' },
                      { label: 'Gemiddeld risico', value: '7,2 op 10', detail: 'Meerdere aandachtspunten' },
                      { label: 'Waarschijnlijk beinvloedbaar', value: '68%', detail: 'Indicatieve inschatting' },
                      { label: 'Gemiddelde diensttijd', value: '2,4 jaar', detail: 'Bij vertrek' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                        <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Welke thema&apos;s vragen de meeste aandacht?
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: 'Leiderschap', value: '8,1', band: 'Hoog', width: '81%', color: 'bg-red-400' },
                        { label: 'Groei en ontwikkeling', value: '6,4', band: 'Midden', width: '64%', color: 'bg-amber-400' },
                        { label: 'Cultuur', value: '5,9', band: 'Midden', width: '59%', color: 'bg-amber-400' },
                        { label: 'Werkbelasting', value: '3,1', band: 'Laag', width: '31%', color: 'bg-emerald-400' },
                      ].map((item) => (
                        <div key={item.label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto_auto] items-center gap-3">
                          <span className="text-sm text-slate-200">{item.label}</span>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                          </div>
                          <span className="text-sm font-semibold text-white">{item.value}</span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                            {item.band}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Wat je hier als HR direct uit haalt</p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      <li>Je ziet welke vertrekredenen blijven terugkomen, niet alleen losse signalen per exit.</li>
                      <li>Je krijgt een eerste indicatie waar HR of management waarschijnlijk kan bijsturen.</li>
                      <li>Je kunt management in gewone taal uitleggen welke thema&apos;s prioriteit vragen.</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">Belangrijke nuance</p>
                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Voorbeeldscores zijn indicatief. Rapportages zijn bedoeld voor groepsinzichten en niet als
                      zelfstandig oordeel over een individu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-6">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
            {trustItems.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Waarom organisaties starten</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              HR weet vaak dat er iets speelt, maar nog niet wat precies steeds terugkomt.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              ExitScan maakt uitstroom vergelijkbaar en bespreekbaar. Daardoor kun je patronen zien voordat ze blijven
              doorsluimeren.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {frictionPoints.map((item) => (
              <div key={item.title} className="rounded-3xl border border-red-100 bg-red-50 p-6">
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">Waarom de businesscase vaak snel klopt</p>
            <p className="mt-3 max-w-4xl text-base leading-8 text-blue-950">
              Bij een organisatie van 300 medewerkers met 10% uitstroom praat je al snel over 30 exits per jaar.
              Als je met betere inzichten ook maar een deel van die uitstroom beter begrijpt of eerder kunt bespreekbaar
              maken, kan een enkel voorkomen vertrek al een groot deel van het traject terugverdienen.
            </p>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white" id="aanpak">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Aanpak</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Van intake tot managementrapport in drie duidelijke stappen.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                De kern is simpel: wij begeleiden de uitvoering, jij ontvangt een onderbouwd beeld van uitstroom.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {processSteps.map((item) => (
                <div key={item.step} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-5xl font-bold text-blue-400/30">{item.step}</p>
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-7">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Voor wie dit vooral past</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                  {fitSignals.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Later uitbreidbaar</p>
                <h3 className="mt-3 text-xl font-semibold">RetentieScan kan een vervolgstap zijn, niet de eerste keuze op deze pagina.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Eerst grip op uitstroom. Daarna kun je eventueel uitbreiden naar onderzoek onder zittende medewerkers.
                  Zo blijft het aanbod op deze pagina helder en overzichtelijk.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6" id="resultaten">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Wat je krijgt</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              Geen losse tool, maar een traject met duidelijke output.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Elke sectie van de output heeft een eigen functie: inzicht, besluitvorming en vervolggesprek.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resultCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-20" id="tarieven">
          <div className="mx-auto max-w-5xl px-5 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Tarieven</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
                Een trajectprijs voor inrichting, analyse en toelichting.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Geen abonnement en geen extra implementatieproject. Je betaalt per ExitScan-traject.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.range}
                  className={`rounded-3xl border p-6 text-center ${
                    tier.featured
                      ? 'border-blue-700 bg-blue-700 text-white shadow-lg'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${tier.featured ? 'text-blue-100' : 'text-slate-500'}`}>
                    {tier.range}
                  </p>
                  <p className="mt-4 text-4xl font-bold">{tier.price}</p>
                  <p className={`mt-3 text-sm leading-6 ${tier.featured ? 'text-blue-100' : 'text-slate-600'}`}>
                    {tier.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Altijd inbegrepen</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {includedItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">Volgende stap</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">Plan eerst een kennismakingsgesprek.</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    In dat gesprek bepalen we of ExitScan past bij jullie organisatie, welke omvang logisch is en
                    welke planning haalbaar voelt.
                  </p>
                  <a
                    href="#kennismaking"
                    className="mt-6 inline-flex rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                  >
                    Plan een kennismakingsgesprek
                  </a>
                  <p className="mt-3 text-sm text-slate-600">Prijzen exclusief btw. Reactie meestal binnen 1 werkdag.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Veelgestelde vragen</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              Korte antwoorden op de vragen die vaak als eerste komen.
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950">
                  {faq.question}
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white" id="kennismaking">
          <div className="mx-auto max-w-5xl px-5 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Kennismaking</p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Binnen een gesprek weet je of ExitScan voor jullie nu zinvol is.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  We bespreken jullie huidige uitstroomvraag, de omvang van de organisatie en welke vorm van begeleiding
                  logisch is. Daarna weet je snel of het past, zonder lang voortraject.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href={meetingMailto}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-800"
                  >
                    Plan een kennismakingsgesprek
                  </a>
                  <a
                    href="mailto:hallo@verisight.nl"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-8 py-4 text-base font-semibold text-slate-200 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Mail direct naar hallo@verisight.nl
                  </a>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Stuur bij voorkeur mee: aantal medewerkers, type organisatie en wat jullie nu vooral willen begrijpen
                  van uitstroom.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Wat je na contact mag verwachten</p>
                <div className="mt-5 space-y-4">
                  {[
                    'Een reactie binnen ongeveer 1 werkdag',
                    'Een eerste inschatting of ExitScan nu past bij jullie situatie',
                    'Helderheid over trajectvorm, timing en prijs',
                    'Geen salesdemo vol schermen, maar een gesprek over jullie HR-vraag',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-200">Publieke informatie direct beschikbaar</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-100">
                    Bekijk vooraf ook het <Link href="/privacy" className="underline">privacybeleid</Link> en de{' '}
                    <Link href="/voorwaarden" className="underline">algemene voorwaarden</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
