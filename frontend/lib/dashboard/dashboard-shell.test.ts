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
    expect(config.currentLabel).toBe('Campaign detail')
    expect(config.modeLabel).toContain('buyer view')
  })

  it('keeps admin mode in the same family but deliberately soberer', () => {
    const config = getDashboardShellConfig({
      isAdmin: true,
      pathname: '/beheer/contact-aanvragen',
      acceptedCount: 0,
      userEmail: 'admin@example.com',
    })

    expect(config.mode).toBe('admin')
    expect(config.accountLabel).toBe('Verisight beheer')
    expect(config.bannerText).toBeNull()
    expect(config.navigation.some((item) => item.href === '/beheer/klantlearnings')).toBe(true)
    expect(config.currentLabel).toBe('Lead context')
    expect(config.modeLabel).toContain('admin view')
  })
})
