import { describe, expect, it } from 'vitest'
import { buildHrReportDownloadRows } from './report-library'
import type { CampaignStats } from '@/lib/types'

const campaigns: CampaignStats[] = [
  {
    campaign_id: 'culture-1',
    campaign_name: 'Loep Cultuurbeeld 2026',
    scan_type: 'culture_assessment',
    organization_id: 'org-1',
    is_active: false,
    created_at: '2025-10-14T09:00:00Z',
    total_invited: 220,
    total_completed: 46,
    completion_rate_pct: 21,
    avg_risk_score: 6.7,
    avg_signal_score: 6.7,
    band_high: 16,
    band_medium: 18,
    band_low: 12,
  },
  {
    campaign_id: 'culture-open-1',
    campaign_name: 'Loep Cultuurbeeld 2027',
    scan_type: 'culture_assessment',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2025-10-15T09:00:00Z',
    total_invited: 240,
    total_completed: 52,
    completion_rate_pct: 22,
    avg_risk_score: 6.9,
    avg_signal_score: 6.9,
    band_high: 20,
    band_medium: 19,
    band_low: 13,
  },
  {
    campaign_id: 'exit-1',
    campaign_name: 'ExitScan Ops — Q3',
    scan_type: 'exit',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2025-10-12T09:00:00Z',
    total_invited: 24,
    total_completed: 14,
    completion_rate_pct: 58,
    avg_risk_score: 5.9,
    avg_signal_score: 6.1,
    band_high: 6,
    band_medium: 5,
    band_low: 3,
  },
  {
    campaign_id: 'pulse-1',
    campaign_name: 'Pulse week 36-38',
    scan_type: 'pulse',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2025-09-22T09:00:00Z',
    total_invited: 80,
    total_completed: 11,
    completion_rate_pct: 13,
    avg_risk_score: 4.6,
    avg_signal_score: 4.8,
    band_high: 2,
    band_medium: 6,
    band_low: 3,
  },
  {
    campaign_id: 'onboarding-1',
    campaign_name: 'Onboarding cohort sep 25',
    scan_type: 'onboarding',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2025-10-01T09:00:00Z',
    total_invited: 18,
    total_completed: 7,
    completion_rate_pct: 39,
    avg_risk_score: 5.1,
    avg_signal_score: 5.1,
    band_high: 2,
    band_medium: 3,
    band_low: 2,
  },
  {
    campaign_id: 'tiny-1',
    campaign_name: 'Nog te klein',
    scan_type: 'retention',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2025-10-10T09:00:00Z',
    total_invited: 40,
    total_completed: 4,
    completion_rate_pct: 10,
    avg_risk_score: 5.2,
    avg_signal_score: 5.2,
    band_high: 1,
    band_medium: 2,
    band_low: 1,
  },
]

describe('report library', () => {
  it('can derive unavailable report rows with compact factual reasons', () => {
    const model = buildHrReportDownloadRows(campaigns)

    expect(model.availableRows.map((row) => row.campaignId)).toEqual(['exit-1', 'onboarding-1', 'pulse-1'])
    expect(model.unavailableRows.map((row) => row.campaignId)).toEqual(['tiny-1'])
    expect(model.unavailableRows[0]).toMatchObject({
      status: 'Nog onvoldoende respons',
      isAvailable: false,
    })
  })
})
