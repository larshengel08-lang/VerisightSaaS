import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CustomerLaunchControl } from '@/components/dashboard/customer-launch-control'
import { OnboardingBalloon } from '@/components/dashboard/onboarding-balloon'
import {
  DashboardChip,
  DashboardSection,
  InfoTooltip,
  SignalStatCard,
} from '@/components/dashboard/dashboard-primitives'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { PdfDownloadButton } from '@/app/(dashboard)/campaigns/[id]/pdf-download-button'
import {
  getCampaignCompositionState,
  HOME_STATE_ORDER,
  isManagementVisibleState,
  isRecommendationReadyState,
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
import {
  buildBridgeAssessmentTruth,
  getHrBridgePresentation,
  resolveHrBridgeState,
} from '@/lib/dashboard/hr-bridge-state'
import {
  canOpenActionCenterRoute,
  hasOpenedActionCenterRoute,
} from '@/lib/dashboard/open-action-center-route'
import {
  normalizeDashboardPortfolioView,
  type DashboardPortfolioView,
} from '@/lib/dashboard/shell-navigation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import { buildGuidedSelfServeState, deriveGuidedSelfServeDiscipline } from '@/lib/guided-self-serve'
import { FIRST_INSIGHT_THRESHOLD } from '@/lib/response-activation'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'

type CampaignHomeEntry = {
  campaign: CampaignStats
  state: CampaignCompositionState
  invitesNotSent: number
}

type CampaignGroup = {
  key: CampaignCompositionState
  title: string
  description: string
  entries: CampaignHomeEntry[]
}

type PortfolioBucket = {
  key: DashboardPortfolioView
  label: string
  groups: CampaignGroup[]
  entries: CampaignHomeEntry[]
}

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedPortfolioView = normalizeDashboardPortfolioView(
    typeof resolvedSearchParams?.view === 'string' ? resolvedSearchParams.view : undefined,
  )
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { context, profile } = await loadSuiteAccessContext(supabase, user.id)
  if (context.managerOnly) redirect('/action-center')

  const isAdmin = profile?.is_verisight_admin === true

  const { data: stats } = await supabase.from('campaign_stats').select('*').order('created_at', { ascending: false })

  const campaigns = (stats ?? []) as CampaignStats[]
  const activeCampaigns = campaigns.filter((campaign) => campaign.is_active)
  const campaignIds = campaigns.map((campaign) => campaign.campaign_id)
  const { data: respondentStateRowsRaw } =
    campaignIds.length > 0
      ? await supabase
          .from('respondents')
          .select('campaign_id, sent_at, completed')
          .in('campaign_id', campaignIds)
      : { data: [] }
  const respondentStateRows = (respondentStateRowsRaw ?? []) as Array<{
    campaign_id: string
    sent_at: string | null
    completed: boolean
  }>
  const invitesNotSentByCampaign = buildInvitesNotSentByCampaign(campaigns, respondentStateRows)
  const campaignEntries = campaigns.map((campaign) => ({
    campaign,
    invitesNotSent: invitesNotSentByCampaign.get(campaign.campaign_id) ?? 0,
    state: getCampaignCompositionState({
      isActive: campaign.is_active,
      totalInvited: campaign.total_invited,
      totalCompleted: campaign.total_completed,
      invitesNotSent: invitesNotSentByCampaign.get(campaign.campaign_id) ?? 0,
      incompleteScores: 0,
      hasMinDisplay: campaign.total_completed >= 5,
      hasEnoughData: campaign.total_completed >= 10,
    }),
  }))
  const groups = groupCampaigns(campaignEntries)
  const portfolioBuckets = buildPortfolioBuckets(groups)
  const primaryGuideEntry = getPrimaryGuideCampaign(campaignEntries)
  const primaryGuideCampaign = primaryGuideEntry?.campaign ?? null
  const primaryGuideInvitesNotSent = primaryGuideEntry?.invitesNotSent ?? 0
  const primaryGuideStateMeta = primaryGuideEntry ? getHomeStateMeta(primaryGuideEntry.state) : null
  const primaryFirstNextStepCampaign = getPrimaryFirstNextStepCampaign(activeCampaigns, campaigns)
  const { data: primaryGuideDeliveryRecord } = primaryGuideCampaign
    ? await supabase
        .from('campaign_delivery_records')
        .select('id, lifecycle_stage, first_management_use_confirmed_at')
        .eq('campaign_id', primaryGuideCampaign.campaign_id)
        .maybeSingle()
    : { data: null }
  const { data: primaryGuideCheckpointsRaw } = primaryGuideDeliveryRecord
    ? await supabase
        .from('campaign_delivery_checkpoints')
        .select('checkpoint_key, manual_state')
        .eq('delivery_record_id', primaryGuideDeliveryRecord.id)
    : { data: [] }
  const primaryGuideSetupDiscipline = deriveGuidedSelfServeDiscipline(
    ((primaryGuideCheckpointsRaw ?? []) as Array<{
      checkpoint_key: 'implementation_intake' | 'import_qa' | 'invite_readiness'
      manual_state: 'pending' | 'confirmed' | 'not_applicable'
    }>).map((checkpoint) => ({
      checkpointKey: checkpoint.checkpoint_key,
      manualState: checkpoint.manual_state,
    })),
  )
  const avgResponse =
    campaigns.length > 0
      ? Math.round(campaigns.reduce((sum, campaign) => sum + (campaign.completion_rate_pct ?? 0), 0) / campaigns.length)
      : 0
  const campaignsWithSignal = campaigns.filter((campaign) => campaign.avg_risk_score !== null)
  const avgSignal =
    campaignsWithSignal.length > 0
      ? (
          campaignsWithSignal.reduce((sum, campaign) => sum + (campaign.avg_risk_score ?? 0), 0) /
          campaignsWithSignal.length
        ).toFixed(1)
      : null
  const fullCount = campaignEntries.filter((entry) => entry.state === 'full').length
  const partialCount = campaignEntries.filter((entry) => entry.state === 'partial').length
  const activeExecutionCount = campaignEntries.filter((entry) =>
    ['setup', 'ready_to_launch', 'running', 'sparse'].includes(entry.state),
  ).length
  const closedCount = campaignEntries.filter((entry) => entry.state === 'closed').length
  const managementReadyCount = fullCount + partialCount
  const primaryExecutionState = primaryGuideCampaign
    ? buildGuidedSelfServeState({
        isActive: primaryGuideCampaign.is_active,
        totalInvited: primaryGuideCampaign.total_invited,
        totalCompleted: primaryGuideCampaign.total_completed,
        invitesNotSent: primaryGuideInvitesNotSent,
        hasMinDisplay: primaryGuideCampaign.total_completed >= 5,
        hasEnoughData: primaryGuideCampaign.total_completed >= 10,
        importQaConfirmed: primaryGuideSetupDiscipline.importQaConfirmed,
        launchTimingConfirmed: primaryGuideSetupDiscipline.launchTimingConfirmed,
        communicationReady: primaryGuideSetupDiscipline.communicationReady,
      })
    : null
  const primaryGuideScanDefinition = primaryGuideCampaign ? getScanDefinition(primaryGuideCampaign.scan_type) : null
  const primaryOverviewCampaign = primaryFirstNextStepCampaign ?? primaryGuideCampaign
  const primaryOverviewEntry = primaryOverviewCampaign
    ? campaignEntries.find((entry) => entry.campaign.campaign_id === primaryOverviewCampaign.campaign_id) ?? null
    : null
  const primaryOverviewStateMeta = primaryOverviewEntry ? getHomeStateMeta(primaryOverviewEntry.state) : null
  const leadCampaign = primaryGuideCampaign ?? primaryOverviewCampaign
  const leadCampaignEntry = leadCampaign
    ? campaignEntries.find((entry) => entry.campaign.campaign_id === leadCampaign.campaign_id) ?? null
    : null
  const leadCampaignCompositionState = leadCampaignEntry?.state ?? null
  const leadCampaignStateMeta = leadCampaignEntry ? getHomeStateMeta(leadCampaignEntry.state) : null
  const { data: leadCampaignDeliveryRecord } =
    leadCampaign && leadCampaign.campaign_id !== primaryGuideCampaign?.campaign_id
      ? await supabase
          .from('campaign_delivery_records')
          .select('id, lifecycle_stage, first_management_use_confirmed_at')
          .eq('campaign_id', leadCampaign.campaign_id)
          .maybeSingle()
      : { data: primaryGuideDeliveryRecord ?? null }
  const leadCampaignRouteEntryStage =
    leadCampaignDeliveryRecord && hasOpenedActionCenterRoute(leadCampaignDeliveryRecord) ? 'active' : null
  const leadCampaignRouteOpenable =
    leadCampaignDeliveryRecord ? canOpenActionCenterRoute(leadCampaignDeliveryRecord) : false
  const leadCampaignBridgeAssessment =
    leadCampaign && leadCampaignCompositionState
      ? buildBridgeAssessmentTruth({
          sourceType: 'campaign',
          sourceId: leadCampaign.campaign_id,
          signalReadable: isManagementVisibleState(leadCampaignCompositionState),
          managementMeaningClear: isRecommendationReadyState(leadCampaignCompositionState),
          plausibleFollowUpExists:
            isRecommendationReadyState(leadCampaignCompositionState) && leadCampaignRouteOpenable,
          assessedAt: leadCampaign.created_at,
        })
      : null
  const leadBridgeState = leadCampaignBridgeAssessment
    ? resolveHrBridgeState({
        routeEntryStage: leadCampaignRouteEntryStage,
        assessment: leadCampaignBridgeAssessment,
      })
    : null
  const leadBridgePresentation = leadBridgeState
    ? getHrBridgePresentation({
        bridgeState: leadBridgeState,
        surface: 'overview',
      })
    : null
  const leadBridgeStatusLabel =
    leadBridgePresentation?.label === 'Actieve opvolging'
      ? 'Actieve opvolging'
      : leadBridgePresentation?.label ?? null
  const leadBridgeCtaLabel =
    leadBridgePresentation?.ctaLabel === 'Beoordeel opvolging'
      ? 'Beoordeel opvolging'
      : leadBridgePresentation?.ctaLabel ?? null
  const leadCampaignScanDefinition = leadCampaign ? getScanDefinition(leadCampaign.scan_type) : null
  const overviewFocusItems = buildOverviewFocusItems({
    isAdmin,
    primaryOverviewCampaign,
    primaryOverviewStateMeta,
    primaryGuideCampaign,
    primaryExecutionState,
    managementReadyCount,
    activeExecutionCount,
    closedCount,
  })
  const portfolioTabs = portfolioBuckets
    .filter((bucket) => bucket.entries.length > 0)
    .map((bucket) => {
      const firstEntryId = bucket.entries[0]?.campaign.campaign_id

      return {
        id: bucket.key,
        label: bucket.label,
        content: (
          <div className="space-y-5">
            {bucket.groups.map((group) => (
              <section key={group.key} className="space-y-3">
                {bucket.groups.length > 1 ? (
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--dashboard-frame-border)]/75 pb-3">
                    <div>
                      <p className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">{group.title}</p>
                      <p className="mt-1.5 max-w-3xl text-sm leading-[1.7] text-[color:var(--dashboard-text)]">{group.description}</p>
                    </div>
                    <DashboardChip label={getHomeStateMeta(group.key).label} tone={getHomeStateMeta(group.key).tone} />
                  </div>
                ) : null}
                <div className="space-y-3">
                  {group.entries.map((entry) => (
                    <CampaignRow
                      key={entry.campaign.campaign_id}
                      entry={entry}
                      showOnboarding={!isAdmin && bucket.key === 'ready' && entry.campaign.campaign_id === firstEntryId}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ),
      }
    })
  const portfolioView = portfolioTabs.some((tab) => tab.id === requestedPortfolioView)
    ? requestedPortfolioView
    : portfolioTabs[0]?.id ?? 'ready'

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="max-w-[72rem]">
          <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
            <span>{isAdmin ? 'Campagneoverzicht' : 'Overzicht'}</span>
            <span className="h-1 w-1 rounded-full bg-[color:var(--dashboard-accent-soft-border)]" />
            <span>{leadCampaignScanDefinition?.productName ?? 'Dashboard'}</span>
            {leadCampaignStateMeta ? <DashboardChip label={leadCampaignStateMeta.label} tone={leadCampaignStateMeta.tone} /> : null}
          </div>
          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.22fr),minmax(270px,0.78fr)] xl:items-end">
            <div>
              <h1 className="max-w-[14ch] font-display text-[clamp(2.65rem,5vw,4.5rem)] leading-[0.96] text-[color:var(--dashboard-ink)]">
                {isAdmin
                  ? 'Wat nu als eerste bestuurlijke aandacht vraagt.'
                  : managementReadyCount > 0
                    ? 'Wat nu het managementgesprek opent.'
                    : 'Wat nu eerst aandacht vraagt in de uitvoering.'}
              </h1>
              <p className="mt-5 max-w-[48rem] text-[1.02rem] leading-[1.9] text-[color:var(--dashboard-text)]">
                {isAdmin
                  ? `${campaigns.length} campagne${campaigns.length === 1 ? '' : 's'}, geordend op leesbaarheid, uitvoering en rapportmoment.`
                  : primaryOverviewCampaign
                    ? getOverviewHeadline({
                        campaign: primaryOverviewCampaign,
                        stateMeta: primaryOverviewStateMeta,
                        isAdmin,
                        avgSignal,
                      })
                    : 'Zodra de eerste campagne leesbaar wordt, opent hier automatisch het eerste overzicht.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <OverviewSummaryNote
                label="Portfolio"
                value={`${campaigns.length} campagne${campaigns.length === 1 ? '' : 's'}`}
                body={`${managementReadyCount} klaar voor bespreking, ${activeExecutionCount} in uitvoering.`}
              />
              <OverviewSummaryNote
                label="Eerste overzicht"
                value={leadCampaign ? leadCampaign.campaign_name : 'Nog in opbouw'}
                body={
                  leadCampaignStateMeta
                    ? `${leadCampaignStateMeta.nextStepLabel}. ${leadCampaignStateMeta.trust}`
                    : 'Het eerste overzicht verschijnt hier zodra er genoeg respons is om eerlijk te kunnen lezen.'
                }
                footer={
                  leadCampaign &&
                  leadBridgeState &&
                  leadBridgeStatusLabel &&
                  leadBridgeCtaLabel ? (
                    <div className="mt-3 flex items-center gap-3 text-sm text-[#5e6b78]">
                      <span className="rounded-full border border-[#ddd3c7] bg-[#fbf8f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7d6b]">
                        {leadBridgeStatusLabel}
                      </span>
                      <Link href={leadBridgeState === 'active' ? '/action-center' : `/campaigns/${leadCampaign.campaign_id}`}>
                        {leadBridgeCtaLabel}
                      </Link>
                    </div>
                  ) : null
                }
              />
            </div>
          </div>
        </div>
        <div className="h-px bg-[color:var(--dashboard-frame-border)]/85" />
      </section>

      {/* Legacy header kept for guardrail copy, visually hidden */}
      <div className="sr-only">
        <h1
          className="text-[1.35rem] font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--dashboard-ink)' }}
        >
          {isAdmin ? 'Campagneoverzicht' : 'Overzicht'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
          {isAdmin
            ? `${campaigns.length} campagne${campaigns.length === 1 ? '' : 's'} · ${managementReadyCount} klaar voor bespreking`
            : primaryOverviewCampaign
              ? getOverviewHeadline({ campaign: primaryOverviewCampaign, stateMeta: primaryGuideStateMeta, isAdmin, avgSignal })
              : 'Zodra de eerste campagne leesbaar wordt, opent hier automatisch het eerste overzicht.'}
        </p>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SignalStatCard
          label="Klaar voor bespreking"
          value={`${managementReadyCount}`}
          subline={`${fullCount} volledig · ${partialCount} deels`}
          band={managementReadyCount > 0 ? 'LAAG' : 'neutral'}
        />
        <SignalStatCard
          label="In uitvoering"
          value={`${activeExecutionCount}`}
          subline={activeExecutionCount > 0 ? 'Setup, launch of running' : 'Geen actieve uitvoering'}
          band={activeExecutionCount > 0 ? 'MIDDEN' : 'neutral'}
        />
        <SignalStatCard
          label="Gem. groepssignaal"
          value={avgSignal ? `${avgSignal}/10` : 'â€”'}
          subline={avgSignal ? `Gem. respons ${avgResponse}%` : 'Nog geen leesbaar signaal'}
          band={avgSignal ? (parseFloat(avgSignal) >= 6 ? 'HOOG' : parseFloat(avgSignal) >= 4 ? 'MIDDEN' : 'LAAG') : 'neutral'}
        />
        <SignalStatCard
          label="Afgerond"
          value={`${closedCount}`}
          subline={closedCount > 0 ? 'Rapport beschikbaar' : 'Geen gesloten campagnes'}
          band="neutral"
        />
      </div>

      <div className="hidden">
      {!isAdmin && primaryGuideCampaign && primaryExecutionState && primaryGuideScanDefinition ? (
        <div
          className="hidden rounded-[var(--dashboard-radius-card)] p-5"
          style={{
            background: 'var(--dashboard-surface)',
            border: '1px solid var(--dashboard-frame-border)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4" style={{ borderBottom: '1px solid var(--dashboard-frame-border)' }}>
            <div>
              <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
                Hoofdcampagne Â· {primaryGuideScanDefinition.productName}
              </p>
              <p className="mt-1 text-base font-semibold tracking-[-0.02em]" style={{ color: 'var(--dashboard-ink)' }}>
                {primaryGuideCampaign.campaign_name}
              </p>
            </div>
            <DashboardChip
              label={primaryGuideStateMeta?.label ?? primaryExecutionState.currentStateLabel}
              tone={primaryGuideStateMeta?.tone ?? (primaryExecutionState.dashboardVisible ? 'emerald' : 'amber')}
            />
          </div>
          <div className="pt-4">
            <CustomerLaunchControl
              campaignName={primaryGuideCampaign.campaign_name}
              campaignHref={`/campaigns/${primaryGuideCampaign.campaign_id}`}
              campaignCtaLabel={primaryExecutionState.dashboardVisible ? 'Open campagne en dashboard' : 'Open uitvoerflow'}
              productName={primaryGuideScanDefinition.productName}
              productContext={primaryGuideScanDefinition.whatItIsText}
              state={primaryExecutionState}
            />
          </div>
        </div>
      ) : !isAdmin && !primaryGuideCampaign ? (
        <ViewerEmptyState />
      ) : null}
      </div>

      {leadCampaign && leadCampaignScanDefinition ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.62fr),minmax(320px,0.82fr)]">
          <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-6 shadow-[0_20px_48px_rgba(19,32,51,0.06)] sm:px-7 sm:py-7">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.18fr),minmax(250px,0.82fr)] xl:items-start">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                  {isAdmin ? 'Centrale leesroute' : 'Hoofdroute'}
                </p>
                <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(2.1rem,4vw,3.35rem)] leading-[0.98] text-[color:var(--dashboard-ink)]">
                  {leadCampaign.campaign_name}
                </h2>
                <p className="mt-3 max-w-[44rem] text-[0.98rem] leading-[1.85] text-[color:var(--dashboard-text)]">
                  {leadCampaignStateMeta?.body ??
                    'Gebruik deze route als eerste overzicht, zodat je snel ziet wat nu speelt en wat de logische vervolgstap is.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <DashboardChip label={leadCampaignScanDefinition.productName} tone="slate" />
                  <DashboardChip
                    label={leadCampaign.is_active ? 'Actief portfolio-item' : 'Gesloten portfolio-item'}
                    tone={leadCampaign.is_active ? 'emerald' : 'slate'}
                  />
                  {leadCampaignStateMeta ? (
                    <DashboardChip label={leadCampaignStateMeta.nextStepLabel} tone={leadCampaignStateMeta.tone} />
                  ) : null}
                </div>
              </div>

              <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]/72 px-4 py-4 sm:px-5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
                  Snapshot
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <OverviewSnapshotMetric
                    label="Respons"
                    value={`${leadCampaign.completion_rate_pct ?? 0}%`}
                    body={`${leadCampaign.total_completed} ingevuld`}
                  />
                  <OverviewSnapshotMetric
                    label={`Gem. ${leadCampaignScanDefinition.signalLabelLower}`}
                    value={leadCampaign.avg_risk_score !== null ? `${leadCampaign.avg_risk_score.toFixed(1)}/10` : '-'}
                    body={leadCampaign.is_active ? 'Live campagne' : 'Rapportfase'}
                  />
                  <OverviewSnapshotMetric
                    label="Uitgenodigd"
                    value={`${leadCampaign.total_invited}`}
                    body={
                      leadCampaignStateMeta
                        ? leadCampaignStateMeta.label
                        : leadCampaign.is_active
                          ? 'Actief'
                          : 'Gesloten'
                    }
                  />
                </div>
              </div>
            </div>

            {!isAdmin && primaryGuideCampaign && primaryExecutionState && primaryGuideScanDefinition ? (
              <div className="mt-7 border-t border-[color:var(--dashboard-frame-border)] pt-6">
                <CustomerLaunchControl
                  campaignName={primaryGuideCampaign.campaign_name}
                  campaignHref={`/campaigns/${primaryGuideCampaign.campaign_id}`}
                  campaignCtaLabel={primaryExecutionState.dashboardVisible ? 'Open campagne en dashboard' : 'Open uitvoerflow'}
                  productName={primaryGuideScanDefinition.productName}
                  productContext={primaryGuideScanDefinition.whatItIsText}
                  state={primaryExecutionState}
                />
              </div>
            ) : isAdmin ? (
              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[color:var(--dashboard-frame-border)] pt-6">
                <Link
                  href={`/campaigns/${leadCampaign.campaign_id}`}
                  className="inline-flex rounded-full border border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
                >
                  Open campagne
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
                >
                  Open rapportlijst
                </Link>
                <Link
                  href="/beheer"
                  className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-text)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                >
                  Beheer en setup
                </Link>
              </div>
            ) : null}
          </div>

          <aside className="rounded-[28px] bg-[#121822] px-6 py-6 text-[#f6f0e8] shadow-[0_24px_54px_rgba(18,24,34,0.24)] sm:px-7 sm:py-7">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#83d0bf]">
              Aanbevolen focus
            </p>
            <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2rem,4vw,3.1rem)] leading-[0.98] text-[#f8f3ec]">
              {isAdmin ? 'Waar de suite nu het eerst om vraagt.' : 'Welke route nu het eerst logisch is.'}
            </h2>
            <div className="mt-7 space-y-5">
              {overviewFocusItems.map((item, index) => (
                <div
                  key={item.title}
                  className={index === 0 ? 'space-y-2' : 'space-y-2 border-t border-white/10 pt-5'}
                >
                  <p className="dash-number text-[2rem] leading-none text-[#83d0bf]">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="text-[1.06rem] font-semibold tracking-[-0.02em] text-[#f8f3ec]">{item.title}</p>
                  <p className="text-sm leading-7 text-[#b9c3cf]">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href={isAdmin ? '/reports' : `/campaigns/${leadCampaign.campaign_id}`}
                className="inline-flex rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f8f3ec] transition-colors hover:bg-white/12"
              >
                {isAdmin ? 'Open rapporten' : 'Open campagne'}
              </Link>
              {isAdmin ? (
                <Link
                  href="/beheer"
                  className="inline-flex rounded-full border border-[#83d0bf]/30 px-4 py-2 text-sm font-semibold text-[#83d0bf] transition-colors hover:bg-[#83d0bf]/10"
                >
                  Open beheer
                </Link>
              ) : null}
            </div>
          </aside>
        </section>
      ) : !isAdmin && !primaryGuideCampaign ? (
        <ViewerEmptyState />
      ) : campaigns.length === 0 && isAdmin ? (
        <AdminEmptyState />
      ) : null}

      {campaigns.length === 0 && isAdmin ? (
        null
      ) : campaigns.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                Portfolio
              </p>
              <p className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                Rustige scan van alle campagnes.
              </p>
            </div>
            <p className="max-w-[24rem] text-sm leading-7 text-[color:var(--dashboard-text)]">
              De tabs behouden de echte productstructuur, maar de read begint nu met helder ritme, minder card-op-card en een duidelijkere eerste managementflow.
            </p>
          </div>
          <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_16px_36px_rgba(19,32,51,0.06)] sm:px-6 sm:py-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
                Portfolio
              </p>
              <span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                {campaigns.length} campagne{campaigns.length === 1 ? '' : 's'}
              </span>
            </div>
            <DashboardTabs tabs={portfolioTabs} defaultTabId={portfolioView} />
          </div>
        </section>
      ) : null}

      {isAdmin && campaigns.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/beheer"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: 'var(--dashboard-surface)',
              border: '1px solid var(--dashboard-frame-border)',
              color: 'var(--dashboard-ink)',
            }}
          >
            Beheer en setup
          </Link>
          <Link
            href="/beheer/contact-aanvragen"
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: 'var(--dashboard-surface)',
              border: '1px solid var(--dashboard-frame-border)',
              color: 'var(--dashboard-text)',
            }}
          >
            Contactaanvragen
          </Link>
        </div>
      ) : null}
    </div>
  )
}

