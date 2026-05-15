'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { GuidedSelfServePanel } from '@/components/dashboard/guided-self-serve-panel'
import { CampaignActions } from '../campaign-actions'
import { PdfDownloadButton } from '../pdf-download-button'
import type {
  HrRouteBeheerNowDoing,
  HrRouteBeheerPhaseDetail,
  HrRouteBeheerPhaseKey,
  HrRouteBeheerPhaseSummary,
  RouteBeheerPageData,
} from './beheer-data'

const PHASE_TITLES: Record<HrRouteBeheerPhaseKey, string> = {
  doelgroep: 'Doelgroep klaarzetten',
  communicatie: 'Communicatie instellen',
  live: 'Live zetten & volgen',
  output: 'Output beoordelen',
  afronding: 'Afronden & controleren',
}
const PHASE_DETAIL_IDS: Record<HrRouteBeheerPhaseKey, string> = {
  doelgroep: 'deelnemers-en-importstatus',
  communicatie: 'route-instellingen',
  live: 'uitnodigingen-en-respons',
  output: 'dashboard-rapportstatus',
  afronding: 'status-en-logboek',
}
const NOW_DOING_LABEL = 'Nu doen'
const ROUTE_SETTINGS_CTA_LABEL = 'Bekijk instellingen'

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function phaseStatusLabel(status: 'done' | 'current' | 'open') {
  if (status === 'done') return 'Klaar'
  if (status === 'current') return 'Open'
  return 'Wacht'
}

function phaseStatusClass(status: 'done' | 'current' | 'open') {
  if (status === 'done') {
    return 'border-[#D7E6DF] bg-[#F6FAF8] text-[#3C8D8A]'
  }

  if (status === 'current') {
    return 'border-[#D9E4E2] bg-[#F7FBFA] text-[color:var(--teal)]'
  }

  return 'border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--muted)]'
}

function detailActionClass(kind: 'primary' | 'secondary') {
  return kind === 'primary'
    ? 'inline-flex items-center justify-center rounded-full bg-[color:var(--teal)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95'
    : 'inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]'
}

export function RouteBeheerNowDoingRow({ nowDoing }: { nowDoing: HrRouteBeheerNowDoing | null }) {
  if (!nowDoing) return null

  return (
    <Link
      href={nowDoing.href}
      className="group flex items-center justify-between gap-4 rounded-[18px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 transition hover:border-[color:var(--teal)] hover:bg-white"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {nowDoing.label ?? NOW_DOING_LABEL}
        </p>
        <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">{nowDoing.title}</p>
        <p className="mt-1 text-sm text-[color:var(--text)]">{nowDoing.body}</p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-[color:var(--teal)] transition group-hover:translate-x-0.5">
        Open
      </span>
    </Link>
  )
}

