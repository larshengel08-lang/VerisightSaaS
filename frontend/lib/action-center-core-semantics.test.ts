import { describe, expect, it } from 'vitest'
import {
  projectActionCenterCoreSemantics,
  projectActionCenterPreviewCoreSemantics,
  type ActionCenterCoreSemanticsProjectionInput,
} from './action-center-core-semantics'
import { projectActionCenterRoute } from './action-center-route-contract'
import type { Campaign, CampaignStats } from '@/lib/types'
import type { CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type {
  ActionCenterManagerResponse,
  ActionCenterReviewDecision,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from '@/lib/pilot-learning'
import type { LiveActionCenterCampaignContext } from './action-center-live-context'
import type { ActionCenterRouteContract } from './action-center-route-contract'

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

function buildRouteReopen(
  overrides: Partial<{
    id: string | null
    routeId: string
    reopenedAt: string
    reopenedByRole: string
  }> = {},
) {
  return {
    id: 'reopen-1',
    routeId: 'campaign-exit::operations',
    reopenedAt: '2026-05-03T12:00:00.000Z',
    reopenedByRole: 'hr_owner',
    ...overrides,
  }
}

function buildContext(args: {
  dossier?: PilotLearningDossier | null
  deliveryRecord?: CampaignDeliveryRecord | null
  assignedManager?: LiveActionCenterCampaignContext['assignedManager']
  learningCheckpoints?: PilotLearningCheckpoint[]
  reviewDecisions?: ActionCenterReviewDecision[]
  managerResponse?: ActionCenterManagerResponse | null
  routeFollowUpRelations?: Array<{
    id?: string | null
    routeRelationType: 'follow-up-from'
    sourceRouteId: string
    targetRouteId: string
    triggerReason: 'nieuw-campaign-signaal' | 'nieuw-segment-signaal' | 'hernieuwde-hr-beoordeling'
    recordedAt: string
    recordedByRole: string
    endedAt?: string | null
  }>
  routeReopens?: Array<{
    id?: string | null
    routeId: string
    reopenedAt: string
    reopenedByRole: string
  }>
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
    reviewDecisions: args.reviewDecisions ?? [],
    managerResponse: args.managerResponse ?? null,
    routeFollowUpRelations: args.routeFollowUpRelations,
  }

  return {
    campaign: liveContext.campaign,
    assignedManager: liveContext.assignedManager,
    deliveryRecord: liveContext.deliveryRecord,
    learningDossier: liveContext.learningDossier,
    learningCheckpoints: liveContext.learningCheckpoints,
    reviewDecisions: liveContext.reviewDecisions,
    managerResponse: liveContext.managerResponse,
    routeFollowUpRelations: liveContext.routeFollowUpRelations,
    routeReopens: args.routeReopens,
    route: projectActionCenterRoute(liveContext),
  } as ActionCenterCoreSemanticsProjectionInput
}

describe('action center core semantics', () => {
  describe('decision-first projection', () => {
    const baseRoute: ActionCenterRouteContract = {
      routeId: 'campaign-1::operations',
      campaignId: 'campaign-1',
      entryStage: 'active',
      routeOpenedAt: '2026-04-20T10:00:00.000Z',
      ownerAssignedAt: '2026-04-20T11:00:00.000Z',
      routeStatus: 'in-uitvoering',
      reviewOutcome: 'bijstellen',
      reviewCompletedAt: '2026-04-25T10:00:00.000Z',
      outcomeRecordedAt: null,
      outcomeSummary: 'Werkdruk bleef zichtbaar in hetzelfde team.',
      intervention: 'Plan een gerichte teamreview met de manager.',
      owner: 'Sanne de Vries',
      expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
      reviewScheduledFor: '2026-05-02',
      reviewReason: 'De eerste stap gaf nog geen stabiele verbetering.',
      managerResponseType: null,
      managerResponseNote: null,
      primaryActionThemeKey: null,
      followThroughMode: 'legacy_action',
      blockedBy: null,
    }

    it('prefers canonical decision truth over legacy review outcome when both exist', () => {
      const semantics = projectActionCenterCoreSemantics({
        campaign: { id: 'campaign-1', name: 'ExitScan april' } as never,
        assignedManager: { displayName: 'Sanne de Vries' } as never,
        deliveryRecord: { next_step: 'Herplan de teamreview voor volgende week.' } as never,
        learningDossier: {
          management_action_outcome: 'doorgaan',
          first_action_taken: 'Plan een gerichte teamreview met de manager.',
          expected_first_value: 'Werkdruktrend moet dalen.',
        } as never,
        learningCheckpoints: [],
        route: baseRoute,
        latestVisibleUpdateNote: 'De manager bevestigde dat de frictie nog niet daalt.',
        decisionRecords: [
          {
            decisionEntryId: 'decision-1',
            sourceRouteId: 'campaign-1',
            decision: 'bijstellen',
            decisionReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
            nextCheck: 'Toets over een week of de teamdruk zichtbaar daalt.',
            decisionRecordedAt: '2026-04-25T10:00:00.000Z',
            reviewCompletedAt: '2026-04-25T09:30:00.000Z',
          },
        ],
      })

      expect(semantics.latestDecision?.decision).toBe('bijstellen')
      expect(semantics.latestDecision?.decisionReason).toBe(
        'De eerste teamreview gaf nog geen stabiele verbetering.',
      )
      expect(semantics.actionProgress.currentStep).toBe('Plan een gerichte teamreview met de manager.')
      expect(semantics.actionProgress.nextStep).toBe('Herplan de teamreview voor volgende week.')
    })

    it('cuts over fully to authored review decisions once any authored decision exists', () => {
      const semantics = projectActionCenterCoreSemantics({
        ...buildContext({
          dossier: buildDossier({
            management_action_outcome: 'stoppen',
            first_action_taken: 'Legacy route stap die niet meer zichtbaar mag zijn.',
            expected_first_value: 'Legacy effect dat niet meer zichtbaar mag zijn.',
          }),
          reviewDecisions: [
            {
              id: 'authored-decision-1',
              route_source_type: 'campaign',
              route_source_id: 'campaign-1',
              checkpoint_id: 'checkpoint-1',
              decision: 'bijstellen',
              decision_reason: 'Authored decision wint volledig zodra hij bestaat.',
              next_check: 'Toets volgende week of de bijgestelde stap tractie geeft.',
              current_step: 'Voer deze week een gerichte managercheck uit.',
              next_step: 'Bevestig in review of de frictie specifieker is geworden.',
              expected_effect: 'Maak zichtbaar of de managercheck de frictie smaller maakt.',
              observation_snapshot: 'Dezelfde frictie bleef in twee teams zichtbaar.',
              decision_recorded_at: '2026-04-28T09:00:00.000Z',
              review_completed_at: '2026-04-28T08:30:00.000Z',
              created_by: null,
              updated_by: null,
              created_at: '2026-04-28T09:00:00.000Z',
              updated_at: '2026-04-28T09:00:00.000Z',
            },
          ],
        }),
        campaign: { id: 'campaign-1', name: 'ExitScan april' } as never,
        route: baseRoute,
      })

      expect(semantics.latestDecision?.decisionReason).toBe(
        'Authored decision wint volledig zodra hij bestaat.',
      )
      expect(semantics.actionProgress.currentStep).toBe('Voer deze week een gerichte managercheck uit.')
      expect(semantics.resultLoop.whatWasDecided).toBe('Bijstellen')
      expect(semantics.decisionHistory).toHaveLength(1)
      expect(semantics.decisionHistory[0]?.decisionEntryId).toBe('authored-decision-1')
    })

    it('projects a chronological result progression from multiple authored decision moments', () => {
      const semantics = projectActionCenterCoreSemantics({
        ...buildContext({
          dossier: buildDossier({
            management_action_outcome: 'bijstellen',
            first_action_taken: 'Voer deze week een gerichte managercheck uit.',
            expected_first_value: 'Binnen twee weken moet zichtbaar zijn of de correctie smaller werkt.',
          }),
          reviewDecisions: [
            {
              id: 'authored-decision-2',
              route_source_type: 'campaign',
              route_source_id: 'campaign-1',
              checkpoint_id: 'checkpoint-2',
              decision: 'bijstellen',
              decision_reason: 'Dezelfde frictie bleef in twee teams zichtbaar.',
              next_check: 'Toets volgende week of de bijgestelde stap tractie geeft.',
              current_step: 'Voer deze week een gerichte managercheck uit.',
              next_step: 'Leg de bijgestelde route vast in het MT-overleg.',
              expected_effect: 'Binnen twee weken moet zichtbaar zijn of de correctie smaller werkt.',
              observation_snapshot: 'Dezelfde frictie bleef in twee teams zichtbaar.',
              decision_recorded_at: '2026-04-28T09:00:00.000Z',
              review_completed_at: '2026-04-28T08:30:00.000Z',
              created_by: null,
              updated_by: null,
              created_at: '2026-04-28T09:00:00.000Z',
              updated_at: '2026-04-28T09:00:00.000Z',
            },
            {
              id: 'authored-decision-1',
              route_source_type: 'campaign',
              route_source_id: 'campaign-1',
              checkpoint_id: 'checkpoint-1',
              decision: 'doorgaan',
              decision_reason: 'De eerste stap liep nog binnen de afgesproken termijn.',
              next_check: 'Toets over een week of de eerste stap tractie geeft.',
              current_step: 'Plan een eerste teamreview met de manager.',
              next_step: 'Bevestig de route in het MT-overleg.',
              expected_effect: 'Binnen twee weken moet zichtbaar zijn of de eerste review de frictie smaller maakt.',
              observation_snapshot: 'De eerste signalen bleven nog breed verdeeld.',
              decision_recorded_at: '2026-04-25T09:00:00.000Z',
              review_completed_at: '2026-04-25T08:30:00.000Z',
              created_by: null,
              updated_by: null,
              created_at: '2026-04-25T09:00:00.000Z',
              updated_at: '2026-04-25T09:00:00.000Z',
            },
          ],
        }),
        campaign: { id: 'campaign-1', name: 'ExitScan april' } as never,
        route: baseRoute,
      })

      expect(semantics.resultProgression).toEqual([
        {
          resultEntryId: 'authored-decision-1',
          recordedAt: '2026-04-25T08:30:00.000Z',
          currentStep: 'Plan een eerste teamreview met de manager.',
          observation: 'De eerste signalen bleven nog breed verdeeld.',
          decision: 'doorgaan',
          followThrough: 'Bevestig de route in het MT-overleg.',
        },
        {
          resultEntryId: 'authored-decision-2',
          recordedAt: '2026-04-28T08:30:00.000Z',
          currentStep: 'Voer deze week een gerichte managercheck uit.',
          observation: 'Dezelfde frictie bleef in twee teams zichtbaar.',
          decision: 'bijstellen',
          followThrough: 'Leg de bijgestelde route vast in het MT-overleg.',
        },
      ])
      expect(semantics.latestDecision?.decisionEntryId).toBe('authored-decision-2')
    })

    it('falls back to legacy truth when no canonical decision records exist', () => {
      const semantics = projectActionCenterCoreSemantics({
        campaign: { id: 'campaign-1', name: 'ExitScan april' } as never,
        assignedManager: { displayName: 'Sanne de Vries' } as never,
        deliveryRecord: { next_step: null } as never,
        learningDossier: {
          management_action_outcome: null,
          first_action_taken: 'Plan een gerichte teamreview met de manager.',
          expected_first_value: 'Werkdruktrend moet dalen.',
        } as never,
        learningCheckpoints: [],
        route: baseRoute,
        latestVisibleUpdateNote: 'De manager bevestigde dat de frictie nog niet daalt.',
        decisionRecords: [],
      })

      expect(semantics.latestDecision?.decision).toBe('bijstellen')
      expect(semantics.latestDecision?.nextCheck).toBeTruthy()
      expect(semantics.decisionHistory).toHaveLength(1)
    })

    it('does not synthesize a legacy decision history when completion truth is missing', () => {
      const semantics = projectActionCenterCoreSemantics({
        campaign: { id: 'campaign-1', name: 'ExitScan april' } as never,
        assignedManager: { displayName: 'Sanne de Vries' } as never,
        deliveryRecord: { next_step: null } as never,
        learningDossier: {
          management_action_outcome: 'bijstellen',
          first_action_taken: 'Plan een gerichte teamreview met de manager.',
          expected_first_value: 'Werkdruktrend moet dalen.',
        } as never,
        learningCheckpoints: [],
        route: {
          ...baseRoute,
          reviewCompletedAt: null,
        },
        latestVisibleUpdateNote: 'De manager bevestigde dat de frictie nog niet daalt.',
        decisionRecords: [],
      })

      expect(semantics.latestDecision).toBeNull()
      expect(semantics.decisionHistory).toEqual([])
    })
  })

  describe('lineage summaries', () => {
    it('projects a follow-up route with a backward lineage label', () => {
      const semantics = projectActionCenterCoreSemantics(buildContext({
        routeFollowUpRelations: [
          {
            id: 'relation-backward',
            routeRelationType: 'follow-up-from',
            sourceRouteId: 'campaign-source::operations',
            targetRouteId: 'campaign-exit::operations',
            triggerReason: 'nieuw-segment-signaal',
            recordedAt: '2026-05-01T10:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: null,
          },
        ],
      }))

      expect(semantics.lineageSummary).toMatchObject({
        overviewLabel: 'Vervolg op eerdere route',
        backwardLabel: 'Vervolg op eerdere route',
        backwardRouteId: 'campaign-source::operations',
        forwardLabel: null,
        forwardRouteId: null,
        detailLabels: ['Vervolg op eerdere route'],
      })
      expect(semantics.followUpSemantics).toMatchObject({
        isDirectSuccessor: true,
        lineageLabel: 'Vervolg op eerdere route',
        triggerReason: 'nieuw-segment-signaal',
        triggerReasonLabel: 'Nieuw segmentsignaal',
        sourceRouteId: 'campaign-source::operations',
      })
    })

    it('prefers reopen over follow-up for backward lineage', () => {
      const semantics = projectActionCenterCoreSemantics(buildContext({
        routeFollowUpRelations: [
          {
            id: 'relation-backward',
            routeRelationType: 'follow-up-from',
            sourceRouteId: 'campaign-older::operations',
            targetRouteId: 'campaign-exit::operations',
            triggerReason: 'nieuw-campaign-signaal',
            recordedAt: '2026-05-01T10:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: null,
          },
        ],
        routeReopens: [
          buildRouteReopen({
            routeId: 'campaign-exit::operations',
            reopenedAt: '2026-05-03T12:00:00.000Z',
          }),
        ],
      }) as ActionCenterCoreSemanticsProjectionInput)

      expect(semantics.lineageSummary).toMatchObject({
        overviewLabel: 'Heropend traject',
        backwardLabel: 'Heropend traject',
        detailLabels: ['Heropend traject'],
        backwardRouteId: null,
        forwardLabel: null,
        forwardRouteId: null,
      })
      expect(semantics.followUpSemantics).toMatchObject({
        isDirectSuccessor: false,
        lineageLabel: 'Heropend traject',
        triggerReason: null,
        triggerReasonLabel: null,
        sourceRouteId: null,
      })
    })

    it('chooses the most recent reopen event when multiple reopen rows exist', () => {
      const semantics = projectActionCenterCoreSemantics(buildContext({
        routeReopens: [
          buildRouteReopen({
            id: 'reopen-older',
            routeId: 'campaign-exit::operations',
            reopenedAt: '2026-05-01T09:00:00.000Z',
          }),
          buildRouteReopen({
            id: 'reopen-newer',
            routeId: 'campaign-exit::operations',
            reopenedAt: '2026-05-03T12:00:00.000Z',
          }),
        ],
      }))

      expect(semantics.lineageSummary).toMatchObject({
        overviewLabel: 'Heropend traject',
        backwardLabel: 'Heropend traject',
        backwardRouteId: null,
        forwardLabel: null,
        forwardRouteId: null,
        detailLabels: ['Heropend traject'],
      })
      expect(semantics.followUpSemantics).toMatchObject({
        isDirectSuccessor: false,
        lineageLabel: 'Heropend traject',
        triggerReason: null,
        triggerReasonLabel: null,
        sourceRouteId: null,
      })
    })

    it('chooses the most recent inconsistent backward neighbor deterministically', () => {
      const semantics = projectActionCenterCoreSemantics(buildContext({
        routeFollowUpRelations: [
          {
            id: 'relation-older',
            routeRelationType: 'follow-up-from',
            sourceRouteId: 'campaign-a::operations',
            targetRouteId: 'campaign-exit::operations',
            triggerReason: 'nieuw-campaign-signaal',
            recordedAt: '2026-05-01T08:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: null,
          },
          {
            id: 'relation-newer',
            routeRelationType: 'follow-up-from',
            sourceRouteId: 'campaign-a2::operations',
            targetRouteId: 'campaign-exit::operations',
            triggerReason: 'hernieuwde-hr-beoordeling',
            recordedAt: '2026-05-01T11:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: null,
          },
        ],
      }))

      expect(semantics.lineageSummary).toMatchObject({
        backwardLabel: 'Vervolg op eerdere route',
        backwardRouteId: 'campaign-a2::operations',
      })
      expect(semantics.followUpSemantics).toMatchObject({
        sourceRouteId: 'campaign-a2::operations',
        triggerReason: 'hernieuwde-hr-beoordeling',
        triggerReasonLabel: 'Hernieuwde HR-beoordeling',
      })
    })

    it('ignores ended backward relations for current lineage and successor truth', () => {
      const semantics = projectActionCenterCoreSemantics(buildContext({
        routeFollowUpRelations: [
          {
            id: 'relation-ended-backward',
            routeRelationType: 'follow-up-from',
            sourceRouteId: 'campaign-ended::operations',
            targetRouteId: 'campaign-exit::operations',
            triggerReason: 'nieuw-campaign-signaal',
            recordedAt: '2026-05-04T11:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: '2026-05-05T10:00:00.000Z',
          },
        ],
      }))

      expect(semantics.lineageSummary).toEqual({
        overviewLabel: null,
        backwardLabel: null,
        backwardRouteId: null,
        forwardLabel: null,
        forwardRouteId: null,
        detailLabels: [],
      })
      expect(semantics.followUpSemantics).toMatchObject({
        isDirectSuccessor: false,
        lineageLabel: null,
        triggerReason: null,
        triggerReasonLabel: null,
        sourceRouteId: null,
      })
    })
  })

  it('derives route completion truth from a completed follow-up review checkpoint', () => {
    const route = projectActionCenterRoute({
      campaign: buildCampaign(),
      stats: buildStats(),
      organizationName: 'Acme BV',
      memberRole: 'owner',
      scopeType: 'department',
      scopeValue: 'operations',
      scopeLabel: 'Operations',
      peopleCount: 38,
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
        assignedAt: '2026-04-21T08:00:00.000Z',
      },
      deliveryRecord: buildDeliveryRecord({
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      }),
      deliveryCheckpoints: [],
      learningDossier: buildDossier({
        first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
        first_action_taken: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
        review_moment: '2026-05-12',
        management_action_outcome: 'bijstellen',
        adoption_outcome: 'De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.',
      }),
      learningCheckpoints: [
        buildCheckpoint({
          id: 'checkpoint-review',
          checkpoint_key: 'follow_up_review',
          status: 'uitgevoerd',
          updated_at: '2026-04-26T10:15:00.000Z',
          confirmed_lesson: 'De frictie bleef terugkomen in elk vervolggesprek.',
        }),
      ],
      managerResponse: null,
    })

    expect(route.reviewCompletedAt).toBe('2026-04-26T10:15:00.000Z')
    expect(route.outcomeRecordedAt).toBe('2026-04-26T10:15:00.000Z')
  })

  it('treats a bounded manager response as meaningful follow-through without requiring a primary action', () => {
    const semantics = projectActionCenterCoreSemantics(buildContext({
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
        assignedAt: '2026-04-21T08:00:00.000Z',
      },
      deliveryRecord: buildDeliveryRecord({
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      }),
      dossier: buildDossier({
        first_management_value: 'Welke lokale follow-through past nu het best bij dit signaal?',
        expected_first_value: 'Maak zichtbaar of het teamoverleg eerst genoeg context oplevert.',
        first_action_taken: null,
        review_moment: null,
      }),
      managerResponse: {
        id: 'response-1',
        campaign_id: 'campaign-exit',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'operations',
        manager_user_id: 'manager-1',
        response_type: 'watch',
        response_note: 'Eerst volgen in het bestaande teamoverleg voordat we een lokale interventie kiezen.',
        review_scheduled_for: '2026-05-12',
        primary_action_theme_key: null,
        primary_action_text: null,
        primary_action_expected_effect: null,
        primary_action_status: null,
        created_by: 'manager-1',
        updated_by: 'manager-1',
        created_at: '2026-04-21T09:00:00.000Z',
        updated_at: '2026-04-21T09:00:00.000Z',
      },
    }))

    expect(semantics.route.routeStatus).toBe('te-bespreken')
    expect(semantics.actionProgress.currentStep).toBeNull()
    expect(semantics.resultLoop.whatWasTried).toBe(
      'Eerst volgen in het bestaande teamoverleg voordat we een lokale interventie kiezen.',
    )
    expect(semantics.reviewSemantics.reviewQuestion).toContain('teamoverleg')
  })

  it('lets one primary manager action become the leading intervention source for action progress', () => {
    const semantics = projectActionCenterCoreSemantics(buildContext({
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
        assignedAt: '2026-04-21T08:00:00.000Z',
      },
      deliveryRecord: buildDeliveryRecord({
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      }),
      dossier: buildDossier({
        first_management_value: 'Welke lokale follow-through past nu het best bij dit signaal?',
        expected_first_value: 'Maak zichtbaar of het feedbackritme in het team duidelijker wordt.',
        first_action_taken: null,
        review_moment: null,
      }),
      managerResponse: {
        id: 'response-2',
        campaign_id: 'campaign-exit',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'operations',
        manager_user_id: 'manager-1',
        response_type: 'confirm',
        response_note: 'We zetten dit om naar een eerste lokale managementstap.',
        review_scheduled_for: '2026-05-12',
        primary_action_theme_key: 'leadership',
        primary_action_text: 'Plan deze week een teamgesprek met de leidinggevende over feedbackritme.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de feedbackafspraken in het team duidelijker worden.',
        primary_action_status: 'active',
        created_by: 'manager-1',
        updated_by: 'manager-1',
        created_at: '2026-04-21T09:00:00.000Z',
        updated_at: '2026-04-21T09:00:00.000Z',
      },
    }))

    expect(semantics.route.routeStatus).toBe('in-uitvoering')
    expect(semantics.actionProgress.currentStep).toBe(
      'Plan deze week een teamgesprek met de leidinggevende over feedbackritme.',
    )
    expect(semantics.actionProgress.expectedEffect).toBe(
      'Binnen twee weken moet zichtbaar zijn of de feedbackafspraken in het team duidelijker worden.',
    )
  })

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
        operator_owner: 'Loep delivery',
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
