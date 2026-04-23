import { describe, expect, it } from 'vitest'
import {
  buildTeamDashboardViewModel,
  buildTeamLocalReadState,
  buildTeamPriorityReadState,
} from '@/lib/products/team/dashboard'
import type { Respondent, SurveyResponse } from '@/lib/types'

type TeamTestResponse = SurveyResponse & {
  respondents: Respondent
}

function makeResponse(
  department: string | null,
  riskScore: number,
  orgScores: Record<string, number>,
): TeamTestResponse {
  return {
    id: `response-${department ?? 'none'}-${riskScore}`,
    respondent_id: `respondent-${department ?? 'none'}-${riskScore}`,
    risk_score: riskScore,
    risk_band: riskScore >= 7 ? 'HOOG' : riskScore >= 4.5 ? 'MIDDEN' : 'LAAG',
    preventability: null,
    stay_intent_score: null,
    uwes_score: null,
    turnover_intention_score: null,
    exit_reason_code: null,
    sdt_scores: {},
    org_scores: orgScores,
    open_text_raw: null,
    open_text_analysis: null,
    full_result: {},
    submitted_at: '2026-04-17T10:00:00Z',
    respondents: {
      id: `respondent-${department ?? 'none'}-${riskScore}`,
      campaign_id: 'campaign-1',
      token: `token-${department ?? 'none'}-${riskScore}`,
      email: null,
      department,
      role_level: 'specialist',
      exit_month: null,
      annual_salary_eur: null,
      sent_at: '2026-04-16T10:00:00Z',
      opened_at: null,
      completed: true,
      completed_at: null,
    },
  }
}

