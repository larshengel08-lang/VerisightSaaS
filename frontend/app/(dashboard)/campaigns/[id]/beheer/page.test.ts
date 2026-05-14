import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('routebeheer page guardrails', () => {
  it('keeps routebeheer as a compact worktable instead of a stack of interpretation-heavy status surfaces', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const componentSource = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')
    const phaseSource = readFileSync(new URL('./route-beheer-phase-sections.tsx', import.meta.url), 'utf8')
    const combined = `${source}\n${componentSource}\n${phaseSource}`

    expect(combined).toContain('RouteBeheerStructuredBody')
    expect(combined).toContain('RouteBeheerNowDoingRow')
    expect(combined).toContain('RouteBeheerPhaseOverview')
    expect(combined).toContain('RouteBeheerOutputSummary')
    expect(combined).not.toContain('RouteBeheerStatusCards')
    expect(combined).not.toContain('RouteBeheerBlockerPanel')
    expect(combined).not.toContain('Beheer livegang, respons en output-readiness voor deze route.')
    expect(combined).not.toContain('Route vraagt nu operationele aandacht')
    expect(combined).not.toContain('Bekijk per fase wat klaar is en wat nog aandacht vraagt.')
    expect(combined).not.toContain('Open rapport zodra de eerste dashboardread beschikbaar is.')
    expect(combined).not.toContain('Frictiescore')
    expect(combined).not.toContain('factoren')
    expect(combined).not.toContain('SDT')
    expect(combined).not.toContain('reviewmoment')
    expect(combined).not.toContain('ActionPlaybook')
    expect(combined).not.toContain('route-acties')
  })

  it('keeps routebeheer labels clean and preserves the approved instellingen CTA', () => {
    const dataSource = readFileSync(new URL('./beheer-data.ts', import.meta.url), 'utf8')
    const componentSource = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')
    const phaseSource = readFileSync(new URL('./route-beheer-phase-sections.tsx', import.meta.url), 'utf8')
    const combined = `${dataSource}\n${componentSource}\n${phaseSource}`

    expect(combined).toContain('Bekijk instellingen')
    expect(combined).toContain('Route en startdatum')
    expect(combined).toContain('Uitnodigingen en respons')
    expect(combined).toContain('Dashboard / rapportstatus')
    expect(combined).toContain('Status en logboek')
    expect(combined).not.toContain('Ãƒ')
    expect(combined).not.toContain('Ã¯Â¿Â½')
  })

  it('reuses the existing campaign access boundary instead of inventing a new route role model', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('loadSuiteAccessContext')
    expect(source).toContain('context.canViewInsights')
    expect(source).toContain('SuiteAccessDenied')
    expect(source).not.toContain('managerOnly')
  })

  it('keeps the five-phase routebeheer model explicit in the source', () => {
    const source = readFileSync(new URL('./route-beheer-phase-sections.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Doelgroep klaarzetten')
    expect(source).toContain('Communicatie instellen')
    expect(source).toContain('Live zetten & volgen')
    expect(source).toContain('Output beoordelen')
    expect(source).toContain('Afronden & controleren')
  })
})
