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
  canOpenActionCenterRoute,
  hasOpenedActionCenterRoute,
} from '@/lib/dashboard/open-action-center-route'
import {
  normalizeDashboardPortfolioView,
  type DashboardPortfolioView,
} from '@/lib/dashboard/shell-navigation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
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
  const fullCount = campaignEntries.filter((entry) => entry.state === 'full').length
  const partialCount = campaignEntries.filter((entry) => entry.state === 'partial').length
  const closedCount = campaignEntries.filter((entry) => entry.state === 'closed').length
  const managementReadyCount = fullCount + partialCount
  const notReadableCount = campaignEntries.filter((entry) =>
    ['setup', 'ready_to_launch', 'running', 'sparse'].includes(entry.state),
  ).length
  const readableEntries = [...campaignEntries]
    .filter((entry) => ['full', 'partial', 'closed'].includes(entry.state))
    .sort(
      (left, right) =>
        new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime(),
    )
  const leadReadableEntry = readableEntries[0] ?? null
  const leadReadableCampaign = leadReadableEntry?.campaign ?? null
  const { data: leadReadableDeliveryRecord } = leadReadableCampaign
    ? await supabase
        .from('campaign_delivery_records')
        .select('id, lifecycle_stage, first_management_use_confirmed_at')
        .eq('campaign_id', leadReadableCampaign.campaign_id)
        .maybeSingle()
    : { data: null }
  const leadReadableRouteActive = leadReadableDeliveryRecord
    ? hasOpenedActionCenterRoute(leadReadableDeliveryRecord)
    : false
  const leadReadableRouteOpenable = leadReadableDeliveryRecord
    ? canOpenActionCenterRoute(leadReadableDeliveryRecord)
    : false
  const blockerEntries = buildOverviewBlockers(campaignEntries, isAdmin).slice(0, 3)
  const followUpPreviewItems = buildOverviewFollowUpPreview({
    leadEntry: leadReadableEntry,
    routeActive: leadReadableRouteActive,
    routeOpenable: leadReadableRouteOpenable,
    blockerEntries,
  })
  const recentOutputEntries = buildRecentOutputEntries(campaignEntries).slice(0, 3)
  const portfolioTabs = portfolioBuckets
    .filter((bucket) => bucket.entries.length > 0)
    .map((bucket) => {
      const firstEntryId = bucket.entries[0]?.campaign.campaign_id

      return {
        id: bucket.key,
        label: `${bucket.label} (${bucket.entries.length})`,
        content: (
          <div className="space-y-3">
            {bucket.entries.map((entry, index) => {
              if (bucket.key === 'ready') {
                return index === 0 ? (
                  <CampaignRow
                    key={entry.campaign.campaign_id}
                    entry={entry}
                    showOnboarding={!isAdmin && entry.campaign.campaign_id === firstEntryId}
                    isAdmin={isAdmin}
                  />
                ) : (
                  <CompactReadableRow key={entry.campaign.campaign_id} entry={entry} />
                )
              }
              if (bucket.key === 'building') {
                return <BlockerRouteRow key={entry.campaign.campaign_id} entry={entry} isAdmin={isAdmin} />
              }
              return <CompactReadableRow key={entry.campaign.campaign_id} entry={entry} />
            })}
          </div>
        ),
      }
    })
  const portfolioView = portfolioTabs.some((tab) => tab.id === requestedPortfolioView)
    ? requestedPortfolioView
    : portfolioTabs[0]?.id ?? 'ready'

  return (
    <div className="space-y-8">
      {campaigns.length === 0 && isAdmin ? (
        <AdminEmptyState />
      ) : campaigns.length === 0 ? (
        <ViewerEmptyState />
      ) : (
        <>
          <div>
            <h1 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">Overzicht</h1>
            <p className="mt-1 text-sm leading-[1.7] text-[color:var(--dashboard-text)]">
              Wat nu leesbaar is, wat blokkeert en waar opvolging openstaat.
            </p>
          </div>

          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SignalStatCard
                label="Leesbaar"
                value={`${managementReadyCount}`}
                subline={`${fullCount} volledig · ${partialCount} deels`}
                band={managementReadyCount > 0 ? 'LAAG' : 'neutral'}
              />
              <SignalStatCard
                label="Nog niet leesbaar"
                value={`${notReadableCount}`}
                subline="Setup, launch of opbouw"
                band={notReadableCount > 0 ? 'MIDDEN' : 'neutral'}
              />
              <SignalStatCard
                label="Afgerond"
                value={`${closedCount}`}
                subline={closedCount > 0 ? 'Rapport beschikbaar' : 'Nog geen afgeronde routes'}
                band="neutral"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_1px_4px_rgba(10,25,47,0.05)] sm:px-6 sm:py-6">
              <DashboardTabs tabs={portfolioTabs} defaultTabId={portfolioView} />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                Wat blokkeert
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--dashboard-text)]">
                Wat nog voorkomt dat een route open of volledig live is.
              </p>
            </div>
            {blockerEntries.length > 0 ? (
              <div className="grid gap-3 xl:grid-cols-3">
                {blockerEntries.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[color:var(--dashboard-frame-border)]/85 bg-transparent px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                          {item.statusLabel}
                        </p>
                        <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
                          {item.campaignName}
                        </p>
                      </div>
                      <Link
                        href={item.href}
                        className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                      >
                        {item.ctaLabel}
                      </Link>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[color:var(--dashboard-ink)]">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-7 text-[color:var(--dashboard-text)]">{item.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-4 text-sm leading-7 text-[color:var(--dashboard-text)] shadow-[0_1px_3px_rgba(10,25,47,0.04)]">
                Er staan nu geen concrete blockers open in de overview.
              </div>
            )}
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_1px_4px_rgba(10,25,47,0.05)] sm:px-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                    Opvolging preview
                  </p>
                </div>
                <Link
                  href="/action-center"
                  className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                >
                  Open Action Center
                </Link>
              </div>
              <div className="mt-4 space-y-0">
                {followUpPreviewItems.map((item) => (
                  <div
                    key={item.label}
                    className="border-b border-[color:var(--dashboard-frame-border)]/75 py-4 last:border-b-0 last:pb-0 first:pt-0"
                  >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
                      {item.value}
                    </p>
                    {item.body ? (
                      <p className="mt-1.5 text-sm leading-7 text-[color:var(--dashboard-text)]">{item.body}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_1px_4px_rgba(10,25,47,0.05)] sm:px-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                    Recente output
                  </p>
                </div>
                <Link
                  href="/reports"
                  className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                >
                  Open rapporten
                </Link>
              </div>
              <div className="mt-4 space-y-0">
                {recentOutputEntries.map((entry) => {
                  const scanDefinition = getScanDefinition(entry.campaign.scan_type)

                  return (
                    <div
                      key={entry.campaign.campaign_id}
                      className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--dashboard-frame-border)]/75 py-4 last:border-b-0 last:pb-0 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                          {scanDefinition.productName} · {entry.state === 'partial' ? 'Begrensde read' : 'Kernoutput'}
                        </p>
                        <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
                          {entry.campaign.campaign_name}
                        </p>
                      </div>
                      <Link
                        href={`/campaigns/${entry.campaign.campaign_id}`}
                        className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                      >
                        Open route
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function buildOverviewBlockers(entries: CampaignHomeEntry[], isAdmin: boolean) {
  const priority: Record<CampaignCompositionState, number> = {
    setup: 0,
    ready_to_launch: 1,
    running: 2,
    sparse: 3,
    partial: 4,
    full: 5,
    closed: 6,
  }

  return [...entries]
    .filter((entry) => ['setup', 'ready_to_launch', 'running', 'sparse'].includes(entry.state))
    .sort((left, right) => {
      const priorityDelta = priority[left.state] - priority[right.state]
      if (priorityDelta !== 0) return priorityDelta
      return new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
    })
    .map((entry) => {
      const stateMeta = getHomeStateMeta(entry.state)
      const blockerCopy = getOverviewBlockerCopy(entry.state)

      return {
        id: entry.campaign.campaign_id,
        campaignName: entry.campaign.campaign_name,
        statusLabel: stateMeta.label,
        title: blockerCopy.title,
        body: blockerCopy.body,
        href: isAdmin && entry.state === 'setup' ? '/beheer' : `/campaigns/${entry.campaign.campaign_id}`,
        ctaLabel: isAdmin && entry.state === 'setup' ? 'Open setup' : 'Open route',
      }
    })
}

function buildOverviewFollowUpPreview({
  leadEntry,
  routeActive,
  routeOpenable,
  blockerEntries,
}: {
  leadEntry: CampaignHomeEntry | null
  routeActive: boolean
  routeOpenable: boolean
  blockerEntries: Array<{ campaignName: string; title: string }>
}) {
  const items: Array<{ label: string; value: string; body: string }> = []

  if (leadEntry) {
    items.push({
      label: 'Open prioriteit',
      value: leadEntry.campaign.campaign_name,
      body: '',
    })
  }

  items.push({
    label: 'Reviewmoment',
    value: routeActive ? 'Opvolging staat open' : routeOpenable ? 'Klaar om te openen' : 'Nog niet bevestigd',
    body: '',
  })

  if (blockerEntries[0]) {
    items.push({
      label: 'Zonder bevestiging',
      value: blockerEntries[0].campaignName,
      body: '',
    })
  }

  return items.slice(0, 3)
}

function buildRecentOutputEntries(entries: CampaignHomeEntry[]) {
  return [...entries]
    .filter((entry) => ['partial', 'full', 'closed'].includes(entry.state))
    .sort((left, right) => {
      const stateWeight = (entry: CampaignHomeEntry) =>
        entry.state === 'partial' ? 1 : entry.state === 'closed' ? 2 : 3
      const weightDelta = stateWeight(right) - stateWeight(left)
      if (weightDelta !== 0) return weightDelta
      return new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
    })
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
    <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5 shadow-[0_1px_3px_rgba(10,25,47,0.04)] sm:px-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] xl:gap-x-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip label={scanDefinition.productName} tone="slate" />
            <DashboardChip label={campaign.is_active ? 'Actief' : 'Gesloten'} tone={campaign.is_active ? 'emerald' : 'slate'} />
            <DashboardChip label={stateMeta.label} tone={stateMeta.tone} />
          </div>
          <h2 className="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">{campaign.campaign_name}</h2>
        </div>

        <div className="grid gap-4 border-b border-[color:var(--dashboard-frame-border)]/75 pb-4 sm:grid-cols-2 xl:min-w-[380px] xl:grid-cols-2 2xl:min-w-[520px] 2xl:grid-cols-4">
          <StatCell label="Respons" value={`${campaign.completion_rate_pct ?? 0}%`} />
          <StatCell label="Ingevuld" value={`${campaign.total_completed}`} />
          <StatCell label="Uitgenodigd" value={`${campaign.total_invited}`} />
          <StatCell
            label={`Gem. ${scanDefinition.signalLabelLower}`}
            value={campaign.avg_risk_score !== null ? `${campaign.avg_risk_score.toFixed(1)}/10` : '—'}
          />
        </div>

        <div className="space-y-2 xl:col-span-2">
          <p className="max-w-none text-sm leading-[1.85] text-[color:var(--dashboard-text)]">{stateMeta.body}</p>
          {stateMeta.trust ? (
            <p className="max-w-none text-sm leading-[1.85] text-[color:var(--dashboard-muted)]">{stateMeta.trust}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-[color:var(--dashboard-frame-border)]/85 pt-4 lg:flex-row lg:items-center lg:justify-between xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--dashboard-text)]">
            <span className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-2.5 py-1 font-semibold text-[color:var(--dashboard-muted)]">
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
                className="inline-flex rounded-[6px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
              >
                Naar setup
              </Link>
            ) : null}
            <div className="relative">
              {showOnboarding ? <OnboardingBalloon step={1} label="Open je campagne" align="left" /> : null}
              <Link
                href={`/campaigns/${campaign.campaign_id}`}
                className="inline-flex rounded-[6px] border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:brightness-[0.97]"
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
    { key: 'building', label: 'Nog niet leesbaar', states: ['sparse', 'running', 'ready_to_launch', 'setup'] },
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

function getOverviewBlockerCopy(state: CampaignCompositionState) {
  const copy: Record<CampaignCompositionState, { title: string; body: string }> = {
    setup: {
      title: 'Respondentimport ontbreekt',
      body: 'Route is nog niet live gezet.',
    },
    ready_to_launch: {
      title: 'Uitnodigingen nog niet live',
      body: 'Inviteflow is nog niet gestart.',
    },
    running: {
      title: 'Respons nog onder drempel',
      body: 'Wacht op meer responses.',
    },
    sparse: {
      title: 'Eerste read te dun',
      body: 'Wacht op meer responses.',
    },
    partial: {
      title: 'Detail nog begrensd',
      body: 'Wacht op meer leesbare output.',
    },
    full: {
      title: 'Leesbaar',
      body: 'Dashboard en rapport beschikbaar.',
    },
    closed: {
      title: 'Afgerond',
      body: 'Route is afgerond. Rapport blijft beschikbaar.',
    },
  }

  return copy[state]
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
      body: 'Blocker: respondentimport of launchcontrole ontbreekt. Volgende stap: maak de route eerst live.',
      trust: '',
    },
    ready_to_launch: {
      label: 'Nog in opbouw',
      tone: 'amber' as const,
      nextStepLabel: 'Invites versturen',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Ready to launch',
      sectionDescription:
        'Campagnes waar de respondentlaag klaarstaat, maar waar uitnodigingen nog niet volledig live zijn gezet.',
      body: 'Blocker: uitnodigingen zijn nog niet volledig live. Volgende stap: start eerst de inviteflow.',
      trust: '',
    },
    running: {
      label: 'Nog in opbouw',
      tone: 'amber' as const,
      nextStepLabel: 'Respons volgen',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Invites live / running',
      sectionDescription:
        'Campagnes waar uitnodigingen lopen, maar waar nog geen eerste veilige responslaag zichtbaar hoort te worden.',
      body: 'Blocker: er is nog geen veilige responslaag. Volgende stap: wacht op meer responses.',
      trust: '',
    },
    sparse: {
      label: 'Nog in opbouw',
      tone: 'amber' as const,
      nextStepLabel: 'Meer respons nodig',
      viewerCta: 'Open uitvoerflow',
      sectionTitle: 'Sparse / indicatief',
      sectionDescription:
        'Campagnes met eerste responses, maar nog onder de veilige dashboarddrempel voor een eerlijke eerste duiding.',
      body: 'Eerste read beschikbaar, detail blijft nog beperkt.',
      trust: '',
    },
    partial: {
      label: 'Deels zichtbaar',
      tone: 'amber' as const,
      nextStepLabel: 'Compacte read',
      viewerCta: 'Open compacte read',
      sectionTitle: 'Deels zichtbaar',
      sectionDescription:
        'Campagnes waar de eerste veilige dashboardlaag open is, maar waar thresholds of privacy de verdiepingslaag nog begrenzen.',
      body: 'Eerste read beschikbaar, detail blijft nog beperkt.',
      trust: '',
    },
    full: {
      label: 'Leesbaar',
      tone: 'emerald' as const,
      nextStepLabel: 'Open dashboard',
      viewerCta: 'Open dashboard',
      sectionTitle: 'Volledig / klaar voor bespreking',
      sectionDescription:
        'Campagnes met genoeg respons en voldoende zichtbaarheid om dashboard, aanbevelingen en rapport als managementinstrument te gebruiken.',
      body: 'Dashboard en rapport zijn nu beschikbaar voor eerste lezing.',
      trust: '',
    },
    closed: {
      label: 'Afgerond',
      tone: 'slate' as const,
      nextStepLabel: 'Rapport beschikbaar',
      viewerCta: 'Open rapport en dashboard',
      sectionTitle: 'Gesloten / rapport eerst',
      sectionDescription:
        'Gesloten campagnes waar de nadruk nu op rapportage, terugblik en bestuurlijke opvolging hoort te liggen.',
      body: 'Route is afgerond. Rapport en dashboard blijven beschikbaar.',
      trust: '',
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

function CompactReadableRow({ entry }: { entry: CampaignHomeEntry }) {
  const { campaign, state } = entry
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const stateMeta = getHomeStateMeta(state)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-3.5">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <DashboardChip label={scanDefinition.productName} tone="slate" />
        <DashboardChip label={stateMeta.label} tone={stateMeta.tone} />
        <span className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          {campaign.campaign_name}
        </span>
      </div>
      <Link
        href={`/campaigns/${campaign.campaign_id}`}
        className="shrink-0 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
      >
        {stateMeta.viewerCta}
      </Link>
    </div>
  )
}

function BlockerRouteRow({ entry, isAdmin }: { entry: CampaignHomeEntry; isAdmin: boolean }) {
  const { campaign, state } = entry
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const stateMeta = getHomeStateMeta(state)
  const blockerCopy = getOverviewBlockerCopy(state)
  const href = isAdmin && state === 'setup' ? '/beheer' : `/campaigns/${campaign.campaign_id}`
  const ctaLabel = isAdmin && state === 'setup' ? 'Naar setup' : 'Open route'

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[color:var(--dashboard-frame-border)]/85 bg-transparent px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <DashboardChip label={scanDefinition.productName} tone="slate" />
          <DashboardChip label={stateMeta.label} tone="amber" />
        </div>
        <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          {campaign.campaign_name}
        </p>
        <p className="mt-1 text-sm text-[color:var(--dashboard-text)]">{blockerCopy.title}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
      >
        {ctaLabel}
      </Link>
    </div>
  )
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
