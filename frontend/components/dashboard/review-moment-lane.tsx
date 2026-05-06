'use client'

import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import type { ReviewMomentUrgency } from '@/lib/action-center-review-moments'
import { ReviewMomentCard } from '@/components/dashboard/review-moment-card'

export function ReviewMomentLane({
  urgency,
  items,
  selectedItemId,
  onSelect,
}: {
  urgency: ReviewMomentUrgency
  items: ActionCenterPreviewItem[]
  selectedItemId: string | null
  onSelect: (id: string) => void
}) {
  if (items.length === 0) {
    return null
  }

  const title =
    urgency === 'overdue'
      ? 'Achterstallig'
      : urgency === 'this-week'
        ? 'Deze week'
        : urgency === 'upcoming'
          ? 'Binnenkort'
          : 'Afgerond'

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">{title}</h2>
        <span className="text-sm text-[color:var(--dashboard-text)]">
          {items.length} reviewmoment{items.length === 1 ? '' : 'en'}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ReviewMomentCard
            key={item.id}
            item={item}
            urgency={urgency}
            selected={selectedItemId === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
