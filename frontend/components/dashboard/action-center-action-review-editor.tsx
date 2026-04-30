'use client'

import type { ActionCenterActionOutcome } from '@/lib/action-center-action-reviews'
import React, { useState } from 'react'

export interface ActionCenterActionReviewEditorValue {
  observation: string
  actionOutcome: ActionCenterActionOutcome
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

export function ActionCenterActionReviewEditor({
  onSave,
  pending = false,
  error = null,
  submitLabel = 'Review opslaan',
}: Props) {
  const [value, setValue] = useState<ActionCenterActionReviewEditorValue>({
    observation: '',
    actionOutcome: 'effect-zichtbaar',
    followUpNote: '',
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave(value)
    setValue({
      observation: '',
      actionOutcome: 'effect-zichtbaar',
      followUpNote: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[20px] border border-white/12 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Review op deze actie</p>

      <FormField label="Wat zagen we terug?">
        <textarea
          required
          value={value.observation}
          onChange={(event) => setValue((current) => ({ ...current, observation: event.target.value }))}
          className="min-h-[96px] w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm leading-7 text-white/90 outline-none transition focus:border-[#ffb16e]"
        />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Wat betekent dit?">
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
        <FormField label="Follow-upnotitie">
          <textarea
            value={value.followUpNote}
            onChange={(event) => setValue((current) => ({ ...current, followUpNote: event.target.value }))}
            className="min-h-[96px] w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm leading-7 text-white/90 outline-none transition focus:border-[#ffb16e]"
          />
        </FormField>
      </div>

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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/82">{label}</span>
      {children}
    </label>
  )
}
