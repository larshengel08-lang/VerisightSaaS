import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface Context {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params
  const supabase = await createClient()

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
    return NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen organisaties archiveren.' }, { status: 403 })
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ detail: 'Je hebt geen eigenaarsrechten voor deze organisatie.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as { isActive?: boolean }
  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ detail: 'isActive moet true of false zijn.' }, { status: 400 })
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (!org) {
    return NextResponse.json({ detail: 'Organisatie niet gevonden.' }, { status: 404 })
  }

  const { error } = await supabase
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

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params
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
    return NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen organisaties verwijderen.' }, { status: 403 })
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ detail: 'Je hebt geen eigenaarsrechten voor deze organisatie.' }, { status: 403 })
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (!org) {
    return NextResponse.json({ detail: 'Organisatie niet gevonden.' }, { status: 404 })
  }

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

  return NextResponse.json({
    message: `Organisatie ${org.name} is verwijderd, inclusief gekoppelde campaigns, respondenten en uitnodigingen.`,
  })
}
