import { describe, expect, it } from 'vitest'
import { LIVE_MARKETING_PRODUCTS } from '@/lib/marketing-products'
import { exitScanDefinition } from '@/lib/products/exit/definition'
import { retentionScanDefinition } from '@/lib/products/retention/definition'
import { faqs, productOverviewComparisonRows } from '@/components/marketing/site-content'

describe('ExitScan positioning copy', () => {
  it('keeps ExitScan framed as vertrekduiding instead of a hard diagnosis', () => {
    const exitProduct = LIVE_MARKETING_PRODUCTS.find((product) => product.slug === 'exitscan')

    expect(exitProduct).toBeTruthy()
    expect(exitProduct?.description.toLowerCase()).toContain('vertrekduiding')
    expect(exitProduct?.description.toLowerCase()).toContain('werksignalen')
    expect(exitProduct?.description.toLowerCase()).not.toContain('voorspeller')
    expect(exitProduct?.description.toLowerCase()).not.toContain('diagnose')
    expect(exitScanDefinition.methodologyText.toLowerCase()).toContain('zonder oorzaken definitief vast te stellen')
  })

  it('keeps the portfolio distinction between ExitScan and RetentieScan explicit', () => {
    const exitRow = productOverviewComparisonRows.find((row) => row[0] === 'ExitScan')
    const differenceFaq = faqs.find(([question]) => question === 'Wat is het verschil tussen ExitScan en RetentieScan?')

    expect(exitRow?.[2].toLowerCase()).toContain('vertrekbeeld')
    expect(exitRow?.[2].toLowerCase()).toContain('werkfactoren')
    expect(differenceFaq?.[1].toLowerCase()).toContain('vertrek achteraf duiden')
    expect(differenceFaq?.[1].toLowerCase()).toContain('eerder zien waar behoud op groepsniveau onder druk staat')
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
    expect(retentionScanDefinition.signalHelp.toLowerCase()).toContain('samenvattend groepssignaal')
  })

  it('keeps retention faq copy explicit about group insight and non-predictive use', () => {
    const mtoFaq = faqs.find(([question]) => question === 'Is RetentieScan gewoon een MTO?')
    const scoreFaq = faqs.find(([question]) => question === 'Ziet management individuele retention-scores?')
    const predictorFaq = faqs.find(([question]) => question === 'Is RetentieScan een gevalideerde vertrekvoorspeller?')

    expect(mtoFaq?.[1].toLowerCase()).toContain('smaller en scherper')
    expect(mtoFaq?.[1].toLowerCase()).toContain('groeps- en segmentniveau')
    expect(mtoFaq?.[1].toLowerCase()).toContain('stay-intent')
    expect(scoreFaq?.[1].toLowerCase()).toContain('groeps- en segmentinzichten')
    expect(scoreFaq?.[1].toLowerCase()).toContain('performance-sturing')
    expect(predictorFaq?.[1].toLowerCase()).toContain('verificatie en prioritering')
  })
})
