import Link from "next/link"
import { notFound } from "next/navigation"
import { ExitProductDashboard } from "@/components/dashboard/exit-product-dashboard"
import { SuiteAccessDenied } from "@/components/dashboard/suite-access-denied"
import { getManagementBandLabel } from "@/lib/management-language"
import { getScanDefinition } from "@/lib/scan-definitions"
import {
  getDashboardModuleHref,
  getDashboardModuleKeyForScanType,
  getDashboardModuleLabel,
} from "@/lib/dashboard/shell-navigation"
import { loadSuiteAccessContext } from "@/lib/suite-access-server"
import { createClient } from "@/lib/supabase/server"
import { FACTOR_LABELS, hasCampaignAddOn } from "@/lib/types"
import type { CampaignStats, Respondent, SurveyResponse } from "@/lib/types"
import { PdfDownloadButton } from "./pdf-download-button"
import {
  MethodologyCard,
  MIN_N_DISPLAY,
  MIN_N_PATTERNS,
  computeAverageSignalScore,
  computeFactorAverages,
  computeStrongWorkSignalRate,
  getTopContributingReasonLabel,
  getTopExitReasonLabel,
} from "./page-helpers"
import { ResultsLayout } from "./results-layout"
import {
  buildResultsViewModel,
  type ResultsBlockVisibility,
} from "./results-view-model"

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

type NarrativeItem = {
  title: string
  tag: string
  body: string
}

type ContributingItem = {
  label: string
  value: string
  body: string
}

const PRIMARY_RESULTS_ORDER = {
  response: "Responsbasis",
  signal: "Kernsignaal",
  synthesis: "Signalen in samenhang",
  drivers: "Drivers & prioriteiten",
  depth: "Verdiepingslagen",
  voices: "Survey-stemmen",
} as const

function formatRoutePeriodLabel(campaignName: string, createdAt: string) {
  const quarterMatch = campaignName.match(/Q[1-4]\s?\d{4}/i)
  if (quarterMatch) return quarterMatch[0].replace(/\s+/, " ")

  return new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
  }).format(new Date(createdAt))
}

function deriveScopeLabel(respondents: Respondent[]) {
  const departments = Array.from(
    new Set(respondents.map((respondent) => respondent.department).filter(Boolean)),
  ) as string[]

  if (departments.length === 0) return "Scope binnen deze route"
  if (departments.length === 1) return departments[0]
  if (departments.length === 2) return `${departments[0]} & ${departments[1]}`
  return `${departments[0]}, ${departments[1]} + ${departments.length - 2} meer`
}

function getDashboardModuleBackLinkLabel(scanType: CampaignStats["scan_type"]) {
  if (scanType === "exit") return "Terug naar alle ExitScans"
  if (scanType === "retention") return "Terug naar alle RetentieScans"
  if (scanType === "onboarding") return "Terug naar alle Onboarding 30-60-90-routes"
  if (scanType === "pulse") return "Terug naar alle Pulse-routes"
  if (scanType === "leadership") return "Terug naar alle Leadership Scans"
  return "Terug naar overzicht"
}

function buildResponseContextNote(totalCompleted: number, completionRate: number) {
  if (totalCompleted >= MIN_N_PATTERNS) {
    return `Responsbasis van ${completionRate}% is stevig genoeg voor een eerste lezing. Lees verschillen nog steeds in samenhang met scope en context.`
  }

  return `Eerste read is zichtbaar, maar detail blijft nog begrensd. Gebruik de responsbasis van ${completionRate}% vooral om richting te bepalen, niet om al te ver te concluderen.`
}

