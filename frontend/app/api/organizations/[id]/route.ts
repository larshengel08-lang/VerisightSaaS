import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ detail: 'Organisatie verwijderen mislukt.' }, { status: 500 })
  }

  return NextResponse.json({
    message: `Organisatie ${org.name} is verwijderd, inclusief gekoppelde campaigns, respondenten en uitnodigingen.`,
  })
}
