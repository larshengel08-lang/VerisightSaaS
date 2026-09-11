import { describe, expect, it } from 'vitest'
import {
  getCampaignAverageSignalScore,
  getResponseDirectionSignalScore,
  getResponseSignalScore,
  isHealthScaleSignal,
  toDisplaySignalScore,
} from '@/lib/types'

describe('toDisplaySignalScore (B4: gezondheidsschaal in de app)', () => {
  it('flips retention and onboarding to the health scale (11 - risk), rounded to 2 decimals', () => {
    expect(toDisplaySignalScore('retention', 3.0)).toBe(8.0)
    expect(toDisplaySignalScore('onboarding', 6.55)).toBe(4.45)
    expect(toDisplaySignalScore('retention', 4.333333)).toBe(6.67)
  })

  it('leaves every other scan type on the stored scale', () => {
    expect(toDisplaySignalScore('exit', 7.2)).toBe(7.2)
    expect(toDisplaySignalScore('pulse', 5.9)).toBe(5.9)
    expect(toDisplaySignalScore('team', 5.9)).toBe(5.9)
    expect(toDisplaySignalScore('leadership', 5.9)).toBe(5.9)
    expect(toDisplaySignalScore('culture_assessment', 6.8)).toBe(6.8)
  })

  it('passes null through unchanged', () => {
    expect(toDisplaySignalScore('retention', null)).toBeNull()
    expect(toDisplaySignalScore('exit', null)).toBeNull()
  })

  it('exposes the health-scale predicate for colour logic', () => {
    expect(isHealthScaleSignal('retention')).toBe(true)
    expect(isHealthScaleSignal('onboarding')).toBe(true)
    expect(isHealthScaleSignal('exit')).toBe(false)
    expect(isHealthScaleSignal('culture_assessment')).toBe(false)
  })
})

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
