'use client'

import Link from 'next/link'
import { DashboardChip, DashboardKeyValue, DashboardPanel } from '@/components/dashboard/dashboard-primitives'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import {
  getReviewMomentManagerLabel,
  getReviewMomentOutcomeSummary,
  getReviewMomentScopeLabel,
  getReviewMomentScopeTypeLabel,
  getReviewMomentStatusLabel,
  type ReviewMomentUrgency,
} from '@/lib/action-center-review-moments'

function formatDateLabel(value: string | null) {
  if (!value) {
    return 'Niet beschikbaar'
  }

  return new Date(value).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ReviewMomentDetailPanel({
  item,
  urgency,
}: {
  item: ActionCenterPreviewItem | null
  urgency: ReviewMomentUrgency | null
}) {
  if (!item) {
    return (
      <DashboardPanel
        surface="ops"
        eyebrow="Reviewdetail"
        title="Geen reviewmoment geselecteerd"
        body="Selecteer een reviewmoment om details te bekijken."
        tone="slate"
      />
    )
  }

  return (
    <div className="space-y-4 rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white p-5 shadow-[0_10px_24px_rgba(19,32,51,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        <DashboardChip surface="ops" tone="slate" label="Reviewdetail" />
        <DashboardChip surface="ops" tone="slate" label={getReviewMomentStatusLabel(item, urgency)} />
      </div>

      <div>
        <p className="text-lg font-semibold text-[color:var(--dashboard-ink)]">{getReviewMomentScopeLabel(item)}</p>
        <p className="mt-1 text-sm text-[color:var(--dashboard-text)]">{item.title}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardKeyValue surface="ops" label="Reviewstatus" value={getReviewMomentStatusLabel(item, urgency)} />
        <DashboardKeyValue
          surface="ops"
          label="Volgende datum"
          value={item.reviewDate ? formatDateLabel(item.reviewDate) : 'Niet gepland'}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardKeyValue surface="ops" label="Scope" value={getReviewMomentScopeTypeLabel(item.scopeType)} />
        <DashboardKeyValue surface="ops" label="Manager" value={getReviewMomentManagerLabel(item)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardKeyValue surface="ops" label="Route" value={item.coreSemantics.route.routeId} />
        <DashboardKeyValue surface="ops" label="Open acties" value={`${item.openSignals.length}`} />
      </div>

      <blockquote className="rounded-[18px] bg-[color:var(--dashboard-topbar-strong)] px-4 py-4 text-sm leading-7 text-white">
        {getReviewMomentOutcomeSummary(item)}
      </blockquote>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/action-center?focus=${encodeURIComponent(item.id)}`}
          className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
        >
          Bekijk gekoppelde opvolging
        </Link>
      </div>
    </div>
  )
}
