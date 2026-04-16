export type ContentLayerId =
  | 'route_content'
  | 'proof_content'
  | 'trust_content'
  | 'conversion_content'
  | 'sales_enablement_content'
  | 'reserved_growth_content'

export interface ContentLayerContract {
  id: ContentLayerId
  label: string
  intendedUse: string
  primaryAudience: string
  claimBoundary: string
  updateSources: readonly string[]
  allowedSurfaces: readonly string[]
}

export interface ContentSurfaceContract {
  id: 'home' | 'producten' | 'productdetail' | 'oplossingen' | 'tarieven' | 'aanpak' | 'vertrouwen'
  primaryQuestion: string
  role: string
  canonicalSources: readonly string[]
  mustNotDo: readonly string[]
}

export const CONTENT_SYSTEM_SOURCE_OF_TRUTH = [
  'docs/strategy/STRATEGY.md',
  'docs/strategy/ROADMAP.md',
  'docs/prompts/PROMPT_CHECKLIST.xlsx',
  'docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md',
  'docs/reference/PRODUCT_TERMINOLOGY_AND_TAXONOMY.md',
  'docs/reference/TRUST_AND_CLAIMS_MATRIX.md',
  'docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md',
  'docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md',
  'docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md',
  'frontend/lib/content-operating-system.ts',
  'frontend/components/marketing/site-content.ts',
  'frontend/lib/marketing-products.ts',
  'frontend/lib/seo-solution-pages.ts',
  'frontend/lib/sample-showcase-assets.ts',
] as const

export const CONTENT_OPERATING_DEFAULTS = {
  primaryContentWedge: 'exitscan',
  complementaryRoute: 'retentiescan',
  portfolioDependency: 'portfolio architecture remains explicit dependency',
  publicProofMode: 'sample-first',
  thoughtLeadershipMode: 'reserved growth',
  trustRole: 'reassurance and due diligence',
} as const

export const CONTENT_SYSTEM_LAYERS: readonly ContentLayerContract[] = [
  {
    id: 'route_content',
    label: 'Route content',
    intendedUse: 'Help buyers choose which management question counts first.',
    primaryAudience: 'First-time buyers comparing ExitScan, RetentieScan and the combination route.',
    claimBoundary: 'Must accelerate route choice without collapsing into pricing, trust or broad proof overload.',
    updateSources: ['docs/strategy/STRATEGY.md', 'frontend/lib/marketing-products.ts', 'frontend/components/marketing/site-content.ts'],
    allowedSurfaces: ['home', 'producten', 'oplossingen'],
  },
  {
    id: 'proof_content',
    label: 'Proof content',
    intendedUse: 'Show what management actually gets back from the product.',
    primaryAudience: 'Buyers validating deliverable quality and product fit.',
    claimBoundary: 'Public proof stays sample-first as deliverable-proof and supporting trust-proof, not case-proof.',
    updateSources: ['docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md', 'docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md', 'frontend/lib/sample-showcase-assets.ts'],
    allowedSurfaces: ['home', 'productdetail', 'tarieven', 'vertrouwen', 'oplossingen'],
  },
  {
    id: 'trust_content',
    label: 'Trust content',
    intendedUse: 'Make privacy, claims boundaries and report reading publicly verifiable.',
    primaryAudience: 'Buyers doing due diligence before or after first product understanding.',
    claimBoundary: 'Trust supports reassurance and verification and must not become the first pitch.',
    updateSources: ['docs/reference/TRUST_AND_CLAIMS_MATRIX.md', 'frontend/components/marketing/site-content.ts'],
    allowedSurfaces: ['vertrouwen', 'productdetail', 'tarieven', 'home'],
  },
  {
    id: 'conversion_content',
    label: 'Conversion content',
    intendedUse: 'Preserve momentum from route choice and proof into route-aware next steps.',
    primaryAudience: 'Buyers ready to move into kennismaking, pricing or approach review.',
    claimBoundary: 'Conversion may not distort product taxonomy, claims or evidence tiers.',
    updateSources: ['frontend/lib/contact-funnel.ts', 'frontend/components/marketing/site-content.ts'],
    allowedSurfaces: ['home', 'productdetail', 'tarieven', 'aanpak', 'oplossingen'],
  },
  {
    id: 'sales_enablement_content',
    label: 'Sales enablement content',
    intendedUse: 'Keep proposals, follow-up and conversations aligned with the same site story.',
    primaryAudience: 'Founder-led and reusable sales delivery.',
    claimBoundary: 'Sales assets cannot add promises or evidence levels that site, trust and proof layers do not carry.',
    updateSources: ['docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md', 'docs/reference/EXITSCAN_SALES_ONE_PAGER.md', 'docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md'],
    allowedSurfaces: ['sales', 'follow-up', 'proposal'],
  },
  {
    id: 'reserved_growth_content',
    label: 'Reserved growth content',
    intendedUse: 'Capture later-phase expansion after portfolio architecture and traction are stronger.',
    primaryAudience: 'Future content operations, not current buyer-facing execution.',
    claimBoundary: 'No broad blog, knowledge base or scale-content machine in the current tranche.',
    updateSources: ['docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md', 'docs/strategy/ROADMAP.md'],
    allowedSurfaces: ['future case surfaces', 'future lifecycle content', 'future thought leadership reserve'],
  },
] as const

