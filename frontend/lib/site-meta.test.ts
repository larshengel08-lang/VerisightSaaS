import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { metadata as homePageMetadata } from '@/app/page'
import { HOME_SCHEMA_DESCRIPTION, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site-meta'

function source(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8').replace(/\s+/g, ' ')
}

describe('paginatitel en beschrijving (besluit Lars 20-9-2026)', () => {
  it('heeft de titel die de koopreden raakt', () => {
    expect(SITE_TITLE).toBe('Loep | Zie waar behoud onder druk staat, voordat mensen gaan')
  })

  it('draagt het geldanker en zegt eerlijk wat je koopt en wat je zelf doet', () => {
    expect(SITE_DESCRIPTION).toBe(
      "Eén vertrokken medewerker vervangen kost al snel tienduizenden euro's. Loep laat zien waar behoud onder druk staat, waarom volgens je mensen zelf, en waar je begint. Meting en rapport; het gesprek voer je zelf.",
    )
  })

  it('belooft geen uitkomst en noemt geen hard bedrag voor vertrekkosten', () => {
    for (const text of [SITE_TITLE, SITE_DESCRIPTION, HOME_SCHEMA_DESCRIPTION]) {
      expect(text).not.toMatch(/minder verloop|bespaar|verlaag|voorkom|garant/i)
      expect(text).not.toMatch(/[€]\s?\d/)
      expect(text).not.toMatch(/[–—]/)
      expect(text).not.toMatch(/begeleid|inbegrepen/i)
    }
  })

  it('zegt in de JSON-LD van de homepage dat het rapport het gesprek leidt en dat je het zelf voert', () => {
    expect(HOME_SCHEMA_DESCRIPTION).toContain('Meting van behoud, vertrek en onboarding voor HR en management')
    expect(HOME_SCHEMA_DESCRIPTION).toContain('dat gesprek voer je zelf')
  })
})

describe('layout en homepage gebruiken de ene bron', () => {
  it('app/layout.tsx heeft geen eigen titel of beschrijving meer', () => {
    const layout = source('app/layout.tsx')
    expect(layout).toContain('default: SITE_TITLE')
    expect(layout.split('title: SITE_TITLE').length - 1).toBe(2)
    expect(layout.split('description: SITE_DESCRIPTION').length - 1).toBe(3)
    expect(layout).not.toContain("'Loep |")
  })

  it('app/page.tsx exporteert de titel en de beschrijving uit lib/site-meta.ts', () => {
    expect(homePageMetadata.title).toBe(SITE_TITLE)
    expect(homePageMetadata.description).toBe(SITE_DESCRIPTION)
    expect(source('app/page.tsx')).toContain('description: HOME_SCHEMA_DESCRIPTION')
  })
})

describe('link-preview (app/opengraph-image.tsx)', () => {
  const og = () => source('app/opengraph-image.tsx')

  it('draagt dezelfde kop en categorieregel als de site', () => {
    expect(og()).toContain('Zie waar behoud onder druk staat, voordat mensen gaan.')
    expect(og()).toContain('Meting en rapport. Het gesprek met je MT voer je zelf.')
  })

  it('noemt de drie scans en geen Loep Cultuurbeeld of intern jargon', () => {
    expect(og()).toContain('Loep Behoud · Loep Vertrek · Loep Start')
    expect(og()).not.toContain('Cultuurbeeld')
    expect(og()).not.toContain('primary routes')
    expect(og()).not.toContain('commerciële flow')
  })
})
