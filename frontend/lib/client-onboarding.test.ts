import { describe, expect, it } from 'vitest'
import {
  CANONICAL_CUSTOMER_LIFECYCLE,
  CANONICAL_ONBOARDING_PHASES,
  CLIENT_FILE_SPEC,
  FIRST_VALUE_THRESHOLDS,
  IMPLEMENTATION_INTAKE_INPUTS,
  PRODUCT_ROUTE_VARIANTS,
  getAdoptionSuccessDefinition,
  getFirstNextStepGuidance,
  getFirstManagementReadSteps,
  getLifecycleDecisionCards,
} from '@/lib/client-onboarding'

describe('client onboarding defaults', () => {
  it('keeps the canonical phase order aligned with the assisted route', () => {
    expect(CANONICAL_ONBOARDING_PHASES.map((phase) => phase.key)).toEqual([
      'route',
      'implementation',
      'setup',
      'import',
      'activation',
      'dashboard',
      'report',
      'management',
    ])
  })

  it('keeps activatie defined as release to the correct dashboard and campaign', () => {
    const activationPhase = CANONICAL_ONBOARDING_PHASES.find((phase) => phase.key === 'activation')

    expect(activationPhase?.outcome.toLowerCase()).toContain('vrijgegeven')
    expect(activationPhase?.outcome.toLowerCase()).toContain('juiste dashboard')
    expect(activationPhase?.outcome.toLowerCase()).toContain('juiste campaign')
    expect(activationPhase?.customerAction.toLowerCase()).toContain('vrijgegeven')
    expect(activationPhase?.customerAction.toLowerCase()).toContain('eerste read')
  })

  it('keeps first-value thresholds aligned with dashboard guardrails', () => {
    expect(FIRST_VALUE_THRESHOLDS).toEqual([
      expect.objectContaining({ minResponses: 0, maxResponses: 4 }),
      expect.objectContaining({ minResponses: 5, maxResponses: 9 }),
      expect.objectContaining({ minResponses: 10, maxResponses: null }),
    ])
  })

  it('keeps the implementation intake explicit and route-aware', () => {
    expect(IMPLEMENTATION_INTAKE_INPUTS).toEqual([
      'Gekozen route',
      'Gewenste timing',
      'Scanmodus',
      'Doelgroep',
      'Benodigde metadata',
      'Contactpersoon',
      'Eerste managementdoel',
    ])
  })

  it('keeps the respondent file specification aligned with assisted import', () => {
    expect(CLIENT_FILE_SPEC.required).toEqual(['email', 'department', 'role_level'])
    expect(CLIENT_FILE_SPEC.recommended).toEqual([])
    expect(CLIENT_FILE_SPEC.exitOptional).toContain('exit_month')
  })

  it('keeps Loep Vertrek first and follow-on variants explicit', () => {
    expect(PRODUCT_ROUTE_VARIANTS.map((route) => route.title)).toEqual([
      'Loep Vertrek Baseline',
      'Loep Vertrek ritmeroute',
      'Loep Behoud Baseline',
      'Loep Behoud ritmeroute',
    ])
  })

  it('keeps scan-specific first-read guidance and adoption success definitions aligned', () => {
    expect(getFirstManagementReadSteps('exit')[0]?.toLowerCase()).toContain('beslisoverzicht')
    expect(getFirstManagementReadSteps('retention')[2]?.toLowerCase()).toContain('behoud')
    expect(getFirstManagementReadSteps('pulse')[0]?.toLowerCase()).toContain('managementduiding')
    expect(getFirstManagementReadSteps('pulse')[2]?.toLowerCase()).toContain('bounded')
    expect(getFirstManagementReadSteps('team')[2]?.toLowerCase()).toContain('begrensde actie')
    expect(getFirstManagementReadSteps('onboarding')[0]?.toLowerCase()).toContain('checkpoint')
    expect(getFirstManagementReadSteps('onboarding')[2]?.toLowerCase()).toContain('volgend checkpoint')
    expect(getFirstManagementReadSteps('onboarding')[2]?.toLowerCase()).toContain('eerste eigenaar')
    expect(getFirstManagementReadSteps('leadership')[0]?.toLowerCase()).toContain('managementduiding')
    expect(getFirstManagementReadSteps('leadership')[0]?.toLowerCase()).toContain('named leader')
    expect(getFirstManagementReadSteps('leadership')[2]?.toLowerCase()).toContain('eerste eigenaar')
    expect(getFirstManagementReadSteps('leadership')[2]?.toLowerCase()).toContain('bounded vervolgcheck')
    expect(getFirstManagementReadSteps('culture_assessment')[0]?.toLowerCase()).toContain('loep culture index')
    expect(getFirstManagementReadSteps('culture_assessment')[1]?.toLowerCase()).toContain('navigatiesignaal')
    expect(getFirstManagementReadSteps('culture_assessment')[2]?.toLowerCase()).toContain('managerlaag')
    expect(getFirstManagementReadSteps('culture_assessment')[2]?.toLowerCase()).toContain('locked')
    expect(getFirstManagementReadSteps('exit')[2]?.toLowerCase()).toContain('reviewmoment')
    expect(getFirstManagementReadSteps('retention')[2]?.toLowerCase()).toContain('eerste eigenaar')
    expect(getAdoptionSuccessDefinition('exit').toLowerCase()).toContain('dashboard en rapport')
    expect(getAdoptionSuccessDefinition('exit').toLowerCase()).toContain('vrijgegeven')
    expect(getAdoptionSuccessDefinition('retention').toLowerCase()).toContain('behoud')
    expect(getAdoptionSuccessDefinition('retention').toLowerCase()).toContain('vrijgegeven')
    expect(getAdoptionSuccessDefinition('pulse').toLowerCase()).toContain('bounded checkmoment')
    expect(getAdoptionSuccessDefinition('team').toLowerCase()).toContain('lokaal reviewmoment')
    expect(getAdoptionSuccessDefinition('onboarding').toLowerCase()).toContain('checkpoint')
    expect(getAdoptionSuccessDefinition('onboarding').toLowerCase()).toContain('eerste eigenaar')
    expect(getAdoptionSuccessDefinition('onboarding').toLowerCase()).toContain('vrijgegeven')
    expect(getAdoptionSuccessDefinition('leadership').toLowerCase()).toContain('managementduiding')
    expect(getAdoptionSuccessDefinition('leadership').toLowerCase()).toContain('begrensde verificatie')
    expect(getAdoptionSuccessDefinition('culture_assessment').toLowerCase()).toContain('jaarlijkse')
    expect(getAdoptionSuccessDefinition('culture_assessment').toLowerCase()).toContain('board')
    expect(getAdoptionSuccessDefinition('culture_assessment').toLowerCase()).toContain('loep culture index')
    expect(getAdoptionSuccessDefinition('exit').toLowerCase()).toContain('reviewmoment')
    expect(getAdoptionSuccessDefinition('retention').toLowerCase()).toContain('eerste managementsessie')
  })

  it('keeps the canonical lifecycle and expansion routes explicit per product', () => {
    const exitDecisions = getLifecycleDecisionCards('exit')
    const retentionDecisions = getLifecycleDecisionCards('retention')
    const pulseDecisions = getLifecycleDecisionCards('pulse')
    const cultureAssessmentDecisions = getLifecycleDecisionCards('culture_assessment')

    expect(CANONICAL_CUSTOMER_LIFECYCLE.map((phase) => phase.key)).toEqual([
      'first_route',
      'first_value',
      'repeat_or_expand',
    ])
    expect(exitDecisions[0]?.body.toLowerCase()).toContain('loep vertrek ritmeroute')
    expect(exitDecisions[2]?.body.toLowerCase()).toContain('loep behoud baseline')
    expect(retentionDecisions[0]?.body.toLowerCase()).toContain('loep behoud ritmeroute')
    expect(retentionDecisions[2]?.body.toLowerCase()).toContain('loep vertrek')
    expect(pulseDecisions[0]?.body.toLowerCase()).toContain('kleine correctie')
    expect(pulseDecisions[2]?.title.toLowerCase()).toContain('loep behoud')
    expect(pulseDecisions[2]?.body.toLowerCase()).toContain('pulse niet eerlijk kan dragen')
    expect(pulseDecisions[1]?.body.toLowerCase()).toContain('bredere duiding')
    expect(pulseDecisions[2]?.title.toLowerCase()).not.toContain('diagnose')
    expect(pulseDecisions[2]?.body.toLowerCase()).not.toContain('diagnose')
    const teamDecisions = getLifecycleDecisionCards('team')
    const onboardingDecisions = getLifecycleDecisionCards('onboarding')
    const leadershipDecisions = getLifecycleDecisionCards('leadership')
    expect(teamDecisions[0]?.body.toLowerCase()).toContain('begrensde actie')
    expect(teamDecisions[2]?.body.toLowerCase()).toContain('managementbespreking')
    expect(teamDecisions[2]?.title.toLowerCase()).toContain('bredere duiding')
    expect(teamDecisions[2]?.body.toLowerCase()).not.toContain('diagnose')
    expect(onboardingDecisions[0]?.body.toLowerCase()).toContain('onboardingcheckpoint')
    expect(onboardingDecisions[2]?.body.toLowerCase()).toContain('loep behoud')
    expect(leadershipDecisions[0]?.body.toLowerCase()).toContain('eerste managementread')
    expect(leadershipDecisions[1]?.body.toLowerCase()).toContain('named leaders')
    expect(leadershipDecisions[2]?.body.toLowerCase()).toContain('teamscan')
    expect(leadershipDecisions[2]?.title.toLowerCase()).toContain('bredere duiding')
    expect(leadershipDecisions[2]?.body.toLowerCase()).not.toContain('diagnose')
    expect(cultureAssessmentDecisions[0]?.body.toLowerCase()).toContain('jaarlijkse')
    expect(cultureAssessmentDecisions[1]?.body.toLowerCase()).toContain('loep culture index')
    expect(cultureAssessmentDecisions[2]?.body.toLowerCase()).toContain('pulse')
    expect(cultureAssessmentDecisions[2]?.body.toLowerCase()).toContain('vervolgroute')
  })

  it('keeps culture assessment follow-on guidance bounded and explicit', () => {
    const guidance = getFirstNextStepGuidance('culture_assessment')
    const guidanceJson = JSON.stringify(guidance).toLowerCase()

    expect(guidance.cards[2]?.body.toLowerCase()).toContain('geen onmiddellijke vervolgrichting')
    expect(guidance.cards[2]?.body.toLowerCase()).toContain('deeper governed work')
    expect(guidance.cards[2]?.body.toLowerCase()).toContain('pulse-follow-on')
    expect(guidance.followOnSuggestions.some((suggestion) => suggestion.productLabel === 'Pulse')).toBe(true)
    expect(guidance.followOnSuggestions.some((suggestion) => suggestion.productLabel === 'Loep Behoud')).toBe(true)
    expect(guidance.followOnSuggestions.some((suggestion) => suggestion.productLabel === 'Loep Vertrek')).toBe(true)
    expect(guidanceJson).not.toContain('teamscan')
  })
})
