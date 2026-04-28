import { describe, expect, it } from 'vitest'
import { buildActionCenterTelemetryEvents, buildLiveActionCenterItems, isLiveActionCenterScanType } from './action-center-live'
import { projectActionCenterRoute } from './action-center-route-contract'
import type { Campaign, CampaignStats } from '@/lib/types'
import type { CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type { PilotLearningCheckpoint, PilotLearningDossier } from '@/lib/pilot-learning'

function buildCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'campaign-exit',
    organization_id: 'org-1',
    name: 'Exit voorjaar',
    scan_type: 'exit',
    delivery_mode: 'live',
    is_active: true,
    enabled_modules: null,
    created_at: '2026-04-10T10:00:00.000Z',
    closed_at: null,
    ...overrides,
  }
}

function buildStats(overrides: Partial<CampaignStats> = {}): CampaignStats {
  return {
    campaign_id: 'campaign-exit',
    campaign_name: 'Exit voorjaar',
    scan_type: 'exit',
    organization_id: 'org-1',
    is_active: true,
    created_at: '2026-04-10T10:00:00.000Z',
    total_invited: 84,
    total_completed: 26,
    completion_rate_pct: 31,
    avg_risk_score: 6.8,
    avg_signal_score: 6.8,
    band_high: 12,
    band_medium: 9,
    band_low: 5,
    ...overrides,
  }
}

function buildDeliveryRecord(overrides: Partial<CampaignDeliveryRecord> = {}): CampaignDeliveryRecord {
  return {
    id: 'delivery-exit',
    organization_id: 'org-1',
    campaign_id: 'campaign-exit',
    contact_request_id: null,
    lifecycle_stage: 'first_value_reached',
    exception_status: 'none',
    operator_owner: null,
    next_step: null,
    operator_notes: null,
    customer_handoff_note: null,
    launch_date: null,
    launch_confirmed_at: null,
    participant_comms_config: null,
    reminder_config: null,
    first_management_use_confirmed_at: null,
    follow_up_decided_at: null,
    learning_closed_at: null,
    created_at: '2026-04-15T10:00:00.000Z',
    updated_at: '2026-04-24T10:00:00.000Z',
    ...overrides,
  }
}

function buildDossier(overrides: Partial<PilotLearningDossier> = {}): PilotLearningDossier {
  return {
    id: 'dossier-exit',
    organization_id: 'org-1',
    campaign_id: 'campaign-exit',
    contact_request_id: null,
    title: 'Exit follow-through voorjaar',
    route_interest: 'exitscan',
    scan_type: 'exit',
    delivery_mode: 'live',
    triage_status: 'bevestigd',
    lead_contact_name: null,
    lead_organization_name: null,
    lead_work_email: null,
    lead_employee_count: null,
    buyer_question: null,
    expected_first_value: null,
    buying_reason: null,
    trust_friction: null,
    implementation_risk: null,
    first_management_value: null,
    first_action_taken: null,
    review_moment: null,
    adoption_outcome: null,
    management_action_outcome: null,
    next_route: null,
    stop_reason: null,
    case_evidence_closure_status: 'lesson_only',
    case_approval_status: 'draft',
    case_permission_status: 'not_requested',
    case_quote_potential: 'laag',
    case_reference_potential: 'laag',
    case_outcome_quality: 'indicatief',
    case_outcome_classes: [],
    claimable_observations: null,
    supporting_artifacts: null,
    case_public_summary: null,
    created_by: null,
    updated_by: null,
    created_at: '2026-04-15T10:00:00.000Z',
    updated_at: '2026-04-24T10:00:00.000Z',
    ...overrides,
  } as PilotLearningDossier
}

