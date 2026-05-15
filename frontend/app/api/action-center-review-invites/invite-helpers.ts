import { getActionCenterPageData } from '@/lib/action-center-page-data'
import type { ActionCenterReviewInviteContext } from '@/lib/action-center-review-invite'
import { loadActionCenterReviewRescheduleData } from '@/lib/action-center-review-reschedule-data'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

type ReviewInviteResolverError = {
  status: number
  detail: string
}

type ReviewInviteResolution = {
  context: ActionCenterReviewInviteContext
  orgId: string
  routeScopeValue: string
  routeSourceId: string
  organizerEmail: string
  persistedScheduleDefaults: {
    latestRevision: number | null
    latestOperation: 'reschedule' | 'cancel' | null
    isCanonicalReviewCancelled: boolean
  }
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function toCanonicalOrigin(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) {
    return null
  }

  try {
    return new URL(normalized).origin
  } catch {
    return null
  }
}

function parseScopeValueFromRouteId(routeId: string, campaignId: string) {
  const prefix = `${campaignId}::`
  return routeId.startsWith(prefix) ? routeId.slice(prefix.length) : null
}

function getConfiguredOrigin() {
  return toCanonicalOrigin(
    process.env.FRONTEND_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL,
  )
}

export function getCanonicalInviteOrigin(request: Request) {
  const configuredOrigin = getConfiguredOrigin()
  if (configuredOrigin) {
    return configuredOrigin
  }

  return new URL(request.url).origin
}

function getOrganizerEmail(args: {
  organizationContactEmail: string | null
  userEmail: string | null
}) {
  return args.organizationContactEmail ?? args.userEmail ?? 'noreply@verisight.nl'
}

export async function resolveReviewInviteContext(args: {
  request: Request
  reviewItemId: string
}): Promise<
  | { error: ReviewInviteResolverError }
  | ReviewInviteResolution
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: {
        status: 401,
        detail: 'Niet ingelogd.',
      },
    }
  }

  const suiteAccess = await loadSuiteAccessContext(supabase, user.id)
  if (!suiteAccess.context.canViewActionCenter) {
    return {
      error: {
        status: 403,
        detail: 'Geen toegang tot Action Center.',
      },
    }
  }

  if (!suiteAccess.context.canScheduleActionCenterReview) {
    return {
      error: {
        status: 403,
        detail: 'Geen toegang om reviewuitnodigingen te plannen.',
      },
    }
  }

  const pageData = await getActionCenterPageData({
    context: suiteAccess.context,
    orgMemberships: suiteAccess.orgMemberships,
    currentUserWorkspaceMemberships: suiteAccess.workspaceMemberships,
  })

  const item = pageData.items.find((candidate) => candidate.id === args.reviewItemId)
  if (!item) {
    return {
      error: {
        status: 404,
        detail: 'Reviewmoment niet gevonden.',
      },
    }
  }

  const routeId = normalizeText(item.coreSemantics?.route?.routeId)
  const campaignId = normalizeText(item.coreSemantics?.route?.campaignId)
  const orgId = normalizeText(item.orgId)
  if (!routeId || !campaignId || !orgId) {
    return {
      error: {
        status: 409,
        detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-route-context.',
      },
    }
  }

  const scopeValue = parseScopeValueFromRouteId(routeId, campaignId)
  if (!scopeValue) {
    return {
      error: {
        status: 409,
        detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-route-scope.',
      },
    }
  }

  const admin = createAdminClient()
  const [{ data: campaign, error: campaignError }, { data: organization }, { data: managerMembership }] = await Promise.all([
    admin
      .from('campaigns')
      .select('id, name, scan_type, organization_id')
      .eq('id', campaignId)
      .maybeSingle(),
    admin
      .from('organizations')
      .select('id, name, contact_email')
      .eq('id', orgId)
      .maybeSingle(),
    admin
      .from('action_center_workspace_members')
      .select('login_email, display_name, can_view')
      .eq('org_id', orgId)
      .eq('access_role', 'manager_assignee')
      .eq('scope_value', scopeValue)
      .eq('can_view', true)
      .maybeSingle(),
  ])

  if (campaignError || !campaign?.id) {
    return {
      error: {
        status: 409,
        detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-campaign-context.',
      },
    }
  }

  if (normalizeText(campaign.organization_id) !== orgId) {
    return {
      error: {
        status: 409,
        detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: campaign-org-mismatch.',
      },
    }
  }

  let persistedScheduleDefaults: ReviewInviteResolution['persistedScheduleDefaults'] = {
    latestRevision: null,
    latestOperation: null,
    isCanonicalReviewCancelled: false,
  }
  let effectiveReviewDate = normalizeText(item.reviewDate)

  const persistedSchedule = await loadActionCenterReviewRescheduleData({
    routeId,
    routeScopeValue: scopeValue,
    routeSourceId: campaignId,
    orgId,
  })

  if (persistedSchedule.status === 'missing-canonical-review-truth') {
    return {
      error: {
        status: 409,
        detail:
          'Reviewuitnodiging kan nog niet worden opgebouwd: missing-canonical-review-truth.',
      },
    }
  }

  if (persistedSchedule.status === 'ok') {
    persistedScheduleDefaults = {
      latestRevision: persistedSchedule.latestRevision,
      latestOperation: persistedSchedule.latestOperation,
      isCanonicalReviewCancelled: persistedSchedule.latestOperation === 'cancel',
    }

    effectiveReviewDate =
      normalizeText(persistedSchedule.reviewDate) ??
      normalizeText(persistedSchedule.latestPreviousReviewDate) ??
      normalizeText(item.reviewDate)
  }

  const context: ActionCenterReviewInviteContext = {
    actionCenterOrigin: getCanonicalInviteOrigin(args.request),
    campaignId,
    campaignName: normalizeText(campaign.name) ?? item.sourceLabel,
    managerEmail: normalizeText(managerMembership?.login_email),
    managerName: normalizeText(managerMembership?.display_name),
    phase: 1,
    reviewDate: effectiveReviewDate,
    reviewItemId: item.id,
    routeId,
    routeStatus: item.status,
    scanType: campaign.scan_type,
    scopeLabel: normalizeText(item.teamLabel) ?? 'Onbekende scope',
  }

  return {
    context,
    orgId,
    routeScopeValue: scopeValue,
    routeSourceId: campaignId,
    organizerEmail: getOrganizerEmail({
      organizationContactEmail: normalizeText(organization?.contact_email),
      userEmail: normalizeText(user.email),
    }),
    persistedScheduleDefaults,
  }
}
