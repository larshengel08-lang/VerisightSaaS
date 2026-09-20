import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { PRICING_TIERS, formatThousands } from '@/lib/pricing'

/**
 * Propositiebesluit A (19-9-2026) en de prijsstaffel (20-9-2026): de bespreking
 * door Loep is uit het aanbod, "begeleid" en "geen zelfbedieningstool" zijn uit
 * de positionering, en elk Loep-bedrag komt uit lib/pricing.ts. Deze guard leest
 * de bron van elk gerenderd marketingbestand, zodat de oude belofte niet
 * terugsluipt. Spec: docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md.
 *
 * Juridische pagina's (app/privacy, app/voorwaarden, app/dpa) vallen buiten de
 * ronde en staan hier bewust niet in.
 */
const ROOT = process.cwd()
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

function marketingFiles(): string[] {
  return fs
    .readdirSync(path.join(ROOT, MARKETING_DIR))
    .filter((name) => /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
    .map((name) => `${MARKETING_DIR}/${name}`)
    .sort()
}

const RENDERED_FILES = [...marketingFiles(), ...EXPLICIT_FILES]

/** Fail Loud: een ontbrekend bestand is een fout, geen overgeslagen controle. */
function read(rel: string): string {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) throw new Error(`Gerenderd marketingbestand ontbreekt: ${rel}`)
  // JSX breekt lopende tekst over regels af; vergelijken gaat op één regel.
  return fs.readFileSync(full, 'utf8').replace(/\s+/g, ' ')
}

const FORBIDDEN: Array<[string, RegExp]> = [
  ['het woord "begeleid" in elke vorm', /begeleid/i],
  ['"managementbespreking"', /managementbespreking/i],
  ['"bespreking inbegrepen" of "gesprek inbegrepen"', /(bespreking|gesprek)\s+(standaard\s+)?inbegrepen/i],
  ['"zelfbedieningstool"', /zelfbedien/i],
  ['"geduid door HR-specialisten"', /geduid door hr-specialisten/i],
  ['"Loep doet de meting", "het werk" of "de opzet"', /loep doet (de|het) (meting|werk|opzet)/i],
  ['"Loep voert uit" of "Loep voert de scan uit"', /loep voert (uit|de )/i],
  [
    '"beheert geen software of tool" en varianten',
    /beheer(t|en)? geen (software|tool)|geen software om te beheren|zonder toolbeheer|geen toolbeheer/i,
  ],
  ['"niets zelf in te richten"', /niets zelf (in te richten|te beheren)/i],
  ['"directie-read sessie"', /read sessie/i],
  ['"Ik duid elke scan zelf"', /duid elke scan/i],
  ['"het directiegesprek" als levering van Loep', /én het directiegesprek/i],
]

describe('besluit A: geen bespreking, geen "begeleid", geen "geen zelfbedieningstool"', () => {
  for (const file of RENDERED_FILES) {
    it(`${file} bevat geen oude belofte`, () => {
      const source = read(file)
      for (const [label, pattern] of FORBIDDEN) {
        expect(pattern.test(source), `${label} gevonden in ${file}`).toBe(false)
      }
    })
  }
})

/**
 * Elk Loep-bedrag komt uit lib/pricing.ts. Concurrentieprijzen ("€25.000 tot
 * €100.000") en de rekensom "€30 per medewerker" zijn geen Loep-prijs en vallen
 * buiten het patroon. public/llms.txt is een statisch tekstbestand en kan niet
 * importeren; dat wordt hieronder tegen de staffel gelegd.
 */
const LOOSE_LOEP_AMOUNT = /(€|EUR|&euro;)\s?(3\.500|4\.500|6\.900|6\.500|950|1\.250|1\.750)(?![\d.])/
const PRICE_SOURCE_FILES = new Set(['lib/pricing.ts', 'public/llms.txt'])

describe('prijsstaffel: geen los Loep-bedrag buiten lib/pricing.ts', () => {
  for (const file of RENDERED_FILES.filter((f) => !PRICE_SOURCE_FILES.has(f))) {
    it(`${file} bevat geen los Loep-bedrag`, () => {
      const match = read(file).match(LOOSE_LOEP_AMOUNT)
      expect(match?.[0] ?? null, `los bedrag in ${file}; gebruik formatEur uit lib/pricing.ts`).toBeNull()
    })
  }
})

describe('public/llms.txt volgt de staffel', () => {
  const llms = () => read('public/llms.txt')

  for (const tier of PRICING_TIERS) {
    it(`noemt ${tier.label} met de eerste scan en de vervolgmeting`, () => {
      expect(llms()).toContain(`${tier.label.toLowerCase()} EUR ${formatThousands(tier.firstScanEur)}`)
      expect(llms()).toContain(`EUR ${formatThousands(tier.followUpEur)}`)
    })
  }

  it('noemt geen ander bedrag dan de zes uit de staffel', () => {
    const gevonden = [...llms().matchAll(/EUR (\d[\d.]*\d|\d)/g)].map((m) => m[1]).sort()
    const verwacht = PRICING_TIERS.flatMap((t) => [formatThousands(t.firstScanEur), formatThousands(t.followUpEur)]).sort()
    expect(gevonden).toEqual(verwacht)
  })

  it('zegt dat boven 1.000 medewerkers op aanvraag is en dat Loep niet aan tafel zit', () => {
    expect(llms()).toContain('boven 1.000 medewerkers op aanvraag')
    expect(llms()).toContain('Geen bespreking door Loep')
  })
})

/** Alleen bestanden waarvan deze ronde de copy herschrijft. */
const DASH_FREE_FILES = [
  'components/marketing/home-page-content.tsx',
  'components/marketing/producten-content.tsx',
  'components/marketing/site-content.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/opengraph-image.tsx',
  'app/producten/[slug]/page.tsx',
  'app/pilot/page.tsx',
  'lib/site-meta.ts',
  'lib/pricing.ts',
  'public/llms.txt',
]

describe('geen em-dash en geen en-dash in de herschreven bestanden', () => {
  for (const file of DASH_FREE_FILES) {
    it(`${file} bevat geen em-dash of en-dash`, () => {
      const match = read(file).match(/.{0,40}[\u2013\u2014].{0,40}/)
      expect(match?.[0] ?? null, `streepje in ${file}`).toBeNull()
    })
  }
})
