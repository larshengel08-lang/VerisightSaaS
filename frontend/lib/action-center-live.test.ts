import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActionCenterPreview } from '@/components/dashboard/action-center-preview'
import {
  buildActionCenterTelemetryEvents,
  buildLiveActionCenterItems,
  finalizeActionCenterPreviewItem,
  getLiveActionCenterSummary,
  isLiveActionCenterScanType,
} from './action-center-live'
import { buildActionCenterRouteId, projectActionCenterRoute } from './action-center-route-contract'
import type { Campaign, CampaignStats } from '@/lib/types'
import type { CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type {
  ActionCenterReviewDecision,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from '@/lib/pilot-learning'

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

function buildLiveContext(
  overrides: Partial<Parameters<typeof buildLiveActionCenterItems>[0][number]> = {},
): Parameters<typeof buildLiveActionCenterItems>[0][number] {
  return {
    campaign: buildCampaign(),
    stats: buildStats(),
    organizationName: 'Acme BV',
    memberRole: 'owner',
    scopeType: 'department',
    scopeValue: 'operations',
    scopeLabel: 'Operations',
    peopleCount: 38,
    assignedManager: null,
    deliveryRecord: buildDeliveryRecord({
      lifecycle_stage: 'first_management_use',
      first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
      next_step: 'Plan eerste managementgesprek met HR en sponsor.',
      customer_handoff_note: 'Vertrekduiding is nu scherp genoeg voor een eerste MT-read.',
    }),
    deliveryCheckpoints: [],
    learningDossier: buildDossier({
      expected_first_value: 'Maak zichtbaar welk vertrekpatroon nu eerst bestuurlijke aandacht vraagt.',
      first_management_value: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      review_moment: '2026-05-12',
      management_action_outcome: 'bijstellen',
    }),
    learningCheckpoints: [],
    reviewDecisions: [] as ActionCenterReviewDecision[],
    ...overrides,
  } as Parameters<typeof buildLiveActionCenterItems>[0][number]
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

  it('builds preview items for legacy active routes and assignment-open requests, while keeping non-open candidates out', () => {
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
      operator_owner: 'Loep delivery',
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
      reviewDecisions: [] as ActionCenterReviewDecision[],
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
      reviewDecisions: [] as ActionCenterReviewDecision[],
    }
    const openRequestContext = {
      ...candidateContext,
      assignedManager: {
        userId: 'manager-2',
        displayName: 'Manager People',
        assignedAt: '2026-04-22T08:00:00.000Z',
      },
      learningDossier: buildDossier({
        id: 'dossier-pulse-open-request',
        campaign_id: 'campaign-pulse',
        title: 'Pulse review april',
        scan_type: 'pulse',
        delivery_mode: 'baseline',
        expected_first_value: null,
        first_management_value: null,
        first_action_taken: null,
        review_moment: null,
      }),
    }
    const route = projectActionCenterRoute(activeContext)

    const items = buildLiveActionCenterItems([
      activeContext,
      openRequestContext,
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
    expect(projectActionCenterRoute(openRequestContext)).toMatchObject({
      entryStage: 'active',
      routeOpenedAt: '2026-04-22T08:00:00.000Z',
      routeStatus: 'open-verzoek',
    })

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      sourceLabel: 'Pulse',
      orgId: 'org-1',
      scopeType: 'department',
      ownerId: 'manager-2',
      ownerName: 'Manager People',
      status: 'open-verzoek',
      teamLabel: 'People Experience',
    })
    expect(items[1]).toMatchObject({
      id: route.routeId,
      sourceLabel: 'ExitScan',
      orgId: 'org-1',
      scopeType: 'department',
      status: route.routeStatus,
      ownerId: null,
      ownerName: null,
      ownerRole: 'Klant owner',
      reviewOwnerName: 'HR lead',
      teamLabel: 'Operations',
      reviewDate: route.reviewScheduledFor,
      expectedEffect: route.expectedEffect,
      reviewReason: route.reviewReason,
      reviewOutcome: route.reviewOutcome,
      nextStep: 'Plan eerste managementgesprek met HR en sponsor.',
    })
    expect(items[1]?.openSignals).toEqual(['owner_missing'])
    expect(items.find((item) => item.id === 'campaign-pulse::engineering')).toBeUndefined()
  })

  it('realigns preview-facing fields with canonical semantics and latest visible update truth', () => {
    const items = buildLiveActionCenterItems([
      {
        campaign: buildCampaign(),
        stats: buildStats(),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue: 'operations',
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: null,
        deliveryRecord: buildDeliveryRecord({
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
          next_step: 'Plan het vervolggesprek met HR en operations.',
          customer_handoff_note: null,
          operator_notes: null,
        }),
        deliveryCheckpoints: [
          {
            id: 'delivery-checkpoint-1',
            delivery_record_id: 'delivery-exit',
            checkpoint_key: 'first_management_use',
            status: 'confirmed',
            confirmed_at: null,
            confirmed_by: null,
            exception_status: 'none',
            last_auto_summary: null,
            operator_note: 'Klant bevestigde dat de eerste managementread nu zichtbaar is.',
            created_at: '2026-04-24T09:00:00.000Z',
            updated_at: '2026-04-24T09:00:00.000Z',
          },
        ],
        learningDossier: buildDossier({
          first_management_value: null,
          buyer_question: 'Waar moeten we als management nu als eerste op ingrijpen?',
          expected_first_value: null,
          first_action_taken: null,
          adoption_outcome: null,
          case_public_summary: null,
        }),
        learningCheckpoints: [],
      },
    ])

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      reason: 'Waar moeten we als management nu als eerste op ingrijpen?',
      signalBody: 'Klant bevestigde dat de eerste managementread nu zichtbaar is.',
      coreSemantics: {
        reviewSemantics: {
          reviewReason: 'Waar moeten we als management nu als eerste op ingrijpen?',
        },
        resultLoop: {
          whatWeObserved: 'Klant bevestigde dat de eerste managementread nu zichtbaar is.',
        },
      },
    })
  })

  it('projects route summary semantics for open requests, review pressure, and historical closed routes', () => {
    const [openRequestItem] = buildLiveActionCenterItems([
      buildLiveContext({
        assignedManager: {
          userId: 'manager-open',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-22T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          lifecycle_stage: 'first_value_reached',
          first_management_use_confirmed_at: null,
          next_step: null,
          customer_handoff_note: 'De route staat klaar voor de eerste managementread.',
        }),
        learningDossier: buildDossier({
          expected_first_value: null,
          first_management_value: null,
          first_action_taken: null,
          review_moment: null,
          management_action_outcome: 'geen-uitkomst',
        }),
      }),
    ])
    const [reviewableItem] = buildLiveActionCenterItems([
      buildLiveContext({
        routeActions: [
          {
            actionId: 'action-reviewable',
            routeId: buildActionCenterRouteId('campaign-exit', 'operations'),
            themeKey: 'workload',
            actionText: 'Plan een bounded herverdeling van piekwerk.',
            expectedEffect: 'Maak zichtbaar of de piekbelasting binnen twee weken daalt.',
            reviewScheduledFor: '2026-01-05',
            status: 'open',
            createdAt: '2026-05-01T09:00:00.000Z',
            updatedAt: '2026-05-01T09:00:00.000Z',
          },
        ],
      }),
    ])
    const [closedItem] = buildLiveActionCenterItems([
      buildLiveContext({
        learningDossier: buildDossier({
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
          next_route: 'Gebruik het vervolgtraject voor nieuw lokaal ritme.',
          case_public_summary: 'De eerdere route is historisch afgerond.',
        }),
        routeFollowUpRelations: [
          {
            id: 'follow-up-1',
            campaignId: 'campaign-exit',
            orgId: 'org-1',
            routeRelationType: 'follow-up-from',
            sourceRouteId: buildActionCenterRouteId('campaign-exit', 'operations'),
            sourceCampaignId: 'campaign-exit',
            sourceRouteScopeValue: 'operations',
            targetRouteId: 'campaign-next::org-1::department::operations',
            targetCampaignId: 'campaign-next',
            targetRouteScopeValue: 'operations',
            triggerReason: 'hernieuwde-hr-beoordeling',
            managerUserId: 'manager-next',
            recordedAt: '2026-05-15T09:00:00.000Z',
            recordedByRole: 'hr_owner',
            recordedBy: 'user-1',
            endedAt: null,
          },
        ],
      }),
    ])

    expect(openRequestItem?.coreSemantics.routeSummary).toMatchObject({
      stateLabel: 'Open verzoek',
      overviewSummary: 'Open route die nog wacht op de eerste managerstap en het eerste reviewmoment.',
    })
    expect(reviewableItem?.coreSemantics.routeSummary).toMatchObject({
      stateLabel: 'Reviewbaar',
      overviewSummary: 'Actieve route waarbij 1 reviewmoment nu aandacht vraagt.',
    })
    expect(closedItem?.coreSemantics.routeSummary).toMatchObject({
      stateLabel: 'Afgerond',
      overviewSummary: 'Historische route die later een directe opvolger kreeg.',
    })
  })

  it('builds a compact workspace readback summary from visible route truth', () => {
    const [baseItem] = buildLiveActionCenterItems([buildLiveContext()])

    const decisionItem = {
      ...baseItem,
      id: 'route-readback-open',
      coreSemantics: {
        ...baseItem.coreSemantics,
        latestDecision: {
          decisionEntryId: 'decision-readback-1',
          sourceRouteId: 'route-readback-open',
          decision: 'bijstellen',
          decisionReason: 'De eerste bounded stap vroeg nog aanscherping.',
          nextCheck: 'Bevestig binnen twee weken of de nieuwe managementstap effect heeft.',
          decisionRecordedAt: '2026-05-01T10:00:00.000Z',
          reviewCompletedAt: '2026-05-01T09:30:00.000Z',
        },
        decisionHistory: [
          {
            decisionEntryId: 'decision-readback-1',
            sourceRouteId: 'route-readback-open',
            decision: 'bijstellen',
            decisionReason: 'De eerste bounded stap vroeg nog aanscherping.',
            nextCheck: 'Bevestig binnen twee weken of de nieuwe managementstap effect heeft.',
            decisionRecordedAt: '2026-05-01T10:00:00.000Z',
            reviewCompletedAt: '2026-05-01T09:30:00.000Z',
          },
        ],
      },
    }
    const reopenedItem = {
      ...baseItem,
      id: 'route-readback-reopen',
      title: 'Heropende route',
      coreSemantics: {
        ...baseItem.coreSemantics,
        lineageSummary: {
          overviewLabel: 'Heropend traject',
          backwardLabel: 'Heropend traject',
          backwardRouteId: null,
          forwardLabel: null,
          forwardRouteId: null,
          detailLabels: ['Heropend traject'],
        },
      },
    }
    const followedUpItem = {
      ...baseItem,
      id: 'route-readback-closed',
      title: 'Historisch afgesloten route',
      status: 'afgerond' as const,
      coreSemantics: {
        ...baseItem.coreSemantics,
        routeSummary: {
          stateLabel: 'Afgerond',
          overviewSummary: 'Historische route die later een directe opvolger kreeg.',
          routeAsk: 'Lees deze route alleen nog als historische context.',
          progressSummary: 'Er loopt geen actieve follow-through meer in deze route.',
        },
        lineageSummary: {
          overviewLabel: 'Later opgevolgd',
          backwardLabel: null,
          backwardRouteId: null,
          forwardLabel: 'Later opgevolgd',
          forwardRouteId: 'route-readback-next',
          detailLabels: ['Later opgevolgd'],
        },
      },
    }

    const summary = getLiveActionCenterSummary([decisionItem, reopenedItem, followedUpItem])

    expect(summary).toMatchObject({
      routeCount: 3,
      activeRouteCount: 2,
      closedRouteCount: 1,
      decisionRouteCount: 1,
      reopenedRouteCount: 1,
      followUpVisibleRouteCount: 1,
      continuationVisibleRouteCount: 2,
      reviewCount: 3,
      nextReviewDate: '2026-05-12',
    })
  })

  it('finalizes local preview items with derived core semantics and synchronized open signals', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'local-1',
      code: 'ACT-2001',
      title: 'Nieuwe follow-up',
      summary: 'Nieuwe opvolgactie vanuit Action Center.',
      reason: 'Nieuwe actie gekoppeld aan een bestaand dossier of signaal.',
      sourceLabel: 'ExitScan',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: null,
      ownerName: null,
      ownerRole: 'Nog niet toegewezen',
      ownerSubtitle: 'Operations',
      reviewOwnerName: null,
      priority: 'hoog',
      status: 'te-bespreken',
      reviewDate: null,
      expectedEffect: null,
      reviewReason: null,
      reviewOutcome: 'geen-uitkomst',
      reviewDateLabel: 'Nog niet gepland',
      reviewRhythm: 'Tweewekelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'Nieuwe opvolgactie vanuit Action Center.',
      nextStep: 'Eerste vervolgstap vastleggen en reviewdatum bevestigen.',
      peopleCount: 38,
      updates: [
        {
          id: 'update-1',
          author: 'Admin',
          dateLabel: '28 apr',
          note: 'Actie handmatig toegevoegd in de preview-surface.',
        },
      ],
    })

    expect(item.coreSemantics.actionFrame.firstStep).toBe('Eerste vervolgstap vastleggen en reviewdatum bevestigen.')
    expect(item.coreSemantics.actionFrame.owner).toBe('Nog niet toegewezen')
    expect(item.coreSemantics.routeSummary).toMatchObject({
      stateLabel: 'Te bespreken',
      overviewSummary: 'Open route waarbij de eerste expliciete route-read en vervolglijn nog scherp moeten worden.',
    })
    expect(item.reason).toBe(item.coreSemantics.reviewSemantics.reviewReason)
    expect(item.nextStep).toBe(item.coreSemantics.actionFrame.firstStep)
    expect(item.openSignals).toEqual(['owner_missing', 'review_due'])
  })

  it('keeps decision_due tied to canonical intervention truth instead of preview fallback copy', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'local-1b',
      code: 'ACT-2001B',
      title: 'Nieuwe follow-up zonder stap',
      summary: 'Nieuwe opvolgactie vanuit Action Center.',
      reason: 'Nieuwe actie gekoppeld aan een bestaand dossier of signaal.',
      sourceLabel: 'ExitScan',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Manager Operations',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'Manager Operations',
      priority: 'hoog',
      status: 'te-bespreken',
      reviewDate: '2026-05-12',
      expectedEffect: null,
      reviewReason: null,
      reviewOutcome: 'geen-uitkomst',
      reviewDateLabel: '12 mei',
      reviewRhythm: 'Tweewekelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'Nieuwe opvolgactie vanuit Action Center.',
      nextStep: null,
      peopleCount: 38,
      updates: [
        {
          id: 'update-1b',
          author: 'Admin',
          dateLabel: '28 apr',
          note: 'Actie handmatig toegevoegd in de preview-surface.',
        },
      ],
    })

    expect(item.coreSemantics.route.intervention).toBeNull()
    expect(item.coreSemantics.actionFrame.firstStep).toBe('Nog te bepalen in review')
    expect(item.openSignals).toEqual(['decision_due'])
  })

  it('recompute keeps existing canonical preview route truth instead of re-promoting projected display fields', () => {
    const seeded = finalizeActionCenterPreviewItem({
      id: 'local-2',
      code: 'ACT-2002',
      title: 'Bestaande follow-up',
      summary: 'Lijstsamenvatting voor de preview.',
      reason: 'Afgeleide reviewcopy uit de vorige render.',
      sourceLabel: 'ExitScan',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: null,
      ownerName: null,
      ownerRole: 'Nog niet toegewezen',
      ownerSubtitle: 'Operations',
      reviewOwnerName: null,
      priority: 'hoog',
      status: 'te-bespreken',
      reviewDate: null,
      expectedEffect: 'Afgeleid verwacht effect.',
      reviewReason: 'Afgeleide reviewreden.',
      reviewOutcome: 'geen-uitkomst',
      reviewDateLabel: 'Nog niet gepland',
      reviewRhythm: 'Tweewekelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'Zichtbaar signaal voor de kaart.',
      nextStep: 'Afgeleide eerste stap uit de vorige render.',
      peopleCount: 38,
      updates: [],
      coreSemantics: {
        route: {
          campaignId: 'local-2',
          entryStage: 'active',
          routeOpenedAt: null,
          ownerAssignedAt: null,
          routeStatus: 'te-bespreken',
          reviewOutcome: 'geen-uitkomst',
          reviewCompletedAt: null,
          outcomeRecordedAt: null,
          outcomeSummary: null,
          intervention: 'Canonieke previewstap.',
          owner: null,
          expectedEffect: 'Canoniek previeweffect.',
          reviewScheduledFor: null,
          reviewReason: 'Canonieke previewreviewreden.',
          blockedBy: null,
        },
        routeSummary: {
          stateLabel: 'Te bespreken',
          overviewSummary: 'Open route waarbij de eerste expliciete route-read en vervolglijn nog scherp moeten worden.',
          routeAsk: 'Bepaal eerst welke bounded vervolglijn deze route nu echt vraagt.',
          progressSummary: 'De route is geopend, maar de concrete vervolglijn is nog niet scherp genoeg vastgelegd.',
        },
        reviewSemantics: {
          reviewReason: 'Canonieke previewreviewreden.',
          reviewQuestion: 'Canoniek previeweffect.',
          reviewOutcomeRaw: 'geen-uitkomst',
          reviewOutcomeVisible: 'geen-uitkomst',
        },
        actionFrame: {
          whyNow: 'Canonieke previewreviewreden.',
          firstStep: 'Canonieke previewstap.',
          owner: 'Nog niet toegewezen',
          expectedEffect: 'Canoniek previeweffect.',
        },
        resultLoop: {
          whatWasTried: 'Canonieke previewstap.',
          whatWeObserved: 'Zichtbaar signaal voor de kaart.',
          whatWasDecided: null,
        },
        lineageSummary: {
          overviewLabel: null,
          backwardLabel: null,
          backwardRouteId: null,
          forwardLabel: null,
          forwardRouteId: null,
          detailLabels: [],
        },
        closingSemantics: {
          status: 'lopend',
          summary: null,
        },
      },
    })

    const recomputed = finalizeActionCenterPreviewItem({
      ...seeded,
      ownerName: 'Manager Operations',
      reviewDate: '2026-05-12',
      reviewDateLabel: '12 mei',
      status: 'in-uitvoering',
      nextStep: 'Afgeleide eerste stap die niet terug de route in mag.',
      expectedEffect: 'Afgeleid effect dat niet terug de route in mag.',
      reviewReason: 'Afgeleide reviewreden die niet terug de route in mag.',
      reason: 'Afgeleide why-now copy die niet terug de route in mag.',
      updates: [
        {
          id: 'update-2',
          author: 'Admin',
          dateLabel: '28 apr',
          note: 'Update: eigenaar bevestigd en review opnieuw ingepland.',
        },
      ],
    }, { recomputeCoreSemantics: true })

    expect(recomputed.coreSemantics.route).toMatchObject({
      intervention: 'Canonieke previewstap.',
      expectedEffect: 'Canoniek previeweffect.',
      reviewReason: 'Canonieke previewreviewreden.',
      owner: 'Manager Operations',
      reviewScheduledFor: '2026-05-12',
      routeStatus: 'in-uitvoering',
    })
    expect(recomputed.coreSemantics.routeSummary).toMatchObject({
      stateLabel: 'In uitvoering',
      overviewSummary: 'Actieve route waarin de eerste bounded managerstap nu loopt.',
    })
    expect(recomputed.coreSemantics.resultLoop.whatWasTried).toBe(
      'Update: eigenaar bevestigd en review opnieuw ingepland.',
    )
  })

  it('preserves projected follow-up lineage semantics when preview core semantics recomputes', () => {
    const seeded = finalizeActionCenterPreviewItem({
      id: 'local-follow-up',
      code: 'ACT-2010',
      title: 'Bestaande vervolgroute',
      summary: 'Lijstsamenvatting voor de vervolgroute.',
      reason: 'Afgeleide reviewcopy uit de vorige render.',
      sourceLabel: 'ExitScan',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Manager Operations',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'Manager Operations',
      priority: 'hoog',
      status: 'te-bespreken',
      reviewDate: '2026-05-12',
      expectedEffect: 'Afgeleid verwacht effect.',
      reviewReason: 'Afgeleide reviewreden.',
      reviewOutcome: 'geen-uitkomst',
      reviewDateLabel: '12 mei',
      reviewRhythm: 'Tweewekelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'Zichtbaar signaal voor de kaart.',
      nextStep: 'Afgeleide eerste stap uit de vorige render.',
      peopleCount: 38,
      updates: [],
      coreSemantics: {
        route: {
          routeId: 'local-follow-up',
          campaignId: 'local-follow-up',
          entryStage: 'active',
          routeOpenedAt: '2026-05-01T09:00:00.000Z',
          ownerAssignedAt: '2026-05-01T09:00:00.000Z',
          routeStatus: 'te-bespreken',
          reviewOutcome: 'geen-uitkomst',
          reviewCompletedAt: null,
          outcomeRecordedAt: null,
          outcomeSummary: null,
          intervention: null,
          owner: 'Manager Operations',
          expectedEffect: null,
          reviewScheduledFor: '2026-05-12',
          reviewReason: 'Canonieke previewreviewreden.',
          managerResponseType: 'schedule',
          managerResponseNote: 'Nieuwe vervolgroute geopend door HR.',
          primaryActionThemeKey: null,
          followThroughMode: 'bounded_response',
          blockedBy: null,
        },
        reviewSemantics: {
          reviewReason: 'Canonieke previewreviewreden.',
          reviewQuestion: 'Welke vervolgstap vraagt deze route nu als eerste review?',
          reviewOutcomeRaw: 'geen-uitkomst',
          reviewOutcomeVisible: 'geen-uitkomst',
        },
        actionProgress: {
          currentStep: null,
          nextStep: null,
          expectedEffect: null,
        },
        actionFrame: {
          whyNow: 'Canonieke previewreviewreden.',
          firstStep: 'Nog te bepalen in review',
          owner: 'Manager Operations',
          expectedEffect: 'Nog te bepalen in review',
        },
        resultLoop: {
          whatWasTried: null,
          whatWeObserved: 'Zichtbaar signaal voor de kaart.',
          whatWasDecided: null,
        },
        resultProgression: [],
        decisionHistory: [],
        lineageSummary: {
          overviewLabel: 'Vervolg op eerdere route',
          backwardLabel: 'Vervolg op eerdere route',
          backwardRouteId: 'campaign-source::operations',
          forwardLabel: null,
          forwardRouteId: null,
          detailLabels: ['Vervolg op eerdere route'],
        },
        followUpSemantics: {
          isDirectSuccessor: true,
          lineageLabel: 'Vervolg op eerdere route',
          triggerReason: 'nieuw-segment-signaal',
          triggerReasonLabel: 'Nieuw segmentsignaal',
          sourceRouteId: 'campaign-source::operations',
        },
        routeSummary: {
          stateLabel: 'Te bespreken',
          overviewSummary: 'Open route waarbij de eerste expliciete route-read en vervolglijn nog scherp moeten worden.',
          routeAsk: 'Bepaal eerst welke bounded vervolglijn deze route nu echt vraagt.',
          progressSummary: 'De route is geopend, maar de concrete vervolglijn is nog niet scherp genoeg vastgelegd.',
        },
        closingSemantics: {
          status: 'lopend',
          summary: null,
          historicalSummary: null,
        },
      },
    })

    const recomputed = finalizeActionCenterPreviewItem(
      {
        ...seeded,
        updates: [
          {
            id: 'update-follow-up-1',
            author: 'Admin',
            dateLabel: '1 mei',
            note: 'Update: vervolgroute is opnieuw ingepland.',
          },
        ],
      },
      { recomputeCoreSemantics: true },
    )

    expect(recomputed.coreSemantics.lineageSummary).toMatchObject({
      overviewLabel: 'Vervolg op eerdere route',
      backwardLabel: 'Vervolg op eerdere route',
      backwardRouteId: 'campaign-source::operations',
      forwardLabel: null,
      forwardRouteId: null,
      detailLabels: ['Vervolg op eerdere route'],
    })
    expect(recomputed.coreSemantics.followUpSemantics).toMatchObject({
      isDirectSuccessor: true,
      lineageLabel: 'Vervolg op eerdere route',
      triggerReason: 'nieuw-segment-signaal',
      triggerReasonLabel: 'Nieuw segmentsignaal',
      sourceRouteId: 'campaign-source::operations',
    })
  })

  it('does not promote management_action_outcome into the latest visible update fallback for live items', () => {
    const items = buildLiveActionCenterItems([
      {
        campaign: buildCampaign(),
        stats: buildStats(),
        organizationName: 'Acme BV',
        memberRole: 'owner' as const,
        scopeType: 'department' as const,
        scopeValue: 'operations',
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: null,
        deliveryRecord: buildDeliveryRecord({
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
          next_step: 'Plan het vervolggesprek met HR en operations.',
          customer_handoff_note: null,
          operator_owner: 'Loep delivery',
          operator_notes: null,
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          expected_first_value: 'Maak zichtbaar welke route nu zonder extra follow-through kan sluiten.',
          first_management_value: 'Welke route kan nu bewust worden afgesloten?',
          first_action_taken: 'Bevestig in het MT dat deze route bewust stopt.',
          management_action_outcome: 'stoppen',
          adoption_outcome: null,
          case_public_summary: null,
        }),
        learningCheckpoints: [],
      },
    ])
    const item = items[0]

    expect(items).toHaveLength(1)
    expect(item.updates[0]?.note).not.toBe('stoppen')
    expect(item.coreSemantics.resultLoop.whatWasTried).toBe('Bevestig in het MT dat deze route bewust stopt.')
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
      operator_owner: 'Loep delivery',
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
      management_action_outcome: 'bijstellen',
      adoption_outcome: 'Team koos een aangepaste follow-through na de eerste MT-review.',
      updated_at: '2026-04-24T10:00:00.000Z',
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
        assignedManager: {
          userId: 'manager-1',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-21T08:00:00.000Z',
        } as NonNullable<Parameters<typeof buildActionCenterTelemetryEvents>[0][number]['assignedManager']>,
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
      'action_center_route_opened',
      'action_center_owner_assigned',
    ])
    expect(events.slice(3)).toMatchObject([
      {
        eventType: 'action_center_route_opened',
        payload: {
          scopeValue: 'operations',
          routeStatus: 'te-bespreken',
        },
      },
      {
        eventType: 'action_center_owner_assigned',
        payload: {
          ownerLabel: 'Manager Operations',
          routeStatus: 'te-bespreken',
        },
      },
    ])
  })

  it('records review completion and outcome telemetry only when follow-up review completion truth exists', () => {
    const campaign = buildCampaign()
    const deliveryRecord = buildDeliveryRecord({
      lifecycle_stage: 'follow_up_decided',
      first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
    })
    const dossier = buildDossier({
      review_moment: '2026-05-12',
      triage_status: 'bevestigd',
      management_action_outcome: 'bijstellen',
      adoption_outcome: 'Team koos een aangepaste follow-through na de eerste MT-review.',
    })

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
        assignedManager: {
          userId: 'manager-1',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-21T08:00:00.000Z',
        } as NonNullable<Parameters<typeof buildActionCenterTelemetryEvents>[0][number]['assignedManager']>,
        deliveryRecord,
        deliveryCheckpoints: [],
        learningDossier: dossier,
        learningCheckpoints: [
          {
            id: 'checkpoint-review',
            dossier_id: 'dossier-exit',
            checkpoint_key: 'follow_up_review',
            owner_label: 'HR lead',
            status: 'uitgevoerd',
            objective_signal_notes: null,
            qualitative_notes: null,
            interpreted_observation: null,
            confirmed_lesson: 'De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.',
            lesson_strength: 'terugkerend_patroon',
            destination_areas: ['operations'],
            updated_at: '2026-04-26T10:15:00.000Z',
            created_at: '2026-04-15T10:00:00.000Z',
          } as PilotLearningCheckpoint,
        ],
      },
    ])

    expect(events.map((event) => event.eventType)).toContain('action_center_review_completed')
    expect(events.map((event) => event.eventType)).toContain('action_center_outcome_recorded')
  })

  it('records closeout telemetry for intentionally stopped routes too', () => {
    const events = buildActionCenterTelemetryEvents([
      {
        campaign: buildCampaign(),
        stats: null,
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue: 'operations',
        scopeLabel: 'Operations',
        peopleCount: 12,
        assignedManager: {
          userId: 'manager-1',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-21T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          triage_status: 'verworpen',
          stop_reason: 'Er is bewust besloten om deze route nu te stoppen.',
          management_action_outcome: 'stoppen',
        }),
        learningCheckpoints: [],
      },
    ])

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: 'action_center_closeout_recorded',
          payload: expect.objectContaining({
            triageStatus: 'verworpen',
            lifecycleStage: 'follow_up_decided',
          }),
        }),
      ]),
    )
  })

  it('projects latest decision and shared action progress into live items', () => {
    const items = buildLiveActionCenterItems([
      {
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
          displayName: 'Sanne de Vries',
          assignedAt: '2026-04-21T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
          next_step: 'Plan de vervolgcheck met HR en operations.',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          expected_first_value: 'Maak zichtbaar of de werkdruk lokaal daalt.',
          first_action_taken: 'Plan een gerichte teamreview met de manager.',
          review_moment: '2026-05-12',
          management_action_outcome: 'bijstellen',
        }),
        learningCheckpoints: [
          {
            id: 'checkpoint-review',
            dossier_id: 'dossier-exit',
            checkpoint_key: 'follow_up_review',
            owner_label: 'HR lead',
            status: 'uitgevoerd',
            objective_signal_notes: null,
            qualitative_notes: null,
            interpreted_observation: null,
            confirmed_lesson: 'De eerste review liet zien dat de werkdruk nog niet daalt.',
            lesson_strength: 'terugkerend_patroon',
            destination_areas: ['operations'],
            updated_at: '2026-04-26T10:15:00.000Z',
            created_at: '2026-04-15T10:00:00.000Z',
          } as PilotLearningCheckpoint,
        ],
      },
    ])

    expect(items).toHaveLength(1)
    expect(items[0]?.coreSemantics.latestDecision).toMatchObject({
      decision: 'bijstellen',
      decisionReason: 'Maak zichtbaar of de werkdruk lokaal daalt.',
      nextCheck: 'Maak zichtbaar of de werkdruk lokaal daalt.',
    })
    expect(items[0]?.coreSemantics.actionProgress).toMatchObject({
      currentStep: 'Plan een gerichte teamreview met de manager.',
      nextStep: 'Plan de vervolgcheck met HR en operations.',
      expectedEffect: 'Maak zichtbaar of de werkdruk lokaal daalt.',
    })
  })

  it('uses authored review decisions as the only visible history once they exist on a route', () => {
    const context = {
      campaign: buildCampaign(),
      stats: buildStats(),
      organizationName: 'Acme BV',
      memberRole: 'owner' as const,
      scopeType: 'department' as const,
      scopeValue: 'operations',
      scopeLabel: 'Operations',
      peopleCount: 38,
      assignedManager: {
        userId: 'manager-1',
        displayName: 'Manager Operations',
        assignedAt: '2026-04-21T08:00:00.000Z',
      },
      deliveryRecord: buildDeliveryRecord({
        lifecycle_stage: 'first_management_use',
        first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
        next_step: 'Legacy vervolgstap die niet meer zichtbaar mag zijn.',
      }),
      deliveryCheckpoints: [],
      learningDossier: buildDossier({
        expected_first_value: 'Legacy effect dat niet meer zichtbaar mag zijn.',
        first_management_value: 'Legacy reviewreden die niet meer zichtbaar mag zijn.',
        first_action_taken: 'Legacy stap die niet meer zichtbaar mag zijn.',
        management_action_outcome: 'stoppen',
      }),
      learningCheckpoints: [
        {
          id: 'checkpoint-follow-up-review',
          dossier_id: 'dossier-exit',
          checkpoint_key: 'follow_up_review',
          owner_label: 'HR lead',
          status: 'uitgevoerd',
          objective_signal_notes: null,
          qualitative_notes: null,
          interpreted_observation: null,
          confirmed_lesson: 'Legacy checkpointobservatie.',
          lesson_strength: 'terugkerend_patroon',
          destination_areas: ['operations'],
          updated_at: '2026-04-24T09:00:00.000Z',
          created_at: '2026-04-15T10:00:00.000Z',
        } as PilotLearningCheckpoint,
      ],
      reviewDecisions: [
        {
          id: 'authored-decision-1',
          route_source_type: 'campaign',
          route_source_id: 'campaign-exit',
          checkpoint_id: 'checkpoint-follow-up-review',
          decision: 'bijstellen',
          decision_reason: 'Authored review decision bepaalt nu de zichtbare besluitrichting.',
          next_check: 'Toets volgende week of de managercheck de frictie smaller maakt.',
          current_step: 'Voer deze week een gerichte managercheck uit.',
          next_step: 'Bevestig in review of de frictie specifieker is geworden.',
          expected_effect: 'Maak zichtbaar of de managercheck het knelpunt versmalt.',
          observation_snapshot: 'Dezelfde frictie bleef zichtbaar in twee teams.',
          decision_recorded_at: '2026-04-28T09:00:00.000Z',
          review_completed_at: '2026-04-28T08:30:00.000Z',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-28T09:00:00.000Z',
          updated_at: '2026-04-28T09:00:00.000Z',
        },
      ] satisfies ActionCenterReviewDecision[],
    }

    const [item] = buildLiveActionCenterItems([context])

    expect(item?.coreSemantics.latestDecision?.decisionReason).toBe(
      'Authored review decision bepaalt nu de zichtbare besluitrichting.',
    )
    expect(item?.coreSemantics.actionProgress.currentStep).toBe(
      'Voer deze week een gerichte managercheck uit.',
    )
    expect(item?.coreSemantics.decisionHistory).toHaveLength(1)
    expect(item?.coreSemantics.decisionHistory[0]?.decisionEntryId).toBe('authored-decision-1')
  })

  it('projects follow-up lineage and trigger reason labels onto direct successor routes without changing normal open status', () => {
    const scopeValue = 'org-1::department::operations'
    const sourceCampaign = buildCampaign({
      id: 'campaign-source',
      name: 'Exit maart',
    })
    const targetCampaign = buildCampaign({
      id: 'campaign-target',
      name: 'Exit april',
      created_at: '2026-04-18T10:00:00.000Z',
    })
    const sourceRouteId = buildActionCenterRouteId(sourceCampaign.id, scopeValue)
    const targetRouteId = buildActionCenterRouteId(targetCampaign.id, scopeValue)

    const items = buildLiveActionCenterItems([
      {
        campaign: sourceCampaign,
        stats: buildStats({ campaign_id: sourceCampaign.id, campaign_name: sourceCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-source',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: sourceCampaign.id,
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-04-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: sourceCampaign.id,
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
          adoption_outcome: 'De vorige route is bewust afgesloten na de review.',
          case_public_summary: 'De eerdere route is afgesloten en wordt nu historisch bewaard.',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: [
          {
            id: 'relation-1',
            routeRelationType: 'follow-up-from',
            sourceRouteId,
            targetRouteId,
            triggerReason: 'nieuw-segment-signaal',
            recordedAt: '2026-04-30T09:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: null,
          },
        ],
      },
      {
        campaign: targetCampaign,
        stats: buildStats({ campaign_id: targetCampaign.id, campaign_name: targetCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-target',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-30T09:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: targetCampaign.id,
          lifecycle_stage: 'first_value_reached',
          first_management_use_confirmed_at: null,
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: targetCampaign.id,
          title: 'Nieuwe vervolgroute',
          triage_status: 'bevestigd',
          expected_first_value: null,
          first_management_value: null,
          first_action_taken: null,
          review_moment: null,
          management_action_outcome: null,
        }),
        learningCheckpoints: [],
        managerResponse: {
          id: 'manager-response-1',
          campaign_id: targetCampaign.id,
          org_id: 'org-1',
          route_scope_type: 'department',
          route_scope_value: scopeValue,
          manager_user_id: 'manager-target',
          response_type: 'schedule',
          response_note: 'Vervolgroute geopend door HR.',
          review_scheduled_for: '2026-05-14',
          primary_action_theme_key: null,
          primary_action_text: null,
          primary_action_expected_effect: null,
          primary_action_status: null,
          created_by: null,
          updated_by: null,
          created_at: '2026-04-30T09:00:00.000Z',
          updated_at: '2026-04-30T09:00:00.000Z',
        },
        reviewDecisions: [],
        routeFollowUpRelations: [
          {
            id: 'relation-1',
            routeRelationType: 'follow-up-from',
            sourceRouteId,
            targetRouteId,
            triggerReason: 'nieuw-segment-signaal',
            recordedAt: '2026-04-30T09:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: null,
          },
        ],
      },
    ])

    const sourceItem = items.find((item) => item.id === sourceRouteId)
    const successorItem = items.find((item) => item.id === targetRouteId)

    expect(sourceItem).toMatchObject({
      status: 'afgerond',
      coreSemantics: {
        closingSemantics: {
          status: 'afgerond',
        },
        lineageSummary: {
          overviewLabel: 'Later opgevolgd',
          backwardLabel: null,
          backwardRouteId: null,
          forwardLabel: 'Later opgevolgd',
          forwardRouteId: targetRouteId,
          detailLabels: ['Later opgevolgd'],
        },
      },
    })
    expect(successorItem).toMatchObject({
      status: 'te-bespreken',
      coreSemantics: {
        route: {
          routeStatus: 'te-bespreken',
        },
        lineageSummary: {
          overviewLabel: 'Vervolg op eerdere route',
          backwardLabel: 'Vervolg op eerdere route',
          backwardRouteId: sourceRouteId,
          forwardLabel: null,
          forwardRouteId: null,
          detailLabels: ['Vervolg op eerdere route'],
        },
      },
    })
  })

  it('uses backward lineage in overview and both lineage labels in detail for a middle route', () => {
    const scopeValue = 'org-1::department::operations'
    const previousCampaign = buildCampaign({
      id: 'campaign-previous',
      name: 'Exit maart',
      created_at: '2026-03-10T10:00:00.000Z',
    })
    const currentCampaign = buildCampaign({
      id: 'campaign-current',
      name: 'Exit april',
      created_at: '2026-04-10T10:00:00.000Z',
    })
    const nextCampaign = buildCampaign({
      id: 'campaign-next',
      name: 'Exit mei',
      created_at: '2026-05-10T10:00:00.000Z',
    })
    const previousRouteId = buildActionCenterRouteId(previousCampaign.id, scopeValue)
    const currentRouteId = buildActionCenterRouteId(currentCampaign.id, scopeValue)
    const nextRouteId = buildActionCenterRouteId(nextCampaign.id, scopeValue)
    const sharedRelations = [
      {
        id: 'relation-backward',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: previousRouteId,
        targetRouteId: currentRouteId,
        triggerReason: 'nieuw-campaign-signaal' as const,
        recordedAt: '2026-05-01T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
      {
        id: 'relation-forward',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: currentRouteId,
        targetRouteId: nextRouteId,
        triggerReason: 'hernieuwde-hr-beoordeling' as const,
        recordedAt: '2026-05-02T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
    ]

    const items = buildLiveActionCenterItems([
      {
        campaign: previousCampaign,
        stats: buildStats({ campaign_id: previousCampaign.id, campaign_name: previousCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-previous',
          displayName: 'Manager Operations',
          assignedAt: '2026-03-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: previousCampaign.id,
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-03-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: previousCampaign.id,
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
          case_public_summary: 'De vorige route is afgerond.',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: currentCampaign,
        stats: buildStats({ campaign_id: currentCampaign.id, campaign_name: currentCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-current',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: currentCampaign.id,
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: currentCampaign.id,
          title: 'Middenroute',
          triage_status: 'bevestigd',
          management_action_outcome: 'bijstellen',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: nextCampaign,
        stats: buildStats({ campaign_id: nextCampaign.id, campaign_name: nextCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-next',
          displayName: 'Manager Operations',
          assignedAt: '2026-05-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: nextCampaign.id,
          lifecycle_stage: 'first_value_reached',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: nextCampaign.id,
          title: 'Nieuwe vervolgroute',
          triage_status: 'bevestigd',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
    ] as Parameters<typeof buildLiveActionCenterItems>[0])

    const currentItem = items.find((item) => item.id === currentRouteId)

    expect(currentItem?.coreSemantics.lineageSummary).toMatchObject({
      overviewLabel: 'Vervolg op eerdere route',
      backwardLabel: 'Vervolg op eerdere route',
      backwardRouteId: previousRouteId,
      forwardLabel: 'Later opgevolgd',
      forwardRouteId: nextRouteId,
      detailLabels: ['Vervolg op eerdere route', 'Later opgevolgd'],
    })
  })

  it('renders both backward and forward lineage controls in detail for a middle route', () => {
    const scopeValue = 'org-1::department::operations'
    const previousCampaign = buildCampaign({
      id: 'campaign-previous-detail',
      name: 'Exit maart',
      created_at: '2026-03-10T10:00:00.000Z',
    })
    const currentCampaign = buildCampaign({
      id: 'campaign-current-detail',
      name: 'Exit april',
      created_at: '2026-04-10T10:00:00.000Z',
    })
    const nextCampaign = buildCampaign({
      id: 'campaign-next-detail',
      name: 'Exit mei',
      created_at: '2026-05-10T10:00:00.000Z',
    })
    const previousRouteId = buildActionCenterRouteId(previousCampaign.id, scopeValue)
    const currentRouteId = buildActionCenterRouteId(currentCampaign.id, scopeValue)
    const nextRouteId = buildActionCenterRouteId(nextCampaign.id, scopeValue)
    const sharedRelations = [
      {
        id: 'relation-backward-detail',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: previousRouteId,
        targetRouteId: currentRouteId,
        triggerReason: 'nieuw-campaign-signaal' as const,
        recordedAt: '2026-05-01T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
      {
        id: 'relation-forward-detail',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: currentRouteId,
        targetRouteId: nextRouteId,
        triggerReason: 'hernieuwde-hr-beoordeling' as const,
        recordedAt: '2026-05-02T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
    ]

    const items = buildLiveActionCenterItems([
      {
        campaign: previousCampaign,
        stats: buildStats({ campaign_id: previousCampaign.id, campaign_name: previousCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-previous-detail',
          displayName: 'Manager Operations',
          assignedAt: '2026-03-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: previousCampaign.id,
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-03-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: previousCampaign.id,
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
          case_public_summary: 'De vorige route is afgerond.',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: currentCampaign,
        stats: buildStats({ campaign_id: currentCampaign.id, campaign_name: currentCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-current-detail',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: currentCampaign.id,
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: currentCampaign.id,
          title: 'Middenroute detail',
          triage_status: 'bevestigd',
          management_action_outcome: 'bijstellen',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: nextCampaign,
        stats: buildStats({ campaign_id: nextCampaign.id, campaign_name: nextCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-next-detail',
          displayName: 'Manager Operations',
          assignedAt: '2026-05-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: nextCampaign.id,
          lifecycle_stage: 'first_value_reached',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: nextCampaign.id,
          title: 'Nieuwe vervolgroute detail',
          triage_status: 'bevestigd',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
    ] as Parameters<typeof buildLiveActionCenterItems>[0])

    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: items,
        initialSelectedItemId: currentRouteId,
        initialView: 'actions',
        fallbackOwnerName: 'Loep gebruiker',
        ownerOptions: ['Manager Operations'],
        workbenchHref: '/dashboard',
        itemHrefs: {
          [previousRouteId]: `/dashboard/action-center?focus=${previousRouteId}`,
          [currentRouteId]: `/dashboard/action-center?focus=${currentRouteId}`,
          [nextRouteId]: `/dashboard/action-center?focus=${nextRouteId}`,
        },
        readOnly: true,
      }),
    )

    expect(html).toMatch(
      /<button[^>]*aria-label="Vervolg op eerdere route"[\s\S]*?<span>Vervolg op eerdere route<\/span>[\s\S]*?Exit follow-through voorjaar/,
    )
    expect(html).toMatch(
      /<button[^>]*aria-label="Later opgevolgd"[\s\S]*?<span>Later opgevolgd<\/span>[\s\S]*?Nieuwe vervolgroute detail/,
    )
    expect(html.indexOf('aria-label="Vervolg op eerdere route"')).toBeLessThan(html.indexOf('aria-label="Later opgevolgd"'))
  })

  it('chooses the most recent forward successor when multiple successor rows exist', () => {
    const scopeValue = 'org-1::department::operations'
    const currentCampaign = buildCampaign({
      id: 'campaign-current-forward',
      name: 'Exit april',
      created_at: '2026-04-10T10:00:00.000Z',
    })
    const nextOlderCampaign = buildCampaign({
      id: 'campaign-next-older',
      name: 'Exit mei oud',
      created_at: '2026-05-01T10:00:00.000Z',
    })
    const nextNewerCampaign = buildCampaign({
      id: 'campaign-next-newer',
      name: 'Exit mei nieuw',
      created_at: '2026-05-10T10:00:00.000Z',
    })
    const currentRouteId = buildActionCenterRouteId(currentCampaign.id, scopeValue)
    const olderForwardRouteId = buildActionCenterRouteId(nextOlderCampaign.id, scopeValue)
    const newerForwardRouteId = buildActionCenterRouteId(nextNewerCampaign.id, scopeValue)
    const sharedRelations = [
      {
        id: 'relation-forward-older',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: currentRouteId,
        targetRouteId: olderForwardRouteId,
        triggerReason: 'nieuw-campaign-signaal' as const,
        recordedAt: '2026-05-01T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
      {
        id: 'relation-forward-newer',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: currentRouteId,
        targetRouteId: newerForwardRouteId,
        triggerReason: 'hernieuwde-hr-beoordeling' as const,
        recordedAt: '2026-05-03T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
    ]

    const items = buildLiveActionCenterItems([
      {
        campaign: currentCampaign,
        stats: buildStats({ campaign_id: currentCampaign.id, campaign_name: currentCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-current',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: currentCampaign.id,
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-04-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: currentCampaign.id,
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
          case_public_summary: 'De route is afgerond en later opgevolgd.',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: nextOlderCampaign,
        stats: buildStats({ campaign_id: nextOlderCampaign.id, campaign_name: nextOlderCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-next-older',
          displayName: 'Manager Operations',
          assignedAt: '2026-05-01T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: nextOlderCampaign.id,
          lifecycle_stage: 'first_value_reached',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: nextOlderCampaign.id,
          title: 'Oudere vervolgroute',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: nextNewerCampaign,
        stats: buildStats({ campaign_id: nextNewerCampaign.id, campaign_name: nextNewerCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-next-newer',
          displayName: 'Manager Operations',
          assignedAt: '2026-05-03T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: nextNewerCampaign.id,
          lifecycle_stage: 'first_value_reached',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: nextNewerCampaign.id,
          title: 'Nieuwere vervolgroute',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
    ] as Parameters<typeof buildLiveActionCenterItems>[0])

    const currentItem = items.find((item) => item.id === currentRouteId)

    expect(currentItem?.coreSemantics.lineageSummary).toMatchObject({
      overviewLabel: 'Later opgevolgd',
      backwardLabel: null,
      backwardRouteId: null,
      forwardLabel: 'Later opgevolgd',
      forwardRouteId: newerForwardRouteId,
      detailLabels: ['Later opgevolgd'],
    })
  })

  it('chooses the most recent backward predecessor when multiple predecessor rows exist', () => {
    const scopeValue = 'org-1::department::operations'
    const olderCampaign = buildCampaign({
      id: 'campaign-prev-older',
      name: 'Exit februari',
      created_at: '2026-02-10T10:00:00.000Z',
    })
    const newerCampaign = buildCampaign({
      id: 'campaign-prev-newer',
      name: 'Exit maart',
      created_at: '2026-03-10T10:00:00.000Z',
    })
    const currentCampaign = buildCampaign({
      id: 'campaign-current-backward',
      name: 'Exit april',
      created_at: '2026-04-10T10:00:00.000Z',
    })
    const currentRouteId = buildActionCenterRouteId(currentCampaign.id, scopeValue)
    const olderRouteId = buildActionCenterRouteId(olderCampaign.id, scopeValue)
    const newerRouteId = buildActionCenterRouteId(newerCampaign.id, scopeValue)
    const sharedRelations = [
      {
        id: 'relation-backward-older-live',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: olderRouteId,
        targetRouteId: currentRouteId,
        triggerReason: 'nieuw-campaign-signaal' as const,
        recordedAt: '2026-05-01T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
      {
        id: 'relation-backward-newer-live',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: newerRouteId,
        targetRouteId: currentRouteId,
        triggerReason: 'hernieuwde-hr-beoordeling' as const,
        recordedAt: '2026-05-02T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: null,
      },
    ]

    const items = buildLiveActionCenterItems([
      {
        campaign: olderCampaign,
        stats: buildStats({ campaign_id: olderCampaign.id, campaign_name: olderCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-prev-older',
          displayName: 'Manager Operations',
          assignedAt: '2026-02-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: olderCampaign.id,
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-02-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: olderCampaign.id,
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: newerCampaign,
        stats: buildStats({ campaign_id: newerCampaign.id, campaign_name: newerCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-prev-newer',
          displayName: 'Manager Operations',
          assignedAt: '2026-03-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: newerCampaign.id,
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-03-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: newerCampaign.id,
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
      {
        campaign: currentCampaign,
        stats: buildStats({ campaign_id: currentCampaign.id, campaign_name: currentCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-current-backward',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: currentCampaign.id,
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: currentCampaign.id,
          triage_status: 'bevestigd',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: sharedRelations,
      },
    ] as Parameters<typeof buildLiveActionCenterItems>[0])

    const currentItem = items.find((item) => item.id === currentRouteId)

    expect(currentItem?.coreSemantics.lineageSummary).toMatchObject({
      overviewLabel: 'Vervolg op eerdere route',
      backwardLabel: 'Vervolg op eerdere route',
      backwardRouteId: newerRouteId,
      forwardLabel: null,
      forwardRouteId: null,
      detailLabels: ['Vervolg op eerdere route'],
    })
  })

  it('chooses the most recent reopen event in live lineage summaries', () => {
    const scopeValue = 'org-1::department::operations'
    const currentCampaign = buildCampaign({
      id: 'campaign-current-reopen-live',
      name: 'Exit april',
      created_at: '2026-04-10T10:00:00.000Z',
    })
    const currentRouteId = buildActionCenterRouteId(currentCampaign.id, scopeValue)

    const items = buildLiveActionCenterItems([
      {
        campaign: currentCampaign,
        stats: buildStats({ campaign_id: currentCampaign.id, campaign_name: currentCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-current-reopen',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: currentCampaign.id,
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: currentCampaign.id,
          triage_status: 'bevestigd',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: [],
        routeReopens: [
          buildRouteReopen({
            id: 'reopen-older-live',
            routeId: currentRouteId,
            reopenedAt: '2026-05-01T09:00:00.000Z',
          }),
          buildRouteReopen({
            id: 'reopen-newer-live',
            routeId: currentRouteId,
            reopenedAt: '2026-05-03T12:00:00.000Z',
          }),
        ],
      },
    ] as Parameters<typeof buildLiveActionCenterItems>[0])

    const currentItem = items.find((item) => item.id === currentRouteId)

    expect(currentItem?.coreSemantics.lineageSummary).toMatchObject({
      overviewLabel: 'Heropend traject',
      backwardLabel: 'Heropend traject',
      backwardRouteId: null,
      forwardLabel: null,
      forwardRouteId: null,
      detailLabels: ['Heropend traject'],
    })
  })

  it('ignores ended forward successor relations in live lineage summaries', () => {
    const scopeValue = 'org-1::department::operations'
    const currentCampaign = buildCampaign({
      id: 'campaign-current-ended-forward',
      name: 'Exit april',
      created_at: '2026-04-10T10:00:00.000Z',
    })
    const nextCampaign = buildCampaign({
      id: 'campaign-next-ended-forward',
      name: 'Exit mei',
      created_at: '2026-05-10T10:00:00.000Z',
    })
    const currentRouteId = buildActionCenterRouteId(currentCampaign.id, scopeValue)
    const nextRouteId = buildActionCenterRouteId(nextCampaign.id, scopeValue)
    const endedRelations = [
      {
        id: 'relation-forward-ended',
        routeRelationType: 'follow-up-from' as const,
        sourceRouteId: currentRouteId,
        targetRouteId: nextRouteId,
        triggerReason: 'nieuw-campaign-signaal' as const,
        recordedAt: '2026-05-03T09:00:00.000Z',
        recordedByRole: 'hr_owner',
        endedAt: '2026-05-04T09:00:00.000Z',
      },
    ]

    const items = buildLiveActionCenterItems([
      {
        campaign: currentCampaign,
        stats: buildStats({ campaign_id: currentCampaign.id, campaign_name: currentCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-current',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-10T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: currentCampaign.id,
          lifecycle_stage: 'follow_up_decided',
          first_management_use_confirmed_at: '2026-04-10T08:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: currentCampaign.id,
          triage_status: 'uitgevoerd',
          management_action_outcome: 'afronden',
          case_public_summary: 'De route is afgerond zonder actieve opvolger.',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: endedRelations,
      },
      {
        campaign: nextCampaign,
        stats: buildStats({ campaign_id: nextCampaign.id, campaign_name: nextCampaign.name }),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-next',
          displayName: 'Manager Operations',
          assignedAt: '2026-05-03T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          campaign_id: nextCampaign.id,
          lifecycle_stage: 'first_value_reached',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          campaign_id: nextCampaign.id,
          title: 'Beeindigde vervolgroute',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: endedRelations,
      },
    ] as Parameters<typeof buildLiveActionCenterItems>[0])

    const currentItem = items.find((item) => item.id === currentRouteId)

    expect(currentItem?.coreSemantics.lineageSummary).toEqual({
      overviewLabel: null,
      backwardLabel: null,
      backwardRouteId: null,
      forwardLabel: null,
      forwardRouteId: null,
      detailLabels: [],
    })
  })

  it('clears predecessor linkage fields when a reopen reading wins over follow-up history', () => {
    const scopeValue = 'org-1::department::operations'
    const routeId = buildActionCenterRouteId('campaign-exit', scopeValue)

    const [item] = buildLiveActionCenterItems([
      {
        campaign: buildCampaign(),
        stats: buildStats(),
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue,
        scopeLabel: 'Operations',
        peopleCount: 38,
        assignedManager: {
          userId: 'manager-1',
          displayName: 'Manager Operations',
          assignedAt: '2026-04-21T08:00:00.000Z',
        },
        deliveryRecord: buildDeliveryRecord({
          lifecycle_stage: 'first_management_use',
          first_management_use_confirmed_at: '2026-04-20T09:00:00.000Z',
        }),
        deliveryCheckpoints: [],
        learningDossier: buildDossier({
          management_action_outcome: 'bijstellen',
        }),
        learningCheckpoints: [],
        reviewDecisions: [],
        routeFollowUpRelations: [
          {
            id: 'relation-backward',
            routeRelationType: 'follow-up-from',
            sourceRouteId: 'campaign-older::org-1::department::operations',
            targetRouteId: routeId,
            triggerReason: 'nieuw-campaign-signaal',
            recordedAt: '2026-05-01T10:00:00.000Z',
            recordedByRole: 'hr_owner',
            endedAt: null,
          },
        ],
        routeReopens: [
          buildRouteReopen({
            routeId,
            reopenedAt: '2026-05-03T12:00:00.000Z',
          }),
        ],
      },
    ] as Parameters<typeof buildLiveActionCenterItems>[0])

    expect(item?.coreSemantics.lineageSummary).toMatchObject({
      overviewLabel: 'Heropend traject',
      backwardLabel: 'Heropend traject',
      backwardRouteId: null,
      detailLabels: ['Heropend traject'],
    })
  })
})
