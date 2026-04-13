import type { ScanDefinition } from '@/lib/scan-definitions'

export const exitScanDefinition: ScanDefinition = {
  scanType: 'exit',
  productName: 'ExitScan',
  signalLabel: 'Frictiescore',
  signalLabelLower: 'frictiescore',
  summaryLabel: 'Sterk werksignaal',
  methodologyText:
    'Verisight maakt zichtbaar waar uitstroompatronen terugkeren en waar vervolgactie waarschijnlijk het meeste oplevert. De uitkomsten zijn bedoeld om beter te prioriteren en door te vragen, niet om oorzaken definitief vast te stellen.',
  signalHelp:
    'Frictieschaal 1-10: hogere score = sterker signaal van ervaren werkfrictie. HOOG >= 7, MIDDEN 4.5-7, LAAG < 4.5.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Subgroepvergelijkingen blijven uit beeld bij kleine aantallen om ruis en herleidbaarheid te beperken.',
  segmentText:
    'Als segment deep dive aanstaat, laat Verisight zien welke subgroepen relatief afwijken van het organisatieniveau. Dat helpt vooral bepalen waar vervolgvragen het meeste opleveren.',
}
