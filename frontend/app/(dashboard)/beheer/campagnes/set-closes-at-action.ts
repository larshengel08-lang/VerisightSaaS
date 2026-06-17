'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function setClosesAtAction(campaignId: string, closesAt: string | null): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Niet ingelogd')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) throw new Error('Geen admin-toegang')

  const { error } = await supabase
    .from('campaigns')
    .update({ closes_at: closesAt })
    .eq('id', campaignId)

  if (error) throw new Error(`Sluitdatum opslaan mislukt: ${error.message}`)

  revalidatePath('/beheer/campagnes')
}
