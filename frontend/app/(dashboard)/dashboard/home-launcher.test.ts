import { describe, expect, it } from 'vitest'
import type { CampaignStats } from '@/lib/types'
import {
  buildDashboardHomeModel,
  getCampaignHomeBucket,
  type DashboardHomeBucket,
} from './home-launcher'

function buildCampaign(overrides: Partial<CampaignStats>): CampaignStats {
  return {
    campaign_id: overrides.campaign_id ?? 'campaign-1',
    campaign_name: overrides.campaign_name ?? 'Q1 ExitScan',
    scan_type: overrides.scan_type ?? 'exit',
    organization_id: overrides.organization_id ?? 'org-1',
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at ?? '2026-04-10T09:00:00Z',
    total_invited: overrides.total_invited ?? 40,
    total_completed: overrides.total_completed ?? 16,
    completion_rate_pct: overrides.completion_rate_pct ?? 40,
    avg_risk_score: overrides.avg_risk_score ?? 6.4,
    avg_signal_score: overrides.avg_signal_score ?? overrides.avg_risk_score ?? 6.4,
    band_high: overrides.band_high ?? 5,
    band_medium: overrides.band_medium ?? 8,
    band_low: overrides.band_low ?? 3,
  }
}

describe('dashboard home launcher buckets', () => {
  it('groups campaigns into open now, building, closed and archive states', () => {
    const campaigns = [
      buildCampaign({
        campaign_id: 'ready-1',
        campaign_name: 'ExitScan voorjaar',
        scan_type: 'exit',
        is_active: true,
        total_invited: 55,
        total_completed: 18,
        completion_rate_pct: 33,
        created_at: '2026-04-12T10:00:00Z',
      }),
      buildCampaign({
        campaign_id: 'building-1',
        campaign_name: 'RetentieScan april',
        scan_type: 'retention',
        is_active: true,
        total_invited: 60,
        total_completed: 6,
        completion_rate_pct: 10,
        avg_risk_score: null,
        avg_signal_score: null,
        created_at: '2026-04-13T10:00:00Z',
      }),
      buildCampaign({
        campaign_id: 'closed-current',
        campaign_name: 'ExitScan Q4',
        scan_type: 'exit',
        is_active: false,
        total_invited: 52,
        total_completed: 24,
        completion_rate_pct: 46,
        created_at: '2026-03-01T10:00:00Z',
      }),
      buildCampaign({
        campaign_id: 'closed-archive',
        campaign_name: 'ExitScan Q3',
        scan_type: 'exit',
        is_active: false,
        total_invited: 48,
        total_completed: 20,
        completion_rate_pct: 41,
        created_at: '2025-11-01T10:00:00Z',
      }),
    ]

    expect(getCampaignHomeBucket(campaigns[0]!, campaigns)).toBe('open_now')
    expect(getCampaignHomeBucket(campaigns[1]!, campaigns)).toBe('building')
    expect(getCampaignHomeBucket(campaigns[2]!, campaigns)).toBe('closed')
    expect(getCampaignHomeBucket(campaigns[3]!, campaigns)).toBe('archive')
  })
})

describe('dashboard home recommendation logic', () => {
  it('surfaces one clearly recommended campaign and keeps dashboard first when an active campaign is management-ready', () => {
    const campaigns = [
      buildCampaign({
        campaign_id: 'ready-1',
        campaign_name: 'ExitScan voorjaar',
        scan_type: 'exit',
        total_completed: 18,
        completion_rate_pct: 33,
        created_at: '2026-04-12T10:00:00Z',
      }),
      buildCampaign({
        campaign_id: 'ready-2',
        campaign_name: 'RetentieScan april',
        scan_type: 'retention',
        total_completed: 14,
        completion_rate_pct: 28,
        created_at: '2026-04-14T10:00:00Z',
      }),
    ]

    const model = buildDashboardHomeModel({ campaigns, isAdmin: false })

    expect(model.recommendation).not.toBeNull()
    expect(model.recommendation?.campaign.campaign_id).toBe('ready-1')
    expect(model.recommendation?.primaryAction.kind).toBe('dashboard')
    expect(model.recommendation?.secondaryAction?.kind).toBe('pdf')
    expect(model.recommendation?.reason).toContain('nu het stevigste leesniveau')
  })

  it('falls back to a closed report-ready campaign and prioritizes pdf when no active campaign is ready', () => {
    const campaigns = [
      buildCampaign({
        campaign_id: 'building-1',
        campaign_name: 'RetentieScan mei',
        scan_type: 'retention',
        is_active: true,
        total_completed: 4,
        completion_rate_pct: 7,
        avg_risk_score: null,
        avg_signal_score: null,
        created_at: '2026-04-14T10:00:00Z',
      }),
      buildCampaign({
        campaign_id: 'closed-current',
        campaign_name: 'ExitScan Q4',
        scan_type: 'exit',
        is_active: false,
        total_completed: 21,
        completion_rate_pct: 44,
        created_at: '2026-03-01T10:00:00Z',
      }),
    ]

    const model = buildDashboardHomeModel({ campaigns, isAdmin: false })

    expect(model.recommendation?.campaign.campaign_id).toBe('closed-current')
    expect(model.recommendation?.primaryAction.kind).toBe('pdf')
    expect(model.recommendation?.secondaryAction?.kind).toBe('dashboard')
    expect(model.recommendation?.reason).toContain('rapportklare campagne')
  })
})

