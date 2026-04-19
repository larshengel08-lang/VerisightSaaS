import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type UpsertDepartmentOwnerBody = {
  organization_id?: string
  department?: string
  owner_label?: string | null
  owner_email?: string | null
}

function cleanOptionalText(value: string | null | undefined) {
  if (typeof value !== 'string') return value ?? null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, error: NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 }) }
  }

  return { supabase, user, error: null }
}

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth.error || !auth.user) return auth.error

  const body = (await request.json().catch(() => null)) as UpsertDepartmentOwnerBody | null
  if (!body?.organization_id || !body.department?.trim()) {
    return NextResponse.json({ detail: 'organization_id en department zijn verplicht.' }, { status: 400 })
  }

  const { error } = await auth.supabase
    .from('management_action_department_owners')
    .upsert(
      {
        organization_id: body.organization_id,
        department: body.department.trim(),
        owner_label: cleanOptionalText(body.owner_label),
        owner_email: cleanOptionalText(body.owner_email),
        created_by: auth.user.id,
        updated_by: auth.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,department' },
    )

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Afdelingeigenaar opgeslagen.' })
}
