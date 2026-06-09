import type { ActionCenterPreviewItem, ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'

export type ReviewMomentUrgency = 'overdue' | 'this-week' | 'upcoming' | 'completed'

export interface ReviewMomentGovernanceCounts {
  overdue: number
  missingOutcome: number
  missingScope: number
  missingManager: number
}

export interface ReviewMomentGroups {
  overdue: ActionCenterPreviewItem[]
  'this-week': ActionCenterPreviewItem[]
  upcoming: ActionCenterPreviewItem[]
  completed: ActionCenterPreviewItem[]
  unscheduled: ActionCenterPreviewItem[]
}

const DUTCH_SHORT_DAY = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

function parseDate(value: string | null | undefined) {
  if (!value) return null

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isClosedStatus(status: ActionCenterPreviewStatus) {
  return status === 'afgerond' || status === 'gestopt'
}

function hasRecordedOutcome(item: ActionCenterPreviewItem) {
  return item.reviewOutcome !== 'geen-uitkomst'
}

function getStartOfIsoWeek(now: Date) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  const isoOffset = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + isoOffset)
  return start
}

function getEndOfIsoWeek(now: Date) {
  const end = getStartOfIsoWeek(now)
  end.setDate(end.getDate() + 7)
  return end
}

function isReviewOverdue(reviewDate: Date, now: Date) {
  return reviewDate.getTime() < now.getTime() - 48 * 60 * 60 * 1000
}

function isWithinThisIsoWeek(reviewDate: Date, now: Date) {
  const start = getStartOfIsoWeek(now)
  const end = getEndOfIsoWeek(now)
  return reviewDate >= start && reviewDate < end
}

function isUpcomingWithinThirtyDays(reviewDate: Date, now: Date) {
  const oneDayAhead = new Date(now)
  oneDayAhead.setHours(0, 0, 0, 0)
  oneDayAhead.setDate(oneDayAhead.getDate() + 1)

  const thirtyDaysAhead = new Date(now)
  thirtyDaysAhead.setHours(23, 59, 59, 999)
  thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30)

  return reviewDate >= oneDayAhead && reviewDate <= thirtyDaysAhead
}

export function classifyReviewMoment(item: ActionCenterPreviewItem, now: Date): ReviewMomentUrgency | null {
  if (isClosedStatus(item.status) && hasRecordedOutcome(item)) {
    return 'completed'
  }

  const reviewDate = parseDate(item.reviewDate)
  if (!reviewDate) {
    return null
  }

  if (!hasRecordedOutcome(item) && isReviewOverdue(reviewDate, now)) {
    return 'overdue'
  }

  if (isWithinThisIsoWeek(reviewDate, now)) {
    return 'this-week'
  }

  if (isUpcomingWithinThirtyDays(reviewDate, now)) {
    return 'upcoming'
  }

  return null
}

function compareReviewMoments(left: ActionCenterPreviewItem, right: ActionCenterPreviewItem) {
  const leftTime = parseDate(left.reviewDate)?.getTime() ?? Number.POSITIVE_INFINITY
  const rightTime = parseDate(right.reviewDate)?.getTime() ?? Number.POSITIVE_INFINITY

  if (leftTime !== rightTime) {
    return leftTime - rightTime
  }

  return left.title.localeCompare(right.title)
}

export function groupReviewMomentsByUrgency(items: ActionCenterPreviewItem[], now: Date): ReviewMomentGroups {
  const groups: ReviewMomentGroups = {
    overdue: [],
    'this-week': [],
    upcoming: [],
    completed: [],
    unscheduled: [],
  }

  for (const item of items) {
    const urgency = classifyReviewMoment(item, now)

    if (urgency) {
      groups[urgency].push(item)
      continue
    }

    if (!item.reviewDate) {
      groups.unscheduled.push(item)
    }
  }

  groups.overdue.sort(compareReviewMoments)
  groups['this-week'].sort(compareReviewMoments)
  groups.upcoming.sort(compareReviewMoments)
  groups.completed.sort(compareReviewMoments)
  groups.unscheduled.sort(compareReviewMoments)

  return groups
}

export function computeReviewMomentGovernanceCounts(
  items: ActionCenterPreviewItem[],
  now: Date,
): ReviewMomentGovernanceCounts {
  return items.reduce<ReviewMomentGovernanceCounts>(
    (counts, item) => {
      const reviewDate = parseDate(item.reviewDate)
      const overdue = reviewDate && !hasRecordedOutcome(item) && isReviewOverdue(reviewDate, now)

      return {
        overdue: counts.overdue + (overdue ? 1 : 0),
        missingOutcome:
          counts.missingOutcome +
          (!isClosedStatus(item.status) && item.reviewOutcome === 'geen-uitkomst' ? 1 : 0),
        missingScope:
          counts.missingScope +
          (!item.teamLabel.trim() || !item.scopeType ? 1 : 0),
        missingManager: counts.missingManager + (item.ownerName ? 0 : 1),
      }
    },
    {
      overdue: 0,
      missingOutcome: 0,
      missingScope: 0,
      missingManager: 0,
    },
  )
}

export function formatReviewMomentLastUpdated(value: string) {
  const parsed = parseDate(value)
  if (!parsed) return null

  const dateLabel = DUTCH_SHORT_DAY.format(parsed).replace('.', '')
  const timeLabel = parsed.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `Laatste update ${dateLabel} om ${timeLabel}`
}

export function getReviewMomentOutcomeSummary(item: ActionCenterPreviewItem) {
  if (item.reviewReason?.trim()) {
    return item.reviewReason.trim()
  }

  if (item.reviewOutcome === 'geen-uitkomst') {
    return 'Nog geen reviewuitkomst vastgelegd.'
  }

  return `Laatste uitkomst: ${item.reviewOutcome}.`
}

export function getReviewMomentActionLabel(item: ActionCenterPreviewItem) {
  if (!isClosedStatus(item.status) && item.reviewOutcome === 'geen-uitkomst') {
    return 'Leg uitkomst vast'
  }

  return 'Open reviewmoment'
}

export function getReviewMomentScopeLabel(item: ActionCenterPreviewItem) {
  return item.teamLabel.trim() || 'Geen scope'
}

export function getReviewMomentManagerLabel(item: ActionCenterPreviewItem) {
  return item.ownerName?.trim() || 'Geen manager gekoppeld'
}

export function getReviewMomentStatusLabel(
  item: ActionCenterPreviewItem,
  urgency: ReviewMomentUrgency | null = null,
) {
  if (urgency === 'overdue') {
    return 'Achterstallig'
  }

  switch (item.status) {
    case 'te-bespreken':
    case 'reviewbaar':
      return 'Gepland'
    case 'in-uitvoering':
      return 'In uitvoering'
    case 'afgerond':
      return 'Afgerond'
    case 'gestopt':
      return 'Gestopt'
    default:
      return 'Gepland'
  }
}

export function getReviewMomentScopeTypeLabel(scopeType: ActionCenterPreviewItem['scopeType']) {
  switch (scopeType) {
    case 'department':
      return 'Afdeling'
    case 'org':
      return 'Organisatie'
    case 'item':
      return 'Campagne'
    default:
      return 'Niet beschikbaar'
  }
}
