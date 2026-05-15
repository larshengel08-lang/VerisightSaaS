import { describe, expect, it } from 'vitest'

function buildReviewRescheduleInput(overrides: Record<string, unknown> = {}) {
  return {
    operation: 'reschedule',
    routeId: '11111111-1111-4111-8111-111111111111::org-1::department::operations',
    routeScopeValue: 'org-1::department::operations',
    routeSourceId: '11111111-1111-4111-8111-111111111111',
    orgId: '22222222-2222-4222-8222-222222222222',
    scanType: 'exit',
    reviewDate: '2099-06-03',
    reason: 'manager-beschikbaar',
    ...overrides,
  }
}

describe('action center review reschedule contract', () => {
  it('accepts a bounded reschedule payload with a future ISO date', async () => {
    const { validateActionCenterReviewRescheduleInput } = await import('./action-center-review-reschedule') as {
      validateActionCenterReviewRescheduleInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(validateActionCenterReviewRescheduleInput(buildReviewRescheduleInput())).toMatchObject({
      operation: 'reschedule',
      reviewDate: '2099-06-03',
      reason: 'manager-beschikbaar',
    })
  })

  it('rejects cancel without an explicit bounded reason', async () => {
    const { validateActionCenterReviewRescheduleInput } = await import('./action-center-review-reschedule') as {
      validateActionCenterReviewRescheduleInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(() =>
      validateActionCenterReviewRescheduleInput(
        buildReviewRescheduleInput({
          operation: 'cancel',
          reviewDate: null,
          reason: null,
        }),
      ),
    ).toThrow('Ongeldige review reschedule input.')
  })

  it('accepts a valid cancel payload with explicit null reviewDate and bounded reason', async () => {
    const { validateActionCenterReviewRescheduleInput } = await import('./action-center-review-reschedule') as {
      validateActionCenterReviewRescheduleInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      validateActionCenterReviewRescheduleInput(
        buildReviewRescheduleInput({
          operation: 'cancel',
          reviewDate: null,
          reason: 'manager-niet-meer-betrokken',
        }),
      ),
    ).toMatchObject({
      operation: 'cancel',
      reviewDate: null,
      reason: 'manager-niet-meer-betrokken',
      routeId: '11111111-1111-4111-8111-111111111111::org-1::department::operations',
    })
  })

  it('rejects cancel when reviewDate is not null', async () => {
    const { validateActionCenterReviewRescheduleInput } = await import('./action-center-review-reschedule') as {
      validateActionCenterReviewRescheduleInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(() =>
      validateActionCenterReviewRescheduleInput(
        buildReviewRescheduleInput({
          operation: 'cancel',
          reviewDate: '2099-06-03',
          reason: 'manager-niet-meer-betrokken',
        }),
      ),
    ).toThrow('Ongeldige review reschedule input.')
  })

  it.each(['', '   ', 'geen-datum'])(
    'rejects cancel when reviewDate is submitted as non-null raw input %j',
    async (reviewDate) => {
      const { validateActionCenterReviewRescheduleInput } = await import('./action-center-review-reschedule') as {
        validateActionCenterReviewRescheduleInput: (input: Record<string, unknown>) => Record<string, unknown>
      }

      expect(() =>
        validateActionCenterReviewRescheduleInput(
          buildReviewRescheduleInput({
            operation: 'cancel',
            reviewDate,
            reason: 'manager-niet-meer-betrokken',
          }),
        ),
      ).toThrow('Ongeldige review reschedule input.')
    },
  )

  it('rejects a forged routeId that does not canonically match routeSourceId and routeScopeValue', async () => {
    const { validateActionCenterReviewRescheduleInput } = await import('./action-center-review-reschedule') as {
      validateActionCenterReviewRescheduleInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(() =>
      validateActionCenterReviewRescheduleInput(
        buildReviewRescheduleInput({
          routeId: '33333333-3333-4333-8333-333333333333::org-1::department::operations',
        }),
      ),
    ).toThrow('Ongeldige review reschedule input.')
  })

  it.each([
    buildReviewRescheduleInput({ reviewDate: '2020-01-01' }),
    buildReviewRescheduleInput({ reviewDate: 'geen-datum' }),
    buildReviewRescheduleInput({ reason: 'r'.repeat(161) }),
    buildReviewRescheduleInput({ routeSourceId: 'geen-uuid' }),
    buildReviewRescheduleInput({ orgId: 'ook-geen-uuid' }),
    buildReviewRescheduleInput({ operation: 'pause' }),
  ])('rejects invalid bounded reschedule input %#', async (input) => {
    const { validateActionCenterReviewRescheduleInput } = await import('./action-center-review-reschedule') as {
      validateActionCenterReviewRescheduleInput: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(() => validateActionCenterReviewRescheduleInput(input)).toThrow(
      'Ongeldige review reschedule input.',
    )
  })

  it('increments the artifact revision monotonically and starts from zero', async () => {
    const { buildNextActionCenterReviewScheduleRevision } = await import('./action-center-review-reschedule') as {
      buildNextActionCenterReviewScheduleRevision: (latestRevision: number | null | undefined) => number
    }

    expect(buildNextActionCenterReviewScheduleRevision(undefined)).toBe(0)
    expect(buildNextActionCenterReviewScheduleRevision(null)).toBe(0)
    expect(buildNextActionCenterReviewScheduleRevision(4)).toBe(5)
  })

  it('maps cancel operations to CANCEL artifacts and reschedules to REQUEST artifacts', async () => {
    const { getActionCenterReviewScheduleArtifactMode } = await import('./action-center-review-reschedule') as {
      getActionCenterReviewScheduleArtifactMode: (operation: 'cancel' | 'reschedule') => 'CANCEL' | 'REQUEST'
    }

    expect(getActionCenterReviewScheduleArtifactMode('cancel')).toBe('CANCEL')
    expect(getActionCenterReviewScheduleArtifactMode('reschedule')).toBe('REQUEST')
  })
})
