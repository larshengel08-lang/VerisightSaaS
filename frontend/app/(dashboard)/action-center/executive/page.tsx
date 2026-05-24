import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { buildActionCenterExecutiveReadback } from '@/lib/action-center-enterprise-readback'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

export default async function ActionCenterExecutivePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewExecutiveReadback) {
    redirect('/action-center')
  }

  const orgIds = [...new Set([...context.organizationIds, ...context.workspaceOrgIds])]
  const adminClient = createAdminClient()
  const [
    { data: campaignsRaw },
    { data: routeCloseoutsRaw },
    { data: routeActivationApprovalsRaw },
    { data: supportAccessEventsRaw },
  ] = await Promise.all([
    orgIds.length > 0
      ? adminClient
          .from('campaigns')
          .select('id, created_at, scan_type')
          .in('organization_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? adminClient
          .from('action_center_route_closeouts')
          .select('route_id, closeout_status')
          .in('org_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? adminClient
          .from('action_center_route_activation_approvals')
          .select('route_family, approval_status, scope_value, created_at')
          .in('org_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? adminClient
          .from('action_center_support_access_events')
          .select('access_kind, access_reason, created_at')
          .in('org_id', orgIds)
      : Promise.resolve({ data: [] }),
  ])

  const campaigns = (campaignsRaw ?? []).filter((campaign) =>
    campaign.scan_type === 'exit' || campaign.scan_type === 'retention',
  )
  const routeCloseouts = routeCloseoutsRaw ?? []
  const now = Date.now()
  const staleRouteCount = campaigns.filter((campaign) => {
    const ageInDays = (now - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return ageInDays >= 45
  }).length

  const executiveReadback = buildActionCenterExecutiveReadback({
    routeActivationApprovals: (routeActivationApprovalsRaw ?? []).map((row) => ({
      routeFamily: row.route_family,
      approvalStatus: row.approval_status,
      scopeValue: row.scope_value,
      createdAt: row.created_at,
    })),
    supportAccessEvents: (supportAccessEventsRaw ?? []).map((row) => ({
      accessKind: row.access_kind,
      accessReason: row.access_reason,
      createdAt: row.created_at,
    })),
    openRouteCount: campaigns.length,
    staleRouteCount,
    closeoutReadyRouteCount: routeCloseouts.filter((row) => row.closeout_status === 'afgerond').length,
  })

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Executive readback"
        title="Bestuurlijke follow-through readback"
        description="Lees hier alleen ritme, review, closeout en governance-signalen terug. Geen impactclaim, geen manager-ranking en geen personeelsdossier."
        meta={
          <>
            <DashboardChip surface="ops" label={`${executiveReadback.summaryRows[0]?.value ?? 0} open routes`} tone="slate" />
            <DashboardChip surface="ops" label={`${executiveReadback.summaryRows[2]?.value ?? 0} closeout-ready`} tone="emerald" />
          </>
        }
        actions={
          <Link
            href="/action-center"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Terug naar Action Center
          </Link>
        }
      />

      <DashboardSection
        title="Bestuurlijke signalen"
        description={executiveReadback.operatingBoundaryNote}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {executiveReadback.summaryRows.map((row) => (
            <DashboardPanel
              key={row.label}
              title={row.label}
              value={`${row.value}`}
              body={row.label === 'Route activation approvals' ? 'Route activation approvals binnen goedgekeurde routefamilies.' : 'Read-only bestuurlijke telling voor follow-through.'}
              tone={row.label === 'Closeout-ready routes' ? 'emerald' : 'slate'}
            />
          ))}
        </div>
      </DashboardSection>
    </div>
  )
}
