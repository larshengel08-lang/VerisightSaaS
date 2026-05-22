import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = () =>
  readFileSync(
    new URL('../../../../components/dashboard/exit-product-dashboard.tsx', import.meta.url),
    'utf8',
  )

describe('exit dashboard analytics guardrails', () => {
  it('keeps the ExitScan dashboard free from causal, predictive and retention wording', () => {
    const source = componentSource().toLowerCase()
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
    const source = componentSource()
    const orderedHeadings = [
      'Kernsignaal',
      'Responsbasis / leessterkte',
      'Signaalopbouw',
      'Prioriteitenbeeld',
      'Basisbehoeften / SDT',
      'Survey-stemmen',
      'Bestuurlijke handoff',
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

  it('keeps the visible ExitScan shell free from mojibake and uses the product score language', () => {
    const source = componentSource()

    expect(source).not.toContain('Ã')
    expect(source).not.toContain('Â')
    expect(source).not.toContain('â')
    expect(source).not.toContain('�')
    expect(source).toContain('Frictiescore')
    expect(source).toContain('Leessterkte')
  })

  it('renders the SDT layer only when real rows are available', () => {
    const source = componentSource()

    expect(source).toContain('sdtRows.length > 0')
    expect(source).toContain('SdtTriangleMap')
  })
})
