import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('ExitScanPage copy', () => {
  it('uses the updated buyer-facing copy in ExitScanPage only', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )
    const exitScanSection = source.slice(
      source.indexOf('function ExitScanPage()'),
      source.indexOf('function RetentionScanPage()'),
    )

    expect(exitScanSection).toContain(
      'Voor organisaties die willen begrijpen waarom mensen vertrekken en waar één gerichte actie het meeste oplevert.',
    )
    expect(exitScanSection).toContain('Rapport met factoranalyse en prioriteiten')
    expect(exitScanSection).toContain('Begeleide managementbespreking (60–90 min)')
    expect(exitScanSection).toContain('Eerste keuze en vervolgrichting vastgesteld')
    expect(exitScanSection).toContain(
      'Na de scan ontvangt u rapport, dashboard en een begeleide managementbespreking.',
    )
    expect(exitScanSection).toContain(
      'Rapport met vertrekpatronen, factoranalyse en prioriteiten',
    )
    expect(exitScanSection).toContain(
      'Dashboard voor intern gebruik tijdens en na de scan',
    )
    expect(exitScanSection).toContain(
      'Begeleide managementbespreking: samen bepalen wat nu het eerst aandacht vraagt',
    )
    expect(exitScanSection).toContain(
      'Segmentverdieping op afdeling of functieniveau waar respons en metadata dat dragen',
    )
    expect(exitScanSection).toContain(
      'Zelfde structuur in dashboard en rapport als de eerste baseline',
    )

    expect(exitScanSection).not.toContain(
      'Voor organisaties die vertrek niet alleen willen registreren, maar scherp willen begrijpen waar patronen terugkomen en waar actie het eerst effect heeft.',
    )
    expect(exitScanSection).not.toContain('Dashboard met prioriteiten en factoranalyse')
    expect(exitScanSection).not.toContain(
      'U krijgt een leeslijn voor dashboard, rapport en eerste managementbespreking.',
    )
    expect(exitScanSection).not.toContain(
      'Dashboard met eerste vertrekbeeld en prioriteiten',
    )
    expect(exitScanSection).not.toContain(
      'Houdt dezelfde leeslijn vast in dashboard en rapport',
    )
  })
})
