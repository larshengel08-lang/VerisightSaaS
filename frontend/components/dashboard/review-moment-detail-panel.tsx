'use client'

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

function buildReviewInviteDownloadHref(args: {
  reviewItemId: string
  mode?: 'cancel' | 'request'
  revision?: number | null
}) {
  const params = new URLSearchParams({
    reviewItemId: args.reviewItemId,
    format: 'ics',
  })

  if (args.mode) {
    params.set('mode', args.mode)
  }

  if (typeof args.revision === 'number') {
    params.set('revision', String(args.revision))
  }

  return `/api/action-center-review-invites?${params.toString()}`
}

function parseRouteScopeValueFromRoute(item: ActionCenterPreviewItem) {
  const routeId = item.coreSemantics.route.routeId
  const campaignId = item.coreSemantics.route.campaignId
  const prefix = `${campaignId}::`

  return routeId.startsWith(prefix) ? routeId.slice(prefix.length) : null
}

function canRenderReviewInviteDownload(
  item: ActionCenterPreviewItem,
  canDownloadInviteArtifact: boolean,
  artifactPreviewOverride: { mode: 'cancel' | 'request'; revision: number | null } | null,
) {
  if (!canDownloadInviteArtifact) {
    return false
  }

  const hasReviewArtifact = Boolean(item.reviewDate) || artifactPreviewOverride?.mode === 'cancel'
  return hasReviewArtifact && item.status !== 'afgerond' && item.status !== 'gestopt'
}

function isActiveReviewRoute(item: ActionCenterPreviewItem) {
  return item.status !== 'afgerond' && item.status !== 'gestopt'
}

function canRenderReviewRescheduleControls(
  item: ActionCenterPreviewItem,
  canScheduleReviewControls: boolean,
) {
  return canScheduleReviewControls && isActiveReviewRoute(item)
}

function canRenderNativeCalendarSync(
  item: ActionCenterPreviewItem,
  canUseNativeCalendarSync: boolean,
) {
  return canUseNativeCalendarSync && canRenderReviewInviteDownload(item, true, null)
}

function getInitialDraftReviewDate(item: ActionCenterPreviewItem | null) {
  return item?.reviewDate ?? ''
}

