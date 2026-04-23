import { describe, expect, it } from 'vitest'
import {
  buildDeliveryAutoSignals,
  buildDeliveryDisciplineWarnings,
  buildDeliveryGovernanceSnapshot,
  buildDeliveryOpsSummary,
  getDeliveryOperatingGuide,
  validateDeliveryCheckpointUpdate,
  validateDeliveryLifecycleTransition,
  type CampaignDeliveryCheckpoint,
  type CampaignDeliveryRecord,
  type DeliveryCheckpointKey,
} from '@/lib/ops-delivery'

function createCheckpoint(
  checkpointKey: DeliveryCheckpointKey,
  overrides: Partial<CampaignDeliveryCheckpoint> = {},
): CampaignDeliveryCheckpoint {
  return {
    id: `${checkpointKey}-id`,
    delivery_record_id: 'delivery-1',
    checkpoint_key: checkpointKey,
    auto_state: 'ready',
    manual_state: 'confirmed',
    exception_status: 'none',
    last_auto_summary: `${checkpointKey} ready`,
    operator_note: null,
    created_at: '2026-04-17T09:00:00Z',
    updated_at: '2026-04-17T09:00:00Z',
    ...overrides,
  }
}

function createRecord(overrides: Partial<CampaignDeliveryRecord> = {}): CampaignDeliveryRecord {
  return {
    id: 'delivery-1',
    organization_id: 'org-1',
    campaign_id: 'campaign-1',
    contact_request_id: 'lead-1',
    lifecycle_stage: 'setup_in_progress',
    exception_status: 'none',
    operator_owner: 'Verisight Ops',
    next_step: 'Confirm launch discipline',
    operator_notes: null,
    customer_handoff_note: null,
    first_management_use_confirmed_at: null,
    follow_up_decided_at: null,
    learning_closed_at: null,
    created_at: '2026-04-17T09:00:00Z',
    updated_at: '2026-04-17T09:00:00Z',
    ...overrides,
  }
}

