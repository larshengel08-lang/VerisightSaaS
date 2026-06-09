import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dashboard admin setup page guardrails', () => {
  it('keeps /beheer scoped to admin setup instead of routehub or analytics', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const helperSource = readFileSync(new URL('./get-beheer-page-data.ts', import.meta.url), 'utf8')
    const combined = `${source}\n${helperSource}`

    expect(combined).toContain('Dashboard admin setup')
    expect(combined).toContain('Configureer organisaties, toegang, campagnes en data-readiness')
    expect(combined).toContain('Open setupblokkades')
    expect(combined).toContain('Secundaire adminmodules')

    expect(combined).not.toContain('Operationele setup')
    expect(combined).not.toContain('Werkvolgorde voor Verisight')
    expect(combined).not.toContain('Open delivery- en activatiewerk')
    expect(combined).not.toContain('Campagne-statusoverzicht')
    expect(combined).not.toContain('Action Center')
    expect(combined).not.toContain('avg_risk_score')
    expect(combined).not.toContain('OperatorOnboardingBlueprint')
  })

  it('keeps the admin gate and setup-only navigation intact', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("redirect('/dashboard')")
    expect(source).toContain('profile?.is_verisight_admin !== true')
    expect(source).toContain('/beheer/billing')
    expect(source).toContain('/beheer/health')
    expect(source).toContain('/beheer/proof')
    expect(source).toContain('/beheer/klantlearnings')
    expect(source).toContain('/beheer/contact-aanvragen')
    expect(source).not.toContain('/action-center')
  })

  it('keeps page and direct setup-flow copy free of mojibake markers', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const newOrgSource = readFileSync(
      new URL('../../../components/dashboard/new-org-form.tsx', import.meta.url),
      'utf8',
    )
    const addRespondentsSource = readFileSync(
      new URL('../../../components/dashboard/add-respondents-form.tsx', import.meta.url),
      'utf8',
    )
    const clientAccessSource = readFileSync(
      new URL('../../../components/dashboard/client-access-list.tsx', import.meta.url),
      'utf8',
    )
    const combined = `${pageSource}\n${newOrgSource}\n${addRespondentsSource}\n${clientAccessSource}`

    expect(combined).not.toContain('Ã')
    expect(combined).not.toContain('Â')
    expect(combined).not.toContain('â')
    expect(combined).not.toContain('�')
    expect(combined).toContain('Organisatie aangemaakt.')
    expect(combined).toContain('Voer minimaal één geldig e-mailadres in.')
    expect(combined).toContain('Niet beschikbaar — data kon niet worden geladen')
  })
})
