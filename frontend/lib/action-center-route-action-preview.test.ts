import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  ActionCenterPreview,
  resolveManagerResponsePrimaryActionPayload,
} from '@/components/dashboard/action-center-preview'
import { finalizeActionCenterPreviewItem } from '@/lib/action-center-live'
import type { ActionCenterManagerResponse } from '@/lib/pilot-learning'

function buildGovernedManagerResponse(
  overrides: Partial<ActionCenterManagerResponse> = {},
): ActionCenterManagerResponse {
  return {
    id: 'response-1',
    campaign_id: 'campaign-exit',
    org_id: 'org-1',
    route_scope_type: 'department',
    route_scope_value: 'operations',
    manager_user_id: 'manager-1',
    response_type: 'schedule',
    response_note: 'We starten met twee lokale interventies en houden de review per actie klein.',
    review_scheduled_for: '2026-05-12',
    primary_action_theme_key: 'leadership',
    primary_action_text: 'Plan een eerste teamgesprek over feedbackritme.',
    primary_action_expected_effect:
      'Zichtbaar maken of feedbackritme lokaal het vertrekbeeld beinvloedt.',
    primary_action_status: 'active',
    created_by: 'manager-1',
    updated_by: 'manager-1',
    created_at: '2026-04-24T09:00:00.000Z',
    updated_at: '2026-04-24T09:00:00.000Z',
    ...overrides,
  }
}

function buildGovernedRouteItem(managerResponse = buildGovernedManagerResponse()) {
  return finalizeActionCenterPreviewItem({
    id: 'route-1',
    code: 'ACT-1001',
    title: 'Exit follow-through voorjaar',
    summary: 'Deze route draagt twee lokale thema-acties met eigen reviewmoment.',
    reason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
    sourceLabel: 'Loep Vertrek',
    orgId: 'org-1',
    scopeType: 'department',
    teamId: 'operations',
    teamLabel: 'Operations',
    ownerId: 'manager-1',
    ownerName: 'Manager Operations',
    ownerRole: 'Manager - Operations',
    ownerSubtitle: 'Operations',
    reviewOwnerName: 'HR lead',
    priority: 'hoog',
    status: 'reviewbaar',
    reviewDate: '2026-05-12',
    expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
    reviewReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
    reviewOutcome: 'bijstellen',
    reviewDateLabel: '12 mei',
    reviewRhythm: 'Maandelijks',
    signalLabel: 'Loep Vertrek - Exit voorjaar',
    signalBody: 'MT kiest twee lokale interventies binnen dezelfde afdelingsroute.',
    nextStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
    peopleCount: 38,
    managerResponse,
    updates: [],
    coreSemantics: {
      route: {
        campaignId: 'campaign-exit',
        entryStage: 'active',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
        ownerAssignedAt: '2026-04-21T08:00:00.000Z',
        routeStatus: 'reviewbaar',
        reviewOutcome: 'bijstellen',
        reviewCompletedAt: '2026-04-24T09:00:00.000Z',
        outcomeRecordedAt: '2026-04-24T09:00:00.000Z',
        outcomeSummary: 'Twee lokale sporen lopen nu naast elkaar.',
        intervention: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
        owner: 'Manager Operations',
        expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
        reviewScheduledFor: '2026-05-12',
        reviewReason:
          'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
        blockedBy: null,
      },
      latestDecision: null,
      actionProgress: {
        currentStep: 'Plan een gerichte teamreview met de manager.',
        nextStep: 'Plan een vervolggesprek met HR.',
        expectedEffect: 'Zichtbaar maken of feedbackafspraken consistenter terugkomen.',
      },
      reviewSemantics: {
        reviewReason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        reviewQuestion: 'Welke interventie moet als eerste lokaal zichtbaar worden?',
        reviewOutcomeRaw: 'bijstellen',
        reviewOutcomeVisible: 'bijstellen',
      },
      actionFrame: {
        whyNow: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
        firstStep: 'Plan een gerichte teamreview met de manager.',
        owner: 'Manager Operations',
        expectedEffect: 'Zichtbaar maken of feedbackafspraken consistenter terugkomen.',
      },
      resultLoop: {
        whatWasTried: 'Plan een gerichte teamreview met de manager.',
        whatWeObserved: 'MT kiest twee lokale interventies binnen dezelfde afdelingsroute.',
        whatWasDecided: null,
      },
      resultProgression: [],
      decisionHistory: [],
      lineageSummary: {
        overviewLabel: null,
        backwardLabel: null,
        backwardRouteId: null,
        forwardLabel: null,
        forwardRouteId: null,
        detailLabels: [],
      },
      routeActionCards: [
        {
          actionId: 'action-1',
          themeKey: 'leadership',
          actionText: 'Plan twee teamgesprekken over leiderschapsfeedback.',
          reviewScheduledFor: '2026-05-15',
          expectedEffect: 'Zichtbaar maken of leiderschapsfrictie de hoofdreden is.',
          status: 'open',
          latestReview: null,
        },
        {
          actionId: 'action-2',
          themeKey: 'growth',
          actionText: 'Leg groeigesprekken vast in het volgende teamoverleg.',
          reviewScheduledFor: '2026-05-20',
          expectedEffect: 'Zichtbaar maken of gebrek aan ontwikkelperspectief terugkomt.',
          status: 'in_review',
          latestReview: {
            reviewedAt: '2026-05-18T09:00:00.000Z',
            observation: 'Het team noemt groei explicieter dan in de vorige ronde.',
            actionOutcome: 'effect-zichtbaar',
            followUpNote: 'Nog een week monitoren en dan afronden.',
          },
        },
      ],
      routeCloseout: {
        closeoutStatus: null,
        closeoutReason: null,
        closeoutNote: null,
        closedAt: null,
        closedByRole: null,
        readyForCloseout: false,
      },
      closingSemantics: {
        status: 'lopend',
        summary: null,
        historicalSummary: null,
      },
    },
  })
}

