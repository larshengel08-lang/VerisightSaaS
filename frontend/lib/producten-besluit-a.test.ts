import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const FILE = 'components/marketing/producten-content.tsx'

/** JSX breekt lopende tekst over regels af; vergelijken gaat op één regel. */
function bron() {
  return fs.readFileSync(path.join(process.cwd(), FILE), 'utf8').replace(/\s+/g, ' ')
}

describe('/producten na besluit A: wie doet wat', () => {
  it('beschrijft in de gedeelde route wat Loep doet en wat je zelf doet', () => {
    for (const regel of [
      "'Intake en scopebepaling',",
      "'Meting klaarzetten: vragenlijst, afdelingen en de uitnodigingstekst die je zelf verstuurt',",
      "'Je volgt de respons in je eigen omgeving en sluit of verlengt zelf',",
      "'Gespreksleidraad van 45 minuten en een besluitpagina in het rapport',",
      "'Besluit vastleggen in je omgeving',",
    ]) {
      expect(bron(), regel).toContain(regel)
    }
  })

  it('maakt Loep het onderwerp van elke lead en laat het rapport het MT tot een keuze brengen', () => {
    expect(bron()).toContain(
      "lead: 'Loep brengt vertrekpatronen scherp in beeld, en het rapport brengt je MT tot één duidelijke keuze.',",
    )
    expect(bron()).toContain(
      "lead: 'Loep laat zien waar behoud onder druk staat, vóór uitstroom zichtbaar wordt, en het rapport brengt je MT tot één eerste keuze.',",
    )
    expect(bron()).toContain(
      "lead: 'Loep meet vroeg hoe nieuwe medewerkers landen. Het rapport geeft je MT een helder groepsbeeld om één eerste stap op te kiezen.',",
    )
    expect(bron()).not.toMatch(/\bWij\b/)
    expect(bron()).not.toContain('stemmen we')
  })

  it('zegt in de hero dat jij verstuurt en het gesprek leidt', () => {
    expect(bron()).toContain('Drie scans, één recept: Loep zet de meting klaar, jij verstuurt hem, en je krijgt een rapport dat zegt waar het wringt en waar je begint.')
    expect(bron()).toContain('Daarna leid jij het gesprek met je MT; het rapport is je leidraad.')
  })

  it('noemt de route vast, niet begeleid', () => {
    expect(bron()).toContain('Eén vaste route, ongeacht de scan.')
    expect(bron()).toContain(
      'Loep zet klaar en levert het rapport; jij verstuurt, volgt de respons en leidt het gesprek.',
    )
  })

  it('zet in de MTO-vergelijking een antwoord tegenover een dashboard', () => {
    expect(bron()).toContain("'Je wilt een antwoord waar je MT mee aan tafel kan, geen dashboard om te beheren',")
  })

  it('houdt de verwachtingsregel van Loep Vertrek, met Loep als onderwerp', () => {
    expect(bron()).toContain(
      "note: 'Patroonanalyse vraagt minimaal 10 respondenten. Bij kleinere organisaties stemt Loep de meetperiode daarop af in de intake.',",
    )
  })
})
