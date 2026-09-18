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

  it('linkt terug naar alle metingen en toont geen knop die naar zichzelf wijst (spec 2026-09-16 par. 6.1 en 7)', () => {
    expect(source).toContain('Alle metingen')
    expect(source).not.toContain('Terug naar dashboard')
    expect(source).toContain('withoutSelfLink(state, `/campaigns/${id}`)')
    // De kaarten krijgen de gestripte staat, het rapportblok blijft op de originele kind.
    expect(source).toContain('state={pageState}')
    expect(source).not.toContain('<DashboardStateCard state={state}')
  })
})
