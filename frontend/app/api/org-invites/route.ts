import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface InviteBody {
  orgId?: string
  email?: string
  role?: 'viewer' | 'member'
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    return NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen klanttoegang versturen.' }, { status: 403 })
  }

  const body = (await request.json()) as InviteBody
  const orgId = body.orgId?.trim()
  const email = body.email?.trim().toLowerCase()
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

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .in('role', ['owner', 'member'])
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ detail: 'Je hebt geen beheertoegang tot deze organisatie.' }, { status: 403 })
  }

  const listResult = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listResult.error) {
    return NextResponse.json({ detail: 'Gebruikerslijst kon niet worden geladen.' }, { status: 500 })
  }

  const existingUser = listResult.data.users.find(candidate => candidate.email?.toLowerCase() === email)

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
          role,
          invited_by: user.id,
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
        role,
        invited_by: user.id,
        accepted_at: null,
      },
      { onConflict: 'org_id,email' },
    )

  if (inviteError) {
    return NextResponse.json({ detail: 'Uitnodiging kon niet worden opgeslagen.' }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  const authInvite = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/dashboard`,
  })

  if (authInvite.error) {
    return NextResponse.json({ detail: `Supabase-uitnodiging mislukt: ${authInvite.error.message}` }, { status: 500 })
  }

  return NextResponse.json({
    status: 'invited',
    message: `Uitnodiging verstuurd naar ${email}. Na activatie krijgt deze gebruiker automatisch toegang tot ${organization.name}.`,
  })
}
