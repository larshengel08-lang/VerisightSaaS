import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  ActionCenterPreview,
  synchronizeActionCenterRouteActionSurface,
} from '@/components/dashboard/action-center-preview'
import { finalizeActionCenterPreviewItem } from '@/lib/action-center-live'
import type { ActionCenterManagerResponse } from '@/lib/pilot-learning'

describe('action center preview route fields', () => {
  it('renders expected effect, review reason, and review outcome in the detail experience', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-1',
      code: 'ACT-1001',
      title: 'Exit follow-through voorjaar',
      summary: 'Vertrekduiding is nu scherp genoeg voor een eerste MT-read.',
      reason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      sourceLabel: 'ExitScan',
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
      status: 'in-uitvoering',
      reviewDate: '2026-05-12',
      expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
      reviewReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
      reviewOutcome: 'bijstellen',
      reviewDateLabel: '12 mei',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'ExitScan - Exit voorjaar',
      signalBody: 'MT kiest een eerste leiderschapsspoor.',
      nextStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
      peopleCount: 38,
      updates: [
        {
          id: 'update-1',
          author: 'HR lead',
          dateLabel: '24 apr',
          note: 'MT kiest een eerste leiderschapsspoor.',
        },
      ],
    })

    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [item],
        initialView: 'actions',
        fallbackOwnerName: 'Loep gebruiker',
        ownerOptions: ['Manager Operations'],
        workbenchHref: '/dashboard',
        readOnly: true,
      }),
    )

    expect(html).toContain('Verwacht effect')
    expect(html).toContain('Binnen twee weken moet het eerste teamgesprek zijn gevoerd.')
    expect(html).toContain('Waarom dit nu speelt')
    expect(html).toContain('Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.')
    expect(html).toContain('Wat is besloten')
    expect(html).toContain('Bijstellen')
  })

  it('surfaces route action cards and editor controls when a manager can continue inside one route', () => {
    const managerResponse: ActionCenterManagerResponse = {
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
      primary_action_expected_effect: 'Zichtbaar maken of feedbackritme lokaal het vertrekbeeld beïnvloedt.',
      primary_action_status: 'active',
      created_by: 'manager-1',
      updated_by: 'manager-1',
      created_at: '2026-04-24T09:00:00.000Z',
      updated_at: '2026-04-24T09:00:00.000Z',
    }

    const item = finalizeActionCenterPreviewItem({
      id: 'route-1',
      code: 'ACT-1001',
      title: 'Exit follow-through voorjaar',
      summary: 'Deze route draagt twee lokale thema-acties met eigen reviewmoment.',
      reason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      sourceLabel: 'ExitScan',
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
      signalLabel: 'ExitScan - Exit voorjaar',
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
          reviewReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
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
            status: null,
            latestReview: null,
          },
          {
            actionId: 'action-2',
            themeKey: 'growth',
            actionText: 'Leg groeigesprekken vast in het volgende teamoverleg.',
            reviewScheduledFor: '2026-05-20',
            expectedEffect: 'Zichtbaar maken of gebrek aan ontwikkelperspectief terugkomt.',
            status: 'in_review',
            latestReview: null,
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

    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [item],
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

    expect(html).toContain('Acties in deze route')
    expect(html).toContain('Plan twee teamgesprekken over leiderschapsfeedback.')
    expect(html).toContain('Leg groeigesprekken vast in het volgende teamoverleg.')
    expect(html).toContain('Leiderschap')
    expect(html).toContain('Groei en perspectief')
    expect(html).toContain('Nog niet reviewbaar')
    expect(html).toContain('Actie toevoegen')
    expect(html).toContain('Review toevoegen')
    expect(html).not.toContain('Thema van deze eerste concrete stap')
    expect(html).not.toContain('Wat is die eerste concrete stap?')
    expect(html).not.toContain('Wat moet deze stap zichtbaar maken?')
  })

  it('keeps route-action creation hidden until a persisted manager response route container exists', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-without-container',
      code: 'ACT-1002',
      title: 'Retention follow-through voorjaar',
      summary: 'Deze route is nog niet als managercontainer vastgelegd.',
      reason: 'Welke bounded vervolgstap vraagt deze route als eerste?',
      sourceLabel: 'Retention',
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
      status: 'te-bespreken',
      reviewDate: '2026-05-12',
      reviewDateLabel: '12 mei',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'Retention - Voorjaar',
      signalBody: 'De manager moet eerst de bounded container vastleggen.',
      nextStep: 'Leg eerst de lichte managerreactie vast.',
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
        routeActionEndpoint: '/api/action-center-route-actions',
        actionReviewEndpoint: '/api/action-center-action-reviews',
        currentUserId: 'manager-1',
        workbenchHref: '/action-center',
      }),
    )

    expect(html).not.toContain('Acties in deze route')
    expect(html).not.toContain('Actie toevoegen')
  })

  it('recomputes route-level summary and closeout readiness when route-action cards change locally', () => {
    const baseItem = finalizeActionCenterPreviewItem({
      id: 'route-summary-sync',
      code: 'ACT-1003',
      title: 'Exit follow-through sync',
      summary: 'Start met een eerste bounded managerstap.',
      reason: 'Welke bounded vervolgstap vraagt deze route als eerste?',
      sourceLabel: 'ExitScan',
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
      status: 'in-uitvoering',
      reviewDate: '2026-05-20',
      reviewDateLabel: '20 mei',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'ExitScan - Sync',
      signalBody: 'De eerste bounded actie loopt.',
      nextStep: 'Plan een compact vervolggesprek.',
      expectedEffect: 'Maak zichtbaar of de eerste actie effect houdt.',
      reviewReason: 'Toets of de follow-through echt kleiner wordt.',
      reviewOutcome: 'bijstellen',
      peopleCount: 38,
      updates: [],
      managerResponse: {
        id: 'response-sync',
        campaign_id: 'campaign-exit',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'operations',
        manager_user_id: 'manager-1',
        response_type: 'schedule',
        response_note: 'We houden de route klein.',
        review_scheduled_for: '2026-05-20',
        primary_action_theme_key: 'leadership',
        primary_action_text: 'Plan een eerste compact teamgesprek.',
        primary_action_expected_effect: 'Maak zichtbaar of het team rustiger reageert.',
        primary_action_status: 'active',
        created_by: 'manager-1',
        updated_by: 'manager-1',
        created_at: '2026-04-24T09:00:00.000Z',
        updated_at: '2026-04-24T09:00:00.000Z',
      },
      coreSemantics: {
        route: {
          campaignId: 'campaign-exit',
          entryStage: 'active',
          routeOpenedAt: '2026-04-20T09:00:00.000Z',
          ownerAssignedAt: '2026-04-21T08:00:00.000Z',
          routeStatus: 'in-uitvoering',
          reviewOutcome: 'bijstellen',
          reviewCompletedAt: '2026-04-24T09:00:00.000Z',
          outcomeRecordedAt: '2026-04-24T09:00:00.000Z',
          outcomeSummary: 'De route loopt nu via een compacte actielaag.',
          intervention: 'Plan een eerste compact teamgesprek.',
          owner: 'Manager Operations',
          expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
          reviewScheduledFor: '2026-05-20',
          reviewReason: 'Toets of de follow-through echt kleiner wordt.',
          blockedBy: null,
        },
        routeSummary: {
          stateLabel: 'In uitvoering',
          overviewSummary: 'Actieve route met 1 expliciete actie in dezelfde follow-through.',
          routeAsk: 'Houd de actielaag klein en zorg dat review per actie leidend blijft voor verdere uitvoering.',
          progressSummary: '1 actie draagt nu de lokale follow-through in deze route.',
        },
        latestDecision: null,
        actionProgress: {
          currentStep: 'Plan een eerste compact teamgesprek.',
          nextStep: 'Toets de eerste reactie over twee weken.',
          expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
        },
        reviewSemantics: {
          reviewReason: 'Welke bounded vervolgstap vraagt deze route als eerste?',
          reviewQuestion: 'Welke bounded vervolgstap vraagt deze route als eerste?',
          reviewOutcomeRaw: 'bijstellen',
          reviewOutcomeVisible: 'bijstellen',
        },
        actionFrame: {
          whyNow: 'Welke bounded vervolgstap vraagt deze route als eerste?',
          firstStep: 'Plan een eerste compact teamgesprek.',
          owner: 'Manager Operations',
          expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
        },
        resultLoop: {
          whatWasTried: 'Plan een eerste compact teamgesprek.',
          whatWeObserved: 'De eerste bounded actie loopt.',
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
        routeActionCards: [],
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

    const updated = synchronizeActionCenterRouteActionSurface(baseItem, [
      {
        actionId: 'action-1',
        themeKey: 'leadership',
        actionText: 'Plan een eerste compact teamgesprek.',
        reviewScheduledFor: '2026-05-01',
        expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
        status: 'in_review',
        latestReview: null,
      },
      {
        actionId: 'action-2',
        themeKey: 'growth',
        actionText: 'Leg een bounded groeigesprek vast.',
        reviewScheduledFor: '2026-05-25',
        expectedEffect: 'Maak zichtbaar of groeiperspectief terugkomt.',
        status: 'afgerond',
        latestReview: null,
      },
    ])

    expect(updated.status).toBe('reviewbaar')
    expect(updated.reviewDate).toBe('2026-05-01')
    expect(updated.summary).toBe('2 acties - 1 reviewbaar')
    expect(updated.coreSemantics.routeSummary.stateLabel).toBe('Reviewbaar')
    expect(updated.coreSemantics.routeCloseout.readyForCloseout).toBe(false)

    const finished = synchronizeActionCenterRouteActionSurface(updated, [
      {
        actionId: 'action-1',
        themeKey: 'leadership',
        actionText: 'Plan een eerste compact teamgesprek.',
        reviewScheduledFor: '2026-05-01',
        expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
        status: 'afgerond',
        latestReview: null,
      },
      {
        actionId: 'action-2',
        themeKey: 'growth',
        actionText: 'Leg een bounded groeigesprek vast.',
        reviewScheduledFor: '2026-05-25',
        expectedEffect: 'Maak zichtbaar of groeiperspectief terugkomt.',
        status: 'gestopt',
        latestReview: null,
      },
    ])

    expect(finished.status).toBe('in-uitvoering')
    expect(finished.coreSemantics.routeCloseout.readyForCloseout).toBe(true)
    expect(finished.coreSemantics.routeSummary.stateLabel).toBe('In uitvoering')
  })
})
