import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'

export interface InviteBody {
  action?: 'invite' | 'resend'
  orgId?: string
  email?: string
  fullName?: string
  role?: 'viewer' | 'member'
}

export const RESEND_COOLDOWN_MINUTES = 10

export async function requireAdminContext() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    return { error: NextResponse.json({ detail: 'Alleen Loep-beheerders kunnen klanttoegang beheren.' }, { status: 403 }) }
  }

  return { supabase, user }
}

export async function ensureManagerAccess(
  orgId: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .in('role', ['owner', 'member'])
    .maybeSingle()

  return membership
}

/**
 * Zorgt dat er al een (bevestigde) auth-user bestaat vóór de OTP-mail wordt
 * verstuurd. Reden: Supabase's signInWithOtp gebruikt voor een gloednieuwe
 * gebruiker de "Confirm signup"-template i.p.v. "Magic Link" — en die eerste
 * template is nooit meegenomen in de Loep-rebrand (alleen magic-link en
 * reset-password zijn herplakt in Supabase Dashboard). Door de user hier
 * expliciet (en bevestigd) aan te maken, ziet Supabase 'm bij signInWithOtp
 * altijd als bestaand, en wordt consequent de al-gebrande Magic Link-mail
 * gebruikt — voor zowel nieuwe als herhaalde uitnodigingen.
 */
async function ensureAuthUserExists(email: string, fullName: string | null, orgName: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: fullName ?? undefined,
      organization_name: orgName,
    },
  })

  if (error && error.code !== 'email_exists') {
    throw error
  }
}

export async function sendActivationLink({
  email,
  fullName,
  orgName,
  origin,
}: {
  email: string
  fullName: string | null
  orgName: string
  origin: string
}) {
  await ensureAuthUserExists(email, fullName, orgName)

  const authClient = createPublicClient()

  return authClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=/complete-account`,
      data: {
        full_name: fullName ?? undefined,
        organization_name: orgName,
      },
    },
  })
}

export async function getCanonicalOrigin(request: Request) {
  const configured =
    process.env.FRONTEND_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL

  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  const headerStore = await headers()
  const forwardedHost = headerStore.get('x-forwarded-host')
  const forwardedProto = headerStore.get('x-forwarded-proto') ?? 'https'

  if (forwardedHost && !forwardedHost.includes('localhost')) {
    return `${forwardedProto}://${forwardedHost}`
  }

  const origin = new URL(request.url).origin
  if (!origin.includes('localhost')) {
    return origin
  }

  return origin
}
