import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { selectLeadOverviewCampaign, selectPrimaryOverviewCampaign } from '@/lib/dashboard/overview-focus'
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
  it('keeps the overview route focused on light HR-regie instead of managementinterpretatie', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(pageSource).toContain('Overzicht')
    expect(pageSource).toContain('SignalStatCard')
    expect(pageSource).toContain('DashboardTabs tabs={portfolioTabs}')
    expect(pageSource).toContain('Portfolio samenvatting')
    expect(pageSource).toContain('Wat nu leesbaar is')
    expect(pageSource).toContain('Wat blokkeert')
    expect(pageSource).toContain('Opvolging preview')
    expect(pageSource).toContain('Recente output')
    expect(pageSource).toContain('Klaar voor bespreking')
    expect(pageSource).toContain('In opbouw')
    expect(pageSource).toContain('Setup / launch')
    expect(pageSource).toContain('Afgerond')
    expect(pageSource).toContain('Deels zichtbaar')
    expect(pageSource).toContain('Indicatief, nog dun')
    expect(pageSource).toContain('Launch klaar')
    expect(pageSource).toContain('Rapport eerst')
    expect(pageSource).not.toContain('CustomerLaunchControl')
    expect(pageSource).not.toContain('Aanbevolen focus')
    expect(pageSource).not.toContain('Wat nu het managementgesprek opent.')
    expect(pageSource).not.toContain('TeamScan')
  })

  it('keeps overview language compact and bounded instead of overclaiming', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Hier zie je wat actief is, wat leesbaar is, wat blokkeert en waar opvolging open staat.')
    expect(source).toContain('Alleen de concrete randvoorwaarden die nog voorkomen dat een route leesbaar of volledig live wordt.')
    expect(source).toContain('Laatste rapporten en samenvattingen, compact terugvindbaar als utilitylaag.')
    expect(source).not.toContain('Boardroom-ready')
    expect(source).not.toContain('Open de preview-adoptie van het Action Center voor ExitScan')
    expect(source).not.toContain('Welke route nu het eerst logisch is.')
  })

  it('keeps opvolging as a light preview instead of a route recommendation block', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Open Action Center')
    expect(source).toContain('Open prioriteit')
    expect(source).toContain('Reviewmoment')
    expect(source).toContain('lifecycle_stage')
    expect(source).toContain('canOpenActionCenterRoute')
    expect(source).toContain('first_management_use_confirmed_at')
    expect(source).toContain('leadReadableCampaign.campaign_id')
    expect(source).not.toContain('Beoordeel opvolging')
    expect(source).not.toContain('Actieve opvolging')
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

  it('keeps the demo-driven overview campaign as the lead route when it exists', () => {
    const selected = selectLeadOverviewCampaign({
      primaryOverviewCampaign: campaigns[1],
      primaryGuideCampaign: campaigns[0],
    })

    expect(selected?.campaign_id).toBe('demo-1')
  })
})
