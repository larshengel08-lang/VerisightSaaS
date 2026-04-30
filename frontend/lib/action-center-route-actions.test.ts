import { describe, expect, it } from 'vitest'

function buildCanonicalOpenActionInput(overrides: Record<string, unknown> = {}) {
  return {
    id: 'action-1',
    route_id: 'campaign-exit::operations',
    campaign_id: 'campaign-exit',
    route_scope_type: 'department',
    route_scope_value: 'operations',
    owner_name: 'Manager Operations',
    owner_assigned_at: '2026-04-21T08:00:00.000Z',
    primary_action_theme_key: 'workload',
    primary_action_text: 'Plan deze week een gericht teamgesprek over workloadpieken.',
    primary_action_expected_effect:
      'Binnen twee weken moet zichtbaar zijn of de workloadpieken smaller worden.',
    primary_action_status: 'open',
    review_scheduled_for: '2026-05-12',
    created_at: '2026-04-21T09:00:00.000Z',
    updated_at: '2026-04-21T09:00:00.000Z',
    ...overrides,
  }
}

describe('action center route actions', () => {
  it('projects a canonical open action card with canonical action truth only', async () => {
    const { projectActionCenterRouteActionCard } = await import('./action-center-route-actions') as {
      projectActionCenterRouteActionCard: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(projectActionCenterRouteActionCard(buildCanonicalOpenActionInput())).toMatchObject({
      actionId: 'action-1',
      routeId: 'campaign-exit::operations',
      themeKey: 'workload',
      actionText: 'Plan deze week een gericht teamgesprek over workloadpieken.',
      expectedEffect: 'Binnen twee weken moet zichtbaar zijn of de workloadpieken smaller worden.',
      reviewScheduledFor: '2026-05-12',
      status: 'open',
      createdAt: '2026-04-21T09:00:00.000Z',
      updatedAt: '2026-04-21T09:00:00.000Z',
    })
  })

  it.each([
    {
      label: 'the primary action theme is missing',
      input: buildCanonicalOpenActionInput({ primary_action_theme_key: null }),
    },
    {
      label: 'the next review date is missing',
      input: buildCanonicalOpenActionInput({ review_scheduled_for: null }),
    },
  ])('rejects a canonical open action card when $label', async ({ input }) => {
    const { validateActionCenterRouteActionWriteInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionWriteInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(() => validateActionCenterRouteActionWriteInput(input)).toThrow('Ongeldige route action input.')
  })
})
