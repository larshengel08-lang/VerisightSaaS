import { describe, expect, it } from 'vitest'

import {
  CAMPAIGN_SCAN_OPTIONS,
  getAllowedDeliveryModes,
  getCampaignNamePlaceholder,
  getDefaultModulesForScanType,
  isBaselineOnlyScanType,
  supportsCampaignModuleSelection,
  supportsCampaignReportAddOns,
} from '@/lib/campaign-setup'

describe('campaign setup rails', () => {
  it('keeps the supported scan options available in campaign setup', () => {
    expect(CAMPAIGN_SCAN_OPTIONS.map((option) => option.value)).toEqual([
      'exit',
      'retention',
      'pulse',
      'team',
      'onboarding',
      'leadership',
    ])
    expect(getCampaignNamePlaceholder('exit')).toBe('ExitScan Q2 2026')
  })

  it('keeps pulse, team, onboarding and leadership baseline-only in campaign setup', () => {
    expect(isBaselineOnlyScanType('pulse')).toBe(true)
    expect(isBaselineOnlyScanType('team')).toBe(true)
    expect(isBaselineOnlyScanType('onboarding')).toBe(true)
    expect(isBaselineOnlyScanType('leadership')).toBe(true)
    expect(getAllowedDeliveryModes('pulse')).toEqual(['baseline'])
  })

  it('keeps non-survey follow-up scans free from report add-ons while exit/retention stay flexible', () => {
    expect(getDefaultModulesForScanType('leadership')).toEqual(['leadership', 'role_clarity', 'culture', 'growth'])
    expect(supportsCampaignModuleSelection('exit')).toBe(true)
    expect(supportsCampaignReportAddOns('exit')).toBe(true)
    expect(supportsCampaignReportAddOns('pulse')).toBe(false)
  })
})
