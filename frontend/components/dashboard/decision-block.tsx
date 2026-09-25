'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { saveCampaignDecisionAction } from '@/app/(dashboard)/campaigns/[id]/decision-actions'
import {
  DECISION_LIMITS,
  DECISION_SECOND_POINT_HINT,
  DECISION_SUCCESS_LABEL,
  decisionFeedbackHintFor,
  decisionFollowUpHintFor,
  type CampaignDecision,
} from '@/lib/dashboard/campaign-decision'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import type { ScanType } from '@/lib/types'

/**
 * "Besluit vastleggen" op een gesloten meting met rapport (plan 3b, spec
 * 2026-09-16 par. 7). Dezelfde velden als de besluitpagina in het rapport; wat
 * hier staat drukt het rapport bij de volgende download voor. Eigenaar en
 * operator schrijven, meelezers lezen. Fail Loud: een fout staat in beeld.
 */

interface DecisionBlockProps {
  campaignId: string
  canManage: boolean
  decision: CampaignDecision | null
  loadError: string | null
  scanType: ScanType
}

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]'
const inputClass =
  'mt-1 w-full rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-sm text-[color:var(--dashboard-ink)] focus:border-[color:var(--dashboard-accent-strong)] focus:outline-none disabled:opacity-50'
// De hints staan buiten het label-element en zijn via aria-describedby gekoppeld, zodat
// ze niet in de toegankelijke naam van het veld belanden. labelClass houdt ze er
// hetzelfde uit te zien als toen ze binnen het label stonden (en de stijl ervan
// erfden).
const hintClass = labelClass
const fieldClass = 'flex flex-col'

function ReadOnlyRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="mt-1 whitespace-pre-line text-sm leading-6 text-[color:var(--dashboard-text)]">{value}</dd>
    </div>
  )
}

function ReadOnlyDecision({ decision }: { decision: CampaignDecision | null }) {
  if (!decision) {
    return (
      <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
        Er is nog geen besluit vastgelegd. De eigenaar van deze Loep-omgeving kan dat hier doen.
      </p>
    )
  }
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <ReadOnlyRow label="Datum van het gesprek" value={formatDutchDate(decision.decidedAt)} />
      <ReadOnlyRow label="Startpunt" value={decision.primaryTopic} />
      <ReadOnlyRow label="Wat precies" value={decision.primaryAction} />
      <ReadOnlyRow label="Eigenaar" value={decision.owner} />
      <ReadOnlyRow label="Datum vervolgmoment" value={formatDutchDate(decision.followUpDate)} />
      <ReadOnlyRow label="Tweede punt" value={decision.secondaryTopic} />
      <ReadOnlyRow label="Wat precies bij het tweede punt" value={decision.secondaryAction} />
      <ReadOnlyRow label="Terugkoppeling aan medewerkers" value={decision.feedbackPlan} />
      <ReadOnlyRow label={DECISION_SUCCESS_LABEL} value={decision.successCriterion} />
    </dl>
  )
}

