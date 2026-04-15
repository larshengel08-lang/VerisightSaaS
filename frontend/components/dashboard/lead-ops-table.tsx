'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  getContactDesiredTimingLabel,
  getContactRouteLabel,
} from '@/lib/contact-funnel'
import {
  getDeliveryLifecycleLabel,
  getDeliveryExceptionLabel,
  type DeliveryLifecycleStage,
  type DeliveryExceptionStatus,
} from '@/lib/ops-delivery'
import type { ContactRequestRecord } from '@/lib/pilot-learning'

interface Props {
  rows: ContactRequestRecord[]
  linkedCampaignsByLead: Record<string, Array<{
    campaignId: string
    campaignName: string
    lifecycleStage: DeliveryLifecycleStage
  }>>
}

const LEAD_STAGE_OPTIONS: Array<{ value: ContactRequestRecord['ops_stage']; label: string }> = [
  { value: 'lead_captured', label: 'Lead captured' },
  { value: 'route_qualified', label: 'Route qualified' },
  { value: 'implementation_intake_ready', label: 'Implementation intake ready' },
  { value: 'awaiting_follow_up', label: 'Awaiting follow-up' },
  { value: 'closed', label: 'Gesloten' },
]

const LEAD_EXCEPTION_OPTIONS: Array<{ value: ContactRequestRecord['ops_exception_status']; label: string }> = [
  { value: 'none', label: 'Geen exception' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'needs_operator_recovery', label: 'Operator recovery nodig' },
  { value: 'awaiting_client_input', label: 'Wacht op klantinput' },
  { value: 'awaiting_external_delivery', label: 'Wacht op externe delivery' },
] as const

type LeadDraft = Pick<
  ContactRequestRecord,
  'ops_stage' | 'ops_exception_status' | 'ops_owner' | 'ops_next_step' | 'ops_handoff_note'
>

