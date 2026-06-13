'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { confirmReminderSentAction, closeCampaignAction } from '@/app/(dashboard)/dashboard/dashboard-actions'
import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'

export function DashboardStateActions({ state, reminderText }: { state: DashboardState; reminderText: string }) {
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'copied' | 'busy'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (!state.campaignId || !state.ctaLabel) return null

  async function handleCopyReminder() {
    setError(null)
    try {
      await navigator.clipboard.writeText(reminderText)
    } catch {
      // Clipboard can fail silently in some browsers; still advance so HR can confirm manual send.
    }
    setPhase('copied')
  }

  async function handleConfirmReminder() {
    setError(null)
    setPhase('busy')
    const result = await confirmReminderSentAction(state.campaignId!)
    if (!result.ok) {
      setError(result.error ?? 'Bevestigen mislukt.')
      setPhase('copied')
      return
    }
    router.refresh()
  }

  async function handleClose() {
    setError(null)
    const confirmed = confirm('Weet je zeker dat je deze campagne wilt sluiten?\n\nRespondenten kunnen daarna niet meer invullen. Resultaten en het rapport blijven beschikbaar.')
    if (!confirmed) return
    setPhase('busy')
    const result = await closeCampaignAction(state.campaignId!)
    if (!result.ok) {
      setError(result.error ?? 'Sluiten mislukt.')
      setPhase('idle')
      return
    }
    router.refresh()
  }

  const primaryButtonClass =
    'inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-50'

  if (state.ctaKind === 'copy_reminder') {
    return (
      <div className="flex flex-col items-start gap-2">
        {phase === 'idle' ? (
          <button type="button" onClick={handleCopyReminder} className={primaryButtonClass}>
            {state.ctaLabel}
          </button>
        ) : (
          <button type="button" onClick={handleConfirmReminder} disabled={phase === 'busy'} className={primaryButtonClass}>
            {phase === 'busy' ? 'Bevestigen…' : 'Ik heb de herinnering verstuurd'}
          </button>
        )}
        {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
      </div>
    )
  }

  if (state.ctaKind === 'close_campaign') {
    return (
      <div className="flex flex-col items-start gap-2">
        <button type="button" onClick={handleClose} disabled={phase === 'busy'} className={primaryButtonClass}>
          {phase === 'busy' ? 'Sluiten…' : (state.ctaLabel ?? 'Campagne sluiten')}
        </button>
        {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
      </div>
    )
  }

  return null
}
