import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActionCenterPreview } from '@/components/dashboard/action-center-preview'
import { finalizeActionCenterPreviewItem } from '@/lib/action-center-live'
import type { ActionCenterManagerResponse } from '@/lib/pilot-learning'

describe('action center route action preview', () => {
  it('keeps richer action routes semantically distinct even while the manager surface starts from one first step', () => {
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
        fallbackOwnerName: 'Verisight gebruiker',
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
    expect(html).toContain('Thema van deze eerste concrete stap')
    expect(html).toContain('Gebruik dit alleen zolang één eerste concrete stap genoeg is.')
    expect(html).toContain('Plan een eerste teamgesprek over feedbackritme.')
    expect(html).toContain('Zichtbaar maken of feedbackritme lokaal het vertrekbeeld beïnvloedt.')
    expect(html).toContain('Managerstap bijwerken')
  })

  it('keeps the first manager move visibly small before a route grows into explicit actions', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-open-request',
      code: 'ACT-1002',
      title: 'Nieuwe route voor Operations',
      summary: 'De route wacht op de eerste lokale managerstap.',
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
      status: 'open-verzoek',
      reviewDate: null,
      expectedEffect: null,
      reviewReason: null,
      reviewOutcome: 'geen-uitkomst',
      reviewDateLabel: 'Nog niet gepland',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'HR heeft de route geopend na een nieuwe scanread.',
      nextStep: null,
      peopleCount: 38,
      updates: [],
    })

    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [item],
        initialView: 'actions',
        fallbackOwnerName: 'Verisight gebruiker',
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
    expect(html).toContain('Leg alleen als dit meteen helpt één eerste concrete stap vast.')
    expect(html).toContain('Eerste managerstap opslaan')
  })
})