function formatAmsterdamDate(value: string | null) {
  if (!value) return 'Nog niet bijgewerkt'
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

export function LeadOpsTable({ rows, linkedCampaignsByLead }: Props) {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Record<string, LeadDraft>>(() =>
    Object.fromEntries(
      rows.map((row) => [
        row.id,
        {
          ops_stage: row.ops_stage,
          ops_exception_status: row.ops_exception_status,
          ops_owner: row.ops_owner,
          ops_next_step: row.ops_next_step,
          ops_handoff_note: row.ops_handoff_note,
        },
      ]),
    ),
  )
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const linkedCount = useMemo(
    () => Object.values(linkedCampaignsByLead).reduce((sum, items) => sum + items.length, 0),
    [linkedCampaignsByLead],
  )

  function updateDraft<K extends keyof LeadDraft>(leadId: string, key: K, value: LeadDraft[K]) {
    setDrafts((current) => ({
      ...current,
      [leadId]: { ...current[leadId], [key]: value },
    }))
  }

  async function saveLead(leadId: string) {
    setSaveError(null)
    setSaveMessage(null)
    setSavingLeadId(leadId)

    const response = await fetch(`/api/contact-requests/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...drafts[leadId],
        last_contacted_at: new Date().toISOString(),
      }),
    })

    const payload = (await response.json().catch(() => null)) as { detail?: string } | null
    if (!response.ok) {
      setSaveError(payload?.detail ?? 'Leadtriage opslaan mislukt.')
      setSavingLeadId(null)
      return
    }

    setSaveMessage('Leadtriage bijgewerkt.')
    router.refresh()
    setSavingLeadId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{rows.length} lead{rows.length === 1 ? '' : 's'} zichtbaar</span>
        <span>{linkedCount} gekoppelde campaign{linkedCount === 1 ? '' : 's'}</span>
      </div>

      {saveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{saveError}</div>
      ) : null}
      {saveMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{saveMessage}</div>
      ) : null}

      <div className="overflow-x-auto rounded-[24px] border border-slate-200">
        <table className="min-w-[1400px] divide-y divide-slate-200 bg-white text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Moment</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Timing</th>
              <th className="px-4 py-3">Notificatie</th>
              <th className="px-4 py-3">Leadtriage</th>
              <th className="px-4 py-3">Volgende stap</th>
              <th className="px-4 py-3">Gekoppelde delivery</th>
              <th className="px-4 py-3">Actie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const draft = drafts[row.id]
              const linkedCampaigns = linkedCampaignsByLead[row.id] ?? []
              return (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-4 text-slate-600">
                    <div>{formatAmsterdamDate(row.created_at)}</div>
                    <div className="mt-1 text-xs text-slate-400">Laatste ops-update: {formatAmsterdamDate(row.last_contacted_at)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{row.name}</p>
                    <p className="mt-1 text-slate-700">{row.organization}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.work_email}</p>
                    <p className="mt-2 max-w-md text-xs leading-6 text-slate-600">{row.current_question}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <p>{getContactRouteLabel(row.route_interest)}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.cta_source ? row.cta_source : 'Onbekend'}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{getContactDesiredTimingLabel(row.desired_timing)}</td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.notification_sent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {row.notification_sent ? 'Verstuurd' : 'Niet verstuurd'}
                      </span>
                      <p className="max-w-xs text-xs leading-5 text-slate-500">
                        {row.notification_error ? row.notification_error : 'Geen fout opgeslagen'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <select
                        value={draft.ops_stage}
                        onChange={(event) => updateDraft(row.id, 'ops_stage', event.target.value as LeadDraft['ops_stage'])}
                        className={selectClass}
                      >
                        {LEAD_STAGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={draft.ops_exception_status}
                        onChange={(event) => updateDraft(row.id, 'ops_exception_status', event.target.value as LeadDraft['ops_exception_status'])}
                        className={selectClass}
                      >
                        {LEAD_EXCEPTION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={draft.ops_owner ?? ''}
                        onChange={(event) => updateDraft(row.id, 'ops_owner', event.target.value)}
                        placeholder="Eigenaar"
                        className={inputClass}
                      />
                      <p className="text-xs text-slate-500">
                        Huidige exception: {getDeliveryExceptionLabel(row.ops_exception_status as DeliveryExceptionStatus)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <textarea
                        value={draft.ops_next_step ?? ''}
                        onChange={(event) => updateDraft(row.id, 'ops_next_step', event.target.value)}
                        placeholder="Bijv. intake inplannen en respondenttemplate sturen"
                        rows={3}
                        className={`${inputClass} min-h-24 resize-y`}
                      />
                      <textarea
                        value={draft.ops_handoff_note ?? ''}
                        onChange={(event) => updateDraft(row.id, 'ops_handoff_note', event.target.value)}
                        placeholder="Korte handoff-note voor sales -> delivery"
                        rows={3}
                        className={`${inputClass} min-h-24 resize-y`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {linkedCampaigns.length === 0 ? (
                      <p className="text-xs leading-6 text-slate-500">Nog geen deliveryrecord aan deze lead gekoppeld.</p>
                    ) : (
                      <div className="space-y-2">
                        {linkedCampaigns.map((item) => (
                          <Link
                            key={`${row.id}-${item.campaignId}`}
                            href={`/campaigns/${item.campaignId}`}
                            className="block rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                          >
                            <span className="block font-semibold text-slate-900">{item.campaignName}</span>
                            <span className="mt-1 block">{getDeliveryLifecycleLabel(item.lifecycleStage)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => void saveLead(row.id)}
                        disabled={savingLeadId === row.id}
                        className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingLeadId === row.id ? 'Opslaan...' : 'Leadtriage opslaan'}
                      </button>
                      <Link
                        href={`/beheer/klantlearnings?lead=${row.id}`}
                        className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        Start learningdossier
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

const selectClass = `${inputClass} pr-8`
