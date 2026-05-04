import { redirect } from 'next/navigation'
import { ManagersPageView } from '@/components/dashboard/managers-page-view'
import { getManagersPageData } from '@/lib/managers-page-data'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

export default async function BeheerManagersPage({
  searchParams,
}: {
  searchParams?: Promise<{ manager?: string }>
}) {
  const params = (await searchParams) ?? {}
  const selectedManagerId = typeof params.manager === 'string' ? params.manager : null
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
    workspaceMemberships,
  } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canManageActionCenterAssignments) {
    redirect('/action-center')
  }

  const orgIds = [
    ...new Set([
      ...context.organizationIds,
      ...context.workspaceOrgIds,
      ...orgMemberships.map((membership) => membership.org_id),
      ...workspaceMemberships.map((membership) => membership.org_id),
    ]),
  ]

  const dataClient = createAdminClient()
  const pageData = await getManagersPageData(dataClient, orgIds)

  return <ManagersPageView data={pageData} selectedManagerId={selectedManagerId} />
}
