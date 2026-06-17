import { describe, expect, it } from 'vitest'
import { buildContactQualificationVisibilitySummary } from '@/lib/contact-qualification'

describe('contact qualification visibility summary', () => {
  it('keeps core-default leads pointed at Loep Vertrek', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'exitscan',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen beter begrijpen welke vertrekfrictie hier onder zit.',
    })

    expect(summary.tone).toBe('blue')
    expect(summary.recommendationLabel).toContain('Loep Vertrek')
    expect(summary.nextAction.toLowerCase()).toContain('loep vertrek')
  })

  it('surfaces Loep Behoud as the only primary exception when the question clearly fits', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'retentiescan',
      desiredTiming: 'deze-maand',
      currentQuestion: 'We willen eerder zien waar behoud en stay-intent op groepsniveau onder druk staan.',
    })

    expect(summary.tone).toBe('emerald')
    expect(summary.headline).toContain('Loep Behoud')
    expect(summary.recommendationLabel).toContain('Loep Behoud')
  })

  it('surfaces Loep Culture Assessment for broad culture and engagement baseline questions', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'culture_assessment',
      desiredTiming: 'dit-kwartaal',
      currentQuestion:
        'We willen een brede jaarlijkse cultuur- en engagementbaseline met vertrouwen, leiderschap, samenwerking en werkbeleving op organisatieniveau.',
    })

    expect(summary.tone).toBe('emerald')
    expect(summary.headline).toContain('Loep Culture Assessment')
    expect(summary.recommendationLabel).toContain('Loep Culture Assessment')
    expect(summary.nextAction.toLowerCase()).toContain('organisatiebreed')
  })

  it('treats onboarding as a bounded peer instead of a flat first route', () => {
    const summary = buildContactQualificationVisibilitySummary({
      routeInterest: 'onboarding',
      desiredTiming: 'dit-kwartaal',
      currentQuestion: 'We willen vroeg zien hoe nieuwe medewerkers landen en waar het eerste checkpoint frictie laat zien.',
    })

    expect(summary.tone).toBe('amber')
    expect(summary.headline.toLowerCase()).toContain('bounded peer')
    expect(summary.routeReviewLabel).toContain('Loep Start')
    expect(summary.nextAction.toLowerCase()).toContain('checkpoint')
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
