import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('beheer admin alignment', () => {
  it('uses the shared dashboard family with a compact ops shell', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('DashboardHero')
    expect(source).toContain('DashboardSection')
    expect(source).toContain('DashboardSummaryBar')
    expect(source).toContain('surface="ops"')
    expect(source).toContain('Operationele setup')
    expect(source).toContain('Werkbanken en standaardlagen')
    expect(source).toContain('Werkvolgorde voor Loep')
    expect(source).toContain('Open deliverylaag')
    expect(source).toContain('Gebruik dit overzicht voor organisatie-setup, campaign-setup')
    expect(source).toContain('Billing registry')
    expect(source).toContain('Billing default')
    expect(source).toContain('Open health review')
    expect(source).toContain('Health review default')
    expect(source).toContain('Case proof registry')
    expect(source).toContain('Proof ladder default')
    expect(source).toContain('Open setupwerkvloer')
    expect(source).toContain('Toon campagne-statusoverzicht')
  })
})
