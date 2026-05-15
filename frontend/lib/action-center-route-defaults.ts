export const ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES = [
  'exit',
  'retention',
  'onboarding',
  'pulse',
  'leadership',
  'team',
] as const

export const ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES = ['exit', 'retention'] as const

export type ActionCenterRouteDefaultsKnownScanType =
  (typeof ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES)[number]

export type ActionCenterRouteDefaultsEnabledScanType =
  (typeof ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES)[number]

export interface ActionCenterRouteDefaults {
  scanType: ActionCenterRouteDefaultsKnownScanType
  routeEnabled: boolean
  cadenceDays: 14
  reminderLeadDays: 3
  escalationLeadDays: 7
  remindersEnabled: boolean
  providerEligible: boolean
}

const BASELINE_ROUTE_DEFAULTS = {
  cadenceDays: 14 as const,
  reminderLeadDays: 3 as const,
  escalationLeadDays: 7 as const,
}

function buildEnabledRouteDefaults(
  scanType: ActionCenterRouteDefaultsEnabledScanType,
): ActionCenterRouteDefaults {
  return {
    scanType,
    routeEnabled: true,
    ...BASELINE_ROUTE_DEFAULTS,
    remindersEnabled: true,
    providerEligible: true,
  }
}

function buildBlockedRouteDefaults(
  scanType: Exclude<ActionCenterRouteDefaultsKnownScanType, ActionCenterRouteDefaultsEnabledScanType>,
): ActionCenterRouteDefaults {
  return {
    scanType,
    routeEnabled: false,
    ...BASELINE_ROUTE_DEFAULTS,
    remindersEnabled: false,
    providerEligible: false,
  }
}

export function isActionCenterRouteDefaultsKnownScanType(
  scanType: string | null | undefined,
): scanType is ActionCenterRouteDefaultsKnownScanType {
  return (
    scanType === 'exit' ||
    scanType === 'retention' ||
    scanType === 'onboarding' ||
    scanType === 'pulse' ||
    scanType === 'leadership' ||
    scanType === 'team'
  )
}

export function getActionCenterRouteDefaults(
  scanType: string | null | undefined,
): ActionCenterRouteDefaults | null {
  switch (scanType) {
    case 'exit':
      return buildEnabledRouteDefaults('exit')
    case 'retention':
      return buildEnabledRouteDefaults('retention')
    case 'onboarding':
      return buildBlockedRouteDefaults('onboarding')
    case 'pulse':
      return buildBlockedRouteDefaults('pulse')
    case 'leadership':
      return buildBlockedRouteDefaults('leadership')
    case 'team':
      return buildBlockedRouteDefaults('team')
    default:
      return null
  }
}

export function isActionCenterRouteDefaultsEnabledScanType(
  scanType: string | null | undefined,
): scanType is ActionCenterRouteDefaultsEnabledScanType {
  return scanType === 'exit' || scanType === 'retention'
}

export function isActionCenterRouteDefaultsProviderEligibleScanType(
  scanType: string | null | undefined,
) {
  const defaults = getActionCenterRouteDefaults(scanType)
  return defaults?.providerEligible === true
}
