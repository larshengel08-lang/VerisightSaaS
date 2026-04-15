import { describe, expect, it } from 'vitest'
import { LIVE_MARKETING_PRODUCTS } from '@/lib/marketing-products'
import { exitScanDefinition } from '@/lib/products/exit/definition'
import { retentionScanDefinition } from '@/lib/products/retention/definition'
import {
  faqs,
  homepageUtilityLinks,
  marketingLegalLinks,
  marketingNavLinks,
  pricingFaqs,
  productOverviewComparisonRows,
  trustItems,
} from '@/components/marketing/site-content'

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

    expect(freePilotFaq?.[1].toLowerCase()).toContain('betaald baseline-traject')
    expect(freePilotFaq?.[1].toLowerCase()).toContain('echte urgentie')
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

    expect(mtoFaq?.[1].toLowerCase()).toContain('smaller en scherper')
    expect(mtoFaq?.[1].toLowerCase()).toContain('groeps- en segmentniveau')
    expect(mtoFaq?.[1].toLowerCase()).toContain('stay-intent')
    expect(scoreFaq?.[1].toLowerCase()).toContain('groeps- en segmentinzichten')
    expect(scoreFaq?.[1].toLowerCase()).toContain('performance-sturing')
    expect(predictorFaq?.[1].toLowerCase()).toContain('verificatie en prioritering')
    expect(pricingFaq?.[1].toLowerCase()).toContain('eigen managementverhaal')
  })
})
