import { describe, expect, it } from 'vitest'
import {
  CANONICAL_CUSTOMER_LIFECYCLE,
  CANONICAL_ONBOARDING_PHASES,
  CLIENT_FILE_SPEC,
  FIRST_VALUE_THRESHOLDS,
  IMPLEMENTATION_INTAKE_INPUTS,
  PRODUCT_ROUTE_VARIANTS,
  getAdoptionSuccessDefinition,
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
    expect(CLIENT_FILE_SPEC.required).toEqual(['email'])
    expect(CLIENT_FILE_SPEC.recommended).toEqual(['department', 'role_level'])
    expect(CLIENT_FILE_SPEC.exitOptional).toContain('exit_month')
  })

  it('keeps ExitScan first and follow-on variants explicit', () => {
    expect(PRODUCT_ROUTE_VARIANTS.map((route) => route.title)).toEqual([
      'ExitScan Baseline',
      'ExitScan ritmeroute',
      'RetentieScan Baseline',
      'RetentieScan ritmeroute',
    ])
  })

  it('keeps scan-specific first-read guidance and adoption success definitions aligned', () => {
    expect(getFirstManagementReadSteps('exit')[0]?.toLowerCase()).toContain('beslisoverzicht')
    expect(getFirstManagementReadSteps('retention')[2]?.toLowerCase()).toContain('behoud')
    expect(getFirstManagementReadSteps('pulse')[0]?.toLowerCase()).toContain('managementread')
    expect(getFirstManagementReadSteps('pulse')[2]?.toLowerCase()).toContain('bounded')
    expect(getFirstManagementReadSteps('team')[2]?.toLowerCase()).toContain('begrensde actie')
    expect(getFirstManagementReadSteps('onboarding')[0]?.toLowerCase()).toContain('checkpoint')
    expect(getFirstManagementReadSteps('onboarding')[2]?.toLowerCase()).toContain('volgend checkpoint')
    expect(getFirstManagementReadSteps('onboarding')[2]?.toLowerCase()).toContain('eerste eigenaar')
    expect(getFirstManagementReadSteps('leadership')[0]?.toLowerCase()).toContain('managementread')
    expect(getFirstManagementReadSteps('leadership')[0]?.toLowerCase()).toContain('named leader')
    expect(getFirstManagementReadSteps('leadership')[2]?.toLowerCase()).toContain('eerste eigenaar')
    expect(getFirstManagementReadSteps('leadership')[2]?.toLowerCase()).toContain('bounded vervolgcheck')
    expect(getFirstManagementReadSteps('exit')[2]?.toLowerCase()).toContain('reviewmoment')
    expect(getFirstManagementReadSteps('retention')[2]?.toLowerCase()).toContain('eerste eigenaar')
    expect(getAdoptionSuccessDefinition('exit').toLowerCase()).toContain('dashboard en rapport')
    expect(getAdoptionSuccessDefinition('retention').toLowerCase()).toContain('behoud')
    expect(getAdoptionSuccessDefinition('pulse').toLowerCase()).toContain('bounded checkmoment')
    expect(getAdoptionSuccessDefinition('team').toLowerCase()).toContain('lokaal reviewmoment')
    expect(getAdoptionSuccessDefinition('onboarding').toLowerCase()).toContain('checkpoint')
    expect(getAdoptionSuccessDefinition('onboarding').toLowerCase()).toContain('eerste eigenaar')
    expect(getAdoptionSuccessDefinition('leadership').toLowerCase()).toContain('managementread')
    expect(getAdoptionSuccessDefinition('leadership').toLowerCase()).toContain('begrensde verificatie')
    expect(getAdoptionSuccessDefinition('exit').toLowerCase()).toContain('reviewmoment')
    expect(getAdoptionSuccessDefinition('retention').toLowerCase()).toContain('eerste managementsessie')
  })

  it('keeps the canonical lifecycle and expansion routes explicit per product', () => {
    const exitDecisions = getLifecycleDecisionCards('exit')
    const retentionDecisions = getLifecycleDecisionCards('retention')
    const pulseDecisions = getLifecycleDecisionCards('pulse')

    expect(CANONICAL_CUSTOMER_LIFECYCLE.map((phase) => phase.key)).toEqual([
      'first_route',
      'first_value',
      'repeat_or_expand',
    ])
    expect(exitDecisions[0]?.body.toLowerCase()).toContain('exitscan ritmeroute')
    expect(exitDecisions[2]?.body.toLowerCase()).toContain('retentiescan baseline')
    expect(retentionDecisions[0]?.body.toLowerCase()).toContain('retentiescan ritmeroute')
    expect(retentionDecisions[2]?.body.toLowerCase()).toContain('exitscan')
    expect(pulseDecisions[0]?.body.toLowerCase()).toContain('kleine correctie')
    expect(pulseDecisions[2]?.title.toLowerCase()).toContain('retentiescan')
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
    expect(onboardingDecisions[2]?.body.toLowerCase()).toContain('retentiescan')
    expect(leadershipDecisions[0]?.body.toLowerCase()).toContain('eerste managementread')
    expect(leadershipDecisions[1]?.body.toLowerCase()).toContain('named leaders')
    expect(leadershipDecisions[2]?.body.toLowerCase()).toContain('teamscan')
    expect(leadershipDecisions[2]?.title.toLowerCase()).toContain('bredere duiding')
    expect(leadershipDecisions[2]?.body.toLowerCase()).not.toContain('diagnose')
  })
})
