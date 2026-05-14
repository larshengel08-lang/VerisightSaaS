import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isLiveActionCenterScanType } from '@/lib/action-center-live'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import {
  buildActionCenterRouteOpenPatch,
  buildActionCenterRouteOpenRedirect,
  canOpenActionCenterRoute,
  getActionCenterRouteOpenableStages,
  hasOpenedActionCenterRoute,
} from '@/lib/dashboard/open-action-center-route'
import { getManagementBandLabel } from '@/lib/management-language'
import { getScanDefinition } from '@/lib/scan-definitions'
import {
  getDashboardModuleHref,
  getDashboardModuleKeyForScanType,
  getDashboardModuleLabel,
} from '@/lib/dashboard/shell-navigation'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { FACTOR_LABELS, hasCampaignAddOn } from '@/lib/types'
import type { CampaignStats, Respondent, ScanType, SurveyResponse } from '@/lib/types'
import {
  buildOpenAnswerItems,
  buildOpenAnswersViewModel,
} from './open-answers-view-model'
import {
  buildCampaignDetailActionCenterBridge,
  MethodologyCard,
  MIN_N_DISPLAY,
  MIN_N_PATTERNS,
  clusterRetentionOpenSignals,
  computeAverageSignalScore,
  computeFactorAverages,
  computeRetentionSupplementalAverages,
  computeStrongWorkSignalRate,
  getLargestDistributionSegment,
  getTopContributingReasonLabel,
  getTopExitReasonLabel,
} from './page-helpers'
import { PdfDownloadButton } from './pdf-download-button'
import { ResultsLayout } from './results-layout'
import {
  buildResultsViewModel,
  type ResultsBlockVisibility,
} from './results-view-model'

interface Props {
  params: Promise<{ id: string }>
}

type FactorRow = {
  factor: string
  score: string
  scoreValue: number
  signal: string
  signalValue: number
  band: string
  note: string
}

type SdtRow = {
  factor: string
  score: string
  scoreValue: number
  signal: string
  band: string
  note: string
}

type MetricItem = {
  label: string
  value: string
  caption: string
}

type SummaryItem = {
  label: string
  title: string
  body: string
}

const PRIMARY_RESULTS_ORDER = {
  response: 'Responsbasis',
  signal: 'Kernsignaal',
  synthesis: 'Signalen in samenhang',
  drivers: 'Drivers & prioriteiten',
  depth: 'Verdiepingslagen',
  voices: 'Survey-stemmen',
} as const

