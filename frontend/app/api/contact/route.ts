import { NextResponse } from 'next/server'
import {
  inferRouteInterestFromSource,
  normalizeContactCtaSource,
  normalizeContactDesiredTiming,
  normalizeContactRouteInterest,
} from '@/lib/contact-funnel'
import { getBackendApiUrl } from '@/lib/server-env'
import { createAdminClient } from '@/lib/supabase/admin'

function isNonEmptyString(value: unknown, min = 1) {
  return typeof value === 'string' && value.trim().length >= min
}

type ContactPayload = {
  name: string
  work_email: string
  organization: string
  employee_count: string
  route_interest: string
  cta_source: string
  desired_timing: string
  current_question: string
  website?: string | null
}

function shouldFallbackToSupabase(status: number) {
  return status === 404 || status >= 500
}

async function storeContactRequestViaSupabase(payload: ContactPayload) {
  const admin = createAdminClient()
  const createdAt = new Date().toISOString()
  const { data, error } = await admin
    .from('contact_requests')
    .insert({
      id: crypto.randomUUID(),
      created_at: createdAt,
      name: payload.name,
      work_email: payload.work_email,
      organization: payload.organization,
      employee_count: payload.employee_count,
      route_interest: payload.route_interest,
      cta_source: payload.cta_source,
      desired_timing: payload.desired_timing,
      current_question: payload.current_question,
      website: payload.website ?? null,
      notification_sent: false,
      notification_error: 'primary_backend_unavailable',
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return NextResponse.json(
    {
      message: 'Aanvraag opgeslagen',
      notification_sent: false,
      warning:
        'Je aanvraag is opgeslagen. We reageren handmatig terwijl de notificatielaag tijdelijk niet beschikbaar is.',
      lead_id: data?.id ?? null,
    },
    { status: 202 },
  )
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige aanvraag.' }, { status: 400 })
  }

  if (
    !isNonEmptyString(body.name, 2) ||
    !isNonEmptyString(body.work_email, 5) ||
    !isNonEmptyString(body.organization, 2) ||
    !isNonEmptyString(body.employee_count, 2) ||
    !isNonEmptyString(body.current_question, 5)
  ) {
    return NextResponse.json({ detail: 'Vul alle verplichte velden volledig in.' }, { status: 400 })
  }

  const ctaSource = normalizeContactCtaSource(body.cta_source)
  const routeInterest = body.route_interest
    ? normalizeContactRouteInterest(body.route_interest)
    : inferRouteInterestFromSource(ctaSource)
  const desiredTiming = normalizeContactDesiredTiming(body.desired_timing)

  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const payload = {
    ...body,
    route_interest: routeInterest,
    cta_source: ctaSource,
    desired_timing: desiredTiming,
  } satisfies ContactPayload

  try {
    const response = await fetch(`${getBackendApiUrl()}/api/contact-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
        ...(realIp ? { 'x-real-ip': realIp } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    })

    const responsePayload = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (shouldFallbackToSupabase(response.status)) {
        return await storeContactRequestViaSupabase(payload)
      }

      return NextResponse.json(
        { detail: responsePayload.detail ?? 'Je aanvraag kon niet worden verwerkt.' },
        { status: response.status },
      )
    }

    return NextResponse.json(
      {
        message: responsePayload.message ?? 'Verstuurd',
        notification_sent: responsePayload.notification_sent ?? true,
        warning: responsePayload.warning ?? null,
        lead_id: responsePayload.lead_id ?? null,
      },
      { status: response.status },
    )
  } catch {
    try {
      return await storeContactRequestViaSupabase(payload)
    } catch {
      return NextResponse.json(
        { detail: 'Je aanvraag kon niet worden verwerkt.' },
        { status: 503 },
      )
    }
  }
}
