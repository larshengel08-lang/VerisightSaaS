import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Fixronde-punt 1 (2026-10-11/12, feature/behoud-mto-alternatief): een begin-route
 * die niet in CONTACT_ROUTE_OPTIONS staat (bijv. 'culture_assessment' uit de URL,
 * of afgeleid via inferRouteInterestFromSource) mag de <select> niet stilzwijgend
 * de eerste optie laten tonen terwijl de verborgen waarde wordt verzonden. Deze
 * bron-check bevestigt dat ContactForm zowel de initiele state als de resolvedRoute
 * uit de useEffect door visibleContactRouteInterest haalt, zodat zichtbaar en
 * verzonden altijd gelijk zijn.
 */
const ROOT = fileURLToPath(new URL('../..', import.meta.url))

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('ContactForm gebruikt visibleContactRouteInterest voor de beginwaarde', () => {
  const source = read('components/marketing/contact-form.tsx')

  it('importeert de helper', () => {
    expect(source).toMatch(/visibleContactRouteInterest/)
  })

  it('past de helper toe op de initiele useState-waarde', () => {
    expect(source).toMatch(/routeInterest:\s*visibleContactRouteInterest\(defaultRouteInterest\)/)
  })

  it('past de helper toe op de resolvedRoute uit de useEffect (URL/cta_source-afleiding)', () => {
    expect(source).toMatch(/const resolvedRoute = visibleContactRouteInterest\(/)
  })
})
