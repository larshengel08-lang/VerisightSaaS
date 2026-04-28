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
        closingSemantics: {
          status: 'lopend',
          summary: null,
        },
      },
    } satisfies ActionCenterPreviewItem

    expect(buildCompactLandingSummaryLines(item)).toEqual([
      { label: 'Uitkomst', value: 'Bijstellen' },
      { label: 'Stap', value: 'Leg eigenaar en eerste correctie in het MT-overleg vast.' },
    ])
  })
})
