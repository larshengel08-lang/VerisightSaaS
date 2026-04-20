'use client'

import React from 'react'
import type { ManagementActionReviewRecord } from '@/lib/management-actions'
import type { MtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'

interface Props {
  reviewQueue: MtoActionCenterViewModel['reviewQueue']
  reviews?: ManagementActionReviewRecord[]
  onOpenDossier: (actionId: string) => void
}

export function MtoReviewQueue({ reviewQueue, reviews = [], onOpenDossier }: Props) {
  if (reviewQueue.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Nog geen reviewdruk zichtbaar. Zodra acties een reviewdatum krijgen, verschijnt de queue hier.
      </div>
    )
  }

  return (
    <section className="space-y-4">
      {reviewQueue.map((item) => {
        const reviewCount = reviews.filter((review) => review.action_id === item.actionId).length
        const toneClass =
          item.tone === 'amber'
            ? 'border-amber-200 bg-amber-50'
            : item.tone === 'blue'
              ? 'border-blue-200 bg-blue-50'
              : 'border-slate-200 bg-white'

        return (
          <button
            key={item.actionId}
            type="button"
            onClick={() => onOpenDossier(item.actionId)}
            className={`w-full rounded-[22px] border px-4 py-4 text-left transition hover:border-blue-200 ${toneClass}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.departmentLabel}</p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.stateLabel}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{reviewCount} review(s) gelogd</p>
          </button>
        )
      })}
    </section>
  )
}
