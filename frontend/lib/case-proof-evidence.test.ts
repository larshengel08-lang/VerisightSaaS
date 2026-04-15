import { describe, expect, it } from 'vitest'
import {
  CASE_PROOF_FORMATS,
  EVIDENCE_APPROVAL_STATUS_OPTIONS,
  EVIDENCE_SURFACE_MATRIX,
  EVIDENCE_TIER_OPTIONS,
  getEvidenceTierLabel,
} from '@/lib/case-proof-evidence'

describe('case proof and evidence contracts', () => {
  it('keeps the canonical evidence taxonomy in the intended order', () => {
    expect(EVIDENCE_TIER_OPTIONS.map((option) => option.value)).toEqual([
      'deliverable_proof',
      'trust_proof',
      'validation_evidence',
      'case_candidate',
      'approved_case_proof',
      'reference_ready',
    ])
  })

  it('keeps the approval flow explicit and complete', () => {
    expect(EVIDENCE_APPROVAL_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      'draft',
      'internal_review',
      'claim_check',
      'customer_permission',
      'approved',
    ])
  })

  it('keeps public surfaces sample-first until approved case-proof exists', () => {
    const siteSurface = EVIDENCE_SURFACE_MATRIX.find((entry) => entry.surface === 'site')
    const demoSurface = EVIDENCE_SURFACE_MATRIX.find((entry) => entry.surface === 'demo')

    expect(siteSurface?.defaultTier).toBe('deliverable_proof')
    expect(siteSurface?.allowedTiers).toContain('approved_case_proof')
    expect(siteSurface?.blockedTiers).toContain('case_candidate')
    expect(demoSurface?.blockedTiers).toContain('approved_case_proof')
  })

  it('keeps reusable proof formats tied to approved tiers', () => {
    expect(CASE_PROOF_FORMATS.find((format) => format.id === 'anonymous_case')?.minimumTier).toBe('approved_case_proof')
    expect(CASE_PROOF_FORMATS.find((format) => format.id === 'reference_note')?.minimumTier).toBe('reference_ready')
    expect(getEvidenceTierLabel('deliverable_proof')).toBe('Deliverable-proof')
  })
})
