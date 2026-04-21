import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign page render truth', () => {
  it('keeps retention and exit primary dashboard labels aligned with phase 1 truth', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("summarySignalLabel: 'Retentiesignaal'")
    expect(source).toContain("summaryContextLabel: 'Groepssignaal · verification-first'")
    expect(source).toContain(
      "'Lees RetentieScan eerst als groepssignaal: waar staat behoud onder druk, wat vraagt eerst verificatie",
    )
    expect(source).toContain("signalTabLabel: 'Retentiesignaal'")
    expect(source).toContain("summarySignalLabel: 'Frictiescore'")
    expect(source).toContain("summaryContextLabel: 'Werkfrictie · verklarende laag'")
    expect(source).toContain(
      "'Lees ExitScan eerst via de Frictiescore: wat keert terug, waar lijkt werkfrictie beinvloedbaar",
    )
    expect(source).toContain("signalTabLabel: 'Frictiescore'")
    expect(source).toContain(
      "'Deze laag opent met de Frictiescore als bestuurlijk leesbare managementsamenvatting: wat keert terug, waar lijkt werkfrictie beinvloedbaar",
    )
    expect(source).not.toContain("summarySignalLabel: 'Vertreksignaal'")
    expect(source).not.toContain("signalTabLabel: 'Vertrekbeeld'")
    expect(source).not.toContain('stay-intent')
  })
})
