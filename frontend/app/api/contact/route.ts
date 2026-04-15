import { NextResponse } from 'next/server'
import {
  inferRouteInterestFromSource,
  normalizeContactCtaSource,
  normalizeContactDesiredTiming,
  normalizeContactRouteInterest,
} from '@/lib/contact-funnel'
import { getBackendApiUrl } from '@/lib/server-env'

function isNonEmptyString(value: unknown, min = 1) {
  return typeof value === 'string' && value.trim().length >= min
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

  const response = await fetch(`${getBackendApiUrl()}/api/contact-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      ...(realIp ? { 'x-real-ip': realIp } : {}),
    },
    body: JSON.stringify({
      ...body,
      route_interest: routeInterest,
      cta_source: ctaSource,
      desired_timing: desiredTiming,
    }),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    return NextResponse.json(
      { detail: payload.detail ?? 'Je aanvraag kon niet worden verwerkt.' },
      { status: response.status },
    )
  }

  return NextResponse.json(
    {
      message: payload.message ?? 'Verstuurd',
      notification_sent: payload.notification_sent ?? true,
      warning: payload.warning ?? null,
      lead_id: payload.lead_id ?? null,
    },
    { status: response.status },
  )
}
