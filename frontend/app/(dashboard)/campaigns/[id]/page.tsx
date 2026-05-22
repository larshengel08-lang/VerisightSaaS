import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isLiveActionCenterScanType } from '@/lib/action-center-live'
import { SuiteAccessDenied } from '@/components/dashboard/suite-access-denied'
import {
  canAccessCultureAssessmentSegmentSummaryExport,
  CULTURE_ASSESSMENT_CULTURE_INDEX_COPY,
  getCultureAssessmentGovernedEntitlement,
} from '@/lib/products/culture_assessment/contract'
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
import type { Campaign, CampaignStats, MemberRole, Respondent, ScanType, SurveyResponse } from '@/lib/types'
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

function getVisualMetricWidth(value: string) {
  if (value === 'Nog niet beschikbaar') return null

  const percentMatch = value.match(/(-?\d+(?:\.\d+)?)%/)
  if (percentMatch) {
    const percent = Number(percentMatch[1])
    if (!Number.isNaN(percent)) return Math.max(10, Math.min(100, percent))
  }

  const scoreMatch = value.match(/(-?\d+(?:\.\d+)?)\/10/)
  if (scoreMatch) {
    const score = Number(scoreMatch[1])
    if (!Number.isNaN(score)) return Math.max(10, Math.min(100, score * 10))
  }

  return null
}

function getVisualMetricPercent(value: string) {
  const width = getVisualMetricWidth(value)
  return width ? Math.round(width) : null
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
        value: args.isVisible ? (args.topFactorLabel ?? 'Nog niet beschikbaar') : 'Nog niet beschikbaar',
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
      value: args.isVisible ? (args.topFactorLabel ?? 'Nog niet beschikbaar') : 'Nog niet beschikbaar',
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

function SectionKicker({
  title,
  visibility,
}: {
  title: string
  visibility: ResultsBlockVisibility
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-[#C36A29]" />
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
          {title}
        </span>
      </div>
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
          visibility === 'visible'
            ? 'border-amber-200 bg-amber-50 text-[#8B4A17]'
            : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        {visibility === 'visible' ? 'Zichtbaar' : 'Begrensd'}
      </span>
    </div>
  )
}

function ResultsBlockCard({
  title,
  visibility,
  summary,
  body,
  href,
  linkLabel,
  children,
  className,
  summaryClassName,
  bodyClassName,
  hideSummary,
}: {
  title: string
  visibility: ResultsBlockVisibility
  summary?: string
  body: string
  href?: string
  linkLabel?: string
  children?: ReactNode
  className?: string
  summaryClassName?: string
  bodyClassName?: string
  hideSummary?: boolean
}) {
  const toneClasses =
    visibility === 'visible'
      ? 'border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]'
      : 'border-dashed border-slate-200 bg-[color:var(--dashboard-soft)]/36'

  return (
    <div className={`border px-5 py-5 md:px-7 md:py-7 ${toneClasses} ${className ?? 'rounded-[28px]'}`}>
      <SectionKicker title={title} visibility={visibility} />
      {summary && !hideSummary ? (
        <p
          className={`mt-5 text-[1.8rem] font-semibold leading-none tracking-[-0.05em] text-[color:var(--dashboard-ink)] md:text-[2.2rem] ${
            summaryClassName ?? ''
          }`}
        >
          {summary}
        </p>
      ) : null}
      <p className={`mt-3 max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)] ${bodyClassName ?? ''}`}>
        {body}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
      {href && linkLabel ? (
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-[#8B4A17] transition-colors hover:border-amber-300 hover:bg-amber-100"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  )
}

function MetricTile({ item }: { item: MetricItem }) {
  const metricPercent = getVisualMetricPercent(item.value)

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(246,239,229,0.88))] px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(195,106,41,0),rgba(195,106,41,0.9),rgba(195,106,41,0))]" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {item.label}
          </p>
          <p className="mt-3 text-xl font-semibold tracking-[-0.05em] text-[color:var(--dashboard-ink)]">
            {item.value}
          </p>
        </div>
        {metricPercent ? (
          <div
            className="relative mt-1 size-[4.25rem] shrink-0 rounded-full"
            style={{
              background: `conic-gradient(#C36A29 0 ${metricPercent}%, rgba(195,106,41,0.16) ${metricPercent}% 100%)`,
            }}
          >
            <div className="absolute inset-[6px] rounded-full bg-white/90" />
            <div className="absolute inset-0 flex items-center justify-center text-[0.72rem] font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
              {metricPercent}%
            </div>
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{item.caption}</p>
    </div>
  )
}

function SummaryCard({ item, index }: { item: SummaryItem; index: number }) {
  const accentClasses = [
    'from-[#fff7ef] via-white to-[#f6eee4]',
    'from-[#f6efe4] via-white to-[#f3f6fb]',
    'from-[#f8f4ee] via-white to-[#fff7ef]',
  ]

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br ${accentClasses[index % accentClasses.length]} px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
            {item.label}
          </p>
          <h3 className="mt-3 text-[1.18rem] font-semibold tracking-[-0.05em] text-[color:var(--dashboard-ink)]">
            {item.title}
          </h3>
        </div>
        <div className="text-[2.4rem] font-semibold leading-none tracking-[-0.08em] text-[#C36A29]/18">
          0{index + 1}
        </div>
      </div>
      <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--dashboard-text)]">{item.body}</p>
    </div>
  )
}

