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
      'Primair werkspoor',
      'Eerste eigenaar',
      'Volgende check',
      'Richting nu',
      'Boundary',
    ])
    expect(model.topSummaryCards[1]?.value).toBe('Werkbelasting')
    expect(model.topSummaryCards[2]?.value).toBe('HR + leidinggevende')
    expect(model.topSummaryCards[3]?.value).toBe('30-45 dagen')
    expect(model.topSummaryCards[3]?.body).toContain('volgende Pulse')
    expect(model.topSummaryCards[5]?.body).toContain('vorige vergelijkbare Pulse')
    expect(model.profileCards[0]?.value).toBe('Reviewlaag')
    expect(model.profileCards[0]?.body).toContain('begrensde vergelijking')
    expect(model.nextStep.title).toBe('Beleg correctie en hercheck')
    expect(model.nextStep.body).toContain('managementreview of volgende Pulse')
    expect(model.managementBlocks[2]?.items[1]).toContain('bounded hercheck')
    expect(model.followThroughCards.map((card) => card.title)).toEqual([
      'Prioriteit nu',
      'Eerste gesprek',
      'Wie moet aan tafel',
      'Eerste eigenaar',
      'Eerste actie',
      'Reviewmoment',
      'Wanneer geen nieuwe Pulse',
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
