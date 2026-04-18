import { describe, expect, it } from 'vitest'
import {
  buildDriverDrilldownModel,
  computeAverageRiskScore,
  computeRetentionSupplementalAverages,
} from './page-helpers'

describe('dashboard page helpers field semantics', () => {
  it('reads the signal alias before falling back to risk_score', () => {
    const responses = [
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        signal_score: 6.4,
        risk_score: 5.2,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:00:00Z',
      },
      {
        id: 'resp-2',
        respondent_id: 'r-2',
        signal_score: 5.4,
        risk_score: 5.0,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:05:00Z',
      },
    ]

    expect(computeAverageRiskScore(responses)).toBe(5.9)
  })

  it('reads the direction signal alias before falling back to stay_intent_score', () => {
    const responses = [
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        risk_score: 5.2,
        direction_signal_score: 2,
        stay_intent_score: 4,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:00:00Z',
      },
      {
        id: 'resp-2',
        respondent_id: 'r-2',
        risk_score: 5.0,
        direction_signal_score: 4,
        stay_intent_score: 2,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:05:00Z',
      },
    ]

    expect(computeRetentionSupplementalAverages(responses).stayIntent).toBe(5.5)
  })
})

describe('driver drilldown model', () => {
  it('defaults to the strongest factor and highlights the top two drivers', () => {
    const model = buildDriverDrilldownModel({
      factorAverages: {
        workload: 3.4,
        leadership: 3.9,
        culture: 5.2,
      },
      selectedFactorKey: null,
    })

    expect(model.selectedFactorKey).toBe('workload')
    expect(model.highlightedFactors.map((factor) => factor.factorKey)).toEqual(['workload', 'leadership'])
    expect(model.availableFactors[0]?.factorKey).toBe('workload')
  })

  it('falls back to the strongest factor when the requested driver is unavailable', () => {
    const model = buildDriverDrilldownModel({
      factorAverages: {
        growth: 4.1,
        culture: 4.4,
      },
      selectedFactorKey: 'workload',
    })

    expect(model.selectedFactorKey).toBe('growth')
    expect(model.selectedFactor?.factorKey).toBe('growth')
  })
})
