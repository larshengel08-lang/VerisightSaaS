import { buildActionCenterEntryHref } from '@/lib/action-center-entry'

export type ActionCenterReviewInviteEligibilityReason =
  | 'unsupported-scan-type'
  | 'missing-review-date'
  | 'missing-manager-email'
  | 'closed-route'

export interface ActionCenterReviewInviteDraft {
  campaignId: string
  reviewItemId: string
  reviewDate: string
  managerEmail: string
  subject: string
  actionCenterUrl: string
  deliveryModel: {
    channel: 'email-ics'
    mode: 'organizer'
    nativeMicrosoftRequired: false
  }
  writePolicy: {
    calendarRsvp: 'hint-only'
    canonicalReviewState: 'action-center-only'
  }
  emailText: string
  emailHtml: string
}

export type ActionCenterReviewInviteDraftResult =
  | {
      eligible: true
      draft: ActionCenterReviewInviteDraft
    }
  | {
      eligible: false
      reason: ActionCenterReviewInviteEligibilityReason
    }

export interface BuildActionCenterReviewInviteDraftInput {
  actionCenterOrigin: string
  campaignId: string
  campaignName: string
  managerEmail: string | null
  phase: number
  reviewDate: string | null
  reviewItemId: string
  routeStatus: string | null
  scanType: string
  scopeLabel: string
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isClosedRoute(routeStatus: string | null | undefined) {
  return routeStatus === 'afgerond' || routeStatus === 'gestopt'
}

function isPhaseOneExitScan(scanType: string | null | undefined, phase: number) {
  return normalizeText(scanType)?.toLowerCase() === 'exit' && phase === 1
}

export function actionCenterBaseUrl(origin: string) {
  const parsed = new URL(origin)
  return parsed.origin
}

export function buildActionCenterReviewInviteDraft(
  input: BuildActionCenterReviewInviteDraftInput,
): ActionCenterReviewInviteDraftResult {
  if (!isPhaseOneExitScan(input.scanType, input.phase)) {
    return {
      eligible: false,
      reason: 'unsupported-scan-type',
    }
  }

  const reviewDate = normalizeText(input.reviewDate)
  if (!reviewDate) {
    return {
      eligible: false,
      reason: 'missing-review-date',
    }
  }

  const managerEmail = normalizeText(input.managerEmail)
  if (!managerEmail) {
    return {
      eligible: false,
      reason: 'missing-manager-email',
    }
  }

  if (isClosedRoute(input.routeStatus)) {
    return {
      eligible: false,
      reason: 'closed-route',
    }
  }

  const actionCenterUrl = new URL(
    buildActionCenterEntryHref({
      focus: input.reviewItemId,
      view: 'reviews',
      source: 'notification',
    }),
    `${actionCenterBaseUrl(input.actionCenterOrigin)}/`,
  ).toString()

  const subject = `Reviewmoment ${input.campaignName} / ${input.scopeLabel}`
  const instruction = 'Leg reviewuitkomst en vervolg alleen in Action Center vast.'
  const emailText = [
    `Open dit reviewmoment in Action Center: ${actionCenterUrl}`,
    instruction,
  ].join('\n\n')
  const emailHtml = [
    `<p>Open dit reviewmoment in <a href="${actionCenterUrl}">Action Center</a>.</p>`,
    `<p>${instruction}</p>`,
  ].join('')

  return {
    eligible: true,
    draft: {
      campaignId: input.campaignId,
      reviewItemId: input.reviewItemId,
      reviewDate,
      managerEmail,
      subject,
      actionCenterUrl,
      deliveryModel: {
        channel: 'email-ics',
        mode: 'organizer',
        nativeMicrosoftRequired: false,
      },
      writePolicy: {
        calendarRsvp: 'hint-only',
        canonicalReviewState: 'action-center-only',
      },
      emailText,
      emailHtml,
    },
  }
}