export function ReviewMomentDetailPanel({
  item,
  urgency,
  canDownloadInviteArtifact,
  canScheduleReviewControls,
  canUseNativeCalendarSync,
  selectedRouteScanType,
}: {
  item: ActionCenterPreviewItem | null
  urgency: ReviewMomentUrgency | null
  canDownloadInviteArtifact: boolean
  canScheduleReviewControls: boolean
  canUseNativeCalendarSync: boolean
  selectedRouteScanType: string | null
}) {
  const router = useRouter()
  const [draftReviewDate, setDraftReviewDate] = useState(getInitialDraftReviewDate(item))
  const [feedback, setFeedback] = useState<string | null>(null)
  const [artifactPreviewOverride, setArtifactPreviewOverride] = useState<{
    mode: 'cancel' | 'request'
    revision: number | null
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setDraftReviewDate(getInitialDraftReviewDate(item))
  }, [item])

  useEffect(() => {
    setFeedback(null)
    setArtifactPreviewOverride(null)
  }, [item?.id])

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

  const selectedItem = item

  async function syncNativeCalendar() {
    setFeedback(null)
    startTransition(async () => {
      try {
        const response = await fetch('/api/action-center-review-invites', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            reviewItemId: selectedItem.id,
            syncProvider: 'microsoft_graph',
            revision: artifactPreviewOverride?.revision ?? undefined,
            mode: artifactPreviewOverride?.mode,
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | {
              graphSync?: {
                status?: 'linked' | 'already-current' | 'fallback' | 'failed' | 'cancelled'
              }
              detail?: string
            }
          | null

        if (!response.ok) {
          setFeedback(payload?.detail ?? 'Outlook-agenda kon niet worden bijgewerkt.')
          return
        }

        const graphStatus = payload?.graphSync?.status
        if (graphStatus === 'linked' || graphStatus === 'cancelled' || graphStatus === 'already-current') {
          setFeedback('Outlook-agenda bijgewerkt. Action Center blijft leidend voor reviewstatus.')
          return
        }

        if (graphStatus === 'fallback') {
          setFeedback('Outlook-sync is hier niet actief. De .ics-download blijft beschikbaar.')
          return
        }

        setFeedback('Outlook-agenda kon niet worden bijgewerkt. De .ics-download blijft beschikbaar.')
      } catch {
        setFeedback('Outlook-agenda kon niet worden bijgewerkt. De .ics-download blijft beschikbaar.')
      }
    })
  }

  async function submitReviewSchedule(operation: 'cancel' | 'reschedule') {
    const routeScopeValue = parseRouteScopeValueFromRoute(selectedItem)
    if (!routeScopeValue || !selectedItem.orgId) {
      setFeedback('Reviewroute is nog niet volledig beschikbaar voor beheer.')
      return
    }

    if (operation === 'reschedule' && !draftReviewDate) {
      setFeedback('Kies eerst een nieuwe reviewdatum.')
      return
    }

    setFeedback(null)
    startTransition(async () => {
      try {
        const response = await fetch('/api/action-center-review-reschedules', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            operation,
            routeId: selectedItem.coreSemantics.route.routeId,
            routeScopeValue,
            routeSourceId: selectedItem.coreSemantics.route.campaignId,
            orgId: selectedItem.orgId,
            scanType: selectedRouteScanType,
            reviewDate: operation === 'cancel' ? null : draftReviewDate,
            reason:
              operation === 'cancel'
                ? 'reviewmoment-vervalt'
                : 'reviewmoment-verplaatst',
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { detail?: string; operation?: 'cancel' | 'reschedule'; reviewDate?: string | null; revision?: number }
          | null

        if (!response.ok) {
          setFeedback(payload?.detail ?? 'Reviewmoment kon niet worden bijgewerkt.')
          return
        }

        setArtifactPreviewOverride({
          mode: payload?.operation === 'cancel' ? 'cancel' : 'request',
          revision: typeof payload?.revision === 'number' ? payload.revision : null,
        })

        if (operation === 'cancel') {
          setDraftReviewDate(payload?.reviewDate ?? '')
          setFeedback('Reviewmoment geannuleerd. De detailkaart wordt ververst.')
        } else {
          setDraftReviewDate(payload?.reviewDate ?? draftReviewDate)
          setFeedback('Reviewmoment verplaatst. De detailkaart wordt ververst.')
        }

        router.refresh()
      } catch {
        setFeedback('Reviewmoment kon niet worden bijgewerkt.')
      }
    })
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
        {canRenderReviewInviteDownload(item, canDownloadInviteArtifact, artifactPreviewOverride) ? (
          <Link
            href={buildReviewInviteDownloadHref({
              reviewItemId: item.id,
              mode: artifactPreviewOverride?.mode,
              revision: artifactPreviewOverride?.revision,
            })}
            className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)]"
          >
            Download .ics
          </Link>
        ) : null}
        {canRenderNativeCalendarSync(item, canUseNativeCalendarSync) ? (
          <button
            type="button"
            onClick={() => void syncNativeCalendar()}
            disabled={isPending}
            className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sync Outlook-agenda
          </button>
        ) : null}
      </div>

      {canRenderReviewRescheduleControls(item, canScheduleReviewControls) ? (
        <div className="space-y-3 rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">Reviewdatum beheren</p>
            <p className="text-xs text-[color:var(--dashboard-text)]">
              Houd deze actie compact binnen de reviewkaart.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="date"
              value={draftReviewDate}
              onChange={(event) => setDraftReviewDate(event.target.value)}
              className="min-w-[172px] rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-medium text-[color:var(--dashboard-ink)]"
            />
            <button
              type="button"
              onClick={() => void submitReviewSchedule('reschedule')}
              disabled={isPending}
              className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Verplaats review
            </button>
            <button
              type="button"
              onClick={() => void submitReviewSchedule('cancel')}
              disabled={isPending}
              className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annuleer review
            </button>
          </div>
          {feedback ? (
            <p className="text-xs text-[color:var(--dashboard-text)]">{feedback}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
