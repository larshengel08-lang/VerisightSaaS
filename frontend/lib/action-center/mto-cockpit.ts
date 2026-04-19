import type {
  ManagementActionRecord,
  ManagementActionReviewRecord,
  ManagementActionUpdateRecord,
} from '@/lib/management-actions'
import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'
import {
  MTO_FOCUS_QUESTION_OPTIONS,
  type FocusQuestionOption,
} from '@/lib/products/mto/focus-questions'

export interface MtoActionCenterThemeCard {
  departmentRead: MtoDepartmentReadItem
  departmentLabel: string
  factorKey: string
  factorLabel: string
  questionOptions: FocusQuestionOption[]
  actions: ManagementActionRecord[]
  priorityScore: number
  actionHealth: {
    totalCount: number
    blockedCount: number
    reviewDueCount: number
    quietCount: number
    followUpCount: number
    status: 'no_action' | 'active' | 'attention_now'
    label: string
    tone: 'slate' | 'blue' | 'amber'
  }
}

export interface MtoActionCenterViewModel {
  departmentOverview: {
    actionCount: number
    reviewCount: number
    urgentThemeCount: number
    primaryTheme: MtoActionCenterThemeCard | null
    topThemes: MtoActionCenterThemeCard[]
  }
  followThroughSignals: {
    quietActions: number
    reviewDueNow: number
    recentlyReviewed: number
  }
  themeCards: MtoActionCenterThemeCard[]
  reviewQueue: Array<{
    actionId: string
    departmentLabel: string
    title: string
    tone: 'blue' | 'amber' | 'slate'
    stateLabel: string
  }>
}

function getBand(signalValue: number): 'HOOG' | 'MIDDEN' | 'LAAG' {
  if (signalValue >= 7) return 'HOOG'
  if (signalValue >= 4.5) return 'MIDDEN'
  return 'LAAG'
}

function buildThemeActionHealth(args: {
  actions: ManagementActionRecord[]
  todayIsoDate: string
  quietCutoffIso: string
}) {
  const totalCount = args.actions.length
  const blockedCount = args.actions.filter((action) => Boolean(action.blocker_note?.trim())).length
  const reviewDueCount = args.actions.filter(
    (action) => action.review_date !== null && action.review_date <= args.todayIsoDate && action.status !== 'closed',
  ).length
  const quietCount = args.actions.filter(
    (action) => action.updated_at.slice(0, 10) < args.quietCutoffIso && action.status !== 'closed',
  ).length
  const followUpCount = args.actions.filter((action) => action.status === 'follow_up_needed').length

  if (totalCount === 0) {
    return {
      totalCount,
      blockedCount,
      reviewDueCount,
      quietCount,
      followUpCount,
      status: 'no_action' as const,
      label: 'Nog geen actie gekoppeld',
      tone: 'slate' as const,
    }
  }

  if (blockedCount > 0 || reviewDueCount > 0 || followUpCount > 0 || quietCount > 0) {
    return {
      totalCount,
      blockedCount,
      reviewDueCount,
      quietCount,
      followUpCount,
      status: 'attention_now' as const,
      label: `${totalCount} actie(s), opvolging vraagt nu aandacht`,
      tone: 'amber' as const,
    }
  }

  return {
    totalCount,
    blockedCount,
    reviewDueCount,
    quietCount,
    followUpCount,
    status: 'active' as const,
    label: `${totalCount} actie(s) lopen beheerst`,
    tone: 'blue' as const,
  }
}

function calculateThemePriorityScore(args: {
  signalValue: number
  actionHealth: ReturnType<typeof buildThemeActionHealth>
}) {
  return (
    Math.round(args.signalValue * 100) +
    args.actionHealth.reviewDueCount * 120 +
    args.actionHealth.blockedCount * 100 +
    args.actionHealth.followUpCount * 90 +
    args.actionHealth.quietCount * 60 +
    args.actionHealth.totalCount * 10
  )
}

export function buildMtoActionCenterViewModel(args: {
  departmentReads: MtoDepartmentReadItem[]
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews: ManagementActionReviewRecord[]
  todayIsoDate?: string
}): MtoActionCenterViewModel {
  const todayIsoDate = args.todayIsoDate ?? new Date().toISOString().slice(0, 10)
  const quietCutoffIso = new Date(new Date(`${todayIsoDate}T00:00:00.000Z`).getTime() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const themeCards = args.departmentReads
    .map((read) => {
      const actions = args.actions.filter(
        (action) =>
          action.source_scope_label === read.segmentLabel &&
          action.source_factor_key === read.factorKey,
      )
      const actionHealth = buildThemeActionHealth({
        actions,
        todayIsoDate,
        quietCutoffIso,
      })

      return {
        departmentRead: read,
        departmentLabel: read.segmentLabel,
        factorKey: read.factorKey,
        factorLabel: read.factorLabel,
        questionOptions: MTO_FOCUS_QUESTION_OPTIONS[read.factorKey]?.[getBand(read.signalValue)] ?? [],
        actions,
        actionHealth,
        priorityScore: calculateThemePriorityScore({
          signalValue: read.signalValue,
          actionHealth,
        }),
      }
    })
    .sort((left, right) => right.priorityScore - left.priorityScore)

  const reviewQueue = args.actions
    .filter((action) => action.review_date)
    .map((action) => ({
      actionId: action.id,
      departmentLabel: action.source_scope_label ?? 'Onbekende afdeling',
      title: action.title,
      tone:
        action.status === 'closed'
          ? ('slate' as const)
          : action.review_date! < todayIsoDate
            ? ('amber' as const)
            : ('blue' as const),
      stateLabel:
        action.status === 'closed'
          ? 'Afgesloten'
          : action.review_date! < todayIsoDate
            ? 'Review nu'
            : 'Review gepland',
    }))

  return {
    departmentOverview: {
      actionCount: args.actions.length,
      reviewCount: reviewQueue.length,
      urgentThemeCount: themeCards.filter((card) => card.actionHealth.status === 'attention_now').length,
      primaryTheme: themeCards[0] ?? null,
      topThemes: themeCards.slice(0, 3),
    },
    followThroughSignals: {
      quietActions: args.actions.filter((action) => action.updated_at.slice(0, 10) < quietCutoffIso && action.status !== 'closed').length,
      reviewDueNow: reviewQueue.filter((item) => item.tone === 'amber').length,
      recentlyReviewed: args.reviews.length,
    },
    themeCards,
    reviewQueue,
  }
}
