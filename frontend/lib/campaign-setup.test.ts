import { describe, expect, it } from 'vitest'

import {
  CAMPAIGN_SCAN_OPTIONS,
  SURVEY_DURATION_LABEL,
  getAllowedDeliveryModes,
  getCampaignNamePlaceholder,
  getCampaignReportAddOnSetupNote,
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
    expect(getCampaignReportAddOnSetupNote('culture_assessment')).toContain('admin/manual-seeded')
    expect(getCampaignReportAddOnSetupNote('culture_assessment')).toContain('niet klantconfigureerbaar')
    expect(supportsCampaignReportAddOns('exit')).toBe(false)
    expect(supportsCampaignReportAddOns('retention')).toBe(false)
    expect(getCampaignReportAddOnSetupNote('retention')).toBeNull()
  })
})

describe('SURVEY_DURATION_LABEL', () => {
  it('volgt de invultijd die de vragenlijst zelf noemt', () => {
    expect(SURVEY_DURATION_LABEL.retention).toBe('ongeveer 6 minuten')
    expect(SURVEY_DURATION_LABEL.exit).toBe('ongeveer 8 minuten')
    expect(SURVEY_DURATION_LABEL.onboarding).toBe('ongeveer 3 minuten')
  })

  it('heeft voor elke scan een waarde', () => {
    for (const option of CAMPAIGN_SCAN_OPTIONS) {
      expect(SURVEY_DURATION_LABEL[option.value]).toBeTruthy()
    }
  })
})
