import type { ScanDefinition } from '@/lib/scan-definitions'

export const retentionScanDefinition: ScanDefinition = {
  scanType: 'retention',
  productName: 'RetentieScan',
  signalLabel: 'Retentiesignaal',
  signalLabelLower: 'retentiesignaal',
  summaryLabel: 'Gem. stay-intent',
  methodologyText:
    'Verisight maakt zichtbaar waar behoud onder druk staat en welke beinvloedbare werkfactoren als eerste aandacht vragen. RetentieScan is een SDT-gebaseerd signaalinstrument: werkbeleving en werkfactoren vormen samen het retentiesignaal, terwijl bevlogenheid, vertrekintentie en stay-intent apart leesbaar blijven.',
  signalHelp:
    'Retentieschaal 1-10: een gelijkgewogen samenvatting van SDT en beinvloedbare werkfactoren. Hogere score = sterker vroegsignaal dat behoud aandacht vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Individuele scores blijven uit beeld; segmentvergelijkingen tonen we alleen bij voldoende aantallen. De uitkomst is bedoeld voor prioritering, niet als gevalideerde voorspeller van vrijwillig vertrek.',
  segmentText:
    'Als segment deep dive aanstaat, laat Verisight zien welke afdelingen of functieniveaus relatief sterker afwijken op retentiesignalen. De vergelijking is beschrijvend, niet causaal.',
}
