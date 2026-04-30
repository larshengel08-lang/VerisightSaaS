import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardSection } from '@/components/dashboard/dashboard-primitives'
import {
  getCampaignCompositionState,
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
import {
  type ActionCenterRouteOpenRecord,
  canOpenActionCenterRoute,
  hasOpenedActionCenterRoute,
} from '@/lib/dashboard/open-action-center-route'
import {
  getDashboardModuleLabel,
  getScanTypeForDashboardModule,
  normalizeDashboardModuleFilter,
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

type OverviewRouteTone = 'emerald' | 'amber' | 'slate'

type OverviewRouteItem = {
  entry: CampaignHomeEntry
  routeLabel: string
  contextLabel: string
  stateLabel: string
  stateTone: OverviewRouteTone
  summary: string
  metricLabel: string
  metricValue: string
  secondaryMetricLabel?: string
  secondaryMetricValue?: string
  ctaLabel: string
  bounded: boolean
}

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedModuleFilter = normalizeDashboardModuleFilter(
    typeof resolvedSearchParams?.module === 'string' ? resolvedSearchParams.module : undefined,
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
  const { data: deliveryRecordsRaw } =
    campaignIds.length > 0
      ? await supabase
          .from('campaign_delivery_records')
          .select('campaign_id, lifecycle_stage, first_management_use_confirmed_at')
          .in('campaign_id', campaignIds)
      : { data: [] }
  const deliveryRecords = (deliveryRecordsRaw ?? []) as Array<
    { campaign_id: string } & ActionCenterRouteOpenRecord
  >
  const deliveryRecordByCampaign = new Map(
    deliveryRecords.map((record) => [record.campaign_id, record] as const),
  )
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
  const fullCount = campaignEntries.filter((entry) => entry.state === 'full').length
  const partialCount = campaignEntries.filter((entry) => entry.state === 'partial').length
  const closedCount = campaignEntries.filter((entry) => entry.state === 'closed').length
  const managementReadyCount = fullCount + partialCount
  const notReadableCount = campaignEntries.filter((entry) =>
    ['setup', 'ready_to_launch', 'running', 'sparse'].includes(entry.state),
  ).length
  const openFollowUpCount = campaignEntries.filter((entry) => ['full', 'partial'].includes(entry.state)).length
  const readableEntries = [...campaignEntries]
    .filter((entry) => ['full', 'partial', 'closed'].includes(entry.state))
    .sort(
      (left, right) =>
        new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime(),
    )
  const recentOutputEntries = buildRecentOutputEntries(campaignEntries).slice(0, 3)
  const moduleLabel = requestedModuleFilter ? getDashboardModuleLabel(requestedModuleFilter) : null
  const moduleIntro = moduleLabel
    ? `Wat nu leesbaar is, wat blokkeert en waar opvolging openstaat.`
    : 'Wat nu leesbaar is, wat blokkeert en waar opvolging openstaat.'
  const activeEntries = campaignEntries.filter((entry) => entry.campaign.is_active)
  const primaryActiveEntries = activeEntries.filter((entry) =>
    ['exit', 'retention'].includes(entry.campaign.scan_type),
  )
  const boundedActiveEntries = activeEntries.filter(
    (entry) => !['exit', 'retention'].includes(entry.campaign.scan_type),
  )
  const primaryLeadEntry = selectPrimaryLeadEntry(primaryActiveEntries, readableEntries)
  const primaryLeadItem = primaryLeadEntry ? buildOverviewRouteItem(primaryLeadEntry) : null
  const primaryRouteItems = (
    requestedModuleFilter ? activeEntries : primaryActiveEntries
  )
    .filter((entry) => entry.campaign.campaign_id !== primaryLeadEntry?.campaign.campaign_id)
    .sort(compareOverviewEntries)
    .map(buildOverviewRouteItem)
  const boundedItems = boundedActiveEntries.sort(compareOverviewEntries).map(buildOverviewRouteItem)
  const activeRouteItems = [
    ...(primaryLeadItem ? [primaryLeadItem] : []),
    ...primaryRouteItems,
    ...(!requestedModuleFilter ? boundedItems : []),
  ]
  const attentionItems = buildOverviewAttentionItems(campaignEntries, primaryLeadEntry).slice(0, 3)
  const blockerItems = buildOverviewBlockerItems(campaignEntries).slice(0, 3)
  const openFollowUpItems = readableEntries.filter((entry) => {
    const record = deliveryRecordByCampaign.get(entry.campaign.campaign_id)
    return record ? canOpenActionCenterRoute(record) : false
  })
  const activeFollowUpItems = readableEntries.filter((entry) => {
    const record = deliveryRecordByCampaign.get(entry.campaign.campaign_id)
    return record ? hasOpenedActionCenterRoute(record) : false
  })
  const unconfirmedFollowUpCount = openFollowUpItems.filter((entry) => {
    const record = deliveryRecordByCampaign.get(entry.campaign.campaign_id)
    return record ? !record.first_management_use_confirmed_at : false
  }).length
  const followUpPreviewRows = [
    openFollowUpItems[0]
      ? { label: 'Open prioriteit', value: openFollowUpItems[0].campaign.campaign_name }
      : null,
    activeFollowUpItems[0]
      ? { label: 'Reviewmoment', value: 'Open in Action Center' }
      : null,
    unconfirmedFollowUpCount > 0
      ? {
          label: 'Zonder bevestiging',
          value: `${unconfirmedFollowUpCount} ${unconfirmedFollowUpCount === 1 ? 'route' : 'routes'}`,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

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
          <div className="space-y-4">
            {requestedModuleFilter ? (
              <Link
                href="/dashboard"
                className="inline-flex text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
              >
                Terug naar alle routes
              </Link>
            ) : null}
            <div className="space-y-1">
              <h1 className="font-serif text-[2.2rem] leading-[0.95] tracking-[-0.05em] text-[color:var(--dashboard-ink)] sm:text-[2.7rem]">
                {moduleLabel ?? 'Overzicht'}
              </h1>
              <p className="max-w-2xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">
                {moduleIntro}
              </p>
            </div>
            <div className="grid gap-3 border-t border-[color:var(--dashboard-frame-border)] pt-4 md:grid-cols-3 xl:grid-cols-4">
              <OverviewSummaryCard label="Leesbaar" value={managementReadyCount} />
              <OverviewSummaryCard label="Nog niet leesbaar" value={notReadableCount} />
              <OverviewSummaryCard label="Afgerond" value={closedCount} />
              {openFollowUpCount > 0 ? (
                <OverviewSummaryCard label="Opvolging open" value={openFollowUpCount} />
              ) : null}
            </div>
          </div>

          {attentionItems.length > 0 ? (
            <section className="space-y-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                Ook aandacht
              </p>
              <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]/68 px-4 py-3 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
                <div className="space-y-2.5">
                  {attentionItems.map((item) => (
                    <Link
                      key={item.entry.campaign.campaign_id}
                      href={`/campaigns/${item.entry.campaign.campaign_id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/70"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <span
                          className={`inline-flex h-2.5 w-2.5 rounded-full ${
                            item.stateTone === 'emerald'
                              ? 'bg-[#3C8D8A]'
                              : item.stateTone === 'amber'
                                ? 'bg-[#C88C20]'
                                : 'bg-[#8A7D6E]'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
                            {item.entry.campaign.campaign_name}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--dashboard-text)]">{item.summary}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[color:var(--dashboard-accent-strong)]">
                        Open route
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                Actieve routes
              </p>
              {moduleLabel ? (
                <p className="text-sm text-[color:var(--dashboard-muted)]">{moduleLabel}</p>
              ) : null}
            </div>
            <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 shadow-[0_1px_3px_rgba(10,25,47,0.03)] sm:px-5">
              {activeRouteItems.map((item, index) => (
                <OverviewRouteRow
                  key={item.entry.campaign.campaign_id}
                  item={item}
                  highlightLabel={index === 0 ? 'Nu eerst' : undefined}
                />
              ))}
            </div>
          </section>

          {blockerItems.length > 0 ? (
            <section className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                  Wat blokkeert
                </p>
                <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                  Wat nog voorkomt dat een route open of volledig live is.
                </p>
              </div>
              <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 shadow-[0_1px_3px_rgba(10,25,47,0.03)] sm:px-5">
                {blockerItems.map((item) => (
                  <Link
                    key={item.entry.campaign.campaign_id}
                    href={`/campaigns/${item.entry.campaign.campaign_id}`}
                    className="grid gap-2 border-b border-[color:var(--dashboard-frame-border)]/75 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1.3fr),minmax(0,1fr),auto] sm:items-center sm:gap-4"
                  >
                    <p className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
                      {item.entry.campaign.campaign_name}
                    </p>
                    <p className="text-sm text-[color:var(--dashboard-text)]">{item.blocker}</p>
                    <span className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)]">
                      Open route
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr),minmax(0,1.08fr)]">
            <section className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]/58 px-5 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)] sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                  Opvolging preview
                </p>
                <Link
                  href="/action-center"
                  className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                >
                  Open Action Center
                </Link>
              </div>
              <div className="mt-3 space-y-2.5">
                {followUpPreviewRows.length > 0 ? (
                  followUpPreviewRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-[color:var(--dashboard-muted)]">{row.label}</span>
                      <span className="font-semibold text-[color:var(--dashboard-ink)]">{row.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
                    Nog geen open opvolging.
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                  Wat nu leesbaar is
                </p>
                <Link
                  href="/reports"
                  className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                >
                  Open rapporten
                </Link>
              </div>
              <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 shadow-[0_1px_3px_rgba(10,25,47,0.03)] sm:px-5">
                {recentOutputEntries.map((entry) => {
                  const scanDefinition = getScanDefinition(entry.campaign.scan_type)

                  return (
                    <div
                      key={entry.campaign.campaign_id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--dashboard-frame-border)]/75 py-3.5 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                          {scanDefinition.productName} · {entry.state === 'partial' ? 'Begrensde read' : 'Kernoutput'}
                        </p>
                        <p className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
                          {entry.campaign.campaign_name}
                        </p>
                      </div>
                      <Link
                        href={`/campaigns/${entry.campaign.campaign_id}`}
                        className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]"
                      >
                        {entry.state === 'closed' ? 'Open rapport' : 'Open route'}
                      </Link>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function buildRecentOutputEntries(entries: CampaignHomeEntry[]) {
  return [...entries]
    .filter((entry) => ['partial', 'full', 'closed'].includes(entry.state))
    .sort((left, right) => {
      const stateWeight = (entry: CampaignHomeEntry) =>
        entry.state === 'partial' ? 1 : entry.state === 'closed' ? 2 : 3
      const scanWeight = (entry: CampaignHomeEntry) =>
        entry.campaign.scan_type === 'exit' || entry.campaign.scan_type === 'retention' ? 2 : 1
      const weightDelta = stateWeight(right) - stateWeight(left)
      if (weightDelta !== 0) return weightDelta
      const scanDelta = scanWeight(right) - scanWeight(left)
      if (scanDelta !== 0) return scanDelta
      return new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
    })
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
      body: 'Eerste read beschikbaar.',
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
      body: 'Eerste read beschikbaar.',
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
      body: 'Dashboard beschikbaar.',
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
      body: 'Rapport beschikbaar.',
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

function compareOverviewEntries(left: CampaignHomeEntry, right: CampaignHomeEntry) {
  const stateRank: Record<CampaignCompositionState, number> = {
    full: 0,
    partial: 1,
    sparse: 2,
    running: 3,
    ready_to_launch: 4,
    setup: 5,
    closed: 6,
  }

  const rankDelta = stateRank[left.state] - stateRank[right.state]
  if (rankDelta !== 0) return rankDelta

  const scoreDelta = (right.campaign.avg_risk_score ?? -1) - (left.campaign.avg_risk_score ?? -1)
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

function buildOverviewRouteItem(entry: CampaignHomeEntry): OverviewRouteItem {
  const scanDefinition = getScanDefinition(entry.campaign.scan_type)
  const stateMeta = getHomeStateMeta(entry.state)
  const signalValue =
    entry.campaign.avg_risk_score !== null ? `${entry.campaign.avg_risk_score.toFixed(1)}/10` : 'Nog niet vrij'
  const completionValue = `${entry.campaign.completion_rate_pct ?? 0}%`

  return {
    entry,
    routeLabel: scanDefinition.productName,
    contextLabel: `${formatCampaignPeriod(entry.campaign)} · ${scanDefinition.productName}`,
    stateLabel: stateMeta.label,
    stateTone: stateMeta.tone,
    summary: stateMeta.body,
    metricLabel: 'Respons',
    metricValue: completionValue,
    secondaryMetricLabel: scanDefinition.signalLabel,
    secondaryMetricValue: signalValue,
    ctaLabel:
      entry.state === 'closed'
        ? 'Open rapport'
        : entry.state === 'partial'
          ? 'Open compacte read'
          : stateMeta.viewerCta,
    bounded: !['exit', 'retention'].includes(entry.campaign.scan_type),
  }
}

function buildOverviewAttentionItems(
  entries: CampaignHomeEntry[],
  primaryLeadEntry: CampaignHomeEntry | null,
) {
  return [...entries]
    .filter((entry) => entry.campaign.campaign_id !== primaryLeadEntry?.campaign.campaign_id)
    .filter((entry) => ['partial', 'running', 'sparse', 'full'].includes(entry.state))
    .sort(compareOverviewEntries)
    .map(buildOverviewRouteItem)
}

function getOverviewToneClasses(tone: OverviewRouteTone) {
  if (tone === 'emerald') {
    return {
      dot: 'bg-[#3C8D8A]',
      chip: 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[color:var(--dashboard-accent-strong)]',
    }
  }

  if (tone === 'amber') {
    return {
      dot: 'bg-[#C88C20]',
      chip: 'border-[#E7D7AF] bg-[#FBF4DF] text-[#7A5B18]',
    }
  }

  return {
    dot: 'bg-[#8A7D6E]',
    chip: 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] text-[color:var(--dashboard-text)]',
  }
}

function OverviewSummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="dash-number text-[1.45rem] leading-none text-[color:var(--dashboard-ink)]">{value}</p>
        <p className="text-sm text-[color:var(--dashboard-text)]">
          {value} {value === 1 ? 'route' : 'routes'}
        </p>
      </div>
    </div>
  )
}

function OverviewRouteRow({
  item,
  highlightLabel,
}: {
  item: OverviewRouteItem
  highlightLabel?: string
}) {
  const tone = getOverviewToneClasses(item.stateTone)

  return (
    <Link
      href={`/campaigns/${item.entry.campaign.campaign_id}`}
      className={`group block border-b border-[color:var(--dashboard-frame-border)]/75 py-4 last:border-b-0 ${
        item.bounded ? 'opacity-90' : ''
      }`}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_128px_128px_auto] xl:items-center xl:gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {highlightLabel ? (
              <span className="inline-flex rounded-full border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-2.5 py-1 text-[0.74rem] font-semibold text-[color:var(--dashboard-accent-strong)]">
                {highlightLabel}
              </span>
            ) : null}
            <span className="text-[0.78rem] font-semibold tracking-[0.04em] text-[color:var(--dashboard-muted)]">
              {item.contextLabel}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h3 className="text-[1.03rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
              {item.entry.campaign.campaign_name}
            </h3>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.78rem] font-semibold ${tone.chip}`}>
              <span className={`inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
              {item.stateLabel}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[color:var(--dashboard-text)]">{item.summary}</p>
        </div>

        <OverviewInlineMetric label={item.metricLabel} value={item.metricValue} />
        <OverviewInlineMetric
          label={item.secondaryMetricLabel ?? 'Signaal'}
          value={item.secondaryMetricValue ?? 'Nog niet vrij'}
        />
        <span className="justify-self-start text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors group-hover:text-[color:var(--dashboard-ink)] xl:justify-self-end">
          {item.ctaLabel}
        </span>
      </div>
    </Link>
  )
}

function OverviewInlineMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
        {label}
      </p>
      <p className="dash-number mt-1.5 text-[1.08rem] leading-none text-[color:var(--dashboard-ink)]">{value}</p>
    </div>
  )
}

function buildOverviewBlockerItems(entries: CampaignHomeEntry[]) {
  return [...entries]
    .filter((entry) => ['setup', 'ready_to_launch', 'running', 'sparse'].includes(entry.state))
    .sort(compareOverviewEntries)
    .map((entry) => ({
      entry,
      blocker: getOverviewBlockerCopy(entry),
    }))
}

function getOverviewBlockerCopy(entry: CampaignHomeEntry) {
  if (entry.state === 'setup') return 'Respondentimport ontbreekt nog.'
  if (entry.state === 'ready_to_launch') return 'Uitnodigingen zijn nog niet live.'
  if (entry.state === 'running') return 'Er is nog geen veilige responslaag.'
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
