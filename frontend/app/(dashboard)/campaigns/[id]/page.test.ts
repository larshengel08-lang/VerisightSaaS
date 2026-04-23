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

  it('keeps the client shell guided until the dashboard is actually activated', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const guidedPanelSource = readFileSync(
      new URL('../../../../components/dashboard/guided-self-serve-panel.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain('Begeleide uitvoerflow')
    expect(source).toContain('activationState.heroActionLabel')
    expect(source).toContain('showManagementOutput &&')
    expect(source).toContain('showDeeperInsights')
    expect(source).toContain('Verdieping nog dicht')
    expect(source).toContain('Guided self-serve')
    expect(source).toContain("createAdminClient()")
    expect(source).toContain(".eq('checkpoint_key', 'import_qa')")
    expect(guidedPanelSource).toContain('Start uitnodigingen')
  })
})
