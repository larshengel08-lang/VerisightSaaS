import { MANAGEMENT_BAND_LABELS, MANAGEMENT_CONTEXT_LABELS } from '@/lib/management-language'
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
  scoreDisplay: string
  band: string
  tone: 'red' | 'amber' | 'emerald'
  signalDisplay?: string
  showSignal?: boolean
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
    label: 'Voorbeeldoutput',
    intro:
      'Hier ziet u wat u krijgt: een dashboard, een korte samenvatting, duidelijke prioriteiten en een logische vervolgstap.',
    kpis: [
      ['Actieve scans', '2 scans', 'ExitScan en RetentieScan'],
      ['Totaalbeeld', '5,4 op 10', 'Vraagt om een gesprek'],
      ['Wat valt op', 'Groei', 'Hier ligt nu de meeste druk'],
      ['Eerste keuze', 'Vertrek of behoud?', 'Kies wat nu past'],
    ],
    boardroomTitle: 'Korte samenvatting',
    boardroomIntro:
      'Dashboard, samenvatting en rapport vertellen hetzelfde verhaal: wat speelt nu, wat valt op en wat eerst besproken moet worden.',
    boardroomPoints: [
      ['Wat speelt nu', 'Per scan ziet u in een oogopslag wat het hoofdbeeld is.'],
      ['Wat valt op', 'De samenvatting laat meteen zien waar het gesprek over moet gaan.'],
      ['Wat volgt', 'U ziet ook welke stap daarna het meest voor de hand ligt.'],
    ],
    focusTitle: 'Welke scan past nu het best?',
    dashboardRows: [
      { label: 'ExitScan', value: 'Vertrekduiding', band: 'Eerste route', width: '64%', tone: 'red' },
      { label: 'RetentieScan', value: 'Behoud eerst signaleren', band: 'Specifieke route', width: '52%', tone: 'amber' },
      { label: 'Combinatie', value: 'Portfolioroute', band: 'Pas daarna', width: '45%', tone: 'emerald' },
    ],
    nuance:
      'De uitkomst helpt kiezen waar gesprek, toetsing of actie het meeste oplevert. Er worden geen conclusies over individuen getrokken.',
    factorLead:
      'Per onderwerp ziet u eerst hoe het wordt ervaren en daarna waar de grootste aandachtspunten zitten.',
    factorCards: [
      { label: 'Leiderschap', scoreDisplay: '4,7/10', signalDisplay: '6,3/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Groei', scoreDisplay: '4,9/10', signalDisplay: '6,1/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Psychologische veiligheid', scoreDisplay: '5,6/10', signalDisplay: '5,4/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Beloning & voorwaarden', scoreDisplay: '6,1/10', signalDisplay: '4,9/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Werkbelasting', scoreDisplay: '6,4/10', signalDisplay: '4,6/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Rolhelderheid', scoreDisplay: '7,1/10', signalDisplay: '3,9/10', showSignal: true, band: MANAGEMENT_CONTEXT_LABELS.stabilizing, tone: 'emerald' },
    ],
    hypothesisLead:
      'De uitkomst leidt niet tot een harde conclusie, maar tot een duidelijk gesprek met vragen die eerst getoetst moeten worden.',
    hypotheses: [
      {
        title: 'Kies eerst de juiste vraag',
        body: 'Soms wilt u vooral begrijpen waarom mensen vertrokken. Soms wilt u eerder zien waar behoud onder druk staat. De scan moet daarop aansluiten.',
        question: 'Wilt u nu vooral leren van vertrek, of eerder zien waar behoud schuift?',
      },
      {
        title: 'Niet elke uitkomst vraagt dezelfde scan',
        body: 'Onderwerpen als leiderschap, groei en werkdruk kunnen in beide scans terugkomen. Het verschil zit in de vraag die u nu wilt beantwoorden.',
        question: 'Gaat het nu vooral om vertrek, of juist om behoud?',
      },
    ],
    proofNotes: [
      ['Samenvatting', 'Dashboard en rapport openen met hetzelfde hoofdbeeld'],
      ['Per scan toegespitst', 'ExitScan en RetentieScan laten elk een eigen vraag en uitkomst zien'],
      ['Eerst kiezen, dan verdiepen', 'Vaak begint het met ExitScan of RetentieScan en volgt daarna pas een vervolgstap'],
      ['Gesprek klaar', 'De uitkomst helpt om snel een goed eerste gesprek te voeren'],
    ],
    trustTitle: 'Begrenzing',
    trustIntro:
      'Deze preview gebruikt fictieve data, maar volgt dezelfde opbouw en grenzen als de echte output.',
    trustPoints: [
      ['Waarvoor dit dient', 'Gebruik deze output om te kiezen welke scan nu het best past.'],
      ['Wat u ziet', 'Samenvatting, topfactoren, gesprekspunten en een logische vervolgstap.'],
      ['Privacy', 'Alleen groepsinzichten, met minimale groepsgroottes en geen individuele signalen.'],
      ['Begrenzing', 'Dit helpt richting geven, maar is geen diagnose of individuele voorspeller.'],
    ],
    demoLabel: 'Illustratief',
    demoBody:
      'Fictieve data. Opbouw, leesvolgorde en grenzen volgen dezelfde lijn als de echte Verisight-output.',
    supportVisualTitle: 'Verdieping per groep',
    supportVisualAlt: 'Voorbeeld van een Verisight verdieping per groep',
    sampleReportTitle: 'Waar u het volledige voorbeeld ziet',
    sampleReportBody:
      'Gebruik deze preview om te zien wat u krijgt. De volledige voorbeeldrapporten vindt u daarna bij ExitScan en RetentieScan.',
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
      'ExitScan vat de top van het rapport samen in een compacte sponsor-read: wat speelt nu, waarom is dit bestuurlijk relevant en welke factoren kleuren dat beeld het sterkst.',
    boardroomPoints: [
      ['Wat speelt nu', 'Leiderschap en groeiperspectief kleuren het terugkerende vertrekbeeld.'],
      ['Waarom telt dit nu', 'Een breed werksignaal maakt dit relevant voor managementprioritering en niet alleen voor HR-nazorg.'],
      ['Wat niet concluderen', 'Dit is vertrekduiding op groepsniveau, geen bewijs van de ene oorzaak en geen garantie op lagere uitstroom.'],
    ],
    focusTitle: 'Wat moet management nu eerst bespreken?',
    dashboardRows: [
      { label: 'Leiderschap', value: '6,3', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '63%', tone: 'amber' },
      { label: 'Groei', value: '6,1', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '61%', tone: 'amber' },
      { label: 'Beloning & voorwaarden', value: '4,9', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '49%', tone: 'amber' },
      { label: 'Werkbelasting', value: '4,6', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '46%', tone: 'amber' },
    ],
    nuance:
      'ExitScan maakt patronen zichtbaar en helpt bepalen waar vervolgactie het meeste oplevert. Het blijft gegroepeerde vertrekduiding: geen individueel oordeel, geen diagnose, geen harde voorspelling en geen geforceerde ROI-claim.',
    factorLead:
      'Per factor zie je eerst de belevingsscore en daarna de managementstatus. Signaalsterkte blijft alleen ondersteunend waar extra verdieping helpt verklaren waarom dit vertrekbeeld ontstaat.',
    factorCards: [
      { label: 'Leiderschap', scoreDisplay: '4,7/10', signalDisplay: '6,3/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Groei', scoreDisplay: '4,9/10', signalDisplay: '6,1/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Psychologische veiligheid', scoreDisplay: '5,6/10', signalDisplay: '5,4/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Beloning & voorwaarden', scoreDisplay: '6,1/10', signalDisplay: '4,9/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Werkbelasting', scoreDisplay: '6,4/10', signalDisplay: '4,6/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Rolhelderheid', scoreDisplay: '7,1/10', signalDisplay: '3,9/10', showSignal: true, band: MANAGEMENT_CONTEXT_LABELS.stabilizing, tone: 'emerald' },
    ],
    hypothesisLead:
      'De rapportage vertaalt uitkomsten niet naar harde conclusies, maar naar werkhypothesen die eerst getoetst moeten worden voordat management een eerste eigenaar, route en eerste stap kiest.',
    hypotheses: [
      {
        title: 'Hypothese: leiderschap vraagt verdiepende validatie',
        body: 'Leiderschap komt terug als aandachtspunt en sluit aan op meerdere vertrekredenen. Dit wijst op een patroon dat eerst in gesprek moet worden gevalideerd.',
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
      ['Bestuurlijke handoff', 'Compacte sponsor-read met wat nu speelt, waarom dat telt en wat je niet moet overclaimen'],
      ['Werkhypothesen', 'Topfactoren worden vertaald naar te toetsen vragen voordat de eerste route wordt gekozen'],
      ['Methodische nuance', 'Signalen en hypothesen, geen absolute waarheid of diagnose'],
      ['Bewijsstatus', 'Methodisch verdedigbaar en testmatig geborgd, maar niet extern gevalideerd als diagnostisch instrument'],
    ],
    trustTitle: 'Trust & interpretatie',
    trustIntro:
      'Ook in de preview blijft ExitScan zichtbaar begrensd: gegroepeerde vertrekduiding voor management, met expliciete leeswijzers over claims, privacy en bewijsstatus.',
    trustPoints: [
      ['Intended use', 'Terugkijkende vertrekduiding op groepsniveau voor HR, MT en directie.'],
      ['Wat management ziet', 'Frictiescore, vertrekbeeld, topfactoren, hypotheses en een gekozen vervolgrichting.'],
      ['Privacygrens', 'Detail pas vanaf voldoende responses, patroonanalyse pas vanaf 10 en segmenten alleen bij voldoende n.'],
      ['Bewijsstatus', 'Methodisch verdedigbaar en testmatig geborgd, maar niet extern gevalideerd als diagnostisch instrument.'],
    ],
    demoLabel: 'Illustratief voorbeeld',
    demoBody:
      'Fictieve voorbeelddata. De trustopbouw, managementtaal en rapportvolgorde zijn gelijk aan de live ExitScan-presentatie waarmee Lars normaal de eerste route uitlegt.',
    supportVisualTitle: 'Segment deep dive preview',
    supportVisualAlt: 'Voorbeeld van een ExitScan segment deep dive',
    sampleReportTitle: 'Volledig voorbeeldrapport',
    sampleReportBody:
      'Open hier het actuele ExitScan-voorbeeldrapport met fictieve data, zonder vertrouwelijke klantframing en in dezelfde managementstructuur als de echte output.',
    sampleReportHref: exitSampleAsset?.publicHref,
    sampleReportLabel: 'Open ExitScan-voorbeeldrapport',
  },
  retention: {
    label: 'RetentieScan-voorbeeld',
    intro:
      "RetentieScan opent met een managementsamenvatting die het groepsbeeld terugbrengt tot signaalprofiel, bestuurlijke weging, eerste verificatiespoor, eerste managementsessie en compacte handoff voor sponsor of directie. In demo's komt deze route meestal na ExitScan, tenzij de buyer-vraag expliciet over actieve medewerkers gaat.",
    kpis: [
      ['Reacties', '63 van 92', '68% respons'],
      ['Gemiddeld retentiesignaal', '5,6 op 10', MANAGEMENT_BAND_LABELS.MIDDEN],
      ['Gemiddelde bevlogenheid', '6,8 op 10', 'Niet laag, wel ongelijk verdeeld'],
      ['Gemiddelde vertrekintentie', '4,7 op 10', 'Vraagt gerichte opvolging'],
    ],
    boardroomTitle: 'Bestuurlijke handoff',
    boardroomIntro:
      'RetentieScan vat de top van het rapport samen in een compacte sponsor-read: waar staat behoud onder druk, waarom moet dit nu gewogen worden en welke werkfactoren kleuren dat beeld het sterkst.',
    boardroomPoints: [
      ['Wat speelt nu', 'Het groepsbeeld laat zien waar behoudsdruk oploopt en welke werkfactoren dat het scherpst kleuren.'],
      ['Waarom telt dit nu', 'Zichtbare vertrekintentie of stille behoudsdruk raken teamcontinuiteit, leiding en uitvoerbaarheid.'],
      ['Wat niet concluderen', 'Dit blijft een groepssignaal en geen individuele voorspeller, performance-score of bewezen risicomodel.'],
    ],
    focusTitle: 'Waar vraagt behoud nu de meeste aandacht?',
    dashboardRows: [
      { label: 'Groei', value: '5,9', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '59%', tone: 'amber' },
      { label: 'Werkbelasting', value: '5,6', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '56%', tone: 'amber' },
      { label: 'Leiderschap', value: '5,1', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '51%', tone: 'amber' },
      { label: 'Psychologische veiligheid', value: '4,7', band: MANAGEMENT_BAND_LABELS.MIDDEN, width: '47%', tone: 'amber' },
    ],
    nuance:
      'RetentieScan is bedoeld voor groeps- en segmentduiding. De output is nadrukkelijk geen individuele voorspeller of performance-instrument, maar een v1-werkmodel voor verificatie en prioritering.',
    factorLead:
      "De factoranalyse laat eerst zien hoe medewerkers de thema's ervaren, en vertaalt dat daarna naar een managementstatus. Signaalsterkte blijft alleen verdiepende logica.",
    factorCards: [
      { label: 'Groei', scoreDisplay: '4,8/10', signalDisplay: '5,9/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Werkbelasting', scoreDisplay: '5,0/10', signalDisplay: '5,6/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Leiderschap', scoreDisplay: '5,8/10', signalDisplay: '5,1/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Psychologische veiligheid', scoreDisplay: '7,5/10', signalDisplay: '4,7/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.MIDDEN, tone: 'amber' },
      { label: 'Beloning & voorwaarden', scoreDisplay: '7,0/10', signalDisplay: '4,0/10', showSignal: true, band: MANAGEMENT_CONTEXT_LABELS.stabilizing, tone: 'emerald' },
      { label: 'Rolhelderheid', scoreDisplay: '7,1/10', signalDisplay: '3,8/10', showSignal: true, band: MANAGEMENT_BAND_LABELS.LAAG, tone: 'emerald' },
    ],
    hypothesisLead:
      'De rapportage helpt management niet alleen zien wat spannend is, maar vooral welke vragen eerst getoetst moeten worden voordat een route, eerste stap en reviewmoment worden gekozen.',
    hypotheses: [
      {
        title: 'Hypothese: werkdruk zet behoud in delen van de organisatie onder druk',
        body: 'Werkbelasting en hersteltijd laten een terugkerend aandachtspunt zien. In combinatie met hogere vertrekintentie is dit een logisch eerste gespreksthema.',
        question: 'Welke teams hebben structureel te weinig herstelruimte of voorspelbaarheid in planning?',
      },
      {
        title: 'Hypothese: groei en leidinggevend gedrag bepalen het verschil tussen teams',
        body: 'Het totaalbeeld is niet overal even zorgelijk, maar teams met zwakker groeiperspectief en minder steun van leidinggevenden wijken duidelijker af.',
        question: 'Waar ontbreekt nu het geloofwaardige groeiverhaal of de dagelijkse ondersteuning die medewerkers nodig hebben?',
      },
    ],
    proofNotes: [
      ['Managementsamenvatting', 'Groepsbeeld nu, bestuurlijke weging en de scherpste verificatiesporen in een executive laag'],
      ['Bestuurlijke handoff', 'Compacte sponsor-read met wat nu speelt, waarom dat telt en expliciete watchout tegen overinterpretatie'],
      ['Signaalmix', 'Retentiesignaal, stay-intent en vertrekintentie in een bestuurssamenvatting'],
      ['Actielogica', 'Topfactoren en vervolgstappen voor 30-90 dagen, zonder individuele voorspelling'],
      ['Bewijsstatus', 'Inhoudelijk plausibel, intern consistent en testmatig beschermd; nog geen pragmatisch bewezen predictor'],
    ],
    trustTitle: 'Trust & interpretatie',
    trustIntro:
      'De preview maakt dezelfde grens zichtbaar als live output: groeps- en segmentduiding voor verificatie en prioritering, zonder individuele predictor of performance-instrument te worden.',
    trustPoints: [
      ['Intended use', 'Vroegsignalering op behoud op groeps- en segmentniveau voor managementgesprek, verificatie en opvolging.'],
      ['Wat management ziet', 'Retentiesignaal, stay-intent, vertrekintentie, bevlogenheid en topfactoren in een bestuurslaag.'],
      ['Privacygrens', 'Geen individuele signalen naar management, segmenten alleen bij voldoende n en open tekst alleen als groepssignaal.'],
      ['Bewijsstatus', 'V1-werkmodel: inhoudelijk plausibel, intern consistent en testmatig beschermd; geen bewezen predictor.'],
    ],
    demoLabel: 'Illustratief voorbeeld',
    demoBody:
      'Fictieve voorbeelddata. De live RetentieScan-output gebruikt dezelfde managementstructuur, trustnotes en productspecifieke leeswijzers als in een specifieke behoudsdemo.',
    supportVisualTitle: 'Segment deep dive preview',
    supportVisualAlt: 'Voorbeeld van een RetentieScan segment deep dive',
    sampleReportTitle: 'Volledig voorbeeldrapport',
    sampleReportBody:
      'Open hier het actuele RetentieScan-voorbeeldrapport met fictieve data en dezelfde trustgrenzen als de echte output.',
    sampleReportHref: retentionSampleAsset?.publicHref,
    sampleReportLabel: 'Open RetentieScan-voorbeeldrapport',
  },
}
