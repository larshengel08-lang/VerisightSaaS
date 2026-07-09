import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface Context {
  params: Promise<{ id: string }>
}

// Getagd op `ok` (i.p.v. presence-check via 'errorResponse' in auth): TS kan
// een optioneel veld niet betrouwbaar wegnarrowen met de `in`-operator,
// waardoor auth.errorResponse anders als "NextResponse | undefined" bleef
// getypeerd ondanks de check.
type AdminContext =
  | { ok: false; errorResponse: NextResponse }
  | { ok: true; admin: ReturnType<typeof createAdminClient> }

async function requireVerisightAdmin(): Promise<AdminContext> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      errorResponse: NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        { detail: 'Alleen Verisight-beheerders kunnen organisaties beheren.' },
        { status: 403 },
      ),
    }
  }

  return { ok: true, admin }
}

export async function PATCH(request: Request, context: Context): Promise<NextResponse> {
  const { id } = await context.params
  const auth = await requireVerisightAdmin()
  if (!auth.ok) {
    return auth.errorResponse
  }
  const admin = auth.admin

  const body = (await request.json().catch(() => ({}))) as { isActive?: boolean }
  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ detail: 'isActive moet true of false zijn.' }, { status: 400 })
  }

  const { data: org } = await admin
    .from('organizations')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (!org) {
    return NextResponse.json({ detail: 'Organisatie niet gevonden.' }, { status: 404 })
  }

  const { error } = await admin
    .from('organizations')
    .update({ is_active: body.isActive })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ detail: 'Organisatiestatus wijzigen mislukt.' }, { status: 500 })
  }

  return NextResponse.json({
    message: body.isActive
      ? `Organisatie ${org.name} is weer actief.`
      : `Organisatie ${org.name} is gearchiveerd. Campagnes, respondenten en resultaten blijven behouden.`,
  })
}