function buildVisibleVoices(responses: SurveyResponse[]) {
  const sanitize = (value: string) =>
    value
      .replace(/\s+/g, " ")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[verwijderd]")
      .replace(/https?:\/\/\S+/gi, "[link verwijderd]")
      .replace(/\+?\d[\d\s().-]{7,}\d/g, "[verwijderd]")
      .trim()

  const seen = new Set<string>()

  return responses
    .map((response) =>
      sanitize(response.open_text_raw?.trim() || response.open_text_analysis?.trim() || ""),
    )
    .filter((text) => text.length >= 24)
    .filter((text) => {
      const normalized = text.toLowerCase()
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
    .slice(0, 2)
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
    if (code.startsWith("PL")) counts.pull += 1
    else if (code.startsWith("S")) counts.situational += 1
    else counts.work += 1
  }

  const total = counts.work + counts.pull + counts.situational
  const toPercent = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

  return {
    total,
    segments: [
      {
        label: "Werkfrictie zichtbaar",
        value: `${toPercent(counts.work)}%`,
        percent: toPercent(counts.work),
      },
      {
        label: "Andere trekfactoren zichtbaar",
        value: `${toPercent(counts.pull)}%`,
        percent: toPercent(counts.pull),
      },
      {
        label: "Situationele context zichtbaar",
        value: `${toPercent(counts.situational)}%`,
        percent: toPercent(counts.situational),
      },
    ],
  }
}

function buildExitNarratives(args: {
  topFactorLabel: string | null
  secondFactorLabel: string | null
  topExitReasonLabel: string | null
  topContributingReasonLabel: string | null
  strongWorkSignalRate: number | null
  distribution: ReturnType<typeof buildExitPictureDistribution>
}): NarrativeItem[] {
  const items: NarrativeItem[] = []

  if (args.topFactorLabel) {
    items.push({
      title: `${args.topFactorLabel} zet de eerste leesrichting`,
      tag: "Primair signaal",
      body: `${args.topFactorLabel} ligt het scherpst onder de organisatiefactoren en hoort daarom de eerste bestuurlijke leeslaag te openen.`,
    })
  }

  if (args.secondFactorLabel) {
    items.push({
      title: `${args.secondFactorLabel} versterkt het vertrekbeeld`,
      tag: "Samenhang",
      body: `${args.secondFactorLabel} komt niet losstaand terug, maar kleurt het patroon mee naast de eerste driver.`,
    })
  }

  if (args.topExitReasonLabel || args.topContributingReasonLabel) {
    items.push({
      title: "Vertrekredenen en context wijzen dezelfde kant op",
      tag: "Rapportlezing",
      body: `${args.topExitReasonLabel ?? "De dominante vertrekreden"} en ${args.topContributingReasonLabel ?? "de contextcodes"} versterken samen het beeld dat vooral intern werkgerelateerde frictie zichtbaar is.`,
    })
  }

  if (items.length < 3) {
    items.push({
      title: "Werkfrictie blijft de dominante lezing",
      tag: "Vertrekbeeld",
      body: `${args.distribution.segments[0]?.value ?? "0%"} van het vertrekbeeld valt in werkfrictie. Andere trekfactoren en situationele context blijven zichtbaar, maar dragen minder hard de eerste managementread.`,
    })
  }

  if (items.length < 3 && args.strongWorkSignalRate !== null) {
    items.push({
      title: "Beinvloedbare werkcontext blijft bestuurlijk relevant",
      tag: "Werkbaarheid",
      body: `${args.strongWorkSignalRate}% van de leesbare responses valt in sterk werksignaal. Daardoor blijft deze route bestuurlijk vooral een intern werkvraagstuk, niet alleen een marktvraagstuk.`,
    })
  }

  return items.slice(0, 3)
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
            ? "Vraagt in dit beeld als eerste aandacht."
            : signalValue >= 4.5
              ? "Eerst toetsen voordat deze factor zwaarder meeweegt."
              : "Zichtbaar, maar niet de eerste factor om te openen.",
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
    { key: "autonomy", label: "Autonomie", value: sdtAverages.autonomy },
    { key: "competence", label: "Competentie & groei", value: sdtAverages.competence },
    { key: "relatedness", label: "Verbondenheid", value: sdtAverages.relatedness },
  ]
    .filter((item) => typeof item.value === "number")
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
            ? "Draagt duidelijk mee aan het vertrekbeeld."
            : signalValue >= 4.5
              ? "Relevant als verdiepingslaag naast de organisatiefactoren."
              : "Ondersteunend, maar niet de eerste driver van dit beeld.",
      } satisfies SdtRow
    })
}

function getResultsStatusLabel(readState: ReturnType<typeof buildResultsViewModel>["readState"]) {
  if (readState === "readable") return "Leesbaar"
  if (readState === "early-read") return "Eerste read"
  return "Nog aan het opbouwen"
}

