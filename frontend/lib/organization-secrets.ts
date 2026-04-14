import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { createClient as createServerClient } from '@/lib/supabase/server'

type ServerSupabase = Awaited<ReturnType<typeof createServerClient>>

async function getOrganizationApiKeyViaUserContext(supabase: ServerSupabase, orgId: string) {
  const { data, error } = await supabase.rpc('get_org_api_key_for_current_user', {
    target_org_id: orgId,
  })

  if (error || !data) {
    throw new Error(error?.message ?? 'API-sleutel voor organisatie ontbreekt.')
  }

  return String(data)
}

export async function getOrganizationApiKey(orgId: string, options?: { supabase?: ServerSupabase }) {
  if (options?.supabase) {
    try {
      return await getOrganizationApiKeyViaUserContext(options.supabase, orgId)
    } catch {
      // Fallback naar service-role voor omgevingen waar de RPC nog niet beschikbaar is.
    }
  }

  const supabase = createAdminClient()

  const { data: secret, error: secretError } = await supabase
    .from('organization_secrets')
    .select('api_key')
    .eq('org_id', orgId)
    .maybeSingle()

  if (secretError) {
    throw new Error(secretError.message)
  }

  if (secret?.api_key) {
    return secret.api_key as string
  }

  // Backwards-compatible fallback for environments that still expose organizations.api_key.
  try {
    const { data: legacyOrg, error: legacyError } = await supabase
      .from('organizations')
      .select('api_key')
      .eq('id', orgId)
      .maybeSingle()

    if (legacyError && !legacyError.message.includes('api_key')) {
      throw new Error(legacyError.message)
    }

    if (legacyOrg && 'api_key' in legacyOrg && legacyOrg.api_key) {
      return legacyOrg.api_key as string
    }
  } catch (error) {
    if (error instanceof Error && !error.message.includes('api_key')) {
      throw error
    }
  }

  throw new Error('API-sleutel voor organisatie ontbreekt.')
}
