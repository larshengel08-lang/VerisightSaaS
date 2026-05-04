import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('routebeheer page guardrails', () => {
  it('keeps routebeheer as an operational hub and excludes analytical or action-center detail layers', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const componentSource = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')
    const combined = `${source}\n${componentSource}`

    expect(combined).toContain('Routebeheer')
    expect(combined).toContain('Open dashboard')
    expect(combined).not.toContain('Frictiescore')
    expect(combined).not.toContain('factoren')
    expect(combined).not.toContain('SDT')
    expect(combined).not.toContain('reviewmoment')
    expect(combined).not.toContain('ActionPlaybook')
    expect(combined).not.toContain('route-acties')
  })

  it('keeps routebeheer labels clean and preserves the approved instellingen CTA', () => {
    const componentSource = readFileSync(new URL('./route-beheer-components.tsx', import.meta.url), 'utf8')

    expect(componentSource).toContain('Bekijk instellingen')
    expect(componentSource).not.toContain('Ã')
    expect(componentSource).not.toContain('Â')
    expect(componentSource).not.toContain('â€¢')
    expect(componentSource).not.toContain('�')
  })

  it('reuses the existing campaign access boundary instead of inventing a new route role model', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('loadSuiteAccessContext')
    expect(source).toContain('context.canViewInsights')
    expect(source).toContain('SuiteAccessDenied')
    expect(source).not.toContain('managerOnly')
  })
})
