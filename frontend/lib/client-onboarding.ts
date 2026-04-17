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
    outcome: 'Eerste vraag, eerste eigenaar, eerste actie en vervolgstap zijn expliciet gemaakt.',
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
    body: 'Gebruik dashboard en rapport eerst om prioriteit, gekozen route, eerste stap en reviewmoment expliciet te maken.',
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
        body: 'RetentieScan ritme is de logische vervolgvorm zodra baseline, eerste managementroute en een reviewmoment al staan.',
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

  if (scanType === 'team') {
    return [
      {
        title: 'Blijf op dezelfde route',
        fit: 'Standaard vervolg',
        body: 'Nog een TeamScan-verdichting wordt pas logisch zodra deze eerste lokale read al gebruikt is voor een expliciete afdelingscheck, begrensde actie en lokaal reviewmoment.',
      },
      {
        title: 'Verdiep bewust',
        fit: 'Alleen bij scherpere lokale vraag',
        body: 'Verdiep pas verder wanneer dezelfde signalen echt om scherpere lokale handoff, extra boundary-support of zwaardere managementduiding vragen die TeamScan nu nog niet eerlijk ondersteunt.',
      },
      {
        title: 'Ga terug naar bredere diagnose of review',
        fit: 'Andere productvorm bij andere vraag',
        body: 'Kies pas een ander product wanneer de vraag niet meer lokaal is, maar weer een bredere behouds-, diagnose- of reviewvraag wordt die TeamScan niet eerlijk kan dragen na de eerste lokale managementhuddle.',
      },
    ] as const
  }

  if (scanType === 'onboarding') {
    return [
      {
        title: 'Blijf op dezelfde route',
        fit: 'Checkpoint vervolg pas later',
        body: 'Een volgend onboardingcheckpoint wordt pas logisch zodra deze eerste checkpointread al gebruikt is voor een expliciete managementvraag, een eerste eigenaar, een begrensde borg- of correctiestap en een afgesproken vervolgmoment.',
      },
      {
        title: 'Verdiep bewust',
        fit: 'Alleen bij scherpere lifecyclevraag',
        body: 'Verdiep pas verder wanneer dezelfde signalen echt om scherpere checkpointgrenzen, extra context of later een tweede checkpoint vragen die onboarding in deze wave nog niet eerlijk ondersteunt.',
      },
      {
        title: 'Ga naar een andere productvorm',
        fit: 'Andere vraag, ander product',
        body: 'Kies pas een ander product wanneer de vraag niet meer over vroege instroom gaat, maar over bredere behoudsdruk in RetentieScan, lokale lokalisatie in TeamScan of retrospectieve vertrekduiding in ExitScan die onboarding niet eerlijk kan dragen.',
      },
    ] as const
  }

  if (scanType === 'leadership') {
    return [
      {
        title: 'Blijf op dezelfde route',
        fit: 'Begrensd vervolg pas na eerste handoff',
        body: 'Nog een Leadership-check wordt pas logisch zodra deze eerste managementread al gebruikt is voor een expliciete eigenaar, een kleine verificatie of correctie en een afgesproken reviewmoment.',
      },
      {
        title: 'Verdiep bewust',
        fit: 'Alleen bij scherpere managementvraag',
        body: 'Verdiep pas verder wanneer dezelfde signalen echt om scherpere managementduiding vragen die nog steeds group-level en bounded kunnen blijven zonder named leaders of 360-logica te openen.',
      },
      {
        title: 'Ga terug naar bredere diagnose',
        fit: 'Andere productvorm bij andere vraag',
        body: 'Kies pas een ander product wanneer de vraag niet meer primair gaat over geaggregeerde managementcontext, maar om bredere diagnose, lokale lokalisatie in TeamScan of een andere suitevraag die Leadership Scan niet eerlijk kan dragen.',
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
      'Plan daarna de eerste managementsessie rond de vraag waar behoud nu onder druk staat, wie de eerste eigenaar wordt, welke route eerst gekozen wordt en wanneer het reviewmoment volgt.',
    ] as const
  }

  if (scanType === 'pulse') {
    return [
      'Open eerst het beslisoverzicht en lees Pulse als compacte managementread van dit meetmoment, niet als brede trendclaim.',
      'Gebruik een indicatief beeld vanaf 5 responses om een eerste reviewrichting te kiezen, maar wacht voor stevigere patroonduiding bij voorkeur tot 10 responses of meer.',
      'Plan daarna de eerste managementreview rond de vraag welk spoor nu bijsturing vraagt, welke kleine correctie volgt en wanneer de volgende bounded check plaatsvindt.',
    ] as const
  }

  if (scanType === 'team') {
    return [
      'Open eerst het beslisoverzicht en lees TeamScan als lokale contextlaag, niet als manager ranking of bewijs van een teamoorzaak.',
      'Gebruik een indicatief beeld vanaf 5 responses om een eerste lokale richting te zien, maar wacht voor stevigere lokale duiding bij voorkeur tot 10 responses of meer.',
      'Plan daarna de eerste managementreview rond de vraag welke afdeling eerst verificatie vraagt, welke begrensde actie nu logisch is en wanneer de lokale hercheck volgt.',
    ] as const
  }

  if (scanType === 'onboarding') {
    return [
      'Open eerst het beslisoverzicht en lees onboarding als checkpoint-read van nieuwe instroom op groepsniveau, niet als individuele, performance- of journey-claim.',
      'Gebruik een indicatief beeld vanaf 5 responses om een eerste stabiel, gemengd of scherp checkpoint te zien, maar wacht voor stevigere checkpointduiding bij voorkeur tot 10 responses of meer.',
      'Plan daarna de eerste managementreview rond de vraag welke vroege factor nu schuurt of juist werkt, wie de eerste eigenaar is, welke begrensde borg- of correctiestap volgt en wanneer een volgend checkpoint logisch is.',
    ] as const
  }

  if (scanType === 'leadership') {
    return [
      'Open eerst het beslisoverzicht en lees Leadership Scan als geaggregeerde managementread, niet als named leader view, manager ranking of performanceclaim.',
      'Gebruik een indicatief beeld vanaf 5 responses om een eerste stabiele, gemengde of scherpe managementcontext te zien, maar wacht voor stevigere managementduiding bij voorkeur tot 10 responses of meer.',
      'Plan daarna de eerste managementreview rond de vraag welke context nu eerst aandacht vraagt, wie de eerste eigenaar is, welke begrensde verificatie of correctie volgt en wanneer een bounded vervolgcheck logisch is.',
    ] as const
  }

  return [
    'Open eerst het beslisoverzicht en lees het vertrekbeeld als managementsamenvatting van terugkerende werkfrictie, niet als losse exitfeedback.',
    'Gebruik een indicatief beeld vanaf 5 responses om richting te houden, maar wacht voor stevige patroonduiding bij voorkeur tot 10 responses of meer.',
    'Plan daarna de eerste managementsessie rond de vraag welk vertrekpatroon terugkeert, welke eerste verbeterroute logisch is en wanneer het reviewmoment volgt.',
  ] as const
}

