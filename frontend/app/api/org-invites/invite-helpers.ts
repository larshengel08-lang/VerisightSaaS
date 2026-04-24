import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'

export interface InviteBody {
  action?: 'invite' | 'resend'
  orgId?: string
  email?: string
  fullName?: string
  role?: 'owner' | 'viewer' | 'member'
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
    return { error: NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen klanttoegang beheren.' }, { status: 403 }) }
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
