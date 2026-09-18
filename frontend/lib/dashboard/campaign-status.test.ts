import { describe, expect, it } from 'vitest'
import { resolveDashboardState, type DashboardStateInput, type DashboardStateKind } from './dashboard-state-resolver'
import { isReportReleaseReady } from '@/lib/response-activation'
import {
  CAMPAIGN_STATUS_LABELS,
  deriveCampaignStatus,
  deriveCampaignStatusFor,
  denominatorFor,
  statusInputFor,
  type CampaignStatusContext,
  type CampaignStatusInput,
  type CampaignStatusKey,
} from './campaign-status'
import type { CampaignStats } from '@/lib/types'

function statusInput(overrides: Partial<CampaignStatusInput> = {}): CampaignStatusInput {
  return {
    isActive: true,
    scanType: 'retention',
    totalCompleted: 6,
    totalInvited: 30,
    launchConfirmedAt: '2026-09-13T09:00:00Z',
    launchDate: '2026-09-13',
    closesAt: '2026-10-04',
    reminderEnabled: true,
    reminderAfterDays: 5,
    reminderHandledAt: null,
    today: '2026-09-16',
    ...overrides,
  }
}

/** Dezelfde situatie als resolverinvoer, zodat beide uit één bron lezen. */
function resolverInput(s: CampaignStatusInput): DashboardStateInput {
  return {
    campaign: {
      id: 'c1',
      name: 'Meting',
      scanType: s.scanType,
      isActive: s.isActive,
      totalInvited: s.totalInvited,
      totalCompleted: s.totalCompleted,
      completionRatePct: s.totalInvited > 0 ? Math.round((s.totalCompleted / s.totalInvited) * 100) : 0,
      closedAt: s.isActive ? null : '2026-09-10T09:00:00Z',
    },
    launchConfirmedAt: s.launchConfirmedAt,
    launchDate: s.launchDate,
    closesAt: s.closesAt,
    reminderConfig: { enabled: s.reminderEnabled, firstReminderAfterDays: s.reminderAfterDays, maxReminderCount: 1 },
    reminderAlreadySentAt: s.reminderHandledAt,
    reminderSkipped: false,
    extensionCount: 0,
    reportReady: isReportReleaseReady(s.totalCompleted, { scanType: s.scanType }),
    today: s.today,
  }
}

const KIND_TO_STATUS: Record<DashboardStateKind, CampaignStatusKey | null> = {
  no_campaign: null,
  setup: 'setup',
  running: 'running',
  action: 'action',
  processing: 'closed_no_report',
  report_ready: 'report_ready',
}

describe('deriveCampaignStatus (spec 2026-09-16 par. 6.1)', () => {
  it('kent precies de vijf labels uit de spec, zonder streepjes', () => {
    expect(CAMPAIGN_STATUS_LABELS).toEqual({
      setup: 'Nog in te richten',
      running: 'Loopt',
      action: 'Actie nodig',
      closed_no_report: 'Gesloten, geen rapport',
      report_ready: 'Rapport beschikbaar',
    })
    for (const label of Object.values(CAMPAIGN_STATUS_LABELS)) expect(label).not.toMatch(/[—–]/)
  })

  const scenarios: Array<[string, Partial<CampaignStatusInput>, CampaignStatusKey]> = [
    ['niet gelanceerd', { launchConfirmedAt: null }, 'setup'],
    ['bevestigd maar zonder noemer', { totalInvited: 0 }, 'setup'],
    ['loopt, vóór de herinneringsdag', {}, 'running'],
    ['herinneringsdag', { today: '2026-09-18' }, 'action'],
    ['herinnering al afgehandeld', { today: '2026-09-18', reminderHandledAt: '2026-09-18T08:00:00Z' }, 'running'],
    ['sluitdatum bereikt', { today: '2026-10-04' }, 'action'],
    ['sluitdatum bereikt, herinnering uit', { today: '2026-10-04', reminderEnabled: false }, 'action'],
    ['genoeg respons, mag sluiten', { totalCompleted: 12 }, 'action'],
    ['gesloten met rapport', { isActive: false, totalCompleted: 14 }, 'report_ready'],
    ['gesloten zonder rapport', { isActive: false, totalCompleted: 7 }, 'closed_no_report'],
    ['culture_assessment gesloten onder de 30', { isActive: false, scanType: 'culture_assessment', totalCompleted: 20 }, 'closed_no_report'],
    ['geen sluitdatum, loopt', { closesAt: null }, 'running'],
    ['herinneringsevent vóór de herinneringsdag telt niet', { today: '2026-09-18', reminderHandledAt: '2026-09-15T08:00:00Z' }, 'action'],
    ['herinnering uit op de herinneringsdag, sluitdatum nog niet bereikt', { today: '2026-09-18', reminderEnabled: false }, 'running'],
    ['sluitdatum als volledige timestamp', { today: '2026-10-04', closesAt: '2026-10-04T00:00:00Z' }, 'action'],
    ['dag vóór een sluitdatum als volledige timestamp', { today: '2026-10-03', closesAt: '2026-10-04T23:00:00Z', reminderEnabled: false }, 'running'],
  ]

  for (const [name, overrides, expected] of scenarios) {
    it(`${name} → ${expected}, en de resolver zegt hetzelfde`, () => {
      const input = statusInput(overrides)
      expect(deriveCampaignStatus(input)).toBe(expected)
      // Pariteit: de lijst mag nooit iets anders zeggen dan de kaart.
      const state = resolveDashboardState(resolverInput(input))
      expect(KIND_TO_STATUS[state.kind]).toBe(expected)
      // 'processing' mapt alleen naar 'closed_no_report' zolang de resolver daar
      // 'insufficient_response' bedoelt. Splitst de drempel ooit (de
      // 'generating'-tak), dan moet deze test falen in plaats van het verschil
      // stil te verbergen.
      if (state.kind === 'processing') expect(state.processingVariant).toBe('insufficient_response')
    })
  }
})

