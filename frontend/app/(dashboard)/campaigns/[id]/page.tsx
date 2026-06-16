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
    supabase.from('campaigns').select('closed_at, delivery_mode, comms_mode').eq('id', id).maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('launch_date, launch_confirmed_at, reminder_config, participant_comms_config, invited_count')
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

  // reportReady = "response threshold met". Pass isActive:false so the threshold is
  // checked independent of the live-campaign gate — this lets State 3 "Voldoende respons —
  // sluit de campagne" fire for culture_assessment too (its report releases only on close).
  const reportReady = isDashboardReleaseReady(stats.total_completed, {
    scanType: stats.scan_type,
    isActive: false,
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
        <>
          <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-6">
            <PdfDownloadButton campaignId={stats.campaign_id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
          </div>
          {process.env.NEXT_PUBLIC_CALENDLY_URL ? (
            <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white px-6 py-5">
              <p className="mb-3 text-sm font-semibold text-[color:var(--dashboard-ink)]">
                Volgende stap: managementbespreking
              </p>
              <a
                href={process.env.NEXT_PUBLIC_CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--dashboard-frame-border)] px-4 py-2.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)]"
              >
                Plan de managementbespreking →
              </a>
              <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">
                Kies een moment dat uitkomt voor HR en management.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
