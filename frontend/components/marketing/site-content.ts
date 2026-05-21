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
    body: 'Lees hoe de eerste stap doorloopt naar dashboard, rapport en eerste opvolging.',
  },
  {
    href: '/tarieven',
    title: 'Bekijk tarieven',
    body: 'Zie hoe eerste stappen, uitbreiding en later vervolg zijn opgebouwd.',
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
      'Loep is opgebouwd rondom een specifieke managementvraag — niet een generieke tool die achteraf betekenis moet krijgen.',
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
    body: 'Hoe Loep is opgebouwd en wat u ervan kunt verwachten.',
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
    body: 'Loep biedt een strakke productvorm met intake, uitvoering, rapportage en begeleide vervolgstappen, in plaats van losse surveysoftware of open consultancy.',
  },
  {
    title: 'Publiek verifieerbare basis',
    body: 'Trusthub, privacybeleid, DPA, voorwaarden en publieke contactroutes verlagen first-time buyer twijfel zonder badges of theater.',
  },
] as const

export const trustVerificationCards = [
  {
    title: 'Zo weet u vooraf waar u aan toe bent',
    body: 'U kunt vooraf zien hoe Loep omgaat met privacy, rapportage en de eerste stap naar een Baseline.',
  },
  {
    title: 'Waar publieke voorbeeldoutput stopt',
    body: 'Voorbeeldoutput is beschikbaar voor de belangrijkste eerste routes. Andere routes lichten we kort toe, zonder onnodige voorbeeldbibliotheek.',
  },
  {
    title: 'Wat u in rapport en dashboard terugziet',
    body: 'Een groepsbeeld, belangrijkste aandachtspunten, prioriteiten en eerste vervolgrichting.',
  },
  {
    title: 'Wat we bewust niet claimen',
    body: 'Geen individuele voorspellingen, geen persoonsgerichte beoordeling en geen conclusies die verder gaan dan het groepsbeeld toelaat.',
  },
] as const

export const trustHubAnswerCards = [
  {
    title: 'Waar draait de data?',
    body: 'De primaire database draait in de EU. Subverwerkers voor hosting en e-mail staan in het privacybeleid en de verwerkersovereenkomst.',
  },
  {
    title: 'Wat ziet u precies terug?',
    body: 'U ziet groeps- en segmentinzichten. Geen individuele signalen, persoonsprofielen of persoonlijke risicolijsten.',
  },
  {
    title: 'Hoe voorkom je schijnprecisie?',
    body: 'Detailweergave start pas vanaf minimale groepsgroottes. Te kleine segmenten blijven verborgen en open tekst wordt zorgvuldig behandeld.',
  },
  {
    title: 'Welke juridische basis is publiek beschikbaar?',
    body: 'U vindt publieke pagina’s over trust, privacy, voorwaarden en een standaard verwerkersovereenkomst.',
  },
  {
    title: 'Wat koopt u precies?',
    body: 'U start met een Baseline: scan, dashboard en managementrapport. Opvolging kan daarna optioneel worden geborgd.',
  },
  {
    title: 'Heeft elke route een publiek voorbeeldrapport?',
    body: 'Nee. Voorbeeldoutput is bewust beperkt tot de belangrijkste eerste routes: ExitScan en RetentieScan.',
  },
] as const

export const trustReadingRows = [
  [
    'Gebruik',
    'Samenvatting, prioriteiten en gesprek op groepsniveau',
    'Niet als diagnose, individuele voorspelling of beoordeling van personen',
  ],
  [
    'Wat u terugziet',
    'Dashboard, managementsamenvatting, topfactoren en eerste vervolgrichting.',
    'Geen ruwe individuele responses, geen persoonsprofielen en geen verborgen black-box score.',
  ],
  [
    'Privacygrens',
    'Minimale groepsgroottes, onderdrukking van te kleine segmenten en zorgvuldige omgang met open tekst.',
    'Niet gebruiken alsof kleine groepen of open tekst altijd volledig veilig of representatief zijn.',
  ],
  [
    'Wat de uitkomsten wel en niet zeggen',
    'Onderbouwde signalen met duidelijke grenzen in wat ze wel en niet zeggen.',
    'Niet gebruiken als diagnose, voorspeller of sluitend bewijs.',
  ],
] as const