describe('pariteit via de paginaketen: campaign_stats plus context naar lijst én kaart', () => {
  function stats(overrides: Partial<CampaignStats> = {}): CampaignStats {
    return {
      campaign_id: 'c1',
      campaign_name: 'TEST Loep Behoud',
      scan_type: 'retention',
      organization_id: 'org-1',
      is_active: true,
      created_at: '2026-09-01T09:00:00Z',
      closed_at: null,
      closes_at: '2026-10-04',
      total_invited: 0,
      total_completed: 3,
      completion_rate_pct: 0,
      avg_risk_score: null,
      band_high: 0,
      band_medium: 0,
      band_low: 0,
      ...overrides,
    }
  }

  function context(invitedCount: number | null): CampaignStatusContext {
    return {
      deliveryByCampaign: new Map([
        ['c1', { launchConfirmedAt: '2026-09-13T09:00:00Z', launchDate: '2026-09-13', invitedCount, reminderConfig: null }],
      ]),
      lastReminderEventAtByCampaign: new Map(),
      today: '2026-09-16',
    }
  }

  const cases: Array<[string, Partial<CampaignStats>, number | null, CampaignStatusKey]> = [
    ['managed: meer respondentrijen dan invited_count', { total_invited: 40 }, 30, 'running'],
    ['managed: alleen respondentrijen', { total_invited: 40 }, null, 'running'],
    ['self_send: alleen invited_count', { total_invited: 0 }, 30, 'running'],
    ['geen noemer: nog in te richten', { total_invited: 0 }, null, 'setup'],
  ]

  for (const [name, overrides, invitedCount, expected] of cases) {
    it(`${name} → ${expected}`, () => {
      const campaign = stats(overrides)
      const ctx = context(invitedCount)
      expect(deriveCampaignStatusFor(campaign, ctx)).toBe(expected)
      // De kaart krijgt op de pagina dezelfde noemer (denominatorFor/resolveInvitedDenominator).
      const input = statusInputFor(campaign, ctx)
      expect(KIND_TO_STATUS[resolveDashboardState(resolverInput(input)).kind]).toBe(expected)
      const denominator = denominatorFor(campaign, ctx)
      expect(input.totalInvited).toBe(denominator.known ? denominator.value : 0)
    })
  }
})

describe('deriveCampaignStatusFor: uit campaign_stats plus context', () => {
  function stats(overrides: Partial<CampaignStats> = {}): CampaignStats {
    return {
      campaign_id: 'c1',
      campaign_name: 'TEST Loep Behoud',
      scan_type: 'retention',
      organization_id: 'org-1',
      is_active: true,
      created_at: '2026-09-01T09:00:00Z',
      closed_at: null,
      closes_at: '2026-10-04',
      total_invited: 6,
      total_completed: 6,
      completion_rate_pct: 100,
      avg_risk_score: null,
      band_high: 0,
      band_medium: 0,
      band_low: 0,
      ...overrides,
    }
  }

  it('leest lancering, noemer en herinnering uit de context; zonder delivery record is het "Nog in te richten"', () => {
    const context: CampaignStatusContext = {
      deliveryByCampaign: new Map([
        ['c1', { launchConfirmedAt: '2026-09-13T09:00:00Z', launchDate: '2026-09-13', invitedCount: 30, reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 } }],
      ]),
      lastReminderEventAtByCampaign: new Map(),
      today: '2026-09-16',
    }
    expect(deriveCampaignStatusFor(stats(), context)).toBe('running')
    expect(deriveCampaignStatusFor(stats({ campaign_id: 'c2' }), context)).toBe('setup')
    expect(deriveCampaignStatusFor(stats(), { ...context, today: '2026-09-18' })).toBe('action')
    expect(
      deriveCampaignStatusFor(stats(), { ...context, today: '2026-09-18', lastReminderEventAtByCampaign: new Map([['c1', '2026-09-18T07:00:00Z']]) }),
    ).toBe('running')
  })

  it('gebruikt respondentrijen als noemer als invited_count ontbreekt (managed campagne)', () => {
    const context: CampaignStatusContext = {
      deliveryByCampaign: new Map([
        ['c1', { launchConfirmedAt: '2026-09-13T09:00:00Z', launchDate: '2026-09-13', invitedCount: null, reminderConfig: null }],
      ]),
      lastReminderEventAtByCampaign: new Map(),
      today: '2026-09-16',
    }
    expect(deriveCampaignStatusFor(stats({ total_invited: 40, total_completed: 3 }), context)).toBe('running')
  })
})
