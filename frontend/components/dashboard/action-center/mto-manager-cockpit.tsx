'use client'

import { buildManagementActionSummary, type ManagementActionDepartmentOwnerDefault, type ManagementActionRecord, type ManagementActionReviewRecord, type ManagementActionUpdateRecord } from '@/lib/management-actions'
import { buildMtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'
import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'
import type { MemberRole } from '@/lib/types'
import { MtoDepartmentOverview } from './mto-department-overview'
import { MtoThemePanel } from './mto-theme-panel'
import { MtoActionList } from './mto-action-list'
import { MtoReviewQueue } from './mto-review-queue'

export interface MtoManagerCockpitProps {
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

export function MtoManagerCockpit(props: MtoManagerCockpitProps) {
  const reviews = props.reviews ?? []
  const model = buildMtoActionCenterViewModel({
    departmentReads: props.departmentReads,
    actions: props.actions,
    updates: props.updates,
    reviews,
  })
  const summary = buildManagementActionSummary(props.actions)

  return (
    <div className="space-y-6">
      <MtoDepartmentOverview overview={model.departmentOverview} />
      <div className="grid gap-4 lg:grid-cols-4">
        <MiniStat label="Open sporen" value={`${summary.openCount}`} />
        <MiniStat label="In review" value={`${summary.reviewCount}`} />
        <MiniStat label="Vervolg nodig" value={`${summary.followUpCount}`} />
        <MiniStat label="Over tijd" value={`${summary.overdueReviewCount}`} />
      </div>
      <MtoThemePanel
        themeCards={model.themeCards}
        organizationId={props.organizationId}
        campaignId={props.campaignId}
        ownerDefaults={props.ownerDefaults}
        canManageCampaign={props.canManageCampaign}
      />
      <MtoActionList
        actions={props.actions}
        updates={props.updates}
        currentViewerRole={props.currentViewerRole}
        currentUserEmail={props.currentUserEmail}
        canManageCampaign={props.canManageCampaign}
      />
      <MtoReviewQueue reviewQueue={model.reviewQueue} reviews={reviews} />
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  )
}
