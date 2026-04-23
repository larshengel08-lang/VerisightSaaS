import { describe, expect, it } from 'vitest'
import { buildCampaignReadinessState } from '@/lib/implementation-readiness'

describe('campaign readiness with launch controls', () => {
  it('keeps readiness blocked when launch controls are incomplete even if invites are technically live', () => {
    const state = buildCampaignReadinessState({
      totalInvited: 12,
      totalCompleted: 5,
      invitesNotSent: 0,
      incompleteScores: 0,
      hasMinDisplay: true,
      hasEnoughData: false,
      activeClientAccessCount: 1,
      pendingClientInviteCount: 0,
      launchControlReady: false,
      launchControlBlockers: ['Formele startdatum ontbreekt nog.'],
    })

    expect(state.launchReady).toBe(false)
    expect(state.headline).toContain('Launchcontrole')
    expect(state.detail).toContain('startdatum')
  })
})
