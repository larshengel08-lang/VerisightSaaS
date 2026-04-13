import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getOrganizationApiKey(orgId: string) {
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
