/**
 * Eén bron voor elk bedrag dat Loep publiek noemt (besluit Lars, 20 september
 * 2026; spec docs/superpowers/specs/2026-09-20-site-ronde-besluit-a.md par. 8
 * punt 5). Componenten, JSON-LD, de prijs-FAQ en het in-app label importeren
 * hieruit. lib/site-ronde-besluit-a.guard.test.ts verbiedt losse Loep-bedragen
 * in gerenderde marketingbestanden en houdt public/llms.txt hiermee in de pas.
 *
 * De staffel loopt op organisatiegrootte, niet per medewerker. De onderste
 * trede is geen korting voor de weggevallen bespreking: een kleinere
 * organisatie heeft minder op het spel staan.
 */
export type PricingTierId = 'onder-150' | '150-400' | '400-1000'

export type PricingTier = {
  readonly id: PricingTierId
  readonly label: string
  readonly firstScanEur: number
  readonly followUpEur: number
  /** Alleen waar een trede een eerlijke kanttekening nodig heeft. */
  readonly note: string | null
}

/**
 * `readonly` bewaakt alleen de compiler. Bevriezen erbij, zodat een bedrag ook
 * tijdens runtime niet stil kan worden overschreven: in een ES-module gooit een
 * schrijfpoging dan een TypeError in plaats van hem te slikken.
 */
function freezeTiers(tiers: readonly PricingTier[]): readonly PricingTier[] {
  return Object.freeze(tiers.map((tier) => Object.freeze(tier)))
}

export const PRICING_TIERS: readonly PricingTier[] = freezeTiers([
  {
    // Besluit Lars 24-9-2026: "Tot 150" en "150 tot 400" lazen allebei alsof
    // 150 erin viel. 150 valt in de middelste trede.
    id: 'onder-150',
    label: 'Minder dan 150 medewerkers',
    firstScanEur: 3500,
    followUpEur: 950,
    note: 'Loep Vertrek in deze trede: patroonanalyse vraagt minimaal 10 respondenten. Loep stemt de meetperiode daarop af in de intake.',
  },
  { id: '150-400', label: '150 tot 400 medewerkers', firstScanEur: 4500, followUpEur: 1250, note: null },
  { id: '400-1000', label: '400 tot 1.000 medewerkers', firstScanEur: 6900, followUpEur: 1750, note: null },
])

export const PRICING_ABOVE_LABEL = 'Boven 1.000 medewerkers'
export const PRICING_ABOVE_TEXT = 'Op aanvraag'
export const PRICING_VAT_NOTE = 'excl. btw'

/** Loep Cultuurbeeld valt buiten de staffel en houdt zijn eigen vanaf-prijs. */
export const CULTUURBEELD_FROM_EUR = 6500

/**
 * Fail Loud: nooit een half of negatief bedrag, niet op de site en niet in de
 * JSON-LD. Elk pad dat een bedrag naar buiten brengt gaat hier eerst langs.
 */
export function assertWholeAmount(amount: number): number {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`Bedrag moet een heel, positief getal zijn, kreeg: ${amount}`)
  }
  return amount
}

/** 3500 -> "3.500", voor een mens. */
export function formatThousands(amount: number): string {
  return String(assertWholeAmount(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** 3500 -> "€3.500". */
export function formatEur(amount: number): string {
  return `€${formatThousands(amount)}`
}

function lowestAndHighest(pick: (tier: PricingTier) => number): [number, number] {
  const values = PRICING_TIERS.map(pick)
  return [Math.min(...values), Math.max(...values)]
}

/** "€3.500 tot €6.900" */
export function firstScanRangeLabel(): string {
  const [low, high] = lowestAndHighest((tier) => tier.firstScanEur)
  return `${formatEur(low)} tot ${formatEur(high)}`
}

/** "€950 tot €1.750" */
export function followUpRangeLabel(): string {
  const [low, high] = lowestAndHighest((tier) => tier.followUpEur)
  return `${formatEur(low)} tot ${formatEur(high)}`
}

/** Antwoord op "Wat kost een scan van Loep?" voor de FAQ-JSON-LD. */
export function pricingFaqAnswer(): string {
  const treden = PRICING_TIERS.map(
    (tier) =>
      `${tier.label}: ${formatEur(tier.firstScanEur)} voor de eerste scan en ${formatEur(tier.followUpEur)} voor een vervolgmeting.`,
  ).join(' ')
  return `De prijs hangt af van de grootte van je organisatie, niet van het aantal mensen dat meedoet. ${treden} ${PRICING_ABOVE_LABEL} ${PRICING_ABOVE_TEXT.toLowerCase()}. Alle bedragen ${PRICING_VAT_NOTE}, zonder licenties per medewerker en zonder add-ons achteraf.`
}

type PricingOffer = {
  '@type': 'Offer'
  name: string
  price: string
  priceCurrency: 'EUR'
  priceSpecification: {
    '@type': 'PriceSpecification'
    price: string
    priceCurrency: 'EUR'
    valueAddedTaxIncluded: false
  }
}

function offer(name: string, amount: number): PricingOffer {
  // Machineleesbaar: schema.org wil een kaal getal, geen duizendtalscheiding.
  // De controle staat hier apart, want deze weg loopt niet langs formatThousands.
  const price = String(assertWholeAmount(amount))
  return {
    '@type': 'Offer',
    name,
    price,
    priceCurrency: 'EUR',
    priceSpecification: { '@type': 'PriceSpecification', price, priceCurrency: 'EUR', valueAddedTaxIncluded: false },
  }
}

/**
 * JSON-LD voor /producten: per trede een eerste scan en een vervolgmeting.
 * `tiers` staat alleen open zodat een test kan bewijzen dat een ongeldig bedrag
 * hier luid faalt; gerenderde code roept hem zonder argument aan.
 */
export function buildPricingOfferCatalog(tiers: readonly PricingTier[] = PRICING_TIERS) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'OfferCatalog' as const,
    name: 'Loep Behoud, Loep Vertrek en Loep Start: vaste prijs naar organisatiegrootte',
    url: 'https://www.getloep.nl/producten#tarieven',
    itemListElement: tiers.flatMap((tier) => [
      offer(`Eerste scan, ${tier.label.toLowerCase()}`, tier.firstScanEur),
      offer(`Vervolgmeting, ${tier.label.toLowerCase()}`, tier.followUpEur),
    ]),
  }
}
