import type { DeliveryMode, ScanType } from '@/lib/types'

export const CAMPAIGN_SCAN_OPTIONS: Array<{ value: ScanType; title: string; short: string }> = [
  { value: 'exit', title: 'Loep Vertrek', short: 'Vertrek en frictie' },
  { value: 'retention', title: 'Loep Behoud', short: 'Behoud onder druk' },
  { value: 'culture_assessment', title: 'Loep Culture Assessment', short: 'Jaarlijkse cultuur- en engagementbaseline' },
  { value: 'pulse', title: 'Pulse', short: 'Korte momentcheck' },
  { value: 'team', title: 'TeamScan', short: 'Lokaal teambeeld' },
  { value: 'onboarding', title: 'Loep Start', short: 'Vroege instroomcheck' },
  { value: 'leadership', title: 'Leadership Scan', short: 'Geaggregeerde managementread' },
]

const ONBOARDING_DEFAULT_MODULES = ['leadership', 'role_clarity', 'culture', 'growth']
const PULSE_DEFAULT_MODULES = ['leadership', 'growth', 'workload']
const TEAM_DEFAULT_MODULES = ['leadership', 'culture', 'workload', 'role_clarity']
const LEADERSHIP_DEFAULT_MODULES = ['leadership', 'role_clarity', 'culture', 'growth']

export function isBaselineOnlyScanType(scanType: ScanType) {
  return scanType === 'pulse' || scanType === 'team' || scanType === 'onboarding' || scanType === 'leadership' || scanType === 'culture_assessment'
}

export function getCampaignNamePlaceholder(scanType: ScanType) {
  if (scanType === 'exit') return 'Loep Vertrek Q2 2026'
  if (scanType === 'retention') return 'Loep Behoud Voorjaar 2026'
  if (scanType === 'culture_assessment') return 'Loep Cultuurbeeld 2026'
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
  if (scanType === 'culture_assessment') return []
  return []
}

export function supportsCampaignModuleSelection(scanType: ScanType) {
  return scanType !== 'culture_assessment'
}

export function supportsCampaignReportAddOns(scanType: ScanType) {
  void scanType
  return false
}

export function getCampaignReportAddOnSetupNote(scanType: ScanType) {
  if (scanType === 'culture_assessment') {
    return 'Governed report add-ons zoals segment deep dive blijven in v1 admin/manual-seeded en zijn niet klantconfigureerbaar in campaign setup.'
  }

  return null
}

export function getAllowedDeliveryModes(scanType: ScanType): DeliveryMode[] {
  return isBaselineOnlyScanType(scanType) ? ['baseline'] : ['baseline', 'live']
}
