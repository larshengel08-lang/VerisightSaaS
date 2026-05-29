import { getCustomerActionPermission } from '@/lib/customer-permissions'
import { canAccessCultureAssessmentSegmentSummaryExport } from '@/lib/products/culture_assessment/contract'
import type { MemberRole } from '@/lib/types'
import type { ScanType } from '@/lib/types'

export type ReportDownloadFormat = 'pdf' | 'segment_summary'

export function canDownloadCampaignReport(args: {
  format: ReportDownloadFormat
  scanType?: ScanType
  isVerisightAdmin: boolean
  membershipRole: MemberRole | null | undefined
}) {
  if (args.isVerisightAdmin) {
    return true
  }

  if (!getCustomerActionPermission(args.membershipRole, 'view_report')) {
    return false
  }

  if (args.format === 'segment_summary') {
    if (args.scanType === 'culture_assessment') {
      return canAccessCultureAssessmentSegmentSummaryExport({
        isVerisightAdmin: args.isVerisightAdmin,
        membershipRole: args.membershipRole,
      })
    }

    return getCustomerActionPermission(args.membershipRole, 'review_launch')
  }

  return true
}
