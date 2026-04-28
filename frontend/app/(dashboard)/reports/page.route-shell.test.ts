import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('reports route shell', () => {
  it('keeps shared action center follow-up semantics visible in the reports surface', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const helperSource = readFileSync(
      new URL('../../../lib/dashboard/action-center-entry-state.ts', import.meta.url),
      'utf8',
    )

    expect(source).toContain('getActionCenterEntryState')
    expect(helperSource).toContain('Nog geen opvolging geopend')
    expect(helperSource).toContain('Route-kandidaat')
    expect(helperSource).toContain('Actieve opvolging')
    expect(source).toContain('entry.actionCenterState.label')
    expect(source).toContain('featuredActionCenterState.label')
  })
})
