export const marketingNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/producten', label: 'Producten' },
  { href: '/vertrouwen', label: 'Vertrouwen' },
  { href: '/aanpak', label: 'Aanpak' },
  { href: '/tarieven', label: 'Tarieven' },
] as const

export const marketingPrimaryCta = {
  href: '/#kennismaking',
  label: 'Plan mijn gesprek',
} as const

export const marketingSecondaryCta = {
  href: '/producten',
  label: 'Bekijk producten',
} as const

export const marketingFooterLinks = [
  { href: '/', label: 'Home' },
  { href: '/producten', label: 'Alle producten' },
  { href: '/producten/exitscan', label: 'ExitScan' },
  { href: '/producten/retentiescan', label: 'RetentieScan' },
  { href: '/producten/combinatie', label: 'Combinatie' },
  { href: '/vertrouwen', label: 'Vertrouwen' },
  { href: '/aanpak', label: 'Aanpak' },
  { href: '/tarieven', label: 'Tarieven' },
] as const

export const marketingLegalLinks = [
  { href: '/vertrouwen', label: 'Trust & privacy' },
  { href: '/privacy', label: 'Privacybeleid' },
  { href: '/voorwaarden', label: 'Algemene voorwaarden' },
  { href: '/dpa', label: 'Verwerkersovereenkomst' },
  { href: '/login', label: 'Voor klanten: inloggen' },
] as const

export const homepageProductRoutes = [
  {
    name: 'ExitScan',
    title: 'Maak vertrek bestuurlijk leesbaar',
    body: 'Voor organisaties die exitgesprekken of losse signalen hebben, maar nog geen vergelijkbaar managementbeeld van terugkerende uitstroompatronen.',
    href: '/producten/exitscan',
    accent: 'border-blue-200 bg-blue-50',
    chip: 'Terugkijkend',
  },
  {
    name: 'RetentieScan',
    title: 'Zie eerder waar behoud schuift',
    body: 'Voor organisaties die niet willen wachten tot behoud pas zichtbaar wordt in vacatures, uitval of exitgesprekken, zonder er een brede MTO of individuele voorspeller van te maken.',
    href: '/producten/retentiescan',
    accent: 'border-emerald-200 bg-emerald-50',
    chip: 'Vroegsignalering',
  },
  {
    name: 'Combinatie',
    title: 'Kijk terug en vooruit in een lijn',
    body: 'Voor organisaties die eerst een duidelijke route willen kiezen, maar beide managementvragen uiteindelijk bewust naast elkaar willen organiseren.',
    href: '/producten/combinatie',
    accent: 'border-sky-200 bg-sky-50',
    chip: 'Portfolio',
  },
] as const

export const homepageComparisonRows = [
  [
    'Je kijkt terug op uitstroom',
    'ExitScan',
    'Vertrekduiding, werkfactoren en managementrapport',
  ],
  [
    'Je wilt eerder signaleren in actieve teams',
    'RetentieScan',
    'Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie',
  ],
  [
    'Je wilt beide sporen naast elkaar gebruiken',
    'Combinatie',
    'Een portfolio-aanpak met twee gerichte producten',
  ],
] as const

export const homepageProofSignals = [
  'Methodische productkeuze: vertrekduiding of vroegsignalering',
  'Publieke trust-, privacy- en DPA-laag voor kopers',
  'Dashboard, rapport en preview in dezelfde bestuurlijke leeslijn',
  'Groepsinzichten met minimale n-grenzen en productspecifieke leeswijzers',
] as const

