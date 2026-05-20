import { describe, expect, it } from 'vitest'
import {
  deriveActionCenterRouteGovernanceSignals,
  getActionCenterGovernanceActorRoleLabel,
  isActionCenterGovernanceActorRole,
  resolveActionCenterHrWriteAccess,
  resolveActionCenterReviewRhythmWriteAccess,
  resolveActionCenterTransitionAccess,
} from './action-center-governance'

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
    updates: [],
    coreSemantics: {
      route: {
        routeId: 'route-retention-1',
        routeOpenedAt: '2026-04-01T09:00:00.000Z',
        reviewCompletedAt: null,
        hasFollowUpTarget: false,
      },
      decisionHistory: [
        { decisionEntryId: 'decision-1' },
        { decisionEntryId: 'decision-2' },
        { decisionEntryId: 'decision-3' },
      ],
      routeActionCards: [
        {
          actionId: 'action-1',
          themeKey: 'leadership',
          actionText: 'Plan een bounded teamcheck.',
          reviewScheduledFor: '2026-05-01',
          expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
          status: 'open',
          latestReview: null,
        },
        {
          actionId: 'action-2',
          themeKey: 'growth',
          actionText: 'Leg groeigesprekken klein vast.',
          reviewScheduledFor: '2026-05-03',
          expectedEffect: 'Maak zichtbaar of groeifricite afneemt.',
          status: 'open',
          latestReview: null,
        },
        {
          actionId: 'action-3',
          themeKey: 'leadership',
          actionText: 'Plan een tweede bounded teamcheck.',
          reviewScheduledFor: '2026-05-05',
          expectedEffect: 'Maak zichtbaar of feedbackritme verbetert.',
          status: 'in_review',
          latestReview: null,
        },
        {
          actionId: 'action-4',
          themeKey: 'growth',
          actionText: 'Kies een kleine groeicorrectie.',
          reviewScheduledFor: '2026-05-07',
          expectedEffect: 'Maak zichtbaar of behoudsvertrouwen toeneemt.',
          status: 'open',
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

  it('derives bounded HR governance signals from approved route defaults instead of inventing new thresholds', () => {
    const signals = deriveActionCenterRouteGovernanceSignals({
      item: buildGovernanceItem() as never,
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
})
