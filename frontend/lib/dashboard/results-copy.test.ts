import { describe, expect, it } from 'vitest'
import { getResultsProductCopy, RESULTS_FORBIDDEN_INTERNAL_TERMS } from './results-copy'

describe('results dashboard copy map', () => {
  it('keeps forbidden internal terms out of all product copy snippets', () => {
    const scanTypes = [
      'exit',
      'retention',
      'pulse',
      'team',
      'onboarding',
      'leadership',
    ] as const

    for (const scanType of scanTypes) {
      const copy = Object.values(getResultsProductCopy(scanType)).join(' ').toLowerCase()
      for (const term of RESULTS_FORBIDDEN_INTERNAL_TERMS) {
        expect(copy).not.toContain(term)
      }
    }
  })

  it('uses plain customer language per product family', () => {
    expect(getResultsProductCopy('exit').readLabel).toBe('terugblik op vertrekredenen')
    expect(getResultsProductCopy('retention').readLabel).toBe('behoudsbeeld')
    expect(getResultsProductCopy('pulse').readLabel).toBe('korte momentopname')
    expect(getResultsProductCopy('team').readLabel).toBe('lokale teamduiding')
    expect(getResultsProductCopy('onboarding').readLabel).toBe('eerste indruk van de startfase')
    expect(getResultsProductCopy('leadership').readLabel).toBe('beeld van ervaren leiding en richting')
  })
})
