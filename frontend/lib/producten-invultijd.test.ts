import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { SURVEY_DURATION_LABEL, SURVEY_MINUTES } from '@/lib/campaign-setup'

const lees = (relatief: string) => readFileSync(path.join(process.cwd(), relatief), 'utf8')

// Polijstronde Taak 12 (spec 2026-10-09 par. 4): /producten noemt dezelfde
// invultijd als de vragenlijst zelf, uit SURVEY_MINUTES, niet een losse
// afgeronde schatting.
describe('invultijd op /producten', () => {
  const content = lees('components/marketing/producten-content.tsx')

  it('haalt de invultijd per scan uit SURVEY_DURATION_LABEL', () => {
    expect(content).toContain("from '@/lib/campaign-setup'")
    expect(content).toContain('duration: SURVEY_DURATION_LABEL.exit,')
    expect(content).toContain('duration: SURVEY_DURATION_LABEL.retention,')
    expect(content).toContain('duration: SURVEY_DURATION_LABEL.onboarding,')
  })

  it('noemt geen losse minutenschatting of oude invite_duration-bereiken meer', () => {
    expect(content).not.toMatch(/duration:\s*'/)
    expect(content).not.toContain('± ')
    expect(content).not.toMatch(/\(\d+-\d+ min\)/)
  })

  it('de labels die /producten toont komen uit SURVEY_MINUTES', () => {
    expect(SURVEY_DURATION_LABEL.exit).toBe('ongeveer ' + SURVEY_MINUTES.exit + ' minuten')
    expect(SURVEY_DURATION_LABEL.retention).toBe('ongeveer ' + SURVEY_MINUTES.retention + ' minuten')
    expect(SURVEY_DURATION_LABEL.onboarding).toBe('ongeveer ' + SURVEY_MINUTES.onboarding + ' minuten')
  })
})
