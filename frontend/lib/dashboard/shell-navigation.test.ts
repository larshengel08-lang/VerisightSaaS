import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildDashboardShellNavigation,
  getDashboardShellCurrentLabel,
  normalizeDashboardPortfolioView,
} from './shell-navigation'

describe('dashboard shell buyer-readiness', () => {
  it('builds the same module and support sections that the shell actually renders', () => {
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

    expect(navigation.modules.map((item) => item.label)).toEqual([
      'Overzicht',
      'ExitScan',
      'RetentieScan',
      'Onboarding 30-60-90',
    ])
    expect(navigation.support.map((item) => item.label)).toEqual(['Pulse', 'Leadership Scan'])
    expect(navigation.admin).toEqual([])
  })

  it('keeps admin links separate from the shared buyer rail', () => {
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

    expect(navigation.admin.map((item) => item.label)).toEqual(['Rapporten', 'Nieuwe campagne', 'Action Center'])
    expect(navigation.modules[0]?.href).toBe('/dashboard')
    expect(navigation.support[1]?.href).toBe('/dashboard/leadership')
  })

  it('normalizes unknown portfolio views back to overview-ready tabs', () => {
    expect(normalizeDashboardPortfolioView('ready')).toBe('ready')
    expect(normalizeDashboardPortfolioView('closed')).toBe('closed')
    expect(normalizeDashboardPortfolioView('unknown')).toBe('ready')
    expect(normalizeDashboardPortfolioView(undefined)).toBe('ready')
  })

  it('keeps primary shell labels in Dutch and context-aware', () => {
    expect(getDashboardShellCurrentLabel('/dashboard')).toBe('Dashboardoverzicht')
    expect(getDashboardShellCurrentLabel('/campaigns/demo')).toBe('Campagneread')
    expect(getDashboardShellCurrentLabel('/beheer/klantlearnings')).toBe('Action Center')
  })

  it('keeps the rendered shell sections aligned with the navigation model and avoids a dead global export CTA', () => {
    const source = readFileSync(new URL('../../components/dashboard/dashboard-shell.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getDashboardShellCurrentLabel(pathname)')
    expect(source).toContain('items={navigation.modules}')
    expect(source).toContain('items={navigation.support}')
    expect(source).toContain('{mobileItems.map((item) => {')
    expect(source).not.toContain('DASHBOARD_MODULE_NAV.filter')
    expect(source).not.toContain('Rapport exporteren')
  })
})
