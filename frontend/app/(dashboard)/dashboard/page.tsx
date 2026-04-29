import Link from 'next/link'
import { redirect } from 'next/navigation'
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
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
import {
  normalizeDashboardPortfolioView,
  type DashboardPortfolioView,
} from '@/lib/dashboard/shell-navigation'
import { buildReportLibraryEntries } from '@/lib/dashboard/report-library'
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

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
  const primaryFirstNextStepCampaign = getPrimaryFirstNextStepCampaign(activeCampaigns, campaigns)
  const { data: primaryGuideDeliveryRecord } = primaryGuideCampaign
    ? await supabase
        .from('campaign_delivery_records')
        .select('id')
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
  const portfolioTabs = portfolioBuckets
    .filter((bucket) => bucket.entries.length > 0)
    .map((bucket) => {
      const firstEntryId = bucket.entries[0]?.campaign.campaign_id

      return {
        id: bucket.key,
        label: bucket.label,
        content: (
          <div className="space-y-4">
            {bucket.groups.map((group) => (
              <section key={group.key} className="space-y-3">
                {bucket.groups.length > 1 ? (
                  <div className="rounded-[var(--dashboard-radius-card)] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold tracking-[-0.01em] text-[color:var(--dashboard-ink)]">{group.title}</p>
                        <p className="mt-1.5 text-sm leading-[1.65] text-[color:var(--dashboard-text)]">{group.description}</p>
                      </div>
                      <DashboardChip label={getHomeStateMeta(group.key).label} tone={getHomeStateMeta(group.key).tone} />
                    </div>
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
  const primaryGuideBuyerSafeName =
    primaryGuideCampaign && primaryGuideScanDefinition
      ? getBuyerSafeCampaignName(primaryGuideCampaign.campaign_name, primaryGuideScanDefinition.productName)
      : null
  const reportModel = buildReportLibraryEntries(campaigns)
  const relevantOverviewEntries = getRelevantOverviewEntries(campaignEntries)
  const recentFormalOutputEntries = reportModel.entries
    .filter((entry) => entry.scanType === 'exit' || entry.scanType === 'retention')
    .slice(0, 4)
  const overviewFollowThroughRows = buildOverviewFollowThroughRows({
    primaryGuideCampaign,
    primaryGuideScanDefinition,
    primaryExecutionState,
    relevantEntries: relevantOverviewEntries,
  })

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1
          className="text-[1.35rem] font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--dashboard-ink)' }}
        >
          {isAdmin ? 'Campagneoverzicht' : 'Dashboardoverzicht'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
          {isAdmin
            ? `${campaigns.length} scan${campaigns.length === 1 ? '' : 's'} · ${managementReadyCount} leesbaar`
            : primaryOverviewCampaign
              ? 'De hoofdscan hieronder laat zien waar jullie nu staan en wat eerst nodig is.'
              : 'Zodra de eerste scan klaarstaat, verschijnt hier automatisch de hoofdlijn.'}
        </p>
      </div>

      {/* Primary campaign + execution state */}
      {!isAdmin && primaryGuideCampaign && primaryExecutionState && primaryGuideScanDefinition ? (
        <div
          className="rounded-[var(--dashboard-radius-card)] p-5"
          style={{
            background: 'var(--dashboard-surface)',
            border: '1px solid var(--dashboard-frame-border)',
          }}
        >
          <div className="pb-4" style={{ borderBottom: '1px solid var(--dashboard-frame-border)' }}>
            <div>
              <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
                Hoofdscan · {primaryGuideScanDefinition.productName}
              </p>
              {primaryGuideBuyerSafeName &&
              primaryGuideBuyerSafeName !== primaryGuideScanDefinition.productName ? (
                <p className="mt-1 text-sm leading-6" style={{ color: 'var(--dashboard-text)' }}>
                  {primaryGuideBuyerSafeName}
                </p>
              ) : null}
            </div>
          </div>
          <div className="pt-4">
            <DashboardHomePrimaryPanel
              campaignHref={`/campaigns/${primaryGuideCampaign.campaign_id}`}
              state={primaryExecutionState}
            />
          </div>
        </div>
      ) : !isAdmin && !primaryGuideCampaign ? (
        <ViewerEmptyState />
      ) : null}

      {!isAdmin && primaryGuideCampaign && primaryExecutionState && primaryGuideScanDefinition ? (
        <div className="space-y-5">
          <DashboardSection
            eyebrow="Actieve routes"
            title="Wat nu relevant is"
            description="Alleen routes die nu iets leesbaars of iets urgents te doen hebben."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              {relevantOverviewEntries.map((entry) => (
                <OverviewRouteCard key={entry.campaign.campaign_id} entry={entry} />
              ))}
            </div>
          </DashboardSection>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <DashboardSection
              eyebrow="Opvolging nu"
              title="Wat direct opvolging vraagt"
              description="Maximaal drie regels, geen mini-Action Center."
            >
              <div className="space-y-3">
                {overviewFollowThroughRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3.5"
                  >
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
                        {row.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.value}</p>
                    </div>
                    {row.tone ? <DashboardChip label={row.tone} tone={row.toneVariant} /> : null}
                  </div>
                ))}
                <div className="pt-1">
                  <Link
                    href="/action-center"
                    className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
                  >
                    Naar Action Center
                  </Link>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection
              eyebrow="Recente formele output"
              title="Rapporten en samenvattingen"
              description="Kernoutput eerst. Bounded reads blijven secundair."
            >
              {recentFormalOutputEntries.length > 0 ? (
                <div className="space-y-3">
                  {recentFormalOutputEntries.map((entry) => (
                    <div
                      key={`${entry.campaignId}-${entry.title}`}
                      className="flex items-start justify-between gap-4 rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
                          {entry.scanType === 'exit' ? 'ExitScan' : 'RetentieScan'}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[color:var(--dashboard-ink)]">{entry.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--dashboard-text)]">{entry.summary}</p>
                        <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">
                          {entry.metaLeft} · {entry.metaRight}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <Link
                          href={`/campaigns/${entry.campaignId}`}
                          className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-3 py-1.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
                        >
                          Open
                        </Link>
                        <PdfDownloadButton campaignId={entry.campaignId} campaignName={entry.campaignName} scanType={entry.scanType} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-1">
                    <Link
                      href="/reports"
                      className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
                    >
                      Naar Rapporten
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-[18px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-5 text-sm leading-7 text-[color:var(--dashboard-text)]">
                  Zodra een ExitScan of RetentieScan leesbaar is, verschijnt hier de meest recente managementoutput.
                </div>
              )}
            </DashboardSection>
          </div>
        </div>
      ) : !isAdmin ? null : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SignalStatCard
            label="Leesbaar"
            value={`${managementReadyCount}`}
            subline={`${fullCount} volledig · ${partialCount} compact`}
            band={managementReadyCount > 0 ? 'LAAG' : 'neutral'}
          />
          <SignalStatCard
            label="In uitvoering"
            value={`${activeExecutionCount}`}
            subline={activeExecutionCount > 0 ? 'Setup, live of eerste responses' : 'Geen actieve uitvoering'}
            band={activeExecutionCount > 0 ? 'MIDDEN' : 'neutral'}
          />
          <SignalStatCard
            label="Gem. groepssignaal"
            value={avgSignal ? `${avgSignal}/10` : '—'}
            subline={avgSignal ? `Gem. respons ${avgResponse}%` : 'Nog geen leesbaar signaal'}
            band={avgSignal ? (parseFloat(avgSignal) >= 6 ? 'HOOG' : parseFloat(avgSignal) >= 4 ? 'MIDDEN' : 'LAAG') : 'neutral'}
          />
          <SignalStatCard
            label="Afgerond"
            value={`${closedCount}`}
            subline={closedCount > 0 ? 'Rapport en dashboard beschikbaar' : 'Geen afgeronde scans'}
            band="neutral"
          />
        </div>
      )}

      {/* Portfolio */}
      {campaigns.length === 0 && isAdmin ? (
        <AdminEmptyState />
      ) : campaigns.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
              {isAdmin ? 'Scans' : 'Volledige scanlijst'}
            </p>
            <span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
              {campaigns.length} scan{campaigns.length === 1 ? '' : 's'}
            </span>
          </div>
          <DashboardTabs tabs={portfolioTabs} defaultTabId={portfolioView} />
        </div>
      ) : null}

      {/* Admin quick links */}
      {isAdmin && (
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
      )}
    </div>
  )
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
    <div className="rounded-[var(--dashboard-radius-card)] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[var(--dashboard-shadow-soft)] transition-shadow hover:shadow-[var(--dashboard-shadow-strong)]">
      <div className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <DashboardChip label={scanDefinition.productName} tone="slate" />
            <DashboardChip label={campaign.is_active ? 'Actief' : 'Gesloten'} tone={campaign.is_active ? 'emerald' : 'slate'} />
            <DashboardChip label={stateMeta.label} tone={stateMeta.tone} />
          </div>
          <h2 className="mt-3 text-base font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">{campaign.campaign_name}</h2>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          <StatCell label="Respons" value={`${campaign.completion_rate_pct ?? 0}%`} />
          <StatCell label="Ingevuld" value={`${campaign.total_completed}`} />
          <StatCell label="Uitgenodigd" value={`${campaign.total_invited}`} />
          <StatCell
            label={`Gem. ${scanDefinition.signalLabelLower}`}
            value={campaign.avg_risk_score !== null ? `${campaign.avg_risk_score.toFixed(1)}/10` : '—'}
          />
        </div>
        <div className="max-w-none">
          <p className="text-sm leading-[1.75] text-[color:var(--dashboard-text)]">{stateMeta.body}</p>
          <p className="mt-2 text-sm leading-[1.75] text-[color:var(--dashboard-muted)]">{stateMeta.trust}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--dashboard-frame-border)] pt-4 lg:flex-row lg:items-center lg:justify-between">
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
            ? 'Het totale aantal respondenten dat aan deze scan is gekoppeld.'
            : null

  return (
    <div className="rounded-[var(--dashboard-radius-card)] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">{label}</p>
        {helpText ? <InfoTooltip text={helpText} /> : null}
      </div>
      <p className="dash-number mt-2 text-[1.5rem] text-[color:var(--dashboard-ink)]">{value}</p>
    </div>
  )
}

function OverviewRouteCard({ entry }: { entry: CampaignHomeEntry }) {
  const { campaign, state } = entry
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const stateMeta = getHomeStateMeta(state)
  const buyerSafeName = getBuyerSafeCampaignName(campaign.campaign_name, scanDefinition.productName)
  const statusSummary =
    state === 'full' || state === 'closed'
      ? 'Stevig genoeg voor dashboard en rapport.'
      : state === 'partial'
        ? 'Eerste compacte read is zichtbaar.'
        : state === 'sparse'
          ? 'Er zijn eerste signalen, maar nog geen stevig beeld.'
          : state === 'ready_to_launch'
            ? 'Respondenten staan klaar, invites nog niet volledig live.'
            : state === 'running'
              ? 'Invites lopen, maar de eerste veilige read is er nog niet.'
              : 'Deze route vraagt eerst setup en launchcontrole.'
  const readableLabel =
    state === 'full' || state === 'closed'
      ? 'Dashboard en rapport leesbaar'
      : state === 'partial'
        ? 'Compacte read leesbaar'
        : state === 'sparse'
          ? 'Eerste signalen, nog indicatief'
          : 'Nog geen inhoudelijke read'

  return (
    <div className="rounded-[var(--dashboard-radius-card)] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[var(--dashboard-shadow-soft)]">
      <div className="flex flex-wrap items-center gap-2">
        <DashboardChip label={scanDefinition.productName} tone="slate" />
        <DashboardChip label={stateMeta.label} tone={stateMeta.tone} />
      </div>
      <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
        {buyerSafeName}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{statusSummary}</p>
      <div className="mt-4 grid gap-3 border-t border-[color:var(--dashboard-frame-border)] pt-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">Nu leesbaar</p>
          <p className="mt-1.5 text-sm leading-6 text-[color:var(--dashboard-ink)]">{readableLabel}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">Volgende stap</p>
          <p className="mt-1.5 text-sm leading-6 text-[color:var(--dashboard-ink)]">{stateMeta.nextStepLabel}</p>
        </div>
        <div className="flex justify-start sm:justify-end">
          <Link
            href={`/campaigns/${campaign.campaign_id}`}
            className="inline-flex rounded-full border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:brightness-[0.97]"
          >
            Naar route
          </Link>
        </div>
      </div>
      <div className="mt-4 border-t border-[color:var(--dashboard-frame-border)] pt-4">
        <p className="text-xs text-[color:var(--dashboard-muted)]">
          {campaign.total_completed}/{campaign.total_invited} respons · {campaign.avg_risk_score !== null ? `${campaign.avg_risk_score.toFixed(1)}/10` : 'nog geen score'}
        </p>
      </div>
    </div>
  )
}

function DashboardHomePrimaryPanel({
  campaignHref,
  state,
}: {
  campaignHref: string
  state: ReturnType<typeof buildGuidedSelfServeState>
}) {
  const primaryActionLabel = getDashboardHomePrimaryActionLabel(state)
  const phaseSummary = getDashboardHomePhaseSummary(state)
  const currentCount = state.statusBlocks.filter((item) => item.status === 'current').length
  const blockedCount = state.statusBlocks.filter((item) => item.status === 'blocked').length

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr),minmax(240px,0.5fr)] xl:items-start">
      <div className="space-y-4">
        <div>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.05em]" style={{ color: 'var(--dashboard-ink)' }}>
            {getDashboardHomeStatusTitle(state)}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-[1.75]" style={{ color: 'var(--dashboard-text)' }}>
            {getDashboardHomeStatusDetail(state)}
          </p>
        </div>

        <div
          className="rounded-[16px] px-4 py-4"
          style={{ background: 'var(--dashboard-soft)', border: '1px solid var(--dashboard-frame-border)' }}
        >
          <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
            Wat nu eerst telt
          </p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
            {state.nextAction.title}
          </p>
          <p className="mt-1.5 text-sm leading-[1.7]" style={{ color: 'var(--dashboard-text)' }}>
            {getDashboardHomeNextStepBody(state)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`${campaignHref}#uitvoering`}
            className="inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: 'var(--dashboard-ink)',
              border: '1px solid var(--dashboard-ink)',
              color: 'white',
            }}
          >
            {primaryActionLabel}
          </Link>
          <Link
            href={`${campaignHref}#uitvoering`}
            className="inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: 'var(--dashboard-soft)',
              border: '1px solid var(--dashboard-frame-border)',
              color: 'var(--dashboard-ink)',
            }}
          >
            Open uitvoering
          </Link>
        </div>
      </div>

      <div
        className="rounded-[18px] px-4 py-4"
        style={{ background: 'var(--dashboard-soft)', border: '1px solid var(--dashboard-frame-border)' }}
      >
        <p className="text-[0.65rem] font-medium uppercase" style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}>
          Compacte voortgang
        </p>
        <div className="mt-3 space-y-3">
          <CompactProgressRow label="Fase" value={phaseSummary} />
          <CompactProgressRow label="Actief" value={`${currentCount} actieve ${currentCount === 1 ? 'stap' : 'stappen'}`} />
          <CompactProgressRow label="Geblokkeerd" value={`${blockedCount} geblokkeerd`} />
        </div>
      </div>
    </div>
  )
}

function CompactProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--dashboard-muted)' }}>
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
        {value}
      </span>
    </div>
  )
}

function getDashboardHomePrimaryActionLabel(state: ReturnType<typeof buildGuidedSelfServeState>) {
  switch (state.phase) {
    case 'participant_data_required':
      return 'Upload deelnemersbestand'
    case 'import_validation_required':
      return 'Controleer importpreview'
    case 'launch_date_required':
      return 'Bevestig launchmoment'
    case 'communication_ready':
      return 'Bevestig communicatie'
    case 'ready_to_invite':
      return 'Start uitnodigingen'
    case 'survey_running':
      return 'Volg respons'
    case 'dashboard_active':
      return 'Lees compacte output'
    case 'first_next_step_available':
      return 'Leg eerste stap vast'
    case 'closed':
      return 'Open rapport en dashboard'
    default:
      return state.nextAction.title
  }
}

function getDashboardHomePhaseSummary(state: ReturnType<typeof buildGuidedSelfServeState>) {
  switch (state.phase) {
    case 'participant_data_required':
    case 'import_validation_required':
    case 'launch_date_required':
    case 'communication_ready':
    case 'ready_to_invite':
      return 'Setup'
    case 'survey_running':
      return 'Respons'
    case 'dashboard_active':
      return 'Dashboard'
    case 'first_next_step_available':
      return 'Eerste opvolging'
    case 'closed':
      return 'Afgerond'
    default:
      return state.currentStateLabel
  }
}

