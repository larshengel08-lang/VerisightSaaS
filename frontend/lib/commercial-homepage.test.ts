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

  it('uses the updated hero, problem, flow and first-delivery copy for the public homepage opening', () => {
    const homepageSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'home-page-content.tsx'),
      'utf8',
    )

    expect(homepageSource).toContain('Zie sneller waar vertrek, behoud of onboarding aandacht vragen')
    expect(homepageSource).toContain('Verisight helpt HR en leiding signalen zichtbaar maken, prioriteren wat eerst telt en opvolging organiseren in het Action Center.')
    expect(homepageSource).toContain('Plan een kennismaking')
    expect(homepageSource).toContain('Bekijk voorbeeldoutput')
    expect(homepageSource).toContain('Dashboard voor inzicht')
    expect(homepageSource).toContain('Managementrapport voor duiding')
    expect(homepageSource).toContain('Action Center voor opvolging')
    expect(homepageSource).not.toContain('Voor organisaties die sneller willen zien wat nu echt aandacht vraagt.')
    expect(homepageSource).not.toContain('AVG-bewust')

    expect(homepageSource).toContain('Veel signalen. Te weinig scherpte')
    expect(homepageSource).toContain('in wat eerst aandacht vraagt.')
    expect(homepageSource).toContain('Organisaties zien signalen — rond uitstroom, behoud of vroege landing — maar missen de vertaalslag naar')
    expect(homepageSource).toContain('een heldere managementprioriteit en concrete opvolging.')
    expect(homepageSource).toContain('Verspreide signalen')
    expect(homepageSource).toContain('Onduidelijke prioriteit')
    expect(homepageSource).toContain('Opvolging blijft te los')

    expect(homepageSource).toContain('Van signaal naar gerichte opvolging')
    expect(homepageSource).toContain('Verisight brengt analyse en vervolg samen in één heldere managementflow.')
    expect(homepageSource).toContain('<ManagementFlowSection />')

    expect(homepageSource).toContain('Als vertrek de vraag is')
    expect(homepageSource).toContain('Als behoud in actieve teams de vraag is')
    expect(homepageSource).toContain('Als vroege landing aandacht vraagt')
    expect(homepageSource).toContain('Wat u als eerste krijgt')
    expect(homepageSource).toContain('Een dashboard met hoofdbeeld en prioriteiten')
    expect(homepageSource).toContain('Een managementrapport met duiding en vervolgrichting')
    expect(homepageSource).toContain('Een gerichte bespreking van wat eerst telt')
    expect(homepageSource).toContain('Een Action Center voor georganiseerde opvolging')
    expect(homepageSource).toContain('<FirstDeliverySection />')
    expect(homepageSource).toContain("const secondaryHref = '/#first-delivery'")
    expect(homepageSource).toContain('Wilt u scherper zien wat aandacht vraagt — en opvolging beter organiseren?')
    expect(homepageSource).toContain('Plan een kennismaking en ontdek hoe Verisight helpt om signalen zichtbaar te maken, prioriteiten scherper')
    expect(homepageSource).toContain('te wegen en opvolging concreet te faciliteren.')
    expect(homepageSource).not.toContain('<TrustSection />')
    expect(homepageSource).not.toContain('Zorgvuldig meten.')
  })
})