export const homepageUtilityLinks = [
  {
    href: '/producten',
    title: 'Alle producten',
    body: 'Bekijk ExitScan, RetentieScan en de combinatie in een heldere productstructuur.',
  },
  {
    href: '/aanpak',
    title: 'Aanpak',
    body: 'Zie hoe baseline, uitvoering en opvolging logisch op elkaar aansluiten.',
  },
  {
    href: '/vertrouwen',
    title: 'Vertrouwen',
    body: 'Zie publiek hoe methodiek, privacy, rapportlezing en DPA zijn ingericht.',
  },
  {
    href: '/tarieven',
    title: 'Tarieven',
    body: 'Bekijk pricing, pakketopbouw en wanneer een combinatie commercieel logisch wordt.',
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
    'Behoudsignalering',
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
    title: 'ExitScan',
    description:
      'Voor organisaties waar uitstroom wel besproken wordt, maar management nog geen vergelijkbaar beeld heeft van wat structureel terugkeert.',
    outcome: 'Sterk wanneer de eerste commerciële vraag is: hoe maken we losse exitinput bestuurlijk leesbaar en bruikbaar voor een eerste besluit?',
  },
  {
    title: 'RetentieScan',
    description:
      'Voor organisaties die al scherper willen zien waar behoud op groeps- en segmentniveau onder druk staat, voordat dat pas zichtbaar wordt in vacatures, uitval of exitgesprekken.',
    outcome: 'Sterk wanneer de vraag vooruitkijkend is: waar vraagt behoud nu als eerste verificatie en opvolging, zonder van de scan een brede MTO of individuele predictor te maken?',
  },
  {
    title: 'Combinatie',
    description:
      'Voor organisaties die zowel vertrekduiding als behoudsignalering willen opbouwen binnen eenzelfde managementtaal, maar niet als eerste alles tegelijk willen kopen.',
    outcome: 'Sterk wanneer beide managementvragen echt bestaan en je de tweede route pas toevoegt nadat de eerste helder staat.',
  },
] as const

export const trustItems = [
  'Nederlandse dienst met publieke trust- en legal routes',
  'Primaire dataopslag in EU-regio',
  'Groepsinzichten met minimale n-grenzen',
  'Dashboard en managementrapport in dezelfde leeslijn',
  'Methodische basis vanuit A&O-psychologie',
] as const

export const trustQuickLinks = [
  {
    href: '/vertrouwen',
    label: 'Trust & privacy',
    body: 'Zie publiek hoe Verisight methodiek, privacy, rapportlezing en legitimiteit inricht.',
  },
  {
    href: '/privacy',
    label: 'Privacybeleid',
    body: 'Lees hoe data, subverwerkers, cookies en bewaartermijnen zijn ingericht.',
  },
  {
    href: '/dpa',
    label: 'Verwerkersovereenkomst',
    body: 'Bekijk het standaardtemplate voor klantorganisaties en due-diligence-vragen.',
  },
] as const

export const trustSignalHighlights = [
  {
    title: 'Methodische trust',
    body: 'ExitScan en RetentieScan worden publiek uitgelegd als managementinstrumenten met duidelijke claimsgrenzen, geen diagnose of black-box voorspeller.',
  },
  {
    title: 'Privacy trust',
    body: 'De buyer-facing laag maakt groepsniveau, minimale n-grenzen, geanonimiseerde open tekst en EU-primary dataopslag expliciet zichtbaar.',
  },
  {
    title: 'Output trust',
    body: 'Dashboard, rapport en preview volgen dezelfde bestuurlijke leeslijn met compacte handoff, bewijsstatus en productspecifieke interpretatiegrenzen.',
  },
  {
    title: 'Procestrust',
    body: 'Verisight verkoopt een begeleide productvorm met intake, uitvoering, rapportage en opvolging in plaats van losse surveysoftware.',
  },
  {
    title: 'Legitimiteit',
    body: 'Publieke contactroutes, privacypagina, DPA, voorwaarden en een Nederlandse buyer-facing trustlaag verlagen first-time buyer twijfel.',
  },
] as const

