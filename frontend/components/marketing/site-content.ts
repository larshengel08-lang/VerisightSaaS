export const marketingNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/producten', label: 'Producten' },
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
  { href: '/aanpak', label: 'Aanpak' },
  { href: '/tarieven', label: 'Tarieven' },
] as const

export const marketingLegalLinks = [
  { href: '/privacy', label: 'Privacybeleid' },
  { href: '/voorwaarden', label: 'Algemene voorwaarden' },
  { href: '/dpa', label: 'Verwerkersovereenkomst' },
  { href: '/login', label: 'Voor klanten: inloggen' },
] as const

export const homepageProductRoutes = [
  {
    name: 'ExitScan',
    title: 'Begrijp waarom mensen gingen',
    body: 'Voor organisaties die terugkijkend willen leren van uitstroom en daar meer uit willen halen dan losse exitgesprekken.',
    href: '/producten/exitscan',
    accent: 'border-blue-200 bg-blue-50',
    chip: 'Terugkijkend',
  },
  {
    name: 'RetentieScan',
    title: 'Zie eerder waar behoud schuift',
    body: 'Voor organisaties die eerder willen zien waar behoud onder druk staat in actieve teams, zonder individuele voorspeller te worden.',
    href: '/producten/retentiescan',
    accent: 'border-emerald-200 bg-emerald-50',
    chip: 'Vroegsignalering',
  },
  {
    name: 'Combinatie',
    title: 'Kijk terug en vooruit in een lijn',
    body: 'Voor organisaties die uitstroom willen duiden en tegelijk eerder willen bijsturen op behoud.',
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
    'Retentiesignaal, bevlogenheid en vertrekintentie',
  ],
  [
    'Je wilt beide sporen naast elkaar gebruiken',
    'Combinatie',
    'Een portfolio-aanpak met twee gerichte producten',
  ],
] as const

export const homepageProofSignals = [
  'Productkeuze voor de analyse begint',
  'Dashboard en rapport in dezelfde managementtaal',
  'ExitScan en RetentieScan blijven inhoudelijk gescheiden',
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
    href: '/tarieven',
    title: 'Tarieven',
    body: 'Bekijk pricing, pakketopbouw en wanneer een combinatie commercieel logisch wordt.',
  },
] as const

export const productOverviewComparisonRows = [
  [
    'ExitScan',
    'Vertrekduiding',
    'Waarom gingen mensen weg en welke werkfactoren keren terug?',
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
      'Voor organisaties die willen begrijpen waarom mensen zijn vertrokken en welke werkfactoren daar het vaakst in terugkomen.',
    outcome: 'Sterk wanneer de vraag terugkijkend is: wat leren we van vertrek dat al heeft plaatsgevonden?',
  },
  {
    title: 'RetentieScan',
    description:
      'Voor organisaties die eerder willen zien waar behoud onder druk staat, voordat signalen zichtbaar worden in vacatures, uitval of exitgesprekken.',
    outcome: 'Sterk wanneer de vraag vooruitkijkend is: waar vraagt behoud nu aandacht in de actieve populatie?',
  },
  {
    title: 'Combinatie',
    description:
      'Voor organisaties die zowel vertrekduiding als behoudsignalering willen opbouwen binnen eenzelfde managementtaal en platform.',
    outcome: 'Sterk wanneer je achteraf wilt begrijpen en tegelijk eerder wilt kunnen bijsturen.',
  },
] as const

