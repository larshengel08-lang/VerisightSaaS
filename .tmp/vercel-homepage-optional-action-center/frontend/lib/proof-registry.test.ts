import { describe, expect, it } from 'vitest'
import { getProofApprovalLabel, getProofStateLabel, summarizeProofRegistry } from '@/lib/proof-registry'

describe('proof registry helpers', () => {
  it('labels proof approval states correctly', () => {
    expect(getProofApprovalLabel('draft')).toBe('Concept')
    expect(getProofApprovalLabel('approved')).toBe('Goedgekeurd')
    expect(getProofStateLabel('public_usable')).toBe('Publiek bruikbaar')
    expect(
      summarizeProofRegistry([
        {
          id: 'proof_1',
          orgId: null,
          campaignId: null,
          route: 'ExitScan',
          proofState: 'sales_usable',
          approvalState: 'claim_check',
          summary: 'test',
          claimableObservation: null,
          supportingArtifacts: [],
          createdAt: '2026-04-27T10:00:00.000Z',
        },
      ]),
    ).toMatchObject({ salesUsableCount: 1 })
  })
})
