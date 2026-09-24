import { buildContactHref } from '@/lib/contact-funnel'
import { pricingFaqAnswer } from '@/lib/pricing'

export const marketingNavLinks = [
  { href: '/producten', label: 'Producten' },
  { href: '/producten#tarieven', label: 'Tarieven' },
  { href: '/vertrouwen', label: 'Vertrouwen' },
] as const

export const marketingPrimaryCta = {
  href: buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'global_primary_cta' }),
  label: 'Plan een kennismaking',
} as const

export const marketingSecondaryCta = {
  href: '/#scans',
  label: 'Bekijk welke scan past',
} as const

export const marketingFooterLinks = [
  { href: '/', label: 'Home' },
  { href: '/producten', label: 'Producten' },
  { href: '/producten#loep-vertrek', label: 'Loep Vertrek' },
  { href: '/producten#loep-behoud', label: 'Loep Behoud' },
  { href: '/producten#loep-start', label: 'Loep Start' },
  { href: '/producten#tarieven', label: 'Tarieven' },
  { href: '/vertrouwen', label: 'Privacy' },
] as const

// /vertrouwen staat als "Vertrouwen" in de navigatiekolom van de footer;
// hier niet nogmaals onder een derde label ("Trust en privacy") om
// naamsverwarring met "Privacybeleid" te voorkomen.
export const marketingLegalLinks = [
  { href: '/privacy', label: 'Privacybeleid' },
  { href: '/voorwaarden', label: 'Algemene voorwaarden' },
  { href: '/dpa', label: 'Verwerkersovereenkomst' },
  { href: '/login', label: 'Inloggen' },
] as const

export const homepageProofSignals = [
  'Eén suite-login voor dashboard, rapport en de beheeromgeving',
  'HR kan managers per afdeling toewijzen zonder survey-inzichten open te zetten',
  'Drie routes: Loep Vertrek, Loep Behoud en Loep Start',
  'Groepsinzichten met expliciete claims- en privacygrenzen',
  'Publieke proof verschijnt pas na expliciete approval en provenance',
] as const

export const publicProofCards = [
  {
    title: 'Van signaal naar opvolging',
    body: 'Goedgekeurde proof laat zien hoe dashboard, rapport en de beheeromgeving samen worden gebruikt zonder brede workflowclaims.',
    approval: 'public_usable',
  },
  {
    title: 'Bounded manager-toegang',
    body: 'Proof blijft expliciet over begrensde manager-toegang en zet geen surveyinzichten open in publieke claims.',
    approval: 'public_usable',
  },
] as const

export const homepageUtilityLinks = [
  {
    href: '/producten',
    title: 'Bekijk de productroutes',
    body: 'Zie snel wanneer Loep Vertrek, Loep Behoud of Loep Start de juiste eerste stap is.',
  },
  {
    href: '/aanpak',
    title: 'Bekijk de aanpak',
    body: 'Lees hoe routekeuze, uitvoering en eerste output in een compacte productroute samenkomen.',
  },
  {
    href: '/producten#tarieven',
    title: 'Bekijk tarieven',
    body: 'Zie hoe eerste trajecten en vervolgvormen commercieel zijn opgebouwd.',
  },
  {
    href: '/vertrouwen',
    title: 'Bekijk trust en privacy',
    body: 'Controleer publiek hoe methodiek, privacy, rapportlezing en DPA zijn ingericht.',
  },
] as const

export const productOverviewComparisonRows = [
  [
    'Loep Vertrek',
    'Vertrekduiding',
    'Welk vertrekbeeld keert terug en welke werkfactoren wegen daarin mee?',
    'Voor terugkijkende analyse op uitstroom',
  ],
  [
    'Loep Behoud',
    'Vroegsignalering op behoud',
    'Waar staat behoud nu onder druk in de actieve populatie?',
    'Voor vroegsignalering en prioritering',
  ],
  [
    'Loep Start',
    'Vroege lifecycle-check',
    'Hoe landen nieuwe medewerkers in de eerste 90 dagen?',
    'Voor vroege signalering bij nieuwe instroom',
  ],
] as const

