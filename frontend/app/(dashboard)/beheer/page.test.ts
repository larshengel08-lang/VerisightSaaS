import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('beheer admin alignment', () => {
  it('renders beheer as a setup-first admin hub', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('DashboardSection')
    expect(source).toContain('Setupcontext')
    expect(source).toContain('Organisatie aanmaken')
    expect(source).toContain('Campaign aanmaken')
    expect(source).toContain('Respondenten importeren')
    expect(source).toContain('Klanttoegang activeren')
    expect(source).toContain('Secundaire werkbanken')
    expect(source).toContain('Operations & registries')
    expect(source).toContain('Bestaande organisaties')
    expect(source).toContain('Bestaande campaigns')
    expect(source).not.toContain('DashboardHero')
    expect(source).not.toContain('DashboardSummaryBar')
    expect(source).not.toContain('Operationele setup')
    expect(source).not.toContain('Werkvolgorde voor Verisight')
    expect(source).not.toContain('Open delivery- en activatiewerk')
    expect(source).not.toContain('Gebruik dit overzicht voor organisatie-setup, campaign-setup')
    expect(source).not.toContain('Open contactaanvragen')
    expect(source).not.toContain('Open klantlearnings')
    expect(source).not.toContain('Open health review')
    expect(source).not.toContain('Open setupwerkvloer')
  })
})
