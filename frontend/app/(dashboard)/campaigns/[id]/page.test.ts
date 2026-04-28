import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail review guardrails', () => {
  it('makes campaign detail the only surface that opens a new action center route', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")

    expect(source).toContain('Open in Action Center')
    expect(source).toContain('canOpenActionCenterRoute(deliveryRecord)')
    expect(source).toContain('first_management_use_confirmed_at')
    expect(normalizedSource).toContain(".select('id, lifecycle_stage, first_management_use_confirmed_at')")
  })

  it('keeps the client shell guided until dashboard output is genuinely visible', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")
    const guidedPanelSource = readFileSync(
      new URL('../../../../components/dashboard/guided-self-serve-panel.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain('Begeleide uitvoerflow')
    expect(source).toContain('activationState.heroActionLabel')
    expect(source).toContain('showManagementOutput &&')
    expect(source).toContain('showDeeperInsights')
    expect(source).toContain('Compacte read zichtbaar, aanbevelingen nog begrensd')
    expect(source).toContain('Begeleide uitvoering')
    expect(normalizedSource).toContain('createAdminClient()')
    expect(normalizedSource).toContain(".eq('checkpoint_key', 'import_qa')")
    expect(guidedPanelSource).toContain('Start uitnodigingen')
    expect(guidedPanelSource).toContain('invite_queue')
  })

  it('composes the detail route explicitly around sparse, partial, full and closed states', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")

    expect(source).toContain('getCampaignCompositionState')
    expect(normalizedSource).toContain("compositionState === 'partial'")
    expect(normalizedSource).toContain("compositionState === 'full'")
    expect(normalizedSource).toContain("compositionState === 'closed'")
    expect(source).toContain('Aanbevelingen blijven nog begrensd')
    expect(source).toContain('Rapport eerst')
  })

  it('keeps customer execution role-aware and critical actions auditable', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")
    const guidedPanelSource = readFileSync(
      new URL('../../../../components/dashboard/guided-self-serve-panel.tsx', import.meta.url),
      'utf8',
    )
    const preflightSource = readFileSync(
      new URL('../../../../components/dashboard/preflight-checklist.tsx', import.meta.url),
      'utf8',
    )

    expect(normalizedSource).toContain("getCustomerActionPermission(membership?.role ?? null, 'review_launch')")
    expect(guidedPanelSource).toContain('Jouw rol en kritieke acties')
    expect(guidedPanelSource).toContain('Alleen de klant owner kan')
    expect(preflightSource).toContain('Recente kritieke acties')
    expect(preflightSource).toContain('Klant owner')
  })

  it('keeps owner guidance and the first next step visible above the fold', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")

    expect(source).toContain('Eerste eigenaar')
    expect(source).toContain('Logische vervolgstap')
    expect(source).toContain('dashboardViewModel.nextStep.title')
    expect(normalizedSource).toContain('defaultOpen={!hasEnoughData}')
  })

  it('keeps module hierarchy differentiated by role, evidence order and trust placement', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")

    expect(normalizedSource).toContain("familyRoleLabel: 'Kernroute'")
    expect(normalizedSource).toContain("familyRoleLabel: 'Begrensde peer-route'")
    expect(normalizedSource).toContain("familyRoleLabel: 'Begrensde support-route'")

    expect(normalizedSource).toContain('summaryBarOrder:')
    expect(normalizedSource).toContain("'next-step'")
    expect(normalizedSource).toContain("'response'")
    expect(normalizedSource).toContain("'review'")

    expect(normalizedSource).toContain("evidenceSectionOrder: 'management-first'")
    expect(normalizedSource).toContain("evidenceSectionOrder: 'profile-first'")
    expect(normalizedSource).toContain("recommendationOrder: 'questions-first'")
    expect(normalizedSource).toContain("recommendationOrder: 'playbooks-first'")
    expect(normalizedSource).toContain("trustNotePlacement: 'drivers'")
    expect(normalizedSource).toContain("trustNotePlacement: 'handoff'")
  })

  it('keeps informational layers neutral and reserves stronger colors for actual status changes', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = pageSource.replaceAll('"', "'")
    const chartSource = readFileSync(
      new URL('../../../../components/dashboard/risk-charts.tsx', import.meta.url),
      'utf8',
    )

    expect(normalizedSource).toContain("label: 'Dashboardstatus'")
    expect(normalizedSource).toContain("tone: averageRiskScore !== null ? 'slate' : 'amber'")
    expect(normalizedSource).toContain("tone: hasEnoughData ? 'slate' : 'amber'")
    expect(normalizedSource).toContain('focusBadgeLabel')
    expect(normalizedSource).toContain('productExperience.routeBadgeLabel')
    expect(normalizedSource).toContain("return tone === 'blue' ? 'slate' : tone")
    expect(pageSource).toContain('border-slate-200')
    expect(pageSource).toContain('bg-slate-50')
    expect(chartSource).toContain('<Bar dataKey="count" fill="#94A3B8" radius={[2, 2, 0, 0]} />')
  })

  it('keeps deeper operational copy in Dutch so management and admin layers read consistently', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Terug naar dashboardoverzicht')
    expect(source).toContain('Operatie, respondenten en uitvoering')
    expect(source).toContain('Beheer en operatie')
    expect(source).toContain('uitvoercontrole')
    expect(source).toContain('respondenten')
    expect(source).not.toContain('Terug naar campaignoverzicht')
    expect(source).not.toContain('Admin en operations')
    expect(source).not.toContain('learning-workbench')
    expect(source).not.toContain('Campaign is al opgenomen in de learninglus')
  })
})
