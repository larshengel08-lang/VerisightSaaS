import type { ScanDefinition } from '@/lib/scan-definitions'

export const retentionScanDefinition: ScanDefinition = {
  scanType: 'retention',
  productName: 'RetentieScan',
  signalLabel: 'Retentiesignaal',
  signalLabelLower: 'retentiesignaal',
  summaryLabel: 'Gem. stay-intent',
  methodologyText:
    'Verisight maakt zichtbaar waar behoud op groeps- en segmentniveau onder druk staat en welke beinvloedbare werkfactoren als eerste aandacht vragen. RetentieScan is geen brede MTO en geen individuele voorspeller: het is een SDT-gebaseerd vroegsignaal waarin werkbeleving en werkfactoren samen het retentiesignaal vormen, terwijl bevlogenheid, vertrekintentie en stay-intent apart leesbaar blijven.',
  signalHelp:
    'Retentiesignaal 1-10: een gelijkgewogen v1-samenvatting van SDT-werkbeleving en beinvloedbare werkfactoren. Hogere score = sterker groepssignaal dat behoud aandacht vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Individuele scores blijven uit beeld; segmentvergelijkingen tonen we alleen bij voldoende aantallen. De uitkomst is bedoeld voor prioritering en verificatie op groepsniveau, niet als gevalideerde voorspeller van vrijwillig vertrek.',
  segmentText:
    'Als segment deep dive aanstaat, laat Verisight zien welke afdelingen of functieniveaus relatief sterker afwijken op retentiesignalen. De vergelijking is beschrijvend en bedoeld voor prioritering, niet als causaal bewijs.',
}
