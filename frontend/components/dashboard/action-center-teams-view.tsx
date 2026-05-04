'use client'

import React from 'react'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import {
  buildActionCenterTeamRows,
  buildTeamsSummaryStats,
  deriveScopeStatusChip,
  isActionCenterReviewSoon,
} from '@/lib/action-center-teams-view'

interface ActionCenterTeamsViewProps {
  items: ActionCenterPreviewItem[]
  selectedTeamId: string | null
  onSelectTeam: (teamId: string) => void
  onNavigateToActions: (itemId: string) => void
  canAssignManagers: boolean
}

const UNASSIGNED_MANAGER_LABEL = 'Niet gekoppeld'

function getInitials(name: string | null) {
  if (!name) return 'VS'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getManagerName(name: string | null) {
  return name ?? UNASSIGNED_MANAGER_LABEL
}

function isClosedStatus(status: ActionCenterPreviewItem['status']) {
  return status === 'afgerond' || status === 'gestopt'
}

function ScopeStatusChip({ status }: { status: ReturnType<typeof deriveScopeStatusChip> }) {
  const copy =
    status === 'actief'
      ? {
          label: 'Actief',
          className: 'border-[#caece8] bg-[#dff7f4] text-[#0d6a7c]',
        }
      : status === 'zonder-manager'
        ? {
            label: 'Zonder manager',
            className: 'border-[#ffd7d1] bg-[#fff1ef] text-[#d2574b]',
          }
        : {
            label: 'Geen opvolging',
            className: 'border-[#e6dfd3] bg-[#f7f2ea] text-[#6d6559]',
          }

  return (
    <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-sm font-semibold ${copy.className}`}>
      {copy.label}
    </span>
  )
}

function SummaryStat({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string
  detail: string
  accent: 'amber' | 'red' | 'teal'
}) {
  const accentClass =
    accent === 'amber' ? 'bg-[#ff9b4a]' : accent === 'red' ? 'bg-[#ef6e64]' : 'bg-[#70b7aa]'

  return (
    <div className="rounded-[18px] border border-[#e6ddd2] bg-white px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${accentClass}`} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d7368]">{label}</p>
      </div>
      <p className="dash-number mt-3 text-[1.95rem] font-semibold tracking-[-0.05em] text-[#132033]">{value}</p>
      <p className="mt-1 text-sm text-[#6d6458]">{detail}</p>
    </div>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#ddd3c7] bg-[#fbf8f4] px-5 py-5 text-sm leading-7 text-[#5d6f84]">
      {text}
    </div>
  )
}

