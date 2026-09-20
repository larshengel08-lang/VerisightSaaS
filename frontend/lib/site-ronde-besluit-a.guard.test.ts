import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PRICING_TIERS, formatThousands } from '@/lib/pricing'

/**
 * Propositiebesluit A (19-9-2026) en de prijsstaffel (20-9-2026): de bespreking
 * door Loep is uit het aanbod, "begeleid" en "geen zelfbedieningstool" zijn uit
 * de positionering, en elk Loep-bedrag komt uit lib/pricing.ts. Deze guard leest
 * de bron van elk gerenderd marketingbestand, zodat de oude belofte niet
 * terugsluipt. Spec: docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md.
 *
 * Bewust buiten de lijst, elk om een eigen reden:
 * - de juridische pagina's (app/privacy, app/voorwaarden, app/dpa) vallen
 *   buiten deze ronde en blijven formeel "u";
 * - app/oplossingen/[slug] en lib/seo-solution-pages.ts renderen niet meer voor
 *   een bezoeker: next.config.ts stuurt /oplossingen/* met een 308 door naar de
 *   ankers op /producten;
 * - lib/sample-showcase-assets.ts heeft geen gerenderde importeur meer.
 * Komt een van deze drie ooit weer in beeld, dan hoort hij hier alsnog bij.
 *
 * ROOT hangt aan dit bestand, niet aan process.cwd(). Draait vitest vanaf de
 * repo-root in plaats van vanuit frontend/, dan zou cwd de readdirSync hieronder
 * laten knallen tijdens het verzamelen: alle testnamen verdwijnen en een
 * faalset-vergelijking leest dat als "niets mis".
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
  return (
    fs
      .readFileSync(full, 'utf8')
      // JSX schrijft een bewuste spatie als {' '}; zonder deze stap loopt een
      // verboden zin eromheen ("gesprek{' '} inbegrepen") langs elk patroon.
      .replace(/\{\s*['"] ['"]\s*\}/g, ' ')
      // JSX breekt lopende tekst over regels af; vergelijken gaat op één regel.
      .replace(/\s+/g, ' ')
  )
}

/** Toont waar een patroon vuurde, zodat de melding niet om een grep vraagt. */
function context(source: string, index: number, length: number): string {
  const from = Math.max(0, index - 40)
  const to = Math.min(source.length, index + length + 40)
  return `${from > 0 ? '...' : ''}${source.slice(from, to)}${to < source.length ? '...' : ''}`
}

