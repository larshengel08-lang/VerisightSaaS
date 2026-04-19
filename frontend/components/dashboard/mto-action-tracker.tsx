'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildManagementActionSeedFromDepartmentRead,
  buildManagementActionSummary,
  buildManagementActionTraceabilitySummary,
  canEditManagementAction,
  getManagementActionStatusLabel,
  MANAGEMENT_ACTION_STATUS_OPTIONS,
  type ManagementActionDepartmentOwnerDefault,
  type ManagementActionRecord,
  type ManagementActionUpdateRecord,
} from '@/lib/management-actions'
import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'
import type { MemberRole } from '@/lib/types'

interface Props {
  organizationId: string
  campaignId: string
  currentViewerRole: MemberRole | null
  currentUserEmail: string | null
  canManageCampaign: boolean
  departmentReads: MtoDepartmentReadItem[]
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  ownerDefaults: ManagementActionDepartmentOwnerDefault[]
}

type OwnerDraft = {
  owner_label: string
  owner_email: string
}

type ActionDraft = {
  title: string
  status: ManagementActionRecord['status']
  owner_label: string
  owner_email: string
  due_date: string
  review_date: string
  expected_outcome: string
  measured_outcome: string
}

export function MtoActionTracker({
  organizationId,
  campaignId,
  currentViewerRole,
  currentUserEmail,
  canManageCampaign,
  departmentReads,
  actions,
  updates,
  ownerDefaults,
}: Props) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyOwnerDepartment, setBusyOwnerDepartment] = useState<string | null>(null)
  const [busyActionId, setBusyActionId] = useState<string | null>(null)
  const [busySeedKey, setBusySeedKey] = useState<string | null>(null)
  const [busyUpdateActionId, setBusyUpdateActionId] = useState<string | null>(null)
  const [ownerDrafts, setOwnerDrafts] = useState<Record<string, OwnerDraft>>(() =>
    Object.fromEntries(
      departmentReads.map((departmentRead) => {
        const ownerDefault = ownerDefaults.find((entry) => entry.department === departmentRead.segmentLabel)
        return [
          departmentRead.segmentLabel,
          {
            owner_label: ownerDefault?.owner_label ?? '',
            owner_email: ownerDefault?.owner_email ?? '',
          },
        ]
      }),
    ),
  )
  const [actionDrafts, setActionDrafts] = useState<Record<string, ActionDraft>>(() =>
    Object.fromEntries(
      actions.map((action) => [
        action.id,
        {
          title: action.title,
          status: action.status,
          owner_label: action.owner_label ?? '',
          owner_email: action.owner_email ?? '',
          due_date: action.due_date ?? '',
          review_date: action.review_date ?? '',
          expected_outcome: action.expected_outcome ?? '',
          measured_outcome: action.measured_outcome ?? '',
        },
      ]),
    ),
  )
  const [updateDrafts, setUpdateDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(actions.map((action) => [action.id, ''])),
  )

  const summary = useMemo(() => buildManagementActionSummary(actions), [actions])
  const updatesByAction = useMemo(() => {
    const grouped: Record<string, ManagementActionUpdateRecord[]> = {}
    for (const update of updates) {
      grouped[update.action_id] ??= []
      grouped[update.action_id].push(update)
    }
    return grouped
  }, [updates])

  function setToast(nextMessage: string | null, nextError: string | null = null) {
    setMessage(nextMessage)
    setError(nextError)
  }

  function updateOwnerDraft(department: string, key: keyof OwnerDraft, value: string) {
    setOwnerDrafts((current) => ({
      ...current,
      [department]: {
        ...(current[department] ?? { owner_label: '', owner_email: '' }),
        [key]: value,
      },
    }))
  }

  function updateActionDraft(actionId: string, key: keyof ActionDraft, value: string) {
    setActionDrafts((current) => ({
      ...current,
      [actionId]: {
        ...current[actionId],
        [key]: value,
      },
    }))
  }

  async function saveOwnerDefault(department: string) {
    setToast(null)
    setBusyOwnerDepartment(department)

    try {
      const response = await fetch('/api/management-action-department-owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          department,
          owner_label: ownerDrafts[department]?.owner_label || null,
          owner_email: ownerDrafts[department]?.owner_email || null,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null

      if (!response.ok) {
        setToast(null, payload?.detail ?? 'Opslaan van afdelingeigenaar mislukt.')
        return
      }

      setToast(payload?.message ?? 'Afdelingeigenaar opgeslagen.')
      router.refresh()
    } catch {
      setToast(null, 'Verbindingsfout tijdens opslaan van afdelingeigenaar.')
    } finally {
      setBusyOwnerDepartment(null)
    }
  }

  async function seedActionFromDepartment(departmentRead: MtoDepartmentReadItem) {
    setToast(null)
    const seedKey = `${departmentRead.segmentLabel}-${departmentRead.factorKey}`
    setBusySeedKey(seedKey)

    try {
      const ownerDefault = ownerDrafts[departmentRead.segmentLabel]
      const response = await fetch('/api/management-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildManagementActionSeedFromDepartmentRead({
            organizationId,
            campaignId,
            departmentRead,
            ownerDefault: ownerDefault
              ? {
                  owner_label: ownerDefault.owner_label || null,
                  owner_email: ownerDefault.owner_email || null,
                }
              : null,
          }),
        ),
      })
      const payload = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null

      if (!response.ok) {
        setToast(null, payload?.detail ?? 'Action-log entry aanmaken mislukt.')
        return
      }

      setToast(payload?.message ?? 'Action-log entry aangemaakt.')
      router.refresh()
    } catch {
      setToast(null, 'Verbindingsfout tijdens aanmaken van de action-log entry.')
    } finally {
      setBusySeedKey(null)
    }
  }

  async function saveAction(actionId: string) {
    setToast(null)
    setBusyActionId(actionId)

    try {
      const draft = actionDrafts[actionId]
      const response = await fetch(`/api/management-actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          status: draft.status,
          owner_label: draft.owner_label || null,
          owner_email: draft.owner_email || null,
          due_date: draft.due_date || null,
          review_date: draft.review_date || null,
          expected_outcome: draft.expected_outcome || null,
          measured_outcome: draft.measured_outcome || null,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null

      if (!response.ok) {
        setToast(null, payload?.detail ?? 'Action-log entry opslaan mislukt.')
        return
      }

      setToast(payload?.message ?? 'Action-log entry bijgewerkt.')
      router.refresh()
    } catch {
      setToast(null, 'Verbindingsfout tijdens opslaan van de action-log entry.')
    } finally {
      setBusyActionId(null)
    }
  }

  async function addUpdate(actionId: string, status: ManagementActionRecord['status']) {
    const note = updateDrafts[actionId]?.trim()
    if (!note) {
      setToast(null, 'Voeg eerst een update-notitie toe.')
      return
    }

    setBusyUpdateActionId(actionId)
    setToast(null)

    try {
      const response = await fetch('/api/management-action-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: actionId,
          note,
          status_snapshot: status,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null

      if (!response.ok) {
        setToast(null, payload?.detail ?? 'Update loggen mislukt.')
        return
      }

      setUpdateDrafts((current) => ({ ...current, [actionId]: '' }))
      setToast(payload?.message ?? 'Update gelogd.')
      router.refresh()
    } catch {
      setToast(null, 'Verbindingsfout tijdens loggen van de update.')
    } finally {
      setBusyUpdateActionId(null)
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

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryCard title="Open sporen" value={`${summary.openCount}`} body="Open, toegewezen en lopende acties binnen deze bounded MTO-loop." tone={summary.openCount > 0 ? 'blue' : 'slate'} />
        <SummaryCard title="In review" value={`${summary.reviewCount}`} body="Acties die nu expliciet een reviewmoment of effect-check vragen." tone={summary.reviewCount > 0 ? 'amber' : 'slate'} />
        <SummaryCard title="Vervolg nodig" value={`${summary.followUpCount}`} body="Acties die een volgende meting, hercheck of vervolgrichting nodig hebben." tone={summary.followUpCount > 0 ? 'amber' : 'slate'} />
        <SummaryCard title="Reviewdruk" value={`${summary.overdueReviewCount}`} body="Acties met een reviewdatum in het verleden die nog niet gesloten zijn." tone={summary.overdueReviewCount > 0 ? 'amber' : 'emerald'} />
      </div>

      {canManageCampaign && departmentReads.length > 0 ? (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Afdelingeigenaars en action seeds</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Houd owner-toewijzing bewust bounded: leg per afdeling een default eigenaar vast en zet pas daarna een MTO-signaal in het action log.
          </p>
          <div className="mt-4 space-y-4">
            {departmentReads.map((departmentRead) => {
              const ownerDraft = ownerDrafts[departmentRead.segmentLabel] ?? { owner_label: '', owner_email: '' }
              const seedKey = `${departmentRead.segmentLabel}-${departmentRead.factorKey}`
              const hasOpenAction = actions.some(
                (action) =>
                  action.source_scope_label === departmentRead.segmentLabel &&
                  action.source_factor_key === departmentRead.factorKey &&
                  action.status !== 'closed',
              )

              return (
                <div key={seedKey} className="rounded-2xl border border-white bg-white px-4 py-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {departmentRead.segmentLabel} · {departmentRead.factorLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{departmentRead.handoffBody}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
                      <input
                        type="text"
                        value={ownerDraft.owner_label}
                        onChange={(event) => updateOwnerDraft(departmentRead.segmentLabel, 'owner_label', event.target.value)}
                        placeholder="Default eigenaar"
                        className={inputClass}
                      />
                      <input
                        type="email"
                        value={ownerDraft.owner_email}
                        onChange={(event) => updateOwnerDraft(departmentRead.segmentLabel, 'owner_email', event.target.value)}
                        placeholder="manager@organisatie.nl"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void saveOwnerDefault(departmentRead.segmentLabel)}
                      disabled={busyOwnerDepartment === departmentRead.segmentLabel}
                      className={secondaryButtonClass}
                    >
                      {busyOwnerDepartment === departmentRead.segmentLabel ? 'Opslaan...' : 'Bewaar default owner'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void seedActionFromDepartment(departmentRead)}
                      disabled={busySeedKey === seedKey || hasOpenAction}
                      className={primaryButtonClass}
                    >
                      {hasOpenAction
                        ? 'Actie al open'
                        : busySeedKey === seedKey
                          ? 'Aanmaken...'
                          : 'Zet in action log'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Nog geen MTO-acties geopend. Gebruik eerst de veilige afdelingsread om eigenaar, eerste stap en reviewmoment expliciet te maken.
          </div>
        ) : (
          actions.map((action) => {
            const draft = actionDrafts[action.id] ?? {
              title: action.title,
              status: action.status,
              owner_label: action.owner_label ?? '',
              owner_email: action.owner_email ?? '',
              due_date: action.due_date ?? '',
              review_date: action.review_date ?? '',
              expected_outcome: action.expected_outcome ?? '',
              measured_outcome: action.measured_outcome ?? '',
            }
            const editable = canEditManagementAction({
              orgRole: currentViewerRole,
              userEmail: currentUserEmail,
              action,
            })
            const actionUpdates = updatesByAction[action.id] ?? []

            return (
              <div key={action.id} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {buildManagementActionTraceabilitySummary(action)}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-950">{action.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{action.decision_context ?? 'Nog geen extra besluitcontext vastgelegd.'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {getManagementActionStatusLabel(action.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Titel</span>
                    {editable && canManageCampaign ? (
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(event) => updateActionDraft(action.id, 'title', event.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <ReadOnlyBlock value={draft.title} />
                    )}
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Status</span>
                    {editable ? (
                      <select
                        value={draft.status}
                        onChange={(event) => updateActionDraft(action.id, 'status', event.target.value)}
                        className={inputClass}
                      >
                        {MANAGEMENT_ACTION_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <ReadOnlyBlock value={getManagementActionStatusLabel(action.status)} />
                    )}
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Owner label</span>
                    {editable && canManageCampaign ? (
                      <input
                        type="text"
                        value={draft.owner_label}
                        onChange={(event) => updateActionDraft(action.id, 'owner_label', event.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <ReadOnlyBlock value={draft.owner_label || 'Nog geen owner label'} />
                    )}
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Owner e-mail</span>
                    {editable && canManageCampaign ? (
                      <input
                        type="email"
                        value={draft.owner_email}
                        onChange={(event) => updateActionDraft(action.id, 'owner_email', event.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <ReadOnlyBlock value={draft.owner_email || 'Nog geen owner e-mail'} />
                    )}
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Due date</span>
                    {editable ? (
                      <input
                        type="date"
                        value={draft.due_date}
                        onChange={(event) => updateActionDraft(action.id, 'due_date', event.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <ReadOnlyBlock value={draft.due_date || 'Nog geen due date'} />
                    )}
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Review date</span>
                    {editable ? (
                      <input
                        type="date"
                        value={draft.review_date}
                        onChange={(event) => updateActionDraft(action.id, 'review_date', event.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <ReadOnlyBlock value={draft.review_date || 'Nog geen review date'} />
                    )}
                  </label>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Expected outcome</span>
                    {editable ? (
                      <textarea
                        value={draft.expected_outcome}
                        onChange={(event) => updateActionDraft(action.id, 'expected_outcome', event.target.value)}
                        rows={4}
                        className={`${inputClass} min-h-28 resize-y`}
                      />
                    ) : (
                      <ReadOnlyBlock value={draft.expected_outcome || 'Nog geen expected outcome'} />
                    )}
                  </label>

                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Measured outcome</span>
                    {editable ? (
                      <textarea
                        value={draft.measured_outcome}
                        onChange={(event) => updateActionDraft(action.id, 'measured_outcome', event.target.value)}
                        rows={4}
                        className={`${inputClass} min-h-28 resize-y`}
                      />
                    ) : (
                      <ReadOnlyBlock value={draft.measured_outcome || 'Nog geen measured outcome'} />
                    )}
                  </label>
                </div>

                {editable ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void saveAction(action.id)}
                      disabled={busyActionId === action.id}
                      className={primaryButtonClass}
                    >
                      {busyActionId === action.id ? 'Opslaan...' : 'Actie opslaan'}
                    </button>
                  </div>
                ) : null}

                <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Updatehistorie</p>
                  {actionUpdates.length === 0 ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">Nog geen updates gelogd.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {actionUpdates.map((update) => (
                        <div key={update.id} className="rounded-2xl border border-white bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {update.created_at.slice(0, 16).replace('T', ' ')}
                            {update.status_snapshot ? ` · ${getManagementActionStatusLabel(update.status_snapshot)}` : ''}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{update.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {editable ? (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={updateDrafts[action.id] ?? ''}
                        onChange={(event) => setUpdateDrafts((current) => ({ ...current, [action.id]: event.target.value }))}
                        rows={3}
                        placeholder="Log voortgang, blokkade of effect-check"
                        className={`${inputClass} min-h-24 resize-y`}
                      />
                      <button
                        type="button"
                        onClick={() => void addUpdate(action.id, draft.status)}
                        disabled={busyUpdateActionId === action.id}
                        className={secondaryButtonClass}
                      >
                        {busyUpdateActionId === action.id ? 'Loggen...' : 'Log update'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  body,
  tone,
}: {
  title: string
  value: string
  body: string
  tone: 'blue' | 'amber' | 'emerald' | 'slate'
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

function ReadOnlyBlock({ value }: { value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">{value}</div>
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
