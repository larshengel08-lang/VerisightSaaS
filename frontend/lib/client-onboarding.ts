import type { ScanType } from '@/lib/types'

export const FIRST_VALUE_THRESHOLDS = [
  {
    key: 'insufficient',
    label: 'Nog geen veilige detailweergave',
    minResponses: 0,
    maxResponses: 4,
    summary:
      'Gebruik de campagne nu vooral om respons op te bouwen. Dashboard en rapport blijven bewust terughoudend totdat er genoeg basis is.',
  },
  {
    key: 'indicative',
    label: 'Indicatief beeld',
    minResponses: 5,
    maxResponses: 9,
    summary:
      'Vanaf 5 responses ontstaat een eerste bruikbare detailweergave. Lees dit als richting, nog niet als stevig patroonbeeld voor brede managementconclusies.',
  },
  {
    key: 'pattern',
    label: 'Steviger patroonbeeld',
    minResponses: 10,
    maxResponses: null,
    summary:
      'Vanaf 10 responses wordt patroonanalyse en prioritering betekenisvoller. Vanaf dit punt zijn dashboard en rapport bedoeld als eerste managementinstrument.',
  },
] as const

export const CANONICAL_ONBOARDING_PHASES = [
  {
    key: 'route',
    title: 'Route en intake',
    owner: 'Verisight',
    boundary: 'buyer-facing',
    outcome: 'Heldere productroute, timing en eerste managementvraag.',
    customerAction: 'Deel context, urgentie en beoogde sponsor of contactpersoon.',
  },
  {
    key: 'implementation',
    title: 'Implementation intake',
    owner: 'Verisight',
    boundary: 'handoff',
    outcome: 'Datavoorwaarden, scanperiode, metadata en klantverwachting staan scherp.',
    customerAction: 'Bevestig doelgroep, scanmodus, contactpersoon en beschikbare metadata.',
  },
  {
    key: 'setup',
    title: 'Campaign setup',
    owner: 'Verisight',
    boundary: 'internal',
    outcome: 'Organisatie en campaign staan correct klaar voor uitvoering.',
    customerAction: 'Geen toolsetup; alleen validatie van naam, timing en doelgroep waar nodig.',
  },
  {
    key: 'import',
    title: 'Respondentimport en uitnodigingen',
    owner: 'Verisight',
    boundary: 'internal',
    outcome: 'Bestand is gecontroleerd, respondenten staan klaar en inviteflow is veilig gestart.',
    customerAction: 'Lever een bruikbaar respondentbestand aan volgens productspecifieke kolommen.',
  },
  {
    key: 'activation',
    title: 'Klantactivatie',
    owner: 'Verisight',
    boundary: 'client',
    outcome: 'De klant kan inloggen en ziet direct het juiste dashboard.',
    customerAction: 'Activeer account en open de juiste campaign of het overzicht.',
  },
  {
    key: 'dashboard',
    title: 'Eerste dashboardread',
    owner: 'Klant',
    boundary: 'client',
    outcome: 'De klant begrijpt wat al leesbaar is, wat nog indicatief is en wat de eerstvolgende vraag wordt.',
    customerAction: 'Lees eerst beslisoverzicht en campagnestatus voordat analyse of acties worden verdiept.',
  },
  {
    key: 'report',
    title: 'Rapportuitleg',
    owner: 'Verisight',
    boundary: 'shared',
    outcome: 'Rapport en dashboard vertellen hetzelfde managementverhaal.',
    customerAction: 'Gebruik rapport en dashboard samen voor bestuurlijke duiding en terugkoppeling.',
  },
  {
    key: 'management',
    title: 'Eerste managementgesprek',
    owner: 'Klant',
    boundary: 'shared',
    outcome: 'Eerste eigenaar, eerste vraag en eerste vervolgstap zijn expliciet gemaakt.',
    customerAction: 'Plan het eerste gesprek met sponsor, HR of MT op basis van de leeswijzer.',
  },
] as const

export const IMPLEMENTATION_INTAKE_INPUTS = [
  'Gekozen route',
  'Gewenste timing',
  'Scanmodus',
  'Doelgroep',
  'Benodigde metadata',
  'Contactpersoon',
  'Eerste managementdoel',
] as const

