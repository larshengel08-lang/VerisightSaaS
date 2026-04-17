import { describe, expect, it } from 'vitest'
import { buildOnboardingDashboardViewModel } from '@/lib/products/onboarding/dashboard'

describe('buildOnboardingDashboardViewModel', () => {
  it('shows an insufficient checkpoint boundary below the display threshold', () => {
    const model = buildOnboardingDashboardViewModel({
      signalLabelLower: 'onboardingsignaal',
      averageSignal: null,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: null,
      hasEnoughData: false,
      hasMinDisplay: false,
      pendingCount: 3,
      factorAverages: {},
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards.map((card) => card.value)).toEqual([
      'Nog geen veilige checkpointread',
      'Te weinig responses',
      'Nog geen groepsread',
    ])
    expect(model.primaryQuestion.title).toBe('Nog geen checkpointread')
    expect(model.nextStep.title).toBe('Eerst respons opbouwen')
    expect(model.followThroughCards).toEqual([])
  })

  it('keeps a stable checkpoint bounded and geared toward safeguarding what works', () => {
    const model = buildOnboardingDashboardViewModel({
      signalLabelLower: 'onboardingsignaal',
      averageSignal: 3.9,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 7.1,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        role_clarity: 3.7,
        culture: 4.2,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards[0]?.value).toBe('Overwegend stabiel')
    expect(model.topSummaryCards[3]?.body.toLowerCase()).toContain('ondersteunt een stabieler checkpointbeeld')
    expect(model.topSummaryCards[4]?.value.toLowerCase()).toContain('onboarding-owner')
    expect(model.topSummaryCards[5]?.value).toBe('Borgactie nu')
    expect(model.primaryQuestion.title).toBe('Eerste borgvraag')
    expect(model.nextStep.title).toBe('Beleg borging nu')
    expect(model.followThroughTitle).toBe('Van checkpoint naar eerste managementhuddle')
    expect(model.followThroughCards.map((card) => card.title)).toEqual([
      'Prioriteit nu',
      'Eerste gesprek',
      'Eerste eigenaar',
      'Eerste actie',
      'Reviewgrens',
      'Wanneer geen nieuw checkpoint',
    ])
    expect(model.followThroughCards[3]?.body.toLowerCase()).toContain('borgactie')
    expect(model.managementBandOverride).toBe('LAAG')
  })

  it('keeps a mixed checkpoint indicative before pattern strength is reached', () => {
    const model = buildOnboardingDashboardViewModel({
      signalLabelLower: 'onboardingsignaal',
      averageSignal: 5.2,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 5.8,
      hasEnoughData: false,
      hasMinDisplay: true,
      pendingCount: 2,
      factorAverages: {
        culture: 4.4,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards[0]?.value).toBe('Indicatief aandachtspunt')
    expect(model.topSummaryCards[1]?.value).toBe('Indicatief checkpoint')
    expect(model.topSummaryCards[5]?.value).toBe('Begrensde actie')
    expect(model.topSummaryCards[6]?.value).toBe('Nog geen patroonclaim')
    expect(model.nextStep.title).toBe('Beleg eerste checkpointactie')
    expect(model.followThroughCards[4]?.body.toLowerCase()).toContain('volgend checkpoint')
    expect(model.managementBandOverride).toBe('MIDDEN')
  })

  it('treats a sharp early signal as a bounded checkpoint, not as a predictor', () => {
    const model = buildOnboardingDashboardViewModel({
      signalLabelLower: 'onboardingsignaal',
      averageSignal: 7.4,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 4.8,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        role_clarity: 3.2,
        leadership: 4.3,
        culture: 4.9,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards[0]?.value).toBe('Scherp vroegsignaal')
    expect(model.topSummaryCards[3]?.body.toLowerCase()).toContain('niet als voorspelling')
    expect(model.topSummaryCards[4]?.value.toLowerCase()).toContain('leidinggevende')
    expect(model.topSummaryCards[5]?.value).toBe('Correctie nu')
    expect(model.topSummaryCards[6]?.body.toLowerCase()).toContain('geen individuele voorspelling')
    expect(model.primaryQuestion.title).toBe('Eerste correctievraag')
    expect(model.nextStep.title).toBe('Beleg correctie en review')
    expect(model.followThroughCards[4]?.title).toBe('Reviewgrens')
    expect(model.managementBandOverride).toBe('HOOG')
  })
})
