import { describe, expect, it } from 'vitest'
import { buildActionCenterGovernanceQueue } from './action-center-governance-queues'
import type { ActionCenterPreviewItem } from './action-center-preview-model'

function buildActionReview(overrides: Record<string, unknown> = {}) {
  return {
    actionReviewId: 'review-1',
    actionId: 'action-1',
    reviewedAt: '2026-05-18T09:00:00.000Z',
    observation: 'Nog geen zichtbaar effect.',
    actionOutcome: 'nog-te-vroeg',
    evidenceSource: 'manager-observation',
    confidenceLevel: 'medium',
    followUpNote: null,
    ...overrides,
  }
}

function buildRouteActionCard(overrides: Record<string, unknown> = {}) {
  return {
    actionId: 'action-1',
    themeKey: 'leadership',
    actionText: 'Plan een bounded teamcheck.',
    reviewScheduledFor: '2026-05-28',
    expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
    status: 'open',
    latestReview: null,
    semanticState: 'active',
    validationDisposition: null,
    ...overrides,
  }
}

function buildGovernanceItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'route-retention-1',
    code: 'ACT-2001',
    title: 'Retention follow-through',
    summary: 'Bounded retention route',
    reason: 'Welke bounded vervolgstap vraagt deze route nu?',
    sourceLabel: 'RetentieScan',
    teamId: 'support',
    teamLabel: 'Support',
    ownerId: 'manager-1',
    ownerName: 'Manager Support',
    ownerRole: 'Manager',
    ownerSubtitle: 'Support',
    reviewOwnerName: 'HR lead',
    priority: 'hoog',
    status: 'reviewbaar',
    reviewDate: '2026-05-10',
    expectedEffect: 'Maak zichtbaar of de correctie effect houdt.',
    reviewReason: 'Toets of de bounded correctie echt werkt.',
    reviewOutcome: 'bijstellen',
    reviewDateLabel: '10 mei',
    reviewRhythm: 'Maandelijks',
    signalLabel: 'RetentieScan - Support',
    signalBody: 'De route blijft binnen retention governance.',
    nextStep: 'Plan het volgende reviewmoment.',
    peopleCount: 22,
    openSignals: [],
    updates: [],
    coreSemantics: {
      route: {
        routeId: 'route-retention-1',
        campaignId: 'cmp-1',
        routeOpenedAt: '2026-05-18T09:00:00.000Z',
        reviewCompletedAt: null,
        hasFollowUpTarget: false,
        routeStatus: 'reviewbaar',
        blockedBy: null,
      },
      decisionHistory: [],
      routeActionCards: [],
      routeCloseout: {
        closeoutStatus: null,
        closeoutReason: null,
        closeoutNote: null,
        closedAt: null,
        closedByRole: null,
        readyForCloseout: false,
      },
    },
    ...overrides,
  } as unknown as ActionCenterPreviewItem
}

