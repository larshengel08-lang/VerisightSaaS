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

    expect(model.interpretationState).toBe('insufficient_broad_read')
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

  it('distinguishes an indicative broad read before the pattern threshold is reached', () => {
    const model = buildMtoDashboardViewModel({
      signalLabelLower: 'mto-signaal',
      averageSignal: 5.8,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 6.0,
      hasEnoughData: false,
      hasMinDisplay: true,
      pendingCount: 3,
      factorAverages: {
        workload: 4.9,
        leadership: 5.2,
        culture: 5.6,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.interpretationState).toBe('indicative_broad_read')
    expect(model.topSummaryCards[0]?.value).toBe('Indicatieve hoofdmeting')
    expect(model.topSummaryCards[2]?.value).toBe('Nog indicatief')
    expect(model.primaryQuestion.title).toBe('Welke brede vraag tekent zich af?')
    expect(model.nextStep.title).toBe('Nog geen stevige patroonread')
    expect(model.followThroughCards[0]?.title).toBe('Bouw eerst patroonsterkte op')
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

    expect(model.interpretationState).toBe('attention_broad_read')
    expect(model.managementBandOverride).toBe('MIDDEN')
    expect(model.topSummaryCards[0]?.value).toBe('Actieve hoofdmeting')
    expect(model.topSummaryCards[2]?.value).toBe('Werkbelasting')
    expect(model.topSummaryCards[5]?.value).toBe('Geen reportlaag')
    expect(model.primaryQuestion.title).toBe('Eerste managementvraag')
    expect(model.nextStep.title).toBe('Beleg eerste organisatieread')
    expect(model.followThroughCards[3]?.title).toBe('Eerste begrensde stap')
    expect(model.managementBlocks[2]?.items[0]).toContain('Eerste eigenaar')
    expect(model.managementBlocks[3]?.items[0]).toContain('rapport')
    expect(model.profileCards[0]?.body.toLowerCase()).toContain('hoofdmeting')
  })

  it('marks a high-signal low-direction read as a sharp broad attention point', () => {
    const model = buildMtoDashboardViewModel({
      signalLabelLower: 'mto-signaal',
      averageSignal: 8.0,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 4.3,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        workload: 3.8,
        role_clarity: 4.1,
        leadership: 4.9,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.interpretationState).toBe('high_attention_broad_read')
    expect(model.topSummaryCards[0]?.value).toBe('Scherpe hoofdmeting')
    expect(model.topSummaryCards[2]?.value).toBe('Scherp aandachtspunt')
    expect(model.primaryQuestion.title).toBe('Welke brede oorzaak vraagt nu eerst verificatie?')
    expect(model.nextStep.title).toBe('Prioriteer eerste organisatiehuddle')
    expect(model.managementBlocks[0]?.title).toBe('Hoe lees je deze scherpe MTO?')
  })
})
