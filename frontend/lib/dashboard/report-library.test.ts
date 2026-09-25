import { describe, expect, it } from 'vitest'
import { buildHrReportDownloadRows, buildReportOverviewRows } from './report-library'
import type { CampaignStats } from '@/lib/types'
import type { CampaignStatusContext } from './campaign-status'

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
    closed_at: null,
    closes_at: null,
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
    closed_at: null,
    closes_at: null,
    band_low: 13,
  },
  {
    campaign_id: 'exit-1',
    campaign_name: 'Loep Vertrek Ops — Q3',
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
    closed_at: null,
    closes_at: null,
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
    closed_at: null,
    closes_at: null,
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
    closed_at: null,
    closes_at: null,
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
    closed_at: null,
    closes_at: null,
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


describe('buildReportOverviewRows (spec 2026-09-11 par. 4.3 en 2026-09-16 par. 6.2)', () => {
  function campaign(overrides: Partial<CampaignStats> = {}): CampaignStats {
    return {
      campaign_id: 'camp-1',
      campaign_name: 'Loep Behoud Voorjaar 2026',
      organization_id: 'org-1',
      scan_type: 'retention',
      is_active: false,
      total_invited: 0,
      total_completed: 12,
      completion_rate_pct: 0,
      created_at: '2026-04-02T10:00:00Z',
      closed_at: '2026-04-30T10:00:00Z',
      closes_at: null,
      ...overrides,
    } as CampaignStats
  }

  const launched = {
    launchConfirmedAt: '2026-04-02T10:00:00Z',
    launchDate: '2026-04-02',
    invitedCount: 30,
    reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
  }

  function context(overrides: Partial<CampaignStatusContext> = {}): CampaignStatusContext {
    return {
      deliveryByCampaign: new Map([['camp-1', launched]]),
      lastReminderEventAtByCampaign: new Map(),
      dataPurgedAtByCampaign: new Map(),
      today: '2026-04-05',
      ...overrides,
    }
  }

  it('geeft een gesloten meting met tien of meer ingevuld vrij, met het label uit de statusvocabulaire', () => {
    const [row] = buildReportOverviewRows([campaign()], context())
    expect(row.isAvailable).toBe(true)
    expect(row.statusKey).toBe('report_ready')
    expect(row.status).toBe('Rapport beschikbaar')
    expect(row.periodLabel).toBe('Q2 2026')
  })

  it('geeft een lopende meting nooit vrij, ook niet met veel respons', () => {
    const [row] = buildReportOverviewRows([campaign({ is_active: true, total_completed: 40 })], context())
    expect(row.isAvailable).toBe(false)
    // 40 ingevuld boven de drempel: de kaart zegt "sluiten mag", de lijst zegt "Actie nodig".
    expect(row.status).toBe('Actie nodig')
  })

  it('noemt een gelanceerde meting onder de drempel "Loopt", en een niet-gelanceerde "Nog in te richten"', () => {
    const [running] = buildReportOverviewRows([campaign({ is_active: true, total_completed: 3 })], context())
    expect(running.status).toBe('Loopt')
    const [setup] = buildReportOverviewRows(
      [campaign({ is_active: true, total_completed: 0 })],
      context({ deliveryByCampaign: new Map() }),
    )
    expect(setup.status).toBe('Nog in te richten')
    expect(setup.status).not.toBe('Meting loopt')
  })

  it('noemt bij een gesloten meting onder de drempel het aantal en de drempel', () => {
    const [row] = buildReportOverviewRows([campaign({ total_completed: 7 })], context())
    expect(row.isAvailable).toBe(false)
    expect(row.statusKey).toBe('closed_no_report')
    expect(row.status).toContain('7')
    expect(row.status).toContain('10')
  })

  it('gebruikt invited_count uit het delivery record als noemer, niet de gestarte respondenten', () => {
    const [row] = buildReportOverviewRows([campaign({ total_invited: 12 })], context())
    expect(row.responseBasis).toBe('12 van 30 ingevuld (40%)')
  })

  it('valt terug op respondentrijen als die er méér zijn dan invited_count', () => {
    const [row] = buildReportOverviewRows([campaign({ total_invited: 35 })], context())
    expect(row.responseBasis).toBe('12 van 35 ingevuld (34%)')
  })

  it('verzint geen noemer: zonder invited_count en zonder rijen staat er een reden', () => {
    const [row] = buildReportOverviewRows([campaign()], context({ deliveryByCampaign: new Map() }))
    expect(row.responseBasis).toBe('12 ingevuld, aantal uitgenodigden niet ingevuld')
  })

  it('noemt bij een opgeschoonde meting de reden, nooit "te weinig" of "0 van 30"', () => {
    // Na de opschoning geeft campaign_stats 0 antwoorden.
    const [row] = buildReportOverviewRows(
      [campaign({ total_completed: 0, total_invited: 0 })],
      context({ dataPurgedAtByCampaign: new Map([['camp-1', '2028-06-16T03:00:00Z']]) }),
    )
    expect(row.statusKey).toBe('data_purged')
    expect(row.isAvailable).toBe(false)
    expect(row.purgedAt).toBe('2028-06-16T03:00:00Z')
    expect(row.status).toBe(
      'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.',
    )
    expect(row.responseBasis).toBe('Gegevens verwijderd')
    expect(row.status).not.toContain('Minimaal')
  })

  it('laat een niet-opgeschoonde meting zonder purgedAt', () => {
    const [row] = buildReportOverviewRows([campaign()], context())
    expect(row.purgedAt).toBeNull()
  })

  it('bevat geen em- of en-dashes', () => {
    for (const row of buildReportOverviewRows([campaign(), campaign({ campaign_id: 'x', is_active: true })], context())) {
      expect(row.status).not.toMatch(/[—–]/)
      expect(row.responseBasis).not.toMatch(/[—–]/)
    }
  })
})
