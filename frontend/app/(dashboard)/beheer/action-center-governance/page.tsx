import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { buildActionCenterTenantAdminSummary } from '@/lib/action-center-enterprise-readback'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export default async function ActionCenterGovernancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    redirect('/dashboard')
  }

  const adminClient = createAdminClient()
  const [
    { data: routeActivationApprovalsRaw },
    { data: supportAccessEventsRaw },
    { data: auditExportRequestsRaw },
  ] = await Promise.all([
    adminClient
      .from('action_center_route_activation_approvals')
      .select('route_family, approval_status, scope_value, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    adminClient
      .from('action_center_support_access_events')
      .select('access_kind, access_reason, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    adminClient
      .from('action_center_audit_export_requests')
      .select('export_scope, request_status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const summary = buildActionCenterTenantAdminSummary({
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
    auditExportRequests: (auditExportRequestsRaw ?? []).map((row) => ({
      exportScope: row.export_scope,
      requestStatus: row.request_status,
      createdAt: row.created_at,
    })),
  })

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Tenant-admin governance"
        title="Action Center governance controls"
        description="Gebruik deze bounded surface om approvals, support-access, export-signalen en de eerste operating rehearsal bij elkaar te houden. Geen generiek admin-center en geen workflowboard."
        meta={
          <>
            <DashboardChip surface="ops" label={`${summary.controlCounts.routeActivationApprovals} approvals`} tone="slate" />
            <DashboardChip surface="ops" label={`${summary.controlCounts.supportAccessEvents} support logs`} tone="amber" />
            <DashboardChip surface="ops" label={`${summary.controlCounts.auditExportRequests} exports`} tone="emerald" />
          </>
        }
        actions={
          <>
            <Link
              href="/beheer/health"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open health review
            </Link>
            <Link
              href="/action-center/executive"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open executive readback
            </Link>
          </>
        }
      />

      <DashboardSection
        title="Control counts"
        description={summary.boundaryNote}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel
            title="Route activation approvals"
            value={`${summary.controlCounts.routeActivationApprovals}`}
            body="Bevestigde activaties voor goedgekeurde routefamilies."
            tone="slate"
          />
          <DashboardPanel
            title="Support access log"
            value={`${summary.controlCounts.supportAccessEvents}`}
            body="Gelogde support-, governance-, privacy- en incidenttoegang."
            tone="amber"
          />
          <DashboardPanel
            title="Audit export summary"
            value={`${summary.controlCounts.auditExportRequests}`}
            body="Aantal bounded exportverzoeken voor governance-readback."
            tone="emerald"
          />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Rehearsal links"
        description="Gebruik deze docs voor de eerste HR/operator-run zonder founder-only uitleg."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardPanel
            title="Open onboarding rehearsal"
            value="First route"
            body="Stapsgewijze eerste route-run voor HR, manager en bounded supportcheck."
            tone="slate"
          />
          <DashboardPanel
            title="Open support scorecard"
            value="Pass / fail"
            body="Compacte scorecard voor support- en governance-signalen tijdens de rehearsal."
            tone="slate"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/beheer/action-center-governance/rehearsal"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Open onboarding rehearsal
          </a>
          <a
            href="/beheer/action-center-governance/rehearsal"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Open support scorecard
          </a>
        </div>
      </DashboardSection>
    </div>
  )
}
