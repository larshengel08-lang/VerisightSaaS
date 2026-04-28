import { describe, expect, it } from 'vitest'
import {
  buildDashboardShellNavigation,
  getActiveModuleFromPathname,
  normalizeDashboardPortfolioView,
} from './shell-navigation'

describe('dashboard shell navigation', () => {
  const campaigns = [
    {
      campaign_id: 'exit-1',
      scan_type: 'exit',
      is_active: true,
      created_at: '2026-04-20T10:00:00.000Z',
      total_completed: 14,
    },
    {
      campaign_id: 'retention-1',
      scan_type: 'retention',
      is_active: true,
      created_at: '2026-04-18T10:00:00.000Z',
      total_completed: 11,
    },
    {
      campaign_id: 'onboarding-1',
      scan_type: 'onboarding',
      is_active: true,
      created_at: '2026-04-17T10:00:00.000Z',
      total_completed: 8,
    },
    {
      campaign_id: 'pulse-1',
      scan_type: 'pulse',
      is_active: true,
      created_at: '2026-04-16T10:00:00.000Z',
      total_completed: 22,
    },
    {
      campaign_id: 'leadership-1',
      scan_type: 'leadership',
      is_active: true,
      created_at: '2026-04-15T10:00:00.000Z',
      total_completed: 9,
    },
  ] as const

  it('maps the shared dashboard rail onto real overview, campaign and report routes', () => {
    const navigation = buildDashboardShellNavigation({
      isAdmin: false,
      currentCampaignPath: '/campaigns/campaign-123',
      campaigns: [...campaigns],
      portfolioCounts: {
        ready: 0,
        building: 2,
        setup: 1,
        closed: 0,
      },
    })

    expect(navigation.modules).toEqual([
      {
        key: 'overview',
        label: 'Dashboard',
        href: '/dashboard',
        disabled: false,
      },
      {
        key: 'exit',
        label: 'ExitScan',
        href: '/campaigns/exit-1',
        disabled: false,
      },
      {
        key: 'retention',
        label: 'RetentieScan',
        href: '/campaigns/retention-1',
        disabled: false,
      },
      {
        key: 'onboarding',
        label: 'Onboarding 30-60-90',
        href: '/campaigns/onboarding-1',
        disabled: false,
      },
      {
        key: 'pulse',
        label: 'Pulse',
        href: '/campaigns/pulse-1',
        disabled: false,
      },
      {
        key: 'leadership',
        label: 'Leadership Scan',
        href: '/campaigns/leadership-1',
        disabled: false,
      },
      {
        key: 'reports',
        label: 'Rapporten',
        href: '/reports',
        disabled: false,
      },
      {
        key: 'action_center',
        label: 'Action Center',
        href: '/action-center',
        disabled: false,
      },
    ])
    expect(navigation.admin).toEqual([])
  })

  it('keeps admin links separate from buyer overview navigation', () => {
    const navigation = buildDashboardShellNavigation({
      isAdmin: true,
      shellMode: 'full',
      currentCampaignPath: null,
      campaigns: [...campaigns],
      portfolioCounts: {
        ready: 3,
        building: 1,
        setup: 0,
        closed: 2,
      },
    })

    expect(navigation.modules[0]).toMatchObject({
      key: 'overview',
      href: '/dashboard',
    })
    expect(navigation.admin.map((item) => item.label)).toEqual(['Setup', 'Leads', 'Action Center bron'])
    expect(navigation.modules[3]).toMatchObject({
      key: 'onboarding',
      href: '/campaigns/onboarding-1',
    })
  })

  it('derives the active preview module from real campaign routes', () => {
    expect(getActiveModuleFromPathname('/dashboard', [...campaigns])).toBe('overview')
    expect(getActiveModuleFromPathname('/campaigns/retention-1', [...campaigns])).toBe('retention')
    expect(getActiveModuleFromPathname('/campaigns/pulse-1', [...campaigns])).toBe('pulse')
    expect(getActiveModuleFromPathname('/campaigns/leadership-1', [...campaigns])).toBe('leadership')
    expect(getActiveModuleFromPathname('/campaigns/unknown', [...campaigns])).toBe('overview')
    expect(getActiveModuleFromPathname('/reports', [...campaigns])).toBe('reports')
    expect(getActiveModuleFromPathname('/action-center', [...campaigns])).toBe('action_center')
    expect(getActiveModuleFromPathname('/beheer', [...campaigns])).toBe('overview')
  })

  it('disables module slots that do not have a real campaign route yet', () => {
    const navigation = buildDashboardShellNavigation({
      isAdmin: false,
      shellMode: 'full',
      currentCampaignPath: null,
      campaigns: [],
      portfolioCounts: {
        ready: 0,
        building: 0,
        setup: 0,
        closed: 0,
      },
    })

    expect(navigation.modules[1]).toMatchObject({
      key: 'exit',
      href: null,
      disabled: true,
    })
    expect(navigation.modules[4]).toMatchObject({
      key: 'pulse',
      href: null,
      disabled: true,
    })
    expect(navigation.modules[6]).toMatchObject({
      key: 'reports',
      href: '/reports',
      disabled: false,
    })
    expect(navigation.modules[7]).toMatchObject({
      key: 'action_center',
      href: '/action-center',
      disabled: false,
    })
  })

  it('reduces the shared shell to action center only for manager assignees', () => {
    const navigation = buildDashboardShellNavigation({
      isAdmin: false,
      shellMode: 'action_center_only',
      currentCampaignPath: null,
      campaigns: [...campaigns],
      portfolioCounts: {
        ready: 2,
        building: 1,
        setup: 0,
        closed: 0,
      },
    })

    expect(navigation.modules).toEqual([
      {
        key: 'action_center',
        label: 'Action Center',
        href: '/action-center',
        disabled: false,
      },
    ])
    expect(navigation.admin).toEqual([])
  })

  it('normalizes unknown portfolio views back to overview-ready tabs', () => {
    expect(normalizeDashboardPortfolioView('ready')).toBe('ready')
    expect(normalizeDashboardPortfolioView('closed')).toBe('closed')
    expect(normalizeDashboardPortfolioView('unknown')).toBe('ready')
    expect(normalizeDashboardPortfolioView(undefined)).toBe('ready')
  })
})
