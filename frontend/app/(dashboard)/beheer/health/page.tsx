import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardChip, DashboardHero, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { buildActionCenterTelemetryEvents } from '@/lib/action-center-live'
import { buildSuiteAccessContext, buildSuiteAccessTelemetryEvents } from '@/lib/suite-access'
import { countSuiteTelemetryEvents } from '@/lib/telemetry/events'
import { createClient } from '@/lib/supabase/server'

function getSampleCounts() {
  const managerContext = buildSuiteAccessContext({
    isVerisightAdmin: false,
    orgMemberships: [],
    workspaceMemberships: [
      {
        org_id: 'org-1',
        user_id: 'manager-1',
        display_name: 'Manager Noord',
        login_email: 'manager@example.com',
        access_role: 'manager_assignee',
        scope_type: 'department',
        scope_value: 'sales',
        can_view: true,
        can_update: true,
        can_assign: false,
        can_schedule_review: true,
      },
    ],
  })
  const ownerContext = buildSuiteAccessContext({
    isVerisightAdmin: false,
    orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
    workspaceMemberships: [],
  })

  const events = [
    ...buildSuiteAccessTelemetryEvents({ context: managerContext, actorId: 'manager-1' }),
    ...buildSuiteAccessTelemetryEvents({ context: ownerContext, actorId: 'owner-1' }),
    ...buildActionCenterTelemetryEvents([
      {
        campaign: {
          id: 'campaign-exit',
          organization_id: 'org-1',
          name: 'Exit voorjaar',
          scan_type: 'exit',
          delivery_mode: 'live',
          is_active: true,
          enabled_modules: null,
          created_at: '2026-04-10T10:00:00.000Z',
          closed_at: null,
        },
        stats: null,
        organizationName: 'Acme BV',
        memberRole: 'owner',
        scopeType: 'department',
        scopeValue: 'sales',
        scopeLabel: 'Sales',
        peopleCount: 18,
        assignedManager: null,
        deliveryRecord: {
          id: 'delivery-exit',
          organization_id: 'org-1',
          campaign_id: 'campaign-exit',
          contact_request_id: null,
          lifecycle_stage: 'first_management_use',
          exception_status: 'none',
          operator_owner: 'Verisight delivery',
          next_step: 'Plan de follow-up review.',
          operator_notes: null,
          customer_handoff_note: null,
          launch_date: null,
          launch_confirmed_at: null,
          participant_comms_config: null,
          reminder_config: null,
          first_management_use_confirmed_at: null,
          follow_up_decided_at: null,
          learning_closed_at: null,
          created_at: '2026-04-15T10:00:00.000Z',
          updated_at: '2026-04-24T10:00:00.000Z',
        },
        deliveryCheckpoints: [],
        learningDossier: {
          id: 'dossier-exit',
          organization_id: 'org-1',
          campaign_id: 'campaign-exit',
          contact_request_id: null,
          title: 'Exit follow-through',
          route_interest: 'exitscan',
          scan_type: 'exit',
          delivery_mode: 'live',
          triage_status: 'bevestigd',
          lead_contact_name: null,
          lead_organization_name: null,
          lead_work_email: null,
          lead_employee_count: null,
          buyer_question: null,
          expected_first_value: null,
          buying_reason: null,
          trust_friction: null,
          implementation_risk: null,
          first_management_value: null,
          first_action_taken: null,
          review_moment: '2026-05-12',
          adoption_outcome: null,
          management_action_outcome: null,
          next_route: null,
          stop_reason: null,
          case_evidence_closure_status: 'lesson_only',
          case_approval_status: 'draft',
          case_permission_status: 'not_requested',
          case_quote_potential: 'laag',
          case_reference_potential: 'laag',
          case_outcome_quality: 'indicatief',
          case_outcome_classes: [],
          claimable_observations: null,
          supporting_artifacts: null,
          case_public_summary: null,
          created_by: null,
          updated_by: null,
          created_at: '2026-04-15T10:00:00.000Z',
          updated_at: '2026-04-24T10:00:00.000Z',
        },
        learningCheckpoints: [],
      },
    ]),
  ]

  return countSuiteTelemetryEvents(events)
}

export default async function HealthPage() {
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

  const counts = getSampleCounts()

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Health review"
        title="Suite health evidence"
        description="Compacte healthlaag voor activation, first value, denied access en Action Center follow-through. Geen analytics-stack, wel bounded operations evidence."
        meta={
          <>
            <DashboardChip surface="ops" label={`${counts.owner_access_confirmed} owner access`} tone="emerald" />
            <DashboardChip surface="ops" label={`${counts.manager_denied_insights} denied insights`} tone="amber" />
          </>
        }
        actions={
          <Link
            href="/beheer"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Terug naar beheer
          </Link>
        }
      />

      <DashboardSection title="Kernsignalen" description="Wekelijkse assisted SaaS health review op de minimale signal set.">
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel title="Owner access confirmed" value={`${counts.owner_access_confirmed}`} body="Owner-toegang bevestigd binnen de insights-shell." tone="emerald" />
          <DashboardPanel title="First value confirmed" value={`${counts.first_value_confirmed}`} body="Campaigns die first value hebben bereikt." tone="slate" />
          <DashboardPanel title="First management use confirmed" value={`${counts.first_management_use_confirmed}`} body="Bounded managementgebruik bevestigd." tone="slate" />
          <DashboardPanel title="Manager denied insights" value={`${counts.manager_denied_insights}`} body="Manager-only persona blijft buiten insight-routes." tone="amber" />
          <DashboardPanel title="Action Center review scheduled" value={`${counts.action_center_review_scheduled}`} body="Reviewmomenten die expliciet gepland zijn." tone="slate" />
          <DashboardPanel title="Action Center closeout recorded" value={`${counts.action_center_closeout_recorded}`} body="Follow-through items met expliciete closeout." tone="slate" />
        </div>
      </DashboardSection>
    </div>
  )
}
