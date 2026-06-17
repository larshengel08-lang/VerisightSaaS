import { buildContactHref } from '@/lib/contact-funnel'

export const marketingNavLinks = [
  { href: '/producten', label: 'Producten' },
  { href: '/tarieven', label: 'Tarieven' },
  { href: '/vertrouwen', label: 'Vertrouwen' },
] as const

export const marketingPrimaryCta = {
  href: buildContactHref({ routeInterest: 'exitscan', ctaSource: 'global_primary_cta' }),
  label: 'Bespreek je vraagstuk',
} as const

export const marketingSecondaryCta = {
  href: '/#scans',
  label: 'Bekijk welke scan past',
} as const

export const marketingFooterLinks = [
  { href: '/', label: 'Home' },
  { href: '/producten', label: 'Producten' },
  { href: '/producten/exitscan', label: 'Loep Vertrek' },
  { href: '/producten/retentiescan', label: 'Loep Behoud' },
  { href: '/producten/onboarding-30-60-90', label: 'Loep Start' },
  { href: '/tarieven', label: 'Tarieven' },
  { href: '/vertrouwen', label: 'Vertrouwen' },
] as const

export const marketingLegalLinks = [
  { href: '/vertrouwen', label: 'Trust en privacy' },
  { href: '/privacy', label: 'Privacybeleid' },
  { href: '/voorwaarden', label: 'Algemene voorwaarden' },
  { href: '/dpa', label: 'Verwerkersovereenkomst' },
  { href: '/login', label: 'Inloggen' },
] as const

export const homepageProductRoutes = [
  {
    name: 'Loep Vertrek',
    title: 'Breng scherp in beeld waarom medewerkers vertrekken',
    body: 'Terugkijkende analyse van vertrek op groepsniveau, met een eerste handoff voor opvolging en een heldere eerste route.',
    href: '/producten/exitscan',
    accent: 'border-[#E5E0D6] bg-[#F7F5F1]',
    chip: 'Kernroute',
  },
  {
    name: 'Loep Behoud',
    title: 'Zie waar behoud onder druk staat',
    body: 'Vroegsignalering op behoud op groeps- en segmentniveau, met retentiesignaal en een heldere eerste managementroute.',
    href: '/producten/retentiescan',
    accent: 'border-[#DCEFEA] bg-[#F7F5F1]',
    chip: 'Kernroute',
  },
  {
    name: 'Loep Start',
    title: 'Zie vroeg hoe nieuwe medewerkers landen',
    body: 'Wij meten vroeg hoe nieuwe medewerkers landen in rol, leiding en team. Helder groepsbeeld, begeleide bespreking inbegrepen.',
    href: '/producten/onboarding-30-60-90',
    accent: 'border-[#DCF0E8] bg-[#F7F5F1]',
    chip: 'Kernroute',
  },
] as const

// Keep the existing homepage module contract intact for builds that still
// import the older split names from main.
export const homepageCoreProductRoutes = homepageProductRoutes