function OverviewSummaryNote({
  label,
  value,
  body,
  footer,
}: {
  label: string
  value: string
  body: string
  footer?: JSX.Element | null
}) {
  return (
    <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-4 shadow-[0_12px_28px_rgba(19,32,51,0.05)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{body}</p>
      {footer}
    </div>
  )
}

function OverviewSnapshotMetric({
  label,
  value,
  body,
}: {
  label: string
  value: string
  body: string
}) {
  return (
    <div className="space-y-1.5 border-b border-[color:var(--dashboard-frame-border)]/75 pb-3 last:border-b-0 last:pb-0">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">{label}</p>
      <p className="dash-number text-[1.95rem] leading-none text-[color:var(--dashboard-ink)]">{value}</p>
      <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">{body}</p>
    </div>
  )
}

function buildOverviewFocusItems({
  isAdmin,
  primaryOverviewCampaign,
  primaryOverviewStateMeta,
  primaryGuideCampaign,
  primaryExecutionState,
  managementReadyCount,
  activeExecutionCount,
  closedCount,
}: {
  isAdmin: boolean
  primaryOverviewCampaign: CampaignStats | null
  primaryOverviewStateMeta: ReturnType<typeof getHomeStateMeta> | null
  primaryGuideCampaign: CampaignStats | null
  primaryExecutionState: ReturnType<typeof buildGuidedSelfServeState> | null
  managementReadyCount: number
  activeExecutionCount: number
  closedCount: number
}) {
  if (isAdmin) {
    return [
      {
        title: 'Lees eerst wat klaar is voor bespreking.',
        body:
          managementReadyCount > 0
            ? `${managementReadyCount} campagne${managementReadyCount === 1 ? '' : 's'} kan nu als eerste overzicht dienen.`
            : 'Er is nog geen campagne klaar voor bespreking. Gebruik overzicht voorlopig vooral voor ritme, voortgang en launchdiscipline.',
      },
      {
        title: 'Houd uitvoering en launch compact in beeld.',
        body: `${activeExecutionCount} campagne${activeExecutionCount === 1 ? '' : 's'} zit nog in setup, launch of vroege responsopbouw. Die status blijft bewust functioneel in plaats van bestuurlijk opgeblazen.`,
      },
      {
        title: 'Verplaats afgesloten werk naar rapportage.',
        body:
          closedCount > 0
            ? `${closedCount} gesloten campagne${closedCount === 1 ? '' : 's'} hoort nu vooral in rapportlijst en opvolggesprek thuis, niet meer als live operatiepaneel.`
            : 'Er is nog geen afgeronde campagne. Zodra rapporten ontstaan, blijft overzicht vooral de toegangspoort naar die laag.',
      },
    ]
  }

  const readTarget = primaryOverviewCampaign
    ? `${primaryOverviewCampaign.campaign_name} is nu de eerste logische managementroute.`
    : 'De eerste hoofdroute opent hier zodra er genoeg respons is om eerlijk gelezen te worden.'
  const executionTarget =
    primaryGuideCampaign && primaryExecutionState
      ? `${primaryExecutionState.nextAction.title}. ${primaryExecutionState.nextAction.body}`
      : 'De uitvoerlaag blijft hier compact zichtbaar totdat dashboard of rapport veilig open kunnen.'

  return [
    {
      title: 'Leesroute eerst, niet meer schermen erbij.',
      body: primaryOverviewStateMeta ? `${readTarget} ${primaryOverviewStateMeta.body}` : readTarget,
    },
    {
      title: 'Uitvoering blijft bewust concreet.',
      body: executionTarget,
    },
    {
      title: 'Behoud het overzicht.',
      body: `${managementReadyCount} klaar voor bespreking, ${activeExecutionCount} in uitvoering en ${closedCount} afgerond. Overzicht houdt die volgorde duidelijk bij elkaar.`,
    },
  ]
}

function CampaignRow({
  entry,
  showOnboarding,
  isAdmin,
}: {
  entry: CampaignHomeEntry
  showOnboarding: boolean
  isAdmin: boolean
}) {
  const { campaign, state } = entry
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const stateMeta = getHomeStateMeta(state)
  const ctaLabel = isAdmin && state === 'setup' ? 'Naar setup' : stateMeta.viewerCta

  return (
    <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),var(--dashboard-surface))] px-5 py-5 shadow-[0_14px_32px_rgba(19,32,51,0.05)] transition-shadow hover:shadow-[0_18px_38px_rgba(19,32,51,0.08)] sm:px-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between xl:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip label={scanDefinition.productName} tone="slate" />
            <DashboardChip label={campaign.is_active ? 'Actief' : 'Gesloten'} tone={campaign.is_active ? 'emerald' : 'slate'} />
            <DashboardChip label={stateMeta.label} tone={stateMeta.tone} />
          </div>
          <h2 className="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">{campaign.campaign_name}</h2>
          <p className="mt-2 text-sm leading-[1.75] text-[color:var(--dashboard-text)]">{stateMeta.body}</p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-muted)]">{stateMeta.trust}</p>
        </div>

        <div className="grid gap-3 rounded-[22px] bg-[color:var(--dashboard-soft)]/72 px-4 py-4 sm:grid-cols-2 xl:min-w-[380px] xl:grid-cols-2 2xl:min-w-[520px] 2xl:grid-cols-4">
          <StatCell label="Respons" value={`${campaign.completion_rate_pct ?? 0}%`} />
          <StatCell label="Ingevuld" value={`${campaign.total_completed}`} />
          <StatCell label="Uitgenodigd" value={`${campaign.total_invited}`} />
          <StatCell
            label={`Gem. ${scanDefinition.signalLabelLower}`}
            value={campaign.avg_risk_score !== null ? `${campaign.avg_risk_score.toFixed(1)}/10` : '—'}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--dashboard-frame-border)]/85 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--dashboard-text)]">
          <span className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-2.5 py-1 font-semibold text-[color:var(--dashboard-muted)]">
            {stateMeta.nextStepLabel}
          </span>
          <span className="text-[color:var(--dashboard-muted)] select-none">·</span>
          <span>
            {campaign.total_invited} uitnodigingen · {campaign.band_high}/{campaign.band_medium}/{campaign.band_low} hoog/midden/laag
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && state === 'setup' ? (
            <Link
              href="/beheer"
              className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
            >
              Naar setup
            </Link>
          ) : null}
          <div className="relative">
            {showOnboarding ? <OnboardingBalloon step={1} label="Open je campagne" align="left" /> : null}
            <Link
              href={`/campaigns/${campaign.campaign_id}`}
              className="inline-flex rounded-full border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:brightness-[0.97]"
            >
              {ctaLabel}
            </Link>
          </div>
          {isAdmin || state === 'full' || state === 'closed' ? (
            <PdfDownloadButton campaignId={campaign.campaign_id} campaignName={campaign.campaign_name} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  const helpText =
    label.startsWith('Gem.')
      ? 'Dit is het gemiddelde groepssignaal op een schaal van 1-10. Beweeg met je muis over het informatie-icoon om te zien hoe je deze score moet lezen.'
      : label === 'Respons'
        ? 'Het percentage uitgenodigde respondenten dat de survey volledig heeft ingevuld.'
        : label === 'Ingevuld'
          ? 'Het aantal respondenten dat de survey volledig heeft afgerond.'
          : label === 'Uitgenodigd'
            ? 'Het totale aantal respondenten dat aan deze campaign is gekoppeld.'
            : null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">{label}</p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p className="dash-number text-[1.45rem] leading-none text-[color:var(--dashboard-ink)]">{value}</p>
    </div>
  )
}