describe('delivery ops governance helpers', () => {
  it('shows launch blockers when intake, import and invite readiness are still open', () => {
    const autoSignals = buildDeliveryAutoSignals({
      scanType: 'exit',
      linkedLeadPresent: false,
      totalInvited: 5,
      totalCompleted: 0,
      invitesNotSent: 2,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 0,
      importReady: false,
    })

    const checkpoints = [
      createCheckpoint('implementation_intake', { manual_state: 'pending', auto_state: autoSignals.implementation_intake.autoState, last_auto_summary: autoSignals.implementation_intake.summary }),
      createCheckpoint('import_qa', { manual_state: 'pending', auto_state: autoSignals.import_qa.autoState, last_auto_summary: autoSignals.import_qa.summary }),
      createCheckpoint('invite_readiness', { manual_state: 'pending', auto_state: autoSignals.invite_readiness.autoState, last_auto_summary: autoSignals.invite_readiness.summary }),
    ]

    const snapshot = buildDeliveryGovernanceSnapshot({
      scanType: 'exit',
      record: createRecord({ contact_request_id: null }),
      checkpoints,
      autoSignals,
    })

    expect(snapshot.launchReady).toBe(false)
    expect(snapshot.intakeBlockers.join(' ')).toContain('Implementation intake')
    expect(snapshot.importBlockers.join(' ')).toContain('Import QA')
    expect(snapshot.inviteBlockers.join(' ')).toContain('Invite readiness')
  })

  it('blocks forward lifecycle moves while launch blockers remain open', () => {
    const autoSignals = buildDeliveryAutoSignals({
      scanType: 'retention',
      linkedLeadPresent: true,
      totalInvited: 6,
      totalCompleted: 0,
      invitesNotSent: 1,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 0,
      importReady: false,
    })

    const transition = validateDeliveryLifecycleTransition({
      scanType: 'retention',
      currentStage: 'setup_in_progress',
      targetStage: 'invites_live',
      record: createRecord(),
      checkpoints: [
        createCheckpoint('implementation_intake'),
        createCheckpoint('import_qa'),
        createCheckpoint('invite_readiness', {
          manual_state: 'pending',
          auto_state: autoSignals.invite_readiness.autoState,
          last_auto_summary: autoSignals.invite_readiness.summary,
        }),
      ],
      autoSignals,
    })

    expect(transition.allowed).toBe(false)
    expect(transition.blockers.join(' ')).toContain('Invite readiness')
  })

  it('requires explicit notes when confirming a checkpoint against a warning or exception', () => {
    expect(
      validateDeliveryCheckpointUpdate({
        checkpointKey: 'client_activation',
        manualState: 'confirmed',
        exceptionStatus: 'none',
        autoState: 'warning',
        operatorNote: '',
      }),
    ).toContain('warning-autosignaal')

    expect(
      validateDeliveryCheckpointUpdate({
        checkpointKey: 'report_delivery',
        manualState: 'confirmed',
        exceptionStatus: 'blocked',
        autoState: 'ready',
        operatorNote: '',
      }),
    ).toContain('open exception')
  })

  it('allows first value only after launch, activation and first-value gates are really green', () => {
    const autoSignals = buildDeliveryAutoSignals({
      scanType: 'exit',
      linkedLeadPresent: true,
      totalInvited: 12,
      totalCompleted: 10,
      invitesNotSent: 0,
      incompleteScores: 0,
      hasMinDisplay: true,
      hasEnoughData: true,
      activeClientAccessCount: 1,
      pendingClientInviteCount: 0,
      importReady: true,
    })

    const checkpoints: CampaignDeliveryCheckpoint[] = [
      createCheckpoint('implementation_intake'),
      createCheckpoint('import_qa'),
      createCheckpoint('invite_readiness'),
      createCheckpoint('client_activation'),
      createCheckpoint('first_value'),
      createCheckpoint('report_delivery', { manual_state: 'pending' }),
      createCheckpoint('first_management_use', { manual_state: 'pending' }),
    ]

    const transition = validateDeliveryLifecycleTransition({
      scanType: 'exit',
      currentStage: 'client_activation_confirmed',
      targetStage: 'first_value_reached',
      record: createRecord({ lifecycle_stage: 'client_activation_confirmed' }),
      checkpoints,
      autoSignals,
    })

    expect(transition.allowed).toBe(true)

    const summary = buildDeliveryOpsSummary({
      scanType: 'exit',
      record: createRecord({ lifecycle_stage: 'client_activation_confirmed' }),
      checkpoints,
      autoSignals,
    })

    expect(summary.firstValueStatus).toBe('First value bevestigd')
    expect(summary.governance.reportDeliveryReady).toBe(false)
  })

  it('blocks learning closeout without an explicit follow-up decision and learning evidence', () => {
    const autoSignals = buildDeliveryAutoSignals({
      scanType: 'exit',
      linkedLeadPresent: true,
      totalInvited: 12,
      totalCompleted: 10,
      invitesNotSent: 0,
      incompleteScores: 0,
      hasMinDisplay: true,
      hasEnoughData: true,
      activeClientAccessCount: 1,
      pendingClientInviteCount: 0,
      importReady: true,
    })

    const checkpoints: CampaignDeliveryCheckpoint[] = [
      createCheckpoint('implementation_intake'),
      createCheckpoint('import_qa'),
      createCheckpoint('invite_readiness'),
      createCheckpoint('client_activation'),
      createCheckpoint('first_value'),
      createCheckpoint('report_delivery'),
      createCheckpoint('first_management_use'),
    ]

    const transition = validateDeliveryLifecycleTransition({
      scanType: 'exit',
      currentStage: 'first_management_use',
      targetStage: 'learning_closed',
      record: createRecord({
        lifecycle_stage: 'first_management_use',
        first_management_use_confirmed_at: '2026-04-17T10:00:00Z',
      }),
      checkpoints,
      autoSignals,
      hasLearningCloseoutEvidence: false,
    })

    expect(transition.allowed).toBe(false)
    expect(transition.blockers.join(' ')).toContain('Follow-up')
    expect(transition.blockers.join(' ')).toContain('Learning closure')
  })

  it('flags missing operator discipline when lifecycle advances without owner, handoff or dated follow-up', () => {
    const warnings = buildDeliveryDisciplineWarnings({
      record: createRecord({
        lifecycle_stage: 'follow_up_decided',
        operator_owner: '',
        next_step: '',
        customer_handoff_note: '',
        follow_up_decided_at: null,
      }),
      linkedLeadPresent: false,
      invitesNotSent: 0,
      pendingClientInviteCount: 0,
      incompleteScores: 0,
      activeClientAccessCount: 1,
      totalCompleted: 8,
      hasEnoughData: false,
      governanceBlockers: [],
      linkedLearningDossierCount: 1,
      learningCloseoutEvidenceCount: 0,
    })

    expect(warnings.join(' ')).toContain('sales-to-delivery handoff')
    expect(warnings.join(' ')).toContain('delivery-owner')
    expect(warnings.join(' ')).toContain('klant-handoff')
    expect(warnings.join(' ')).toContain('follow-upbeslissing')
  })

  it('returns bounded operating guidance for non-core routes', () => {
    const onboardingGuide = getDeliveryOperatingGuide('onboarding')
    const leadershipGuide = getDeliveryOperatingGuide('leadership')

    expect(onboardingGuide.followUpOutcomes.map((item) => item.detail).join(' ')).toContain('geen journey-suite')
    expect(leadershipGuide.followUpOutcomes.map((item) => item.detail).join(' ')).toContain('named-leader')
    expect(leadershipGuide.weeklyReviewRules).toHaveLength(3)
  })

  it('keeps import qa hard-blocked until a validated dataset has been imported', () => {
    const blockedSignals = buildDeliveryAutoSignals({
      scanType: 'retention',
      linkedLeadPresent: true,
      totalInvited: 8,
      totalCompleted: 0,
      invitesNotSent: 8,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 0,
      importReady: false,
    })
    const readySignals = buildDeliveryAutoSignals({
      scanType: 'retention',
      linkedLeadPresent: true,
      totalInvited: 8,
      totalCompleted: 0,
      invitesNotSent: 8,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 0,
      pendingClientInviteCount: 0,
      importReady: true,
    })

    expect(blockedSignals.import_qa.autoState).toBe('not_ready')
    expect(blockedSignals.import_qa.summary.toLowerCase()).toContain('deelnemersbestand')
    expect(readySignals.import_qa.autoState).toBe('ready')
  })
})
