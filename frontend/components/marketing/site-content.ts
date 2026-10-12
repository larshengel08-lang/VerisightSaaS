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

export const faqs = [
  [
    'Wat is het verschil tussen Loep Vertrek en Loep Behoud?',
    'Loep Vertrek helpt vertrek achteraf duiden op basis van terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie. Loep Behoud helpt eerder zien waar behoud op groepsniveau onder druk staat bij actieve medewerkers.',
  ],
  [
    'Is Loep Behoud een MTO?',
    'Het is een alternatief voor het grote jaarlijkse MTO. Een groot MTO meet veel en eindigt vaak in een rapport waar niemand mee verder komt. Loep Behoud meet wat telt voor of mensen blijven, laat zien wat je mensen daar zelf over zeggen, en zegt waar je begint. Wil je je scores vergelijken met andere organisaties, dan past een groot MTO beter.',
  ],
  [
    'Ziet het management scores van losse medewerkers?',
    'Nee. Loep Behoud laat groepen en afdelingen zien, nooit één persoon. Het is niet bedoeld om mensen te beoordelen of om te voorspellen wie weggaat.',
  ],
  [
    'Is Loep Behoud een gevalideerde vertrekvoorspeller?',
    'Nee. Loep Behoud voorspelt niet wie er vertrekt. Het laat op groepsniveau zien waar behoud onder druk staat en wat je mensen daarover zeggen. De vragen bouwen op onderzoek naar wat mensen aan hun werk bindt, maar de scan is geen wetenschappelijk gevalideerde voorspeller van vertrek.',
  ],
  [
    'Hoe vaak herhaal je Loep Behoud?',
    'Begin met één meting. Wil je later zien of het beeld verschuift, dan herhaal je dezelfde meting als vervolgmeting, bijvoorbeeld na een half jaar.',
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
