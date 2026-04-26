import { describe, expect, it } from 'vitest'
import { buildLiveActionCenterItems, isLiveActionCenterScanType } from './action-center-live'
import type { Campaign, CampaignStats } from '@/lib/types'
import type { CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type { PilotLearningCheckpoint, PilotLearningDossier } from '@/lib/pilot-learning'

describe('live action center builder', () => {
  it('accepts the current live product family as supported action-center carriers', () => {
    expect(isLiveActionCenterScanType('exit')).toBe(true)
    expect(isLiveActionCenterScanType('retention')).toBe(true)
    expect(isLiveActionCenterScanType('onboarding')).toBe(true)
    expect(isLiveActionCenterScanType('pulse')).toBe(true)
    expect(isLiveActionCenterScanType('leadership')).toBe(true)
    expect(isLiveActionCenterScanType('team')).toBe(false)
  })

  it('builds bounded live items for current product lines from delivery and dossier data', () => {
    const exitCampaign: Campaign = {
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
    const pulseCampaign: Campaign = {
      id: 'campaign-pulse',
      organization_id: 'org-1',
      name: 'Pulse april',
      scan_type: 'pulse',
      delivery_mode: 'baseline',
      is_active: true,
      enabled_modules: null,
      created_at: '2026-04-12T10:00:00.000Z',
      closed_at: null,
    }
    const exitStats: CampaignStats = {
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
    }
    const pulseStats: CampaignStats = {
      campaign_id: 'campaign-pulse',
      campaign_name: 'Pulse april',
      scan_type: 'pulse',
      organization_id: 'org-1',
      is_active: true,
      created_at: '2026-04-12T10:00:00.000Z',
      total_invited: 40,
      total_completed: 14,
      completion_rate_pct: 35,
      avg_risk_score: 4.9,
      avg_signal_score: 4.9,
      band_high: 5,
      band_medium: 6,
      band_low: 3,
    }
    const exitDelivery: CampaignDeliveryRecord = {
      id: 'delivery-exit',
      organization_id: 'org-1',
      campaign_id: 'campaign-exit',
      contact_request_id: null,
      lifecycle_stage: 'first_management_use',
      exception_status: 'blocked',
      operator_owner: 'Verisight delivery',
      next_step: 'Plan eerste managementgesprek met HR en sponsor.',
      operator_notes: null,
      customer_handoff_note: 'Vertrekduiding is nu scherp genoeg voor een eerste MT-read.',
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
    const exitDossier: PilotLearningDossier = {
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
      expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      buying_reason: null,
      trust_friction: null,
      implementation_risk: null,
      first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      first_action_taken: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
      review_moment: '2026-05-12',
      adoption_outcome: null,
      management_action_outcome: 'MT kiest een eerste leiderschapsspoor.',
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
    } as PilotLearningDossier
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

    const items = buildLiveActionCenterItems([
      {
        campaign: exitCampaign,
        stats: exitStats,
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue: 'operations',
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-1',
          displayName: 'Manager Operations',
        },
        deliveryRecord: exitDelivery,
        deliveryCheckpoints: [],
        learningDossier: exitDossier,
        learningCheckpoints: exitLearningCheckpoints,
      },
      {
        campaign: pulseCampaign,
        stats: pulseStats,
        organizationName: 'Acme BV',
        memberRole: 'viewer',
        scopeType: 'department',
        scopeValue: 'people-experience',
        scopeLabel: 'People Experience',
        peopleCount: 14,
        assignedManager: null,
        deliveryRecord: null,
        deliveryCheckpoints: [],
        learningDossier: null,
        learningCheckpoints: [],
      },
    ])

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      id: 'campaign-exit',
      sourceLabel: 'ExitScan',
      orgId: 'org-1',
      scopeType: 'department',
      status: 'geblokkeerd',
      ownerId: 'manager-1',
      ownerName: 'Manager Operations',
      teamLabel: 'Operations',
      reviewDate: '2026-05-12',
      nextStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
    })
    expect(items[0]?.openSignals).toContain('blocked_assignment')
    expect(items[1]).toMatchObject({
      id: 'campaign-pulse',
      sourceLabel: 'Pulse',
      ownerRole: 'Viewer',
      status: 'te-bespreken',
    })
  })
})
