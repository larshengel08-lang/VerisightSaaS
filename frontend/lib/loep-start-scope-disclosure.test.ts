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

/**
 * De hero van /producten claimte over alle drie de scans "een rapport dat zegt
 * waar het wringt, waarom volgens je mensen, en waar je begint". Het middelste
 * deel geldt voor Loep Start niet, en die claim stond op dezelfde pagina als de
 * outputregel die zegt dat de verdieping daar nog komt. De verdieping en het
 * blok "wat er moet gebeuren" mogen genoemd blijven, maar toegeschreven aan de
 * twee scans die ze leveren.
 */
const HERO_TOEGESCHREVEN =
  'Bij Loep Vertrek en Loep Behoud staat er ook in waarom dat zo is en wat er volgens je mensen moet gebeuren.'
const HERO_CLAIM_OVER_ALLE_DRIE =
  'een rapport dat zegt waar het wringt, waarom volgens je mensen, en waar je begint'

function read(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
}

/** JSX breekt lopende tekst over regels af; vergelijken gaat op één regel. */
function tekst(rel: string) {
  return read(rel).replace(/\s+/g, ' ')
}

describe('Loep Start zegt op de site wat het nog niet levert', () => {
  for (const file of SURFACES) {
    it(`${file} noemt de ontbrekende verdieping en richtingvraag`, () => {
      expect(read(file)).toContain(DISCLOSURE)
    })
  }

  it('belooft bij Loep Start geen concreet vervolg dat het rapport niet geeft', () => {
    expect(read('components/marketing/producten-content.tsx')).not.toContain('een concreet vervolg')
  })

  it('gebruikt geen em-dash in de nieuwe copy', () => {
    expect(DISCLOSURE).not.toContain('—')
  })
})

describe('De hero van /producten belooft de verdieping alleen bij de scans die hem leveren', () => {
  const hero = () => tekst('components/marketing/producten-content.tsx')

  it('schrijft het waarom en het vervolg toe aan Loep Vertrek en Loep Behoud', () => {
    expect(hero()).toContain(HERO_TOEGESCHREVEN)
  })

  it('claimt het waarom niet over alle drie de scans', () => {
    expect(hero()).not.toContain(HERO_CLAIM_OVER_ALLE_DRIE)
  })

  it('houdt de belofte die voor alle drie waar is', () => {
    expect(hero()).toContain('een rapport dat zegt waar het wringt en waar je begint')
  })

  it('gebruikt geen em-dash in de herschreven hero', () => {
    expect(HERO_TOEGESCHREVEN).not.toContain('—')
  })
})