export const trustVerificationCards = [
  {
    title: 'Wat je nu publiek kunt verifieren',
    body: 'Verisight toont publiek hoe productkeuze, privacy, rapportlezing en begeleide delivery zijn ingericht voordat je een demo of gesprek inplant.',
  },
  {
    title: 'Wat management wel ziet',
    body: 'Geaggregeerde managementsamenvatting, bestuurlijke handoff, topfactoren, hypotheses, prioriteiten en opvolgsporen in een vaste executive leeslijn.',
  },
  {
    title: 'Wat we bewust niet claimen',
    body: 'Geen individuele voorspelling, geen persoonsgerichte beoordeling, geen brede people-suite en geen wetenschappelijke validatie die niet door de repo-basis wordt gedragen.',
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
    body: 'Verisight gebruikt signalen, hypotheses en managementsamenvattingen als gespreksinput. De output ondersteunt verificatie en prioritering, niet causaliteitsclaims of harde diagnoses.',
  },
  {
    title: 'Welke juridische basis is publiek beschikbaar?',
    body: 'Er zijn publieke pagina\'s voor trust & privacy, privacybeleid, algemene voorwaarden en een standaard DPA-template voor klantorganisaties.',
  },
  {
    title: 'Wat voor productvorm koop je?',
    body: 'Geen self-serve surveytool en geen open consultancytraject, maar een begeleide productvorm met dashboard, rapportage, uitleg en productspecifieke trustgrenzen.',
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
    'Dashboard, managementsamenvatting, bestuurlijke handoff, topfactoren, hypotheses en vervolgstappen',
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
    title: 'Trust & privacy',
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
    value: '2 producten',
    label: 'een logisch portfolio',
    detail: 'ExitScan voor vertrekduiding, RetentieScan voor vroegsignalering op behoud.',
  },
  {
    value: 'Dashboard + rapport',
    label: 'vaste output',
    detail: 'Voor HR, MT en directie in dezelfde professionele Verisight-structuur.',
  },
  {
    value: 'Baseline of ritme',
    label: 'heldere productvorm',
    detail: 'Eenmalig starten of periodiek herhalen, afhankelijk van je vraag en volwassenheid.',
  },
] as const

export const outcomeCards = [
  [
    'Begin met de juiste eerste managementvraag',
    'Je voorkomt dat ExitScan en RetentieScan door elkaar gaan lopen: meestal start je met vertrekduiding en voeg je behoudsignalering pas toe wanneer die vraag echt op tafel ligt.',
  ],
  [
    'Werk met een gedeelde taal voor HR, MT en directie',
    'Dashboard en rapportage helpen om sneller op een lijn te komen over waar verdieping, prioriteit of eerste actie het meeste oplevert, inclusief compacte bestuurlijke handoff en vaste leeswijzers over claims, privacy en interpretatie.',
  ],
  [
    'Ga van losse signalen naar bestuurbare prioriteiten',
    'Verisight vertaalt losse exitdata of behoudssignalen naar een eerste managementvraag, een eerste eigenaar en een logische vervolgstap.',
  ],
  [
    'Geen extra toolbeheer voor HR',
    'Verisight begeleidt de uitvoering, zodat jouw team niet ook nog een nieuwe surveytool hoeft te implementeren.',
  ],
  [
    'Privacy by design in beide producten',
    'Output blijft bedoeld voor groepsinzichten en managementduiding, met extra terughoudendheid bij actieve medewerkers en zonder individuele managementoutput in RetentieScan.',
  ],
  [
    'Herhaalbaar zonder productverwarring',
    'Je kunt starten met een eerste baseline en daarna bewust kiezen welke scan wanneer logisch is om te herhalen.',
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
    text: 'Compacte besluitinformatie die laat zien waar terugkerende vertrekpatronen of vroege behoudssignalen bestuurlijke aandacht, eigenaarschap en vervolgrichting verdienen.',
  },
] as const

export const included = [
  'Inrichting van de gekozen scan of meetronde',
  'Uitnodigingen en herinneringen voor respondenten',
  'Dashboard met prioriteiten en managementduiding',
  'Zelfstandig leesbaar rapport voor HR, MT en directie',
  'Privacy-, claims- en interpretatiekaders in gewone taal',
  'Begeleide productvorm in plaats van losse surveysoftware',
  'Binnen enkele weken eerste inzichten zonder implementatietraject',
  'Methodische basis vanuit arbeids- en organisatiepsychologie',
] as const

