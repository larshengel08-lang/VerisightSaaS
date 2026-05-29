import type { EvidenceTier } from '@/lib/case-proof-evidence'

export type SampleShowcaseStatus =
  | 'buyer-facing active'
  | 'internal demo support'
  | 'legacy archive'

export type SampleShowcaseAccessMode = 'public_buyer_sample' | 'guided_sales_demo' | 'internal_demo_only'

export type SampleShowcaseDeliveryReadiness =
  | 'blueprint_ready'
  | 'demo_asset_ready'
  | 'pilot_delivery_ready'
  | 'commercial_delivery_ready'

export type SampleShowcaseProduct = 'exit' | 'retention' | 'culture_assessment' | 'portfolio' | 'shared'

export type SampleShowcaseKind = 'pdf' | 'preview' | 'image' | 'doc'

export interface SampleShowcaseAsset {
  id: string
  label: string
  product: SampleShowcaseProduct
  kind: SampleShowcaseKind
  status: SampleShowcaseStatus
  accessMode: SampleShowcaseAccessMode
  deliveryReadiness: SampleShowcaseDeliveryReadiness
  docsPath?: string
  publicHref?: string
  intendedUse: string
  evidenceTier: EvidenceTier
  buyerUse: string
  claimBoundary: string
  trustFrame: string
}

