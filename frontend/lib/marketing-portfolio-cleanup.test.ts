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

  // Site-ronde besluit A (2026-09-20): /tarieven en /aanpak verwezen al door en
  // zijn als pagina verwijderd. De redirect is het enige dat overblijft; de
  // tarieven staan op /producten#tarieven en komen uit lib/pricing.ts.
  it('/tarieven en /aanpak bestaan alleen nog als redirect naar /producten', () => {
    for (const rel of [
      'app/tarieven/page.tsx',
      'components/marketing/tarieven-content.tsx',
      'app/aanpak/page.tsx',
      'components/marketing/aanpak-content.tsx',
    ]) {
      expect(fs.existsSync(path.join(process.cwd(), rel)), `${rel} hoort weg te zijn`).toBe(false)
    }
    const config = read('next.config.ts')
    expect(config).toContain("{ source: '/tarieven', destination: '/producten#tarieven', permanent: true }")
    expect(config).toContain("{ source: '/aanpak', destination: '/producten', permanent: true }")
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

// Site-ronde besluit A (2026-09-20): de detailpagina's van Loep Vertrek, Loep
// Behoud en Loep Start verwezen sinds 17 juni door en zijn verwijderd. Wat dit
// blok vroeger bewaakte (zes dienst-bullets per pagina) staat nu één keer op
// /producten en wordt bewaakt door lib/site-ronde-besluit-a.guard.test.ts.
describe("Portfolio cleanup: detailpagina's van Vertrek, Behoud en Start zijn weg, de redirects blijven", () => {
  const page = () => read('app/producten/[slug]/page.tsx')

  it('heeft de vier dode paginafuncties niet meer en houdt Loep Cultuurbeeld', () => {
    for (const name of ['ExitScanPage', 'RetentionScanPage', 'OnboardingModernPage', 'OnboardingPage']) {
      expect(page(), `${name} hoort weg te zijn`).not.toContain(`function ${name}(`)
    }
    expect(page()).toContain('function CultureAssessmentPage()')
    expect(page()).toContain('function UpcomingProductPage(')
  })

  it('stuurt de drie slugs ook in de pagina zelf door, als vangnet naast next.config.ts', () => {
    expect(page()).toContain('REDIRECTED_PRODUCT_ANCHORS')
    expect(page()).toContain('if (redirectTarget) permanentRedirect(redirectTarget)')
    expect(page()).toContain("exitscan: '/producten#loep-vertrek'")
    expect(page()).toContain("retentiescan: '/producten#loep-behoud'")
    expect(page()).toContain("'onboarding-30-60-90': '/producten#loep-start'")
  })

  it('houdt de drie redirects in next.config.ts', () => {
    const config = read('next.config.ts')
    expect(config).toContain("{ source: '/producten/exitscan', destination: '/producten#loep-vertrek', permanent: true }")
    expect(config).toContain("{ source: '/producten/retentiescan', destination: '/producten#loep-behoud', permanent: true }")
    expect(config).toContain("{ source: '/producten/onboarding-30-60-90', destination: '/producten#loep-start', permanent: true }")
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
