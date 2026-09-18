// frontend/app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { DashboardStateCard } from '@/components/dashboard/dashboard-state-card'
import { ReadOnlyStateCard } from '@/components/dashboard/read-only-state-card'
import { RunningStateCard } from '@/components/dashboard/running-state-card'
import { WelcomeGate } from '@/components/dashboard/welcome-gate'
import { CampaignListSection } from '@/components/dashboard/campaign-list-section'
import { RequestNewMeasurement } from '@/components/dashboard/request-new-measurement'
import { loadAccountOrganizations } from '@/lib/dashboard/account-organization'
import { buildCampaignListItems, pickMainCampaign } from '@/lib/dashboard/campaign-list'
import { loadCampaignStatusContext } from '@/lib/dashboard/campaign-status-context'
import { resolveDashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { isSkippedReminderEvent } from '@/lib/dashboard/reminder-event'
import { completionPct, resolveInvitedDenominator } from '@/lib/dashboard/invited-denominator'
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
  if (statsError) throw new Error(`Kon campagne-overzicht niet laden: ${statsError.message}`)

  // Alle metingen (spec 2026-09-16 par. 6.1): de nieuwste actieve is de
  // hoofdkaart; de rest staat in de lijst eronder. Vóór dit plan koos limit(1)
  // blind de nieuwste en was een nog in te richten meting onvindbaar.
  const campaigns = (stats ?? []) as CampaignStats[]
  const campaign = pickMainCampaign(campaigns)

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
    // Zonder meting is er geen campagne-organisatie; de naam komt dan van het
    // account. Lukt dat niet, dan staat er "organisatie niet bekend" in de mail.
    const account = await loadAccountOrganizations(supabase, user.id)
    if (account.error) console.warn(`[dashboard] Organisatienaam van het account niet geladen: ${account.error}`)
    return (
      <div className="space-y-8">
        <DashboardStateCard state={state} reminderText="" />
        <RequestNewMeasurement variant="first" organizationName={account.names[0] ?? null} />
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

  // Eén noemer overal (spec 2026-09-16 par. 6.2, zelfde regel als /reports en
  // het rapport): invited_count uit het delivery record; respondentrijen alleen
  // als die er méér zijn; anders 0 en geen percentage. Nooit een verzonnen noemer.
  const denominator = resolveInvitedDenominator({
    invitedCount: deliveryRecord?.invited_count ?? null,
    respondentRows: campaign.total_invited,
  })
  const effectiveTotalInvited = denominator.known ? denominator.value : 0
  // De ?? 0 is alleen bereikbaar zonder noemer. Dan is effectiveTotalInvited 0:
  // een lopende meting valt in de setup-staat (gelanceerd vereist een noemer > 0)
  // en de gesloten staten tonen geen percentage. Render deze 0 dus nooit als percentage.
  const effectiveCompletionRatePct = completionPct(campaign.total_completed, denominator) ?? 0

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
    closesAt: campaign.closes_at ?? null,
    participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
  })

  // De lijst gebruikt dezelfde statusvocabulaire als /reports en is met een
  // pariteitstest aan de resolver vastgeklonken; ze kan dus niet iets anders
  // zeggen dan de kaart hierboven.
  const statusContext =
    campaigns.length > 1
      ? await loadCampaignStatusContext(supabase, campaigns.map((c) => c.campaign_id), todayIso())
      : null
  const listItems = statusContext ? buildCampaignListItems(campaigns, statusContext, campaign.campaign_id) : []

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
      {campaigns.length > 1 ? (
        <CampaignListSection items={listItems} />
      ) : null}
      <RequestNewMeasurement variant="follow_up" organizationName={orgData?.name ?? null} />
    </div>
  )
}