describe('buildActionCenterGovernanceQueue', () => {
  it('prioritizes repeated no-progress above route-ready-for-closeout', () => {
    const queue = buildActionCenterGovernanceQueue({
      items: [
        buildGovernanceItem({
          id: 'route-closeout-ready',
          sourceLabel: 'ExitScan',
          teamLabel: 'Operations',
          coreSemantics: {
            route: {
              routeId: 'route-closeout-ready',
              campaignId: 'cmp-closeout',
              routeOpenedAt: '2026-05-01T09:00:00.000Z',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
              routeStatus: 'in-uitvoering',
              blockedBy: null,
            },
            decisionHistory: [],
            routeActionCards: [
              buildRouteActionCard({
                actionId: 'action-closeout',
                status: 'afgerond',
                latestReview: buildActionReview({
                  actionReviewId: 'review-closeout',
                  actionId: 'action-closeout',
                  actionOutcome: 'effect-zichtbaar',
                }),
              }),
            ],
            routeCloseout: {
              closeoutStatus: null,
              closeoutReason: null,
              closeoutNote: null,
              closedAt: null,
              closedByRole: null,
              readyForCloseout: true,
            },
          },
        }),
        buildGovernanceItem({
          id: 'route-repeated-progress',
          coreSemantics: {
            route: {
              routeId: 'route-repeated-progress',
              campaignId: 'cmp-repeat',
              routeOpenedAt: '2026-05-18T09:00:00.000Z',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
              routeStatus: 'reviewbaar',
              blockedBy: null,
            },
            decisionHistory: [],
            routeActionCards: [
              buildRouteActionCard({
                actionId: 'action-progress-1',
                latestReview: buildActionReview({
                  actionReviewId: 'review-progress-1',
                  actionId: 'action-progress-1',
                  actionOutcome: 'bijsturen-nodig',
                }),
              }),
              buildRouteActionCard({
                actionId: 'action-progress-2',
                latestReview: buildActionReview({
                  actionReviewId: 'review-progress-2',
                  actionId: 'action-progress-2',
                  actionOutcome: 'nog-te-vroeg',
                }),
              }),
              buildRouteActionCard({
                actionId: 'action-progress-3',
                latestReview: buildActionReview({
                  actionReviewId: 'review-progress-3',
                  actionId: 'action-progress-3',
                  actionOutcome: 'bijsturen-nodig',
                }),
              }),
            ],
            routeCloseout: {
              closeoutStatus: null,
              closeoutReason: null,
              closeoutNote: null,
              closedAt: null,
              closedByRole: null,
              readyForCloseout: false,
            },
          },
        }),
      ],
      now: new Date('2026-05-21T10:00:00.000Z'),
      routeScanTypeByRouteId: {
        'route-closeout-ready': 'exit',
        'route-repeated-progress': 'retention',
      },
    })

    expect(queue.items.map((item) => item.primarySignal)).toEqual([
      'repeated_review_without_progress',
      'route_ready_for_closeout',
    ])
  })

  it('adds explicit why-in-queue copy for blocked execution', () => {
    const queue = buildActionCenterGovernanceQueue({
      items: [
        buildGovernanceItem({
          id: 'route-blocked',
          status: 'geblokkeerd',
          reviewDate: '2026-05-18',
          coreSemantics: {
            route: {
              routeId: 'route-blocked',
              campaignId: 'cmp-blocked',
              routeOpenedAt: '2026-05-01T09:00:00.000Z',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
              routeStatus: 'geblokkeerd',
              blockedBy: 'blocked',
            },
            decisionHistory: [],
            routeActionCards: [],
            routeCloseout: {
              closeoutStatus: null,
              closeoutReason: null,
              closeoutNote: null,
              closedAt: null,
              closedByRole: null,
              readyForCloseout: false,
            },
          },
        }),
      ],
      now: new Date('2026-05-21T10:00:00.000Z'),
      routeScanTypeByRouteId: {
        'route-blocked': 'retention',
      },
    })

    expect(queue.items[0]).toMatchObject({
      primarySignal: 'blocked_action',
      whyInQueue: expect.stringContaining('blokkering'),
      expectedHrAction: expect.stringContaining('HR review'),
    })
  })

  it('supports false-positive suppression without deleting queue history', () => {
    const queue = buildActionCenterGovernanceQueue({
      items: [
        buildGovernanceItem({
          id: 'route-missing-review',
          reviewDate: '2026-05-01',
          coreSemantics: {
            route: {
              routeId: 'route-missing-review',
              campaignId: 'cmp-missing-review',
              routeOpenedAt: '2026-05-01T09:00:00.000Z',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
              routeStatus: 'reviewbaar',
              blockedBy: null,
            },
            decisionHistory: [],
            routeActionCards: [
              buildRouteActionCard({
                actionId: 'action-missing-review',
                reviewScheduledFor: '2026-05-01',
                latestReview: null,
              }),
            ],
            routeCloseout: {
              closeoutStatus: null,
              closeoutReason: null,
              closeoutNote: null,
              closedAt: null,
              closedByRole: null,
              readyForCloseout: false,
            },
          },
        }),
      ],
      suppressedSignals: [
        {
          routeId: 'route-missing-review',
          signalCode: 'action_review_due',
          reasonCode: 'review-already-completed',
        },
      ],
      now: new Date('2026-05-21T10:00:00.000Z'),
      routeScanTypeByRouteId: {
        'route-missing-review': 'retention',
      },
    })

    expect(queue.items).toHaveLength(0)
    expect(queue.suppressedItems[0].signalCode).toBe('action_review_due')
  })
})
