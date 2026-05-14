import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardSection } from '@/components/dashboard/dashboard-primitives'
import {
  getCampaignCompositionState,
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
import {
  getDashboardModuleKeyForScanType,
  getDashboardModuleLabel,
  getScanTypeForDashboardModule,
  normalizeDashboardModuleFilter,
  type DashboardCategoryModuleKey,
} from '@/lib/dashboard/shell-navigation'
import { getScanDefinition } from '@/lib/scan-definitions'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import { getCampaignAverageSignalScore, type CampaignStats } from '@/lib/types'

type CampaignHomeEntry = {
  campaign: CampaignStats
  state: CampaignCompositionState
  invitesNotSent: number
}

type OverviewRouteTone = 'slate' | 'blue' | 'emerald' | 'amber'
type CockpitBucket =
  | 'action_needed'
  | 'nearly_ready'
  | 'live_readable'
  | 'blocked_not_started'
  | 'recent_closed'
type CockpitStatusFilter = Exclude<CockpitBucket, 'recent_closed'> | 'all'

type CockpitRouteItem = {
  entry: CampaignHomeEntry
  bucket: CockpitBucket
  productLabel: string
  contextLabel: string
  stateLabel: string
  stateTone: OverviewRouteTone
  why: string
  nextStep: string
  ctaLabel: string
  ctaHref: string
  responseValue: string
}

type CockpitCounter = {
  key: Exclude<CockpitBucket, 'recent_closed'>
  label: string
  tone: OverviewRouteTone
  count: number
  body: string
}

const STATUS_FILTERS: Array<{ key: CockpitStatusFilter; label: string }> = [
  { key: 'all', label: 'Alle statussen' },
  { key: 'action_needed', label: 'Actie nodig' },
  { key: 'nearly_ready', label: 'Bijna klaar' },
  { key: 'live_readable', label: 'Live en leesbaar' },
  { key: 'blocked_not_started', label: 'Geblokkeerd / niet gestart' },
]

const MODULE_ORDER: DashboardCategoryModuleKey[] = [
  'exit',
  'retention',
  'onboarding',
  'pulse',
  'leadership',
]

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedModuleFilter = normalizeDashboardModuleFilter(
    typeof resolvedSearchParams?.module === 'string' ? resolvedSearchParams.module : undefined,
  )
  const requestedStatusFilter = normalizeDashboardStatusFilter(
    typeof resolvedSearchParams?.status === 'string' ? resolvedSearchParams.status : undefined,
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

  const allCampaigns = (stats ?? []) as CampaignStats[]
  const campaigns = requestedModuleFilter
    ? allCampaigns.filter((campaign) => campaign.scan_type === getScanTypeForDashboardModule(requestedModuleFilter))
    : allCampaigns
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
  const campaignEntries = campaigns.map((campaign) => {
    const invitesNotSent = invitesNotSentByCampaign.get(campaign.campaign_id)
    if (invitesNotSent === undefined) {
      throw new Error(`Missing invite state for campaign ${campaign.campaign_id}`)
    }

    return {
      campaign,
      invitesNotSent,
      state: getCampaignCompositionState({
        isActive: campaign.is_active,
        totalInvited: campaign.total_invited,
        totalCompleted: campaign.total_completed,
        invitesNotSent,
        incompleteScores: 0,
        hasMinDisplay: campaign.total_completed >= 5,
        hasEnoughData: campaign.total_completed >= 10,
      }),
    }
  })

  const moduleLabel = requestedModuleFilter ? getDashboardModuleLabel(requestedModuleFilter) : null
  const productFilters = buildAvailableModuleFilters(allCampaigns)
  const counters = buildCockpitCounters(campaignEntries)
  const activeEntries = campaignEntries.filter((entry) => entry.campaign.is_active)
  const primaryActiveEntries = activeEntries.filter((entry) =>
    ['exit', 'retention'].includes(entry.campaign.scan_type),
  )
  const readableEntries = [...campaignEntries]
    .filter((entry) => ['full', 'partial', 'closed'].includes(entry.state))
    .sort(
      (left, right) =>
        new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime(),
    )
  const primaryLeadEntry = selectPrimaryLeadEntry(primaryActiveEntries, readableEntries)
  const triageItems = buildTriageItems(campaignEntries, primaryLeadEntry)
  const blockedItems = buildBlockedItems(campaignEntries)
  const closedItems = buildRecentClosedItems(campaignEntries).slice(0, 3)
  const hasStatusFilter = requestedStatusFilter !== 'all'
  const filteredTriageItems =
    requestedStatusFilter === 'all'
      ? triageItems
      : triageItems.filter((item) => item.bucket === requestedStatusFilter)
  const showTriageSection =
    requestedStatusFilter === 'all' ||
    requestedStatusFilter === 'action_needed' ||
    requestedStatusFilter === 'nearly_ready' ||
    requestedStatusFilter === 'live_readable'
  const showBlockedSection =
    blockedItems.length > 0 &&
    (requestedStatusFilter === 'all' || requestedStatusFilter === 'blocked_not_started')
  const showClosedSection = closedItems.length > 0 && requestedStatusFilter === 'all'
  const filterEmptyMessage = hasStatusFilter && !showBlockedSection && filteredTriageItems.length === 0
  const contextLabel = moduleLabel ?? 'Alle routes'
  const activeStatusLabel = getStatusFilterLabel(requestedStatusFilter)
  const hasActiveFilters = requestedModuleFilter !== null || requestedStatusFilter !== 'all'

  return (
    <div className="space-y-8">
      {campaigns.length === 0 && isAdmin ? (
        <AdminEmptyState />
      ) : campaigns.length === 0 ? (
        requestedModuleFilter ? (
          <DashboardSection
            eyebrow={moduleLabel ?? 'Route'}
            title="Nog geen campagnes voor deze route"
            description="Zodra deze route live staat, verschijnt hier automatisch het volledige overzicht."
          >
            <div className="pt-1">
              <Link
                href="/dashboard"
                className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
              >
                Terug naar alle routes
              </Link>
            </div>
          </DashboardSection>
        ) : (
          <ViewerEmptyState />
        )
      ) : (
        <>
          <header className="space-y-5 border-b border-[color:var(--dashboard-frame-border)] pb-6">
            {requestedModuleFilter ? (
              <Link
                href={buildDashboardOverviewHref({ statusFilter: requestedStatusFilter })}
                className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
              >
                Terug naar alle routes
              </Link>
            ) : null}
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-[color:var(--dashboard-accent-soft)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-accent-strong)]">
                    Cockpit
                  </span>
                  <span className="text-sm font-medium text-[color:var(--dashboard-muted)]">{contextLabel}</span>
                </div>
                <h1 className="font-serif text-[2.25rem] leading-[0.95] tracking-[-0.05em] text-[color:var(--dashboard-ink)] sm:text-[2.8rem]">
                  Dashboard overview
                </h1>
                <p className="max-w-3xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">
                  Bekijk welke routes aandacht vragen en ga direct naar de juiste vervolglaag.
                </p>
              </div>
              <div className="rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:px-5">
                <div className="flex flex-col gap-3 border-b border-[color:var(--dashboard-frame-border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                      Filters
                    </p>
                    <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                      <span className="font-semibold text-[color:var(--dashboard-ink)]">Actief:</span>{' '}
                      {activeStatusLabel} · {contextLabel}
                    </p>
                  </div>
                  {hasActiveFilters ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                    >
                      Wis filters
                    </Link>
                  ) : (
                    <span className="text-sm text-[color:var(--dashboard-muted)]">Geen extra filters actief</span>
                  )}
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr),minmax(0,1fr)]">
                  <div className="space-y-2">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                      Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FILTERS.map((filter) => (
                        <FilterPill
                          key={filter.key}
                          href={buildDashboardOverviewHref({
                            moduleFilter: requestedModuleFilter,
                            statusFilter: filter.key,
                          })}
                          active={requestedStatusFilter === filter.key}
                          label={filter.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                      Product
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterPill
                        href={buildDashboardOverviewHref({ statusFilter: requestedStatusFilter })}
                        active={requestedModuleFilter === null}
                        label="Alle routes"
                      />
                      {productFilters.map((filterKey) => (
                        <FilterPill
                          key={filterKey}
                          href={buildDashboardOverviewHref({
                            moduleFilter: filterKey,
                            statusFilter: requestedStatusFilter,
                          })}
                          active={requestedModuleFilter === filterKey}
                          label={getDashboardModuleLabel(filterKey)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {counters.map((counter) => (
              <StatusCounterCard key={counter.key} counter={counter} />
            ))}
          </section>

          {showTriageSection ? (
            <section className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-[1.55rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                  Nu eerst
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
                  Deze routes vragen als eerste aandacht op basis van status, volgende stap of beschikbare output.
                </p>
              </div>
              {filteredTriageItems.length === 0 ? (
                <InlineEmptyState message="Geen routes vragen op dit moment actie." />
              ) : (
                <div className="space-y-4">
                  {filteredTriageItems.map((item, index) => (
                    <TriageRouteCard
                      key={item.entry.campaign.campaign_id}
                      item={item}
                      highlightLabel={index === 0 && requestedStatusFilter === 'all' ? 'Nu eerst' : undefined}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {showBlockedSection ? (
            <section className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                  Geblokkeerd / niet gestart
                </h2>
                <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                  Deze routes missen nog livegang en vragen eerst een operationele startstap.
                </p>
              </div>
              <div className="space-y-3">
                {blockedItems.map((item) => (
                  <BlockerRouteRow key={item.entry.campaign.campaign_id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {filterEmptyMessage ? (
            <InlineEmptyState message="Geen routes met deze status." />
          ) : null}

          {showClosedSection ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1.5">
                  <h2 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                    Recente afgeronde routes
                  </h2>
                  <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                    Gesloten routes die nu vooral rapport-first gelezen worden.
                  </p>
                </div>
                <Link
                  href="/reports"
                  className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                >
                  Open rapporten
                </Link>
              </div>
              <div className="space-y-3">
                {closedItems.map((item) => (
                  <ClosedRouteRow key={item.entry.campaign.campaign_id} item={item} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}

function normalizeDashboardStatusFilter(value: string | undefined): CockpitStatusFilter {
  if (
    value === 'action_needed' ||
    value === 'nearly_ready' ||
    value === 'live_readable' ||
    value === 'blocked_not_started'
  ) {
    return value
  }

  return 'all'
}

function getStatusFilterLabel(filter: CockpitStatusFilter) {
  return STATUS_FILTERS.find((item) => item.key === filter)?.label ?? 'Alle statussen'
}

function buildDashboardOverviewHref(args: {
  moduleFilter?: DashboardCategoryModuleKey | null
  statusFilter?: CockpitStatusFilter
}) {
  const params = new URLSearchParams()
  if (args.moduleFilter) {
    params.set('module', args.moduleFilter)
  }
  if (args.statusFilter && args.statusFilter !== 'all') {
    params.set('status', args.statusFilter)
  }

  const query = params.toString()
  return query ? `/dashboard?${query}` : '/dashboard'
}

function buildAvailableModuleFilters(campaigns: CampaignStats[]) {
  const availableKeys = new Set<DashboardCategoryModuleKey>()

  for (const campaign of campaigns) {
    if (campaign.scan_type === 'team') continue
    availableKeys.add(getDashboardModuleKeyForScanType(campaign.scan_type))
  }

  return MODULE_ORDER.filter((key) => availableKeys.has(key))
}

function mapStateToCockpitBucket(state: CampaignCompositionState): CockpitBucket {
  if (state === 'setup') return 'blocked_not_started'
  if (state === 'ready_to_launch' || state === 'running' || state === 'sparse') return 'action_needed'
  if (state === 'partial') return 'nearly_ready'
  if (state === 'full') return 'live_readable'
  return 'recent_closed'
}

function buildCockpitCounters(entries: CampaignHomeEntry[]): CockpitCounter[] {
  return [
    {
      key: 'action_needed',
      label: 'ACTIE NODIG',
      tone: 'amber',
      count: entries.filter((entry) => mapStateToCockpitBucket(entry.state) === 'action_needed').length,
      body: 'Routes waar livegang of extra respons eerst expliciet aandacht vraagt.',
    },
    {
      key: 'nearly_ready',
      label: 'BIJNA KLAAR',
      tone: 'blue',
      count: entries.filter((entry) => mapStateToCockpitBucket(entry.state) === 'nearly_ready').length,
      body: 'Routes waar de eerste leeslaag open is, maar de read nog begrensd blijft.',
    },
    {
      key: 'live_readable',
      label: 'LIVE EN LEESBAAR',
      tone: 'emerald',
      count: entries.filter((entry) => mapStateToCockpitBucket(entry.state) === 'live_readable').length,
      body: 'Routes die nu veilig genoeg zijn voor dashboardlezing.',
    },
    {
      key: 'blocked_not_started',
      label: 'GEBLOKKEERD / NIET GESTART',
      tone: 'slate',
      count: entries.filter((entry) => mapStateToCockpitBucket(entry.state) === 'blocked_not_started').length,
      body: 'Routes die nog niet live zijn en eerst operationeel gestart moeten worden.',
    },
  ]
}

function buildTriageItems(
  entries: CampaignHomeEntry[],
  primaryLeadEntry: CampaignHomeEntry | null,
) {
  const activeEntries = entries.filter((entry) => entry.campaign.is_active)
  const primaryEntries = activeEntries.filter((entry) => ['exit', 'retention'].includes(entry.campaign.scan_type))
  const boundedEntries = activeEntries.filter((entry) => !['exit', 'retention'].includes(entry.campaign.scan_type))
  const orderedEntries = [
    ...(primaryLeadEntry ? [primaryLeadEntry] : []),
    ...primaryEntries
      .filter((entry) => entry.campaign.campaign_id !== primaryLeadEntry?.campaign.campaign_id)
      .sort(compareOverviewEntries),
    ...boundedEntries.sort(compareOverviewEntries),
  ]

  return orderedEntries
    .filter((entry) => {
      const bucket = mapStateToCockpitBucket(entry.state)
      return bucket === 'action_needed' || bucket === 'nearly_ready' || bucket === 'live_readable'
    })
    .map(buildCockpitRouteItem)
}

function buildBlockedItems(entries: CampaignHomeEntry[]) {
  return entries
    .filter((entry) => entry.state === 'setup')
    .sort(compareOverviewEntries)
    .map(buildCockpitRouteItem)
}

function buildRecentClosedItems(entries: CampaignHomeEntry[]) {
  return entries
    .filter((entry) => entry.state === 'closed')
    .sort(
      (left, right) =>
        new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime(),
    )
    .map(buildCockpitRouteItem)
}

function buildCockpitRouteItem(entry: CampaignHomeEntry): CockpitRouteItem {
  const scanDefinition = getScanDefinition(entry.campaign.scan_type)
  const stateMeta = getHomeStateMeta(entry.state)
  const completionValue = Number.isFinite(entry.campaign.completion_rate_pct)
    ? `${entry.campaign.completion_rate_pct}%`
    : '—'
  const ctaLabel = getCtaLabelForState(entry.state)
  const bucket = mapStateToCockpitBucket(entry.state)

  return {
    entry,
    bucket,
    productLabel: scanDefinition.productName,
    contextLabel: `${formatCampaignPeriod(entry.campaign)} · ${scanDefinition.productName}`,
    stateLabel: stateMeta.label,
    stateTone: getToneForBucket(bucket),
    why: getWhyCopy(entry),
    nextStep: ctaLabel,
    ctaLabel,
    ctaHref:
      entry.state === 'setup' || entry.state === 'ready_to_launch' || entry.state === 'running'
        ? `/campaigns/${entry.campaign.campaign_id}/beheer`
        : `/campaigns/${entry.campaign.campaign_id}`,
    responseValue: completionValue,
  }
}

function getToneForBucket(bucket: CockpitBucket): OverviewRouteTone {
  if (bucket === 'live_readable') return 'emerald'
  if (bucket === 'nearly_ready') return 'blue'
  if (bucket === 'action_needed') return 'amber'
  return 'slate'
}

function getCtaLabelForState(state: CampaignCompositionState) {
  if (state === 'partial' || state === 'full') return 'Open dashboard'
  if (state === 'closed') return 'Open rapport'
  return 'Beheer route'
}

function getWhyCopy(entry: CampaignHomeEntry) {
  if (entry.state === 'setup' || entry.state === 'running') {
    return getOverviewBlockerCopy(entry)
  }

  return getHomeStateMeta(entry.state).body
}

function compareOverviewEntries(left: CampaignHomeEntry, right: CampaignHomeEntry) {
  const stateRank: Record<CampaignCompositionState, number> = {
    full: 0,
    partial: 1,
    sparse: 2,
    ready_to_launch: 3,
    running: 4,
    setup: 5,
    closed: 6,
  }

  const rankDelta = stateRank[left.state] - stateRank[right.state]
  if (rankDelta !== 0) return rankDelta

  const scoreDelta =
    (getCampaignAverageSignalScore(right.campaign) ?? -1) - (getCampaignAverageSignalScore(left.campaign) ?? -1)
  if (scoreDelta !== 0) return scoreDelta

  return new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
}

function selectPrimaryLeadEntry(
  primaryActiveEntries: CampaignHomeEntry[],
  readableEntries: CampaignHomeEntry[],
) {
  const readablePrimary = primaryActiveEntries
    .filter((entry) => ['full', 'partial'].includes(entry.state))
    .sort(compareOverviewEntries)[0]

  if (readablePrimary) return readablePrimary

  const readableAny = readableEntries
    .filter((entry) => ['exit', 'retention'].includes(entry.campaign.scan_type))
    .sort(compareOverviewEntries)[0]

  if (readableAny) return readableAny

  return primaryActiveEntries.sort(compareOverviewEntries)[0] ?? null
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
      counts.set(campaign.campaign_id, campaign.total_invited === 0 ? 0 : campaign.total_completed >= 5 ? 0 : 1)
    }
  }

  return counts
}

function getHomeStateMeta(state: CampaignCompositionState) {
  const meta = {
    setup: {
      label: 'Nog niet live',
      body: 'Respondentimport of livegang ontbreekt nog.',
    },
    ready_to_launch: {
      label: 'Nog in opbouw',
      body: 'Uitnodigingen zijn nog niet volledig live gezet.',
    },
    running: {
      label: 'Nog in opbouw',
      body: 'Er is nog geen eerste veilige responslaag zichtbaar.',
    },
    sparse: {
      label: 'Nog in opbouw',
      body: 'Meer respons nodig voordat deze route echt leesbaar wordt.',
    },
    partial: {
      label: 'Deels zichtbaar',
      body: 'Eerste read beschikbaar.',
    },
    full: {
      label: 'Leesbaar',
      body: 'Dashboard beschikbaar.',
    },
    closed: {
      label: 'Afgerond',
      body: 'Rapport beschikbaar.',
    },
  } satisfies Record<
    CampaignCompositionState,
    {
      label: string
      body: string
    }
  >

  return meta[state]
}

function getOverviewBlockerCopy(entry: CampaignHomeEntry) {
  if (entry.state === 'setup') return 'Respondentimport ontbreekt nog.'
  return 'Meer respons nodig voor een eerste read.'
}

function formatCampaignPeriod(campaign: CampaignStats) {
  const quarterMatch = campaign.campaign_name.match(/Q[1-4]\s?\d{4}/i)
  if (quarterMatch) return quarterMatch[0].replace(/\s+/, ' ')

  return new Intl.DateTimeFormat('nl-NL', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(campaign.created_at))
}

function getOverviewToneClasses(tone: OverviewRouteTone) {
  if (tone === 'emerald') {
    return {
      border: 'border-[color:var(--dashboard-accent-soft-border)]',
      accent: 'bg-[color:var(--dashboard-accent-strong)]',
      rail: 'border-l-[color:var(--dashboard-accent-strong)]',
      chip:
        'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[color:var(--dashboard-accent-strong)]',
      button:
        'bg-[color:var(--dashboard-accent-strong)] text-white hover:bg-[#00584f]',
    }
  }

  if (tone === 'blue') {
    return {
      border: 'border-[#c7d0dc]',
      accent: 'bg-[#8292a5]',
      rail: 'border-l-[#8292a5]',
      chip: 'border-[#d9e1ea] bg-[#f5f7fa] text-[#506071]',
      button: 'bg-[#1B2B3A] text-white hover:bg-[#24384b]',
    }
  }

  if (tone === 'amber') {
    return {
      border: 'border-[#e7d7af]',
      accent: 'bg-[#C88C20]',
      rail: 'border-l-[#C88C20]',
      chip: 'border-[#E7D7AF] bg-[#FBF4DF] text-[#7A5B18]',
      button: 'bg-[#1B2B3A] text-white hover:bg-[#24384b]',
    }
  }

  return {
    border: 'border-[color:var(--dashboard-frame-border)]',
    accent: 'bg-slate-300',
    rail: 'border-l-slate-300',
    chip:
      'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] text-[color:var(--dashboard-text)]',
    button:
      'bg-transparent text-[color:var(--dashboard-accent-strong)] hover:text-[color:var(--dashboard-ink)]',
  }
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[color:var(--dashboard-accent-strong)]'
          : 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] text-[color:var(--dashboard-text)] hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-ink)]'
      }`}
    >
      {label}
    </Link>
  )
}

function StatusCounterCard({ counter }: { counter: CockpitCounter }) {
  const tone = getOverviewToneClasses(counter.tone)

  return (
    <div className={`relative overflow-hidden rounded-[18px] border bg-white px-4 py-3.5 ${tone.border}`}>
      <div className={`absolute left-0 top-0 h-full w-[3px] ${tone.accent}`} />
      <p className="pl-2 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
        {counter.label}
      </p>
      <div className="mt-2.5 pl-2">
        <p className="dash-number text-[1.65rem] leading-none text-[color:var(--dashboard-ink)]">{counter.count}</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{counter.body}</p>
      </div>
      {counter.key === 'blocked_not_started' ? (
        <span className="absolute right-4 top-4 inline-flex h-2 w-2 rounded-full bg-[#C88C20]" />
      ) : null}
    </div>
  )
}

function TriageRouteCard({
  item,
  highlightLabel,
}: {
  item: CockpitRouteItem
  highlightLabel?: string
}) {
  const tone = getOverviewToneClasses(item.stateTone)

  return (
    <article className={`overflow-hidden rounded-[18px] border bg-white shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-shadow hover:shadow-[0_12px_24px_rgba(17,24,39,0.08)] ${tone.border}`}>
      <div className={`h-full border-l-4 ${tone.rail}`}>
        <div className="flex flex-col gap-5 px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {highlightLabel ? (
                  <span className="inline-flex rounded-full border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-2.5 py-1 text-[0.72rem] font-semibold text-[color:var(--dashboard-accent-strong)]">
                    {highlightLabel}
                  </span>
                ) : null}
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                  {item.contextLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                  {item.entry.campaign.campaign_name}
                </h3>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.78rem] font-semibold ${tone.chip}`}>
                  <span className={`inline-flex h-2 w-2 rounded-full ${tone.accent}`} />
                  {item.stateLabel}
                </span>
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
                Product: {item.productLabel}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr),180px,140px] xl:items-start">
              <MetricBlock label="WAAROM" value={item.why} />
              <MetricBlock label="VOLGENDE STAP" value={item.nextStep} />
              <MetricBlock label="RESPONS" value={item.responseValue} compact />
            </div>
          </div>
          <div className="xl:pl-6">
            <Link
              href={item.ctaHref}
              className={`inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors xl:min-w-[158px] ${tone.button}`}
            >
              {item.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function BlockerRouteRow({ item }: { item: CockpitRouteItem }) {
  return (
    <article className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr),160px] xl:flex-1 xl:grid-cols-[minmax(0,0.8fr),minmax(0,1fr),160px]">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
              {item.entry.campaign.campaign_name}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
              {item.productLabel}
            </p>
          </div>
          <MetricBlock label="REDEN" value={item.why} />
          <MetricBlock label="NEXT" value={item.nextStep} />
        </div>
        <Link
          href={item.ctaHref}
          className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  )
}

function ClosedRouteRow({ item }: { item: CockpitRouteItem }) {
  return (
    <article className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-4 opacity-70 transition-opacity hover:opacity-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            {item.entry.campaign.campaign_name}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--dashboard-muted)]">
            {item.productLabel}
          </p>
        </div>
        <Link
          href={item.ctaHref}
          className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  )
}

function MetricBlock({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="min-w-0">
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
        {label}
      </p>
      <p
        className={`mt-1.5 ${compact ? 'dash-number text-[1.02rem] leading-none' : 'text-sm leading-6'} text-[color:var(--dashboard-ink)]`}
      >
        {value}
      </p>
    </div>
  )
}

function InlineEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-6 text-sm leading-6 text-[color:var(--dashboard-text)]">
      {message}
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
          {
            step: '2',
            title: 'Campagne',
            body: 'Kies ExitScan of RetentieScan en zet de campagne op met de juiste metadata.',
          },
          {
            step: '3',
            title: 'Respondenten',
            body: 'Importeer respondenten en stuur uitnodigingen, zodat dit overzicht vanzelf in monitoring overgaat.',
          },
        ].map(({ step, title, body }) => (
          <div
            key={step}
            className="rounded-[var(--dashboard-radius-card)] px-4 py-4"
            style={{ background: 'var(--dashboard-surface)', border: '1px solid var(--dashboard-frame-border)' }}
          >
            <p
              className="text-[0.65rem] font-medium uppercase"
              style={{ color: 'var(--dashboard-muted)', letterSpacing: '0.18em' }}
            >
              Stap {step}
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
              {title}
            </p>
            <p className="mt-1.5 text-sm leading-[1.65]" style={{ color: 'var(--dashboard-text)' }}>
              {body}
            </p>
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
      description="Loep zet de campaign op, controleert de import en activeert daarna automatisch dit overzicht."
    >
      <div className="space-y-4">
        <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-5 text-sm leading-6 text-[color:var(--text)]">
          Zodra de eerste responses binnenkomen, verschijnen hier automatisch je campagnes, status en rapportacties.
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            'Loep beheert organisatie, campagne en respondentimport.',
            'Jij krijgt daarna toegang tot het juiste dashboard en rapport.',
            'De eerste managementwaarde zit in lezen, duiden en prioriteren, niet in technische setup.',
          ].map((item, index) => (
            <div
              key={item}
              className="rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--text)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Stap {index + 1}
              </p>
              <p className="mt-2">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  )
}
