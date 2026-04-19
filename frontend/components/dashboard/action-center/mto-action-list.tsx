'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildManagementActionAccessEnvelope,
  buildManagementActionTraceabilitySummary,
  canEditManagementAction,
  getManagementActionStatusLabel,
  MANAGEMENT_ACTION_STATUS_OPTIONS,
  type ManagementActionDepartmentOwnerDefault,
  type ManagementActionRecord,
  type ManagementActionReviewRecord,
  type ManagementActionUpdateRecord,
} from '@/lib/management-actions'
import type { MemberRole } from '@/lib/types'

interface Props {
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews?: ManagementActionReviewRecord[]
  ownerDefaults?: ManagementActionDepartmentOwnerDefault[]
  currentViewerRole?: MemberRole | null
  currentUserEmail?: string | null
  canManageCampaign?: boolean
}

type ActionDraft = {
  title: string
  status: ManagementActionRecord['status']
  owner_label: string
  owner_email: string
  due_date: string
  review_date: string
  expected_outcome: string
  measured_outcome: string
  blocker_note: string
}

export function MtoActionList({
  actions,
  updates,
  reviews = [],
  ownerDefaults = [],
  currentViewerRole = null,
  currentUserEmail = null,
  canManageCampaign = false,
}: Props) {
  const router = useRouter()
  const [busyActionId, setBusyActionId] = useState<string | null>(null)
  const [busyUpdateActionId, setBusyUpdateActionId] = useState<string | null>(null)
  const [actionDrafts, setActionDrafts] = useState<Record<string, ActionDraft>>(() =>
    Object.fromEntries(
      actions.map((action) => [
        action.id,
        {
          title: action.title,
          status: action.status,
          owner_label: action.owner_label ?? '',
          owner_email: action.owner_email ?? '',
          due_date: action.due_date ?? '',
          review_date: action.review_date ?? '',
          expected_outcome: action.expected_outcome ?? '',
          measured_outcome: action.measured_outcome ?? '',
          blocker_note: action.blocker_note ?? '',
        },
      ]),
    ),
  )
  const [updateDrafts, setUpdateDrafts] = useState<Record<string, string>>(
    Object.fromEntries(actions.map((action) => [action.id, ''])),
  )

  const updatesByAction = useMemo(() => {
    const grouped: Record<string, ManagementActionUpdateRecord[]> = {}
    for (const update of updates) {
      grouped[update.action_id] ??= []
      grouped[update.action_id].push(update)
    }
    return grouped
  }, [updates])

  const reviewsByAction = useMemo(() => {
    const grouped: Record<string, ManagementActionReviewRecord[]> = {}
    for (const review of reviews) {
      grouped[review.action_id] ??= []
      grouped[review.action_id].push(review)
    }
    return grouped
  }, [reviews])

  const accessEnvelope = buildManagementActionAccessEnvelope({
    orgRole: currentViewerRole,
    userEmail: currentUserEmail,
    ownerDefaults,
  })

  function updateDraft(actionId: string, key: keyof ActionDraft, value: string) {
    setActionDrafts((current) => ({
      ...current,
      [actionId]: { ...current[actionId], [key]: value },
    }))
  }

  async function saveAction(actionId: string) {
    const draft = actionDrafts[actionId]
    setBusyActionId(actionId)

    try {
      await fetch(`/api/management-actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          status: draft.status,
          owner_label: draft.owner_label || null,
          owner_email: draft.owner_email || null,
          due_date: draft.due_date || null,
          review_date: draft.review_date || null,
          expected_outcome: draft.expected_outcome || null,
          measured_outcome: draft.measured_outcome || null,
          blocker_note: draft.blocker_note || null,
        }),
      })
      router.refresh()
    } finally {
      setBusyActionId(null)
    }
  }

  async function addUpdate(actionId: string, status: ManagementActionRecord['status']) {
    const note = updateDrafts[actionId]?.trim()
    if (!note) return

    setBusyUpdateActionId(actionId)
    try {
      await fetch('/api/management-action-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: actionId,
          note,
          status_snapshot: status,
        }),
      })
      setUpdateDrafts((current) => ({ ...current, [actionId]: '' }))
      router.refresh()
    } finally {
      setBusyUpdateActionId(null)
    }
  }

  if (actions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Nog geen acties in uitvoering. Open eerst een actie vanuit een themakaart om deze zone te vullen.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => {
        const draft = actionDrafts[action.id]
        const editable = canEditManagementAction({
          orgRole: currentViewerRole,
          userEmail: currentUserEmail,
          ownerDefaults,
          action,
        })
        const actionUpdates = updatesByAction[action.id] ?? []
        const actionReviews = reviewsByAction[action.id] ?? []
        const latestReview = actionReviews[0] ?? null

        return (
          <div key={action.id} className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {buildManagementActionTraceabilitySummary(action)}
                </p>
                <h3 className="mt-2 text-base font-semibold text-slate-950">{action.title}</h3>
                {action.decision_context ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.decision_context}</p>
                ) : null}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {getManagementActionStatusLabel(action.status)}
              </span>
            </div>

            {draft.blocker_note ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                Blokkade: {draft.blocker_note}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Dossierstart</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{draft.owner_label || 'Nog geen eigenaar'}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {draft.review_date ? `Eerste review: ${draft.review_date}` : 'Nog geen reviewmoment vastgelegd.'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Verwachte uitkomst</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {draft.expected_outcome || 'Nog geen verwachte uitkomst vastgelegd.'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Laatste review</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {latestReview ? latestReview.summary : 'Nog geen review gelogd in dit verbeterdossier.'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Titel</span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) => updateDraft(action.id, 'title', event.target.value)}
                  disabled={!editable || !canManageCampaign}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Status</span>
                <select
                  value={draft.status}
                  onChange={(event) => updateDraft(action.id, 'status', event.target.value)}
                  disabled={!editable || (!canManageCampaign && !accessEnvelope.departmentLabels.includes(action.source_scope_label ?? ''))}
                  className={inputClass}
                >
                  {MANAGEMENT_ACTION_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Verwachte uitkomst</span>
                <textarea
                  value={draft.expected_outcome}
                  onChange={(event) => updateDraft(action.id, 'expected_outcome', event.target.value)}
                  disabled={!editable}
                  rows={3}
                  className={`${inputClass} min-h-24 resize-y`}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Blocker</span>
                <textarea
                  value={draft.blocker_note}
                  onChange={(event) => updateDraft(action.id, 'blocker_note', event.target.value)}
                  disabled={!editable}
                  rows={3}
                  className={`${inputClass} min-h-24 resize-y`}
                />
              </label>
            </div>

            {editable ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void saveAction(action.id)}
                  disabled={busyActionId === action.id}
                  className={primaryButtonClass}
                >
                  {busyActionId === action.id ? 'Opslaan...' : 'Actie opslaan'}
                </button>
              </div>
            ) : null}

            <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Dossierverloop</p>
              <div className="mt-3 grid gap-4 xl:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reviewhistorie</p>
                  <div className="mt-3 space-y-3">
                    {actionReviews.length === 0 ? (
                      <p className="text-sm leading-6 text-slate-600">Nog geen reviews gelogd.</p>
                    ) : (
                      actionReviews.map((review) => (
                        <div key={review.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {review.created_at.slice(0, 16).replace('T', ' ')}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{review.summary}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Updatehistorie</p>
                  <div className="mt-3 space-y-3">
                    {actionUpdates.length === 0 ? (
                      <p className="text-sm leading-6 text-slate-600">Nog geen updates gelogd.</p>
                    ) : (
                      actionUpdates.map((update) => (
                        <div key={update.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {update.created_at.slice(0, 16).replace('T', ' ')}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{update.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {editable ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={updateDrafts[action.id] ?? ''}
                    onChange={(event) => setUpdateDrafts((current) => ({ ...current, [action.id]: event.target.value }))}
                    rows={3}
                    placeholder="Log voortgang, blokkade of effect-check"
                    className={`${inputClass} min-h-24 resize-y`}
                  />
                  <button
                    type="button"
                    onClick={() => void addUpdate(action.id, draft.status)}
                    disabled={busyUpdateActionId === action.id}
                    className={secondaryButtonClass}
                  >
                    {busyUpdateActionId === action.id ? 'Loggen...' : 'Log update'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50'

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
