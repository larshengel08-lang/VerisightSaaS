import {
  getActionCenterGraphCalendarCapability,
  type ActionCenterGraphCapability,
} from './action-center-graph-calendar'

export interface ActionCenterGraphEnv {
  tenantId: string
  clientId: string
  clientSecret: string
  organizerEmail: string
  organizerUserId: string
  enabledOrgIds: string[]
}

interface ActionCenterGraphCredentials {
  tenantId: string
  clientId: string
  clientSecret: string
  organizerUserId: string
}

interface ActionCenterGraphRequestOptions {
  fetchImpl?: typeof fetch
}

interface ActionCenterGraphDateTimeTimeZone {
  dateTime: string
  timeZone: string
}

interface ActionCenterGraphAttendee {
  email: string
  name: string
}

interface CreateActionCenterGraphEventPayload {
  subject: string
  bodyHtml: string
  start: ActionCenterGraphDateTimeTimeZone
  end: ActionCenterGraphDateTimeTimeZone
  attendees?: ActionCenterGraphAttendee[]
  allowNewTimeProposals?: boolean
  transactionId?: string
}

interface UpdateActionCenterGraphEventPayload {
  eventId: string
  subject: string
  bodyHtml: string
  start: ActionCenterGraphDateTimeTimeZone
  end: ActionCenterGraphDateTimeTimeZone
}

interface CancelActionCenterGraphEventPayload {
  eventId: string
  comment: string
}

type ActionCenterGraphAccessTokenResult =
  | { ok: true; accessToken: string }
  | { ok: false; reason: string }

type ActionCenterGraphEventMutationResult =
  | { ok: true; eventId: string; iCalUId?: string | null }
  | { ok: false; reason: string }

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : ''
}

function normalizeEnabledOrgIds(value: string | null | undefined) {
  return (value ?? '')
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function hasClientConfig(credentials: Pick<ActionCenterGraphCredentials, 'tenantId' | 'clientId' | 'clientSecret'>) {
  return (
    normalizeText(credentials.tenantId).length > 0 &&
    normalizeText(credentials.clientId).length > 0 &&
    normalizeText(credentials.clientSecret).length > 0
  )
}

function buildGraphTokenUrl(tenantId: string) {
  return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`
}

function buildGraphUserEventsUrl(organizerUserId: string, eventId?: string, action?: 'cancel') {
  const base = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(organizerUserId)}/events`
  if (!eventId) {
    return base
  }

  const eventUrl = `${base}/${encodeURIComponent(eventId)}`
  return action === 'cancel' ? `${eventUrl}/cancel` : eventUrl
}

function buildEventBodyPayload(bodyHtml: string) {
  return {
    contentType: 'HTML',
    content: bodyHtml,
  }
}

function buildGraphAttendees(attendees: ActionCenterGraphAttendee[] | undefined) {
  return attendees?.map((attendee) => ({
    emailAddress: {
      address: attendee.email,
      name: attendee.name,
    },
    type: 'required',
  }))
}

async function performGraphJsonRequest(
  args: {
    url: string
    accessToken: string
    method: 'POST' | 'PATCH'
    body: unknown
  },
  options: ActionCenterGraphRequestOptions,
) {
  const fetchImpl = options.fetchImpl ?? fetch

  let response: Response
  try {
    response = await fetchImpl(args.url, {
      method: args.method,
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args.body),
      cache: 'no-store',
    })
  } catch (error) {
    return {
      ok: false as const,
      reason: error instanceof Error ? error.message : 'graph_network_error',
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } }
    return {
      ok: false as const,
      reason: payload.error?.message ?? `graph_http_${response.status}`,
    }
  }

  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>
  return {
    ok: true as const,
    json,
  }
}

export function getActionCenterGraphEnv(): ActionCenterGraphEnv {
  return {
    tenantId: process.env.ACTION_CENTER_GRAPH_TENANT_ID?.trim() ?? '',
    clientId: process.env.ACTION_CENTER_GRAPH_CLIENT_ID?.trim() ?? '',
    clientSecret: process.env.ACTION_CENTER_GRAPH_CLIENT_SECRET?.trim() ?? '',
    organizerEmail: process.env.ACTION_CENTER_GRAPH_ORGANIZER_EMAIL?.trim() ?? '',
    organizerUserId: process.env.ACTION_CENTER_GRAPH_ORGANIZER_USER_ID?.trim() ?? '',
    enabledOrgIds: normalizeEnabledOrgIds(process.env.ACTION_CENTER_GRAPH_ENABLED_ORG_IDS),
  }
}

