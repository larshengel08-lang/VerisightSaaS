import type { DeliveryMode, ScanType } from '@/lib/types'

export const CAMPAIGN_SCAN_OPTIONS: Array<{ value: ScanType; title: string; short: string }> = [
  { value: 'exit', title: 'ExitScan', short: 'Vertrek en frictie' },
  { value: 'retention', title: 'RetentieScan', short: 'Behoud onder druk' },
  { value: 'pulse', title: 'Pulse', short: 'Korte momentcheck' },
  { value: 'team', title: 'TeamScan', short: 'Lokaal teambeeld' },
  { value: 'onboarding', title: 'Onboarding 30-60-90', short: 'Vroege instroomcheck' },
  { value: 'leadership', title: 'Leadership Scan', short: 'Geaggregeerde managementread' },
]

const ONBOARDING_DEFAULT_MODULES = ['leadership', 'role_clarity', 'culture', 'growth']
const PULSE_DEFAULT_MODULES = ['leadership', 'growth', 'workload']
const TEAM_DEFAULT_MODULES = ['leadership', 'culture', 'workload', 'role_clarity']
const LEADERSHIP_DEFAULT_MODULES = ['leadership', 'role_clarity', 'culture', 'growth']

export function isBaselineOnlyScanType(scanType: ScanType) {
  return scanType === 'pulse' || scanType === 'team' || scanType === 'onboarding' || scanType === 'leadership'
}

export function getCampaignNamePlaceholder(scanType: ScanType) {
  if (scanType === 'exit') return 'ExitScan Q2 2026'
  if (scanType === 'retention') return 'RetentieScan Voorjaar 2026'
  if (scanType === 'pulse') return 'Pulse April 2026'
  if (scanType === 'team') return 'TeamScan Operations Q2 2026'
  if (scanType === 'onboarding') return 'Onboarding checkpoint Mei 2026'
  return 'Leadership Scan Juni 2026'
}

export function getDefaultModulesForScanType(scanType: ScanType): string[] {
  if (scanType === 'pulse') return PULSE_DEFAULT_MODULES
  if (scanType === 'team') return TEAM_DEFAULT_MODULES
  if (scanType === 'onboarding') return ONBOARDING_DEFAULT_MODULES
  if (scanType === 'leadership') return LEADERSHIP_DEFAULT_MODULES
  return []
}

export function supportsCampaignModuleSelection(scanType: ScanType) {
  void scanType
  return true
}

export function supportsCampaignReportAddOns(scanType: ScanType) {
  return scanType !== 'pulse' && scanType !== 'team' && scanType !== 'onboarding' && scanType !== 'leadership'
}

export function getAllowedDeliveryModes(scanType: ScanType): DeliveryMode[] {
  return isBaselineOnlyScanType(scanType) ? ['baseline'] : ['baseline', 'live']
}
