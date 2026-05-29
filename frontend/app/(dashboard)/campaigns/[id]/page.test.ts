import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = () =>
  readFileSync(
    new URL('../../../../components/dashboard/exit-product-dashboard.tsx', import.meta.url),
    'utf8',
  )

describe('exit dashboard analytics guardrails', () => {
  it('keeps the ExitScan dashboard free from owner, action, review, workflow and setup language', () => {
    const source = componentSource().toLowerCase()
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
    const source = componentSource()
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
    const source = componentSource()

    expect(source).not.toContain('?? 0')
    expect(source.toLowerCase()).not.toContain('mock')
    expect(source.toLowerCase()).not.toContain('placeholder')
    expect(source).toContain('Nog niet beschikbaar')
    expect(source).toContain('Onvoldoende data')
  })

  it('keeps the visible ExitScan shell free from mojibake and uses a neutral score label', () => {
    const source = componentSource()

    expect(source).not.toContain('Ã')
    expect(source).not.toContain('Â')
    expect(source).not.toContain('â')
    expect(source).not.toContain('�')
    expect(source).toContain('Gemiddelde signaalscore')
    expect(source).not.toContain('Frictiescore')
  })

  it('renders the SDT layer only when real rows are available', () => {
    const source = componentSource()

    expect(source).toContain('sdtRows.length > 0')
    expect(source).toContain('ExitSdtNeedsChart')
  })

  it('keeps culture assessment on an explicit primary-route branch instead of falling back to pulse framing', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const primaryRouteIndex = source.indexOf('familyRoleLabel: "Primary route"')
    const cultureBranch = primaryRouteIndex >= 0
      ? source.slice(Math.max(0, primaryRouteIndex - 600), primaryRouteIndex + 7000)
      : ''

    expect(source).toContain('buildDashboardArchitecture({')
    expect(primaryRouteIndex).toBeGreaterThan(-1)
    expect(cultureBranch).toContain('familyRoleLabel: "Primary route"')
    expect(cultureBranch).toContain('summarySignalLabel: "Loep Culture Index"')
    expect(cultureBranch).toContain('summaryContextLabel: "Jaarlijkse cultuur- en engagementbaseline"')
    expect(cultureBranch).toContain('routeTitle: "Board-read & vervolgritme"')
    expect(cultureBranch).toContain('geen onmiddellijke vervolgrichting')
    expect(cultureBranch).toContain('RetentieScan')
    expect(cultureBranch).toContain('ExitScan')
    expect(cultureBranch).not.toContain('Pulsesignaal')
    expect(cultureBranch).not.toContain('Pulse groepsread')
    expect(cultureBranch).not.toContain('Begrensde support-route')
  })

  it('wires culture assessment pages to the canonical executive reading order', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const cultureReturn = source.match(
      /if \(showManagementOutput && stats\.scan_type === "culture_assessment"\)[\s\S]*?if \(\s*showManagementOutput &&\s*\(stats\.scan_type === "exit" \|\| stats\.scan_type === "retention"\)/,
    )?.[0] ?? ''

    const orderedLabels = [
      '1. Responsbasis & meetdekking',
      '2. Executive culture read',
      '3. Loep Culture Index',
      '4. Board attention points',
      '5. Domeinbeeld',
      '6. Patronen in samenhang',
      '7. Segmentcontrasten',
      '8. Verdiepingslagen',
      '9. Open signalen',
      '10. Board-read & vervolgritme',
      '11. Rapport, export & methodiek',
    ]

    let previousIndex = -1
    for (const label of orderedLabels) {
      const nextIndex = cultureReturn.indexOf(label)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }
  })

  it('keeps culture governed export guidance explicit about baseline release, segment deep dive and owner-admin gating', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Governed segmentexport blijft in deze pilotlaag alleen open voor owner/adminrollen na baselinevrijgave.')
    expect(source).toContain('Segment deep dive is in v1 alleen admin/manual-seeded; zonder die inrichting blijft de organisatiebrede read leidend.')
    expect(source).toContain('Segment deep dive is in v1 admin/manual-seeded ingericht, maar governed export blijft dicht tot de baseline formeel is vrijgegeven.')
  })

  it('surfaces premium board deliverables and bounded text-safety states directly in the culture read layer', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Boardroom PDF-deck')
    expect(source).toContain('Pilot delivery-ready')
    expect(source).toContain('Executive one-pager')
    expect(source).toContain('Blueprint, nog geen standaarddeliverable')
    expect(source).toContain('Veilige samenvatting zichtbaar')
    expect(source).toContain('Verborgen door drempel of gevoelige inhoud')
  })

  it('surfaces hidden-reason boundaries and HR governed analysis as bounded governance layers', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Verborgen laagreden')
    expect(source).toContain('Drempel, vrijgave of entitlement')
    expect(source).toContain('HR governed analysis')
    expect(source).toContain('HR kan veilige segmentlagen, hidden reasons en exportstatus lezen')
    expect(source).toContain('Geen vrije slicing, quote browsing of lokale blame-laag')
  })

  it('keeps culture deepening layers tied to real culture domains instead of fabricated SDT fallback scores', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const cultureReturn = source.match(
      /if \(showManagementOutput && stats\.scan_type === "culture_assessment"\)[\s\S]*?if \(\s*showManagementOutput &&\s*\(stats\.scan_type === "exit" \|\| stats\.scan_type === "retention"\)/,
    )?.[0] ?? ''

    expect(cultureReturn).toContain('autonomy_role_clarity')
    expect(cultureReturn).toContain('growth_development')
    expect(cultureReturn).toContain('organizational_connection_intent')
    expect(cultureReturn).not.toContain('factorData.sdtAverages[dimension] ?? 5.5')
    expect(cultureReturn).not.toContain('["autonomy", "competence", "relatedness"]')
  })

  it('keeps the culture domain list framed as a leesvolgorde instead of a ranking table', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const cultureReturn = source.match(
      /if \(showManagementOutput && stats\.scan_type === "culture_assessment"\)[\s\S]*?if \(\s*showManagementOutput &&\s*\(stats\.scan_type === "exit" \|\| stats\.scan_type === "retention"\)/,
    )?.[0] ?? ''

    expect(cultureReturn).toContain('bestuurlijke leesvolgorde')
    expect(cultureReturn).toContain('Lees {String(index + 1).padStart(2, "0")}')
    expect(cultureReturn).toContain('geen ranking van teams, managers of domeinen als waardeoordeel')
  })
})
