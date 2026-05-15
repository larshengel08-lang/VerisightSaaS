import { NextResponse } from 'next/server'
import {
  buildActionCenterReviewInviteDraft,
  getActionCenterReviewInviteEligibility,
} from '@/lib/action-center-review-invite'
import { renderActionCenterReviewInviteIcs } from '@/lib/action-center-review-invite-ics'
import { resolveReviewInviteContext } from './invite-helpers'

function parseRevisionOverride(value: unknown) {
  if (value === null || typeof value === 'undefined') {
    return {
      hasExplicitOverride: false,
      revision: 0,
    }
  }

  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN

  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      hasExplicitOverride: false,
      revision: 0,
    }
  }

  return {
    hasExplicitOverride: true,
    revision: Math.trunc(parsed),
  }
}

function parseMethodOverride(value: unknown) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (normalized === 'cancel') {
    return {
      hasExplicitOverride: true,
      method: 'CANCEL' as const,
    }
  }

  if (normalized === 'request') {
    return {
      hasExplicitOverride: true,
      method: 'REQUEST' as const,
    }
  }

  return {
    hasExplicitOverride: false,
    method: 'REQUEST' as const,
  }
}

function resolvePreviewRevision(args: {
  hasExplicitOverride: boolean
  requestedRevision: number
  latestRevision: number | null
}) {
  if (args.hasExplicitOverride) {
    return args.requestedRevision
  }

  return typeof args.latestRevision === 'number' ? args.latestRevision : 0
}

function resolvePreviewMethod(args: {
  hasExplicitOverride: boolean
  requestedMethod: 'REQUEST' | 'CANCEL'
  isCanonicalReviewCancelled: boolean
}) {
  if (args.hasExplicitOverride) {
    return args.requestedMethod
  }

  return args.isCanonicalReviewCancelled ? 'CANCEL' : 'REQUEST'
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
  requestedRevision: number
  hasRevisionOverride: boolean
  requestedMethod: 'REQUEST' | 'CANCEL'
  hasMethodOverride: boolean
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
  const revision = resolvePreviewRevision({
    hasExplicitOverride: args.hasRevisionOverride,
    requestedRevision: args.requestedRevision,
    latestRevision: resolved.persistedScheduleDefaults.latestRevision,
  })
  const method = resolvePreviewMethod({
    hasExplicitOverride: args.hasMethodOverride,
    requestedMethod: args.requestedMethod,
    isCanonicalReviewCancelled: resolved.persistedScheduleDefaults.isCanonicalReviewCancelled,
  })

  return {
    error: null,
    preview: {
      ...draft,
      revision,
      method,
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

  const revisionOverride = parseRevisionOverride(body?.revision)
  const methodOverride = parseMethodOverride(body?.mode)
  const resolved = await resolvePreview({
    request,
    reviewItemId,
    requestedRevision: revisionOverride.revision,
    hasRevisionOverride: revisionOverride.hasExplicitOverride,
    requestedMethod: methodOverride.method,
    hasMethodOverride: methodOverride.hasExplicitOverride,
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

  const rawRevision = url.searchParams.get('revision')
  const rawMethod = url.searchParams.get('mode')
  const revisionOverride = parseRevisionOverride(rawRevision)
  const methodOverride = parseMethodOverride(rawMethod)
  const format = url.searchParams.get('format')
  const resolved = await resolvePreview({
    request,
    reviewItemId,
    requestedRevision: revisionOverride.revision,
    hasRevisionOverride: revisionOverride.hasExplicitOverride,
    requestedMethod: methodOverride.method,
    hasMethodOverride: methodOverride.hasExplicitOverride,
  })

  if (resolved.error) {
    return resolved.error
  }

  if (format !== 'ics') {
    return NextResponse.json(resolved.preview, { status: 200 })
  }

  const ics = renderActionCenterReviewInviteIcs({
    draft: resolved.preview,
    method: resolved.preview.method,
    revision: resolved.preview.revision,
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
