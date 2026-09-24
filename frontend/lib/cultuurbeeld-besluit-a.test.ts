import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Besluit A (19-9-2026) geldt ook voor Loep Cultuurbeeld (spec par. 8 punt 4):
 * de "Begeleide directie-read sessie" vervalt, want Loep zit ook daar niet aan
 * tafel. Dit rapport draait op de oude renderer en heeft géén gespreksleidraad,
 * werkvragen of besluitpagina: die mogen hier dus niet beloofd worden. De prijs
 * blijft eigen (buiten de staffel), maar komt wel uit lib/pricing.ts.
 *
 * ROOT hangt aan dit bestand en niet aan process.cwd(), zoals in
 * lib/site-ronde-besluit-a.guard.test.ts: draait vitest ooit vanaf de repo-root,
 * dan faalt het lezen luid in plaats van stil de hele suite leeg te laten lopen.
 */
const ROOT = fileURLToPath(new URL('..', import.meta.url))

function cultuurbeeld(): string {
  const bron = fs
    .readFileSync(path.join(ROOT, 'app/producten/[slug]/page.tsx'), 'utf8')
    .replace(/\s+/g, ' ')
  const start = bron.indexOf('function CultureAssessmentPage()')
  const einde = bron.indexOf('function UpcomingProductPage(')
  expect(start, 'CultureAssessmentPage niet gevonden').toBeGreaterThan(-1)
  expect(einde, 'UpcomingProductPage niet gevonden').toBeGreaterThan(start)
  return bron.slice(start, einde)
}

describe('Loep Cultuurbeeld na besluit A', () => {
  it('maakt Loep het onderwerp en zegt dat je het gesprek met je directie zelf voert', () => {
    expect(cultuurbeeld()).toContain(
      'Loep brengt cultuur en engagement in beeld. Jij weet wat bestuurlijk aandacht vraagt.',
    )
    expect(cultuurbeeld()).toContain('Het gesprek met je directie voer je zelf, met het rapport op tafel.')
    expect(cultuurbeeld()).toContain("'Je bespreekt het rapport zelf met je directie',")
    expect(cultuurbeeld()).toContain("'Het gesprek met je directie voer je zelf, met het board-read rapport als basis',")
  })

  it('belooft geen sessie, geen begeleiding en geen leidraad die dit rapport niet heeft', () => {
    // Hoofdletterongevoelig: "Begeleide" en "Begeleiding" moeten óók vallen.
    expect(cultuurbeeld()).not.toMatch(/sessie|begeleid|self-serve/i)
    expect(cultuurbeeld()).not.toMatch(/\bWij\b/)
    expect(cultuurbeeld()).not.toMatch(/gespreksleidraad|werkvragen|besluitpagina/i)
  })

  it('haalt de vanaf-prijs uit lib/pricing.ts en staat buiten de staffel', () => {
    // Drie plekken: het herokaartje, de prijsregel bij de tweede CTA en de
    // vergelijkingstabel. Nergens een los bedrag.
    expect(cultuurbeeld().split('formatEur(CULTUURBEELD_FROM_EUR)').length - 1).toBe(3)
    expect(cultuurbeeld()).not.toContain('PRICING_TIERS')
  })

  it('verwijst niet naar /tarieven, want de staffel daar geldt niet voor dit product', () => {
    expect(cultuurbeeld()).not.toContain('/tarieven')
    expect(cultuurbeeld()).not.toContain('Bekijk tarieven')
  })

  it('gebruikt geen en-dash in de vergelijkingstabel en noemt de doelgroep zoals de rest van de site', () => {
    expect(cultuurbeeld()).toContain("'6 tot 12 weken'")
    expect(cultuurbeeld()).toContain("'€25.000 tot €100.000 en meer'")
    expect(cultuurbeeld()).toContain("'100 tot 1.000 medewerkers, directie als koper'")
  })
})
