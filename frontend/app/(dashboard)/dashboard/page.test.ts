import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dashboard home UX guardrails', () => {
  it('keeps the overview route focused on one first-read truth above the fold', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(pageSource).toContain('Dashboardoverzicht')
    expect(pageSource).toContain('DashboardTabs tabs={portfolioTabs}')
    expect(pageSource).toContain('Deelnemersbestand ontbreekt nog')
    expect(pageSource).toContain('Zonder deelnemersbestand blijft deze scan in setup. Dashboard en rapport komen daarna pas vrij.')
    expect(pageSource).toContain('Upload deelnemersbestand')
    expect(pageSource).toContain('Open uitvoering')
    expect(pageSource).toContain('Actieve routes')
    expect(pageSource).toContain('Wat nu relevant is')
    expect(pageSource).toContain('Opvolging nu')
    expect(pageSource).toContain('Recente formele output')
    expect(pageSource).toContain('Volledige scanlijst')
    expect(pageSource).toContain('deriveGuidedSelfServeDiscipline')
    expect(pageSource).toContain('getPrimaryGuideCampaign')
    expect(pageSource).toContain('getPrimaryFirstNextStepCampaign')
    expect(pageSource).toContain('getBuyerSafeCampaignName')
    expect(pageSource).not.toContain('TeamScan')
  })

  it('keeps the first screen compact and moves descriptive scan context lower', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Alleen routes die nu iets leesbaars of iets urgents te doen hebben.')
    expect(source).toContain('Maximaal drie regels, geen mini-Action Center.')
    expect(source).toContain('Kernoutput eerst. Bounded reads blijven secundair.')
    expect(source).toContain('Upload nu een CSV- of Excel-bestand met minimaal e-mailadressen.')
    expect(source).not.toContain('CustomerLaunchControl')
    expect(source).not.toContain('Boardroom-ready')
    expect(source).not.toContain('Open de preview-adoptie van het Action Center voor ExitScan')
  })
})
