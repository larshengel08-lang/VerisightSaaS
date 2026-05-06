import { buildContactHref } from '@/lib/contact-funnel'

export const marketingNavLinks = [
  { href: '/producten', label: 'Producten' },
  { href: '/aanpak', label: 'Aanpak' },
  { href: '/tarieven', label: 'Tarieven' },
  { href: '/vertrouwen', label: 'Vertrouwen' },
] as const

export const marketingPrimaryCta = {
  href: buildContactHref({ routeInterest: 'exitscan', ctaSource: 'global_primary_cta' }),
  label: 'Plan een kennismaking',
} as const

export const marketingSecondaryCta = {
  href: '/#suite',
  label: 'Bekijk de suite',
} as const

export const marketingFooterLinks = [
  { href: '/', label: 'Home' },
  { href: '/producten', label: 'Producten' },
  { href: '/producten/exitscan', label: 'ExitScan' },
  { href: '/producten/retentiescan', label: 'RetentieScan' },
  { href: '/aanpak', label: 'Aanpak' },
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
    name: 'ExitScan',
    title: 'Breng scherp in beeld waarom medewerkers vertrekken',
    body: 'Terugkijkende analyse van vertrek op groepsniveau, met een eerste handoff voor opvolging en een heldere eerste route.',
    href: '/producten/exitscan',
    accent: 'border-[#E5E0D6] bg-[#F7F5F1]',
    chip: 'Kernroute',
  },
  {
    name: 'RetentieScan',
    title: 'Zie waar behoud onder druk staat',
    body: 'Vroegsignalering op behoud op groeps- en segmentniveau, met retentiesignaal en een heldere eerste managementroute.',
    href: '/producten/retentiescan',
    accent: 'border-[#DCEFEA] bg-[#F7F5F1]',
    chip: 'Kernroute',
  },
] as const

// Keep the existing homepage module contract intact for builds that still
// import the older split names from main.
export const homepageCoreProductRoutes = homepageProductRoutes

export const homepageComparisonRows = [
  [
    'Je wilt begrijpen waarom mensen zijn gegaan',
    'ExitScan',
    'Vertrekduiding, werkfactoren en bestuurlijke handoff in een eerste managementrapport',
  ],
  [
    'Je wilt eerder zien waar behoud onder druk staat',
    'RetentieScan',
    'Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie op groepsniveau',
  ],
] as const

export const homepageProofSignals = [
  'Eén suite-login voor dashboard, rapport en Action Center',
  'HR kan managers per afdeling toewijzen zonder survey-inzichten open te zetten',
  'ExitScan als default route, RetentieScan als volwaardige eerste route bij expliciete behoudsvraag',
  'Groepsinzichten met expliciete claims- en privacygrenzen',
  'Publieke proof verschijnt pas na expliciete approval en provenance',
] as const

export const publicProofCards = [
  {
    title: 'Van signaal naar opvolging',
    body: 'Goedgekeurde proof laat zien hoe dashboard, rapport en Action Center samen worden gebruikt zonder brede workflowclaims.',
    approval: 'public_usable',
  },
  {
    title: 'Bounded manager-toegang',
    body: 'Proof blijft expliciet over manager-only Action Center toegang en zet geen surveyinzichten open in publieke claims.',
    approval: 'public_usable',
  },
] as const

export const homepageUtilityLinks = [
  {
    href: '/producten',
    title: 'Bekijk de productroutes',
    body: 'Zie snel wanneer ExitScan of RetentieScan logisch wordt.',
  },
  {
    href: '/aanpak',
    title: 'Bekijk de aanpak',
    body: 'Lees hoe de eerste stap compact doorloopt naar rapport, uitkomst en opvolging.',
  },
  {
    href: '/tarieven',
    title: 'Bekijk tarieven',
    body: 'Zie hoe de eerste stap en later vervolg commercieel zijn opgebouwd.',
  },
  {
    href: '/vertrouwen',
    title: 'Bekijk trust en privacy',
    body: 'Controleer publiek hoe privacy, rapportage en DPA zijn ingericht.',
  },
] as const

