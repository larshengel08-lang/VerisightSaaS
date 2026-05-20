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

interface Props {
  onSave(value: ActionCenterRouteActionEditorValue): Promise<boolean | void> | boolean | void
  pending?: boolean
  error?: string | null
  submitLabel?: string
}

const EMPTY_VALUE: ActionCenterRouteActionEditorValue = {
  themeKey: '',
  actionText: '',
  reviewScheduledFor: '',
  expectedEffect: '',
}

export function shouldResetActionCenterRouteActionEditorAfterSave(result: boolean | void) {
  return result !== false
}

export function ActionCenterRouteActionEditor({
  onSave,
  pending = false,
  error = null,
  submitLabel = 'Actie toevoegen',
}: Props) {
  const [value, setValue] = useState<ActionCenterRouteActionEditorValue>(EMPTY_VALUE)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await onSave(value)
    if (shouldResetActionCenterRouteActionEditorAfterSave(result)) {
      setValue(EMPTY_VALUE)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[24px] border border-[#e4d9cb] bg-white px-5 py-5 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
      <div>
        <h3 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#132033]">Actie toevoegen</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#4f6175]">
          Houd het bij 1 concrete stap en 1 zichtbare observatie.
        </p>
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

      {error ? (
        <p className="rounded-2xl border border-[#ffd7d1] bg-[#fff1ef] px-4 py-3 text-sm text-[#b75046]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
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
