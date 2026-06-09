import { describe, expect, it } from 'vitest'
import {
  buildBridgeAssessmentTruth,
  getHrBridgePresentation,
  resolveHrBridgeState,
  type BridgeAssessmentTruth,
} from './hr-bridge-state'

describe('hr bridge state', () => {
  it('keeps candidate truth canonical before a route exists', () => {
    const assessment = buildBridgeAssessmentTruth({
      sourceType: 'campaign',
      sourceId: 'cmp-1',
      signalReadable: true,
      managementMeaningClear: true,
      plausibleFollowUpExists: true,
      assessedAt: '2026-04-28T09:00:00.000Z',
    })

    expect(assessment.assessmentState).toBe('candidate')
  })

  it('keeps attention when the signal is not yet management-readable', () => {
    const assessment = buildBridgeAssessmentTruth({
      sourceType: 'campaign',
      sourceId: 'cmp-2',
      signalReadable: false,
      managementMeaningClear: true,
      plausibleFollowUpExists: true,
      assessedAt: '2026-04-28T09:00:00.000Z',
    })

    expect(resolveHrBridgeState({ routeEntryStage: null, assessment })).toBe('attention')
  })

  it('lets an active route override pre-route candidate truth', () => {
    const assessment: BridgeAssessmentTruth = {
      sourceType: 'report',
      sourceId: 'cmp-3',
      assessmentState: 'candidate',
      signalReadable: true,
      managementMeaningClear: true,
      plausibleFollowUpExists: true,
      assessedAt: '2026-04-28T09:00:00.000Z',
    }

    expect(resolveHrBridgeState({ routeEntryStage: 'active', assessment })).toBe('active')
  })

  it('maps reports candidate state to campaign-detail pass-through instead of route-open', () => {
    const presentation = getHrBridgePresentation({
      bridgeState: 'candidate',
      surface: 'reports',
    })

    expect(presentation.label).toBe('Route-kandidaat')
    expect(presentation.ctaKind).toBe('view')
    expect(presentation.ctaLabel).toBe('Ga naar campaign detail')
  })

  it('maps active state to action center open semantics', () => {
    const presentation = getHrBridgePresentation({
      bridgeState: 'active',
      surface: 'overview',
    })

    expect(presentation.label).toBe('Actieve opvolging')
    expect(presentation.body).toBe('Deze opvolging loopt al in Action Center.')
    expect(presentation.ctaKind).toBe('open')
    expect(presentation.ctaLabel).toBe('Open in Action Center')
  })

  it('maps attention state to read-first semantics', () => {
    const presentation = getHrBridgePresentation({
      bridgeState: 'attention',
      surface: 'reports',
    })

    expect(presentation.label).toBe('Alleen aandacht')
    expect(presentation.body).toBe('Lees eerst verder voordat je hier opvolging van maakt.')
    expect(presentation.ctaKind).toBe('view')
    expect(presentation.ctaLabel).toBe('Lees campagne')
  })
})
