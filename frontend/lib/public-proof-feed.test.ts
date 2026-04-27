import { describe, expect, it } from 'vitest'
import { canPublishProofCard, mapPublicProofCard } from '@/lib/public-proof-feed'

describe('public proof feed', () => {
  it('only publishes approved public proof', () => {
    expect(canPublishProofCard({ proofState: 'public_usable', approvalState: 'approved' })).toBe(true)
    expect(canPublishProofCard({ proofState: 'sales_usable', approvalState: 'approved' })).toBe(false)
  })

  it('maps approved proof rows into public card shape', () => {
    expect(
      mapPublicProofCard({
        route: 'ExitScan',
        summary: 'Bounded summary',
        claimableObservation: 'Claimable approved observation',
      }),
    ).toEqual({
      title: 'ExitScan in gebruik',
      body: 'Claimable approved observation',
      approval: 'public_usable',
    })
  })
})
