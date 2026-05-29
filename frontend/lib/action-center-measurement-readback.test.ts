import { describe, expect, it } from 'vitest'
import { buildActionCenterMeasurementReadback } from './action-center-measurement-readback'
import type { ActionCenterGovernanceQueue } from './action-center-governance-queues'
import type { ActionCenterPreviewItem } from './action-center-preview-model'

function buildReview(overrides: Record<string, unknown> = {}) {
  return {
    actionReviewId: 'review-1',
    actionId: 'action-1',
    reviewedAt: '2026-05-18T09:00:00.000Z',
    observation: 'Effect nog beperkt zichtbaar.',
    actionOutcome: 'nog-te-vroeg',
    evidenceSource: 'manager-observation',
    confidenceLevel: 'medium',
    followUpNote: null,
    ...overrides,
  }
}

function buildActionCard(overrides: Record<string, unknown> = {}) {
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

function buildItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'route-exit-1',
    code: 'ACT-1001',
    title: 'Exit route',
    summary: 'Bounded exit route',
    reason: 'Welke bounded vervolgstap vraagt deze route nu?',
    sourceLabel: 'ExitScan',
    teamId: 'operations',
    teamLabel: 'Operations',
    ownerId: 'manager-1',
    ownerName: 'Manager Operations',
    ownerRole: 'Manager',
    ownerSubtitle: 'Operations',
    reviewOwnerName: 'HR lead',
    priority: 'hoog',
    status: 'reviewbaar',
    reviewDate: '2026-05-10',
    expectedEffect: 'Maak zichtbaar of de bounded correctie effect houdt.',
    reviewReason: 'Toets of de bounded correctie echt werkt.',
    reviewOutcome: 'bijstellen',
    reviewDateLabel: '10 mei',
    reviewRhythm: 'Maandelijks',
    signalLabel: 'ExitScan - Operations',
    signalBody: 'De route blijft binnen exit governance.',
    nextStep: 'Plan het volgende reviewmoment.',
    peopleCount: 22,
    openSignals: [],
    updates: [],
    coreSemantics: {
      route: {
        routeId: 'route-exit-1',
        campaignId: 'cmp-1',
        routeOpenedAt: '2026-05-01T09:00:00.000Z',
        reviewCompletedAt: null,
        hasFollowUpTarget: false,
        routeStatus: 'reviewbaar',
        blockedBy: null,
      },
      decisionHistory: [],
      routeActionCards: [buildActionCard()],
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

function makeReadbackFixture() {
  const items = [
    buildItem(),
    buildItem({
      id: 'route-retention-1',
      sourceLabel: 'RetentieScan',
      teamLabel: 'Support',
      status: 'geblokkeerd',
      reviewDate: '2026-05-01',
      coreSemantics: {
        route: {
          routeId: 'route-retention-1',
          campaignId: 'cmp-2',
          routeOpenedAt: '2026-05-02T09:00:00.000Z',
          reviewCompletedAt: null,
          hasFollowUpTarget: false,
          routeStatus: 'geblokkeerd',
          blockedBy: 'manager-blocker',
        },
        decisionHistory: [],
        routeActionCards: [
          buildActionCard({
            actionId: 'action-retention-1',
            latestReview: buildReview({
              actionReviewId: 'review-retention-1',
              actionId: 'action-retention-1',
              actionOutcome: 'bijsturen-nodig',
            }),
          }),
          buildActionCard({
            actionId: 'action-retention-2',
            latestReview: buildReview({
              actionReviewId: 'review-retention-2',
              actionId: 'action-retention-2',
              actionOutcome: 'nog-te-vroeg',
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
  ] as ActionCenterPreviewItem[]

  const governanceQueue: ActionCenterGovernanceQueue = {
    items: [
      {
        routeId: 'route-retention-1',
        routeFamily: 'retention',
        sourceLabel: 'RetentieScan',
        scopeLabel: 'Support',
        managerOwner: 'Manager Support',
        primarySignal: 'blocked_action',
        secondarySignals: ['repeated_review_without_progress', 'route_ready_for_closeout'],
        severity: 'high',
        whyInQueue: 'Er staat nu een blokkering op deze route.',
        expectedHrAction: 'HR review the blockage.',
        recommendation: 'HR review needed',
        timeInQueueDays: 6,
      },
    ],
    suppressedItems: [],
  }

  return {
    items,
    governanceQueue,
    routeScanTypeByRouteId: {
      'route-exit-1': 'exit',
      'route-retention-1': 'retention',
    } as const,
  }
}

describe('buildActionCenterMeasurementReadback', () => {
  it('builds route, action, review, governance, and route-family layers', () => {
    const readback = buildActionCenterMeasurementReadback(makeReadbackFixture())

    expect(readback.layers.routeLevel.routesOpen).toBeGreaterThan(0)
    expect(readback.layers.actionLevel.activeActionCount).toBeGreaterThan(0)
    expect(readback.layers.reviewLevel.reviewDueCount).toBeGreaterThanOrEqual(0)
    expect(readback.layers.governanceSignalLevel.blockedActionCount).toBeGreaterThanOrEqual(0)
    expect(readback.layers.routeFamilyLevel.exit.defaultReviewWindowDays?.max).toBe(90)
  })

  it('keeps buyer-safe vocabulary free of proof claims', () => {
    const readback = buildActionCenterMeasurementReadback(makeReadbackFixture())

    expect(readback.buyerSafeVocabulary).toContain('route ready for closeout')
    expect(readback.buyerSafeVocabulary).not.toContain('impact achieved')
  })

  it('keeps ExitScan completed-action readback non-causal', () => {
    const readback = buildActionCenterMeasurementReadback(makeReadbackFixture())

    expect(readback.layers.routeFamilyLevel.exit.closeoutQuestion).toContain('what was chosen')
    expect(
      readback.metricInterpretationGuide.find((item) => item.metricName === 'action_completion_rate')
        ?.doesNotProve,
    ).toContain('route resolution')
  })

  it('keeps RetentieScan repeated-no-progress readback out of MTO-light framing', () => {
    const readback = buildActionCenterMeasurementReadback(makeReadbackFixture())

    expect(readback.layers.routeFamilyLevel.retention.confidenceFraming).toContain('stay-intent')
    expect(JSON.stringify(readback)).not.toContain('MTO')
  })
})
