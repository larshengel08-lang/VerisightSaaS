import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dashboard home review guardrails', () => {
  it('keeps the home route state-aware and guided before management output takes over', () => {
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

  it('keeps cockpit colors semantically disciplined', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('<DashboardChip label="Operations cockpit" tone="slate" />')
    expect(source).toContain('<DashboardChip label="Klantdashboard" tone="slate" />')
    expect(source).toContain('tone={getHomeStateMeta(group.key).tone}')
    expect(source).toContain("tone: 'emerald' as const")
    expect(source).toContain("label: 'Management ready'")
  })
})
