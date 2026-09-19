import { describe, expect, it } from 'vitest'
import {
  CULTURE_ASSESSMENT_DASHBOARD_THRESHOLD,
  CULTURE_ASSESSMENT_INSIGHT_THRESHOLD,
  FIRST_DASHBOARD_THRESHOLD,
  FIRST_INSIGHT_THRESHOLD,
  MIN_INVITED_PER_DEPARTMENT,
  MIN_INVITED_TOTAL,
  buildResponseActivationState,
  isReportReleaseReady,
  validateDepartmentInvitedCount,
  validateInvitedTotal,
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
    expect(state.statusDetail).toContain('first management use')
  })

  it('switches to active insights once the pattern threshold is reached', () => {
    const state = buildResponseActivationState(FIRST_INSIGHT_THRESHOLD)

    expect(state.stage).toBe('insights_active')
    expect(state.readinessLabel).toBe('Eerste patroonduiding beschikbaar')
    expect(state.dashboardVisible).toBe(true)
    expect(state.reportVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(true)
    expect(state.heroActionLabel).toBe('Eerste inzichten actief')
    expect(state.statusDetail).toContain('reviewmoment')
    expect(state.statusDetail).toContain('follow-up')
  })

  it('keeps culture assessment results locked while the annual baseline is still open', () => {
    const state = buildResponseActivationState(CULTURE_ASSESSMENT_DASHBOARD_THRESHOLD + 4, {
      scanType: 'culture_assessment',
      isActive: true,
    })

    expect(state.stage).toBe('collecting_responses')
    expect(state.readinessLabel).toBe('Baseline loopt nog')
    expect(state.dashboardVisible).toBe(false)
    expect(state.reportVisible).toBe(false)
    expect(state.deeperInsightsVisible).toBe(false)
    expect(state.heroActionLabel).toBe('Sluit baseline voor resultaatvrijgave')
    expect(state.statusDetail).toContain('baseline formeel is gesloten')
  })

  it('releases culture assessment results only after close and threshold', () => {
    const state = buildResponseActivationState(CULTURE_ASSESSMENT_INSIGHT_THRESHOLD, {
      scanType: 'culture_assessment',
      isActive: false,
    })

    expect(state.stage).toBe('insights_active')
    expect(state.dashboardVisible).toBe(true)
    expect(state.reportVisible).toBe(true)
    expect(state.deeperInsightsVisible).toBe(true)
  })
})

describe('isReportReleaseReady (spec 2026-09-11 par. 4.1)', () => {
  it('geeft het rapport pas vrij vanaf FIRST_INSIGHT_THRESHOLD ingevulde vragenlijsten', () => {
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD - 1)).toBe(false)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD)).toBe(true)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD, { scanType: 'exit' })).toBe(true)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD, { scanType: 'retention' })).toBe(true)
    expect(isReportReleaseReady(FIRST_INSIGHT_THRESHOLD, { scanType: 'onboarding' })).toBe(true)
  })

  it('ligt boven de dashboarddrempel van 5: 5 t/m 9 is nog geen rapport', () => {
    expect(isReportReleaseReady(FIRST_DASHBOARD_THRESHOLD)).toBe(false)
    expect(isReportReleaseReady(9)).toBe(false)
  })

  it('houdt voor culture_assessment de bestaande 30-grens', () => {
    expect(isReportReleaseReady(CULTURE_ASSESSMENT_INSIGHT_THRESHOLD - 1, { scanType: 'culture_assessment' })).toBe(false)
    expect(isReportReleaseReady(CULTURE_ASSESSMENT_INSIGHT_THRESHOLD, { scanType: 'culture_assessment' })).toBe(true)
  })

  it('behandelt ongeldige invoer als nul', () => {
    expect(isReportReleaseReady(Number.NaN)).toBe(false)
    expect(isReportReleaseReady(-3)).toBe(false)
  })
})

describe('drempels voor uitgenodigden (spec 2026-09-16 par. 5.1)', () => {
  it('MIN_INVITED_TOTAL is de rapportdrempel en MIN_INVITED_PER_DEPARTMENT spiegelt MIN_SEGMENT_N', () => {
    expect(MIN_INVITED_TOTAL).toBe(FIRST_INSIGHT_THRESHOLD)
    expect(MIN_INVITED_TOTAL).toBe(10)
    expect(MIN_INVITED_PER_DEPARTMENT).toBe(5)
  })

  it('validateInvitedTotal wijst onder de 10 af met de klantmelding en accepteert 10', () => {
    expect(validateInvitedTotal(9)).toBe(
      'Vul minimaal 10 deelnemers in. Onder de 10 ingevulde vragenlijsten maakt Loep geen rapport.',
    )
    expect(validateInvitedTotal(3)).toContain('minimaal 10')
    expect(validateInvitedTotal(10)).toBeNull()
    expect(validateInvitedTotal(180)).toBeNull()
  })

  it('validateInvitedTotal wijst lege, niet-gehele en onbruikbare waarden af', () => {
    expect(validateInvitedTotal('')).not.toBeNull()
    expect(validateInvitedTotal(null)).not.toBeNull()
    expect(validateInvitedTotal(10.5)).not.toBeNull()
    expect(validateInvitedTotal(Number.NaN)).not.toBeNull()
    expect(validateInvitedTotal('12')).toBeNull()
  })

  it('validateDepartmentInvitedCount noemt de afdeling en de samenvoegregel', () => {
    expect(validateDepartmentInvitedCount('Zorg', 4)).toBe(
      'Afdeling Zorg: minimaal 5 deelnemers. Kleinere afdelingen voeg je samen; anders krijgt deze afdeling geen eigen regel in het rapport.',
    )
    expect(validateDepartmentInvitedCount('Zorg', 5)).toBeNull()
    expect(validateDepartmentInvitedCount('  ', 0)).toContain('Afdeling zonder naam')
  })

  it('de meldingen bevatten geen em- of en-dashes', () => {
    expect(validateInvitedTotal(1)).not.toMatch(/[—–]/)
    expect(validateDepartmentInvitedCount('Zorg', 1)).not.toMatch(/[—–]/)
  })
})