export function getAdoptionSuccessDefinition(scanType: ScanType) {
  if (scanType === 'retention') {
    return 'Adoptie is pas geslaagd wanneer de klant niet alleen live is, maar het dashboard en rapport gebruikt om een eerste managementsessie over behoud, verificatie, eerste eigenaar, routekeuze en reviewmoment te voeren.'
  }
  if (scanType === 'pulse') {
    return 'Adoptie is pas geslaagd wanneer de klant Pulse gebruikt om een eerste reviewvraag, kleine correctie en volgend bounded checkmoment expliciet te maken.'
  }
  if (scanType === 'team') {
    return 'Adoptie is pas geslaagd wanneer de klant TeamScan gebruikt om een eerste lokale verificatievraag, afdeling, begrensde actie en lokaal reviewmoment expliciet te maken.'
  }
  if (scanType === 'onboarding') {
    return 'Adoptie is pas geslaagd wanneer de klant onboarding gebruikt om een eerste checkpointread, eerste eigenaar, begrensde borg- of correctiestap en logisch vervolgmoment expliciet te maken.'
  }
  if (scanType === 'leadership') {
    return 'Adoptie is pas geslaagd wanneer de klant Leadership Scan gebruikt om een eerste managementread, eerste eigenaar, begrensde verificatie of correctie en logisch reviewmoment expliciet te maken.'
  }
  return 'Adoptie is pas geslaagd wanneer de klant niet alleen live is, maar het dashboard en rapport gebruikt om een eerste managementsessie over vertrekduiding, prioriteiten, routekeuze en reviewmoment te voeren.'
}
