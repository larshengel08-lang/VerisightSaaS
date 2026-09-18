import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./request-new-measurement.tsx', import.meta.url), 'utf8')

describe('blok "nieuwe meting aanvragen" (spec 2026-09-16 par. 6.3)', () => {
  it('is een servercomponent met de spec-tekst, de prijs en de mailto', () => {
    expect(src).not.toContain("'use client'")
    expect(src).toContain('Klaar voor een vervolgmeting?')
    expect(src).toContain('NEW_MEASUREMENT_PRICE_LABEL')
    expect(src).toContain('buildNewMeasurementMailto(organizationName)')
    expect(src).toContain('Nieuwe meting aanvragen')
  })

  it('spreekt met Loep als onderwerp, niet als "wij"', () => {
    expect(src).toContain('dan zet Loep hem voor je klaar')
    expect(src).not.toMatch(/\b[Ww]ij\b|\b[Ww]e zetten\b/)
  })

  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
