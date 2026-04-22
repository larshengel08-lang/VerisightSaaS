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
      'Frictiescore nu',
      'Waarom telt dit nu',
      'Eerste besluit',
      'Eerste eigenaar',
      'Wat niet concluderen',
    ])
    expect(model.signaalbandenText).toContain('sponsor')
    expect(model.topSummaryCards[2]?.body).toContain('Beslis eerst')
    expect(model.topSummaryCards[3]?.value).toContain('HR')
    expect(model.topSummaryCards[4]?.body).toContain('ROI-garantie')
    expect(model.primaryQuestion.body).toContain('breed werkgerelateerd vertrekbeeld')
    expect(model.nextStep.body).toContain('30-90')
    expect(model.nextStep.body).toContain('eigenaar')
    expect(model.followThroughTitle).toContain('managementactie')
    expect(model.followThroughCards.map((card) => card.title)).toEqual([
      'Prioriteit nu',
      'Eerste gesprek',
      'Wie moet aan tafel',
      'Eerste eigenaar',
      'Eerste actie',
      'Reviewmoment',
    ])
    expect(model.followThroughCards[3]?.body).toContain('HR')
    expect(model.followThroughCards[5]?.body).toMatch(/6-8 weken|60-90/i)
    expect(model.managementBlocks[1]?.title).toBe('Welk besluit hoort nu eerst?')
    expect(model.managementBlocks[2]?.items[0]).toContain('Eerste eigenaar')
    expect(model.managementBlocks[0]?.title).toBe('Wat speelt nu?')
    expect(model.focusSectionIntro).toContain('kiezen')
  })

  it('keeps the primary exit dashboard surfaces centered on frictiescore', () => {
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

    expect(model.topSummaryCards[0]?.title).toBe('Frictiescore nu')
    expect(model.topSummaryCards[0]?.value).toBe('6.6/10')
    expect(model.topSummaryCards[0]?.body).toContain('Frictiescore')
    expect(model.topSummaryCards[0]?.body).toContain('werkfrictie')
    expect(model.profileCards[0]?.body).toContain('Frictiescore')
    expect(model.profileCards[0]?.body).not.toContain('werkfrictie als hoofdlabel')
    expect(model.managementBlocks[0]?.items[0]).toContain('Frictiescore')
    expect(model.nextStep.body).toContain('Frictiescore')
    expect(model.nextStep.body).toContain('werkfrictie')
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
    expect(model.followThroughCards[0]?.title).toBe('Prioriteit nu')
    expect(model.followThroughCards[5]?.body).toContain('10 responses')
  })
})
