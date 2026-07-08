import 'server-only'

import { createClient } from '@supabase/supabase-js'

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Klanttoegang is nog niet geconfigureerd: NEXT_PUBLIC_SUPABASE_URL of NEXT_PUBLIC_SUPABASE_ANON_KEY ontbreekt.')
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      // Zonder expliciete pkce-flow gebruikt de kale supabase-js-client
      // 'implicit' als default: dan komt de OTP-link terug met tokens in de
      // URL-hash (#access_token=...), die nooit de server bereiken. Elders
      // in de app (lib/supabase/client.ts, server.ts) draait alles al op
      // @supabase/ssr, dat standaard pkce gebruikt — /auth/callback/route.ts
      // verwacht dan ook alleen een ?code=-param. Zonder deze regel matcht
      // de link die sendActivationLink verstuurt dus nooit die callback-route.
      flowType: 'pkce',
    },
  })
}
