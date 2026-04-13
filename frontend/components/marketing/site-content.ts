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

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}
