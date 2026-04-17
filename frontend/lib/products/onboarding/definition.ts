import type { ScanDefinition } from '@/lib/scan-definitions'

export const onboardingScanDefinition: ScanDefinition = {
  scanType: 'onboarding',
  productName: 'Onboarding 30-60-90',
  signalLabel: 'Onboardingsignaal',
  signalLabelLower: 'onboardingsignaal',
  summaryLabel: 'Checkpoint nu',
  methodologyText:
    'Onboarding 30-60-90 is een vroege lifecycle-scan voor nieuwe medewerkers op groepsniveau. Het product bundelt een compacte werkbelevingscheck, geselecteerde vroege werkfactoren en een checkpoint-richtingsvraag tot een managementread die helpt bepalen waar nieuwe instroom in deze fase goed landt, wie de eerste handoff trekt en welke kleine borg- of correctiestap nu eerst aandacht vraagt. In deze eerste waves blijft onboarding bewust begrensd tot precies een checkpoint per campaign.',
  whatItIsText:
    'Een compacte checkpoint-scan op groepsniveau die laat zien hoe nieuwe medewerkers in een enkele fase landen in rol, leiding, team en werkcontext.',
  whatItIsNotText:
    'Geen client onboarding-check, geen individuele score, geen performance-instrument, geen retentievoorspeller en geen volledige employee-journey analyse.',
  howToReadText:
    'Lees onboarding als vroege managementhandoff: welke succesvoorwaarden zijn zichtbaar, welke frictie valt nu op, wie trekt de eerste stap en welke beperkte borg- of correctieactie hoort daar direct bij.',
  privacyBoundaryText:
    'Output blijft op groepsniveau. De read blijft bewust compact en bedoeld voor managementduiding van instroomervaring, niet voor individuele beoordeling van nieuwe medewerkers of managers.',
  evidenceStatusText:
    'Onboarding is methodisch bewust smal: een enkel checkpoint, een assisted managementhandoff, geen journey-engine en geen brede retentieclaim. De huidige vorm helpt vroege integratie en frictie lezen en een eerste eigenaar of actie kiezen, maar is nog geen 30-60-90 trend- of cohortmodel.',
  signalHelp:
    'Onboardingsignaal 1-10: samenvattend checkpointsignaal van korte werkbeleving en geselecteerde vroege werkfactoren in deze campaign. Hogere score = scherper vroeg aandachtssignaal dat bestuurlijke opvolging vraagt.',
  reliabilityText:
    'Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Deze onboardingvorm lees je als groepssnapshot en assisted checkpoint-handoff voor een enkel meetmoment, niet als multi-checkpoint journey of individuele voorspelling.',
  segmentText:
    'Segmentvergelijking, checkpointvergelijking en bredere onboardingjourneys horen pas in latere waves. De focus blijft nu op een duidelijke checkpoint-read, eerste eigenaar, beperkte eerste actie en begrensde vervolgstap.',
}
