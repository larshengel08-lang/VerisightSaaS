import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
}

// The browsable marketing surface a visitor can navigate to. The standalone
// /producten/[removed-slug] page functions are intentionally excluded — their
// technical removal is a separate track.
const BROWSABLE_SURFACE = [
  'components/marketing/producten-content.tsx',
  'components/marketing/tarieven-content.tsx',
  'components/marketing/home-page-content.tsx',
  'components/marketing/public-header.tsx',
  'components/marketing/public-footer.tsx',
  'components/marketing/solutions-dropdown.tsx',
]

const FORBIDDEN_ON_SURFACE = [
  'Pulse',
  'Leadership',
  'Combinatie',
  'Action Center',
  'primary routes',
  'Start scan',
  'Ontdek platform',
  'ritmeroute',
  'reviewcadans',
  'route-inschatting',
]

describe('Portfolio cleanup — browsable surface is free of removed products and self-serve language', () => {
  for (const file of BROWSABLE_SURFACE) {
    it(`${file} contains no forbidden portfolio terms`, () => {
      const source = read(file)
      for (const term of FORBIDDEN_ON_SURFACE) {
        expect(source, `${term} found in ${file}`).not.toContain(term)
      }
    })
  }

  it('Cultuurbeeld is not referenced on /tarieven', () => {
    expect(read('components/marketing/tarieven-content.tsx')).not.toContain('Cultuurbeeld')
  })
})

describe('Portfolio cleanup — /producten routekiezer', () => {
  const source = () => read('components/marketing/producten-content.tsx')

  it('keeps the three scans and drops the follow-on accordion', () => {
    expect(source()).toContain("title: 'ExitScan'")
    expect(source()).toContain("title: 'RetentieScan'")
    expect(source()).toContain("title: 'Onboarding 30-60-90'")
    expect(source()).not.toContain('FollowOnRoutesAccordion')
    expect(source()).not.toContain('UtilityRoutesSection')
  })

  it('uses the kennismaking CTA, not the internal route-inschatting CTA', () => {
    expect(source()).toContain('Plan een kennismaking')
  })
})

describe('Portfolio cleanup — three equal product pages', () => {
  const page = () => read('app/producten/[slug]/page.tsx')

  function slice(from: string, to: string) {
    return page().split(from)[1].split(to)[0]
  }

  it('ExitScan ships the six service bullets and no ritme choice section', () => {
    const exit = page().split('function RetentionScanPage()')[0]
    expect(exit).toContain('Intake en scopebepaling')
    expect(exit).toContain('Survey klaarzetten en launchpakket leveren')
    expect(exit).toContain('Begeleide managementbespreking (60–90 min)')
    expect(exit).toContain('Eerste vervolgrichting vastgelegd')
    expect(exit).not.toContain('Kies baseline of ritmeroute')
    expect(exit).toContain('Bespreek of deze scan past')
  })

  it('RetentieScan ships the six bullets, no ritme section, and a sharpened h1', () => {
    const retention = slice('function RetentionScanPage()', 'function PulsePage()')
    expect(retention).toContain('Intake en scopebepaling')
    expect(retention).toContain('Eerste vervolgrichting vastgelegd')
    expect(retention).not.toContain('Kies baseline of ritmeroute')
    expect(retention).toContain('Bespreek of deze scan past')
    expect(retention).toContain('voordat uitstroom zichtbaar wordt')
  })

  it('Onboarding is a €4.500 baseline with the six bullets and no ritme/hercheck section', () => {
    const onboarding = slice('function OnboardingModernPage()', 'function OnboardingPage()')
    expect(onboarding).toContain('vanaf €4.500')
    expect(onboarding).not.toContain('op aanvraag')
    expect(onboarding).toContain('Intake en scopebepaling')
    expect(onboarding).toContain('Eerste vervolgrichting vastgelegd')
    expect(onboarding).not.toContain('Kies baseline of hercheckmoment')
    expect(onboarding).toContain('Bespreek of deze scan past')
  })
})

describe('Portfolio cleanup — /tarieven shows three equal baselines', () => {
  const source = () => read('components/marketing/tarieven-content.tsx')

  it('renders Onboarding as a third €4.500 baseline card', () => {
    expect(source()).toContain('Onboarding 30-60-90 Baseline')
    expect(source()).not.toContain('Action Center Start')
    expect(source()).not.toContain('Rest op aanvraag')
  })
})
