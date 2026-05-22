import { describe, expect, it } from 'vitest'

import { getProductModule } from '@/lib/products/shared/registry'
import { SCAN_TYPE_LABELS } from '@/lib/types'

describe('product registry', () => {
  it('registers culture_assessment as a first-class product module', () => {
    const productModule = getProductModule('culture_assessment')
    const focusQuestions = productModule.getFocusQuestions()
    const actionPlaybooks = productModule.getActionPlaybooks()

    expect(SCAN_TYPE_LABELS.culture_assessment).toBe('Loep Culture Assessment')
    expect(productModule.scanType).toBe('culture_assessment')
    expect(productModule.definition.scanType).toBe('culture_assessment')
    expect(productModule.definition.productName).toBe('Loep Culture Assessment')
    expect(productModule.definition.signalLabel).toBe('Loep Culture Index')
    expect(productModule.definition.methodologyText.toLowerCase()).not.toContain('in opbouw')
    expect(Object.keys(focusQuestions).length).toBeGreaterThan(0)
    expect(Object.keys(actionPlaybooks).length).toBeGreaterThan(0)
  })
})
