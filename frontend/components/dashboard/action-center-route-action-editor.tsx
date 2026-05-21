'use client'

import {
  ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS,
} from '@/lib/action-center-manager-responses'
import type { ActionCenterManagerActionThemeKey } from '@/lib/pilot-learning'
import React, { useState } from 'react'

export interface ActionCenterRouteActionEditorValue {
  themeKey: ActionCenterManagerActionThemeKey | ''
  actionText: string
  reviewScheduledFor: string
  expectedEffect: string
}

export interface ActionCenterRouteActionEditorSubmissionState {
  validationDisposition: 'invalid' | 'needs_hr_review'
  statusMessage: string
  validationMessage: string
  persistedDraftFingerprint: string
}

interface Props {
  onSave(value: ActionCenterRouteActionEditorValue): Promise<boolean | void> | boolean | void
  initialValue?: ActionCenterRouteActionEditorValue
  pending?: boolean
  error?: string | null
  feedbackTone?: 'error' | 'warning'
  submissionState?: ActionCenterRouteActionEditorSubmissionState | null
  title?: string
  description?: string
  submitLabel?: string
}

const EMPTY_VALUE: ActionCenterRouteActionEditorValue = {
  themeKey: '',
  actionText: '',
  reviewScheduledFor: '',
  expectedEffect: '',
}

export function serializeActionCenterRouteActionEditorValue(value: ActionCenterRouteActionEditorValue) {
  return JSON.stringify({
    themeKey: value.themeKey,
    actionText: value.actionText.trim(),
    reviewScheduledFor: value.reviewScheduledFor.trim(),
    expectedEffect: value.expectedEffect.trim(),
  })
}

export function shouldResetActionCenterRouteActionEditorAfterSave(result: boolean | void) {
  return result !== false
}

export function ActionCenterRouteActionEditor({
  onSave,
  initialValue = EMPTY_VALUE,
  pending = false,
  error = null,
  feedbackTone = 'error',
  submissionState = null,
  title = 'Actie toevoegen',
  description = 'Houd het bij 1 concrete stap en 1 zichtbare observatie.',
  submitLabel = 'Actie toevoegen',
}: Props) {
  const [value, setValue] = useState<ActionCenterRouteActionEditorValue>(initialValue)
  const isDuplicatePersistedDraft =
    submissionState?.persistedDraftFingerprint === serializeActionCenterRouteActionEditorValue(value)
  const isSubmitDisabled = pending || isDuplicatePersistedDraft

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isDuplicatePersistedDraft) {
      return
    }
    const result = await onSave(value)
    if (shouldResetActionCenterRouteActionEditorAfterSave(result)) {
      setValue(EMPTY_VALUE)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[24px] border border-[#e4d9cb] bg-white px-5 py-5 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
      <div>
        <h3 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#132033]">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#4f6175]">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Thema">
          <select
            required
            value={value.themeKey}
            onChange={(event) => setValue((current) => ({ ...current, themeKey: event.target.value as ActionCenterManagerActionThemeKey | '' }))}
            className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
          >
            <option value="">Kies productthema</option>
            {ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Reviewdatum">
          <input
            required
            type="date"
            value={value.reviewScheduledFor}
            onChange={(event) => setValue((current) => ({ ...current, reviewScheduledFor: event.target.value }))}
            className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
          />
        </FormField>
      </div>

      <FormField label="Kernactie">
        <textarea
          required
          value={value.actionText}
          onChange={(event) => setValue((current) => ({ ...current, actionText: event.target.value }))}
          placeholder="Bijv. plan deze week twee korte teamgesprekken met vaste terugkoppeling."
          className="min-h-[92px] w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm leading-6 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
        />
      </FormField>

      <FormField label="Waaraan zien we dit terug?">
        <textarea
          required
          value={value.expectedEffect}
          onChange={(event) => setValue((current) => ({ ...current, expectedEffect: event.target.value }))}
          placeholder="Bijv. binnen twee weken zien we of feedbackafspraken consistenter terugkomen."
          className="min-h-[92px] w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm leading-6 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
        />
      </FormField>

      {submissionState ? (
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-6 text-[#7f4b18]">{submissionState.statusMessage}</p>
          <p
            className={`text-sm leading-6 ${
              submissionState.validationDisposition === 'invalid'
                ? 'text-[#9a5a17]'
                : 'text-[#7f4b18]'
            }`}
          >
            {submissionState.validationMessage}
          </p>
          {isDuplicatePersistedDraft ? (
            <p className="text-sm leading-6 text-[#7f4b18]">
              Wijzig deze opgeslagen draft voordat je hem opnieuw indient.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedbackTone === 'warning'
              ? 'border-[#ffe1c7] bg-[#fff3e8] text-[#9a5a17]'
              : 'border-[#ffd7d1] bg-[#fff1ef] text-[#b75046]'
          }`}
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="inline-flex min-h-11 items-center rounded-full bg-[#ff9b4a] px-4.5 py-2.5 text-sm font-semibold text-[#132033] transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Actie opslaan...' : submitLabel}
      </button>
    </form>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#132033]">{label}</span>
      {children}
    </label>
  )
}
