import { describe, it, expect } from 'vitest'
import { rapportGereedHtml } from './rapport-gereed'

describe('rapportGereedHtml', () => {
  it('bevat campagnenaam, org-naam en dashboard-link', () => {
    const html = rapportGereedHtml({
      organizationName: 'TechBouw B.V.',
      campaignName: 'ExitScan Q1 2026',
      dashboardUrl: 'https://loep.nl/campaigns/abc',
      calendlyUrl: null,
    })
    expect(html).toContain('ExitScan Q1 2026')
    expect(html).toContain('TechBouw B.V.')
    expect(html).toContain('https://loep.nl/campaigns/abc')
  })

  it('bevat Calendly-link als opgegeven', () => {
    const html = rapportGereedHtml({
      organizationName: 'Org',
      campaignName: 'Scan',
      dashboardUrl: 'https://loep.nl/campaigns/x',
      calendlyUrl: 'https://calendly.com/loep/bespreking',
    })
    expect(html).toContain('calendly.com')
  })

  it('escapet HTML-injectie in organisatienaam', () => {
    const html = rapportGereedHtml({
      organizationName: '<script>alert(1)</script>',
      campaignName: 'Scan',
      dashboardUrl: 'https://loep.nl/campaigns/x',
      calendlyUrl: null,
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
