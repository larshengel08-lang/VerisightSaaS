import { describe, expect, it } from 'vitest'
import {
  projectActionCenterCoreSemantics,
  projectActionCenterPreviewCoreSemantics,
  type ActionCenterCoreSemanticsProjectionInput,
} from './action-center-core-semantics'
import { projectActionCenterRoute } from './action-center-route-contract'
import type { Campaign, CampaignStats } from '@/lib/types'
import type { CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type { PilotLearningCheckpoint, PilotLearningDossier } from '@/lib/pilot-learning'
import type { LiveActionCenterCampaignContext } from './action-center-live-context'

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
} = {}): ActionCenterCoreSemanticsProjectionInput {
  const liveContext: LiveActionCenterCampaignContext = {
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

  return {
    campaign: liveContext.campaign,
    assignedManager: liveContext.assignedManager,
    deliveryRecord: liveContext.deliveryRecord,
    learningDossier: liveContext.learningDossier,
    learningCheckpoints: liveContext.learningCheckpoints,
    route: projectActionCenterRoute(liveContext),
  }
}

describe('action center core semantics', () => {
  it('keeps reviewReason and reviewQuestion distinct while preserving the visible outcome mapping', () => {
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
        reviewReason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        reviewQuestion: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
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
        historicalSummary: null,
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
        reviewReason: 'Waar moeten we als management nu als eerste op ingrijpen?',
        reviewQuestion:
          'Waar moeten we als management nu als eerste op ingrijpen? Plan het bijgestelde reviewgesprek met HR en operations.',
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
        reviewReason: 'Plan de eerste bounded opvolgstap met HR.',
        reviewQuestion: 'Plan de eerste bounded opvolgstap met HR.',
      },
      actionFrame: {
        whyNow: 'De managementread staat klaar voor een eerste bounded follow-through.',
        firstStep: 'Plan de eerste bounded opvolgstap met HR.',
      },
      resultLoop: {
        whatWasTried: 'Plan de eerste bounded opvolgstap met HR.',
        whatWeObserved: null,
      },
    })
  })

  it('does not promote summary-style route text into firstStep when no real action step exists', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: null,
        customer_handoff_note: 'De managementread staat klaar voor een eerste bounded follow-through.',
      }),
      dossier: buildDossier({
        title: 'Exit follow-through voorjaar',
        first_action_taken: null,
        management_action_outcome: null,
        case_public_summary: 'De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.',
      }),
    })

    expect(projectActionCenterCoreSemantics(context).actionFrame.firstStep).toBe('Nog te bepalen in review')
  })

  it('allows softer fallback copy into firstStep only when it still reads as a concrete next step', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: null,
        customer_handoff_note: 'Plan een eerste bounded opvolgstap met HR.',
      }),
      dossier: buildDossier({
        title: 'Exit follow-through voorjaar',
        first_action_taken: null,
        management_action_outcome: null,
        case_public_summary: null,
      }),
    })

    expect(projectActionCenterCoreSemantics(context).actionFrame.firstStep).toBe(
      'Plan een eerste bounded opvolgstap met HR.',
    )
  })

  it('uses a deterministic route-shape template for reviewQuestion when no existing review or route truth remains', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: null,
        customer_handoff_note: null,
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
        reviewReason: 'Welke vervolgstap vraagt deze route nu als eerste review?',
        reviewQuestion: 'Welke vervolgstap vraagt deze route nu als eerste review?',
      },
      actionFrame: {
        whyNow: 'Exit follow-through voorjaar',
      },
    })
  })

  it('reuses reviewReason for reviewQuestion before falling back to the generic route template', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: null,
      }),
      dossier: buildDossier({
        first_management_value: 'Welke vertrekduiding vraagt nu als eerste bestuurlijke review?',
        expected_first_value: null,
        first_action_taken: null,
      }),
    })

    expect(projectActionCenterCoreSemantics(context).reviewSemantics).toMatchObject({
      reviewReason: 'Welke vertrekduiding vraagt nu als eerste bestuurlijke review?',
      reviewQuestion: 'Welke vertrekduiding vraagt nu als eerste bestuurlijke review?',
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
        whyNow: 'Waar moeten we als management nu als eerste op ingrijpen?',
        firstStep: 'Plan een eerste bounded follow-up met de teamlead.',
      },
      resultLoop: {
        whatWasTried: 'Plan een eerste bounded follow-up met de teamlead.',
        whatWeObserved: null,
      },
    })
  })

  it('collapses closeout semantics to lopend, afgerond, or gestopt with a compact closeout summary when closed', () => {
    const ongoing = buildContext({
      deliveryRecord: buildDeliveryRecord({
        exception_status: 'awaiting_client_input',
      }),
      dossier: buildDossier({
        first_action_taken: 'Wacht op de ontbrekende input van de klant.',
      }),
    })
    const completed = buildContext({
      dossier: buildDossier({
        triage_status: 'uitgevoerd',
        case_public_summary: 'De route is afgerond na de laatste teamreview.',
      }),
    })
    const stopped = buildContext({
      dossier: buildDossier({
        triage_status: 'verworpen',
        stop_reason: 'De route stopt omdat er nu geen draagvlak is voor opvolging.',
      }),
    })

    expect(projectActionCenterCoreSemantics(ongoing).closingSemantics).toEqual({
      status: 'lopend',
      summary: null,
      historicalSummary: null,
    })
    expect(projectActionCenterCoreSemantics(completed).closingSemantics).toEqual({
      status: 'afgerond',
      summary: 'De route is afgerond na de laatste teamreview.',
      historicalSummary: null,
    })
    expect(projectActionCenterCoreSemantics(stopped).closingSemantics).toEqual({
      status: 'gestopt',
      summary: 'De route stopt omdat er nu geen draagvlak is voor opvolging.',
      historicalSummary: null,
    })
  })

  it('falls back to the visible review outcome label when no richer decision text exists', () => {
    const context = buildContext({
      dossier: buildDossier({
        management_action_outcome: 'opschalen',
      }),
    })

    expect(projectActionCenterCoreSemantics(context).resultLoop.whatWasDecided).toBe('Bijstellen')
  })

  it('does not let a bare decision label overwrite whatWasTried when the latest visible update is only outcome text', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: 'Plan het vervolggesprek met HR en operations.',
        operator_notes: null,
      }),
      dossier: buildDossier({
        first_action_taken: 'Leg de eerste correctie vast in het MT-overleg.',
        management_action_outcome: 'stoppen',
      }),
    })

    expect(
      projectActionCenterCoreSemantics({
        ...context,
        latestVisibleUpdateNote: 'stoppen',
      }).resultLoop.whatWasTried,
    ).toBe('Leg de eerste correctie vast in het MT-overleg.')
  })

  it('prefers explicit decision carriers over outcome summary fallback in whatWasDecided when no review outcome truth exists', () => {
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

  it('prefers the visible review outcome label over richer authored decision text when review outcome truth exists', () => {
    const context = buildContext({
      dossier: buildDossier({
        management_action_outcome: 'opschalen',
        next_route: 'Breid de follow-through uit naar een tweede teamreview met operations.',
      }),
    })

    expect(projectActionCenterCoreSemantics(context).resultLoop.whatWasDecided).toBe('Bijstellen')
  })

  it('uses the latest explicit live update note as decision fallback when no canonical decision truth exists', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: 'Plan het vervolggesprek met HR en operations.',
        customer_handoff_note: null,
        operator_notes: null,
      }),
      dossier: buildDossier({
        management_action_outcome: null,
        next_route: null,
        stop_reason: null,
        case_public_summary: null,
        adoption_outcome: null,
      }),
      learningCheckpoints: [],
    })

    expect(
      projectActionCenterCoreSemantics({
        ...context,
        latestVisibleUpdateNote: 'Update: review blijft bewust lopen tot de volgende MT-check.',
      }).resultLoop.whatWasDecided,
    ).toBe('Update: review blijft bewust lopen tot de volgende MT-check.')
  })

  it('uses the same latest visible update note as observation fallback when canonical observation truth is absent', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: 'Plan het vervolggesprek met HR en operations.',
        customer_handoff_note: null,
        operator_notes: null,
      }),
      dossier: buildDossier({
        expected_first_value: null,
        first_action_taken: null,
        adoption_outcome: null,
        case_public_summary: null,
      }),
      learningCheckpoints: [],
    })

    expect(
      projectActionCenterCoreSemantics({
        ...context,
        latestVisibleUpdateNote: 'Klant bevestigde dat de eerste managementread nu zichtbaar is.',
      }).resultLoop.whatWeObserved,
    ).toBe('Klant bevestigde dat de eerste managementread nu zichtbaar is.')
  })

  it('keeps preview-only summary copy out of canonical first-step and decision truth', () => {
    const semantics = projectActionCenterPreviewCoreSemantics({
      id: 'preview-1',
      title: 'Exit preview',
      status: 'te-bespreken',
      ownerName: null,
      reviewDate: null,
      expectedEffect: null,
      reviewReason: null,
      reviewOutcome: 'geen-uitkomst',
      reason: 'Waarom deze route nu aandacht vraagt.',
      summary: 'Dit is alleen een UI-samenvatting en geen canonieke routewaarheid.',
      signalBody: 'Dit zagen we terug in de laatste zichtbare update.',
      nextStep: null,
      route: {
        campaignId: 'campaign-exit',
        entryStage: 'active',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
        ownerAssignedAt: null,
        routeStatus: 'te-bespreken',
        reviewOutcome: 'geen-uitkomst',
        reviewCompletedAt: null,
        outcomeRecordedAt: null,
        outcomeSummary: null,
        intervention: 'Bestaande canonieke vervolgstap.',
        owner: null,
        expectedEffect: null,
        reviewScheduledFor: null,
        reviewReason: null,
        blockedBy: null,
      },
    })

    expect(semantics.route.intervention).toBe('Bestaande canonieke vervolgstap.')
    expect(semantics.actionFrame.firstStep).toBe('Bestaande canonieke vervolgstap.')
    expect(semantics.route.outcomeSummary).toBeNull()
    expect(semantics.resultLoop.whatWasDecided).toBeNull()
  })

  it('reuses preview reviewReason for reviewQuestion before falling back to the generic route template', () => {
    const semantics = projectActionCenterPreviewCoreSemantics({
      id: 'preview-review-reason',
      title: 'Exit preview',
      status: 'te-bespreken',
      ownerName: null,
      reviewDate: null,
      expectedEffect: null,
      reviewReason: 'Welke vertrekduiding vraagt nu als eerste bestuurlijke review?',
      reviewOutcome: 'geen-uitkomst',
      reason: null,
      summary: 'Samenvatting voor de lijstweergave.',
      signalBody: 'Signaaltekst uit de laatste zichtbare update.',
      nextStep: null,
      route: {
        campaignId: 'campaign-exit',
        entryStage: 'active',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
        ownerAssignedAt: null,
        routeStatus: 'te-bespreken',
        reviewOutcome: 'geen-uitkomst',
        reviewCompletedAt: null,
        outcomeRecordedAt: null,
        outcomeSummary: null,
        intervention: null,
        owner: null,
        expectedEffect: null,
        reviewScheduledFor: null,
        reviewReason: 'Welke vertrekduiding vraagt nu als eerste bestuurlijke review?',
        blockedBy: null,
      },
    })

    expect(semantics.reviewSemantics).toMatchObject({
      reviewReason: 'Welke vertrekduiding vraagt nu als eerste bestuurlijke review?',
      reviewQuestion: 'Welke vertrekduiding vraagt nu als eerste bestuurlijke review?',
    })
  })

  it('derives a compact preview closeout summary for completed routes from canonical route truth', () => {
    const semantics = projectActionCenterPreviewCoreSemantics({
      id: 'preview-closeout',
      title: 'Exit preview',
      status: 'afgerond',
      ownerName: 'Manager Operations',
      reviewDate: '2026-05-12',
      expectedEffect: null,
      reviewReason: 'Welke route-uitkomst wilden we vastleggen?',
      reviewOutcome: 'afronden',
      reason: null,
      summary: 'Samenvatting voor de lijstweergave.',
      signalBody: 'Signaaltekst uit de laatste zichtbare update.',
      nextStep: null,
      route: {
        campaignId: 'campaign-exit',
        entryStage: 'active',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
        ownerAssignedAt: '2026-04-21T08:00:00.000Z',
        routeStatus: 'afgerond',
        reviewOutcome: 'afronden',
        reviewCompletedAt: null,
        outcomeRecordedAt: null,
        outcomeSummary: 'De route is afgerond na de laatste teamreview.',
        intervention: null,
        owner: 'Manager Operations',
        expectedEffect: null,
        reviewScheduledFor: '2026-05-12',
        reviewReason: 'Welke route-uitkomst wilden we vastleggen?',
        blockedBy: null,
      },
    })

    expect(semantics.closingSemantics).toEqual({
      status: 'afgerond',
      summary: 'De route is afgerond na de laatste teamreview.',
      historicalSummary: null,
    })
  })

  it('uses real closeout truth before generic fallback copy when a completed route has no outcome summary', () => {
    const semantics = projectActionCenterCoreSemantics(buildContext({
      dossier: buildDossier({
        triage_status: 'uitgevoerd',
        first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        case_public_summary: null,
        adoption_outcome: null,
        next_route: 'Vervolg via het reguliere HR-overleg, zonder aparte action-center route.',
      }),
    }))

    expect(semantics.closingSemantics).toEqual({
      status: 'afgerond',
      summary: 'Vervolg via het reguliere HR-overleg, zonder aparte action-center route.',
      historicalSummary: null,
    })
  })

  it('falls back to generic stopped closeout copy instead of reusing reviewReason when no stop truth exists', () => {
    const semantics = projectActionCenterPreviewCoreSemantics({
      id: 'preview-stopped-closeout',
      title: 'Exit preview',
      status: 'gestopt',
      ownerName: 'Manager Operations',
      reviewDate: '2026-05-12',
      expectedEffect: null,
      reviewReason: 'Welke stopreden vraagt nu de eerste review?',
      reviewOutcome: 'stoppen',
      reason: null,
      summary: 'Samenvatting voor de lijstweergave.',
      signalBody: 'Signaaltekst uit de laatste zichtbare update.',
      nextStep: null,
      route: {
        campaignId: 'campaign-exit',
        entryStage: 'active',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
        ownerAssignedAt: '2026-04-21T08:00:00.000Z',
        routeStatus: 'gestopt',
        reviewOutcome: 'stoppen',
        reviewCompletedAt: null,
        outcomeRecordedAt: null,
        outcomeSummary: null,
        intervention: null,
        owner: 'Manager Operations',
        expectedEffect: null,
        reviewScheduledFor: '2026-05-12',
        reviewReason: 'Welke stopreden vraagt nu de eerste review?',
        blockedBy: null,
      },
    })

    expect(semantics.closingSemantics).toEqual({
      status: 'gestopt',
      summary: 'De route is bewust gestopt.',
      historicalSummary: null,
    })
  })

  it('keeps the route active while projecting a historical closeout summary from follow-up checkpoint truth', () => {
    const base = buildContext()

    const semantics = projectActionCenterCoreSemantics({
      ...base,
      route: {
        ...base.route,
        routeStatus: 'in-uitvoering',
        reviewOutcome: 'bijstellen',
      },
      learningCheckpoints: [
        ...base.learningCheckpoints,
        buildCheckpoint({
          id: 'cp-follow-up-review',
          checkpoint_key: 'follow_up_review',
          owner_label: 'HR',
          status: 'bevestigd',
          objective_signal_notes: 'Drie werkafspraken zijn opnieuw bevestigd.',
          qualitative_notes:
            'De eerdere cyclus kon worden afgerond; deze route bewaakt alleen de borging.',
          interpreted_observation: 'De eerste interventie heeft rust gebracht in het teamoverleg.',
          confirmed_lesson:
            'De vorige stap is afgerond; borg nu of de afspraken in de komende twee weken standhouden.',
          lesson_strength: 'terugkerend_patroon',
          destination_areas: ['report'],
          created_at: '2026-04-20T09:00:00.000Z',
          updated_at: '2026-04-20T09:00:00.000Z',
        }),
      ],
    })

    expect(semantics.closingSemantics.status).toBe('lopend')
    expect(semantics.closingSemantics.historicalSummary).toContain('vorige stap is afgerond')
  })

  it('does not project a historical closeout summary from ordinary follow-up notes or dossier routing text', () => {
    const base = buildContext({
      dossier: buildDossier({
        next_route: 'Borg de afspraken in het volgende teamoverleg.',
        stop_reason: 'Stop alleen als de eigenaar later afhaakt.',
      }),
    })

    const semantics = projectActionCenterCoreSemantics({
      ...base,
      route: {
        ...base.route,
        routeStatus: 'in-uitvoering',
        reviewOutcome: 'bijstellen',
      },
      learningCheckpoints: [
        buildCheckpoint({
          id: 'cp-follow-up-review',
          checkpoint_key: 'follow_up_review',
          owner_label: 'HR',
          status: 'bevestigd',
          objective_signal_notes: 'Drie werkafspraken zijn opnieuw bevestigd.',
          qualitative_notes: 'De afspraken blijven nog twee weken onder review.',
          interpreted_observation: 'Het teamoverleg voelt rustiger, maar we blijven volgen.',
          confirmed_lesson: 'Blijf de afspraken de komende twee weken actief volgen.',
          lesson_strength: 'terugkerend_patroon',
          destination_areas: ['report'],
          created_at: '2026-04-20T09:00:00.000Z',
          updated_at: '2026-04-20T09:00:00.000Z',
        }),
      ],
    })

    expect(semantics.closingSemantics.status).toBe('lopend')
    expect(semantics.closingSemantics.historicalSummary).toBeNull()
  })

  it('does not project a historical closeout summary from negated or not-finished-yet closeout phrasing', () => {
    const base = buildContext()

    const notFinishedCases = [
      'De vorige stap is niet afgerond; we moeten eerst de afspraken opnieuw toetsen.',
      'Deze cyclus is nog niet afgesloten en blijft actief onder review.',
    ]

    for (const confirmedLesson of notFinishedCases) {
      const semantics = projectActionCenterCoreSemantics({
        ...base,
        route: {
          ...base.route,
          routeStatus: 'in-uitvoering',
          reviewOutcome: 'bijstellen',
        },
        learningCheckpoints: [
          buildCheckpoint({
            id: `cp-follow-up-review-${confirmedLesson}`,
            checkpoint_key: 'follow_up_review',
            owner_label: 'HR',
            status: 'bevestigd',
            confirmed_lesson: confirmedLesson,
            qualitative_notes: 'De route blijft actief en vraagt nog opvolging.',
            lesson_strength: 'terugkerend_patroon',
            destination_areas: ['report'],
            created_at: '2026-04-20T09:00:00.000Z',
            updated_at: '2026-04-20T09:00:00.000Z',
          }),
        ],
      })

      expect(semantics.closingSemantics.status).toBe('lopend')
      expect(semantics.closingSemantics.historicalSummary).toBeNull()
    }
  })

  it('prefers the latest explicit preview update before nextStep in whatWasTried', () => {
    const semantics = projectActionCenterPreviewCoreSemantics({
      id: 'preview-2',
      title: 'Exit preview',
      status: 'in-uitvoering',
      ownerName: 'Manager Operations',
      reviewDate: '2026-05-12',
      expectedEffect: null,
      reviewReason: 'Waarom reviewen we dit nu opnieuw?',
      reviewOutcome: 'bijstellen',
      reason: 'Waarom reviewen we dit nu opnieuw?',
      summary: 'Samenvatting voor de lijstweergave.',
      signalBody: 'Het team zag dezelfde frictie terug.',
      nextStep: 'Plan het vervolggesprek met HR en operations.',
      latestVisibleUpdateNote: 'Update: eigenaar en eerste correctie zijn al bevestigd.',
      route: {
        campaignId: 'campaign-exit',
        entryStage: 'active',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
        ownerAssignedAt: '2026-04-21T08:00:00.000Z',
        routeStatus: 'in-uitvoering',
        reviewOutcome: 'bijstellen',
        reviewCompletedAt: null,
        outcomeRecordedAt: null,
        outcomeSummary: null,
        intervention: 'Canonieke vorige stap.',
        owner: 'Manager Operations',
        expectedEffect: null,
        reviewScheduledFor: '2026-05-12',
        reviewReason: 'Waarom reviewen we dit nu opnieuw?',
        blockedBy: null,
      },
    })

    expect(semantics.resultLoop.whatWasTried).toBe('Update: eigenaar en eerste correctie zijn al bevestigd.')
  })

  it('uses the latest explicit preview update note as decision fallback when no canonical decision truth exists', () => {
    const semantics = projectActionCenterPreviewCoreSemantics({
      id: 'preview-decision-fallback',
      title: 'Exit preview',
      status: 'in-uitvoering',
      ownerName: 'Manager Operations',
      reviewDate: '2026-05-12',
      expectedEffect: null,
      reviewReason: 'Waarom reviewen we dit nu opnieuw?',
      reviewOutcome: 'geen-uitkomst',
      reason: 'Waarom reviewen we dit nu opnieuw?',
      summary: 'Samenvatting voor de lijstweergave.',
      signalBody: 'Het team zag dezelfde frictie terug.',
      nextStep: 'Plan het vervolggesprek met HR en operations.',
      latestVisibleUpdateNote: 'Update: review blijft bewust lopen tot de volgende MT-check.',
      route: {
        campaignId: 'campaign-exit',
        entryStage: 'active',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
        ownerAssignedAt: '2026-04-21T08:00:00.000Z',
        routeStatus: 'in-uitvoering',
        reviewOutcome: 'geen-uitkomst',
        reviewCompletedAt: null,
        outcomeRecordedAt: null,
        outcomeSummary: null,
        intervention: 'Canonieke vorige stap.',
        owner: 'Manager Operations',
        expectedEffect: null,
        reviewScheduledFor: '2026-05-12',
        reviewReason: 'Waarom reviewen we dit nu opnieuw?',
        blockedBy: null,
      },
    })

    expect(semantics.resultLoop.whatWasDecided).toBe('Update: review blijft bewust lopen tot de volgende MT-check.')
  })

  it('includes the latest visible live update note in the whatWasTried precedence bucket', () => {
    const context = buildContext({
      deliveryRecord: buildDeliveryRecord({
        next_step: 'Plan het vervolggesprek met HR en operations.',
        operator_notes: null,
      }),
      dossier: buildDossier({
        first_action_taken: null,
      }),
    })

    expect(
      projectActionCenterCoreSemantics({
        ...context,
        latestVisibleUpdateNote: 'Update: de eerste correctie is al besproken in het MT.',
      }).resultLoop.whatWasTried,
    ).toBe('Update: de eerste correctie is al besproken in het MT.')
  })
})
