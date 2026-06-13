// frontend/app/(dashboard)/campaigns/[id]/page.standalone.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('campaign detail reduced to operational state-view', () => {
  it('renders the shared dashboard state card', () => {
    expect(source).toContain('resolveDashboardState')
    expect(source).toContain('DashboardStateCard')
  })

  it('removes the analytical layers named in the spec', () => {
    expect(source).not.toContain('RiskCharts')
    expect(source).not.toContain('ExitDriversPriorityChart')
    expect(source).not.toContain('ManagementReadFactorTable')
    expect(source).not.toContain('DashboardTabs')
    expect(source).not.toContain('FactorTable')
    expect(source).not.toContain('RecommendationList')
    expect(source).not.toContain('SdtGauge')
  })

  it('keeps the report download available when the report is ready', () => {
    expect(source).toContain('PdfDownloadButton')
  })

  it('keeps the access guard', () => {
    expect(source).toContain('canViewInsights')
  })
})
