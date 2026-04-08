'use client'

/**
 * CampaignActions — client component voor campagnebeheer.
 *
 * Sluit-actie: Supabase browser client → RLS bewaakt schrijftoegang (alleen owner/member).
 * Resend-actie: Next.js server action → server-side auth-verificatie vóór backend-aanroep.
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resendPendingAction } from './actions'

interface CampaignActionsProps {
  campaignId: string
  isActive: boolean
  pendingCount: number
}

export function CampaignActions({ campaignId, isActive, pendingCount }: CampaignActionsProps) {
  const [loading,  setLoading]  = useState<'close' | 'resend' | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [toast,    setToast]    = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleClose() {
    if (!confirm(
      'Weet je zeker dat je deze campaign wilt sluiten?\n\n' +
      'Respondenten kunnen de survey daarna niet meer invullen. ' +
      'Resultaten en het rapport blijven beschikbaar.'
    )) return

    setError(null)
    setLoading('close')

    const supabase = createClient()
    const { error: supabaseError } = await supabase
      .from('campaigns')
      .update({ is_active: false })
      .eq('id', campaignId)

    setLoading(null)

    if (supabaseError) {
      setError(`Sluiten mislukt: ${supabaseError.message}`)
      return
    }

    showToast('Campaign gesloten. Pagina wordt vernieuwd…')
    setTimeout(() => window.location.reload(), 1500)
  }

  async function handleResend() {
    if (!confirm(
      `${pendingCount} respondent(en) opnieuw uitnodigen?\n\n` +
      'Alle respondenten die de survey nog niet hebben ingevuld ontvangen een nieuwe e-mail.'
    )) return

    setError(null)
    setLoading('resend')

    const result = await resendPendingAction(campaignId)

    setLoading(null)

    if (result.error) {
      setError(`Versturen mislukt: ${result.error}`)
      return
    }

    const msg = result.sent > 0
      ? `✓ ${result.sent} uitnodiging(en) verstuurd.${result.failed ? ` ${result.failed} mislukt.` : ''}`
      : 'Geen openstaande respondenten met e-mailadres gevonden.'
    showToast(msg)
    if (result.sent > 0) setTimeout(() => window.location.reload(), 2000)
  }

  if (!isActive) return null

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
            {loading === 'resend' ? 'Versturen…' : `↻ Herinnering (${pendingCount})`}
          </button>
        )}
        <button
          onClick={handleClose}
          disabled={loading !== null}
          className="text-sm font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors"
        >
          {loading === 'close' ? 'Sluiten…' : 'Sluit campaign'}
        </button>
      </div>

      {/* Toast melding */}
      {toast && (
        <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>
      )}
    </div>
  )
}
