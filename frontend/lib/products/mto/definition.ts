import type { ScanDefinition } from '@/lib/scan-definitions'

export const mtoScanDefinition: ScanDefinition = {
  scanType: 'mto',
  productName: 'MTO',
  signalLabel: 'MTO-signaal',
  signalLabelLower: 'mto-signaal',
  summaryLabel: 'Brede organisatieread',
  methodologyText:
    'MTO is in deze eerste wave een bredere organisatiebrede hoofdmeting op groepsniveau. Het product bundelt volledige werkbeleving, de volledige werkfactorlaag en een brede richtingsvraag tot een eerste brede organisatieread: een foundation read die helpt bepalen welke thema’s nu als eerste prioriteit vragen. In deze eerste wave blijft MTO bewust intern, campaign-centered, privacy-first en zonder report- of actionlaag.',
  whatItIsText:
    'Een eerste brede hoofdmeting op groepsniveau die laat zien welke combinatie van werkbeleving en werkfactoren nu de meeste organisatieduiding vraagt.',
  whatItIsNotText:
    'Geen individueel tevredenheidsoordeel, geen formeel rapport, geen action-logroute en geen publieke hoofdroute in deze wave.',
  howToReadText:
    'Lees MTO als brede organisatieread: welke thema’s vallen nu het meest op, welke brede managementvraag hoort daar als eerste bij en welke begrensde organisatiestap moet daarna volgen. Houd deze wave bewust bij een eerste brede read, niet bij directe uitrol van rapport- of actionlagen.',
  privacyBoundaryText:
    'Output blijft op groepsniveau. Kleine groepen blijven onderdrukt en segmentatie is in deze wave hoogstens verrijking, geen harde leeslaag.',
  evidenceStatusText:
    'MTO is in deze eerste wave methodisch een foundation read: intern, campaign-centered en zonder formele rapport- of actionlaag. De huidige vorm helpt een eerste brede organisatieread openen, maar is nog geen volledige hoofdroute-ervaring.',
  signalHelp:
    'MTO-signaal 1-10: samenvattend groepssignaal van brede werkbeleving en werkfactoren in deze campaign. Hogere score = scherper breed organisatiethema dat nu eerste managementduiding vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Deze eerste MTO-read is bedoeld als geaggregeerde hoofdmeting op groepsniveau, niet als individueel tevredenheidsoordeel of formele reportlaag.',
  segmentText:
    'Segmentatie is in deze wave optionele verrijking boven op de brede organisatieread. De focus blijft nu op organisatiebreed beeld, topprioriteiten en een eerste bounded vervolgstap.',
}
