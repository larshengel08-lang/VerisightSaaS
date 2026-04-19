import { describe, expect, it } from 'vitest'
import {
  buildCustomerExpansionResult,
  countEligibleDepartmentGroups,
  type CustomerExpansionInput,
} from '@/lib/customer-expansion-suggester'

function createInput(overrides: Partial<CustomerExpansionInput> = {}): CustomerExpansionInput {
  return {
    scanType: 'retention',
    deliveryMode: 'baseline',
    responsesLength: 12,
    hasMinDisplay: true,
    hasEnoughData: true,
    firstManagementUseConfirmed: true,
    followUpAlreadyDecided: false,
    reviewMoment: 'Over 45 dagen een review met MT en HR.',
    firstActionTaken: 'Eerste behoudsactie ligt bij de business lead.',
    managementActionOutcome: 'Eigenaar en eerste actie zijn vastgelegd.',
    nextRouteRecorded: null,
    hasSegmentDeepDive: true,
    eligibleDepartmentGroupCount: 2,
    ...overrides,
  }
}

describe('countEligibleDepartmentGroups', () => {
  it('counts only department groups with at least five responses', () => {
    const eligibleGroupCount = countEligibleDepartmentGroups([
      { respondents: { department: 'Sales' } },
      { respondents: { department: 'Sales' } },
      { respondents: { department: 'Sales' } },
      { respondents: { department: 'Sales' } },
      { respondents: { department: 'Sales' } },
      { respondents: { department: 'HR' } },
      { respondents: { department: 'HR' } },
      { respondents: { department: 'HR' } },
      { respondents: { department: 'HR' } },
      { respondents: { department: 'IT' } },
      { respondents: { department: 'IT' } },
    ])

    expect(eligibleGroupCount).toBe(1)
  })
})

describe('buildCustomerExpansionResult', () => {
  it('blocks expansion decisions before first management use', () => {
    const result = buildCustomerExpansionResult(
      createInput({
        firstManagementUseConfirmed: false,
        reviewMoment: null,
        firstActionTaken: null,
        managementActionOutcome: null,
      }),
    )

    expect(result.readiness).toBe('not_ready')
    expect(result.primaryRouteKey).toBeNull()
    expect(result.blockers.join(' ').toLowerCase()).toContain('first management use')
    expect(result.suggestions.every((suggestion) => suggestion.status === 'nu_niet')).toBe(true)
  })

  it('prioritises retention rhythm over bounded alternatives when the retention route is ready', () => {
    const result = buildCustomerExpansionResult(createInput())

    expect(result.readiness).toBe('ready')
    expect(result.primaryRouteKey).toBe('retention_rhythm')
    expect(result.suggestions[0]).toMatchObject({
      routeKey: 'retention_rhythm',
      status: 'aanbevolen',
      confidence: 'hoog',
      applyLabel: 'RetentieScan ritme',
    })
    expect(result.suggestions.find((suggestion) => suggestion.routeKey === 'pulse')).toMatchObject({
      status: 'te_overwegen',
      confidence: 'middel',
    })
  })

  it('downgrades retention rhythm to a bounded compact follow-up when review logic is still thin', () => {
    const result = buildCustomerExpansionResult(
      createInput({
        reviewMoment: null,
        firstActionTaken: null,
        managementActionOutcome: null,
      }),
    )

    expect(result.primaryRouteKey).toBe('compact_follow_up')
    expect(result.suggestions.find((suggestion) => suggestion.routeKey === 'retention_rhythm')).toMatchObject({
      status: 'te_overwegen',
      confidence: 'middel',
    })
    expect(result.suggestions.find((suggestion) => suggestion.routeKey === 'compact_follow_up')).toMatchObject({
      status: 'aanbevolen',
    })
  })

  it('suppresses segment deep dive and TeamScan when data or metadata gates are missing', () => {
    const result = buildCustomerExpansionResult(
      createInput({
        responsesLength: 8,
        hasEnoughData: false,
        hasSegmentDeepDive: false,
        eligibleDepartmentGroupCount: 0,
      }),
    )

    expect(result.suggestions.find((suggestion) => suggestion.routeKey === 'segment_deep_dive')).toMatchObject({
      status: 'nu_niet',
    })
    expect(result.suggestions.find((suggestion) => suggestion.routeKey === 'teamscan')).toMatchObject({
      status: 'nu_niet',
    })
  })

  it('treats an already recorded follow-up as a reference state instead of a new push', () => {
    const result = buildCustomerExpansionResult(
      createInput({
        followUpAlreadyDecided: true,
        nextRouteRecorded: 'RetentieScan ritme',
      }),
    )

    expect(result.readiness).toBe('already_decided')
    expect(result.summary).toContain('RetentieScan ritme')
  })
})
