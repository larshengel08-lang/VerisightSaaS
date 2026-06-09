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
  onSave(value: ActionCenterRouteActionEditorValue): Promise<void> | void
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

export function ActionCenterRouteActionEditor({
  onSave,
  pending = false,
  error = null,
  submitLabel = 'Actie toevoegen',
}: Props) {
  const [value, setValue] = useState<ActionCenterRouteActionEditorValue>(EMPTY_VALUE)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave(value)
    setValue(EMPTY_VALUE)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-[#e4d9cb] bg-white px-6 py-6 shadow-[0_12px_36px_rgba(19,32,51,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Nieuwe actie</p>
          <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#132033]">Actie toevoegen</h3>
          <p className="mt-2 text-sm leading-7 text-[#4f6175]">
            Voeg een concrete lokale stap toe met eigen thema, reviewmoment en verwacht effect.
          </p>
        </div>
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
        <FormField label="Wanneer reviewen we dit?">
          <input
            required
            type="date"
            value={value.reviewScheduledFor}
            onChange={(event) => setValue((current) => ({ ...current, reviewScheduledFor: event.target.value }))}
            className="w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm text-[#132033] outline-none transition focus:border-[#ff9b4a]"
          />
        </FormField>
      </div>

      <FormField label="Wat ga je doen?">
        <textarea
          required
          value={value.actionText}
          onChange={(event) => setValue((current) => ({ ...current, actionText: event.target.value }))}
          placeholder="Bijv. plan deze week twee korte teamgesprekken en leg daar een vaste terugkoppeling vast."
          className="min-h-[110px] w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
        />
      </FormField>

      <FormField label="Wat moet dit zichtbaar maken?">
        <textarea
          required
          value={value.expectedEffect}
          onChange={(event) => setValue((current) => ({ ...current, expectedEffect: event.target.value }))}
          placeholder="Bijv. binnen twee weken moet duidelijk worden of de feedbackafspraken consistenter terugkomen in het team."
          className="min-h-[110px] w-full rounded-2xl border border-[#ddd3c7] bg-[#fbf8f4] px-4 py-3 text-sm leading-7 text-[#132033] outline-none transition focus:border-[#ff9b4a]"
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
