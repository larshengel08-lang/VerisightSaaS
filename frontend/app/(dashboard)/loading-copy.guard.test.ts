import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const campaignLoadingSrc = readFileSync(
  new URL('./campaigns/[id]/loading.tsx', import.meta.url),
  'utf8',
)
const dashboardLoadingSrc = readFileSync(new URL('./dashboard/loading.tsx', import.meta.url), 'utf8')

describe('laadschermen in gewone taal', () => {
  it('campagnedetail-laadscherm gebruikt de klantzichtbare titel', () => {
    expect(campaignLoadingSrc).toContain('Je meting wordt geladen')
  })

  it('dashboard-laadscherm gebruikt de klantzichtbare titels', () => {
    expect(dashboardLoadingSrc).toContain('Je overzicht wordt geladen')
    expect(dashboardLoadingSrc).toContain('Je status wordt geladen')
  })

  it('geen Engels jargon of interne term "state" in de laadschermen', () => {
    expect(campaignLoadingSrc).not.toContain('Campaign')
    expect(campaignLoadingSrc).not.toMatch(/\bstate\b/i)
    expect(dashboardLoadingSrc).not.toContain('Campaign')
    expect(dashboardLoadingSrc).not.toMatch(/\bstate\b/i)
  })

  it('geen em-dash of en-dash in de laadschermen', () => {
    expect(campaignLoadingSrc).not.toMatch(/[–—]/)
    expect(dashboardLoadingSrc).not.toMatch(/[–—]/)
  })
})
