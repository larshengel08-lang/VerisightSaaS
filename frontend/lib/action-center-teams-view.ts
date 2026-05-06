import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

export type ActionCenterTeamRow = {
  id: string
  orgId: string | null
  scopeType: 'department' | 'item' | 'org'
  label: string
  peopleCount: number
  currentManagerId: string | null | undefined
  currentManagerName: string | null
  openActions: number
  reviewSoonCount: number
  hasOwnerGap: boolean
}

export type ActionCenterTeamScopeStatus = 'actief' | 'zonder-manager' | 'geen-opvolging'

function isClosedStatus(status: ActionCenterPreviewItem['status']) {
  return status === 'afgerond' || status === 'gestopt'
}

function isReviewSoon(reviewDate: string | null, now = new Date()) {
  if (!reviewDate) return false
  const parsed = new Date(reviewDate)
  if (Number.isNaN(parsed.getTime())) return false

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return parsed >= start && parsed < end
}

export function buildActionCenterTeamRows(items: ActionCenterPreviewItem[]): ActionCenterTeamRow[] {
  const now = new Date()
  const rows = new Map<string, ActionCenterTeamRow>()

  for (const item of items) {
    const current = rows.get(item.teamId) ?? {
      id: item.teamId,
      orgId: item.orgId ?? null,
      scopeType: item.scopeType ?? 'department',
      label: item.teamLabel,
      peopleCount: item.peopleCount,
      currentManagerId: item.ownerId,
      currentManagerName: item.ownerName,
      openActions: 0,
      reviewSoonCount: 0,
      hasOwnerGap: false,
    }

    current.peopleCount = Math.max(current.peopleCount, item.peopleCount)
    if (!current.currentManagerId && item.ownerId) {
      current.currentManagerId = item.ownerId
    }
    if (!current.currentManagerName && item.ownerName) {
      current.currentManagerName = item.ownerName
    }
    if (!isClosedStatus(item.status)) {
      current.openActions += 1
    }
    if (isReviewSoon(item.reviewDate, now)) {
      current.reviewSoonCount += 1
    }
    if (!item.ownerName) {
      current.hasOwnerGap = true
    }

    rows.set(item.teamId, current)
  }

  return [...rows.values()].sort((left, right) => {
    if (right.openActions !== left.openActions) {
      return right.openActions - left.openActions
    }

    return left.label.localeCompare(right.label)
  })
}

export function deriveScopeStatusChip(team: ActionCenterTeamRow): ActionCenterTeamScopeStatus {
  if (team.hasOwnerGap && team.openActions > 0) return 'zonder-manager'
  if (team.openActions > 0 && !team.hasOwnerGap) return 'actief'
  return 'geen-opvolging'
}

export function buildTeamsSummaryStats(teamRows: ActionCenterTeamRow[]) {
  return {
    teamsInScope: teamRows.length,
    withoutManager: teamRows.filter((team) => !team.currentManagerId).length,
    withOpenFollowThrough: teamRows.filter((team) => team.openActions > 0).length,
    reviewFirstUp: teamRows.filter((team) => team.reviewSoonCount > 0).length,
  }
}

export function isActionCenterReviewSoon(reviewDate: string | null, now = new Date()) {
  return isReviewSoon(reviewDate, now)
}