function formatRoutePeriodLabel(campaignName: string, createdAt: string) {
  const quarterMatch = campaignName.match(/Q[1-4]\s?\d{4}/i)
  if (quarterMatch) return quarterMatch[0].replace(/\s+/, ' ')

  return new Intl.DateTimeFormat('nl-NL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt))
}

function deriveScopeLabel(respondents: Respondent[]) {
  const departments = Array.from(
    new Set(respondents.map((respondent) => respondent.department).filter(Boolean)),
  ) as string[]

  if (departments.length === 0) return 'Scope binnen deze route'
  if (departments.length === 1) return departments[0]
  if (departments.length === 2) return `${departments[0]} & ${departments[1]}`
  return `${departments[0]}, ${departments[1]} + ${departments.length - 2} meer`
}

function getDashboardModuleBackLinkLabel(scanType: CampaignStats['scan_type']) {
  if (scanType === 'exit') return 'Terug naar alle ExitScans'
  if (scanType === 'retention') return 'Terug naar alle RetentieScans'
  if (scanType === 'onboarding') return 'Terug naar alle Onboarding 30-60-90-routes'
  if (scanType === 'pulse') return 'Terug naar alle Pulse-routes'
  if (scanType === 'leadership') return 'Terug naar alle Leadership Scans'
  return 'Terug naar overzicht'
}

function formatScore(value: number | null) {
  return value === null ? 'Nog niet beschikbaar' : `${value.toFixed(1)}/10`
}

function formatPercent(value: number | null) {
  return value === null ? 'Nog niet beschikbaar' : `${Math.round(value)}%`
}

function truncateText(value: string, limit = 140) {
  return value.length > limit ? `${value.slice(0, limit - 3).trimEnd()}...` : value
}

function buildResponseContextNote(totalCompleted: number, completionRate: number) {
  if (totalCompleted >= MIN_N_PATTERNS) {
    return `${completionRate}% respons en ${totalCompleted} ingevulde responses liggen boven de analysegrens van ${MIN_N_PATTERNS}.`
  }

  if (totalCompleted >= MIN_N_DISPLAY) {
    return `${completionRate}% respons en ${totalCompleted} ingevulde responses liggen boven de weergavegrens van ${MIN_N_DISPLAY}, maar nog onder de analysegrens van ${MIN_N_PATTERNS}.`
  }

  return `${totalCompleted} ingevulde responses. Detailweergave opent vanaf ${MIN_N_DISPLAY} responses.`
}

function buildExitPictureDistribution(responses: SurveyResponse[]) {
  const counts = {
    work: 0,
    pull: 0,
    situational: 0,
  }

  for (const response of responses) {
    const code = response.exit_reason_code
    if (!code) continue
    if (code.startsWith('PL')) counts.pull += 1
    else if (code.startsWith('S')) counts.situational += 1
    else counts.work += 1
  }

  const total = counts.work + counts.pull + counts.situational
  const toPercent = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

  return {
    total,
    segments: [
      {
        label: 'Werkgerelateerde redenen',
        value: `${toPercent(counts.work)}%`,
        percent: toPercent(counts.work),
      },
      {
        label: 'Trekfactoren elders',
        value: `${toPercent(counts.pull)}%`,
        percent: toPercent(counts.pull),
      },
      {
        label: 'Situationele redenen',
        value: `${toPercent(counts.situational)}%`,
        percent: toPercent(counts.situational),
      },
    ],
  }
}

function buildFactorPriorityRows(factorAverages: Record<string, number>) {
  return Object.entries(factorAverages)
    .map(([factor, score]) => {
      const signalValue = 11 - score

      return {
        factor: FACTOR_LABELS[factor] ?? factor,
        score: `${score.toFixed(1)}/10`,
        scoreValue: score,
        signal: `${signalValue.toFixed(1)}/10`,
        signalValue,
        band: getManagementBandLabel(signalValue),
        note:
          signalValue >= 7
            ? 'Laagste ervaren score in deze route.'
            : signalValue >= 4.5
              ? 'Zichtbaar in het huidige patroon.'
              : 'Nu minder uitgesproken dan de bovenste factoren.',
      } satisfies FactorRow
    })
    .sort((left, right) => right.signalValue - left.signalValue)
}

function buildSdtRows(sdtAverages: {
  autonomy?: number
  competence?: number
  relatedness?: number
}) {
  return [
    { label: 'Autonomie', value: sdtAverages.autonomy },
    { label: 'Competentie & groei', value: sdtAverages.competence },
    { label: 'Verbondenheid', value: sdtAverages.relatedness },
  ]
    .filter((item) => typeof item.value === 'number')
    .map((item) => {
      const scoreValue = Number(item.value)
      const signalValue = 11 - scoreValue

      return {
        factor: item.label,
        score: `${scoreValue.toFixed(1)}/10`,
        scoreValue,
        signal: `${signalValue.toFixed(1)}/10`,
        band: getManagementBandLabel(signalValue),
        note:
          signalValue >= 7
            ? 'Duidelijk zichtbaar in de verdiepingslaag.'
            : signalValue >= 4.5
              ? 'Aanwezig als aanvullende context.'
              : 'Nu minder uitgesproken dan de andere SDT-lagen.',
      } satisfies SdtRow
    })
}

function getResultsStatusLabel(readState: ReturnType<typeof buildResultsViewModel>['readState']) {
  if (readState === 'readable') return 'Leesbaar'
  if (readState === 'early-read') return 'Eerste read'
  return 'Nog aan het opbouwen'
}

function buildSignalHighlights(args: {
  scanType: ScanType
  signalLabel: string
  isVisible: boolean
  averageSignalScore: number | null
  topFactorLabel: string | null
  strongWorkSignalRate: number | null
  supplemental: ReturnType<typeof computeRetentionSupplementalAverages>
}) {
  const items: MetricItem[] = [
    {
      label: args.signalLabel,
      value: args.isVisible ? formatScore(args.averageSignalScore) : 'Nog niet beschikbaar',
      caption: args.isVisible
        ? 'Gemiddelde score over de leesbare responses.'
        : `Beschikbaar vanaf ${MIN_N_DISPLAY} responses.`,
    },
  ]

  if (args.scanType === 'exit') {
    items.push(
      {
        label: 'Sterkste factor',
        value: args.isVisible ? args.topFactorLabel ?? 'Nog niet beschikbaar' : 'Nog niet beschikbaar',
        caption: 'Factor met de laagste gemiddelde belevingsscore in deze route.',
      },
      {
        label: 'Sterk werksignaal',
        value: args.isVisible ? formatPercent(args.strongWorkSignalRate) : 'Nog niet beschikbaar',
        caption: 'Aandeel responses met een sterk werkgerelateerd signaal.',
      },
    )

    return items
  }

  if (args.scanType === 'retention') {
    items.push(
      {
        label: 'Bevlogenheid',
        value: args.isVisible ? formatScore(args.supplemental.engagement) : 'Nog niet beschikbaar',
        caption: 'Gemiddelde UWES-score binnen de leesbare responses.',
      },
      {
        label: 'Stay-intent',
        value: args.isVisible ? formatScore(args.supplemental.stayIntent) : 'Nog niet beschikbaar',
        caption: 'Gemiddelde richtingsscore op groepsniveau.',
      },
    )

    return items
  }

  items.push(
    {
      label: 'Richtingsvraag',
      value: args.isVisible ? formatScore(args.supplemental.stayIntent) : 'Nog niet beschikbaar',
      caption: 'Gemiddelde richtingsscore op groepsniveau.',
    },
    {
      label: 'Topfactor',
      value: args.isVisible ? args.topFactorLabel ?? 'Nog niet beschikbaar' : 'Nog niet beschikbaar',
      caption: 'Factor met de laagste gemiddelde belevingsscore in deze route.',
    },
  )

  return items
}

function buildSynthesisItems(args: {
  scanType: ScanType
  topFactorLabel: string | null
  secondFactorLabel: string | null
  topExitReasonLabel: string | null
  topContributingReasonLabel: string | null
  retentionThemes: ReturnType<typeof clusterRetentionOpenSignals>
  openAnswerThemes: ReturnType<typeof buildOpenAnswersViewModel>['themes']
  exitDistribution: ReturnType<typeof buildExitPictureDistribution> | null
}) {
  const items: SummaryItem[] = []

  if (args.scanType === 'exit') {
    if (args.topExitReasonLabel) {
      items.push({
        label: 'Dominante reden',
        title: args.topExitReasonLabel,
        body: 'Meest voorkomende vertrekreden binnen de leesbare exitresponses.',
      })
    }

    if (args.topContributingReasonLabel) {
      items.push({
        label: 'Meespelende code',
        title: args.topContributingReasonLabel,
        body: 'Tweede reden die in dezelfde response-set zichtbaar terugkomt.',
      })
    }

    const topSegment = args.exitDistribution
      ? getLargestDistributionSegment(args.exitDistribution.segments)
      : null
    if (topSegment) {
      items.push({
        label: 'Verdeling',
        title: `${topSegment.label} (${topSegment.value})`,
        body: 'Grootste segment in de huidige verdeling van het vertrekbeeld.',
      })
    }

    return items
  }

  if (args.scanType === 'retention') {
    for (const theme of args.retentionThemes.slice(0, 2)) {
      items.push({
        label: 'Open antwoorden',
        title: `${theme.title} (${theme.count})`,
        body: truncateText(theme.sample, 150),
      })
    }
  }

  if (args.topFactorLabel) {
    items.push({
      label: 'Topfactor',
      title: args.topFactorLabel,
      body: 'Laagste gemiddelde belevingsscore in de huidige route.',
    })
  }

  if (args.secondFactorLabel) {
    items.push({
      label: 'Tweede factor',
      title: args.secondFactorLabel,
      body: 'Volgende factor op basis van de huidige gemiddelde scores.',
    })
  }

  if (items.length < 3 && args.openAnswerThemes[0]) {
    items.push({
      label: 'Thema in survey-stemmen',
      title: `${args.openAnswerThemes[0].title} (${args.openAnswerThemes[0].count})`,
      body: 'Meest voorkomende groep binnen de vrijgegeven open antwoorden.',
    })
  }

  return items.slice(0, 3)
}

function buildDepthNotes(args: {
  scanDefinition: ReturnType<typeof getScanDefinition>
  responsesLength: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
}) {
  const thresholdBody = args.hasEnoughData
    ? `${args.responsesLength} responses voldoen aan de analysegrens van ${MIN_N_PATTERNS}.`
    : args.hasMinDisplay
      ? `${args.responsesLength} responses voldoen aan de weergavegrens van ${MIN_N_DISPLAY}, maar nog niet aan de analysegrens van ${MIN_N_PATTERNS}.`
      : `${args.responsesLength} responses; detailweergave start bij ${MIN_N_DISPLAY}.`

  return [
    {
      label: 'Wat deze route toont',
      body: args.scanDefinition.whatItIsText,
    },
    {
      label: 'Wat deze route niet toont',
      body: args.scanDefinition.whatItIsNotText,
    },
    {
      label: 'Privacygrens',
      body: args.scanDefinition.privacyBoundaryText,
    },
    {
      label: 'Leesgrens',
      body: thresholdBody,
    },
  ]
}

function ResultsBlockCard({
  title,
  visibility,
  summary,
  body,
  href,
  linkLabel,
  children,
}: {
  title: string
  visibility: ResultsBlockVisibility
  summary?: string
  body: string
  href?: string
  linkLabel?: string
  children?: ReactNode
}) {
  const toneClasses =
    visibility === 'visible'
      ? 'border-slate-200 bg-white'
      : 'border-dashed border-slate-200 bg-slate-50'

  return (
    <div className={`rounded-[24px] border px-5 py-5 shadow-sm ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          {title}
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
          {visibility === 'visible' ? 'Vrij' : 'Begrensd'}
        </span>
      </div>
      {summary ? (
        <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
          {summary}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{body}</p>
      {children ? <div className="mt-5">{children}</div> : null}
      {href && linkLabel ? (
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  )
}

function MetricTile({ item }: { item: MetricItem }) {
  return (
    <div className="rounded-[20px] bg-[color:var(--dashboard-soft)]/55 px-4 py-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
        {item.label}
      </p>
      <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
        {item.value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{item.caption}</p>
    </div>
  )
}

function SummaryCard({ item }: { item: SummaryItem }) {
  return (
    <div className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
        {item.label}
      </p>
      <h3 className="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{item.body}</p>
    </div>
  )
}

function EmptyInlineState({ body }: { body: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-6 text-[color:var(--dashboard-text)]">
      {body}
    </div>
  )
}

function ResultsShellHeader({
  moduleHref,
  moduleLabel,
  moduleBackLinkLabel,
  campaignName,
  organizationName,
  routePeriodLabel,
  scopeLabel,
  statusLabel,
  campaignId,
  scanType,
}: {
  moduleHref: string
  moduleLabel: string
  moduleBackLinkLabel: string
  campaignName: string
  organizationName: string
  routePeriodLabel: string
  scopeLabel: string
  statusLabel: string
  campaignId: string
  scanType: string
}) {
  return (
    <div className="space-y-4 border-b border-slate-200/80 pb-5">
      <p className="text-[0.78rem] font-medium tracking-[0.01em] text-slate-500">
        <Link href="/dashboard" className="transition-colors hover:text-slate-700">
          Overzicht
        </Link>{' '}
        /{' '}
        <Link href={moduleHref} className="transition-colors hover:text-slate-700">
          {moduleLabel}
        </Link>{' '}
        / <span className="text-slate-700">{campaignName}</span>
      </p>
      <Link
        href={moduleHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <span aria-hidden="true">&larr;</span> {moduleBackLinkLabel}
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {statusLabel}
            </span>
          </div>
          <h1 className="font-serif text-[2.6rem] leading-[0.96] tracking-[-0.055em] text-[color:var(--dashboard-ink)] sm:text-[3.15rem]">
            {campaignName}
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            {organizationName} <span aria-hidden="true">&middot;</span> {routePeriodLabel}{' '}
            <span aria-hidden="true">&middot;</span> {scopeLabel}
          </p>
        </div>
        <PdfDownloadButton campaignId={campaignId} campaignName={campaignName} scanType={scanType} />
      </div>
    </div>
  )
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewInsights) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen campagnedetail"
        description="Jouw login opent alleen Action Center voor toegewezen teams. Surveyresultaten, campagnedetails en rapporten blijven zichtbaar voor HR en Loep."
      />
    )
  }

  const { data: statsRow } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('campaign_id', id)
    .single()

  if (!statsRow) notFound()
  const stats = statsRow as CampaignStats

  const [
    { data: organization },
    { data: campaignMeta },
    { data: responsesRaw },
    { data: respondentsRaw },
    { data: deliveryRecord },
  ] =
    await Promise.all([
      supabase.from('organizations').select('name').eq('id', stats.organization_id).maybeSingle(),
      supabase.from('campaigns').select('enabled_modules').eq('id', id).maybeSingle(),
      supabase
        .from('survey_responses')
        .select(
          `
          id,
          respondent_id,
          risk_score,
          signal_score,
          risk_band,
          preventability,
          stay_intent_score,
          direction_signal_score,
          uwes_score,
          turnover_intention_score,
          exit_reason_code,
          sdt_scores,
          org_scores,
          open_text_raw,
          open_text_analysis,
          full_result,
          submitted_at,
          respondents!inner(id, campaign_id, department, role_level, completed, completed_at, token)
        `,
        )
        .eq('respondents.campaign_id', id),
      supabase
        .from('respondents')
        .select('*')
        .eq('campaign_id', id)
        .order('completed_at', { ascending: false, nullsFirst: false }),
      supabase
        .from('campaign_delivery_records')
        .select('id, lifecycle_stage, first_management_use_confirmed_at, updated_at')
        .eq('campaign_id', id)
        .maybeSingle(),
    ])

  const responses = (responsesRaw ?? []) as unknown as (SurveyResponse & {
    respondents: Respondent
  })[]
  const respondents = (respondentsRaw ?? []) as Respondent[]

  const hasMinDisplay = responses.length >= MIN_N_DISPLAY
  const hasEnoughData = responses.length >= MIN_N_PATTERNS
  const factorData = computeFactorAverages(responses)
  const factorPriorityRows = buildFactorPriorityRows(factorData.orgAverages)
  const sdtRows = buildSdtRows(factorData.sdtAverages)
  const averageSignalScore = computeAverageSignalScore(responses)
  const supplemental = computeRetentionSupplementalAverages(responses)
  const releasedOpenAnswerItems = hasMinDisplay ? buildOpenAnswerItems(stats.scan_type, responses) : []
  const openAnswersViewModel = buildOpenAnswersViewModel(releasedOpenAnswerItems)
  const strongWorkSignalRate = hasMinDisplay ? computeStrongWorkSignalRate(responses) : null
  const topExitReasonLabel = hasMinDisplay ? getTopExitReasonLabel(responses) : null
  const topContributingReasonLabel = hasEnoughData ? getTopContributingReasonLabel(responses) : null
  const exitDistribution = hasEnoughData ? buildExitPictureDistribution(responses) : null
  const retentionThemes = stats.scan_type === 'retention' ? clusterRetentionOpenSignals(responses) : []
  const resultsViewModel = buildResultsViewModel({
    scanType: stats.scan_type,
    respondentsCount: respondents.length,
    hasMinDisplay,
    hasEnoughData,
    hasOpenAnswers: releasedOpenAnswerItems.length > 0,
  })

  const blockVisibility = Object.fromEntries(
    resultsViewModel.blocks.map((block) => [block.key, block.visibility]),
  ) as Record<
    'response' | 'signal' | 'synthesis' | 'drivers' | 'depth' | 'voices',
    ResultsBlockVisibility
  >

  const scanDefinition = getScanDefinition(stats.scan_type)
  const organizationName = organization?.name ?? 'Organisatie'
  const routePeriodLabel = formatRoutePeriodLabel(stats.campaign_name, stats.created_at)
  const scopeLabel = deriveScopeLabel(respondents)
  const moduleKey =
    stats.scan_type === 'team' ? null : getDashboardModuleKeyForScanType(stats.scan_type)
  const moduleLabel = moduleKey ? getDashboardModuleLabel(moduleKey) : scanDefinition.productName
  const moduleHref = moduleKey ? getDashboardModuleHref(moduleKey) : '/dashboard'
  const moduleBackLinkLabel = getDashboardModuleBackLinkLabel(stats.scan_type)
  const topFactorLabel = factorPriorityRows[0]?.factor ?? null
  const secondFactorLabel = factorPriorityRows[1]?.factor ?? null
  const canOpenActionCenterFromDeliveryRecord = deliveryRecord
    ? canOpenActionCenterRoute(deliveryRecord)
    : false
  const actionCenterBridge = buildCampaignDetailActionCenterBridge({
    campaignId: id,
    routeEntryStage:
      deliveryRecord && hasOpenedActionCenterRoute(deliveryRecord)
        ? 'active'
        : null,
    canOpenRoute:
      blockVisibility.signal === 'visible' &&
      isLiveActionCenterScanType(stats.scan_type) &&
      canOpenActionCenterFromDeliveryRecord,
    assessedAt: deliveryRecord?.updated_at ?? stats.created_at,
  })
  const actionCenterRouteHref = buildActionCenterRouteOpenRedirect(id, 'campaign-detail')
  const showOpenAnswersRoute =
    blockVisibility.voices === 'visible' && releasedOpenAnswerItems.length > 0
  const signalHighlights = buildSignalHighlights({
    scanType: stats.scan_type,
    signalLabel: scanDefinition.signalLabel,
    isVisible: blockVisibility.signal === 'visible',
    averageSignalScore,
    topFactorLabel,
    strongWorkSignalRate,
    supplemental,
  })
  const synthesisItems = buildSynthesisItems({
    scanType: stats.scan_type,
    topFactorLabel,
    secondFactorLabel,
    topExitReasonLabel,
    topContributingReasonLabel,
    retentionThemes,
    openAnswerThemes: openAnswersViewModel.themes,
    exitDistribution,
  })
  const depthNotes = buildDepthNotes({
    scanDefinition,
    responsesLength: responses.length,
    hasMinDisplay,
    hasEnoughData,
  })
  const openAnswersHref = `/campaigns/${id}/open-antwoorden`

  async function openActionCenterRoute() {
    'use server'

    const admin = createAdminClient()
    const actionCenterHref = buildActionCenterRouteOpenRedirect(id, 'campaign-detail')
    const { data: currentDeliveryRecord, error: loadError } = await admin
      .from('campaign_delivery_records')
      .select('id, lifecycle_stage, first_management_use_confirmed_at')
      .eq('campaign_id', id)
      .maybeSingle()

    if (loadError || !currentDeliveryRecord) {
      notFound()
    }

    if (hasOpenedActionCenterRoute(currentDeliveryRecord)) {
      redirect(actionCenterHref)
    }

    if (!canOpenActionCenterRoute(currentDeliveryRecord)) {
      notFound()
    }

    const openedAt = new Date().toISOString()
    const { data: updatedRecord, error } = await admin
      .from('campaign_delivery_records')
      .update(buildActionCenterRouteOpenPatch(openedAt))
      .eq('id', currentDeliveryRecord.id)
      .is('first_management_use_confirmed_at', null)
      .in('lifecycle_stage', getActionCenterRouteOpenableStages())
      .select('id')
      .maybeSingle()

    if (error) {
      notFound()
    }

    if (!updatedRecord) {
      const { data: latestDeliveryRecord } = await admin
        .from('campaign_delivery_records')
        .select('id, lifecycle_stage, first_management_use_confirmed_at')
        .eq('campaign_id', id)
        .maybeSingle()

      if (!latestDeliveryRecord || !hasOpenedActionCenterRoute(latestDeliveryRecord)) {
        notFound()
      }
    }

    redirect(actionCenterHref)
  }

  const actionCenterBridgeCard =
    actionCenterBridge.presentation.ctaKind === 'open' ? (
      <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
              Vervolgroute
            </p>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
              {actionCenterBridge.presentation.label}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
              {actionCenterBridge.presentation.body}
            </p>
          </div>

          {actionCenterBridge.bridgeState === 'candidate' ? (
            <form action={openActionCenterRoute}>
              <button
                type="submit"
                className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                {actionCenterBridge.presentation.ctaLabel}
              </button>
            </form>
          ) : (
            <Link
              href={actionCenterRouteHref}
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {actionCenterBridge.presentation.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    ) : null

  const responseSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.response}
      visibility={blockVisibility.response}
      summary={`${stats.total_completed}/${stats.total_invited} ingevuld · ${stats.completion_rate_pct ?? 0}%`}
      body={buildResponseContextNote(stats.total_completed, stats.completion_rate_pct ?? 0)}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Uitgenodigd', value: String(stats.total_invited) },
          { label: 'Ingevuld', value: String(stats.total_completed) },
          { label: 'Status', value: getResultsStatusLabel(resultsViewModel.readState) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[18px] bg-[color:var(--dashboard-soft)]/62 px-4 py-4"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
              {item.label}
            </p>
            <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </ResultsBlockCard>
  )

  const signalSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.signal}
      visibility={blockVisibility.signal}
      summary={blockVisibility.signal === 'visible' ? formatScore(averageSignalScore) : 'Nog niet beschikbaar'}
      body={
        blockVisibility.signal === 'visible'
          ? `${scanDefinition.signalLabel} is vrijgegeven voor deze route. De aanvullende metrics hieronder tonen de scan-specifieke context die samen met het hoofdsignaal is opgeslagen.`
          : `Deze laag opent vanaf ${MIN_N_DISPLAY} leesbare responses.`
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {signalHighlights.map((item) => (
          <MetricTile key={item.label} item={item} />
        ))}
      </div>
    </ResultsBlockCard>
  )

  const synthesisSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.synthesis}
      visibility={blockVisibility.synthesis}
      summary={blockVisibility.synthesis === 'visible' ? synthesisItems[0]?.title ?? 'Nog niet beschikbaar' : 'Nog niet beschikbaar'}
      body={
        blockVisibility.synthesis === 'visible'
          ? 'Deze laag bundelt de eerste samenhang die op groepsniveau zichtbaar is.'
          : `Deze laag opent samen met het kernsignaal vanaf ${MIN_N_DISPLAY} responses.`
      }
    >
      {blockVisibility.synthesis === 'visible' && synthesisItems.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {synthesisItems.map((item) => (
            <SummaryCard key={`${item.label}-${item.title}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyInlineState body="Nog geen tweede laag beschikbaar binnen de huidige leesgrens." />
      )}
    </ResultsBlockCard>
  )

  const driversSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.drivers}
      visibility={blockVisibility.drivers}
      summary={
        blockVisibility.drivers === 'visible'
          ? factorPriorityRows
              .slice(0, 3)
              .map((row) => row.factor)
              .join(' · ')
          : 'Nog niet beschikbaar'
      }
      body={
        blockVisibility.drivers === 'visible'
          ? 'Factoren zijn geordend op huidige signaalsterkte binnen deze route.'
          : `Deze laag blijft begrensd tot er minimaal ${MIN_N_PATTERNS} leesbare responses zijn.`
      }
    >
      {blockVisibility.drivers === 'visible' && factorPriorityRows.length > 0 ? (
        <div className="space-y-4">
          {factorPriorityRows.slice(0, 4).map((row) => (
            <div key={row.factor} className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.factor}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{row.note}</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {row.signal}
                </div>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/85">
                <div
                  className="h-full rounded-full bg-[#C36A29]"
                  style={{ width: `${Math.max(12, Math.min(100, row.signalValue * 10))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyInlineState body={`Volledige factorprioritering opent vanaf ${MIN_N_PATTERNS} responses.`} />
      )}
    </ResultsBlockCard>
  )

  const depthSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.depth}
      visibility={blockVisibility.depth}
      summary={
        blockVisibility.depth === 'visible'
          ? sdtRows.length > 0
            ? `${sdtRows.length} SDT-lagen zichtbaar`
            : `${factorPriorityRows.length} factoren berekend`
          : 'Nog niet beschikbaar'
      }
      body={
        blockVisibility.depth === 'visible'
          ? 'Verdiepingslagen tonen extra context en methodische grenzen binnen dezelfde route.'
          : `Deze laag opent vanaf ${MIN_N_DISPLAY} leesbare responses.`
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
        <div className="space-y-4">
          {blockVisibility.depth === 'visible' && sdtRows.length > 0 ? (
            <div className="grid gap-3">
              {sdtRows.map((row) => (
                <div
                  key={row.factor}
                  className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.factor}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {row.score}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{row.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyInlineState body="Nog geen extra verdiepingslaag zichtbaar binnen de huidige routegegevens." />
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {depthNotes.map((note) => (
              <div
                key={note.label}
                className="rounded-[20px] border border-slate-200 bg-white px-4 py-4"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {note.label}
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{note.body}</p>
              </div>
            ))}
          </div>
        </div>

        <MethodologyCard
          scanType={stats.scan_type}
          hasSegmentDeepDive={hasCampaignAddOn(campaignMeta, 'segment_deep_dive')}
          signalLabel={scanDefinition.signalLabel}
          embedded
        />
      </div>
    </ResultsBlockCard>
  )

  const voicesSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.voices}
      visibility={blockVisibility.voices}
      summary={
        blockVisibility.voices === 'visible'
          ? `${releasedOpenAnswerItems.length} antwoorden vrijgegeven`
          : 'Nog niet beschikbaar'
      }
      body={
        blockVisibility.voices === 'visible'
          ? 'Open antwoorden blijven geanonimiseerd en zijn gegroepeerd per zichtbaar thema.'
          : hasMinDisplay
            ? 'Er zijn nog geen vrijgegeven open antwoorden binnen deze route.'
            : `Open antwoorden openen pas vanaf ${MIN_N_DISPLAY} leesbare responses.`
      }
      href={showOpenAnswersRoute ? openAnswersHref : undefined}
      linkLabel={showOpenAnswersRoute ? 'Open alle open antwoorden' : undefined}
    >
      {blockVisibility.voices === 'visible' && openAnswersViewModel.groups.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {openAnswersViewModel.themes.slice(0, 3).map((theme) => (
              <span
                key={theme.title}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {theme.title} · {theme.count}
              </span>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {openAnswersViewModel.groups
              .flatMap((group) => group.answers.slice(0, 1).map((answer) => ({ group, answer })))
              .slice(0, 2)
              .map(({ group, answer }) => (
                <div
                  key={answer.id}
                  className="rounded-[20px] bg-[color:var(--dashboard-soft)]/52 px-5 py-5"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                    {group.title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">
                    {truncateText(answer.text, 180)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <EmptyInlineState body="Er zijn nog geen vrijgegeven open antwoorden om te groeperen." />
      )}
    </ResultsBlockCard>
  )

  return (
    <div className="space-y-10">
      <ResultsShellHeader
        moduleHref={moduleHref}
        moduleLabel={moduleLabel}
        moduleBackLinkLabel={moduleBackLinkLabel}
        campaignName={stats.campaign_name}
        organizationName={organizationName}
        routePeriodLabel={routePeriodLabel}
        scopeLabel={scopeLabel}
        statusLabel={getResultsStatusLabel(resultsViewModel.readState)}
        campaignId={id}
        scanType={stats.scan_type}
      />

      {actionCenterBridgeCard}

      <ResultsLayout
        sections={{
          response: responseSection,
          signal: signalSection,
          synthesis: synthesisSection,
          drivers: driversSection,
          depth: depthSection,
          voices: voicesSection,
        }}
      />
    </div>
  )
}
