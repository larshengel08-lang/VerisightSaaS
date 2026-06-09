import type { EvidenceTier } from '@/lib/case-proof-evidence'

export type SampleShowcaseStatus =
  | 'buyer-facing active'
  | 'internal demo support'
  | 'legacy archive'

export type SampleShowcaseProduct = 'exit' | 'retention' | 'portfolio' | 'shared'

export type SampleShowcaseKind = 'pdf' | 'preview' | 'image'

export interface SampleShowcaseAsset {
  id: string
  label: string
  product: SampleShowcaseProduct
  kind: SampleShowcaseKind
  status: SampleShowcaseStatus
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
    docsPath: 'docs/examples/voorbeeldrapport_verisight.pdf',
    publicHref: '/examples/voorbeeldrapport_verisight.pdf',
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
    id: 'exit-legacy-sample',
    label: 'Legacy ExitScan 35 fictief',
    product: 'exit',
    kind: 'pdf',
    status: 'legacy archive',
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
