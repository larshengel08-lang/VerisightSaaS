'use client'

import { MtoManagerCockpit } from '@/components/dashboard/action-center/mto-manager-cockpit'
import type {
  ManagementActionDepartmentOwnerDefault,
  ManagementActionRecord,
  ManagementActionReviewRecord,
  ManagementActionUpdateRecord,
} from '@/lib/management-actions'
import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'
import type { MemberRole } from '@/lib/types'

interface Props {
  organizationId: string
  campaignId: string
  currentViewerRole: MemberRole | null
  currentUserEmail: string | null
  canManageCampaign: boolean
  departmentReads: MtoDepartmentReadItem[]
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews?: ManagementActionReviewRecord[]
  ownerDefaults: ManagementActionDepartmentOwnerDefault[]
}

export function MtoActionTracker(props: Props) {
  return <MtoManagerCockpit {...props} reviews={props.reviews ?? []} />
}
