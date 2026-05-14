'use client'

import React from 'react'
import Link from 'next/link'
import { DashboardChip, DashboardKeyValue, DashboardPanel } from '@/components/dashboard/dashboard-primitives'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
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

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const parsed = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return 'Niet beschikbaar'
  }

  return parsed.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildReviewInviteDownloadHref(reviewItemId: string) {
  return `/api/action-center-review-invites?reviewItemId=${encodeURIComponent(reviewItemId)}&mode=request&format=ics`
}

function canRenderReviewInviteDownload(
  item: ActionCenterPreviewItem,
  canDownloadInviteArtifact: boolean,
) {
  if (!canDownloadInviteArtifact || !item.reviewDate) {
    return false
  }

  return item.status !== 'afgerond' && item.status !== 'gestopt'
}

export function ReviewMomentDetailPanel({
  item,
  urgency,
  canDownloadInviteArtifact,
}: {
  item: ActionCenterPreviewItem | null
  urgency: ReviewMomentUrgency | null
  canDownloadInviteArtifact: boolean
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
          href={buildActionCenterEntryHref({
            focus: item.id,
            view: 'reviews',
            source: 'review-moments',
          })}
          className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
        >
          Bekijk gekoppelde opvolging
        </Link>
        {canRenderReviewInviteDownload(item, canDownloadInviteArtifact) ? (
          <Link
            href={buildReviewInviteDownloadHref(item.id)}
            className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
          >
            Download .ics
          </Link>
        ) : null}
      </div>
    </div>
  )
}
