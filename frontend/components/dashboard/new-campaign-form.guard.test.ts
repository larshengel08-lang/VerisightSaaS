import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./new-campaign-form.tsx', import.meta.url), 'utf8')

describe('new campaign form — segmentatie', () => {
  it('stuurt segment_departments mee bij aanmaak en biedt de suggestie-optie', () => {
    expect(source).toContain('segment_departments')
    expect(source).toContain('Geen afdeling / overig')
  })
})

describe('new campaign form — voorvullen door Loep (spec 2026-09-16 par. 5.3)', () => {
  it('vraagt per afdeling een aantal en valideert via dezelfde helper als de wizard', () => {
    expect(source).toContain('prepareSegmentDepartmentsUpdate')
    expect(source).toContain('Aantal medewerkers')
    expect(source).toContain('invited_count')
  })

  it('vraagt zonder afdelingsrapportage het aantal in de doelgroep met de gedeelde drempel', () => {
    expect(source).toContain('Aantal in de doelgroep')
    expect(source).toContain('validateInvitedTotal')
    expect(source).toContain('MIN_INVITED_TOTAL')
  })

  it('schrijft het totaal naar het delivery record en meldt het als dat mislukt', () => {
    expect(source).toContain(".from('campaign_delivery_records')")
    expect(source).toContain("onConflict: 'campaign_id'")
    expect(source).toContain('Campagne is aangemaakt, maar het aantal deelnemers kon niet worden opgeslagen')
  })

  it('bevat geen em- of en-dashes in nieuwe copy', () => {
    const newCopy = source.slice(source.indexOf('E-mail &amp; deelnemers'))
    expect(newCopy).not.toMatch(/[—–]/)
  })
})
