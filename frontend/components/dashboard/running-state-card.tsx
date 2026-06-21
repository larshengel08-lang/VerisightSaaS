'use client'

import { useState } from 'react'
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'

interface Props {
  state: DashboardState
  reminderText: string
  scanLabel: string
}

export function RunningStateCard({ state, reminderText, scanLabel }: Props) {
  // Split reminderText (built as `subject\n\nbody`) back into parts
  const firstBreak = reminderText.indexOf('\n\n')
  const defaultSubject = firstBreak >= 0 ? reminderText.slice(0, firstBreak) : reminderText
  const defaultBody = firstBreak >= 0 ? reminderText.slice(firstBreak + 2) : ''

  const [editableSubject, setEditableSubject] = useState(defaultSubject)
  const [editableBody, setEditableBody] = useState(defaultBody)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody, setCopiedBody] = useState(false)

  async function handleCopy(text: string, which: 'subject' | 'body') {
    try {
      await navigator.clipboard.writeText(text)
      if (which === 'subject') { setCopiedSubject(true); setTimeout(() => setCopiedSubject(false), 2000) }
      else { setCopiedBody(true); setTimeout(() => setCopiedBody(false), 2000) }
    } catch { /* clipboard unavailable */ }
  }

  const pct = Math.min(100, Math.max(0, state.progressPct))

  return (
    <section className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E8A020]">{scanLabel}</p>
      <h1 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
        Campagne loopt
      </h1>
      <p className="mt-2 text-[0.95rem] text-[color:var(--dashboard-text)]">
        De uitnodiging is verstuurd. Je kunt de respons hier volgen.
      </p>

      {/* Progress */}
      <div className="mt-6 max-w-sm">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#0D1B2A] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[color:var(--dashboard-muted)]">
          <span>{state.subtext.split(' · ')[0]}</span>
          <span>{state.closeDateLabel || state.subtext.split(' · ')[1]}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 flex gap-0">
        <TimelineItem label="Uitnodiging verstuurd" date="Klaar" done />
        <TimelineItem label="Herinnering" date="Optioneel" />
        <TimelineItem label="Campagne sluiten" date={state.closeDateLabel || 'Nog niet gepland'} last />
      </div>

      {/* Reminder block */}
      <div className="mt-8 max-w-lg rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--dashboard-muted)]">
          Herinneringsmail — pas aan en stuur vanuit je eigen e-mail
        </p>

        {/* Subject */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]">Onderwerp</label>
            <button
              type="button"
              onClick={() => handleCopy(editableSubject, 'subject')}
              className="text-[10px] font-semibold text-[#E8A020] hover:opacity-75"
            >
              {copiedSubject ? 'Gekopieerd ✓' : 'Kopieer'}
            </button>
          </div>
          <textarea
            value={editableSubject}
            onChange={(e) => setEditableSubject(e.target.value)}
            rows={1}
            className="w-full resize-none rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-xs text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
          />
        </div>

        {/* Body */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]">Bericht</label>
            <button
              type="button"
              onClick={() => handleCopy(editableBody, 'body')}
              className="text-[10px] font-semibold text-[#E8A020] hover:opacity-75"
            >
              {copiedBody ? 'Gekopieerd ✓' : 'Kopieer'}
            </button>
          </div>
          <textarea
            value={editableBody}
            onChange={(e) => setEditableBody(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-xs leading-relaxed text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
          />
        </div>

        <p className="mt-2 text-[10px] text-[color:var(--dashboard-muted)]">
          Je kunt de tekst aanpassen voor je kopieert. Vergeet niet je naam in te vullen bij &ldquo;Met vriendelijke groet&rdquo;.
        </p>
      </div>
    </section>
  )
}

function TimelineItem({
  label,
  date,
  done = false,
  last = false,
}: {
  label: string
  date: string
  done?: boolean
  last?: boolean
}) {
  return (
    <div className="relative flex-1 pl-4">
      <div
        className={`absolute left-0 top-[5px] h-2 w-2 rounded-full ${done ? 'bg-[#0D1B2A]' : 'bg-[color:var(--dashboard-soft)]'}`}
      />
      {!last && (
        <div className="absolute left-2 top-[8px] right-0 h-px bg-[color:var(--dashboard-frame-border)]" />
      )}
      <p className={`text-xs font-medium ${done ? 'text-[color:var(--dashboard-ink)]' : 'text-[color:var(--dashboard-muted)]'}`}>
        {label}
      </p>
      <p className="mt-0.5 text-[11px] text-[color:var(--dashboard-muted)]">{date}</p>
    </div>
  )
}
