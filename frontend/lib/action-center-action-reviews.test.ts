import { describe, expect, it } from 'vitest'

function buildActionReviewInput(overrides: Record<string, unknown> = {}) {
  return {
    action_review_id: 'review-1',
    action_id: 'action-1',
    reviewed_at: '2026-05-12T09:30:00.000Z',
    observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
    action_outcome: 'bijsturen-nodig',
    evidence_source: 'team-conversation',
    confidence_level: 'medium',
    follow_up_note: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
    ...overrides,
  }
}

describe('action center action reviews', () => {
  it('projects a lightweight authored action review with observation and compact outcome truth', async () => {
    const { projectActionCenterActionReview } = await import('./action-center-action-reviews') as {
      projectActionCenterActionReview: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(projectActionCenterActionReview(buildActionReviewInput())).toMatchObject({
      actionReviewId: 'review-1',
      actionId: 'action-1',
      reviewedAt: '2026-05-12T09:30:00.000Z',
      observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
      actionOutcome: 'bijsturen-nodig',
      evidenceSource: 'team-conversation',
      confidenceLevel: 'medium',
      followUpNote: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
    })
  })

  it('accepts postgres microsecond timestamps from persisted action reviews', async () => {
    const { projectActionCenterActionReview } = await import('./action-center-action-reviews') as {
      projectActionCenterActionReview: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(
      projectActionCenterActionReview(
        buildActionReviewInput({
          reviewed_at: '2026-05-12T09:30:00.654321+00:00',
        }),
      ),
    ).toMatchObject({
      reviewedAt: '2026-05-12T09:30:00.654321+00:00',
    })
  })

  it.each([
    '2026-02-31T09:30:00.000Z',
    '2026-05-12T24:00:00.000Z',
    '2026-05-12T09:60:00.000Z',
    '2026-05-12T09:30:61.000Z',
  ])('rejects impossible rollover timestamps: %s', async (reviewed_at) => {
    const { projectActionCenterActionReview } = await import('./action-center-action-reviews') as {
      projectActionCenterActionReview: (input: Record<string, unknown>) => Record<string, unknown>
    }

    expect(() =>
      projectActionCenterActionReview(
        buildActionReviewInput({
          reviewed_at,
        }),
      ),
    ).toThrow('Ongeldige route action review input.')
  })

  it('builds a compact action outcome from action outcome plus follow-up note', async () => {
    const { buildCompactActionOutcome } = await import('./action-center-action-reviews') as {
      buildCompactActionOutcome: (input: Record<string, unknown>) => string
    }

    expect(buildCompactActionOutcome(buildActionReviewInput())).toBe(
      'Bijsturen nodig: Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
    )
  })

  it('resolves review outcomes into canonical action lifecycle states', async () => {
    const { resolveActionCenterActionReviewTransition } = await import('./action-center-action-reviews') as {
      resolveActionCenterActionReviewTransition: (outcome: string) => string
    }

    expect(resolveActionCenterActionReviewTransition('effect-zichtbaar')).toBe('completed')
    expect(resolveActionCenterActionReviewTransition('bijsturen-nodig')).toBe('active')
    expect(resolveActionCenterActionReviewTransition('nog-te-vroeg')).toBe('active')
    expect(resolveActionCenterActionReviewTransition('stoppen')).toBe('stopped')
  })

  it('rejects unknown review outcomes instead of silently falling back', async () => {
    const { resolveActionCenterActionReviewTransition } = await import('./action-center-action-reviews') as {
      resolveActionCenterActionReviewTransition: (outcome: string) => string
    }

    expect(() =>
      resolveActionCenterActionReviewTransition('onbekend'),
    ).toThrow('Unsupported action review outcome: onbekend')
  })
})
