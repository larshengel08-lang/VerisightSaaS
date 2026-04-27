import { describe, expect, it } from 'vitest'
import { canPublishProofCard } from '@/lib/public-proof-feed'

describe('public proof feed', () => {
  it('only publishes approved public proof', () => {
    expect(canPublishProofCard({ proofState: 'public_usable', approvalState: 'approved' })).toBe(true)
    expect(canPublishProofCard({ proofState: 'sales_usable', approvalState: 'approved' })).toBe(false)
  })
})