export const SAMPLE_SHOWCASE_ASSETS: SampleShowcaseAsset[] = [
  {
    id: 'exit-sample-report',
    label: 'ExitScan buyer-facing voorbeeldrapport',
    product: 'exit',
    kind: 'pdf',
    status: 'buyer-facing active',
    accessMode: 'public_buyer_sample',
    deliveryReadiness: 'commercial_delivery_ready',
    docsPath: 'docs/examples/voorbeeldrapport_loep.pdf',
    publicHref: '/examples/voorbeeldrapport_loep.pdf',
    intendedUse:
      'Primaire buyer-facing prooflaag voor ExitScan op productpagina, in sales en als deliverable-preview.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Gebruik als deliverable-proof en trustproof; nooit als klantcase of effectbewijs.',
    claimBoundary:
      'Illustratief voorbeeld met fictieve data in dezelfde managementstructuur als echte ExitScan-output; geen diagnose of causale bewijsclaim.',
    trustFrame:
      'Gegroepeerde managementduiding met claims-, privacy- en interpretatiegrenzen in dezelfde leesvolgorde als live output.',
  },
  {
    id: 'retention-sample-report',
    label: 'RetentieScan buyer-facing voorbeeldrapport',
    product: 'retention',
    kind: 'pdf',
    status: 'buyer-facing active',
    accessMode: 'public_buyer_sample',
    deliveryReadiness: 'commercial_delivery_ready',
    docsPath: 'docs/examples/voorbeeldrapport_retentiescan.pdf',
    publicHref: '/examples/voorbeeldrapport_retentiescan.pdf',
    intendedUse:
      'Buyer-facing prooflaag voor RetentieScan wanneer de vraag expliciet over actieve-populatie behoud gaat.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Gebruik als deliverable-proof en trustproof; nooit als klantcase of effectbewijs.',
    claimBoundary:
      'Illustratief voorbeeld met fictieve data in dezelfde managementstructuur als echte RetentieScan-output; geen brede MTO of individuele predictor.',
    trustFrame:
      'Verification-first groepsduiding met privacygrenzen, v1-bewijsstatus en productspecifieke leeswijzers.',
  },
  {
    id: 'portfolio-preview',
    label: 'Portfolio previewslider',
    product: 'portfolio',
    kind: 'preview',
    status: 'buyer-facing active',
    accessMode: 'public_buyer_sample',
    deliveryReadiness: 'commercial_delivery_ready',
    intendedUse:
      'Teaserlaag op home en producten-overzicht om routekeuze te versnellen voordat een buyer een volledig voorbeeldrapport opent.',
    evidenceTier: 'deliverable_proof',
    buyerUse:
      'Gebruik als teaser naar de kernroute-sample-rapporten; bounded follow-on routes krijgen hiermee geen impliciete eigen sample-pdf status.',
    claimBoundary:
      'Illustratieve preview, geen volwaardig rapport en geen rijkere output dan de echte voorbeeldrapporten van ExitScan en RetentieScan.',
    trustFrame:
      'Gebruikt fictieve data maar volgt dezelfde managementstructuur, trustnotes en routekeuze-logica als de actieve core sample-rapporten.',
  },
  {
    id: 'exit-preview',
    label: 'ExitScan productspecifieke preview',
    product: 'exit',
    kind: 'preview',
    status: 'buyer-facing active',
    accessMode: 'public_buyer_sample',
    deliveryReadiness: 'commercial_delivery_ready',
    intendedUse:
      'Teaserlaag op de ExitScan-productpagina om de buyer vanaf preview door te leiden naar het volledige ExitScan-voorbeeldrapport.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Gebruik als teaser naar het primaire ExitScan sample, niet als case-proof.',
    claimBoundary:
      'Preview op basis van dezelfde managementtaal en voorbeeldstructuur als het actieve ExitScan-sample-pdf.',
    trustFrame:
      'Benadrukt bestuurlijke read, bestuurlijke handoff, eerste besluit en claimsgrens zonder vertrouwelijke klantframing.',
  },
  {
    id: 'retention-preview',
    label: 'RetentieScan productspecifieke preview',
    product: 'retention',
    kind: 'preview',
    status: 'buyer-facing active',
    accessMode: 'public_buyer_sample',
    deliveryReadiness: 'commercial_delivery_ready',
    intendedUse:
      'Teaserlaag op de RetentieScan-productpagina om de buyer vanaf preview door te leiden naar het volledige RetentieScan-voorbeeldrapport.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Gebruik als teaser naar het RetentieScan sample, niet als case-proof.',
    claimBoundary:
      'Preview op basis van dezelfde managementtaal en voorbeeldstructuur als het actieve RetentieScan-sample-pdf.',
    trustFrame:
      'Benadrukt verification-first lezing, groepsgrenzen en v1-bewijsstatus zonder predictorframing.',
  },
  {
    id: 'segment-deep-dive-visual',
    label: 'Segment deep dive previewvisual',
    product: 'shared',
    kind: 'image',
    status: 'internal demo support',
    accessMode: 'guided_sales_demo',
    deliveryReadiness: 'demo_asset_ready',
    docsPath: 'frontend/public/segment-deep-dive-preview.png',
    publicHref: '/segment-deep-dive-preview.png',
    intendedUse:
      'Ondersteunende visual voor preview en demo wanneer segmentverdieping wordt getoond als gecontroleerde verdieping.',
    evidenceTier: 'trust_proof',
    buyerUse: 'Ondersteunende visual; niet inzetten als primaire prooflaag of casebewijs.',
    claimBoundary:
      'Visuele teaser voor segmentverdieping; niet verkopen als standaard deliverable voor elke buyer of elke dataset.',
    trustFrame:
      'Blijft ondersteunend aan de hoofdlijn van bestuurlijke read en voorbeeldrapport, niet de primaire prooflaag.',
  },
  {
    id: 'culture-assessment-sample-report',
    label: 'Loep Cultuurbeeld sample output pack',
    product: 'culture_assessment',
    kind: 'pdf',
    status: 'internal demo support',
    accessMode: 'guided_sales_demo',
    deliveryReadiness: 'demo_asset_ready',
    docsPath: 'docs/examples/voorbeeldrapport_cultuurbeeld.pdf',
    intendedUse:
      'Interne sales- en board-demo prooflaag voor Loep Culture Assessment zolang de route nog niet benchmark-first of self-serve wordt gepositioneerd.',
    evidenceTier: 'deliverable_proof',
    buyerUse:
      'Gebruik in begeleide sales- en boardcontext om de jaarlijkse baseline, board-read en governancegrenzen te laten zien; nog niet als open website-prooflaag.',
    claimBoundary:
      'Illustratief voorbeeld met fictieve data in dezelfde executive structuur als echte Loep Culture Assessment-output; geen benchmark, causaliteitsclaim of manager ranking.',
    trustFrame:
      'Board-first organisatiebeeld met index, domeinen, segmentgrenzen en governance-notes in dezelfde volgorde als de live productroute.',
  },
  {
    id: 'culture-assessment-board-deck',
    label: 'Loep Cultuurbeeld boardroom deck',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'guided_sales_demo',
    deliveryReadiness: 'pilot_delivery_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_BOARDROOM_DECK.md',
    intendedUse:
      'Boardroom PDF-deck voor begeleide pilotdelivery, proposal prep en board-read voorbereiding binnen dezelfde premium outputlijn als het rapport.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Gebruik begeleid in sales of board context; niet als losse websiteclaim of benchmarkbewijs.',
    claimBoundary:
      'Deck blijft claim-safe en descriptief: geen manager ranking, geen causaliteitsclaim en geen benchmark-first framing.',
    trustFrame:
      'Vertaalt het executive culture read naar een boardgesprek zonder dat de buyer een dashboardanalist hoeft te worden.',
  },
  {
    id: 'culture-assessment-executive-one-pager',
    label: 'Loep Cultuurbeeld executive one-pager',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'guided_sales_demo',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_EXECUTIVE_ONE_PAGER.md',
    intendedUse:
      'Snelle executive samenvatting voor board sponsor, CHRO of directie binnen de premium delivery suite.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Gebruik als begeleide executive samenvatting; niet als los scorebewijs of benchmarkdocument.',
    claimBoundary:
      'One-pager blijft descriptief en governance-first, zonder individuele inference of automatic intervention claims.',
    trustFrame:
      'Laat zien hoe Loep Cultuurbeeld ook buiten het dashboard bestuurlijk leesbaar blijft.',
  },
  {
    id: 'culture-assessment-hr-appendix',
    label: 'Loep Cultuurbeeld HR appendix',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_HR_APPENDIX.md',
    intendedUse:
      'Governed HR-verdiepingslaag voor segmenten, suppressie en follow-up begrenzing na de baseline.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Alleen tonen in governed of enterprise context; niet als standaard baseline-output verkopen.',
    claimBoundary:
      'Appendix opent alleen veilige aggregatielagen en blijft privacy-safe; nooit named manager output of respondentniveau.',
    trustFrame:
      'Versterkt governed drilldown zonder rankinggedrag of onveilige detaillezing te introduceren.',
  },
  {
    id: 'culture-assessment-hr-handout',
    label: 'Loep Cultuurbeeld HR deepening handout',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_HR_DEEPENING_HANDOUT.md',
    intendedUse:
      'Ondersteunt HR in veilige verdieping en vervolgvragen na het board-read.',
    evidenceTier: 'trust_proof',
    buyerUse: 'Gebruik als ondersteunende governed handout; niet als zelfstandig eindproduct verkopen.',
    claimBoundary:
      'Geen manager ranking, geen individuele signalen en geen custom interpretatielaag buiten de baseline-governance.',
    trustFrame:
      'Helpt HR verdiepen zonder de centrale board-read of governancegrenzen te omzeilen.',
  },
  {
    id: 'culture-assessment-manager-cascade',
    label: 'Loep Cultuurbeeld manager cascade handout',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_MANAGER_CASCADE_HANDOUT.md',
    intendedUse:
      'Veilige teamcommunicatie-handout voor managercascades wanneer lokale detailgrenzen dat toelaten.',
    evidenceTier: 'trust_proof',
    buyerUse: 'Alleen gebruiken binnen threshold-safe governed communicatie; nooit als ranking- of verdedigingsinstrument.',
    claimBoundary:
      'Verbiedt teamranking, scoreverdediging, individuele signalen en onveilige lokale scoreweergave.',
    trustFrame:
      'Ondersteunt rustige follow-up communicatie zonder performance- of blamegedrag.',
  },
  {
    id: 'culture-assessment-facilitator-script',
    label: 'Loep Cultuurbeeld board-read facilitator script',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_BOARD_READ_FACILITATOR_SCRIPT.md',
    intendedUse:
      'Facilitatieleidraad voor een guided board-read van 60-90 minuten.',
    evidenceTier: 'trust_proof',
    buyerUse: 'Intern gebruiken voor consistente board-read delivery; niet als vrij interpretatiescript delen.',
    claimBoundary:
      'Script vermijdt causal diagnosis, individual inference en manager blame.',
    trustFrame:
      'Borgt dat de board-read begeleid, bounded en claim-safe blijft.',
  },
  {
    id: 'culture-assessment-board-read-agenda',
    label: 'Loep Cultuurbeeld board-read agenda',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'guided_sales_demo',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_BOARD_READ_AGENDA.md',
    intendedUse:
      'Vaste agenda voor board-read voorbereiding en expectation setting richting board en HR.',
    evidenceTier: 'trust_proof',
    buyerUse: 'Gebruik als begeleide agenda; niet als vervanger van het boardrapport of deck.',
    claimBoundary:
      'Agenda structureert het gesprek maar doet geen inhoudelijke claims op zichzelf.',
    trustFrame:
      'Laat zien dat Loep Cultuurbeeld als begeleid boardroomproduct wordt geleverd, niet als losse tooloutput.',
  },
  {
    id: 'culture-assessment-invite-mail',
    label: 'Loep Cultuurbeeld sample invite mail',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_SAMPLE_INVITE_MAIL.md',
    intendedUse:
      'Voorbeeld van de baseline-introductiemail aan deelnemers in een veilige, board-level context.',
    evidenceTier: 'trust_proof',
    buyerUse: 'Gebruik in delivery en demo; niet als marketingclaim of open websitecopy.',
    claimBoundary:
      'Mail bewaakt privacy, baselineverwachting en fixed-instrument framing.',
    trustFrame:
      'Ondersteunt geloofwaardige census-uitnodiging zonder self-serve of custom-module framing.',
  },
  {
    id: 'culture-assessment-what-you-receive',
    label: 'Loep Cultuurbeeld what you receive page',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'guided_sales_demo',
    deliveryReadiness: 'blueprint_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md',
    intendedUse:
      'Sales- en onboardingartifact dat precies laat zien welke baseline-output de klant krijgt na afronding.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Gebruik om verwachtingen te zetten; niet als benchmark- of effectbewijs.',
    claimBoundary:
      'Blijft binnen de V1-outputgrenzen en verkoopt geen self-serve, benchmark of managerlaag die niet standaard openstaat.',
    trustFrame:
      'Maakt het product tastbaar zonder de buyer in dashboards of extra modules te trekken.',
  },
  {
    id: 'culture-assessment-demo-environment',
    label: 'Loep Cultuurbeeld demo environment guide',
    product: 'culture_assessment',
    kind: 'doc',
    status: 'internal demo support',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'demo_asset_ready',
    docsPath: 'docs/reference/CULTURE_ASSESSMENT_DEMO_ENVIRONMENT.md',
    intendedUse:
      'Interne gids voor fictieve demo-organisatie, dashboardroute en begeleide live demo zonder echte klantdata.',
    evidenceTier: 'trust_proof',
    buyerUse: 'Alleen intern gebruiken voor demo-voorbereiding; niet presenteren als live klantomgeving.',
    claimBoundary:
      'Demo-omgeving gebruikt fictieve data en mag niet worden uitgelegd als benchmark, casusbewijs of geautomatiseerde self-serve flow.',
    trustFrame:
      'Biedt een veilige demo-route naast het sample output pack.',
  },
  {
    id: 'exit-legacy-sample',
    label: 'Legacy ExitScan 35 fictief',
    product: 'exit',
    kind: 'pdf',
    status: 'legacy archive',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'commercial_delivery_ready',
    docsPath: 'docs/examples/voorbeeldrapport_exitscan_35_fictief.pdf',
    intendedUse:
      'Historisch referentiepunt voor eerdere reportvormen; niet meer buyer-facing leidend.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Alleen archief; niet buyer-facing gebruiken.',
    claimBoundary:
      'Niet gebruiken als normbeeld voor actuele site-, sales- of pricinglagen.',
    trustFrame:
      'Alleen archiefmateriaal voor vergelijking met oudere output.',
  },
  {
    id: 'retention-legacy-sample',
    label: 'Legacy RetentieScan 35 fictief',
    product: 'retention',
    kind: 'pdf',
    status: 'legacy archive',
    accessMode: 'internal_demo_only',
    deliveryReadiness: 'commercial_delivery_ready',
    docsPath: 'docs/examples/voorbeeldrapport_retentiescan_35_fictief.pdf',
    intendedUse:
      'Historisch referentiepunt voor eerdere reportvormen; niet meer buyer-facing leidend.',
    evidenceTier: 'deliverable_proof',
    buyerUse: 'Alleen archief; niet buyer-facing gebruiken.',
    claimBoundary:
      'Niet gebruiken als normbeeld voor actuele site-, sales- of pricinglagen.',
    trustFrame:
      'Alleen archiefmateriaal voor vergelijking met oudere output.',
  },
]

export function getPrimarySampleShowcaseAsset(product: 'exit' | 'retention') {
  return SAMPLE_SHOWCASE_ASSETS.find(
    (asset) => asset.product === product && asset.kind === 'pdf' && asset.status === 'buyer-facing active',
  )
}

export function getBuyerFacingShowcaseAssets() {
  return SAMPLE_SHOWCASE_ASSETS.filter((asset) => asset.status === 'buyer-facing active')
}

export function getInternalDemoShowcaseAssets(product?: SampleShowcaseProduct) {
  return SAMPLE_SHOWCASE_ASSETS.filter(
    (asset) => asset.status === 'internal demo support' && (product ? asset.product === product : true),
  )
}
