import { describe, expect, it } from 'vitest'
import {
  CULTUURBEELD_FROM_EUR,
  PRICING_ABOVE_LABEL,
  PRICING_ABOVE_TEXT,
  PRICING_TIERS,
  buildPricingOfferCatalog,
  firstScanRangeLabel,
  followUpRangeLabel,
  formatEur,
  formatThousands,
  pricingFaqAnswer,
} from '@/lib/pricing'

describe('prijsstaffel (besluit Lars 20-9-2026)', () => {
  it('heeft precies de drie treden uit het besluit, in oplopende volgorde', () => {
    expect(PRICING_TIERS.map((t) => [t.label, t.firstScanEur, t.followUpEur])).toEqual([
      ['Tot 150 medewerkers', 3500, 950],
      ['150 tot 400 medewerkers', 4500, 1250],
      ['400 tot 1.000 medewerkers', 6900, 1750],
    ])
  })

  it('zet boven 1.000 medewerkers op aanvraag, zonder bedrag', () => {
    expect(PRICING_ABOVE_LABEL).toBe('Boven 1.000 medewerkers')
    expect(PRICING_ABOVE_TEXT).toBe('Op aanvraag')
    expect(PRICING_ABOVE_TEXT).not.toMatch(/\d/)
  })

  it('houdt Loep Cultuurbeeld buiten de staffel', () => {
    expect(CULTUURBEELD_FROM_EUR).toBe(6500)
    expect(PRICING_TIERS.some((t) => t.firstScanEur === CULTUURBEELD_FROM_EUR)).toBe(false)
  })

  it('houdt de rekensom van 30 euro per medewerker waar in de middelste trede', () => {
    expect(PRICING_TIERS[1].firstScanEur).toBe(150 * 30)
  })

  it('draagt de verwachtingsregel van Loep Vertrek alleen bij de onderste trede', () => {
    expect(PRICING_TIERS[0].note).toContain('minimaal 10 respondenten')
    expect(PRICING_TIERS[1].note).toBeNull()
    expect(PRICING_TIERS[2].note).toBeNull()
  })
})

describe('weergave van bedragen', () => {
  it('zet een punt als duizendtalscheiding', () => {
    expect(formatThousands(950)).toBe('950')
    expect(formatThousands(3500)).toBe('3.500')
    expect(formatThousands(125000)).toBe('125.000')
    expect(formatEur(6900)).toBe('€6.900')
  })

  it('faalt luid op een bedrag dat geen heel, positief getal is', () => {
    expect(() => formatThousands(12.5)).toThrow(/heel, positief getal/)
    expect(() => formatThousands(-1)).toThrow(/heel, positief getal/)
    expect(() => formatThousands(Number.NaN)).toThrow(/heel, positief getal/)
  })

  it('leidt het bereik af uit de staffel, niet uit losse getallen', () => {
    expect(firstScanRangeLabel()).toBe('€3.500 tot €6.900')
    expect(followUpRangeLabel()).toBe('€950 tot €1.750')
  })
})

describe('prijs-FAQ', () => {
  const antwoord = pricingFaqAnswer()

  it('noemt elke trede met beide bedragen, op aanvraag en excl. btw', () => {
    for (const tier of PRICING_TIERS) {
      expect(antwoord).toContain(tier.label)
      expect(antwoord).toContain(formatEur(tier.firstScanEur))
      expect(antwoord).toContain(formatEur(tier.followUpEur))
    }
    expect(antwoord).toContain('Boven 1.000 medewerkers op aanvraag')
    expect(antwoord).toContain('excl. btw')
  })

  it('gebruikt geen em-dash, geen en-dash en geen wij-vorm', () => {
    expect(antwoord).not.toMatch(/[\u2013\u2014]/)
    // Een koppelteken telt niet als woordgrens: "add-ons" is geen wij-vorm.
    expect(antwoord).not.toMatch(/(?<![\w-])(wij|we|ons|onze)\b/i)
  })
})

describe('JSON-LD OfferCatalog', () => {
  const catalog = buildPricingOfferCatalog()

  it('heeft per trede twee offers met bedrag, valuta en btw-vlag', () => {
    expect(catalog['@type']).toBe('OfferCatalog')
    expect(catalog.itemListElement).toHaveLength(PRICING_TIERS.length * 2)
    for (const offer of catalog.itemListElement) {
      expect(offer['@type']).toBe('Offer')
      expect(offer.priceCurrency).toBe('EUR')
      expect(offer.priceSpecification.valueAddedTaxIncluded).toBe(false)
      expect(offer.priceSpecification.price).toBe(offer.price)
    }
  })

  it('bevat exact de bedragen uit de staffel', () => {
    const prijzen = catalog.itemListElement.map((offer) => offer.price).sort()
    const verwacht = PRICING_TIERS.flatMap((t) => [String(t.firstScanEur), String(t.followUpEur)]).sort()
    expect(prijzen).toEqual(verwacht)
  })
})
