import type { SupabaseClient } from '@supabase/supabase-js'

export interface AccountOrganizations {
  /** Namen van de organisaties waar de gebruiker lid van is. */
  names: string[]
  /** Reden als de namen niet (volledig) geladen konden worden; de schil toont dan een degraded label. */
  error: string | null
}

/**
 * De organisatie(s) van het account (spec 2026-09-16 par. 6.5). Vóór dit plan
 * stond in de kop het maildomein met een hoofdletter ("Hotmail"); dat was
 * nooit de organisatie. Geen throw: de schil moet blijven renderen, maar de
 * kop zegt dan zichtbaar dat de naam niet geladen is.
 */
export async function loadAccountOrganizations(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountOrganizations> {
  const { data: memberships, error: membershipError } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)
  if (membershipError) return { names: [], error: membershipError.message }

  const orgIds = Array.from(new Set((memberships ?? []).map((row) => row.org_id as string)))
  if (orgIds.length === 0) return { names: [], error: null }

  const { data: organizations, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .in('id', orgIds)
  if (orgError) return { names: [], error: orgError.message }

  const names = (organizations ?? [])
    .map((row) => (typeof row.name === 'string' ? row.name.trim() : ''))
    .filter((name) => name.length > 0)
  if (names.length < orgIds.length) {
    return { names, error: `Van ${orgIds.length - names.length} organisatie(s) ontbreekt de naam of de leesrechten.` }
  }
  return { names, error: null }
}
