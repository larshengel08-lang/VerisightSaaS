import { describe, expect, it } from 'vitest'
import { buildDashboardShellNavigation, normalizeDashboardPortfolioView } from './shell-navigation'

describe('dashboard shell navigation', () => {
  it('builds a route-first buyer rail with disabled portfolio slots when no campaigns are available', () => {
    const navigation = buildDashboardShellNavigation({
      isAdmin: false,
      currentCampaignPath: '/campaigns/campaign-123',
      portfolioCounts: {
        ready: 0,
        building: 2,
        setup: 1,
        closed: 0,
      },
    })

    expect(navigation.primary.map((item) => item.label)).toEqual(['Overview', 'Huidige campagne'])
    expect(navigation.primary[1]?.href).toBe('/campaigns/campaign-123')

    expect(navigation.portfolio).toEqual([
      {
        key: 'ready',
        label: 'Management-ready',
        detail: 'Nog niet actief in deze omgeving',
        href: null,
        disabled: true,
      },
      {
        key: 'building',
        label: 'In opbouw',
        detail: '2 campagne(s)',
        href: '/dashboard?view=building#portfolio',
        disabled: false,
      },
      {
        key: 'setup',
        label: 'Setup of launch',
        detail: '1 campagne(s)',
        href: '/dashboard?view=setup#portfolio',
        disabled: false,
      },
      {
        key: 'closed',
        label: 'Afgerond',
        detail: 'Nog niet actief in deze omgeving',
        href: null,
        disabled: true,
      },
    ])
    expect(navigation.admin).toEqual([])
  })

  it('keeps admin links separate from buyer overview navigation', () => {
    const navigation = buildDashboardShellNavigation({
      isAdmin: true,
      currentCampaignPath: null,
      portfolioCounts: {
        ready: 3,
        building: 1,
        setup: 0,
        closed: 2,
      },
    })

    expect(navigation.primary.map((item) => item.label)).toEqual(['Overview'])
    expect(navigation.admin.map((item) => item.label)).toEqual(['Setup', 'Leads', 'Learnings'])
    expect(navigation.portfolio[2]).toMatchObject({
      key: 'setup',
      href: null,
      disabled: true,
    })
  })

  it('normalizes unknown portfolio views back to overview-ready tabs', () => {
    expect(normalizeDashboardPortfolioView('ready')).toBe('ready')
    expect(normalizeDashboardPortfolioView('closed')).toBe('closed')
    expect(normalizeDashboardPortfolioView('unknown')).toBe('ready')
    expect(normalizeDashboardPortfolioView(undefined)).toBe('ready')
  })
})