export async function DELETE(_request: Request, context: Context): Promise<NextResponse> {
  const { id } = await context.params
  const auth = await requireVerisightAdmin()
  if (!auth.ok) {
    return auth.errorResponse
  }
  const admin = auth.admin

  const { data: org } = await admin
    .from('organizations')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (!org) {
    return NextResponse.json({ detail: 'Organisatie niet gevonden.' }, { status: 404 })
  }

  // Vastleggen wie er lid was vóórdat we org_members verwijderen, zodat we
  // straks (na verwijdering) kunnen bepalen wiens auth-account nergens meer
  // aan gekoppeld is en dus veilig mee opgeruimd mag worden.
  const { data: membersBeforeDelete } = await admin
    .from('org_members')
    .select('user_id')
    .eq('org_id', id)
  const affectedUserIds = Array.from(
    new Set((membersBeforeDelete ?? []).map((member) => member.user_id as string)),
  )

  const { data: campaigns, error: campaignsError } = await admin
    .from('campaigns')
    .select('id')
    .eq('organization_id', id)

  if (campaignsError) {
    return NextResponse.json({ detail: `Campaigns ophalen mislukt: ${campaignsError.message}` }, { status: 500 })
  }

  const campaignIds = (campaigns ?? []).map((campaign) => campaign.id as string)

  if (campaignIds.length > 0) {
    const { data: respondents, error: respondentsError } = await admin
      .from('respondents')
      .select('id')
      .in('campaign_id', campaignIds)

    if (respondentsError) {
      return NextResponse.json({ detail: `Respondenten ophalen mislukt: ${respondentsError.message}` }, { status: 500 })
    }

    const respondentIds = (respondents ?? []).map((respondent) => respondent.id as string)

    if (respondentIds.length > 0) {
      const { error: responsesDeleteError } = await admin
        .from('survey_responses')
        .delete()
        .in('respondent_id', respondentIds)

      if (responsesDeleteError) {
        return NextResponse.json({ detail: `Surveyresponses verwijderen mislukt: ${responsesDeleteError.message}` }, { status: 500 })
      }
    }

    const { error: respondentsDeleteError } = await admin
      .from('respondents')
      .delete()
      .in('campaign_id', campaignIds)

    if (respondentsDeleteError) {
      return NextResponse.json({ detail: `Respondenten verwijderen mislukt: ${respondentsDeleteError.message}` }, { status: 500 })
    }

    const { error: campaignsDeleteError } = await admin
      .from('campaigns')
      .delete()
      .in('id', campaignIds)

    if (campaignsDeleteError) {
      return NextResponse.json({ detail: `Campaigns verwijderen mislukt: ${campaignsDeleteError.message}` }, { status: 500 })
    }
  }

  const { error: orgInvitesDeleteError } = await admin
    .from('org_invites')
    .delete()
    .eq('org_id', id)

  if (orgInvitesDeleteError) {
    return NextResponse.json({ detail: `Org-invites verwijderen mislukt: ${orgInvitesDeleteError.message}` }, { status: 500 })
  }

  const { error: orgMembersDeleteError } = await admin
    .from('org_members')
    .delete()
    .eq('org_id', id)

  if (orgMembersDeleteError) {
    return NextResponse.json({ detail: `Org-members verwijderen mislukt: ${orgMembersDeleteError.message}` }, { status: 500 })
  }

  const { error: orgSecretDeleteError } = await admin
    .from('organization_secrets')
    .delete()
    .eq('org_id', id)

  if (orgSecretDeleteError) {
    return NextResponse.json({ detail: `Organization secret verwijderen mislukt: ${orgSecretDeleteError.message}` }, { status: 500 })
  }

  const { error: orgDeleteError } = await admin
    .from('organizations')
    .delete()
    .eq('id', id)

  if (orgDeleteError) {
    return NextResponse.json({ detail: `Organisatie verwijderen mislukt: ${orgDeleteError.message}` }, { status: 500 })
  }

  const removedAccountCount = await cleanupOrphanedAuthUsers(admin, affectedUserIds)
  const accountNote = removedAccountCount > 0
    ? ` ${removedAccountCount} inlogaccount${removedAccountCount === 1 ? '' : 's'} zonder overige koppelingen ${removedAccountCount === 1 ? 'is' : 'zijn'} ook verwijderd.`
    : ''

  return NextResponse.json({
    message: `Organisatie ${org.name} is verwijderd, inclusief gekoppelde campaigns, respondenten en uitnodigingen.${accountNote}`,
  })
}

/**
 * Verwijdert het Supabase Auth-account van elke meegegeven user alleen als
 * die persoon nergens anders meer aan gekoppeld is (geen andere organisatie,
 * geen Action Center-workspace-toegang) en geen Loep-beheerder is. Anders
 * zou het verwijderen van één organisatie per ongeluk iemands login voor een
 * andere klant (of Lars' eigen adminaccount) kunnen wegvegen.
 * Faalt een individuele deleteUser-call, dan gaat de opruiming door voor de
 * overige users — de organisatie zelf is op dat moment al succesvol
 * verwijderd, dus hard falen zou een verwarrende halve-mislukking geven.
 */
async function cleanupOrphanedAuthUsers(
  admin: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<number> {
  let removedCount = 0

  for (const userId of userIds) {
    const [{ data: profile }, { data: remainingMemberships }, { data: workspaceMemberships }] = await Promise.all([
      admin.from('profiles').select('is_verisight_admin').eq('id', userId).maybeSingle(),
      admin.from('org_members').select('org_id').eq('user_id', userId),
      admin.from('action_center_workspace_members').select('id').eq('user_id', userId),
    ])

    if (profile?.is_verisight_admin === true) continue
    if ((remainingMemberships ?? []).length > 0) continue
    if ((workspaceMemberships ?? []).length > 0) continue

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      console.error(`[organizations delete] account ${userId} opruimen mislukt:`, deleteUserError.message)
      continue
    }
    removedCount += 1
  }

  return removedCount
}
