import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentSource = () =>
  readFileSync(
    new URL('../../../../components/dashboard/retention-product-dashboard.tsx', import.meta.url),
    'utf8',
  )

describe('retention boardroom dashboard guardrails', () => {
  it('keeps the RetentieScan dashboard free from exit-only and unsafe wording', () => {
    const source = componentSource().toLowerCase()
    const forbiddenTerms = [
      'vertrekbeeld',
      'exitscan',
      'oorzakenanalyse',
      'gedreven door',
      'diagnose',
      'predictie',
      'strong editorial confidence',
      'retention flow',
    ]

    for (const term of forbiddenTerms) {
      expect(source).not.toContain(term)
    }
  })

  it('renders the agreed RetentieScan boardroom IA in the expected order', () => {
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
})