function buildInvitesNotSentByCampaign(
  campaigns: CampaignStats[],
  respondents: Array<{ campaign_id: string; sent_at: string | null; completed: boolean }>,
) {
  const counts = new Map<string, number>()

  for (const respondent of respondents) {
    if (!respondent.sent_at && !respondent.completed) {
      counts.set(respondent.campaign_id, (counts.get(respondent.campaign_id) ?? 0) + 1)
    }
  }

  for (const campaign of campaigns) {
    if (!counts.has(campaign.campaign_id)) {
      counts.set(
        campaign.campaign_id,
        campaign.total_invited === 0 ? 0 : campaign.total_completed >= 5 ? 0 : 1,
      )
    }
  }

  return counts
}

function getPrimaryGuideCampaign(entries: CampaignHomeEntry[]): CampaignHomeEntry | null {
  if (entries.length === 0) return null

  const priority: Record<CampaignCompositionState, number> = {
    setup: 0,
    ready_to_launch: 1,
    running: 2,
    sparse: 3,
    partial: 4,
    full: 5,
    closed: 6,
  }

  return [...entries].sort((left, right) => {
    const priorityDelta = priority[left.state] - priority[right.state]
    if (priorityDelta !== 0) return priorityDelta
    return new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
  })[0] ?? null
}

