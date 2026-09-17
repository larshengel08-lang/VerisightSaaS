import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DashboardStateCard } from '@/components/dashboard/dashboard-state-card'
import { ReadOnlyStateCard } from '@/components/dashboard/read-only-state-card'
import { RunningStateCard } from '@/components/dashboard/running-state-card'
import { WelcomeGate } from '@/components/dashboard/welcome-gate'
import { PdfDownloadButton } from './pdf-download-button'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { resolveDashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { isSkippedReminderEvent } from '@/lib/dashboard/reminder-event'
import { normalizeReminderConfig } from '@/lib/launch-controls'
import { readReminderChoice } from '@/lib/campaign-schedule'
import { buildReminderText } from '@/lib/dashboard/reminder-text'
import { isReportReleaseReady } from '@/lib/response-activation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import { CAMPAIGN_SCAN_OPTIONS } from '@/lib/campaign-setup'
import type { CampaignStats } from '@/lib/types'
import { SCAN_TYPE_LABELS } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { context } = await loadSuiteAccessContext(supabase, user.id)
  if (!context.canViewInsights) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen campagnedetail"
        description="Jouw login opent alleen Action Center voor toegewezen teams. Surveyresultaten, campagnedetails en rapporten blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const { data: statsRow, error: statsError } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('campaign_id', id)
    .single()
  // .single() returns PGRST116 when no row matches — that is a genuine 404, not a load failure.
  if (statsError && statsError.code !== 'PGRST116') {
    throw new Error(`Kon campagnedetail niet laden: ${statsError.message}`)
  }
  if (!statsRow) notFound()
  const stats = statsRow as CampaignStats

  const [{ data: campaignMeta }, { data: deliveryRecord }, { data: reminderEvents }, { data: profile }, { data: orgData }, { data: respondentDepts }, { data: membership }, { count: extensionCount }] = await Promise.all([
    supabase.from('campaigns').select('closed_at, closes_at, delivery_mode, comms_mode, public_survey_token, organization_id, segment_departments').eq('id', id).maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, launch_confirmed_at, reminder_config, participant_comms_config, invited_count')
      .eq('campaign_id', id)
      .maybeSingle(),
    supabase
      .from('campaign_action_audit_events')
      .select('created_at, action_key, outcome, metadata')
      .eq('campaign_id', id)
      .eq('action_key', 'send_reminders')
      .eq('outcome', 'completed')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('organizations').select('name').eq('id', stats.organization_id ?? '').maybeSingle(),
    supabase.from('respondents').select('department').eq('campaign_id', id).not('department', 'is', null),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', stats.organization_id ?? '')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('campaign_action_audit_events')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', id)
      .eq('action_key', 'delivery_lifecycle_changed')
      .eq('outcome', 'completed')
      .contains('metadata', { extension: true }),
  ])

  const departmentResponseCounts: Record<string, number> = {}
  for (const r of respondentDepts ?? []) {
    const dept = r.department as string | null
    if (dept) departmentResponseCounts[dept] = (departmentResponseCounts[dept] ?? 0) + 1
  }
  const isAdmin = profile?.is_verisight_admin === true
  // Beheer is voorbehouden aan de eigenaar en aan de Loep-operator
  // (spec 2026-09-11 par. 9); meelezende leden zien de status zonder knoppen.
  const canManage = isAdmin || membership?.role === 'owner'

  const reminderConfig = normalizeReminderConfig(deliveryRecord?.reminder_config ?? null)

  // Bij self_send is total_invited in de stats view 0 (geen pre-aangemaakte respondenten).
  // Gebruik invited_count van het delivery record als noemer wanneer comms_mode = 'self_send'.
  const isSelfSend = campaignMeta?.comms_mode === 'self_send'
  const manualInvitedCount = deliveryRecord?.invited_count ?? null
  const effectiveTotalInvited = isSelfSend && manualInvitedCount != null
    ? manualInvitedCount
    : stats.total_invited
  const effectiveCompletionRatePct = effectiveTotalInvited > 0
    ? Math.round((stats.total_completed / effectiveTotalInvited) * 100)
    : (stats.completion_rate_pct ?? 0)

  // Rapportvrijgave (spec 2026-09-11 par. 4.1): 10 ingevulde vragenlijsten
  // (30 bij culture_assessment). Of de campagne gesloten is, beslist de resolver;
  // daardoor vuurt "Voldoende respons voor een rapport" ook voor culture_assessment.
  const reportReady = isReportReleaseReady(stats.total_completed, {
    scanType: stats.scan_type,
  })

  const state = resolveDashboardState({
    campaign: {
      id: stats.campaign_id,
      name: stats.campaign_name,
      scanType: stats.scan_type,
      isActive: stats.is_active,
      totalInvited: effectiveTotalInvited,
      totalCompleted: stats.total_completed,
      completionRatePct: effectiveCompletionRatePct,
      closedAt: campaignMeta?.closed_at ?? null,
    },
    launchConfirmedAt: deliveryRecord?.launch_confirmed_at ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    closesAt: campaignMeta?.closes_at ?? null,
    reminderConfig,
    reminderAlreadySentAt: reminderEvents?.[0]?.created_at ?? null,
    reminderSkipped: isSkippedReminderEvent(reminderEvents?.[0]),
    extensionCount: extensionCount ?? 0,
    reportReady,
    today: todayIso(),
  })

  const reminderText = buildReminderText({
    commsMode: campaignMeta?.comms_mode ?? null,
    scanType: stats.scan_type,
    scanLabel: SCAN_TYPE_LABELS[stats.scan_type] ?? stats.scan_type,
    organizationName: orgData?.name ?? 'je organisatie',
    publicSurveyToken: (campaignMeta as Record<string, unknown>)?.public_survey_token as string | undefined,
    frontendBaseUrl: process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl',
    segmentDepartments: (campaignMeta as Record<string, unknown>)?.segment_departments as
      | { label: string; slug: string; invited_count?: number }[]
      | null,
    deliveryMode: campaignMeta?.delivery_mode ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
  })

  const scanOption = CAMPAIGN_SCAN_OPTIONS.find((o) => o.value === stats.scan_type)

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
      >
        ← Terug naar dashboard
      </Link>
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-[color:var(--dashboard-ink)]">
          {stats.campaign_name}
        </h2>
        {scanOption ? (
          <span className="text-sm text-[color:var(--dashboard-muted)]">
            {scanOption.title} · {scanOption.short}
          </span>
        ) : null}
      </div>
      {!canManage ? (
        <ReadOnlyStateCard state={state} />
      ) : state.kind === 'setup' ? (
        <WelcomeGate
          campaignId={id}
          scanType={stats.scan_type}
          organizationName={orgData?.name ?? 'je organisatie'}
          publicSurveyToken={(campaignMeta as Record<string, unknown>)?.public_survey_token as string ?? ''}
          frontendBaseUrl={process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl'}
          initialLaunchDate={deliveryRecord?.launch_date ?? null}
          initialInvitedCount={deliveryRecord?.invited_count ?? null}
          initialClosesAt={campaignMeta?.closes_at ?? null}
          initialReminderChoice={readReminderChoice(deliveryRecord?.reminder_config)}
          segmentDepartments={(campaignMeta as Record<string, unknown>)?.segment_departments as
            | { label: string; slug: string; invited_count?: number }[]
            | null}
          departmentResponseCounts={departmentResponseCounts}
        />
      ) : state.kind === 'running' ? (
        <RunningStateCard
          state={state}
          reminderText={reminderText}
          scanLabel={SCAN_TYPE_LABELS[stats.scan_type] ?? stats.scan_type}
        />
      ) : (
        <DashboardStateCard state={state} reminderText={reminderText} />
      )}
      {state.kind === 'report_ready' ? (
        <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <p className="mb-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">
            Je rapport staat klaar
          </p>
          <p className="mb-5 max-w-2xl text-sm leading-6 text-[color:var(--dashboard-text)]">
            Het antwoord staat op pagina twee. De gespreksagenda achterin is de leidraad voor het
            gesprek met je managementteam.
          </p>
          <PdfDownloadButton
            campaignId={stats.campaign_id}
            campaignName={stats.campaign_name}
            scanType={stats.scan_type}
          />
        </div>
      ) : null}
    </div>
  )
}
