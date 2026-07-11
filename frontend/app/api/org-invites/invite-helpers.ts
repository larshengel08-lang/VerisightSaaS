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
  role?: 'owner' | 'member' | 'viewer'
}

export const RESEND_COOLDOWN_MINUTES = 10

/**
 * Bug tot 2026-07-09: alleen 'member' werd herkend, elke andere waarde
 * (inclusief 'owner') viel stilzwijgend terug op 'viewer' — een in het
 * admin-formulier gekozen 'owner' werd zo altijd gedegradeerd, zonder
 * enige foutmelding.
 */
export function resolveInviteRole(bodyRole: InviteBody['role']): 'owner' | 'member' | 'viewer' {
  if (bodyRole === 'owner') return 'owner'
  if (bodyRole === 'member') return 'member'
  return 'viewer'
}

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

const MAX_USER_LOOKUP_PAGES = 20

/**
 * Zoekt een bestaande auth-user op e-mail. De JS admin-SDK biedt hiervoor
 * geen directe getUserByEmail (alleen gepagineerde listUsers), dus we
 * doorlopen de pagina's client-side. Ruim voldoende voor het aantal
 * org-uitnodigingen dat Loep verstuurt; begrensd als veiligheidsklep tegen
 * een oneindige loop bij een onverwacht grote userbase.
 */
async function findAuthUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
) {
  const target = email.toLowerCase()
  for (let page = 1; page <= MAX_USER_LOOKUP_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === target)
    if (match) return match
    if (data.users.length < 200) break // laatste pagina bereikt
  }
  return null
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
 *
 * Bestaat de user al (bijv. een eerdere, ongeconfirmde poging van vóór deze
 * fix) dan volstaat "genegeerd doorgaan" niet: die user is dan nog steeds
 * onbevestigd, en Supabase blijft 'm dan als nieuwe signup behandelen. Die
 * user wordt daarom hier alsnog expliciet bevestigd.
 */
async function ensureAuthUserExists(email: string, fullName: string | null, orgName: string) {
  const admin = createAdminClient()
  const metadata = {
    full_name: fullName ?? undefined,
    organization_name: orgName,
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (!error) return
  if (error.code !== 'email_exists') throw error

  const existing = await findAuthUserByEmail(admin, email)
  if (!existing) {
    // Race condition (net aangemaakt door een gelijktijdig verzoek) of een
    // e-mailadres met een andere identity-provider — signInWithOtp mag dan
    // gewoon zijn eigen (mogelijk minder mooie) pad volgen i.p.v. hier hard
    // te falen op iets wat geen fout van deze aanvraag is.
    return
  }
  if (existing.email_confirmed_at) return // al bevestigd, niets te doen

  const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
    email_confirm: true,
    user_metadata: { ...existing.user_metadata, ...metadata },
  })
  if (updateError) throw updateError
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
      // Rechtstreeks naar /complete-account, NIET via /auth/callback: die route
      // is een server-route en kan de URL-hash niet lezen (fragments bereiken
      // de server nooit). /complete-account is een client-pagina die de
      // implicit-flow-tokens zelf uit de hash haalt (zie createPublicClient).
      emailRedirectTo: `${origin}/complete-account`,
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
