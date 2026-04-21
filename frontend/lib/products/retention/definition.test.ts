import { describe, expect, it } from 'vitest'
import { retentionScanDefinition } from '@/lib/products/retention/definition'

describe('retentionScanDefinition', () => {
  it('keeps retention dashboard labeltruth on retentiesignaal', () => {
    expect(retentionScanDefinition.signalLabel).toBe('Retentiesignaal')
    expect(retentionScanDefinition.signalLabelLower).toBe('retentiesignaal')
    expect(retentionScanDefinition.summaryLabel).toBe('Retentiesignaal')
  })
})