export const approachSteps = [
  {
    title: '1. Intake en scan-keuze',
    body: 'We bepalen samen welke managementvraag eerst telt: vertrek achteraf duiden, behoud eerder signaleren of later bewust combineren, en welke respondentdata daarvoor nodig is.',
  },
  {
    title: '2. Datavoorbereiding',
    body: 'We spreken af welke respondentdata, segmentinformatie en timing nodig zijn om dashboard en rapport straks goed leesbaar te maken, inclusief minimale n-grenzen en privacygrenzen voor segmenten.',
  },
  {
    title: '3. Uitnodigen en uitvoeren',
    body: 'Verisight richt de flow in, verstuurt uitnodigingen en bewaakt de dataverzameling zonder extra toolbeheer voor HR.',
  },
  {
    title: '4. Rapport en opvolging',
    body: 'Je krijgt een dashboard en rapport waarmee HR, sponsor, MT en directie sneller zien wat nu het eerste managementspoor is, welke validatie logisch is en welke vervolgactie eerst moet worden belegd, inclusief compacte bestuurlijke handoff en leeswijzers over methodiek, claimsgrenzen en privacy.',
  },
] as const

export const approachRoutes = [
  {
    eyebrow: 'ExitScan Baseline',
    title: 'De standaard eerste instap voor vertrekduiding',
    body: 'Retrospectief traject op ex-medewerkers van bijvoorbeeld de afgelopen 12 maanden. Dit is meestal de logischste eerste commerciële instap wanneer organisaties wel exitinput hebben, maar nog geen bestuurbaar patroonbeeld.',
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
    eyebrow: 'ExitScan Live',
    title: 'Voor organisaties die uitstroom doorlopend willen volgen',
    body: 'Doorlopende ExitScan voor nieuwe vertrekkers. Past vooral als vervolg op een eerste baseline of wanneer uitstroom al structureel en met voldoende volume wordt gevolgd.',
    bullets: [
      'Vast proces met HR voor nieuwe vertrekkers',
      'Actuelere signalen, trends pas zinvol bij voldoende volume',
      'Vooral geschikt als vervolg of op aanvraag',
    ],
    shellClass: 'border-slate-200 bg-slate-50',
    eyebrowClass: 'text-slate-500',
    bodyClass: 'text-slate-700',
  },
  {
    eyebrow: 'RetentieScan Baseline',
    title: 'De eerste meetvorm voor actieve medewerkers',
    body: 'Een eenmalige RetentieScan om te zien waar behoud op groepsniveau onder druk staat, welke werkfactoren prioriteit vragen en hoe bevlogenheid, stay-intent en vertrekintentie zich verhouden. Logisch wanneer de buyer-vraag expliciet over actieve medewerkers en vroegsignalering gaat.',
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
    eyebrow: 'RetentieScan ritme',
    title: 'Voor organisaties die periodiek willen volgen',
    body: 'Herhaalmeting per kwartaal of halfjaar om te zien of retentiesignalen, stay-intent, bevlogenheid en prioritaire werkfactoren verbeteren. Meestal een vervolgstap nadat de eerste baseline en opvolging staan.',
    bullets: [
      'Compacter vervolg op een baseline',
      'Geschikt om effect van acties zichtbaar te maken in dezelfde signaallogica',
      'Blijft groeps- en segmentgericht, niet persoonsgericht',
    ],
    shellClass: 'border-amber-200 bg-amber-50',
    eyebrowClass: 'text-amber-700',
    bodyClass: 'text-slate-700',
  },
] as const