export const trustItems = [
  'Twee scans, een platform',
  'Dashboard en managementrapport',
  'Gehost in Europa',
  'Methodische basis vanuit A&O-psychologie',
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
    'Kies de juiste scan voor de juiste managementvraag',
    'Je voorkomt dat ExitScan en RetentieScan door elkaar gaan lopen: de ene kijkt terug, de andere signaleert eerder vooruit.',
  ],
  [
    'Werk met een gedeelde taal voor HR, MT en directie',
    'Dashboard en rapportage helpen om sneller op een lijn te komen over waar verdieping of actie het meeste oplevert.',
  ],
  [
    'Combineer signalering met duiding',
    'Je kunt behoudssignalen volgen zonder van RetentieScan een individuele voorspeller te maken.',
  ],
  [
    'Geen extra toolbeheer voor HR',
    'Verisight begeleidt de uitvoering, zodat jouw team niet ook nog een nieuwe surveytool hoeft te implementeren.',
  ],
  [
    'Privacy by design in beide producten',
    'Output blijft bedoeld voor groepsinzichten en managementduiding, met extra terughoudendheid bij actieve medewerkers.',
  ],
  [
    'Herhaalbaar zonder productverwarring',
    'Je kunt starten met een eerste baseline en daarna bewust kiezen welke scan wanneer logisch is om te herhalen.',
  ],
] as const

export const processHighlights = [
  {
    title: 'Voor HR',
    text: 'Minder losse signalen en sneller een bruikbare keuze tussen vertrekduiding en behoudsignalering.',
  },
  {
    title: 'Voor MT',
    text: 'Een compact managementbeeld dat helpt bepalen waar gesprek, validatie of actie het meeste oplevert.',
  },
  {
    title: 'Voor directie',
    text: 'Stuurinformatie over zowel terugkerende vertrekpatronen als vroege signalen rond behoud.',
  },
] as const

export const included = [
  'Inrichting van de gekozen scan of meetronde',
  'Uitnodigingen en herinneringen voor respondenten',
  'Dashboard met prioriteiten en managementduiding',
  'Zelfstandig leesbaar rapport voor HR, MT en directie',
  'Privacy- en interpretatiekaders in gewone taal',
  'Begeleide productvorm in plaats van losse surveysoftware',
  'Binnen enkele weken eerste inzichten zonder implementatietraject',
  'Methodische basis vanuit arbeids- en organisatiepsychologie',
] as const

export const approachSteps = [
  {
    title: '1. Intake en scan-keuze',
    body: 'We bepalen samen of de vraag vooral om ExitScan, RetentieScan of een combinatie vraagt, en welke respondentdata nodig is.',
  },
  {
    title: '2. Datavoorbereiding',
    body: 'We spreken af welke respondentdata, segmentinformatie en timing nodig zijn om dashboard en rapport straks goed leesbaar te maken.',
  },
  {
    title: '3. Uitnodigen en uitvoeren',
    body: 'Verisight richt de flow in, verstuurt uitnodigingen en bewaakt de dataverzameling zonder extra toolbeheer voor HR.',
  },
  {
    title: '4. Rapport en opvolging',
    body: 'Je krijgt een dashboard en rapport waarmee HR, MT en directie sneller zien waar gesprek, validatie of vervolgactie logisch is.',
  },
] as const

