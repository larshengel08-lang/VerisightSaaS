import type { ScanDefinition } from '@/lib/scan-definitions'

export const retentionScanDefinition: ScanDefinition = {
  scanType: 'retention',
  productName: 'RetentieScan',
  signalLabel: 'Retentiesignaal',
  signalLabelLower: 'retentiesignaal',
  summaryLabel: 'Stay-intent (aanvullend)',
  methodologyText:
    'Verisight maakt zichtbaar waar behoud op groeps- en segmentniveau onder druk staat en welke beinvloedbare werkfactoren als eerste verificatie vragen. RetentieScan is geen brede MTO en geen individuele voorspeller: het is een SDT-gebaseerd vroegsignaal waarin werkbeleving en werkfactoren samen een v1-retentiesignaal vormen, terwijl bevlogenheid, vertrekintentie en stay-intent apart leesbaar blijven als aanvullende signalen rond behoud.',
  whatItIsText:
    'Een compacte scan voor vroegsignalering op behoud op groeps- en segmentniveau, bedoeld om eerder zichtbaar te maken waar behoud aandacht vraagt in actieve populaties.',
  whatItIsNotText:
    'Geen brede MTO, geen individuele voorspeller, geen performance-instrument en geen selectie- of interventietool op persoonsniveau.',
  howToReadText:
    'Lees het retentiesignaal samen met bevlogenheid, stay-intent, vertrekintentie en topfactoren als verificatiehulp. De uitkomst is een managementroute, geen hard classificatiemodel.',
  privacyBoundaryText:
    'Management ziet alleen groeps- en segmentinzichten. Individuele signalen, individuele vertrekintentie en open tekst op persoonsniveau blijven buiten beeld; segmenten verschijnen alleen bij voldoende n.',
  evidenceStatusText:
    'RetentieScan is een v1-werkmodel: inhoudelijk plausibel, intern consistent en testmatig beschermd. Het product is nadrukkelijk geen pragmatisch bewezen of wetenschappelijk gevalideerde predictor van vrijwillig vertrek.',
  signalHelp:
    'Retentiesignaal 1-10: een gelijkgewogen v1-samenvatting van SDT-werkbeleving en beinvloedbare werkfactoren. Hogere score = sterker samenvattend groepssignaal dat behoud eerst verificatie en daarna opvolging vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Individuele scores blijven uit beeld; segmentvergelijkingen tonen we alleen bij voldoende aantallen. De uitkomst is bedoeld voor prioritering en verificatie op groepsniveau, niet als gevalideerde voorspeller van vrijwillig vertrek.',
  segmentText:
    'Als segment deep dive aanstaat, laat Verisight zien welke afdelingen of functieniveaus relatief sterker afwijken op het retentiesignaal. De vergelijking is beschrijvend en bedoeld voor prioritering, niet als causaal bewijs.',
}
