import { describe, expect, it } from 'vitest'
import { getContactQualificationGuidance } from '@/lib/contact-funnel'

describe('contact qualification guidance', () => {
  it('keeps ExitScan as the default route when the intake is still broad or uncertain', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'nog-onzeker',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen beter begrijpen wat er speelt rond vertrek en frictie in onze organisatie.',
    })

    expect(guidance.status).toBe('uncertain_core_review')
    expect(guidance.recommendedCoreRoute).toBe('exitscan')
    expect(guidance.followOnCandidateRoute).toBeNull()
    expect(guidance.headline.toLowerCase()).toContain('exitscan')
  })

  it('allows RetentieScan to become the primary recommendation for clear early-signal retention questions', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'retentiescan',
      desiredTiming: 'deze-maand',
      currentQuestion: 'We willen eerder zien waar behoud en stay-intent op groepsniveau onder druk staan.',
    })

    expect(guidance.status).toBe('retention_primary')
    expect(guidance.recommendedCoreRoute).toBe('retentiescan')
    expect(guidance.followOnCandidateRoute).toBeNull()
  })

  it('keeps combinatie bounded to genuine double questions', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'combinatie',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'We willen zowel vertrek achteraf duiden als vroeg zien waar behoud al begint te schuiven.',
    })

    expect(guidance.status).toBe('combination_candidate')
    expect(guidance.recommendedCoreRoute).toBe('combinatie')
  })

  it('treats Pulse and Leadership as bounded vervolgkeuzes when a prior signal is explicitly present', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'pulse',
      desiredTiming: 'deze-maand',
      currentQuestion: 'Na een bestaand retentiesignaal willen we met een compacte vervolgmeting zien wat nu verschuift.',
    })

    expect(guidance.status).toBe('bounded_follow_on_review')
    expect(guidance.recommendedCoreRoute).toBe('retentiescan')
    expect(guidance.followOnCandidateRoute).toBe('pulse')
    expect(guidance.detail.toLowerCase()).toContain('bestaand signaal')
  })

  it('keeps onboarding as a bounded peer wanneer de vraag direct over nieuwe medewerkers gaat', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'onboarding',
      desiredTiming: 'deze-maand',
      currentQuestion: 'We willen op 30, 60 en 90 dagen beter zien hoe nieuwe medewerkers landen.',
    })

    expect(guidance.status).toBe('bounded_peer_review')
    expect(guidance.recommendedCoreRoute).toBe('exitscan')
    expect(guidance.followOnCandidateRoute).toBe('onboarding')
    expect(guidance.headline.toLowerCase()).toContain('bounded peer')
  })

  it('reframes follow-on routes back to a core route when no earlier signal is present', () => {
    const guidance = getContactQualificationGuidance({
      routeInterest: 'leadership',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen onze leadershipcontext beter begrijpen, maar hebben nog geen eerder signaal of eerste route.',
    })

    expect(guidance.status).toBe('follow_on_reframe')
    expect(guidance.recommendedCoreRoute).toBe('exitscan')
    expect(guidance.followOnCandidateRoute).toBe('leadership')
    expect(guidance.operatorSummary.toLowerCase()).toContain('exitscan')
  })
})
