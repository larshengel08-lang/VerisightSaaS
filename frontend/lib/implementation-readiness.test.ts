import { describe, expect, it } from 'vitest'
import { buildCampaignReadinessState } from './implementation-readiness'

describe('buildCampaignReadinessState', () => {
  it('treats client activation as the release moment instead of only an email event', () => {
    const state = buildCampaignReadinessState({
      totalInvited: 18,
      totalCompleted: 7,
      invitesNotSent: 0,
      incompleteScores: 0,
      hasMinDisplay: true,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 2,
    })

    expect(state.headline).toBe('Vrijgave via klantactivatie loopt')
    expect(state.detail).toContain('pas echt vrijgegeven')
    expect(state.nextStep).toContain('Bevestig accountactivatie')
    expect(state.nextStep).toContain('eerste dashboard- of rapportread')
  })
})
