import { describe, expect, it } from 'vitest'
import { estimateHeadcount } from '@/lib/lead-headcount'

describe('estimateHeadcount', () => {
  it('leest de nieuwe vakken, ook met een duizendtalpunt', () => {
    expect(estimateHeadcount('Minder dan 150 medewerkers')).toBe(150)
    expect(estimateHeadcount('150 tot 400 medewerkers')).toBe(150)
    expect(estimateHeadcount('400 tot 1.000 medewerkers')).toBe(400)
    expect(estimateHeadcount('Boven 1.000 medewerkers')).toBe(1000)
  })

  it('geeft voor oude leads hetzelfde als voorheen', () => {
    expect(estimateHeadcount('100 - 200 medewerkers')).toBe(100)
    expect(estimateHeadcount('700 - 1.000 medewerkers')).toBe(700)
    expect(estimateHeadcount('50-100')).toBe(50)
    expect(estimateHeadcount('1500')).toBe(1500)
  })

  it('geeft 0 zonder getal', () => {
    expect(estimateHeadcount('Anders / nog niet zeker')).toBe(0)
    expect(estimateHeadcount(null)).toBe(0)
    expect(estimateHeadcount(undefined)).toBe(0)
  })
})
