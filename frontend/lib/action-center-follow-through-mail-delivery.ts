export interface ActionCenterFollowThroughMailDeliveryPayload {
  recipientEmail: string
  subject: string
  emailText: string
  emailHtml: string
}

export interface ActionCenterFollowThroughMailDeliveryOptions {
  fetchImpl?: typeof fetch
  resendApiKey: string
  emailFrom: string
}

export type ActionCenterFollowThroughMailDeliveryResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; reason: string }

export function getActionCenterFollowThroughMailEnv() {
  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() ?? '',
    emailFrom: process.env.EMAIL_FROM?.trim() ?? 'Verisight <noreply@verisight.nl>',
  }
}

export async function deliverActionCenterFollowThroughMail(
  payload: ActionCenterFollowThroughMailDeliveryPayload,
  options: ActionCenterFollowThroughMailDeliveryOptions,
): Promise<ActionCenterFollowThroughMailDeliveryResult> {
  const fetchImpl = options.fetchImpl ?? fetch

  let response: Response
  try {
    response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.emailFrom,
        to: [payload.recipientEmail],
        subject: payload.subject,
        text: payload.emailText,
        html: payload.emailHtml,
      }),
      cache: 'no-store',
    })
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'resend_network_error',
    }
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    const reason =
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : `resend_http_${response.status}`

    return { ok: false, reason }
  }

  const body = (await response.json().catch(() => ({}))) as { id?: string | null }
  return {
    ok: true,
    providerMessageId: body.id ?? null,
  }
}
