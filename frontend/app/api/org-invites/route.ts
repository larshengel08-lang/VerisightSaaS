import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface InviteBody {
  action?: 'invite' | 'resend'
  orgId?: string
  email?: string
  fullName?: string
  role?: 'viewer' | 'member'
}

async function requireAdminContext() {
  const supabase = await createClient()
  const admin = createAdminClient()

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

  return { supabase, admin, user }
}

async function ensureManagerAccess(orgId: string, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .in('role', ['owner', 'member'])
    .maybeSingle()

  return membership
}

async function sendSupabaseInvite({
  admin,
  email,
  fullName,
  orgName,
  origin,
}: {
  admin: ReturnType<typeof createAdminClient>
  email: string
  fullName: string | null
  orgName: string
  origin: string
}) {
  return admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/dashboard`,
    data: {
      full_name: fullName ?? undefined,
      organization_name: orgName,
    },
  })
}

export async function POST(request: Request) {
  const ctx = await requireAdminContext()
  if ('error' in ctx) {
    return ctx.error
  }

  const { supabase, admin, user } = ctx
  const body = (await request.json()) as InviteBody
  const action = body.action === 'resend' ? 'resend' : 'invite'
  const orgId = body.orgId?.trim()
  const email = body.email?.trim().toLowerCase()
  const fullName = body.fullName?.trim() || null
  const role = body.role === 'member' ? 'member' : 'viewer'

  if (!orgId || !email) {
    return NextResponse.json({ detail: 'Organisatie en e-mailadres zijn verplicht.' }, { status: 400 })
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', orgId)
    .single()

  if (!organization) {
    return NextResponse.json({ detail: 'Organisatie niet gevonden.' }, { status: 404 })
  }

  const membership = await ensureManagerAccess(orgId, user.id, supabase)
  if (!membership) {
    return NextResponse.json({ detail: 'Je hebt geen beheertoegang tot deze organisatie.' }, { status: 403 })
  }

  const listResult = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listResult.error) {
    return NextResponse.json({ detail: 'Gebruikerslijst kon niet worden geladen.' }, { status: 500 })
  }

  const existingUser = listResult.data.users.find(candidate => candidate.email?.toLowerCase() === email)
  const origin = new URL(request.url).origin

  if (action === 'resend') {
    const { data: invite } = await admin
      .from('org_invites')
      .select('id, accepted_at, full_name, role')
      .eq('org_id', orgId)
      .eq('email', email)
      .maybeSingle()

    if (!invite) {
      return NextResponse.json({ detail: 'Geen bestaande uitnodiging gevonden voor deze organisatie.' }, { status: 404 })
    }

    if (invite.accepted_at) {
      return NextResponse.json({ detail: 'Deze gebruiker heeft al actieve dashboardtoegang.' }, { status: 400 })
    }

    const authInvite = await sendSupabaseInvite({
      admin,
      email,
      fullName: fullName ?? invite.full_name ?? null,
      orgName: organization.name,
      origin,
    })

    if (authInvite.error) {
      return NextResponse.json({ detail: `Opnieuw uitnodigen mislukt: ${authInvite.error.message}` }, { status: 500 })
    }

    await admin
      .from('org_invites')
      .update({
        full_name: fullName ?? invite.full_name ?? null,
        role,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    return NextResponse.json({
      status: 'resent',
      message: `Activatiemail opnieuw verstuurd naar ${email}.`,
    })
  }

  if (existingUser) {
    const { error: membershipError } = await admin
      .from('org_members')
      .upsert(
        { org_id: orgId, user_id: existingUser.id, role },
        { onConflict: 'org_id,user_id' },
      )

    if (membershipError) {
      return NextResponse.json({ detail: 'Bestaande gebruiker kon niet worden gekoppeld aan de organisatie.' }, { status: 500 })
    }

    await admin
      .from('org_invites')
      .upsert(
        {
          org_id: orgId,
          email,
          full_name: fullName,
          role,
          invited_by: user.id,
          invited_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        },
        { onConflict: 'org_id,email' },
      )

    return NextResponse.json({
      status: 'linked',
      message: `Bestaande gebruiker gekoppeld aan ${organization.name}. Deze gebruiker kan nu inloggen en het dashboard bekijken.`,
    })
  }

  const { error: inviteError } = await admin
    .from('org_invites')
    .upsert(
      {
        org_id: orgId,
        email,
        full_name: fullName,
        role,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        accepted_at: null,
      },
      { onConflict: 'org_id,email' },
    )

  if (inviteError) {
    return NextResponse.json({ detail: 'Uitnodiging kon niet worden opgeslagen.' }, { status: 500 })
  }

  const authInvite = await sendSupabaseInvite({
    admin,
    email,
    fullName,
    orgName: organization.name,
    origin,
  })

  if (authInvite.error) {
    return NextResponse.json({ detail: `Supabase-uitnodiging mislukt: ${authInvite.error.message}` }, { status: 500 })
  }

  return NextResponse.json({
    status: 'invited',
    message: `Uitnodiging verstuurd naar ${email}. Na activatie krijgt deze gebruiker automatisch toegang tot ${organization.name}.`,
  })
}