function getPrimaryFirstNextStepCampaign(
  activeCampaigns: CampaignStats[],
  allCampaigns: CampaignStats[],
): CampaignStats | null {
  const candidatePool = activeCampaigns.length > 0 ? activeCampaigns : allCampaigns
  const eligibleCampaigns = candidatePool.filter(
    (campaign) => campaign.total_completed >= FIRST_INSIGHT_THRESHOLD,
  )

  if (eligibleCampaigns.length === 0) return null

  return [...eligibleCampaigns].sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })[0] ?? null
}

function groupCampaigns(entries: CampaignHomeEntry[]): CampaignGroup[] {
  return HOME_STATE_ORDER.map((state) => {
    const meta = getHomeStateMeta(state)
    return {
      key: state,
      title: meta.sectionTitle,
      description: meta.sectionDescription,
      entries: entries.filter((entry) => entry.state === state),
    }
  })
}

function buildPortfolioBuckets(groups: CampaignGroup[]): PortfolioBucket[] {
  const definitions: Array<{ key: DashboardPortfolioView; label: string; states: CampaignCompositionState[] }> = [
    { key: 'ready', label: 'Klaar voor bespreking', states: ['full', 'partial'] },
    { key: 'building', label: 'In opbouw', states: ['sparse', 'running', 'ready_to_launch'] },
    { key: 'setup', label: 'Setup of launch', states: ['setup'] },
    { key: 'closed', label: 'Afgerond', states: ['closed'] },
  ]

  return definitions.map((definition) => {
    const bucketGroups = groups.filter((group) => definition.states.includes(group.key))
    return {
      key: definition.key,
      label: definition.label,
      groups: bucketGroups.filter((group) => group.entries.length > 0),
      entries: bucketGroups.flatMap((group) => group.entries),
    }
  })
}

