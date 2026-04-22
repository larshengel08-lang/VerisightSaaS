import { describe, expect, it } from 'vitest'
import { exitScanDefinition } from '@/lib/products/exit/definition'

describe('exitScanDefinition', () => {
  it('keeps exit dashboard labeltruth centered on frictiescore', () => {
    expect(exitScanDefinition.signalLabel).toBe('Frictiescore')
    expect(exitScanDefinition.signalLabelLower).toBe('frictiescore')
    expect(exitScanDefinition.summaryLabel).toBe('Frictiescore')
  })
})
