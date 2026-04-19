import { MTO_ACTION_PLAYBOOKS } from '@/lib/products/mto/action-playbooks'
import type { SegmentPlaybookEntry } from '@/lib/products/shared/types'
import { FACTOR_LABELS, type Respondent, type SurveyResponse } from '@/lib/types'

export const MTO_DEPARTMENT_MIN_VISIBLE_RESPONSES = 8

const MTO_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity'] as const

export interface MtoDepartmentReadItem extends Omit<SegmentPlaybookEntry, 'segmentType'> {
  segmentType: 'department'
  stayIntentAverage: number | null
  handoffBody: string
}

export interface MtoDepartmentReadModel {
  totalDepartments: number
  suppressedDepartments: number
  topPriorityDepartmentLabel: string | null
  visibilityNote: string
  visibleDepartments: MtoDepartmentReadItem[]
}

type DepartmentResponse = SurveyResponse & { respondents: Respondent }

function computeAverage(values: Array<number | null | undefined>) {
  const resolved = values.filter((value): value is number => typeof value === 'number')
  if (resolved.length === 0) return null
  return resolved.reduce((sum, value) => sum + value, 0) / resolved.length
}

function computeFactorAverages(responses: DepartmentResponse[]) {
  const averages: Record<string, number> = {}

  for (const factor of MTO_FACTORS) {
    const values = responses
      .map((response) => response.org_scores?.[factor])
      .filter((value): value is number => typeof value === 'number')

    if (values.length > 0) {
      averages[factor] = values.reduce((sum, value) => sum + value, 0) / values.length
    }
  }

  return averages
}

function computeAverageRiskScore(responses: DepartmentResponse[]) {
  return computeAverage(responses.map((response) => response.risk_score))
}

function computeStayIntentAverage(responses: DepartmentResponse[]) {
  return computeAverage(responses.map((response) => response.stay_intent_score))
}

function getManagementBand(signalValue: number) {
  if (signalValue >= 7) return 'HOOG' as const
  if (signalValue >= 4.5) return 'MIDDEN' as const
  return 'LAAG' as const
}

export function buildMtoDepartmentReadModel(args: {
  responses: DepartmentResponse[]
  orgAverageSignal: number | null
  minVisibleResponses?: number
}): MtoDepartmentReadModel {
  const minVisibleResponses = args.minVisibleResponses ?? MTO_DEPARTMENT_MIN_VISIBLE_RESPONSES
  const grouped = new Map<string, DepartmentResponse[]>()

  for (const response of args.responses) {
    const department = response.respondents.department?.trim()
    if (!department) continue
    const group = grouped.get(department) ?? []
    group.push(response)
    grouped.set(department, group)
  }

  const visibleDepartments = Array.from(grouped.entries())
    .filter(([, responses]) => responses.length >= minVisibleResponses)
    .map<MtoDepartmentReadItem | null>(([department, responses]) => {
      const factorAverages = computeFactorAverages(responses)
      const topFactor = Object.entries(factorAverages)
        .map(([factor, score]) => ({
          factor,
          factorLabel: FACTOR_LABELS[factor] ?? factor,
          score,
          signalValue: 11 - score,
        }))
        .sort((left, right) => right.signalValue - left.signalValue)[0]

      const avgSignal = computeAverageRiskScore(responses)
      if (!topFactor || avgSignal === null) return null

      const band = getManagementBand(topFactor.signalValue)
      const playbook = MTO_ACTION_PLAYBOOKS[topFactor.factor]?.[band]
      if (!playbook) return null

      const deltaVsOrg =
        typeof args.orgAverageSignal === 'number' ? Number((avgSignal - args.orgAverageSignal).toFixed(1)) : 0
      const stayIntentAverage = computeStayIntentAverage(responses)

      return {
        segmentType: 'department',
        segmentLabel: department,
        factorKey: topFactor.factor,
        factorLabel: topFactor.factorLabel,
        n: responses.length,
        avgSignal: Number(avgSignal.toFixed(1)),
        deltaVsOrg,
        signalValue: Number(topFactor.signalValue.toFixed(1)),
        title: playbook.title,
        decision: playbook.decision,
        validate: playbook.validate,
        owner: 'HR lead + afdelingseigenaar',
        actions: playbook.actions,
        caution: playbook.caution,
        review: playbook.review,
        handoffBody:
          `Gebruik ${department} als bounded afdelingstraject: bevestig eerst de actiebehoefte, wijs een eigenaar toe en houd het vervolg nog binnen MTO zonder andere productroutes te openen.`,
        stayIntentAverage: stayIntentAverage === null ? null : Number(stayIntentAverage.toFixed(1)),
      } satisfies MtoDepartmentReadItem
    })
    .filter((item): item is MtoDepartmentReadItem => item !== null)
    .sort((left, right) => (right.deltaVsOrg - left.deltaVsOrg) || (right.avgSignal - left.avgSignal))

  return {
    totalDepartments: grouped.size,
    suppressedDepartments: Math.max(grouped.size - visibleDepartments.length, 0),
    topPriorityDepartmentLabel: visibleDepartments[0]?.segmentLabel ?? null,
    visibilityNote:
      `Afdelingsread opent alleen vanaf ${minVisibleResponses} responses per afdeling en blijft onder die grens bewust onderdrukt.`,
    visibleDepartments,
  }
}
