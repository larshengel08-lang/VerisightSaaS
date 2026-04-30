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

    expect(source).toContain('De pagina bewaakt bewust de grens tussen bestuurlijke duiding en commitment')
    expect(source).toContain('stopt dus bij duiding, prioritering en een lichte brug')
    expect(source).toContain('hoort pas in Action Center thuis')
    expect(source).not.toContain('wie wat moet doen')
    expect(source).not.toContain('route-eigenaar standaard als inhoudsblok pushen')
  })

  it('preserves report-truth layers such as response basis, banding, factor signal values and SDT', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Responsbasis en leesdiscipline')
    expect(source).toContain('Direct prioriteren')
    expect(source).toContain('Eerst toetsen')
    expect(source).toContain('Volgen')
    expect(source).toContain('buildFactorPresentation')
    expect(source).toContain('SDT en organisatiefactoren')
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
})
