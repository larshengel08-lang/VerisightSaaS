import { getCustomerActionPermission } from '@/lib/customer-permissions'
import type { MemberRole } from '@/lib/types'

export type ReportDownloadFormat = 'pdf' | 'segment_summary'

export function canDownloadCampaignReport(args: {
  format: ReportDownloadFormat
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
    return getCustomerActionPermission(args.membershipRole, 'review_launch')
  }

  return true
}
