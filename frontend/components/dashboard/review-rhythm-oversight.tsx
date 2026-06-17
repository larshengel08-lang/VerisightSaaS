'use client'

import React from 'react'
import { DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import type {
  ActionCenterReviewOversightAttentionItem,
  ActionCenterReviewOversightSummary,
} from '@/lib/action-center-review-oversight'

type GovernanceSignalChip = {
  code: string
  label: string
}

type ReviewRhythmOversightAttentionItemWithGovernance = ActionCenterReviewOversightAttentionItem & {
  governanceSignals?: GovernanceSignalChip[]
}

function getOversightStateLabel(state: ActionCenterReviewOversightAttentionItem['state']) {
  if (state === 'escalation-sensitive') return 'Escalatiegevoelig'
  if (state === 'stale') return 'Achter cadans'
  return 'Achter op review'
}

function isBoundedSourceLabel(sourceLabel: string) {
  return sourceLabel === 'Loep Vertrek' || sourceLabel === 'Loep Behoud'
}

function getGovernanceSignals(item: ActionCenterReviewOversightAttentionItem) {
  const candidate = item as ReviewRhythmOversightAttentionItemWithGovernance
  return candidate.governanceSignals ?? []
}

function getGovernanceSignalTone(code: string) {
  return code === 'route_ready_for_closeout'
    ? 'border-[#BFD8BF] bg-[#EFF8EF] text-[#25614A]'
    : 'border-[#E7D8B0] bg-[#FFF7E3] text-[#8C6B1F]'
}

export function ReviewRhythmOversight({
  summary,
  attentionItems,
}: {
  summary: ActionCenterReviewOversightSummary
  attentionItems: ActionCenterReviewOversightAttentionItem[]
}) {
  const totalCount =
    summary.upcomingCount +
    summary.overdueCount +
    summary.staleCount +
    summary.escalationSensitiveCount +
    summary.resolvedCount

  if (totalCount === 0) {
    return null
  }

  const boundedAttentionItems = attentionItems.filter((item) => isBoundedSourceLabel(item.sourceLabel))
  const governanceSignalCount = boundedAttentionItems.reduce(
    (sum, item) => sum + getGovernanceSignals(item).length,
    0,
  )

  return (
    <DashboardSection
      surface="ops"
      eyebrow="HR overzicht"
      title="Waar HR nu moet kijken"
      description="Bewaak welke follow-through-routes binnen cadans lopen, waar reviewdruk oploopt en waar bounded uitvoering of closeout om HR-aandacht vraagt."
    >
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <DashboardPanel
          surface="ops"
          eyebrow="Escalatiegevoelig"
          title={`${summary.escalationSensitiveCount} open`}
          body="Routes die over hun reviewdatum heen zijn en inmiddels de ingestelde escalatiegrens hebben bereikt."
          tone={summary.escalationSensitiveCount > 0 ? 'amber' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Achter cadans"
          title={`${summary.staleCount} open`}
          body="Routes zonder geldige reviewplanning of met reviewdruk buiten het ingestelde cadansvenster."
          tone={summary.staleCount > 0 ? 'amber' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Achter op review"
          title={`${summary.overdueCount} open`}
          body="Routes met een gemiste reviewdatum die nog niet vervallen of geescaleerd zijn."
          tone="slate"
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Binnen cadans"
          title={`${summary.upcomingCount} actief`}
          body="Zichtbare routes met een geldige reviewplanning die nog binnen het ingestelde ritme vallen."
          tone="slate"
        />
      </div>

      {boundedAttentionItems.length > 0 ? (
        <div className="mt-4 rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white p-5 shadow-[0_10px_24px_rgba(19,32,51,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-text)]">
              Nu aandacht nodig
            </p>
            {governanceSignalCount > 0 ? (
              <span className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-text)]">
                {governanceSignalCount} governance-signalen
              </span>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {boundedAttentionItems.map((item) => {
              const governanceSignals = getGovernanceSignals(item)
              const primaryLabel = governanceSignals[0]?.label ?? getOversightStateLabel(item.state)

              return (
                <div
                  key={`${item.routeId}:${item.state}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-4 py-3"
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{item.scopeLabel}</p>
                      <p className="text-xs text-[color:var(--dashboard-text)]">
                        {item.sourceLabel} - {item.reviewDateLabel}
                      </p>
                    </div>
                    {governanceSignals.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {governanceSignals.map((signal) => (
                          <span
                            key={`${item.routeId}:${signal.code}`}
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getGovernanceSignalTone(signal.code)}`}
                          >
                            {signal.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--dashboard-ink)]">
                    {primaryLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </DashboardSection>
  )
}
