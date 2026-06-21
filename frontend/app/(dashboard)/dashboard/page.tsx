// frontend/app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { DashboardStateCard } from '@/components/dashboard/dashboard-state-card'
import { SetupWizardCard } from '@/components/dashboard/setup-wizard-card'
import { resolveDashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { normalizeReminderConfig, buildParticipantCommunicationPreview } from '@/lib/launch-controls'
import { isDashboardReleaseReady } from '@/lib/response-activation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignStats } from '@/lib/types'

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
      reportReady: false,
      today: todayIso(),
    })
    return (
      <div className="space-y-8">
        <DashboardStateCard state={state} reminderText="" />
      </div>
    )
  }

  const [{ data: deliveryRecord }, { data: reminderEvents }, { data: campaignRow }, { data: orgData }] = await Promise.all([
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, launch_confirmed_at, reminder_config, participant_comms_config, invited_count')
      .eq('campaign_id', campaign.campaign_id)
      .maybeSingle(),
    supabase
      .from('campaign_action_audit_events')
      .select('created_at, action_key, outcome')
      .eq('campaign_id', campaign.campaign_id)
      .eq('action_key', 'send_reminders')
      .eq('outcome', 'completed')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('campaigns')
      .select('delivery_mode, comms_mode, public_survey_token')
      .eq('id', campaign.campaign_id)
      .maybeSingle(),
    supabase
      .from('organizations')
      .select('name')
      .eq('id', campaign.organization_id)
      .maybeSingle(),
  ])

  const reminderConfig = normalizeReminderConfig(deliveryRecord?.reminder_config ?? null)

  const isSelfSend = campaignRow?.comms_mode === 'self_send'
  const manualInvitedCount = deliveryRecord?.invited_count ?? null
  const effectiveTotalInvited = isSelfSend && manualInvitedCount != null
    ? manualInvitedCount
    : campaign.total_invited

  const reportReady = isDashboardReleaseReady(campaign.total_completed, {
    scanType: campaign.scan_type,
    isActive: false,
  })

  const state = resolveDashboardState({
    campaign: {
      id: campaign.campaign_id,
      name: campaign.campaign_name,
      scanType: campaign.scan_type,
      isActive: campaign.is_active,
      totalInvited: effectiveTotalInvited,
      totalCompleted: campaign.total_completed,
      completionRatePct: campaign.completion_rate_pct ?? 0,
      closedAt: campaign.closed_at ?? null,
    },
    launchConfirmedAt: deliveryRecord?.launch_confirmed_at ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    closesAt: campaign.closes_at ?? null,
    reminderConfig,
    reminderAlreadySentAt: reminderEvents?.[0]?.created_at ?? null,
    reportReady,
    today: todayIso(),
  })

  const reminderPreview = buildParticipantCommunicationPreview({
    scanType: campaign.scan_type,
    deliveryMode: campaignRow?.delivery_mode ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
  })
  const reminderText = `${reminderPreview.subject}\n\n${reminderPreview.body.join('\n\n')}`

  return (
    <div className="space-y-8">
      {state.kind === 'setup' ? (
        <SetupWizardCard
          campaignId={campaign.campaign_id}
          scanType={campaign.scan_type}
          organizationName={orgData?.name ?? 'je organisatie'}
          publicSurveyToken={(campaignRow as Record<string, unknown>)?.public_survey_token as string ?? ''}
          frontendBaseUrl={process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://getloep.nl'}
          initialLaunchDate={deliveryRecord?.launch_date ?? null}
          initialInvitedCount={deliveryRecord?.invited_count ?? null}
        />
      ) : (
        <DashboardStateCard state={state} reminderText={reminderText} />
      )}
    </div>
  )
}