export const comparisonCards = [
  {
    title: 'Gerichte scan, geen brede vragenlijst',
    description:
      'Loep is opgebouwd rondom een specifieke managementvraag, niet een generieke vragenlijst die achteraf nog betekenis moet krijgen.',
    outcome: 'Je koopt een gerichte route, geen open instrument.',
  },
  {
    title: 'Output die je intern kunt gebruiken',
    description:
      'Dashboard, bestuurlijke read en factoranalyse zijn direct deelbaar met HR, MT en directie.',
    outcome: 'Geen losse datadump, maar een leesbaar rapport dat intern doorverteld kan worden.',
  },
  {
    title: 'Methodisch onderbouwd, heldere grenzen',
    description:
      'Uitkomsten tonen patronen, geen absolute waarheden. We benoemen bewust wat we niet claimen.',
    outcome: 'Bruikbare stuurinformatie zonder schijnzekerheid.',
  },
] as const

export const trustItems = [
  'Signalen, geen schijnzekerheid',
  'Rapportage op geaggregeerd niveau',
  'Vraagblokken gebaseerd op relevante literatuur',
  'Loep zet de meting klaar, jij verstuurt en leidt het gesprek',
  'AVG-conform, primaire dataopslag in een EU-regio',
  'Geen koppeling aan individuen in rapportage.',
] as const

export const trustQuickLinks = [
  {
    href: '/vertrouwen',
    label: 'Methodiek en vertrouwelijkheid',
    body: 'Hoe Loep is opgebouwd en wat je ervan kunt verwachten.',
  },
  {
    href: '/privacy',
    label: 'Privacybeleid',
    body: 'Dataverwerking, bewaartermijnen en AVG-rechten.',
  },
  {
    href: '/dpa',
    label: 'Verwerkersovereenkomst',
    body: 'Standaardtemplate voor formele afstemming.',
  },
] as const

export const trustVerificationCards = [
  {
    title: 'Bekijk het voordat je belt',
    body: 'Voorbeeldrapport, privacybeleid en DPA staan open. Je kunt alles lezen voordat er een gesprek plaatsvindt.',
    href: '/examples/voorbeeldrapport_loep.pdf',
    linkLabel: 'Bekijk een voorbeeldrapport (pdf)',
  },
  {
    title: 'Waar publieke voorbeeldoutput stopt',
    body: 'Loep Vertrek en Loep Behoud hebben een publiek voorbeeldrapport. Loep Start wordt publiek lichter toegelicht en heeft nog geen eigen voorbeeldrapport.',
  },
  {
    title: 'Wat management wel ziet',
    body: 'Geaggregeerde inzichten, topfactoren, prioriteiten en een eerste richting voor vervolg.',
  },
  {
    title: 'Wat we bewust niet claimen',
    body: 'Geen individuele voorspellingen, geen persoonsgerichte beoordeling en geen bewijsclaims die verder gaan dan de data dragen.',
  },
] as const

export const trustHubAnswerCards = [
  {
    title: 'Waar draait de data?',
    body: 'De primaire database draait in een EU-regio. Subverwerkers voor hosting en mail staan in privacybeleid en DPA benoemd.',
  },
  {
    title: 'Wat ziet management precies?',
    body: 'Management ziet groeps- en segmentinzichten, geen individuele signalen of persoonsgerichte actieroutes.',
  },
  {
    title: 'Hoe voorkom je schijnprecisie?',
    body: 'Detail start pas vanaf minimale aantallen. Kleine segmenten blijven verborgen en open tekst wordt waar nodig geanonimiseerd.',
  },
  {
    title: 'Welke juridische basis is publiek beschikbaar?',
    body: 'Er zijn publieke pagina\'s voor trust en privacy, privacybeleid, voorwaarden en een standaard DPA-template.',
  },
  {
    title: 'Wat koop je precies?',
    body: 'Een meting en een rapport. Loep zet de meting klaar, jij verstuurt hem, en het rapport zegt waar je begint en leidt je MT-gesprek. Geen licentie, geen platform dat je moet inrichten.',
  },
  {
    title: 'Heeft elke scan een publiek voorbeeldrapport?',
    body: 'Nee. Publieke voorbeeldoutput blijft bewust beperkt tot Loep Vertrek en Loep Behoud. Beide voorbeeldrapporten staan op de productenpagina en in de footer.',
  },
] as const