function getHomeStateMeta(state: CampaignCompositionState) {
  const meta = {
    setup: {
      label: 'Nog niet live',
      tone: 'amber' as const,
      nextStepLabel: 'Setup eerst',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Setup / nog niet live',
      sectionDescription:
        'Campagnes zonder live uitnodigingen of zonder echte respondentlaag. Hier telt eerst setup en launchdiscipline.',
      body: 'Deze campagne vraagt eerst respondentimport of launchcontrole voordat er een leesbaar dashboard kan openen.',
      trust:
        'Nog geen duiding. Eerst setup, daarna pas overzicht en rapport.',
    },
    ready_to_launch: {
      label: 'Launch klaar',
      tone: 'amber' as const,
      nextStepLabel: 'Invites versturen',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Ready to launch',
      sectionDescription:
        'Campagnes waar de respondentlaag klaarstaat, maar waar uitnodigingen nog niet volledig live zijn gezet.',
      body: 'Respondenten staan klaar, maar de inviteflow is nog niet volledig gestart.',
      trust:
        'Dashboard en rapport blijven dicht tot de eerste veilige responslaag echt opbouwt.',
    },
    running: {
      label: 'Invites live',
      tone: 'amber' as const,
      nextStepLabel: 'Respons volgen',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Invites live / running',
      sectionDescription:
        'Campagnes waar uitnodigingen lopen, maar waar nog geen eerste veilige responslaag zichtbaar hoort te worden.',
      body: 'De inviteflow loopt, maar het beeld is nog te dun voor een eerste inhoudelijke read.',
      trust:
        'Laat hier vooral voortgang zien. Dit is nog geen stevige duiding.',
    },
    sparse: {
      label: 'Indicatief, nog dun',
      tone: 'amber' as const,
      nextStepLabel: 'Meer respons nodig',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Sparse / indicatief',
      sectionDescription:
        'Campagnes met eerste responses, maar nog onder de veilige dashboarddrempel voor een eerlijke eerste duiding.',
      body: 'Er zijn eerste responses binnen, maar het beeld is nog te dun voor een stevige dashboardread.',
      trust:
        'Gebruik dit als signaal dat uitvoering loopt, niet als conclusie.',
    },
    partial: {
      label: 'Deels zichtbaar',
      tone: 'amber' as const,
      nextStepLabel: 'Compacte read',
      viewerCta: 'Open compacte read',
      sectionTitle: 'Deels zichtbaar',
      sectionDescription:
        'Campagnes waar de eerste veilige dashboardlaag open is, maar waar thresholds of privacy de verdiepingslaag nog begrenzen.',
      body: 'De eerste dashboardread is zichtbaar, maar verdiepende duiding blijft nog bewust compact.',
      trust:
        'Privacy- en thresholdgrenzen houden detail en claims nog deels dicht.',
    },
    full: {
      label: 'Duiding gereed',
      tone: 'emerald' as const,
      nextStepLabel: 'Open dashboard',
      viewerCta: 'Open dashboard',
      sectionTitle: 'Volledig / klaar voor bespreking',
      sectionDescription:
        'Campagnes met genoeg respons en voldoende zichtbaarheid om dashboard, aanbevelingen en rapport als managementinstrument te gebruiken.',
      body: 'Dashboard en rapport zijn nu stevig genoeg voor duiding, prioritering en een eerste vervolgactie.',
      trust:
        'Nu kun je ook de vervolgstap en het rapport meenemen in het gesprek.',
    },
    closed: {
      label: 'Rapport eerst',
      tone: 'slate' as const,
      nextStepLabel: 'Rapport eerst',
      viewerCta: 'Open rapport en dashboard',
      sectionTitle: 'Gesloten / rapport eerst',
      sectionDescription:
        'Gesloten campagnes waar de nadruk nu op rapportage, terugblik en bestuurlijke opvolging hoort te liggen.',
      body: 'Deze campagne is gesloten. Gebruik rapport en dashboard nu voor terugblik en vervolggesprek.',
      trust:
        'Geen live uitvoersignalen meer, nu telt vooral rapportage, context en vervolgrichting.',
    },
  } satisfies Record<
    CampaignCompositionState,
    {
      label: string
      tone: 'slate' | 'blue' | 'emerald' | 'amber'
      nextStepLabel: string
      viewerCta: string
      sectionTitle: string
      sectionDescription: string
      body: string
      trust: string
    }
  >

  return meta[state]
}