describe('live action center builder', () => {
  it('accepts the current live product family as supported action-center carriers', () => {
    expect(isLiveActionCenterScanType('exit')).toBe(true)
    expect(isLiveActionCenterScanType('retention')).toBe(true)
    expect(isLiveActionCenterScanType('onboarding')).toBe(true)
    expect(isLiveActionCenterScanType('pulse')).toBe(true)
    expect(isLiveActionCenterScanType('leadership')).toBe(true)
    expect(isLiveActionCenterScanType('team')).toBe(false)
  })

  it('builds preview items only for active routes and carries canonical route fields downstream', () => {
    const exitCampaign = buildCampaign()
    const pulseCampaign = buildCampaign({
      id: 'campaign-pulse',
      name: 'Pulse april',
      scan_type: 'pulse',
      delivery_mode: 'baseline',
      created_at: '2026-04-12T10:00:00.000Z',
    })
    const exitStats = buildStats()
    const pulseStats = buildStats({
      campaign_id: 'campaign-pulse',
      campaign_name: 'Pulse april',
      scan_type: 'pulse',
      created_at: '2026-04-12T10:00:00.000Z',
      total_invited: 40,
      total_completed: 14,
      completion_rate_pct: 35,
      avg_risk_score: 4.9,
      avg_signal_score: 4.9,
      band_high: 5,
      band_medium: 6,
      band_low: 3,
    })
    const exitDelivery = buildDeliveryRecord({
      lifecycle_stage: 'first_management_use',
      first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      operator_owner: 'Verisight delivery',
      next_step: 'Plan eerste managementgesprek met HR en sponsor.',
      customer_handoff_note: 'Vertrekduiding is nu scherp genoeg voor een eerste MT-read.',
    })
    const exitDossier = buildDossier({
      expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      review_moment: '2026-05-12',
      management_action_outcome: 'stoppen',
    })
    const exitLearningCheckpoints: PilotLearningCheckpoint[] = [
      {
        id: 'checkpoint-owner',
        dossier_id: 'dossier-exit',
        checkpoint_key: 'first_management_use',
        owner_label: 'HR lead',
        status: 'bevestigd',
        objective_signal_notes: null,
        qualitative_notes: null,
        interpreted_observation: null,
        confirmed_lesson: 'HR lead trekt nu de eerste bounded follow-through.',
        lesson_strength: 'terugkerend_patroon',
        destination_areas: ['operations'],
        updated_at: '2026-04-24T09:00:00.000Z',
        created_at: '2026-04-15T10:00:00.000Z',
      } as PilotLearningCheckpoint,
    ]
    const activeContext = {
      campaign: exitCampaign,
      stats: exitStats,
      organizationName: 'Acme BV',
      memberRole: 'owner' as const,
      scopeType: 'department' as const,
      scopeValue: 'operations',
      scopeLabel: 'Operations',
      peopleCount: 38,
      assignedManager: null,
      deliveryRecord: exitDelivery,
      deliveryCheckpoints: [],
      learningDossier: exitDossier,
      learningCheckpoints: exitLearningCheckpoints,
    }
    const candidateContext = {
      campaign: pulseCampaign,
      stats: pulseStats,
      organizationName: 'Acme BV',
      memberRole: 'viewer' as const,
      scopeType: 'department' as const,
      scopeValue: 'people-experience',
      scopeLabel: 'People Experience',
      peopleCount: 14,
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
      },
      deliveryRecord: buildDeliveryRecord({
        id: 'delivery-pulse',
        campaign_id: 'campaign-pulse',
        lifecycle_stage: 'first_value_reached',
        updated_at: '2026-04-24T12:00:00.000Z',
      }),
      deliveryCheckpoints: [],
      learningDossier: buildDossier({
        id: 'dossier-pulse',
        campaign_id: 'campaign-pulse',
        title: 'Pulse review april',
        scan_type: 'pulse',
        delivery_mode: 'baseline',
        expected_first_value: 'Maak zichtbaar welk pulssignaal nu als eerste opvolging verdient.',
        first_management_value: 'Welk pulssignaal vraagt nu als eerste managementaandacht?',
        review_moment: '2026-05-19',
      }),
      learningCheckpoints: [],
    }
    const route = projectActionCenterRoute(activeContext)

    const items = buildLiveActionCenterItems([
      activeContext,
      candidateContext,
    ])

    expect(route).toMatchObject({
      entryStage: 'active',
      routeStatus: 'te-bespreken',
      expectedEffect: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      reviewReason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      reviewOutcome: 'stoppen',
    })
    expect(projectActionCenterRoute(candidateContext).entryStage).toBe('candidate')

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      id: 'campaign-exit',
      sourceLabel: 'ExitScan',
      orgId: 'org-1',
      scopeType: 'department',
      status: route.routeStatus,
      ownerId: null,
      ownerName: 'HR lead',
      teamLabel: 'Operations',
      reviewDate: route.reviewScheduledFor,
      expectedEffect: route.expectedEffect,
      reviewReason: route.reviewReason,
      reviewOutcome: route.reviewOutcome,
      nextStep: 'Plan eerste managementgesprek met HR en sponsor.',
    })
    expect(items[0]?.openSignals).toContain('decision_due')
    expect(items.find((item) => item.id === 'campaign-pulse')).toBeUndefined()
  })

  it('derives bounded telemetry signals from lifecycle and review truth', () => {
    const campaign: Campaign = {
      id: 'campaign-exit',
      organization_id: 'org-1',
      name: 'Exit voorjaar',
      scan_type: 'exit',
      delivery_mode: 'live',
      is_active: true,
      enabled_modules: null,
      created_at: '2026-04-10T10:00:00.000Z',
      closed_at: null,
    }
    const deliveryRecord: CampaignDeliveryRecord = {
      id: 'delivery-exit',
      organization_id: 'org-1',
      campaign_id: 'campaign-exit',
      contact_request_id: null,
      lifecycle_stage: 'first_management_use',
      exception_status: 'none',
      operator_owner: 'Verisight delivery',
      next_step: 'Plan follow-up.',
      operator_notes: null,
      customer_handoff_note: null,
      launch_date: null,
      launch_confirmed_at: null,
      participant_comms_config: null,
      reminder_config: null,
      first_management_use_confirmed_at: null,
      follow_up_decided_at: null,
      learning_closed_at: null,
      created_at: '2026-04-15T10:00:00.000Z',
      updated_at: '2026-04-24T10:00:00.000Z',
    }
    const dossier = {
      review_moment: '2026-05-12',
      triage_status: 'bevestigd',
    } as PilotLearningDossier

    const events = buildActionCenterTelemetryEvents([
      {
        campaign,
        stats: null,
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue: 'operations',
        scopeLabel: 'Operations',
        peopleCount: 12,
        assignedManager: null,
        deliveryRecord,
        deliveryCheckpoints: [],
        learningDossier: dossier,
        learningCheckpoints: [],
      },
    ])

    expect(events.map((event) => event.eventType)).toEqual([
      'first_value_confirmed',
      'first_management_use_confirmed',
      'action_center_review_scheduled',
    ])
  })
})
