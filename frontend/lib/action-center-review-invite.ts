import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
import type { ActionCenterRouteStatus } from '@/lib/action-center-route-contract'
import type { ScanType } from '@/lib/types'

export type ActionCenterReviewInviteEligibilityReason =
  | 'unsupported-scan-type'
  | 'missing-review-date'
  | 'missing-manager-email'
  | 'closed-route'

export interface ActionCenterReviewInviteContext {
  actionCenterOrigin: string
  campaignId: string
  campaignName: string
  managerEmail: string | null
  managerName: string | null
  phase: number
  reviewDate: string | null
  reviewItemId: string
  routeId: string
  routeStatus: ActionCenterRouteStatus | null
  scanType: ScanType | null
  scopeLabel: string
}

export interface ActionCenterReviewInviteDraft {
  reviewItemId: string
  routeId: string
  campaignId: string
  recipientEmail: string
  recipientName: string
  subject: string
  actionCenterHref: string
  emailText: string
  emailHtml: string
  reviewDate: string
  deliveryModel: {
    channel: 'email-ics'
    organizerMode: 'organizer'
    nativeMicrosoftRequired: false
  }
  writePolicy: {
    calendarRsvp: 'hint-only'
    canonicalReviewState: 'action-center-only'
  }
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeLowerText(value: string | null | undefined) {
  return normalizeText(value)?.toLowerCase() ?? null
}

function isClosedRoute(routeStatus: string | null | undefined) {
  const normalizedStatus = normalizeLowerText(routeStatus)
  return normalizedStatus === 'afgerond' || normalizedStatus === 'gestopt'
}

function isSupportedScanType(scanType: string | null | undefined, phase: number) {
  return normalizeLowerText(scanType) === 'exit' && phase === 1
}

function getNormalizedIsoDate(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null

  const parsed = new Date(`${normalized}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toISOString().slice(0, 10) === normalized ? normalized : null
}

export function actionCenterBaseUrl(origin: string) {
  const parsed = new URL(origin.trim())
  return parsed.origin
}

export function getActionCenterReviewInviteEligibility(
  context: ActionCenterReviewInviteContext,
): {
  ok: true
  reason: null
} | {
  ok: false
  reason: ActionCenterReviewInviteEligibilityReason
} {
  if (!isSupportedScanType(context.scanType, context.phase)) {
    return {
      ok: false,
      reason: 'unsupported-scan-type',
    }
  }

  if (!getNormalizedIsoDate(context.reviewDate)) {
    return {
      ok: false,
      reason: 'missing-review-date',
    }
  }

  if (!normalizeText(context.managerEmail)) {
    return {
      ok: false,
      reason: 'missing-manager-email',
    }
  }

  if (isClosedRoute(context.routeStatus)) {
    return {
      ok: false,
      reason: 'closed-route',
    }
  }

  return {
    ok: true,
    reason: null,
  }
}

export function buildActionCenterReviewInviteDraft(
  context: ActionCenterReviewInviteContext,
): ActionCenterReviewInviteDraft {
  const eligibility = getActionCenterReviewInviteEligibility(context)
  if (!eligibility.ok) {
    throw new Error(eligibility.reason)
  }

  const reviewDate = getNormalizedIsoDate(context.reviewDate)
  const recipientEmail = normalizeText(context.managerEmail)
  if (!reviewDate || !recipientEmail) {
    throw new Error('Action Center review invite eligibility drifted during draft construction.')
  }

  const actionCenterHref = new URL(
    buildActionCenterEntryHref({
      focus: context.reviewItemId,
      view: 'reviews',
      source: 'notification',
    }),
    `${actionCenterBaseUrl(context.actionCenterOrigin)}/`,
  ).toString()

  const instruction = 'Leg reviewuitkomst en vervolg alleen in Action Center vast.'
  const subject = `Reviewmoment ${context.campaignName} / ${context.scopeLabel}`

  return {
    reviewItemId: context.reviewItemId,
    routeId: context.routeId,
    campaignId: context.campaignId,
    recipientEmail,
    recipientName: normalizeText(context.managerName) ?? '',
    subject,
    actionCenterHref,
    emailText: [
      `Open dit reviewmoment in Action Center: ${actionCenterHref}`,
      instruction,
    ].join('\n\n'),
    emailHtml: [
      `<p>Open dit reviewmoment in <a href="${actionCenterHref}">Action Center</a>.</p>`,
      `<p>${instruction}</p>`,
    ].join(''),
    reviewDate,
    deliveryModel: {
      channel: 'email-ics',
      organizerMode: 'organizer',
      nativeMicrosoftRequired: false,
    },
    writePolicy: {
      calendarRsvp: 'hint-only',
      canonicalReviewState: 'action-center-only',
    },
  }
}