describe('buildTeamDashboardViewModel', () => {
  it('builds a bounded team management handoff once enough data is available', () => {
    const model = buildTeamDashboardViewModel({
      signalLabelLower: 'teamsignaal',
      averageSignal: 6.8,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 4.7,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        workload: 3.3,
        culture: 4.1,
        leadership: 4.8,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards.map((card) => card.title)).toEqual([
      'Managementread nu',
      'Eerste beslisroute',
      'Primair lokaal spoor',
      'Eerste eigenaar',
      'Reviewgrens',
      'Meetmodel',
      'Boundary',
    ])
    expect(model.topSummaryCards[1]?.value).toBe('Eerst verifieren, dan begrenzen')
    expect(model.topSummaryCards[2]?.value).toBe('Werkbelasting')
    expect(model.nextStep.title).toBe('Leg eigenaar, check en review vast')
    expect(model.profileCards[0]?.value).toBe('Lokalisatielaag')
    expect(model.profileCards[1]?.value).toBe('Werkbeleving + factoren + richting')
    expect(model.profileCards[2]?.value).toBe('Lokaliseren -> verifieren -> begrenzen')
    expect(model.topSummaryCards[3]?.body.toLowerCase()).toContain('managementhuddle')
    expect(model.managementBlocks[0]?.items[2]?.toLowerCase()).toContain('eigenaar')
    expect(model.managementBlocks[1]?.title).toBe('Wie beslist wat nu eerst gebeurt?')
    expect(model.managementBlocks[2]?.title).toBe('Wanneer escaleren, wanneer stoppen?')
    expect(model.followThroughCards[4]?.title).toBe('Reviewmoment')
    expect(model.followThroughCards[5]?.title).toBe('Escalatiegrens')
  })
})

describe('buildTeamLocalReadState', () => {
  it('returns safe local groups when department groups meet the minimum n', () => {
    const responses = [
      makeResponse('Operations', 7.2, { workload: 3.0, leadership: 4.0 }),
      makeResponse('Operations', 7.0, { workload: 3.1, leadership: 4.1 }),
      makeResponse('Operations', 6.9, { workload: 3.2, leadership: 4.2 }),
      makeResponse('Operations', 7.4, { workload: 2.8, leadership: 4.3 }),
      makeResponse('Operations', 7.1, { workload: 3.0, leadership: 4.0 }),
      makeResponse('People', 5.1, { culture: 4.4, role_clarity: 4.8 }),
      makeResponse('People', 5.0, { culture: 4.5, role_clarity: 4.9 }),
      makeResponse('People', 5.2, { culture: 4.6, role_clarity: 5.0 }),
      makeResponse('People', 5.3, { culture: 4.4, role_clarity: 4.7 }),
      makeResponse('People', 5.1, { culture: 4.5, role_clarity: 4.8 }),
    ]

    const state = buildTeamLocalReadState(responses)

    expect(state.status).toBe('ready')
    expect(state.safeGroupCount).toBe(2)
    expect(state.groups[0]?.label).toBe('Operations')
    expect(state.groups[0]?.topFactorLabel).toBe('Werkbelasting')
  })

  it('falls back when department metadata is insufficient', () => {
    const responses: TeamTestResponse[] = Array.from({ length: 6 }, (_, index) =>
      makeResponse(index < 4 ? 'Operations' : null, 5.5 + index * 0.1, { leadership: 4.2 }),
    )

    const state = buildTeamLocalReadState(responses)

    expect(state.status).toBe('needs_metadata')
    expect(state.safeGroupCount).toBe(0)
    expect(state.summaryBody).toContain('te weinig responses bevatten een bruikbare afdeling')
expect(state.caution.toLowerCase()).toContain('bredere duiding')
  })

  it('keeps small groups suppressed until a safe local read exists', () => {
    const responses: TeamTestResponse[] = [
      ...Array.from({ length: 4 }, (_, index) =>
        makeResponse('Operations', 5.8 + index * 0.1, { leadership: 4.1 }),
      ),
      ...Array.from({ length: 2 }, (_, index) =>
        makeResponse('People', 5.2 + index * 0.1, { culture: 4.4 }),
      ),
    ]

    const state = buildTeamLocalReadState(responses)

    expect(state.status).toBe('needs_safe_groups')
    expect(state.suppressedGroupCount).toBe(2)
    expect(state.caution.toLowerCase()).toContain('onderdrukt')
expect(state.caution.toLowerCase()).toContain('bredere duiding')
  })

  it('surfaces suppressed groups even when a safe local read is available', () => {
    const responses: TeamTestResponse[] = [
      ...Array.from({ length: 5 }, (_, index) =>
        makeResponse('Operations', 7.0 + index * 0.1, { workload: 3.0, leadership: 4.0 }),
      ),
      ...Array.from({ length: 5 }, (_, index) =>
        makeResponse('People', 5.1 + index * 0.1, { culture: 4.4, role_clarity: 4.8 }),
      ),
      ...Array.from({ length: 3 }, (_, index) =>
        makeResponse('Support', 4.9 + index * 0.1, { leadership: 4.9, culture: 5.0 }),
      ),
    ]

    const state = buildTeamLocalReadState(responses)

    expect(state.status).toBe('ready')
    expect(state.suppressedGroupCount).toBe(1)
    expect(state.summaryBody.toLowerCase()).toContain('onderdrukt')
expect(state.caution.toLowerCase()).toContain('bredere duiding')
  })
})

describe('buildTeamPriorityReadState', () => {
  it('marks a clear outlier as first verification priority', () => {
    const localRead = buildTeamLocalReadState([
      makeResponse('Operations', 7.4, { workload: 2.8, leadership: 4.1 }),
      makeResponse('Operations', 7.2, { workload: 3.0, leadership: 4.2 }),
      makeResponse('Operations', 7.1, { workload: 3.1, leadership: 4.0 }),
      makeResponse('Operations', 7.3, { workload: 2.9, leadership: 4.1 }),
      makeResponse('Operations', 7.0, { workload: 3.2, leadership: 4.0 }),
      makeResponse('People', 5.1, { culture: 4.5, role_clarity: 4.8 }),
      makeResponse('People', 5.2, { culture: 4.6, role_clarity: 4.7 }),
      makeResponse('People', 5.0, { culture: 4.4, role_clarity: 4.8 }),
      makeResponse('People', 5.1, { culture: 4.5, role_clarity: 4.9 }),
      makeResponse('People', 5.2, { culture: 4.6, role_clarity: 4.8 }),
      makeResponse('Support', 4.9, { leadership: 4.9, culture: 5.0 }),
      makeResponse('Support', 5.0, { leadership: 4.8, culture: 4.9 }),
      makeResponse('Support', 4.8, { leadership: 5.0, culture: 4.8 }),
      makeResponse('Support', 4.9, { leadership: 4.9, culture: 4.9 }),
      makeResponse('Support', 5.0, { leadership: 4.8, culture: 5.0 }),
    ])

    const priority = buildTeamPriorityReadState(localRead)

    expect(priority.status).toBe('ready')
    if (priority.status !== 'ready') throw new Error('expected ready priority state')
    expect(priority.firstPriorityLabel).toBe('Operations')
    expect(priority.groups[0]?.priorityState).toBe('first_verify')
    expect(priority.groups[1]?.priorityState).toBe('watch_next')
  })

  it('falls back to no hard order when safe groups are too close together', () => {
    const localRead = buildTeamLocalReadState([
      makeResponse('Operations', 5.7, { workload: 4.1, leadership: 4.6 }),
      makeResponse('Operations', 5.8, { workload: 4.2, leadership: 4.7 }),
      makeResponse('Operations', 5.9, { workload: 4.0, leadership: 4.6 }),
      makeResponse('Operations', 5.8, { workload: 4.1, leadership: 4.5 }),
      makeResponse('Operations', 5.7, { workload: 4.2, leadership: 4.6 }),
      makeResponse('People', 5.5, { culture: 4.4, role_clarity: 4.7 }),
      makeResponse('People', 5.6, { culture: 4.5, role_clarity: 4.6 }),
      makeResponse('People', 5.5, { culture: 4.4, role_clarity: 4.7 }),
      makeResponse('People', 5.6, { culture: 4.5, role_clarity: 4.6 }),
      makeResponse('People', 5.5, { culture: 4.4, role_clarity: 4.7 }),
    ])

    const priority = buildTeamPriorityReadState(localRead)

    expect(priority.status).toBe('no_hard_order')
    if (priority.status !== 'no_hard_order') throw new Error('expected no_hard_order priority state')
    expect(priority.firstPriorityLabel).toBeNull()
    expect(priority.groups.every((group) => group.priorityState === 'no_hard_order')).toBe(true)
  })

  it('stays unavailable when the local read itself is still in fallback', () => {
    const localRead = buildTeamLocalReadState([
      makeResponse(null, 5.5, { leadership: 4.2 }),
      makeResponse(null, 5.6, { leadership: 4.1 }),
      makeResponse('Operations', 5.7, { leadership: 4.0 }),
      makeResponse(null, 5.4, { leadership: 4.3 }),
      makeResponse('People', 5.5, { leadership: 4.2 }),
      makeResponse(null, 5.6, { leadership: 4.1 }),
    ])

    const priority = buildTeamPriorityReadState(localRead)

    expect(priority.status).toBe('not_available')
    expect(priority.groups).toHaveLength(0)
expect(priority.caution.toLowerCase()).toContain('bredere duiding')
  })
})
