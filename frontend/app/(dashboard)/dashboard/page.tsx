// frontend/app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { DashboardStateCard } from '@/components/dashboard/dashboard-state-card'
import { ReadOnlyStateCard } from '@/components/dashboard/read-only-state-card'
import { RunningStateCard } from '@/components/dashboard/running-state-card'
import { WelcomeGate } from '@/components/dashboard/welcome-gate'
import { resolveDashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { isSkippedReminderEvent } from '@/lib/dashboard/reminder-event'
import { normalizeReminderConfig } from '@/lib/launch-controls'
import { readReminderChoice } from '@/lib/campaign-schedule'
import { buildReminderText } from '@/lib/dashboard/reminder-text'
import { isReportReleaseReady } from '@/lib/response-activation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignStats } from '@/lib/types'
import { SCAN_TYPE_LABELS } from '@/lib/types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { context } = await loadSuiteAccessContext(supabase, user.id)
  if (context.managerOnly) redirect('/action-center')

  const { data: stats, error: statsError } = await supabase
    .from('campaign_stats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  if (statsError) throw new Error(`Kon campagne-overzicht niet laden: ${statsError.message}`)

  const campaign = (stats?.[0] as CampaignStats | undefined) ?? null

  if (!campaign) {
    const state = resolveDashboardState({
      campaign: null,
      launchConfirmedAt: null,
      launchDate: null,
      closesAt: null,
      reminderConfig: normalizeReminderConfig(null),
      reminderAlreadySentAt: null,
      reminderSkipped: false,
      extensionCount: 0,
      reportReady: false,
      today: todayIso(),
    })
    return (
      <div className="space-y-8">
        <DashboardStateCard state={state} reminderText="" />
      </div>
    )
  }

  const [
    { data: deliveryRecord },
    { data: reminderEvents },
    { data: campaignRow },
    { data: orgData },
    { data: respondentDepts },
    { data: profile },
    { data: membership },
    { count: extensionCount, error: extensionCountError },
  ] = await Promise.all([
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, launch_confirmed_at, reminder_config, participant_comms_config, invited_count')
      .eq('campaign_id', campaign.campaign_id)
      .maybeSingle(),
    supabase
      .from('campaign_action_audit_events')
      .select('created_at, action_key, outcome, metadata')
      .eq('campaign_id', campaign.campaign_id)
      .eq('action_key', 'send_reminders')
      .eq('outcome', 'completed')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('campaigns')
      .select('delivery_mode, comms_mode, public_survey_token, segment_departments')
      .eq('id', campaign.campaign_id)
      .maybeSingle(),
    supabase
      .from('organizations')
      .select('name')
      .eq('id', campaign.organization_id)
      .maybeSingle(),
    supabase
      .from('respondents')
      .select('department')
      .eq('campaign_id', campaign.campaign_id)
      .not('department', 'is', null),
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('campaign_action_audit_events')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaign.campaign_id)
      .eq('organization_id', campaign.organization_id)
      .eq('action_key', 'delivery_lifecycle_changed')
      .eq('outcome', 'completed')
      .contains('metadata', { extension: true }),
  ])

  // Fail Loud: een mislukte telling mag niet als "nog nooit verlengd" gelezen
  // worden, want dan biedt de kaart verlengen aan op een meting die al op de
  // grens zit.
  if (extensionCountError) {
    throw new Error(`Kon het aantal verlengingen niet laden: ${extensionCountError.message}`)
  }

  // Beheer is voorbehouden aan de eigenaar van de klantomgeving en aan de
  // Loep-operator (spec 2026-09-11 par. 9). Andere leden lezen alleen mee:
  // hun schrijfacties worden server-side toch geweigerd, dus knoppen tonen
  // die altijd falen is misleidend.
  const canManage = profile?.is_verisight_admin === true || membership?.role === 'owner'

  const departmentResponseCounts: Record<string, number> = {}
  for (const r of respondentDepts ?? []) {
    const dept = r.department as string | null
    if (dept) departmentResponseCounts[dept] = (departmentResponseCounts[dept] ?? 0) + 1
  }

  const reminderConfig = normalizeReminderConfig(deliveryRecord?.reminder_config ?? null)

  const isSelfSend = campaignRow?.comms_mode === 'self_send'
  const manualInvitedCount = deliveryRecord?.invited_count ?? null
  const effectiveTotalInvited = isSelfSend && manualInvitedCount != null
    ? manualInvitedCount
    : campaign.total_invited
  // Herbereken het percentage uit dezelfde effectieve noemer als hierboven.
  // De rauwe view-waarde completion_rate_pct rekent op count(respondents)
  // (= gestart), wat bij self_send afwijkt van de handmatige invited_count en
  // een zichzelf-tegensprekend "X van Y (Z%)" opleverde. Gelijk aan de
  // campagnedetailpagina, zodat beide oppervlakken hetzelfde tonen.
  const effectiveCompletionRatePct = effectiveTotalInvited > 0
    ? Math.round((campaign.total_completed / effectiveTotalInvited) * 100)
    : (campaign.completion_rate_pct ?? 0)

  // Rapportvrijgave (spec 2026-09-11 par. 4.1): 10 ingevulde vragenlijsten
  // (30 bij culture_assessment). Of de campagne gesloten is, beslist de resolver.
  const reportReady = isReportReleaseReady(campaign.total_completed, {
    scanType: campaign.scan_type,
  })

  const state = resolveDashboardState({
    campaign: {
      id: campaign.campaign_id,
      name: campaign.campaign_name,
      scanType: campaign.scan_type,
      isActive: campaign.is_active,
      totalInvited: effectiveTotalInvited,
      totalCompleted: campaign.total_completed,
      completionRatePct: effectiveCompletionRatePct,
      closedAt: campaign.closed_at ?? null,
    },
    launchConfirmedAt: deliveryRecord?.launch_confirmed_at ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    closesAt: campaign.closes_at ?? null,
    reminderConfig,
    reminderAlreadySentAt: reminderEvents?.[0]?.created_at ?? null,
    reminderSkipped: isSkippedReminderEvent(reminderEvents?.[0]),
    extensionCount: extensionCount ?? 0,
    reportReady,
    today: todayIso(),
  })

  const reminderText = buildReminderText({
    commsMode: campaignRow?.comms_mode ?? null,
    scanType: campaign.scan_type,
    organizationName: orgData?.name ?? 'je organisatie',
    publicSurveyToken: (campaignRow as Record<string, unknown>)?.public_survey_token as string | undefined,
    frontendBaseUrl: process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl',
    segmentDepartments: (campaignRow as Record<string, unknown>)?.segment_departments as
      | { label: string; slug: string; invited_count?: number }[]
      | null,
    deliveryMode: campaignRow?.delivery_mode ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
  })

  return (
    <div className="space-y-8">
      {!canManage ? (
        <ReadOnlyStateCard state={state} />
      ) : state.kind === 'setup' ? (
        <WelcomeGate
          campaignId={campaign.campaign_id}
          scanType={campaign.scan_type}
          organizationName={orgData?.name ?? 'je organisatie'}
          publicSurveyToken={(campaignRow as Record<string, unknown>)?.public_survey_token as string ?? ''}
          frontendBaseUrl={process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl'}
          initialLaunchDate={deliveryRecord?.launch_date ?? null}
          initialInvitedCount={deliveryRecord?.invited_count ?? null}
          initialClosesAt={campaign.closes_at ?? null}
          initialReminderChoice={readReminderChoice(deliveryRecord?.reminder_config)}
          segmentDepartments={(campaignRow as Record<string, unknown>)?.segment_departments as
            | { label: string; slug: string; invited_count?: number }[]
            | null}
          departmentResponseCounts={departmentResponseCounts}
        />
      ) : state.kind === 'running' ? (
        <RunningStateCard
          state={state}
          reminderText={reminderText}
          scanLabel={SCAN_TYPE_LABELS[campaign.scan_type] ?? campaign.scan_type}
        />
      ) : (
        <DashboardStateCard state={state} reminderText={reminderText} />
      )}
    </div>
  )
}
