import { describe, expect, it } from 'vitest'
import { buildContactQualificationVisibilitySummary } from '@/lib/contact-qualification'

describe('contact qualification visibility summary', () => {
  it('keeps core-default leads pointed at ExitScan', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'exitscan',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen beter begrijpen welke vertrekfrictie hier onder zit.',
    })

    expect(summary.tone).toBe('blue')
    expect(summary.recommendationLabel).toContain('ExitScan')
    expect(summary.nextAction.toLowerCase()).toContain('exitscan')
  })

  it('surfaces RetentieScan as the only primary exception when the question clearly fits', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'retentiescan',
      desiredTiming: 'deze-maand',
      currentQuestion: 'We willen eerder zien waar behoud en stay-intent op groepsniveau onder druk staan.',
    })

    expect(summary.tone).toBe('emerald')
    expect(summary.headline).toContain('RetentieScan')
    expect(summary.recommendationLabel).toContain('RetentieScan')
  })

  it('treats follow-on routes as review items instead of flat first routes', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'teamscan',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'Na een bestaand retentiesignaal willen we in teams zien waar eerst verificatie nodig is.',
    })

    expect(summary.tone).toBe('amber')
    expect(summary.headline).toContain('TeamScan')
    expect(summary.recommendationLabel).toContain('RetentieScan')
    expect(summary.nextAction.toLowerCase()).toContain('baseline')
  })

  it('shows confirmed qualification routes as the handoff truth once review is done', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'leadership',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'Na een bestaand signaal willen we de managementcontext beter duiden.',
      qualificationStatus: 'route_confirmed',
      qualifiedRoute: 'leadership',
      qualificationReviewedBy: 'Verisight Intake',
    })

    expect(summary.tone).toBe('emerald')
    expect(summary.headline).toContain('Leadership Scan')
    expect(summary.recommendationLabel).toContain('Leadership Scan')
    expect(summary.nextAction.toLowerCase()).toContain('handoff')
  })

  it('forces nog-onzeker back into an active route decision', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'nog-onzeker',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen eerst de juiste eerste route bepalen.',
    })

    expect(summary.tone).toBe('slate')
    expect(summary.headline.toLowerCase()).toContain('routevernauwing')
    expect(summary.nextAction.toLowerCase()).toContain("nog niet zeker")
  })
})
