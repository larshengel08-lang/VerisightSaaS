'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
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

type ReviewDraft = {
  summary: string
  outcome: 'continue' | 'close' | 'reopen' | 'follow_up_needed'
  next_review_date: string
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50'

export function MtoDossierPanel(props: {
  action: ManagementActionRecord
  updates: ManagementActionUpdateRecord[]
  reviews: ManagementActionReviewRecord[]
  ownerDefaults: ManagementActionDepartmentOwnerDefault[]
  currentViewerRole: MemberRole | null
  currentUserEmail: string | null
  canManageCampaign: boolean
  readOnly?: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [busyActionSave, setBusyActionSave] = useState(false)
  const [busyUpdateSave, setBusyUpdateSave] = useState(false)
  const [busyReviewSave, setBusyReviewSave] = useState(false)
  const [actionDraft, setActionDraft] = useState<ActionDraft>({
    title: props.action.title,
    status: props.action.status,
    owner_label: props.action.owner_label ?? '',
    owner_email: props.action.owner_email ?? '',
    due_date: props.action.due_date ?? '',
    review_date: props.action.review_date ?? '',
    expected_outcome: props.action.expected_outcome ?? '',
    measured_outcome: props.action.measured_outcome ?? '',
    blocker_note: props.action.blocker_note ?? '',
  })
  const [updateDraft, setUpdateDraft] = useState('')
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>({
    summary: '',
    outcome: 'continue',
    next_review_date: '',
  })

  const editable =
    !props.readOnly &&
    canEditManagementAction({
      orgRole: props.currentViewerRole,
      userEmail: props.currentUserEmail,
      ownerDefaults: props.ownerDefaults,
      action: props.action,
    })

  const latestReview = props.reviews[0] ?? null
  const sortedUpdates = useMemo(() => [...props.updates].sort((a, b) => b.created_at.localeCompare(a.created_at)), [props.updates])
  const sortedReviews = useMemo(() => [...props.reviews].sort((a, b) => b.created_at.localeCompare(a.created_at)), [props.reviews])

  async function saveAction() {
    setBusyActionSave(true)
    try {
      await fetch(`/api/management-actions/${props.action.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: actionDraft.title,
          status: actionDraft.status,
          owner_label: actionDraft.owner_label || null,
          owner_email: actionDraft.owner_email || null,
          due_date: actionDraft.due_date || null,
          review_date: actionDraft.review_date || null,
          expected_outcome: actionDraft.expected_outcome || null,
          measured_outcome: actionDraft.measured_outcome || null,
          blocker_note: actionDraft.blocker_note || null,
        }),
      })
      router.refresh()
    } finally {
      setBusyActionSave(false)
    }
  }

  async function addUpdate() {
    const note = updateDraft.trim()
    if (!note) return

    setBusyUpdateSave(true)
    try {
      await fetch('/api/management-action-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: props.action.id,
          note,
          status_snapshot: actionDraft.status,
        }),
      })
      setUpdateDraft('')
      router.refresh()
    } finally {
      setBusyUpdateSave(false)
    }
  }

  async function saveReview() {
    const summary = reviewDraft.summary.trim()
    if (!summary) return

    setBusyReviewSave(true)
    try {
      await fetch('/api/management-action-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: props.action.id,
          summary,
          outcome: reviewDraft.outcome,
          next_review_date: reviewDraft.next_review_date || null,
        }),
      })
      setReviewDraft({
        summary: '',
        outcome: 'continue',
        next_review_date: '',
      })
      router.refresh()
    } finally {
      setBusyReviewSave(false)
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Verbeterdossier</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{props.action.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{buildManagementActionTraceabilitySummary(props.action)}</p>
        </div>
        <button
          type="button"
          onClick={props.onClose}
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          Sluiten
        </button>
      </div>

      {props.action.decision_context ? (
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">{props.action.decision_context}</p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <InfoCard label="Status" value={getManagementActionStatusLabel(props.action.status)} />
        <InfoCard label="Eigenaar" value={props.action.owner_label ?? 'Nog geen eigenaar'} />
        <InfoCard label="Volgende review" value={props.action.review_date ?? 'Nog niet gepland'} />
        <InfoCard label="Laatste review" value={latestReview?.summary ?? 'Nog geen review gelogd'} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr),minmax(340px,0.95fr)]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Dossieroverzicht</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Titel</span>
                <input
                  type="text"
                  value={actionDraft.title}
                  onChange={(event) => setActionDraft((current) => ({ ...current, title: event.target.value }))}
                  disabled={!editable || !props.canManageCampaign}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Status</span>
                <select
                  value={actionDraft.status}
                  onChange={(event) => setActionDraft((current) => ({ ...current, status: event.target.value as ManagementActionRecord['status'] }))}
                  disabled={!editable}
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
                  value={actionDraft.expected_outcome}
                  onChange={(event) => setActionDraft((current) => ({ ...current, expected_outcome: event.target.value }))}
                  disabled={!editable}
                  rows={3}
                  className={`${inputClass} min-h-24 resize-y`}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Blocker</span>
                <textarea
                  value={actionDraft.blocker_note}
                  onChange={(event) => setActionDraft((current) => ({ ...current, blocker_note: event.target.value }))}
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
                  onClick={() => void saveAction()}
                  disabled={busyActionSave}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyActionSave ? 'Opslaan...' : 'Dossier opslaan'}
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Updatehistorie</p>
            <div className="mt-4 space-y-3">
              {sortedUpdates.length === 0 ? (
                <p className="text-sm leading-7 text-slate-600">Nog geen updates gelogd in dit verbeterdossier.</p>
              ) : (
                sortedUpdates.map((update) => (
                  <div key={update.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {update.created_at.slice(0, 16).replace('T', ' ')}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{update.note}</p>
                  </div>
                ))
              )}
            </div>
            {editable ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={updateDraft}
                  onChange={(event) => setUpdateDraft(event.target.value)}
                  rows={3}
                  placeholder="Log voortgang, blokkade of effect-check"
                  className={`${inputClass} min-h-24 resize-y`}
                />
                <button
                  type="button"
                  onClick={() => void addUpdate()}
                  disabled={busyUpdateSave}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyUpdateSave ? 'Loggen...' : 'Log update'}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reviewhistorie</p>
            <div className="mt-4 space-y-3">
              {sortedReviews.length === 0 ? (
                <p className="text-sm leading-7 text-slate-600">Nog geen reviews gelogd voor dit dossier.</p>
              ) : (
                sortedReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {review.created_at.slice(0, 16).replace('T', ' ')}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{review.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Nieuwe review</p>
            <div className="mt-4 space-y-3">
              <textarea
                value={reviewDraft.summary}
                onChange={(event) => setReviewDraft((current) => ({ ...current, summary: event.target.value }))}
                rows={3}
                placeholder="Leg kort vast wat is gedaan, wat is waargenomen en wat de volgende stap wordt."
                disabled={!editable}
                className={`${inputClass} min-h-24 resize-y`}
              />
              <select
                value={reviewDraft.outcome}
                onChange={(event) => setReviewDraft((current) => ({ ...current, outcome: event.target.value as ReviewDraft['outcome'] }))}
                disabled={!editable}
                className={inputClass}
              >
                <option value="continue">Doorgaan</option>
                <option value="close">Sluiten</option>
                <option value="reopen">Heropenen</option>
                <option value="follow_up_needed">Vervolg nodig</option>
              </select>
              <input
                type="date"
                value={reviewDraft.next_review_date}
                onChange={(event) => setReviewDraft((current) => ({ ...current, next_review_date: event.target.value }))}
                disabled={!editable}
                className={inputClass}
              />
              {editable ? (
                <button
                  type="button"
                  onClick={() => void saveReview()}
                  disabled={busyReviewSave}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyReviewSave ? 'Opslaan...' : 'Log review'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{props.label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{props.value}</p>
    </div>
  )
}
