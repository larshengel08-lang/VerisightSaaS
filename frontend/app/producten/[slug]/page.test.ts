import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('ExitScan product page background treatment', () => {
  it('uses one single page background tone instead of alternating section backgrounds', () => {
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )

    const exitScanSource = pageSource.split('function RetentionScanPage()')[0]

    expect(exitScanSource).not.toContain("<section style={{ background: T.paperSoft")
    expect(exitScanSource).toContain("page: '#FFFFFF'")
    expect(exitScanSource).toContain("<div style={{ background: T.page")
    expect(exitScanSource).toContain("<section style={{ background: T.page")
    expect(exitScanSource).not.toContain("backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`")
    expect(exitScanSource).not.toContain("background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`")
  })
})

describe('RetentieScan product page background treatment', () => {
  it('uses the same single homepage canvas tone instead of warmer section backgrounds', () => {
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )

    const retentionScanSource = pageSource
      .split('function RetentionScanPage()')[1]
      .split('function PulsePage()')[0]

    expect(retentionScanSource).toContain("page: '#FFFFFF'")
    expect(retentionScanSource).toContain("<div style={{ background: T.page")
    expect(retentionScanSource).toContain("<section style={{ background: T.page")
    expect(retentionScanSource).not.toContain("<section style={{ background: T.paperSoft")
    expect(retentionScanSource).not.toContain("<section style={{ background: T.white")
    expect(retentionScanSource).not.toContain("backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`")
    expect(retentionScanSource).not.toContain("background: `radial-gradient(circle,${T.tealFaint} 0%,transparent 65%)`")
  })
})
