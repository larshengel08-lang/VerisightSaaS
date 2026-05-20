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

export type ActionCenterRouteDefaultsKnownScanType =
  (typeof ACTION_CENTER_ROUTE_DEFAULTS_SCAN_TYPES)[number]

export type ActionCenterRouteDefaultsEnabledScanType = ActionCenterApprovedRouteFamily

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
  stuckActiveWarningDays?: number
  reviewDueGraceDays?: number
  sprawlRiskCount?: number
  repeatedReviewWarningCount?: number
  remindersEnabled: boolean
  providerEligible: boolean
}

export interface ActionCenterExecutionThresholds {
  stuckActiveWarningDays: number
  reviewDueGraceDays: number
  sprawlRiskCount: number
  repeatedReviewWarningCount: number
}

const BASELINE_ROUTE_DEFAULTS = {
  cadenceDays: 14 as const,
  reminderLeadDays: 3 as const,
  escalationLeadDays: 7 as const,
}

const ACTION_CENTER_EXECUTION_THRESHOLDS: Record<
  ActionCenterApprovedRouteFamily,
  ActionCenterExecutionThresholds
> = {
  exit: {
    stuckActiveWarningDays: 30,
    reviewDueGraceDays: 7,
    sprawlRiskCount: 3,
    repeatedReviewWarningCount: 2,
  },
  retention: {
    stuckActiveWarningDays: 21,
    reviewDueGraceDays: 7,
    sprawlRiskCount: 3,
    repeatedReviewWarningCount: 2,
  },
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
    ...ACTION_CENTER_EXECUTION_THRESHOLDS[approvedRouteDefault.scanType],
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

export function getActionCenterEnabledRouteDefaults(
  scanType: string | null | undefined,
): ActionCenterRouteDefaults & { scanType: ActionCenterRouteDefaultsEnabledScanType } | null {
  const defaults = getActionCenterRouteDefaults(scanType)
  if (!defaults?.routeEnabled) {
    return null
  }

  return defaults as ActionCenterRouteDefaults & { scanType: ActionCenterRouteDefaultsEnabledScanType }
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
