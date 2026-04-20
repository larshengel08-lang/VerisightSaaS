'use client'

import { useMemo, useState } from 'react'
import {
  buildManagementActionAccessEnvelope,
  buildManagementActionSummary,
  canViewManagementAction,
  type ManagementActionDepartmentOwnerDefault,
  type ManagementActionRecord,
  type ManagementActionReviewRecord,
  type ManagementActionUpdateRecord,
} from '@/lib/management-actions'
import { buildMtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'
import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'
import type { MemberRole } from '@/lib/types'
import { MtoDepartmentOverview } from './mto-department-overview'
import { MtoPriorityThemeGrid } from './mto-priority-theme-grid'
import { MtoFollowThroughNav } from './mto-follow-through-nav'
import { MtoThemeDetailPanel } from './mto-theme-detail-panel'
import { MtoActionList } from './mto-action-list'
import { MtoReviewQueue } from './mto-review-queue'

export interface MtoManagerCockpitProps {
  organizationId: string
  campaignId: string
  currentViewerRole: MemberRole | null
  currentUserEmail: string | null
  canManageCampaign: boolean
  readOnly?: boolean
  departmentReads: MtoDepartmentReadItem[]
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews?: ManagementActionReviewRecord[]
  ownerDefaults: ManagementActionDepartmentOwnerDefault[]
}

export function MtoManagerCockpit(props: MtoManagerCockpitProps) {
  const [selectedThemeKey, setSelectedThemeKey] = useState<string | null>(null)
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null)
  const reviews = props.reviews ?? []
  const accessEnvelope = buildManagementActionAccessEnvelope({
    orgRole: props.currentViewerRole,
    userEmail: props.currentUserEmail,
    ownerDefaults: props.ownerDefaults,
  })
  const visibleOwnerDefaults = accessEnvelope.canSeeAll
    ? props.ownerDefaults
    : props.ownerDefaults.filter((entry) => entry.department && accessEnvelope.departmentLabels.includes(entry.department))
  const visibleDepartmentReads = accessEnvelope.canSeeAll
    ? props.departmentReads
    : props.departmentReads.filter((read) => accessEnvelope.departmentLabels.includes(read.segmentLabel))
  const visibleActions = props.actions.filter((action) =>
    canViewManagementAction({
      orgRole: props.currentViewerRole,
      userEmail: props.currentUserEmail,
      ownerDefaults: props.ownerDefaults,
      action,
    }),
  )
  const visibleActionIds = new Set(visibleActions.map((action) => action.id))
  const visibleUpdates = props.updates.filter((update) => visibleActionIds.has(update.action_id))
  const visibleReviews = reviews.filter((review) => visibleActionIds.has(review.action_id))
  const canManageActionCenter =
    !props.readOnly &&
    (props.canManageCampaign ||
      accessEnvelope.departmentLabels.length > 0 ||
      visibleActions.some((action) => action.owner_email?.toLowerCase() === props.currentUserEmail?.toLowerCase()))
  const model = buildMtoActionCenterViewModel({
    departmentReads: visibleDepartmentReads,
    actions: visibleActions,
    updates: visibleUpdates,
    reviews: visibleReviews,
  })
  const summary = buildManagementActionSummary(visibleActions)
  const selectedTheme = useMemo(
    () =>
      selectedThemeKey
        ? model.themeCards.find((theme) => `${theme.departmentLabel}:${theme.factorKey}` === selectedThemeKey) ?? null
        : null,
    [model.themeCards, selectedThemeKey],
  )
  const selectedOwnerDefault =
    selectedTheme
      ? visibleOwnerDefaults.find((entry) => entry.department === selectedTheme.departmentLabel) ?? null
      : null

  return (
    <div className="space-y-6">
      <MtoDepartmentOverview suite={model.departmentSuite} />
      <MtoPriorityThemeGrid themes={model.priorityThemes} onOpenTheme={setSelectedThemeKey} />
      <MtoFollowThroughNav
        items={model.followThroughNavigation}
        activeKey={activeSectionKey}
        onOpenSection={setActiveSectionKey}
      />
      {selectedTheme ? (
        <MtoThemeDetailPanel
          theme={selectedTheme}
          organizationId={props.organizationId}
          campaignId={props.campaignId}
          ownerDefault={selectedOwnerDefault}
          canManageCampaign={canManageActionCenter}
          onClose={() => setSelectedThemeKey(null)}
        />
      ) : null}
      <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Follow-through cockpit</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">Thema's die nu managementaandacht vragen</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Stille acties" value={`${model.followThroughSignals.quietActions}`} compact />
            <MiniStat label="Review nu" value={`${summary.overdueReviewCount}`} compact tone="amber" />
            <MiniStat label="Recent gereviewd" value={`${model.followThroughSignals.recentlyReviewed}`} compact />
          </div>
        </div>
        <div className="mt-5">
          <p className="text-sm leading-7 text-slate-600">
            Gebruik deze cockpit om van afdelingsbeeld naar thema, dossier of review door te gaan. De detailstappen openen gericht onder de overzichtslaag.
          </p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),minmax(320px,0.85fr)]">
        <MtoActionList
          actions={visibleActions}
          updates={visibleUpdates}
          reviews={visibleReviews}
          ownerDefaults={visibleOwnerDefaults}
          currentViewerRole={props.currentViewerRole}
          currentUserEmail={props.currentUserEmail}
          canManageCampaign={canManageActionCenter}
          readOnly={props.readOnly}
        />
        <MtoReviewQueue reviewQueue={model.reviewQueue} reviews={visibleReviews} />
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
