import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES,
  ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES,
  getActionCenterRouteDefaults,
  isActionCenterRouteDefaultsEnabledScanType,
  isActionCenterRouteDefaultsKnownScanType,
  isActionCenterRouteDefaultsProviderEligibleScanType,
} from './action-center-route-defaults'

describe('action center route defaults contract', () => {
  it('keeps the known scan families explicit and bounded to the approved slice', () => {
    expect(ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES).toEqual([
      'exit',
      'retention',
      'onboarding',
      'pulse',
      'leadership',
      'team',
    ])
    expect(ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES).toEqual(['exit', 'retention'])
  })

  it('keeps ExitScan as the enabled baseline and unlocks RetentieScan with the same defaults', () => {
    expect(getActionCenterRouteDefaults('exit')).toEqual({
      scanType: 'exit',
      actionCenterStatus: 'enabled',
      routeEnabled: true,
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      remindersEnabled: true,
      providerEligible: true,
    })

    expect(getActionCenterRouteDefaults('retention')).toEqual({
      scanType: 'retention',
      actionCenterStatus: 'enabled',
      routeEnabled: true,
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      remindersEnabled: true,
      providerEligible: true,
    })
  })

  it('fails closed for onboarding, pulse, leadership, and team in this slice', () => {
    for (const scanType of ['onboarding', 'pulse', 'leadership', 'team'] as const) {
      expect(getActionCenterRouteDefaults(scanType)).toEqual({
        scanType,
        actionCenterStatus: 'blocked',
        routeEnabled: false,
        cadenceDays: 14,
        reminderLeadDays: 3,
        escalationLeadDays: 7,
        remindersEnabled: false,
        providerEligible: false,
      })
      expect(isActionCenterRouteDefaultsEnabledScanType(scanType)).toBe(false)
      expect(isActionCenterRouteDefaultsProviderEligibleScanType(scanType)).toBe(false)
    }
  })

  it('keeps the exported predicate helpers aligned with the explicit route tuples', () => {
    for (const scanType of ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES) {
      expect(isActionCenterRouteDefaultsKnownScanType(scanType)).toBe(true)
      expect(Boolean(getActionCenterRouteDefaults(scanType)?.routeEnabled)).toBe(
        ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES.includes(scanType as 'exit' | 'retention'),
      )
      expect(isActionCenterRouteDefaultsEnabledScanType(scanType)).toBe(
        ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES.includes(scanType as 'exit' | 'retention'),
      )
      expect(isActionCenterRouteDefaultsProviderEligibleScanType(scanType)).toBe(
        ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES.includes(scanType as 'exit' | 'retention'),
      )
    }
  })

  it('accepts only the six known scan types and otherwise fails closed', () => {
    expect(isActionCenterRouteDefaultsKnownScanType('exit')).toBe(true)
    expect(isActionCenterRouteDefaultsKnownScanType('retention')).toBe(true)
    expect(isActionCenterRouteDefaultsKnownScanType('team')).toBe(true)

    expect(isActionCenterRouteDefaultsKnownScanType('')).toBe(false)
    expect(isActionCenterRouteDefaultsKnownScanType('Exit')).toBe(false)
    expect(isActionCenterRouteDefaultsKnownScanType('unknown')).toBe(false)
    expect(isActionCenterRouteDefaultsKnownScanType(null)).toBe(false)
    expect(isActionCenterRouteDefaultsKnownScanType(undefined)).toBe(false)

    expect(getActionCenterRouteDefaults('Exit')).toBeNull()
    expect(getActionCenterRouteDefaults('unknown')).toBeNull()
    expect(getActionCenterRouteDefaults('')).toBeNull()
    expect(getActionCenterRouteDefaults(null)).toBeNull()
    expect(getActionCenterRouteDefaults(undefined)).toBeNull()

    expect(isActionCenterRouteDefaultsEnabledScanType('unknown')).toBe(false)
    expect(isActionCenterRouteDefaultsProviderEligibleScanType('unknown')).toBe(false)
  })
})
