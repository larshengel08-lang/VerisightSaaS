import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('RetentionScanPage copy', () => {
  it('uses the updated buyer-facing copy in RetentionScanPage only', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )
    const retentionSection = source.slice(
      source.indexOf('function RetentionScanPage()'),
      source.indexOf('function PulsePage()'),
    )

    expect(retentionSection).toContain(
      'Voor organisaties die eerder willen zien waar behoud risico loopt — voordat het te laat is om nog bij te sturen.',
    )
    expect(retentionSection).toContain(
      'Rapport met retentiesignaal, factoranalyse en prioriteiten',
    )
    expect(retentionSection).toContain(
      'Begeleide managementbespreking (60–90 min)',
    )
    expect(retentionSection).toContain(
      'Geen individuele signalen — alleen groepsniveau',
    )
    expect(retentionSection).toContain(
      'Na de scan ontvangt u rapport, retentiesignaal en een begeleide managementbespreking.',
    )
    expect(retentionSection).toContain(
      'Dashboard voor intern gebruik tijdens en na de scan',
    )
    expect(retentionSection).toContain(
      'Begeleide managementbespreking: samen bepalen welk risico nu eerst aandacht vraagt',
    )
    expect(retentionSection).toContain(
      'Segmentverdieping op afdeling of functieniveau waar respons en metadata dat dragen',
    )
    expect(retentionSection).toContain(
      'Zelfde structuur in dashboard en rapport als de eerste baseline',
    )
  })
})
