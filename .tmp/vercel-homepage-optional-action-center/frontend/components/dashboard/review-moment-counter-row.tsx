'use client'

import { DashboardSummaryBar } from '@/components/dashboard/dashboard-primitives'

export function ReviewMomentCounterRow({
  overdueCount,
  thisWeekCount,
  upcomingCount,
  completedCount,
  showCompleted,
  onToggleCompleted,
}: {
  overdueCount: number
  thisWeekCount: number
  upcomingCount: number
  completedCount: number
  showCompleted: boolean
  onToggleCompleted: () => void
}) {
  return (
    <DashboardSummaryBar
      surface="ops"
      items={[
        {
          label: 'Achterstallig',
          value: `${overdueCount}`,
          tone: overdueCount > 0 ? 'amber' : 'slate',
        },
        {
          label: 'Deze week',
          value: `${thisWeekCount}`,
          tone: thisWeekCount > 0 ? 'amber' : 'slate',
        },
        {
          label: 'Binnenkort',
          value: `${upcomingCount}`,
          tone: upcomingCount > 0 ? 'emerald' : 'slate',
        },
        {
          label: 'Afgerond',
          value: `${completedCount}`,
          tone: completedCount > 0 ? 'slate' : 'slate',
        },
      ]}
      anchors={[
        { id: 'review-lanes', label: 'Reviewlanes' },
        { id: 'review-detail', label: 'Reviewdetail' },
        { id: 'review-governance', label: 'Reviewgovernance' },
      ]}
      actions={
        <button
          type="button"
          onClick={onToggleCompleted}
          className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
        >
          {showCompleted ? 'Verberg afgeronde reviews' : 'Bekijk afgeronde reviews'}
        </button>
      }
    />
  )
}
