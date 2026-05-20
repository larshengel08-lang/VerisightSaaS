import type { ScanDefinition } from '@/lib/scan-definitions'

import { CULTURE_ASSESSMENT_CULTURE_INDEX_COPY } from '@/lib/products/culture_assessment/contract'

export const cultureAssessmentDefinition: ScanDefinition = {
  scanType: 'culture_assessment',
  productName: 'Loep Culture Assessment',
  signalLabel: 'Loep Culture Index',
  signalLabelLower: 'loep culture index',
  summaryLabel: 'Executive culture read',
  methodologyText:
    'Loep Culture Assessment is de jaarlijkse brede cultuur- en engagementbaseline voor board, directie en HR. De route werkt met een vaste 40-item enterprise-vragenlijst, organisatiebrede census en governed drilldown zonder benchmark-first, ranking of individuele voorspellingen.',
  whatItIsText:
    'Een primaire enterprise route voor een brede jaarlijkse cultuur- en engagementbaseline met executive read, domeinbeeld, segmentcontrasten en board-read als productonderdeel.',
  whatItIsNotText:
    'Geen RetentieScan-variant, geen Pulse, geen TeamScan, geen manager ranking tool, geen self-serve survey platform en geen benchmark-first product.',
  howToReadText:
    'Lees het executive culture read descriptief: eerst responsbasis, dan Loep Culture Index, daarna domeinen, segmentcontrasten en governed verdiepingslagen.',
  privacyBoundaryText:
    'Resultaten verschijnen alleen boven minimum-n, named manager detail blijft standaard locked en open tekst verschijnt alleen geclusterd en veilig.',
  evidenceStatusText:
    'Deze route is patroon-gedreven en descriptief. De output doet geen causaliteitsclaims, individuele voorspellingen of rankinguitspraken.',
  signalHelp: CULTURE_ASSESSMENT_CULTURE_INDEX_COPY,
  reliabilityText:
    'Gebruik resultaten alleen samen met responsbasis, suppressieregels, segmentgrenzen, minimum valid response-regels en de expliciete governancegrenzen van deze route.',
  segmentText:
    'Segmentcontrasten tonen verschillen tussen veilige aggregatielagen zoals locatie, afdeling en team; ze zijn geen ranking of individuele managementbeoordeling.',
  launchStatus: [
    'pilot-ready',
    'commercially demoable',
    'operationally executable',
    'not benchmark-ready',
    'not self-service scalable',
    'not fully automated delivery at volume',
  ],
  deploymentProfiles: {
    enterprise:
      'Diepere segmentlagen, board deck, HR appendix, governed drilldown en mogelijke latere Pulse-opvolging op dezelfde kernvragenlijst.',
    mkb:
      'Dezelfde kernvragenlijst en board-read, met organisatiebrede read als hoofdwaarde en alleen veilige segmentatie waar minimum-n dat toelaat.',
  },
  standardOutputs: [
    'board report pdf',
    'boardroom deck blueprint',
    'executive one-pager',
    'guided board-read session',
  ],
  optionalOutputs: [
    'HR appendix pdf',
    'segment summary export',
    'HR deepening handout',
    'manager cascade handout when threshold-safe',
    'Pulse follow-on after baseline',
  ],
  outputReadiness: {
    boardReportPdf: 'demo_asset_ready',
    boardroomDeck: 'blueprint_ready',
    executiveOnePager: 'blueprint_ready',
    hrAppendixPdf: 'blueprint_ready',
    segmentSummaryExport: 'commercial_delivery_ready',
  },
  outputSequenceNote:
    'Het board report pdf is in v1 een compacte executive read. Dashboard en board-deck-structuur dragen de volledige canonieke 11-blokvolgorde; het pdf comprimeert die volgorde zonder benchmark-, ranking- of health-scoreframing.',
  followOnOutcomes: [
    'no immediate next route',
    'deeper governed work',
    'Pulse follow-on',
    'another Loep route',
  ],
  followOnDecisionNote:
    'Geen vervolgrichting opent automatisch na de baseline. De board-read sluit expliciet af met een keuze tussen geen onmiddellijke vervolgrichting, deeper governed work, een bounded Pulse-follow-on of een andere Loep-route als de vervolgvraag echt smaller is.',
}
