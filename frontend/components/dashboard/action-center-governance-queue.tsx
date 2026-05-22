'use client'

import React from 'react'
import { DashboardSection } from '@/components/dashboard/dashboard-primitives'
import type { ActionCenterGovernanceQueue } from '@/lib/action-center-governance-queues'

function getSignalSummary(item: ActionCenterGovernanceQueue['items'][number]) {
  return [item.primarySignal, ...item.secondarySignals].join(' · ')
}

export function ActionCenterGovernanceQueue({
  queue,
}: {
  queue: ActionCenterGovernanceQueue
}) {
  if (queue.items.length === 0) {
    return null
  }

  return (
    <DashboardSection
      surface="ops"
      eyebrow="Governance queue"
      title="Waar HR nu moet ingrijpen"
      description="Een route-first worklist met bounded signalen, expliciete aanbevelingen en directe governance-acties."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {queue.items.map((item) => (
          <div
            key={`${item.routeId}:${item.primarySignal}`}
            className={`rounded-[18px] border px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)] ${
              item.severity === 'high'
                ? 'border-[#e7e0d1] bg-[#fcfbf7]'
                : 'border-[color:var(--border)] bg-white'
            }`}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
                  {item.recommendation}
                </p>
                <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
                  {item.severity === 'high' ? 'High' : 'Medium'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">{item.scopeLabel}</p>
                <p className="mt-1 text-xs text-[color:var(--text)]">
                  {item.sourceLabel} · {item.managerOwner ?? 'Nog niet toegewezen'}
                </p>
              </div>
              <p className="text-xs leading-6 text-[color:var(--text)]">
                <span className="font-semibold">Waarom nu in de queue:</span> {item.whyInQueue}
              </p>
              <p className="text-xs leading-6 text-[color:var(--text)]">
                <span className="font-semibold">Verwachte HR-actie:</span> {item.expectedHrAction}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--text)]">
                <span>{getSignalSummary(item)}</span>
                <span>{item.timeInQueueDays} dagen</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  )
}
