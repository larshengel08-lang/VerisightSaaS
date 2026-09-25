import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONTACT_SIZE_BOUNDARY_HINT, CONTACT_SIZE_OPTIONS } from '@/lib/contact-funnel'
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

  // "150 tot 400" en "400 tot 1.000" delen de 400 (en eerder de 150): zonder
  // regel valt een organisatie van precies die omvang in twee vakken. De hint
  // noemt elke ondergrens die ook bovengrens van het vorige vak is, en wordt
  // bij het veld getoond.
  it('een grensgetal hoort bij precies één vak, en het formulier zegt welk', () => {
    const grenzen = PRICING_TIERS.slice(1).map((tier) => tier.label.match(/\d{1,3}(?:\.\d{3})+|\d+/)?.[0])
    expect(grenzen).toEqual(['150', '400'])
    for (const grens of grenzen) {
      expect(CONTACT_SIZE_BOUNDARY_HINT).toContain(String(grens))
    }
    expect(CONTACT_SIZE_BOUNDARY_HINT).not.toMatch(new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`))
    const source = readFileSync(path.join(process.cwd(), 'components/marketing/contact-form.tsx'), 'utf8')
    expect(source).toContain('{CONTACT_SIZE_BOUNDARY_HINT}')
    expect(source).toContain('aria-describedby="employeeCountHint"')
    expect(source).toContain('id="employeeCountHint"')
  })
})
