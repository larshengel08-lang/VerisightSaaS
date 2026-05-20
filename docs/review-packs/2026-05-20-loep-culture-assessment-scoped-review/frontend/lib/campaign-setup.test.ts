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
  it('registers Loep Culture Assessment as a first-class create option', () => {
    expect(CAMPAIGN_SCAN_OPTIONS.map((option) => option.value)).toContain('culture_assessment')
    expect(getCampaignNamePlaceholder('culture_assessment')).toBe('Loep Cultuurbeeld 2026')
  })

  it('keeps culture_assessment baseline-only in campaign setup', () => {
    expect(isBaselineOnlyScanType('culture_assessment')).toBe(true)
    expect(getAllowedDeliveryModes('culture_assessment')).toEqual(['baseline'])
  })

  it('keeps culture_assessment on a fixed instrument and removes report add-on configuration from beheer', () => {
    expect(getDefaultModulesForScanType('culture_assessment')).toEqual([])
    expect(supportsCampaignModuleSelection('culture_assessment')).toBe(false)
    expect(supportsCampaignReportAddOns('culture_assessment')).toBe(false)
    expect(supportsCampaignReportAddOns('exit')).toBe(false)
    expect(supportsCampaignReportAddOns('retention')).toBe(false)
  })
})
