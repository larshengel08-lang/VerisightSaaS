import { describe, expect, it } from 'vitest'

import { getProductModule } from '@/lib/products/shared/registry'
import { SCAN_TYPE_LABELS } from '@/lib/types'

describe('product registry', () => {
  it('registers culture_assessment as a first-class product module', () => {
    const module = getProductModule('culture_assessment')

    expect(SCAN_TYPE_LABELS.culture_assessment).toBe('Loep Culture Assessment')
    expect(module.scanType).toBe('culture_assessment')
    expect(module.definition.scanType).toBe('culture_assessment')
    expect(module.definition.productName).toBe('Loep Culture Assessment')
  })
})
