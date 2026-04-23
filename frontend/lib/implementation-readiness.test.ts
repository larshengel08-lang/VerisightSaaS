import { describe, expect, it } from 'vitest'
import { buildCampaignReadinessState } from '@/lib/implementation-readiness'

describe('campaign readiness gates', () => {
  it('blocks launch until the imported dataset is cleared for launch', () => {
    const state = buildCampaignReadinessState({
      totalInvited: 8,
      totalCompleted: 0,
      invitesNotSent: 8,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 0,
      importReady: false,
    })

    expect(state.launchReady).toBe(false)
    expect(state.headline.toLowerCase()).toContain('import')
    expect(state.detail.toLowerCase()).toContain('deelnemersbestand')
    expect(state.nextStep.toLowerCase()).toContain('import')
  })

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
      importReady: true,
      launchControlReady: false,
      launchControlBlockers: ['Formele startdatum ontbreekt nog.'],
    })

    expect(state.launchReady).toBe(false)
    expect(state.headline).toContain('Launchcontrole')
    expect(state.detail).toContain('startdatum')
  })
})
