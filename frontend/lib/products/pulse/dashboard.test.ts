import { describe, expect, it } from 'vitest'
import { buildPulseDashboardViewModel } from '@/lib/products/pulse/dashboard'

describe('buildPulseDashboardViewModel', () => {
  it('builds a bounded pulse management handoff once enough data is available', () => {
    const model = buildPulseDashboardViewModel({
      signalLabelLower: 'pulsesignaal',
      averageSignal: 6.6,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 4.9,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        workload: 3.4,
        leadership: 4.6,
        growth: 5.1,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards.map((card) => card.title)).toEqual([
      'Managementread nu',
      'Eerste reviewspoor',
      'Eerste eigenaar',
      'Reviewmoment',
    ])
    expect(model.topSummaryCards[1]?.value).toBe('Werkbelasting')
    expect(model.topSummaryCards[2]?.value).toBe('HR + leidinggevende')
    expect(model.topSummaryCards[3]?.value).toBe('30-45 dagen')
    expect(model.topSummaryCards[3]?.body).toContain('bounded hercheck')
    expect(model.profileCards[0]?.value).toBe('Reviewlaag')
    expect(model.profileCards[0]?.body).toContain('begrensde vergelijking')
    expect(model.nextStep.title).toBe('Beleg herijking')
    expect(model.nextStep.body).toContain('compacte herijking')
    expect(model.managementBlocks).toHaveLength(2)
    expect(model.managementBlocks[1]?.items[1]).toContain('bounded hercheck')
    expect(model.followThroughCards.map((card) => card.title)).toEqual([
      'Eerste gesprek',
      'Eerste stap',
      'Eerste eigenaar',
      'Reviewmoment',
    ])
    expect(model.signaalbandenText).toContain('vorige vergelijkbare Pulse')
  })

  it('keeps pulse guidance compact and cautious before pattern strength is reached', () => {
    const model = buildPulseDashboardViewModel({
      signalLabelLower: 'pulsesignaal',
      averageSignal: 5.1,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 5.7,
      hasEnoughData: false,
      hasMinDisplay: true,
      pendingCount: 2,
      factorAverages: {
        leadership: 4.2,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards).toEqual([])
    expect(model.primaryQuestion.title).toBe('Eerste reviewvraag')
    expect(model.nextStep.title).toBe('Voorzichtig reviewen')
    expect(model.followThroughCards.map((card) => card.title)).toEqual([
      'Prioriteit nu',
      'Eerste gesprek',
      'Eerste eigenaar',
      'Reviewmoment',
    ])
    expect(model.followThroughCards[3]?.body).toContain('10 responses')
  })
})
