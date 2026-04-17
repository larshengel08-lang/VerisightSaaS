import { describe, expect, it } from 'vitest'
import type { SurveyResponse } from '@/lib/types'
import {
  buildPulseComparisonState,
  buildPulseTrendCards,
  computePulseSignalAverages,
  getDisclosureDefaults,
} from '@/app/(dashboard)/campaigns/[id]/page-helpers'

function makeResponse(overrides: Partial<SurveyResponse> = {}): SurveyResponse {
  return {
    id: 'response-1',
    respondent_id: 'respondent-1',
    risk_score: 6,
    risk_band: 'MIDDEN',
    preventability: 'STERK_WERKSIGNAAL',
    exit_reason_code: null,
    sdt_scores: {},
    org_scores: {
      leadership: 6,
      workload: 4,
    },
    stay_intent_score: 4,
    uwes_score: 4.5,
    turnover_intention_score: 2.5,
    open_text_raw: null,
    open_text_analysis: null,
    full_result: {},
    submitted_at: '2026-04-17T10:00:00.000Z',
    ...overrides,
  }
}

describe('getDisclosureDefaults', () => {
  it('keeps analysis closed and focus open once enough data is available', () => {
    const defaults = getDisclosureDefaults({
      scanType: 'exit',
      hasEnoughData: true,
      hasMinDisplay: true,
      respondentsLength: 12,
      canManageCampaign: true,
    })

    expect(defaults.analysisOpen).toBe(false)
    expect(defaults.focusOpen).toBe(true)
    expect(defaults.respondentsOpen).toBe(false)
    expect(defaults.methodologyOpen).toBe(true)
  })

  it('opens operational context while a campaign is still building', () => {
    const defaults = getDisclosureDefaults({
      scanType: 'retention',
      hasEnoughData: false,
      hasMinDisplay: false,
      respondentsLength: 4,
      canManageCampaign: true,
    })

    expect(defaults.focusOpen).toBe(false)
    expect(defaults.respondentsOpen).toBe(true)
    expect(defaults.methodologyOpen).toBe(true)
  })

  it('keeps methodology open for pulse snapshots even after enough data', () => {
    const defaults = getDisclosureDefaults({
      scanType: 'pulse',
      hasEnoughData: true,
      hasMinDisplay: true,
      respondentsLength: 15,
      canManageCampaign: false,
    })

    expect(defaults.focusOpen).toBe(true)
    expect(defaults.methodologyOpen).toBe(true)
  })
})

describe('computePulseSignalAverages', () => {
  it('derives pulse signal, stay intent, and factor averages from responses', () => {
    const averages = computePulseSignalAverages([
      makeResponse({
        risk_score: 6,
        org_scores: { leadership: 6, workload: 4 },
        stay_intent_score: 5,
      }),
      makeResponse({
        id: 'response-2',
        respondent_id: 'respondent-2',
        risk_score: 8,
        org_scores: { leadership: 8, workload: 6, culture: 7 },
        stay_intent_score: 1,
      }),
    ])

    expect(averages.pulseSignal).toBe(7)
    expect(averages.stayIntent).toBe(5.5)
    expect(averages.factorAverages).toEqual({
      leadership: 7,
      culture: 7,
      workload: 5,
    })
  })
})

describe('buildPulseTrendCards', () => {
  it('compares only shared factors and sorts by largest delta', () => {
    const result = buildPulseTrendCards({
      current: {
        pulseSignal: 4.2,
        stayIntent: 7.3,
        factorAverages: {
          leadership: 4,
          culture: 8,
          workload: 7,
        },
      },
      previous: {
        pulseSignal: 5.1,
        stayIntent: 6.0,
        factorAverages: {
          leadership: 7,
          workload: 5,
          growth: 6,
        },
      },
    })

    expect(result.sharedFactorCount).toBe(2)
    expect(result.cards.map((card) => card.key)).toEqual([
      'pulse_stay_intent',
      'pulse_factor_leadership',
      'pulse_factor_workload',
    ])
    expect(result.cards[1]).toMatchObject({
      direction: 'worsened',
      currentValue: 7,
      previousValue: 4,
      delta: 3,
    })
    expect(result.cards[2]).toMatchObject({
      direction: 'improved',
      currentValue: 4,
      previousValue: 6,
      delta: -2,
    })
  })
})

describe('buildPulseComparisonState', () => {
  it('returns no_previous when there is no earlier pulse cycle', () => {
    const comparison = buildPulseComparisonState({
      current: {
        pulseSignal: 5,
        stayIntent: 6,
        factorAverages: { leadership: 6 },
      },
      previous: null,
      currentResponsesLength: 12,
      previousResponsesLength: 0,
    })

    expect(comparison).toEqual({ status: 'no_previous' })
  })

  it('holds the comparison at the boundary when either cycle has too little data', () => {
    const comparison = buildPulseComparisonState({
      current: {
        pulseSignal: 5,
        stayIntent: 6,
        factorAverages: { leadership: 6 },
      },
      previous: {
        pulseSignal: 5.8,
        stayIntent: 5.4,
        factorAverages: { leadership: 7 },
      },
      currentResponsesLength: 9,
      previousResponsesLength: 12,
    })

    expect(comparison.status).toBe('insufficient_data')
    if (comparison.status !== 'insufficient_data') {
      throw new Error('Expected insufficient_data state')
    }
    expect(comparison.currentResponsesLength).toBe(9)
    expect(comparison.previousResponsesLength).toBe(12)
  })

  it('builds a ready comparison with bounded direction and overlap metadata', () => {
    const comparison = buildPulseComparisonState({
      current: {
        pulseSignal: 4.3,
        stayIntent: 7.2,
        factorAverages: {
          leadership: 4,
          culture: 7,
        },
      },
      previous: {
        pulseSignal: 5.0,
        stayIntent: 6.0,
        factorAverages: {
          leadership: 6,
          workload: 5,
        },
      },
      currentResponsesLength: 14,
      previousResponsesLength: 12,
    })

    expect(comparison.status).toBe('ready')
    if (comparison.status !== 'ready') {
      throw new Error('Expected ready state')
    }
    expect(comparison.direction).toBe('improved')
    expect(comparison.signalDelta).toBe(-0.7)
    expect(comparison.stayIntentDelta).toBe(1.2)
    expect(comparison.sharedFactorCount).toBe(1)
    expect(comparison.trendCards.map((card) => card.key)).toEqual([
      'pulse_stay_intent',
      'pulse_factor_leadership',
    ])
  })
})
