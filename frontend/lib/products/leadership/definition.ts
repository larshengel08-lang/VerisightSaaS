import type { ScanDefinition } from '@/lib/scan-definitions'

export const leadershipScanDefinition: ScanDefinition = {
  scanType: 'leadership',
  productName: 'Leadership Scan',
  signalLabel: 'Leadershipsignaal',
  signalLabelLower: 'leadershipsignaal',
  summaryLabel: 'Managementrichting',
  methodologyText:
    'Leadership Scan is een begrensde managementcontextscan bovenop een al zichtbaar people-signaal. Het product bundelt een compacte werkbelevingscheck, geselecteerde leiderschaps- en werkfactoren en een managementrichtingsvraag tot een geaggregeerde groepsread die helpt bepalen welke managementcontext eerst duiding, eigenaar en begrensde eerste stap vraagt. In deze eerste waves blijft Leadership Scan bewust group-level only, zonder named leaders, hierarchylogica of 360-output.',
  whatItIsText:
    'Een compacte scan op groepsniveau die laat zien hoe leiding, prioritering en werkcontext nu samenkomen rond een bestaand people-signaal.',
  whatItIsNotText:
    'Geen named leader view, geen manager ranking, geen 360-tool, geen performance-instrument en geen individuele beoordeling.',
  howToReadText:
    'Lees Leadership Scan als begrensde managementread: welke factor kleurt het beeld het sterkst, welke managementcontext vraagt nu eerst duiding, wie moet het eerste gesprek trekken en welke kleine verificatie of correctie hoort daar logisch bij.',
  privacyBoundaryText:
    'Output blijft op groepsniveau. Kleine groepen blijven onderdrukt en de read mag niet gebruikt worden als oordeel over een individuele leidinggevende.',
  evidenceStatusText:
    'Leadership Scan is in deze eerste waves methodisch smal: campaign-centered, privacy-first en expliciet zonder identity- of hierarchylaag. De huidige vorm helpt managementcontext duiden en een eerste managementhandoff maken, maar is nog geen named leader model of bewijs van individuele leiderschapskwaliteit.',
  signalHelp:
    'Leadershipsignaal 1-10: samenvattend groepssignaal van compacte werkbeleving en geselecteerde leiderschaps- en werkfactoren in deze campaign. Hogere score = scherper managementcontextsignaal dat nu eerste duiding of verificatie vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. De uitkomst is bedoeld als geaggregeerde managementread op groepsniveau, niet als named leader output, hierarchybewijs of prestatie-indicator.',
  segmentText:
    'Leadership Scan is niet hetzelfde als segment deep dive of TeamScan. Segment deep dive blijft beschrijvend, TeamScan lokaliseert department-first; Leadership Scan focust juist op geaggregeerde managementcontext zonder named leaders.',
}
