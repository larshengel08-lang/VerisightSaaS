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

  it('keeps pricing off the ExitScan hero card so tarieven stays the only public price surface', () => {
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )

    const exitScanSource = pageSource.split('function RetentionScanPage()')[0]

    expect(exitScanSource).not.toContain("EUR 2.950 {'\\u2022'} Baseline")
    expect(exitScanSource).toContain('>Baseline</div>')
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

  it('keeps pricing off the RetentieScan hero card so tarieven stays the only public price surface', () => {
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )

    const retentionScanSource = pageSource
      .split('function RetentionScanPage()')[1]
      .split('function PulsePage()')[0]

    expect(retentionScanSource).not.toContain("EUR 3.450 {'\\u2022'} Baseline")
    expect(retentionScanSource).toContain('>Baseline</div>')
  })
})

describe('ExitScan and RetentieScan card treatment', () => {
  it('uses the newer homepage-like card system instead of old top-stripe comparison cards', () => {
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )

    const exitScanSource = pageSource.split('function RetentionScanPage()')[0]
    const retentionScanSource = pageSource
      .split('function RetentionScanPage()')[1]
      .split('function PulsePage()')[0]

    expect(exitScanSource).not.toContain("borderTop: `3px solid ${accent}`")
    expect(retentionScanSource).not.toContain("borderTop: `3px solid ${accent}`")
    expect(exitScanSource).toContain("borderRadius: 28")
    expect(retentionScanSource).toContain("borderRadius: 28")
    expect(exitScanSource).toContain("const cardShadow = '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)'")
    expect(retentionScanSource).toContain("const cardShadow = '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)'")
  })
})
