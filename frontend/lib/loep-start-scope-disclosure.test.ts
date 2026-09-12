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

function read(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
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
