import { describe, expect, it } from 'vitest'

import {
  CULTURE_ASSESSMENT_CONTRACT,
  CULTURE_ASSESSMENT_FUTURE_CONTRACT_ROLES_V1,
  CULTURE_ASSESSMENT_RUNTIME_ACTIVE_ROLES_V1,
} from '@/lib/products/culture_assessment/contract'
import { cultureAssessmentProductModule } from '@/lib/products/culture_assessment'

describe('culture assessment product module', () => {
  it('uses the canonical Culture Index copy and contract thresholds', () => {
    expect(cultureAssessmentProductModule.definition.productName).toBe('Loep Culture Assessment')
    expect(cultureAssessmentProductModule.definition.signalLabel).toBe('Loep Culture Index')
    expect(cultureAssessmentProductModule.definition.launchStatus).toContain('pilot-ready')
    expect(cultureAssessmentProductModule.definition.deploymentProfiles?.mkb.toLowerCase()).toContain('dezelfde kernvragenlijst')
    expect(cultureAssessmentProductModule.definition.standardOutputs).toContain('boardroom pdf deck')
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
    expect(cultureAssessmentProductModule.definition.outputReadiness?.boardroomDeck).toBe('pilot_delivery_ready')
    expect(cultureAssessmentProductModule.definition.outputReadiness?.boardReportPdf).toBe('pilot_delivery_ready')
    expect(cultureAssessmentProductModule.definition.outputSequenceNote?.toLowerCase()).toContain('compacte executive read')
    expect(cultureAssessmentProductModule.definition.followOnOutcomes).toEqual([
      'no immediate next route',
      'deeper governed work',
      'Pulse follow-on',
      'another Loep route',
    ])
    expect(cultureAssessmentProductModule.definition.followOnDecisionNote?.toLowerCase()).toContain(
      'geen vervolgrichting opent automatisch',
    )
    expect(cultureAssessmentProductModule.definition.governedExportEntitlements?.hr_partner?.segmentSummaryExport).toBe(
      'governed',
    )
    expect(cultureAssessmentProductModule.definition.governedExportEntitlements?.manager_limited?.segmentSummaryExport).toBe(
      'denied',
    )
    expect(cultureAssessmentProductModule.definition.textSafetyStates).toEqual([
      'not_collected',
      'collected_not_processed',
      'processed_safe_none_visible',
      'processed_safe_summary_visible',
      'suppressed_below_threshold',
      'suppressed_sensitive_content',
      'suppressed_unapproved',
    ])
    expect(CULTURE_ASSESSMENT_RUNTIME_ACTIVE_ROLES_V1).toEqual([
      'admin',
      'hr_partner',
      'executive',
    ])
    expect(CULTURE_ASSESSMENT_FUTURE_CONTRACT_ROLES_V1).toEqual([
      'business_unit_lead',
      'manager_limited',
    ])
    expect(CULTURE_ASSESSMENT_CONTRACT.runtimeRoleModel.activeInV1).toEqual(
      CULTURE_ASSESSMENT_RUNTIME_ACTIVE_ROLES_V1,
    )
    expect(CULTURE_ASSESSMENT_CONTRACT.runtimeRoleModel.futureContractRolesNotActiveInV1).toEqual(
      CULTURE_ASSESSMENT_FUTURE_CONTRACT_ROLES_V1,
    )
    expect(CULTURE_ASSESSMENT_CONTRACT.runtimeRoleModel.note.toLowerCase()).toContain('contract-future')
    expect(CULTURE_ASSESSMENT_CONTRACT.boardAttentionLogic.implementedInputs).toEqual([
      'domain_scores',
      'recurring_theme_pairs',
    ])
    expect(CULTURE_ASSESSMENT_CONTRACT.boardAttentionLogic.plannedGovernedInputs).toEqual([
      'segment_spread',
      'response_coverage',
      'contrast_strength',
      'safe_open_text_clusters',
    ])
    expect(CULTURE_ASSESSMENT_CONTRACT.visibilityRules.manager_limited).toEqual([
      'manager_cascade_output_only_when_explicitly_activated',
    ])
    expect(CULTURE_ASSESSMENT_CONTRACT.futureVisibilityRules.manager_limited).toEqual([
      'response_basis',
      'domain_view',
    ])
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
    expect(view.followThroughCards.some((card) => card.body.toLowerCase().includes('geen onmiddellijke vervolgrichting'))).toBe(
      true,
    )
    expect(view.followThroughCards.some((card) => card.body.toLowerCase().includes('deeper governed work'))).toBe(true)
    expect(view.followThroughCards.some((card) => card.body.includes('RetentieScan') || card.body.includes('ExitScan'))).toBe(
      true,
    )
  })
})