export const CONTENT_SYSTEM_SURFACES: readonly ContentSurfaceContract[] = [
  {
    id: 'home',
    primaryQuestion: 'Which management question matters first?',
    role: 'Route choice, premium proof teaser and central kennismaking entry.',
    canonicalSources: ['frontend/components/marketing/site-content.ts', 'frontend/lib/marketing-products.ts'],
    mustNotDo: ['carry full trust, pricing and proof at the same time', 'become a parallel knowledge hub'],
  },
  {
    id: 'producten',
    primaryQuestion: 'Which route fits best?',
    role: 'Chooser-first portfolio overview.',
    canonicalSources: ['frontend/lib/marketing-products.ts', 'frontend/components/marketing/site-content.ts'],
    mustNotDo: ['become the primary proof surface', 'replace product detail pages'],
  },
  {
    id: 'productdetail',
    primaryQuestion: 'What does this route concretely deliver?',
    role: 'Primary deliverable-proof and route-aware leadcapture surface.',
    canonicalSources: ['frontend/lib/sample-showcase-assets.ts', 'frontend/components/marketing/site-content.ts'],
    mustNotDo: ['open a parallel blog or portfolio storyline', 'sell unsupported evidence tiers'],
  },
  {
    id: 'oplossingen',
    primaryQuestion: 'Which existing product route fits this sharp intent?',
    role: 'Compact intent-led entrance into existing product routes.',
    canonicalSources: ['frontend/lib/seo-solution-pages.ts', 'frontend/lib/contact-funnel.ts'],
    mustNotDo: ['become a blog', 'become a generic content hub'],
  },
  {
    id: 'tarieven',
    primaryQuestion: 'What is the first paid route and what follows logically?',
    role: 'Packaging and pricing anchor layer.',
    canonicalSources: ['frontend/components/marketing/site-content.ts', 'docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md'],
    mustNotDo: ['introduce a new product taxonomy', 'turn into a feature matrix'],
  },
  {
    id: 'aanpak',
    primaryQuestion: 'How does the route move from akkoord to first management value?',
    role: 'Process and handoff layer.',
    canonicalSources: ['frontend/components/marketing/site-content.ts'],
    mustNotDo: ['carry the primary proof burden', 'replace route choice'],
  },
  {
    id: 'vertrouwen',
    primaryQuestion: 'What can a buyer publicly verify about privacy, method and report reading?',
    role: 'Due diligence and trusthub surface.',
    canonicalSources: ['docs/reference/TRUST_AND_CLAIMS_MATRIX.md', 'frontend/components/marketing/site-content.ts'],
    mustNotDo: ['become the first pitch', 'open a parallel awareness funnel'],
  },
] as const

export const CONTENT_REUSE_PATTERNS = [
  'product core',
  'pricing framing',
  'trust explanation',
  'sample proof',
  'objection snippets',
  'comparison snippets',
  'route-aware CTA framing',
] as const

export const NON_REUSABLE_BUYER_FACING_ASSETS = [
  'internal-only demo content',
  'learning dossiers',
  'case candidates',
  'technical enum or helper terms',
] as const

export const CONTENT_GROWTH_GUARDRAILS = {
  allowedLater: [
    'approved case-proof surfaces',
    'lifecycle and expansion content',
    'limited objection-led or theme-led assets with explicit product fit',
  ],
  notNow: [
    'broad blog',
    'knowledge base',
    'topical SEO clusters',
    'content calendar as a goal in itself',
    'standalone social or distribution machine without repo-governed core',
  ],
} as const
