import type { ActionCenterReviewInviteDraft } from '@/lib/action-center-review-invite'

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function toIcsDateOnly(value: string) {
  return value.replace(/-/g, '')
}

function addOneDay(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + 1))

  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, '0'),
    String(next.getUTCDate()).padStart(2, '0'),
  ].join('')
}

function buildReviewInviteUid(routeId: string) {
  return `ac-review-${routeId}@verisight.nl`
}

export function renderActionCenterReviewInviteIcs(args: {
  draft: ActionCenterReviewInviteDraft
  method: 'REQUEST' | 'CANCEL'
  revision: number
  organizerEmail: string
}) {
  const { draft, method, organizerEmail, revision } = args
  const description = escapeIcsText(
    `${draft.emailText}\n\nOpen review in Action Center: ${draft.actionCenterHref}`,
  )

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Verisight//Action Center//NL',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${buildReviewInviteUid(draft.routeId)}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `SEQUENCE:${revision}`,
    `SUMMARY:${escapeIcsText(draft.subject)}`,
    `DESCRIPTION:${description}`,
    `URL:${draft.actionCenterHref}`,
    `DTSTART;VALUE=DATE:${toIcsDateOnly(draft.reviewDate)}`,
    `DTEND;VALUE=DATE:${addOneDay(draft.reviewDate)}`,
    `ORGANIZER:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${escapeIcsText(draft.recipientName || draft.recipientEmail)}:mailto:${draft.recipientEmail}`,
    method === 'CANCEL' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
