import { describe, expect, it } from 'vitest'
import { buildReportLibraryEntries, filterReportLibraryEntries } from './report-library'
import type { CampaignStats } from '@/lib/types'

const campaigns: CampaignStats[] = [
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
  it('builds only report-ready entries and marks one featured management report', () => {
    const model = buildReportLibraryEntries(campaigns)

    expect(model.entries.map((entry) => entry.campaignId)).toEqual(['exit-1', 'onboarding-1', 'pulse-1'])
    expect(model.featured).toMatchObject({
      campaignId: 'exit-1',
      scanType: 'exit',
    })
    expect(model.entries.find((entry) => entry.campaignId === 'exit-1')?.recommended).toBe(true)
  })

  it('maps management, module and cohort categories in a bounded way', () => {
    const model = buildReportLibraryEntries(campaigns)

    expect(model.entries.find((entry) => entry.campaignId === 'exit-1')?.category).toBe('management')
    expect(model.entries.find((entry) => entry.campaignId === 'pulse-1')?.category).toBe('module')
    expect(model.entries.find((entry) => entry.campaignId === 'onboarding-1')?.category).toBe('cohort')
  })

  it('keeps report-ready entries at attention until reports know real follow-up truth', () => {
    const model = buildReportLibraryEntries(campaigns)

    expect(model.entries.find((entry) => entry.campaignId === 'exit-1')?.bridgeState).toBe('attention')
  })

  it('filters cards per category without inventing an all-in-one export layer', () => {
    const model = buildReportLibraryEntries(campaigns)

    expect(filterReportLibraryEntries(model.entries, 'all')).toHaveLength(3)
    expect(filterReportLibraryEntries(model.entries, 'management').map((entry) => entry.campaignId)).toEqual(['exit-1'])
    expect(filterReportLibraryEntries(model.entries, 'module').map((entry) => entry.campaignId)).toEqual(['pulse-1'])
    expect(filterReportLibraryEntries(model.entries, 'cohort').map((entry) => entry.campaignId)).toEqual(['onboarding-1'])
  })
})

