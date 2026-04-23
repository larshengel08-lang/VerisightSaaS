import { describe, expect, it } from 'vitest'
import { buildGuidedSelfServeState } from '@/lib/guided-self-serve'

describe('guided self-serve execution state', () => {
  function buildArgs(overrides: Partial<Parameters<typeof buildGuidedSelfServeState>[0]> = {}) {
    return {
      isActive: true,
      totalInvited: 0,
      totalCompleted: 0,
      invitesNotSent: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      importReady: true,
      importQaConfirmed: false,
      launchTimingConfirmed: false,
      communicationReady: false,
      ...overrides,
    }
  }

  it('keeps the customer in data-required mode until a validated participant file exists', () => {
    const state = buildGuidedSelfServeState(buildArgs())

    expect(state.phase).toBe('participant_data_required')
    expect(state.dashboardVisible).toBe(false)
    expect(state.deeperInsightsVisible).toBe(false)
    expect(state.currentStateLabel).toBe('Deelnemersdata vereist')
    expect(state.nextAction.title.toLowerCase()).toContain('deelnemersbestand')
    expect(state.statusBlocks.find((item) => item.key === 'setup_incomplete')?.status).toBe('current')
    expect(state.statusBlocks.find((item) => item.key === 'participant_data_required')?.status).toBe('current')
    expect(state.statusBlocks.map((item) => item.label)).toEqual([
      'Setup incompleet',
      'Deelnemersdata vereist',
      'Import validatie vereist',
      'Launchdatum vereist',
      'Communicatie gereed',
      'Klaar om uit te nodigen',
      'Survey running',
      'Dashboard actief',
      'Eerste vervolgstap beschikbaar',
    ])
    expect(state.blockers[0]?.recovery.toLowerCase()).toContain('csv')
    expect(state.verisightNow.toLowerCase()).toContain('productgrenzen')
    expect(state.customerNow.toLowerCase()).toContain('deelnemersbestand')
  })

  it('keeps the customer on import recovery until the dataset is really cleared for launch', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 8,
        invitesNotSent: 8,
        importReady: false,
      }),
    )

    expect(state.phase).toBe('import_validation_required')
    expect(state.dashboardVisible).toBe(false)
    expect(state.nextAction.title.toLowerCase()).toContain('deelnemersbestand')
    expect(state.detail.toLowerCase()).toContain('nog niet vrijgegeven')
  })

  it('keeps import validation as the active blocker until import qa is confirmed', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 18,
        invitesNotSent: 18,
      }),
    )

    expect(state.phase).toBe('import_validation_required')
    expect(state.currentStateLabel).toBe('Import validatie vereist')
    expect(state.nextAction.title.toLowerCase()).toContain('import')
    expect(state.statusBlocks.find((item) => item.key === 'import_validation_required')?.status).toBe('current')
    expect(state.blockers.map((item) => item.title).join(' ')).toContain('Importcontrole')
  })

  it('moves to launch-date-required when import is validated but timing is still open', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 18,
        invitesNotSent: 18,
        importQaConfirmed: true,
      }),
    )

    expect(state.phase).toBe('launch_date_required')
    expect(state.currentStateLabel).toBe('Launchdatum vereist')
    expect(state.nextAction.title.toLowerCase()).toContain('launchmoment')
    expect(state.statusBlocks.find((item) => item.key === 'launch_date_required')?.status).toBe('current')
    expect(state.blockers.map((item) => item.title).join(' ')).toContain('Launchmoment')
  })

  it('keeps communication readiness explicit before the inviteflow can be released', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 18,
        invitesNotSent: 18,
        importQaConfirmed: true,
        launchTimingConfirmed: true,
      }),
    )

    expect(state.phase).toBe('communication_ready')
    expect(state.currentStateLabel).toBe('Communicatie gereed')
    expect(state.nextAction.title.toLowerCase()).toContain('communicatie')
    expect(state.statusBlocks.find((item) => item.key === 'communication_ready')?.status).toBe('current')
  })

  it('moves to invite-ready when setup discipline is confirmed and launch has not been sent yet', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 18,
        invitesNotSent: 18,
        importReady: true,
        importQaConfirmed: true,
        launchTimingConfirmed: true,
        communicationReady: true,
      }),
    )

    expect(state.phase).toBe('ready_to_invite')
    expect(state.nextAction.title.toLowerCase()).toContain('uitnodigingen')
    expect(state.statusBlocks.find((item) => item.key === 'ready_to_invite')?.status).toBe('current')
    expect(state.statusBlocks.find((item) => item.key === 'survey_running')?.status).toBe('blocked')
  })

  it('keeps dashboard access locked while responses are still below the first safe threshold', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 24,
        totalCompleted: 3,
        invitesNotSent: 0,
        importReady: true,
        importQaConfirmed: true,
        launchTimingConfirmed: true,
        communicationReady: true,
      }),
    )

    expect(state.phase).toBe('survey_running')
    expect(state.dashboardVisible).toBe(false)
    expect(state.detail.toLowerCase()).toContain('vanaf 5')
    expect(state.nextAction.body.toLowerCase()).toContain('responses')
  })

  it('activates the dashboard at first-value threshold but keeps deeper insights behind the pattern threshold', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 24,
        totalCompleted: 6,
        invitesNotSent: 0,
        hasMinDisplay: true,
        importReady: true,
        importQaConfirmed: true,
        launchTimingConfirmed: true,
        communicationReady: true,
      }),
    )

    expect(state.phase).toBe('dashboard_active')
    expect(state.dashboardVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(false)
    expect(state.nextAction.title.toLowerCase()).toContain('compacte dashboardread')
    expect(state.statusBlocks.find((item) => item.key === 'dashboard_active')?.status).toBe('current')
  })

  it('switches to first-next-step once readiness and pattern threshold are both reached', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        totalInvited: 24,
        totalCompleted: 11,
        invitesNotSent: 0,
        hasMinDisplay: true,
        hasEnoughData: true,
        importReady: true,
        importQaConfirmed: true,
        launchTimingConfirmed: true,
        communicationReady: true,
      }),
    )

    expect(state.phase).toBe('first_next_step_available')
    expect(state.dashboardVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(true)
    expect(state.nextAction.title.toLowerCase()).toContain('eerste vervolgstap')
    expect(state.statusBlocks.find((item) => item.key === 'first_next_step_available')?.status).toBe('current')
  })

  it('keeps a closed campaign out of self-serve execution mode', () => {
    const state = buildGuidedSelfServeState(
      buildArgs({
        isActive: false,
        totalInvited: 24,
        totalCompleted: 11,
        invitesNotSent: 0,
        hasMinDisplay: true,
        hasEnoughData: true,
        importReady: true,
        importQaConfirmed: true,
        launchTimingConfirmed: true,
        communicationReady: true,
      }),
    )

    expect(state.phase).toBe('closed')
    expect(state.nextAction.title.toLowerCase()).toContain('vervolggesprek')
    expect(state.statusBlocks.find((item) => item.key === 'dashboard_active')?.status).toBe('done')
  })
})
