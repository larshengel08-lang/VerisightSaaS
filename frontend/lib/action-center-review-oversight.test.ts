import { describe, expect, it } from 'vitest'
import { buildDefaultActionCenterReviewRhythmConfig } from './action-center-review-rhythm'
import {
  buildActionCenterReviewOversightSummary,
  classifyActionCenterReviewOversightState,
} from './action-center-review-oversight'

const DEFAULT_CONFIG = buildDefaultActionCenterReviewRhythmConfig()

describe('action center review oversight contract', () => {
  it('classifies enabled future review routes as upcoming', () => {
    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'exit',
        routeStatus: 'reviewbaar',
        reviewDate: '2026-05-20',
        reviewCompletedAt: null,
        reviewOutcome: 'geen-uitkomst',
        hasFollowUpTarget: false,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBe('upcoming')
  })

  it('classifies enabled overdue routes inside cadence health as overdue', () => {
    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'exit',
        routeStatus: 'reviewbaar',
        reviewDate: '2026-05-15',
        reviewCompletedAt: null,
        reviewOutcome: 'geen-uitkomst',
        hasFollowUpTarget: false,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBe('overdue')
  })

  it('classifies overdue unresolved routes beyond escalation threshold as escalation-sensitive', () => {
    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'retention',
        routeStatus: 'reviewbaar',
        reviewDate: '2026-05-08',
        reviewCompletedAt: null,
        reviewOutcome: 'geen-uitkomst',
        hasFollowUpTarget: false,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBe('escalation-sensitive')
  })

  it('classifies missing or expired review cadence as stale', () => {
    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'exit',
        routeStatus: 'reviewbaar',
        reviewDate: null,
        reviewCompletedAt: null,
        reviewOutcome: 'geen-uitkomst',
        hasFollowUpTarget: false,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBe('stale')

    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'exit',
        routeStatus: 'reviewbaar',
        reviewDate: '2026-04-20',
        reviewCompletedAt: null,
        reviewOutcome: 'geen-uitkomst',
        hasFollowUpTarget: false,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBe('stale')
  })

  it('classifies closed or resolved routes as resolved before stale/overdue states', () => {
    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'exit',
        routeStatus: 'afgerond',
        reviewDate: '2026-04-20',
        reviewCompletedAt: '2026-05-01T09:00:00.000Z',
        reviewOutcome: 'afronden',
        hasFollowUpTarget: false,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBe('resolved')

    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'retention',
        routeStatus: 'reviewbaar',
        reviewDate: '2026-05-08',
        reviewCompletedAt: '2026-05-10T09:00:00.000Z',
        reviewOutcome: 'doorgaan',
        hasFollowUpTarget: true,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBe('resolved')
  })

  it('keeps blocked route families out of oversight output', () => {
    expect(
      classifyActionCenterReviewOversightState({
        scanType: 'pulse',
        routeStatus: 'reviewbaar',
        reviewDate: '2026-05-08',
        reviewCompletedAt: null,
        reviewOutcome: 'geen-uitkomst',
        hasFollowUpTarget: false,
        config: DEFAULT_CONFIG,
        now: new Date('2026-05-17T12:00:00.000Z'),
      }),
    ).toBeNull()
  })

  it('builds a bounded oversight summary and spotlight list from eligible routes only', () => {
    const summary = buildActionCenterReviewOversightSummary({
      items: [
        {
          id: 'route-upcoming',
          title: 'Upcoming',
          sourceLabel: 'ExitScan',
          teamLabel: 'Operations',
          status: 'reviewbaar',
          reviewDate: '2026-05-20',
          reviewDateLabel: '20 mei',
          reviewOutcome: 'geen-uitkomst',
          coreSemantics: {
            route: {
              routeId: 'route-upcoming',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
          },
        },
        {
          id: 'route-stale',
          title: 'Stale',
          sourceLabel: 'RetentieScan',
          teamLabel: 'Support',
          status: 'reviewbaar',
          reviewDate: null,
          reviewDateLabel: 'Nog niet gepland',
          reviewOutcome: 'geen-uitkomst',
          coreSemantics: {
            route: {
              routeId: 'route-stale',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
          },
        },
        {
          id: 'route-blocked',
          title: 'Blocked family',
          sourceLabel: 'Pulse',
          teamLabel: 'HR',
          status: 'reviewbaar',
          reviewDate: '2026-05-10',
          reviewDateLabel: '10 mei',
          reviewOutcome: 'geen-uitkomst',
          coreSemantics: {
            route: {
              routeId: 'route-blocked',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
          },
        },
      ] as never,
      configByRouteId: {
        'route-upcoming': DEFAULT_CONFIG,
        'route-stale': DEFAULT_CONFIG,
      },
      routeScanTypeByRouteId: {
        'route-upcoming': 'exit',
        'route-stale': 'retention',
        'route-blocked': 'pulse',
      },
      now: new Date('2026-05-17T12:00:00.000Z'),
    })

    expect(summary.summary).toEqual({
      upcomingCount: 1,
      overdueCount: 0,
      staleCount: 1,
      escalationSensitiveCount: 0,
      resolvedCount: 0,
    })
    expect(summary.attentionItems.map((item) => item.routeId)).toEqual(['route-stale'])
  })
})
