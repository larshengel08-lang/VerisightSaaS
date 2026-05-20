import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAdminFrom } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { getActionCenterReviewRhythmData } from './action-center-review-rhythm-data'

function createRhythmConfigQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue(result),
  }
}

function buildItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cmp-exit-1::org-1::department::operations',
    status: 'reviewbaar',
    reviewDate: '2026-05-01',
    sourceLabel: 'ExitScan',
    teamLabel: 'Operations',
    reviewDateLabel: '1 mei',
    reviewOutcome: 'geen-uitkomst',
    coreSemantics: {
      route: {
        routeId: 'cmp-exit-1::org-1::department::operations',
        routeOpenedAt: '2026-04-20T09:00:00.000Z',
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

describe('action center review rhythm data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns visible Action Center parity-route configs and bounded overview counts', async () => {
    const configQuery = createRhythmConfigQuery({
      data: [
        {
          route_id: 'cmp-exit-1::org-1::department::operations',
          cadence_days: 14,
          reminder_lead_days: 3,
          escalation_lead_days: 7,
          reminders_enabled: true,
        },
      ],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_review_rhythm_configs') {
        return configQuery
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const result = await getActionCenterReviewRhythmData({
      items: [
        buildItem(),
        buildItem({
          id: 'cmp-exit-2::org-1::department::finance',
          reviewDate: '2026-05-20',
          reviewDateLabel: '20 mei',
          sourceLabel: 'RetentieScan',
          teamLabel: 'Finance',
          coreSemantics: {
            route: {
              routeId: 'cmp-exit-2::org-1::department::finance',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
          },
        }),
      ] as never,
      now: new Date('2026-05-28T12:00:00.000Z'),
      routeScanTypeByRouteId: {
        'cmp-exit-1::org-1::department::operations': 'exit',
        'cmp-exit-2::org-1::department::finance': 'retention',
      },
    })

    expect(configQuery.in).toHaveBeenCalledWith('route_id', [
      'cmp-exit-1::org-1::department::operations',
      'cmp-exit-2::org-1::department::finance',
    ])
    expect(result.configByRouteId['cmp-exit-1::org-1::department::operations']).toMatchObject({
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      remindersEnabled: true,
    })
    expect(result.configByRouteId['cmp-exit-2::org-1::department::finance']).toMatchObject({
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      remindersEnabled: true,
    })
    expect(result.summary).toEqual({
      staleCount: 1,
      overdueCount: 1,
      upcomingCount: 0,
      reminderManagedCount: 2,
    })
    expect(result.oversight.summary).toEqual({
      upcomingCount: 0,
      overdueCount: 0,
      staleCount: 1,
      escalationSensitiveCount: 1,
      resolvedCount: 0,
    })
    expect(result.oversight.attentionItems).toMatchObject([
      {
        routeId: 'cmp-exit-2::org-1::department::finance',
        state: 'escalation-sensitive',
      },
      {
        routeId: 'cmp-exit-1::org-1::department::operations',
        state: 'stale',
      },
    ])
  })

  it('queries and returns only constitution-approved route families by canonical route id', async () => {
    const configQuery = createRhythmConfigQuery({
      data: [
        {
          route_id: 'route-retention-1',
          cadence_days: 14,
          reminder_lead_days: 3,
          escalation_lead_days: 7,
          reminders_enabled: true,
        },
      ],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_review_rhythm_configs') {
        return configQuery
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const result = await getActionCenterReviewRhythmData({
      items: [
        buildItem({
          id: 'preview-retention-1',
          sourceLabel: 'RetentieScan',
          coreSemantics: {
            route: {
              routeId: 'route-retention-1',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
          },
        }),
        buildItem({
          id: 'preview-pulse-1',
          sourceLabel: 'Pulse',
          coreSemantics: {
            route: {
              routeId: 'route-pulse-1',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
          },
        }),
      ] as never,
      now: new Date('2026-05-28T12:00:00.000Z'),
      routeScanTypeByRouteId: {
        'route-retention-1': 'retention',
        'route-pulse-1': 'pulse',
      },
    })

    expect(configQuery.in).toHaveBeenCalledWith('route_id', ['route-retention-1'])
    expect(Object.keys(result.configByRouteId)).toEqual(['route-retention-1'])
  })

  it('ignores blocked route families for persistence and summary counts', async () => {
    const configQuery = createRhythmConfigQuery({
      data: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_review_rhythm_configs') {
        return configQuery
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const result = await getActionCenterReviewRhythmData({
      items: [
        buildItem({
          id: 'cmp-pulse-1::org-1::department::operations',
          sourceLabel: 'Pulse',
          coreSemantics: {
            route: {
              routeId: 'cmp-pulse-1::org-1::department::operations',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
          },
        }),
      ] as never,
      now: new Date('2026-05-28T12:00:00.000Z'),
      routeScanTypeByRouteId: {
        'cmp-pulse-1::org-1::department::operations': 'pulse',
      },
    })

    expect(configQuery.in).not.toHaveBeenCalled()
    expect(result.configByRouteId).toEqual({})
    expect(result.summary).toEqual({
      staleCount: 0,
      overdueCount: 0,
      upcomingCount: 0,
      reminderManagedCount: 0,
    })
    expect(result.oversight.summary).toEqual({
      upcomingCount: 0,
      overdueCount: 0,
      staleCount: 0,
      escalationSensitiveCount: 0,
      resolvedCount: 0,
    })
    expect(result.oversight.attentionItems).toEqual([])
  })

  it('surfaces a failed review rhythm config query instead of silently defaulting', async () => {
    const configQuery = createRhythmConfigQuery({
      data: null,
      error: {
        message: 'database offline',
      },
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_review_rhythm_configs') {
        return configQuery
      }

      throw new Error(`Unhandled table ${table}`)
    })

    await expect(
      getActionCenterReviewRhythmData({
        items: [buildItem()] as never,
        now: new Date('2026-05-28T12:00:00.000Z'),
        routeScanTypeByRouteId: {
          'cmp-exit-1::org-1::department::operations': 'exit',
        },
      }),
    ).rejects.toThrow('database offline')
  })

  it('merges bounded governance-only routes into the HR oversight feed without broadening beyond exit and retention', async () => {
    const configQuery = createRhythmConfigQuery({
      data: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_review_rhythm_configs') {
        return configQuery
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const result = await getActionCenterReviewRhythmData({
      items: [
        buildItem({
          id: 'route-exec-gap',
          status: 'in-uitvoering',
          reviewDate: '2026-06-05',
          reviewDateLabel: '5 jun',
          coreSemantics: {
            route: {
              routeId: 'route-exec-gap',
              routeOpenedAt: '2026-05-20T09:00:00.000Z',
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
        }),
        buildItem({
          id: 'route-governance-signals',
          status: 'reviewbaar',
          reviewDate: '2026-05-10',
          reviewDateLabel: '10 mei',
          coreSemantics: {
            route: {
              routeId: 'route-governance-signals',
              routeOpenedAt: '2026-05-18T09:00:00.000Z',
              reviewCompletedAt: null,
              hasFollowUpTarget: false,
            },
            decisionHistory: [],
            routeActionCards: [
              {
                actionId: 'action-stuck',
                themeKey: 'leadership',
                actionText: 'Plan een bounded teamcheck.',
                reviewScheduledFor: '2026-04-15',
                expectedEffect: 'Maak zichtbaar of het team rustiger reageert.',
                status: 'open',
                latestReview: null,
              },
              {
                actionId: 'action-progress-1',
                themeKey: 'growth',
                actionText: 'Leg groeigesprekken klein vast.',
                reviewScheduledFor: '2026-05-01',
                expectedEffect: 'Maak zichtbaar of groeifricite afneemt.',
                status: 'open',
                latestReview: {
                  actionReviewId: 'review-progress-1',
                  actionId: 'action-progress-1',
                  reviewedAt: '2026-05-18T09:00:00.000Z',
                  observation: 'Nog geen zichtbaar effect.',
                  actionOutcome: 'bijsturen-nodig',
                  evidenceSource: 'manager-observation',
                  confidenceLevel: 'medium',
                  followUpNote: null,
                },
              },
              {
                actionId: 'action-progress-2',
                themeKey: 'leadership',
                actionText: 'Plan een tweede bounded teamcheck.',
                reviewScheduledFor: '2026-05-03',
                expectedEffect: 'Maak zichtbaar of feedbackritme verbetert.',
                status: 'in_review',
                latestReview: {
                  actionReviewId: 'review-progress-2',
                  actionId: 'action-progress-2',
                  reviewedAt: '2026-05-18T09:00:00.000Z',
                  observation: 'Nog geen zichtbaar effect.',
                  actionOutcome: 'nog-te-vroeg',
                  evidenceSource: 'manager-observation',
                  confidenceLevel: 'medium',
                  followUpNote: null,
                },
              },
              {
                actionId: 'action-progress-3',
                themeKey: 'growth',
                actionText: 'Kies een kleine groeicorrectie.',
                reviewScheduledFor: '2026-05-05',
                expectedEffect: 'Maak zichtbaar of behoudsvertrouwen toeneemt.',
                status: 'open',
                latestReview: {
                  actionReviewId: 'review-progress-3',
                  actionId: 'action-progress-3',
                  reviewedAt: '2026-05-18T09:00:00.000Z',
                  observation: 'Nog geen zichtbaar effect.',
                  actionOutcome: 'bijsturen-nodig',
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
              readyForCloseout: false,
            },
          },
        }),
        buildItem({
          id: 'route-pulse-ignored',
          sourceLabel: 'Pulse',
          status: 'in-uitvoering',
          reviewDate: '2026-06-10',
          reviewDateLabel: '10 jun',
          coreSemantics: {
            route: {
              routeId: 'route-pulse-ignored',
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
        }),
      ] as never,
      now: new Date('2026-05-28T12:00:00.000Z'),
      routeScanTypeByRouteId: {
        'route-exec-gap': 'exit',
        'route-governance-signals': 'retention',
        'route-pulse-ignored': 'pulse',
      },
    })

    expect(result.oversight.summary).toEqual({
      upcomingCount: 1,
      overdueCount: 0,
      staleCount: 1,
      escalationSensitiveCount: 0,
      resolvedCount: 0,
    })
    expect(result.oversight.attentionItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          routeId: 'route-exec-gap',
          governanceSignals: expect.arrayContaining([
            expect.objectContaining({ code: 'missing_action_where_execution_is_expected' }),
          ]),
        }),
        expect.objectContaining({
          routeId: 'route-governance-signals',
          governanceSignals: expect.arrayContaining([
            expect.objectContaining({ code: 'action_sprawl_risk' }),
            expect.objectContaining({ code: 'missing_action_review' }),
            expect.objectContaining({ code: 'stuck_action' }),
            expect.objectContaining({ code: 'repeated_review_without_progress' }),
          ]),
        }),
      ]),
    )
    expect(result.oversight.attentionItems.map((item) => item.routeId)).not.toContain('route-pulse-ignored')
  })
})