function getDashboardHomeStatusTitle(state: ReturnType<typeof buildGuidedSelfServeState>) {
  if (state.phase === 'participant_data_required') {
    return 'Deelnemersbestand ontbreekt nog'
  }

  return state.headline
}

function getDashboardHomeStatusDetail(state: ReturnType<typeof buildGuidedSelfServeState>) {
  if (state.phase === 'participant_data_required') {
    return 'Zonder deelnemersbestand blijft deze scan in setup. Dashboard en rapport komen daarna pas vrij.'
  }

  return state.detail
}

function getDashboardHomeNextStepBody(state: ReturnType<typeof buildGuidedSelfServeState>) {
  if (state.phase === 'participant_data_required') {
    return 'Upload nu een CSV- of Excel-bestand met minimaal e-mailadressen. Daarna kan de route pas door naar importcontrole en launch.'
  }

  return state.nextAction.body
}

function getBuyerSafeCampaignName(campaignName: string, fallbackName: string) {
  const normalized = campaignName.replace(/\s+/g, ' ').trim()
  const looksLikeSeedName = /(live test|empty|demo|seed)/i.test(normalized)

  if (looksLikeSeedName) {
    return fallbackName
  }

  return normalized
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

function getRelevantOverviewEntries(entries: CampaignHomeEntry[]) {
  const statePriority: Record<CampaignCompositionState, number> = {
    setup: 0,
    ready_to_launch: 1,
    running: 2,
    sparse: 3,
    partial: 4,
    full: 5,
    closed: 6,
  }

  return entries
    .filter((entry) => entry.campaign.is_active || entry.state === 'partial' || entry.state === 'full')
    .sort((left, right) => {
      const stateDelta = statePriority[left.state] - statePriority[right.state]
      if (stateDelta !== 0) return stateDelta
      return new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
    })
    .slice(0, 3)
}

function buildOverviewFollowThroughRows({
  primaryGuideCampaign,
  primaryGuideScanDefinition,
  primaryExecutionState,
  relevantEntries,
}: {
  primaryGuideCampaign: CampaignStats | null
  primaryGuideScanDefinition: ReturnType<typeof getScanDefinition> | null
  primaryExecutionState: ReturnType<typeof buildGuidedSelfServeState> | null
  relevantEntries: CampaignHomeEntry[]
}) {
  const firstReadableEntry = relevantEntries.find((entry) => entry.state === 'partial' || entry.state === 'full' || entry.state === 'closed') ?? null
  const firstBlockedEntry = relevantEntries.find((entry) =>
    entry.state === 'setup' || entry.state === 'ready_to_launch' || entry.state === 'running' || entry.state === 'sparse',
  ) ?? null

  return [
    {
      label: 'Open prioriteit',
      value:
        primaryGuideCampaign && primaryGuideScanDefinition && primaryExecutionState
          ? `${primaryGuideScanDefinition.productName}: ${primaryExecutionState.nextAction.title}`
          : 'Nog geen open prioriteit zichtbaar',
      tone: 'Nu',
      toneVariant: 'amber' as const,
    },
    {
      label: 'Reviewmoment',
      value: firstReadableEntry
        ? `${getScanDefinition(firstReadableEntry.campaign.scan_type).productName}: open de read en bepaal daar het eerste reviewmoment.`
        : 'Reviewmoment volgt zodra de eerste leesbare route openstaat.',
      tone: 'Check',
      toneVariant: 'blue' as const,
    },
    {
      label: 'Nog onbevestigd',
      value: firstBlockedEntry
        ? `${getScanDefinition(firstBlockedEntry.campaign.scan_type).productName}: ${getHomeStateMeta(firstBlockedEntry.state).nextStepLabel.toLowerCase()}.`
        : 'Geen open eigenaar- of bevestigingsgat zichtbaar.',
      tone: 'Open',
      toneVariant: 'slate' as const,
    },
  ]
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
    { key: 'ready', label: 'Leesbaar', states: ['full', 'partial'] },
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
      viewerCta: 'Open uitvoering',
      sectionTitle: 'Setup / nog niet live',
      sectionDescription:
        'Campagnes zonder live uitnodigingen of zonder echte respondentlaag. Hier telt eerst setup en launchdiscipline.',
      body: 'Deze scan vraagt eerst respondentimport of launchcontrole voordat er een leesbaar dashboard kan openen.',
      trust:
        'Nog geen leesbaar overzicht. Eerst setup, daarna pas dashboard en rapport.',
    },
    ready_to_launch: {
      label: 'Launch klaar',
      tone: 'amber' as const,
      nextStepLabel: 'Invites versturen',
      viewerCta: 'Open uitvoering',
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
      viewerCta: 'Open uitvoering',
      sectionTitle: 'Invites live / running',
      sectionDescription:
        'Campagnes waar uitnodigingen lopen, maar waar nog geen eerste veilige responslaag zichtbaar hoort te worden.',
      body: 'De inviteflow loopt, maar het beeld is nog te dun voor een eerste inhoudelijke read.',
      trust:
        'Laat hier alleen voortgang zien. Dit is nog geen leesbaar overzicht.',
    },
    sparse: {
      label: 'Indicatief, nog dun',
      tone: 'amber' as const,
      nextStepLabel: 'Meer respons nodig',
      viewerCta: 'Open uitvoering',
      sectionTitle: 'Sparse / indicatief',
      sectionDescription:
        'Campagnes met eerste responses, maar nog onder de veilige dashboarddrempel voor een eerlijke managementduiding.',
      body: 'Er zijn eerste responses binnen, maar het beeld is nog te dun voor een stevige dashboardread.',
      trust:
        'Gebruik dit als signaal dat uitvoering loopt, niet als conclusie.',
    },
    partial: {
      label: 'Compact zichtbaar',
      tone: 'amber' as const,
      nextStepLabel: 'Compacte read',
      viewerCta: 'Open compacte read',
      sectionTitle: 'Compact zichtbaar',
      sectionDescription:
        'Campagnes waar de eerste veilige dashboardread open is, maar waar thresholds of privacy de verdiepingslaag nog begrenzen.',
      body: 'De eerste dashboardread is zichtbaar, maar verdiepende duiding blijft nog bewust compact.',
      trust:
        'Privacy- en thresholdgrenzen houden detail en claims nog deels dicht.',
    },
    full: {
      label: 'Leesbaar en volledig',
      tone: 'emerald' as const,
      nextStepLabel: 'Open dashboard',
      viewerCta: 'Open dashboard',
      sectionTitle: 'Volledig / leesbaar',
      sectionDescription:
        'Campagnes met genoeg respons en voldoende zichtbaarheid om dashboard, aanbevelingen en rapport als managementinstrument te gebruiken.',
      body: 'Dashboard en rapport zijn nu stevig genoeg voor managementduiding, prioritering en eerste vervolgactie.',
      trust:
        'Nu mag ook de vervolglijn in beeld komen, binnen dezelfde bounded producttaal.',
    },
    closed: {
      label: 'Rapport eerst',
      tone: 'slate' as const,
      nextStepLabel: 'Rapport eerst',
      viewerCta: 'Open rapport en dashboard',
      sectionTitle: 'Gesloten / rapport eerst',
      sectionDescription:
        'Gesloten campagnes waar de nadruk nu op rapportage, terugblik en bestuurlijke opvolging hoort te liggen.',
      body: 'Deze scan is gesloten. Gebruik rapport en dashboard nu voor terugblik en opvolging.',
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

function AdminEmptyState() {
  return (
    <DashboardSection
      eyebrow="Setup"
      title="Nog geen campagnes beschikbaar"
      description="De cockpit wordt vanzelf gevuld zodra je een organisatie, scan en respondentbestand hebt toegevoegd."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { step: '1', title: 'Organisatie', body: 'Maak eerst de klantorganisatie aan en leg het contactpunt vast.' },
          { step: '2', title: 'Scan', body: 'Kies ExitScan of RetentieScan en zet de scan op met de juiste metadata.' },
          { step: '3', title: 'Respondenten', body: 'Importeer respondenten en stuur uitnodigingen, zodat de cockpit vanzelf in monitoring overgaat.' },
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
      description="Verisight zet de scan op, controleert de import en activeert daarna automatisch dit overzicht."
    >
      <div className="space-y-4">
        <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-5 text-sm leading-6 text-[color:var(--text)]">
          Zodra de eerste responses binnenkomen, verschijnen hier automatisch je campagnes, status en rapportacties.
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            'Verisight beheert organisatie, scan en respondentimport.',
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
