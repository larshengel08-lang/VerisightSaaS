import { NextResponse } from 'next/server'
import {
  getCanonicalOrigin,
  ensureManagerAccess,
  requireAdminContext,
  RESEND_COOLDOWN_MINUTES,
  sendActivationLink,
  type InviteBody,
} from './invite-helpers'

export async function POST(request: Request) {
  try {
    const ctx = await requireAdminContext()
    if ('error' in ctx) {
      return ctx.error
    }

    const { supabase, user } = ctx
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

    const { data: existingInvite } = await supabase
      .from('org_invites')
      .select('id, accepted_at, full_name, role, invited_at')
      .eq('org_id', orgId)
      .eq('email', email)
      .maybeSingle()

    if (action === 'resend') {
      if (!existingInvite) {
        return NextResponse.json({ detail: 'Geen bestaande uitnodiging gevonden voor deze organisatie.' }, { status: 404 })
      }

      if (existingInvite.accepted_at) {
        return NextResponse.json({ detail: 'Deze gebruiker heeft al actieve dashboardtoegang.' }, { status: 400 })
      }

      if (existingInvite.invited_at) {
        const invitedAt = new Date(existingInvite.invited_at).getTime()
        const cooldownMs = RESEND_COOLDOWN_MINUTES * 60 * 1000
        const elapsedMs = Date.now() - invitedAt
        if (elapsedMs < cooldownMs) {
          const remainingMinutes = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / (60 * 1000)))
          return NextResponse.json(
            {
              detail: `Activatiemail is net verstuurd. Wacht nog ongeveer ${remainingMinutes} minuut${remainingMinutes === 1 ? '' : 'en'} voordat je opnieuw uitnodigt.`,
            },
            { status: 429 },
          )
        }
      }
    }

    if (action === 'invite' && existingInvite?.accepted_at) {
      return NextResponse.json({
        status: 'linked',
        message: `Deze gebruiker heeft al actieve dashboardtoegang voor ${organization.name}.`,
      })
    }

    const { error: inviteError } = await supabase
      .from('org_invites')
      .upsert(
        {
          org_id: orgId,
          email,
          full_name: fullName ?? existingInvite?.full_name ?? null,
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

    const origin = await getCanonicalOrigin(request)
    const authResult = await sendActivationLink({
      email,
      fullName: fullName ?? existingInvite?.full_name ?? null,
      orgName: organization.name,
      origin,
    })

    if (authResult.error) {
      if (/rate limit exceeded/i.test(authResult.error.message)) {
        return NextResponse.json(
          {
            detail: `Activatiemail is recent al verstuurd. Wacht ongeveer ${RESEND_COOLDOWN_MINUTES} minuten en probeer het daarna opnieuw.`,
          },
          { status: 429 },
        )
      }
      return NextResponse.json({ detail: `Uitnodiging versturen mislukt: ${authResult.error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      status: action === 'resend' ? 'resent' : 'invited',
      message:
        action === 'resend'
          ? `Activatiemail opnieuw verstuurd naar ${email}.`
          : `Activatiemail verstuurd naar ${email}. Na activatie kiest deze gebruiker eerst een wachtwoord en krijgt daarna automatisch toegang tot ${organization.name}.`,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Klanttoegang versturen mislukt.'
    return NextResponse.json({ detail }, { status: 500 })
  }
}
