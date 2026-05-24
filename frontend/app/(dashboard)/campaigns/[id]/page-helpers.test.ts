import { describe, expect, it } from 'vitest'
import {
  buildDecisionPanels,
  buildHeroDescription,
  buildNextStepBody,
  clusterExitOpenSignals,
  computeAverageRiskScore,
  computeRetentionSupplementalAverages,
} from './page-helpers'
import { getResultsProductCopy } from '@/lib/dashboard/results-copy'
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

  it('keeps exit helper openings centered on vertrekduiding with claim-safe werkfrictie language', () => {
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

    expect(hero).toContain('terugkijkende vertrekduiding')
    expect(hero).toContain('werkfrictie')
    expect(nextStep).toContain('Frictiescore')
    expect(nextStep).toContain('werkfrictie')
    expect(nextStep).not.toContain('oorzaak')
  })

  it('clusters exit open signals without inventing extra quotes or factor values', () => {
    const responses: SurveyResponse[] = [
      {
        id: 'resp-1',
        respondent_id: 'r-1',
        risk_score: 6.2,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        open_text_raw: 'Mijn leidinggevende gaf weinig feedback en de aansturing bleef onduidelijk.',
        full_result: {},
        submitted_at: '2026-04-18T10:00:00Z',
      },
      {
        id: 'resp-2',
        respondent_id: 'r-2',
        risk_score: 5.9,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        open_text_raw: 'Prioriteiten waren niet helder en verantwoordelijkheden bleven diffuus.',
        full_result: {},
        submitted_at: '2026-04-18T10:05:00Z',
      },
    ]

    const themes = clusterExitOpenSignals(responses)

    expect(themes[0]).toMatchObject({
      key: 'leadership',
      title: 'Leiderschap en steun',
      count: 1,
    })
    expect(themes.some((theme) => theme.title === 'Rolhelderheid en prioriteiten')).toBe(true)
    expect(themes).toHaveLength(2)
  })

  it('uses customer-facing product labels instead of internal managementread language', () => {
    const pulseHero = buildHeroDescription({
      scanType: 'pulse',
      isActive: true,
      completionRate: 61,
      pendingCount: 2,
      hasEnoughData: true,
      averageRiskScore: 5.9,
      scanDefinition: getScanDefinition('pulse'),
    })

    expect(pulseHero).toContain(getResultsProductCopy('pulse').readLabel)
    expect(pulseHero.toLowerCase()).not.toContain('managementread')
    expect(pulseHero.toLowerCase()).not.toContain('bounded reviewlaag')
  })
})
