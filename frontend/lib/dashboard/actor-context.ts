/**
 * Wie voert deze dashboardactie uit, en voor welke organisatie? Gedeeld door de
 * server actions van het dashboard en van de besluitpagina. Geen 'use server':
 * dit is een helper, geen aanroepbaar endpoint. Alleen importeren vanuit
 * servercode.
 */
import { createClient } from '@/lib/supabase/server'
import type { CampaignAuditActorRole } from '@/lib/campaign-audit'
import type { MemberRole } from '@/lib/types'

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>

export type ActorContext =
  | { ok: false; error: string }
  | {
      ok: true
      supabase: SupabaseClientType
      user: NonNullable<Awaited<ReturnType<SupabaseClientType['auth']['getUser']>>['data']['user']>
      organizationId: string
      isAdmin: boolean
      role: MemberRole | null
      actorRole: CampaignAuditActorRole
    }

export async function loadActorContext(campaignId: string): Promise<ActorContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd.' }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()
  if (!campaign) return { ok: false, error: 'Campagne niet gevonden of niet toegankelijk.' }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  const isAdmin = profile?.is_verisight_admin === true
  const role = (membership?.role ?? null) as MemberRole | null
  const actorRole: CampaignAuditActorRole = isAdmin ? 'verisight_admin' : (role ?? 'unknown')

  return {
    ok: true,
    supabase,
    user,
    organizationId: campaign.organization_id,
    isAdmin,
    role,
    actorRole,
  }
}
