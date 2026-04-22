import { describe, expect, it } from 'vitest'
import { buildLeadershipDashboardViewModel } from '@/lib/products/leadership/dashboard'

describe('buildLeadershipDashboardViewModel', () => {
  it('shows an insufficient management boundary below the display threshold', () => {
    const model = buildLeadershipDashboardViewModel({
      signalLabelLower: 'leadershipsignaal',
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
      'Nog geen veilige managementread',
      'Alleen groepsniveau',
      'Respons opbouwen',
    ])
    expect(model.primaryQuestion.title).toBe('Nog geen managementread')
    expect(model.nextStep.title).toBe('Eerst respons opbouwen')
    expect(model.followThroughCards).toEqual([])
    expect(model.managementBandOverride).toBeNull()
  })

  it('builds a stable management read with a low band override when signal is low and direction is supportive', () => {
    const model = buildLeadershipDashboardViewModel({
      signalLabelLower: 'leadershipsignaal',
      averageSignal: 3.8,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 7.1,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        leadership: 7.1,
        culture: 7.4,
        growth: 7.8,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.managementBandOverride).toBe('LAAG')
    expect(model.topSummaryCards[0]?.value).toBe('Overwegend stabiel')
    expect(model.topSummaryCards[5]?.value).toBe('Borgactie nu')
    expect(model.nextStep.title).toBe('Beleg borging nu')
    expect(model.followThroughCards[3]?.title).toBe('Eerste actie')
    expect(model.followThroughCards[3]?.body).toContain('behouden')
    expect(model.managementBlocks[2]?.title).toBe('Wie trekt dit en waar ligt de grens?')
    expect(model.managementBlocks[2]?.items[0]).toContain('Eerste eigenaar')
    expect(model.managementBlocks[2]?.items[2]?.toLowerCase()).toContain('borgroute')
    expect(model.managementBlocks[3]?.title).toBe('Wanneer blijft dit leadership en wanneer niet?')
    expect(model.managementBlocks[3]?.items[0]).toContain('named leaders')
    expect(model.profileCards[0]?.body.toLowerCase()).toContain('management-context triage')
    expect(model.profileCards[1]?.value).toBe('Duiding -> check -> grens')
    expect(model.profileCards[1]?.body.toLowerCase()).toContain('begrensde support-read')
    expect(model.followThroughTitle).toBe('Van Leadership Scan naar begrensde check')
    expect(model.focusSectionIntro.toLowerCase()).toContain('checks hieronder')
    expect(model.followThroughCards[5]?.title).toBe('Wanneer terug naar bredere duiding')
  })

  it('builds an attention management read with a middle band override for a mixed signal', () => {
    const model = buildLeadershipDashboardViewModel({
      signalLabelLower: 'leadershipsignaal',
      averageSignal: 5.8,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 6.0,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        role_clarity: 4.2,
        leadership: 4.9,
        culture: 5.2,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.managementBandOverride).toBe('MIDDEN')
    expect(model.topSummaryCards[0]?.value).toBe('Actief aandachtspunt')
    expect(model.topSummaryCards[6]?.value).toBe('Geen TeamScan-claim')
    expect(model.primaryQuestion.title).toBe('Eerste managementvraag')
    expect(model.nextStep.title).toBe('Beleg eerste verificatie')
    expect(model.followThroughTitle).toBe('Van Leadership Scan naar begrensde check')
    expect(model.followThroughCards[5]?.title).toBe('Wanneer terug naar bredere duiding')
    expect(model.followThroughCards[5]?.body.toLowerCase()).toContain('bredere duiding')
    expect(model.managementBlocks[2]?.items[3]?.toLowerCase()).toContain('review')
    expect(model.profileCards[0]?.body.toLowerCase()).toContain('named leader')
    expect(model.focusSectionIntro.toLowerCase()).toContain('checks hieronder')
  })

  it('builds a high-attention management read with a high band override when signal is high and direction is low', () => {
    const model = buildLeadershipDashboardViewModel({
      signalLabelLower: 'leadershipsignaal',
      averageSignal: 7.4,
      strongWorkSignalRate: null,
      engagement: null,
      turnoverIntention: null,
      stayIntent: 4.8,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        leadership: 3.2,
        role_clarity: 4.1,
        culture: 4.6,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(model.managementBandOverride).toBe('HOOG')
    expect(model.topSummaryCards[0]?.value).toBe('Scherp aandachtssignaal')
    expect(model.topSummaryCards[5]?.value).toBe('Correctie nu')
    expect(model.nextStep.title).toBe('Beleg correctie en review')
    expect(model.followThroughCards[3]?.body.toLowerCase()).toContain('management')
    expect(model.managementBlocks[2]?.items[2]?.toLowerCase()).toContain('zichtbare verandering')
    expect(model.managementBlocks[3]?.items[0]).toContain('360')
    expect(model.managementBlocks[3]?.items[1]).toContain('bredere duiding')
    expect(model.profileCards[0]?.body.toLowerCase()).toContain('360')
    expect(model.topSummaryCards[6]?.body.toLowerCase()).toContain('performance')
    expect(model.profileCards[1]?.value).toBe('Duiding -> check -> grens')
  })
})
