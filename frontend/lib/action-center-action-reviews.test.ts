import { describe, expect, it } from 'vitest'

function buildActionReviewInput(overrides: Record<string, unknown> = {}) {
  return {
    action_review_id: 'review-1',
    action_id: 'action-1',
    reviewed_at: '2026-05-12T09:30:00.000Z',
    observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
    action_outcome: 'bijstellen',
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
      actionOutcome: 'bijstellen',
      followUpNote: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
    })
  })

  it('builds a compact action outcome from action outcome plus follow-up note', async () => {
    const { buildCompactActionOutcome } = await import('./action-center-action-reviews') as {
      buildCompactActionOutcome: (input: Record<string, unknown>) => string
    }

    expect(buildCompactActionOutcome(buildActionReviewInput())).toBe(
      'Bijstellen: Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
    )
  })
})
