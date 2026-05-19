import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { buildFallbackReportFilename } from './filenames'
import { canDownloadCampaignReport } from './permissions'

describe('campaign report route', () => {
  it('builds a culture assessment filename from the route label and campaign name', () => {
    expect(buildFallbackReportFilename('culture_assessment', 'Loep Cultuurbeeld 2026')).toBe(
      'Loep_Culture_Assessment_Loep_Cultuurbeeld_2026.pdf',
    )
  })

  it('builds a governed segment summary filename when csv export is requested', () => {
    expect(buildFallbackReportFilename('culture_assessment', 'Loep Cultuurbeeld 2026', 'segment_summary')).toBe(
      'Loep_Culture_Assessment_Loep_Cultuurbeeld_2026.csv',
    )
  })

  it('sanitizes punctuation-heavy names into a stable attachment filename', () => {
    expect(buildFallbackReportFilename('exit', 'Q4 / ExitScan: Sales & Ops')).toBe(
      'ExitScan_Q4_ExitScan_Sales_Ops.pdf',
    )
  })

  it('keeps governed segment summary export behind owner/admin report permissions', () => {
    expect(
      canDownloadCampaignReport({
        format: 'segment_summary',
        isVerisightAdmin: false,
        membershipRole: 'viewer',
      }),
    ).toBe(false)
    expect(
      canDownloadCampaignReport({
        format: 'segment_summary',
        isVerisightAdmin: false,
        membershipRole: 'member',
      }),
    ).toBe(false)
    expect(
      canDownloadCampaignReport({
        format: 'segment_summary',
        isVerisightAdmin: false,
        membershipRole: 'owner',
      }),
    ).toBe(true)
  })

  it('keeps board pdf readable for normal report roles while still allowing admins', () => {
    expect(
      canDownloadCampaignReport({
        format: 'pdf',
        isVerisightAdmin: false,
        membershipRole: 'viewer',
      }),
    ).toBe(true)
    expect(
      canDownloadCampaignReport({
        format: 'pdf',
        isVerisightAdmin: true,
        membershipRole: null,
      }),
    ).toBe(true)
  })
})
