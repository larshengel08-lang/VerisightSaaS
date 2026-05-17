import { describe, expect, it } from 'vitest'

import { getProductModule } from '@/lib/products/shared/registry'
import { SCAN_TYPE_LABELS } from '@/lib/types'

describe('product registry', () => {
  it('registers culture_assessment identity with a safe in-opbouw placeholder contract', () => {
    const module = getProductModule('culture_assessment')
    const viewModel = module.buildDashboardViewModel({
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
    })
    const focusQuestions = module.getFocusQuestions()
    const actionPlaybooks = module.getActionPlaybooks()

    expect(SCAN_TYPE_LABELS.culture_assessment).toBe('Loep Culture Assessment')
    expect(module.scanType).toBe('culture_assessment')
    expect(module.definition.scanType).toBe('culture_assessment')
    expect(module.definition.productName).toBe('Loep Culture Assessment')
    expect(module.definition.methodologyText.toLowerCase()).toContain('in opbouw')
    expect(viewModel.primaryQuestion.title).toContain('In opbouw')
    expect(viewModel.primaryQuestion.body.toLowerCase()).toContain('nog niet beschikbaar')
    expect(viewModel.managementBlocks).toHaveLength(1)
    expect(viewModel.followThroughCards).toHaveLength(1)
    expect(focusQuestions).toEqual({})
    expect(actionPlaybooks).toEqual({})
  })
})
