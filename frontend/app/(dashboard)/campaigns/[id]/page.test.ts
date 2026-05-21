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
  it('keeps the ExitScan dashboard free from owner, action, review, workflow and setup language', () => {
    const source = exitDashboardSource().toLowerCase()
    const forbiddenTerms = [
      'eerste eigenaar',
      'route-eigenaar',
      'eigenaar',
      'eerste actie',
      'eerste stap',
      'reviewmoment',
      'review plannen',
      'manager toegewezen',
      'action center',
      'workflow',
      'opvolgactie',
      'start actie',
      'maak actie',
      'follow-on',
      'uitvoerflow',
      'livegang',
      'importeren',
      'uitnodigingen beheren',
      'reminderactie',
      'setup',
    ]

    for (const term of forbiddenTerms) {
      expect(source).not.toContain(term)
    }
  })

  it('renders the agreed ExitScan analytical IA in the expected order', () => {
    const source = exitDashboardSource()
    const orderedHeadings = [
      'Sterkste signaal',
      'Waarom dit telt',
      'Hoofdreden van vertrekbeeld',
      'Meespelende factoren',
      'Responscontext',
      'Topfactoren',
      'Verdeling van het vertrekbeeld',
      'Diepere driverlaag',
      'SDT-laag',
      'Uitgebreide factorlaag',
      'Methodische leesgrenzen',
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

  it('keeps the visible ExitScan shell free from mojibake and uses a neutral score label', () => {
    const source = exitDashboardSource()

    expect(source).not.toContain('Ãƒ')
    expect(source).not.toContain('Ã‚')
    expect(source).not.toContain('Ã¢')
    expect(source).not.toContain('ï¿½')
    expect(source).toContain('Gemiddelde signaalscore')
    expect(source).not.toContain('Frictiescore')
  })

  it('renders the SDT layer only when real rows are available', () => {
    const source = exitDashboardSource()

    expect(source).toContain('sdtRows.length > 0')
    expect(source).toContain('ExitSdtNeedsChart')
  })
})
