import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionCenterReviewInviteDraft } from './action-center-review-invite'
import {
  buildActionCenterGraphCalendarLinkRecord,
  type ActionCenterGraphCalendarLinkRecord,
  type ActionCenterGraphConsentState,
} from './action-center-graph-calendar'
import {
  cancelActionCenterGraphEvent,
  createActionCenterGraphEvent,
  getActionCenterGraphEnv,
  loadActionCenterGraphCapability,
  updateActionCenterGraphEvent,
} from './action-center-graph-client'

type ActionCenterGraphSyncMethod = 'REQUEST' | 'CANCEL'

type ActionCenterGraphCalendarLinkRow = {
  org_id: string | null
  route_id: string | null
  review_item_id: string | null
  route_scope_value: string | null
  route_source_id: string | null
  provider: 'microsoft_graph' | null
  event_id: string | null
  organizer_email: string | null
  organizer_user_id: string | null
  consent_state: ActionCenterGraphConsentState | null
  sync_state: 'linked' | 'cancelled' | 'fallback' | 'failed' | null
  last_synced_revision: number | null
  i_cal_uid: string | null
  last_sync_error: string | null
}

type ActionCenterGraphTableQuery = {
  select: (columns: string) => ActionCenterGraphTableQuery
  eq: (column: string, value: unknown) => ActionCenterGraphTableQuery
  maybeSingle: () => Promise<{ data: unknown; error: { message?: string } | null }>
  upsert: (
    payload: Record<string, unknown>,
    options: { onConflict: string },
  ) => {
    select: (columns: string) => {
      single: () => Promise<{ data: unknown; error: { message?: string } | null }>
    }
  }
}

type ActionCenterGraphAdminClient = {
  from: (table: string) => ActionCenterGraphTableQuery
}

type ActionCenterGraphSyncDeps = {
  adminClient?: ActionCenterGraphAdminClient
  loadCapability?: typeof loadActionCenterGraphCapability
  createEvent?: typeof createActionCenterGraphEvent
  updateEvent?: typeof updateActionCenterGraphEvent
  cancelEvent?: typeof cancelActionCenterGraphEvent
}

type ActionCenterGraphSyncReason =
  | 'missing-consent'
  | 'revoked-consent'
  | 'missing-organizer'
  | 'missing-client-config'
  | 'unsupported-scan-type'
  | 'missing-provider-link'
  | 'missing-invite-draft'
  | 'graph_event_missing_id'
  | string

export type ActionCenterGraphSyncResult =
  | {
      status: 'linked'
      provider: 'microsoft_graph'
      action: 'created' | 'updated'
      eventId: string
      iCalUId: string | null
      lastSyncedRevision: number
      reason: null
    }
  | {
      status: 'cancelled'
      provider: 'microsoft_graph'
      action: 'cancelled'
      eventId: string
      iCalUId: string | null
      lastSyncedRevision: number
      reason: null
    }
  | {
      status: 'already-current'
      provider: 'microsoft_graph'
      action: 'noop'
      eventId: string
      iCalUId: string | null
      lastSyncedRevision: number
      reason: null
    }
  | {
      status: 'fallback'
      provider: 'microsoft_graph'
      action: 'fallback'
      eventId: string | null
      iCalUId: string | null
      lastSyncedRevision: number | null
      reason: ActionCenterGraphSyncReason
    }
  | {
      status: 'failed'
      provider: 'microsoft_graph'
      action: 'failed'
      eventId: string | null
      iCalUId: string | null
      lastSyncedRevision: number | null
      reason: string
    }

