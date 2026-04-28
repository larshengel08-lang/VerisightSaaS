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
      managementMeaningClear: false,
      plausibleFollowUpExists: false,
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
})
