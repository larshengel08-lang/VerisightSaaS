import { describe, expect, it } from 'vitest'
import type { CampaignStats } from '@/lib/types'
import {
  buildCockpitIndexRows,
  buildCockpitSummary,
  type CockpitRow,
} from './cockpit-index'

function buildCampaign(overrides: Partial<CampaignStats>): CampaignStats {
  return {
    campaign_id: overrides.campaign_id ?? 'campaign-1',
    campaign_name: overrides.campaign_name ?? 'RetentieScan voorjaar',
    scan_type: overrides.scan_type ?? 'retention',
    organization_id: overrides.organization_id ?? 'org-1',
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at ?? '2026-04-10T09:00:00Z',
    total_invited: overrides.total_invited ?? 40,
    total_completed: overrides.total_completed ?? 16,
    completion_rate_pct: overrides.completion_rate_pct ?? 40,
    avg_risk_score: overrides.avg_risk_score ?? 6.4,
    avg_signal_score: overrides.avg_signal_score ?? 6.4,
    band_high: overrides.band_high ?? 5,
    band_medium: overrides.band_medium ?? 8,
    band_low: overrides.band_low ?? 3,
  }
}

describe('cockpit row mapping', () => {
  it('shows each scan exactly once with results, pdf and instellingen when all are available', () => {
    const rows = buildCockpitIndexRows({
      campaigns: [
        buildCampaign({
          campaign_id: 'full-1',
          scan_type: 'exit',
          total_invited: 55,
          total_completed: 19,
          completion_rate_pct: 35,
        }),
      ],
      invitesNotSentByCampaign: new Map([['full-1', 0]]),
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.primaryAction.label).toBe('Open resultaten')
    expect(rows[0]?.secondaryActions.map((action) => action.label)).toEqual(['Download PDF', 'Instellingen'])
    expect(rows[0]?.factualLine).toBe('Resultaten beschikbaar')
  })

  it('makes instellingen primary for setup and sparse routes', () => {
    const rows = buildCockpitIndexRows({
      campaigns: [
        buildCampaign({
          campaign_id: 'setup-1',
          total_invited: 0,
          total_completed: 0,
          completion_rate_pct: 0,
          avg_risk_score: null,
          avg_signal_score: null,
        }),
        buildCampaign({
          campaign_id: 'sparse-1',
          total_invited: 50,
          total_completed: 3,
          completion_rate_pct: 6,
          avg_risk_score: null,
          avg_signal_score: null,
        }),
      ],
      invitesNotSentByCampaign: new Map([
        ['setup-1', 0],
        ['sparse-1', 0],
      ]),
    })

    expect(rows.map((row) => row.primaryAction.label)).toEqual(['Instellingen', 'Instellingen'])
    expect(rows.map((row) => row.factualLine)).toEqual([
      'Doelgroep of livegang ontbreekt nog',
      'Nog onvoldoende respons',
    ])
  })

  it('sorts open resultaten rows ahead of pdf-only and instellingen-first rows', () => {
    const rows = buildCockpitIndexRows({
      campaigns: [
        buildCampaign({
          campaign_id: 'setup-1',
          total_invited: 0,
          total_completed: 0,
          completion_rate_pct: 0,
          avg_risk_score: null,
          avg_signal_score: null,
        }),
        buildCampaign({
          campaign_id: 'closed-1',
          is_active: false,
          total_invited: 45,
          total_completed: 18,
          completion_rate_pct: 40,
          created_at: '2026-03-01T09:00:00Z',
        }),
        buildCampaign({
          campaign_id: 'full-1',
          total_invited: 55,
          total_completed: 19,
          completion_rate_pct: 35,
          created_at: '2026-04-10T09:00:00Z',
        }),
      ],
      invitesNotSentByCampaign: new Map([
        ['setup-1', 0],
        ['closed-1', 0],
        ['full-1', 0],
      ]),
    })

    expect(rows.map((row) => row.campaign.campaign_id)).toEqual(['full-1', 'closed-1', 'setup-1'])
  })

  it('keeps partial scans with report visibility in the same results bucket and sorts them deterministically by date', () => {
    const rows = buildCockpitIndexRows({
      campaigns: [
        buildCampaign({
          campaign_id: 'partial-1',
          scan_type: 'pulse',
          total_invited: 48,
          total_completed: 7,
          completion_rate_pct: 15,
          avg_risk_score: null,
          avg_signal_score: null,
          created_at: '2026-04-10T09:00:00Z',
        }),
        buildCampaign({
          campaign_id: 'full-1',
          scan_type: 'exit',
          total_invited: 55,
          total_completed: 19,
          completion_rate_pct: 35,
          created_at: '2026-04-09T09:00:00Z',
        }),
      ],
      invitesNotSentByCampaign: new Map([
        ['partial-1', 0],
        ['full-1', 0],
      ]),
    })

    expect(rows.map((row) => row.campaign.campaign_id)).toEqual(['partial-1', 'full-1'])
    expect(rows[0]?.secondaryActions.map((action) => action.label)).toContain('Download PDF')
    expect(rows[1]?.secondaryActions.map((action) => action.label)).toContain('Download PDF')
    expect(rows[0]?.factualLine).toBe('Eerste resultaten beschikbaar')
  })

  it('builds the compact utility summary from row availability', () => {
    const rows: CockpitRow[] = [
      {
        campaign: buildCampaign({ campaign_id: 'full-1' }),
        productLabel: 'RetentieScan',
        periodLabel: 'apr 2026',
        responseValue: '40%',
        statusLabel: 'Leesbaar',
        factualLine: 'Resultaten beschikbaar',
        primaryAction: { kind: 'results', label: 'Open resultaten', href: '/campaigns/full-1' },
        secondaryActions: [{ kind: 'pdf', label: 'Download PDF', href: '/api/campaigns/full-1/report' }],
      },
      {
        campaign: buildCampaign({
          campaign_id: 'setup-1',
          total_invited: 0,
          total_completed: 0,
          completion_rate_pct: 0,
          avg_risk_score: null,
          avg_signal_score: null,
        }),
        productLabel: 'ExitScan',
        periodLabel: 'apr 2026',
        responseValue: '0%',
        statusLabel: 'Nog niet live',
        factualLine: 'Doelgroep of livegang ontbreekt nog',
        primaryAction: { kind: 'settings', label: 'Instellingen', href: '/campaigns/setup-1/beheer' },
        secondaryActions: [],
      },
    ]

    expect(buildCockpitSummary(rows)).toEqual({
      total: 2,
      resultsAvailable: 1,
      pdfAvailable: 1,
      attentionNeeded: 1,
    })
  })
})
