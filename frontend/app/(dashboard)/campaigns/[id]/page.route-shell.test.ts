import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail route shell', () => {
  it('keeps the manager-only insight boundary intact', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('if (!context.canViewInsights)')
    expect(source).toContain('SuiteAccessDenied')
  })

  it('wires ExitScan and RetentieScan through dedicated boardroom components and preserves report + module navigation', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('ExitProductDashboard')
    expect(source).toContain('RetentionProductDashboard')
    expect(source).toContain('primarySignalScoreLabel')
    expect(source).toContain('PdfDownloadButton')
    expect(source).toContain('moduleBackLinkLabel')
    expect(source).toContain('if (stats.scan_type === "exit")')
    expect(source).toContain('if (stats.scan_type === "retention")')
  })

  it('keeps Action Center outside the primary ExitScan and RetentieScan result shells', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('const actionCenterBridgeCard =')
    expect(source).toMatch(/if \(stats\.scan_type === ['"]exit['"]\)/)
    expect(source).toMatch(/if \(stats\.scan_type === ['"]retention['"]\)/)
    expect(source).toContain('{actionCenterBridgeCard}')
    expect(source).toContain('ResultsLayout')
  })

  it('keeps existing module breadcrumbs instead of collapsing to a generic dashboard jump', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getDashboardModuleHref')
    expect(source).toContain('getDashboardModuleKeyForScanType')
    expect(source).toContain('getDashboardModuleLabel')
    expect(source).toContain('Terug naar alle ExitScans')
  })
})
