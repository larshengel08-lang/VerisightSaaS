import { describe, expect, it } from 'vitest'
import {
  deriveActionCenterRouteGovernanceSignals,
  getActionCenterGovernanceActorRoleLabel,
  isActionCenterGovernanceActorRole,
  getActionCenterGovernanceSignalLabel,
  resolveActionCenterHrWriteAccess,
  resolveActionCenterReviewRhythmWriteAccess,
  resolveActionCenterTransitionAccess,
} from './action-center-governance'

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
    sourceLabel: 'Loep Behoud',
    teamId: 'support',
    teamLabel: 'Support',
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
    signalLabel: 'Loep Behoud - Support',
    signalBody: 'De route blijft binnen retention governance.',
    nextStep: 'Plan het volgende reviewmoment.',
    peopleCount: 22,
    updates: [],
    coreSemantics: {
      route: {
        routeId: 'route-retention-1',
        routeOpenedAt: '2026-05-18T09:00:00.000Z',
        reviewCompletedAt: null,
        hasFollowUpTarget: false,
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
  }
}

describe('action center governance helpers', () => {
  it('recognizes canonical governance actor roles', () => {
    expect(isActionCenterGovernanceActorRole('verisight_admin')).toBe(true)
    expect(isActionCenterGovernanceActorRole('hr_member')).toBe(true)
    expect(isActionCenterGovernanceActorRole('unknown')).toBe(false)
    expect(getActionCenterGovernanceActorRoleLabel('hr_owner')).toBe('HR owner')
    expect(getActionCenterGovernanceSignalLabel('route_ready_for_closeout')).toBe('Klaar voor closeout')
  })

  it('prefers verisight admin when resolving HR write access', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: true },
        orgMemberships: [],
        workspaceMemberships: [],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'verisight_admin',
    })
  })

  it('resolves org ownership to hr_owner audit truth', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
        workspaceMemberships: [],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_owner',
    })
  })

  it('resolves hr_member workspace access when no org owner access exists', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-member-1',
            display_name: 'HR Member',
            login_email: 'hr.member@example.com',
            access_role: 'hr_member',
            scope_type: 'org',
            scope_value: 'org-1::org::org-1',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: true,
          },
        ],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_member',
    })
  })

  it('denies write access without verisight or HR authority', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: false,
      auditRole: null,
    })
  })

  it('does not allow manager canonical reschedule or close access', () => {
    expect(
      resolveActionCenterTransitionAccess({
        actorRole: 'hr_owner',
        object: 'review_moment',
        fromState: 'scheduled',
        toState: 'rescheduled',
      }).allowed,
    ).toBe(true)

    expect(
      resolveActionCenterTransitionAccess({
        actorRole: 'manager',
        object: 'follow_through_route',
        fromState: 'open',
        toState: 'closed',
      }).allowed,
    ).toBe(false)

    expect(
      resolveActionCenterTransitionAccess({
        actorRole: 'manager',
        object: 'review_moment',
        fromState: 'scheduled',
        toState: 'rescheduled',
      }).allowed,
    ).toBe(false)
  })

  it('requires view, update, schedule, and matching scope for review rhythm access', () => {
    expect(
      resolveActionCenterReviewRhythmWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-member-1',
            display_name: 'HR Member',
            login_email: 'hr.member@example.com',
            access_role: 'hr_member',
            scope_type: 'route',
            scope_value: 'org-1::route::other-route',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: true,
          },
          {
            org_id: 'org-1',
            user_id: 'hr-member-2',
            display_name: 'HR Member',
            login_email: 'hr.member.two@example.com',
            access_role: 'hr_member',
            scope_type: 'route',
            scope_value: 'org-1::route::route-1',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: false,
          },
        ],
        orgId: 'org-1',
        routeScopeValue: 'org-1::route::route-1',
      }),
    ).toEqual({
      allowed: false,
      auditRole: null,
    })
  })

  it('allows review rhythm access for matching route scope and org-wide hr memberships', () => {
    expect(
      resolveActionCenterReviewRhythmWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-member-1',
            display_name: 'HR Member',
            login_email: 'hr.member@example.com',
            access_role: 'hr_member',
            scope_type: 'route',
            scope_value: 'org-1::route::route-1',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: true,
          },
        ],
        orgId: 'org-1',
        routeScopeValue: 'org-1::route::route-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_member',
    })

    expect(
      resolveActionCenterReviewRhythmWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-owner-1',
            display_name: 'HR Owner',
            login_email: 'hr.owner@example.com',
            access_role: 'hr_owner',
            scope_type: 'org',
            scope_value: 'org-1::org::org-1',
            can_view: true,
            can_update: true,
            can_assign: true,
            can_schedule_review: true,
          },
        ],
        orgId: 'org-1',
        routeScopeValue: 'org-1::route::route-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_owner',
    })
  })

  it('derives action-level stuck and no-progress review signals from bounded action truth', () => {
    const signals = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem({
        reviewDate: '2026-05-10',
        coreSemantics: {
          route: {
            routeId: 'route-retention-1',
            routeOpenedAt: '2026-05-18T09:00:00.000Z',
            reviewCompletedAt: null,
            hasFollowUpTarget: false,
          },
          decisionHistory: [],
          routeActionCards: [
            buildRouteActionCard({
              actionId: 'action-stuck',
              reviewScheduledFor: '2026-04-15',
              latestReview: null,
            }),
            buildRouteActionCard({
              actionId: 'action-progress-1',
              reviewScheduledFor: '2026-05-01',
              latestReview: buildActionReview({
                actionReviewId: 'review-progress-1',
                actionId: 'action-progress-1',
                actionOutcome: 'bijsturen-nodig',
              }),
            }),
            buildRouteActionCard({
              actionId: 'action-progress-2',
              reviewScheduledFor: '2026-05-03',
              latestReview: buildActionReview({
                actionReviewId: 'review-progress-2',
                actionId: 'action-progress-2',
                actionOutcome: 'nog-te-vroeg',
              }),
            }),
            buildRouteActionCard({
              actionId: 'action-progress-3',
              reviewScheduledFor: '2026-05-05',
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
      }) as never,
      scanType: 'retention',
      now: new Date('2026-05-20T12:00:00.000Z'),
    })

    expect(signals?.signals.map((signal) => signal.code)).toEqual([
      'action_sprawl_risk',
      'missing_action_review',
      'stuck_action',
      'repeated_review_without_progress',
    ])
  })

  it('does not infer stuck_action from old route age when active action evidence is still fresh', () => {
    const signals = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem({
        reviewDate: '2026-05-28',
        coreSemantics: {
          route: {
            routeId: 'route-retention-fresh-action',
            routeOpenedAt: '2026-04-01T09:00:00.000Z',
            reviewCompletedAt: null,
            hasFollowUpTarget: false,
          },
          decisionHistory: [],
          routeActionCards: [
            buildRouteActionCard({
              actionId: 'action-fresh',
              reviewScheduledFor: '2026-05-28',
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
      }) as never,
      scanType: 'retention',
      now: new Date('2026-05-20T12:00:00.000Z'),
    })

    expect(signals?.signals.map((signal) => signal.code) ?? []).not.toContain('stuck_action')
  })

  it('does not infer repeated_review_without_progress from decision history volume alone', () => {
    const signals = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem({
        reviewDate: '2026-05-28',
        coreSemantics: {
          route: {
            routeId: 'route-retention-decision-history-only',
            routeOpenedAt: '2026-05-18T09:00:00.000Z',
            reviewCompletedAt: null,
            hasFollowUpTarget: false,
          },
          decisionHistory: [
            { decisionEntryId: 'decision-1' },
            { decisionEntryId: 'decision-2' },
            { decisionEntryId: 'decision-3' },
          ],
          routeActionCards: [
            buildRouteActionCard({
              actionId: 'action-with-progress',
              latestReview: buildActionReview({
                actionReviewId: 'review-with-progress',
                actionId: 'action-with-progress',
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
            readyForCloseout: false,
          },
        },
      }) as never,
      scanType: 'retention',
      now: new Date('2026-05-20T12:00:00.000Z'),
    })

    expect(signals?.signals.map((signal) => signal.code) ?? []).not.toContain(
      'repeated_review_without_progress',
    )
  })

  it('flags missing execution and closeout readiness from existing bounded route truth', () => {
    const executionGap = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem({
        id: 'route-exec-gap',
        status: 'in-uitvoering',
        reviewDate: '2026-05-28',
        reviewDateLabel: '28 mei',
        coreSemantics: {
          route: {
            routeId: 'route-exec-gap',
            routeOpenedAt: '2026-05-01T09:00:00.000Z',
            reviewCompletedAt: null,
            hasFollowUpTarget: false,
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
      }) as never,
      scanType: 'exit',
      now: new Date('2026-05-20T12:00:00.000Z'),
    })

    expect(executionGap?.signals.map((signal) => signal.code)).toEqual([
      'missing_action_where_execution_is_expected',
    ])

    const closeoutReady = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem({
        id: 'route-closeout-ready',
        status: 'in-uitvoering',
        reviewDate: '2026-05-28',
        reviewDateLabel: '28 mei',
        coreSemantics: {
          route: {
            routeId: 'route-closeout-ready',
            routeOpenedAt: '2026-05-01T09:00:00.000Z',
            reviewCompletedAt: null,
            hasFollowUpTarget: false,
          },
          decisionHistory: [
            { decisionEntryId: 'decision-closeout-1' },
          ],
          routeActionCards: [
            {
              actionId: 'action-closeout-1',
              themeKey: 'leadership',
              actionText: 'Rond de laatste bounded actie af.',
              reviewScheduledFor: '2026-05-10',
              expectedEffect: 'Maak zichtbaar of de route klaar is.',
              status: 'afgerond',
              latestReview: {
                actionReviewId: 'review-closeout-1',
                actionId: 'action-closeout-1',
                reviewedAt: '2026-05-12T09:00:00.000Z',
                observation: 'Effect is zichtbaar genoeg.',
                actionOutcome: 'effect-zichtbaar',
                evidenceSource: 'manager-observation',
                confidenceLevel: 'medium',
                followUpNote: null,
              },
            },
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
      }) as never,
      scanType: 'exit',
      now: new Date('2026-05-20T12:00:00.000Z'),
    })

    expect(closeoutReady?.signals.map((signal) => signal.code)).toEqual(['route_ready_for_closeout'])
  })

  it('flags missing execution when a route only has historical action cards and no active bounded action remains', () => {
    const executionGap = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem({
        id: 'route-historical-only',
        status: 'in-uitvoering',
        reviewDate: '2026-05-28',
        reviewDateLabel: '28 mei',
        coreSemantics: {
          route: {
            routeId: 'route-historical-only',
            routeOpenedAt: '2026-05-01T09:00:00.000Z',
            reviewCompletedAt: null,
            hasFollowUpTarget: false,
          },
          decisionHistory: [],
          routeActionCards: [
            buildRouteActionCard({
              actionId: 'action-finished-1',
              status: 'afgerond',
              latestReview: buildActionReview({
                actionReviewId: 'review-finished-1',
                actionId: 'action-finished-1',
                actionOutcome: 'effect-zichtbaar',
              }),
            }),
            buildRouteActionCard({
              actionId: 'action-finished-2',
              status: 'gestopt',
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
      }) as never,
      scanType: 'exit',
      now: new Date('2026-05-20T12:00:00.000Z'),
    })

    expect(executionGap?.signals.map((signal) => signal.code)).toEqual([
      'missing_action_where_execution_is_expected',
    ])
  })

  it('keeps blocked route families out of bounded HR governance derivation', () => {
    expect(
      deriveActionCenterRouteGovernanceSignals({
        item: buildGovernanceItem({
          id: 'route-pulse-1',
          sourceLabel: 'Pulse',
          coreSemantics: {
            route: {
              routeId: 'route-pulse-1',
              routeOpenedAt: '2026-05-01T09:00:00.000Z',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
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
        }) as never,
        scanType: 'pulse',
        now: new Date('2026-05-20T12:00:00.000Z'),
      }),
    ).toBeNull()
  })

  it('derives governance source labels from bounded route family truth when raw labels drift', () => {
    const signals = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem({
        id: 'route-retention-drifted-label',
        sourceLabel: 'Pulse',
        status: 'in-uitvoering',
        coreSemantics: {
          route: {
            routeId: 'route-retention-drifted-label',
            routeOpenedAt: '2026-05-18T09:00:00.000Z',
            reviewCompletedAt: null,
            hasFollowUpTarget: false,
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
      }) as never,
      scanType: 'retention',
      now: new Date('2026-05-20T12:00:00.000Z'),
    })

    expect(signals).toMatchObject({
      sourceLabel: 'Loep Behoud',
      signals: [
        {
          code: 'missing_action_where_execution_is_expected',
        },
      ],
    })
  })
})
