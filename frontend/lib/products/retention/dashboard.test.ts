import { describe, expect, it } from 'vitest'
import { buildRetentionDashboardViewModel } from '@/lib/products/retention/dashboard'

describe('buildRetentionDashboardViewModel', () => {
  it('builds a compact retention management read with top summary and next step', () => {
    const model = buildRetentionDashboardViewModel({
      signalLabelLower: 'retentiesignaal',
      averageSignal: 6.4,
      strongWorkSignalRate: null,
      engagement: 4.9,
      turnoverIntention: 6.2,
      stayIntent: 4.8,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        workload: 3.6,
        leadership: 4.1,
        growth: 5.2,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards.map((card) => card.title)).toEqual([
      'Groepsbeeld nu',
      'Waarom telt dit nu',
      'Topfactor',
      'Eerste besluit',
      'Eerste eigenaar',
      'Wat niet concluderen',
    ])
    expect(model.signaalbandenText).toContain('groepsniveau')
    expect(model.signaalbandenText).toContain('sponsor')
    expect(model.profileCards[0]?.title).toBe('Groepsbeeld')
    expect(model.primaryQuestion.body).toContain('werkbelasting')
    expect(model.nextStep.body).toContain('30-90')
    expect(model.managementBlocks).toHaveLength(3)
    expect(model.managementBlocks[0]?.title).toBe('Wat speelt nu op groepsniveau?')
    expect(model.managementBlocks[1]?.title).toBe('Welk besluit hoort nu eerst?')
    expect(model.managementBlocks[2]?.items[0]).toContain('Eerste eigenaar')
    expect(model.topSummaryCards[3]?.body).toContain('Beslis')
    expect(model.topSummaryCards[5]?.body).toContain('verification-first')
  })

  it('keeps retention guidance cautious before the pattern is strong enough', () => {
    const model = buildRetentionDashboardViewModel({
      signalLabelLower: 'retentiesignaal',
      averageSignal: 5.2,
      strongWorkSignalRate: null,
      engagement: 5.4,
      turnoverIntention: 5.0,
      stayIntent: 5.2,
      hasEnoughData: false,
      hasMinDisplay: true,
      pendingCount: 2,
      factorAverages: {
        growth: 4.3,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards).toEqual([])
    expect(model.primaryQuestion.title).toBe('Eerste managementvraag')
    expect(model.nextStep.title).toBe('Voorzichtig valideren')
    expect(model.signaalbandenText).toContain('niet als individuele voorspelling')
    expect(model.nextStep.body).not.toContain('risicobeeld')
    expect(model.nextStep.body).toContain('eerste eigenaar')
  })
})