const FORBIDDEN: Array<[string, RegExp]> = [
  // Ook de ontkenning is verboden: "zonder begeleiding" en "geen begeleiding
  // nodig" houden het woord in de positionering en nodigen uit tot een
  // tussenvorm. Besluit A haalt de begeleiding uit het aanbod, niet de nadruk
  // erop. Verzwak dit patroon niet naar een vorm die de ontkenning toelaat.
  ['het woord "begeleid" in elke vorm, ook de ontkenning', /begeleid/i],
  ['"managementbespreking"', /managementbespreking/i],
  [
    '"bespreking inbegrepen", "gesprek inbegrepen" en varianten',
    /\b(bespreking|gesprek)\b\s+(en\s+\S+\s+)?(standaard\s+)?inbegrepen/i,
  ],
  // Bewust zonder komma in de leestekenklasse: "De gespreksleidraad is
  // inbegrepen, het gesprek voer je zelf" is precies de nieuwe belofte en mag
  // niet vallen. Een opsomming met komma ("inbegrepen, de bespreking") wordt
  // hieronder alsnog gevangen door het lidwoordpatroon.
  ['"inbegrepen: de bespreking"', /\binbegrepen\b\s*[:-]?\s*(de|het|een)?\s*(compacte\s+)?\b(bespreking|gesprek)\b/i],
  // De bespreking als losse belofte. Het lidwoord is het onderscheid: "de
  // bespreking" en "een compacte bespreking" zijn een levering, terwijl de
  // toegestane ontkenning "Geen bespreking door Loep" en de toelichting in
  // lib/pricing.ts ("de weggevallen bespreking") geen lidwoord ervoor hebben.
  ['"de bespreking" of "een compacte bespreking" als levering', /\b(de|een|het|die|deze)\s+(compacte\s+)?bespreking\b/i],
  ['"Bespreking ingepland" of "Bespreking volgt" als stap', /\bbespreking\s+(ingepland|gepland|volgt|inbegrepen)/i],
  // "Daarna bespreken we het samen": Loep schuift zelf aan. De toegestane
  // tegenhanger uit weg a is "Je MT bespreekt het rapport zelf", dus alleen
  // het onderwerp we/wij/ik maakt de zin verboden.
  ['Loep die zelf meebespreekt ("bespreken we", "we bespreken")', /\b(bespreken|bespreekt)\s+(we|wij|ik)\b|\b(we|wij|ik)\s+(bespreken|bespreekt)\b/i],
  ['"zelfbedieningstool"', /zelfbedien/i],
  ['"geduid door HR-specialisten"', /geduid door hr-specialisten/i],
  ['"Loep doet de meting", "het werk" of "de opzet"', /loep doet (de|het) (meting|werk|opzet)/i],
  ['"Loep voert uit", ook "Loep voert het onderzoek uit"', /loep voert /i],
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
      const treffers: string[] = []
      for (const [label, pattern] of FORBIDDEN) {
        const match = pattern.exec(source)
        if (match) treffers.push(`${label} -> ${context(source, match.index, match[0].length)}`)
      }
      expect(treffers, `verboden belofte in ${file}`).toEqual([])
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
/** Niet-marketing, maar het toont wel een Loep-bedrag aan een ingelogde klant. */
const EXTRA_PRICE_FILES = ['lib/dashboard/new-measurement-request.ts']

describe('prijsstaffel: geen los Loep-bedrag buiten lib/pricing.ts', () => {
  const files = [...RENDERED_FILES.filter((f) => !PRICE_SOURCE_FILES.has(f)), ...EXTRA_PRICE_FILES]
  for (const file of files) {
    it(`${file} bevat geen los Loep-bedrag`, () => {
      const source = read(file)
      const match = LOOSE_LOEP_AMOUNT.exec(source)
      const treffer = match ? context(source, match.index, match[0].length) : null
      expect(treffer, `los bedrag in ${file}; gebruik formatEur uit lib/pricing.ts`).toBeNull()
    })
  }
})

/**
 * Loep Cultuurbeeld staat bewust niet in llms.txt: die pagina is stil
 * (noindex, niet in nav en niet in de sitemap), dus CULTUURBEELD_FROM_EUR
 * hoort niet in de verwachte set. Duikt €6.500 hier toch op, dan hoort die
 * test te falen.
 */
const AMOUNT_IN_TEXT = /(?:EUR|€|&euro;)\s?(\d[\d.]*\d|\d)/g

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Tolerant: leesteken en witruimte tussen label en bedrag mogen variëren. */
function amountPattern(prefix: string, amount: number): RegExp {
  return new RegExp(`${escapeRegExp(prefix)}\\s*[:,.-]?\\s*(?:EUR|€|&euro;)\\s*${escapeRegExp(formatThousands(amount))}(?![\\d.])`, 'i')
}

describe('public/llms.txt volgt de staffel', () => {
  const llms = () => read('public/llms.txt')

  it('de staffel heeft drie treden, anders lopen de controles hieronder leeg', () => {
    expect(PRICING_TIERS.length).toBe(3)
  })

  for (const tier of PRICING_TIERS) {
    it(`noemt ${tier.label} met de eerste scan en de vervolgmeting`, () => {
      const source = llms()
      expect(amountPattern(tier.label.toLowerCase(), tier.firstScanEur).test(source)).toBe(true)
      expect(amountPattern('', tier.followUpEur).test(source)).toBe(true)
    })
  }

  it('noemt geen ander bedrag dan de zes uit de staffel', () => {
    const gevonden = [...new Set([...llms().matchAll(AMOUNT_IN_TEXT)].map((m) => m[1]))].sort()
    const verwacht = [
      ...new Set(PRICING_TIERS.flatMap((t) => [formatThousands(t.firstScanEur), formatThousands(t.followUpEur)])),
    ].sort()
    expect(gevonden).toEqual(verwacht)
  })

  it('zegt dat boven 1.000 medewerkers op aanvraag is en dat Loep niet aan tafel zit', () => {
    expect(llms()).toContain('boven 1.000 medewerkers op aanvraag')
    expect(llms()).toContain('Geen bespreking door Loep')
  })
})

/**
 * Alleen bestanden waarvan deze ronde de copy herschrijft. De check is
 * bestandsbreed en kijkt dus ook in codecommentaar: een streepje in een comment
 * is geen klantzichtbare fout, maar het is wel de weg waarlangs er een in de
 * copy belandt. Herschrijf de zin, verruim de check niet.
 */
const DASH_FREE_FILES = [
  'components/marketing/home-page-content.tsx',
  'components/marketing/producten-content.tsx',
  'components/marketing/site-content.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/opengraph-image.tsx',
  'app/producten/page.tsx',
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

/**
 * Bodem onder de dekking: krimpt een van de lijsten stil, dan slagen de lussen
 * hierboven vacuüm en verklaart deze guard aan het eind van de ronde iets groen
 * wat niemand gelezen heeft.
 */
describe('de guard dekt nog steeds de hele marketingmap', () => {
  it('leest minstens dertig gerenderde bestanden in components/marketing', () => {
    expect(marketingFiles().length).toBeGreaterThanOrEqual(30)
  })
})
