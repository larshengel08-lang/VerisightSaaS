'use client'

import React from 'react'
import { DashboardSection } from '@/components/dashboard/dashboard-primitives'
import type { ActionCenterMeasurementReadback } from '@/lib/action-center-measurement-readback'

function getVisibilityLabel(visibility: ActionCenterMeasurementReadback['metricInterpretationGuide'][number]['visibility']) {
  if (visibility === 'buyer_safe_reporting') return 'Buyer-safe'
  if (visibility === 'hr_operating_readback') return 'HR readback'
  return 'Internal'
}

export function ActionCenterMeasurementReadback({
  readback,
}: {
  readback: ActionCenterMeasurementReadback
}) {
  return (
    <DashboardSection
      surface="ops"
      eyebrow="Measurement readback"
      title="Hoe bounded execution nu leest"
      description="Interpretabele operating readback voor route-, actie- en reviewritme zonder proof- of impactclaims."
    >
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
            Routes open
          </p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {readback.layers.routeLevel.routesOpen}
          </p>
        </div>
        <div className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
            Bounded execution active
          </p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {readback.layers.actionLevel.activeActionCount}
          </p>
        </div>
        <div className="rounded-[18px] border border-[#e7e0d1] bg-[#fcfbf7] px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
            Review overdue
          </p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {readback.layers.reviewLevel.reviewDueCount}
          </p>
        </div>
        <div className="rounded-[18px] border border-[#e7e0d1] bg-[#fcfbf7] px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
            Continuation needed
          </p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {readback.layers.governanceSignalLevel.repeatedReviewWithoutProgressCount}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
        <div className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
              Buyer-safe vocabulary
            </p>
            <div className="flex flex-wrap gap-2">
              {readback.buyerSafeVocabulary.map((term) => (
                <span
                  key={term}
                  className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text)]"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
              Route-family readback
            </p>
            {(['exit', 'retention'] as const).map((routeFamily) => {
              const family = readback.layers.routeFamilyLevel[routeFamily]
              return (
                <div
                  key={routeFamily}
                  className="rounded-[16px] border border-[color:var(--border)] bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{family.label}</p>
                    <span className="text-xs text-[color:var(--text)]">{family.routeCount} routes</span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-[color:var(--text)]">
                    {family.confidenceFraming}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text)]">
            KPI interpretation guide
          </p>
          <div className="grid gap-3 xl:grid-cols-2">
            {readback.metricInterpretationGuide.slice(0, 4).map((item) => (
              <div
                key={item.metricName}
                className="rounded-[16px] border border-[color:var(--border)] bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--ink)]">{item.metricName}</p>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--text)]">
                    {getVisibilityLabel(item.visibility)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-6 text-[color:var(--text)]">{item.interpretation}</p>
                <p className="mt-2 text-xs leading-6 text-[color:var(--text)]">
                  <span className="font-semibold">Does not prove:</span> {item.doesNotProve}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardSection>
  )
}
