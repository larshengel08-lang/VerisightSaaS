import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail route shell', () => {
  it('keeps open answers reachable from the results environment in one click', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('/open-antwoorden')
  })

  it('keeps the manager-only insight boundary intact', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('if (!context.canViewInsights)')
    expect(source).toContain('SuiteAccessDenied')
  })

  it('wires ExitScan through a dedicated analytical component and preserves report + module navigation', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('PdfDownloadButton')
    expect(source).toContain('moduleBackLinkLabel')
    expect(source).toContain('if (stats.scan_type === "exit")')
    expect(source).not.toContain('return stats.scan_type === "exit" ? (')
  })

  it('keeps existing module breadcrumbs instead of collapsing to a generic dashboard jump', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getDashboardModuleHref')
    expect(source).toContain('getDashboardModuleKeyForScanType')
    expect(source).toContain('getDashboardModuleLabel')
    expect(source).toContain('Terug naar alle ExitScans')
  })
})
