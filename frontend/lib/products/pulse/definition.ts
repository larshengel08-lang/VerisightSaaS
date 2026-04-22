import type { ScanDefinition } from '@/lib/scan-definitions'

export const pulseScanDefinition: ScanDefinition = {
  scanType: 'pulse',
  productName: 'Pulse',
  signalLabel: 'Pulsesignaal',
  signalLabelLower: 'pulsesignaal',
  summaryLabel: 'Pulsesignaal',
  methodologyText:
    'Pulse is de compacte reviewroute bovenop eerdere duiding of een eerdere Pulse. Het product bundelt een compacte SDT-check-in, geselecteerde werkfactoren en een actuele richtingsvraag tot een managementread die helpt bepalen welke herijking nu direct aandacht vraagt. Vergelijking blijft bewust begrensd tot de vorige vergelijkbare Pulse met voldoende data.',
  whatItIsText:
    'Een compacte reviewroute op groepsniveau die laat zien welke werkbeleving en prioriteitsfactoren nu bestuurlijk als eerste aandacht vragen.',
  whatItIsNotText:
    'Geen brede MTO, geen bredere behoudsroute, geen individuele voorspeller, geen brede trendmachine en geen hard effectbewijs op zichzelf.',
  howToReadText:
    'Lees Pulse als bounded managementread: welke compacte review- of herijkingsvraag vraagt nu direct aandacht, welke factor moet als eerste besproken worden en wanneer hoort daar een bounded hercheck bij.',
  privacyBoundaryText:
    'Output blijft op groepsniveau. Detailweergave en interpretatie blijven terughoudend bij kleine aantallen en open tekst wordt alleen geanonimiseerd als groepssignaal gebruikt.',
  evidenceStatusText:
    'Pulse is methodisch bewust smal: compact, intern consistent en productmatig eerlijk over wat wel en niet ondersteund wordt. De huidige vorm ondersteunt een begrensde vergelijking met precies een vorige vergelijkbare Pulse, geen brede trend- of effectclaim.',
  signalHelp:
    'Pulsesignaal 1-10: samenvattend reviewsignaal van korte werkbeleving en actieve Pulse-factoren in deze cycle. Hogere score = scherper signaal dat nu bespreking of bijsturing vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Pulse lees je als actuele groepsread met bounded vergelijking naar de vorige vergelijkbare Pulse, niet als zelfstandig trendbewijs of individuele duiding.',
  segmentText:
    'Segmentvergelijking en diepere Pulse-verfijning horen pas in latere waves. De focus blijft nu op een duidelijke groepsread, eerste reviewrichting en expliciet vervolgmoment.',
}