export function loadActionCenterGraphCapability(args: {
  orgId: string
  scanType: string | null | undefined
  env?: Partial<ActionCenterGraphEnv>
}): ActionCenterGraphCapability {
  const baseEnv = getActionCenterGraphEnv()
  const mergedEnv: ActionCenterGraphEnv = {
    ...baseEnv,
    ...args.env,
    enabledOrgIds: args.env?.enabledOrgIds ?? baseEnv.enabledOrgIds,
  }

  const allowlisted = mergedEnv.enabledOrgIds.includes(args.orgId)
  const baseCapability = getActionCenterGraphCalendarCapability({
    scanType: args.scanType,
    consentState: allowlisted ? 'granted' : 'missing',
    organizerEmail: mergedEnv.organizerEmail,
    organizerUserId: mergedEnv.organizerUserId,
  })

  if (
    baseCapability.mode === 'graph-enabled' &&
    !hasClientConfig({
      tenantId: mergedEnv.tenantId,
      clientId: mergedEnv.clientId,
      clientSecret: mergedEnv.clientSecret,
      organizerUserId: mergedEnv.organizerUserId,
    })
  ) {
    return {
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'missing-client-config',
      organizerEmail: baseCapability.organizerEmail,
      organizerUserId: null,
    }
  }

  return baseCapability
}

export async function requestActionCenterGraphAccessToken(
  credentials: Pick<ActionCenterGraphCredentials, 'tenantId' | 'clientId' | 'clientSecret'>,
  options: ActionCenterGraphRequestOptions = {},
): Promise<ActionCenterGraphAccessTokenResult> {
  if (!hasClientConfig({ ...credentials, organizerUserId: '' })) {
    return { ok: false, reason: 'missing_graph_env' }
  }

  const fetchImpl = options.fetchImpl ?? fetch
  const body = new URLSearchParams({
    client_id: credentials.clientId,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: credentials.clientSecret,
    grant_type: 'client_credentials',
  })

  let response: Response
  try {
    response = await fetchImpl(buildGraphTokenUrl(credentials.tenantId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    })
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'graph_token_network_error',
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error_description?: string }
    return {
      ok: false,
      reason: payload.error_description ?? `graph_token_http_${response.status}`,
    }
  }

  const payload = (await response.json().catch(() => ({}))) as { access_token?: string }
  if (!payload.access_token) {
    return { ok: false, reason: 'graph_token_missing_access_token' }
  }

  return {
    ok: true,
    accessToken: payload.access_token,
  }
}

export async function createActionCenterGraphEvent(
  credentials: ActionCenterGraphCredentials,
  payload: CreateActionCenterGraphEventPayload,
  options: ActionCenterGraphRequestOptions = {},
): Promise<ActionCenterGraphEventMutationResult> {
  const tokenResult = await requestActionCenterGraphAccessToken(credentials, options)
  if (!tokenResult.ok) {
    return tokenResult
  }

  const result = await performGraphJsonRequest(
    {
      url: buildGraphUserEventsUrl(credentials.organizerUserId),
      accessToken: tokenResult.accessToken,
      method: 'POST',
      body: {
        subject: payload.subject,
        body: buildEventBodyPayload(payload.bodyHtml),
        start: payload.start,
        end: payload.end,
        attendees: buildGraphAttendees(payload.attendees),
        allowNewTimeProposals: payload.allowNewTimeProposals ?? false,
        transactionId: payload.transactionId,
      },
    },
    options,
  )

  if (!result.ok) {
    return result
  }

  const eventId = typeof result.json.id === 'string' ? result.json.id : ''
  if (eventId.length === 0) {
    return {
      ok: false,
      reason: 'graph_event_missing_id',
    }
  }

  return {
    ok: true,
    eventId,
    iCalUId: typeof result.json.iCalUId === 'string' ? result.json.iCalUId : null,
  }
}

export async function updateActionCenterGraphEvent(
  credentials: ActionCenterGraphCredentials,
  payload: UpdateActionCenterGraphEventPayload,
  options: ActionCenterGraphRequestOptions = {},
): Promise<ActionCenterGraphEventMutationResult> {
  const tokenResult = await requestActionCenterGraphAccessToken(credentials, options)
  if (!tokenResult.ok) {
    return tokenResult
  }

  const result = await performGraphJsonRequest(
    {
      url: buildGraphUserEventsUrl(credentials.organizerUserId, payload.eventId),
      accessToken: tokenResult.accessToken,
      method: 'PATCH',
      body: {
        subject: payload.subject,
        body: buildEventBodyPayload(payload.bodyHtml),
        start: payload.start,
        end: payload.end,
      },
    },
    options,
  )

  if (!result.ok) {
    return result
  }

  return {
    ok: true,
    eventId: payload.eventId,
  }
}

export async function cancelActionCenterGraphEvent(
  credentials: ActionCenterGraphCredentials,
  payload: CancelActionCenterGraphEventPayload,
  options: ActionCenterGraphRequestOptions = {},
): Promise<ActionCenterGraphEventMutationResult> {
  const tokenResult = await requestActionCenterGraphAccessToken(credentials, options)
  if (!tokenResult.ok) {
    return tokenResult
  }

  const result = await performGraphJsonRequest(
    {
      url: buildGraphUserEventsUrl(credentials.organizerUserId, payload.eventId, 'cancel'),
      accessToken: tokenResult.accessToken,
      method: 'POST',
      body: {
        Comment: payload.comment,
      },
    },
    options,
  )

  if (!result.ok) {
    return result
  }

  return {
    ok: true,
    eventId: payload.eventId,
  }
}
