import { describe, expect, it } from 'vitest'
import { LIVE_MARKETING_PRODUCTS } from '@/lib/marketing-products'
import { exitScanDefinition } from '@/lib/products/exit/definition'
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
    expect(differenceFaq?.[1].toLowerCase()).toContain('eerder zien waar behoud onder druk staat')
  })
})
