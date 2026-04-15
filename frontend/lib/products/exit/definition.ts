import type { ScanDefinition } from '@/lib/scan-definitions'

export const exitScanDefinition: ScanDefinition = {
  scanType: 'exit',
  productName: 'ExitScan',
  signalLabel: 'Frictiescore',
  signalLabelLower: 'frictiescore',
  summaryLabel: 'Sterk frictiesignaal',
  methodologyText:
    'ExitScan maakt vertrekduiding bestuurlijk leesbaar. Het product bundelt vertrekredenen, meespelende factoren, eerdere signalering en signalen van werkfrictie tot een indicatief managementbeeld dat helpt prioriteren en doorvragen, zonder oorzaken definitief vast te stellen.',
  whatItIsText:
    'Een begeleide exitscan voor terugkijkende vertrekduiding op groepsniveau, met dashboard en managementrapport in dezelfde leeslijn.',
  whatItIsNotText:
    'Geen diagnose, geen individuele beoordeling, geen voorspelmodel en geen objectieve causaliteitsclaim over waarom iemand vertrok.',
  howToReadText:
    'Lees frictiescore, vertrekredenen, meespelende factoren en eerdere signalering samen als managementverhaal. De score opent het gesprek, maar sluit het niet af.',
  privacyBoundaryText:
    'Output blijft gegroepeerd. Detailweergave start pas vanaf 5 responses, patroonanalyse vanaf 10 en segmenten blijven verborgen bij te kleine groepen om ruis en herleidbaarheid te beperken.',
  evidenceStatusText:
    'Methodisch verdedigbaar en testmatig geborgd, maar niet extern gevalideerd als diagnostisch instrument. De huidige gewichten blijven expert judgment totdat eigendata latere kalibratie dragen.',
  signalHelp:
    'Frictiescore 1-10: hogere score = sterker signaal van ervaren werkfrictie rondom vertrek. Lees deze managementsamenvatting altijd samen met vertrekredenen, topfactoren en signalen van werkfrictie.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Subgroepvergelijkingen blijven uit beeld bij kleine aantallen om ruis, schijnprecisie en herleidbaarheid te beperken.',
  segmentText:
    'Als segment deep dive aanstaat, laat ExitScan zien welke subgroepen relatief afwijken van het organisatieniveau. Dat helpt bepalen waar vervolgvragen het meeste opleveren, zonder segmentverschillen als causale verklaring te lezen.',
}
