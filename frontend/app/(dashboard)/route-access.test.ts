import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('suite access route guardrails', () => {
  it('keeps manager-only users inside action center and outside insight routes', () => {
    const dashboardSource = readFileSync(new URL('./dashboard/page.tsx', import.meta.url), 'utf8')
    const reportsSource = readFileSync(new URL('./reports/page.tsx', import.meta.url), 'utf8')
    const campaignSource = readFileSync(new URL('./campaigns/[id]/page.tsx', import.meta.url), 'utf8')
    const actionCenterSource = readFileSync(new URL('./action-center/page.tsx', import.meta.url), 'utf8')

    expect(dashboardSource).toContain("if (context.managerOnly) redirect('/action-center')")
    expect(reportsSource).toContain('SuiteAccessDenied')
    expect(reportsSource).toContain('manager-login opent alleen het Action Center')
    expect(campaignSource).toContain('Campaigninzichten blijven buiten je manager-scope')
    expect(actionCenterSource).toContain('manager-assignees landen alleen op deze module')
    expect(actionCenterSource).toContain('managerAssignmentEndpoint="/api/action-center/workspace-members"')
    expect(actionCenterSource).toContain('isScopeVisibleToActionCenterContext')
  })
})
