import { describe, expect, it } from 'vitest'

import { CULTURE_ASSESSMENT_CONTRACT } from '@/lib/products/culture_assessment/contract'
import { cultureAssessmentProductModule } from '@/lib/products/culture_assessment'

describe('culture assessment product module', () => {
  it('uses the canonical Culture Index copy and contract thresholds', () => {
    expect(cultureAssessmentProductModule.definition.productName).toBe('Loep Culture Assessment')
    expect(cultureAssessmentProductModule.definition.signalLabel).toBe('Loep Culture Index')
    expect(cultureAssessmentProductModule.definition.launchStatus).toContain('pilot-ready')
    expect(cultureAssessmentProductModule.definition.deploymentProfiles?.mkb.toLowerCase()).toContain('dezelfde kernvragenlijst')
    expect(cultureAssessmentProductModule.definition.standardOutputs).toContain('boardroom deck blueprint')
    expect(CULTURE_ASSESSMENT_CONTRACT.thresholds.organizationMinN).toBe(30)
    expect(CULTURE_ASSESSMENT_CONTRACT.namedManagerLayer.defaultState).toBe('locked')
    expect(CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder).toEqual([
      'response_basis',
      'executive_culture_read',
      'culture_index',
      'board_attention_points',
      'domain_view',
      'pattern_view',
      'segment_contrasts',
      'deepening_layers',
      'open_signals',
      'board_read_follow_on',
      'report_export_methodology',
    ])
    expect(cultureAssessmentProductModule.definition.optionalOutputs).toContain('segment summary export')
    expect(cultureAssessmentProductModule.definition.outputReadiness?.boardroomDeck).toBe('blueprint_ready')
    expect(cultureAssessmentProductModule.definition.outputReadiness?.boardReportPdf).toBe('demo_asset_ready')
    expect(cultureAssessmentProductModule.definition.outputSequenceNote?.toLowerCase()).toContain('compacte executive read')
  })

  it('builds an executive-safe dashboard model without ranking language', () => {
    const view = cultureAssessmentProductModule.buildDashboardViewModel({
      signalLabelLower: 'loep culture index',
      averageSignal: 6.4,
      strongWorkSignalRate: null,
      engagement: 6.1,
      turnoverIntention: null,
      stayIntent: null,
      hasEnoughData: true,
      hasMinDisplay: true,
      pendingCount: 0,
      factorAverages: {
        engagement_involvement: 6.2,
        trust_psychological_safety: 5.7,
      },
      topExitReasonLabel: null,
      topContributingReasonLabel: null,
      signalVisibilityAverage: null,
    })

    expect(view.primaryQuestion.title).toContain('Bestuurlijke')
    expect(JSON.stringify(view).toLowerCase()).not.toContain('ranking')
    expect(JSON.stringify(view).toLowerCase()).not.toContain('gezondheidsscore')
  })
})
