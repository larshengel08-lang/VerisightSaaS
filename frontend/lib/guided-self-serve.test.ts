import { describe, expect, it } from 'vitest'
import { buildGuidedSelfServeState } from '@/lib/guided-self-serve'

describe('guided self-serve execution state', () => {
  it('keeps the customer in data-required mode until a validated participant file exists', () => {
    const state = buildGuidedSelfServeState({
      isActive: true,
      totalInvited: 0,
      totalCompleted: 0,
      invitesNotSent: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
    })

    expect(state.phase).toBe('data_required')
    expect(state.dashboardVisible).toBe(false)
    expect(state.deeperInsightsVisible).toBe(false)
    expect(state.nextAction.title.toLowerCase()).toContain('deelnemersbestand')
    expect(state.statusBlocks.find((item) => item.key === 'setup_incomplete')?.status).toBe('current')
    expect(state.statusBlocks.find((item) => item.key === 'data_required')?.status).toBe('current')
  })

  it('moves to invite-ready when participants exist but launch has not been sent yet', () => {
    const state = buildGuidedSelfServeState({
      isActive: true,
      totalInvited: 18,
      totalCompleted: 0,
      invitesNotSent: 18,
      hasMinDisplay: false,
      hasEnoughData: false,
    })

    expect(state.phase).toBe('ready_to_invite')
    expect(state.nextAction.title.toLowerCase()).toContain('uitnodigingen')
    expect(state.statusBlocks.find((item) => item.key === 'ready_to_invite')?.status).toBe('current')
    expect(state.statusBlocks.find((item) => item.key === 'responses_incoming')?.status).toBe('blocked')
  })

  it('keeps dashboard access locked while responses are still below the first safe threshold', () => {
    const state = buildGuidedSelfServeState({
      isActive: true,
      totalInvited: 24,
      totalCompleted: 3,
      invitesNotSent: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
    })

    expect(state.phase).toBe('responses_incoming')
    expect(state.dashboardVisible).toBe(false)
    expect(state.detail.toLowerCase()).toContain('vanaf 5')
    expect(state.nextAction.body.toLowerCase()).toContain('responses')
  })

  it('activates the dashboard at first-value threshold but keeps deeper insights behind the pattern threshold', () => {
    const state = buildGuidedSelfServeState({
      isActive: true,
      totalInvited: 24,
      totalCompleted: 6,
      invitesNotSent: 0,
      hasMinDisplay: true,
      hasEnoughData: false,
    })

    expect(state.phase).toBe('dashboard_active')
    expect(state.dashboardVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(false)
    expect(state.nextAction.title.toLowerCase()).toContain('compacte dashboardread')
    expect(state.statusBlocks.find((item) => item.key === 'dashboard_active')?.status).toBe('current')
  })

  it('switches to first-next-step once readiness and pattern threshold are both reached', () => {
    const state = buildGuidedSelfServeState({
      isActive: true,
      totalInvited: 24,
      totalCompleted: 11,
      invitesNotSent: 0,
      hasMinDisplay: true,
      hasEnoughData: true,
    })

    expect(state.phase).toBe('first_next_step_available')
    expect(state.dashboardVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(true)
    expect(state.nextAction.title.toLowerCase()).toContain('eerste vervolgstap')
    expect(state.statusBlocks.find((item) => item.key === 'first_next_step_available')?.status).toBe('current')
  })

  it('keeps a closed campaign out of self-serve execution mode', () => {
    const state = buildGuidedSelfServeState({
      isActive: false,
      totalInvited: 24,
      totalCompleted: 11,
      invitesNotSent: 0,
      hasMinDisplay: true,
      hasEnoughData: true,
    })

    expect(state.phase).toBe('closed')
    expect(state.nextAction.title.toLowerCase()).toContain('vervolggesprek')
    expect(state.statusBlocks.find((item) => item.key === 'dashboard_active')?.status).toBe('done')
  })
})
