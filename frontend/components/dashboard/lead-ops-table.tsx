'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { buildContactQualificationVisibilitySummary } from '@/lib/contact-qualification'
import {
  buildBoundedCommerceVisibilitySummary,
  getCommerceAgreementStatusLabel,
  getCommercePricingModeLabel,
  getCommerceStartReadinessLabel,
  supportsBoundedCommerceRoute,
  type CommerceAgreementStatus,
  type CommercePricingMode,
  type CommerceStartReadinessStatus,
} from '@/lib/contact-commerce'
import {
  getContactDesiredTimingLabel,
  getContactRouteLabel,
  type ContactRouteInterest,
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
  | 'ops_stage'
  | 'ops_exception_status'
  | 'ops_owner'
  | 'ops_next_step'
  | 'ops_handoff_note'
  | 'qualification_status'
  | 'qualified_route'
  | 'qualification_note'
  | 'qualification_reviewed_by'
  | 'commercial_agreement_status'
  | 'commercial_pricing_mode'
  | 'commercial_start_readiness_status'
  | 'commercial_start_blocker'
  | 'commercial_agreement_confirmed_by'
  | 'commercial_readiness_reviewed_by'
>

const COMMERCE_AGREEMENT_OPTIONS: Array<{ value: CommerceAgreementStatus; label: string }> = [
  { value: 'not_started', label: 'Nog niet bevestigd' },
  { value: 'confirmed', label: 'Commercieel bevestigd' },
  { value: 'blocked', label: 'Commercieel geblokkeerd' },
]

const COMMERCE_PRICING_OPTIONS: Array<{ value: CommercePricingMode; label: string }> = [
  { value: 'public_anchor', label: 'Publiek prijsanker' },
  { value: 'custom_quote', label: 'Custom quote' },
]

const COMMERCE_START_OPTIONS: Array<{ value: CommerceStartReadinessStatus; label: string }> = [
  { value: 'not_ready', label: 'Nog niet startklaar' },
  { value: 'ready', label: 'Startklaar' },
  { value: 'blocked', label: 'Start geblokkeerd' },
]

const QUALIFICATION_STATUS_OPTIONS: Array<{ value: ContactRequestRecord['qualification_status']; label: string }> = [
  { value: 'not_reviewed', label: 'Nog niet gereviewd' },
  { value: 'needs_route_review', label: 'Route review nodig' },
  { value: 'route_confirmed', label: 'Route bevestigd' },
]

const QUALIFIED_ROUTE_OPTIONS: Array<{ value: ContactRouteInterest; label: string }> = [
  { value: 'exitscan', label: 'ExitScan' },
  { value: 'retentiescan', label: 'RetentieScan' },
  { value: 'combinatie', label: 'Combinatie' },
  { value: 'teamscan', label: 'TeamScan' },
  { value: 'onboarding', label: 'Onboarding 30-60-90' },
  { value: 'leadership', label: 'Leadership Scan' },
]

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
          qualification_status: row.qualification_status,
          qualified_route: row.qualified_route,
          qualification_note: row.qualification_note,
          qualification_reviewed_by: row.qualification_reviewed_by,
          commercial_agreement_status: row.commercial_agreement_status,
          commercial_pricing_mode: row.commercial_pricing_mode,
          commercial_start_readiness_status: row.commercial_start_readiness_status,
          commercial_start_blocker: row.commercial_start_blocker,
          commercial_agreement_confirmed_by: row.commercial_agreement_confirmed_by,
          commercial_readiness_reviewed_by: row.commercial_readiness_reviewed_by,
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

    const row = rows.find((item) => item.id === leadId)
    if (!row) {
      setSaveError('Lead niet gevonden in de huidige tabel.')
      setSavingLeadId(null)
      return
    }

    const draft = drafts[leadId]
    const supportsCommerce = supportsBoundedCommerceRoute(row.route_interest)
    const requestBody = {
      ops_stage: draft.ops_stage,
      ops_exception_status: draft.ops_exception_status,
      ops_owner: draft.ops_owner,
      ops_next_step: draft.ops_next_step,
      ops_handoff_note: draft.ops_handoff_note,
      qualification_status: draft.qualification_status,
      qualified_route: draft.qualified_route,
      qualification_note: draft.qualification_note,
      qualification_reviewed_by: draft.qualification_reviewed_by,
      ...(supportsCommerce
        ? {
            commercial_agreement_status: draft.commercial_agreement_status,
            commercial_pricing_mode: draft.commercial_pricing_mode,
            commercial_start_readiness_status: draft.commercial_start_readiness_status,
            commercial_start_blocker: draft.commercial_start_blocker,
            commercial_agreement_confirmed_by: draft.commercial_agreement_confirmed_by,
            commercial_readiness_reviewed_by: draft.commercial_readiness_reviewed_by,
          }
        : {}),
      last_contacted_at: new Date().toISOString(),
    }

    const response = await fetch(`/api/contact-requests/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    const responsePayload = (await response.json().catch(() => null)) as { detail?: string } | null
    if (!response.ok) {
      setSaveError(responsePayload?.detail ?? 'Leadtriage opslaan mislukt.')
      setSavingLeadId(null)
      return
    }

    setSaveMessage(supportsCommerce ? 'Leadtriage en commercestatus bijgewerkt.' : 'Leadtriage bijgewerkt.')
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
              const supportsCommerce = supportsBoundedCommerceRoute(row.route_interest)
              const qualificationVisibility = buildContactQualificationVisibilitySummary({
                routeInterest: row.route_interest,
                desiredTiming: row.desired_timing,
                currentQuestion: row.current_question,
                qualificationStatus: draft.qualification_status,
                qualifiedRoute: draft.qualified_route,
                qualificationReviewedBy: draft.qualification_reviewed_by,
              })
              const commerceVisibility = buildBoundedCommerceVisibilitySummary({
                routeInterest: row.route_interest,
                agreementStatus: draft.commercial_agreement_status,
                pricingMode: draft.commercial_pricing_mode,
                startReadinessStatus: draft.commercial_start_readiness_status,
                startBlocker: draft.commercial_start_blocker,
                agreementConfirmedBy: draft.commercial_agreement_confirmed_by,
                agreementConfirmedAt: row.commercial_agreement_confirmed_at,
                readinessReviewedBy: draft.commercial_readiness_reviewed_by,
                readinessReviewedAt: row.commercial_readiness_reviewed_at,
                linkedDeliveryCount: linkedCampaigns.length,
                linkedDeliveryLifecycle: linkedCampaigns[0]?.lifecycleStage ?? null,
              })
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
                      <div
                        className={`rounded-2xl border px-3 py-3 ${getQualificationVisibilityClassName(
                          qualificationVisibility.tone,
                        )}`}
                      >
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
                          Qualification summary
                        </p>
                        <p className="mt-2 text-sm font-semibold">{qualificationVisibility.headline}</p>
                        <p className="mt-1 text-xs leading-5">{qualificationVisibility.detail}</p>
                        <div className="mt-2 space-y-1 text-xs leading-5">
                          <p>{qualificationVisibility.recommendationLabel}</p>
                          <p>{qualificationVisibility.routeReviewLabel}</p>
                          <p>
                            Qualificationstatus:{' '}
                            {QUALIFICATION_STATUS_OPTIONS.find((option) => option.value === draft.qualification_status)?.label ??
                              'Nog niet gereviewd'}
                          </p>
                        </div>
                        <div className="mt-2 rounded-xl bg-white/70 px-2.5 py-2 text-xs leading-5">
                          <p className="font-semibold">Volgende qualificationstap</p>
                          <p className="mt-1">{qualificationVisibility.nextAction}</p>
                        </div>
                        <div className="mt-3 space-y-2">
                          <select
                            value={draft.qualification_status}
                            onChange={(event) =>
                              updateDraft(
                                row.id,
                                'qualification_status',
                                event.target.value as LeadDraft['qualification_status'],
                              )
                            }
                            className={selectClass}
                          >
                            {QUALIFICATION_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={draft.qualified_route ?? ''}
                            onChange={(event) =>
                              updateDraft(
                                row.id,
                                'qualified_route',
                                (event.target.value || null) as LeadDraft['qualified_route'],
                              )
                            }
                            className={selectClass}
                          >
                            <option value="">Nog niet bevestigd</option>
                            {QUALIFIED_ROUTE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draft.qualification_reviewed_by ?? ''}
                            onChange={(event) => updateDraft(row.id, 'qualification_reviewed_by', event.target.value)}
                            placeholder="Qualification gereviewd door"
                            className={inputClass}
                          />
                          <textarea
                            value={draft.qualification_note ?? ''}
                            onChange={(event) => updateDraft(row.id, 'qualification_note', event.target.value)}
                            placeholder="Korte notitie over waarom deze route nu bevestigd of teruggezet is"
                            rows={3}
                            className={`${inputClass} min-h-20 resize-y`}
                          />
                          <div className="space-y-1 text-xs leading-5">
                            <p>
                              Laatste qualification-review:{' '}
                              {formatAmsterdamDate(row.qualification_reviewed_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`rounded-2xl border px-3 py-3 ${getCommerceVisibilityClassName(commerceVisibility.tone)}`}>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
                          Commerce summary
                        </p>
                        <p className="mt-2 text-sm font-semibold">{commerceVisibility.headline}</p>
                        <p className="mt-1 text-xs leading-5">{commerceVisibility.detail}</p>
                        {commerceVisibility.blocker ? (
                          <p className="mt-2 rounded-xl bg-white/70 px-2.5 py-2 text-xs font-medium text-red-900">
                            Blocker: {commerceVisibility.blocker}
                          </p>
                        ) : null}
                        <div className="mt-2 space-y-1 text-xs leading-5">
                          <p>{commerceVisibility.agreementAuditLabel}</p>
                          <p>{commerceVisibility.readinessAuditLabel}</p>
                        </div>
                        <div className="mt-2 rounded-xl bg-white/70 px-2.5 py-2 text-xs leading-5">
                          <p className="font-semibold">{commerceVisibility.deliveryReleaseLabel}</p>
                          <p className="mt-1">{commerceVisibility.deliveryReleaseDetail}</p>
                        </div>
                        <p className="mt-2 text-xs leading-5">{commerceVisibility.deliveryHint}</p>
                      </div>
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
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Bounded commerce
                        </p>
                        {supportsCommerce ? (
                          <div className="mt-2 space-y-2">
                            <select
                              value={draft.commercial_agreement_status}
                              onChange={(event) =>
                                updateDraft(
                                  row.id,
                                  'commercial_agreement_status',
                                  event.target.value as LeadDraft['commercial_agreement_status'],
                                )
                              }
                              className={selectClass}
                            >
                              {COMMERCE_AGREEMENT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <select
                              value={draft.commercial_pricing_mode ?? ''}
                              onChange={(event) =>
                                updateDraft(
                                  row.id,
                                  'commercial_pricing_mode',
                                  (event.target.value || null) as LeadDraft['commercial_pricing_mode'],
                                )
                              }
                              className={selectClass}
                            >
                              <option value="">Nog niet gekozen</option>
                              {COMMERCE_PRICING_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <select
                              value={draft.commercial_start_readiness_status}
                              onChange={(event) =>
                                updateDraft(
                                  row.id,
                                  'commercial_start_readiness_status',
                                  event.target.value as LeadDraft['commercial_start_readiness_status'],
                                )
                              }
                              className={selectClass}
                            >
                              {COMMERCE_START_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={draft.commercial_start_blocker ?? ''}
                              onChange={(event) => updateDraft(row.id, 'commercial_start_blocker', event.target.value)}
                              placeholder="Waarom kan start nog niet vrijgegeven worden?"
                              rows={3}
                              className={`${inputClass} min-h-20 resize-y`}
                            />
                            <input
                              type="text"
                              value={draft.commercial_agreement_confirmed_by ?? ''}
                              onChange={(event) =>
                                updateDraft(row.id, 'commercial_agreement_confirmed_by', event.target.value)
                              }
                              placeholder="Intern bevestigd door"
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={draft.commercial_readiness_reviewed_by ?? ''}
                              onChange={(event) =>
                                updateDraft(row.id, 'commercial_readiness_reviewed_by', event.target.value)
                              }
                              placeholder="Readiness herzien door"
                              className={inputClass}
                            />
                            <div className="space-y-1 text-xs text-slate-500">
                              <p>Akkoord: {getCommerceAgreementStatusLabel(draft.commercial_agreement_status)}</p>
                              <p>Prijsmodus: {getCommercePricingModeLabel(draft.commercial_pricing_mode)}</p>
                              <p>Startstatus: {getCommerceStartReadinessLabel(draft.commercial_start_readiness_status)}</p>
                              <p>
                                Akkoord bevestigd op:{' '}
                                {formatAmsterdamDate(row.commercial_agreement_confirmed_at)}
                              </p>
                              <p>
                                Readiness herzien op:{' '}
                                {formatAmsterdamDate(row.commercial_readiness_reviewed_at)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            In deze wave is bounded commerce alleen beschikbaar voor ExitScan en RetentieScan.
                          </p>
                        )}
                      </div>
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
                      <div className="space-y-2">
                        <p className="text-xs leading-6 text-slate-500">Nog geen deliveryrecord aan deze lead gekoppeld.</p>
                        {supportsCommerce ? (
                          <div className={`rounded-2xl px-3 py-2 text-xs ${getCommerceHintClassName(commerceVisibility.tone)}`}>
                            <p className="font-semibold">{commerceVisibility.deliveryReleaseLabel}</p>
                            <p className="mt-1">{commerceVisibility.deliveryHint}</p>
                          </div>
                        ) : null}
                      </div>
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

function getCommerceVisibilityClassName(tone: 'slate' | 'amber' | 'emerald' | 'red') {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
    case 'amber':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'red':
      return 'border-red-200 bg-red-50 text-red-950'
    case 'slate':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900'
  }
}

function getCommerceHintClassName(tone: 'slate' | 'amber' | 'emerald' | 'red') {
  switch (tone) {
    case 'emerald':
      return 'bg-emerald-50 text-emerald-900'
    case 'amber':
      return 'bg-amber-50 text-amber-900'
    case 'red':
      return 'bg-red-50 text-red-900'
    case 'slate':
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function getQualificationVisibilityClassName(tone: 'slate' | 'blue' | 'amber' | 'emerald') {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
    case 'amber':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'blue':
      return 'border-blue-200 bg-blue-50 text-blue-950'
    case 'slate':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900'
  }
}
