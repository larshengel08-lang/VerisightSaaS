import { describe, expect, it } from 'vitest'
import { buildMtoDashboardViewModel } from '@/lib/products/mto/dashboard'

describe('buildMtoDashboardViewModel', () => {
  it('shows a foundation fallback below the display threshold', () => {
    const model = buildMtoDashboardViewModel({
      signalLabelLower: 'mto-signaal',
      averageSignal: null,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: null,
      hasEnoughData: false,
      hasMinDisplay: false,
      pendingCount: 4,
      factorAverages: {},
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.topSummaryCards.map((card) => card.value)).toEqual([
      'Nog geen veilige MTO-read',
      'Group-level only',
      'Respons opbouwen',
    ])
    expect(model.primaryQuestion.title).toBe('Nog geen brede MTO-read')
    expect(model.nextStep.title).toBe('Eerst respons opbouwen')
    expect(model.followThroughCards).toEqual([])
    expect(model.managementBandOverride).toBeNull()
  })

  it('builds a broad org read with theme priorities and explicit boundaries once data is sufficient', () => {
    const model = buildMtoDashboardViewModel({
      signalLabelLower: 'mto-signaal',
      averageSignal: 6.1,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 5.9,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        workload: 4.1,
        role_clarity: 4.6,
        leadership: 5.2,
        culture: 5.8,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.managementBandOverride).toBe('MIDDEN')
    expect(model.topSummaryCards[0]?.value).toBe('Brede hoofdmeting actief')
    expect(model.topSummaryCards[2]?.value).toBe('Werkbelasting')
    expect(model.topSummaryCards[5]?.value).toBe('Geen reportlaag')
    expect(model.primaryQuestion.title).toBe('Eerste managementvraag')
    expect(model.nextStep.title).toBe('Beleg eerste organisatieread')
    expect(model.followThroughCards[3]?.title).toBe('Eerste begrensde stap')
    expect(model.managementBlocks[2]?.items[0]).toContain('Eerste eigenaar')
    expect(model.managementBlocks[3]?.items[0]).toContain('rapport')
    expect(model.profileCards[0]?.body.toLowerCase()).toContain('hoofdmeting')
  })
})
