import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ManagementActionStatus } from '@/lib/management-actions'

interface Context {
  params: Promise<{ id: string }>
}

type UpdateManagementActionBody = {
  title?: string
  status?: ManagementActionStatus
  owner_label?: string | null
  owner_email?: string | null
  due_date?: string | null
  review_date?: string | null
  expected_outcome?: string | null
  measured_outcome?: string | null
  source_question_key?: string | null
  source_question_label?: string | null
  blocker_note?: string | null
  last_review_outcome?: 'continue' | 'close' | 'reopen' | 'follow_up_needed' | null
}

const STATUSES: ManagementActionStatus[] = ['open', 'assigned', 'in_progress', 'in_review', 'closed', 'follow_up_needed']
const REVIEW_OUTCOMES = ['continue', 'close', 'reopen', 'follow_up_needed'] as const

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

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params
  const auth = await requireUser()
  if (auth.error || !auth.user) return auth.error

  const body = (await request.json().catch(() => null)) as UpdateManagementActionBody | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }
  if (body.status && !STATUSES.includes(body.status)) {
    return NextResponse.json({ detail: 'Ongeldige status.' }, { status: 400 })
  }
  if (body.last_review_outcome && !REVIEW_OUTCOMES.includes(body.last_review_outcome)) {
    return NextResponse.json({ detail: 'Ongeldige last_review_outcome.' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    updated_by: auth.user.id,
    updated_at: new Date().toISOString(),
  }

  if ('title' in body) updatePayload.title = body.title?.trim()
  if ('status' in body) updatePayload.status = body.status
  if ('owner_label' in body) updatePayload.owner_label = cleanOptionalText(body.owner_label)
  if ('owner_email' in body) updatePayload.owner_email = cleanOptionalText(body.owner_email)
  if ('due_date' in body) updatePayload.due_date = cleanOptionalText(body.due_date)
  if ('review_date' in body) updatePayload.review_date = cleanOptionalText(body.review_date)
  if ('expected_outcome' in body) updatePayload.expected_outcome = cleanOptionalText(body.expected_outcome)
  if ('measured_outcome' in body) updatePayload.measured_outcome = cleanOptionalText(body.measured_outcome)
  if ('source_question_key' in body) updatePayload.source_question_key = cleanOptionalText(body.source_question_key)
  if ('source_question_label' in body) updatePayload.source_question_label = cleanOptionalText(body.source_question_label)
  if ('blocker_note' in body) updatePayload.blocker_note = cleanOptionalText(body.blocker_note)
  if ('last_review_outcome' in body) updatePayload.last_review_outcome = body.last_review_outcome ?? null

  const { error } = await auth.supabase.from('management_actions').update(updatePayload).eq('id', id)
  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Action-log entry bijgewerkt.' })
}
