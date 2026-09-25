import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONTACT_SIZE_OPTIONS } from '@/lib/contact-funnel'
import { PRICING_ABOVE_LABEL, PRICING_TIERS } from '@/lib/pricing'

describe('omvangvakken van het contactformulier (besluit Lars 24-9)', () => {
  it('zijn precies de prijstreden, boven 1.000 en twijfel', () => {
    expect(CONTACT_SIZE_OPTIONS).toEqual([
      'Minder dan 150 medewerkers',
      '150 tot 400 medewerkers',
      '400 tot 1.000 medewerkers',
      'Boven 1.000 medewerkers',
      'Anders / nog niet zeker',
    ])
  })

  it('komen uit dezelfde bron als de staffel', () => {
    expect(CONTACT_SIZE_OPTIONS.slice(0, 3)).toEqual(PRICING_TIERS.map((tier) => tier.label))
    expect(CONTACT_SIZE_OPTIONS[3]).toBe(PRICING_ABOVE_LABEL)
  })

  it('passen in de opslag: 2 tot 80 tekens (API-route en backend)', () => {
    for (const waarde of CONTACT_SIZE_OPTIONS) {
      expect(waarde.length).toBeGreaterThanOrEqual(2)
      expect(waarde.length).toBeLessThanOrEqual(80)
    }
  })

  it('het formulier rendert de vakken uit die bron en niet meer de oude ranges', () => {
    const source = readFileSync(path.join(process.cwd(), 'components/marketing/contact-form.tsx'), 'utf8')
    expect(source).toContain('CONTACT_SIZE_OPTIONS.map')
    for (const oud of ['100 - 200', '200 - 400', '400 - 700', '700 - 1.000']) {
      expect(source).not.toContain(oud)
    }
  })

  it('bevatten geen em-dash of en-dash', () => {
    const streepje = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`)
    for (const waarde of CONTACT_SIZE_OPTIONS) {
      expect(waarde).not.toMatch(streepje)
    }
  })
})
