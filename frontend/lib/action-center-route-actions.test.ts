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

function buildDraftInput(overrides: Record<string, unknown> = {}) {
  return {
    primary_action_theme_key: 'leadership',
    primary_action_text: 'Plan deze week een gericht teamgesprek over leiderschapsfeedback.',
    primary_action_expected_effect:
      'Binnen twee weken moet zichtbaar zijn of leiderschapsfrictie kleiner wordt in dit team.',
    primary_action_status: 'open',
    review_scheduled_for: '2026-05-15',
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

  it('projects a persisted draft action row as retained draft truth instead of forcing active truth', async () => {
    const { projectActionCenterRouteActionCard } = await import('./action-center-route-actions') as {
      projectActionCenterRouteActionCard: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      projectActionCenterRouteActionCard(
        buildCanonicalOpenActionInput({
          primary_action_status: null,
        }),
      ),
    ).toMatchObject({
      actionId: 'action-1',
      routeId: 'campaign-exit::operations',
      themeKey: 'workload',
      actionText: 'Plan deze week een gericht teamgesprek over workloadpieken.',
      expectedEffect: 'Binnen twee weken moet zichtbaar zijn of de workloadpieken smaller worden.',
      reviewScheduledFor: '2026-05-12',
      status: null,
      semanticState: 'draft',
      validationDisposition: 'valid',
      createdAt: '2026-04-21T09:00:00.000Z',
      updatedAt: '2026-04-21T09:00:00.000Z',
    })
  })

  it('projects a persisted incomplete draft row without rejecting null draft fields', async () => {
    const { projectActionCenterRouteActionCard } = await import('./action-center-route-actions') as {
      projectActionCenterRouteActionCard: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      projectActionCenterRouteActionCard(
        buildCanonicalOpenActionInput({
          primary_action_theme_key: null,
          primary_action_text: null,
          primary_action_expected_effect: null,
          primary_action_status: null,
          review_scheduled_for: null,
        }),
      ),
    ).toMatchObject({
      actionId: 'action-1',
      routeId: 'campaign-exit::operations',
      themeKey: null,
      actionText: null,
      expectedEffect: null,
      reviewScheduledFor: null,
      status: null,
      semanticState: 'draft',
      validationDisposition: 'invalid',
    })
  })

  it('accepts postgres microsecond timestamps from persisted manager assignments and action rows', async () => {
    const { validateActionCenterRouteActionWriteInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionWriteInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterRouteActionWriteInput(
        buildCanonicalOpenActionInput({
          owner_assigned_at: '2026-04-21T08:00:00.860788+00:00',
          created_at: '2026-04-21T09:00:00.123456+00:00',
          updated_at: '2026-04-21T09:00:00.123456+00:00',
        }),
      ),
    ).toMatchObject({
      owner_assigned_at: '2026-04-21T08:00:00.860788+00:00',
      created_at: '2026-04-21T09:00:00.123456+00:00',
      updated_at: '2026-04-21T09:00:00.123456+00:00',
    })
  })

  it('rejects impossible iso timestamps instead of normalizing them through Date parsing', async () => {
    const { validateActionCenterRouteActionWriteInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionWriteInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(() =>
      validateActionCenterRouteActionWriteInput(
        buildCanonicalOpenActionInput({
          owner_assigned_at: '2026-02-31T08:00:00.000Z',
        }),
      ),
    ).toThrow('Ongeldige route action input.')
  })

  it('accepts a bounded route action draft without requiring server-derived identity fields', async () => {
    const { validateActionCenterRouteActionDraftInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionDraftInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(validateActionCenterRouteActionDraftInput(buildDraftInput())).toMatchObject({
      primary_action_theme_key: 'leadership',
      primary_action_status: null,
      review_scheduled_for: '2026-05-15',
      semanticState: 'draft',
      validationDisposition: 'valid',
    })
  })

  it('strips submitted active-looking status from retained draft truth before promotion', async () => {
    const { validateActionCenterRouteActionDraftInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionDraftInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterRouteActionDraftInput(
        buildDraftInput({
          primary_action_status: 'open',
        }),
      ),
    ).toMatchObject({
      primary_action_status: null,
      semanticState: 'draft',
      validationDisposition: 'valid',
    })
  })

  it('keeps weak draft quality in draft truth with invalid disposition instead of throwing', async () => {
    const { validateActionCenterRouteActionDraftInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionDraftInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterRouteActionDraftInput(
        buildDraftInput({
          primary_action_text: 'Wat moeten we hier nu mee doen?',
          primary_action_expected_effect: 'Plan daarna de follow-up met het managementteam.',
        }),
      ),
    ).toMatchObject({
      semanticState: 'draft',
      validationDisposition: 'invalid',
    })
  })

  it('retains missing draft content as invalid draft truth instead of throwing', async () => {
    const { validateActionCenterRouteActionDraftInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionDraftInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterRouteActionDraftInput(
        buildDraftInput({
          primary_action_theme_key: null,
          primary_action_text: null,
          primary_action_expected_effect: null,
          review_scheduled_for: null,
        }),
      ),
    ).toMatchObject({
      primary_action_theme_key: null,
      primary_action_text: null,
      primary_action_expected_effect: null,
      review_scheduled_for: null,
      semanticState: 'draft',
      validationDisposition: 'invalid',
    })
  })

  it.each([
    {
      label: 'a freeform date string is submitted',
      review_scheduled_for: 'tomorrow',
    },
    {
      label: 'an impossible iso date is submitted',
      review_scheduled_for: '2026-02-31',
    },
  ])('normalizes review timing away when $label', async ({ review_scheduled_for }) => {
    const { validateActionCenterRouteActionDraftInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionDraftInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterRouteActionDraftInput(
        buildDraftInput({
          review_scheduled_for,
        }),
      ),
    ).toMatchObject({
      review_scheduled_for: null,
      semanticState: 'draft',
      validationDisposition: 'invalid',
    })
  })

  it('retains broad project language as a draft that needs hr review', async () => {
    const { validateActionCenterRouteActionDraftInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionDraftInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterRouteActionDraftInput(
        buildDraftInput({
          primary_action_text: 'Start een organisatiebreed verbeterproject en werk de roadmap voor meerdere teams uit.',
          primary_action_expected_effect:
            'Binnen twee weken moet duidelijk zijn welke workstreams in dit programma moeten landen.',
        }),
      ),
    ).toMatchObject({
      semanticState: 'draft',
      validationDisposition: 'needs_hr_review',
    })
  })

  it('retains dossier-like route language as an invalid draft instead of throwing', async () => {
    const { validateActionCenterRouteActionDraftInput } = await import('./action-center-route-actions') as {
      validateActionCenterRouteActionDraftInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterRouteActionDraftInput(
        buildDraftInput({
          primary_action_text: 'Leg het dossier aan en vul de vervolgroute en stopreden voor deze casus bij.',
          primary_action_expected_effect:
            'Binnen twee weken moet duidelijk zijn of het dossier compleet genoeg is voor verdere routing.',
        }),
      ),
    ).toMatchObject({
      semanticState: 'draft',
      validationDisposition: 'invalid',
    })
  })

  it('models the hr-only promotion path from draft to active route action truth', async () => {
    const { isActionCenterCanonicalRouteStateTransitionAllowed } = await import('./action-center-constitution') as {
      isActionCenterCanonicalRouteStateTransitionAllowed: (input: Record<string, unknown>) => boolean
    }

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'route_action',
        fromState: 'draft',
        toState: 'active',
        draftValidationDisposition: 'valid',
      }),
    ).toBe(true)

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'manager_participant',
        object: 'route_action',
        fromState: 'draft',
        toState: 'active',
        draftValidationDisposition: 'valid',
      }),
    ).toBe(false)
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
