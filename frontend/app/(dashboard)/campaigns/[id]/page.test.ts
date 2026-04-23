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
    expect(source).toContain('Dashboard wordt zichtbaar vanaf de eerste veilige responsdrempel')
    expect(source).toContain('showManagementOutput &&')
    expect(source).toContain('Guided self-serve')
    expect(guidedPanelSource).toContain('Start uitnodigingen')
    expect(guidedPanelSource).toContain('invite_queue')
  })

  it('composes the detail route explicitly around sparse, partial, full and closed states', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getCampaignCompositionState')
    expect(source).toContain("compositionState === 'partial'")
    expect(source).toContain("compositionState === 'full'")
    expect(source).toContain("compositionState === 'closed'")
    expect(source).toContain('Aanbevelingen blijven nog begrensd')
    expect(source).toContain('Rapport-first')
  })

  it('keeps module hierarchy differentiated by role, evidence order and trust placement', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("familyRoleLabel: 'Kernroute'")
    expect(source).toContain("familyRoleLabel: 'Begrensde peer-route'")
    expect(source).toContain("familyRoleLabel: 'Begrensde support-route'")

    expect(source).toContain("summaryBarOrder: ['signal', 'owner', 'response', 'readiness']")
    expect(source).toContain("summaryBarOrder: ['signal', 'next-step', 'response', 'readiness']")
    expect(source).toContain("summaryBarOrder: ['signal', 'next-step', 'review', 'readiness']")
    expect(source).toContain("summaryBarOrder: ['signal', 'owner', 'review', 'readiness']")

    expect(source).toContain("evidenceSectionOrder: 'management-first'")
    expect(source).toContain("evidenceSectionOrder: 'profile-first'")
    expect(source).toContain("recommendationOrder: 'questions-first'")
    expect(source).toContain("recommendationOrder: 'playbooks-first'")
    expect(source).toContain("trustNotePlacement: 'drivers'")
    expect(source).toContain("trustNotePlacement: 'handoff'")

    expect(source).toContain("driverTabOrder: ['factoren', 'trend', 'signalen', 'aanvullend']")
    expect(source).toContain("driverTabOrder: ['factoren', 'signalen', 'aanvullend', 'trend']")
  })
})