export const trustReadingRows = [
  [
    'Gebruik',
    'Managementduiding, prioritering en gesprek op groepsniveau',
    'Niet als diagnose, individuele voorspelling of performance-oordeel',
  ],
  [
    'Wat management ziet',
    'Dashboard, managementsamenvatting, topfactoren en de vervolgstap.',
    'Geen losse antwoorden, geen persoonsprofielen, geen verborgen scores',
  ],
  [
    'Privacygrens',
    'Minimale n-grenzen, segmentonderdrukking en geanonimiseerde open tekst',
    'Kleine groepen en open antwoorden tonen we bewust niet, of alleen geanonimiseerd',
  ],
  [
    'Bewijsstatus',
    'Methodisch onderbouwd en begrensd in wat het wel en niet claimt.',
    'Geen gecertificeerde diagnose of voorspeller, wel onderbouwde input voor het gesprek',
  ],
] as const

export const trustSupportCards = [
  {
    title: 'Trust en privacy',
    href: '/vertrouwen',
    body: 'Methodiek, privacy en interpretatiegrenzen.',
  },
  {
    title: 'Privacybeleid',
    href: '/privacy',
    body: 'Persoonsgegevens, subverwerkers en rechten onder de AVG.',
  },
  {
    title: 'Verwerkersovereenkomst',
    href: '/dpa',
    body: 'Standaard DPA-template voor klantorganisaties.',
  },
  {
    title: 'Algemene voorwaarden',
    href: '/voorwaarden',
    body: 'Dienstvorm, beschikbaarheid, facturatie en rollen.',
  },
] as const

export const contactTrustSignals = [
  'Aanvraag wordt alleen gebruikt voor route-inschatting en follow-up',
  'Reactie meestal binnen 1 werkdag',
  'Publieke trust-, privacy- en DPA-pagina beschikbaar',
] as const

export const statCards = [
  {
    value: '1 suite-login',
    label: 'voor inzicht + opvolging',
    detail: 'Dashboard, rapport en opvolging blijven bereikbaar via dezelfde beveiligde toegang.',
  },
  {
    value: '2 modules',
    label: 'insights en follow-through',
    detail: 'HR en klant zien dashboard plus de opvolglaag; managers kunnen bounded alleen de opvolglaag in.',
  },
  {
    value: 'Afdelingstoewijzing',
    label: 'bounded manager-scope',
    detail: 'HR kan managers aan afdelingen koppelen terwijl survey-inzicht en rapportlezing afgeschermd blijven.',
  },
] as const

export const processHighlights = [
  {
    title: 'Voor HR',
    text: 'Minder losse signalen, minder improvisatie in uitleg en sneller een bruikbare keuze tussen vertrekduiding en behoudsignalering.',
  },
  {
    title: 'Voor MT',
    text: 'Een compact managementbeeld dat helpt bepalen welke vraag nu eerst op tafel moet en waar gesprek, validatie of actie het meeste oplevert.',
  },
  {
    title: 'Voor directie',
    text: 'Compacte besluitinformatie die laat zien waar terugkerende vertrekpatronen of vroege signalen van behoudsdruk bestuurlijke aandacht en eigenaarschap verdienen.',
  },
] as const