describe('dashboard and pdf availability', () => {
  it('keeps pdf unavailable for pulse campaigns and setup campaigns while preserving an explicit reason', () => {
    const pulseCampaign = buildCampaign({
      campaign_id: 'pulse-1',
      scan_type: 'pulse',
      total_completed: 15,
      completion_rate_pct: 38,
    })
    const setupCampaign = buildCampaign({
      campaign_id: 'setup-1',
      campaign_name: 'ExitScan nieuw',
      total_invited: 0,
      total_completed: 0,
      completion_rate_pct: 0,
      avg_risk_score: null,
      avg_signal_score: null,
    })

    const model = buildDashboardHomeModel({ campaigns: [pulseCampaign, setupCampaign], isAdmin: false })
    const pulseCard = model.groups.flatMap((group) => group.campaigns).find((card) => card.campaign.campaign_id === 'pulse-1')
    const setupCard = model.groups.flatMap((group) => group.campaigns).find((card) => card.campaign.campaign_id === 'setup-1')

    expect(pulseCard?.secondaryAction?.available).toBe(false)
    expect(pulseCard?.secondaryAction?.reason).toContain('nog geen formeel PDF-rapport')
    expect(setupCard?.primaryAction.available).toBe(false)
    expect(setupCard?.primaryAction.label).toBe('Wacht op livegang')
    expect(setupCard?.primaryAction.reason).toContain('Nog niet leesbaar')
  })

  it('keeps the dashboard-versus-pdf choice explicit but compact in the recommendation model', () => {
    const model = buildDashboardHomeModel({
      campaigns: [buildCampaign({ campaign_id: 'ready-1' })],
      isAdmin: false,
    })

    expect(model.recommendation?.dashboardChoiceDescription).toBe(
      'Dashboard = interactief lezen, prioriteren en bepalen wat nu eerst aandacht vraagt.',
    )
    expect(model.recommendation?.pdfChoiceDescription).toBe(
      'Rapport (PDF) = delen, bespreken en meenemen als bestuurlijke samenvatting.',
    )
  })
})

describe('dashboard home structure', () => {
  it('keeps support secondary and cards compact', () => {
    const model = buildDashboardHomeModel({
      campaigns: [buildCampaign({ campaign_id: 'ready-1' })],
      isAdmin: false,
    })

    expect(model.sections).toEqual([
      'recommendation',
      'portfolio',
      'support',
    ])
    expect(model.groups[0]?.campaigns[0]?.metrics).toHaveLength(4)
  })

  it('returns deterministic empty and archived states', () => {
    const emptyModel = buildDashboardHomeModel({ campaigns: [], isAdmin: false })
    const archivedModel = buildDashboardHomeModel({
      campaigns: [
        buildCampaign({
          campaign_id: 'closed-new',
          is_active: false,
          created_at: '2026-04-01T09:00:00Z',
        }),
        buildCampaign({
          campaign_id: 'closed-old',
          is_active: false,
          created_at: '2025-12-01T09:00:00Z',
        }),
      ],
      isAdmin: false,
    })

    expect(emptyModel.emptyState).toBe('no_campaigns')
    expect(archivedModel.emptyState).toBe('has_campaigns')
    expect(archivedModel.groups.find((group) => group.bucket === 'archive')?.campaigns.map((campaign) => campaign.campaign.campaign_id)).toEqual([
      'closed-old',
    ])
  })

  it('keeps only supported buckets visible in the configured order', () => {
    const model = buildDashboardHomeModel({
      campaigns: [
        buildCampaign({ campaign_id: 'ready-1' }),
        buildCampaign({
          campaign_id: 'building-1',
          total_completed: 3,
          completion_rate_pct: 8,
          avg_risk_score: null,
          avg_signal_score: null,
        }),
      ],
      isAdmin: false,
    })

    expect(model.groups.map((group) => group.bucket)).toEqual<DashboardHomeBucket[]>([
      'open_now',
      'building',
    ])
  })
})
