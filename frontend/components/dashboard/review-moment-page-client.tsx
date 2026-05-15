'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { ReviewRhythmConsole } from '@/components/dashboard/review-rhythm-console'
import type { ActionCenterPreviewItem, ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'
import {
  buildDefaultActionCenterReviewRhythmConfig,
  classifyActionCenterReviewRhythmStatus,
  type ActionCenterReviewRhythmConfig,
} from '@/lib/action-center-review-rhythm'
import {
  formatReviewMomentLastUpdated,
  getReviewMomentManagerLabel,
  getReviewMomentScopeLabel,
  groupReviewMomentsByUrgency,
  type ReviewMomentUrgency,
  type ReviewMomentGovernanceCounts,
} from '@/lib/action-center-review-moments'
import { ReviewMomentCounterRow } from '@/components/dashboard/review-moment-counter-row'
import { ReviewMomentDetailPanel } from '@/components/dashboard/review-moment-detail-panel'
import { ReviewMomentGovernanceSection } from '@/components/dashboard/review-moment-governance-section'
import { ReviewMomentLane } from '@/components/dashboard/review-moment-lane'

const STATUS_OPTIONS: Array<{ value: 'all' | ActionCenterPreviewStatus; label: string }> = [
  { value: 'all', label: 'Status' },
  { value: 'open-verzoek', label: 'Open verzoek' },
  { value: 'te-bespreken', label: 'Gepland' },
  { value: 'reviewbaar', label: 'Gepland' },
  { value: 'in-uitvoering', label: 'In uitvoering' },
  { value: 'geblokkeerd', label: 'Gepland' },
  { value: 'afgerond', label: 'Afgerond' },
  { value: 'gestopt', label: 'Gestopt' },
]

function getOrganizationBreadcrumbLabel(organizationName: string) {
  return [organizationName, 'Action Center', 'HR scope'].join(' · ')
}

function getFirstVisibleItem(items: ActionCenterPreviewItem[]) {
  return items[0]?.id ?? null
}

type ReviewRhythmSummary = {
  staleCount: number
  overdueCount: number
  upcomingCount: number
  reminderManagedCount: number
}

function isExitRouteItem(item: Pick<ActionCenterPreviewItem, 'sourceLabel'>) {
  return item.sourceLabel === 'ExitScan'
}

function computeRhythmSummary(
  items: ActionCenterPreviewItem[],
  configByRouteId: Record<string, ActionCenterReviewRhythmConfig>,
  now: Date,
): ReviewRhythmSummary {
  return items.filter(isExitRouteItem).reduce<ReviewRhythmSummary>(
    (acc, item) => {
      const config = configByRouteId[item.id] ?? buildDefaultActionCenterReviewRhythmConfig()
      const health = classifyActionCenterReviewRhythmStatus({
        reviewDate: item.reviewDate,
        now,
        config,
        itemStatus: item.status,
      })

      if (health === 'stale') acc.staleCount += 1
      if (health === 'overdue') acc.overdueCount += 1
      if (health === 'upcoming') acc.upcomingCount += 1
      if (health !== 'completed' && config.remindersEnabled) acc.reminderManagedCount += 1

      return acc
    },
    {
      staleCount: 0,
      overdueCount: 0,
      upcomingCount: 0,
      reminderManagedCount: 0,
    },
  )
}

export function ReviewMomentPageClient({
  items,
  governanceCounts,
  organizationName,
  lastUpdated,
  canScheduleActionCenterReview,
  inviteDownloadEligibleRouteIds,
  canManageReviewRhythm,
  rhythmConfigByRouteId,
  rhythmSummary,
}: {
  items: ActionCenterPreviewItem[]
  governanceCounts: ReviewMomentGovernanceCounts
  organizationName: string
  lastUpdated: string
  canScheduleActionCenterReview: boolean
  inviteDownloadEligibleRouteIds: string[]
  canManageReviewRhythm: boolean
  rhythmConfigByRouteId: Record<string, ActionCenterReviewRhythmConfig>
  rhythmSummary: ReviewRhythmSummary
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | ActionCenterPreviewStatus>('all')
  const [scopeFilter, setScopeFilter] = useState<string>('all')
  const [managerFilter, setManagerFilter] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(getFirstVisibleItem(items))
  const [clientRhythmConfigByRouteId, setClientRhythmConfigByRouteId] = useState(rhythmConfigByRouteId)

  const referenceNow = useMemo(() => new Date(lastUpdated), [lastUpdated])
  const inviteDownloadEligibleRouteIdSet = useMemo(
    () => new Set(inviteDownloadEligibleRouteIds),
    [inviteDownloadEligibleRouteIds],
  )
  const scopeOptions = useMemo(
    () => [...new Set(items.map((item) => getReviewMomentScopeLabel(item)))].sort((left, right) => left.localeCompare(right)),
    [items],
  )
  const managerOptions = useMemo(
    () =>
      [...new Set(items.map((item) => getReviewMomentManagerLabel(item)))].sort((left, right) => left.localeCompare(right)),
    [items],
  )

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (scopeFilter !== 'all' && getReviewMomentScopeLabel(item) !== scopeFilter) return false
        if (managerFilter !== 'all' && getReviewMomentManagerLabel(item) !== managerFilter) return false
        return true
      }),
    [items, managerFilter, scopeFilter, statusFilter],
  )

  const grouped = useMemo(() => groupReviewMomentsByUrgency(filteredItems, referenceNow), [filteredItems, referenceNow])
  const visibleItems = useMemo(() => {
    const base = [...grouped.overdue, ...grouped['this-week'], ...grouped.upcoming]
    if (showCompleted || statusFilter === 'afgerond' || statusFilter === 'gestopt') {
      base.push(...grouped.completed)
    }
    return base
  }, [grouped, showCompleted, statusFilter])

  useEffect(() => {
    if (!visibleItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(getFirstVisibleItem(visibleItems))
    }
  }, [selectedItemId, visibleItems])

  useEffect(() => {
    setClientRhythmConfigByRouteId(rhythmConfigByRouteId)
  }, [rhythmConfigByRouteId])

  const selectedItem = visibleItems.find((item) => item.id === selectedItemId) ?? null
  const selectedUrgency: ReviewMomentUrgency | null = selectedItem
    ? grouped.overdue.some((item) => item.id === selectedItem.id)
      ? 'overdue'
      : grouped['this-week'].some((item) => item.id === selectedItem.id)
        ? 'this-week'
        : grouped.upcoming.some((item) => item.id === selectedItem.id)
          ? 'upcoming'
          : grouped.completed.some((item) => item.id === selectedItem.id)
            ? 'completed'
            : null
    : null
  const canDownloadInviteArtifact = canScheduleActionCenterReview && Boolean(
    selectedItem?.id && inviteDownloadEligibleRouteIdSet.has(selectedItem.id),
  )
  const lastUpdatedLabel = formatReviewMomentLastUpdated(lastUpdated)
  const visibleRhythmSummary = useMemo(() => {
    if (!items.some(isExitRouteItem)) {
      return rhythmSummary
    }

    return computeRhythmSummary(items, clientRhythmConfigByRouteId, referenceNow)
  }, [clientRhythmConfigByRouteId, items, referenceNow, rhythmSummary])

  function handleReviewRhythmSaved(nextConfig: ActionCenterReviewRhythmConfig) {
    if (!selectedItem?.id) {
      return
    }

    setClientRhythmConfigByRouteId((current) => ({
      ...current,
      [selectedItem.id]: nextConfig,
    }))
  }

  if (items.length === 0) {
    return (
      <DashboardPanel
        surface="ops"
        eyebrow="Reviewmomenten"
        title="Nog geen reviewmomenten beschikbaar"
        body="Zodra er actieve opvolging is met een geplande reviewdatum, verschijnen die hier."
        tone="slate"
      />
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Action Center"
        title="Reviewmomenten"
        description="Bewaak geplande opvolgmomenten, gekoppelde scopes en bekende uitkomsten."
        meta={
          <div className="flex flex-wrap gap-2">
            <DashboardChip surface="ops" label={getOrganizationBreadcrumbLabel(organizationName)} />
            {lastUpdatedLabel ? <DashboardChip surface="ops" tone="slate" label={lastUpdatedLabel} /> : null}
          </div>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Context</p>
            <p>Deze pagina toont reviewritme. Geen scananalyse, rapportduiding of generieke planning.</p>
          </div>
        }
      />

      <DashboardSection
        surface="ops"
        eyebrow="Filters"
        title="Filter reviewmomenten"
        description="Filter client-side op status, scope of manager zonder een tweede data- of planningslaag toe te voegen."
      >
        <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,220px)),1fr]">
          <select
            aria-label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | ActionCenterPreviewStatus)}
            className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm text-[color:var(--dashboard-ink)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Scope"
            value={scopeFilter}
            onChange={(event) => setScopeFilter(event.target.value)}
            className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm text-[color:var(--dashboard-ink)]"
          >
            <option value="all">Scope</option>
            {scopeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            aria-label="Manager"
            value={managerFilter}
            onChange={(event) => setManagerFilter(event.target.value)}
            className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm text-[color:var(--dashboard-ink)]"
          >
            <option value="all">Manager</option>
            {managerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </DashboardSection>

      <ReviewMomentCounterRow
        overdueCount={grouped.overdue.length}
        thisWeekCount={grouped['this-week'].length}
        upcomingCount={grouped.upcoming.length}
        completedCount={grouped.completed.length}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted((current) => !current)}
      />

      <div id="review-lanes" className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr),minmax(320px,0.82fr)]">
        <div className="space-y-8">
          <ReviewMomentLane
            urgency="overdue"
            items={grouped.overdue}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
          />
          <ReviewMomentLane
            urgency="this-week"
            items={grouped['this-week']}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
          />
          <ReviewMomentLane
            urgency="upcoming"
            items={grouped.upcoming}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
          />
          {showCompleted || statusFilter === 'afgerond' || statusFilter === 'gestopt' ? (
            <ReviewMomentLane
              urgency="completed"
              items={grouped.completed}
              selectedItemId={selectedItemId}
              onSelect={setSelectedItemId}
            />
          ) : null}
        </div>
        <div id="review-detail" className="xl:sticky xl:top-[8rem] xl:self-start">
          <ReviewMomentDetailPanel
            item={selectedItem}
            urgency={selectedUrgency}
            canDownloadInviteArtifact={canDownloadInviteArtifact}
          />
        </div>
      </div>

      <ReviewRhythmConsole
        selectedRouteId={selectedItem?.id ?? null}
        selectedRouteLabel={selectedItem ? getReviewMomentScopeLabel(selectedItem) : null}
        selectedRouteSourceId={selectedItem?.coreSemantics.route.campaignId ?? null}
        selectedRouteOrgId={selectedItem?.orgId ?? null}
        selectedRouteScanType={selectedItem?.sourceLabel === 'ExitScan' ? 'exit' : null}
        canManageReviewRhythm={canManageReviewRhythm}
        config={
          (selectedItem?.id ? clientRhythmConfigByRouteId[selectedItem.id] : null) ??
          buildDefaultActionCenterReviewRhythmConfig()
        }
        summary={visibleRhythmSummary}
        onConfigSaved={handleReviewRhythmSaved}
      />

      <ReviewMomentGovernanceSection counts={governanceCounts} />


      <DashboardSection
        surface="ops"
        eyebrow="Footer"
        title="Reviewmomenten blijven bounded"
        description="Reviewmomenten tonen ritme en discipline. Acties, dashboardduiding en rapportinhoud staan op aparte pagina's."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowCompleted((current) => !current)}
            className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
          >
            Bekijk afgeronde reviews
          </button>
          <Link
            href="/action-center"
            className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-white"
          >
            Bekijk gekoppelde opvolging
          </Link>
        </div>
      </DashboardSection>
    </div>
  )
}
