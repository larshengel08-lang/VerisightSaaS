import { describe, expect, it } from 'vitest'
import {
  buildCompactLandingSummaryLines,
  getOwnerDisplayName,
  getReviewOwnerDisplayName,
  getTeamManagerDisplayName,
} from '@/components/dashboard/action-center-preview'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

describe('action center preview display helpers', () => {
  it('keeps unassigned canonical owners visibly unassigned while preserving review context labels', () => {
    expect(getOwnerDisplayName(null)).toBe('Nog niet toegewezen')
    expect(getTeamManagerDisplayName(null)).toBe('Nog niet toegewezen')
    expect(getReviewOwnerDisplayName('HR lead')).toBe('HR lead')
    expect(getReviewOwnerDisplayName(null)).toBe('Nog niet toegewezen')
  })

  it('guarantees a compact visible review outcome signal in the landing summary', () => {
    const item = {
      id: 'route-1',
      code: 'ACT-1001',
      title: 'Exit follow-through voorjaar',
      summary: 'Vertrekduiding is nu scherp genoeg voor een eerste MT-read.',
      reason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
      sourceLabel: 'ExitScan',
      teamId: 'operations',
      teamLabel: 'Operations',
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
      openSignals: [],
      updates: [],
      coreSemantics: {
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
          intervention: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          owner: 'Manager Operations',
          expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
          reviewScheduledFor: '2026-05-12',
          reviewReason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
          blockedBy: null,
        },
        latestDecision: {
          decisionEntryId: 'decision-1',
          sourceRouteId: 'campaign-exit',
          decision: 'bijstellen',
          decisionReason: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
          nextCheck: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
          decisionRecordedAt: '2026-04-22T09:00:00.000Z',
          reviewCompletedAt: '2026-04-22T09:00:00.000Z',
        },
        actionProgress: {
          currentStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          nextStep: 'Plan het vervolggesprek met HR en operations.',
          expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
        },
        reviewSemantics: {
          reviewReason: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
          reviewQuestion: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
          reviewOutcomeRaw: 'bijstellen',
          reviewOutcomeVisible: 'bijstellen',
        },
        actionFrame: {
          whyNow: 'Welke vertrekduiding vraagt nu als eerste managementeigenaarschap?',
          firstStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          owner: 'Manager Operations',
          expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
        },
        resultLoop: {
          whatWasTried: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
          whatWeObserved: 'MT kiest een eerste leiderschapsspoor.',
          whatWasDecided: null,
        },
        resultProgression: [
          {
            resultEntryId: 'decision-1',
            recordedAt: '2026-04-22T09:00:00.000Z',
            currentStep: 'Leg eigenaar en eerste correctie in het MT-overleg vast.',
            observation: 'MT kiest een eerste leiderschapsspoor.',
            decision: 'bijstellen',
            followThrough: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
          },
        ],
        decisionHistory: [
          {
            decisionEntryId: 'decision-1',
            sourceRouteId: 'campaign-exit',
            decision: 'bijstellen',
            decisionReason: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
            nextCheck: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
            decisionRecordedAt: '2026-04-22T09:00:00.000Z',
            reviewCompletedAt: '2026-04-22T09:00:00.000Z',
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
    } satisfies ActionCenterPreviewItem

    expect(buildCompactLandingSummaryLines(item)).toEqual([
      { label: 'Besluit', value: 'Bijstellen' },
      { label: 'Stap', value: 'Leg eigenaar en eerste correctie in het MT-overleg vast.' },
    ])
  })

  it('keeps historical routes readable even when they no longer expose a current step or decision', () => {
    const item = {
      id: 'route-closed',
      code: 'ACT-1002',
      title: 'Historische route',
      summary: 'Deze route is bestuurlijk afgesloten.',
      reason: 'Het effect bleef zichtbaar.',
      sourceLabel: 'ExitScan',
      teamId: 'operations',
      teamLabel: 'Operations',
      ownerName: 'Manager Operations',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'HR lead',
      priority: 'laag',
      status: 'afgerond',
      reviewDate: null,
      expectedEffect: null,
      reviewReason: null,
      reviewOutcome: 'afronden',
      reviewDateLabel: 'Nog niet gepland',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'ExitScan - Exit voorjaar',
      signalBody: 'De lokale correctie hield zichtbaar stand.',
      nextStep: 'Nog niet van toepassing',
      peopleCount: 38,
      openSignals: [],
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
          intervention: null,
          owner: 'Manager Operations',
          expectedEffect: null,
          reviewScheduledFor: null,
          reviewReason: null,
          blockedBy: null,
        },
        latestDecision: null,
        actionProgress: {
          currentStep: null,
          nextStep: null,
          expectedEffect: null,
        },
        reviewSemantics: {
          reviewReason: null,
          reviewQuestion: null,
          reviewOutcomeRaw: 'afronden',
          reviewOutcomeVisible: 'afronden',
        },
        actionFrame: {
          whyNow: 'Het effect bleef zichtbaar.',
          firstStep: null,
          owner: 'Manager Operations',
          expectedEffect: null,
        },
        resultLoop: {
          whatWasTried: null,
          whatWeObserved: null,
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
        closingSemantics: {
          status: 'afgerond',
          summary: 'Afgerond voor nu',
          historicalSummary: 'Deze route is bestuurlijk afgesloten.',
        },
      },
    } satisfies ActionCenterPreviewItem

    expect(buildCompactLandingSummaryLines(item)).toEqual([{ label: 'Stand', value: 'Afgerond voor nu' }])
  })
})