function ResultsBlockCard({
  title,
  visibility,
  value,
  body,
  href,
  linkLabel,
}: {
  title: string
  visibility: ResultsBlockVisibility
  value?: string
  body: string
  href?: string
  linkLabel?: string
}) {
  const toneClasses =
    visibility === "visible"
      ? "border-slate-200 bg-white"
      : "border-dashed border-slate-200 bg-slate-50"

  return (
    <div className={`rounded-[22px] px-5 py-5 shadow-sm ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
          {title}
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-600">
          {visibility === "visible" ? "Vrij" : "Begrensd"}
        </span>
      </div>
      {value ? (
        <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
          {value}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[color:var(--dashboard-text)]">{body}</p>
      {href && linkLabel ? (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
        >
          {linkLabel}
        </Link>
      ) : null}
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
        </Link>{" "}
        /{" "}
        <Link href={moduleHref} className="transition-colors hover:text-slate-700">
          {moduleLabel}
        </Link>{" "}
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
            {organizationName} <span aria-hidden="true">&middot;</span> {routePeriodLabel}{" "}
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
    .from("campaign_stats")
    .select("*")
    .eq("campaign_id", id)
    .single()

  if (!statsRow) notFound()
  const stats = statsRow as CampaignStats

  const [{ data: organization }, { data: campaignMeta }, { data: responsesRaw }, { data: respondentsRaw }] =
    await Promise.all([
      supabase.from("organizations").select("name").eq("id", stats.organization_id).maybeSingle(),
      supabase.from("campaigns").select("enabled_modules").eq("id", id).maybeSingle(),
      supabase
        .from("survey_responses")
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
        .eq("respondents.campaign_id", id),
      supabase
        .from("respondents")
        .select("*")
        .eq("campaign_id", id)
        .order("completed_at", { ascending: false, nullsFirst: false }),
    ])

  const responses = (responsesRaw ?? []) as unknown as (SurveyResponse & {
    respondents: Respondent
  })[]
  const respondents = (respondentsRaw ?? []) as Respondent[]

  const factorData = computeFactorAverages(responses)
  const factorPriorityRows = buildFactorPriorityRows(factorData.orgAverages)
  const sdtRows = buildSdtRows(factorData.sdtAverages)
  const averageRiskScore = computeAverageSignalScore(responses)
  const hasMinDisplay = responses.length >= MIN_N_DISPLAY
  const hasEnoughData = responses.length >= MIN_N_PATTERNS
  const openAnswers = buildVisibleVoices(responses)
  const openAnswersHref = `/campaigns/${id}/open-antwoorden`
  const resultsViewModel = buildResultsViewModel({
    scanType: stats.scan_type,
    respondentsCount: respondents.length,
    hasMinDisplay,
    hasEnoughData,
    hasOpenAnswers: openAnswers.length > 0,
  })
  const blockVisibility = Object.fromEntries(
    resultsViewModel.blocks.map((block) => [block.key, block.visibility]),
  ) as Record<"response" | "signal" | "synthesis" | "drivers" | "depth" | "voices", ResultsBlockVisibility>

  const scanDefinition = getScanDefinition(stats.scan_type)
  const organizationName = organization?.name ?? "Organisatie"
  const routePeriodLabel = formatRoutePeriodLabel(stats.campaign_name, stats.created_at)
  const scopeLabel = deriveScopeLabel(respondents)
  const moduleKey =
    stats.scan_type === "team" ? null : getDashboardModuleKeyForScanType(stats.scan_type)
  const moduleLabel = moduleKey ? getDashboardModuleLabel(moduleKey) : scanDefinition.productName
  const moduleHref = moduleKey ? getDashboardModuleHref(moduleKey) : "/dashboard"
  const moduleBackLinkLabel = getDashboardModuleBackLinkLabel(stats.scan_type)
  const topFactorLabel = factorPriorityRows[0]?.factor ?? null
  const secondFactorLabel = factorPriorityRows[1]?.factor ?? null

  const responseSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.response}
      visibility={blockVisibility.response}
      value={`${stats.total_completed}/${stats.total_invited} ingevuld · ${stats.completion_rate_pct ?? 0}%`}
      body={buildResponseContextNote(stats.total_completed, stats.completion_rate_pct ?? 0)}
      href={stats.scan_type === "exit" ? "#responscontext" : undefined}
      linkLabel={stats.scan_type === "exit" ? "Ga naar responscontext" : undefined}
    />
  )

  const signalSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.signal}
      visibility={blockVisibility.signal}
      value={averageRiskScore !== null && hasMinDisplay ? `${averageRiskScore.toFixed(1)}/10` : "Nog niet beschikbaar"}
      body={
        topFactorLabel && hasMinDisplay
          ? `${scanDefinition.signalLabel} blijft de opening, met ${topFactorLabel.toLowerCase()} als eerste zichtbare factor binnen deze route.`
          : `Deze laag komt pas vrij vanaf ${MIN_N_DISPLAY} leesbare responses. Tot die tijd blijft het kernsignaal bewust begrensd.`
      }
      href={stats.scan_type === "exit" ? "#sterkste-signaal" : undefined}
      linkLabel={stats.scan_type === "exit" ? "Ga naar sterkste signaal" : undefined}
    />
  )

  const synthesisTitle =
    stats.scan_type === "exit"
      ? getTopExitReasonLabel(responses) ?? topFactorLabel ?? "Nog niet beschikbaar"
      : topFactorLabel ?? "Nog niet beschikbaar"
  const synthesisBody =
    stats.scan_type === "exit"
      ? getTopContributingReasonLabel(responses)
        ? `${getTopContributingReasonLabel(responses)} speelt zichtbaar mee naast de dominante vertrekreden en hoort in dezelfde managementlezing thuis.`
        : `Deze laag blijft pas echt scherp zodra er naast de hoofdreden ook een tweede contextsignaal stevig terugkomt.`
      : secondFactorLabel
        ? `${secondFactorLabel} kleurt het primaire signaal mee en helpt om verschillen in samenhang te lezen, niet als los detail.`
        : `Gebruik deze laag pas steviger vanaf voldoende respons en meer dan een enkel zichtbaar factorspoor.`

  const synthesisSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.synthesis}
      visibility={blockVisibility.synthesis}
      value={blockVisibility.synthesis === "visible" ? synthesisTitle : "Nog niet beschikbaar"}
      body={synthesisBody}
      href={stats.scan_type === "exit" ? "#hoofdreden-vertrekbeeld" : undefined}
      linkLabel={stats.scan_type === "exit" ? "Ga naar samenhang" : undefined}
    />
  )

  const driversValue =
    factorPriorityRows.length > 0 && hasEnoughData
      ? factorPriorityRows
          .slice(0, 3)
          .map((row) => row.factor)
          .join(" · ")
      : "Nog niet beschikbaar"
  const driversSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.drivers}
      visibility={blockVisibility.drivers}
      value={driversValue}
      body={
        hasEnoughData
          ? "Gebruik deze laag om te zien welke factoren het eerst bestuurlijke aandacht vragen. Prioriteiten blijven groepsmatig en feitelijk."
          : `Deze laag blijft begrensd tot er minimaal ${MIN_N_PATTERNS} leesbare responses zijn.`
      }
      href={stats.scan_type === "exit" ? "#driverlaag" : undefined}
      linkLabel={stats.scan_type === "exit" ? "Ga naar drivers" : undefined}
    />
  )

  const depthValue =
    blockVisibility.depth === "visible"
      ? sdtRows.length > 0
        ? `${sdtRows.length} verdiepingslaag${sdtRows.length === 1 ? "" : "en"}`
        : `${factorPriorityRows.length} factorlaag${factorPriorityRows.length === 1 ? "" : "en"}`
      : "Nog niet beschikbaar"
  const depthSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.depth}
      visibility={blockVisibility.depth}
      value={depthValue}
      body={
        blockVisibility.depth === "visible"
          ? "Verdiepingslagen blijven ondersteunend aan de hoofdlezing: extra factorcontext, SDT en methodische begrenzing."
          : "Deze laag blijft bewust compact zolang de eerste veilige read nog niet volledig open ligt."
      }
      href={stats.scan_type === "exit" ? "#factorlaag" : undefined}
      linkLabel={stats.scan_type === "exit" ? "Ga naar verdieping" : undefined}
    />
  )

  const voicesPreview =
    openAnswers[0] && blockVisibility.voices === "visible"
      ? openAnswers[0].length > 120
        ? `${openAnswers[0].slice(0, 117).trimEnd()}...`
        : openAnswers[0]
      : "Nog niet beschikbaar"
  const voicesBody =
    blockVisibility.voices === "visible"
      ? "Survey-stemmen blijven geanonimiseerd en horen bij deze resultatenomgeving. Open antwoorden zijn in een klik bereikbaar."
      : "Open antwoorden komen pas vrij zodra er daadwerkelijk leesbare survey-stemmen beschikbaar zijn."
  const voicesSection = (
    <ResultsBlockCard
      title={PRIMARY_RESULTS_ORDER.voices}
      visibility={blockVisibility.voices}
      value={voicesPreview}
      body={voicesBody}
      href={openAnswersHref}
      linkLabel="Open alle open antwoorden"
    />
  )

  const summaryShell = (
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
  )

  if (stats.scan_type === "exit") {
    const strongWorkSignalRate = hasMinDisplay ? computeStrongWorkSignalRate(responses) : null
    const topExitReasonLabel = hasMinDisplay ? getTopExitReasonLabel(responses) : null
    const topContributingReasonLabel = hasMinDisplay ? getTopContributingReasonLabel(responses) : null
    const exitDistribution = hasMinDisplay ? buildExitPictureDistribution(responses) : { total: 0, segments: [] }
    const exitNarratives =
      hasMinDisplay
        ? buildExitNarratives({
            topFactorLabel,
            secondFactorLabel,
            topExitReasonLabel,
            topContributingReasonLabel,
            strongWorkSignalRate,
            distribution: buildExitPictureDistribution(responses),
          })
        : []
    const contributingItems: ContributingItem[] = []

    if (topContributingReasonLabel) {
      contributingItems.push({
        label: "Contextcode",
        value: topContributingReasonLabel,
        body: "Deze meespelende reden ligt zichtbaar onder het vertrekbeeld en helpt om de hoofdrichting beter feitelijk te lezen.",
      })
    }

    if (secondFactorLabel) {
      contributingItems.push({
        label: "Tweede factor",
        value: secondFactorLabel,
        body: "Deze factor kleurt mee naast het primaire signaal en hoort daarom in dezelfde analytische laag thuis.",
      })
    }

    return (
      <div className="space-y-10">
        {summaryShell}
        <ExitProductDashboard
          moduleHref={moduleHref}
          moduleLabel={moduleLabel}
          moduleBackLinkLabel={moduleBackLinkLabel}
          campaignName={stats.campaign_name}
          organizationName={organizationName}
          routePeriodLabel={routePeriodLabel}
          scopeLabel={scopeLabel}
          statusLabel={getResultsStatusLabel(resultsViewModel.readState)}
          headerActions={
            <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
          }
          averageSignalScoreLabel={
            averageRiskScore !== null && hasMinDisplay ? `${averageRiskScore.toFixed(1)}/10` : "Nog niet beschikbaar"
          }
          strongestFactorLabel={topFactorLabel ?? "Nog niet beschikbaar"}
          strongWorkSignalLabel={
            strongWorkSignalRate !== null ? `${strongWorkSignalRate}%` : "Nog niet beschikbaar"
          }
          primaryReasonTitle={topExitReasonLabel ?? topFactorLabel ?? "Nog niet beschikbaar"}
          primaryReasonBody={
            topExitReasonLabel
              ? `${topExitReasonLabel} geeft de bestuurlijke hoofdrichting van het vertrekbeeld binnen deze route.`
              : "Nog niet beschikbaar voor een eerlijke analytische hoofdrichting."
          }
          whyItMattersItems={exitNarratives}
          contributingItems={contributingItems}
          totalInvited={String(stats.total_invited)}
          totalCompleted={String(stats.total_completed)}
          responseRate={`${stats.completion_rate_pct ?? 0}%`}
          responseContextNote={buildResponseContextNote(stats.total_completed, stats.completion_rate_pct ?? 0)}
          topFactors={blockVisibility.signal === "visible" ? factorPriorityRows : []}
          distributionSegments={blockVisibility.synthesis === "visible" ? exitDistribution.segments : []}
          factorRows={blockVisibility.drivers === "visible" ? factorPriorityRows : []}
          sdtRows={blockVisibility.depth === "visible" ? sdtRows : []}
          methodologyContent={
            <MethodologyCard
              scanType={stats.scan_type}
              hasSegmentDeepDive={hasCampaignAddOn(campaignMeta, "segment_deep_dive")}
              signalLabel={scanDefinition.signalLabel}
              embedded
            />
          }
        />
      </div>
    )
  }

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
      {summaryShell}
    </div>
  )
}
