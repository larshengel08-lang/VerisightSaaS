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
        {
          id: 'cmp-exit-1::org-1::department::operations',
          status: 'reviewbaar',
          reviewDate: '2026-05-01',
          sourceLabel: 'ExitScan',
        },
        {
          id: 'cmp-exit-2::org-1::department::finance',
          status: 'reviewbaar',
          reviewDate: '2026-05-27',
          sourceLabel: 'RetentieScan',
        },
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
        {
          id: 'cmp-pulse-1::org-1::department::operations',
          status: 'reviewbaar',
          reviewDate: '2026-05-01',
          sourceLabel: 'Pulse',
        },
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
        items: [
          {
            id: 'cmp-exit-1::org-1::department::operations',
            status: 'reviewbaar',
            reviewDate: '2026-05-01',
            sourceLabel: 'ExitScan',
          },
        ] as never,
        now: new Date('2026-05-28T12:00:00.000Z'),
        routeScanTypeByRouteId: {
          'cmp-exit-1::org-1::department::operations': 'exit',
        },
      }),
    ).rejects.toThrow('database offline')
  })
})