export interface ActionCenterGraphSyncInput {
  orgId: string
  routeId: string
  reviewItemId: string
  routeScopeValue: string
  routeSourceId: string
  scanType: string | null | undefined
  organizerEmail: string
  revision: number
  method: ActionCenterGraphSyncMethod
  inviteDraft: Pick<
    ActionCenterReviewInviteDraft,
    'subject' | 'emailHtml' | 'reviewDate' | 'recipientEmail' | 'recipientName'
  > | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getGraphTable(adminClient: ActionCenterGraphAdminClient) {
  return adminClient.from('action_center_graph_calendar_links')
}

function getConsentStateForReason(reason: ActionCenterGraphSyncReason): ActionCenterGraphConsentState {
  if (reason === 'revoked-consent') {
    return 'revoked'
  }

  if (reason === 'missing-consent') {
    return 'missing'
  }

  return 'granted'
}

function toLinkRecord(row: ActionCenterGraphCalendarLinkRow | null) {
  if (!row) {
    return null
  }

  return buildActionCenterGraphCalendarLinkRecord({
    orgId: row.org_id ?? '',
    routeId: row.route_id ?? '',
    reviewItemId: row.review_item_id ?? '',
    routeScopeValue: row.route_scope_value ?? '',
    routeSourceId: row.route_source_id ?? '',
    provider: row.provider ?? 'microsoft_graph',
    eventId: row.event_id ?? '',
    organizerEmail: row.organizer_email ?? '',
    organizerUserId: row.organizer_user_id,
    consentState: row.consent_state ?? 'granted',
    syncState: row.sync_state ?? 'failed',
    lastSyncedRevision: row.last_synced_revision ?? 0,
    iCalUId: row.i_cal_uid,
    lastSyncError: row.last_sync_error,
  })
}

function toDatabasePayload(record: ActionCenterGraphCalendarLinkRecord) {
  return {
    org_id: record.orgId,
    route_id: record.routeId,
    review_item_id: record.reviewItemId,
    route_scope_value: record.routeScopeValue,
    route_source_id: record.routeSourceId,
    provider: record.provider,
    event_id: record.eventId,
    organizer_email: record.organizerEmail,
    organizer_user_id: record.organizerUserId,
    consent_state: record.consentState,
    sync_state: record.syncState,
    last_synced_revision: record.lastSyncedRevision,
    i_cal_uid: record.iCalUId,
    last_sync_error: record.lastSyncError,
  }
}

function buildGraphEventWindow(reviewDate: string) {
  return {
    start: {
      dateTime: `${reviewDate}T09:00:00`,
      timeZone: 'W. Europe Standard Time',
    },
    end: {
      dateTime: `${reviewDate}T09:30:00`,
      timeZone: 'W. Europe Standard Time',
    },
  }
}

async function loadExistingLink(args: {
  adminClient: ActionCenterGraphAdminClient
  routeId: string
}) {
  const result = await getGraphTable(args.adminClient)
    .select(
      'org_id, route_id, review_item_id, route_scope_value, route_source_id, provider, event_id, organizer_email, organizer_user_id, consent_state, sync_state, last_synced_revision, i_cal_uid, last_sync_error',
    )
    .eq('route_id', args.routeId)
    .eq('provider', 'microsoft_graph')
    .maybeSingle()

  if (result.error) {
    throw new Error(result.error.message ?? 'Action Center Graph link lookup failed.')
  }

  return toLinkRecord((result.data ?? null) as ActionCenterGraphCalendarLinkRow | null)
}

async function persistLink(args: {
  adminClient: ActionCenterGraphAdminClient
  record: ActionCenterGraphCalendarLinkRecord
}) {
  const result = await getGraphTable(args.adminClient)
    .upsert(toDatabasePayload(args.record), { onConflict: 'route_id,provider' })
    .select('route_id')
    .single()

  if (result.error) {
    throw new Error(result.error.message ?? 'Action Center Graph link persistence failed.')
  }
}

async function persistExistingLinkState(args: {
  adminClient: ActionCenterGraphAdminClient
  existingLink: ActionCenterGraphCalendarLinkRecord
  syncState: ActionCenterGraphCalendarLinkRecord['syncState']
  reason: string | null
  consentState?: ActionCenterGraphConsentState
}) {
  await persistLink({
    adminClient: args.adminClient,
    record: {
      ...args.existingLink,
      consentState: args.consentState ?? args.existingLink.consentState,
      syncState: args.syncState,
      lastSyncError: args.reason,
    },
  })
}

function isAlreadyCurrent(args: {
  existingLink: ActionCenterGraphCalendarLinkRecord
  revision: number
  method: ActionCenterGraphSyncMethod
}) {
  return (
    args.existingLink.lastSyncedRevision === args.revision &&
    ((args.method === 'REQUEST' && args.existingLink.syncState === 'linked') ||
      (args.method === 'CANCEL' && args.existingLink.syncState === 'cancelled'))
  )
}

export async function syncActionCenterGraphReview(
  input: ActionCenterGraphSyncInput,
  deps: ActionCenterGraphSyncDeps = {},
): Promise<ActionCenterGraphSyncResult> {
  const adminClient = deps.adminClient ?? (createAdminClient() as unknown as ActionCenterGraphAdminClient)
  const loadCapability = deps.loadCapability ?? loadActionCenterGraphCapability
  const createEvent = deps.createEvent ?? createActionCenterGraphEvent
  const updateEvent = deps.updateEvent ?? updateActionCenterGraphEvent
  const cancelEvent = deps.cancelEvent ?? cancelActionCenterGraphEvent
  const graphEnv = getActionCenterGraphEnv()

  const existingLink = await loadExistingLink({
    adminClient,
    routeId: input.routeId,
  })

  const capability = loadCapability({
    orgId: input.orgId,
    scanType: input.scanType,
  })

  if (capability.mode !== 'graph-enabled') {
    if (existingLink) {
      await persistExistingLinkState({
        adminClient,
        existingLink,
        syncState: 'fallback',
        reason: capability.reason,
        consentState: getConsentStateForReason(capability.reason),
      })
    }

    return {
      status: 'fallback',
      provider: 'microsoft_graph',
      action: 'fallback',
      eventId: existingLink?.eventId ?? null,
      iCalUId: existingLink?.iCalUId ?? null,
      lastSyncedRevision: existingLink?.lastSyncedRevision ?? null,
      reason: capability.reason,
    }
  }

  if (existingLink && isAlreadyCurrent({ existingLink, revision: input.revision, method: input.method })) {
    return {
      status: 'already-current',
      provider: 'microsoft_graph',
      action: 'noop',
      eventId: existingLink.eventId,
      iCalUId: existingLink.iCalUId,
      lastSyncedRevision: existingLink.lastSyncedRevision,
      reason: null,
    }
  }

  if (input.method === 'CANCEL') {
    if (!existingLink) {
      return {
        status: 'fallback',
        provider: 'microsoft_graph',
        action: 'fallback',
        eventId: null,
        iCalUId: null,
        lastSyncedRevision: null,
        reason: 'missing-provider-link',
      }
    }

    const cancelResult = await cancelEvent(
      {
        tenantId: graphEnv.tenantId,
        clientId: graphEnv.clientId,
        clientSecret: graphEnv.clientSecret,
        organizerUserId: capability.organizerUserId,
      },
      {
        eventId: existingLink.eventId,
        comment: 'Reviewmoment aangepast in Action Center.',
      },
    )

    if (!cancelResult.ok) {
      await persistExistingLinkState({
        adminClient,
        existingLink,
        syncState: 'failed',
        reason: cancelResult.reason,
      })

      return {
        status: 'failed',
        provider: 'microsoft_graph',
        action: 'failed',
        eventId: existingLink.eventId,
        iCalUId: existingLink.iCalUId,
        lastSyncedRevision: existingLink.lastSyncedRevision,
        reason: cancelResult.reason,
      }
    }

    const nextRecord = buildActionCenterGraphCalendarLinkRecord({
      ...existingLink,
      organizerEmail: capability.organizerEmail,
      organizerUserId: capability.organizerUserId,
      consentState: 'granted',
      syncState: 'cancelled',
      lastSyncedRevision: input.revision,
      lastSyncError: null,
    })
    await persistLink({
      adminClient,
      record: nextRecord,
    })

    return {
      status: 'cancelled',
      provider: 'microsoft_graph',
      action: 'cancelled',
      eventId: nextRecord.eventId,
      iCalUId: nextRecord.iCalUId,
      lastSyncedRevision: nextRecord.lastSyncedRevision,
      reason: null,
    }
  }

  if (!input.inviteDraft) {
    return {
      status: 'fallback',
      provider: 'microsoft_graph',
      action: 'fallback',
      eventId: existingLink?.eventId ?? null,
      iCalUId: existingLink?.iCalUId ?? null,
      lastSyncedRevision: existingLink?.lastSyncedRevision ?? null,
      reason: 'missing-invite-draft',
    }
  }

  const reviewDate = normalizeText(input.inviteDraft.reviewDate)
  if (!reviewDate) {
    return {
      status: 'fallback',
      provider: 'microsoft_graph',
      action: 'fallback',
      eventId: existingLink?.eventId ?? null,
      iCalUId: existingLink?.iCalUId ?? null,
      lastSyncedRevision: existingLink?.lastSyncedRevision ?? null,
      reason: 'missing-invite-draft',
    }
  }

  const eventWindow = buildGraphEventWindow(reviewDate)
  const commonPayload = {
    subject: input.inviteDraft.subject,
    bodyHtml: input.inviteDraft.emailHtml,
    start: eventWindow.start,
    end: eventWindow.end,
  }
  const shouldCreate = !existingLink || existingLink.syncState === 'cancelled'
  const mutationResult = shouldCreate
    ? await createEvent(
        {
          tenantId: graphEnv.tenantId,
          clientId: graphEnv.clientId,
          clientSecret: graphEnv.clientSecret,
          organizerUserId: capability.organizerUserId,
        },
        {
          ...commonPayload,
          attendees: [
            {
              email: input.inviteDraft.recipientEmail,
              name: input.inviteDraft.recipientName,
            },
          ],
          allowNewTimeProposals: false,
          transactionId: `${input.routeId}::revision-${input.revision}`,
        },
      )
    : await updateEvent(
        {
          tenantId: graphEnv.tenantId,
          clientId: graphEnv.clientId,
          clientSecret: graphEnv.clientSecret,
          organizerUserId: capability.organizerUserId,
        },
        {
          eventId: existingLink.eventId,
          ...commonPayload,
        },
      )

  if (!mutationResult.ok) {
    if (existingLink) {
      await persistExistingLinkState({
        adminClient,
        existingLink,
        syncState: 'failed',
        reason: mutationResult.reason,
      })
    }

    return {
      status: 'failed',
      provider: 'microsoft_graph',
      action: 'failed',
      eventId: existingLink?.eventId ?? null,
      iCalUId: existingLink?.iCalUId ?? null,
      lastSyncedRevision: existingLink?.lastSyncedRevision ?? null,
      reason: mutationResult.reason,
    }
  }

  const nextRecord = buildActionCenterGraphCalendarLinkRecord({
    orgId: input.orgId,
    routeId: input.routeId,
    reviewItemId: input.reviewItemId,
    routeScopeValue: input.routeScopeValue,
    routeSourceId: input.routeSourceId,
    provider: 'microsoft_graph',
    eventId: mutationResult.eventId,
    organizerEmail: capability.organizerEmail,
    organizerUserId: capability.organizerUserId,
    consentState: 'granted',
    syncState: 'linked',
    lastSyncedRevision: input.revision,
    iCalUId: mutationResult.iCalUId ?? existingLink?.iCalUId ?? null,
    lastSyncError: null,
  })
  await persistLink({
    adminClient,
    record: nextRecord,
  })

  return {
    status: 'linked',
    provider: 'microsoft_graph',
    action: shouldCreate ? 'created' : 'updated',
    eventId: nextRecord.eventId,
    iCalUId: nextRecord.iCalUId,
    lastSyncedRevision: nextRecord.lastSyncedRevision,
    reason: null,
  }
}
