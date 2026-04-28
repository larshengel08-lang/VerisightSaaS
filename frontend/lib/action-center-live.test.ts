import { describe, expect, it } from 'vitest'
import {
  buildActionCenterTelemetryEvents,
  buildLiveActionCenterItems,
  finalizeActionCenterPreviewItem,
  isLiveActionCenterScanType,
} from './action-center-live'
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
    expect(items[0]?.openSignals).toEqual(['owner_missing'])
    expect(items.find((item) => item.id === 'campaign-pulse')).toBeUndefined()
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
    expect(item.reason).toBe(item.coreSemantics.reviewSemantics.reviewReason)
    expect(item.nextStep).toBe(item.coreSemantics.actionFrame.firstStep)
    expect(item.openSignals).toEqual(['owner_missing', 'review_due'])
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
    expect(recomputed.coreSemantics.resultLoop.whatWasTried).toBe(
      'Update: eigenaar bevestigd en review opnieuw ingepland.',
    )
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
          operator_owner: 'Verisight delivery',
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
      operator_owner: 'Verisight delivery',
      next_step: 'Plan follow-up.',
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
})