export const trustSupportCards = [
  {
    title: 'Trust en privacy',
    href: '/vertrouwen',
    body: 'Methodiek, privacy en verantwoord gebruik van uitkomsten.',
  },
  {
    title: 'Privacybeleid',
    href: '/privacy',
    body: 'Hoe Loep persoonsgegevens, subverwerkers en AVG-rechten behandelt.',
  },
  {
    title: 'Verwerkersovereenkomst',
    href: '/dpa',
    body: 'Standaard verwerkersovereenkomst voor klantorganisaties.',
  },
  {
    title: 'Algemene voorwaarden',
    href: '/voorwaarden',
    body: 'Voorwaarden over dienstvorm, beschikbaarheid, facturatie en rollen.',
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
    'Loep begeleidt de uitvoering, zodat jouw team niet ook nog een nieuwe surveytool hoeft in te richten of te beheren.',
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
  'Intake en compacte baseline-opzet',
  'Scan en respondentflow waar relevant',
  'Dashboard en managementrapport',
  'Samenvatting voor HR en management',
  'Privacy en interpretatie in gewone taal',
  'Eerste opvolging waar de situatie daarom vraagt',
  'Geen extra toolbeheer voor uw team',
] as const

export const approachSteps = [
  {
    title: '1. Juiste route kiezen',
    body: 'We bepalen welke stap nu het meeste duidelijkheid geeft: vertrek, behoud of onboarding.',
  },
  {
    title: '2. Compact opzetten',
    body: 'We zetten de gekozen stap op met de timing, groepen en input die nodig zijn voor een betrouwbare eerste uitkomst.',
  },
  {
    title: '3. Route laten lopen',
    body: 'De route gaat live en de basis wordt bewaakt, zonder extra toolbeheer voor uw team.',
  },
  {
    title: '4. Eerste signalen zichtbaar',
    body: 'Zodra de respons opbouwt, worden de eerste signalen zichtbaar. We blijven terughoudend tot het beeld stevig genoeg is.',
  },
  {
    title: '5. Dashboard en rapport lezen',
    body: 'Als het beeld sterk genoeg is, ziet u in dashboard en rapport wat opvalt, wat eerst telt en waar gesprek nodig is.',
  },
  {
    title: '6. Eerste opvolging organiseren',
    body: 'Waar relevant helpt Loep om de eerste opvolging zichtbaar te maken, met duidelijke acties en verantwoordelijkheden.',
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
      'Voor organisaties die beter willen begrijpen welke patronen terugkomen in uitstroom en wat management eerst moet bespreken.',
    bullets: [
      'Intake',
      'Scan',
      'Dashboard',
      'Managementrapport',
    ],
  },
  {
    eyebrow: 'RetentieScan Baseline',
    price: 'vanaf EUR 4.500',
    description:
      'Voor organisaties die eerder willen zien waar behoud onder druk staat, voordat signalen pas zichtbaar worden in exitdata.',
    bullets: [
      'Intake',
      'Scan',
      'Dashboard',
      'Managementrapport',
    ],
  },
  {
    eyebrow: 'Onboarding 30-60-90 Baseline',
    price: 'vanaf EUR 4.500',
    description:
      'Voor organisaties die willen zien of nieuwe medewerkers goed landen in rol, team, leiding en werkcontext.',
    bullets: [
      'Intake',
      'Scan',
      'Dashboard',
      'Managementrapport',
    ],
  },
] as const

export const pricingFollowOnRoutes = [
  {
    title: 'ExitScan Live Start',
    price: 'op aanvraag',
    fit: 'Later vervolg na baseline',
    description:
      'Voor organisaties die nieuwe exits vanaf nu structureel willen volgen.',
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
      'Voor organisaties die periodiek willen herijken of signalen verschuiven en opvolging werkt.',
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
      'Voor een compacte hercheck nadat de eerste vraag al scherp is.',
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
      'Wanneer signalen vooral vragen oproepen over aansturing of leiding.',
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
      'Wanneer vertrek en behoud tegelijk aandacht vragen en gefaseerd bekeken moeten worden.',
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
  eyebrow: 'Voor vragen rond de eerste 30, 60 en 90 dagen',
  body:
    'Voor organisaties die vroeg willen zien of nieuwe medewerkers goed landen — en waar eerste frictie aandacht vraagt voordat die uitgroeit tot uitval, verloop of langdurige onzekerheid.',
  bullets: [
    'Voor vragen rond de eerste 30, 60 en 90 dagen',
    'Maakt vroege frictie in rol, team en leiding zichtbaar',
    'Startpunt wanneer onboarding nu de belangrijkste vraag is',
  ],
  href: '/producten/onboarding-30-60-90',
} as const

export const actionCenterStartPositioning = {
  eyebrow: 'Optionele uitbreiding',
  title: 'Borg opvolging pas als er echt iets gekozen is',
  body:
    'Na een Baseline kan Action Center helpen om één gekozen vervolgrichting zichtbaar te houden: wie pakt dit op, wat loopt er en wanneer kijken we terug? Het is bedoeld voor gerichte opvolging, niet als breed workflowplatform.',
  bullets: [
    'Voor één gekozen vervolgrichting',
    'Beperkte manager- of eigenaartoegang',
    'Zichtbare status en één reviewmoment',
  ],
} as const

export const productFollowOnRouteRows = [
  ['ExitScan Live Start', 'Voor organisaties die nieuwe exits vanaf nu structureel willen volgen, nadat duidelijk is welke vertrekvraag centraal staat.'],
  ['Reviewcadans', 'Voor organisaties die periodiek willen terugkijken of signalen verschuiven, opvolging werkt en een nieuwe managementkeuze nodig is.'],
  ['Pulse', 'Compacte vervolgronde na een eerste baseline.'],
  ['Leadership Scan', 'Wanneer signalen vooral vragen oproepen over aansturing of leiding.'],
] as const

export const pricingAddOns = [
  [
    'Action Center Start',
    'vanaf EUR 1.250',
    'Optionele uitbreiding voor één gekozen vervolgrichting, met beperkte manager- of eigenaartoegang, zichtbare status en één reviewmoment.',
  ],
] as const

export const pricingFaqs = [
  [
    'Waarom hebben de baseline-routes hetzelfde publieke prijsanker?',
    'Omdat de eerste stap steeds draait om een compacte baseline met intake, scan, dashboard en managementrapport. De route verschilt, maar de eerste managementread blijft het publieke vertrekpunt.',
  ],
  [
    'Waarom starten jullie niet met een gratis pilot?',
    'Omdat Loep bedoeld is als serieuze eerste stap met een duidelijke baseline, een eerste managementread en een concrete vervolgrichting. Een betaald eerste traject voorkomt vrijblijvende validatie zonder besluitvorming.',
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
    'Nee. Loep verkoopt geen garantie op lager verloop, maar scherpere duiding, betere prioritering en een sterkere basis voor managementbeslissingen op groepsniveau.',
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
    'Is Loep een tool of een dienst?',
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


