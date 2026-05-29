import { describe, expect, it } from 'vitest'
import {
  buildDecisionPanels,
  buildHeroDescription,
  buildNextStepBody,
  clusterExitOpenSignals,
  computeENPS,
  computeAverageRiskScore,
  computeFactorAverages,
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

  it('computes eNPS only when at least five responses expose a raw score', () => {
    const tooSmall: SurveyResponse[] = Array.from({ length: 4 }, (_, index) => ({
      id: `resp-small-${index}`,
      respondent_id: `r-small-${index}`,
      risk_score: 5.2,
      risk_band: 'MIDDEN',
      preventability: null,
      exit_reason_code: null,
      sdt_scores: {},
      org_scores: {},
      full_result: {
        enps: {
          raw_score: 10,
          band: 'promoter',
        },
      },
      submitted_at: '2026-04-18T10:00:00Z',
    }))

    const sufficient: SurveyResponse[] = [
      {
        id: 'resp-enps-1',
        respondent_id: 'r-enps-1',
        risk_score: 5.2,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: { enps: { raw_score: 10, band: 'promoter' } },
        submitted_at: '2026-04-18T10:00:00Z',
      },
      {
        id: 'resp-enps-2',
        respondent_id: 'r-enps-2',
        risk_score: 5.0,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: { enps: { raw_score: 9, band: 'promoter' } },
        submitted_at: '2026-04-18T10:05:00Z',
      },
      {
        id: 'resp-enps-3',
        respondent_id: 'r-enps-3',
        risk_score: 5.1,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: { enps: { raw_score: 8, band: 'passive' } },
        submitted_at: '2026-04-18T10:10:00Z',
      },
      {
        id: 'resp-enps-4',
        respondent_id: 'r-enps-4',
        risk_score: 5.4,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: { enps: { raw_score: 6, band: 'detractor' } },
        submitted_at: '2026-04-18T10:15:00Z',
      },
      {
        id: 'resp-enps-5',
        respondent_id: 'r-enps-5',
        risk_score: 5.3,
        risk_band: 'MIDDEN',
        preventability: null,
        exit_reason_code: null,
        sdt_scores: {},
        org_scores: {},
        full_result: { enps: { raw_score: 0, band: 'detractor' } },
        submitted_at: '2026-04-18T10:20:00Z',
      },
    ]

    expect(computeENPS(tooSmall)).toBeNull()
    expect(computeENPS(sufficient)).toBe(0)
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
