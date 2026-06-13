import { describe, expect, it } from 'vitest'
import {
  buildClosedCampaignNavItems,
  buildDashboardShellNavigation,
  getActiveModuleFromLocation,
  getDashboardModuleHref,
  normalizeDashboardModuleFilter,
  normalizeDashboardPortfolioView,
  type DashboardShellCampaignRef,
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
    {
      campaign_id: 'culture-1',
      scan_type: 'culture_assessment',
      is_active: true,
      created_at: '2026-04-14T10:00:00.000Z',
      total_completed: 6,
    },
  ] as const

  it('maps product rail to only overview and reports entries', () => {
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
        label: 'Overzicht',
        href: '/dashboard',
        disabled: false,
      },
      {
        key: 'reports',
        label: 'Rapporten',
        href: '/reports',
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
    expect(navigation.admin.map((item) => item.label)).toEqual(['Setup', 'Leads', 'Learnings'])
  })

  it('returns empty admin for non-admin users', () => {
    const navigation = buildDashboardShellNavigation({
      isAdmin: false,
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

    expect(navigation.admin).toEqual([])
  })

  it('derives the active module from category filters and real campaign routes', () => {
    expect(getActiveModuleFromLocation('/dashboard', null, [...campaigns])).toBe('overview')
    expect(getActiveModuleFromLocation('/dashboard', 'exit', [...campaigns])).toBe('exit')
    expect(getActiveModuleFromLocation('/dashboard', 'retention', [...campaigns])).toBe('retention')
    expect(getActiveModuleFromLocation('/campaigns/retention-1', null, [...campaigns])).toBe('retention')
    expect(getActiveModuleFromLocation('/campaigns/pulse-1', null, [...campaigns])).toBe('pulse')
    expect(getActiveModuleFromLocation('/campaigns/leadership-1', null, [...campaigns])).toBe('leadership')
    expect(getActiveModuleFromLocation('/campaigns/culture-1', null, [...campaigns])).toBe('culture_assessment')
    expect(getActiveModuleFromLocation('/campaigns/unknown', null, [...campaigns])).toBe('overview')
    expect(getActiveModuleFromLocation('/reports', null, [...campaigns])).toBe('reports')
    expect(getActiveModuleFromLocation('/action-center', null, [...campaigns])).toBe('action_center')
    expect(getActiveModuleFromLocation('/beheer', null, [...campaigns])).toBe('overview')
  })

  it('keeps module nav active on detail routes instead of treating the item itself as a rail destination', () => {
    expect(getActiveModuleFromLocation('/campaigns/exit-1', 'retention', [...campaigns])).toBe('exit')
    expect(getActiveModuleFromLocation('/campaigns/retention-1', 'exit', [...campaigns])).toBe('retention')
  })

  it('hides product rail items that do not have any campaign yet', () => {
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

    expect(navigation.modules).toEqual([
      {
        key: 'overview',
        label: 'Overzicht',
        href: '/dashboard',
        disabled: false,
      },
      {
        key: 'reports',
        label: 'Rapporten',
        href: '/reports',
        disabled: false,
      },
    ])
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

  it('normalizes dashboard module filters and exposes stable category hrefs', () => {
    expect(normalizeDashboardModuleFilter('exit')).toBe('exit')
    expect(normalizeDashboardModuleFilter('leadership')).toBe('leadership')
    expect(normalizeDashboardModuleFilter('culture_assessment')).toBe('culture_assessment')
    expect(normalizeDashboardModuleFilter('unknown')).toBeNull()
    expect(normalizeDashboardModuleFilter(undefined)).toBeNull()
    expect(getDashboardModuleHref('exit')).toBe('/dashboard?module=exit')
    expect(getDashboardModuleHref('retention')).toBe('/dashboard?module=retention')
    expect(getDashboardModuleHref('culture_assessment')).toBe('/dashboard?module=culture_assessment')
  })
})

describe('closed campaign sidebar list', () => {
  const refs: DashboardShellCampaignRef[] = [
    { campaign_id: 'c1', scan_type: 'exit', is_active: false, created_at: '2026-05-01T00:00:00Z', total_completed: 14 },
    { campaign_id: 'c2', scan_type: 'retention', is_active: true, created_at: '2026-06-01T00:00:00Z', total_completed: 8 },
    { campaign_id: 'c3', scan_type: 'exit', is_active: false, created_at: '2026-06-10T00:00:00Z', total_completed: 20 },
  ]

  it('lists only closed campaigns, newest first, linking to their report', () => {
    const items = buildClosedCampaignNavItems(refs)
    expect(items.map((item) => item.campaignId)).toEqual(['c3', 'c1'])
    expect(items[0].href).toBe('/campaigns/c3')
    expect(items[0].periodLabel).toBe('jun 2026')
  })
})
