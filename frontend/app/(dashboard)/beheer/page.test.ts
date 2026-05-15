import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('beheer admin alignment', () => {
  it('uses the shared dashboard family with a compact ops shell', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('DashboardHero')
    expect(source).toContain('DashboardSection')
    expect(source).toContain('DashboardSummaryBar')
    expect(source).toContain('surface="ops"')
    expect(source).toContain('Setuphub voor nieuwe klant en campaign')
    expect(source).toContain('Primaire setupflow')
    expect(source).toContain('Secundaire werkbanken')
    expect(source).toContain('Campagne-overzicht')
    expect(source).toContain('Actieve setupcontext')
    expect(source).toContain('Kies voor setup')
    expect(source).toContain('Contactaanvragen')
    expect(source).toContain('Billing')
    expect(source).not.toContain('Open delivery- en activatiewerk')
    expect(source).not.toContain('Werkvolgorde voor Loep')
    expect(source).not.toContain('Open health review')
  })
})
