import { redirect } from 'next/navigation'
import { ReviewMomentPageClient } from '@/components/dashboard/review-moment-page-client'
import { getActionCenterPageData } from '@/lib/action-center-page-data'
import { getActionCenterReviewRhythmData } from '@/lib/action-center-review-rhythm-data'
import { computeReviewMomentGovernanceCounts } from '@/lib/action-center-review-moments'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

function getReviewOrganizationName(organizationNames: string[]) {
  if (organizationNames.length === 1) {
    return organizationNames[0]
  }

  if (organizationNames.length > 1) {
    return 'Loep organisaties'
  }

  return 'Loep organisatie'
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
  const now = new Date()
  const rhythmData = await getActionCenterReviewRhythmData({
    items: pageData.items,
    now,
  })
  const canManageReviewRhythm =
    context.canUpdateActionCenter && context.canScheduleActionCenterReview

  return (
    <ReviewMomentPageClient
      items={pageData.items}
      governanceCounts={computeReviewMomentGovernanceCounts(pageData.items, now)}
      organizationName={getReviewOrganizationName(pageData.organizationNames)}
      lastUpdated={now.toISOString()}
      canScheduleActionCenterReview={context.canScheduleActionCenterReview}
      inviteDownloadEligibleRouteIds={pageData.inviteDownloadEligibleRouteIds}
      canManageReviewRhythm={canManageReviewRhythm}
      rhythmConfigByRouteId={rhythmData.configByRouteId}
      rhythmSummary={rhythmData.summary}
    />
  )
}
