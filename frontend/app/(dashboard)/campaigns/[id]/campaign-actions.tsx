'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resendPendingAction } from './actions'

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
      'Weet je zeker dat je deze campaign wilt archiveren?\n\n' +
      'Respondenten kunnen de survey daarna niet meer invullen. ' +
      'Resultaten en het rapport blijven wel beschikbaar.',
    )

    if (!confirmed) {
      return
    }

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
      `${pendingCount} respondent(en) opnieuw uitnodigen?\n\n` +
      'Alle respondenten die de survey nog niet hebben ingevuld ontvangen een nieuwe e-mail.',
    )

    if (!confirmed) {
      return
    }

    setError(null)
    setLoading('resend')

    const result = await resendPendingAction(campaignId)

    setLoading(null)

    if (result.error) {
      setError(`Versturen mislukt: ${result.error}`)
      return
    }

    const message =
      result.sent > 0
        ? `✓ ${result.sent} uitnodiging(en) verstuurd.${result.failed ? ` ${result.failed} mislukt.` : ''}`
        : 'Geen openstaande respondenten met e-mailadres gevonden.'

    showToast(message)

    if (result.sent > 0) {
      setTimeout(() => window.location.reload(), 2000)
    }
  }

  if (!isActive || !canManageCampaign) {
    return null
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {pendingCount > 0 && (
          <button
            onClick={handleResend}
            disabled={loading !== null}
            className="text-sm font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
            title={`${pendingCount} respondent(en) hebben de survey nog niet ingevuld`}
          >
            {loading === 'resend' ? 'Versturen...' : `↻ Herinnering (${pendingCount})`}
          </button>
        )}
        <button
          onClick={handleArchive}
          disabled={loading !== null}
          className="text-sm font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 disabled:opacity-50 transition-colors"
        >
          {loading === 'archive' ? 'Archiveren...' : 'Archiveer campaign'}
        </button>
      </div>

      {toast && (
        <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {error && <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>}
    </div>
  )
}
