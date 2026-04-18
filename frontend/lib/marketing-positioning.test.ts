import { describe, expect, it } from 'vitest'
import {
  CORE_MARKETING_PRODUCTS,
  FOLLOW_ON_MARKETING_PRODUCTS,
  LIVE_MARKETING_PRODUCTS,
  PORTFOLIO_ROUTE_MARKETING_PRODUCTS,
  RESERVED_MARKETING_PRODUCTS,
} from '@/lib/marketing-products'
import { exitScanDefinition } from '@/lib/products/exit/definition'
import { retentionScanDefinition } from '@/lib/products/retention/definition'
import {
  expansionTriggerCards,
  faqs,
  homepageUtilityLinks,
  marketingLegalLinks,
  marketingNavLinks,
  pricingAddOns,
  pricingChoiceGuide,
  pricingFollowOnRoutes,
  pricingFaqs,
  pricingCards,
  pricingLifecycleLadder,
  productOverviewComparisonRows,
  trustItems,
} from '@/components/marketing/site-content'

describe('Portfolio architecture marketing model', () => {
  it('keeps a core-first seven-route suite with visible bounded follow-on routes', () => {
    const combination = PORTFOLIO_ROUTE_MARKETING_PRODUCTS[0]
    const followOnSlugs = FOLLOW_ON_MARKETING_PRODUCTS.map((product) => product.slug)
    const reservedSlugs = RESERVED_MARKETING_PRODUCTS.map((product) => product.slug)

    expect(CORE_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual(['exitscan', 'retentiescan'])
    expect(PORTFOLIO_ROUTE_MARKETING_PRODUCTS).toHaveLength(1)
    expect(combination.slug).toBe('combinatie')
    expect(combination.portfolioRole).toBe('portfolio_route')
    expect(combination.description.toLowerCase()).toContain('portfolioroute')
    expect(combination.description.toLowerCase()).toContain('derde kernproduct')
    expect(followOnSlugs).toEqual(['pulse', 'teamscan', 'onboarding-30-60-90', 'leadership-scan'])
    expect(FOLLOW_ON_MARKETING_PRODUCTS.every((product) => product.status === 'bounded_live')).toBe(true)
    expect(FOLLOW_ON_MARKETING_PRODUCTS.every((product) => product.portfolioRole === 'follow_on_route')).toBe(true)
    expect(FOLLOW_ON_MARKETING_PRODUCTS.every((product) => !product.description.toLowerCase().includes('live bounded'))).toBe(true)
    expect(CORE_MARKETING_PRODUCTS.every((product) => product.status === 'core_live')).toBe(true)
    expect(PORTFOLIO_ROUTE_MARKETING_PRODUCTS.every((product) => product.status === 'portfolio_live')).toBe(true)
    expect(LIVE_MARKETING_PRODUCTS).toHaveLength(7)
    expect(reservedSlugs).toEqual(['mto', 'customer-feedback'])
    expect(RESERVED_MARKETING_PRODUCTS.every((product) => product.status === 'reserved_future')).toBe(true)
    expect(RESERVED_MARKETING_PRODUCTS.every((product) => product.portfolioRole === 'future_reserved_route')).toBe(
      true,
    )
  })
})

describe('ExitScan positioning copy', () => {
  it('keeps ExitScan framed as vertrekduiding instead of a hard diagnosis', () => {
    const exitProduct = LIVE_MARKETING_PRODUCTS.find((product) => product.slug === 'exitscan')

    expect(exitProduct).toBeTruthy()
    expect(exitProduct?.description.toLowerCase()).toContain('vertrekduiding')
    expect(exitProduct?.description.toLowerCase()).toContain('signalen van werkfrictie')
    expect(exitProduct?.description.toLowerCase()).not.toContain('voorspeller')
    expect(exitProduct?.description.toLowerCase()).not.toContain('diagnose')
    expect(exitScanDefinition.methodologyText.toLowerCase()).toContain('zonder oorzaken definitief vast te stellen')
    expect(exitScanDefinition.methodologyText.toLowerCase()).toContain('eerdere signalering')
    expect(exitScanDefinition.whatItIsText.toLowerCase()).toContain('groepsniveau')
    expect(exitScanDefinition.whatItIsNotText.toLowerCase()).toContain('geen diagnose')
    expect(exitScanDefinition.evidenceStatusText.toLowerCase()).toContain('niet extern gevalideerd')
    expect(exitScanDefinition.signalHelp.toLowerCase()).toContain('managementsamenvatting')
  })

  it('keeps the portfolio distinction between ExitScan and RetentieScan explicit', () => {
    const exitRow = productOverviewComparisonRows.find((row) => row[0] === 'ExitScan')
    const differenceFaq = faqs.find(([question]) => question === 'Wat is het verschil tussen ExitScan en RetentieScan?')

    expect(exitRow?.[2].toLowerCase()).toContain('vertrekbeeld')
    expect(exitRow?.[2].toLowerCase()).toContain('werkfactoren')
    expect(exitRow?.[1].toLowerCase()).toContain('vertrekduiding')
    expect(differenceFaq?.[1].toLowerCase()).toContain('vertrek achteraf duiden')
    expect(differenceFaq?.[1].toLowerCase()).toContain('eerder zien waar behoud op groepsniveau onder druk staat')
  })

  it('keeps visible trust navigation and quick links available for first-time buyers', () => {
    expect(marketingNavLinks.map((link) => link.href)).toContain('/vertrouwen')
    expect(marketingLegalLinks.map((link) => link.href)).toContain('/vertrouwen')
    expect(homepageUtilityLinks.map((link) => link.href)).toContain('/vertrouwen')
    expect(trustItems.some((item) => item.toLowerCase().includes('eu-regio'))).toBe(true)
    expect(trustItems.some((item) => item.toLowerCase().includes('nederlandse dienst'))).toBe(true)
  })

  it('keeps ExitScan framed as the default first route in commercial conversations', () => {
    const freePilotFaq = pricingFaqs.find(([question]) => question === 'Waarom starten jullie niet met een gratis pilot?')
    const exitBaselineCard = pricingCards.find((card) => card.eyebrow === 'ExitScan Baseline')
    const exitLiveRoute = pricingFollowOnRoutes.find((route) => route.title === 'ExitScan ritmeroute')
    const combinationRoute = pricingChoiceGuide.find(([title]) => title === 'Combinatie op aanvraag')
    const exitLifecycle = pricingLifecycleLadder.find((route) => route.route === 'ExitScan')

    expect(exitBaselineCard?.price).toBe('EUR 2.950')
    expect(exitLiveRoute?.fit.toLowerCase()).toContain('quote-only')
    expect(exitLiveRoute?.bullets.join(' ').toLowerCase()).toContain('geen self-serve')
    expect(combinationRoute?.[1].toLowerCase()).toContain('eerste route helder staat')
    expect(exitLifecycle?.firstSale.toLowerCase()).toContain('standaard eerste koop')
    expect(exitLifecycle?.expansion.toLowerCase()).toContain('retentiescan baseline')
    expect(freePilotFaq?.[1].toLowerCase()).toContain('betaald baseline-traject')
    expect(freePilotFaq?.[1].toLowerCase()).toContain('echte urgentie')
  })

  it('keeps expansion framed as a value-based follow-up instead of a loose upsell', () => {
    expect(expansionTriggerCards.some((card) => card.body.toLowerCase().includes('eerste route al heeft geleid'))).toBe(true)
    expect(expansionTriggerCards.some((card) => card.body.toLowerCase().includes('eerste eigenaar'))).toBe(true)
    expect(expansionTriggerCards.some((card) => card.body.toLowerCase().includes('reviewmoment'))).toBe(true)
    expect(expansionTriggerCards.some((card) => card.body.toLowerCase().includes('upsell'))).toBe(true)
  })
})

describe('RetentieScan positioning copy', () => {
  it('keeps RetentieScan framed as a group-level early signal instead of an MTO or predictor', () => {
    const retentionProduct = LIVE_MARKETING_PRODUCTS.find((product) => product.slug === 'retentiescan')

    expect(retentionProduct).toBeTruthy()
    expect(retentionProduct?.description.toLowerCase()).toContain('groeps')
    expect(retentionProduct?.description.toLowerCase()).toContain('stay-intent')
    expect(retentionProduct?.description.toLowerCase()).not.toContain('mto')
    expect(retentionProduct?.description.toLowerCase()).not.toContain('voorspeller')
    expect(retentionScanDefinition.methodologyText.toLowerCase()).toContain('geen brede mto')
    expect(retentionScanDefinition.methodologyText.toLowerCase()).toContain('geen individuele voorspeller')
    expect(retentionScanDefinition.whatItIsText.toLowerCase()).toContain('groeps- en segmentniveau')
    expect(retentionScanDefinition.whatItIsNotText.toLowerCase()).toContain('performance-instrument')
    expect(retentionScanDefinition.privacyBoundaryText.toLowerCase()).toContain('individuele signalen')
    expect(retentionScanDefinition.evidenceStatusText.toLowerCase()).toContain('v1-werkmodel')
    expect(retentionScanDefinition.signalHelp.toLowerCase()).toContain('samenvattend groepssignaal')
    expect(retentionScanDefinition.signalHelp.toLowerCase()).toContain('eerst verificatie')
    expect(retentionScanDefinition.methodologyText.toLowerCase()).toContain('aanvullende signalen rond behoud')
  })

  it('keeps retention faq copy explicit about group insight and non-predictive use', () => {
    const mtoFaq = faqs.find(([question]) => question === 'Is RetentieScan gewoon een MTO?')
    const scoreFaq = faqs.find(([question]) => question === 'Ziet management individuele retention-scores?')
    const predictorFaq = faqs.find(([question]) => question === 'Is RetentieScan een gevalideerde vertrekvoorspeller?')
    const pricingFaq = pricingFaqs.find(([question]) => question === 'Waarom is RetentieScan niet goedkoper dan ExitScan?')
    const rhythmFaq = pricingFaqs.find(
      ([question]) => question === 'Hoe verhouden RetentieScan ritmeroute en compacte vervolgmeting zich tot elkaar?',
    )
    const retentionRhythm = pricingFollowOnRoutes.find((route) => route.title === 'RetentieScan ritmeroute')
    const compactFollowUp = pricingAddOns.find(([title]) => title === 'Compacte retentie vervolgmeting')

    expect(mtoFaq?.[1].toLowerCase()).toContain('smaller en scherper')
    expect(mtoFaq?.[1].toLowerCase()).toContain('groeps- en segmentniveau')
    expect(mtoFaq?.[1].toLowerCase()).toContain('stay-intent')
    expect(scoreFaq?.[1].toLowerCase()).toContain('groeps- en segmentinzichten')
    expect(scoreFaq?.[1].toLowerCase()).toContain('performance-sturing')
    expect(predictorFaq?.[1].toLowerCase()).toContain('verificatie en prioritering')
    expect(pricingFaq?.[1].toLowerCase()).toContain('eigen managementverhaal')
    expect(rhythmFaq?.[1].toLowerCase()).toContain('vaste buyer-facing vervolgvorm')
    expect(retentionRhythm?.price).toBe('vanaf EUR 4.950')
    expect(compactFollowUp?.[2].toLowerCase()).toContain('parallel hoofdpackage')
  })

  it('keeps RetentieScan repeat and ExitScan expansion paths explicit', () => {
    const retentionLifecycle = pricingLifecycleLadder.find((route) => route.route === 'RetentieScan')

    expect(retentionLifecycle?.firstSale.toLowerCase()).toContain('actieve behoudsvraag')
    expect(retentionLifecycle?.nextStep.toLowerCase()).toContain('vaste buyer-facing vervolgvorm')
    expect(retentionLifecycle?.expansion.toLowerCase()).toContain('exitscan baseline')
  })
})
