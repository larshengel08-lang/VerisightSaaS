import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { metadata as homePageMetadata } from '@/app/page'
import { marketingNavLinks } from '@/components/marketing/site-content'

describe('commercial homepage suite opening', () => {
  it('keeps suite navigation visible in the public header and homepage metadata', () => {
    const suiteLink = marketingNavLinks.find((link) => link.href === '/#suite')

    expect(suiteLink?.label).toBe('Suite')
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
    expect(homepageSource).toContain('Rapport')
    expect(homepageSource).toContain('Action Center')
  })
})
