import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./running-state-card.tsx', import.meta.url), 'utf8')

describe('kaart "Campagne loopt" (spec 2026-09-16 par. 4.2 en 4.4)', () => {
  it('toont de gedeelde tijdlijn met datums', () => {
    expect(src).toContain('CampaignTimeline')
    expect(src).toContain('state.timeline')
    expect(src).not.toContain('function TimelineItem')
    expect(src).not.toContain('Nog niet gepland')
  })

  it('toont vóór de herinneringsdag geen herinneringstekst (die staat op de herinneringskaart)', () => {
    expect(src).not.toContain('Herinneringsmail')
    expect(src).not.toContain('navigator.clipboard')
  })

  it('rendert de acties via het gedeelde eiland', () => {
    expect(src).toContain('<DashboardStateActions state={state} reminderText={reminderText} />')
  })

  it('noemt de meting naast de scan (walkthrough 1.2)', () => {
    expect(src).toContain('state.campaignName')
  })

  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
