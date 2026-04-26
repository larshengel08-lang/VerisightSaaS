import { buildContactHref } from '@/lib/contact-funnel'

export const marketingNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/#suite', label: 'Suite' },
  { href: '/producten', label: 'Producten' },
  { href: '/aanpak', label: 'Aanpak' },
  { href: '/tarieven', label: 'Tarieven' },
  { href: '/vertrouwen', label: 'Vertrouwen' },
] as const

export const marketingPrimaryCta = {
  href: buildContactHref({ routeInterest: 'exitscan', ctaSource: 'global_primary_cta' }),
  label: 'Plan suite-demo',
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
  { href: '/producten/combinatie', label: 'Combinatie' },
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
    title: 'Breng vertrekduiding scherp in beeld',
    body: 'Terugkijkende vertrekduiding op groepsniveau, met bestuurlijke handoff en een heldere eerste managementroute.',
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
  {
    name: 'Combinatie',
    title: 'Verbind vertrek- en retentieanalyse',
    body: 'Voor organisaties die beide managementvragen hebben en bewust willen combineren nadat de eerste helder staat.',
    href: '/producten/combinatie',
    accent: 'border-[#E5E0D6] bg-[#F7F5F1]',
    chip: 'Portfolioroute',
  },
] as const

// Keep the existing homepage module contract intact for builds that still
// import the older split names from main.
export const homepageCoreProductRoutes = homepageProductRoutes.filter((route) => route.name !== 'Combinatie')
export const homepagePortfolioRoute = {
  name: 'Combinatie',
  label: 'Portfolioroute op aanvraag',
  title: 'Beide vragen bewust in dezelfde managementlijn',
  body: 'Voor organisaties die vertrekduiding en behoudsignalering bewust willen verbinden, nadat de eerste route helder staat.',
  href: '/producten/combinatie',
} as const

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
  [
    'Je wilt beide vragen bewust naast elkaar organiseren',
    'Combinatie',
    'Twee gerichte producten in een gedeelde managementlijn',
  ],
] as const

export const homepageProofSignals = [
  'Eén suite-login voor dashboard, rapport en Action Center',
  'HR kan managers per afdeling toewijzen zonder survey-inzichten open te zetten',
  'ExitScan als default route, RetentieScan als volwaardige eerste route bij expliciete behoudsvraag',
  'Groepsinzichten met expliciete claims- en privacygrenzen',
] as const

