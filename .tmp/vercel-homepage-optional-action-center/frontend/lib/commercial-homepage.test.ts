import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('commercial homepage suite opening', () => {
  it('keeps the public header focused on route choices while homepage metadata stays intact', () => {
    const siteContentSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'site-content.ts'),
      'utf8',
    )
    const homepageSource = fs.readFileSync(path.join(process.cwd(), 'app', 'page.tsx'), 'utf8')

    expect(siteContentSource).toContain("export const marketingNavLinks = [")
    expect(siteContentSource).toContain("{ href: '/producten', label: 'Producten' }")
    expect(siteContentSource).toContain("{ href: '/vertrouwen', label: 'Vertrouwen' }")
    expect(homepageSource.toLowerCase()).toContain('action center')
    expect(homepageSource.toLowerCase()).toContain('opvolging')
  })

  it('still keeps the archived suite section in code while removing it from the live homepage flow', () => {
    const homepageSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'home-page-content.tsx'),
      'utf8',
    )

    expect(homepageSource).toContain('function SuitePreviewSection()')
    expect(homepageSource).toContain('id="suite"')
    expect(homepageSource).not.toContain('<HomeInsightActionDemo />')
    expect(homepageSource).not.toContain('<SuitePreviewSection />')
  })

  it('uses the spreadsheet-driven homepage copy for hero, problem, flow and baseline section', () => {
    const homepageSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'home-page-content.tsx'),
      'utf8',
    )

    expect(homepageSource).toContain('Zie sneller waar vertrek, behoud of onboarding aandacht vragen')
    expect(homepageSource).toContain(
      'Verisight helpt organisaties signalen zichtbaar maken, prioriteren en opvolging organiseren in het Action Center.',
    )
    expect(homepageSource).toContain('Wat vraagt nu aandacht?')
    expect(homepageSource).toContain('Veel signalen. Te weinig scherpte')
    expect(homepageSource).toContain('Organisaties zien signalen rond uitstroom, behoud of vroege landing')
    expect(homepageSource).toContain('heldere prioriteit en concrete opvolging.')
    expect(homepageSource).toContain('Maakt de hoofdboodschap, eerste prioriteit en eerste vervolgrichting leesbaar')
    expect(homepageSource).toContain('Maakt opvolging concreet. Van toewijzing aan een manager tot het openen en volgen van acties.')
    expect(homepageSource).not.toContain('Verisight vult interpretatie of eigenaarschap niet automatisch voor u in.')

    expect(homepageSource).toContain('Wat u krijgt in de Baseline')
    expect(homepageSource).toContain('Intake en afbakening')
    expect(homepageSource).toContain('Scan of dataverzameling')
    expect(homepageSource).toContain('Dashboard en managementrapport')
    expect(homepageSource).toContain('Review')
    expect(homepageSource).not.toContain('Vervolgvragen')
  })
})