describe('action center route action preview', () => {
  it('clears hidden inline primary-action truth once route-action mode governs the route', () => {
    expect(
      resolveManagerResponsePrimaryActionPayload({
        routeActionCardCount: 2,
        includePrimaryAction: true,
        primaryActionThemeKey: 'leadership',
        primaryActionText: 'Plan een eerste teamgesprek over feedbackritme.',
        primaryActionExpectedEffect:
          'Zichtbaar maken of feedbackritme lokaal het vertrekbeeld beinvloedt.',
      }),
    ).toEqual({
      primary_action_theme_key: null,
      primary_action_text: null,
      primary_action_expected_effect: null,
      primary_action_status: null,
    })
  })

  it('keeps richer action routes semantically distinct without reopening inline primary-action editing', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [buildGovernedRouteItem()],
        initialView: 'actions',
        fallbackOwnerName: 'Loep gebruiker',
        ownerOptions: ['Manager Operations'],
        canRespondToRequests: true,
        managerResponseEndpoint: '/api/action-center-manager-responses',
        routeActionEndpoint: '/api/action-center-route-actions',
        actionReviewEndpoint: '/api/action-center-action-reviews',
        currentUserId: 'manager-1',
        workbenchHref: '/action-center',
      }),
    )

    expect(html).toContain('Actieroute is gestart')
    expect(html).toContain('Deze route draagt nu 2 expliciete actiekaarten.')
    expect(html).toContain('Concrete acties voeg je hieronder toe in deze route.')
    expect(html).toContain('Plan een eerste teamgesprek over feedbackritme.')
    expect(html).toContain('Managerstap bijwerken')
    expect(html).not.toContain('Thema van deze eerste concrete stap')
    expect(html).not.toContain('Wat is die eerste concrete stap?')
    expect(html).not.toContain('Wat moet deze stap zichtbaar maken?')
  })

  it('does not reopen inline primary-action editing when action cards exist but the route-action endpoint is unavailable', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [buildGovernedRouteItem(buildGovernedManagerResponse({
          primary_action_text: 'Historische eerste stap die niet meer de leidende waarheid is.',
          primary_action_expected_effect: 'Historisch zichtbaar effect.',
        }))],
        initialView: 'actions',
        fallbackOwnerName: 'Loep gebruiker',
        ownerOptions: ['Manager Operations'],
        canRespondToRequests: true,
        managerResponseEndpoint: '/api/action-center-manager-responses',
        currentUserId: 'manager-1',
        workbenchHref: '/action-center',
      }),
    )

    expect(html).toContain('Acties in deze route')
    expect(html).toContain('Concrete acties voeg je hieronder toe in deze route.')
    expect(html).not.toContain('Thema van deze eerste concrete stap')
    expect(html).not.toContain('Wat is die eerste concrete stap?')
    expect(html).not.toContain('Wat moet deze stap zichtbaar maken?')
  })

  it('keeps the first manager move visibly small before a route grows into explicit actions', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-open-request',
      code: 'ACT-1002',
      title: 'Nieuwe route voor Operations',
      summary: 'De route wacht op de eerste lokale managerstap.',
      reason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      sourceLabel: 'Loep Vertrek',
      orgId: 'org-1',
      scopeType: 'department',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Manager Operations',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'HR lead',
      priority: 'hoog',
      status: 'open-verzoek',
      reviewDate: null,
      expectedEffect: null,
      reviewReason: null,
      reviewOutcome: 'geen-uitkomst',
      reviewDateLabel: 'Nog niet gepland',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'Loep Vertrek - Operations',
      signalBody: 'HR heeft de route geopend na een nieuwe scanread.',
      nextStep: null,
      peopleCount: 38,
      updates: [],
    })

    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [item],
        initialView: 'actions',
        fallbackOwnerName: 'Loep gebruiker',
        ownerOptions: ['Manager Operations'],
        canRespondToRequests: true,
        managerResponseEndpoint: '/api/action-center-manager-responses',
        currentUserId: 'manager-1',
        workbenchHref: '/action-center',
      }),
    )

    expect(html).toContain('Eerste managerstap')
    expect(html).toContain('Hoe pak je deze route als eerste op?')
    expect(html).toContain('Wat leg je nu klein en reviewbaar vast?')
    expect(html).toContain('Wanneer toetsen we deze eerste stap?')
    expect(html).toContain('Leg alleen als dit meteen helpt')
    expect(html).toContain('Eerste managerstap opslaan')
  })
})
