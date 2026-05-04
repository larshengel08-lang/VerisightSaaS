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
})
