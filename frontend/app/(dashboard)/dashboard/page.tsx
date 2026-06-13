// frontend/app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { DashboardStateCard } from '@/components/dashboard/dashboard-state-card'
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

  const [{ data: deliveryRecord }, { data: reminderEvents }, { data: campaignRow }] = await Promise.all([
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, launch_confirmed_at, reminder_config, participant_comms_config')
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
      .select('delivery_mode')
      .eq('id', campaign.campaign_id)
      .maybeSingle(),
  ])

  const reminderConfig = normalizeReminderConfig(deliveryRecord?.reminder_config ?? null)
  // reportReady = "response threshold met". Pass isActive:false so the threshold is
  // checked independent of the live-campaign gate — this lets State 3 "Voldoende respons —
  // sluit de campagne" fire for culture_assessment too (its report releases only on close).
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
      totalInvited: campaign.total_invited,
      totalCompleted: campaign.total_completed,
      completionRatePct: campaign.completion_rate_pct ?? 0,
      closedAt: null,
    },
    launchConfirmedAt: deliveryRecord?.launch_confirmed_at ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    closesAt: null,
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
      <DashboardStateCard state={state} reminderText={reminderText} />
    </div>
  )
}
