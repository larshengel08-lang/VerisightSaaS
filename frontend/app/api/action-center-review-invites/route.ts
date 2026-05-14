import { NextResponse } from 'next/server'
import {
  buildActionCenterReviewInviteDraft,
  getActionCenterReviewInviteEligibility,
} from '@/lib/action-center-review-invite'
import { renderActionCenterReviewInviteIcs } from '@/lib/action-center-review-invite-ics'
import { resolveReviewInviteContext } from './invite-helpers'

function normalizeRevision(value: unknown) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN

  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0
}

function normalizeMethod(value: unknown) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return normalized === 'cancel' ? 'CANCEL' : 'REQUEST'
}

function buildEligibilityError(reason: string) {
  return NextResponse.json(
    {
      detail: `Reviewuitnodiging kan nog niet worden opgebouwd: ${reason}.`,
    },
    {
      status: 409,
    },
  )
}

function buildIcsFilename(campaignId: string) {
  return `action-center-review-${campaignId}.ics`
}

async function resolvePreview(args: {
  request: Request
  reviewItemId: string
  revision: number
  method: 'REQUEST' | 'CANCEL'
}) {
  const resolved = await resolveReviewInviteContext({
    request: args.request,
    reviewItemId: args.reviewItemId,
  })

  if ('error' in resolved) {
    return {
      error: NextResponse.json(
        {
          detail: resolved.error.detail,
        },
        {
          status: resolved.error.status,
        },
      ),
    }
  }

  const eligibility = getActionCenterReviewInviteEligibility(resolved.context)
  if (!eligibility.ok) {
    return {
      error: buildEligibilityError(eligibility.reason),
    }
  }

  const draft = buildActionCenterReviewInviteDraft(resolved.context)

  return {
    error: null,
    preview: {
      ...draft,
      revision: args.revision,
      method: args.method,
      organizerEmail: resolved.organizerEmail,
    },
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    reviewItemId?: string
    revision?: unknown
    mode?: unknown
  } | null

  const reviewItemId = body?.reviewItemId?.trim()
  if (!reviewItemId) {
    return NextResponse.json(
      {
        detail: 'reviewItemId is verplicht.',
      },
      {
        status: 400,
      },
    )
  }

  const resolved = await resolvePreview({
    request,
    reviewItemId,
    revision: normalizeRevision(body?.revision),
    method: normalizeMethod(body?.mode),
  })

  if (resolved.error) {
    return resolved.error
  }

  return NextResponse.json(resolved.preview, { status: 200 })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const reviewItemId = url.searchParams.get('reviewItemId')?.trim()
  if (!reviewItemId) {
    return NextResponse.json(
      {
        detail: 'reviewItemId is verplicht.',
      },
      {
        status: 400,
      },
    )
  }

  const revision = normalizeRevision(url.searchParams.get('revision'))
  const method = normalizeMethod(url.searchParams.get('mode'))
  const format = url.searchParams.get('format')
  const resolved = await resolvePreview({
    request,
    reviewItemId,
    revision,
    method,
  })

  if (resolved.error) {
    return resolved.error
  }

  if (format !== 'ics') {
    return NextResponse.json(resolved.preview, { status: 200 })
  }

  const ics = renderActionCenterReviewInviteIcs({
    draft: resolved.preview,
    method,
    revision,
    organizerEmail: resolved.preview.organizerEmail,
  })

  return new Response(ics, {
    status: 200,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${buildIcsFilename(resolved.preview.campaignId)}"`,
    },
  })
}
