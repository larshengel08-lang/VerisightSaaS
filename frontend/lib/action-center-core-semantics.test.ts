import { describe, expect, it } from 'vitest'
import { projectActionCenterCoreSemantics } from './action-center-core-semantics'
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
    lifecycle_stage: 'first_management_use',
    exception_status: 'none',
    operator_owner: null,
    next_step: null,
    operator_notes: null,
    customer_handoff_note: null,
    launch_date: null,
    launch_confirmed_at: null,
    participant_comms_config: null,
    reminder_config: null,
    first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
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

function buildCheckpoint(overrides: Partial<PilotLearningCheckpoint> = {}): PilotLearningCheckpoint {
  return {
    id: 'checkpoint',
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
    ...overrides,
  } as PilotLearningCheckpoint
}

function buildContext(args: {
  dossier?: PilotLearningDossier | null
  deliveryRecord?: CampaignDeliveryRecord | null
  assignedManager?: LiveActionCenterCampaignContext['assignedManager']
  learningCheckpoints?: PilotLearningCheckpoint[]
} = {}): LiveActionCenterCampaignContext {
  return {
    campaign: buildCampaign(),
    stats: buildStats(),
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

describe('action center core semantics', () => {
  it('keeps reviewQuestion separate from actionFrame.whyNow and preserves the visible outcome mapping', () => {
    const context = buildContext({
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
        assignedAt: '2026-04-21T08:00:00.000Z',
      },
      dossier: buildDossier({
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
        first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        first_action_taken: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
        review_moment: '2026-05-12',
        management_action_outcome: 'opschalen',
        case_public_summary: 'De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.',
      }),
    })

    expect(projectActionCenterCoreSemantics(context)).toMatchObject({
      reviewSemantics: {
        reviewQuestion: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        reviewOutcomeRaw: 'opschalen',
        reviewOutcomeVisible: 'bijstellen',
      },
      actionFrame: {
        whyNow: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        firstStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
        owner: 'Manager Operations',
        expectedEffect: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      },
      resultLoop: {
        whatWasTried: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
        whatWeObserved: 'De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.',
        whatWasDecided: 'Bijstellen',
      },
      closingSemantics: {
        status: 'lopend',
      },
    })
  })

  it('uses the approved fallback order across the action frame and result loop fields', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: 'Plan het bijgestelde reviewgesprek met HR en operations.',
        operator_owner: 'Verisight delivery',
        customer_handoff_note: 'De eerste managementread is scherp genoeg om direct bounded op te volgen.',
      }),
      dossier: buildDossier({
        buyer_question: 'Waar moeten we als management nu als eerste op ingrijpen?',
        first_management_value: null,
        expected_first_value: null,
        first_action_taken: null,
        adoption_outcome: null,
        case_public_summary: null,
        next_route: 'Vervolg met een bounded teamreview in operations.',
        management_action_outcome: 'opschalen',
        implementation_risk: 'Meerdere teams herkennen dezelfde frictie sinds de eerste read.',
      }),
      learningCheckpoints: [
        buildCheckpoint({
          id: 'checkpoint-review',
          checkpoint_key: 'follow_up_review',
          owner_label: 'People lead',
          confirmed_lesson: 'De frictie bleef terugkomen in elk vervolggesprek.',
        }),
        buildCheckpoint({
          id: 'checkpoint-management',
          checkpoint_key: 'first_management_use',
          owner_label: 'HR lead',
        }),
      ],
    })

    expect(projectActionCenterCoreSemantics(context)).toMatchObject({
      reviewSemantics: {
        reviewQuestion: 'Waar moeten we als management nu als eerste op ingrijpen?',
        reviewOutcomeRaw: 'opschalen',
        reviewOutcomeVisible: 'bijstellen',
      },
      actionFrame: {
        whyNow: 'Waar moeten we als management nu als eerste op ingrijpen?',
        firstStep: 'Plan het bijgestelde reviewgesprek met HR en operations.',
        owner: 'People lead',
        expectedEffect:
          'Waar moeten we als management nu als eerste op ingrijpen? Plan het bijgestelde reviewgesprek met HR en operations.',
      },
      resultLoop: {
        whatWasTried: 'Plan het bijgestelde reviewgesprek met HR en operations.',
        whatWeObserved: 'De frictie bleef terugkomen in elk vervolggesprek.',
        whatWasDecided: 'Bijstellen',
      },
    })
  })

  it('falls back from primary reason truth to existing route context for actionFrame.whyNow and summary-style firstStep', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: 'Plan de eerste bounded opvolgstap met HR.',
        customer_handoff_note: 'De managementread staat klaar voor een eerste bounded follow-through.',
      }),
      dossier: buildDossier({
        title: 'Exit follow-through voorjaar',
        first_management_value: null,
        buyer_question: null,
        buying_reason: null,
        trust_friction: null,
        expected_first_value: null,
        first_action_taken: null,
        management_action_outcome: null,
        case_public_summary: null,
      }),
    })

    expect(projectActionCenterCoreSemantics(context)).toMatchObject({
      reviewSemantics: {
        reviewQuestion: 'Plan de eerste bounded opvolgstap met HR.',
      },
      actionFrame: {
        whyNow: 'Exit follow-through voorjaar',
        firstStep: 'Plan de eerste bounded opvolgstap met HR.',
      },
      resultLoop: {
        whatWasTried: 'Plan de eerste bounded opvolgstap met HR.',
        whatWeObserved: null,
      },
    })
  })

  it('falls back to explicit unassigned owner label and reason-plus-nextStep expected effect when canonical truth is absent', () => {
    const context = buildContext({
      assignedManager: null,
      deliveryRecord: buildDeliveryRecord({
        next_step: 'Plan een eerste bounded follow-up met de teamlead.',
        operator_owner: null,
      }),
      dossier: buildDossier({
        first_management_value: null,
        buyer_question: 'Waar moeten we als management nu als eerste op ingrijpen?',
        expected_first_value: null,
        first_action_taken: null,
      }),
      learningCheckpoints: [],
    })

    expect(projectActionCenterCoreSemantics(context)).toMatchObject({
      actionFrame: {
        owner: 'Nog niet toegewezen',
        expectedEffect:
          'Waar moeten we als management nu als eerste op ingrijpen? Plan een eerste bounded follow-up met de teamlead.',
      },
      resultLoop: {
        whatWasTried: 'Plan een eerste bounded follow-up met de teamlead.',
        whatWeObserved: null,
      },
    })
  })

  it('collapses closeout semantics to lopend, afgerond, or gestopt only', () => {
    const ongoing = buildContext({
      deliveryRecord: buildDeliveryRecord({
        exception_status: 'client_unresponsive',
      }),
      dossier: buildDossier({
        first_action_taken: 'Wacht op de ontbrekende input van de klant.',
      }),
    })
    const completed = buildContext({
      dossier: buildDossier({
        triage_status: 'uitgevoerd',
      }),
    })
    const stopped = buildContext({
      dossier: buildDossier({
        triage_status: 'verworpen',
      }),
    })

    expect(projectActionCenterCoreSemantics(ongoing).closingSemantics.status).toBe('lopend')
    expect(projectActionCenterCoreSemantics(completed).closingSemantics.status).toBe('afgerond')
    expect(projectActionCenterCoreSemantics(stopped).closingSemantics.status).toBe('gestopt')
  })

  it('falls back to the visible review outcome label when no richer decision text exists', () => {
    const context = buildContext({
      dossier: buildDossier({
        management_action_outcome: 'opschalen',
      }),
    })

    expect(projectActionCenterCoreSemantics(context).resultLoop.whatWasDecided).toBe('Bijstellen')
  })

  it('prefers explicit decision carriers over outcome summary fallback in whatWasDecided', () => {
    const context = buildContext({
      dossier: buildDossier({
        management_action_outcome: null,
        next_route: 'Vervolg met een bounded teamreview in operations.',
        case_public_summary: 'De review maakte zichtbaar dat meerdere teams dezelfde frictie herkenden.',
      }),
    })

    expect(projectActionCenterCoreSemantics(context).resultLoop.whatWasDecided).toBe(
      'Vervolg met een bounded teamreview in operations.',
    )
  })
})