function getOverviewHeadline({
  campaign,
  stateMeta,
  isAdmin,
  avgSignal,
}: {
  campaign: CampaignStats
  stateMeta: ReturnType<typeof getHomeStateMeta> | null
  isAdmin: boolean
  avgSignal: string | null
}) {
  if (!campaign.is_active) {
    return 'Deze campagne is gesloten. De hoofdlijn zit nu in rapportage, opvolging en vervolggesprek.'
  }

  if (campaign.total_invited === 0) {
    return isAdmin
      ? 'De eerstvolgende stap ligt nog in setup of launchdiscipline voordat managementwaarde zichtbaar wordt.'
      : 'De eerstvolgende stap ligt nog in uitvoering voordat dashboard of rapport de hoofdroute wordt.'
  }

  if (stateMeta?.label === 'Deels zichtbaar') {
    return 'Er ligt al een eerste dashboardread, maar de verdiepingslaag blijft nog bewust compact.'
  }

  if (campaign.total_completed < 5) {
    return avgSignal
      ? `Het portfolio bouwt nog respons op. Het leesbare gemiddelde staat nu op ${avgSignal}/10, maar het overzicht blijft nog voorzichtig.`
      : 'Het portfolio bouwt nog respons op. Lees hier eerst richting en voortgang.'
  }

  return avgSignal
    ? `Er ligt nu een leesbaar overzicht. Het gemiddelde groepssignaal in het portfolio staat op ${avgSignal}/10.`
    : 'Er ligt nu een leesbaar overzicht. Gebruik home voor de hoofdlijn en open daarna de campagne voor verdieping.'
}