function EmptySection({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[28px] border border-[#e4d9cb] bg-white px-6 py-10 text-center shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
      <h2 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[#132033]">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5d6f84]">{body}</p>
    </section>
  )
}

export function ActionCenterTeamsView({
  items,
  selectedTeamId,
  onSelectTeam,
  onNavigateToActions,
  canAssignManagers,
}: ActionCenterTeamsViewProps) {
  void canAssignManagers

  const teamRows = buildActionCenterTeamRows(items)
  const selectedTeam = teamRows.find((team) => team.id === selectedTeamId) ?? teamRows[0] ?? null
  const summary = buildTeamsSummaryStats(teamRows)
  const selectedTeamItems = selectedTeam ? items.filter((item) => item.teamId === selectedTeam.id) : []
  const teamOpenItems = selectedTeamItems.filter((item) => !isClosedStatus(item.status))
  const teamReviewItems = selectedTeamItems.filter((item) => isActionCenterReviewSoon(item.reviewDate))
  const blockedCount = teamOpenItems.filter((item) => item.status === 'geblokkeerd').length

  if (!selectedTeam) {
    return (
      <EmptySection
        title="Nog geen teams zichtbaar"
        body="Zodra opvolgingsroutes aan teamscopes zijn gekoppeld, verschijnt hier het teamoverzicht."
      />
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[#e4d9cb] bg-[#fcfaf7] px-7 py-7 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Action Center / Teams in scope</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8377]">ACTION CENTER</p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[#132033]">Teams in scope</h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#4f6175]">
              Bekijk welke teams of afdelingen aan opvolging, managers en reviews zijn gekoppeld.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStat label="Teams in scope" value={`${summary.teamsInScope}`} detail="zichtbaar voor jou" accent="teal" />
            <SummaryStat label="Zonder manager" value={`${summary.withoutManager}`} detail="nog niet gekoppeld" accent="red" />
            <SummaryStat label="Met open opvolging" value={`${summary.withOpenFollowThrough}`} detail="actieve routes" accent="amber" />
            <SummaryStat label="Review eerstvolgt" value={`${summary.reviewFirstUp}`} detail="binnen 7 dagen" accent="teal" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr),minmax(320px,0.78fr)]">
        <section className="overflow-x-auto rounded-[28px] border border-[#e4d9cb] bg-white shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[minmax(0,1.9fr),minmax(0,1.2fr),minmax(0,1.35fr),116px,116px] gap-4 border-b border-[#ebe1d5] bg-[#faf6f0] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">
              <span>TEAM / AFDELING</span>
              <span>STATUS</span>
              <span>MANAGER</span>
              <span>OPEN OPVOLGING</span>
              <span>REVIEW &lt; 7D</span>
            </div>
            <div className="divide-y divide-[#ebe1d5]">
              {teamRows.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  data-team-id={team.id}
                  className={`grid w-full grid-cols-[minmax(0,1.9fr),minmax(0,1.2fr),minmax(0,1.35fr),116px,116px] gap-4 px-6 py-4 text-left transition hover:bg-[#fcfaf7] ${
                    selectedTeam.id === team.id ? 'bg-[#fcfaf7]' : 'bg-white'
                  }`}
                  onClick={() => onSelectTeam(team.id)}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#132033]">{team.label}</p>
                    <p className="mt-1 text-sm text-[#7c7368]">
                      {team.scopeType === 'department' ? 'Afdeling' : team.scopeType === 'org' ? 'Organisatie' : 'Itemscope'}
                    </p>
                  </div>
                  <div>
                    <ScopeStatusChip status={deriveScopeStatusChip(team)} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#132033]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3ece3] text-xs font-semibold text-[#5f564a]">
                      {getInitials(getManagerName(team.currentManagerName))}
                    </span>
                    <span className="font-semibold">{getManagerName(team.currentManagerName)}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#132033]">{team.openActions}</div>
                  <div className="text-sm font-semibold text-[#5a7088]">{team.reviewSoonCount}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[30px] bg-[#182231] px-7 py-7 text-white shadow-[0_22px_56px_rgba(19,32,51,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Teamcontext</p>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-xl font-semibold">
                {getInitials(getManagerName(selectedTeam.currentManagerName))}
              </div>
              <div>
                <p className="text-[1.4rem] font-semibold tracking-[-0.03em]">{selectedTeam.label}</p>
                <p className="mt-1 text-sm text-white/58">{getManagerName(selectedTeam.currentManagerName)}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Open</p>
                <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.04em] text-white">{teamOpenItems.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Review &lt; 7D</p>
                <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.04em] text-[#ffb16e]">{selectedTeam.reviewSoonCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Geblokkeerd</p>
                <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.04em] text-white">{blockedCount}</p>
              </div>
            </div>
            {selectedTeam.peopleCount > 0 ? (
              <p className="mt-6 text-sm leading-7 text-white/72">{selectedTeam.peopleCount} mensen in scope</p>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Open acties</p>
            <div className="mt-4 space-y-4">
              {teamOpenItems.length === 0 ? (
                <EmptyBlock text="Geen open acties voor dit team." />
              ) : (
                teamOpenItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full rounded-[18px] border border-[#efe7dc] bg-[#fcfaf7] px-4 py-4 text-left transition hover:border-[#d7cab9]"
                    onClick={() => onNavigateToActions(item.id)}
                  >
                    <p className="font-semibold text-[#132033]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#5d6f84]">
                      {item.sourceLabel}
                      {' · '}
                      {item.reviewDateLabel}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Review deze week</p>
            <div className="mt-4 space-y-4">
              {teamReviewItems.length === 0 ? (
                <EmptyBlock text="Geen reviews gepland voor dit team in de komende 7 dagen." />
              ) : (
                teamReviewItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full rounded-[18px] border border-[#efe7dc] bg-[#fcfaf7] px-4 py-4 text-left transition hover:border-[#d7cab9]"
                    onClick={() => onNavigateToActions(item.id)}
                  >
                    <p className="font-semibold text-[#132033]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#5d6f84]">Volgende bespreking {item.reviewDateLabel}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Legenda</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <p className="text-sm leading-7 text-[#42556b]"><span className="font-semibold text-[#132033]">Actief:</span> Scope heeft ten minste één open opvolgingsroute.</p>
          <p className="text-sm leading-7 text-[#42556b]"><span className="font-semibold text-[#132033]">Zonder manager:</span> Scope heeft een open route maar geen toegewezen manager.</p>
          <p className="text-sm leading-7 text-[#42556b]"><span className="font-semibold text-[#132033]">Geen opvolging:</span> Alle routes zijn afgerond of gestopt.</p>
          <p className="text-sm leading-7 text-[#42556b]"><span className="font-semibold text-[#132033]">Review &lt; 7 dagen:</span> Minstens één route vraagt deze week aandacht.</p>
        </div>
      </section>
    </div>
  )
}