export const pricingCards = [
  {
    eyebrow: 'ExitScan Baseline',
    price: 'EUR 2.950',
    description:
      'De standaard eerste instap voor organisaties die snel een betrouwbaar organisatiebeeld, duidelijke prioriteiten en een professioneel managementrapport over uitstroom willen dat ook in sponsor-, prioriteits- en budgetgesprekken overeind blijft.',
    bullets: [
      'Inrichting van de exit-campaign en respondentflow',
      'Dashboard en rapport voor vertrekduiding',
      'Geschikt als eerste nulmeting of start van structurele opvolging',
    ],
  },
  {
    eyebrow: 'RetentieScan Baseline',
    price: 'EUR 3.450',
    description:
      'De standaard eerste instap voor organisaties die eerder willen zien waar behoud onder druk staat, met extra nadruk op privacy, groepsduiding, compacte bestuurlijke handoff en een gerichte managementscan in plaats van een brede MTO.',
    bullets: [
      'Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie in een managementrapport',
      'Geen individuele signalen naar management',
      'Geschikt als basis voor vervolgmeting of gerichte opvolging',
    ],
  },
  {
    eyebrow: 'Retention Loop',
    price: 'vanaf EUR 4.950',
    description:
      'Voor organisaties die van een eerste RetentieScan willen doorgroeien naar een ritme met herhaalmeting, trendduiding en beter onderbouwde opvolging op behoud, passend bij terugkerende prioriteits- en continuiteitsgesprekken.',
    bullets: [
      'Baseline plus herhaalmeting per kwartaal of halfjaar',
      'Trendbeeld op retentiesignaal, bevlogenheid en stay-intent',
      'Geschikt voor organisaties die retentie actief willen sturen',
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
    title: 'Baseline + Deep Dive',
    fit: 'Voor scherpere segmentprioritering',
    body: 'Voor organisaties die niet alleen het totaalbeeld willen zien, maar ook welke afdelingen of functieniveaus het meest afwijken.',
    bullets: ['Alles uit Baseline', 'Segmentanalyse op afdeling en functieniveau', 'Extra duiding op afwijkende groepen'],
  },
  {
    title: 'Retention Loop',
    fit: 'Voor structurele opvolging',
    body: 'Voor organisaties die retentie niet als momentopname maar als terugkerend stuurthema willen benaderen.',
    bullets: ['Herhaalmeting en trendduiding', 'Betere opvolging van acties', 'Basis voor latere validatie en vergelijking'],
  },
] as const

export const pricingChoiceGuide = [
  ['ExitScan', 'Je wilt vertrek achteraf duiden en zien welke werkfactoren en werksignalen daarin terugkeren.'],
  ['RetentieScan', 'Je wilt eerder zien waar behoud in de actieve populatie onder druk staat.'],
  ['Combinatie', 'Je wilt zowel leren van vertrek als eerder kunnen bijsturen op behoud.'],
] as const

export const pricingAddOns = [
  [
    'Segment deep dive',
    'EUR 950',
    'Extra segmentanalyse voor ExitScan of RetentieScan, met scherpere uitsplitsing naar afdeling en functieniveau wanneer de metadata daar geschikt voor is.',
  ],
  [
    'Retentie vervolgmeting',
    'vanaf EUR 1.250',
    'Compactere herhaalmeting na een RetentieScan Baseline, bijvoorbeeld per kwartaal of halfjaar, om voortgang te volgen zonder de baseline opnieuw op te tuigen.',
  ],
  [
    'Combinatiepakket',
    'op aanvraag',
    'Voor organisaties die ExitScan en RetentieScan bewust naast elkaar willen inzetten. We prijzen dit niet als korting op inhoud, maar als logische pakketvorming in een gedeeld platform.',
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
    'Nee. Het product is smaller en scherper: het richt zich op behoudssignalen, stay-intent, vertrekintentie en beinvloedbare werkfactoren.',
  ],
  [
    'Wanneer kies je voor een combinatiepakket?',
    'Als je zowel achteraf wilt begrijpen waarom mensen gingen als eerder wilt zien waar behoud nu onder druk staat.',
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
    'ExitScan helpt vertrek achteraf duiden op basis van terugkerende werkfactoren, vertrekredenen en werksignalen. RetentieScan helpt eerder zien waar behoud op groepsniveau onder druk staat bij actieve medewerkers.',
  ],
  [
    'Is RetentieScan gewoon een MTO?',
    'Nee. RetentieScan is smaller en scherper gepositioneerd: het is een compacte behoudsscan op groeps- en segmentniveau rond retentiesignalen, stay-intent, vertrekintentie en beinvloedbare werkfactoren.',
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
    'Nee. Voor v1 positioneren we RetentieScan als SDT-gebaseerde managementscan voor behoudssignalen, verificatie en prioritering: inhoudelijk plausibel en testmatig beschermd, maar niet als wetenschappelijk gevalideerde voorspeller van vrijwillig vertrek.',
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
  home: 'Product choice + trust + conversion',
  producten: 'Buyer-oriented overview of the two live products and combination route',
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
