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
    expect(combined).not.toContain('Frictiescore')
    expect(combined).not.toContain('factoren')
    expect(combined).not.toContain('SDT')
    expect(combined).not.toContain('reviewmoment')
    expect(combined).not.toContain('ActionPlaybook')
    expect(combined).not.toContain('route-acties')
  })

  it('keeps routebeheer labels clean and preserves the approved instellingen CTA', () => {
    const componentSource = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')
    const phaseSource = readFileSync(new URL('./route-beheer-phase-sections.tsx', import.meta.url), 'utf8')
    const combined = `${componentSource}\n${phaseSource}`

    expect(combined).toContain('Bekijk instellingen')
    expect(combined).not.toContain('Ã')
    expect(combined).not.toContain('ï¿½')
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
