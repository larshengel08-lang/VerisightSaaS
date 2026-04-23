import { describe, expect, it } from 'vitest'
import {
  FIRST_DASHBOARD_THRESHOLD,
  FIRST_INSIGHT_THRESHOLD,
  buildResponseActivationState,
} from '@/lib/response-activation'

describe('response activation thresholds', () => {
  it('keeps dashboard and report locked before the first safe response threshold', () => {
    const state = buildResponseActivationState(0)

    expect(state.stage).toBe('collecting_responses')
    expect(state.readinessLabel).toBe('Nog in opbouw')
    expect(state.dashboardVisible).toBe(false)
    expect(state.reportVisible).toBe(false)
    expect(state.deeperInsightsVisible).toBe(false)
    expect(state.remainingToDashboard).toBe(FIRST_DASHBOARD_THRESHOLD)
    expect(state.statusDetail).toContain(`${FIRST_DASHBOARD_THRESHOLD} responses`)
  })

  it('turns almost-ready messaging concrete right before dashboard activation', () => {
    const state = buildResponseActivationState(FIRST_DASHBOARD_THRESHOLD - 1)

    expect(state.stage).toBe('collecting_responses')
    expect(state.heroActionLabel).toBe('Nog 1 response tot dashboardread')
    expect(state.statusDetail).toContain('Nog 1 response')
  })

  it('activates dashboard and report first, but keeps deeper insights closed until pattern readiness', () => {
    const state = buildResponseActivationState(FIRST_DASHBOARD_THRESHOLD + 1)

    expect(state.stage).toBe('dashboard_active')
    expect(state.readinessLabel).toBe('Indicatief beeld')
    expect(state.dashboardVisible).toBe(true)
    expect(state.reportVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(false)
    expect(state.remainingToInsights).toBe(FIRST_INSIGHT_THRESHOLD - (FIRST_DASHBOARD_THRESHOLD + 1))
    expect(state.statusDetail).toContain('Nog 4 responses')
  })

  it('switches to active insights once the pattern threshold is reached', () => {
    const state = buildResponseActivationState(FIRST_INSIGHT_THRESHOLD)

    expect(state.stage).toBe('insights_active')
    expect(state.readinessLabel).toBe('Eerste patroonduiding beschikbaar')
    expect(state.dashboardVisible).toBe(true)
    expect(state.reportVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(true)
    expect(state.heroActionLabel).toBe('Eerste inzichten actief')
  })
})