export const productOverviewComparisonRows = [
  [
    'ExitScan',
    'Vertrekduiding',
    'Welk vertrekbeeld keert terug en welke werkfactoren wegen daarin mee?',
    'Voor terugkijkende analyse op uitstroom',
  ],
  [
    'RetentieScan',
    'Vroegsignalering op behoud',
    'Waar staat behoud nu onder druk in de actieve populatie?',
    'Voor vroegsignalering en prioritering',
  ],
] as const

export const comparisonCards = [
  {
    title: 'Gerichte scan, geen brede vragenlijst',
    description:
      'Verisight is opgebouwd rondom een specifieke managementvraag — niet een generieke tool die achteraf betekenis moet krijgen.',
    outcome: 'U koopt een gerichte route, geen open instrument.',
  },
  {
    title: 'Output die u intern kunt gebruiken',
    description:
      'Dashboard, bestuurlijke read en factoranalyse zijn direct deelbaar met HR, MT en directie.',
    outcome: 'Geen losse datadump — een leesbaar rapport dat intern doorverteld kan worden.',
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
  'AVG-conform, primaire dataopslag in een EU-regio',
  'Geen koppeling aan individuen in rapportage.',
] as const

export const trustQuickLinks = [
  {
    href: '/vertrouwen',
    label: 'Methodiek en vertrouwelijkheid',
    body: 'Hoe Verisight is opgebouwd en wat u ervan kunt verwachten.',
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
    body: 'ExitScan en RetentieScan worden helder uitgelegd als managementinstrumenten met duidelijke grenzen, niet als diagnose of black-box voorspeller.',
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
    body: 'HR kan managers per afdeling toewijzen. Zij loggen in via dezelfde omgeving, maar zien alleen Action Center en geen dashboard- of rapportinzichten.',
  },
  {
    title: 'Core proof blijft expliciet',
    body: 'Publiek bewijs blijft bewust gekoppeld aan ExitScan en RetentieScan. Vervolgroutes zijn formeel uitgewerkt, maar krijgen publiek vooral bewijs via productpagina en trustlaag.',
  },
  {
    title: 'Begeleide productvorm',
    body: 'Verisight biedt een strakke productvorm met intake, uitvoering, rapportage en begeleide vervolgstappen, in plaats van losse surveysoftware of open consultancy.',
  },
  {
    title: 'Publiek verifieerbare basis',
    body: 'Trusthub, privacybeleid, DPA, voorwaarden en publieke contactroutes verlagen first-time buyer twijfel zonder badges of theater.',
  },
] as const

export const trustVerificationCards = [
  {
    title: 'Wat u nu publiek kunt verifiëren',
    body: 'Verisight laat publiek zien hoe privacy, rapportage en de eerste stap zijn ingericht voordat u een gesprek plant.',
  },
  {
    title: 'Waar publieke voorbeeldoutput stopt',
    body: 'Publieke voorbeeldrapporten blijven bewust beperkt tot ExitScan en RetentieScan. Andere routes lichten we publiek compacter toe.',
  },
  {
    title: 'Wat u in rapport en dashboard terugziet',
    body: 'Geaggregeerde inzichten, topfactoren, prioriteiten en een eerste richting voor vervolg.',
  },
  {
    title: 'Wat we bewust niet claimen',
    body: 'Geen individuele voorspellingen, geen persoonsgerichte beoordeling en geen claims die verder gaan dan de data dragen.',
  },
] as const

export const trustHubAnswerCards = [
  {
    title: 'Waar draait de data?',
    body: 'De primaire database draait in een EU-regio. Subverwerkers voor hosting en mail staan in privacybeleid en DPA benoemd.',
  },
  {
    title: 'Wat ziet u precies terug?',
    body: 'U ziet groeps- en segmentinzichten, geen individuele signalen of persoonsgerichte actieroutes.',
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
    title: 'Wat koopt u precies?',
    body: 'Geen losse tool, maar een duidelijke aanpak met dashboard, rapport en heldere grenzen in hoe u de uitkomsten gebruikt.',
  },
  {
    title: 'Heeft elke route een publiek voorbeeldrapport?',
    body: 'Nee. Publieke voorbeeldoutput blijft bewust beperkt tot ExitScan en RetentieScan.',
  },
] as const

export const trustReadingRows = [
  [
    'Gebruik',
    'Samenvatting, prioriteiten en gesprek op groepsniveau',
    'Niet als diagnose, individuele voorspelling of performance-oordeel',
  ],
  [
    'Wat u terugziet',
    'Dashboard, samenvatting, topfactoren en een eerste vervolgrichting.',
    'Niet elke ruwe response, geen persoonsprofielen en geen verborgen black-box score',
  ],
  [
    'Privacygrens',
    'Minimale n-grenzen, segmentonderdrukking en geanonimiseerde open tekst',
    'Niet doen alsof kleine groepen of open tekst zonder terughoudendheid veilig te lezen zijn',
  ],
  [
    'Wat de uitkomsten wel en niet zeggen',
    'Methodisch onderbouwd en begrensd in wat het wel en niet claimt.',
    'Niet verkopen als volledig diagnostisch instrument of bewezen voorspeller',
  ],
] as const

export const trustSupportCards = [
  {
    title: 'Trust en privacy',
    href: '/vertrouwen',
    body: 'Privacy, rapportage en hoe u de uitkomsten leest.',
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
    detail: 'Dashboard, rapport en Action Center blijven bereikbaar in dezelfde omgeving.',
  },
  {
    value: '2 modules',
    label: 'insights en follow-through',
    detail: 'HR en klant zien dashboard plus Action Center; managers kunnen bounded alleen de opvolglaag in.',
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
    'Je voorkomt dat ExitScan en RetentieScan door elkaar gaan lopen: meestal start je met vertrekduiding en voeg je behoudsignalering pas toe wanneer die vraag echt op tafel ligt.',
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
    'Verisight begeleidt de uitvoering, zodat jouw team niet ook nog een nieuwe surveytool hoeft in te richten of te beheren.',
  ],
  [
    'Privacy by design',
    'Output blijft bedoeld voor groepsinzichten en managementduiding, met extra terughoudendheid bij actieve medewerkers en zonder individuele managementoutput in RetentieScan.',
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
  'Intake en compacte eerste opzet',
  'Scan en respondentflow waar relevant',
  'Dashboard en rapport',
  'Bespreking van wat opvalt en wat eerst telt',
  'Privacy en interpretatie in gewone taal',
  'Optionele opvolging pas als een gekozen aandachtspunt daarom vraagt',
  'Geen extra toolbeheer voor uw team',
] as const

export const approachSteps = [
  {
    title: '1. Juiste eerste stap kiezen',
    body: 'We bepalen welke vraag nu het eerst geopend moet worden en kiezen daarop de meest logische eerste stap.',
  },
  {
    title: '2. Eerste meting uitvoeren',
    body: 'De route start normaal met een eerste meting die de gekozen vraag compact opent met intake, scan en respondentflow.',
  },
  {
    title: '3. Dashboard en rapport',
    body: 'Zodra de eerste meting staat, ziet u in dashboard en rapport wat opvalt, wat eerst telt en waar gesprek nodig is.',
  },
  {
    title: '4. Eerste bespreking en vervolgrichting',
    body: 'De eerste bespreking helpt bepalen welke vervolgrichting logisch is zonder de eerste stap zwaarder te maken.',
  },
  {
    title: '5. Action Center Start optioneel',
    body: 'Als een gekozen aandachtspunt concreet opgevolgd moet worden, voegen we Action Center Start toe voor een of enkele verantwoordelijken, zichtbare status en een vast terugkijkmoment.',
  },
  {
    title: '6. Later vervolg of herijking',
    body: 'Pas daarna worden reviewcadans, Live Start of een latere vervolgronde logisch als dezelfde vraag opnieuw gevolgd moet worden.',
  },
] as const

export const approachRoutes = [
  {
    eyebrow: 'ExitScan Baseline',
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
    eyebrow: 'ExitScan ritmeroute',
    title: 'Voor organisaties die uitstroom doorlopend willen volgen',
    body: 'Doorlopende ExitScan voor nieuwe vertrekkers. Past vooral als quote-only vervolg op een eerste baseline of wanneer uitstroom al structureel en met voldoende volume wordt gevolgd.',
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
    eyebrow: 'RetentieScan Baseline',
    title: 'De eerste meetvorm voor actieve medewerkers',
    body: 'Een eenmalige RetentieScan om te zien waar behoud op groepsniveau onder druk staat, welke werkfactoren prioriteit vragen en hoe bevlogenheid, stay-intent en vertrekintentie zich verhouden.',
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
    eyebrow: 'RetentieScan ritmeroute',
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
    body: 'De eerste stap begint met ExitScan Baseline, RetentieScan Baseline of Onboarding 30-60-90 Baseline, afhankelijk van welke managementvraag nu het eerst geopend moet worden.',
  },
  {
    title: '2. Baseline als vaste eerste stap',
    body: 'De eerste stap blijft een afgebakende baseline met intake, scan, dashboard en managementrapport als eerste managementread.',
  },
  {
    title: '3. Review opent de vervolgrichting',
    body: 'Review hoort inhoudelijk bij de baseline en helpt bepalen wat eerst telt, welke eerste vervolgrichting logisch is en of extra borging nodig wordt.',
  },
  {
    title: '4. Action Center Start optioneel',
    body: 'Action Center Start wordt pas toegevoegd als een gekozen opvolgscope zichtbaar toegewezen en gevolgd moet worden, niet als standaard onderdeel van elke baseline.',
  },
  {
    title: '5. Ritme of tweede route later',
    body: 'Pas daarna worden Live Start, Reviewcadans, Pulse, Leadership Scan of een tweede productroute logisch als dezelfde of een volgende vraag echt blijft spelen.',
  },
] as const

export const pricingLifecycleLadder = [
  {
    route: 'ExitScan',
    firstSale: 'ExitScan Baseline blijft de standaard eerste stap wanneer vertrek achteraf eerst scherp gemaakt moet worden.',
    nextStep: 'Action Center Start is de eerste publieke uitbreiding wanneer een gekozen opvolgscope zichtbaar geborgd moet worden.',
    expansion: 'ExitScan Live Start of een tweede route wordt pas logisch nadat de baseline en review de volgende vraag echt hebben geopend.',
  },
  {
    route: 'RetentieScan',
    firstSale: 'RetentieScan Baseline is de eerste stap wanneer vroeg behoudssignaal nu de primaire vraag is.',
    nextStep: 'Action Center Start blijft ook hier de eerste publieke uitbreiding zodra een gekozen opvolgscope gevolgd moet worden.',
    expansion: 'Reviewcadans, Pulse of ExitScan Live Start komen pas in beeld nadat baseline en review voldoende richting hebben gegeven.',
  },
] as const

export const expansionTriggerCards = [
  {
    title: 'Eerste managementwaarde is bewezen',
    body: 'Expansion hoort pas op tafel nadat de eerste route al heeft geleid tot een bruikbare managementread in plaats van alleen respons of nieuwsgierigheid.',
  },
  {
    title: 'Er ligt een eerste vervolgrichting',
    body: 'Een vervolgstap voelt geloofwaardig wanneer prioriteit en eerste vervolgrichting al expliciet zijn benoemd in de eerste managementsessie.',
  },
  {
    title: 'Er is een hercheckmoment afgesproken',
    body: 'Repeat en expansion worden verkoopbaar zodra duidelijk is wanneer de organisatie terugkijkt op voortgang, effect of nieuwe signalen.',
  },
  {
    title: 'De volgende route vult een echte vraag aan',
    body: 'Combinatie of productdoorstroom is alleen logisch als de huidige route de volgende managementvraag niet volledig afdekt, zodat expansion niet voelt als losse upsell.',
  },
] as const

export const pricingCards = [
  {
    eyebrow: 'ExitScan Baseline',
    price: 'vanaf EUR 4.500',
    description:
      'De standaard eerste stap voor organisaties die vertrek eerst scherp willen begrijpen en daarvoor direct een helder rapport nodig hebben.',
    bullets: [
      'Intake',
      'Scan',
      'Dashboard',
      'Rapport',
    ],
  },
  {
    eyebrow: 'RetentieScan Baseline',
    price: 'vanaf EUR 4.500',
    description:
      'De eerste stap voor organisaties die eerder willen zien waar behoud onder druk staat, zonder individuele signalen naar management.',
    bullets: [
      'Intake',
      'Scan',
      'Dashboard',
      'Rapport',
    ],
  },
  {
    eyebrow: 'Onboarding 30-60-90 Baseline',
    price: 'vanaf EUR 4.500',
    description:
      'Een gerichtere eerste stap voor organisaties die juist in de eerste maanden van nieuwe medewerkers sneller helderheid nodig hebben.',
    bullets: [
      'Intake',
      'Scan',
      'Dashboard',
      'Rapport',
    ],
  },
] as const

export const pricingFollowOnRoutes = [
  {
    title: 'ExitScan Live Start',
    price: 'op aanvraag',
    fit: 'Later vervolg na baseline',
    description:
      'Voor organisaties die uitstroom niet alleen eenmalig willen duiden, maar daarna doorlopend willen blijven volgen zodra de eerste route al staat.',
    bullets: [
      'Geen extra startroute naast de baseline',
      'Pas logisch als proces en eigenaar al staan',
      'Blijft een latere vorm en geen losse instap',
    ],
  },
  {
    title: 'Reviewcadans',
    price: 'op aanvraag',
    fit: 'Later vervolg na baseline',
    description:
      'Voor organisaties die de gekozen route later in een vast terugkijkritme willen herijken nadat de eerste route en opvolgrichting al staan.',
    bullets: [
      'Geen hoofdkaart boven de fold',
      'Past na eerste managementwaarde',
      'Maakt herijking logisch zonder de eerste stap te verzwaren',
    ],
  },
  {
    title: 'Pulse',
    price: 'op aanvraag',
    fit: 'Bounded vervolgroute',
    description:
      'Compacte vervolgronde wanneer een eerste baseline al staat en u een beperkte hercheck wilt doen op dezelfde vraag.',
    bullets: [
      'Niet bedoeld als nieuwe eerste stap',
      'Kleinere vervolgroute na een bestaand beeld',
      'Alleen logisch als de eerste route al richting gaf',
    ],
  },
  {
    title: 'Leadership Scan',
    price: 'op aanvraag',
    fit: 'Bounded vervolgroute',
    description:
      'Gerichte vervolgronde als een bestaand people-signaal extra duiding vraagt, niet als brede leiderschapsinstap.',
    bullets: [
      'Komt pas na een bestaand signaal in beeld',
      'Blijft op groepsniveau en beperkt in scope',
      'Geen eerste stap en geen brede leadership-suite',
    ],
  },
  {
    title: 'Combinatie',
    price: 'op aanvraag',
    fit: 'Portfolioroute',
    description:
      'Pas logisch wanneer vertrekduiding en behoudsvraag allebei bestuurlijk spelen en de eerste route al scherp staat.',
    bullets: [
      'Geen derde kernproduct',
      'Pas na een eerste route logisch',
      'Verbindt twee vragen pas wanneer beide echt spelen',
    ],
  },
] as const

export const retentionPackages = [
  {
    title: 'Baseline',
    fit: 'Voor een eerste groepsbeeld',
    body: 'Een compacte retentie-baseline voor organisaties die snel willen zien waar behoud aandacht vraagt.',
    bullets: ['Eenmalige scan', 'Dashboard en managementrapport', 'Topfactoren en focusvragen'],
  },
  {
    title: 'Baseline + Action Center Start',
    fit: 'Voor zichtbare eerste opvolging',
    body: 'Voor organisaties die na de eerste baseline ook een gekozen opvolgscope zichtbaar willen toewijzen en volgen.',
    bullets: ['Alles uit Baseline', 'Gekozen opvolgscope', 'Status en reviewmoment zichtbaar'],
  },
  {
    title: 'Reviewcadans',
    fit: 'Voor structureel herijken',
    body: 'Voor organisaties die retentie als terugkerend stuurthema willen benaderen nadat baseline, review en eerste opvolging al staan.',
    bullets: ['Herhaalmeting en trendduiding', 'Betere bespreking van effect en verschuiving', 'Latere vervolgvorm na de eerste baseline'],
  },
] as const

export const pricingChoiceGuide = [
  [
    'ExitScan Baseline',
    'De standaard eerste stap wanneer vertrek achteraf eerst scherp gemaakt moet worden.',
  ],
  [
    'RetentieScan Baseline',
    'De eerste stap wanneer vroeg behoudssignaal nu de echte managementvraag is.',
  ],
  [
    'Onboarding 30-60-90 Baseline',
    'Een gerichte startroute voor organisaties waar de eerste maanden van nieuwe medewerkers nu de belangrijkste vraag vormen.',
  ],
] as const

export const productPrimaryRouteCards = [
  {
    title: 'ExitScan',
    eyebrow: 'ExitScan Baseline',
    body:
      'Voor organisaties die scherp willen begrijpen waarom medewerkers vertrekken, welke patronen terugkomen en waar actie het eerst telt.',
    bullets: [
      'Vertrek is al zichtbaar of terugkerend',
      'U wilt begrijpen welke patronen terugkomen',
      'U wilt een eerste managementbeeld van vertrekredenen en drivers',
      'U zoekt een compacte eerste managementread',
    ],
    href: '/producten/exitscan',
    accent: '#C96A4B',
    accentSoft: '#FAF1EC',
  },
  {
    title: 'RetentieScan',
    eyebrow: 'RetentieScan Baseline',
    body:
      'Voor organisaties die eerder willen zien waar behoud onder druk komt te staan, voordat verloop zichtbaar oploopt en het gesprek te laat begint.',
    bullets: [
      'U wilt eerder signaleren voordat verloop oploopt',
      'U vermoedt behoudsdruk maar ziet nog geen volledig vertrekbeeld',
      'U wilt groepsniveau vroegsignalering in plaats van terugblik',
      'U wilt eerder zien waar gesprek en verificatie nodig zijn',
    ],
    href: '/producten/retentiescan',
    accent: '#C96A4B',
    accentSoft: '#FAF1EC',
  },
] as const

export const productSecondaryFirstBuyRoute = {
  title: 'Onboarding 30-60-90',
  eyebrow: 'Gerichte startroute',
  body:
    'Onboarding 30-60-90 Baseline is de kleinere, gerichte startroute wanneer juist de eerste maanden van nieuwe medewerkers nu de belangrijkste managementvraag vormen.',
  bullets: [
    'Geen derde kernroute naast ExitScan en RetentieScan',
    'Wel een volwaardige baseline als onboarding nu de eerste vraag is',
    'Gericht op vroege landing, eerste frictie en eerste uitval',
  ],
  href: '/producten/onboarding-30-60-90',
} as const

export const actionCenterStartPositioning = {
  eyebrow: 'Optionele uitbreiding',
  title: 'Voeg Action Center Start pas toe als opvolging zichtbaar geborgd moet worden.',
  body:
    'Action Center Start is geen derde kernproduct, maar een optionele opvolglaag na of naast een baseline. U gebruikt het voor een gekozen opvolgscope, een of enkele owners, zichtbare status en een reviewmoment.',
  bullets: [
    'Begrensd tot een gekozen opvolgscope',
    'Voor een of enkele owners of managers',
    'Geen brede workflowlaag of taakmanagementsysteem',
  ],
} as const

export const productFollowOnRouteRows = [
  ['ExitScan Live Start', 'Later vervolg wanneer dezelfde uitstroomvraag structureel gevolgd moet worden.'],
  ['Reviewcadans', 'Later vervolg wanneer dezelfde route in een vast reviewritme opnieuw herijkt moet worden.'],
  ['Pulse', 'Compacte vervolgronde na een eerste baseline.'],
  ['Leadership Scan', 'Gerichte vervolgronde als managementcontext extra duiding vraagt.'],
  ['Combinatie', 'Pas logisch wanneer vertrekduiding en behoudsvraag allebei bestuurlijk spelen.'],
] as const

export const pricingAddOns = [
  [
    'Action Center Start',
    'vanaf EUR 1.250',
    'Optionele uitbreiding voor een gekozen opvolgscope, een of enkele owners, beperkte actieopvolging, zichtbare status en een reviewmoment.',
  ],
] as const

export const pricingFaqs = [
  [
    'Waarom hebben de baseline-routes hetzelfde publieke prijsanker?',
    'Omdat de eerste stap steeds draait om een compacte baseline met intake, scan, dashboard en managementrapport. De route verschilt, maar de eerste managementread blijft het publieke vertrekpunt.',
  ],
  [
    'Waarom starten jullie niet met een gratis pilot?',
    'Omdat Verisight bedoeld is als serieuze eerste stap met een duidelijke baseline, een eerste managementread en een concrete vervolgrichting. Een betaald eerste traject voorkomt vrijblijvende validatie zonder besluitvorming.',
  ],
  [
    'Is Action Center Start standaard onderdeel van elke baseline?',
    'Nee. Action Center Start is een optionele uitbreiding en komt pas in beeld als een gekozen opvolgscope zichtbaar geborgd moet worden.',
  ],
  [
    'Wanneer wordt ExitScan Live Start logisch?',
    'Pas nadat een eerste baseline en review al richting hebben gegeven, of wanneer uitstroom al structureel gevolgd moet worden in een later vervolg.',
  ],
  [
    'Waarom staat Reviewcadans niet tussen de hoofdkaarten?',
    'Omdat reviewcadans een latere vervolgvorm is. De eerste stap blijft een baseline; ritme komt pas daarna in beeld als dezelfde vraag opnieuw gevolgd moet worden.',
  ],
  [
    'Wanneer kies je voor Onboarding 30-60-90 Baseline?',
    'Wanneer niet vertrek of behoud, maar juist de eerste maanden van nieuwe medewerkers de eerste managementvraag vormen. Dan blijft onboarding een kleinere, gerichte startroute.',
  ],
  [
    'Wat ziet management wel en niet?',
    'Management ziet groepsinzichten, dashboard en managementrapport. Bij RetentieScan tonen we geen individuele signalen, geen performance-oordelen en geen persoonsgerichte actieroutes.',
  ],
  [
    'Wanneer worden Pulse en Leadership Scan logisch?',
    'Pas nadat een eerste baseline al staat en een volgende, begrensde vraag echt speelt. Het zijn latere vervolgroutes, geen eerste stap.',
  ],
  [
    'Beloof je hiermee lager verloop?',
    'Nee. Verisight verkoopt geen garantie op lager verloop, maar scherpere duiding, betere prioritering en een sterkere basis voor managementbeslissingen op groepsniveau.',
  ],
] as const

export const faqs = [
  [
    'Wat is het verschil tussen ExitScan en RetentieScan?',
    'ExitScan helpt vertrek achteraf duiden op basis van terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie. RetentieScan helpt eerder zien waar behoud op groepsniveau onder druk staat bij actieve medewerkers.',
  ],
  [
    'Is RetentieScan gewoon een MTO?',
    'Nee. RetentieScan is smaller en scherper gepositioneerd: het is een compacte scan voor vroegsignalering op behoud op groeps- en segmentniveau rond retentiesignaal, stay-intent, vertrekintentie en beinvloedbare werkfactoren.',
  ],
  [
    'Wanneer kies je voor de combinatie?',
    'Als je zowel achteraf wilt begrijpen wat vertrek dreef als eerder wilt signaleren waar behoud nu aandacht vraagt.',
  ],
  [
    'Ziet management individuele retention-scores?',
    'Nee. RetentieScan is bedoeld voor groeps- en segmentinzichten, niet voor beoordeling, performance-sturing of voorspelling op persoonsniveau.',
  ],
  [
    'Is RetentieScan een gevalideerde vertrekvoorspeller?',
    'Nee. Voor v1 positioneren we RetentieScan als SDT-gebaseerde managementscan voor vroegsignalering op behoud, verificatie en prioritering: inhoudelijk plausibel en testmatig beschermd, maar niet als wetenschappelijk gevalideerde voorspeller van vrijwillig vertrek.',
  ],
  [
    'Hoe vaak herhaal je RetentieScan?',
    'Voor v1 is een baseline logisch als startpunt. Daarna kun je periodiek herhalen, bijvoorbeeld per kwartaal of halfjaar, als je gericht wilt volgen of acties effect hebben.',
  ],
  [
    'Is Verisight een tool of een dienst?',
    'Het is een begeleide dienst met software. Je krijgt dashboard en rapportage, zonder self-service implementatie of losse consultancy zonder productvorm.',
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

