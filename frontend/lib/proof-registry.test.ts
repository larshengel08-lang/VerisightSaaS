import { describe, expect, it } from 'vitest'
import { getProofApprovalLabel } from '@/lib/proof-registry'

describe('proof registry helpers', () => {
  it('labels proof approval states correctly', () => {
    expect(getProofApprovalLabel('draft')).toBe('Concept')
    expect(getProofApprovalLabel('approved')).toBe('Goedgekeurd')
  })
})
