import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getOrganizationApiKey(orgId: string) {
  const supabase = createAdminClient()

  const { data: secret, error: secretError } = await supabase
    .from('organization_secrets')
    .select('api_key')
    .eq('org_id', orgId)
    .maybeSingle()

  if (secret?.api_key) {
    return secret.api_key as string
  }

  // Backwards-compatible fallback while older databases still use organizations.api_key.
  const { data: legacyOrg, error: legacyError } = await supabase
    .from('organizations')
    .select('api_key')
    .eq('id', orgId)
    .maybeSingle()

  if (legacyOrg && 'api_key' in legacyOrg && legacyOrg.api_key) {
    return legacyOrg.api_key as string
  }

  const detail = secretError?.message ?? legacyError?.message ?? 'API-sleutel voor organisatie ontbreekt.'
  throw new Error(detail)
}
