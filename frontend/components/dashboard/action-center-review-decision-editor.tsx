'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardChip } from '@/components/dashboard/dashboard-primitives'
import {
  buildActionCenterReviewDecisionFormState,
  toIsoDateTimeString,
  type ActionCenterReviewDecisionFormState,
} from '@/lib/action-center-review-decision-editor-state'
import {
  getActionCenterActionGuidance,
  getActionCenterDecisionGuidance,
  getActionCenterDecisionProfile,
} from '@/lib/action-center-review-decisions'
import type {
  ActionCenterReviewDecision,
  AuthoredActionCenterDecision,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from '@/lib/pilot-learning'

const FIELD_CLASS =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100'
const PRIMARY_BUTTON_CLASS =
  'inline-flex items-center rounded-full bg-[#0d6a7c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5b6a] disabled:cursor-not-allowed disabled:opacity-60'
const DECISION_OPTIONS: Array<{ value: AuthoredActionCenterDecision; label: string }> = [
  { value: 'doorgaan', label: 'Doorgaan' },
  { value: 'bijstellen', label: 'Bijstellen' },
  { value: 'afronden', label: 'Afronden' },
  { value: 'stoppen', label: 'Stoppen' },
]

interface Props {
  dossier: PilotLearningDossier
  checkpoint: PilotLearningCheckpoint
  decision: ActionCenterReviewDecision | null
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </label>
  )
}

function getDecisionTone(value: AuthoredActionCenterDecision | null) {
  switch (value) {
    case 'doorgaan':
      return 'emerald' as const
    case 'bijstellen':
      return 'amber' as const
    case 'afronden':
      return 'blue' as const
    case 'stoppen':
      return 'slate' as const
    default:
      return 'slate' as const
  }
}

function getDecisionLabel(value: AuthoredActionCenterDecision | null) {
  return DECISION_OPTIONS.find((option) => option.value === value)?.label ?? 'Nog niet vastgelegd'
}

function buildPayload(state: ActionCenterReviewDecisionFormState) {
  const decisionRecordedAt = toIsoDateTimeString(state.decision_recorded_at_local)
  const reviewCompletedAt = toIsoDateTimeString(state.review_completed_at_local)

  if (!state.route_source_id || !decisionRecordedAt || !reviewCompletedAt) {
    return null
  }

  return {
    route_source_type: state.route_source_type,
    route_source_id: state.route_source_id,
    checkpoint_id: state.checkpoint_id,
    decision: state.decision,
    decision_reason: state.decision_reason,
    next_check: state.next_check,
    current_step: state.current_step,
    next_step: state.next_step || null,
    expected_effect: state.expected_effect || null,
    observation_snapshot: state.observation_snapshot || null,
    decision_recorded_at: decisionRecordedAt,
    review_completed_at: reviewCompletedAt,
  }
}