export function DecisionBlock({ campaignId, canManage, decision, loadError, scanType }: DecisionBlockProps) {
  const feedbackHint = decisionFeedbackHintFor(scanType)
  const followUpHint = decisionFollowUpHintFor(scanType)
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const raw: Record<string, unknown> = {}
    form.forEach((value, key) => {
      raw[key] = typeof value === 'string' ? value : ''
    })
    try {
      const result = await saveCampaignDecisionAction(campaignId, raw)
      if (!result.ok) {
        setError(result.error ?? 'Opslaan mislukt.')
      } else {
        setNotice('Besluit opgeslagen. Bij de volgende download staat het voorgedrukt in je rapport.')
        router.refresh()
      }
    } catch (caught) {
      setError(`Opslaan mislukt: ${caught instanceof Error ? caught.message : 'onbekende fout'}.`)
    } finally {
      setBusy(false)
    }
  }

  const updatedLabel = formatDutchDate(decision?.updatedAt)

  return (
    <section
      aria-labelledby="decision-heading"
      className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6"
    >
      <h3 id="decision-heading" className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">
        Besluit vastleggen
      </h3>
      <p className="mb-5 max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">
        Wat heeft het MT besloten na het gesprek over dit rapport? Wat je hier vastlegt, drukt Loep voor op de
        besluitpagina van het rapport.
        {updatedLabel ? ` Laatst bijgewerkt op ${updatedLabel}.` : ''}
      </p>

      {loadError ? (
        <p role="alert" className="text-sm leading-6 text-red-600">
          Loep kan het besluit nu niet laden ({loadError}). Je rapport hierboven werkt wel. Blijft dit zo, mail dan{' '}
          <a className="underline" href={`mailto:${LOEP_CONTACT_EMAIL}`}>
            {LOEP_CONTACT_EMAIL}
          </a>
          .
        </p>
      ) : !canManage ? (
        <ReadOnlyDecision decision={decision} />
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Datum van het gesprek
            <input type="date" name="decidedAt" defaultValue={decision?.decidedAt ?? ''} disabled={busy} className={inputClass} />
          </label>
          <label className={labelClass}>
            Startpunt
            <input
              type="text"
              name="primaryTopic"
              required
              maxLength={DECISION_LIMITS.topic}
              defaultValue={decision?.primaryTopic ?? ''}
              placeholder="Het startpunt uit je rapport (pagina twee)"
              disabled={busy}
              className={inputClass}
            />
          </label>
          <div className={`${fieldClass} sm:col-span-2`}>
            <label className={labelClass}>
              Wat precies
              <textarea
                name="primaryAction"
                required
                rows={3}
                maxLength={DECISION_LIMITS.action}
                defaultValue={decision?.primaryAction ?? ''}
                disabled={busy}
                aria-describedby="decision-hint-primary-action"
                className={inputClass}
              />
            </label>
            <span id="decision-hint-primary-action" className={hintClass}>
              Een onderwerp is nog geen afspraak: schrijf op wat er gebeurt.
            </span>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>
              Eigenaar
              <input
                type="text"
                name="owner"
                required
                maxLength={DECISION_LIMITS.owner}
                defaultValue={decision?.owner ?? ''}
                disabled={busy}
                aria-describedby="decision-hint-owner"
                className={inputClass}
              />
            </label>
            <span id="decision-hint-owner" className={hintClass}>
              Eén naam.
            </span>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>
              Datum vervolgmoment
              <input
                type="date"
                name="followUpDate"
                defaultValue={decision?.followUpDate ?? ''}
                disabled={busy}
                aria-describedby="decision-hint-follow-up"
                className={inputClass}
              />
            </label>
            <span id="decision-hint-follow-up" className={hintClass}>
              {followUpHint}
            </span>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>
              Tweede punt
              <input
                type="text"
                name="secondaryTopic"
                maxLength={DECISION_LIMITS.topic}
                defaultValue={decision?.secondaryTopic ?? ''}
                disabled={busy}
                aria-describedby="decision-hint-second-point"
                className={inputClass}
              />
            </label>
            <span id="decision-hint-second-point" className={hintClass}>
              {DECISION_SECOND_POINT_HINT}
            </span>
          </div>
          <label className={labelClass}>
            Wat precies bij het tweede punt
            <textarea
              name="secondaryAction"
              rows={2}
              maxLength={DECISION_LIMITS.action}
              defaultValue={decision?.secondaryAction ?? ''}
              disabled={busy}
              className={inputClass}
            />
          </label>
          <div className={`${fieldClass} sm:col-span-2`}>
            <label className={labelClass}>
              Terugkoppeling aan medewerkers
              <textarea
                name="feedbackPlan"
                rows={2}
                maxLength={DECISION_LIMITS.text}
                defaultValue={decision?.feedbackPlan ?? ''}
                placeholder="Wie vertelt wat, en wanneer?"
                disabled={busy}
                aria-describedby={feedbackHint ? 'decision-hint-feedback' : undefined}
                className={inputClass}
              />
            </label>
            {feedbackHint ? (
              <span id="decision-hint-feedback" className={hintClass}>
                {feedbackHint}
              </span>
            ) : null}
          </div>
          <label className={`${labelClass} sm:col-span-2`}>
            {DECISION_SUCCESS_LABEL}
            <input
              type="text"
              name="successCriterion"
              maxLength={DECISION_LIMITS.text}
              defaultValue={decision?.successCriterion ?? ''}
              disabled={busy}
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-50"
            >
              {busy ? 'Opslaan...' : decision ? 'Besluit bijwerken' : 'Besluit opslaan'}
            </button>
            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="text-sm text-[color:var(--dashboard-muted)]">
                {notice}
              </p>
            ) : null}
          </div>
        </form>
      )}
    </section>
  )
}
