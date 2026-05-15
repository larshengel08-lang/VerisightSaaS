import { buildActionCenterRouteId } from './action-center-route-contract'
import { isActionCenterRouteDefaultsProviderEligibleScanType } from './action-center-route-defaults'

export const ACTION_CENTER_GRAPH_CALENDAR_PROVIDERS = ['microsoft_graph'] as const
export type ActionCenterGraphCalendarProvider =
  (typeof ACTION_CENTER_GRAPH_CALENDAR_PROVIDERS)[number]

export const ACTION_CENTER_GRAPH_CONSENT_STATES = ['granted', 'missing', 'revoked'] as const
export type ActionCenterGraphConsentState =
  (typeof ACTION_CENTER_GRAPH_CONSENT_STATES)[number]

export const ACTION_CENTER_GRAPH_SYNC_STATES = [
  'linked',
  'cancelled',
  'fallback',
  'failed',
] as const
export type ActionCenterGraphSyncState =
  (typeof ACTION_CENTER_GRAPH_SYNC_STATES)[number]

export type ActionCenterGraphCapability =
  | {
      mode: 'graph-enabled'
      provider: 'microsoft_graph'
      reason: null
      organizerEmail: string
      organizerUserId: string
    }
  | {
      mode: 'fallback-only'
      provider: 'microsoft_graph'
      reason:
        | 'missing-consent'
        | 'revoked-consent'
        | 'missing-organizer'
        | 'missing-client-config'
        | 'unsupported-scan-type'
      organizerEmail: string | null
      organizerUserId: null
    }

export interface ActionCenterGraphCalendarLinkRecord {
  orgId: string
  routeId: string
  reviewItemId: string
  routeScopeValue: string
  routeSourceId: string
  provider: 'microsoft_graph'
  eventId: string
  organizerEmail: string
  organizerUserId: string | null
  consentState: ActionCenterGraphConsentState
  syncState: ActionCenterGraphSyncState
  lastSyncedRevision: number
  iCalUId: string | null
  lastSyncError: string | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeLowerText(value: string | null | undefined) {
  return normalizeText(value)?.toLowerCase() ?? null
}

function isSupportedScanType(scanType: string | null | undefined) {
  return isActionCenterRouteDefaultsProviderEligibleScanType(normalizeLowerText(scanType))
}

function isUuid(value: string | null | undefined) {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  )
}

export function getActionCenterGraphCalendarCapability(input: {
  scanType: string | null | undefined
  consentState: ActionCenterGraphConsentState
  organizerEmail: string | null | undefined
  organizerUserId: string | null | undefined
}): ActionCenterGraphCapability {
  const organizerEmail = normalizeText(input.organizerEmail)
  const organizerUserId = normalizeText(input.organizerUserId)

  if (!isSupportedScanType(input.scanType)) {
    return {
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'unsupported-scan-type',
      organizerEmail,
      organizerUserId: null,
    }
  }

  if (input.consentState === 'missing') {
    return {
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'missing-consent',
      organizerEmail,
      organizerUserId: null,
    }
  }

  if (input.consentState === 'revoked') {
    return {
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'revoked-consent',
      organizerEmail,
      organizerUserId: null,
    }
  }

  if (!organizerEmail || !organizerUserId) {
    return {
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'missing-organizer',
      organizerEmail,
      organizerUserId: null,
    }
  }

  return {
    mode: 'graph-enabled',
    provider: 'microsoft_graph',
    reason: null,
    organizerEmail,
    organizerUserId,
  }
}

export function buildActionCenterGraphCalendarLinkRecord(
  input: ActionCenterGraphCalendarLinkRecord,
): ActionCenterGraphCalendarLinkRecord {
  const routeId = normalizeText(input.routeId)
  const reviewItemId = normalizeText(input.reviewItemId)
  const routeScopeValue = normalizeText(input.routeScopeValue)
  const routeSourceId = normalizeText(input.routeSourceId)
  const orgId = normalizeText(input.orgId)
  const eventId = normalizeText(input.eventId)
  const organizerEmail = normalizeText(input.organizerEmail)
  const organizerUserId = normalizeText(input.organizerUserId)
  const iCalUId = normalizeText(input.iCalUId)
  const lastSyncError = normalizeText(input.lastSyncError)
  const expectedRouteId =
    routeSourceId && routeScopeValue ? buildActionCenterRouteId(routeSourceId, routeScopeValue) : null

  if (
    !orgId ||
    !isUuid(orgId) ||
    !routeId ||
    !reviewItemId ||
    !routeScopeValue ||
    !routeSourceId ||
    !isUuid(routeSourceId) ||
    routeId !== expectedRouteId ||
    reviewItemId !== routeId ||
    input.provider !== 'microsoft_graph' ||
    !eventId ||
    !organizerEmail ||
    !ACTION_CENTER_GRAPH_CONSENT_STATES.includes(input.consentState) ||
    !ACTION_CENTER_GRAPH_SYNC_STATES.includes(input.syncState) ||
    !Number.isInteger(input.lastSyncedRevision) ||
    input.lastSyncedRevision < 0
  ) {
    throw new Error('Ongeldige Action Center Graph calendar link.')
  }

  return {
    orgId,
    routeId,
    reviewItemId,
    routeScopeValue,
    routeSourceId,
    provider: 'microsoft_graph',
    eventId,
    organizerEmail,
    organizerUserId,
    consentState: input.consentState,
    syncState: input.syncState,
    lastSyncedRevision: input.lastSyncedRevision,
    iCalUId,
    lastSyncError,
  }
}
