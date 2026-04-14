'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resendPendingAction } from './actions'
import { buildResendResultMessage } from './reminder-feedback'

interface CampaignActionsProps {
  campaignId: string
  isActive: boolean
  pendingCount: number
  canManageCampaign: boolean
}

export function CampaignActions({ campaignId, isActive, pendingCount, canManageCampaign }: CampaignActionsProps) {
  const [loading, setLoading] = useState<'archive' | 'resend' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleArchive() {
    const confirmed = confirm(
      'Weet je zeker dat je deze campaign wilt archiveren?\n\nRespondenten kunnen de survey daarna niet meer invullen. Resultaten en het rapport blijven wel beschikbaar.',
    )
    if (!confirmed) return

    setError(null)
    setLoading('archive')

    const supabase = createClient()
    const { error: supabaseError } = await supabase
      .from('campaigns')
      .update({ is_active: false, closed_at: new Date().toISOString() })
      .eq('id', campaignId)

    setLoading(null)

    if (supabaseError) {
      setError(`Archiveren mislukt: ${supabaseError.message}`)
      return
    }

    showToast('Campaign gearchiveerd. Pagina wordt vernieuwd...')
    setTimeout(() => window.location.reload(), 1500)
  }

  async function handleResend() {
    const confirmed = confirm(
      `${pendingCount} respondent(en) opnieuw uitnodigen?\n\nAlle respondenten die de survey nog niet hebben ingevuld ontvangen een nieuwe e-mail.`,
    )
    if (!confirmed) return

    setError(null)
    setLoading('resend')

    const result = await resendPendingAction(campaignId)
    setLoading(null)

    if (result.error) {
      setError(`Versturen mislukt: ${result.error}`)
      return
    }

    showToast(buildResendResultMessage(result))
    if (result.sent > 0) {
      setTimeout(() => window.location.reload(), 2000)
    }
  }

  if (!isActive || !canManageCampaign) return null

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {pendingCount > 0 ? (
          <button
            onClick={handleResend}
            disabled={loading !== null}
            className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 disabled:opacity-50"
            title={`${pendingCount} respondent(en) hebben de survey nog niet ingevuld`}
          >
            {loading === 'resend' ? 'Versturen...' : `Herinnering (${pendingCount})`}
          </button>
        ) : null}
        <button
          onClick={handleArchive}
          disabled={loading !== null}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
        >
          {loading === 'archive' ? 'Archiveren...' : 'Archiveer campaign'}
        </button>
      </div>

      {toast ? (
        <div className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
      {error ? <p className="max-w-xs text-xs text-red-600 sm:text-right">{error}</p> : null}
    </div>
  )
}
