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
    expect(homepageSource).toContain('Zie sneller waar vertrek, behoud of onboarding aandacht vragen')
    expect(homepageSource).toContain('Verisight helpt HR en leiding signalen zichtbaar maken, prioriteren wat eerst telt en opvolging organiseren in het Action Center.')
    expect(homepageSource).toContain('Plan een kennismaking')
    expect(homepageSource).toContain('Bekijk voorbeeldoutput')
    expect(homepageSource).toContain('Dashboard voor inzicht')
    expect(homepageSource).toContain('Managementrapport voor duiding')
    expect(homepageSource).toContain('Action Center voor opvolging')
    expect(homepageSource).toContain('AVG-bewust')
    expect(homepageSource).toContain('Veel signalen. Nog geen scherp beeld van wat eerst telt.')
    expect(homepageSource).toContain('Organisaties zien signalen — rond uitstroom, behoud of vroege landing — maar missen de vertaalslag naar')
    expect(homepageSource).toContain('een heldere managementprioriteit en concrete opvolging.')
    expect(homepageSource).toContain('Verspreide signalen')
    expect(homepageSource).toContain('Onduidelijke prioriteit')
    expect(homepageSource).toContain('Opvolging blijft te los')
    expect(homepageSource).toContain('Eerst inzicht. Dan duiding. Dan opvolging.')
    expect(homepageSource).toContain('Verisight brengt analyse en vervolg samen in één heldere managementflow.')
    expect(homepageSource).toContain('Begrijpen')
    expect(homepageSource).toContain('Dashboard')
    expect(homepageSource).toContain('Managementrapport')
    expect(homepageSource).toContain('Action Center')
    expect(homepageSource).toContain('<ManagementFlowSection />')
    expect(homepageSource).toContain('Geen losse output.')
    expect(homepageSource).toContain('Wel een helder besluitspoor.')
    expect(homepageSource).toContain('<ProblemSection />')
  })
})
