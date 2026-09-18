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
      campaign_name: 'exit-1',
      scan_type: 'exit',
      is_active: true,
      created_at: '2026-04-20T10:00:00.000Z',
      closed_at: null,
      total_completed: 14,
    },
    {
      campaign_id: 'retention-1',
      campaign_name: 'retention-1',
      scan_type: 'retention',
      is_active: true,
      created_at: '2026-04-18T10:00:00.000Z',
      closed_at: null,
      total_completed: 11,
    },
    {
      campaign_id: 'onboarding-1',
      campaign_name: 'onboarding-1',
      scan_type: 'onboarding',
      is_active: true,
      created_at: '2026-04-17T10:00:00.000Z',
      closed_at: null,
      total_completed: 8,
    },
    {
      campaign_id: 'pulse-1',
      campaign_name: 'pulse-1',
      scan_type: 'pulse',
      is_active: true,
      created_at: '2026-04-16T10:00:00.000Z',
      closed_at: null,
      total_completed: 22,
    },
    {
      campaign_id: 'leadership-1',
      campaign_name: 'leadership-1',
      scan_type: 'leadership',
      is_active: true,
      created_at: '2026-04-15T10:00:00.000Z',
      closed_at: null,
      total_completed: 9,
    },
    {
      campaign_id: 'culture-1',
      campaign_name: 'culture-1',
      scan_type: 'culture_assessment',
      is_active: true,
      created_at: '2026-04-14T10:00:00.000Z',
      closed_at: null,
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

describe('closed campaign sidebar list (walkthrough 1.7: campagnenaam en sluitmaand, niet scanlabel en aanmaakmaand)', () => {
  const refs: DashboardShellCampaignRef[] = [
    { campaign_id: 'c1', campaign_name: 'Loep Vertrek voorjaar', scan_type: 'exit', is_active: false, created_at: '2026-05-01T00:00:00Z', closed_at: null, total_completed: 14 },
    { campaign_id: 'c2', campaign_name: 'Loep Behoud lopend', scan_type: 'retention', is_active: true, created_at: '2026-06-01T00:00:00Z', closed_at: null, total_completed: 8 },
    { campaign_id: 'c3', campaign_name: 'TEST Loep Behoud - gesloten met rapport', scan_type: 'exit', is_active: false, created_at: '2026-07-15T00:00:00Z', closed_at: '2026-08-27T09:00:00Z', total_completed: 20 },
  ]

  it('lists only closed campaigns, newest first, by name, with the month they closed', () => {
    const items = buildClosedCampaignNavItems(refs)
    expect(items.map((item) => item.campaignId)).toEqual(['c3', 'c1'])
    expect(items[0].href).toBe('/campaigns/c3')
    expect(items[0].name).toBe('TEST Loep Behoud - gesloten met rapport')
    expect(items[0].closedLabel).toBe('Gesloten aug 2026')
  })

  it('sorteert op sluitdatum (anders aanmaakdatum), zodat de volgorde klopt met "Gesloten <maand>"', () => {
    const items = buildClosedCampaignNavItems([
      // Eerst aangemaakt, als laatste gesloten: moet bovenaan.
      { campaign_id: 'old-created', campaign_name: 'Vroeg gestart', scan_type: 'exit', is_active: false, created_at: '2026-01-01T00:00:00Z', closed_at: '2026-09-01T00:00:00Z', total_completed: 12 },
      { campaign_id: 'new-created', campaign_name: 'Laat gestart', scan_type: 'retention', is_active: false, created_at: '2026-06-01T00:00:00Z', closed_at: '2026-07-01T00:00:00Z', total_completed: 12 },
      // Geen sluitdatum: valt terug op de aanmaakdatum voor de volgorde.
      { campaign_id: 'no-close', campaign_name: 'Onbekend gesloten', scan_type: 'exit', is_active: false, created_at: '2026-08-01T00:00:00Z', closed_at: null, total_completed: 12 },
    ])
    expect(items.map((item) => item.campaignId)).toEqual(['old-created', 'no-close', 'new-created'])
  })

  it('zegt eerlijk dat de sluitdatum onbekend is in plaats van de aanmaakmaand te tonen', () => {
    const items = buildClosedCampaignNavItems(refs)
    expect(items[1].closedLabel).toBe('Gesloten, datum onbekend')
    expect(items[1].closedLabel).not.toContain('mei')
  })
})
