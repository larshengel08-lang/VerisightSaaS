import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardChip, DashboardHero, DashboardPanel, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import {
  getActionCenterOpsEventLabel,
  summarizeActionCenterOpsHealth,
} from '@/lib/action-center-ops-health'
import { countSuiteTelemetryEventRows, getSuiteTelemetryEventLabel } from '@/lib/telemetry/events'
import { listSuiteTelemetryEventRows } from '@/lib/telemetry/store'
import { createClient } from '@/lib/supabase/server'

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

  const rows = await listSuiteTelemetryEventRows()
  const counts = countSuiteTelemetryEventRows(rows)
  const actionCenterOps = summarizeActionCenterOpsHealth(rows)

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

      <DashboardSection
        title="Action Center pilot-ops"
        description="Compacte operations-read voor de kritieke Action Center handoff- en closeoutpaden. Bedoeld als bounded supportlaag, niet als full observability stack."
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <DashboardPanel title="Routes geopend" value={`${actionCenterOps.routeOpenedCount}`} body="Aantal zichtbare route-open events in de huidige evidence set." tone="slate" />
          <DashboardPanel title="Managers toegewezen" value={`${actionCenterOps.ownerAssignedCount}`} body="Eigenaarschap bevestigd via Action Center telemetry." tone="slate" />
          <DashboardPanel title="Reviews gepland" value={`${actionCenterOps.reviewScheduledCount}`} body="Reviewmomenten die operations direct kan terugvinden." tone="emerald" />
          <DashboardPanel title="Closeouts vastgelegd" value={`${actionCenterOps.closeoutRecordedCount}`} body="Routes met expliciet bestuurlijk slot in de huidige evidence." tone="slate" />
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Kritieke flow coverage</h3>
          <p className="mt-3 text-sm text-slate-700">
            {actionCenterOps.coveredEventTypes.length > 0
              ? `${actionCenterOps.coveredEventTypes.map(getActionCenterOpsEventLabel).join(', ')} zichtbaar in de huidige telemetryset.`
              : 'Nog geen Action Center operations-evidence zichtbaar in de huidige telemetryset.'}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {actionCenterOps.missingEventTypes.length > 0
              ? `Nog niet zichtbaar: ${actionCenterOps.missingEventTypes.map(getActionCenterOpsEventLabel).join(', ')}.`
              : 'Alle bounded pilotkritieke Action Center flowstappen zijn minimaal een keer in telemetry terug te lezen.'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Laatste Action Center evidence:{' '}
            {actionCenterOps.latestEventAt
              ? new Date(actionCenterOps.latestEventAt).toLocaleString('nl-NL')
              : 'nog niet aanwezig'}
          </p>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Pilot operationalisering"
        description="Kleine interne readinesslaag voor onboarding, support en go / no-go. Dit vervangt geen productverificatie, maar maakt de pilotmotion wel herhaalbaar."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardPanel
            title="Pilot playbook"
            value="HR + manager"
            body="Compacte uitleg van positioning, onboarding-light en de kritieke supportflow na scantruth."
            tone="slate"
          />
          <DashboardPanel
            title="Readiness checklist"
            value="Go / no-go"
            body="Bounded gate voor browserflows, authority-safe writes, lineage/readback en support/recovery."
            tone="emerald"
          />
          <DashboardPanel
            title="Commercial story"
            value="Post-scan"
            body="Action Center blijft de follow-throughlaag na scanuitkomsten, geen standalone tasking-product."
            tone="slate"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Pilotkritieke flow</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>HR opent een route vanuit de post-scan handoff.</li>
              <li>Manager ziet de open route en kan de bedoelde volgende stap opslaan.</li>
              <li>Reload behoudt de opgeslagen state.</li>
              <li>HR kan closeout, vervolg en lineage daarna nog bestuurlijk teruglezen.</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Pilotdocs</h3>
            <p className="mt-3 text-sm text-slate-700">
              Gebruik deze twee bounded documenten voor onboarding-light, support en go / no-go.
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Action Center pilot playbook</p>
              <p className="rounded-2xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600">
                docs/ops/ACTION_CENTER_PILOT_PLAYBOOK.md
              </p>
              <p className="font-semibold text-slate-900">Action Center pilot readiness checklist</p>
              <p className="rounded-2xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600">
                docs/ops/ACTION_CENTER_PILOT_READINESS_CHECKLIST.md
              </p>
            </div>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Recente evidence"
        description="De laatste bounded telemetryevents uit de live suite. Dit vervangt de oude sampletelling."
      >
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">Org</th>
                <th className="px-5 py-4">Campaign</th>
                <th className="px-5 py-4">Moment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-slate-900">{getSuiteTelemetryEventLabel(row.eventType)}</td>
                  <td className="px-5 py-4 text-slate-600">{row.orgId ?? 'n.v.t.'}</td>
                  <td className="px-5 py-4 text-slate-600">{row.campaignId ?? 'n.v.t.'}</td>
                  <td className="px-5 py-4 text-slate-600">{new Date(row.createdAt).toLocaleString('nl-NL')}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-slate-500" colSpan={4}>
                    Nog geen live suite-telemetryevents. De semireële RU-seed of de eerste bounded trajecten vullen deze healthlaag.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  )
}