function SignalOrbit({
  segments,
  total,
}: {
  segments: Array<{ label: string; value: string; percent: number }>
  total: number
}) {
  const [first, second, third] = segments
  const firstStop = first?.percent ?? 0
  const secondStop = firstStop + (second?.percent ?? 0)
  const thirdStop = secondStop + (third?.percent ?? 0)

  return (
    <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(145deg,#fffdf9,rgba(246,239,229,0.88))] px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="grid gap-6 lg:grid-cols-[auto,minmax(0,1fr)] lg:items-center">
        <div className="mx-auto">
          <div
            className="relative flex size-48 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#C36A29 0 ${firstStop}%, #D9985D ${firstStop}% ${secondStop}%, #E9D7BE ${secondStop}% ${thirdStop}%, rgba(15,23,42,0.06) ${thirdStop}% 100%)`,
            }}
          >
            <div className="absolute inset-[14px] rounded-full bg-[linear-gradient(180deg,#fffefc,rgba(255,255,255,0.92))]" />
            <div className="relative z-10 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Responses
              </p>
              <p className="mt-3 text-[3rem] font-semibold leading-none tracking-[-0.08em] text-[color:var(--dashboard-ink)]">
                {total}
              </p>
              <p className="mt-2 text-sm text-[color:var(--dashboard-text)]">verdeeld over het vertrekbeeld</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {segments.map((segment, index) => (
            <div
              key={segment.label}
              className="rounded-[22px] border border-white/70 bg-white/90 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor: index === 0 ? '#C36A29' : index === 1 ? '#D9985D' : '#E9D7BE',
                    }}
                  />
                  <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{segment.label}</p>
                </div>
                <span className="text-base font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
                  {segment.value}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(15,23,42,0.05)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(8, segment.percent)}%`,
                    backgroundColor: index === 0 ? '#C36A29' : index === 1 ? '#D9985D' : '#E9D7BE',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PrioritySpotlight({ row, rank }: { row: FactorRow; rank: number }) {
  const signalPercent = Math.max(10, Math.min(100, row.signalValue * 10))

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(246,239,229,0.85))] px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
      <div className="absolute -right-5 -top-7 text-[5rem] font-semibold tracking-[-0.12em] text-[#C36A29]/10">
        0{rank}
      </div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
        Prioriteit {rank}
      </p>
      <h3 className="mt-3 max-w-[14rem] text-[1.18rem] font-semibold tracking-[-0.05em] text-[color:var(--dashboard-ink)]">
        {row.factor}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{row.note}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Signaal</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.06em] text-[color:var(--dashboard-ink)]">
            {row.signal}
          </p>
        </div>
        <div
          className="relative size-[4.5rem] rounded-full"
          style={{
            background: `conic-gradient(#C36A29 0 ${signalPercent}%, rgba(195,106,41,0.15) ${signalPercent}% 100%)`,
          }}
        >
          <div className="absolute inset-[7px] rounded-full bg-white/95" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            {row.band}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyInlineState({ body }: { body: string }) {
  return (
    <div className="border border-dashed border-slate-200 bg-[color:var(--dashboard-soft)]/28 px-5 py-5 text-sm leading-6 text-[color:var(--dashboard-text)]">
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
    <div className="space-y-5 border-b border-slate-200/80 pb-6">
      <p className="text-[0.78rem] font-medium tracking-[0.01em] text-slate-500">
        <Link href="/dashboard" className="transition-colors hover:text-slate-700">
          Overzicht
        </Link>{' '}
        /{' '}
        <Link href={moduleHref} className="transition-colors hover:text-slate-700">
          {moduleLabel}
        </Link>{' '}
        <span aria-hidden> / </span>
        <span className="text-slate-700">{campaignName}</span>
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
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#8B4A17]">
              {statusLabel}
            </span>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Resultatenomgeving
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
        <PdfDownloadButton
          campaignId={campaignId}
          campaignName={campaignName}
          scanType={scanType}
          label="Download PDF"
          loadingLabel="PDF ophalen..."
          buttonClassName="inline-flex rounded-full border border-slate-950 bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          containerClassName="flex flex-col items-start gap-2 lg:items-end"
          errorClassName="max-w-56 text-xs text-red-600 lg:text-right"
        />
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
    { data: campaignRow },
    { data: organization },
    { data: responsesRaw },
    { data: respondentsRaw },
    { data: deliveryRecord },
    { data: profile },
    { data: membership },
  ] =
    await Promise.all([
      supabase.from('campaigns').select('enabled_modules').eq('id', id).maybeSingle(),
      supabase.from('organizations').select('name').eq('id', stats.organization_id).maybeSingle(),
      supabase
        .from('survey_responses')
        .select(
          `
          id,
          respondent_id,
          risk_score,
          risk_band,
          preventability,
          stay_intent_score,
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
      supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
      supabase
        .from('org_members')
        .select('role')
        .eq('org_id', stats.organization_id)
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

  const responses = (responsesRaw ?? []) as unknown as (SurveyResponse & {
    respondents: Respondent
  })[]
  const respondents = (respondentsRaw ?? []) as Respondent[]
  const campaign = (campaignRow ?? null) as Pick<Campaign, 'enabled_modules'> | null

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
  const isVerisightAdmin = profile?.is_verisight_admin === true
  const membershipRole = (membership?.role ?? null) as MemberRole | null
  const hasSegmentDeepDive = hasCampaignAddOn(campaign, 'segment_deep_dive')
  const canAccessGovernedSegmentExport =
    stats.scan_type === 'culture_assessment' &&
    canAccessCultureAssessmentSegmentSummaryExport({
      isVerisightAdmin,
      membershipRole,
    })
  const showGovernedSegmentExport =
    stats.scan_type === 'culture_assessment' &&
    !stats.is_active &&
    hasSegmentDeepDive &&
    canAccessGovernedSegmentExport
  const governedSegmentExportHint =
    stats.scan_type !== 'culture_assessment'
      ? null
      : !hasSegmentDeepDive
        ? 'Segment deep dive is in v1 alleen admin/manual-seeded; zonder die inrichting blijft de organisatiebrede read leidend.'
        : stats.is_active
          ? 'Segment deep dive is in v1 admin/manual-seeded ingericht, maar governed export blijft dicht tot de baseline formeel is vrijgegeven.'
          : canAccessGovernedSegmentExport
            ? 'Governed segmentexport blijft in deze pilotlaag alleen open voor owner/adminrollen na baselinevrijgave.'
            : 'Governed segmentexport is na baselinevrijgave alleen beschikbaar voor owner/adminrollen; overige rollen blijven organisatiebreed read-first.'
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

  if (stats.scan_type === 'culture_assessment') {
    const hiddenReasonEntitlement = getCultureAssessmentGovernedEntitlement(
      { isVerisightAdmin, membershipRole },
      'hiddenReasonVisibility',
    )
    const hrGovernedAnalysisEntitlement = getCultureAssessmentGovernedEntitlement(
      { isVerisightAdmin, membershipRole },
      'hrGovernedAnalysis',
    )
    const cultureAttentionPanels = factorPriorityRows.slice(0, 3)
    const cultureDeepeningRows = [
      'autonomy_role_clarity',
      'growth_development',
      'organizational_connection_intent',
    ]
      .map((key) => {
        const score = factorData.orgAverages[key]
        if (typeof score !== 'number') return null
        return {
          key,
          label: FACTOR_LABELS[key] ?? key,
          score,
        }
      })
      .filter(
        (
          item,
        ): item is {
          key: string
          label: string
          score: number
        } => Boolean(item),
      )

    return (
      <div className="space-y-10">
        <div className="space-y-5 border-b border-slate-200/80 pb-6">
          <p className="text-[0.78rem] font-medium tracking-[0.01em] text-slate-500">
            <Link href="/dashboard" className="transition-colors hover:text-slate-700">
              Overzicht
            </Link>{' '}
            /{' '}
            <Link href={moduleHref} className="transition-colors hover:text-slate-700">
              {moduleLabel}
            </Link>{' '}
            <span aria-hidden> / </span>
            <span className="text-slate-700">{stats.campaign_name}</span>
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
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Loep Cultuurbeeld
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Jaarlijkse board baseline
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {getResultsStatusLabel(resultsViewModel.readState)}
                </span>
              </div>
              <h1 className="font-serif text-[2.6rem] leading-[0.96] tracking-[-0.055em] text-[color:var(--dashboard-ink)] sm:text-[3.15rem]">
                {stats.campaign_name}
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                {organizationName} <span aria-hidden="true">&middot;</span> {routePeriodLabel}{' '}
                <span aria-hidden="true">&middot;</span> {scopeLabel}
              </p>
            </div>
            <PdfDownloadButton
              campaignId={id}
              campaignName={stats.campaign_name}
              scanType={stats.scan_type}
              showSegmentSummaryExport={showGovernedSegmentExport}
              label="Download PDF"
              loadingLabel="PDF ophalen..."
              buttonClassName="inline-flex rounded-full border border-slate-950 bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              containerClassName="flex flex-col items-start gap-2 lg:items-end"
              errorClassName="max-w-56 text-xs text-red-600 lg:text-right"
            />
          </div>
        </div>

        {actionCenterBridgeCard}

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            1. Responsbasis &amp; meetdekking
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
            Response basis &amp; governance frame
          </h2>
          <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
            {buildResponseContextNote(stats.total_completed, stats.completion_rate_pct ?? 0)}
          </p>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Uitgenodigd', value: String(stats.total_invited) },
              { label: 'Ingevuld', value: String(stats.total_completed) },
              { label: 'Respons', value: `${stats.completion_rate_pct ?? 0}%` },
              { label: 'Leesmodus', value: 'Board baseline' },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-slate-200 bg-[color:var(--dashboard-soft)]/38 px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            2. Executive culture read
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
            Loep Culture Index
          </h2>
          <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
            {CULTURE_ASSESSMENT_CULTURE_INDEX_COPY}
          </p>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)]">
            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#fffdf9,rgba(246,239,229,0.86))] px-5 py-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                3. Culture Index hero
              </p>
              <p className="mt-4 text-5xl font-semibold tracking-[-0.08em] text-[color:var(--dashboard-ink)]">
                {formatScore(averageSignalScore)}
              </p>
              <p className="mt-4 text-sm leading-6 text-[color:var(--dashboard-text)]">
                Editorial index band met groot numeriek anker en interpretatietekst. Geen gauge, geen benchmark-positie en geen pass/fail visual.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Governance boundary module
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
                <li>Wat getoond mag worden: organisatiebrede executive read, domeinen en veilig vrijgegeven baseline-output.</li>
                <li>Wat verborgen blijft: named manager detail, niet-vrijgegeven segmentlagen en onveilige tekstsignalen.</li>
                <li>Waarom dat zo is: drempels, releasegrenzen, entitlements en bounded pilot-governance.</li>
                <li>Wat je hier niet uit mag concluderen: geen causal proof, geen manager ranking en geen individuele inference.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            4. Board attention points
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {cultureAttentionPanels.map((row, index) => (
              <div key={row.factor} className="rounded-[22px] border border-slate-200 bg-[color:var(--dashboard-soft)]/38 px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Aandachtspunt {index + 1}
                </p>
                <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                  {row.factor}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
                  {row.note} Domeinscore {row.score}.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            5. Domeinbeeld
          </p>
          <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
            Organisatiebreed domeinbeeld in een bestuurlijke leesvolgorde. De volgorde helpt patronen te openen en is geen ranking van teams, managers of domeinen als waardeoordeel.
          </p>
          <div className="space-y-3">
            {factorPriorityRows.map((row, index) => (
              <div key={row.factor} className="grid gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4 lg:grid-cols-[96px_minmax(0,1fr)_120px] lg:items-center">
                <div>
                  <span className="inline-flex rounded-full border border-slate-200 bg-[color:var(--dashboard-soft)]/60 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Lees {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.factor}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--dashboard-text)]">{row.note}</p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Domeinscore
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.score}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            6. Segmentcontrasten
          </p>
          <p className="text-sm leading-6 text-[color:var(--dashboard-text)]">
            {governedSegmentExportHint}
          </p>
          <ul className="space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
            <li>Geen sorted league table.</li>
            <li>Geen worst/best segment labels.</li>
            <li>Geen color-coded winners/losers.</li>
            <li>Verborgen of suppressed segmentlagen tonen we als governance state, niet als lege afwezigheid.</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            7. Verdiepingslagen
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {cultureDeepeningRows.map((row) => (
              <div key={row.key} className="rounded-[22px] border border-slate-200 bg-[color:var(--dashboard-soft)]/38 px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Verdiepende domeinlaag
                </p>
                <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                  {row.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
                  Domeinscore {row.score.toFixed(1)}/10.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            8. Open signalen
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Text safety</p>
              <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">Veilige samenvatting zichtbaar</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">Alleen veilig geclusterde open signalen mogen als compacte samenvatting terugkomen.</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Text safety</p>
              <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">Verborgen door drempel of gevoelige inhoud</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">Onder drempel, gevoelige inhoud of ontbrekende goedkeuring betekent suppressie.</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Verborgen laagreden</p>
              <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">Drempel, vrijgave of entitlement</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
                {hiddenReasonEntitlement === 'denied'
                  ? 'Deze rol leest de organisatiebrede executive laag, maar krijgt geen detailuitleg per verborgen segment of suppressiereden.'
                  : 'Verborgen lagen mogen alleen verklaard worden als drempel-, vrijgave-, entitlement- of packagegrens.'}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            9. Board-read &amp; vervolgritme
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-[color:var(--dashboard-soft)]/38 px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Pilot deliverable</p>
              <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">Boardroom PDF-deck</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">Pilot delivery-ready. Gebruik deze decklaag als begeleide board-read deliverable binnen dezelfde governance als het boardrapport.</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-[color:var(--dashboard-soft)]/38 px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Executive samenvatting</p>
              <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">Executive one-pager</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">Blueprint, nog geen standaarddeliverable. Gebruik alleen begeleid totdat de one-pager dezelfde productrail draagt als boardrapport en deck.</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-[color:var(--dashboard-soft)]/38 px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">HR governed analysis</p>
              <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">Veilige HR-verdieping</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
                {hrGovernedAnalysisEntitlement === 'allowed' || hrGovernedAnalysisEntitlement === 'admin_state_only'
                  ? 'HR kan veilige segmentlagen, hidden reasons en exportstatus lezen, maar blijft binnen governed interpretatie en expliciete suppressiegrenzen.'
                  : 'HR governed analysis opent niet voor deze rol. De executive read blijft leidend totdat een governance-owner veilige verdieping vrijgeeft.'}
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
            <li>Geen vrije slicing, quote browsing of lokale blame-laag.</li>
            <li>No immediate next route blijft een geldige uitkomst.</li>
            <li>Vervolg kan alleen via deeper governed work, Pulse follow-on, RetentieScan of ExitScan.</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            10. Rapport, export &amp; methodiek
          </p>
          <ul className="space-y-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
            <li>Hoog vertrouwen, Gematigd vertrouwen en Voorzichtig lezen beschrijven signaalstabiliteit, niet truth certainty of causal certainty.</li>
            <li>Visual redesign mag geen nieuwe result fields introduceren, geen score meaning veranderen en geen suppressed of unreleased layers visueel uitvergroten.</li>
            <li>Optionele outputs mogen niet als standaardoutput ogen.</li>
          </ul>
        </section>
      </div>
    )
  }

  const responseSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.response}
      visibility={blockVisibility.response}
      body={buildResponseContextNote(stats.total_completed, stats.completion_rate_pct ?? 0)}
      hideSummary
      className="rounded-[18px] border-0 bg-transparent px-0 py-0"
      bodyClassName="px-2 text-base md:px-1"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Uitgenodigd', value: String(stats.total_invited) },
          { label: 'Ingevuld', value: String(stats.total_completed) },
          { label: 'Respons', value: `${stats.completion_rate_pct ?? 0}%` },
          { label: 'Status', value: getResultsStatusLabel(resultsViewModel.readState) },
        ].map((item) => (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(246,239,229,0.8))] px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(195,106,41,0),rgba(195,106,41,0.8),rgba(195,106,41,0))]" />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
              {item.label}
            </p>
            <p className="mt-4 text-[2rem] font-semibold leading-none tracking-[-0.06em] text-[color:var(--dashboard-ink)]">
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
          ? `${scanDefinition.signalLabel} is vrijgegeven voor deze route. Gebruik dit scherm als visueel leesvlak: eerst het kernbeeld, daarna de samenhang en pas daarna de driverlaag.`
          : `Deze laag opent vanaf ${MIN_N_DISPLAY} leesbare responses.`
      }
      className="rounded-[28px]"
      summaryClassName="text-[3.4rem] md:text-[4.9rem]"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr),minmax(0,0.82fr)]">
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(145deg,#fffdf9,rgba(246,239,229,0.86))] px-5 py-5 shadow-[0_20px_44px_rgba(15,23,42,0.06)] md:px-6 md:py-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {scanDefinition.signalLabel}
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.08em] text-[color:var(--dashboard-ink)] md:text-[5.75rem]">
                {blockVisibility.signal === 'visible' ? formatScore(averageSignalScore) : '—'}
              </p>
            </div>
            <div className="max-w-xs text-sm leading-6 text-[color:var(--dashboard-text)]">
              {blockVisibility.signal === 'visible'
                ? 'Sterkste visuele ingang tot het groepsbeeld. Lees dit samen met de segmenten en de ondersteunende signalen rechts.'
                : `Deze laag wordt zichtbaar vanaf ${MIN_N_DISPLAY} leesbare responses.`}
            </div>
          </div>

          {exitDistribution ? (
            <div className="mt-6">
              <SignalOrbit segments={exitDistribution.segments} total={exitDistribution.total} />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {signalHighlights.map((item) => (
                <MetricTile key={item.label} item={item} />
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          {signalHighlights.map((item) => (
            <MetricTile key={item.label} item={item} />
          ))}
        </div>
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
          ? 'Deze laag maakt het patroon leesbaar door signalen als één compositie te tonen in plaats van als losse bullets.'
          : `Deze laag opent samen met het kernsignaal vanaf ${MIN_N_DISPLAY} responses.`
      }
      className="rounded-[28px]"
    >
      {blockVisibility.synthesis === 'visible' && synthesisItems.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {synthesisItems.map((item, index) => (
            <div key={`${item.label}-${item.title}`} className={index === 0 ? 'xl:col-span-2' : undefined}>
              <SummaryCard item={item} index={index} />
            </div>
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
              .join(' / ')
          : 'Nog niet beschikbaar'
      }
      body={
        blockVisibility.drivers === 'visible'
          ? 'De driverlaag laat eerst de prioriteiten zien en pas daarna de volledige rangorde. Zo blijft de lezing snel en visueel scherp.'
          : `Deze laag blijft begrensd tot er minimaal ${MIN_N_PATTERNS} leesbare responses zijn.`
      }
      className="rounded-[28px]"
    >
      {blockVisibility.drivers === 'visible' && factorPriorityRows.length > 0 ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {factorPriorityRows.slice(0, 3).map((row, index) => (
              <PrioritySpotlight key={row.factor} row={row} rank={index + 1} />
            ))}
          </div>

          <div className="hidden overflow-hidden border border-slate-200 md:block">
            <div className="grid grid-cols-[minmax(0,1.8fr),140px,140px,160px] border-b border-slate-200 bg-[color:var(--dashboard-soft)]/45 px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span>Factor</span>
              <span>Score</span>
              <span>Signaal</span>
              <span>Band</span>
            </div>
            {factorPriorityRows.slice(0, 6).map((row) => (
              <div
                key={row.factor}
                className="grid grid-cols-[minmax(0,1.8fr),140px,140px,160px] border-b border-slate-200 px-5 py-4 last:border-b-0"
              >
                <div className="pr-4">
                  <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.factor}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{row.note}</p>
                </div>
                <div className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.score}</div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.signal}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#C36A29,#D9985D)]"
                      style={{ width: `${Math.max(10, Math.min(100, row.signalValue * 10))}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                    {row.band}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:hidden">
            {factorPriorityRows.slice(0, 6).map((row) => (
              <div key={row.factor} className="rounded-[24px] border border-slate-200 bg-[color:var(--dashboard-soft)]/38 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.factor}</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{row.note}</p>
                  </div>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {row.band}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Score
                    </p>
                    <p className="mt-2 font-semibold text-[color:var(--dashboard-ink)]">{row.score}</p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Signaal
                    </p>
                    <p className="mt-2 font-semibold text-[color:var(--dashboard-ink)]">{row.signal}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#C36A29,#D9985D)]"
                    style={{ width: `${Math.max(10, Math.min(100, row.signalValue * 10))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
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
          ? 'De verdiepingslaag geeft extra context met een rustiger ritme, zodat verdieping anders voelt dan het hero-signaal erboven.'
          : `Deze laag opent vanaf ${MIN_N_DISPLAY} leesbare responses.`
      }
      className="rounded-[28px]"
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {depthNotes.map((note) => (
            <div key={note.label} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {note.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{note.body}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr),minmax(0,1.05fr)]">
          <div className="space-y-4">
            {blockVisibility.depth === 'visible' && sdtRows.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                {sdtRows.map((row) => (
                  <div key={row.factor} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(246,239,229,0.84))] px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{row.factor}</p>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{row.note}</p>
                      </div>
                      <div
                        className="relative size-[4.4rem] shrink-0 rounded-full"
                        style={{
                          background: `conic-gradient(#C36A29 0 ${Math.max(10, Math.min(100, row.scoreValue * 10))}%, rgba(195,106,41,0.14) ${Math.max(10, Math.min(100, row.scoreValue * 10))}% 100%)`,
                        }}
                      >
                        <div className="absolute inset-[7px] rounded-full bg-white/95" />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                          {row.score}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#C36A29,#D9985D)]"
                        style={{ width: `${Math.max(10, Math.min(100, row.scoreValue * 10))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyInlineState body="Nog geen extra verdiepingslaag zichtbaar binnen de huidige routegegevens." />
            )}
          </div>

          <div className="space-y-4">
            {blockVisibility.depth === 'visible' && factorPriorityRows.length > 0 ? (
              <div className="rounded-[26px] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Organisatiefactoren
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">
                    Rangorde van de sterkst zichtbare factoren binnen deze route.
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  {factorPriorityRows.slice(0, 5).map((row) => (
                    <div key={row.factor} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-[color:var(--dashboard-ink)]">{row.factor}</span>
                        <span className="font-semibold text-[color:var(--dashboard-ink)]">{row.signal}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--dashboard-soft)]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#C36A29,#D9985D)]"
                          style={{ width: `${Math.max(10, Math.min(100, row.signalValue * 10))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <MethodologyCard
              scanType={stats.scan_type}
              signalLabel={scanDefinition.signalLabel}
              embedded
            />
          </div>
        </div>
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
          ? 'Survey-stemmen sluiten de kwantitatieve lagen af met geclusterde, geanonimiseerde taal uit dezelfde route.'
          : hasMinDisplay
            ? 'Er zijn nog geen vrijgegeven open antwoorden binnen deze route.'
            : `Open antwoorden openen pas vanaf ${MIN_N_DISPLAY} leesbare responses.`
      }
      href={showOpenAnswersRoute ? openAnswersHref : undefined}
      linkLabel={showOpenAnswersRoute ? 'Bekijk alle open antwoorden' : undefined}
      className="rounded-[28px]"
    >
      {blockVisibility.voices === 'visible' && openAnswersViewModel.groups.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {openAnswersViewModel.themes.slice(0, 3).map((theme) => (
              <span
                key={theme.title}
                className="rounded-full border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(246,239,229,0.84))] px-3 py-1 text-xs font-semibold text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
              >
                {theme.title} · {theme.count}
              </span>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {openAnswersViewModel.groups
              .flatMap((group) => group.answers.slice(0, 1).map((answer) => ({ group, answer })))
              .slice(0, 3)
              .map(({ group, answer }) => (
                <div
                  key={answer.id}
                  className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(246,239,229,0.82))] px-5 py-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]"
                >
                  <div className="absolute -left-2 top-2 text-[4.5rem] leading-none tracking-[-0.08em] text-[#C36A29]/10">
                    ”
                  </div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                    {group.title}
                  </p>
                  <p className="relative mt-4 text-sm leading-6 text-[color:var(--dashboard-text)]">
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