export const homepageUtilityLinks = [
  {
    href: '/producten',
    title: 'Bekijk de productroutes',
    body: 'Zie snel wanneer ExitScan, RetentieScan of de combinatie logisch wordt.',
  },
  {
    href: '/aanpak',
    title: 'Bekijk de aanpak',
    body: 'Lees hoe intake, uitvoering, rapportage en een begeleide vervolgrichting in een productvorm samenkomen.',
  },
  {
    href: '/tarieven',
    title: 'Bekijk de prijsankers',
    body: 'Zie hoe eerste trajecten, vervolgvormen en combinatie commercieel zijn opgebouwd.',
  },
  {
    href: '/vertrouwen',
    title: 'Bekijk trust en privacy',
    body: 'Controleer publiek hoe methodiek, privacy, rapportlezing en DPA zijn ingericht.',
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
  [
    'Combinatie',
    'Portfolio-aanpak',
    'Hoe verbinden we vertrekduiding en vroegsignalering in een managementlijn?',
    'Voor organisaties met beide vraagstukken',
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
  'Nederlandse dienst met begeleide productvorm en publieke trustlaag',
  'Vertrouwelijke verwerking — geen koppeling aan individuen in rapportage',
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
    body: 'ExitScan en RetentieScan worden buyer-facing uitgelegd als managementinstrumenten met heldere claimsgrenzen, niet als diagnose of black-box voorspeller.',
  },
  {
    title: 'Privacy op groepsniveau',
    body: 'De publieke trustlaag benoemt minimale n-grenzen, segmentonderdrukking en geanonimiseerde open tekst in gewone taal.',
  },
  {
    title: 'Output die klopt met de propositie',
    body: 'Dashboard, rapport en preview volgen dezelfde bestuurlijke leeslijn, zodat de site niet rijker verkoopt dan het product werkelijk levert.',
  },
  {
    title: 'Manager-scope blijft bounded',
    body: 'HR kan managers per afdeling toewijzen. Zij loggen in via dezelfde suite, maar zien alleen Action Center en geen dashboard- of rapportinzichten.',
  },
  {
    title: 'Core proof blijft expliciet',
    body: 'Publieke deliverable-proof blijft bewust anchored op ExitScan en RetentieScan. Bounded follow-on routes zijn wel formeel, maar krijgen publiek vooral bewijs via productpagina en trustlaag.',
  },
  {
    title: 'Begeleide productvorm',
    body: 'Verisight verkoopt een strakke productvorm met intake, uitvoering, rapportage en begeleide vervolgstappen in plaats van losse surveysoftware of open consultancy.',
  },
  {
    title: 'Publiek verifieerbare basis',
    body: 'Trusthub, privacybeleid, DPA, voorwaarden en publieke contactroutes verlagen first-time buyer twijfel zonder badges of theater.',
  },
] as const

export const trustVerificationCards = [
  {
    title: 'Wat je nu publiek kunt verifieren',
    body: 'Verisight laat publiek zien hoe productkeuze, privacy, rapportlezing en begeleide delivery zijn ingericht voordat je een demo of gesprek plant.',
  },
  {
    title: 'Waar sample-proof bewust stopt',
    body: 'ExitScan en RetentieScan dragen de publieke voorbeeldrapporten. Onboarding blijft een bounded peer en Pulse plus Leadership Scan blijven bounded vervolgroutes met formele output, maar zonder aparte publieke samplebibliotheek.',
  },
  {
    title: 'Wat management wel ziet',
    body: 'Geaggregeerde bestuurlijke read, bestuurlijke handoff, topfactoren, hypotheses, prioriteiten en vervolgrichtingen in een vaste executive leeslijn.',
  },
  {
    title: 'Hoe manager-toegang werkt',
    body: 'HR kan managers per afdeling toewijzen. Zij loggen in via dezelfde suite, maar zien alleen Action Center en geen dashboard- of rapportinzichten.',
  },
  {
    title: 'Wat we bewust niet claimen',
    body: 'Geen individuele voorspelling, geen persoonsgerichte beoordeling, geen brede people-suite en geen bewijsclaims die niet door de repo-basis worden gedragen.',
  },
] as const

export const trustHubAnswerCards = [
  {
    title: 'Waar draait de data?',
    body: 'De primaire database draait in een EU-regio. Voor apphosting en mailverwerking gebruikt Verisight daarnaast publieke subverwerkers die in privacybeleid en DPA staan genoemd.',
  },
  {
    title: 'Wat ziet management precies?',
    body: 'Management ziet groeps- en segmentinzichten, geen individuele signalen. Bij RetentieScan blijven individuele vertrekintentie en persoonsgerichte actieroutes nadrukkelijk buiten beeld.',
  },
  {
    title: 'Hoe voorkom je schijnprecisie?',
    body: 'Detailweergave start pas vanaf minimale aantallen, segmenten blijven verborgen bij te kleine groepen en open tekst wordt geanonimiseerd waar dat nodig is.',
  },
  {
    title: 'Hoe lees je de output?',
    body: 'Verisight gebruikt signalen, hypotheses en bestuurlijke reads als gespreksinput. De output ondersteunt verificatie en prioritering, niet causaliteitsclaims of harde diagnoses.',
  },
  {
    title: 'Hoe werkt manager-toegang?',
    body: 'HR kan managers per afdeling toewijzen. Zij loggen in via dezelfde suite, maar zien alleen Action Center en geen dashboard- of rapportinzichten.',
  },
  {
    title: 'Welke juridische basis is publiek beschikbaar?',
    body: 'Er zijn publieke pagina\'s voor trust en privacy, privacybeleid, algemene voorwaarden en een standaard DPA-template voor klantorganisaties.',
  },
  {
    title: 'Wat voor productvorm koop je?',
    body: 'Geen self-serve surveytool en geen open consultancytraject, maar een begeleide productvorm met dashboard, rapportage, uitleg en productspecifieke trustgrenzen.',
  },
  {
    title: 'Heeft elke route een publiek voorbeeldrapport?',
    body: 'Nee. Publieke deliverable-proof blijft bewust core-first op ExitScan en RetentieScan. Bounded follow-on routes zijn buyer-facing volwassen, maar worden publiek vooral via productpagina, trustlaag en formele routegrenzen uitgelegd.',
  },
] as const

export const trustReadingRows = [
  [
    'Intended use',
    'Managementduiding, prioritering en gesprek op groepsniveau',
    'Niet als diagnose, individuele voorspelling of performance-oordeel',
  ],
  [
    'Wat management ziet',
    'Dashboard, bestuurlijke read, bestuurlijke handoff, topfactoren, hypotheses en vervolgstappen',
    'Niet elke ruwe response, geen persoonsprofielen en geen verborgen black-box score',
  ],
  [
    'Privacygrens',
    'Minimale n-grenzen, segmentonderdrukking en geanonimiseerde open tekst',
    'Niet doen alsof kleine groepen of open tekst zonder terughoudendheid veilig te lezen zijn',
  ],
  [
    'Bewijsstatus',
    'Methodisch onderbouwd, intern consistent en testmatig beschermd',
    'Niet verkopen als extern gevalideerd diagnostisch instrument of bewezen predictor',
  ],
] as const

export const trustSupportCards = [
  {
    title: 'Trust en privacy',
    href: '/vertrouwen',
    body: 'Publieke due-diligence laag over methodiek, privacy, rapportlezing en buyer reassurance.',
  },
  {
    title: 'Privacybeleid',
    href: '/privacy',
    body: 'Praktische uitleg over persoonsgegevens, subverwerkers, bewaartermijnen en rechten onder de AVG.',
  },
  {
    title: 'Verwerkersovereenkomst',
    href: '/dpa',
    body: 'Standaard DPA-template voor klantorganisaties die de formele verwerkersrol willen toetsen.',
  },
  {
    title: 'Algemene voorwaarden',
    href: '/voorwaarden',
    body: 'Publieke basis voor dienstvorm, beschikbaarheid, facturatie, rollen en aansprakelijkheid.',
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
  'Inrichting van de gekozen scan of meetronde',
  'Assisted onboarding van akkoord tot eerste managementread',
  'Uitnodigingen en herinneringen voor respondenten',
  'Dashboard met prioriteiten en managementduiding',
  'Zelfstandig leesbaar rapport voor HR, MT en directie',
  'Bestuurlijke handoff voor sponsor, directie of MT',
  'Privacy-, claims- en interpretatiekaders in gewone taal',
  'Begeleide productvorm in plaats van losse surveysoftware',
  'Binnen enkele weken eerste inzichten zonder zwaar implementatietraject',
] as const

export const approachSteps = [
  {
    title: '1. Kennismaking',
    body: 'We bepalen welke managementvraag nu eerst telt en of ExitScan, RetentieScan of een gefaseerde combinatie logisch is.',
  },
  {
    title: '2. Intake en databasis',
    body: 'We spreken af welke respondentdata, segmentinformatie en timing nodig zijn om dashboard en rapport leesbaar en privacyveilig te maken.',
  },
  {
    title: '3. Campaign setup',
    body: 'Verisight richt de campaign in, helpt met respondentimport en zet uitnodigingen en herinneringen klaar zonder extra toolbeheer voor HR.',
  },
  {
    title: '4. Eerste responses',
    body: 'De eerste signalen komen zichtbaar binnen zodra responses opbouwen, maar we lezen nog terughoudend zolang het patroonbeeld beperkt is en bereiden tegelijk de klantactivatie voor.',
  },
  {
    title: '5. Dashboard en rapport',
    body: 'Vanaf een bruikbare responsbasis krijg je dashboard, rapport en bestuurlijke handoff in dezelfde managementleeslijn, inclusief uitleg over wat al indicatief is en wat nog niet.',
  },
  {
    title: '6. Eerste managementgesprek',
    body: 'Samen vertalen we de eerste output naar prioriteiten, verificatievragen en logische vervolgstappen voor HR, sponsor, MT en directie.',
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
    body: 'Meestal start je met ExitScan Baseline om vertrek eerst bestuurlijk leesbaar te maken. RetentieScan Baseline is de eerste route als de actieve behoudsvraag nu echt primair is.',
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
    body: 'Pas na die eerste waarde wordt een vervolgvorm logisch: ExitScan ritmeroute als begeleide vervolgroute, RetentieScan ritmeroute als vaste herhaalvorm of segment deep dive als bewuste verdieping.',
  },
  {
    title: '5. Uitbreiden naar tweede product',
    body: 'Expansion volgt alleen wanneer de volgende managementvraag echt op tafel ligt: van ExitScan naar RetentieScan voor vroegsignalering op behoud, of omgekeerd voor terugkijkende vertrekduiding.',
  },
] as const

export const pricingLifecycleLadder = [
  {
    route: 'ExitScan',
    firstSale: 'ExitScan Baseline als standaard eerste koop',
    nextStep: 'ExitScan ritmeroute alleen als quote-only vervolgroute bij voldoende volume, proces en eigenaar.',
    expansion: 'RetentieScan Baseline wordt logisch zodra dezelfde thema\'s eerder in de actieve populatie moeten worden gesignaleerd.',
  },
  {
    route: 'RetentieScan',
    firstSale: 'RetentieScan Baseline alleen wanneer de actieve behoudsvraag nu het echte startpunt is.',
    nextStep: 'RetentieScan ritmeroute blijft de vaste buyer-facing vervolgvorm na baseline en eerste managementwaarde.',
    expansion: 'ExitScan Baseline wordt pas logisch als retrospectieve vertrekduiding alsnog nodig blijkt.',
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
    price: 'EUR 2.950',
    description:
      'De standaard eerste instap voor organisaties die snel een betrouwbaar organisatiebeeld, duidelijke prioriteiten en een professioneel managementrapport over uitstroom willen dat ook in sponsor-, prioriteits- en budgetgesprekken overeind blijft.',
    bullets: [
      'Inrichting van de exit-campagne en respondentflow',
      'Dashboard, managementrapport en bestuurlijke handoff',
      'Geschikt als eerste nulmeting of start van een begeleide vervolgroute',
    ],
  },
  {
    eyebrow: 'RetentieScan Baseline',
    price: 'EUR 3.450',
    description:
      'De standaard eerste instap voor organisaties die eerder willen zien waar behoud onder druk staat, met extra nadruk op privacy, groepsduiding en een gerichte managementscan in plaats van een brede MTO.',
    bullets: [
      'Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie in een managementrapport',
      'Geen individuele signalen naar management',
      'Geschikt als basis voor vervolgmeting of een gerichte vervolgronde',
    ],
  },
] as const

export const pricingFollowOnRoutes = [
  {
    title: 'ExitScan ritmeroute',
    price: 'op aanvraag',
    fit: 'Quote-only vervolg na baseline',
    description:
      'Voor organisaties die na een eerste ExitScan Baseline actuele uitstroomsignalen willen blijven volgen. Alleen logisch wanneer proces, volume en eigenaarschap al staan.',
    bullets: [
      'Geen concurrerend eerste pakket naast ExitScan Baseline',
      'Alleen verkopen na nulmeting of bij bestaand structureel exitproces',
      'Blijft een begeleide vervolgroute en geen self-serve monitoringlaag',
    ],
  },
  {
    title: 'RetentieScan ritmeroute',
    price: 'vanaf EUR 4.950',
    fit: 'Vaste vervolgvorm na baseline',
    description:
      'Voor organisaties die van een eerste RetentieScan willen doorgroeien naar een ritme met herhaalmeting, trendduiding en beter onderbouwde vervolgkeuzes op behoud.',
    bullets: [
      'Buyer-facing vervolgvorm na RetentieScan Baseline',
      'Baseline plus herhaalmeting per kwartaal of halfjaar',
      'Trendbeeld op retentiesignaal, bevlogenheid en stay-intent',
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
    title: 'Baseline + Segment deep dive',
    fit: 'Voor scherpere segmentprioritering',
    body: 'Voor organisaties die na een eerste baseline ook willen zien welke afdelingen of functieniveaus het meest afwijken, mits metadata en minimale n dat dragen.',
    bullets: ['Alles uit Baseline', 'Segmentanalyse op afdeling en functieniveau', 'Bewuste verdieping, geen standaard inbegrepen laag'],
  },
  {
    title: 'RetentieScan ritmeroute',
    fit: 'Voor structureel herijken',
    body: 'Voor organisaties die retentie als terugkerend stuurthema willen benaderen nadat baseline en eerste managementwaarde staan.',
    bullets: ['Herhaalmeting en trendduiding', 'Betere bespreking van effect en verschuiving', 'Buyer-facing vervolgvorm na de eerste baseline'],
  },
] as const

export const pricingChoiceGuide = [
  [
    'ExitScan Baseline',
    'Je wilt vertrek achteraf duiden en zoekt meestal het eerste betaalde traject dat losse exitinput bestuurlijk leesbaar maakt.',
  ],
  [
    'RetentieScan Baseline',
    'Je wilt eerder zien waar behoud in de actieve populatie onder druk staat en zoekt daarvoor een gerichte eerste baseline.',
  ],
  [
    'Combinatie op aanvraag',
    'Je wilt zowel leren van vertrek als eerder kunnen bijsturen op behoud, maar pas nadat de eerste route helder staat.',
  ],
] as const

export const pricingAddOns = [
  [
    'Segment deep dive',
    'EUR 950',
    'Extra segmentanalyse voor ExitScan of RetentieScan, met scherpere uitsplitsing naar afdeling en functieniveau wanneer metadata en minimale n daar geschikt voor zijn.',
  ],
  [
    'Compacte retentie vervolgmeting',
    'vanaf EUR 1.250',
    'Compacte vervolgcomponent binnen RetentieScan ritmeroute, bijvoorbeeld per kwartaal of halfjaar, om voortgang te volgen zonder daarvan een parallel hoofdpackage te maken.',
  ],
  [
    'Combinatieroute',
    'op aanvraag',
    'Voor organisaties die ExitScan en RetentieScan bewust naast elkaar willen inzetten. We prijzen dit niet als korting of bundel, maar als portfolioroute in een gedeelde managementstructuur.',
  ],
] as const

export const pricingFaqs = [
  [
    'Waarom is RetentieScan niet goedkoper dan ExitScan?',
    'Omdat RetentieScan geen lichtere algemene survey of MTO-light is. Het product vraagt juist scherpere privacykaders, actieve-medewerkersduiding en een eigen managementverhaal.',
  ],
  [
    'Waarom starten jullie niet met een gratis pilot?',
    'Omdat Verisight bedoeld is als serieus eerste traject met duidelijke scope, deliverables en opvolging. Een betaald baseline-traject test echte urgentie, geeft scherpere samenwerking en voorkomt vrijblijvende validatie zonder besluitvorming.',
  ],
  [
    'Is RetentieScan een MTO-vervanger?',
    'Nee. Het product is smaller en scherper: het richt zich op vroegsignalering op behoud via retentiesignaal, stay-intent, vertrekintentie en beinvloedbare werkfactoren.',
  ],
  [
    'Wanneer wordt ExitScan ritmeroute logisch?',
    'Meestal pas na een ExitScan Baseline of wanneer uitstroom al structureel met voldoende volume wordt gevolgd. Daarom houden we ExitScan ritmeroute bewust als vervolgroute op aanvraag.',
  ],
  [
    'Hoe verhouden RetentieScan ritmeroute en compacte vervolgmeting zich tot elkaar?',
    'RetentieScan ritmeroute is de vaste buyer-facing vervolgvorm na baseline. Een compacte retentie vervolgmeting is daarbinnen een lichtere vervolgcomponent, geen parallel eerste pakket.',
  ],
  [
    'Wanneer kies je voor de combinatieroute?',
    'Als je zowel achteraf wilt begrijpen waarom mensen gingen als eerder wilt zien waar behoud nu onder druk staat, en beide managementvragen echt bestaan.',
  ],
  [
    'Wat ziet management wel en niet?',
    'Management ziet groeps- en segmentinzichten. Bij RetentieScan tonen we geen individuele signalen, geen vertrekintentie op persoonsniveau, geen performance-oordelen en geen persoonsgerichte actieroutes.',
  ],
  [
    'Hoe vaak herhaal je RetentieScan?',
    'Voor v1 is een baseline het logische startpunt. Daarna is een ritme per kwartaal of halfjaar het meest logisch als je effect van acties wilt volgen.',
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
