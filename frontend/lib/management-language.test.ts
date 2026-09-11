import { describe, expect, it } from 'vitest'
import {
  getDisplaySignalBand,
  getRiskBandFromScore,
  HEALTH_BAND_STRONG_FROM,
  HEALTH_BAND_VULNERABLE_BELOW,
} from '@/lib/management-language'

describe('getDisplaySignalBand (B4: kleurband op de weergaveschaal)', () => {
  it('uses the report ladder (5,0 / 6,5) for health-scale scans: high is good', () => {
    expect(getDisplaySignalBand('retention', 6.5)).toBe('emerald')
    expect(getDisplaySignalBand('retention', 6.4)).toBe('amber')
    expect(getDisplaySignalBand('retention', 5.0)).toBe('amber')
    expect(getDisplaySignalBand('retention', 4.9)).toBe('red')
    expect(getDisplaySignalBand('onboarding', 8.0)).toBe('emerald')
    expect(getDisplaySignalBand('onboarding', 4.45)).toBe('red')
  })

  it('reuses getRiskBandFromScore (7 / 4,5) for risk-scale scans: high is bad', () => {
    expect(getDisplaySignalBand('exit', 7.0)).toBe('red')
    expect(getDisplaySignalBand('exit', 4.5)).toBe('amber')
    expect(getDisplaySignalBand('exit', 4.4)).toBe('emerald')
    expect(getDisplaySignalBand('culture_assessment', 7.2)).toBe('red')
  })

  it('keeps the risk branch in lockstep with getRiskBandFromScore for every band', () => {
    const mapping = { HOOG: 'red', MIDDEN: 'amber', LAAG: 'emerald' } as const
    for (const score of [1, 4.4, 4.5, 6.9, 7, 10]) {
      expect(getDisplaySignalBand('exit', score)).toBe(mapping[getRiskBandFromScore(score)])
    }
  })

  it('pins the health-band constants to the PDF report ladder', () => {
    expect(HEALTH_BAND_VULNERABLE_BELOW).toBe(5.0)
    expect(HEALTH_BAND_STRONG_FROM).toBe(6.5)
  })
})
