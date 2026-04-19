import { describe, expect, it } from 'vitest'
import {
  buildActionExecutionCore,
  buildDriverDrilldownModel,
  buildEvidenceReadingFlow,
  buildResponseReadState,
  buildScoreInterpretationGuide,
  computeAverageRiskScore,
  computeRetentionSupplementalAverages,
  MIN_N_PATTERNS,
} from './page-helpers'

describe('dashboard page helpers field semantics', () => {
  it('reads the signal alias before falling back to risk_score', () => {
    const responses = [
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        signal_score: 6.4,
        risk_score: 5.2,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:00:00Z',
      },
      {
        id: 'resp-2',
        respondent_id: 'r-2',
        signal_score: 5.4,
        risk_score: 5.0,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:05:00Z',
      },
    ]

    expect(computeAverageRiskScore(responses)).toBe(5.9)
  })

  it('reads the direction signal alias before falling back to stay_intent_score', () => {
    const responses = [
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        risk_score: 5.2,
        direction_signal_score: 2,
        stay_intent_score: 4,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:00:00Z',
      },
      {
        id: 'resp-2',
        respondent_id: 'r-2',
        risk_score: 5.0,
        direction_signal_score: 4,
        stay_intent_score: 2,
        risk_band: 'MIDDEN' as const,
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: {},
        submitted_at: '2026-04-18T10:05:00Z',
      },
    ]

    expect(computeRetentionSupplementalAverages(responses).stayIntent).toBe(5.5)
  })
})

describe('driver drilldown model', () => {
  it('defaults to the strongest factor and highlights the top two drivers', () => {
    const model = buildDriverDrilldownModel({
      factorAverages: {
        workload: 3.4,
        leadership: 3.9,
        culture: 5.2,
      },
      selectedFactorKey: null,
    })

    expect(model.selectedFactorKey).toBe('workload')
    expect(model.highlightedFactors.map((factor) => factor.factorKey)).toEqual(['workload', 'leadership'])
    expect(model.availableFactors[0]?.factorKey).toBe('workload')
  })

  it('falls back to the strongest factor when the requested driver is unavailable', () => {
    const model = buildDriverDrilldownModel({
      factorAverages: {
        growth: 4.1,
        culture: 4.4,
      },
      selectedFactorKey: 'workload',
    })

    expect(model.selectedFactorKey).toBe('growth')
    expect(model.selectedFactor?.factorKey).toBe('growth')
  })
})

describe('overview reading aids', () => {
  it('gives the overview a short response-read cue and next step once data is strong enough', () => {
    const state = buildResponseReadState({
      totalInvited: 40,
      totalCompleted: 18,
      completionRate: 45,
      pendingCount: 22,
      hasMinDisplay: true,
      hasEnoughData: true,
      isActive: true,
    })

    expect(state.quickLabel).toBe('Nu lezen')
    expect(state.caution).toContain('nuance')
    expect(state.nextStep).toContain('handoff')
  })

  it('keeps score interpretation as a three-step reading aid without forcing Exit language onto RetentieScan', () => {
    const exitGuide = buildScoreInterpretationGuide('exit')
    const retentionGuide = buildScoreInterpretationGuide('retention')

    expect(exitGuide.steps).toHaveLength(3)
    expect(exitGuide.steps[0]?.title).toContain('Frictiescore')
    expect(exitGuide.steps[1]?.title).toContain('Verdeling')
    expect(retentionGuide.steps[0]?.title).toContain('Retentiesignaal')
    expect(retentionGuide.steps[0]?.title).not.toContain('Frictiescore')
  })
})

describe('action execution core', () => {
  it('keeps route, owner, first step and review as the dominant action layer', () => {
    const model = buildActionExecutionCore({
      selectedPlaybook: {
        title: 'Start met rolhelderheid',
        decision: 'Maak rolhelderheid het eerste managementspoor.',
        validate: 'Toets eerst waar onduidelijkheid het sterkst wordt beleefd.',
        owner: 'HR business partner',
        actions: ['Plan een eerste verificatiegesprek'],
        caution: 'Voorkom dat dit meteen een breed veranderprogramma wordt.',
        review: 'Review binnen 3 weken',
      },
      nextStep: {
        title: 'Valideren en prioriteren',
        body: 'Gebruik de eerste managementronde om te toetsen wat nu echt eerst aandacht vraagt.',
        tone: 'blue',
      },
      highlightedActionQuestion: 'Waar belemmert onduidelijkheid nu het dagelijks werk het meest?',
      followThroughCard: {
        title: 'Eerste review',
        body: 'Check of de gekozen route nog klopt of begrensd moet worden.',
        tone: 'amber',
      },
    })

    expect(model.route.title).toBe('Start met rolhelderheid')
    expect(model.owner.title).toBe('HR business partner')
    expect(model.firstStep.body).toContain('onduidelijkheid')
    expect(model.review.title).toBe('Review binnen 3 weken')
    expect(model.supportPrompt).toContain('Alleen openklappen')
  })
})

describe('evidence reading flow', () => {
  it('keeps one clear evidence entry before any secondary layers', () => {
    const model = buildEvidenceReadingFlow({
      showDriverDrilldown: true,
      showSegmentAnalysis: true,
    })

    expect(model.primaryEntry.badge).toBe('Start hier')
    expect(model.intro.sequence).toEqual([
      '1. Kernverdieping',
      '2. SDT en factoren',
      '3. Segmenten',
      '4. Methodiek en accountability',
    ])
    expect(model.sections.methodology.badge).toBe('Secondary trust layer')
  })

  it('keeps unavailable evidence and segment states explicit without making them primary', () => {
    const model = buildEvidenceReadingFlow({
      showDriverDrilldown: false,
      showSegmentAnalysis: false,
    })

    expect(model.primaryEntry.emptyState).toContain(`${MIN_N_PATTERNS}`)
    expect(model.sections.segments.badge).toBe('Verborgen tot thresholds')
    expect(model.supportPrompt).toContain('alleen open')
  })
})
