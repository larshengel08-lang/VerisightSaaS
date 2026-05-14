import { getActionCenterPageData } from '@/lib/action-center-page-data'
import type { ActionCenterReviewInviteContext } from '@/lib/action-center-review-invite'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

type ReviewInviteResolverError = {
  status: number
  detail: string
}

type ReviewInviteResolution = {
  context: ActionCenterReviewInviteContext
  organizerEmail: string
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function parseScopeValueFromRouteId(routeId: string, campaignId: string) {
  const prefix = `${campaignId}::`
  return routeId.startsWith(prefix) ? routeId.slice(prefix.length) : null
}

function getConfiguredOrigin() {
  return normalizeText(
    process.env.FRONTEND_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL,
  )?.replace(/\/+$/, '') ?? null
}

export function getCanonicalInviteOrigin(request: Request) {
  const configuredOrigin = getConfiguredOrigin()
  if (configuredOrigin) {
    return configuredOrigin
  }

  const forwardedHost = normalizeText(request.headers.get('x-forwarded-host'))
  const forwardedProto = normalizeText(request.headers.get('x-forwarded-proto')) ?? 'https'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
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
      .select('login_email, display_name')
      .eq('org_id', orgId)
      .eq('access_role', 'manager_assignee')
      .eq('scope_value', scopeValue)
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

  const context: ActionCenterReviewInviteContext = {
    actionCenterOrigin: getCanonicalInviteOrigin(args.request),
    campaignId,
    campaignName: normalizeText(campaign.name) ?? item.sourceLabel,
    managerEmail: normalizeText(managerMembership?.login_email),
    managerName: normalizeText(managerMembership?.display_name),
    phase: 1,
    reviewDate: normalizeText(item.reviewDate),
    reviewItemId: item.id,
    routeId,
    routeStatus: item.status,
    scanType: campaign.scan_type,
    scopeLabel: normalizeText(item.teamLabel) ?? 'Onbekende scope',
  }

  return {
    context,
    organizerEmail: getOrganizerEmail({
      organizationContactEmail: normalizeText(organization?.contact_email),
      userEmail: normalizeText(user.email),
    }),
  }
}
