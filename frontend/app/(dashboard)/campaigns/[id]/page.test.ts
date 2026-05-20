import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail management-read guardrails', () => {
  it('keeps campaign detail the only surface that can open a new action center route', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")

    expect(source).toContain('Open in Action Center')
    expect(source).toContain('canOpenActionCenterRoute(deliveryRecord)')
    expect(source).toContain('first_management_use_confirmed_at')
    expect(normalizedSource).toContain(".select('id, lifecycle_stage, first_management_use_confirmed_at')")
  })

  it('builds dedicated report-faithful read layers for exit and retention instead of reusing generic dashboard detail structure', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('ManagementReadHeader')
    expect(source).toContain('ManagementReadSection')
    expect(source).toContain('ManagementReadFactorTable')
    expect(source).toContain('ManagementReadBridge')
    expect(source).toContain("stats.scan_type === \"exit\"")
    expect(source).toContain("stats.scan_type === \"retention\"")
    expect(source).toContain('buildExitPictureDistribution')
    expect(source).toContain('buildRetentionSignalSegments')
  })

  it('keeps route pages in a bestuurlijke read layer and does not default to owner-action-review commitment blocks', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Kernbeeld nu')
    expect(source).toContain('Frictiescore')
    expect(source).toContain('Dit is het gemiddelde frictieniveau in de leesbare responses.')
    expect(source).toContain('Werkfrictie laat de richting van het beeld zien.')
    expect(source).toContain('hoort pas in Action Center thuis')
    expect(source).not.toContain('wie wat moet doen')
    expect(source).not.toContain('route-eigenaar standaard als inhoudsblok pushen')
  })

  it('preserves report-truth layers such as response basis, factor signal values and SDT', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Respons & leescontext')
    expect(source).toContain('Frictiescore')
    expect(source).toContain('Verdeling van vertrekbeeld')
    expect(source).toContain('Survey-stemmen')
    expect(source).toContain('buildExitSurveyVoices')
    expect(source).toContain('signal: presentation.signalDisplay')
    expect(source).toContain('ExitDriversPriorityChart')
    expect(source).toContain('ExitSdtNeedsChart')
    expect(source).toContain('ExitOrgFactorsChart')
    expect(source).toContain('buildFactorPresentation')
    expect(source).toContain('Verdiepingslagen')
    expect(source).toContain('n = ${responses.length}')
  })

  it('keeps the deeper generic campaign shell available for bounded routes and utility layers', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const normalizedSource = source.replaceAll('"', "'")

    expect(source).toContain('showClientExecutionFlow')
    expect(source).toContain('Operatie, respondenten en uitvoering')
    expect(normalizedSource).toContain("familyRoleLabel: 'Kernroute'")
    expect(normalizedSource).toContain("familyRoleLabel: 'Begrensde peer-route'")
    expect(normalizedSource).toContain("familyRoleLabel: 'Begrensde support-route'")
  })

  it('keeps culture assessment on an explicit primary-route branch instead of falling back to pulse framing', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const primaryRouteIndex = source.indexOf('familyRoleLabel: "Primary route"')
    const cultureBranch = primaryRouteIndex >= 0
      ? source.slice(Math.max(0, primaryRouteIndex - 600), primaryRouteIndex + 7000)
      : ''

    expect(source).toContain('buildDashboardArchitecture({')
    expect(primaryRouteIndex).toBeGreaterThan(-1)
    expect(cultureBranch).toContain('familyRoleLabel: "Primary route"')
    expect(cultureBranch).toContain('summarySignalLabel: "Loep Culture Index"')
    expect(cultureBranch).toContain('summaryContextLabel: "Jaarlijkse cultuur- en engagementbaseline"')
    expect(cultureBranch).toContain('routeTitle: "Board-read & vervolgritme"')
    expect(cultureBranch).toContain('geen onmiddellijke vervolgrichting')
    expect(cultureBranch).toContain('RetentieScan')
    expect(cultureBranch).toContain('ExitScan')
    expect(cultureBranch).not.toContain('Pulsesignaal')
    expect(cultureBranch).not.toContain('Pulse groepsread')
    expect(cultureBranch).not.toContain('Begrensde support-route')
  })

  it('wires culture assessment pages to the canonical executive reading order', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const cultureReturn = source.match(
      /if \(showManagementOutput && stats\.scan_type === "culture_assessment"\)[\s\S]*?if \(\s*showManagementOutput &&\s*\(stats\.scan_type === "exit" \|\| stats\.scan_type === "retention"\)/,
    )?.[0] ?? ''

    const orderedLabels = [
      '1. Responsbasis & meetdekking',
      '2. Executive culture read',
      '3. Loep Culture Index',
      '4. Board attention points',
      '5. Domeinbeeld',
      '6. Patronen in samenhang',
      '7. Segmentcontrasten',
      '8. Verdiepingslagen',
      '9. Open signalen',
      '10. Board-read & vervolgritme',
      '11. Rapport, export & methodiek',
    ]

    let previousIndex = -1
    for (const label of orderedLabels) {
      const nextIndex = cultureReturn.indexOf(label)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }
  })
})