export const homepageComparisonRows = [
  [
    'Je wilt begrijpen waarom mensen zijn gegaan',
    'Loep Vertrek',
    'Vertrekduiding, werkfactoren en bestuurlijke handoff in een eerste managementrapport',
  ],
  [
    'Je wilt eerder zien waar behoud onder druk staat',
    'Loep Behoud',
    'Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie op groepsniveau',
  ],
  [
    'Je wilt vroeg zien hoe nieuwe medewerkers landen',
    'Loep Start',
    'Vroege checkpoint-read op landing, rol en team. Begeleide bespreking inbegrepen.',
  ],
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
    href: '/tarieven',
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
  'Loep voert uit, je beheert geen tool',
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

export const trustSignalHighlights = [
  {
    title: 'Methodische duidelijkheid',
    body: 'Loep Vertrek en Loep Behoud worden helder uitgelegd als managementinstrumenten met duidelijke grenzen, niet als diagnose of black-box voorspeller.',
  },
  {
    title: 'Privacy op groepsniveau',
    body: 'De publieke trustlaag legt minimale n-grenzen, segmentonderdrukking en geanonimiseerde open tekst uit in gewone taal.',
  },
  {
    title: 'Output die klopt met de propositie',
    body: 'Dashboard, rapport en preview volgen dezelfde vaste leeslijn, zodat de site niet meer belooft dan het product werkelijk levert.',
  },
  {
    title: 'Manager-scope blijft bounded',
    body: 'HR kan managers per afdeling toewijzen. Zij krijgen toegang via dezelfde beveiligde inlog, maar zien alleen de opvolglaag en geen dashboard- of rapportinzichten.',
  },
  {
    title: 'Core proof blijft expliciet',
    body: 'Publiek bewijs blijft bewust gekoppeld aan Loep Vertrek en Loep Behoud. Vervolgroutes zijn formeel uitgewerkt, maar krijgen publiek vooral bewijs via productpagina en trustlaag.',
  },
  {
    title: 'Begeleide productvorm',
    body: 'Loep biedt een strakke productvorm met intake, uitvoering, rapportage en begeleide vervolgstappen, in plaats van losse vragenlijstsoftware of open adviestrajecten.',
  },
  {
    title: 'Publiek verifieerbare basis',
    body: 'Trusthub, privacybeleid, DPA, voorwaarden en publieke contactroutes verlagen first-time buyer twijfel zonder badges of theater.',
  },
] as const

export const trustVerificationCards = [
  {
    title: 'Wat je nu publiek kunt verifiëren',
    body: 'Loep laat publiek zien hoe productkeuze, privacy en rapportlezing zijn ingericht voordat je een gesprek plant.',
  },
  {
    title: 'Waar publieke voorbeeldoutput stopt',
    body: 'Loep Vertrek en Loep Behoud dragen de publieke voorbeeldrapporten. Andere routes worden publiek lichter toegelicht en niet als aparte samplebibliotheek uitgewerkt.',
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
    body: 'Een begeleide dienst: Loep voert de scan uit, levert een managementrapport met prioriteiten en begeleidt HR en management naar één eerste keuze. Geen platform om zelf te beheren.',
  },
  {
    title: 'Heeft elke route een publiek voorbeeldrapport?',
    body: 'Nee. Publieke voorbeeldoutput blijft bewust beperkt tot Loep Vertrek en Loep Behoud.',
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
    'Dashboard, managementsamenvatting, topfactoren en eerste vervolgrichting.',
    'Niet elke ruwe response, geen persoonsprofielen en geen verborgen black-box score',
  ],
  [
    'Privacygrens',
    'Minimale n-grenzen, segmentonderdrukking en geanonimiseerde open tekst',
    'Niet doen alsof kleine groepen of open tekst zonder terughoudendheid veilig te lezen zijn',
  ],
  [
    'Bewijsstatus',
    'Methodisch onderbouwd en begrensd in wat het wel en niet claimt.',
    'Niet verkopen als extern gevalideerd diagnostisch instrument of bewezen predictor',
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

export const outcomeCards = [
  [
    'Sneller kiezen welke vraag eerst telt',
    'Je voorkomt dat Loep Vertrek en Loep Behoud door elkaar gaan lopen: meestal start je met vertrekduiding en voeg je behoudsignalering pas toe wanneer die vraag echt op tafel ligt.',
  ],
  [
    'Beter intern doorvertellen',
    'De output helpt HR, sponsor, MT en directie sneller op een lijn komen over waar prioriteit, verdieping of eerste vervolgstap het meeste oplevert.',
  ],
  [
    'Proof die kooprust geeft',
    'Voorbeeldrapporten, pricing, trust en bounded manager-toegang werken samen als bewijs van de productvorm in plaats van als losse supportblokken.',
  ],
  [
    'Geen extra toolbeheer',
    'Loep begeleidt de uitvoering, zodat jouw team niet ook nog een nieuw instrument hoeft in te richten of te beheren.',
  ],
  [
    'Privacy by design',
    'Output blijft bedoeld voor groepsinzichten en managementduiding, met extra terughoudendheid bij actieve medewerkers en zonder individuele managementoutput in Loep Behoud.',
  ],
  [
    'Herhaalbaar zonder productverwarring',
    'Je kunt starten met een eerste baseline en daarna bewust kiezen welke scan, verdiepend spoor of vervolgritme het meest logisch is.',
  ],
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

export const included = [
  'Inrichting van de gekozen route',
  'Uitnodigingen en respondentflow waar relevant',
  'Dashboard en rapport in dezelfde leeslijn',
  'Samenvatting voor HR, MT of directie',
  'Begeleide managementbespreking van 60–90 minuten',
  'Privacy en interpretatie in gewone taal',
  'Compacte productvorm zonder extra inrichting of beheer',
] as const

export const approachSteps = [
  {
    title: '1. Intake',
    body: 'We bepalen samen welke scan past, voor welke doelgroep en op welke tijdlijn. Jij levert de input. Wij regelen de rest.',
  },
  {
    title: '2. Wij richten de scan in',
    body: 'Wij zetten de scan op en stellen uitnodigingen in. Geen toolbeheer voor je team.',
  },
  {
    title: '3. Je verstuurt de uitnodigingen',
    body: 'Je nodigt uit via je eigen kanaal: e-mail, Teams of HR-systeem. Wij bewaken de voortgang en geven aan waar bijsturing nodig is.',
  },
  {
    title: '4. Wij houden je op de hoogte',
    body: 'Zodra de respons opbouwt, ontvang je een update. Geen dashboard te bewaken, wij doen dat voor je.',
  },
  {
    title: '5. Je ontvangt het rapport',
    body: 'Zodra het beeld stabiel is, leveren wij een managementrapport: patronen, factoranalyse, prioriteiten en de eerste managementvraag.',
  },
  {
    title: '6. Managementbespreking',
    body: 'We bespreken de uitkomsten met HR en management in 60–90 minuten. Samen bepalen we wat aandacht vraagt en wat de eerste keuze is.',
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

export const customerLifecycleStages = [
  {
    title: '1. Eerste routekeuze',
    body: 'Meestal start je met Loep Vertrek Baseline om vertrek eerst bestuurlijk leesbaar te maken. Loep Behoud Baseline is de eerste route als de actieve behoudsvraag nu echt primair is.',
  },
  {
    title: '2. Betaald eerste traject',
    body: 'De eerste koop blijft een afgebakend baseline-traject met dashboard, managementrapport, bestuurlijke handoff en een eerste managementsessie.',
  },
  {
    title: '3. Eerste managementwaarde',
    body: 'Vanaf een bruikbare responsbasis vertalen dashboard en rapport de scan naar prioriteit nu en een eerste vervolgrichting. Daarna begeleiden we hoe een hercheckmoment en bounded follow-through expliciet worden afgesproken.',
  },
  {
    title: '4. Zelfde route herhalen of verdiepen',
    body: 'Pas na die eerste waarde wordt een vervolgvorm logisch: Loep Vertrek ritmeroute als begeleide vervolgroute, Loep Behoud ritmeroute als vaste herhaalvorm of segment deep dive als bewuste verdieping.',
  },
  {
    title: '5. Uitbreiden naar tweede product',
    body: 'Expansion volgt alleen wanneer de volgende managementvraag echt op tafel ligt: van Loep Vertrek naar Loep Behoud voor vroegsignalering op behoud, of omgekeerd voor terugkijkende vertrekduiding.',
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

export const pricingCards = [
  {
    eyebrow: 'Loep Vertrek Baseline',
    price: 'vanaf €4.500',
    description:
      'De standaard eerste instap voor organisaties die snel een betrouwbaar organisatiebeeld, duidelijke prioriteiten en een professioneel managementrapport over uitstroom willen dat ook in sponsor-, prioriteits- en budgetgesprekken overeind blijft.',
    bullets: [
      'Scan uitsturen en bewaken door Loep',
      'Managementrapport met factoranalyse en prioriteiten',
      'Begeleide managementbespreking (60–90 min)',
      'Eerste keuze en vervolgrichting vastgesteld',
    ],
  },
  {
    eyebrow: 'Loep Behoud Baseline',
    price: 'vanaf €4.500',
    description:
      'De standaard eerste instap voor organisaties die eerder willen zien waar behoud onder druk staat, met extra nadruk op privacy, groepsduiding en een gerichte managementscan in plaats van een brede MTO.',
    bullets: [
      'Scan uitsturen en bewaken door Loep',
      'Managementrapport met retentiesignaal en prioriteiten',
      'Begeleide managementbespreking (60–90 min)',
      'Geen individuele signalen, alleen groepsniveau',
    ],
  },
  {
    eyebrow: 'Loep Start Baseline',
    price: 'vanaf €4.500',
    description:
      'De gerichte eerste instap voor organisaties die vroeg willen zien hoe nieuwe medewerkers landen, met een groepsbeeld op de eerste 30, 60 en 90 dagen en een begeleide managementbespreking.',
    bullets: [
      'Scan uitsturen en bewaken door Loep',
      'Managementrapport met patronen en prioriteiten',
      'Begeleide managementbespreking (60–90 min)',
      'Eerste vervolgrichting vastgelegd',
    ],
  },
  {
    eyebrow: 'Loep Culture Assessment Baseline',
    price: 'op aanvraag',
    description:
      'De enterprise-instap voor organisaties die cultuur en engagement breed organisatiebreed willen begrijpen, met executive read, board attention points en een board-level baseline in plaats van een generieke survey of benchmark-first platform.',
    bullets: [
      'Executive culture read, Loep Culture Index en domeinbeeld',
      'Board-read als vast productonderdeel en governed drilldown waar toegestaan',
      'Board-read als vast onderdeel van de baseline',
    ],
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
    'Nee. Loep Behoud is smaller en scherper gepositioneerd: het is een compacte scan voor vroegsignalering op behoud op groeps- en segmentniveau rond retentiesignaal, stay-intent, vertrekintentie en beinvloedbare werkfactoren.',
  ],
  [
    'Wanneer kies je voor de combinatie?',
    'Als je zowel achteraf wilt begrijpen wat vertrek dreef als eerder wilt signaleren waar behoud nu aandacht vraagt.',
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
    'Als de vraag gaat over hoe nieuwe medewerkers de eerste 90 dagen landen in rol, leiding en team. Loep voert de checkpoint-read uit en levert een rapport met begeleide bespreking.',
  ],
  [
    'Is Loep een instrument of een dienst?',
    'Loep is een begeleide dienst. Wij voeren de scan uit, leveren het rapport en begeleiden de managementbespreking. Je hoeft niets zelf in te richten of te beheren.',
  ],
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
