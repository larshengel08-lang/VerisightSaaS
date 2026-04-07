'use server'

/**
 * Server actions voor campagnebeheer.
 * Draaien server-side zodat Supabase-sessie beschikbaar is voor auth-verificatie.
 * RLS op de respondenten-tabel zorgt dat alleen geautoriseerde gebruikers data zien.
 */

import { createClient } from '@/lib/supabase/server'

export interface ResendResult {
  sent: number
  failed: number
  skipped: number
  error?: string
}

/**
 * Stuur uitnodigingen opnieuw naar alle incomplete respondenten met e-mailadres.
 * Auth: vereist geldige Supabase-sessie (server-side cookie verificatie).
 * Data-toegang: bewaakt door RLS — alleen respondenten van eigen org zichtbaar.
 */
export async function resendPendingAction(campaignId: string): Promise<ResendResult> {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { sent: 0, failed: 0, skipped: 0, error: 'Niet ingelogd.' }

  // Get pending respondents — RLS ensures only own-org data is returned
  const { data: respondents, error: fetchError } = await supabase
    .from('respondents')
    .select('token, email')
    .eq('campaign_id', campaignId)
    .eq('completed', false)
    .not('email', 'is', null)

  if (fetchError) return { sent: 0, failed: 0, skipped: 0, error: fetchError.message }
  if (!respondents?.length) return { sent: 0, failed: 0, skipped: 0 }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  try {
    const resp = await fetch(`${apiUrl}/api/campaigns/${campaignId}/send-invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(respondents.map(r => ({ token: r.token, email: r.email }))),
      // Server-side fetch: geen browser CORS-restrictie, directe backend-aanroep
      cache: 'no-store',
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      return { sent: 0, failed: respondents.length, skipped: 0, error: err.detail ?? 'Backend error' }
    }

    const result = await resp.json()
    return {
      sent:    result.sent    ?? 0,
      failed:  result.failed  ?? 0,
      skipped: result.skipped ?? 0,
    }
  } catch {
    return { sent: 0, failed: 0, skipped: 0, error: 'Verbindingsfout met backend.' }
  }
}
