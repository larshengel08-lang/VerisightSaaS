import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { selectPrimaryOverviewCampaign } from '@/lib/dashboard/overview-focus'
import type { CampaignStats } from '@/lib/types'

const campaigns: CampaignStats[] = [
  {
    campaign_id: 'guide-1',
    campaign_name: 'Guide campaign',
    scan_type: 'pulse',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2025-10-12T09:00:00Z',
    total_invited: 24,
    total_completed: 9,
    completion_rate_pct: 58,
    avg_risk_score: 5.9,
    avg_signal_score: 6.1,
    band_high: 6,
    band_medium: 5,
    band_low: 3,
  },
  {
    campaign_id: 'demo-1',
    campaign_name: 'Demo campaign',
    scan_type: 'exit',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2025-09-22T09:00:00Z',
    total_invited: 80,
    total_completed: 12,
    completion_rate_pct: 13,
    avg_risk_score: 4.6,
    avg_signal_score: 4.8,
    band_high: 2,
    band_medium: 6,
    band_low: 3,
  },
]

describe('dashboard home UX guardrails', () => {
  it('keeps the overview route focused on first-read guidance and live state truth', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const launchControlSource = readFileSync(
      new URL('../../../components/dashboard/customer-launch-control.tsx', import.meta.url),
      'utf8',
    )

    expect(pageSource).toContain('Overzicht')
    expect(pageSource).toContain('CustomerLaunchControl')
    expect(pageSource).toContain('SignalStatCard')
    expect(pageSource).toContain('DashboardTabs tabs={portfolioTabs}')
    expect(pageSource).toContain('Klaar voor bespreking')
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
    expect(source).toContain('Nog geen duiding')
    expect(source).toContain('Geen live uitvoersignalen meer')
    expect(source).not.toContain('Boardroom-ready')
    expect(source).not.toContain('Open de preview-adoptie van het Action Center voor ExitScan')
  })

  it('shows hr bridge status without turning overview into a route-open screen', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Beoordeel opvolging')
    expect(source).toContain('Actieve opvolging')
    expect(source).toContain('lifecycle_stage')
    expect(source).toContain('canOpenActionCenterRoute')
    expect(source).toContain('first_management_use_confirmed_at')
    expect(source).toContain('leadCampaign.campaign_id')
    expect(source).not.toContain('routeEntryStage: null')
    expect(source).not.toContain('Open Action Center')
    expect(source).not.toContain("href={isAdmin ? '/beheer' : '/action-center'}")
    expect(source).not.toContain('Open in Action Center</button>')
  })

  it('allows the seeded HR demo campaign to override the default overview focus route', () => {
    const selected = selectPrimaryOverviewCampaign({
      campaigns,
      hrDemoCampaignId: 'demo-1',
      primaryFirstNextStepCampaign: campaigns[0],
      primaryGuideCampaign: campaigns[0],
    })

    expect(selected?.campaign_id).toBe('demo-1')
  })

  it('falls back to the default overview priority when the artifact campaign is missing', () => {
    const selected = selectPrimaryOverviewCampaign({
      campaigns,
      hrDemoCampaignId: 'missing-demo',
      primaryFirstNextStepCampaign: campaigns[0],
      primaryGuideCampaign: campaigns[1],
    })

    expect(selected?.campaign_id).toBe('guide-1')
  })
})
