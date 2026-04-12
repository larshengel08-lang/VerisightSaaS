export const comparisonCards = [
  {
    title: 'Losse exitgesprekken',
    description:
      'Geven context per persoon, maar zolang ze niet vergelijkbaar zijn over afdelingen en perioden, blijft het organisatiepatroon onzichtbaar.',
    outcome: 'Verisight bundelt losse signalen tot patronen en prioriteiten.',
  },
  {
    title: 'Standaard surveytool',
    description:
      'Geeft software, maar laat inrichting, opvolging en duiding vaak bij HR liggen.',
    outcome: 'Verisight combineert tooling met begeleiding en rapportage.',
  },
  {
    title: 'Consultancytraject',
    description:
      'Kan waardevol zijn, maar voelt vaak zwaarder en duurder dan nodig voor structureel uitstroominzicht.',
    outcome: 'Verisight is compacter, sneller te starten en duidelijker geprijsd.',
  },
] as const

export const trustItems = [
  'Begeleide inrichting en uitvoering',
  'Dashboard en managementrapport',
  'Gehost in Europa',
  'Methodische basis vanuit A&O-psychologie',
] as const

export const statCards = [
  {
    value: 'Binnen weken',
    label: 'eerste managementbeeld',
    detail: 'Van inrichting tot eerste rapportage in een vaste, begeleide vorm.',
  },
  {
    value: 'Baseline of Live',
    label: 'duidelijke scanvorm',
    detail: 'Baseline als instap, Live als vervolgstap of op aanvraag.',
  },
  {
    value: 'Dashboard + rapport',
    label: 'vaste output',
    detail: 'Met optionele segment deep dive voor scherpere subgroepanalyse.',
  },
] as const

export const outcomeCards = [
  [
    'Sneller prioriteiten stellen met HR, MT en directie',
    "Je ziet welke thema's eerst aandacht vragen en waar verdiepend gesprek of actie het meeste oplevert.",
  ],
  [
    'Gerichtere verbeteracties kiezen',
    'Je ziet of vertrek vooral wijst op leiderschap, groei, cultuur, onboarding of werkbelasting.',
  ],
  [
    'Minder discussie, meer gedeelde taal',
    'Dashboard en rapportage helpen om sneller op één lijn te komen over wat eerst gevalideerd moet worden.',
  ],
  [
    'Geen extra surveyproces voor HR',
    'Verisight begeleidt de uitvoering, zodat jouw team niet ook nog toolbeheer hoeft te organiseren.',
  ],
  [
    'Output die intern doorgezet kan worden',
    'Het traject levert materiaal op dat bruikbaar is voor MT-overleg, prioritering en vervolgstappen.',
  ],
  [
    'Basis voor retentiebeleid',
    'Als patronen duidelijk zijn, kun je gerichter bepalen waar vervolgonderzoek of interventie nodig is.',
  ],
] as const

export const processHighlights = [
  {
    title: 'Voor HR',
    text: 'Minder losse signalen en sneller een gedeeld beeld van waar vertrek zich opstapelt.',
  },
  {
    title: 'Voor MT',
    text: 'Een bruikbare basis om te bepalen waar gerichte actie het meeste effect kan hebben.',
  },
  {
    title: 'Voor directie',
    text: 'Compacte stuurinformatie over terugkerende patronen in plaats van incidenten per case.',
  },
] as const

export const included = [
  'Inrichting van het exitscan-traject',
  'Uitnodigingen en twee herinneringen voor respondenten',
  'Dashboard met terugkerende vertrekpatronen',
  'Managementrapport met prioriteiten en nuance',
  'Zelfstandig leesbare output voor HR, MT en directie',
  'Publieke privacy- en voorwaardenpagina voor interne afstemming',
  'Binnen enkele weken eerste inzichten zonder implementatietraject',
  'Methodische basis vanuit arbeids- en organisatiepsychologie',
] as const

export const faqs = [
  [
    'Hoe snel kunnen we starten?',
    'Na een kort verkennend gesprek kunnen we meestal snel aangeven of ExitScan past en welke planning logisch is.',
  ],
  [
    'Hoeveel werk vraagt dit van HR?',
    'Beperkt. Wij begeleiden inrichting, uitnodigingen en rapportage; HR levert vooral context en interne afstemming.',
  ],
  [
    'Vanaf hoeveel exits is dit zinvol?',
    'ExitScan werkt het best wanneer er doorlopend uitstroom is en je patronen wilt herkennen in plaats van losse incidenten wilt bespreken.',
  ],
  [
    'Wat als de respons lager uitvalt dan gehoopt?',
    'Dan laten we dat expliciet terugkomen in de duiding, zodat de output niet stelliger wordt dan de data toelaat.',
  ],
  [
    'Is Verisight een tool of een dienst?',
    'Het is een begeleide dienst met software. Je krijgt dashboard en rapportage, zonder self-service implementatie.',
  ],
  [
    'Zijn antwoorden herleidbaar naar individuen?',
    'De output is bedoeld voor groepsinzichten. Privacy, minimum aantallen en zorgvuldige interpretatie worden expliciet meegenomen.',
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
