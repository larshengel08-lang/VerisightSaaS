import { describe, expect, it } from 'vitest'
import {
  getOwnerDisplayName,
  getReviewOwnerDisplayName,
  getTeamManagerDisplayName,
} from '@/components/dashboard/action-center-preview'

describe('action center preview display helpers', () => {
  it('keeps unassigned canonical owners visibly unassigned while preserving review context labels', () => {
    expect(getOwnerDisplayName(null)).toBe('Nog niet toegewezen')
    expect(getTeamManagerDisplayName(null)).toBe('Nog niet toegewezen')
    expect(getReviewOwnerDisplayName('HR lead')).toBe('HR lead')
    expect(getReviewOwnerDisplayName(null)).toBe('Nog niet toegewezen')
  })
})
