import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center bounded overview shell', () => {
  it('keeps the route in bounded overview mode', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const previewSource = readFileSync(new URL('../../../components/dashboard/action-center-preview.tsx', import.meta.url), 'utf8')

    expect(pageSource).toContain('boundedOverviewOnly')
    expect(previewSource).toContain('const showBoundedOverviewOnly = boundedOverviewOnly && activeView === \'overview\'')
    expect(previewSource).toContain('hideSidebar && !boundedOverviewOnly')
    expect(previewSource).toContain('Wat vraagt nu aandacht?')
    expect(previewSource).toContain('Overzicht van managementopvolging en acties.')
    expect(previewSource).toContain('Actieve routes')
    expect(previewSource).toContain('Te bespreken / reviewbaar')
    expect(previewSource).toContain('Geblokkeerd')
    expect(previewSource).toContain('Afgerond')
    expect(previewSource).not.toContain('accent="slate"')
  })
})
