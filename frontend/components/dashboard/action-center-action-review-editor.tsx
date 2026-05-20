'use client'

import type { ActionCenterActionOutcome } from '@/lib/action-center-action-reviews'
import React, { useState } from 'react'

export type ActionCenterActionEvidenceSource =
  | 'manager-observation'
  | 'team-conversation'
  | 'other-bounded-source'

export type ActionCenterActionConfidenceLevel = 'low' | 'medium' | 'high'

export interface ActionCenterActionReviewEditorValue {
  observation: string
  actionOutcome: ActionCenterActionOutcome
  evidenceSource: ActionCenterActionEvidenceSource
  confidenceLevel: ActionCenterActionConfidenceLevel
  followUpNote: string
}

interface Props {
  onSave(value: ActionCenterActionReviewEditorValue): Promise<void> | void
  pending?: boolean
  error?: string | null
  submitLabel?: string
}

const OUTCOME_OPTIONS: Array<{ value: ActionCenterActionOutcome; label: string }> = [
  { value: 'effect-zichtbaar', label: 'Effect zichtbaar' },
  { value: 'bijsturen-nodig', label: 'Bijsturen nodig' },
  { value: 'nog-te-vroeg', label: 'Nog te vroeg' },
  { value: 'stoppen', label: 'Stoppen' },
]

const EVIDENCE_SOURCE_OPTIONS: Array<{
  value: ActionCenterActionEvidenceSource
  label: string
}> = [
  { value: 'manager-observation', label: 'Managerobservatie' },
  { value: 'team-conversation', label: 'Teamgesprek' },
  { value: 'other-bounded-source', label: 'Andere bounded bron' },
]

const CONFIDENCE_OPTIONS: Array<{
  value: ActionCenterActionConfidenceLevel
  label: string
}> = [
  { value: 'low', label: 'Laag' },
  { value: 'medium', label: 'Gemiddeld' },
  { value: 'high', label: 'Hoog' },
]

function getFollowUpGuidance(outcome: ActionCenterActionOutcome) {
  switch (outcome) {
    case 'bijsturen-nodig':
      return 'Beschrijf kort wat je bijstuurt in deze actie.'
    case 'nog-te-vroeg':
      return 'Beschrijf kort wat nog ontbreekt om dit goed te beoordelen.'
    case 'stoppen':
      return 'Beschrijf kort waarom stoppen nu de juiste keuze is.'
    case 'effect-zichtbaar':
    default:
      return 'Beschrijf kort welke verandering je zag en houd het bij waarneembare signalen.'
  }
}

export function ActionCenterActionReviewEditor({
  onSave,
  pending = false,
  error = null,
  submitLabel = 'Review opslaan',
}: Props) {
  const [value, setValue] = useState<ActionCenterActionReviewEditorValue>({
    observation: '',
    actionOutcome: 'effect-zichtbaar',
    evidenceSource: 'manager-observation',
    confidenceLevel: 'medium',
    followUpNote: '',
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave(value)
    setValue({
      observation: '',
      actionOutcome: 'effect-zichtbaar',
      evidenceSource: 'manager-observation',
      confidenceLevel: 'medium',
      followUpNote: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[20px] border border-white/12 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Review op deze actie</p>

      <FormField label="Wat zagen we terug?">
        <textarea
          required
          value={value.observation}
          onChange={(event) => setValue((current) => ({ ...current, observation: event.target.value }))}
          className="min-h-[88px] w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/90 outline-none transition focus:border-[#ffb16e]"
        />
      </FormField>

      <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_0.8fr]">
        <FormField label="Uitkomst">
          <select
            value={value.actionOutcome}
            onChange={(event) => setValue((current) => ({ ...current, actionOutcome: event.target.value as ActionCenterActionOutcome }))}
            className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#ffb16e]"
          >
            {OUTCOME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="text-[#132033]">
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Bron van observatie">
          <select
            value={value.evidenceSource}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                evidenceSource: event.target.value as ActionCenterActionEvidenceSource,
              }))
            }
            className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#ffb16e]"
          >
            {EVIDENCE_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="text-[#132033]">
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <FormField label="Hoe zeker zijn we hiervan?" labelClassName="text-[11px] uppercase tracking-[0.14em] text-white/52">
            <select
              value={value.confidenceLevel}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  confidenceLevel: event.target.value as ActionCenterActionConfidenceLevel,
                }))
              }
              className="w-full rounded-2xl border border-white/12 bg-white/[0.06] px-3 py-3 text-sm text-white/82 outline-none transition focus:border-[#ffb16e]"
            >
              {CONFIDENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="text-[#132033]">
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      <FormField label="Korte toelichting">
        <p className="mb-2 text-xs leading-5 text-white/58">{getFollowUpGuidance(value.actionOutcome)}</p>
        <textarea
          value={value.followUpNote}
          onChange={(event) => setValue((current) => ({ ...current, followUpNote: event.target.value }))}
          placeholder={getFollowUpGuidance(value.actionOutcome)}
          className="min-h-[88px] w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/90 outline-none transition focus:border-[#ffb16e]"
        />
      </FormField>

      {error ? (
        <p className="rounded-2xl border border-[#9d4c45] bg-[#4a231f] px-4 py-3 text-sm text-[#ffd7d1]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-[#ffb16e] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Review opslaan...' : submitLabel}
      </button>
    </form>
  )
}

function FormField({
  label,
  children,
  labelClassName = 'text-sm font-semibold text-white/82',
}: {
  label: string
  children: React.ReactNode
  labelClassName?: string
}) {
  return (
    <label className="block">
      <span className={`mb-2 block ${labelClassName}`}>{label}</span>
      {children}
    </label>
  )
}
