import { describe, expect, it } from 'vitest'

import { getProductModule } from '@/lib/products/shared/registry'
import { SCAN_TYPE_LABELS } from '@/lib/types'

describe('product registry', () => {
  it('registers culture_assessment identity without reusing another product runtime', () => {
    const module = getProductModule('culture_assessment')

    expect(SCAN_TYPE_LABELS.culture_assessment).toBe('Loep Culture Assessment')
    expect(module.scanType).toBe('culture_assessment')
    expect(module.definition.scanType).toBe('culture_assessment')
    expect(module.definition.productName).toBe('Loep Culture Assessment')

    expect(() =>
      module.buildDashboardViewModel({
        signalLabelLower: 'loep culture index',
        averageSignal: null,
        strongWorkSignalRate: null,
        engagement: null,
        turnoverIntention: null,
        stayIntent: null,
        hasEnoughData: false,
        hasMinDisplay: false,
        pendingCount: 0,
        factorAverages: {},
      }),
    ).toThrow(/culture_assessment product module is not implemented yet/i)
    expect(() => module.getFocusQuestions()).toThrow(/culture_assessment product module is not implemented yet/i)
    expect(() => module.getActionPlaybooks()).toThrow(/culture_assessment product module is not implemented yet/i)
  })
})
