import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const FILE = 'components/marketing/home-page-content.tsx'

/** JSX breekt lopende tekst over regels af; vergelijken gaat op één regel. */
function bron() {
  return fs.readFileSync(path.join(process.cwd(), FILE), 'utf8').replace(/\s+/g, ' ')
}

describe('homepage na besluit A', () => {
  it('draagt de nieuwe categorieregel in de hero en in de donkere band', () => {
    expect(bron().split('Meting en rapport · Het gesprek voer je zelf').length - 1).toBe(2)
  })

  it('zegt dat jij het gesprek leidt en dat het rapport je leidraad is', () => {
    expect(bron()).toContain('Loep meet niet alleen. Het rapport brengt je MT tot één eerste keuze.')
    expect(bron()).toContain(
      'Daarna leid jij het gesprek met je MT, met het rapport als leidraad, en leggen jullie vast: wat, wie, wanneer.',
    )
    expect(bron()).toContain('én de leidraad voor je MT-gesprek.')
    expect(bron()).toContain("title: 'Kiezen met je MT: wat, wie, wanneer'")
  })

  it('belooft wat het rapport levert, niet wat Loep aan tafel doet', () => {
    // Niet "in elk rapport": Loep Cultuurbeeld heeft de leidraad noch de
    // besluitpagina, en die pagina is nog bereikbaar (link-only, noindex).
    // lib/cultuurbeeld-besluit-a.test.ts pint dat Cultuurbeeld die twee niet
    // noemt; zonder deze afbakening spreekt de homepage dat tegen.
    expect(bron()).toContain("'Gespreksleidraad en besluitpagina in Loep Vertrek, Loep Behoud en Loep Start',")
    expect(bron()).not.toContain('besluitpagina in elk rapport')
    expect(bron()).toContain("['Volgende stap', 'Besluit vastgelegd'],")
    expect(bron().split('Het rapport leidt je MT-gesprek.').length - 1).toBe(2)
  })

  it('zegt eerlijk dat de klant de respons in een eigen omgeving volgt', () => {
    expect(bron()).toContain('Loep ziet hun adressen nooit. De respons volg je in je eigen omgeving.')
  })

  it('schrijft de werkvragen toe aan de twee scans die ze hebben, niet aan Loep Start', () => {
    expect(bron()).toContain(
      'De vertaling naar jullie situatie maak je zelf, met de werkvragen in het rapport van Loep Behoud en Loep Vertrek.',
    )
  })

  it('belooft de afweging achter de ranglijst alleen bij de twee scans die een raster hebben', () => {
    // De ranglijst zelf staat in elk scanrapport en blijft dus onvoorwaardelijk.
    // Wat Loep Start mist is het prioriteringsraster: daar is de rangorde puur
    // de score (backend/report_html.py), dus "je ziet waarom dit bovenaan
    // staat" is voor Loep Start niet waar.
    expect(bron()).toContain('Bij Loep Vertrek en Loep Behoud lees je er ook bij wat er meewoog in die volgorde.')
    // De ontkenningen dekken ook SuitePreviewSection en suiteFlowPoints. Die
    // staan wel in dit bestand maar hangen niet in de renderboom, dus daar
    // wordt bewust geen zin vastgepind: verdwijnt dat dode blok ooit, dan hoort
    // deze test niet mee te vallen.
    expect(bron()).not.toContain('en je ziet waarom')
    expect(bron()).not.toContain('en je ziet precies waarom')
    expect(bron()).not.toContain('Je ziet per onderwerp wat meewoog')
    // Het methodeblok somt de inhoud van het raster op (score, spreiding,
    // gekozen reden). Dat hoort achter dezelfde afbakening te hangen als de
    // werkvragen in de zin ervoor, niet als uitspraak over elk rapport.
    expect(bron()).toContain(
      'Daar staat ook per onderwerp waarom het bovenaan staat: de score, de spreiding en wat je mensen zelf als reden kozen.',
    )
    expect(bron()).not.toContain('Het rapport laat per onderwerp zien waarom het bovenaan staat')
  })

  it('heeft het fotoblok met de quote niet meer', () => {
    expect(bron()).not.toContain('lars-loep.jpg')
    expect(bron()).not.toContain('Lars van den Hengel')
    expect(fs.existsSync(path.join(process.cwd(), 'public/images/lars-loep.jpg'))).toBe(false)
    // De foto op /kennismaking blijft.
    expect(fs.existsSync(path.join(process.cwd(), 'public/images/lars-kennismaking.png'))).toBe(true)
  })

  it('gebruikt Loep als onderwerp in de kaart van Loep Start', () => {
    expect(bron()).toContain("body: 'Loep meet vroeg hoe nieuwe medewerkers landen.")
    expect(bron()).not.toContain('Wij meten vroeg')
  })
})
