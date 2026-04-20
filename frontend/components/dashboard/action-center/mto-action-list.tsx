'use client'

import React from 'react'
import {
  buildManagementActionTraceabilitySummary,
  getManagementActionStatusLabel,
  type ManagementActionRecord,
  type ManagementActionReviewRecord,
  type ManagementActionUpdateRecord,
} from '@/lib/management-actions'

interface Props {
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews?: ManagementActionReviewRecord[]
  onOpenDossier: (actionId: string) => void
}

export function MtoActionList({ actions, updates, reviews = [], onOpenDossier }: Props) {
  if (actions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Nog geen acties in uitvoering. Open eerst een actie vanuit een themadetail om deze zone te vullen.
      </div>
    )
  }

  return (
    <section className="space-y-4">
      {actions.map((action) => {
        const actionUpdateCount = updates.filter((update) => update.action_id === action.id).length
        const actionReviewCount = reviews.filter((review) => review.action_id === action.id).length

        return (
          <article key={action.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {buildManagementActionTraceabilitySummary(action)}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">{action.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {action.expected_outcome ?? 'Nog geen verwachte uitkomst vastgelegd.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {getManagementActionStatusLabel(action.status)}
              </span>
              {action.review_date ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  Review {action.review_date}
                </span>
              ) : null}
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {actionUpdateCount} update(s)
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {actionReviewCount} review(s)
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenDossier(action.id)}
              className="mt-5 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open dossier
            </button>
          </article>
        )
      })}
    </section>
  )
}
