import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { metadata as homePageMetadata } from '@/app/page'
import { marketingNavLinks } from '@/components/marketing/site-content'

describe('commercial homepage suite opening', () => {
  it('keeps the public header focused on route choices while homepage metadata stays intact', () => {
    const suiteLink = marketingNavLinks.find((link) => link.href === '/#suite')
    const homeLink = marketingNavLinks.find((link) => link.href === '/')

    expect(suiteLink).toBeUndefined()
    expect(homeLink).toBeUndefined()
    expect(String(homePageMetadata.description).toLowerCase()).toContain('action center')
    expect(String(homePageMetadata.description).toLowerCase()).toContain('opvolging')
  })

  it('opens the homepage around dashboard, report and action center as one suite', () => {
    const homepageSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'home-page-content.tsx'),
      'utf8',
    )

    expect(homepageSource).toContain('id="suite"')
    expect(homepageSource).toContain('Dashboard')
    expect(homepageSource).toContain('samenvatting')
    expect(homepageSource).toContain('Action Center')
  })

  it('uses the quieter hero and unified suite-flow copy for the public homepage opening', () => {
    const homepageSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'home-page-content.tsx'),
      'utf8',
    )

    expect(homepageSource).toContain('Voor organisaties die sneller willen zien wat nu echt aandacht vraagt.')
    expect(homepageSource).toContain('Zien.')
    expect(homepageSource).toContain('Prioriteren.')
    expect(homepageSource).toContain('Handelen.')
    expect(homepageSource).toContain('Toets uw eerste route')
    expect(homepageSource).toContain('Van eerste inzicht naar concrete opvolging in dezelfde leeslijn')
    expect(homepageSource).toContain('Geen losse output.')
    expect(homepageSource).toContain('Wel een helder besluitspoor.')
    expect(homepageSource).toContain('Zie waar vertrek, behoud of vroege uitval echt aandacht vraagt.')
  })
})
