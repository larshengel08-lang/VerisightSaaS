'use client'

import { DashboardChip } from '@/components/dashboard/dashboard-primitives'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import {
  getReviewMomentActionLabel,
  getReviewMomentManagerLabel,
  getReviewMomentOutcomeSummary,
  getReviewMomentScopeLabel,
  getReviewMomentStatusLabel,
  type ReviewMomentUrgency,
} from '@/lib/action-center-review-moments'

function getStatusTone(item: ActionCenterPreviewItem, urgency: ReviewMomentUrgency) {
  if (item.status === 'afgerond' || item.status === 'gestopt') {
    return 'slate' as const
  }

  if (urgency === 'overdue') {
    return 'amber' as const
  }

  if (item.status === 'in-uitvoering') {
    return 'emerald' as const
  }

  return 'slate' as const
}

export function ReviewMomentCard({
  item,
  urgency,
  selected,
  onSelect,
}: {
  item: ActionCenterPreviewItem
  urgency: ReviewMomentUrgency
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`w-full rounded-[20px] border p-4 text-left transition ${
        selected
          ? 'border-[color:var(--dashboard-accent)] bg-[color:var(--dashboard-muted-surface)]'
          : 'border-[color:var(--dashboard-frame-border)] bg-white hover:border-[color:var(--dashboard-accent)]/50'
      }`}
    >
      <div className="min-w-0 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
            {item.reviewDate ? item.reviewDateLabel : 'Niet gepland'}
          </p>
          <p className="max-w-full break-words text-lg font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
            {item.title}
          </p>
        </div>
        <DashboardChip
          surface="ops"
          tone={getStatusTone(item, urgency)}
          label={getReviewMomentStatusLabel(item, urgency)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DashboardChip surface="ops" tone="slate" label={item.sourceLabel} />
        <DashboardChip surface="ops" tone="slate" label={getReviewMomentScopeLabel(item)} />
      </div>

      <p className="mt-4 text-sm text-[color:var(--dashboard-text)]">{getReviewMomentManagerLabel(item)}</p>

      <blockquote className="mt-4 rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-4 py-3 text-sm leading-6 text-[color:var(--dashboard-text)]">
        {getReviewMomentOutcomeSummary(item)}
      </blockquote>

      <div className="mt-4 inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)]">
        {getReviewMomentActionLabel(item)}
      </div>
    </button>
  )
}
