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
      // Bewust 'implicit', NIET 'pkce' (2026-07-08, na een live test die alsnog
      // vastliep op /login?error=auth). PKCE vereist dat dezelfde browser die
      // signInWithOtp aanroept ook de code_verifier bewaart om 'm later bij de
      // exchange te kunnen aanleveren. Deze client wordt server-side aangeroepen
      // (sendActivationLink, een API-route) — er is geen browser die een
      // code_verifier kan bewaren, en de ontvanger die de mail opent zit toch
      // altijd in een andere browser/sessie dan degene die de uitnodiging
      // verstuurde. Implicit-tokens (#access_token=... in de hash) zijn
      // self-contained en hebben die continuïteit niet nodig — hetzelfde
      // patroon als resetPasswordForEmail/reset-password al gebruikt.
      flowType: 'implicit',
    },
  })
}
