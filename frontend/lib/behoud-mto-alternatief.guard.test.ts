import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Loep Behoud als alternatief voor het grote jaarlijkse MTO (besluit Lars
 * 11-10-2026). Spec: docs/superpowers/specs/2026-10-11-behoud-als-mto-alternatief-design.md,
 * par. 4. Deze guard leest de bron van elk gerenderd marketingbestand plus de
 * dashboard-methodiekkaart van Loep Behoud.
 */
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const MARKETING_DIR = 'components/marketing'

const EXPLICIT_FILES = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/opengraph-image.tsx',
  'app/producten/page.tsx',
  'app/producten/[slug]/page.tsx',
  'app/kennismaking/page.tsx',
  'app/vertrouwen/page.tsx',
  'app/pilot/page.tsx',
  'lib/site-meta.ts',
  'lib/pricing.ts',
  'public/llms.txt',
]

// Klantzichtbaar in het dashboard (MethodologyCard in campaigns/[id]/page-helpers.tsx).
const DASHBOARD_FILES = ['lib/products/retention/definition.ts']

function marketingFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, MARKETING_DIR))
    .filter((name) => /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
    .map((name) => `${MARKETING_DIR}/${name}`)
    .sort()
}

function publicHtmlFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, 'public'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.html?$/i.test(entry.name))
    .map((entry) => `public/${entry.name}`)
    .sort()
}

const RENDERED_FILES = [...marketingFiles(), ...publicHtmlFiles(), ...EXPLICIT_FILES, ...DASHBOARD_FILES]

function read(rel: string): string {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) throw new Error(`Gerenderd bestand ontbreekt: ${rel}`)
  return fs
    .readFileSync(full, 'utf8')
    .replace(/\{\s*['"] ['"]\s*\}/g, ' ')
    .replace(/\s+/g, ' ')
}

/** Zinnen (grof) waarin MTO of medewerkersonderzoek voorkomt. */
function mtoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|['"`]\s*,\s*['"`]/).filter((s) => /\bMTO\b|medewerkersonderzoek/i.test(s))
}

const FORBIDDEN: Array<[string, RegExp]> = [
  ['MTO als productnaam', /\bLoep[\s-]?MTO\b|\bhet Loep-MTO\b/i],
  ['vervangingsclaim', /vervangt\s+(je|jouw|het|uw)\s+MTO/i],
  ['volledigheidsclaim', /\bvolledig(e)?\s+MTO\b|alles wat een MTO meet/i],
  ['oude afwijzing', /geen brede MTO\b|geen breed MTO-project|MTO-light|Is Loep Behoud gewoon een MTO/i],
  // Alleen claims dat Loep zelf vergelijkt. "Wil je je scores vergelijken met andere
  // organisaties, dan past een groot MTO beter" is de eerlijke grens en mag.
  ['benchmarkclaim', /branchegemiddelde|branchevergelijking|benchmarkscore|normscore|\b(Loep|we|wij|het rapport)\s+vergelijk\w*\s+(je\s+)?met\s+(de markt|andere organisaties|je branche)/i],
  [
    'bedrag per medewerker',
    /€\s?\d[\d.,]*[^.;]{0,60}\b(per medewerker|p\.p\.|per persoon)\b|\b(per medewerker|p\.p\.|per persoon)\b[^.;]{0,60}€\s?\d/i,
  ],
]

describe('Loep Behoud als MTO-alternatief: copyregels', () => {
  for (const rel of RENDERED_FILES) {
    it(`${rel} volgt de copyregels`, () => {
      const text = read(rel)
      for (const [naam, patroon] of FORBIDDEN) {
        const hit = text.match(patroon)
        expect(hit?.[0] ?? null, `${naam} in ${rel}`).toBeNull()
      }
      for (const zin of mtoSentences(text)) {
        expect(zin, `aantal vragen naast MTO in ${rel}`).not.toMatch(/\b\d+\s*(vragen|stellingen)\b/i)
        expect(zin, `superlatief naast MTO in ${rel}`).not.toMatch(/\b(de kortste|razendsnel|slechts|maar \d+ minuten)\b/i)
      }
    })
  }

  it('de positionering staat op /producten en in de FAQ', () => {
    const producten = read('components/marketing/producten-content.tsx')
    expect(producten).toContain('Een alternatief voor het grote jaarlijkse MTO')
    expect(producten).toContain('Het korte medewerkersonderzoek')
    const faq = read('components/marketing/site-content.ts')
    expect(faq).toContain('Is Loep Behoud een MTO?')
  })

  /**
   * Regel 4.4: "kort" alleen naast de echte invultijd. INVULTIJD is de letterlijke
   * waarde uit de bron van Taak 0 stap 5: `SURVEY_DURATION_LABEL` in
   * frontend/lib/campaign-setup.ts, retention = 'ongeveer 6 minuten' (afgeleid van
   * SURVEY_MINUTES). INVULTIJD_IDENT is de naam van die constante als die in de
   * frontend wordt geïmporteerd (Taak 2 stap 5). Een bestand is in orde als het een
   * van beide bevat.
   */
  const INVULTIJD = 'ongeveer 6 minuten'
  const INVULTIJD_IDENT = 'SURVEY_DURATION_LABEL'

  it('elk bestand met "korte medewerkersonderzoek" noemt ook de invultijd', () => {
    const metKort = RENDERED_FILES.filter((rel) => /korte medewerkersonderzoek/i.test(read(rel)))
    expect(metKort.length).toBeGreaterThan(0)
    for (const rel of metKort) {
      const text = read(rel)
      expect(text.includes(INVULTIJD) || text.includes(INVULTIJD_IDENT), `invultijd ontbreekt in ${rel}`).toBe(true)
    }
  })

  it('de keuzehulp noemt grootte niet als reden voor een groot MTO', () => {
    const producten = read('components/marketing/producten-content.tsx')
    expect(producten).not.toMatch(/1\.000 of meer medewerkers[^']{0,40}MTO|MTO[^']{0,80}1\.000/i)
  })
})
