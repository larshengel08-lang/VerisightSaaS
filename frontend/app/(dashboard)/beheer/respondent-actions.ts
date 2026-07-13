'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface NewRespondentRow {
  campaign_id: string
  department: string | null
  role_level: string | null
  exit_month: string | null
  annual_salary_eur: number | null
  email: string | null
}

export type CreateRespondentsResult =
  | { ok: true; created: { token: string; email: string | null }[] }
  | { ok: false; error: string }

// Server-side respondent-insert voor het operator-only /beheer add-respondents-formulier.
// Na de audit-lockdown (H1) is token/email niet meer via de browser-client leesbaar, dus
// de insert + read-back van token/email loopt via de service-role. De autorisatie wordt
// hier opnieuw afgedwongen (is_verisight_admin) - een server-action is een eigen endpoint
// en mag niet leunen op de pagina-gate.
export async function createRespondentsAction(
  rows: NewRespondentRow[],
): Promise<CreateRespondentsResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.is_verisight_admin !== true) {
    return { ok: false, error: 'Geen toegang.' }
  }

  if (!rows.length) return { ok: false, error: 'Geen respondenten opgegeven.' }
  const campaignIds = new Set(rows.map((row) => row.campaign_id))
  if (campaignIds.size !== 1 || !rows[0].campaign_id) {
    return { ok: false, error: 'Ongeldige campagne.' }
  }

  const { data, error } = await createAdminClient()
    .from('respondents')
    .insert(rows)
    .select('token, email')

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Aanmaken mislukt.' }
  }

  return { ok: true, created: data as { token: string; email: string | null }[] }
}
