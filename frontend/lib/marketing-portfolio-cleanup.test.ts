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

  // Homepage SEO metadata/JSON-LD and the public login page must not name the
  // removed Action Center product. (Note: out of scope here and tracked
  // separately — the proof/positioning data in site-content.ts still references
  // it; rewording that touches the suite narrative.)
  it('homepage metadata and login page do not name Action Center', () => {
    expect(read('app/page.tsx')).not.toContain('Action Center')
    expect(read('app/(auth)/login/page.tsx')).not.toContain('Action Center')
  })
})

describe('Portfolio cleanup — /producten routekiezer', () => {
  const source = () => read('components/marketing/producten-content.tsx')

  it('keeps the three scans and drops the follow-on accordion', () => {
    expect(source()).toContain("title: 'Loep Vertrek'")
    expect(source()).toContain("title: 'Loep Behoud'")
    expect(source()).toContain("title: 'Loep Start'")
    expect(source()).not.toContain('FollowOnRoutesAccordion')
    expect(source()).not.toContain('UtilityRoutesSection')
  })

  it('uses a buyer-facing scan CTA, not the internal route-inschatting CTA', () => {
    // Geconsolideerde pagina gebruikt een per-scan CTA ("Bespreek of {scan.title} past").
    expect(source()).toContain('Bespreek of ')
    expect(source()).toContain(' past')
    expect(source()).not.toContain('route-inschatting')
  })
})

describe('Portfolio cleanup — three equal product pages', () => {
  const page = () => read('app/producten/[slug]/page.tsx')

  function slice(from: string, to: string) {
    return page().split(from)[1].split(to)[0]
  }

  it('Loep Vertrek ships the six service bullets and no ritme choice section', () => {
    const exit = page().split('function RetentionScanPage()')[0]
    expect(exit).toContain('Intake en scopebepaling')
    expect(exit).toContain('Survey klaarzetten en launchpakket leveren')
    expect(exit).toContain('Begeleide managementbespreking (60–90 min)')
    expect(exit).toContain('Eerste vervolgrichting vastgelegd')
    expect(exit).not.toContain('Kies baseline of ritmeroute')
    expect(exit).toContain('Bespreek of deze scan past')
  })

  it('Loep Behoud ships the six bullets, no ritme section, and a sharpened h1', () => {
    const retention = slice('function RetentionScanPage()', 'function OnboardingModernPage()')
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

describe('Portfolio cleanup — deferred public Action Center / removed-product references', () => {
  it('site-content proof layer no longer names the removed Action Center product', () => {
    expect(read('components/marketing/site-content.ts')).not.toContain('Action Center')
  })

  it('the orphaned Action Center homepage demo component is deleted', () => {
    expect(
      fs.existsSync(path.join(process.cwd(), 'components/marketing/home-insight-action-demo.tsx')),
    ).toBe(false)
  })

  it('the removed follow-on product routes return 404 instead of rendering', () => {
    const page = read('app/producten/[slug]/page.tsx')
    expect(page).toContain('PUBLICLY_REMOVED_PRODUCT_SLUGS')
    expect(page).toContain('PUBLICLY_REMOVED_PRODUCT_SLUGS.has(slug)) notFound()')
    for (const slug of ['pulse', 'leadership-scan', 'combinatie']) {
      expect(page).toContain(`'${slug}'`)
    }
  })

  it('the sitemap no longer advertises the removed product routes', () => {
    const sitemap = read('app/sitemap.ts')
    expect(sitemap).not.toContain('/producten/pulse')
    expect(sitemap).not.toContain('/producten/leadership-scan')
    expect(sitemap).not.toContain('/producten/combinatie')
  })

  it('the homepage Open Graph image does not name a removed product', () => {
    const og = read('app/opengraph-image.tsx')
    expect(og).not.toContain('Combinatie')
    expect(og).not.toContain('Pulse')
    expect(og).not.toContain('Leadership')
  })
})

describe('Portfolio cleanup — /tarieven shows three equal baselines', () => {
  const source = () => read('components/marketing/tarieven-content.tsx')

  it('renders Onboarding as a third €4.500 baseline card', () => {
    expect(source()).toContain('Loep Start Baseline')
    expect(source()).not.toContain('Action Center Start')
    expect(source()).not.toContain('Rest op aanvraag')
  })
})
