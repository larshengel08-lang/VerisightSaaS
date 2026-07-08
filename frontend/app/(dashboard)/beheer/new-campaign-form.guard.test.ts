import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('new campaign form clarity', () => {
  it('keeps the campaign step compact and strips long route explanations', () => {
    const source = readFileSync(new URL('../../../components/dashboard/new-campaign-form.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Kies product')
    expect(source).toContain('Kies route')
    expect(source).toContain('Surveymodules')
    expect(source).not.toContain('Rapport-add-ons')
    expect(source).not.toContain('segment_deep_dive')
    expect(source).not.toContain('Onboardingverwachting voor deze route')
    expect(source).not.toContain('Loep Behoud v1.1-validatievoorbereiding')
    expect(source).not.toContain('Pulse wave 1-boundary')
    expect(source).not.toContain('Leadership Scan management boundary')
    expect(source).not.toContain('Deze setup blijft assisted')
    expect(source).not.toContain('Hier bepaal je of de campagne als Loep Vertrek, Loep Behoud, Pulse, TeamScan, Loep Start of Leadership Scan wordt opgezet')
  })

  it('biedt bij het aanmaken geen "Platform verstuurt"-keuze meer aan (2026-07-08) — alleen self_send', () => {
    const source = readFileSync(new URL('../../../components/dashboard/new-campaign-form.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('Platform verstuurt')
    expect(source).not.toContain("value: 'managed'")
    expect(source).not.toContain('setCommsMode')
    expect(source).toContain('HR verstuurt zelf')
    expect(source).toContain("commsMode: CommsMode = 'self_send'")
  })
})
