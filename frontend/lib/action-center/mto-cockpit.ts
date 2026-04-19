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
}

export interface MtoActionCenterViewModel {
  departmentOverview: {
    actionCount: number
    reviewCount: number
    topThemes: MtoActionCenterThemeCard[]
  }
  themeCards: MtoActionCenterThemeCard[]
  reviewQueue: Array<{
    actionId: string
    departmentLabel: string
    title: string
    tone: 'blue' | 'amber' | 'slate'
  }>
}

function getBand(signalValue: number): 'HOOG' | 'MIDDEN' | 'LAAG' {
  if (signalValue >= 7) return 'HOOG'
  if (signalValue >= 4.5) return 'MIDDEN'
  return 'LAAG'
}

export function buildMtoActionCenterViewModel(args: {
  departmentReads: MtoDepartmentReadItem[]
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews: ManagementActionReviewRecord[]
  todayIsoDate?: string
}): MtoActionCenterViewModel {
  const todayIsoDate = args.todayIsoDate ?? new Date().toISOString().slice(0, 10)

  const themeCards = args.departmentReads.map((read) => ({
    departmentRead: read,
    departmentLabel: read.segmentLabel,
    factorKey: read.factorKey,
    factorLabel: read.factorLabel,
    questionOptions: MTO_FOCUS_QUESTION_OPTIONS[read.factorKey]?.[getBand(read.signalValue)] ?? [],
    actions: args.actions.filter(
      (action) =>
        action.source_scope_label === read.segmentLabel &&
        action.source_factor_key === read.factorKey,
    ),
  }))

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
    }))

  return {
    departmentOverview: {
      actionCount: args.actions.length,
      reviewCount: reviewQueue.length,
      topThemes: themeCards.slice(0, 3),
    },
    themeCards,
    reviewQueue,
  }
}
