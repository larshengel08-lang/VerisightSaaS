import { describe, expect, it } from 'vitest'
import {
  getCampaignAverageSignalScore,
  getResponseDirectionSignalScore,
  getResponseSignalScore,
} from '@/lib/types'

describe('field semantics aliases', () => {
  it('prefers the explicit average signal alias but falls back to avg_risk_score', () => {
    expect(
      getCampaignAverageSignalScore({
        avg_signal_score: 6.4,
        avg_risk_score: 6.1,
      }),
    ).toBe(6.4)

    expect(
      getCampaignAverageSignalScore({
        avg_signal_score: null,
        avg_risk_score: 6.1,
      }),
    ).toBe(6.1)
  })

  it('prefers explicit response aliases but keeps backwards-compatible fallbacks', () => {
    expect(
      getResponseSignalScore({
        signal_score: 5.8,
        risk_score: 5.4,
      }),
    ).toBe(5.8)

    expect(
      getResponseSignalScore({
        signal_score: null,
        risk_score: 5.4,
      }),
    ).toBe(5.4)

    expect(
      getResponseDirectionSignalScore({
        direction_signal_score: 2,
        stay_intent_score: 4,
      }),
    ).toBe(2)

    expect(
      getResponseDirectionSignalScore({
        direction_signal_score: null,
        stay_intent_score: 4,
      }),
    ).toBe(4)
  })
})
