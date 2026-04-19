import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ManagementActionStatus } from '@/lib/management-actions'

type CreateManagementActionUpdateBody = {
  action_id?: string
  note?: string
  status_snapshot?: ManagementActionStatus | null
}

const STATUSES: ManagementActionStatus[] = ['open', 'assigned', 'in_progress', 'in_review', 'closed', 'follow_up_needed']

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

  const body = (await request.json().catch(() => null)) as CreateManagementActionUpdateBody | null
  if (!body?.action_id || !body.note?.trim()) {
    return NextResponse.json({ detail: 'action_id en note zijn verplicht.' }, { status: 400 })
  }
  if (body.status_snapshot && !STATUSES.includes(body.status_snapshot)) {
    return NextResponse.json({ detail: 'Ongeldige status_snapshot.' }, { status: 400 })
  }

  const { error } = await auth.supabase.from('management_action_updates').insert({
    action_id: body.action_id,
    note: body.note.trim(),
    status_snapshot: body.status_snapshot ?? null,
    created_by: auth.user.id,
    created_by_email: auth.user.email ?? null,
  })

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Update gelogd.' }, { status: 201 })
}
