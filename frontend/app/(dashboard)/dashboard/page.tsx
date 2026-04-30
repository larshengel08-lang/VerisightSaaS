import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  DashboardChip,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import {
  getCampaignCompositionState,
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
import {
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
  stateLabel: string
  stateTone: OverviewRouteTone
  summary: string
  metricLabel: string
  metricValue: string
  secondaryMetricLabel?: string
  secondaryMetricValue?: string
  ctaLabel: string
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
  const recentOutputEntries = buildRecentOutputEntries(campaignEntries).slice(0, 3)
  const moduleLabel = requestedModuleFilter ? getDashboardModuleLabel(requestedModuleFilter) : null
  const moduleIntro = moduleLabel
    ? `Alle ${moduleLabel}-routes op één plek. Zo zie je direct welke campaign nu leesbaar is en welke route nog aandacht vraagt.`
    : 'Wat nu aandacht vraagt, welke route daarbij hoort en wat je als eerste wilt openen.'
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
  const attentionItems = buildOverviewAttentionItems(campaignEntries, primaryLeadEntry).slice(0, 3)
  const compactActionCenterNote =
    leadReadableRouteActive
      ? 'Er staat al opvolging open in Action Center.'
      : leadReadableRouteOpenable
        ? 'Als vervolglogica nodig is, open je die in Action Center.'
        : 'Opvolging blijft compact tot een route stevig genoeg leesbaar is.'

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
              <p className="max-w-3xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">
                {moduleIntro}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 border-t border-[color:var(--dashboard-frame-border)] pt-4">
              <DashboardChip label={`${activeEntries.length} actieve routes`} tone="slate" />
              <DashboardChip label={`${managementReadyCount} leesbaar`} tone="emerald" />
              <DashboardChip label={`${notReadableCount} nog niet leesbaar`} tone="amber" />
              {closedCount > 0 ? (
                <DashboardChip label={`${closedCount} afgerond`} tone="slate" />
              ) : null}
              {openFollowUpCount > 0 ? (
                <DashboardChip label={`${openFollowUpCount} routes met vervolgleeslijn`} tone="slate" />
              ) : null}
            </div>
          </div>

          {primaryLeadItem ? (
            <section className="space-y-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                Nu eerst
              </p>
              <OverviewLeadCard item={primaryLeadItem} />
            </section>
          ) : null}

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
            <div className="space-y-3">
              {primaryRouteItems.map((item) => (
                <OverviewRouteRow key={item.entry.campaign.campaign_id} item={item} />
              ))}
            </div>
          </section>

          {!requestedModuleFilter && boundedItems.length > 0 ? (
            <section className="space-y-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                Overige actieve routes
              </p>
              <div className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 shadow-[0_1px_3px_rgba(10,25,47,0.03)] sm:px-5">
                {boundedItems.map((item) => (
                  <CompactOverviewRouteRow key={item.entry.campaign.campaign_id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

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

          <section className="rounded-xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)]/72 px-5 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)] sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--dashboard-muted)]">
                  Action Center
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[color:var(--dashboard-text)]">
                  {compactActionCenterNote}
                </p>
              </div>
              <Link
                href="/action-center"
                className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
              >
                Open Action Center
              </Link>
            </div>
          </section>
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

function OverviewLeadCard({ item }: { item: OverviewRouteItem }) {
  const tone = getOverviewToneClasses(item.stateTone)

  return (
    <div className="rounded-[26px] border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(252,250,247,0.98),rgba(244,240,234,0.92))] px-6 py-6 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:px-7">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),minmax(360px,0.85fr)] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <DashboardChip label={item.routeLabel} tone="slate" />
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.78rem] font-semibold ${tone.chip}`}>
              <span className={`inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
              {item.stateLabel}
            </span>
          </div>
          <h2 className="mt-4 text-[1.55rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)] sm:text-[1.8rem]">
            {item.entry.campaign.campaign_name}
          </h2>
          <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[color:var(--dashboard-text)]">
            {item.summary}
          </p>
          <div className="mt-5">
            <Link
              href={`/campaigns/${item.entry.campaign.campaign_id}`}
              className="inline-flex rounded-full bg-[color:var(--dashboard-ink)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17314A]"
            >
              {item.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <OverviewMetricCard
            label={item.metricLabel}
            value={item.metricValue}
            hint={`${item.entry.campaign.total_completed} ingevuld`}
          />
          <OverviewMetricCard
            label="Uitgenodigd"
            value={`${item.entry.campaign.total_invited}`}
            hint={`${item.entry.campaign.band_high}/${item.entry.campaign.band_medium}/${item.entry.campaign.band_low} hoog/midden/laag`}
          />
          <OverviewMetricCard
            label={item.secondaryMetricLabel ?? 'Signaal'}
            value={item.secondaryMetricValue ?? 'Nog niet vrij'}
            hint={item.entry.state === 'partial' ? 'Begrensde managementread' : 'Managementread beschikbaar'}
          />
          <OverviewMetricCard
            label="Periode"
            value={formatCampaignPeriod(item.entry.campaign)}
            hint={item.routeLabel}
          />
        </div>
      </div>
    </div>
  )
}

function OverviewMetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-white/82 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
        {label}
      </p>
      <p className="dash-number mt-3 text-[1.65rem] leading-none text-[color:var(--dashboard-ink)]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{hint}</p> : null}
    </div>
  )
}

function OverviewRouteRow({ item }: { item: OverviewRouteItem }) {
  const tone = getOverviewToneClasses(item.stateTone)

  return (
    <Link
      href={`/campaigns/${item.entry.campaign.campaign_id}`}
      className="group block rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-4 shadow-[0_1px_3px_rgba(10,25,47,0.03)] transition-colors hover:bg-[#fcfaf7] sm:px-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <DashboardChip label={item.routeLabel} tone="slate" />
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.78rem] font-semibold ${tone.chip}`}>
              <span className={`inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
              {item.stateLabel}
            </span>
          </div>
          <h3 className="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
            {item.entry.campaign.campaign_name}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">{item.summary}</p>
        </div>

        <div className="grid min-w-[240px] gap-3 sm:grid-cols-2 xl:min-w-[320px]">
          <OverviewInlineMetric label={item.metricLabel} value={item.metricValue} />
          <OverviewInlineMetric label={item.secondaryMetricLabel ?? 'Signaal'} value={item.secondaryMetricValue ?? 'Nog niet vrij'} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--dashboard-frame-border)]/75 pt-4">
        <span className="text-sm text-[color:var(--dashboard-muted)]">{formatCampaignPeriod(item.entry.campaign)}</span>
        <span className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors group-hover:text-[color:var(--dashboard-ink)]">
          {item.ctaLabel}
        </span>
      </div>
    </Link>
  )
}

function CompactOverviewRouteRow({ item }: { item: OverviewRouteItem }) {
  return (
    <Link
      href={`/campaigns/${item.entry.campaign.campaign_id}`}
      className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--dashboard-frame-border)]/75 py-3.5 last:border-b-0"
    >
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
          {item.routeLabel}
        </p>
        <p className="mt-1.5 truncate text-sm font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          {item.entry.campaign.campaign_name}
        </p>
        <p className="mt-1 text-sm text-[color:var(--dashboard-text)]">{item.summary}</p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-[color:var(--dashboard-accent-strong)] transition-colors hover:text-[color:var(--dashboard-ink)]">
        {item.ctaLabel}
      </span>
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
    <div className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white/72 px-3.5 py-3">
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
        {label}
      </p>
      <p className="dash-number mt-2 text-[1.15rem] leading-none text-[color:var(--dashboard-ink)]">{value}</p>
    </div>
  )
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
