import { describe, expect, it } from 'vitest'
import {
  CONTENT_GROWTH_GUARDRAILS,
  CONTENT_OPERATING_DEFAULTS,
  CONTENT_REUSE_PATTERNS,
  CONTENT_SYSTEM_LAYERS,
  CONTENT_SYSTEM_SOURCE_OF_TRUTH,
  CONTENT_SYSTEM_SURFACES,
  NON_REUSABLE_BUYER_FACING_ASSETS,
} from '@/lib/content-operating-system'

describe('content operating system defaults', () => {
  it('keeps ExitScan as the primary wedge and RetentieScan as the complement', () => {
    expect(CONTENT_OPERATING_DEFAULTS.primaryContentWedge).toBe('exitscan')
    expect(CONTENT_OPERATING_DEFAULTS.complementaryRoute).toBe('retentiescan')
    expect(CONTENT_OPERATING_DEFAULTS.publicProofMode).toBe('sample-first')
    expect(CONTENT_OPERATING_DEFAULTS.thoughtLeadershipMode).toBe('reserved growth')
  })

  it('keeps the source-of-truth order anchored in strategy, active plans and reference docs before implementation registries', () => {
    expect(CONTENT_SYSTEM_SOURCE_OF_TRUTH.slice(0, 4)).toEqual([
      'docs/strategy/STRATEGY.md',
      'docs/strategy/ROADMAP.md',
      'docs/prompts/PROMPT_CHECKLIST.xlsx',
      'docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md',
    ])
    expect(CONTENT_SYSTEM_SOURCE_OF_TRUTH).toContain('frontend/components/marketing/site-content.ts')
    expect(CONTENT_SYSTEM_SOURCE_OF_TRUTH).toContain('frontend/lib/seo-solution-pages.ts')
  })
})

describe('content operating system layers', () => {
  it('defines the six canonical content layers', () => {
    expect(CONTENT_SYSTEM_LAYERS.map((layer) => layer.id)).toEqual([
      'route_content',
      'proof_content',
      'trust_content',
      'conversion_content',
      'sales_enablement_content',
      'reserved_growth_content',
    ])
  })

  it('keeps proof and trust layers bounded to the current evidence and reassurance rules', () => {
    const proofLayer = CONTENT_SYSTEM_LAYERS.find((layer) => layer.id === 'proof_content')
    const trustLayer = CONTENT_SYSTEM_LAYERS.find((layer) => layer.id === 'trust_content')

    expect(proofLayer?.claimBoundary.toLowerCase()).toContain('sample-first')
    expect(proofLayer?.claimBoundary.toLowerCase()).toContain('not case-proof')
    expect(trustLayer?.claimBoundary.toLowerCase()).toContain('not become the first pitch')
  })
})

describe('content operating system surfaces', () => {
  it('keeps primary surface ownership aligned with the buyer journey', () => {
    const home = CONTENT_SYSTEM_SURFACES.find((surface) => surface.id === 'home')
    const productdetail = CONTENT_SYSTEM_SURFACES.find((surface) => surface.id === 'productdetail')
    const solutions = CONTENT_SYSTEM_SURFACES.find((surface) => surface.id === 'oplossingen')
    const trust = CONTENT_SYSTEM_SURFACES.find((surface) => surface.id === 'vertrouwen')

    expect(home?.role.toLowerCase()).toContain('route choice')
    expect(productdetail?.role.toLowerCase()).toContain('primary deliverable-proof')
    expect(solutions?.role.toLowerCase()).toContain('compact intent-led entrance')
    expect(trust?.role.toLowerCase()).toContain('due diligence')
  })

  it('keeps forbidden surface drift explicit', () => {
    const home = CONTENT_SYSTEM_SURFACES.find((surface) => surface.id === 'home')
    const pricing = CONTENT_SYSTEM_SURFACES.find((surface) => surface.id === 'tarieven')
    const trust = CONTENT_SYSTEM_SURFACES.find((surface) => surface.id === 'vertrouwen')

    expect(home?.mustNotDo.join(' ').toLowerCase()).toContain('full trust, pricing and proof')
    expect(pricing?.mustNotDo.join(' ').toLowerCase()).toContain('new product taxonomy')
    expect(trust?.mustNotDo.join(' ').toLowerCase()).toContain('first pitch')
  })
})

describe('content operating system governance', () => {
  it('keeps reusable content blocks and non-reusable internal assets distinct', () => {
    expect(CONTENT_REUSE_PATTERNS).toContain('sample proof')
    expect(CONTENT_REUSE_PATTERNS).toContain('pricing framing')
    expect(NON_REUSABLE_BUYER_FACING_ASSETS).toContain('internal-only demo content')
    expect(NON_REUSABLE_BUYER_FACING_ASSETS).toContain('case candidates')
  })

  it('keeps controlled growth explicitly bounded', () => {
    expect(CONTENT_GROWTH_GUARDRAILS.allowedLater).toContain('approved case-proof surfaces')
    expect(CONTENT_GROWTH_GUARDRAILS.notNow).toContain('broad blog')
    expect(CONTENT_GROWTH_GUARDRAILS.notNow).toContain('topical SEO clusters')
  })
})
