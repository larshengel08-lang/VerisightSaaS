import { describe, expect, it } from 'vitest'
import { getDisclosureDefaults } from '@/app/(dashboard)/campaigns/[id]/page-helpers'

describe('getDisclosureDefaults', () => {
  it('keeps analysis closed and focus open once enough data is available', () => {
    const defaults = getDisclosureDefaults({
      scanType: 'exit',
      hasEnoughData: true,
      hasMinDisplay: true,
      respondentsLength: 12,
      canManageCampaign: true,
    })

    expect(defaults.analysisOpen).toBe(false)
    expect(defaults.focusOpen).toBe(true)
    expect(defaults.respondentsOpen).toBe(false)
    expect(defaults.methodologyOpen).toBe(true)
  })

  it('opens operational context while a campaign is still building', () => {
    const defaults = getDisclosureDefaults({
      scanType: 'retention',
      hasEnoughData: false,
      hasMinDisplay: false,
      respondentsLength: 4,
      canManageCampaign: true,
    })

    expect(defaults.focusOpen).toBe(false)
    expect(defaults.respondentsOpen).toBe(true)
    expect(defaults.methodologyOpen).toBe(true)
  })
})
