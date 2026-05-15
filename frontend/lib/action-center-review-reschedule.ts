import { buildActionCenterRouteId } from './action-center-route-contract'

export const ACTION_CENTER_REVIEW_RESCHEDULE_OPERATIONS = ['reschedule', 'cancel'] as const

export type ActionCenterReviewRescheduleOperation =
  (typeof ACTION_CENTER_REVIEW_RESCHEDULE_OPERATIONS)[number]

export type ActionCenterReviewScheduleArtifactMode = 'CANCEL' | 'REQUEST'

export interface ValidatedActionCenterReviewRescheduleInput {
  operation: ActionCenterReviewRescheduleOperation
  routeId: string
  routeScopeValue: string
  routeSourceId: string
  orgId: string
  scanType: 'exit'
  reviewDate: string | null
  reason: string
}

export interface ActionCenterReviewRescheduleInput {
  operation: ActionCenterReviewRescheduleOperation
  routeId: string
  routeScopeValue: string
  routeSourceId: string
  orgId: string
  scanType: string
  reviewDate: string | null
  reason: string | null
}

const ACTION_CENTER_REVIEW_RESCHEDULE_REASON_MAX_LENGTH = 160
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getNormalizedIsoDate(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null

  const parsed = new Date(`${normalized}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toISOString().slice(0, 10) === normalized ? normalized : null
}

function isFutureIsoDate(value: string | null | undefined, now: Date = new Date()) {
  const normalizedDate = getNormalizedIsoDate(value)
  if (!normalizedDate) return false

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .slice(0, 10)

  return normalizedDate > today
}

function isBoundedReason(value: string | null | undefined) {
  const normalized = normalizeText(value)
  return Boolean(normalized && normalized.length <= ACTION_CENTER_REVIEW_RESCHEDULE_REASON_MAX_LENGTH)
}

function isUuid(value: string | null | undefined) {
  return Boolean(value && UUID_PATTERN.test(value))
}

export function validateActionCenterReviewRescheduleInput(
  input: ActionCenterReviewRescheduleInput | Record<string, unknown> | null | undefined,
): ValidatedActionCenterReviewRescheduleInput {
  const operation = input?.operation
  const rawReviewDate = input?.reviewDate
  const routeId = normalizeText(typeof input?.routeId === 'string' ? input.routeId : null)
  const routeScopeValue = normalizeText(typeof input?.routeScopeValue === 'string' ? input.routeScopeValue : null)
  const routeSourceId = normalizeText(typeof input?.routeSourceId === 'string' ? input.routeSourceId : null)
  const orgId = normalizeText(typeof input?.orgId === 'string' ? input.orgId : null)
  const scanType = normalizeText(typeof input?.scanType === 'string' ? input.scanType : null)
  const reviewDate = getNormalizedIsoDate(typeof input?.reviewDate === 'string' ? input.reviewDate : null)
  const reason = normalizeText(typeof input?.reason === 'string' ? input.reason : null)
  const expectedRouteId =
    routeSourceId && routeScopeValue ? buildActionCenterRouteId(routeSourceId, routeScopeValue) : null

  if (
    (operation !== 'reschedule' && operation !== 'cancel') ||
    !routeId ||
    !routeScopeValue ||
    !routeSourceId ||
    !isUuid(routeSourceId) ||
    !orgId ||
    !isUuid(orgId) ||
    routeId !== expectedRouteId ||
    scanType !== 'exit' ||
    !isBoundedReason(reason)
  ) {
    throw new Error('Ongeldige review reschedule input.')
  }

  if (operation === 'reschedule' && !isFutureIsoDate(reviewDate)) {
    throw new Error('Ongeldige review reschedule input.')
  }

  if (operation === 'cancel' && rawReviewDate !== null) {
    throw new Error('Ongeldige review reschedule input.')
  }

  const normalizedOperation: ActionCenterReviewRescheduleOperation = operation
  const normalizedReason = reason as string

  return {
    operation: normalizedOperation,
    routeId,
    routeScopeValue,
    routeSourceId,
    orgId,
    scanType: 'exit' as const,
    reviewDate: operation === 'cancel' ? null : reviewDate,
    reason: normalizedReason,
  }
}

export function buildNextActionCenterReviewScheduleRevision(
  latestRevision: number | null | undefined,
) {
  return (latestRevision ?? -1) + 1
}

export function getActionCenterReviewScheduleArtifactMode(
  operation: ActionCenterReviewRescheduleOperation,
): ActionCenterReviewScheduleArtifactMode {
  return operation === 'cancel' ? 'CANCEL' : 'REQUEST'
}
