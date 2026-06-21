'use client'

import { useState } from 'react'
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'

interface Props {
  state: DashboardState
  reminderText: string
  scanLabel: string
}

export function RunningStateCard({ state, reminderText, scanLabel }: Props) {
  const [copied, setCopied] = useState(false)
  const [everCopied, setEverCopied] = useState(false)

  async function handleCopyReminder() {
    try {
      await navigator.clipboard.writeText(reminderText)
      setEverCopied(true)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

      {/* Reminder CTA */}
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handleCopyReminder}
          className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)]"
        >
          {copied ? 'Gekopieerd ✓' : 'Kopieer herinneringstekst →'}
        </button>
        {everCopied && (
          <p className="text-xs text-[color:var(--dashboard-muted)]">Plak en stuur vanuit je eigen e-mail</p>
        )}
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
      {/* Dot */}
      <div
        className={`absolute left-0 top-[5px] h-2 w-2 rounded-full ${done ? 'bg-[#0D1B2A]' : 'bg-[color:var(--dashboard-soft)]'}`}
      />
      {/* Connector line (not on last) */}
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
