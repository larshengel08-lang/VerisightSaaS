import { describe, it, expect } from 'vitest'
import { welkomHtml } from './welkom'

describe('welkomHtml', () => {
  it('bevat organisatienaam en dashboard-link', () => {
    const html = welkomHtml({
      organizationName: 'TechBouw B.V.',
      dashboardUrl: 'https://verisight.nl/dashboard',
    })
    expect(html).toContain('TechBouw B.V.')
    expect(html).toContain('https://verisight.nl/dashboard')
  })

  it('escapet HTML-injectie in organisatienaam', () => {
    const html = welkomHtml({
      organizationName: '<b>Org</b>',
      dashboardUrl: 'https://verisight.nl/dashboard',
    })
    expect(html).not.toContain('<b>Org</b>')
    expect(html).toContain('&lt;b&gt;Org&lt;/b&gt;')
  })
})
