import type { ActionCenterPreviewView } from '@/lib/action-center-preview-model'

export const ACTION_CENTER_ENTRY_VIEWS = [
  'overview',
  'actions',
  'reviews',
  'managers',
  'teams',
] as const satisfies readonly ActionCenterPreviewView[]

export type ActionCenterEntryView = (typeof ACTION_CENTER_ENTRY_VIEWS)[number]

export const ACTION_CENTER_ENTRY_SOURCES = [
  'campaign-detail',
  'review-moments',
  'action-center',
  'notification',
] as const

export type ActionCenterEntrySource = (typeof ACTION_CENTER_ENTRY_SOURCES)[number]

export interface ActionCenterEntryParams {
  focus: string | null
  view: ActionCenterEntryView
  source: ActionCenterEntrySource | null
}

function isActionCenterEntryView(value: string | null | undefined): value is ActionCenterEntryView {
  return ACTION_CENTER_ENTRY_VIEWS.includes(value as ActionCenterEntryView)
}

export function isActionCenterEntrySource(
  value: string | null | undefined,
): value is ActionCenterEntrySource {
  return ACTION_CENTER_ENTRY_SOURCES.includes(value as ActionCenterEntrySource)
}

export function resolveActionCenterEntryParams(args: {
  focus?: string | null
  view?: string | null
  source?: string | null
}): ActionCenterEntryParams {
  const focus = args.focus?.trim() ? args.focus.trim() : null
  const view = isActionCenterEntryView(args.view) ? args.view : 'overview'
  const source = isActionCenterEntrySource(args.source) ? args.source : null

  return { focus, view, source }
}

export function buildActionCenterEntryHref(args: {
  focus?: string | null
  view?: ActionCenterEntryView
  source?: ActionCenterEntrySource | null
}) {
  const params = new URLSearchParams()

  if (args.focus?.trim()) {
    params.set('focus', args.focus.trim())
  }

  if (args.view && args.view !== 'overview') {
    params.set('view', args.view)
  }

  if (args.source) {
    params.set('source', args.source)
  }

  const query = params.toString()
  return query.length > 0 ? `/action-center?${query}` : '/action-center'
}
