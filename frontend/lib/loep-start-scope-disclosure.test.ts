import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Loep Start kost hetzelfde als Loep Vertrek en Loep Behoud, maar mist de
 * verdiepingslaag (waarom scoort dit laag, volgens de respondent) en de
 * richtingvraag (wat zou hier het meest helpen). Het rapport zegt dat zelf op
 * pagina twee (ONBOARDING_GEEN_VERDIEPING_NOTE in backend/report_html.py); de
 * site moet hetzelfde zeggen, anders belooft de verkooppagina een laag die de
 * koper in het rapport niet terugvindt. Spec ronde 2 par. 7 (B18).
 */
const DISCLOSURE =
  'De verdieping (waarom, volgens je mensen) en het blok "wat er moet gebeuren" komen in een volgende versie.'

const SURFACES = [
  'components/marketing/home-page-content.tsx',
  'components/marketing/producten-content.tsx',
]

const PRODUCTEN = 'components/marketing/producten-content.tsx'

/**
 * De hero van /producten claimte over alle drie de scans "een rapport dat zegt
 * waar het wringt, waarom volgens je mensen, en waar je begint". Het middelste
 * deel geldt voor Loep Start niet, en die claim stond op dezelfde pagina als de
 * outputregel die zegt dat de verdieping daar nog komt. De verdieping en het
 * blok "wat er moet gebeuren" mogen genoemd blijven, maar toegeschreven aan de
 * twee scans die ze leveren. Dezelfde claim stond in de gedeelde leveringslijst
 * ("zo werkt elke scan") en in de inbegrepen-checklist bij het prijsanker.
 */
const HERO_TOEGESCHREVEN =
  'Bij Loep Vertrek en Loep Behoud staat er ook in waarom dat zo is en wat er volgens je mensen moet gebeuren.'
const HERO_CLAIM_OVER_ALLE_DRIE =
  'een rapport dat zegt waar het wringt, waarom volgens je mensen, en waar je begint'
const LIJST_TOEGESCHREVEN =
  "'Rapport: waar het wringt en waar je begint (bij Loep Vertrek en Loep Behoud ook waarom)',"
const LIJST_CLAIM_OVER_ALLE_DRIE = "'Rapport: waar het wringt, waarom, en waar je begint',"

function read(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
}

/** JSX breekt lopende tekst over regels af; vergelijken gaat op één regel. */
function tekst(rel: string) {
  return read(rel).replace(/\s+/g, ' ')
}

/**
 * Alleen het Loep Start-blok uit de scans-array. Een verbod op de hele pagina
 * zou ook aanslaan op copy van Loep Vertrek of Loep Behoud, waar dezelfde woorden
 * wél waar kunnen zijn.
 */
function loepStartBlok() {
  const bron = tekst(PRODUCTEN)
  const start = bron.indexOf("id: 'loep-start'")
  expect(start, 'Loep Start-blok niet gevonden').toBeGreaterThan(-1)
  const einde = bron.indexOf('] as const', start)
  expect(einde, 'einde van de scans-array niet gevonden').toBeGreaterThan(start)
  return bron.slice(start, einde)
}

describe('Loep Start zegt op de site wat het nog niet levert', () => {
  for (const file of SURFACES) {
    it(`${file} noemt de ontbrekende verdieping en richtingvraag`, () => {
      expect(tekst(file)).toContain(DISCLOSURE)
    })
  }

  it('belooft in het Loep Start-blok geen concreet vervolg dat het rapport niet geeft', () => {
    expect(loepStartBlok()).not.toContain('een concreet vervolg')
  })

  it('gebruikt geen em-dash in de copy die op de pagina staat', () => {
    expect(loepStartBlok()).not.toContain('—')
  })
})

describe('De verdieping wordt alleen beloofd bij de scans die hem leveren', () => {
  const bron = () => tekst(PRODUCTEN)

  it('de hero schrijft het waarom en het vervolg toe aan Loep Vertrek en Loep Behoud', () => {
    expect(bron()).toContain(HERO_TOEGESCHREVEN)
  })

  it('de hero claimt het waarom niet over alle drie de scans', () => {
    expect(bron()).not.toContain(HERO_CLAIM_OVER_ALLE_DRIE)
  })

  it('de hero houdt de belofte die voor alle drie waar is', () => {
    expect(bron()).toContain('een rapport dat zegt waar het wringt en waar je begint')
  })

  it('de gedeelde leveringslijst en de inbegrepen-checklist doen hetzelfde', () => {
    // Twee lijsten, allebei expliciet voor elke scan; beide regels moeten mee.
    expect(bron().split(LIJST_TOEGESCHREVEN).length - 1).toBe(2)
    expect(bron()).not.toContain(LIJST_CLAIM_OVER_ALLE_DRIE)
  })

  it('gebruikt geen em-dash in de herschreven hero', () => {
    const hero = bron()
    const start = hero.indexOf('Drie scans, één recept')
    expect(start, 'hero niet gevonden').toBeGreaterThan(-1)
    expect(hero.slice(start, start + 400)).not.toContain('—')
  })
})
