import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail review guardrails', () => {
  it('keeps the client shell guided until dashboard output is genuinely visible', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
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
    expect(pageSource).toContain('aside={<DashboardChip label={productExperience.routeBadgeLabel} tone="slate" />}')
    expect(pageSource).toContain("return tone === 'blue' ? 'slate' : tone")
    expect(pageSource).toContain("'border-slate-200 bg-slate-50'")
    expect(chartSource).toContain('<Bar dataKey="count" fill="#94A3B8" radius={[2, 2, 0, 0]} />')
  })
})