function RouteBeheerPhaseOverviewList(args: {
  phases: HrRouteBeheerPhaseSummary[]
  selectedPhaseKey: HrRouteBeheerPhaseKey | null
  onSelectPhase: (phaseKey: HrRouteBeheerPhaseKey) => void
}) {
  const { phases, selectedPhaseKey, onSelectPhase } = args

  return (
    <div className="space-y-2">
      {phases.map((phase) => {
        const active = phase.key === selectedPhaseKey

        return (
          <button
            key={phase.key}
            type="button"
            onClick={() => onSelectPhase(phase.key)}
            aria-expanded={active}
            className={joinClasses(
              'w-full rounded-[18px] border px-4 py-3 text-left transition',
              active
                ? 'border-[color:var(--teal)] bg-white shadow-[0_4px_16px_rgba(10,25,47,0.05)]'
                : 'border-[color:var(--border)] bg-[color:var(--bg)] hover:border-[color:var(--teal)] hover:bg-white',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[color:var(--ink)]">
                  {PHASE_TITLES[phase.key] ?? phase.label}
                </p>
                <p className="mt-1 text-sm text-[color:var(--text)]">{phase.body}</p>
              </div>
              <span
                className={joinClasses(
                  'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
                  phaseStatusClass(phase.status),
                )}
              >
                {phaseStatusLabel(phase.status)}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function RouteBeheerPhaseOverview(args: {
  phases: HrRouteBeheerPhaseSummary[]
  selectedPhaseKey?: HrRouteBeheerPhaseKey | null
  onSelectPhase?: (phaseKey: HrRouteBeheerPhaseKey) => void
}) {
  const [internalSelectedPhaseKey, setInternalSelectedPhaseKey] = useState<HrRouteBeheerPhaseKey | null>(
    args.selectedPhaseKey ?? null,
  )
  const selectedPhaseKey = args.onSelectPhase ? args.selectedPhaseKey ?? null : internalSelectedPhaseKey
  const onSelectPhase = args.onSelectPhase ?? setInternalSelectedPhaseKey

  return (
    <RouteBeheerPhaseOverviewList
      phases={args.phases}
      selectedPhaseKey={selectedPhaseKey}
      onSelectPhase={onSelectPhase}
    />
  )
}

export function RouteBeheerPhaseWorkspace(args: {
  data: RouteBeheerPageData
  initialSelectedPhaseKey: HrRouteBeheerPhaseKey | null
}) {
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<HrRouteBeheerPhaseKey | null>(
    args.initialSelectedPhaseKey,
  )

  return (
    <div className="space-y-4">
      <RouteBeheerPhaseOverviewList
        phases={args.data.phaseSummaries}
        selectedPhaseKey={selectedPhaseKey}
        onSelectPhase={setSelectedPhaseKey}
      />
      <RouteBeheerPhaseDetailSurface
        data={args.data}
        phases={args.data.phaseDetails}
        selectedPhaseKey={selectedPhaseKey}
      />
    </div>
  )
}

function RouteBeheerPhaseDetailContent({ data, detail }: { data: RouteBeheerPageData; detail: HrRouteBeheerPhaseDetail }) {
  const showSelfServeWorkspace =
    data.canExecuteCampaign && (detail.key === 'doelgroep' || detail.key === 'communicatie' || detail.key === 'live')

  return (
    <div id={PHASE_DETAIL_IDS[detail.key]} className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            {PHASE_TITLES[detail.key] ?? detail.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{detail.body}</p>
        </div>
        <span
          className={joinClasses(
            'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
            phaseStatusClass(detail.status),
          )}
        >
          {phaseStatusLabel(detail.status)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {detail.items.map((item) => (
          <div key={`${detail.key}-${item.label}`} className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{item.value}</p>
          </div>
        ))}
      </div>

      {detail.key === 'live' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {detail.links.map((link, index) => (
              <Link key={link.href} href={link.href} className={detailActionClass(index === 0 ? 'primary' : 'secondary')}>
                {link.label}
              </Link>
            ))}
          </div>
          {data.canManageCampaign || data.canExecuteCampaign ? (
            <CampaignActions
              campaignId={data.campaignId}
              isActive={data.isActive}
              pendingCount={data.pendingCount}
              canResendInvites={data.canExecuteCampaign}
              canArchiveCampaign={data.canManageCampaign}
            />
          ) : null}
          {showSelfServeWorkspace ? (
            <GuidedSelfServePanel
              campaignId={data.campaignId}
              scanType={data.scanType}
              isActive={data.isActive}
              deliveryMode={data.selfServe.deliveryMode}
              importReady={data.selfServe.importReady}
              hasSegmentDeepDive={data.selfServe.hasSegmentDeepDive}
              totalInvited={data.totalInvited}
              totalCompleted={data.totalCompleted}
              invitesNotSent={data.invitesNotSent}
              hasMinDisplay={data.hasMinDisplay}
              hasEnoughData={data.hasEnoughData}
              pendingCount={data.pendingCount}
              importQaConfirmed={data.selfServe.importQaConfirmed}
              launchTimingConfirmed={data.selfServe.launchTimingConfirmed}
              communicationReady={data.selfServe.communicationReady}
              remindableCount={data.selfServe.remindableCount}
              unsentRespondents={data.selfServe.unsentRespondents}
              launchDate={data.launchDate}
              launchConfirmedAt={data.selfServe.launchConfirmedAt}
              participantCommsConfig={data.selfServe.participantCommsConfig}
              reminderConfig={data.selfServe.reminderConfig}
              memberRole={data.membershipRole}
            />
          ) : null}
        </div>
      ) : detail.key === 'output' ? (
        <div className="flex flex-wrap items-center gap-3">
          <Link href={data.outputSummary.dashboardHref} className={detailActionClass('primary')}>
            Open dashboard
          </Link>
          {data.reportAvailable ? (
            <PdfDownloadButton
              campaignId={data.campaignId}
              campaignName={data.campaignName}
              scanType={data.scanType}
            />
          ) : (
            <span className="text-sm text-[color:var(--text)]">
              Rapport nog niet beschikbaar.
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {detail.links.map((link, index) => {
              const label =
                detail.key === 'communicatie' && index > 0
                  ? ROUTE_SETTINGS_CTA_LABEL
                  : link.label

              return (
                <Link key={link.href} href={link.href} className={detailActionClass(index === 0 ? 'primary' : 'secondary')}>
                    {label}
                </Link>
              )
            })}
          </div>
          {showSelfServeWorkspace ? (
            <GuidedSelfServePanel
              campaignId={data.campaignId}
              scanType={data.scanType}
              isActive={data.isActive}
              deliveryMode={data.selfServe.deliveryMode}
              importReady={data.selfServe.importReady}
              hasSegmentDeepDive={data.selfServe.hasSegmentDeepDive}
              totalInvited={data.totalInvited}
              totalCompleted={data.totalCompleted}
              invitesNotSent={data.invitesNotSent}
              hasMinDisplay={data.hasMinDisplay}
              hasEnoughData={data.hasEnoughData}
              pendingCount={data.pendingCount}
              importQaConfirmed={data.selfServe.importQaConfirmed}
              launchTimingConfirmed={data.selfServe.launchTimingConfirmed}
              communicationReady={data.selfServe.communicationReady}
              remindableCount={data.selfServe.remindableCount}
              unsentRespondents={data.selfServe.unsentRespondents}
              launchDate={data.launchDate}
              launchConfirmedAt={data.selfServe.launchConfirmedAt}
              participantCommsConfig={data.selfServe.participantCommsConfig}
              reminderConfig={data.selfServe.reminderConfig}
              memberRole={data.membershipRole}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

function RouteBeheerPhaseDetailSurface(args: {
  data: RouteBeheerPageData
  phases: HrRouteBeheerPhaseDetail[]
  selectedPhaseKey: HrRouteBeheerPhaseKey | null
}) {
  const detail = args.phases.find((phase) => phase.key === args.selectedPhaseKey) ?? null

  if (!detail) {
    return null
  }

  return (
    <section
      id="fase-detail"
      className="rounded-[20px] border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]"
    >
      <RouteBeheerPhaseDetailContent data={args.data} detail={detail} />
    </section>
  )
}

export function RouteBeheerPhaseDetailPanel(args: {
  phases: HrRouteBeheerPhaseDetail[]
  selectedPhaseKey?: HrRouteBeheerPhaseKey | null
  data?: RouteBeheerPageData
  initialSelectedPhaseKey?: HrRouteBeheerPhaseKey | null
}) {
  const [internalSelectedPhaseKey] = useState<HrRouteBeheerPhaseKey | null>(
    args.selectedPhaseKey ?? args.initialSelectedPhaseKey ?? null,
  )
  const selectedPhaseKey = args.selectedPhaseKey ?? internalSelectedPhaseKey

  if (!selectedPhaseKey) {
    return null
  }

  if (!args.data) {
    const detail = args.phases.find((phase) => phase.key === selectedPhaseKey) ?? null
    if (!detail) return null

    return (
      <section
        id="fase-detail"
        className="rounded-[20px] border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {PHASE_TITLES[detail.key] ?? detail.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{detail.body}</p>
            </div>
            <span
              className={joinClasses(
                'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
                phaseStatusClass(detail.status),
              )}
            >
              {phaseStatusLabel(detail.status)}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.items.map((item) => (
              <div key={`${detail.key}-${item.label}`} className="rounded-[16px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.links.map((link, index) => {
              const label =
                detail.key === 'communicatie' && index > 0
                  ? ROUTE_SETTINGS_CTA_LABEL
                  : link.label

              return (
                <Link key={link.href} href={link.href} className={detailActionClass(index === 0 ? 'primary' : 'secondary')}>
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  return (
    <RouteBeheerPhaseDetailSurface
      data={args.data}
      phases={args.phases}
      selectedPhaseKey={selectedPhaseKey}
    />
  )
}

export function RouteBeheerOutputSummary({ data }: { data: RouteBeheerPageData }) {
  const summary = data.outputSummary

  return (
    <section className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_1px_4px_rgba(10,25,47,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Output & afronding
          </p>
          <p className="mt-2 text-sm text-[color:var(--text)]">{summary.label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={joinClasses('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', summary.dashboardReady ? 'border-[#D7E6DF] bg-[#F6FAF8] text-[#3C8D8A]' : 'border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--muted)]')}>
            Dashboard {summary.dashboardReady ? 'klaar' : 'wacht'}
          </span>
          <span className={joinClasses('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', summary.reportReady ? 'border-[#D7E6DF] bg-[#F6FAF8] text-[#3C8D8A]' : 'border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--muted)]')}>
            Rapport {summary.reportReady ? 'klaar' : 'wacht'}
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={summary.dashboardHref} className={detailActionClass('secondary')}>
          Open dashboard
        </Link>
        {data.reportAvailable ? (
          <PdfDownloadButton
            campaignId={data.campaignId}
            campaignName={data.campaignName}
            scanType={data.scanType}
            label="Download PDF"
            loadingLabel="PDF ophalen..."
            containerClassName="flex flex-col items-start gap-1"
            buttonClassName="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]"
            errorClassName="max-w-48 text-xs text-red-600"
          />
        ) : null}
      </div>
    </section>
  )
}

export function RouteBeheerLogbookSummary(args: {
  href: string
  latestAuditSummary: string | null
}) {
  return (
    <section className="rounded-[18px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Logboek / controle
          </p>
          <p className="mt-2 text-sm text-[color:var(--text)]">
            {args.latestAuditSummary ?? 'Geen activiteit'}
          </p>
        </div>
        <Link href={args.href} className={detailActionClass('secondary')}>
          Bekijk logboek
        </Link>
      </div>
    </section>
  )
}
