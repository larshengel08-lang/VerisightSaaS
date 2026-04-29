import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail review guardrails', () => {
  it('keeps the client shell guided until dashboard output is genuinely visible', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const guidedPanelSource = readFileSync(
      new URL('../../../../components/dashboard/guided-self-serve-panel.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain('title="Uitvoering"')
    expect(source).toContain('activationState.heroActionLabel')
    expect(source).toContain('showManagementOutput &&')
    expect(source).toContain('showDeeperInsights')
    expect(source).toContain('Compacte read zichtbaar, aanbevelingen nog begrensd')
    expect(source).toContain(
      'aside={<DashboardChip label={showClientExecutionFlow ? \'Uitvoering\' : \'Beheer en operatie\'} tone="slate" />}',
    )
    expect(source).toContain("createAdminClient()")
    expect(source).toContain(".eq('checkpoint_key', 'import_qa')")
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
    expect(source).toContain('Rapport eerst')
  })

  it('keeps customer execution role-aware and critical actions auditable', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const guidedPanelSource = readFileSync(
      new URL('../../../../components/dashboard/guided-self-serve-panel.tsx', import.meta.url),
      'utf8',
    )
    const preflightSource = readFileSync(
      new URL('../../../../components/dashboard/preflight-checklist.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain("getCustomerActionPermission(membership?.role ?? null, 'review_launch')")
    expect(guidedPanelSource).toContain('Jouw rol en kritieke acties')
    expect(guidedPanelSource).toContain('Alleen de klant owner kan')
    expect(preflightSource).toContain('Recente kritieke acties')
    expect(preflightSource).toContain('Klant owner')
  })

  it('keeps owner guidance and the first next step visible above the fold', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const guidedPanelSource = readFileSync(
      new URL('../../../../components/dashboard/guided-self-serve-panel.tsx', import.meta.url),
      'utf8',
    )

    expect(guidedPanelSource).toContain('Jouw rol en kritieke acties')
    expect(guidedPanelSource).toContain('Maak de eerste stap expliciet')
    expect(guidedPanelSource).toContain(
      'Deze lokale controle toont direct of de importpreview nog herstel nodig heeft',
    )
    expect(source).toContain('defaultOpen={!hasEnoughData}')
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
  })

  it('keeps informational layers neutral and reserves stronger colors for actual status changes', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const chartSource = readFileSync(
      new URL('../../../../components/dashboard/risk-charts.tsx', import.meta.url),
      'utf8',
    )

    expect(pageSource).toContain("label: 'Dashboardstatus'")
    expect(pageSource).toContain("tone: averageRiskScore !== null ? 'slate' : 'amber'")
    expect(pageSource).toContain("tone: hasEnoughData ? 'slate' : 'amber'")
    expect(pageSource).toContain('aside={<DashboardChip label={focusBadgeLabel} tone="slate" />}')
    expect(pageSource).toContain(
      'aside={<DashboardChip label={productExperience.routeBadgeLabel} tone="slate" />}',
    )
    expect(pageSource).toContain("return tone === 'blue' ? 'slate' : tone")
    expect(pageSource).toContain("'border-slate-200 bg-slate-50'")
    expect(chartSource).toContain('<Bar dataKey="count" fill="#94A3B8" radius={[2, 2, 0, 0]} />')
  })

  it('keeps deeper operational copy in Dutch so management and admin layers read consistently', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const preflightSource = readFileSync(
      new URL('../../../../components/dashboard/preflight-checklist.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain('Terug naar dashboardoverzicht')
    expect(source).toContain('Operatie, respondenten en uitvoering')
    expect(source).toContain('Beheer en operatie')
    expect(source).toContain('responsen')
    expect(preflightSource).toContain('leerwerkbank')
    expect(preflightSource).toContain('Uitvoeringswaarschuwingen')
    expect(preflightSource).toContain('Persistente uitvoeringscheckpoints')
    expect(source).not.toContain('Terug naar campaignoverzicht')
    expect(source).not.toContain('Admin en operations')
    expect(preflightSource).not.toContain('learning-workbench')
    expect(source).not.toContain('Campaign is al opgenomen in de learninglus')
    expect(source).toContain('Deze scan is al opgenomen in de learninglus')
  })

  it('keeps ExitScan and RetentieScan aligned to the IA wireframe before deeper analysis opens', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("const isWorkbookCoreRoute = stats.scan_type === 'exit' || stats.scan_type === 'retention'")
    expect(source).toContain("eyebrow={stats.scan_type === 'retention' ? 'Behoud nu' : 'Kernread nu'}")
    expect(source).toContain("eyebrow={stats.scan_type === 'retention' ? 'Top behoudsfactoren' : 'Top vertrekfactoren'}")
    expect(source).toContain("eyebrow={stats.scan_type === 'retention' ? 'Waar eerst kijken' : 'Context / waar zichtbaar'}")
    expect(source).toContain('Open Action Center')
    expect(source).toContain('title="Laatste rapport en managementsamenvatting"')
    expect(source).toContain('title="Verdieping en onderbouwing"')
    expect(source).not.toContain('← Terug naar campaignoverzicht')
  })
})
