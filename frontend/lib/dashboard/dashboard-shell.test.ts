import { describe, expect, it } from 'vitest'
import { getDashboardShellConfig } from './dashboard-shell-config'

describe('dashboard shell config', () => {
  it('keeps buyer mode premium but execution-honest', () => {
    const config = getDashboardShellConfig({
      isAdmin: false,
      pathname: '/campaigns/demo-campaign',
      acceptedCount: 2,
      userEmail: 'buyer@example.com',
    })

    expect(config.mode).toBe('buyer')
    expect(config.accountLabel).toBe('Klantdashboard')
    expect(config.bannerText).toContain('2 organisatie')
    expect(config.navigation[0]?.label).toBe('Cockpit')
    expect(config.currentLabel).toBe('Campagnedetail')
    expect(config.modeLabel).toContain('Klantweergave')
  })

  it('keeps admin mode in the same family but deliberately soberer', () => {
    const config = getDashboardShellConfig({
      isAdmin: true,
      pathname: '/beheer/klantlearnings',
      acceptedCount: 0,
      userEmail: 'admin@example.com',
    })

    expect(config.mode).toBe('admin')
    expect(config.accountLabel).toBe('Loep beheer')
    expect(config.bannerText).toBeNull()
    expect(config.navigation.map((item) => item.label)).toEqual([
      'Cockpit',
      'Setup',
      'Leads',
      'Learnings',
    ])
    expect(config.navigation.some((item) => item.href === '/beheer/billing')).toBe(false)
    expect(config.navigation.some((item) => item.href === '/beheer/health')).toBe(false)
    expect(config.navigation.some((item) => item.href === '/beheer/proof')).toBe(false)
    expect(config.currentLabel).toBe('Learnings')
    expect(config.modeLabel).toContain('Beheerweergave')
  })
})