export const CLIENT_FILE_SPEC = {
  required: ['email'],
  recommended: ['department', 'role_level'],
  exitOptional: ['exit_month', 'annual_salary_eur'],
  retentionOptional: ['annual_salary_eur'],
  segmentDeepDiveNote:
    'Bij segment deep dive zijn nette metadata extra belangrijk. Zonder afdeling en functieniveau verliest de verdieping snel waarde.',
} as const

export const PRODUCT_ROUTE_VARIANTS = [
  {
    title: 'ExitScan Baseline',
    fit: 'Primaire eerste route',
    body:
      'Start meestal met een retrospectieve batch op ex-medewerkers. Geschikt om vertrek eerst bestuurlijk leesbaar te maken voordat live opvolging logisch wordt.',
  },
  {
    title: 'ExitScan Live',
    fit: 'Vervolgroute na baseline',
    body:
      'Past pas zodra proces, volume en eigenaarschap staan. Geen concurrerend eerste pakket, maar een begeleide vervolgroute op actuele uitstroom.',
  },
  {
    title: 'RetentieScan Baseline',
    fit: 'Complementaire eerste baseline',
    body:
      'Eerste retentieroute voor actieve medewerkers. Gericht op vroegsignalering, groepsduiding en een privacy-first managementbeeld.',
  },
  {
    title: 'RetentieScan ritme',
    fit: 'Vervolgroute na baseline',
    body:
      'Herhaalmeting per kwartaal of halfjaar nadat baseline en eerste opvolging staan. Gericht op trendduiding en betere managementopvolging.',
  },
] as const

export const CANONICAL_CUSTOMER_LIFECYCLE = [
  {
    key: 'first_route',
    title: 'Eerste route',
    body: 'Kies eerst welke managementvraag nu telt: meestal ExitScan Baseline, en alleen RetentieScan Baseline als de actieve behoudsvraag echt voorop staat.',
  },
  {
    key: 'first_value',
    title: 'Eerste waarde',
    body: 'Gebruik dashboard en rapport eerst om prioriteit, eerste eigenaar, eerste actie en reviewmoment expliciet te maken.',
  },
  {
    key: 'repeat_or_expand',
    title: 'Herhalen of uitbreiden',
    body: 'Kies pas daarna of dezelfde route logisch terugkomt, een verdieping nodig is of een tweede product de volgende managementvraag beter bedient.',
  },
] as const

type LifecycleDecisionCard = {
  title: string
  fit: string
  body: string
}

export function getLifecycleDecisionCards(scanType: ScanType): LifecycleDecisionCard[] {
  if (scanType === 'retention') {
    return [
      {
        title: 'Blijf op dezelfde route',
        fit: 'Standaard vervolg',
        body: 'RetentieScan ritme is de logische vervolgvorm zodra baseline, eerste managementopvolging en een reviewmoment al staan.',
      },
      {
        title: 'Verdiep bewust',
        fit: 'Alleen bij scherpe segmentvraag',
        body: 'Segment deep dive past alleen wanneer metadata op orde zijn en extra segmentduiding echt helpt bij prioritering of interventiekeuze.',
      },
      {
        title: 'Breid uit naar ExitScan',
        fit: 'Tweede product pas bij nieuwe vraag',
        body: 'Ga pas naar ExitScan wanneer retrospectieve vertrekduiding nodig blijkt om dezelfde behoudsthema\'s achteraf scherper te begrijpen.',
      },
    ] as const
  }

  if (scanType === 'pulse') {
    return [
      {
        title: 'Blijf op dezelfde route',
        fit: 'Standaard vervolg',
        body: 'Een volgende Pulse-cycle wordt pas logisch zodra deze eerste Pulse al gebruikt is voor een expliciete review, eigenaar, kleine correctie en afgesproken hercheck.',
      },
      {
        title: 'Verdiep bewust',
        fit: 'Alleen bij scherpere lokalisatievraag',
        body: 'Ga pas naar meer verfijning of extra verificatie wanneer dezelfde signalen echt om lokalisatie, bredere diagnose of scherper bewijs vragen.',
      },
      {
        title: 'Breid uit naar RetentieScan of diepere diagnose',
        fit: 'Tweede product bij nieuwe managementvraag',
        body: 'Kies pas een ander product wanneer dezelfde thema\'s niet meer alleen een reviewvraag zijn, maar een bredere behouds- of diagnosevraag worden die Pulse niet eerlijk kan dragen.',
      },
    ] as const
  }

  return [
    {
      title: 'Blijf op dezelfde route',
      fit: 'Quote-only vervolg',
      body: 'ExitScan Live wordt pas logisch wanneer proces, volume en eigenaarschap al staan en een begeleide vervolgroute op actuele uitstroom echt meerwaarde geeft.',
    },
    {
      title: 'Verdiep bewust',
      fit: 'Alleen bij metadata die het dragen',
      body: 'Segment deep dive hoort alleen bij de route wanneer afdeling, functieniveau en minimale n sterk genoeg zijn om extra segmentduiding geloofwaardig te maken.',
    },
    {
      title: 'Breid uit naar RetentieScan',
      fit: 'Tweede product pas na eerste waarde',
      body: 'RetentieScan Baseline wordt logisch zodra dezelfde thema\'s niet alleen achteraf moeten worden geduid, maar ook eerder in de actieve populatie moeten worden gesignaleerd.',
    },
  ] as const
}

