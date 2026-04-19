import { describe, expect, it } from 'vitest'
import { buildMtoDepartmentReadModel, MTO_DEPARTMENT_MIN_VISIBLE_RESPONSES } from '@/lib/products/mto/department-intelligence'
import type { Respondent, SurveyResponse } from '@/lib/types'

type DepartmentResponse = SurveyResponse & { respondents: Respondent }

function createDepartmentResponses(args: {
  department: string
  count: number
  riskScore: number
  stayIntent: number
  factorOverrides?: Partial<Record<'leadership' | 'culture' | 'growth' | 'compensation' | 'workload' | 'role_clarity', number>>
}): DepartmentResponse[] {
  return Array.from({ length: args.count }, (_, index) => ({
    id: `${args.department}-${index}`,
    respondent_id: `${args.department}-respondent-${index}`,
    risk_score: args.riskScore,
    risk_band: args.riskScore >= 7 ? 'HOOG' : args.riskScore >= 4.5 ? 'MIDDEN' : 'LAAG',
    preventability: 'GEMENGD_WERKSIGNAAL',
    exit_reason_code: null,
    sdt_scores: {},
    org_scores: {
      leadership: 5.6,
      culture: 5.7,
      growth: 5.8,
      compensation: 5.4,
      workload: 6.2,
      role_clarity: 5.5,
      ...args.factorOverrides,
    },
    stay_intent_score: args.stayIntent,
    uwes_score: null,
    turnover_intention_score: null,
    open_text_raw: `${args.department} heeft nu vooral ${args.department === 'Operations' ? 'werkdruk' : 'duidelijkheid'} nodig.`,
    open_text_analysis: null,
    full_result: {},
    submitted_at: '2026-04-19T10:00:00.000Z',
    respondents: {
      id: `${args.department}-respondent-${index}`,
      campaign_id: 'campaign-1',
      token: `token-${args.department}-${index}`,
      department: args.department,
      role_level: 'manager',
      exit_month: null,
      annual_salary_eur: null,
      sent_at: null,
      opened_at: null,
      completed: true,
      completed_at: '2026-04-19T10:00:00.000Z',
    },
  }))
}

describe('buildMtoDepartmentReadModel', () => {
  it('suppresses departments below the conservative visibility threshold', () => {
    const model = buildMtoDepartmentReadModel({
      responses: [
        ...createDepartmentResponses({
          department: 'Operations',
          count: MTO_DEPARTMENT_MIN_VISIBLE_RESPONSES,
          riskScore: 7.4,
          stayIntent: 4.8,
          factorOverrides: { workload: 3.9, leadership: 4.8 },
        }),
        ...createDepartmentResponses({
          department: 'HR',
          count: MTO_DEPARTMENT_MIN_VISIBLE_RESPONSES - 1,
          riskScore: 6.4,
          stayIntent: 5.7,
          factorOverrides: { role_clarity: 4.1 },
        }),
      ],
      orgAverageSignal: 6.9,
    })

    expect(model.totalDepartments).toBe(2)
    expect(model.suppressedDepartments).toBe(1)
    expect(model.visibleDepartments).toHaveLength(1)
    expect(model.visibleDepartments[0]?.segmentLabel).toBe('Operations')
    expect(model.visibilityNote).toContain(String(MTO_DEPARTMENT_MIN_VISIBLE_RESPONSES))
  })

  it('builds a bounded department handoff with top factor, delta and first action route', () => {
    const model = buildMtoDepartmentReadModel({
      responses: createDepartmentResponses({
        department: 'Operations',
        count: MTO_DEPARTMENT_MIN_VISIBLE_RESPONSES + 1,
        riskScore: 7.6,
        stayIntent: 4.5,
        factorOverrides: { workload: 3.6, role_clarity: 4.4, leadership: 5.1 },
      }),
      orgAverageSignal: 6.1,
    })

    expect(model.totalDepartments).toBe(1)
    expect(model.suppressedDepartments).toBe(0)
    expect(model.topPriorityDepartmentLabel).toBe('Operations')
    expect(model.visibleDepartments[0]?.factorLabel).toBe('Werkbelasting')
    expect(model.visibleDepartments[0]?.deltaVsOrg).toBeGreaterThan(1)
    expect(model.visibleDepartments[0]?.owner).toContain('afdeling')
    expect(model.visibleDepartments[0]?.actions[0]).toContain('managementhuddle')
    expect(model.visibleDepartments[0]?.handoffBody).toContain('actiebehoefte')
    expect(model.visibleDepartments[0]?.stayIntentAverage).toBeCloseTo(4.5, 1)
  })
})
