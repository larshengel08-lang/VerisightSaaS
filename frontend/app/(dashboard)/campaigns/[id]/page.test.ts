import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const routePageSource = () => readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

const exitDashboardSource = () =>
  readFileSync(
    new URL('../../../../components/dashboard/exit-product-dashboard.tsx', import.meta.url),
    'utf8',
  )

describe('campaign detail route shell guardrails', () => {
  it('keeps campaign detail the only surface that can open a new action center route', () => {
    const source = routePageSource()
    const normalized = source.replaceAll('"', "'")

    expect(source).toContain('canOpenActionCenterRoute(deliveryRecord)')
    expect(source).toContain('first_management_use_confirmed_at')
    expect(normalized).toContain(".select('id, lifecycle_stage, first_management_use_confirmed_at, updated_at')")
  })

  it('keeps the shared route shell on the results-first block order and without the old tabs', () => {
    const source = routePageSource()

    expect(source).toContain('Responsbasis')
    expect(source).toContain('Kernsignaal')
    expect(source).toContain('Signalen in samenhang')
    expect(source).toContain('Drivers & prioriteiten')
    expect(source).toContain('Verdiepingslagen')
    expect(source).toContain('Survey-stemmen')
    expect(source).not.toContain('DashboardTabs')
    expect(source).not.toContain("label: 'Overzicht'")
    expect(source).not.toContain("label: 'Onderbouwing'")
    expect(source).not.toContain("label: 'Actie'")
    expect(source).not.toContain("label: 'Campagne'")
  })

  it('keeps culture assessment on an explicit boardroom baseline branch with governed follow-on language', () => {
    const source = routePageSource()

    expect(source).toContain("if (stats.scan_type === 'culture_assessment')")
    expect(source).toContain('Loep Cultuurbeeld')
    expect(source).toContain('Jaarlijkse board baseline')
    expect(source).toContain('Loep Culture Index')
    expect(source).toContain('No immediate next route blijft een geldige uitkomst.')
    expect(source).toContain('RetentieScan')
    expect(source).toContain('ExitScan')
  })

  it('keeps culture domain presentation framed as a leesvolgorde instead of a ranking table', () => {
    const source = routePageSource()

    expect(source).toContain('bestuurlijke leesvolgorde')
    expect(source).toContain("Lees {String(index + 1).padStart(2, '0')}")
    expect(source).toContain('geen ranking van teams, managers of domeinen als waardeoordeel')
    expect(source).not.toContain('factorData.sdtAverages[dimension] ?? 5.5')
  })

  it('surfaces governed export, hidden reasons and HR analysis as explicit culture governance layers', () => {
    const source = routePageSource()

    expect(source).toContain('Segment deep dive is in v1 alleen admin/manual-seeded; zonder die inrichting blijft de organisatiebrede read leidend.')
    expect(source).toContain('Segment deep dive is in v1 admin/manual-seeded ingericht, maar governed export blijft dicht tot de baseline formeel is vrijgegeven.')
    expect(source).toContain('Governed segmentexport blijft in deze pilotlaag alleen open voor owner/adminrollen na baselinevrijgave.')
    expect(source).toContain('Verborgen laagreden')
    expect(source).toContain('Drempel, vrijgave of entitlement')
    expect(source).toContain('HR governed analysis')
    expect(source).toContain('Geen vrije slicing, quote browsing of lokale blame-laag.')
  })

  it('surfaces premium board deliverables and bounded text-safety states in the culture branch', () => {
    const source = routePageSource()

    expect(source).toContain('Boardroom PDF-deck')
    expect(source).toContain('Pilot delivery-ready')
    expect(source).toContain('Executive one-pager')
    expect(source).toContain('Blueprint, nog geen standaarddeliverable')
    expect(source).toContain('Veilige samenvatting zichtbaar')
    expect(source).toContain('Verborgen door drempel of gevoelige inhoud')
  })
})

describe('exit dashboard analytics guardrails', () => {
  it('keeps the ExitScan dashboard free from causal, predictive and retention wording', () => {
    const source = exitDashboardSource().toLowerCase()
    const forbiddenTerms = [
      'gedreven door',
      'oorzakenanalyse',
      'diagnose',
      'predictie',
      'retention flow',
      'strong editorial confidence',
      'high impact',
      'active risk',
    ]

    for (const term of forbiddenTerms) {
      expect(source).not.toContain(term)
    }
  })

  it('renders the agreed ExitScan boardroom IA in the expected order', () => {
    const source = exitDashboardSource()
    const orderedHeadings = [
      'eyebrow="1. Kernsignaal"',
      'eyebrow="2. Responsbasis / leessterkte"',
      'eyebrow="3. Signaalopbouw"',
      'eyebrow="4. Prioriteitenbeeld"',
      'eyebrow="5. Basisbehoeften / SDT"',
      'eyebrow="6. Survey-stemmen"',
      'eyebrow="7. Management handoff"',
    ]

    let previousIndex = -1
    for (const heading of orderedHeadings) {
      const index = source.indexOf(heading)
      expect(index, `${heading} ontbreekt`).toBeGreaterThan(-1)
      expect(index, `${heading} staat buiten volgorde`).toBeGreaterThan(previousIndex)
      previousIndex = index
    }
  })

  it('does not rely on mockdata or silent 0-fallbacks for meaningful dashboard values', () => {
    const source = exitDashboardSource()

    expect(source).not.toContain('?? 0')
    expect(source.toLowerCase()).not.toContain('mock')
    expect(source.toLowerCase()).not.toContain('placeholder')
    expect(source).toContain('Nog niet beschikbaar')
    expect(source).toContain('Onvoldoende data')
  })

  it('keeps the visible ExitScan shell free from mojibake and uses the product score language', () => {
    const source = exitDashboardSource()

    expect(source).not.toContain('ÃƒÆ’')
    expect(source).not.toContain('Ãƒâ€š')
    expect(source).not.toContain('ÃƒÂ¢')
    expect(source).not.toContain('Ã¯Â¿Â½')
    expect(source).toContain('Frictiescore')
    expect(source).toContain('Leessterkte')
  })

  it('renders the SDT layer only when real rows are available', () => {
    const source = exitDashboardSource()

    expect(source).toContain('sdtRows.length > 0')
    expect(source).toContain('SdtTriangleMap')
  })

  it('surfaces a compact executive strip and safer customer-facing labels', () => {
    const source = exitDashboardSource()

    expect(source).toContain('Dominant thema')
    expect(source).toContain('Scherpste factor')
    expect(source).toContain('Responsbasis')
    expect(source).toContain('Bestuurlijke vraag')
    expect(source).toContain('Resultaten beschikbaar')
    expect(source).toContain('terugblik op vertrekredenen')
    expect(source).not.toContain('Vertrekladder')
    expect(source).not.toContain('Sterk werksignaal')
    expect(source).not.toContain('managementread')
    expect(source).not.toContain('workflowproduct')
    expect(source).not.toContain('leesdiscipline')
  })

  it('keeps trust copy bounded and the handoff in customer language', () => {
    const source = exitDashboardSource()

    expect(source).toContain('Indicatief patroonbeeld, geen causale verdeling.')
    expect(source).toContain('Detailinzichten worden alleen getoond bij voldoende respons.')
    expect(source).toContain('anonimiteit te beschermen')
    expect(source).toContain('Sluit af met een eerste verificatiespoor, een eigenaar en een concreet reviewmoment.')
    expect(source).toContain('eerst bespreken voordat bredere actie volgt')
    expect(source).not.toContain('suppressieregels')
    expect(source).not.toContain('geen workflowproduct')
  })
})