export function ActionCenterReviewDecisionEditor({ dossier, checkpoint, decision }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ActionCenterReviewDecisionFormState>(() =>
    buildActionCenterReviewDecisionFormState({ dossier, checkpoint, decision }),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setForm(buildActionCenterReviewDecisionFormState({ dossier, checkpoint, decision }))
  }, [checkpoint, decision, dossier])

  const routeUnavailable = !form.route_source_id
  const decisionProfile = getActionCenterDecisionProfile(form.decision)
  const decisionGuidance = getActionCenterDecisionGuidance(form.decision)
  const actionGuidance = getActionCenterActionGuidance({
    currentStep: form.current_step,
    nextStep: form.next_step,
    expectedEffect: form.expected_effect,
  })

  async function handleSave() {
    setError(null)
    setMessage(null)

    const payload = buildPayload(form)
    if (!payload) {
      setError('Koppel eerst een campaign en vul beide reviewmomenten in om deze decision vast te leggen.')
      return
    }

    setSaving(true)
    const response = await fetch(
      form.id ? `/api/action-center-review-decisions/${form.id}` : '/api/action-center-review-decisions',
      {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    const result = (await response.json().catch(() => null)) as { id?: string; detail?: string; message?: string } | null
    if (!response.ok) {
      setError(result?.detail ?? 'Authored review decision opslaan mislukt.')
      setSaving(false)
      return
    }

    setForm((current) => ({ ...current, id: result?.id ?? current.id }))
    setMessage(result?.message ?? 'Authored review decision opgeslagen.')
    router.refresh()
    setSaving(false)
  }

  return (
    <div className="mt-4 rounded-[22px] border border-blue-100 bg-blue-50/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Action Center review decision</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {decisionGuidance}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DashboardChip label={getDecisionLabel(form.decision)} tone={getDecisionTone(form.decision)} />
          <DashboardChip label={routeUnavailable ? 'Campaign ontbreekt' : 'Campaign-route'} tone={routeUnavailable ? 'amber' : 'blue'} />
        </div>
      </div>

      {routeUnavailable ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Deze decision write-path werkt alleen voor campaign-gekoppelde dossiers. Koppel eerst een campaign op dossierniveau.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <FieldLabel htmlFor={`decision-${checkpoint.id}`}>Besluit</FieldLabel>
          <select
            id={`decision-${checkpoint.id}`}
            value={form.decision}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                decision: event.target.value as AuthoredActionCenterDecision,
              }))
            }
            className={FIELD_CLASS}
          >
            {DECISION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor={`decision-completed-${checkpoint.id}`}>Review afgerond op</FieldLabel>
            <input
              id={`decision-completed-${checkpoint.id}`}
              type="datetime-local"
              value={form.review_completed_at_local}
              onChange={(event) =>
                setForm((current) => ({ ...current, review_completed_at_local: event.target.value }))
              }
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <FieldLabel htmlFor={`decision-recorded-${checkpoint.id}`}>Besluit vastgelegd op</FieldLabel>
            <input
              id={`decision-recorded-${checkpoint.id}`}
              type="datetime-local"
              value={form.decision_recorded_at_local}
              onChange={(event) =>
                setForm((current) => ({ ...current, decision_recorded_at_local: event.target.value }))
              }
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <TextAreaField
          label="Waarom dit besluit"
          id={`decision-reason-${checkpoint.id}`}
          value={form.decision_reason}
          onChange={(value) => setForm((current) => ({ ...current, decision_reason: value }))}
        />
        <TextAreaField
          label="Volgende toets"
          id={`next-check-${checkpoint.id}`}
          value={form.next_check}
          onChange={(value) => setForm((current) => ({ ...current, next_check: value }))}
          disabled={decisionProfile.hidesNextCheck}
          placeholder={decisionProfile.hidesNextCheck ? 'Niet van toepassing bij een afsluitend besluit.' : undefined}
        />
        <TextAreaField
          label="Huidige stap"
          id={`current-step-${checkpoint.id}`}
          value={form.current_step}
          onChange={(value) => setForm((current) => ({ ...current, current_step: value }))}
        />
        <TextAreaField
          label="Hierna"
          id={`next-step-${checkpoint.id}`}
          value={form.next_step}
          onChange={(value) => setForm((current) => ({ ...current, next_step: value }))}
          disabled={decisionProfile.hidesNextStep}
          placeholder={decisionProfile.hidesNextStep ? 'Laat leeg bij een afsluitend besluit.' : undefined}
        />
        <TextAreaField
          label="Verwacht effect"
          id={`expected-effect-${checkpoint.id}`}
          value={form.expected_effect}
          onChange={(value) => setForm((current) => ({ ...current, expected_effect: value }))}
        />
        <TextAreaField
          label="Observatie snapshot"
          id={`observation-snapshot-${checkpoint.id}`}
          value={form.observation_snapshot}
          onChange={(value) => setForm((current) => ({ ...current, observation_snapshot: value }))}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Actiekwaliteit:</span> {actionGuidance}
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void handleSave()} disabled={saving || routeUnavailable} className={PRIMARY_BUTTON_CLASS}>
          {saving ? 'Decision wordt opgeslagen...' : form.id ? 'Decision bijwerken' : 'Decision vastleggen'}
        </button>
        <span className="text-xs text-slate-500">
          Deze laag voedt authored review decisions, action progression en decision history in Action Center.
        </span>
      </div>
    </div>
  )
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        className={`${FIELD_CLASS} min-h-[112px]`}
      />
    </div>
  )
}
