import { describe, expect, it } from 'vitest'
import { buildExitDashboardViewModel } from '@/lib/products/exit/dashboard'

describe('buildExitDashboardViewModel', () => {
  it('surfaces exit-specific top summary cards and decision prompts', () => {
    const model = buildExitDashboardViewModel({
      signalLabelLower: 'frictiescore',
      averageSignal: 6.6,
      strongWorkSignalRate: 62,
      engagement: null,
      turnoverIntention: null,
      stayIntent: null,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        leadership: 3.5,
        culture: 4.5,
        growth: 5.5,
      },
      topExitReasonLabel: 'Leiderschap / management',
      topContributingReasonLabel: 'Gebrek aan groei',
      signalVisibilityAverage: 2.4,
    })

    expect(model.topSummaryCards.map((card) => card.title)).toEqual([
      'Sterk werksignaal',
      'Meest genoemde hoofdreden',
      'Eerste besluit',
      'Eerste eigenaar',
      'Eerdere signalering',
    ])
    expect(model.topSummaryCards[2]?.body).toContain('Beslis eerst')
    expect(model.topSummaryCards[3]?.value).toContain('HR')
    expect(model.primaryQuestion.body).toContain('breed werkgerelateerd vertrekbeeld')
    expect(model.nextStep.body).toContain('30-90')
    expect(model.nextStep.body).toContain('eigenaar')
    expect(model.managementBlocks[1]?.title).toBe('Welk besluit hoort nu eerst?')
    expect(model.managementBlocks[2]?.items[0]).toContain('Eerste eigenaar')
    expect(model.focusSectionIntro).toContain('kiezen')
  })

  it('keeps the top layer cautious while data is still indicative', () => {
    const model = buildExitDashboardViewModel({
      signalLabelLower: 'frictiescore',
      averageSignal: 5.8,
      strongWorkSignalRate: 40,
      engagement: null,
      turnoverIntention: null,
      stayIntent: null,
      hasEnoughData: false,
      hasMinDisplay: true,
      pendingCount: 3,
      factorAverages: {
        workload: 4.0,
      },
      topExitReasonLabel: 'Werkdruk / stress',
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards).toEqual([])
    expect(model.nextStep.title).toBe('Voorzichtig duiden')
    expect(model.nextStep.body).toContain('indicatief')
    expect(model.nextStep.body).toContain('eerste eigenaar')
  })
})