export const approachRoutes = [
  {
    eyebrow: 'Loep Vertrek Baseline',
    title: 'De standaard eerste instap voor vertrekduiding',
    body: 'Baseline op recente vertrekkers, bijvoorbeeld over de afgelopen 12 maanden. Dit is meestal de logische eerste commerciële instap wanneer organisaties wel exitinput hebben, maar nog geen bestuurbaar patroonbeeld.',
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
    eyebrow: 'Loep Vertrek ritmeroute',
    title: 'Voor organisaties die uitstroom doorlopend willen volgen',
    body: 'Doorlopende Loep Vertrek voor nieuwe vertrekkers. Past vooral als quote-only vervolg op een eerste baseline of wanneer uitstroom al structureel en met voldoende volume wordt gevolgd.',
    bullets: [
      'Vast proces met HR voor nieuwe vertrekkers',
      'Actuelere signalen, trends pas zinvol bij voldoende volume',
      'Op aanvraag na baseline of bij bestaand exitvolume',
    ],
    shellClass: 'border-slate-200 bg-slate-50',
    eyebrowClass: 'text-slate-500',
    bodyClass: 'text-slate-700',
  },
  {
    eyebrow: 'Loep Behoud Baseline',
    title: 'De eerste meetvorm voor actieve medewerkers',
    body: 'Een eenmalige Loep Behoud om te zien waar behoud op groepsniveau onder druk staat, welke werkfactoren prioriteit vragen en hoe bevlogenheid, stay-intent en vertrekintentie zich verhouden.',
    bullets: [
      'Actieve medewerkers in plaats van ex-medewerkers',
      'Groepsinzichten, geen brede MTO en geen individuele signalen naar management',
      'Sterk als startpunt voor gerichte opvolging en herhaalmeting',
    ],
    shellClass: 'border-emerald-200 bg-emerald-50',
    eyebrowClass: 'text-emerald-700',
    bodyClass: 'text-slate-700',
  },
  {
    eyebrow: 'Loep Behoud ritmeroute',
    title: 'De vaste vervolgvorm na een baseline',
    body: 'Herhaalmeting per kwartaal of halfjaar om te zien of het retentiesignaal, stay-intent, bevlogenheid en prioritaire werkfactoren verbeteren. Dit is de buyer-facing vervolgvorm nadat de eerste baseline en opvolging staan.',
    bullets: [
      'Compacter vervolg op een baseline',
      'Geschikt om effect van acties zichtbaar te maken in dezelfde signaallogica',
      'Publieke vervolgvorm na baseline, niet als parallel eerste pakket',
    ],
    shellClass: 'border-amber-200 bg-amber-50',
    eyebrowClass: 'text-amber-700',
    bodyClass: 'text-slate-700',
  },
] as const

export const pricingLifecycleLadder = [
  {
    route: 'Loep Vertrek',
    firstSale: 'Loep Vertrek Baseline als standaard eerste koop',
    nextStep: 'Loep Vertrek ritmeroute alleen als quote-only vervolgroute bij voldoende volume, proces en eigenaar.',
    expansion: 'Loep Behoud Baseline wordt logisch zodra dezelfde thema\'s eerder in de actieve populatie moeten worden gesignaleerd.',
  },
  {
    route: 'Loep Behoud',
    firstSale: 'Loep Behoud Baseline alleen wanneer de actieve behoudsvraag nu het echte startpunt is.',
    nextStep: 'Loep Behoud ritmeroute blijft de vaste buyer-facing vervolgvorm na baseline en eerste managementwaarde.',
    expansion: 'Loep Vertrek Baseline wordt pas logisch als retrospectieve vertrekduiding alsnog nodig blijkt.',
  },
] as const

export const pricingFaqs = [
  [
    'Wanneer kies je voor Loep Culture Assessment?',
    'Als de hoofdvraag breed organisatiebreed is: cultuur, engagement, werkbeleving, vertrouwen, leiderschap en samenwerking. Dan past een jaarlijkse Loep Culture Assessment baseline beter dan Loep Behoud of Loep Vertrek.',
  ],
  [
    'Waarom is Loep Behoud niet goedkoper dan Loep Vertrek?',
    'Omdat Loep Behoud geen lichtere algemene survey of MTO-light is. Het product vraagt juist scherpere privacykaders, actieve-medewerkersduiding en een eigen managementverhaal.',
  ],
  [
    'Waarom starten jullie niet met een gratis pilot?',
    'Omdat Loep bedoeld is als serieus eerste traject met duidelijke scope, deliverables en opvolging. Een betaald baseline-traject test echte urgentie, geeft scherpere samenwerking en voorkomt vrijblijvende validatie zonder besluitvorming.',
  ],
  [
    'Is Loep Behoud een MTO-vervanger?',
    'Nee. Het product is smaller en scherper: het richt zich op vroegsignalering op behoud via retentiesignaal, stay-intent, vertrekintentie en beinvloedbare werkfactoren.',
  ],
  [
    'Wanneer wordt Loep Vertrek ritmeroute logisch?',
    'Meestal pas na een Loep Vertrek Baseline of wanneer uitstroom al structureel met voldoende volume wordt gevolgd. Daarom houden we Loep Vertrek ritmeroute bewust als vervolgroute op aanvraag.',
  ],
  [
    'Hoe verhouden Loep Behoud ritmeroute en compacte vervolgmeting zich tot elkaar?',
    'Loep Behoud ritmeroute is de vaste buyer-facing vervolgvorm na baseline. Een compacte retentie vervolgmeting is daarbinnen een lichtere vervolgcomponent, geen parallel eerste pakket.',
  ],
  [
    'Wanneer kies je voor de combinatieroute?',
    'Als je zowel achteraf wilt begrijpen waarom mensen gingen als eerder wilt zien waar behoud nu onder druk staat, en beide managementvragen echt bestaan.',
  ],
  [
    'Wat ziet management wel en niet?',
    'Management ziet groeps- en segmentinzichten. Bij Loep Behoud tonen we geen individuele signalen, geen vertrekintentie op persoonsniveau, geen performance-oordelen en geen persoonsgerichte actieroutes.',
  ],
  [
    'Hoe vaak herhaal je Loep Behoud?',
    'Voor v1 is een baseline het logische startpunt. Daarna is een ritme per kwartaal of halfjaar het meest logisch als je effect van acties wilt volgen.',
  ],
  [
    'Beloof je hiermee lager verloop?',
    'Nee. Loep verkoopt geen garantie op lager verloop, maar scherpere duiding, betere prioritering en een sterkere basis voor managementbeslissingen op groepsniveau.',
  ],
] as const

