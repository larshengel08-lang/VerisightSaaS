'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { getContactDesiredTimingLabel, getContactRouteLabel } from '@/lib/contact-funnel'
import { getDeliveryModeLabel, normalizeDeliveryMode } from '@/lib/implementation-readiness'
import {
  buildDeliveryAutoSignals,
  buildDeliveryOpsSummary,
  DELIVERY_CHECKPOINT_DEFINITIONS,
  DELIVERY_EXCEPTION_OPTIONS,
  DELIVERY_LIFECYCLE_OPTIONS,
  DELIVERY_MANUAL_STATE_OPTIONS,
  getDeliveryAutoStateLabel,
  getDeliveryExceptionLabel,
  getDeliveryGovernanceOutputLaneReadyLabel,
  getDeliveryGovernanceOutputLaneTitle,
  getDeliveryLifecycleLabel,
  getDeliveryManualStateLabel,
  type CampaignDeliveryCheckpoint,
  type CampaignDeliveryRecord,
  type DeliveryExceptionStatus,
  type DeliveryManualState,
} from '@/lib/ops-delivery'
import { buildMtoAssistedReadinessSummary } from '@/lib/mto-assisted-readiness'
import type { ContactRequestRecord } from '@/lib/pilot-learning'
import type { DeliveryMode, ScanType } from '@/lib/types'

interface Props {
  campaignId: string
  scanType: ScanType
  deliveryMode: DeliveryMode | null
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  activeClientAccessCount: number
  pendingClientInviteCount: number
  record: CampaignDeliveryRecord | null
  checkpoints: CampaignDeliveryCheckpoint[]
  leadOptions: ContactRequestRecord[]
  leadLoadError?: string | null
  linkedLearningDossierCount?: number
  learningCloseoutEvidenceCount?: number
  editable?: boolean
}

type RecordDraft = {
  contact_request_id: string
  lifecycle_stage: CampaignDeliveryRecord['lifecycle_stage']
  exception_status: CampaignDeliveryRecord['exception_status']
  operator_owner: string
  next_step: string
  operator_notes: string
  customer_handoff_note: string
}

type CheckpointDraft = {
  manual_state: DeliveryManualState
  exception_status: DeliveryExceptionStatus
  operator_note: string
}

