import { NextResponse } from 'next/server'
import {
  inferRouteInterestFromSource,
  normalizeContactCtaSource,
  normalizeContactDesiredTiming,
  normalizeContactRouteInterest,
} from '@/lib/contact-funnel'
import { getBackendApiUrl } from '@/lib/server-env'
import { createAdminClient } from '@/lib/supabase/admin'

const CONTACT_ROUTE_LABELS: Record<string, string> = {
  exitscan: 'ExitScan',
  retentiescan: 'RetentieScan',
  teamscan: 'TeamScan',
  onboarding: 'Onboarding 30-60-90',
  leadership: 'Leadership Scan',
  combinatie: 'Combinatie',
  'nog-onzeker': 'Nog niet zeker',
}

const CONTACT_TIMING_LABELS: Record<string, string> = {
  'zo-snel-mogelijk': 'Zo snel mogelijk',
  'deze-maand': 'Deze maand',
  'dit-kwartaal': 'Dit kwartaal',
  orienterend: 'Orienterend',
}

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

type EmailSendResult = {
  ok: boolean
  reason?: string
}

function shouldFallbackToSupabase(status: number) {
  return status === 404 || status >= 500
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderContactRequestEmail(payload: ContactPayload) {
  const safe = {
    name: escapeHtml(payload.name),
    workEmail: escapeHtml(payload.work_email),
    organization: escapeHtml(payload.organization),
    employeeCount: escapeHtml(payload.employee_count),
    routeInterest: escapeHtml(CONTACT_ROUTE_LABELS[payload.route_interest] ?? payload.route_interest),
    desiredTiming: escapeHtml(CONTACT_TIMING_LABELS[payload.desired_timing] ?? payload.desired_timing),
    ctaSource: escapeHtml(payload.cta_source),
    currentQuestion: escapeHtml(payload.current_question),
  }

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#F8FAFC;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#0F172A;padding:24px 28px;">
              <span style="font-size:20px;font-weight:700;color:#FFFFFF;">Nieuwe kennismakingsaanvraag</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 18px;font-size:15px;color:#334155;line-height:1.7;">
                Via de marketing-site is een nieuwe aanvraag binnengekomen voor een verkennend gesprek over Verisight.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#64748B;width:180px;">Naam</td>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#0F172A;font-weight:600;">${safe.name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#64748B;">Werk e-mail</td>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#0F172A;font-weight:600;">${safe.workEmail}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#64748B;">Organisatie</td>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#0F172A;font-weight:600;">${safe.organization}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#64748B;">Omvang</td>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#0F172A;font-weight:600;">${safe.employeeCount}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#64748B;">Voorkeursroute</td>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#0F172A;font-weight:600;">${safe.routeInterest}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#64748B;">Gewenste timing</td>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#0F172A;font-weight:600;">${safe.desiredTiming}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#64748B;">CTA-bron</td>
                  <td style="padding:10px 0;border-top:1px solid #E2E8F0;font-size:14px;color:#0F172A;font-weight:600;">${safe.ctaSource}</td>
                </tr>
              </table>
              <div style="margin-top:20px;padding:18px;border-radius:12px;background:#F8FAFC;border:1px solid #E2E8F0;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#475569;">
                  Huidige vraag
                </p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#0F172A;white-space:pre-wrap;">${safe.currentQuestion}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function sendContactRequestEmail(payload: ContactPayload): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM ?? 'Verisight <noreply@verisight.nl>'
  const contactEmail = process.env.CONTACT_EMAIL ?? 'hallo@verisight.nl'

  if (!apiKey) {
    return { ok: false, reason: 'missing_resend_api_key' }
  }

  if (!contactEmail.trim()) {
    return { ok: false, reason: 'missing_contact_email' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [contactEmail],
      subject: `Kennismakingsaanvraag Verisight - ${payload.organization}`,
      html: renderContactRequestEmail(payload),
      reply_to: payload.work_email,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    const reason =
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : `resend_http_${response.status}`
    return { ok: false, reason }
  }

  return { ok: true }
}

async function updateContactRequestNotification(
  leadId: string,
  values: {
    notification_sent: boolean
    notification_error: string | null
  },
) {
  const admin = createAdminClient()
  const { error } = await admin.from('contact_requests').update(values).eq('id', leadId)
  if (error) {
    throw new Error(error.message)
  }
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

  const leadId = data?.id ?? null

  try {
    const sendResult = await sendContactRequestEmail(payload)
    if (leadId) {
      await updateContactRequestNotification(leadId, {
        notification_sent: sendResult.ok,
        notification_error: sendResult.ok ? null : sendResult.reason ?? 'mail_send_failed',
      })
    }

    if (sendResult.ok) {
      return NextResponse.json(
        {
          message: 'Verstuurd',
          notification_sent: true,
          warning: null,
          lead_id: leadId,
        },
        { status: 200 },
      )
    }
  } catch (sendError) {
    if (leadId) {
      await updateContactRequestNotification(leadId, {
        notification_sent: false,
        notification_error:
          sendError instanceof Error ? sendError.message : 'mail_send_failed',
      }).catch(() => undefined)
    }
  }

  return NextResponse.json(
    {
      message: 'Aanvraag opgeslagen',
      notification_sent: false,
      warning:
        'Je aanvraag is opgeslagen. We reageren handmatig terwijl de notificatielaag tijdelijk niet beschikbaar is.',
      lead_id: leadId,
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