export const faqs = [
  [
    'Wat is het verschil tussen Loep Vertrek en Loep Behoud?',
    'Loep Vertrek helpt vertrek achteraf duiden op basis van terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie. Loep Behoud helpt eerder zien waar behoud op groepsniveau onder druk staat bij actieve medewerkers.',
  ],
  [
    'Is Loep Behoud gewoon een MTO?',
    'Nee. Een MTO meet alles een beetje en levert een dik rapport op. Loep Behoud is smal en scherp: het laat zien waar het wringt bij de mensen die je wilt houden, wat ze daar zelf over zeggen, en waar je begint. Per afdeling, nooit per persoon.',
  ],
  [
    'Ziet management individuele retention-scores?',
    'Nee. Loep Behoud is bedoeld voor groeps- en segmentinzichten, niet voor beoordeling, performance-sturing of voorspelling op persoonsniveau.',
  ],
  [
    'Is Loep Behoud een gevalideerde vertrekvoorspeller?',
    'Nee. Voor v1 positioneren we Loep Behoud als SDT-gebaseerde managementscan voor vroegsignalering op behoud, verificatie en prioritering: inhoudelijk plausibel en testmatig beschermd, maar niet als wetenschappelijk gevalideerde voorspeller van vrijwillig vertrek.',
  ],
  [
    'Hoe vaak herhaal je Loep Behoud?',
    'Voor v1 is een baseline logisch als startpunt. Daarna kun je periodiek herhalen, bijvoorbeeld per kwartaal of halfjaar, als je gericht wilt volgen of acties effect hebben.',
  ],
  [
    'Wanneer is Loep Start de juiste route?',
    'Als de vraag gaat over hoe nieuwe medewerkers de eerste 90 dagen landen in rol, leiding en team. Loep zet de meting klaar en levert een rapport op groepsniveau, met een gespreksleidraad voor het gesprek met je MT.',
  ],
  [
    'Is Loep een instrument of een dienst?',
    'Een meting en een rapport. Loep zet de meting klaar en levert het rapport; jij verstuurt de uitnodiging, volgt de respons in je eigen omgeving en leidt het gesprek met je MT, met het rapport als leidraad. Geen licentie, geen platform dat je moet inrichten.',
  ],
  // Het antwoord komt uit lib/pricing.ts, zodat de FAQ-JSON-LD nooit een ander
  // bedrag noemt dan /producten#tarieven.
  ['Wat kost een scan van Loep?', pricingFaqAnswer()],
] as const

export const marketingPagePurposes = {
  home: 'Product choice + premium proof + conversion',
  producten: 'Buyer-oriented overview of the two core routes and the combination path',
  aanpak: 'Process clarity and buying confidence',
  tarieven: 'Commercial packaging and price framing',
} as const

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}
