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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr),minmax(320px,0.8fr)]">
        <MtoDepartmentOverview overview={model.departmentOverview} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <MiniStat label="Open sporen" value={`${summary.openCount}`} tone="blue" />
          <MiniStat label="In review" value={`${summary.reviewCount}`} tone="amber" />
          <MiniStat label="Vervolg nodig" value={`${summary.followUpCount}`} tone="amber" />
          <MiniStat label="Over tijd" value={`${summary.overdueReviewCount}`} tone="amber" />
        </div>
      </div>
      <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Follow-through cockpit</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">Thema's die nu managementaandacht vragen</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Stille acties" value={`${model.followThroughSignals.quietActions}`} compact />
            <MiniStat label="Review nu" value={`${model.followThroughSignals.reviewDueNow}`} compact tone="amber" />
            <MiniStat label="Recent gereviewd" value={`${model.followThroughSignals.recentlyReviewed}`} compact />
          </div>
        </div>
        <div className="mt-5">
          <MtoThemePanel
            themeCards={model.themeCards}
            organizationId={props.organizationId}
            campaignId={props.campaignId}
            ownerDefaults={props.ownerDefaults}
            canManageCampaign={props.canManageCampaign}
          />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),minmax(320px,0.85fr)]">
        <MtoActionList
          actions={props.actions}
          updates={props.updates}
          currentViewerRole={props.currentViewerRole}
          currentUserEmail={props.currentUserEmail}
          canManageCampaign={props.canManageCampaign}
        />
        <MtoReviewQueue reviewQueue={model.reviewQueue} reviews={reviews} />
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  compact = false,
  tone = 'slate',
}: {
  label: string
  value: string
  compact?: boolean
  tone?: 'slate' | 'blue' | 'amber'
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'blue'
        ? 'border-blue-200 bg-blue-50'
        : 'border-slate-200 bg-slate-50'

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 font-semibold text-slate-950 ${compact ? 'text-sm' : 'text-base'}`}>{value}</p>
    </div>
  )
}
