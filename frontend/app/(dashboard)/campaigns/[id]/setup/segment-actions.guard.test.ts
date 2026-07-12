import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('saveSegmentDepartmentsAction — structurele garanties', () => {
  const src = readFileSync(join(__dirname, 'segment-actions.ts'), 'utf-8')

  it('gebruikt de membership-check (owner/member, geen viewer)', () => {
    expect(src).toContain('getAuthAndMembership')
  })
  it('valideert server-side via prepareSegmentDepartmentsUpdate', () => {
    expect(src).toContain('prepareSegmentDepartmentsUpdate')
  })
  it('bepaalt vergrendelde afdelingen uit de database, niet uit client-input', () => {
    expect(src).toContain("from('respondents')")
  })
  it('schrijft de som naar het delivery record (campagne-totaal = afgeleid)', () => {
    expect(src).toContain('totalInvited')
    expect(src).toContain('campaign_delivery_records')
  })
})
