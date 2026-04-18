import { describe, expect, it } from 'vitest'
import { buildMtoAssistedReadinessSummary } from '@/lib/mto-assisted-readiness'

describe('mto assisted readiness summary', () => {
  it('stays inactive when the lead is not internally confirmed as mto', () => {
    const summary = buildMtoAssistedReadinessSummary({
      qualificationStatus: 'needs_route_review',
      qualifiedRoute: null,
      qualificationReviewedBy: null,
      opsOwner: null,
      opsNextStep: null,
      opsHandoffNote: null,
      linkedDeliveryCount: 0,
    })

    expect(summary.applicable).toBe(false)
    expect(summary.headline).toContain('nog niet actief')
  })

  it('keeps internal mto routes blocked until owner and assisted handoff are explicit', () => {
    const summary = buildMtoAssistedReadinessSummary({
      qualificationStatus: 'route_confirmed',
      qualifiedRoute: 'mto',
      qualificationReviewedBy: 'Verisight Intake',
      opsOwner: '',
      opsNextStep: 'Plan intake en bereid eerste managementread voor.',
      opsHandoffNote: '',
      linkedDeliveryCount: 0,
    })

    expect(summary.applicable).toBe(true)
    expect(summary.tone).toBe('amber')
    expect(summary.headline).toContain('nog niet intakeklaar')
    expect(summary.checklistItems.join(' ')).toContain('assisted intake-owner')
    expect(summary.checklistItems.join(' ')).toContain('deliverable-proof')
  })

  it('marks internal mto launch discipline ready when owner, handoff, delivery and proof spine are present', () => {
    const summary = buildMtoAssistedReadinessSummary({
      qualificationStatus: 'route_confirmed',
      qualifiedRoute: 'mto',
      qualificationReviewedBy: 'Verisight Intake',
      opsOwner: 'MTO Lead',
      opsNextStep: 'Plan assisted launch en eerste managementsessie.',
      opsHandoffNote: 'Gebruik deliverable-proof en trustproof, zonder publieke case- of CTA-openstelling.',
      linkedDeliveryCount: 1,
      linkedLearningDossierCount: 1,
      learningCloseoutEvidenceCount: 1,
    })

    expect(summary.applicable).toBe(true)
    expect(summary.tone).toBe('emerald')
    expect(summary.headline).toContain('readiness staat')
    expect(summary.releaseLabel).toContain('intern assisted')
  })
})
