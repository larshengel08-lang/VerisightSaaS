import { describe, expect, it } from 'vitest'
import {
  buildDecisionPanels,
  buildHeroDescription,
  buildNextStepBody,
  computeAverageRiskScore,
  computeFactorAverages,
  computeRetentionSupplementalAverages,
} from './page-helpers'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { SurveyResponse } from '@/lib/types'

describe('dashboard page helpers field semantics', () => {
  it('reads the signal alias before falling back to risk_score', () => {
    const responses: SurveyResponse[] = [
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        signal_score: 6.4,
        risk_score: 5.2,
        risk_band: 'MIDDEN',
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
        risk_band: 'MIDDEN',
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
    const responses: SurveyResponse[] = [
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        risk_score: 5.2,
        direction_signal_score: 2,
        stay_intent_score: 4,
        risk_band: 'MIDDEN',
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
        risk_band: 'MIDDEN',
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

  it('keeps retention helper summaries centered on retentiesignaal instead of stay-intent', () => {
    const panels = buildDecisionPanels({
      stats: {
        scan_type: 'retention',
        completion_rate_pct: 72,
      } as never,
      averageRiskScore: 6.1,
      scanDefinition: getScanDefinition('retention'),
      strongWorkSignalRate: null,
      retentionSupplemental: {
        engagement: 5.8,
        turnoverIntention: 5.9,
        stayIntent: 4.7,
      },
      factorAverages: {},
      hasEnoughData: true,
      hasMinDisplay: true,
    })

    expect(panels[0]?.title).toBe('Retentiesignaal')
    expect(panels[2]?.body).not.toContain('stay-intent')
    expect(panels[2]?.body).toContain('aanvullende signalen')
  })

  it('keeps exit helper openings centered on frictiescore with werkfrictie as duiding', () => {
    const hero = buildHeroDescription({
      scanType: 'exit',
      isActive: false,
      completionRate: 82,
      pendingCount: 0,
      hasEnoughData: true,
      averageRiskScore: 6.3,
      scanDefinition: getScanDefinition('exit'),
    })

    const nextStep = buildNextStepBody({
      scanType: 'exit',
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      topFactor: 'Leiderschap',
    })

    expect(hero).toContain('Frictiescore')
    expect(hero).toContain('werkfrictie')
    expect(nextStep).toContain('Frictiescore')
    expect(nextStep).toContain('werkfrictie')
  })

  it('keeps culture assessment helper copy board-readable and non-ranking', () => {
    const hero = buildHeroDescription({
      scanType: 'culture_assessment',
      isActive: true,
      completionRate: 38,
      pendingCount: 14,
      hasEnoughData: true,
      averageRiskScore: 6.5,
      scanDefinition: getScanDefinition('culture_assessment'),
    })
    const panels = buildDecisionPanels({
      stats: {
        scan_type: 'culture_assessment',
        completion_rate_pct: 38,
      } as never,
      averageRiskScore: 6.5,
      scanDefinition: getScanDefinition('culture_assessment'),
      strongWorkSignalRate: null,
      retentionSupplemental: {
        engagement: 6.1,
        turnoverIntention: 4.2,
        stayIntent: 6.0,
      },
      factorAverages: {
        trust_psychological_safety: 5.7,
      },
      hasEnoughData: true,
      hasMinDisplay: true,
    })
    const nextStep = buildNextStepBody({
      scanType: 'culture_assessment',
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      topFactor: 'Vertrouwen en psychologische veiligheid',
    })

    expect(hero).toContain('jaarlijkse')
    expect(hero).toContain('Loep Culture Index')
    expect(hero.toLowerCase()).not.toContain('ranking')
    expect(panels[2]?.title.toLowerCase()).toContain('managerlaag')
    expect(panels[2]?.body.toLowerCase()).toContain('locked')
    expect(nextStep.toLowerCase()).toContain('navigatiesignaal')
    expect(nextStep.toLowerCase()).toContain('board')
  })

  it('aggregates culture assessment domain keys from org_scores', () => {
    const averages = computeFactorAverages([
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        risk_score: 6.1,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {
          engagement_involvement: 6.2,
          trust_psychological_safety: 5.6,
        },
        full_result: {},
        submitted_at: '2026-05-18T10:00:00Z',
      },
      {
        id: 'resp-2',
        respondent_id: 'r-2',
        risk_score: 6.7,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {
          engagement_involvement: 7.2,
          trust_psychological_safety: 6.4,
        },
        full_result: {},
        submitted_at: '2026-05-18T11:00:00Z',
      },
    ])

    expect(averages.orgAverages.engagement_involvement).toBe(6.7)
    expect(averages.orgAverages.trust_psychological_safety).toBe(6)
  })
})
