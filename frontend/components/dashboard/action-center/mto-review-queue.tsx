'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ManagementActionReviewRecord } from '@/lib/management-actions'
import type { MtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'

interface Props {
  reviewQueue: MtoActionCenterViewModel['reviewQueue']
  reviews?: ManagementActionReviewRecord[]
}

type ReviewDraft = {
  summary: string
  outcome: 'continue' | 'close' | 'reopen' | 'follow_up_needed'
  next_review_date: string
}

const defaultDraft: ReviewDraft = {
  summary: '',
  outcome: 'continue',
  next_review_date: '',
}

export function MtoReviewQueue({ reviewQueue, reviews = [] }: Props) {
  const router = useRouter()
  const [busyActionId, setBusyActionId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({})

  function updateDraft(actionId: string, key: keyof ReviewDraft, value: string) {
    setDrafts((current) => ({
      ...current,
      [actionId]: { ...(current[actionId] ?? defaultDraft), [key]: value },
    }))
  }

  async function saveReview(actionId: string) {
    const draft = drafts[actionId] ?? defaultDraft
    if (!draft.summary.trim()) return
    setBusyActionId(actionId)

    try {
      await fetch('/api/management-action-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: actionId,
          summary: draft.summary,
          outcome: draft.outcome,
          next_review_date: draft.next_review_date || null,
        }),
      })
      router.refresh()
    } finally {
      setBusyActionId(null)
    }
  }

  if (reviewQueue.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Nog geen reviewdruk zichtbaar. Zodra acties een reviewdatum krijgen, verschijnt de queue hier.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviewQueue.map((item) => {
        const draft = drafts[item.actionId] ?? defaultDraft
        const reviewCount = reviews.filter((review) => review.action_id === item.actionId).length

        return (
          <div key={item.actionId} className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.departmentLabel}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{reviewCount} review(s) gelogd voor deze actie.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.tone)}`}>
                {item.stateLabel}
              </span>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <textarea
                value={draft.summary}
                onChange={(event) => updateDraft(item.actionId, 'summary', event.target.value)}
                rows={3}
                placeholder="Leg kort vast wat is gedaan, wat is waargenomen en wat de volgende stap wordt."
                className={`${inputClass} xl:col-span-2`}
              />
              <div className="space-y-3">
                <select
                  value={draft.outcome}
                  onChange={(event) => updateDraft(item.actionId, 'outcome', event.target.value)}
                  className={inputClass}
                >
                  <option value="continue">Doorgaan</option>
                  <option value="close">Sluiten</option>
                  <option value="reopen">Heropenen</option>
                  <option value="follow_up_needed">Vervolg nodig</option>
                </select>
                <input
                  type="date"
                  value={draft.next_review_date}
                  onChange={(event) => updateDraft(item.actionId, 'next_review_date', event.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => void saveReview(item.actionId)}
                  disabled={busyActionId === item.actionId}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyActionId === item.actionId ? 'Opslaan...' : 'Log review'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function toneClass(tone: 'blue' | 'amber' | 'slate') {
  if (tone === 'amber') return 'bg-amber-50 text-amber-800'
  if (tone === 'blue') return 'bg-blue-50 text-blue-700'
  return 'bg-slate-100 text-slate-600'
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
