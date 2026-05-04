import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('managers page view', () => {
  it('keeps the agreed assignment-only labels and ctas in the view source', () => {
    const source = readFileSync(new URL('./managers-page-view.tsx', import.meta.url), 'utf8')
    const helperSource = readFileSync(new URL('../../lib/managers-page-data.ts', import.meta.url), 'utf8')

    expect(source).toContain('Beheer welke managers aan welke scope zijn gekoppeld en welke Action Center-toegang daaruit volgt.')
    expect(source).toContain('Deze pagina regelt manager assignment en toegang. Geen dashboard, rapport of opvolgingsdetail.')
    expect(source).toContain('Scopes zonder manager')
    expect(source).toContain('Nog niet gekoppeld')
    expect(source).toContain('Bekijk scope en toegang')
    expect(source).toContain('Koppel manager aan scope')
    expect(source).toContain('Bekijk gekoppelde scopes')
    expect(source).toContain("{' · '}")
    expect(helperSource).toContain('Dashboardtoegang: Niet toegestaan')
    expect(helperSource).toContain('Rapporttoegang: Niet toegestaan')
  })

  it('keeps lifecycle semantics out of the visible view source', () => {
    const source = readFileSync(new URL('./managers-page-view.tsx', import.meta.url), 'utf8').toLowerCase()

    for (const forbidden of [
      'uitnodiging',
      'activatie',
      'pending',
      'invited',
      'activated',
      'access requested',
      'wacht op toegang',
      'toegang aangevraagd',
      'Ã',
      'Â',
      'â',
      '�',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })
})
