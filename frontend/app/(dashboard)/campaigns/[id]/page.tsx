import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DashboardStateCard } from '@/components/dashboard/dashboard-state-card'
import { PdfDownloadButton } from './pdf-download-button'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import { resolveDashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { normalizeReminderConfig, buildParticipantCommunicationPreview } from '@/lib/launch-controls'
import { isDashboardReleaseReady } from '@/lib/response-activation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignStats } from '@/lib/types'

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

  const [{ data: campaignMeta }, { data: deliveryRecord }, { data: reminderEvents }] = await Promise.all([
    supabase.from('campaigns').select('closed_at, delivery_mode').eq('id', id).maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, launch_confirmed_at, reminder_config, participant_comms_config')
      .eq('campaign_id', id)
      .maybeSingle(),
    supabase
      .from('campaign_action_audit_events')
      .select('created_at, action_key, outcome')
      .eq('campaign_id', id)
      .eq('action_key', 'send_reminders')
      .eq('outcome', 'completed')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const reminderConfig = normalizeReminderConfig(deliveryRecord?.reminder_config ?? null)
  const reportReady = isDashboardReleaseReady(stats.total_completed, {
    scanType: stats.scan_type,
    isActive: stats.is_active,
  })

  const state = resolveDashboardState({
    campaign: {
      id: stats.campaign_id,
      name: stats.campaign_name,
      scanType: stats.scan_type,
      isActive: stats.is_active,
      totalInvited: stats.total_invited,
      totalCompleted: stats.total_completed,
      completionRatePct: stats.completion_rate_pct ?? 0,
      closedAt: campaignMeta?.closed_at ?? null,
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
    scanType: stats.scan_type,
    deliveryMode: campaignMeta?.delivery_mode ?? null,
    launchDate: deliveryRecord?.launch_date ?? null,
    participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
  })
  const reminderText = `${reminderPreview.subject}\n\n${reminderPreview.body.join('\n\n')}`

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
      >
        ← Terug naar dashboard
      </Link>
      <DashboardStateCard state={state} reminderText={reminderText} />
      {state.kind === 'report_ready' ? (
        <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
          <PdfDownloadButton campaignId={stats.campaign_id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
        </div>
      ) : null}
    </div>
  )
}
