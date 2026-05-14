import { describe, expect, it } from 'vitest'
import { buildResultsViewModel } from './results-view-model'

describe('buildResultsViewModel', () => {
  it('keeps the fixed block order for exit results', () => {
    const model = buildResultsViewModel({
      scanType: 'exit',
      respondentsCount: 8,
      hasMinDisplay: true,
      hasEnoughData: true,
      hasOpenAnswers: true,
    })

    expect(model.blocks.map((block) => block.key)).toEqual([
      'response',
      'signal',
      'synthesis',
      'drivers',
      'depth',
      'voices',
    ])
  })

  it('keeps results mode in pre-read state instead of falling back to campaign detail', () => {
    const model = buildResultsViewModel({
      scanType: 'retention',
      respondentsCount: 2,
      hasMinDisplay: false,
      hasEnoughData: false,
      hasOpenAnswers: false,
    })

    expect(model.readState).toBe('pre-read')
    expect(model.blocks[0]?.visibility).toBe('visible')
    expect(model.blocks[1]?.visibility).toBe('limited')
    expect(model.blocks[3]?.visibility).toBe('limited')
  })
})
