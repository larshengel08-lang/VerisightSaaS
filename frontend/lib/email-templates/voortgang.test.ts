import { describe, it, expect } from 'vitest'
import { voortgangHtml } from './voortgang'

describe('voortgangHtml', () => {
  it('toont percentage en aantallen', () => {
    const html = voortgangHtml({
      organizationName: 'TechBouw',
      campaignName: 'ExitScan Q1',
      totalCompleted: 18,
      totalInvited: 35,
      responsePct: 51,
      dashboardUrl: 'https://verisight.nl/campaigns/x',
    })
    expect(html).toContain('51%')
    expect(html).toContain('18 van 35')
    expect(html).toContain('TechBouw')
  })

  it('toont "sluiten"-boodschap bij respons >= 60%', () => {
    const html = voortgangHtml({
      organizationName: 'Org',
      campaignName: 'Scan',
      totalCompleted: 25,
      totalInvited: 35,
      responsePct: 65,
      dashboardUrl: 'https://verisight.nl/campaigns/x',
    })
    expect(html).toContain('sluiten')
  })

  it('escapet HTML-injectie in campagnenaam', () => {
    const html = voortgangHtml({
      organizationName: 'Org',
      campaignName: '<script>alert(1)</script>',
      totalCompleted: 10,
      totalInvited: 20,
      responsePct: 50,
      dashboardUrl: 'https://verisight.nl/campaigns/x',
    })
    expect(html).not.toContain('<script>')
  })
})
