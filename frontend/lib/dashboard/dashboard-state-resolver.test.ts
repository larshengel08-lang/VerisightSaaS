// frontend/lib/dashboard/dashboard-state-resolver.test.ts
import { describe, expect, it } from 'vitest'
import { resolveDashboardState, type DashboardStateInput } from './dashboard-state-resolver'

function baseInput(overrides: Partial<DashboardStateInput> = {}): DashboardStateInput {
  return {
    campaign: {
      id: 'camp-1',
      name: 'Loep Vertrek Q2 2026',
      scanType: 'exit',
      isActive: true,
      totalInvited: 20,
      totalCompleted: 0,
      completionRatePct: 0,
      closedAt: null,
    },
    launchConfirmedAt: '2026-06-01T09:00:00Z',
    launchDate: '2026-06-01',
    closesAt: null,
    reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 2 },
    reminderAlreadySentAt: null,
    reportReady: false,
    today: '2026-06-03',
    ...overrides,
  }
}

describe('resolveDashboardState', () => {
  it('State 0 — no campaign', () => {
    const state = resolveDashboardState(baseInput({ campaign: null }))
    expect(state.kind).toBe('no_campaign')
    expect(state.primaryMessage).toBe('Er staat momenteel geen scan voor u klaar')
    expect(state.ctaLabel).toBeNull()
  })

  it('State 1 — setup when invites are not launched yet', () => {
    const state = resolveDashboardState(baseInput({ launchConfirmedAt: null }))
    expect(state.kind).toBe('setup')
    expect(state.primaryMessage).toBe('Stap 1: stel de startdatum in')
    expect(state.ctaLabel).toBe('Start de setup →')
    expect(state.ctaHref).toBe('/campaigns/camp-1/setup')
  })

  it('State 1 — setup when no respondents are imported yet (even if confirmed)', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: { ...baseInput().campaign!, totalInvited: 0 } }),
    )
    expect(state.kind).toBe('setup')
  })

  it('State 2 — running, no action, below close threshold', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: { ...baseInput().campaign!, totalCompleted: 3, completionRatePct: 15 }, today: '2026-06-03' }),
    )
    expect(state.kind).toBe('running')
    expect(state.primaryMessage).toBe('Campagne loopt')
    expect(state.tone).toBe('positive')
    expect(state.ctaLabel).toBeNull()
    expect(state.progressPct).toBe(15)
  })

  it('State 3 — reminder day takes priority over running', () => {
    const state = resolveDashboardState(
      baseInput({ campaign: { ...baseInput().campaign!, totalCompleted: 3 }, today: '2026-06-06' }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('reminder')
    expect(state.primaryMessage).toBe('Vandaag: stuur de herinnering')
    expect(state.ctaLabel).toBe('Kopieer herinneringstekst')
    expect(state.tone).toBe('attention')
  })

  it('State 3 — sufficient response prompts close when min is reached', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, totalCompleted: 12, completionRatePct: 60 },
        reportReady: true,
        today: '2026-06-03',
      }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('sufficient_response')
    expect(state.primaryMessage).toBe('Voldoende respons — sluit de campagne')
    expect(state.ctaLabel).toBe('Campagne sluiten')
  })

  it('State 3 — expired wins over reminder and sufficient response', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, totalCompleted: 12 },
        reportReady: true,
        closesAt: '2026-06-05',
        today: '2026-06-06',
      }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('expired')
    expect(state.primaryMessage).toBe('Campagne is verlopen — sluit nu af')
  })

  it('State 3 — expired fires even when closesAt is a full ISO timestamp', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, totalCompleted: 12 },
        closesAt: '2026-06-05T22:00:00Z',
        today: '2026-06-06',
      }),
    )
    expect(state.kind).toBe('action')
    expect(state.actionVariant).toBe('expired')
  })

  it('State 3b — processing/generating when closed and enough responses but report not yet ready', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, isActive: false, totalCompleted: 12, closedAt: '2026-06-10T09:00:00Z' },
        reportReady: false,
      }),
    )
    expect(state.kind).toBe('processing')
    expect(state.processingVariant).toBe('generating')
    expect(state.primaryMessage).toBe('Rapport wordt voorbereid')
  })

  it('State 3b — processing/insufficient when closed below display threshold', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, isActive: false, totalCompleted: 2, closedAt: '2026-06-10T09:00:00Z' },
        reportReady: false,
      }),
    )
    expect(state.kind).toBe('processing')
    expect(state.processingVariant).toBe('insufficient_response')
    expect(state.primaryMessage).toBe('Rapport nog niet beschikbaar')
  })

  it('State 4 — report ready when closed and report is available', () => {
    const state = resolveDashboardState(
      baseInput({
        campaign: { ...baseInput().campaign!, isActive: false, totalCompleted: 14, closedAt: '2026-06-10T09:00:00Z' },
        reportReady: true,
      }),
    )
    expect(state.kind).toBe('report_ready')
    expect(state.primaryMessage).toBe('Je rapport is beschikbaar')
    expect(state.ctaLabel).toBe('Open rapport')
    expect(state.ctaHref).toBe('/campaigns/camp-1')
  })

  it('degrades the close date label when no close date is known', () => {
    const state = resolveDashboardState(baseInput({ campaign: { ...baseInput().campaign!, totalCompleted: 3 } }))
    expect(state.kind).toBe('running')
    expect(state.closeDateLabel).toBe('Sluitdatum: nog niet gepland')
  })
})
