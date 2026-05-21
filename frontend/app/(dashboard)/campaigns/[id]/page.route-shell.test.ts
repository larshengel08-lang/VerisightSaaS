import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail route shell', () => {
  const pageSource = () => readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
  const openAnswersSource = () =>
    readFileSync(new URL('./open-antwoorden/page.tsx', import.meta.url), 'utf8')

  it('keeps open answers reachable from the results environment in one click', () => {
    const source = pageSource()

    expect(source).toContain('/open-antwoorden')
    expect(source).toContain("blockVisibility.voices === 'visible' && releasedOpenAnswerItems.length > 0")
  })

  it('keeps the manager-only insight boundary intact', () => {
    const source = pageSource()

    expect(source).toContain('if (!context.canViewInsights)')
    expect(source).toContain('SuiteAccessDenied')
  })

  it('wires ExitScan through a dedicated analytical component and preserves report + module navigation', () => {
    const source = pageSource()

    expect(source).toContain('PdfDownloadButton')
    expect(source).toContain('moduleBackLinkLabel')
    expect(source).not.toContain('ExitProductDashboard')
    expect(source).not.toContain('if (stats.scan_type === "exit")')
  })

  it('keeps existing module breadcrumbs instead of collapsing to a generic dashboard jump', () => {
    const source = pageSource()

    expect(source).toContain('getDashboardModuleHref')
    expect(source).toContain('getDashboardModuleKeyForScanType')
    expect(source).toContain('getDashboardModuleLabel')
    expect(source).toContain('Terug naar alle ExitScans')
  })

  it('preserves the campaign-detail bridge into Action Center for candidate and active routes', () => {
    const source = pageSource()

    expect(source).toContain('buildCampaignDetailActionCenterBridge')
    expect(source).toContain('openActionCenterRoute')
    expect(source).toContain("buildActionCenterRouteOpenRedirect(id, 'campaign-detail')")
    expect(source).toContain('Vervolgroute')
  })

  it('does not query deprecated survey response aliases that are absent from the live schema', () => {
    const forbiddenColumns = ['signal_score', 'direction_signal_score']

    for (const source of [pageSource(), openAnswersSource()]) {
      for (const column of forbiddenColumns) {
        expect(source).not.toContain(column)
      }
    }
  })
})
