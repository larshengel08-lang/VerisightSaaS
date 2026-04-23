import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dashboard home guided execution shell', () => {
  it('keeps the customer landing focused on guided execution before dashboard activation', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Jouw uitvoerstatus')
    expect(source).toContain('Open uitvoerflow')
    expect(source).toContain('getCampaignCompositionState')
    expect(source).toContain('HOME_STATE_ORDER')
    expect(source).toContain('Deels zichtbaar')
    expect(source).toContain('Indicatief, nog dun')
    expect(source).toContain('Launch klaar')
    expect(source).toContain('Rapport eerst')
  })
})