export const approachRoutes = [
  {
    eyebrow: 'ExitScan Baseline',
    title: 'De standaard eerste instap voor vertrekduiding',
    body: 'Retrospectief traject op ex-medewerkers van bijvoorbeeld de afgelopen 12 maanden. Geschikt als eerste patroonbeeld en startpunt voor actie.',
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
    body: 'Doorlopende ExitScan voor nieuwe vertrekkers. Past vooral wanneer je uitstroom structureel wilt monitoren en periodiek wilt verversen.',
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
    body: 'Een eenmalige RetentieScan om te zien waar behoud onder druk staat, welke werkfactoren prioriteit vragen en hoe bevlogenheid en vertrekintentie zich verhouden.',
    bullets: [
      'Actieve medewerkers in plaats van ex-medewerkers',
      'Groepsinzichten, geen individuele retention-scores',
      'Sterk als startpunt voor gerichte opvolging en herhaalmeting',
    ],
    shellClass: 'border-emerald-200 bg-emerald-50',
    eyebrowClass: 'text-emerald-700',
    bodyClass: 'text-slate-700',
  },
  {
    eyebrow: 'RetentieScan ritme',
    title: 'Voor organisaties die periodiek willen volgen',
    body: 'Herhaalmeting per kwartaal of halfjaar om te zien of retentiesignalen, bevlogenheid en prioritaire werkfactoren verbeteren.',
    bullets: [
      'Compacter vervolg op een baseline',
      'Geschikt om effect van acties zichtbaar te maken',
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
      'De standaard eerste instap voor organisaties die snel een betrouwbaar organisatiebeeld, duidelijke prioriteiten en een professioneel managementrapport over uitstroom willen.',
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
      'De standaard eerste instap voor organisaties die eerder willen zien waar behoud onder druk staat, met extra nadruk op privacy, groepsduiding en managementinformatie.',
    bullets: [
      'Retentiesignaal, bevlogenheid en vertrekintentie in een rapport',
      'Geen individuele retention-scores naar management',
      'Geschikt als basis voor vervolgmeting of gerichte opvolging',
    ],
  },
  {
    eyebrow: 'Retention Loop',
    price: 'vanaf EUR 4.950',
    description:
      'Voor organisaties die van een eerste RetentieScan willen doorgroeien naar een ritme met herhaalmeting, trendduiding en beter onderbouwde opvolging op behoud.',
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
  ['ExitScan', 'Je wilt begrijpen waarom mensen zijn gegaan en wat vertrek achteraf verklaart.'],
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
    'Omdat RetentieScan geen lichtere algemene survey is. Het product vraagt juist scherpere privacykaders, actieve-medewerkersduiding en een eigen managementverhaal.',
  ],
  [
    'Is RetentieScan een MTO-vervanger?',
    'Nee. Het product is smaller en scherper: het richt zich op behoudssignalen, vertrekintentie en beïnvloedbare werkfactoren.',
  ],
  [
    'Wanneer kies je voor een combinatiepakket?',
    'Als je zowel achteraf wilt begrijpen waarom mensen gingen als eerder wilt zien waar behoud nu onder druk staat.',
  ],
  [
    'Wat ziet management wel en niet?',
    'Management ziet groeps- en segmentinzichten. Bij RetentieScan tonen we geen individuele retention-scores of vertrekintentie op persoonsniveau.',
  ],
  [
    'Hoe vaak herhaal je RetentieScan?',
    'Voor v1 is een baseline het logische startpunt. Daarna is een ritme per kwartaal of halfjaar het meest logisch als je effect van acties wilt volgen.',
  ],
  [
    'Beloof je hiermee lager verloop?',
    'Nee. Verisight verkoopt geen garantie op lager verloop, maar scherpere duiding, betere prioritering en een sterkere basis voor managementbeslissingen.',
  ],
] as const

export const faqs = [
  [
    'Wat is het verschil tussen ExitScan en RetentieScan?',
    'ExitScan helpt begrijpen waarom mensen gingen. RetentieScan helpt eerder zien waar behoud onder druk staat bij actieve medewerkers.',
  ],
  [
    'Is RetentieScan gewoon een MTO?',
    'Nee. RetentieScan is smaller en scherper gepositioneerd: het richt zich op retentiesignalen, stay-intent, vertrekintentie en beïnvloedbare werkfactoren.',
  ],
  [
    'Wanneer kies je voor de combinatie?',
    'Als je zowel achteraf wilt begrijpen wat vertrek dreef als eerder wilt signaleren waar behoud nu aandacht vraagt.',
  ],
  [
    'Ziet management individuele retention-scores?',
    'Nee. RetentieScan is bedoeld voor groeps- en segmentinzichten, niet voor beoordeling of voorspelling op persoonsniveau.',
  ],
  [
    'Is RetentieScan een gevalideerde vertrekvoorspeller?',
    'Nee. Voor v1 positioneren we RetentieScan als SDT-gebaseerde managementscan voor behoudssignalen en prioritering, niet als wetenschappelijk gevalideerde voorspeller van vrijwillig vertrek.',
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
