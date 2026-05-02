import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActionCenterPreview, buildCompactLandingSummaryLines } from '@/components/dashboard/action-center-preview'
import { finalizeActionCenterPreviewItem } from '@/lib/action-center-live'

describe('action center preview route fields render', () => {
  it('renders decision-first review meaning and action progression in the detail experience', () => {
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
          outcomeSummary: 'De eerste review liet zien dat dezelfde frictie in twee teams terugkomt.',
          intervention: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          owner: 'Manager Operations',
          expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
          reviewScheduledFor: '2026-05-12',
          reviewReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
          blockedBy: null,
        },
        latestDecision: {
          decisionEntryId: 'decision-1',
          sourceRouteId: 'campaign-exit',
          decision: 'bijstellen',
          decisionReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
          nextCheck: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
          decisionRecordedAt: '2026-04-24T09:00:00.000Z',
          reviewCompletedAt: '2026-04-24T09:00:00.000Z',
        },
        actionProgress: {
          currentStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          nextStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
        },
        reviewSemantics: {
          reviewReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
          reviewQuestion: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
          reviewOutcomeRaw: 'bijstellen',
          reviewOutcomeVisible: 'bijstellen',
        },
        actionFrame: {
          whyNow: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
          firstStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          owner: 'Manager Operations',
          expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
        },
        resultLoop: {
          whatWasTried: 'MT kiest een eerste leiderschapsspoor.',
          whatWeObserved: 'MT kiest een eerste leiderschapsspoor.',
          whatWasDecided: 'Bijstellen',
        },
        resultProgression: [
          {
            resultEntryId: 'decision-0',
            recordedAt: '2026-04-21T09:00:00.000Z',
            currentStep: 'Plan een eerste teamgesprek met de manager.',
            observation: 'De eerste signalen bleven breed verdeeld.',
            decision: 'doorgaan',
            followThrough: 'Bevestig de route in het MT-overleg.',
          },
          {
            resultEntryId: 'decision-1',
            recordedAt: '2026-04-24T09:00:00.000Z',
            currentStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
            observation: 'MT kiest een eerste leiderschapsspoor.',
            decision: 'bijstellen',
            followThrough: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
          },
        ],
        decisionHistory: [
          {
            decisionEntryId: 'decision-1',
            sourceRouteId: 'campaign-exit',
            decision: 'bijstellen',
            decisionReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
            nextCheck: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
            decisionRecordedAt: '2026-04-24T09:00:00.000Z',
            reviewCompletedAt: '2026-04-24T09:00:00.000Z',
          },
        ],
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
        workbenchHref: '/dashboard',
        readOnly: true,
      }),
    )

    expect(html).toContain('Laatste beslissing')
    expect(html).toContain('Bijstellen')
    expect(html).toContain('Waarom dit besluit')
    expect(html).toContain('Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.')
    expect(html).toContain('Volgende toets')
    expect(html).toContain('Binnen twee weken moet het eerste teamgesprek zijn gevoerd.')
    expect(html).toContain('Huidige stap')
    expect(html).toContain('Leg eigenaar en eerste correctie in het MT-overleg vast.')
    expect(html).toContain('Hierna')
    expect(html).toContain('Verwacht effect')
    expect(html).toContain('Resultaat over tijd')
    expect(html).toContain('Plan een eerste teamgesprek met de manager.')
    expect(html).toContain('MT kiest een eerste leiderschapsspoor.')
  })

  it('builds compact landing summary lines from latest decision and current step', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-1',
      code: 'ACT-1001',
      title: 'Werkdruk blijft hoog in Operations',
      summary: 'De route vraagt een nieuwe lokale stap.',
      reason: 'Werkdruk bleef zichtbaar na de eerste interventie.',
      sourceLabel: 'ExitScan',
      orgId: 'org-1',
      scopeType: 'department',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Sanne de Vries',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'Sanne de Vries',
      priority: 'hoog',
      status: 'in-uitvoering',
      reviewDate: '2026-05-02',
      expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
      reviewReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
      reviewOutcome: 'bijstellen',
      reviewDateLabel: '2 mei',
      reviewRhythm: 'Wekelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'Werkdruk bleef zichtbaar in hetzelfde team.',
      nextStep: 'Herplan de teamreview voor volgende week.',
      peopleCount: 14,
      updates: [],
      coreSemantics: {
        route: {} as never,
        reviewSemantics: {} as never,
        latestDecision: {
          decisionEntryId: 'decision-1',
          sourceRouteId: 'route-1',
          decision: 'bijstellen',
          decisionReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
          nextCheck: 'Toets over een week of de teamdruk zichtbaar daalt.',
          decisionRecordedAt: '2026-04-25T10:00:00.000Z',
          reviewCompletedAt: '2026-04-25T09:30:00.000Z',
        },
        actionProgress: {
          currentStep: 'Plan een gerichte teamreview met de manager.',
          nextStep: 'Herplan de teamreview voor volgende week.',
          expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
        },
        actionFrame: {
          whyNow: 'Werkdruk bleef zichtbaar na de eerste interventie.',
          firstStep: 'Plan een gerichte teamreview met de manager.',
          owner: 'Sanne de Vries',
          expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
        },
        resultLoop: {
          whatWasTried: 'Plan een gerichte teamreview met de manager.',
          whatWeObserved: 'Werkdruk bleef zichtbaar in hetzelfde team.',
          whatWasDecided: 'Bijstellen',
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
        closingSemantics: {
          status: 'lopend',
          summary: null,
          historicalSummary: null,
        },
      },
    })

    expect(buildCompactLandingSummaryLines(item)).toEqual([
      { label: 'Route', value: 'In uitvoering' },
      { label: 'Lezing', value: 'De route vraagt een nieuwe lokale stap.' },
    ])
  })

  it('renders a compact bestuurlijke readback block on the overview surface', () => {
    const activeItem = finalizeActionCenterPreviewItem({
      id: 'route-readback-open',
      code: 'ACT-3001',
      title: 'Operations vraagt een nieuwe stap',
      summary: 'De route vraagt een nieuwe lokale stap.',
      reason: 'Werkdruk bleef zichtbaar na de eerste interventie.',
      sourceLabel: 'ExitScan',
      orgId: 'org-1',
      scopeType: 'department',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Sanne de Vries',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'Sanne de Vries',
      priority: 'hoog',
      status: 'in-uitvoering',
      reviewDate: '2026-05-12',
      expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
      reviewReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
      reviewOutcome: 'bijstellen',
      reviewDateLabel: '12 mei',
      reviewRhythm: 'Wekelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'Werkdruk bleef zichtbaar in hetzelfde team.',
      nextStep: 'Herplan de teamreview voor volgende week.',
      peopleCount: 14,
      updates: [],
      coreSemantics: {
        route: {} as never,
        routeSummary: {
          stateLabel: 'In uitvoering',
          overviewSummary: 'De route vraagt een nieuwe lokale stap.',
          routeAsk: 'Bepaal welke vervolgstap nu verder helpt.',
          progressSummary: 'Er loopt nu actieve follow-through in deze route.',
        },
        reviewSemantics: {} as never,
        latestDecision: {
          decisionEntryId: 'decision-1',
          sourceRouteId: 'route-readback-open',
          decision: 'bijstellen',
          decisionReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
          nextCheck: 'Toets over een week of de teamdruk zichtbaar daalt.',
          decisionRecordedAt: '2026-04-25T10:00:00.000Z',
          reviewCompletedAt: '2026-04-25T09:30:00.000Z',
        },
        actionProgress: {
          currentStep: 'Plan een gerichte teamreview met de manager.',
          nextStep: 'Herplan de teamreview voor volgende week.',
          expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
        },
        actionFrame: {
          whyNow: 'Werkdruk bleef zichtbaar na de eerste interventie.',
          firstStep: 'Plan een gerichte teamreview met de manager.',
          owner: 'Sanne de Vries',
          expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
        },
        resultLoop: {} as never,
        resultProgression: [],
        decisionHistory: [
          {
            decisionEntryId: 'decision-1',
            sourceRouteId: 'route-readback-open',
            decision: 'bijstellen',
            decisionReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
            nextCheck: 'Toets over een week of de teamdruk zichtbaar daalt.',
            decisionRecordedAt: '2026-04-25T10:00:00.000Z',
            reviewCompletedAt: '2026-04-25T09:30:00.000Z',
          },
        ],
        routeActionCards: [],
        lineageSummary: {
          overviewLabel: null,
          backwardLabel: null,
          backwardRouteId: null,
          forwardLabel: null,
          forwardRouteId: null,
          detailLabels: [],
        },
        followUpSemantics: {
          isDirectSuccessor: false,
          lineageLabel: null,
          triggerReason: null,
          triggerReasonLabel: null,
          sourceRouteId: null,
        },
        closingSemantics: {
          status: 'lopend',
          summary: null,
          historicalSummary: null,
        },
      },
    })

    const historicalItem = finalizeActionCenterPreviewItem({
      id: 'route-readback-closed',
      code: 'ACT-3002',
      title: 'Eerdere route sloot en kreeg vervolg',
      summary: 'Deze route sloot historisch en kreeg later een opvolger.',
      reason: 'De eerdere interventie hoeft niet opnieuw geopend te worden.',
      sourceLabel: 'Pulse',
      orgId: 'org-1',
      scopeType: 'department',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerId: 'manager-2',
      ownerName: 'Manager Operations',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'HR lead',
      priority: 'midden',
      status: 'afgerond',
      reviewDate: '2026-05-30',
      expectedEffect: 'Historische route blijft alleen nog bestuurlijke context.',
      reviewReason: 'Gebruik de oude route alleen nog als context.',
      reviewOutcome: 'afronden',
      reviewDateLabel: '30 mei',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'Pulse - Operations',
      signalBody: 'Een nieuwe opvolger nam het traject over.',
      nextStep: 'Lees alleen nog terug wat eerder is besloten.',
      peopleCount: 14,
      updates: [],
      coreSemantics: {
        route: {} as never,
        routeSummary: {
          stateLabel: 'Afgerond',
          overviewSummary: 'Historische route die later een directe opvolger kreeg.',
          routeAsk: 'Lees deze route alleen nog als historische context.',
          progressSummary: 'Er loopt geen actieve follow-through meer in deze route.',
        },
        reviewSemantics: {} as never,
        latestDecision: null,
        actionProgress: {
          currentStep: null,
          nextStep: null,
          expectedEffect: null,
        },
        actionFrame: {
          whyNow: 'Gebruik de oude route alleen nog als context.',
          firstStep: 'Lees alleen nog terug wat eerder is besloten.',
          owner: 'Manager Operations',
          expectedEffect: 'Historische route blijft alleen nog bestuurlijke context.',
        },
        resultLoop: {} as never,
        resultProgression: [],
        decisionHistory: [],
        routeActionCards: [],
        lineageSummary: {
          overviewLabel: 'Later opgevolgd',
          backwardLabel: null,
          backwardRouteId: null,
          forwardLabel: 'Later opgevolgd',
          forwardRouteId: 'route-readback-next',
          detailLabels: ['Later opgevolgd'],
        },
        followUpSemantics: {
          isDirectSuccessor: false,
          lineageLabel: null,
          triggerReason: null,
          triggerReasonLabel: null,
          sourceRouteId: null,
        },
        closingSemantics: {
          status: 'afgesloten',
          summary: 'Historische route die later een directe opvolger kreeg.',
          historicalSummary: 'Gebruik deze route alleen nog als context.',
        },
      },
    })

    const html = renderToStaticMarkup(
      React.createElement(ActionCenterPreview, {
        initialItems: [activeItem, historicalItem],
        fallbackOwnerName: 'Verisight gebruiker',
        ownerOptions: ['Sanne de Vries', 'Manager Operations'],
        workbenchHref: '/dashboard',
        readOnly: true,
      }),
    )

    expect(html).toContain('Bestuurlijke teruglezing')
    expect(html).toContain('Routebeeld')
    expect(html).toContain('1 open route en 1 gesloten route van 2 zichtbare routes.')
    expect(html).toContain('Besluitspoor')
    expect(html).toContain('1 route met expliciet besluitspoor in de huidige selectie.')
    expect(html).toContain('Vervolg over tijd')
    expect(html).toContain('0 heropende routes en 1 route met vervolgcontext zichtbaar.')
    expect(html).toContain('Reviewdruk')
    expect(html).toContain('2 routes met review in beeld, eerstvolgend 12 mei.')
  })

  it('hides next-check and next-step detail blocks for closing decisions', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-2',
      code: 'ACT-1002',
      title: 'Exit follow-through sluit af',
      summary: 'De route kan inhoudelijk sluiten.',
      reason: 'Het effect bleef zichtbaar na de laatste check.',
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
      priority: 'laag',
      status: 'afgerond',
      reviewDate: null,
      expectedEffect: 'Borging is bevestigd.',
      reviewReason: 'Het effect bleef zichtbaar na de laatste check.',
      reviewOutcome: 'afronden',
      reviewDateLabel: 'Nog niet gepland',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'ExitScan - Exit voorjaar',
      signalBody: 'De lokale correctie hield zichtbaar stand.',
      nextStep: 'Nog niet van toepassing',
      peopleCount: 38,
      updates: [],
      coreSemantics: {
        route: {
          campaignId: 'campaign-exit',
          entryStage: 'active',
          routeOpenedAt: '2026-04-20T09:00:00.000Z',
          ownerAssignedAt: '2026-04-21T08:00:00.000Z',
          routeStatus: 'afgerond',
          reviewOutcome: 'afronden',
          reviewCompletedAt: '2026-04-28T09:00:00.000Z',
          outcomeRecordedAt: '2026-04-28T09:00:00.000Z',
          outcomeSummary: 'De lokale correctie hield zichtbaar stand.',
          intervention: 'Rond de route af en borg de les.',
          owner: 'Manager Operations',
          expectedEffect: 'Borging is bevestigd.',
          reviewScheduledFor: null,
          reviewReason: 'Het effect bleef zichtbaar na de laatste check.',
          blockedBy: null,
        },
        latestDecision: {
          decisionEntryId: 'decision-2',
          sourceRouteId: 'campaign-exit',
          decision: 'afronden',
          decisionReason: 'Het effect bleef zichtbaar na de laatste check.',
          nextCheck: null,
          decisionRecordedAt: '2026-04-28T09:00:00.000Z',
          reviewCompletedAt: '2026-04-28T09:00:00.000Z',
        },
        actionProgress: {
          currentStep: 'Rond de route af en borg de les.',
          nextStep: null,
          expectedEffect: 'Borging is bevestigd.',
        },
        reviewSemantics: {
          reviewReason: 'Het effect bleef zichtbaar na de laatste check.',
          reviewQuestion: 'Welke uitkomst van deze route verdient nu de eerste review?',
          reviewOutcomeRaw: 'afronden',
          reviewOutcomeVisible: 'afronden',
        },
        actionFrame: {
          whyNow: 'Het effect bleef zichtbaar na de laatste check.',
          firstStep: 'Rond de route af en borg de les.',
          owner: 'Manager Operations',
          expectedEffect: 'Borging is bevestigd.',
        },
        resultLoop: {
          whatWasTried: 'Rond de route af en borg de les.',
          whatWeObserved: 'De lokale correctie hield zichtbaar stand.',
          whatWasDecided: 'Afronden',
        },
        resultProgression: [
          {
            resultEntryId: 'decision-2',
            recordedAt: '2026-04-28T09:00:00.000Z',
            currentStep: 'Rond de route af en borg de les.',
            observation: 'De lokale correctie hield zichtbaar stand.',
            decision: 'afronden',
            followThrough: null,
          },
        ],
        decisionHistory: [
          {
            decisionEntryId: 'decision-2',
            sourceRouteId: 'campaign-exit',
            decision: 'afronden',
            decisionReason: 'Het effect bleef zichtbaar na de laatste check.',
            nextCheck: null,
            decisionRecordedAt: '2026-04-28T09:00:00.000Z',
            reviewCompletedAt: '2026-04-28T09:00:00.000Z',
          },
        ],
        lineageSummary: {
          overviewLabel: null,
          backwardLabel: null,
          backwardRouteId: null,
          forwardLabel: null,
          forwardRouteId: null,
          detailLabels: [],
        },
        closingSemantics: {
          status: 'afgerond',
          summary: 'De lokale correctie hield zichtbaar stand.',
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
        workbenchHref: '/dashboard',
        readOnly: true,
      }),
    )

    expect(html).toContain('Laatste beslissing')
    expect(html).toContain('Afronden')
    expect(html).not.toContain('Volgende toets')
    expect(html).not.toContain('Hierna')
  })
})
