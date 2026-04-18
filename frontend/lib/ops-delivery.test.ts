import { describe, expect, it } from 'vitest'
import {
  buildDeliveryAutoSignals,
  buildDeliveryGovernanceSnapshot,
  buildDeliveryOpsSummary,
  getDeliveryGovernanceOutputLaneReadyLabel,
  getDeliveryGovernanceOutputLaneTitle,
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

  it('uses explicit mto delivery and governance language for main-measurement operations', () => {
    const autoSignals = buildDeliveryAutoSignals({
      scanType: 'mto',
      linkedLeadPresent: true,
      totalInvited: 18,
      totalCompleted: 3,
      invitesNotSent: 0,
      incompleteScores: 0,
      hasMinDisplay: false,
      hasEnoughData: false,
      activeClientAccessCount: 1,
      pendingClientInviteCount: 0,
    })

    const snapshot = buildDeliveryGovernanceSnapshot({
      scanType: 'mto',
      record: createRecord({ lifecycle_stage: 'first_value_reached' }),
      checkpoints: [
        createCheckpoint('implementation_intake'),
        createCheckpoint('import_qa'),
        createCheckpoint('invite_readiness'),
        createCheckpoint('client_activation'),
        createCheckpoint('first_value', {
          manual_state: 'pending',
          auto_state: autoSignals.first_value.autoState,
          last_auto_summary: autoSignals.first_value.summary,
        }),
        createCheckpoint('report_delivery', {
          manual_state: 'pending',
          auto_state: autoSignals.report_delivery.autoState,
          last_auto_summary: autoSignals.report_delivery.summary,
        }),
        createCheckpoint('first_management_use', {
          manual_state: 'pending',
          auto_state: autoSignals.first_management_use.autoState,
          last_auto_summary: autoSignals.first_management_use.summary,
        }),
      ],
      autoSignals,
    })

    expect(autoSignals.first_value.summary).toContain('MTO zit nog onder de veilige brede hoofdmeting-drempel')
    expect(autoSignals.report_delivery.summary).toContain('MTO-read en action-log vrijgave')
    expect(snapshot.reportDeliveryBlockers.join(' ')).toContain('MTO-read en action-logroute')
    expect(getDeliveryGovernanceOutputLaneTitle('mto')).toBe('MTO-read en action log')
    expect(getDeliveryGovernanceOutputLaneReadyLabel('mto')).toBe('MTO-use bevestigd')
  })
})
