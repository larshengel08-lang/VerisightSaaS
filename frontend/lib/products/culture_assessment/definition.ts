import type { ScanDefinition } from '@/lib/scan-definitions'

import { CULTURE_ASSESSMENT_CULTURE_INDEX_COPY } from '@/lib/products/culture_assessment/contract'

export const cultureAssessmentDefinition: ScanDefinition = {
  scanType: 'culture_assessment',
  productName: 'Loep Culture Assessment',
  signalLabel: 'Loep Culture Index',
  signalLabelLower: 'loep culture index',
  summaryLabel: 'Executive culture read',
  methodologyText:
    'Loep Culture Assessment is de jaarlijkse brede cultuur- en engagementbaseline voor board, directie en HR. De route werkt met een vaste enterprise-vragenlijst, organisatiebrede census en governed drilldown zonder benchmark-first, ranking of individuele voorspellingen.',
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
    'Gebruik resultaten alleen samen met responsbasis, suppressieregels, segmentgrenzen en de expliciete governancegrenzen van deze route.',
  segmentText:
    'Segmentcontrasten tonen verschillen tussen veilige aggregatielagen zoals locatie, afdeling en team; ze zijn geen ranking of individuele managementbeoordeling.',
}
