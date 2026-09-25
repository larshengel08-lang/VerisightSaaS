import { describe, expect, it } from 'vitest'
import { buildCampaignListItems, pickMainCampaign } from './campaign-list'
import type { CampaignStatusContext } from './campaign-status'
import type { CampaignStats } from '@/lib/types'

function stats(overrides: Partial<CampaignStats>): CampaignStats {
  return {
    campaign_id: 'x',
    campaign_name: 'Meting',
    scan_type: 'retention',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2026-09-01T09:00:00Z',
    closed_at: null,
    closes_at: null,
    total_invited: 0,
    total_completed: 0,
    completion_rate_pct: 0,
    avg_risk_score: null,
    band_high: 0,
    band_medium: 0,
    band_low: 0,
    ...overrides,
  }
}

// De testklant: A gesloten (juli), B lopend (sept, nieuwste), C in te richten.
const A = stats({ campaign_id: 'a', campaign_name: 'TEST Loep Behoud - gesloten met rapport', is_active: false, created_at: '2026-07-15T09:00:00Z', closed_at: '2026-08-27T09:00:00Z', total_completed: 18 })
const B = stats({ campaign_id: 'b', campaign_name: 'TEST Loep Behoud - lopend', created_at: '2026-09-13T09:00:00Z', total_completed: 6 })
const C = stats({ campaign_id: 'c', campaign_name: 'TEST Loep Vertrek - nog in te richten', scan_type: 'exit', created_at: '2026-09-10T09:00:00Z' })

const context: CampaignStatusContext = {
  deliveryByCampaign: new Map([
    ['b', { launchConfirmedAt: '2026-09-13T09:00:00Z', launchDate: '2026-09-13', invitedCount: 30, reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 } }],
    ['c', { launchConfirmedAt: null, launchDate: null, invitedCount: null, reminderConfig: null }],
  ]),
  lastReminderEventAtByCampaign: new Map(),
  dataPurgedAtByCampaign: new Map(),
  today: '2026-09-16',
}

describe('pickMainCampaign (spec 2026-09-16 par. 6.1)', () => {
  it('kiest de nieuwste actieve meting, ongeacht de volgorde van de invoer', () => {
    expect(pickMainCampaign([A, C, B])?.campaign_id).toBe('b')
    expect(pickMainCampaign([B, C, A])?.campaign_id).toBe('b')
  })

  it('kiest de nieuwste als er geen actieve is', () => {
    const closedB = { ...B, is_active: false }
    const closedC = { ...C, is_active: false }
    expect(pickMainCampaign([A, closedC, closedB])?.campaign_id).toBe('b')
  })

  it('geeft null zonder metingen', () => {
    expect(pickMainCampaign([])).toBeNull()
  })
})

describe('buildCampaignListItems', () => {
  it('geeft elke meting een naam, scan, statuslabel en link, nieuwste eerst, en markeert de hoofdkaart', () => {
    const items = buildCampaignListItems([A, C, B], context, 'b')
    expect(items.map((i) => i.campaignId)).toEqual(['b', 'c', 'a'])
    expect(items[0]).toEqual({
      campaignId: 'b',
      name: 'TEST Loep Behoud - lopend',
      scanLabel: 'Loep Behoud',
      statusKey: 'running',
      statusLabel: 'Loopt',
      href: '/campaigns/b',
      isMain: true,
    })
    expect(items[1]).toMatchObject({ name: 'TEST Loep Vertrek - nog in te richten', scanLabel: 'Loep Vertrek', statusLabel: 'Nog in te richten', isMain: false })
    expect(items[2]).toMatchObject({ statusKey: 'report_ready', statusLabel: 'Rapport beschikbaar', href: '/campaigns/a' })
  })

  it('noemt bij een opgeschoonde meting de datum, niet "Gesloten, geen rapport" (Deel C)', () => {
    // Na de opschoning geeft campaign_stats 0 antwoorden voor A.
    const purgedA = { ...A, total_completed: 0 }
    const items = buildCampaignListItems([purgedA], { ...context, dataPurgedAtByCampaign: new Map([['a', '2028-06-16T03:00:00Z']]) }, null)
    expect(items[0]).toMatchObject({ statusKey: 'data_purged', statusLabel: 'Gegevens verwijderd op 16 juni 2028' })
  })

  it('bevat geen em- of en-dashes in labels', () => {
    for (const item of buildCampaignListItems([A, B, C], context, null)) {
      expect(item.statusLabel).not.toMatch(/[—–]/)
      expect(item.scanLabel).not.toMatch(/[—–]/)
    }
  })
})
