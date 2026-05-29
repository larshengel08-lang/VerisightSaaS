import { redirect } from 'next/navigation'
import { ReviewMomentPageClient } from '@/components/dashboard/review-moment-page-client'
import { loadActionCenterGraphCapability } from '@/lib/action-center-graph-client'
import { getActionCenterPageData } from '@/lib/action-center-page-data'
import { resolveActionCenterReviewRhythmWriteAccess } from '@/lib/action-center-governance'
import { getActionCenterReviewRhythmData } from '@/lib/action-center-review-rhythm-data'
import {
  getActionCenterEnabledRouteDefaults,
  isActionCenterRouteDefaultsProviderEligibleScanType,
} from '@/lib/action-center-route-defaults'
import { computeReviewMomentGovernanceCounts } from '@/lib/action-center-review-moments'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

function getReviewOrganizationName(organizationNames: string[]) {
  if (organizationNames.length === 1) {
    return organizationNames[0]
  }

  if (organizationNames.length > 1) {
    return 'Loep organisaties'
  }

  return 'Loep organisatie'
}

function getRouteScopeValue(item: Pick<ActionCenterPreviewItem, 'coreSemantics'>) {
  const routePrefix = `${item.coreSemantics.route.campaignId}::`
  const routeId = item.coreSemantics.route.routeId

  if (!routeId.startsWith(routePrefix)) {
    return null
  }

  return routeId.slice(routePrefix.length)
}

function getNativeCalendarEligibleRouteIds(args: {
  items: ActionCenterPreviewItem[]
  routeScanTypeByRouteId: Record<string, string>
}) {
  return args.items.flatMap((item) => {
    const routeId = item.coreSemantics.route.routeId
    const scanType = args.routeScanTypeByRouteId[routeId]

    if (!item.orgId || !isActionCenterRouteDefaultsProviderEligibleScanType(scanType)) {
      return []
    }

    const capability = loadActionCenterGraphCapability({
      orgId: item.orgId,
      scanType,
    })

    return capability.mode === 'graph-enabled' ? [routeId] : []
  })
}

export default async function ActionCenterReviewmomentenPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    context,
    orgMemberships,
    workspaceMemberships: currentUserWorkspaceMemberships,
  } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewActionCenter) {
    redirect('/dashboard')
  }

  const orgIds = [...new Set([...context.organizationIds, ...context.workspaceOrgIds])]

  if (orgIds.length === 0 && !context.isVerisightAdmin) {
    redirect('/dashboard')
  }

  const pageData = await getActionCenterPageData({
    context,
    orgMemberships,
    currentUserWorkspaceMemberships,
  })
  const reviewMomentItems = pageData.items.filter((item) =>
    getActionCenterEnabledRouteDefaults(pageData.routeScanTypeByRouteId[item.coreSemantics.route.routeId]),
  )
  const now = new Date()
  const rhythmData = await getActionCenterReviewRhythmData({
    items: reviewMomentItems,
    now,
    routeScanTypeByRouteId: pageData.routeScanTypeByRouteId,
  })
  const manageableReviewRhythmRouteIds = reviewMomentItems.flatMap((item) => {
    const routeId = item.coreSemantics.route.routeId
    const scanType = pageData.routeScanTypeByRouteId[routeId]

    if (!item.orgId || !getActionCenterEnabledRouteDefaults(scanType)) {
      return []
    }

    const routeScopeValue = getRouteScopeValue(item)
    if (!routeScopeValue) {
      return []
    }

    const access = resolveActionCenterReviewRhythmWriteAccess({
      context,
      orgMemberships,
      workspaceMemberships: currentUserWorkspaceMemberships,
      orgId: item.orgId,
      routeScopeValue,
    })

    return access.allowed ? [routeId] : []
  })
  const nativeCalendarEligibleRouteIds = getNativeCalendarEligibleRouteIds({
    items: reviewMomentItems,
    routeScanTypeByRouteId: pageData.routeScanTypeByRouteId,
  })

  return (
    <ReviewMomentPageClient
      items={reviewMomentItems}
      governanceCounts={computeReviewMomentGovernanceCounts(reviewMomentItems, now)}
      organizationName={getReviewOrganizationName(pageData.organizationNames)}
      lastUpdated={now.toISOString()}
      canScheduleActionCenterReview={context.canScheduleActionCenterReview}
      inviteDownloadEligibleRouteIds={pageData.inviteDownloadEligibleRouteIds}
      routeScanTypeByRouteId={pageData.routeScanTypeByRouteId}
      manageableReviewRhythmRouteIds={manageableReviewRhythmRouteIds}
      nativeCalendarEligibleRouteIds={nativeCalendarEligibleRouteIds}
      rhythmConfigByRouteId={rhythmData.configByRouteId}
      oversightSummary={rhythmData.oversight.summary}
      oversightAttentionItems={rhythmData.oversight.attentionItems}
    />
  )
}
