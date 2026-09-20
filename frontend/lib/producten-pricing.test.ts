import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function bron(rel: string) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8').replace(/\s+/g, ' ')
}

const CONTENT = 'components/marketing/producten-content.tsx'
const PAGE = 'app/producten/page.tsx'

describe('/producten: de prijs komt uit lib/pricing.ts', () => {
  it('importeert de staffel en de weergavehelpers', () => {
    expect(bron(CONTENT)).toContain("from '@/lib/pricing'")
    for (const naam of [
      'PRICING_TIERS',
      'PRICING_ABOVE_LABEL',
      'PRICING_ABOVE_TEXT',
      'PRICING_VAT_NOTE',
      'firstScanRangeLabel',
      'followUpRangeLabel',
      'formatEur',
    ]) {
      expect(bron(CONTENT), naam).toContain(naam)
    }
  })

  it('rendert elke trede met beide bedragen en de rij op aanvraag', () => {
    expect(bron(CONTENT)).toContain('{PRICING_TIERS.map((tier) => (')
    expect(bron(CONTENT)).toContain('{formatEur(tier.firstScanEur)}')
    expect(bron(CONTENT)).toContain('{formatEur(tier.followUpEur)}')
    expect(bron(CONTENT)).toContain('{tier.note ? (')
    expect(bron(CONTENT)).toContain('{PRICING_ABOVE_LABEL}')
    expect(bron(CONTENT)).toContain('{PRICING_ABOVE_TEXT}')
  })

  it('toont per scan het bereik met een link naar de staffel, geen los bedrag en geen "vanaf"', () => {
    expect(bron(CONTENT)).toContain('{firstScanRangeLabel()}')
    expect(bron(CONTENT)).toContain('Vervolgmeting daarna: {followUpRangeLabel()} {PRICING_VAT_NOTE}.')
    expect(bron(CONTENT)).toContain('href="#tarieven"')
    // Het woord staat wel in drie codecommentaren ("afgerond vanaf de officiële ..."); het gaat om een vanaf-prijs.
    expect(bron(CONTENT)).not.toContain('vanaf €')
    expect(bron(CONTENT)).not.toContain('Vanaf €')
    expect(bron(CONTENT)).not.toContain('anaf {')
  })

  it('legt de staffel uit als logica, niet als korting', () => {
    expect(bron(CONTENT)).toContain('Eén vaste prijs, naar de grootte van je organisatie.')
    expect(bron(CONTENT)).toContain(
      'Een grotere organisatie heeft meer op het spel staan als behoud onder druk komt; een kleinere minder, en die betaalt dus minder.',
    )
    expect(bron(CONTENT)).toContain('Geen licenties per medewerker, geen jaarlijkse verhogingen, geen add-ons achteraf.')
    expect(bron(CONTENT)).not.toMatch(/korting/i)
  })

  it('houdt de rekensom van 30 euro per medewerker, zonder de bespreking', () => {
    expect(bron(CONTENT)).toContain('komt een scan neer op zo&rsquo;n €30 per medewerker.')
    expect(bron(CONTENT)).not.toContain('inclusief de')
  })

  it('beschrijft de eerste scan en de vervolgmeting zonder bespreking', () => {
    expect(bron(CONTENT)).toContain(
      'Eenmalig en alles inbegrepen: inrichting, meting, rapport met gespreksleidraad en besluitpagina.',
    )
    // Tussenvorm tot plan 3c (spec par. 4.3).
    expect(bron(CONTENT)).toContain('het rapport van je tweede meting leg je naast het eerste.')
    expect(bron(CONTENT)).not.toContain('compacte bespreking')
  })

  it('zet in de inbegrepen-lijst wat het rapport levert en wat je zelf doet', () => {
    expect(bron(CONTENT)).toContain("'Meting klaargezet door Loep: vragenlijst, afdelingen en uitnodigingstekst',")
    expect(bron(CONTENT).split("'Gespreksleidraad van 45 minuten en een besluitpagina in het rapport',").length - 1).toBe(2)
    expect(bron(CONTENT).split("'Besluit vastleggen in je omgeving',").length - 1).toBe(2)
  })
})

describe('/producten: structured data', () => {
  it('rendert de OfferCatalog uit de ene bron', () => {
    expect(bron(PAGE)).toContain("import { buildPricingOfferCatalog } from '@/lib/pricing'")
    expect(bron(PAGE)).toContain('const pricingSchema = buildPricingOfferCatalog()')
    expect(bron(PAGE)).toContain('JSON.stringify(pricingSchema)')
  })
})
