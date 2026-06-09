import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  homepageProofSignals,
  publicProofCards,
  statCards,
  trustHubAnswerCards,
  trustSignalHighlights,
} from '@/components/marketing/site-content'

describe('Marketing proof layer', () => {
  it('anchors public proof on the live suite and bounded manager access model', () => {
    expect(homepageProofSignals).toContain('Eén suite-login voor dashboard, rapport en Action Center')
    expect(homepageProofSignals).toContain('HR kan managers per afdeling toewijzen zonder survey-inzichten open te zetten')
    expect(homepageProofSignals).toContain('Publieke proof verschijnt pas na expliciete approval en provenance')
    expect(statCards.some((card) => card.value === '1 suite-login')).toBe(true)
    expect(statCards.some((card) => card.value === '2 modules')).toBe(true)
    expect(statCards.some((card) => card.value === 'Afdelingstoewijzing')).toBe(true)
    expect(trustSignalHighlights.some((item) => item.title === 'Manager-scope blijft bounded')).toBe(true)
    expect(
      trustHubAnswerCards.some(
        (card) =>
          card.title === 'Hoe werkt manager-toegang?' &&
          card.body.toLowerCase().includes('alleen action center'),
      ),
    ).toBe(true)
    expect(publicProofCards.every((card) => card.approval === 'public_usable')).toBe(true)
  })

  it('keeps the homepage Action Center proof explicit about assignment and review', () => {
    const homeSource = fs.readFileSync(path.join(process.cwd(), 'components', 'marketing', 'home-page-content.tsx'), 'utf8')

    expect(homeSource).toContain('HR kan acties expliciet toewijzen')
    expect(homeSource).toContain('alleen de opvolglaag zien')
  })
})