function formatAmsterdamDate(value: string | null | undefined) {
  if (!value) return 'Nog niet bevestigd'
  try {
    return new Intl.DateTimeFormat('nl-NL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function buildLeadLabel(lead: ContactRequestRecord) {
  return `${lead.name} — ${lead.organization} — ${getContactRouteLabel(lead.route_interest)} — ${getContactDesiredTimingLabel(lead.desired_timing)}`
}

function buildOpsWarnings(args: {
  record: CampaignDeliveryRecord | null
  linkedLead: ContactRequestRecord | null
  invitesNotSent: number
  pendingClientInviteCount: number
  incompleteScores: number
  activeClientAccessCount: number
  totalCompleted: number
  hasEnoughData: boolean
  governanceBlockers: string[]
}) {
  const items: string[] = []

  if (!args.linkedLead) items.push('De sales-to-delivery handoff is nog niet expliciet gekoppeld aan deze campaign.')
  if (args.invitesNotSent > 0) items.push(`${args.invitesNotSent} respondent(en) hebben nog geen invite ontvangen of verzendbevestiging.`)
  if (args.pendingClientInviteCount > 0 && args.activeClientAccessCount === 0) items.push(`${args.pendingClientInviteCount} klantinvite(s) wachten nog op activatie.`)
  if (args.incompleteScores > 0) items.push(`${args.incompleteScores} opgeslagen responses hebben nog incomplete scoredata.`)
  if (args.totalCompleted >= 5 && !args.hasEnoughData) items.push('De campaign heeft een indicatief first-value beeld, maar nog geen stevig patroonniveau.')
  if (args.record?.exception_status && args.record.exception_status !== 'none') items.push(`Open exception: ${getDeliveryExceptionLabel(args.record.exception_status)}.`)
  items.push(...args.governanceBlockers)

  return Array.from(new Set(items))
}

export function PreflightChecklist({
  campaignId,
  scanType,
  deliveryMode,
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasMinDisplay,
  hasEnoughData,
  activeClientAccessCount,
  pendingClientInviteCount,
  record,
  checkpoints,
  leadOptions,
  leadLoadError = null,
  linkedLearningDossierCount = 0,
  learningCloseoutEvidenceCount = 0,
  editable = false,
}: Props) {
  const router = useRouter()
  const resolvedMode = normalizeDeliveryMode(deliveryMode)
  const autoSignals = useMemo(
    () =>
      buildDeliveryAutoSignals({
        scanType,
        linkedLeadPresent: Boolean(record?.contact_request_id),
        totalInvited,
        totalCompleted,
        invitesNotSent,
        incompleteScores,
        hasMinDisplay,
        hasEnoughData,
        activeClientAccessCount,
        pendingClientInviteCount,
      }),
    [
      activeClientAccessCount,
      hasEnoughData,
      hasMinDisplay,
      incompleteScores,
      invitesNotSent,
      pendingClientInviteCount,
      record?.contact_request_id,
      scanType,
      totalCompleted,
      totalInvited,
    ],
  )
  const summary = useMemo(
    () =>
      buildDeliveryOpsSummary({
        scanType,
        record,
        checkpoints,
        autoSignals,
        hasLearningCloseoutEvidence: learningCloseoutEvidenceCount > 0,
      }),
    [autoSignals, checkpoints, learningCloseoutEvidenceCount, record, scanType],
  )
  const governance = summary.governance
  const linkedLead = useMemo(
    () => leadOptions.find((lead) => lead.id === record?.contact_request_id) ?? null,
    [leadOptions, record?.contact_request_id],
  )
  const [recordDraft, setRecordDraft] = useState<RecordDraft>({
    contact_request_id: record?.contact_request_id ?? '',
    lifecycle_stage: record?.lifecycle_stage ?? 'setup_in_progress',
    exception_status: record?.exception_status ?? 'none',
    operator_owner: record?.operator_owner ?? '',
    next_step: record?.next_step ?? '',
    operator_notes: record?.operator_notes ?? '',
    customer_handoff_note: record?.customer_handoff_note ?? '',
  })
  const [checkpointDrafts, setCheckpointDrafts] = useState<Record<string, CheckpointDraft>>(() =>
    Object.fromEntries(
      checkpoints.map((checkpoint) => [
        checkpoint.id,
        {
          manual_state: checkpoint.manual_state,
          exception_status: checkpoint.exception_status,
          operator_note: checkpoint.operator_note ?? '',
        },
      ]),
    ),
  )
  const [recordBusy, setRecordBusy] = useState(false)
  const [checkpointBusyId, setCheckpointBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mtoReadiness = buildMtoAssistedReadinessSummary({
    qualificationStatus: linkedLead?.qualification_status,
    qualifiedRoute: linkedLead?.qualified_route,
    qualificationReviewedBy: linkedLead?.qualification_reviewed_by,
    opsOwner: record?.operator_owner,
    opsNextStep: record?.next_step,
    opsHandoffNote: record?.customer_handoff_note ?? linkedLead?.ops_handoff_note,
    linkedDeliveryCount: record ? 1 : 0,
    linkedLearningDossierCount,
    learningCloseoutEvidenceCount,
  })

  const opsWarnings = buildOpsWarnings({
    record,
    linkedLead,
    invitesNotSent,
    pendingClientInviteCount,
    incompleteScores,
    activeClientAccessCount,
    totalCompleted,
    hasEnoughData,
    governanceBlockers: governance.globalBlockers,
  })

  function updateRecordDraft<K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) {
    setRecordDraft((current) => ({ ...current, [key]: value }))
  }

  function updateCheckpointDraft<K extends keyof CheckpointDraft>(checkpointId: string, key: K, value: CheckpointDraft[K]) {
    setCheckpointDrafts((current) => ({
      ...current,
      [checkpointId]: { ...current[checkpointId], [key]: value },
    }))
  }

  async function saveRecord() {
    setMessage(null)
    setError(null)
    setRecordBusy(true)

    try {
      const response = await fetch(`/api/campaign-delivery/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_request_id: recordDraft.contact_request_id || null,
          lifecycle_stage: recordDraft.lifecycle_stage,
          exception_status: recordDraft.exception_status,
          operator_owner: recordDraft.operator_owner || null,
          next_step: recordDraft.next_step || null,
          operator_notes: recordDraft.operator_notes || null,
          customer_handoff_note: recordDraft.customer_handoff_note || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { detail?: string } | null
      if (!response.ok) {
        setError(payload?.detail ?? 'Deliveryrecord opslaan mislukt.')
        setRecordBusy(false)
        return
      }

      setMessage('Deliveryrecord bijgewerkt.')
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens opslaan van de deliveryrecord.')
    } finally {
      setRecordBusy(false)
    }
  }

  async function saveCheckpoint(checkpoint: CampaignDeliveryCheckpoint) {
    setMessage(null)
    setError(null)
    setCheckpointBusyId(checkpoint.id)

    try {
      const draft = checkpointDrafts[checkpoint.id]
      const autoSignal = autoSignals[checkpoint.checkpoint_key]
      const response = await fetch(`/api/campaign-delivery-checkpoints/${checkpoint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual_state: draft.manual_state,
          exception_status: draft.exception_status,
          operator_note: draft.operator_note || null,
          auto_state: autoSignal.autoState,
          last_auto_summary: autoSignal.summary,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { detail?: string } | null
      if (!response.ok) {
        setError(payload?.detail ?? 'Checkpoint opslaan mislukt.')
        setCheckpointBusyId(null)
        return
      }

      const checkpointTitle =
        DELIVERY_CHECKPOINT_DEFINITIONS.find((item) => item.key === checkpoint.checkpoint_key)?.title ??
        checkpoint.checkpoint_key
      setMessage(`Checkpoint "${checkpointTitle}" bijgewerkt.`)
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens opslaan van de checkpoint.')
    } finally {
      setCheckpointBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <OpsSummaryCard
          title="Lifecycle"
          value={getDeliveryLifecycleLabel(record?.lifecycle_stage)}
          body="Eén persistente status voor setup, launch, activatie, first value en follow-up."
          tone={record?.exception_status !== 'none' ? 'amber' : 'blue'}
        />
        <OpsSummaryCard
          title="Launch status"
          value={summary.launchStatus}
          body={`Route: ${getDeliveryModeLabel(resolvedMode, scanType)}.`}
          tone={summary.launchTone}
        />
        <OpsSummaryCard
          title="First value"
          value={summary.firstValueStatus}
          body={autoSignals.first_value.summary}
          tone={summary.firstValueTone}
        />
        <OpsSummaryCard
          title="Adoptie"
          value={summary.adoptionStatus}
          body={summary.followUpStatus}
          tone={summary.adoptionTone}
        />
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Persistente delivery control</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Gebruik deze laag als canonieke ops-truth voor handoff, lifecycle, launch readiness, first value en eerste managementgebruik.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
              Exceptionstatus: {getDeliveryExceptionLabel(record?.exception_status)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
              Eerste managementgebruik: {formatAmsterdamDate(record?.first_management_use_confirmed_at)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Lifecyclefase</span>
                {editable ? (
                  <select
                    value={recordDraft.lifecycle_stage}
                    onChange={(event) =>
                      updateRecordDraft('lifecycle_stage', event.target.value as CampaignDeliveryRecord['lifecycle_stage'])
                    }
                    className={inputClass}
                  >
                    {DELIVERY_LIFECYCLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <ReadOnlyValue value={getDeliveryLifecycleLabel(record?.lifecycle_stage)} />
                )}
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Exceptionstatus</span>
                {editable ? (
                  <select
                    value={recordDraft.exception_status}
                    onChange={(event) =>
                      updateRecordDraft('exception_status', event.target.value as CampaignDeliveryRecord['exception_status'])
                    }
                    className={inputClass}
                  >
                    {DELIVERY_EXCEPTION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <ReadOnlyValue value={getDeliveryExceptionLabel(record?.exception_status)} />
                )}
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Ops-eigenaar</span>
                {editable ? (
                  <input
                    type="text"
                    value={recordDraft.operator_owner}
                    onChange={(event) => updateRecordDraft('operator_owner', event.target.value)}
                    placeholder="Bijv. Lars / Delivery"
                    className={inputClass}
                  />
                ) : (
                  <ReadOnlyValue value={record?.operator_owner ?? 'Nog niet ingevuld'} />
                )}
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Gekoppelde lead</span>
                {editable ? (
                  <select
                    value={recordDraft.contact_request_id}
                    onChange={(event) => updateRecordDraft('contact_request_id', event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Nog geen lead gekoppeld</option>
                    {leadOptions.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {buildLeadLabel(lead)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <ReadOnlyValue value={linkedLead ? buildLeadLabel(linkedLead) : 'Nog geen lead gekoppeld'} />
                )}
              </label>
            </div>

            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Volgende stap</span>
              {editable ? (
                <textarea
                  value={recordDraft.next_step}
                  onChange={(event) => updateRecordDraft('next_step', event.target.value)}
                  rows={3}
                  placeholder="Bijv. import preview handmatig bevestigen en klantactivatie voorbereiden"
                  className={`${inputClass} min-h-24 resize-y`}
                />
              ) : (
                <ReadOnlyBlock value={record?.next_step ?? 'Nog geen volgende stap opgeslagen.'} />
              )}
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Interne operator-notes</span>
                {editable ? (
                  <textarea
                    value={recordDraft.operator_notes}
                    onChange={(event) => updateRecordDraft('operator_notes', event.target.value)}
                    rows={5}
                    placeholder="Interne context, risico's, recoverypad"
                    className={`${inputClass} min-h-32 resize-y`}
                  />
                ) : (
                  <ReadOnlyBlock value={record?.operator_notes ?? 'Nog geen operator-notes opgeslagen.'} />
                )}
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Klant-handoffnotitie</span>
                {editable ? (
                  <textarea
                    value={recordDraft.customer_handoff_note}
                    onChange={(event) => updateRecordDraft('customer_handoff_note', event.target.value)}
                    rows={5}
                    placeholder="Wat de klant nu al weet of nog moet krijgen"
                    className={`${inputClass} min-h-32 resize-y`}
                  />
                ) : (
                  <ReadOnlyBlock value={record?.customer_handoff_note ?? 'Nog geen klant-handoffnotitie opgeslagen.'} />
                )}
              </label>
            </div>

            {editable ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void saveRecord()}
                  disabled={recordBusy}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recordBusy ? 'Opslaan...' : 'Deliveryrecord opslaan'}
                </button>
                <Link
                  href="/beheer/contact-aanvragen"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  Open leadlijst
                </Link>
                <Link
                  href={`/beheer/klantlearnings?campaign=${campaignId}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  Open learning-workbench
                </Link>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Handoffcontext</p>
              {linkedLead ? (
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  <p className="font-semibold text-slate-900">{linkedLead.name}</p>
                  <p>{linkedLead.organization}</p>
                  <p>{linkedLead.work_email}</p>
                  <p>
                    Route: {getContactRouteLabel(linkedLead.route_interest)}. Timing: {getContactDesiredTimingLabel(linkedLead.desired_timing)}.
                  </p>
                  <p>{linkedLead.current_question}</p>
                  {linkedLead.ops_handoff_note ? (
                    <div className="rounded-2xl border border-white bg-white px-3 py-3 text-xs leading-5 text-slate-600">
                      <p className="font-semibold text-slate-900">Lead-handoff</p>
                      <p className="mt-1">{linkedLead.ops_handoff_note}</p>
                    </div>
                  ) : null}
                </div>
              ) : leadLoadError ? (
                <p className="mt-3 text-sm leading-6 text-amber-700">{leadLoadError}</p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Koppel hier de lead zodat routekwalificatie, overdracht en deliverycontext niet in losse notities blijven hangen.
                </p>
              )}
            </div>
            {mtoReadiness.applicable ? (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">MTO assisted readiness</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{mtoReadiness.headline}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{mtoReadiness.detail}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {mtoReadiness.releaseLabel}
                </p>
                <ul className="mt-3 space-y-2">
                  {mtoReadiness.checklistItems.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                      <span className="text-amber-500">!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Ops-warnings</p>
              {opsWarnings.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Geen directe warnings. Delivery kan nu vooral op lifecycle, first value en follow-up worden gestuurd.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {opsWarnings.map((warning) => (
                    <li key={warning} className="flex gap-2 text-sm leading-6 text-slate-700">
                      <span className="text-amber-500">!</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Governance per fase</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Deze lanes laten zien welke expliciete blockers nog tussen launch, activation, first value, output en closeout staan.
              </p>
              <div className="mt-4 space-y-3">
                <GovernanceLane
                  title="Launch"
                  ready={governance.launchReady}
                  readyLabel="Launch-ready"
                  blockers={[...governance.intakeBlockers, ...governance.importBlockers, ...governance.inviteBlockers]}
                />
                <GovernanceLane
                  title="Activatie"
                  ready={governance.activationReady}
                  readyLabel="Activatie bevestigd"
                  blockers={governance.activationBlockers}
                />
                <GovernanceLane
                  title="First value"
                  ready={governance.firstValueReady}
                  readyLabel="First value bevestigd"
                  blockers={governance.firstValueBlockers}
                />
                <GovernanceLane
                  title={getDeliveryGovernanceOutputLaneTitle(scanType)}
                  ready={governance.managementUseReady}
                  readyLabel={getDeliveryGovernanceOutputLaneReadyLabel(scanType)}
                  blockers={[...governance.reportDeliveryBlockers, ...governance.managementUseBlockers]}
                />
                <GovernanceLane
                  title="Follow-up en learning"
                  ready={governance.learningCloseoutReady}
                  readyLabel={
                    linkedLearningDossierCount > 0 ? 'Closeout evidence klaar' : 'Closeout nog open'
                  }
                  blockers={[
                    ...governance.followUpBlockers,
                    ...governance.learningCloseoutBlockers,
                    ...(linkedLearningDossierCount === 0
                      ? ['Nog geen learningdossier gekoppeld aan deze campaign.']
                      : learningCloseoutEvidenceCount === 0
                        ? ['Learningdossier bestaat, maar mist nog expliciete review-, vervolg- of stopuitkomst.']
                        : []),
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-950">Belangrijke gates</p>
              <p className="mt-2">Launch readiness is pas rond als intake, import-QA en klantactivatie expliciet bevestigd zijn.</p>
              <p className="mt-2">First value telt pas echt als output veilig leesbaar is en report delivery handmatig is bevestigd.</p>
              <p className="mt-2">Eerste managementgebruik blijft bewust handmatig bevestigd totdat er een stevigere adoption-bewijslaag is.</p>
            </div>
          </div>
        </div>
      </div>

      <details className="group rounded-[22px] border border-slate-200 bg-white" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Persistente delivery checkpoints</p>
            <p className="mt-1 text-sm text-slate-500">
              Auto-signalen en handmatige bevestigingen leven hier samen, zodat launch, activatie en eerste managementgebruik overdraagbaar blijven.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {checkpoints.filter((item) => item.manual_state !== 'pending').length}/{checkpoints.length} handmatig bevestigd
          </span>
        </summary>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            Route: <span className="font-semibold text-slate-900">{getDeliveryModeLabel(resolvedMode, scanType)}</span>.{' '}
            {resolvedMode === 'live'
              ? 'Live blijft een bewuste vervolgroute; bevestig timing, eigenaarschap en klantcommunicatie extra scherp.'
              : 'Baseline blijft de standaard eerste deliveryroute en hoort dus de default checklijn te dragen.'}
          </div>

          <div className="space-y-4">
            {DELIVERY_CHECKPOINT_DEFINITIONS.map((definition) => {
              const checkpoint = checkpoints.find((item) => item.checkpoint_key === definition.key)
              if (!checkpoint) return null
              const draft = checkpointDrafts[checkpoint.id]
              const autoSignal = autoSignals[definition.key]

              return (
                <div key={definition.key} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{definition.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{definition.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-3 py-1 font-semibold ${
                          autoSignal.autoState === 'ready'
                            ? 'bg-emerald-50 text-emerald-700'
                            : autoSignal.autoState === 'warning'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {getDeliveryAutoStateLabel(autoSignal.autoState)}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600">
                        {getDeliveryManualStateLabel(checkpoint.manual_state)}
                      </span>
                      {checkpoint.exception_status !== 'none' ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                          {getDeliveryExceptionLabel(checkpoint.exception_status)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(280px,0.9fr)]">
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-white bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <p className="font-semibold text-slate-900">Auto-signaal</p>
                        <p className="mt-1">{autoSignal.summary}</p>
                      </div>
                      <label className="space-y-1 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">Operator-note</span>
                        {editable ? (
                          <textarea
                            value={draft.operator_note}
                            onChange={(event) => updateCheckpointDraft(checkpoint.id, 'operator_note', event.target.value)}
                            rows={4}
                            placeholder="Noteer expliciete bevestiging, uitzondering of recoverypad"
                            className={`${inputClass} min-h-28 resize-y`}
                          />
                        ) : (
                          <ReadOnlyBlock value={checkpoint.operator_note ?? 'Nog geen operator-note opgeslagen.'} />
                        )}
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="space-y-1 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">Handmatige status</span>
                        {editable ? (
                          <select
                            value={draft.manual_state}
                            onChange={(event) =>
                              updateCheckpointDraft(checkpoint.id, 'manual_state', event.target.value as DeliveryManualState)
                            }
                            className={inputClass}
                          >
                            {DELIVERY_MANUAL_STATE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <ReadOnlyValue value={getDeliveryManualStateLabel(checkpoint.manual_state)} />
                        )}
                      </label>

                      <label className="space-y-1 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">Exception binnen checkpoint</span>
                        {editable ? (
                          <select
                            value={draft.exception_status}
                            onChange={(event) =>
                              updateCheckpointDraft(
                                checkpoint.id,
                                'exception_status',
                                event.target.value as DeliveryExceptionStatus,
                              )
                            }
                            className={inputClass}
                          >
                            {DELIVERY_EXCEPTION_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <ReadOnlyValue value={getDeliveryExceptionLabel(checkpoint.exception_status)} />
                        )}
                      </label>

                      <div className="rounded-2xl border border-white bg-white px-4 py-3 text-xs leading-5 text-slate-500">
                        Laatste autosamenvatting: {checkpoint.last_auto_summary ?? 'Nog niet opgeslagen; wordt bij eerste save vastgelegd.'}
                      </div>

                      {editable ? (
                        <button
                          type="button"
                          onClick={() => void saveCheckpoint(checkpoint)}
                          disabled={checkpointBusyId === checkpoint.id}
                          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {checkpointBusyId === checkpoint.id ? 'Opslaan...' : 'Checkpoint opslaan'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </details>
    </div>
  )
}

function ReadOnlyValue({ value }: { value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{value}</div>
}

function ReadOnlyBlock({ value }: { value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">{value}</div>
}

function OpsSummaryCard({
  title,
  value,
  body,
  tone,
}: {
  title: string
  value: string
  body: string
  tone: 'blue' | 'emerald' | 'amber' | 'slate'
}) {
  const className =
    tone === 'emerald'
      ? 'border-emerald-100 bg-emerald-50'
      : tone === 'amber'
        ? 'border-amber-100 bg-amber-50'
        : tone === 'blue'
          ? 'border-blue-100 bg-blue-50'
          : 'border-slate-200 bg-slate-50'

  return (
    <div className={`rounded-[22px] border p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-base font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  )
}

function GovernanceLane({
  title,
  ready,
  readyLabel,
  blockers,
}: {
  title: string
  ready: boolean
  readyLabel: string
  blockers: string[]
}) {
  const uniqueBlockers = Array.from(new Set(blockers.filter((blocker) => blocker.trim().length > 0)))

  return (
    <div className="rounded-2xl border border-white bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {ready ? readyLabel : `${uniqueBlockers.length} blocker${uniqueBlockers.length === 1 ? '' : 's'}`}
        </span>
      </div>
      {uniqueBlockers.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">Geen open blockers binnen deze fase.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {uniqueBlockers.map((blocker) => (
            <li key={blocker} className="flex gap-2 text-sm leading-6 text-slate-700">
              <span className="text-amber-500">!</span>
              <span>{blocker}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
