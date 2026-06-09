import type { ScanDefinition } from '@/lib/scan-definitions'

export const teamScanDefinition: ScanDefinition = {
  scanType: 'team',
  productName: 'TeamScan',
  signalLabel: 'Teamsignaal',
  signalLabelLower: 'teamsignaal',
  summaryLabel: 'Lokale richting',
  methodologyText:
    'TeamScan is de lokalisatielaag bovenop een al zichtbaar organisatief of groepssignaal. Het product combineert bewust drie dingen in een compacte lokale read: een korte werkbelevingscheck, geselecteerde werkfactoren en een lokale richtingsvraag. Samen vormen die geen brede diagnose, maar een department-first managementread die helpt bepalen waar eerst verificatie nodig is, wie dit lokaal moet trekken en welke begrensde vervolgstap logisch is.',
  whatItIsText:
    'Een compacte lokalisatiescan op groepsniveau die laat zien waar een bestaand signaal lokaal het scherpst speelt, welk werkcontextspoor dat beeld kleurt en welke afdeling als eerste verificatie of bespreking vraagt.',
  whatItIsNotText:
    'Geen brede diagnose, geen managerbeoordeling, geen individuele score, geen prestatie-instrument, geen beschrijvende segmenttabel en geen hard bewijs dat een teamoorzaak vaststaat.',
  howToReadText:
    'Lees TeamScan als veilige lokale contextlaag: welke afdelingen vallen op, welke werkfactor of werkbeleving het lokale spoor kleurt, welke eerste verificatievraag logisch is en wanneer een lokale check eerlijker is dan meteen breder generaliseren.',
  privacyBoundaryText:
    'Output blijft op groepsniveau. Lokale uitsplitsing verschijnt alleen als genoeg responses en genoeg afdelingsmetadata beschikbaar zijn; kleine groepen blijven onderdrukt.',
  evidenceStatusText:
    'TeamScan is methodisch bewust smal: department-first, privacy-first en eerlijk over wat nog niet ondersteund wordt. De huidige vorm helpt lokaliseren, begrensd prioriteren en managementhuddles richten, maar blijft een lokalisatie-en-verificatieroute, geen manager ranking, geen teamscorekaart en geen causaal model.',
  signalHelp:
    'Teamsignaal 1-10: samenvattend lokale-contextsignaal van korte werkbeleving, geselecteerde werkfactoren en de lokale richtingsvraag in deze campaign. Hogere score = scherper lokaal aandachtssignaal dat eerst verificatie vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Lokale uitsplitsing tonen we alleen wanneer afdelingsmetadata en groepsgroottes veilig genoeg zijn. De uitkomst is bedoeld voor lokalisatie en verificatie op groepsniveau, niet als individueel, managergericht of causaal bewijs.',
  segmentText:
    'TeamScan is niet hetzelfde als Segment Deep Dive. Segment Deep Dive blijft een beschrijvende add-on binnen bredere scans; TeamScan gebruikt een eigen compacte survey-, interpretatie- en handofflogica voor department-first lokalisatie en eerste verificatie.',
}
