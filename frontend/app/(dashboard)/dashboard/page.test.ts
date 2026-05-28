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
  it('renders the overview route as a cockpit with explicit triage buckets and sections', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(pageSource).toContain('Goedemorgen,')
    expect(pageSource).toContain('Overzicht')
    expect(pageSource).toContain('Cockpit')
    expect(pageSource).toContain('Primair signaal')
    expect(pageSource).toContain('Aandacht nodig')
    expect(pageSource).toContain('Alles loopt')
    expect(pageSource).toContain('ACTIE NODIG')
    expect(pageSource).toContain('BIJNA KLAAR')
    expect(pageSource).toContain('LIVE EN LEESBAAR')
    expect(pageSource).toContain('GEBLOKKEERD / NIET GESTART')
    expect(pageSource).toContain('Nu eerst')
    expect(pageSource).toContain('Geblokkeerd / niet gestart')
    expect(pageSource).toContain('Recente afgeronde routes')
    expect(pageSource).toContain('WAT VRAAGT NU AANDACHT')
    expect(pageSource).toContain('VOLGENDE STAP')
  })

  it('drops the old flat overview IA and keeps product boundaries sharp', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('Ook aandacht')
    expect(source).not.toContain('Actieve routes')
    expect(source).not.toContain('Wat nu leesbaar is')
    expect(source).not.toContain('Wat blokkeert')
    expect(source).not.toContain('OverviewLeadCard')
    expect(source).not.toContain('Overige actieve routes')
    expect(source).not.toContain('Portfolio samenvatting')
    expect(source).not.toContain('Aanbevolen focus')
    expect(source).not.toContain('factor-breakdown')
    expect(source).not.toContain('setupwizard')
  })

  it('keeps access boundaries and route scope intact on overview', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("if (context.managerOnly) redirect('/action-center')")
    expect(source).toContain("['culture_assessment', 'exit', 'retention'].includes(entry.campaign.scan_type)")
    expect(source).toContain("const requestedModuleFilter = normalizeDashboardModuleFilter(")
    expect(source).toContain("const requestedStatusFilter = normalizeDashboardStatusFilter(")
    expect(source).toContain("if (state === 'ready_to_launch' || state === 'running' || state === 'sparse') return 'action_needed'")
    expect(source).toContain(".filter((entry) => entry.state === 'setup')")
    expect(source).toContain('Geen routes met deze status.')
    expect(source).not.toContain('Accepteren')
    expect(source).not.toContain('Afwijzen')
    expect(source).not.toContain('Toewijzen')
    expect(source).not.toContain('Reviewmoment')
  })

  it('sends setup and in-opbouw cockpit routes to campaign-specific routebeheer instead of campaign detail', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("entry.state === 'setup' || entry.state === 'ready_to_launch' || entry.state === 'running'")
    expect(source).toContain("`/campaigns/${entry.campaign.campaign_id}/beheer`")
  })

  it('does not leak helper exports from the Next.js page module', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('export function getCtaHrefForState')
  })

  it('promotes the primary route signal in the visible overview card metrics', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('primaryMetricLabel: primaryMetric.label')
    expect(source).toContain('primaryMetricValue: primaryMetric.value')
    expect(source).toContain('formatSignalScore')
    expect(source).toContain('Open resultaten')
    expect(source).toContain('Bekijk voortgang')
    expect(source).toContain('Open instellingen')
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
