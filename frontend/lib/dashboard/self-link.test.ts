import { describe, expect, it } from 'vitest'
import { resolveDashboardState } from './dashboard-state-resolver'
import { withoutSelfLink } from './self-link'

const reportReady = resolveDashboardState({
  campaign: {
    id: 'c1',
    name: 'Meting',
    scanType: 'retention',
    isActive: false,
    totalInvited: 30,
    totalCompleted: 18,
    completionRatePct: 60,
    closedAt: '2026-08-27T09:00:00Z',
  },
  launchConfirmedAt: '2026-07-15T09:00:00Z',
  launchDate: '2026-07-15',
  closesAt: null,
  reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
  reminderAlreadySentAt: null,
  reminderSkipped: false,
  extensionCount: 0,
  reportReady: true,
  today: '2026-09-16',
})

describe('withoutSelfLink (spec 2026-09-16 par. 7: dubbele rapportkaart, walkthrough 5.2)', () => {
  it('haalt een link-CTA weg die naar de pagina zelf wijst', () => {
    expect(reportReady.ctaHref).toBe('/campaigns/c1')
    const onOwnPage = withoutSelfLink(reportReady, '/campaigns/c1')
    expect(onOwnPage.ctaLabel).toBeNull()
    expect(onOwnPage.ctaHref).toBeNull()
    expect(onOwnPage.ctaKind).toBeNull()
    // De rest van de staat blijft staan.
    expect(onOwnPage.primaryMessage).toBe(reportReady.primaryMessage)
    expect(onOwnPage.kind).toBe('report_ready')
  })

  it('laat elke andere CTA met rust (dashboard, mailto, eilandacties)', () => {
    expect(withoutSelfLink(reportReady, '/dashboard')).toBe(reportReady)
    const mailto = { ...reportReady, ctaHref: 'mailto:hallo@getloep.nl', ctaLabel: 'Mail Loep' }
    expect(withoutSelfLink(mailto, '/campaigns/c1')).toBe(mailto)
    const island = { ...reportReady, ctaKind: 'close_campaign' as const, ctaHref: null }
    expect(withoutSelfLink(island, '/campaigns/c1')).toBe(island)
  })
})
