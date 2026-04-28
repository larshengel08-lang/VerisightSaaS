import { describe, expect, it } from 'vitest'
import {
  classifyActionCenterEntryStage,
  projectActionCenterRoute,
} from './action-center-route-contract'
import type { LiveActionCenterCampaignContext } from './action-center-live'
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

function buildContext(args: {
  dossier?: PilotLearningDossier | null
  deliveryRecord?: CampaignDeliveryRecord | null
  stats?: CampaignStats | null
  assignedManager?: LiveActionCenterCampaignContext['assignedManager']
  learningCheckpoints?: PilotLearningCheckpoint[]
} = {}): LiveActionCenterCampaignContext {
  return {
    campaign: buildCampaign(),
    stats: args.stats ?? buildStats(),
    organizationName: 'Acme BV',
    memberRole: 'owner',
    scopeType: 'department',
    scopeValue: 'operations',
    scopeLabel: 'Operations',
    peopleCount: 38,
    assignedManager: args.assignedManager ?? null,
    deliveryRecord: args.deliveryRecord ?? buildDeliveryRecord(),
    deliveryCheckpoints: [],
    learningDossier: args.dossier ?? buildDossier(),
    learningCheckpoints: args.learningCheckpoints ?? [],
  }
}

describe('action center route contract', () => {
  it('treats only explicit open truth as an active route', () => {
    const followUpOnly = buildContext({
      deliveryRecord: buildDeliveryRecord({
        follow_up_decided_at: '2026-04-20T09:00:00.000Z',
      }),
      dossier: buildDossier({
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      }),
    })

    const closedOnly = buildContext({
      deliveryRecord: buildDeliveryRecord({
        learning_closed_at: '2026-04-21T09:00:00.000Z',
      }),
      dossier: buildDossier({
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      }),
    })

    expect(classifyActionCenterEntryStage(followUpOnly)).toBe('candidate')
    expect(projectActionCenterRoute(followUpOnly)).toMatchObject({
      entryStage: 'candidate',
      routeOpenedAt: null,
      routeStatus: null,
    })

    expect(classifyActionCenterEntryStage(closedOnly)).toBe('candidate')
    expect(projectActionCenterRoute(closedOnly)).toMatchObject({
      entryStage: 'candidate',
      routeOpenedAt: null,
      routeStatus: null,
    })
  })

  it('keeps candidate entries outside route status until the route is explicitly opened', () => {
    const context = buildContext({
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
      },
      dossier: buildDossier({
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
        review_moment: '2026-05-12',
      }),
    })

    expect(classifyActionCenterEntryStage(context)).toBe('candidate')
    expect(projectActionCenterRoute(context)).toMatchObject({
      entryStage: 'candidate',
      routeStatus: null,
    })
  })

  it('projects an opened route to te-bespreken until owner, expected effect, and review plan exist', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      }),
      dossier: buildDossier({
        first_action_taken: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
      }),
    })

    expect(projectActionCenterRoute(context)).toMatchObject({
      entryStage: 'active',
      routeOpenedAt: '2026-04-20T09:00:00.000Z',
      routeStatus: 'te-bespreken',
    })
  })

  it('does not synthesize canonical owner or intervention from delivery-local fields', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
        operator_owner: 'Verisight delivery',
        next_step: 'Plan eerste managementgesprek met HR en sponsor.',
      }),
      learningCheckpoints: [
        {
          id: 'checkpoint-owner',
          dossier_id: 'dossier-exit',
          checkpoint_key: 'first_management_use',
          owner_label: 'HR lead',
          status: 'bevestigd',
          objective_signal_notes: null,
          qualitative_notes: null,
          interpreted_observation: null,
          confirmed_lesson: null,
          lesson_strength: 'terugkerend_patroon',
          destination_areas: ['operations'],
          updated_at: '2026-04-24T09:00:00.000Z',
          created_at: '2026-04-15T10:00:00.000Z',
        } as PilotLearningCheckpoint,
      ],
      dossier: buildDossier({
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
        first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        review_moment: '2026-05-12',
      }),
    })

    expect(projectActionCenterRoute(context)).toMatchObject({
      entryStage: 'active',
      owner: null,
      intervention: null,
      routeStatus: 'te-bespreken',
    })
  })

  it('projects an opened route to in-uitvoering when intervention, owner, expected effect, and review plan are complete', () => {
    const context = buildContext({
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
      },
      deliveryRecord: buildDeliveryRecord({
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      }),
      dossier: buildDossier({
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
        first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        first_action_taken: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
        review_moment: '2026-05-12',
      }),
    })

    expect(projectActionCenterRoute(context)).toMatchObject({
      entryStage: 'active',
      routeStatus: 'in-uitvoering',
      owner: 'Manager Operations',
      expectedEffect: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      intervention: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
      reviewScheduledFor: '2026-05-12',
      reviewReason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
    })
  })

  it('keeps reviewOutcome separate from routeStatus', () => {
    const context = buildContext({
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
      },
      deliveryRecord: buildDeliveryRecord({
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      }),
      dossier: buildDossier({
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
        first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        first_action_taken: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
        review_moment: '2026-05-12',
        management_action_outcome: 'stoppen',
      }),
    })

    expect(projectActionCenterRoute(context)).toMatchObject({
      routeStatus: 'in-uitvoering',
      reviewOutcome: 'stoppen',
    })
  })
})
