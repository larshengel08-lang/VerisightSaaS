import { describe, expect, it } from 'vitest'
import {
  CANONICAL_ONBOARDING_PHASES,
  CLIENT_FILE_SPEC,
  FIRST_VALUE_THRESHOLDS,
  IMPLEMENTATION_INTAKE_INPUTS,
  PRODUCT_ROUTE_VARIANTS,
  getAdoptionSuccessDefinition,
  getFirstManagementReadSteps,
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
      'ExitScan Live',
      'RetentieScan Baseline',
      'RetentieScan ritme',
    ])
  })

  it('keeps scan-specific first-read guidance and adoption success definitions aligned', () => {
    expect(getFirstManagementReadSteps('exit')[0]?.toLowerCase()).toContain('beslisoverzicht')
    expect(getFirstManagementReadSteps('retention')[2]?.toLowerCase()).toContain('behoud')
    expect(getFirstManagementReadSteps('exit')[2]?.toLowerCase()).toContain('reviewmoment')
    expect(getFirstManagementReadSteps('retention')[2]?.toLowerCase()).toContain('eerste eigenaar')
    expect(getAdoptionSuccessDefinition('exit').toLowerCase()).toContain('dashboard en rapport')
    expect(getAdoptionSuccessDefinition('retention').toLowerCase()).toContain('behoud')
    expect(getAdoptionSuccessDefinition('exit').toLowerCase()).toContain('reviewmoment')
    expect(getAdoptionSuccessDefinition('retention').toLowerCase()).toContain('eerste managementsessie')
  })
})