function AdminEmptyState() {
  return (
    <DashboardSection
      eyebrow="Setup"
      title="Nog geen campagnes beschikbaar"
            description="Dit overzicht wordt vanzelf gevuld zodra je een organisatie, campagne en respondentbestand hebt toegevoegd."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { step: '1', title: 'Organisatie', body: 'Maak eerst de klantorganisatie aan en leg het contactpunt vast.' },
              { step: '2', title: 'Campagne', body: 'Kies ExitScan of RetentieScan en zet de campagne op met de juiste metadata.' },
          { step: '3', title: 'Respondenten', body: 'Importeer respondenten en stuur uitnodigingen, zodat dit overzicht vanzelf in monitoring overgaat.' },
        ].map(({ step, title, body }) => (
          <div
            key={step}
            className="rounded-[var(--dashboard-radius-card)] px-4 py-4"
            style={{ background: 'var(--dashboard-surface)', border: '1px solid var(--dashboard-frame-border)' }}
          >
            <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>Stap {step}</p>
            <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>{title}</p>
            <p className="mt-1.5 text-sm leading-[1.65]" style={{ color: 'var(--dashboard-text)' }}>{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <Link
          href="/beheer"
          className="inline-flex rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] transition-colors hover:bg-[#1B2E45]"
        >
          Naar setup
        </Link>
      </div>
    </DashboardSection>
  )
}

function ViewerEmptyState() {
  return (
    <DashboardSection
      eyebrow="Wachten op livegang"
      title="Jouw dashboard wordt voorbereid"
      description="Verisight zet de campaign op, controleert de import en activeert daarna automatisch dit overzicht."
    >
      <div className="space-y-4">
        <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-5 text-sm leading-6 text-[color:var(--text)]">
          Zodra de eerste responses binnenkomen, verschijnen hier automatisch je campagnes, status en rapportacties.
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
              'Verisight beheert organisatie, campagne en respondentimport.',
            'Jij krijgt daarna toegang tot het juiste dashboard en rapport.',
            'De eerste managementwaarde zit in lezen, duiden en prioriteren, niet in technische setup.',
          ].map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--text)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Stap {index + 1}</p>
              <p className="mt-2">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  )
}
