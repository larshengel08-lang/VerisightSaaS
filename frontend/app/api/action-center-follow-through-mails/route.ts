import { NextResponse } from 'next/server'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActionCenterFollowThroughMailDispatchData } from '@/lib/action-center-follow-through-mail-data'
import { planActionCenterFollowThroughMailJobs } from '@/lib/action-center-follow-through-mail-planner'
import { renderActionCenterFollowThroughMail } from '@/lib/action-center-follow-through-mail-render'
import {
  deliverActionCenterFollowThroughMail,
  getActionCenterFollowThroughMailEnv,
} from '@/lib/action-center-follow-through-mail-delivery'
import { getActionCenterFollowThroughMailSuppressionReason } from '@/lib/action-center-follow-through-mail'

type FollowThroughMailRouteBody = {
  mode?: unknown
  routeIds?: unknown
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getBaseUrl() {
  const value =
    normalizeText(process.env.FRONTEND_URL) ??
    normalizeText(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeText(process.env.NEXT_PUBLIC_APP_URL) ??
    'http://localhost:3000'

  return new URL(value).origin
}

function parseMode(value: unknown) {
  return value === 'dispatch' ? 'dispatch' : 'dry-run'
}

function parseRouteIds(value: unknown) {
  if (!Array.isArray(value)) return null

  const routeIds = value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0)

  return routeIds.length > 0 ? routeIds : null
}

function isTrustedRequest(request: Request) {
  const cronSecret = normalizeText(process.env.CRON_SECRET)
  const adminToken = normalizeText(process.env.BACKEND_ADMIN_TOKEN)
  const authHeader = normalizeText(request.headers.get('authorization'))
  if (!authHeader) return false

  return Boolean(
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (adminToken && authHeader === `Bearer ${adminToken}`),
  )
}

function buildInviteArtifactHref(routeId: string) {
  const url = new URL('/api/action-center-review-invites', `${getBaseUrl()}/`)
  url.searchParams.set('reviewItemId', routeId)
  url.searchParams.set('format', 'ics')
  return url.toString()
}

function buildActionCenterHref(routeId: string) {
  return new URL(
    buildActionCenterEntryHref({
      focus: routeId,
      view: 'reviews',
      source: 'notification',
    }),
    `${getBaseUrl()}/`,
  ).toString()
}

function createLedgerQueries() {
  const admin = createAdminClient()
  return admin.from('action_center_follow_through_mail_events')
}

async function hasLedgerDedupeKey(dedupeKey: string) {
  const result = await createLedgerQueries()
    .select('dedupe_key')
    .eq('dedupe_key', dedupeKey)
    .maybeSingle()

  if (result.error) {
    throw new Error(result.error.message ?? 'Action Center follow-through dedupe lookup failed.')
  }

  return Boolean(result.data)
}

async function handleDispatch(args: {
  request: Request
  mode: 'dry-run' | 'dispatch'
  requestedRouteIds: string[] | null
}) {
  if (!isTrustedRequest(args.request)) {
    return NextResponse.json({ detail: 'Niet toegestaan.' }, { status: 401 })
  }

  const dispatchData = await getActionCenterFollowThroughMailDispatchData()
  const filteredSnapshots = args.requestedRouteIds
    ? dispatchData.snapshots.filter((snapshot) => args.requestedRouteIds?.includes(snapshot.routeId))
    : dispatchData.snapshots
  const filteredSnapshotsByRouteId = new Map(
    filteredSnapshots.map((snapshot) => [snapshot.routeId, snapshot]),
  )

  if (args.requestedRouteIds && filteredSnapshots.length === 0) {
    return NextResponse.json(
      {
        detail: 'Geen eligible Action Center-routes gevonden voor dispatch.',
      },
      { status: 409 },
    )
  }

  if (filteredSnapshots.length === 0) {
    return NextResponse.json(
      {
        mode: args.mode,
        plannedCount: 0,
        sentCount: 0,
        suppressedCount: 0,
        failedCount: 0,
        jobs: [],
      },
      { status: 200 },
    )
  }

  const ledgerQuery = createLedgerQueries()
  const dedupeRows = await ledgerQuery
    .select('dedupe_key')
    .in('route_id', filteredSnapshots.map((snapshot) => snapshot.routeId))

  if (dedupeRows.error) {
    throw new Error(dedupeRows.error.message ?? 'Action Center follow-through ledger query failed.')
  }

  const existingDedupeKeys = new Set(
    (dedupeRows.data ?? [])
      .map((row) => normalizeText((row as { dedupe_key?: string | null }).dedupe_key))
      .filter((value): value is string => Boolean(value)),
  )

  const planned = planActionCenterFollowThroughMailJobs({
    now: new Date(),
    snapshots: filteredSnapshots,
    existingDedupeKeys,
  })

  if (args.mode === 'dry-run') {
    return NextResponse.json(
      {
        mode: args.mode,
        plannedCount: planned.jobs.length,
        sentCount: 0,
        suppressedCount: planned.suppressions.length,
        failedCount: 0,
        jobs: planned.jobs.map((job) => ({
          routeId: job.routeId,
          triggerType: job.triggerType,
          recipientRole: job.recipientRole,
        })),
        suppressions: planned.suppressions.map((entry) => ({
          routeId: entry.routeId,
          triggerType: entry.triggerType,
          recipientRole: entry.recipientRole,
          suppressionReason: entry.suppressionReason,
        })),
      },
      { status: 200 },
    )
  }

  const refreshedDispatchData = await getActionCenterFollowThroughMailDispatchData()
  const refreshedSnapshotsByRouteId = new Map(
    refreshedDispatchData.snapshots.map((snapshot) => [snapshot.routeId, snapshot]),
  )
  const env = getActionCenterFollowThroughMailEnv()
  let sentCount = 0
  let suppressedCount = 0
  let failedCount = 0

  for (const entry of planned.suppressions) {
    if (entry.suppressionReason === 'duplicate') {
      suppressedCount += 1
      continue
    }

    const snapshot = filteredSnapshotsByRouteId.get(entry.routeId)
    if (!snapshot) {
      suppressedCount += 1
      continue
    }

    const insertResult = await createLedgerQueries().insert({
      org_id: entry.orgId,
      route_id: entry.routeId,
      route_scope_value: entry.routeScopeValue,
      route_source_id: entry.campaignId,
      scan_type: snapshot.scanType,
      trigger_type: entry.triggerType,
      recipient_role: entry.recipientRole,
      recipient_email: entry.recipientEmail ?? 'missing-recipient',
      source_marker: entry.sourceMarker ?? `suppressed::${entry.triggerType}`,
      dedupe_key: `${entry.routeId}::${entry.triggerType}::${entry.recipientRole}::${entry.sourceMarker ?? 'suppressed'}`,
      delivery_status: 'suppressed',
      suppression_reason: entry.suppressionReason,
      provider_message_id: null,
      sent_at: null,
    })

    if (insertResult.error && insertResult.error.code !== '23505') {
      throw new Error(insertResult.error.message ?? 'Action Center follow-through suppression ledger write failed.')
    }
    suppressedCount += 1
  }

  for (const job of planned.jobs) {
    const originalSnapshot = filteredSnapshotsByRouteId.get(job.routeId) ?? null
    const refreshedSnapshot = refreshedSnapshotsByRouteId.get(job.routeId) ?? null
    const recheckReason =
      !refreshedSnapshot
        ? 'unsupported-route'
        : getActionCenterFollowThroughMailSuppressionReason({
            triggerType: job.triggerType,
            remindersEnabled: refreshedSnapshot.remindersEnabled,
            routeStatus: refreshedSnapshot.routeStatus,
            reviewCompletedAt: refreshedSnapshot.reviewCompletedAt,
            reviewScheduledFor:
              refreshedSnapshot.reviewScheduledFor === job.reviewScheduledFor
                ? refreshedSnapshot.reviewScheduledFor
                : null,
            reviewOutcome: refreshedSnapshot.reviewOutcome,
            recipientEmail:
              job.recipientRole === 'manager'
                ? refreshedSnapshot.managerRecipient?.email ?? null
                : refreshedSnapshot.hrOversightRecipients.find(
                    (recipient) => recipient.email === job.recipientEmail,
                  )?.email ?? null,
            hasFollowUpTarget: refreshedSnapshot.hasFollowUpTarget,
            isDuplicate: existingDedupeKeys.has(job.dedupeKey) || (await hasLedgerDedupeKey(job.dedupeKey)),
          })

    if (recheckReason) {
      const ledgerScanType = refreshedSnapshot?.scanType ?? originalSnapshot?.scanType ?? 'exit'
      const suppressionInsert = await createLedgerQueries().insert({
        org_id: job.orgId,
        route_id: job.routeId,
        route_scope_value: job.routeScopeValue,
        route_source_id: job.campaignId,
        scan_type: ledgerScanType,
        trigger_type: job.triggerType,
        recipient_role: job.recipientRole,
        recipient_email: job.recipientEmail,
        source_marker: job.sourceMarker,
        dedupe_key: job.dedupeKey,
        delivery_status: 'suppressed',
        suppression_reason: recheckReason,
        provider_message_id: null,
        sent_at: null,
      })

      if (suppressionInsert.error && suppressionInsert.error.code !== '23505') {
        throw new Error(suppressionInsert.error.message ?? 'Action Center follow-through recheck suppression write failed.')
      }
      suppressedCount += 1
      existingDedupeKeys.add(job.dedupeKey)
      continue
    }

    if (!refreshedSnapshot) {
      failedCount += 1
      continue
    }

    const rendered = renderActionCenterFollowThroughMail({
      triggerType: job.triggerType,
      recipientRole: job.recipientRole,
      campaignName: job.campaignName,
      scopeLabel: job.scopeLabel,
      actionCenterHref: buildActionCenterHref(job.routeId),
      inviteArtifactHref:
        job.triggerType === 'review_upcoming' || job.triggerType === 'review_overdue'
          ? buildInviteArtifactHref(job.routeId)
          : null,
    })

    const result = await deliverActionCenterFollowThroughMail(
      {
        recipientEmail: job.recipientEmail,
        subject: rendered.subject,
        emailText: rendered.emailText,
        emailHtml: rendered.emailHtml,
      },
      env,
    )

    const insertResult = await createLedgerQueries().insert({
      org_id: job.orgId,
      route_id: job.routeId,
      route_scope_value: job.routeScopeValue,
      route_source_id: job.campaignId,
      scan_type: refreshedSnapshot.scanType,
      trigger_type: job.triggerType,
      recipient_role: job.recipientRole,
      recipient_email: job.recipientEmail,
      source_marker: job.sourceMarker,
      dedupe_key: job.dedupeKey,
      delivery_status: result.ok ? 'sent' : 'failed',
      suppression_reason: null,
      provider_message_id: result.ok ? result.providerMessageId : null,
      sent_at: result.ok ? new Date().toISOString() : null,
    })

    if (insertResult.error && insertResult.error.code !== '23505') {
      throw new Error(insertResult.error.message ?? 'Action Center follow-through ledger write failed.')
    }

    existingDedupeKeys.add(job.dedupeKey)

    if (result.ok) {
      sentCount += 1
    } else {
      failedCount += 1
    }
  }

  return NextResponse.json(
    {
      mode: args.mode,
      plannedCount: planned.jobs.length,
      sentCount,
      suppressedCount,
      failedCount,
    },
    { status: 200 },
  )
}

export async function POST(request: Request) {
  if (!isTrustedRequest(request)) {
    return NextResponse.json({ detail: 'Niet toegestaan.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as FollowThroughMailRouteBody | null
  return handleDispatch({
    request,
    mode: parseMode(body?.mode),
    requestedRouteIds: parseRouteIds(body?.routeIds),
  })
}

export async function GET(request: Request) {
  return handleDispatch({
    request,
    mode: 'dispatch',
    requestedRouteIds: null,
  })
}
