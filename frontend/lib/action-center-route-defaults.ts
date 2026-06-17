import {
  ACTION_CENTER_APPROVED_ROUTE_FAMILIES,
  getActionCenterApprovedRouteDefault,
  type ActionCenterApprovedRouteDefault,
  type ActionCenterApprovedRouteFamily,
} from '@/lib/action-center-constitution'

export const ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES = [
  'exit',
  'retention',
  'onboarding',
  'pulse',
  'leadership',
  'team',
] as const

export const ACTION_CENTER_ROUTE_DEFAULTS_ENABLED_SCAN_TYPES = ACTION_CENTER_APPROVED_ROUTE_FAMILIES
export const ACTION_CENTER_ROUTE_FAMILY_LABELS = {
  exit: 'Loep Vertrek',
  retention: 'Loep Behoud',
} as const

export type ActionCenterRouteDefaultsKnownScanType =
  (typeof ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES)[number]

export type ActionCenterRouteDefaultsEnabledScanType = ActionCenterApprovedRouteFamily
export type ActionCenterRouteFamilyLabel =
  (typeof ACTION_CENTER_ROUTE_FAMILY_LABELS)[ActionCenterApprovedRouteFamily]

export interface ActionCenterRouteDefaults {
  scanType: ActionCenterRouteDefaultsKnownScanType
  actionCenterStatus: 'enabled' | 'blocked'
  routeEnabled: boolean
  cadenceDays: number
  reminderLeadDays: number
  escalationLeadDays: number
  reviewWindowDays?: {
    min: number
    max: number
  }
  staleAfterDays?: number
  stuckActiveWarningDays?: number | { min: number; max: number }
  reviewDueGraceDays?: number
  sprawlRiskCount?: number
  repeatedReviewWarningCount?: number
  remindersEnabled: boolean
  providerEligible: boolean
}

export interface ActionCenterExecutionThresholds {
  stuckActiveWarningDays: number | { min: number; max: number }
  reviewDueGraceDays: number
  sprawlRiskCount: number
  repeatedReviewWarningCount: number
}

const BASELINE_ROUTE_DEFAULTS = {
  cadenceDays: 14 as const,
  reminderLeadDays: 3 as const,
  escalationLeadDays: 7 as const,
}

const ACTION_CENTER_EXECUTION_THRESHOLDS = {
  exit: {
    stuckActiveWarningDays: 30,
    reviewDueGraceDays: 7,
    sprawlRiskCount: 3,
    repeatedReviewWarningCount: 2,
  },
  retention: Object.freeze({
    stuckActiveWarningDays: Object.freeze({ min: 21, max: 30 }),
    reviewDueGraceDays: 7,
    sprawlRiskCount: 3,
    repeatedReviewWarningCount: 2,
  }),
} satisfies Record<ActionCenterApprovedRouteFamily, ActionCenterExecutionThresholds>

function cloneActionCenterExecutionThresholds(
  thresholds: ActionCenterExecutionThresholds,
): ActionCenterExecutionThresholds {
  return {
    ...thresholds,
    stuckActiveWarningDays:
      typeof thresholds.stuckActiveWarningDays === 'number'
        ? thresholds.stuckActiveWarningDays
        : { ...thresholds.stuckActiveWarningDays },
  }
}

function buildEnabledRouteDefaults(
  approvedRouteDefault: ActionCenterApprovedRouteDefault,
): ActionCenterRouteDefaults {
  return {
    scanType: approvedRouteDefault.scanType,
    actionCenterStatus: 'enabled',
    routeEnabled: true,
    cadenceDays: approvedRouteDefault.cadenceDays,
    reminderLeadDays: approvedRouteDefault.reminderLeadDays,
    escalationLeadDays: approvedRouteDefault.escalationLeadDays,
    reviewWindowDays: approvedRouteDefault.reviewWindowDays,
    staleAfterDays: approvedRouteDefault.staleAfterDays,
    ...cloneActionCenterExecutionThresholds(
      ACTION_CENTER_EXECUTION_THRESHOLDS[approvedRouteDefault.scanType],
    ),
    remindersEnabled: true,
    providerEligible: true,
  }
}

function buildBlockedRouteDefaults(
  scanType: Exclude<ActionCenterRouteDefaultsKnownScanType, ActionCenterApprovedRouteFamily>,
): ActionCenterRouteDefaults {
  return {
    scanType,
    actionCenterStatus: 'blocked',
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
  const approvedRouteDefault = getActionCenterApprovedRouteDefault(scanType)
  if (approvedRouteDefault) {
    return buildEnabledRouteDefaults(approvedRouteDefault)
  }

  switch (scanType) {
    case 'onboarding':
    case 'pulse':
    case 'leadership':
    case 'team':
      return buildBlockedRouteDefaults(scanType)
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

export function getActionCenterRouteFamilyLabel(
  scanType: string | null | undefined,
): ActionCenterRouteFamilyLabel | null {
  const defaults = getActionCenterEnabledRouteDefaults(scanType)
  if (!defaults) {
    return null
  }

  return ACTION_CENTER_ROUTE_FAMILY_LABELS[defaults.scanType]
}

export function getActionCenterEnabledRouteDefaults(
  scanType: string | null | undefined,
): (ActionCenterRouteDefaults &
  ActionCenterExecutionThresholds & {
    scanType: ActionCenterRouteDefaultsEnabledScanType
  }) | null {
  const defaults = getActionCenterRouteDefaults(scanType)
  if (!defaults?.routeEnabled) {
    return null
  }

  return defaults as ActionCenterRouteDefaults &
    ActionCenterExecutionThresholds & {
      scanType: ActionCenterRouteDefaultsEnabledScanType
    }
}

export function getActionCenterScanTypeFromSourceLabel(
  sourceLabel: string | null | undefined,
): ActionCenterRouteDefaultsKnownScanType | null {
  const normalized = sourceLabel?.trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'exitscan':
      return 'exit'
    case 'retentiescan':
      return 'retention'
    case 'onboarding 30-60-90':
      return 'onboarding'
    case 'pulse':
      return 'pulse'
    case 'leadership scan':
      return 'leadership'
    case 'teamscan':
      return 'team'
    default:
      return null
  }
}
