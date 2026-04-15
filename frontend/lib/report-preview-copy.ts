import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

export type ReportPreviewVariant = 'portfolio' | 'exit' | 'retention'

export interface ReportPreviewHypothesis {
  title: string
  body: string
  question: string
}

export interface ReportPreviewDashboardRow {
  label: string
  value: string
  band: string
  width: string
  tone: 'red' | 'amber' | 'emerald'
}

export interface ReportPreviewFactorCard {
  label: string
  score: string
  signal: string
  band: string
  tone: 'red' | 'amber' | 'emerald'
}

export interface ReportPreviewCopy {
  label: string
  intro: string
  kpis: [string, string, string][]
  boardroomTitle: string
  boardroomIntro: string
  boardroomPoints: [string, string][]
  focusTitle: string
  dashboardRows: ReportPreviewDashboardRow[]
  nuance: string
  factorLead: string
  factorCards: ReportPreviewFactorCard[]
  hypothesisLead: string
  hypotheses: ReportPreviewHypothesis[]
  proofNotes: [string, string][]
  trustTitle: string
  trustIntro: string
  trustPoints: [string, string][]
  demoLabel: string
  demoBody: string
  supportVisualTitle: string
  supportVisualAlt: string
  sampleReportTitle?: string
  sampleReportBody?: string
  sampleReportHref?: string
  sampleReportLabel?: string
}

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export const REPORT_PREVIEW_COPY: Record<ReportPreviewVariant, ReportPreviewCopy> = {
  portfolio: {
    label: 'Portfolio-overzicht',
    intro:
      'Verisight vertaalt scans naar dezelfde boardroom-structuur: eerst de managementsamenvatting, daarna de bestuurlijke weging, vervolgens de eerste managementsessie en pas daarna de eerste logische stap. Gebruik dit overzicht in gesprekken om eerst de juiste route te kiezen, niet om meteen alles tegelijk te verkopen.',
    kpis: [
      ['Actieve campagnes', '2 scans actief', 'ExitScan en RetentieScan'],
      ['Gemiddeld hoofdsignaal', '5,4 op 10', 'Bespreek met HR, sponsor en MT'],
      ['Belangrijkste aandachtspunt', 'Groei', 'Hier is het meeste te winnen'],
      ['Stuurvraag', 'Vertrek of behoud?', 'Kies de juiste scanvorm'],
    ],
    boardroomTitle: 'Bestuurlijke handoff',
    boardroomIntro:
      'Dezelfde executive lijn loopt door in dashboard, rapport en preview: wat speelt nu, waarom telt dat, welk besluit hoort eerst en wat moet management vooral niet overclaimen.',
    boardroomPoints: [
      ['Wat speelt nu', 'Per product zie je het hoofdbeeld in een compacte sponsor- en directieread.'],
      ['Waarom telt dit nu', 'De toplaag maakt zichtbaar waarom dit een bestuurlijk prioriteitsspoor is en niet alleen een HR-observatie.'],
      ['Wat niet concluderen', 'Verisight versnelt weging en gesprek, maar verkoopt geen diagnose, individuele voorspeller of sluitende causaliteit.'],
    ],
    focusTitle: 'Welke managementroute past nu het best?',
    dashboardRows: [
      { label: 'ExitScan', value: 'Vertrekduiding', band: 'Eerste route', width: '64%', tone: 'red' },
      { label: 'RetentieScan', value: 'Behoud eerst signaleren', band: 'Specifieke route', width: '52%', tone: 'amber' },
      { label: 'Combinatie', value: 'Bewuste portfolioroute', band: 'Pas daarna', width: '45%', tone: 'emerald' },
    ],
    nuance:
      'De output helpt kiezen waar gesprek, verificatie of actie het meeste oplevert. Verisight claimt geen individuele voorspelling of sluitende diagnose.',
    factorLead:
      'Per factor zie je de belevingsscore en de signaalwaarde. Zo kun je dezelfde managementtaal gebruiken voor vertrekduiding en vroegsignalering.',
    factorCards: [
      { label: 'Leiderschap', score: '4,7', signal: '6,3', band: 'Nu bespreken', tone: 'red' },
      { label: 'Groei', score: '4,9', signal: '6,1', band: 'Nu bespreken', tone: 'red' },
      { label: 'Psychologische veiligheid', score: '5,6', signal: '5,4', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Beloning & voorwaarden', score: '6,1', signal: '4,9', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Werkbelasting', score: '6,4', signal: '4,6', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Rolhelderheid', score: '7,1', signal: '3,9', band: 'OK', tone: 'emerald' },
    ],
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
      ['Productspecifieke duiding', 'ExitScan en RetentieScan krijgen een eigen managementverhaal binnen een platform'],
      ['Routekeuze eerst', 'ExitScan is meestal de eerste demo; RetentieScan volgt wanneer de actieve behoudsvraag echt centraal staat'],
      ['Begeleide output', 'Geen losse survey-export of self-serve tool'],
    ],
    trustTitle: 'Hoe je deze voorbeeldoutput leest',
    trustIntro:
      'Deze preview gebruikt fictieve data, maar volgt dezelfde managementstructuur, leesvolgorde en trustnotities als de live buyer-facing output.',
    trustPoints: [
      ['Intended use', 'Gebruik deze laag om te kiezen welke managementroute past: vertrekduiding, vroegsignalering of beide.'],
      ['Wat management ziet', 'Managementsamenvatting, topfactoren, eerste managementsessie, eerste vraag en eerste logische stap in een executive lijn.'],
      ['Privacygrens', 'Groepsinzichten met minimale n-grenzen en geen individuele signalen naar management.'],
      ['Bewijsstatus', 'Methodisch onderbouwde managementoutput, geen diagnose of individuele voorspeller.'],
    ],
    demoLabel: 'Illustratief',
    demoBody:
      'Fictieve data. De managementstructuur, trustnotities en leesvolgorde volgen dezelfde lijn als de echte Verisight-output.',
    supportVisualTitle: 'Segment deep dive preview',
    supportVisualAlt: 'Voorbeeld van een Verisight segment deep dive',
    sampleReportTitle: 'Waar je het volledige voorbeeld ziet',
    sampleReportBody:
      'Gebruik de portfolio-preview als routekiezer. Het volledige buyer-facing voorbeeldrapport open je daarna op de productspecifieke ExitScan- of RetentieScan-pagina.',
    sampleReportHref: '/producten',
    sampleReportLabel: 'Bekijk productspecifieke voorbeelden',
  },
  exit: {
    label: 'ExitScan-voorbeeld',
    intro:
      'ExitScan opent met een managementsamenvatting die het vertrekbeeld terugbrengt tot hoofdreden, bestuurlijke relevantie, eerste managementvraag, eerste managementsessie en compacte handoff voor sponsor of directie. Dit is meestal de logischste eerste demo voor nieuwe buyers.',
    kpis: [
      ['Reacties', '14 van 18', '78% respons'],
      ['Gemiddelde frictiescore', '5,8 op 10', 'Vergt nadere duiding'],
      ['Belangrijkste aandachtspunt', 'Groei', 'Hier is het meeste te winnen'],
      ['Gemiddelde diensttijd', '2,4 jaar', 'Van vertrekkende medewerkers'],
    ],
    boardroomTitle: 'Bestuurlijke handoff',
    boardroomIntro:
      'ExitScan vat de top van het rapport samen in een compacte sponsor-read: wat speelt nu, waarom is dit bestuurlijk relevant, wie trekt het spoor en welke stap hoort als eerste.',
    boardroomPoints: [
      ['Wat speelt nu', 'Leiderschap en groeiperspectief kleuren het terugkerende vertrekbeeld.'],
      ['Waarom telt dit nu', 'Een breed werksignaal maakt dit relevant voor managementprioritering en niet alleen voor HR-nazorg.'],
      ['Wat niet concluderen', 'Dit is vertrekduiding op groepsniveau, geen bewijs van de ene oorzaak en geen garantie op lagere uitstroom.'],
    ],
    focusTitle: 'Wat moet management nu eerst bespreken?',
    dashboardRows: [
      { label: 'Leiderschap', value: '6,3', band: 'Nu bespreken', width: '63%', tone: 'red' },
      { label: 'Groei', value: '6,1', band: 'Nu bespreken', width: '61%', tone: 'red' },
      { label: 'Beloning & voorwaarden', value: '4,9', band: 'Verder bekijken', width: '49%', tone: 'amber' },
      { label: 'Werkbelasting', value: '4,6', band: 'Verder bekijken', width: '46%', tone: 'amber' },
    ],
    nuance:
      'ExitScan maakt patronen zichtbaar en helpt bepalen waar vervolgactie het meeste oplevert. Het blijft gegroepeerde vertrekduiding: geen individueel oordeel, geen diagnose, geen harde voorspelling en geen geforceerde ROI-claim.',
    factorLead:
      'Per factor zie je de belevingsscore en de signaalwaarde. Die signaalwaarde helpt bepalen welke werkfactor eerst bestuurlijke verificatie en eigenaarschap verdient.',
    factorCards: [
      { label: 'Leiderschap', score: '4,7', signal: '6,3', band: 'Nu bespreken', tone: 'red' },
      { label: 'Groei', score: '4,9', signal: '6,1', band: 'Nu bespreken', tone: 'red' },
      { label: 'Psychologische veiligheid', score: '5,6', signal: '5,4', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Beloning & voorwaarden', score: '6,1', signal: '4,9', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Werkbelasting', score: '6,4', signal: '4,6', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Rolhelderheid', score: '7,1', signal: '3,9', band: 'OK', tone: 'emerald' },
    ],
    hypothesisLead:
      'De rapportage vertaalt uitkomsten niet naar harde conclusies, maar naar werkhypothesen, bestuurlijke handoff, een eerste managementsessie, eerste eigenaar en een eerste logische 30-90 dagenactie met reviewmoment.',
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
      ['Managementsamenvatting', 'Vertrekbeeld nu, bestuurlijke relevantie, eerste managementsessie en eerste logische stap in een leeslaag'],
      ['Bestuurlijke handoff', 'Compacte sponsor-read met eerste besluit, eerste eigenaar en wat je niet moet overclaimen'],
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
      'Fictieve voorbeelddata. De trustopbouw, managementtaal en rapportvolgorde zijn gelijk aan de live ExitScan-presentatie waarmee Lars normaal de eerste route uitlegt.',
    supportVisualTitle: 'Segment deep dive preview',
    supportVisualAlt: 'Voorbeeld van een ExitScan segment deep dive',
    sampleReportTitle: 'Volledig buyer-facing voorbeeldrapport',
    sampleReportBody:
      'Open hier het actuele ExitScan-voorbeeldrapport met fictieve data, zonder vertrouwelijke klantframing en in dezelfde managementstructuur als de echte output.',
    sampleReportHref: exitSampleAsset?.publicHref,
    sampleReportLabel: 'Open ExitScan-voorbeeldrapport',
  },
  retention: {
    label: 'RetentieScan-voorbeeld',
    intro:
      'RetentieScan opent met een managementsamenvatting die het groepsbeeld terugbrengt tot signaalprofiel, bestuurlijke weging, eerste verificatiespoor, eerste managementsessie en compacte handoff voor sponsor of directie. In demo\'s komt deze route meestal na ExitScan, tenzij de buyer-vraag expliciet over actieve medewerkers gaat.',
    kpis: [
      ['Reacties', '63 van 92', '68% respons'],
      ['Gemiddeld retentiesignaal', '5,6 op 10', 'Breed aandachtssignaal'],
      ['Gemiddelde bevlogenheid', '6,8 op 10', 'Niet laag, wel ongelijk verdeeld'],
      ['Gemiddelde vertrekintentie', '4,7 op 10', 'Vraagt gerichte opvolging'],
    ],
    boardroomTitle: 'Bestuurlijke handoff',
    boardroomIntro:
      'RetentieScan vat de top van het rapport samen in een compacte sponsor-read: waar staat behoud onder druk, waarom moet dit nu gewogen worden en wie trekt verificatie en eerste opvolging.',
    boardroomPoints: [
      ['Wat speelt nu', 'Het groepsbeeld laat zien waar behoudsdruk oploopt en welke werkfactoren dat het scherpst kleuren.'],
      ['Waarom telt dit nu', 'Zichtbare vertrekintentie of stille behoudsdruk raken teamcontinuiteit, leiding en uitvoerbaarheid.'],
      ['Wat niet concluderen', 'Dit blijft een verification-first groepssignaal en geen individuele predictor, performance-score of bewezen risicomodel.'],
    ],
    focusTitle: 'Waar vraagt behoud nu de meeste aandacht?',
    dashboardRows: [
      { label: 'Groei', value: '5,9', band: 'Eerst verifieren', width: '59%', tone: 'red' },
      { label: 'Werkbelasting', value: '5,6', band: 'Eerst verifieren', width: '56%', tone: 'red' },
      { label: 'Leiderschap', value: '5,1', band: 'Verder bekijken', width: '51%', tone: 'amber' },
      { label: 'Psychologische veiligheid', value: '4,7', band: 'Verder bekijken', width: '47%', tone: 'amber' },
    ],
    nuance:
      'RetentieScan is bedoeld voor groeps- en segmentduiding. De output is nadrukkelijk geen individuele voorspeller of performance-instrument, maar een v1-werkmodel voor verificatie en prioritering.',
    factorLead:
      'De factoranalyse laat zien waar het retentiesignaal samenhangt met beinvloedbare werkfactoren zoals leiderschap, groei en werkbelasting.',
    factorCards: [
      { label: 'Groei', score: '4,8', signal: '5,9', band: 'Eerst verifieren', tone: 'red' },
      { label: 'Werkbelasting', score: '5,0', signal: '5,6', band: 'Eerst verifieren', tone: 'red' },
      { label: 'Leiderschap', score: '5,8', signal: '5,1', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Psychologische veiligheid', score: '7,5', signal: '4,7', band: 'Verder bekijken', tone: 'amber' },
      { label: 'Beloning & voorwaarden', score: '7,0', signal: '4,0', band: 'Stabiel', tone: 'emerald' },
      { label: 'Rolhelderheid', score: '7,1', signal: '3,8', band: 'Stabiel', tone: 'emerald' },
    ],
    hypothesisLead:
      'De rapportage helpt management niet alleen zien wat spannend is, maar ook wie eerst moet valideren, welke eerste interventie logisch is en wanneer het reviewmoment volgt.',
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
      ['Managementsamenvatting', 'Groepsbeeld nu, bestuurlijke weging, eerste managementsessie en eerste logische stap in een executive laag'],
      ['Bestuurlijke handoff', 'Compacte sponsor-read met eerste besluit, eerste eigenaar en expliciete watchout tegen overinterpretatie'],
      ['Signaalmix', 'Retentiesignaal, stay-intent en vertrekintentie in een bestuurssamenvatting'],
      ['Actielogica', 'Topfactoren en vervolgstappen voor 30-90 dagen, zonder individuele voorspelling'],
      ['Bewijsstatus', 'Inhoudelijk plausibel, intern consistent en testmatig beschermd; nog geen pragmatisch bewezen predictor'],
    ],
    trustTitle: 'Trust & interpretatie',
    trustIntro:
      'De preview maakt dezelfde grens zichtbaar als live output: groeps- en segmentduiding voor verificatie en prioritering, zonder individuele predictor of performance-instrument te worden.',
    trustPoints: [
      ['Intended use', 'Vroegsignalering op behoud op groeps- en segmentniveau voor managementgesprek en opvolging.'],
      ['Wat management ziet', 'Retentiesignaal, stay-intent, vertrekintentie, bevlogenheid en topfactoren in een bestuurslaag.'],
      ['Privacygrens', 'Geen individuele signalen naar management, segmenten alleen bij voldoende n en open tekst alleen als groepssignaal.'],
      ['Bewijsstatus', 'V1-werkmodel: inhoudelijk plausibel, intern consistent en testmatig beschermd; geen bewezen predictor.'],
    ],
    demoLabel: 'Illustratief voorbeeld',
    demoBody:
      'Fictieve voorbeelddata. De live RetentieScan-output gebruikt dezelfde managementstructuur, trustnotes en productspecifieke leeswijzers als in een specifieke behoudsdemo.',
    supportVisualTitle: 'Segment deep dive preview',
    supportVisualAlt: 'Voorbeeld van een RetentieScan segment deep dive',
    sampleReportTitle: 'Volledig buyer-facing voorbeeldrapport',
    sampleReportBody:
      'Open hier het actuele RetentieScan-voorbeeldrapport met fictieve data, verification-first lezing en dezelfde trustgrenzen als de echte output.',
    sampleReportHref: retentionSampleAsset?.publicHref,
    sampleReportLabel: 'Open RetentieScan-voorbeeldrapport',
  },
}
