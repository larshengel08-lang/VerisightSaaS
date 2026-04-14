export type ReportPreviewVariant = 'portfolio' | 'exit' | 'retention'

export interface ReportPreviewHypothesis {
  title: string
  body: string
  question: string
}

export interface ReportPreviewCopy {
  label: string
  intro: string
  kpis: [string, string, string][]
  focusTitle: string
  nuance: string
  factorLead: string
  hypothesisLead: string
  hypotheses: ReportPreviewHypothesis[]
  proofNotes: [string, string][]
  trustTitle: string
  trustIntro: string
  trustPoints: [string, string][]
  demoLabel: string
  demoBody: string
}

export const REPORT_PREVIEW_COPY: Record<ReportPreviewVariant, ReportPreviewCopy> = {
  portfolio: {
    label: 'Portfolio-overzicht',
    intro:
      'Verisight vertaalt scans naar dezelfde managementstructuur: eerst de managementsamenvatting, daarna de eerste managementvraag en vervolgens de eerste logische stap.',
    kpis: [
      ['Actieve campagnes', '2 scans actief', 'ExitScan en RetentieScan'],
      ['Gemiddeld hoofdsignaal', '5,4 op 10', 'Bespreek met HR en MT'],
      ['Belangrijkste aandachtspunt', 'Groei', 'Hier is het meeste te winnen'],
      ['Stuurvraag', 'Vertrek of behoud?', 'Kies de juiste scanvorm'],
    ],
    focusTitle: 'Welke managementroute past nu het best?',
    nuance:
      'De output helpt kiezen waar gesprek, verificatie of actie het meeste oplevert. Verisight claimt geen individuele voorspelling of sluitende diagnose.',
    factorLead:
      'Per factor zie je de belevingsscore en de signaalwaarde. Zo kun je dezelfde managementtaal gebruiken voor vertrekduiding en vroegsignalering.',
    hypothesisLead:
      'Verisight vertaalt uitkomsten niet naar absolute conclusies, maar naar een managementgesprek met duidelijke verificatievragen, eigenaarschap en vervolgstappen.',
    hypotheses: [
      {
        title: 'Kies eerst de juiste managementvraag',
        body: 'Soms is het probleem vooral achteraf duiden waarom mensen gingen. Soms wil je eerder weten waar behoud onder druk staat. De scanvorm moet daarop aansluiten.',
        question: 'Willen we nu vooral leren van vertrek, of eerder sturen op behoud?',
      },
      {
        title: 'Gebruik dezelfde taal, niet dezelfde conclusie',
        body: 'Leiderschap, groei, cultuur en werkbelasting spelen in beide scans een rol. Het verschil zit in de managementvraag en de manier waarop je de uitkomst gebruikt.',
        question: 'Lezen we deze signalen als vertrekduiding of als vroegsignaal op behoud?',
      },
    ],
    proofNotes: [
      ['Managementsamenvatting', 'Dashboard en rapport openen met dezelfde bestuurlijke leesvolgorde'],
      ['Productspecifieke duiding', 'ExitScan en RetentieScan krijgen een eigen managementverhaal binnen één platform'],
      ['Begeleide output', 'Geen losse survey-export of self-serve tool'],
    ],
    trustTitle: 'Hoe je deze voorbeeldoutput leest',
    trustIntro:
      'Deze preview gebruikt fictieve data, maar volgt dezelfde managementstructuur, leesvolgorde en trustnotities als de live buyer-facing output.',
    trustPoints: [
      ['Intended use', 'Gebruik deze laag om te kiezen welke managementroute past: vertrekduiding, vroegsignalering of beide.'],
      ['Wat management ziet', 'Managementsamenvatting, topfactoren, eerste vraag en eerste logische stap in één executive lijn.'],
      ['Privacygrens', 'Groepsinzichten met minimale n-grenzen en geen individuele signalen naar management.'],
      ['Bewijsstatus', 'Methodisch onderbouwde managementoutput, geen diagnose of individuele voorspeller.'],
    ],
    demoLabel: 'Illustratief',
    demoBody:
      'Fictieve data. De managementstructuur, trustnotities en leesvolgorde volgen dezelfde lijn als de echte Verisight-output.',
  },
  exit: {
    label: 'ExitScan-voorbeeld',
    intro:
      'ExitScan opent met een managementsamenvatting die het vertrekbeeld terugbrengt tot hoofdreden, scherpste werkfactoren en eerste managementvraag.',
    kpis: [
      ['Reacties', '14 van 18', '78% respons'],
      ['Gemiddelde frictiescore', '5,8 op 10', 'Vergt nadere duiding'],
      ['Belangrijkste aandachtspunt', 'Groei', 'Hier is het meeste te winnen'],
      ['Gemiddelde diensttijd', '2,4 jaar', 'Van vertrekkende medewerkers'],
    ],
    focusTitle: 'Wat moet management nu eerst bespreken?',
    nuance:
      'ExitScan maakt patronen zichtbaar en helpt bepalen waar vervolgactie het meeste oplevert. Het blijft gegroepeerde vertrekduiding: geen individueel oordeel, geen diagnose en geen harde voorspelling.',
    factorLead:
      'Per factor zie je de belevingsscore en de signaalwaarde. Die signaalwaarde helpt bepalen welke werkfactor eerst bestuurlijke verificatie verdient.',
    hypothesisLead:
      'De rapportage vertaalt uitkomsten niet naar harde conclusies, maar naar werkhypothesen, een eerste eigenaar en een eerste logische 30-90 dagenactie.',
    hypotheses: [
      {
        title: 'Hypothese: leiderschap vraagt verdiepende validatie',
        body: 'Leiderschap komt terug als sterk aandachtssignaal en sluit aan op meerdere vertrekredenen. Dit wijst op een patroon dat eerst in gesprek moet worden gevalideerd.',
        question: 'Herkennen leidinggevenden dit beeld, en in welke teams lijkt het het sterkst te spelen?',
      },
      {
        title: 'Hypothese: groeiperspectief speelt structureel mee',
        body: 'Beperkt perspectief komt terug in zowel hoofdredenen als meespelende factoren. Dat maakt het een logisch thema om verder uit te diepen.',
        question: 'Weten medewerkers concreet wat hun volgende stap kan zijn binnen de organisatie?',
      },
    ],
    proofNotes: [
      ['Managementsamenvatting', 'Vertrekbeeld nu, eerste managementvraag en eerste logische stap in één leeslaag'],
      ['Werkhypothesen', 'Topfactoren worden vertaald naar te toetsen vragen en concrete opvolging'],
      ['Methodische nuance', 'Signalen en hypothesen, geen absolute waarheid of diagnose'],
      ['Bewijsstatus', 'Methodisch verdedigbaar en testmatig geborgd, maar niet extern gevalideerd als diagnostisch instrument'],
    ],
    trustTitle: 'Trust & interpretatie',
    trustIntro:
      'Ook in de preview blijft ExitScan zichtbaar begrensd: gegroepeerde vertrekduiding voor management, met expliciete leeswijzers over claims, privacy en bewijsstatus.',
    trustPoints: [
      ['Intended use', 'Terugkijkende vertrekduiding op groepsniveau voor HR, MT en directie.'],
      ['Wat management ziet', 'Frictiescore, vertrekbeeld, topfactoren, hypotheses en een eerste vervolgstap.'],
      ['Privacygrens', 'Detail pas vanaf voldoende responses, patroonanalyse pas vanaf 10 en segmenten alleen bij voldoende n.'],
      ['Bewijsstatus', 'Methodisch verdedigbaar en testmatig geborgd, maar niet extern gevalideerd als diagnostisch instrument.'],
    ],
    demoLabel: 'Illustratief voorbeeld',
    demoBody:
      'Fictieve voorbeelddata. De trustopbouw, managementtaal en rapportvolgorde zijn gelijk aan de live ExitScan-presentatie.',
  },
  retention: {
    label: 'RetentieScan-voorbeeld',
    intro:
      'RetentieScan opent met een managementsamenvatting die het groepsbeeld terugbrengt tot signaalprofiel, topfactoren en eerste verificatiespoor.',
    kpis: [
      ['Reacties', '63 van 92', '68% respons'],
      ['Gemiddeld retentiesignaal', '5,6 op 10', 'Breed aandachtssignaal'],
      ['Gemiddelde bevlogenheid', '6,8 op 10', 'Niet laag, wel ongelijk verdeeld'],
      ['Gemiddelde vertrekintentie', '4,7 op 10', 'Vraagt gerichte opvolging'],
    ],
    focusTitle: 'Waar vraagt behoud nu de meeste aandacht?',
    nuance:
      'RetentieScan is bedoeld voor groeps- en segmentduiding. De output is nadrukkelijk geen individuele voorspeller of performance-instrument, maar een v1-werkmodel voor verificatie en prioritering.',
    factorLead:
      'De factoranalyse laat zien waar behoudssignalen samenhangen met beïnvloedbare werkfactoren zoals leiderschap, groei en werkbelasting.',
    hypothesisLead:
      'De rapportage helpt management niet alleen zien wat spannend is, maar ook wie eerst moet valideren en welke 30-90 dagenactie logisch is.',
    hypotheses: [
      {
        title: 'Hypothese: werkdruk zet behoud in delen van de organisatie onder druk',
        body: 'Werkbelasting en hersteltijd laten een gemengd maar terugkerend signaal zien. In combinatie met hogere vertrekintentie is dit een logisch eerste gespreksthema.',
        question: 'Welke teams hebben structureel te weinig herstelruimte of voorspelbaarheid in planning?',
      },
      {
        title: 'Hypothese: groei en leidinggevend gedrag bepalen het verschil tussen teams',
        body: 'Het totaalbeeld is niet overal even zorgelijk, maar teams met zwakker groeiperspectief en minder steun van leidinggevenden wijken duidelijker af.',
        question: 'Waar ontbreekt nu het geloofwaardige groeiverhaal of de dagelijkse ondersteuning die medewerkers nodig hebben?',
      },
    ],
    proofNotes: [
      ['Managementsamenvatting', 'Groepsbeeld nu, eerste verificatiespoor en eerste logische stap in één executive laag'],
      ['Signaalmix', 'Retentiesignaal, stay-intent en vertrekintentie in één bestuurssamenvatting'],
      ['Actielogica', 'Topfactoren en vervolgstappen voor 30-90 dagen, zonder individuele voorspelling'],
      ['Bewijsstatus', 'Inhoudelijk plausibel, intern consistent en testmatig beschermd; nog geen pragmatisch bewezen predictor'],
    ],
    trustTitle: 'Trust & interpretatie',
    trustIntro:
      'De preview maakt dezelfde grens zichtbaar als live output: groeps- en segmentduiding voor verificatie en prioritering, zonder individuele predictor of performance-instrument te worden.',
    trustPoints: [
      ['Intended use', 'Vroegsignalering op behoud op groeps- en segmentniveau voor managementgesprek en opvolging.'],
      ['Wat management ziet', 'Retentiesignaal, stay-intent, vertrekintentie, bevlogenheid en topfactoren in één bestuurslaag.'],
      ['Privacygrens', 'Geen individuele signalen naar management, segmenten alleen bij voldoende n en open tekst alleen als groepssignaal.'],
      ['Bewijsstatus', 'V1-werkmodel: inhoudelijk plausibel, intern consistent en testmatig beschermd; geen bewezen predictor.'],
    ],
    demoLabel: 'Illustratief voorbeeld',
    demoBody:
      'Fictieve voorbeelddata. De live RetentieScan-output gebruikt dezelfde managementstructuur, trustnotes en productspecifieke leeswijzers.',
  },
}
