import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('site core page label alignment', () => {
  it('keeps retention and exit early site surfaces aligned with phase 1 product truth', () => {
    const retentionSource = readFileSync(new URL('./retention-scan-core-page.tsx', import.meta.url), 'utf8')
    const exitSource = readFileSync(new URL('./exit-scan-core-page.tsx', import.meta.url), 'utf8')

    expect(retentionSource).toContain('Retentiesignaal')
    expect(retentionSource).not.toContain('Voor retentiesignaal, stay-intent en een eerste bestuurlijke handoff.')
    expect(retentionSource).not.toContain('Zie waar retentiesignaal, stay-intent en vertrekdruk nu samenkomen.')

    expect(exitSource).toContain('Frictiescore')
    expect(exitSource).not.toContain('Voor vertrekduiding, werkfactoren en een eerste bestuurlijke handoff.')
    expect(exitSource).not.toContain('Levert een eerste managementbeeld met factoranalyse, prioriteiten en handoff.')
  })
})
