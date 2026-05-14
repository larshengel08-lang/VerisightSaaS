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
  it('renders the overview route as a compact cockpit list with visible multi-action controls', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(pageSource).toContain('Dashboard overview')
    expect(pageSource).toContain('Cockpit')
    expect(pageSource).toContain('Open scans, download rapporten en beheer instellingen vanuit een overzicht.')
    expect(pageSource).toContain('PdfDownloadButton')
    expect(pageSource).toContain('primaryAction')
    expect(pageSource).toContain('secondaryActions')
    expect(pageSource).toContain('CockpitActionButton')
    expect(pageSource).not.toContain('ACTIE NODIG')
    expect(pageSource).not.toContain('BIJNA KLAAR')
    expect(pageSource).not.toContain('LIVE EN LEESBAAR')
    expect(pageSource).not.toContain('GEBLOKKEERD / NIET GESTART')
    expect(pageSource).not.toContain('Nu eerst')
    expect(pageSource).not.toContain('Geblokkeerd / niet gestart')
    expect(pageSource).not.toContain('Recente afgeronde routes')
    expect(pageSource).not.toContain('WAAROM')
    expect(pageSource).not.toContain('VOLGENDE STAP')
  })

  it('drops the old bucket-first overview IA and keeps one canonical scan list', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildCockpitIndexRows')
    expect(source).toContain('buildCockpitSummary')
    expect(source).not.toContain('buildTriageItems')
    expect(source).not.toContain('buildBlockedItems')
    expect(source).not.toContain('buildRecentClosedItems')
    expect(source).not.toContain('TriageRouteCard')
    expect(source).not.toContain('BlockerRouteRow')
    expect(source).not.toContain('ClosedRouteRow')
  })

  it('keeps access boundaries and route scope intact on overview while demoting status filters', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("if (context.managerOnly) redirect('/action-center')")
    expect(source).toContain("const requestedModuleFilter = normalizeDashboardModuleFilter(")
    expect(source).not.toContain("const requestedStatusFilter = normalizeDashboardStatusFilter(")
    expect(source).toContain('Product')
    expect(source).toContain('FilterPill')
    expect(source).not.toContain('Status')
    expect(source).not.toContain('Geen routes met deze status.')
    expect(source).not.toContain('Accepteren')
    expect(source).not.toContain('Afwijzen')
    expect(source).not.toContain('Toewijzen')
    expect(source).not.toContain('Reviewmoment')
  })

  it('does not leak helper exports from the Next.js page module', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('export function getCtaHrefForState')
  })

  it('keeps the cockpit summary compact instead of score-heavy route cards', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('<SummaryCard label="Scans"')
    expect(source).toContain('<SummaryCard label="Resultaten"')
    expect(source).toContain('<SummaryCard label="PDF"')
    expect(source).toContain('<SummaryCard label="Aandacht"')
    expect(source).not.toContain('getCampaignAverageSignalScore')
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
