import type { ScanDefinition } from '@/lib/scan-definitions'

export const pulseScanDefinition: ScanDefinition = {
  scanType: 'pulse',
  productName: 'Pulse',
  signalLabel: 'Pulsesignaal',
  signalLabelLower: 'pulsesignaal',
  summaryLabel: 'Momentopname nu',
  methodologyText:
    'Pulse is de korte reviewlaag bovenop eerdere duiding, baseline of eerdere Pulse. Het product bundelt een compacte SDT-check-in, geselecteerde werkfactoren en een actuele richtingsvraag tot een managementread die helpt bepalen waar nu review, correctie en een eerstvolgende hercheck nodig zijn. Vergelijking blijft bewust begrensd tot de vorige vergelijkbare Pulse met voldoende data.',
  whatItIsText:
    'Een korte reviewscan op groepsniveau die laat zien hoe werkbeleving en gekozen prioriteitsfactoren er nu voor staan, plus wat dat bestuurlijk als eerste vraagt.',
  whatItIsNotText:
    'Geen brede MTO, geen vervanging van RetentieScan, geen individuele voorspeller, geen brede trendmachine en geen hard effectbewijs op zichzelf.',
  howToReadText:
    'Lees Pulse als bounded managementread van dit moment: wat vraagt nu review, welke factor moet als eerste besproken worden, welke kleine correctie hoort daarbij en wanneer is een volgende check logisch.',
  privacyBoundaryText:
    'Output blijft op groepsniveau. Detailweergave en interpretatie blijven terughoudend bij kleine aantallen en open tekst wordt alleen geanonimiseerd als groepssignaal gebruikt.',
  evidenceStatusText:
    'Pulse is methodisch bewust smal: compact, intern consistent en productmatig eerlijk over wat wel en niet ondersteund wordt. De huidige vorm ondersteunt een begrensde vergelijking met precies één vorige vergelijkbare Pulse, geen brede trend- of effectclaim.',
  signalHelp:
    'Pulsesignaal 1-10: samenvattend reviewsignaal van korte werkbeleving en actieve Pulse-factoren in deze cycle. Hogere score = scherper signaal dat nu bespreking of bijsturing vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Pulse lees je als actuele groepssnapshot met bounded vergelijking naar de vorige vergelijkbare Pulse, niet als zelfstandig trendbewijs of individuele duiding.',
  segmentText:
    'Segmentvergelijking en diepere Pulse-verfijning horen pas in latere waves. De focus blijft nu op een duidelijke groepssnapshot, eerste reviewrichting en expliciet vervolgmoment.',
}
