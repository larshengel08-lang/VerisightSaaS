import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dashboard home UX guardrails', () => {
  it('keeps the overview route focused on first-read guidance and live state truth', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const launchControlSource = readFileSync(
      new URL('../../../components/dashboard/customer-launch-control.tsx', import.meta.url),
      'utf8',
    )

    expect(pageSource).toContain('Overview')
    expect(pageSource).toContain('CustomerLaunchControl')
    expect(pageSource).toContain('SignalStatCard')
    expect(pageSource).toContain('DashboardTabs tabs={portfolioTabs}')
    expect(pageSource).toContain('Management-ready')
    expect(pageSource).toContain('In uitvoering')
    expect(pageSource).toContain('Gem. groepssignaal')
    expect(pageSource).toContain('Afgerond')
    expect(pageSource).toContain('Portfolio')
    expect(pageSource).toContain('deriveGuidedSelfServeDiscipline')
    expect(pageSource).toContain('getPrimaryGuideCampaign')
    expect(pageSource).toContain('getPrimaryFirstNextStepCampaign')
    expect(pageSource).toContain('Deels zichtbaar')
    expect(pageSource).toContain('Indicatief, nog dun')
    expect(pageSource).toContain('Launch klaar')
    expect(pageSource).toContain('Rapport eerst')
    expect(pageSource).not.toContain('TeamScan')

    expect(launchControlSource).toContain('Uitvoerstatus')
    expect(launchControlSource).toContain('Eerstvolgende stap')
    expect(launchControlSource).toContain('Uitvoerstappen')
    expect(launchControlSource).toContain('Open blokkades')
    expect(launchControlSource).toContain('Dashboard actief')
  })

  it('keeps overview language compact and bounded instead of overclaiming', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('een leesbaar dashboard kan openen')
    expect(source).toContain('Nog geen managementduiding')
    expect(source).toContain('Geen live uitvoersignalen meer')
    expect(source).not.toContain('Boardroom-ready')
    expect(source).not.toContain('Open de preview-adoptie van het Action Center voor ExitScan')
  })
})