export function getFirstManagementReadSteps(scanType: ScanType) {
  if (scanType === 'retention') {
    return [
      'Open eerst het beslisoverzicht en lees het retentiesignaal als groepssignaal, niet als individuele voorspelling.',
      'Gebruik een indicatief beeld vanaf 5 responses om richting te houden, maar wacht voor stevige patroonduiding bij voorkeur tot 10 responses of meer.',
      'Plan daarna de eerste managementsessie rond de vraag waar behoud nu onder druk staat, wie eerste eigenaar wordt, welke eerste interventie logisch is en wanneer het reviewmoment volgt.',
    ] as const
  }

  if (scanType === 'pulse') {
    return [
      'Open eerst het beslisoverzicht en lees Pulse als compacte managementread van dit meetmoment, niet als brede trendclaim.',
      'Gebruik een indicatief beeld vanaf 5 responses om een eerste reviewrichting te kiezen, maar wacht voor stevigere patroonduiding bij voorkeur tot 10 responses of meer.',
      'Plan daarna de eerste managementreview rond de vraag welk spoor nu bijsturing vraagt, wie eerste eigenaar wordt, welke kleine correctie volgt en wanneer de volgende bounded check plaatsvindt.',
    ] as const
  }

  return [
    'Open eerst het beslisoverzicht en lees het vertrekbeeld als managementsamenvatting van terugkerende werkfrictie, niet als losse exitfeedback.',
    'Gebruik een indicatief beeld vanaf 5 responses om richting te houden, maar wacht voor stevige patroonduiding bij voorkeur tot 10 responses of meer.',
    'Plan daarna de eerste managementsessie rond de vraag welk vertrekpatroon terugkeert, wie eerste eigenaar wordt, welke eerste verbeteractie logisch is en wanneer het reviewmoment volgt.',
  ] as const
}

export function getAdoptionSuccessDefinition(scanType: ScanType) {
  if (scanType === 'retention') {
    return 'Adoptie is pas geslaagd wanneer de klant niet alleen live is, maar het dashboard en rapport gebruikt om een eerste managementsessie over behoud, verificatie, eerste interventie en reviewmoment te voeren.'
  }
  if (scanType === 'pulse') {
    return 'Adoptie is pas geslaagd wanneer de klant Pulse gebruikt om een eerste reviewvraag, eigenaar, kleine correctie en volgend bounded checkmoment expliciet te maken.'
  }
  return 'Adoptie is pas geslaagd wanneer de klant niet alleen live is, maar het dashboard en rapport gebruikt om een eerste managementsessie over vertrekduiding, prioriteiten, eerste actie en reviewmoment te voeren.'
}
