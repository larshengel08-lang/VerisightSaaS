import type { ScanDefinition } from '@/lib/scan-definitions'

export const exitScanDefinition: ScanDefinition = {
  scanType: 'exit',
  productName: 'ExitScan',
  signalLabel: 'Frictiescore',
  signalLabelLower: 'frictiescore',
  summaryLabel: 'Sterk werksignaal',
  methodologyText:
    'ExitScan maakt vertrekduiding bestuurlijk leesbaar. Het product bundelt vertrekredenen, werkfactoren en werksignalen tot een managementbeeld dat helpt prioriteren en doorvragen, zonder oorzaken definitief vast te stellen.',
  signalHelp:
    'Frictieschaal 1-10: hogere score = sterker signaal van ervaren werkfrictie rondom vertrek. Lees deze score altijd samen met vertrekredenen, topfactoren en werksignaal.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Subgroepvergelijkingen blijven uit beeld bij kleine aantallen om ruis en herleidbaarheid te beperken.',
  segmentText:
    'Als segment deep dive aanstaat, laat ExitScan zien welke subgroepen relatief afwijken van het organisatieniveau. Dat helpt bepalen waar vervolgvragen het meeste opleveren, zonder segmentverschillen als causale verklaring te lezen.',
}
