import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLiveActionCenterScanType } from "@/lib/action-center-live";
import {
  buildActionCenterRouteOpenPatch,
  buildActionCenterRouteOpenRedirect,
  canOpenActionCenterRoute,
  getActionCenterRouteOpenableStages,
  hasOpenedActionCenterRoute,
} from "@/lib/dashboard/open-action-center-route";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ExitProductDashboard } from "@/components/dashboard/exit-product-dashboard";
import { CampaignActions } from "./campaign-actions";
import { PdfDownloadButton } from "./pdf-download-button";
import {
  DashboardChartPanel,
  DashboardChip,
  DashboardDisclosure,
  DashboardHero,
  DashboardKeyValue,
  DashboardPanel,
  DashboardRecommendationRail,
  DashboardSection,
  DashboardSummaryBar,
  DashboardTimeline,
  FocusPanel,
  InsightStatCard,
  SignalStatCard,
} from "@/components/dashboard/dashboard-primitives";
import {
  ManagementReadBridge,
  ManagementReadDistribution,
  ManagementReadFactorTable,
  ManagementReadHeader,
  ManagementReadInfoGrid,
  ManagementReadNarratives,
  ManagementReadSection,
} from "@/components/dashboard/management-read-primitives";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { FactorTable } from "@/components/dashboard/factor-table";
import { GuidedSelfServePanel } from "@/components/dashboard/guided-self-serve-panel";
import { buildLaunchControlState } from "@/lib/launch-controls";
import { ManagementReadGuide } from "@/components/dashboard/onboarding-panels";
import {
  OnboardingAdvancer,
  OnboardingBalloon,
} from "@/components/dashboard/onboarding-balloon";
import { PreflightChecklist } from "@/components/dashboard/preflight-checklist";
import { RespondentTable } from "@/components/dashboard/respondent-table";
import { RiskCharts } from "@/components/dashboard/risk-charts";
import { SuiteAccessDenied } from "@/components/dashboard/suite-access-denied";
import { getContactRequestsForAdmin } from "@/lib/contact-requests";
import { deriveGuidedSelfServeDiscipline } from "@/lib/guided-self-serve";
import {
  getCampaignCompositionState,
  isManagementVisibleState,
} from "@/lib/dashboard/dashboard-state-composition";
import {
  ActionPlaybookList,
  buildCampaignDetailActionCenterBridge,
  buildDecisionPanels,
  buildHeroDescription,
  buildInsightWarnings,
  buildPulseComparisonState,
  buildRetentionSegmentPlaybooks,
  buildRetentionTrendCards,
  buildRiskHistogram,
  buildSafeTableResponses,
  CampaignHealthIndicator,
  clusterRetentionOpenSignals,
  computeAverageSignalScore,
  computePulseSignalAverages,
  computeAverageSignalVisibility,
  computeFactorAverages,
  computeRetentionSignalAverages,
  computeRetentionSupplementalAverages,
  computeStrongWorkSignalRate,
  getDisclosureDefaults,
  getTopContributingReasonLabel,
  getTopExitReasonLabel,
  MethodologyCard,
  MIN_N_DISPLAY,
  MIN_N_PATTERNS,
  PulseTrendSection,
  RecommendationList,
  RetentionTrendSection,
  SegmentPlaybookList,
  SdtGauge,
} from "./page-helpers";
import {
  buildCampaignReadinessState,
  getDeliveryModeLabel,
} from "@/lib/implementation-readiness";
import { getFirstNextStepGuidance } from "@/lib/client-onboarding";
import { type CampaignAuditEventRecord } from "@/lib/campaign-audit";
import { getCustomerActionPermission } from "@/lib/customer-permissions";
import {
  buildFactorPresentation,
  getManagementBandLabel,
  getRiskBandFromScore,
} from "@/lib/management-language";
import type {
  CampaignDeliveryCheckpoint,
  CampaignDeliveryRecord,
} from "@/lib/ops-delivery";
import {
  buildTeamLocalReadState,
  buildTeamPriorityReadState,
} from "@/lib/products/team";
import { getProductModule } from "@/lib/products/shared/registry";
import { buildResponseActivationState } from "@/lib/response-activation";
import { getScanDefinition } from "@/lib/scan-definitions";
import {
  getDashboardModuleHref,
  getDashboardModuleKeyForScanType,
  getDashboardModuleLabel,
} from "@/lib/dashboard/shell-navigation";
import { loadSuiteAccessContext } from "@/lib/suite-access-server";
import { FACTOR_LABELS, hasCampaignAddOn } from "@/lib/types";
import type { CampaignStats, Respondent, SurveyResponse } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

type PresentationMetricKey =
  | "signal"
  | "owner"
  | "next-step"
  | "review"
  | "response"
  | "readiness";

type PresentationMetric = {
  label: string;
  value: string;
  tone: "slate" | "blue" | "emerald" | "amber";
  accent?: string;
  helpText?: string;
};

function buildPresentationMetrics({
  productExperience,
  scanDefinition,
  dashboardViewModel,
  averageRiskScore,
  totalCompleted,
  totalInvited,
  compositionStateMeta,
  hasEnoughData,
}: {
  productExperience: {
    summarySignalLabel: string;
    summaryFocusLabel: string;
    reviewLabel: string;
  };
  scanDefinition: ReturnType<typeof getScanDefinition>;
  dashboardViewModel: {
    topSummaryCards: Array<{ title: string; value?: string }>;
    nextStep: { title: string };
  };
  averageRiskScore: number | null;
  totalCompleted: number;
  totalInvited: number;
  compositionStateMeta: {
    label: string;
    tone: "slate" | "blue" | "emerald" | "amber";
  };
  hasEnoughData: boolean;
}): Record<PresentationMetricKey, PresentationMetric> {
  const ownerValue =
    findPresentationCardValue(dashboardViewModel.topSummaryCards, [
      "Eerste eigenaar",
    ]) ?? "Nog niet vrijgegeven";
  const reviewValue =
    findPresentationCardValue(dashboardViewModel.topSummaryCards, [
      "Reviewmoment",
      "Reviewgrens",
      "Leesgrens",
    ]) ?? "Nog indicatief";

  return {
    signal: {
      label: productExperience.summarySignalLabel,
      value:
        averageRiskScore !== null
          ? `${averageRiskScore.toFixed(1)}/10`
          : "Nog geen veilig beeld",
      tone: averageRiskScore !== null ? "slate" : "amber",
      helpText: scanDefinition.signalHelp,
    },
    owner: {
      label: "Eerste eigenaar",
      value: ownerValue,
      tone: "slate",
    },
    "next-step": {
      label: productExperience.summaryFocusLabel,
      value: dashboardViewModel.nextStep.title,
      tone: hasEnoughData ? "slate" : "amber",
    },
    review: {
      label: productExperience.reviewLabel,
      value: reviewValue,
      tone: "slate",
    },
    response: {
      label: "Responsstatus",
      value: `${totalCompleted}/${totalInvited || 0} ingevuld`,
      tone: hasEnoughData ? "emerald" : "amber",
    },
    readiness: {
      label: "Dashboardstatus",
      value: compositionStateMeta.label,
      tone: compositionStateMeta.tone,
    },
  };
}

function findPresentationCardValue(
  cards: Array<{ title: string; value?: string }>,
  titles: string[],
) {
  for (const title of titles) {
    const match = cards.find((card) => card.title === title && card.value);
    if (match?.value) return match.value;
  }

  return null;
}

function normalizeInformationalTone(
  tone: "slate" | "blue" | "emerald" | "amber",
) {
  return tone === "blue" ? "slate" : tone;
}

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

function buildResponseContextNote(totalCompleted: number, completionRate: number) {
  if (totalCompleted >= MIN_N_PATTERNS) {
    return `Responsbasis van ${completionRate}% is stevig genoeg voor een eerste lezing. Lees verschillen nog steeds in samenhang met scope en context.`
  }

  return `Eerste read is zichtbaar, maar detail blijft nog begrensd. Gebruik de responsbasis van ${completionRate}% vooral om richting te bepalen, niet om al te ver te concluderen.`
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
    workPercent: toPercent(counts.work),
    pullPercent: toPercent(counts.pull),
    situationalPercent: toPercent(counts.situational),
    segments: [
      { label: "Werkfrictie zichtbaar", value: `${toPercent(counts.work)}%`, percent: toPercent(counts.work) },
      { label: "Andere trekfactoren zichtbaar", value: `${toPercent(counts.pull)}%`, percent: toPercent(counts.pull) },
      { label: "Situationele context zichtbaar", value: `${toPercent(counts.situational)}%`, percent: toPercent(counts.situational) },
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
}) {
  const items = []

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

  if (args.strongWorkSignalRate !== null) {
    items.push({
      title: "Beïnvloedbare werkcontext blijft bestuurlijk relevant",
      tag: "Werkbaarheid",
      body: `${args.strongWorkSignalRate}% van de leesbare responses valt in sterk werksignaal. Daardoor blijft deze route bestuurlijk vooral een intern werkvraagstuk, niet alleen een marktvraagstuk.`,
    })
  }

  if (items.length < 3) {
    items.push({
      title: "Werkfrictie blijft de dominante lezing",
      tag: "Vertrekbeeld",
      body: `${args.distribution.workPercent}% van het vertrekbeeld valt in werkfrictie. Andere trekfactoren en situationele context blijven zichtbaar, maar dragen minder hard de eerste managementread.`,
    })
  }

  return items.slice(0, 3)
}

function buildRetentionNarratives(args: {
  topFactorLabel: string | null
  secondFactorLabel: string | null
  retentionThemes: Array<{ title: string; implication: string; sample: string }>
  averageRiskScore: number | null
  turnoverIntention: number | null
  engagement: number | null
}) {
  const items = []

  if (args.topFactorLabel) {
    items.push({
      title: `${args.topFactorLabel} draagt de eerste behoudsdruk`,
      tag: "Hoofdpatroon",
      body: `${args.topFactorLabel} ligt het scherpst onder de organisatiefactoren en hoort daarom de eerste bestuurlijke leesrichting te bepalen.`,
    })
  }

  if (args.secondFactorLabel) {
    items.push({
      title: `${args.secondFactorLabel} versterkt het risico`,
      tag: "Samenhang",
      body: `${args.secondFactorLabel} staat niet los, maar vergroot de kans dat behoudsdruk harder voelbaar wordt naast de eerste driver.`,
    })
  }

  if (args.retentionThemes[0]) {
    items.push({
      title: args.retentionThemes[0].title,
      tag: "Open signalen",
      body: args.retentionThemes[0].implication,
    })
  }

  if (items.length < 3 && args.averageRiskScore !== null && args.turnoverIntention !== null) {
    items.push({
      title: "Retentiesignaal, vertrekintentie en bevlogenheid moeten samen gelezen worden",
      tag: "Leesdiscipline",
      body: `Met een retentiesignaal van ${args.averageRiskScore.toFixed(1)}/10, vertrekintentie op ${args.turnoverIntention.toFixed(1)}/10 en bevlogenheid op ${args.engagement?.toFixed(1) ?? "-"}/10 ontstaat de bestuurlijke kern in de verhouding tussen blijven, twijfelen en actief willen vertrekken.`,
    })
  }

  return items.slice(0, 3)
}

function getDashboardModuleBackLinkLabel(scanType: CampaignStats["scan_type"]) {
  if (scanType === "exit") return "Terug naar alle ExitScans"
  if (scanType === "retention") return "Terug naar alle RetentieScans"
  if (scanType === "onboarding") return "Terug naar alle Onboarding 30-60-90-routes"
  if (scanType === "pulse") return "Terug naar alle Pulse-routes"
  if (scanType === "leadership") return "Terug naar alle Leadership Scans"
  return "Terug naar overzicht"
}

function buildFactorPriorityRows(factorAverages: Record<string, number>) {
  return Object.entries(factorAverages)
    .map(([factor, score]) => {
      const signalScore = 11 - score
      const presentation = buildFactorPresentation({
        score,
        signalScore,
        managementLabel: getManagementBandLabel(signalScore),
        showSignal: true,
      })

      return {
        factor: FACTOR_LABELS[factor] ?? factor,
        score: presentation.scoreDisplay,
        scoreValue: score,
        signal: presentation.signalDisplay,
        band: presentation.managementLabel,
        note:
          signalScore >= 7
            ? "Vraagt in dit beeld als eerste aandacht."
            : signalScore >= 4.5
              ? "Eerst toetsen voordat deze factor zwaarder meeweegt."
              : "Zichtbaar, maar niet de eerste factor om te openen.",
        signalValue: signalScore,
      }
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
      const signalScore = 11 - Number(item.value)
      return {
        factor: item.label,
        score: `${Number(item.value).toFixed(1)}/10`,
        scoreValue: Number(item.value),
        signal: `${signalScore.toFixed(1)}/10`,
        band: getManagementBandLabel(signalScore),
        note:
          signalScore >= 7
            ? "Draagt duidelijk mee aan het vertrekbeeld."
            : signalScore >= 4.5
              ? "Relevant als verdiepingslaag naast de organisatiefactoren."
              : "Ondersteunend, maar niet de eerste driver van dit beeld.",
      }
    })
}

function buildRetentionSignalSegments(riskDistribution: {
  HOOG: number
  MIDDEN: number
  LAAG: number
}) {
  const total = riskDistribution.HOOG + riskDistribution.MIDDEN + riskDistribution.LAAG
  const toPercent = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

  return [
    { label: "Actief vertrekdenkend", value: `${toPercent(riskDistribution.HOOG)}%`, percent: toPercent(riskDistribution.HOOG) },
    { label: "Latent risico", value: `${toPercent(riskDistribution.MIDDEN)}%`, percent: toPercent(riskDistribution.MIDDEN) },
    { label: "Stabiel", value: `${toPercent(riskDistribution.LAAG)}%`, percent: toPercent(riskDistribution.LAAG) },
  ]
}

function buildEngagementSegments(responses: SurveyResponse[]) {
  const counts = { high: 0, mid: 0, low: 0 }

  for (const response of responses) {
    const value = response.uwes_score
    if (typeof value !== "number") continue
    if (value >= 7) counts.high += 1
    else if (value >= 5) counts.mid += 1
    else counts.low += 1
  }

  const total = counts.high + counts.mid + counts.low
  const toPercent = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

  return [
    { label: "Bevlogen", value: `${toPercent(counts.high)}%`, percent: toPercent(counts.high) },
    { label: "Wisselend", value: `${toPercent(counts.mid)}%`, percent: toPercent(counts.mid) },
    { label: "Laag bevlogen", value: `${toPercent(counts.low)}%`, percent: toPercent(counts.low) },
  ]
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id);

  if (!context.canViewInsights) {
    return (
      <SuiteAccessDenied
        title="Je ziet hier geen campagnedetail"
        description="Jouw login opent alleen Action Center voor toegewezen teams. Surveyresultaten, campagnedetails en rapporten blijven zichtbaar voor HR en Verisight."
      />
    );
  }

  const { data: statsRow } = await supabase
    .from("campaign_stats")
    .select("*")
    .eq("campaign_id", id)
    .single();

  if (!statsRow) notFound();
  const stats = statsRow as CampaignStats;

  const { data: previousStatsRows } = await supabase
    .from("campaign_stats")
    .select("*")
    .eq("organization_id", stats.organization_id)
    .eq("scan_type", stats.scan_type)
    .lt("created_at", stats.created_at)
    .order("created_at", { ascending: false })
    .limit(1);
  const previousStats =
    (previousStatsRows?.[0] as CampaignStats | undefined) ?? null;

  const [
    { data: profile },
    { data: membership },
    { data: organization },
    { data: campaignMeta },
    { count: activeClientAccessCount },
    { count: pendingClientInviteCount },
  ] = await Promise.all([
    user
      ? supabase
          .from("profiles")
          .select("is_verisight_admin")
          .eq("id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("org_members")
          .select("role")
          .eq("org_id", stats.organization_id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("organizations")
      .select("name")
      .eq("id", stats.organization_id)
      .maybeSingle(),
    supabase
      .from("campaigns")
      .select("enabled_modules, delivery_mode")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("org_members")
      .select("id", { count: "exact", head: true })
      .eq("org_id", stats.organization_id)
      .in("role", ["viewer", "member"]),
    supabase
      .from("org_invites")
      .select("id", { count: "exact", head: true })
      .eq("org_id", stats.organization_id)
      .is("accepted_at", null),
  ]);

  const canManageCampaign =
    profile?.is_verisight_admin === true ||
    getCustomerActionPermission(membership?.role ?? null, "review_launch");
  const isVerisightAdmin = profile?.is_verisight_admin === true;
  const canExecuteCampaign =
    isVerisightAdmin ||
    getCustomerActionPermission(
      membership?.role ?? null,
      "import_respondents",
    ) ||
    getCustomerActionPermission(membership?.role ?? null, "launch_invites") ||
    getCustomerActionPermission(membership?.role ?? null, "send_reminders");
  const hasSegmentDeepDive = hasCampaignAddOn(
    campaignMeta,
    "segment_deep_dive",
  );
  const deliveryAdminClient = canExecuteCampaign ? createAdminClient() : null;
  const { data: deliveryVisibilityRecord } = deliveryAdminClient
    ? await deliveryAdminClient
        .from("campaign_delivery_records")
        .select("id")
        .eq("campaign_id", id)
        .maybeSingle()
    : { data: null };
  const { data: importQaCheckpointRaw } =
    deliveryAdminClient && deliveryVisibilityRecord?.id
      ? await deliveryAdminClient
          .from("campaign_delivery_checkpoints")
          .select("auto_state")
          .eq("delivery_record_id", deliveryVisibilityRecord.id)
          .eq("checkpoint_key", "import_qa")
          .maybeSingle()
      : { data: null };
  const importReady = importQaCheckpointRaw?.auto_state === "ready";
  const { data: deliveryRecordRaw } = await supabase
    .from("campaign_delivery_records")
    .select("*")
    .eq("campaign_id", id)
    .maybeSingle();
  const deliveryRecord = (deliveryRecordRaw ??
    null) as CampaignDeliveryRecord | null;
  const { data: deliveryCheckpointsRaw } = deliveryRecord
    ? await supabase
        .from("campaign_delivery_checkpoints")
        .select("*")
        .eq("delivery_record_id", deliveryRecord.id)
        .order("created_at", { ascending: true })
    : { data: [] };
  const deliveryCheckpoints = (deliveryCheckpointsRaw ??
    []) as CampaignDeliveryCheckpoint[];
  const guidedSetupDiscipline = deriveGuidedSelfServeDiscipline(
    deliveryCheckpoints
      .filter(
        (
          checkpoint,
        ): checkpoint is CampaignDeliveryCheckpoint & {
          checkpoint_key:
            | "implementation_intake"
            | "import_qa"
            | "invite_readiness";
        } =>
          checkpoint.checkpoint_key === "implementation_intake" ||
          checkpoint.checkpoint_key === "import_qa" ||
          checkpoint.checkpoint_key === "invite_readiness",
      )
      .map((checkpoint) => ({
        checkpointKey: checkpoint.checkpoint_key,
        manualState: checkpoint.manual_state,
      })),
  );
  const { data: auditEventsRaw } =
    isVerisightAdmin || Boolean(membership?.role)
      ? await supabase
          .from("campaign_action_audit_events")
          .select(
            "id, action_key, outcome, action_label, owner_label, actor_role, actor_label, summary, metadata, created_at",
          )
          .eq("campaign_id", id)
          .order("created_at", { ascending: false })
          .limit(8)
      : { data: [] };
  const auditEvents = (auditEventsRaw ?? []) as CampaignAuditEventRecord[];
  const {
    rows: deliveryLeadOptions,
    configError: deliveryLeadConfigError,
    loadError: deliveryLeadLoadError,
  } = isVerisightAdmin
    ? await getContactRequestsForAdmin(100)
    : { rows: [], configError: null, loadError: null };
  const deliveryLeadError = deliveryLeadConfigError ?? deliveryLeadLoadError;

  const { data: responsesRaw } = await supabase
    .from("survey_responses")
    .select(
      `
      id, respondent_id, risk_score, risk_band, preventability, stay_intent_score, uwes_score, turnover_intention_score,
      exit_reason_code, sdt_scores, org_scores, open_text_raw, open_text_analysis, full_result,
      submitted_at,
      respondents!inner(id, campaign_id, department, role_level, completed, completed_at, token)
    `,
    )
    .eq("respondents.campaign_id", id);
  const responses = (responsesRaw ?? []) as unknown as (SurveyResponse & {
    respondents: Respondent;
  })[];

  let previousResponses: (SurveyResponse & { respondents: Respondent })[] = [];
  if (
    (stats.scan_type === "retention" || stats.scan_type === "pulse") &&
    previousStats
  ) {
    const { data: previousResponsesRaw } = await supabase
      .from("survey_responses")
      .select(
        `
        id, respondent_id, risk_score, risk_band, preventability, stay_intent_score, uwes_score, turnover_intention_score,
        exit_reason_code, sdt_scores, org_scores, open_text_raw, open_text_analysis, full_result,
        submitted_at,
        respondents!inner(id, campaign_id, department, role_level, completed, completed_at, token)
      `,
      )
      .eq("respondents.campaign_id", previousStats.campaign_id);

    previousResponses = (previousResponsesRaw ??
      []) as unknown as (SurveyResponse & {
      respondents: Respondent;
    })[];
  }

  const { data: allRespondents } = await supabase
    .from("respondents")
    .select("*")
    .eq("campaign_id", id)
    .order("completed_at", { ascending: false, nullsFirst: false });
  const respondents = (allRespondents ?? []) as Respondent[];
  const unsentRespondents = respondents
    .filter((respondent) => !respondent.sent_at && !respondent.completed)
    .map((respondent) => ({
      token: respondent.token,
      email: respondent.email ?? null,
    }));
  const remindableCount = respondents.filter(
    (respondent) => Boolean(respondent.sent_at) && !respondent.completed,
  ).length;

  const factorData = computeFactorAverages(responses);
  const averageRiskScore = computeAverageSignalScore(responses);
  const strongWorkSignalRate =
    stats.scan_type === "exit" ? computeStrongWorkSignalRate(responses) : null;
  const topExitReasonLabel =
    stats.scan_type === "exit" ? getTopExitReasonLabel(responses) : null;
  const topContributingReasonLabel =
    stats.scan_type === "exit"
      ? getTopContributingReasonLabel(responses)
      : null;
  const signalVisibilityAverage =
    stats.scan_type === "exit"
      ? computeAverageSignalVisibility(responses)
      : null;
  const retentionSupplemental = computeRetentionSupplementalAverages(responses);
  const currentRetentionSignals =
    stats.scan_type === "retention"
      ? { retentionSignal: averageRiskScore, ...retentionSupplemental }
      : null;
  const previousRetentionSignals =
    stats.scan_type === "retention" && previousResponses.length > 0
      ? computeRetentionSignalAverages(previousResponses)
      : null;
  const currentPulseSignals =
    stats.scan_type === "pulse" ? computePulseSignalAverages(responses) : null;
  const previousPulseSignals =
    stats.scan_type === "pulse" && previousResponses.length > 0
      ? computePulseSignalAverages(previousResponses)
      : null;
  const pulseComparison =
    stats.scan_type === "pulse"
      ? buildPulseComparisonState({
          current: currentPulseSignals ?? computePulseSignalAverages([]),
          previous: previousPulseSignals,
          currentResponsesLength: responses.length,
          previousResponsesLength: previousResponses.length,
        })
      : null;
  const teamLocalRead =
    stats.scan_type === "team" ? buildTeamLocalReadState(responses) : null;
  const teamPriorityRead =
    stats.scan_type === "team" && teamLocalRead
      ? buildTeamPriorityReadState(teamLocalRead)
      : null;

  const hasEnoughData = responses.length >= MIN_N_PATTERNS;
  const hasMinDisplay = responses.length >= MIN_N_DISPLAY;
  const scanDefinition = getScanDefinition(stats.scan_type);
  const productModule = getProductModule(stats.scan_type);
  const teamPriorityBand = (signalValue: number) =>
    signalValue >= 7 ? "HOOG" : signalValue >= 4.5 ? "MIDDEN" : "LAAG";
  const pendingCount = stats.total_invited - stats.total_completed;
  const dashboardViewModel = productModule.buildDashboardViewModel({
    signalLabelLower: scanDefinition.signalLabelLower,
    averageSignal: averageRiskScore,
    strongWorkSignalRate,
    engagement: retentionSupplemental.engagement,
    turnoverIntention: retentionSupplemental.turnoverIntention,
    stayIntent: retentionSupplemental.stayIntent,
    hasEnoughData,
    hasMinDisplay,
    pendingCount,
    factorAverages: factorData.orgAverages,
    topExitReasonLabel,
    topContributingReasonLabel,
    signalVisibilityAverage,
  });

  const invitesNotSent = respondents.filter(
    (respondent) => !respondent.sent_at && !respondent.completed,
  ).length;
  const incompleteScores = responses.filter(
    (response) => !response.org_scores || !response.sdt_scores,
  ).length;
  const launchControlState = buildLaunchControlState({
    launchDate: deliveryRecord?.launch_date ?? null,
    participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
    reminderConfig: deliveryRecord?.reminder_config ?? null,
    launchConfirmedAt: deliveryRecord?.launch_confirmed_at ?? null,
  });
  const readinessState = buildCampaignReadinessState({
    totalInvited: stats.total_invited,
    totalCompleted: stats.total_completed,
    invitesNotSent,
    incompleteScores,
    hasMinDisplay,
    hasEnoughData,
    activeClientAccessCount: activeClientAccessCount ?? 0,
    pendingClientInviteCount: pendingClientInviteCount ?? 0,
    importReady,
    launchControlReady: launchControlState.ready,
    launchControlBlockers: launchControlState.blockers,
  });
  const compositionState = getCampaignCompositionState({
    isActive: stats.is_active,
    totalInvited: stats.total_invited,
    totalCompleted: stats.total_completed,
    invitesNotSent,
    incompleteScores,
    hasMinDisplay,
    hasEnoughData,
  });
  const activationState = buildResponseActivationState(stats.total_completed);
  const showClientExecutionFlow =
    !isVerisightAdmin && compositionState !== "closed";
  const showManagementOutput = isManagementVisibleState(compositionState);
  const showDeeperInsights =
    compositionState === "full" || compositionState === "closed";
  const showDetailedManagementOutput = showDeeperInsights;
  const showPartialManagementOutput = compositionState === "partial";
  const prefersReportFirst = compositionState === "closed";
  const canOpenActionCenterFromDeliveryRecord = deliveryRecord
    ? canOpenActionCenterRoute(deliveryRecord)
    : false;
  const actionCenterBridge = buildCampaignDetailActionCenterBridge({
    campaignId: id,
    routeEntryStage:
      deliveryRecord && hasOpenedActionCenterRoute(deliveryRecord)
        ? "active"
        : null,
    canOpenRoute:
      showManagementOutput &&
      isLiveActionCenterScanType(stats.scan_type) &&
      canOpenActionCenterFromDeliveryRecord,
    assessedAt: deliveryRecord?.updated_at ?? stats.created_at,
  });
  const actionCenterRouteHref = buildActionCenterRouteOpenRedirect(id, "campaign-detail");
  const compositionStateMeta = {
    setup: {
      label: "Nog niet live",
      tone: "amber" as const,
      trust:
        "Deze campagne blijft in setup. Toon hier nog geen managementlaag of rapport-first gedrag.",
    },
    ready_to_launch: {
      label: "Launch klaar",
      tone: "amber" as const,
      trust:
        "Respondenten staan klaar, maar invites zijn nog niet volledig live. Dashboard en rapport blijven bewust secundair.",
    },
    running: {
      label: "Invites live",
      tone: "amber" as const,
      trust:
        "De inviteflow loopt, maar zonder eerste veilige responslaag hoort dit nog als uitvoerstatus te landen.",
    },
    sparse: {
      label: "Indicatief, nog dun",
      tone: "amber" as const,
      trust:
        "Er zijn eerste responses, maar het beeld is nog te dun voor een veilige dashboardread of aanbevelingslaag.",
    },
    partial: {
      label: "Deels zichtbaar",
      tone: "amber" as const,
      trust:
        "De eerste read is open, maar drivers, aanbevelingen en vervolgblokken blijven deels verborgen door thresholds of scorecompleetheid.",
    },
    full: {
      label: "Duiding gereed",
      tone: "emerald" as const,
      trust:
        "Drivers, aanbevelingen en routeblokken mogen nu zichtbaar worden binnen de bestaande productgrenzen.",
    },
    closed: {
      label: "Rapport eerst",
      tone: "slate" as const,
      trust:
      "Deze campagne is gesloten. Gebruik dashboard en rapport nu voor terugblik, context en bestuurlijke opvolging.",
    },
  }[compositionState];
  const utilitySectionVisible =
    canExecuteCampaign || respondents.length > 0 || isVerisightAdmin;
  const riskDistribution = {
    HOOG: stats.band_high,
    MIDDEN: stats.band_medium,
    LAAG: stats.band_low,
  };
  const riskHistogram = buildRiskHistogram(responses);
  const safeTableResponses = buildSafeTableResponses(
    stats.scan_type,
    responses,
  );
  const retentionTrendCards =
    stats.scan_type === "retention" &&
    currentRetentionSignals &&
    previousRetentionSignals
      ? buildRetentionTrendCards({
          current: currentRetentionSignals,
          previous: previousRetentionSignals,
        })
      : [];
  const retentionSegmentPlaybooks =
    stats.scan_type === "retention" && hasEnoughData
      ? buildRetentionSegmentPlaybooks({
          responses,
          orgAverageSignal: averageRiskScore,
          playbooks: productModule.getActionPlaybooks(),
        })
      : [];
  const retentionThemes =
    stats.scan_type === "retention"
      ? clusterRetentionOpenSignals(responses)
      : [];
  const playbookCalibrationNote =
    stats.scan_type === "retention"
      ? (productModule.getActionPlaybookCalibrationNote?.() ?? null)
      : null;
  const disclosureDefaults = getDisclosureDefaults({
    scanType: stats.scan_type,
    hasEnoughData,
    hasMinDisplay,
    respondentsLength: respondents.length,
    canManageCampaign,
  });
  const { data: learningDossiersRaw } =
    profile?.is_verisight_admin === true
      ? await supabase
          .from("pilot_learning_dossiers")
          .select(
            "id, title, triage_status, updated_at, review_moment, next_route, stop_reason, management_action_outcome, adoption_outcome",
          )
          .eq("campaign_id", id)
          .order("updated_at", { ascending: false })
          .limit(3)
      : { data: [] };
  const learningDossiers = (learningDossiersRaw ?? []) as Array<{
    id: string;
    title: string;
    triage_status: string;
    updated_at: string;
    review_moment: string | null;
    next_route: string | null;
    stop_reason: string | null;
    management_action_outcome: string | null;
    adoption_outcome: string | null;
  }>;
  const learningCloseoutEvidenceCount = learningDossiers.filter((dossier) =>
    Boolean(
      dossier.review_moment ||
      dossier.next_route ||
      dossier.stop_reason ||
      dossier.management_action_outcome ||
      dossier.adoption_outcome,
    ),
  ).length;
  const firstNextStepGuidance = getFirstNextStepGuidance(stats.scan_type);
  const primaryTeamPriority =
    stats.scan_type === "team" && teamPriorityRead?.status === "ready"
      ? (teamPriorityRead.groups.find((group) => group.isPrimary) ?? null)
      : null;
  const primaryTeamQuestions =
    stats.scan_type === "team" && primaryTeamPriority
      ? (productModule.getFocusQuestions()[primaryTeamPriority.topFactorKey]?.[
          teamPriorityBand(primaryTeamPriority.topFactorSignalValue)
        ] ?? [])
      : [];
  const primaryTeamPlaybook =
    stats.scan_type === "team" && primaryTeamPriority
      ? (productModule.getActionPlaybooks()[primaryTeamPriority.topFactorKey]?.[
          teamPriorityBand(primaryTeamPriority.topFactorSignalValue)
        ] ?? null)
      : null;
  const handoffTitle =
    stats.scan_type === "retention"
      ? "Eerste vervolgstap"
      : stats.scan_type === "pulse"
        ? "Pulse duiding en eerste vervolgactie"
        : stats.scan_type === "team"
          ? "Lokale duiding en eerste verificatie"
          : stats.scan_type === "onboarding"
            ? "Vroege landingsduiding en eerste vervolgstap"
            : stats.scan_type === "leadership"
              ? "Managementcontext en eerste verificatie"
              : "Vertrekduiding en managementgesprek";
  const handoffDescription =
    stats.scan_type === "retention"
      ? "Deze laag volgt dezelfde lijn als het rapport: waar staat behoud onder druk, waarom telt dat bestuurlijk en wat moet eerst geverifieerd worden."
      : stats.scan_type === "pulse"
          ? "Deze laag vertaalt Pulse naar een compacte samenvatting: welke review- of herijkingsvraag vraagt nu direct aandacht, wat moet je als eerste bijsturen en wanneer kijk je opnieuw."
        : stats.scan_type === "team"
          ? "Deze laag vertaalt TeamScan naar een bestuurlijk leesbare lokale read: welke afdelingen vallen op, wat moet je eerst toetsen en welke lokale context vraagt nu als eerste aandacht."
          : stats.scan_type === "onboarding"
            ? "Deze laag vertaalt onboarding naar een bestuurlijk leesbare landingsduiding: waar stokt de vroege landing, wat telt nu bestuurlijk en welke beperkte correctie hoort hier direct achteraan."
            : stats.scan_type === "leadership"
              ? "Deze laag vertaalt Leadership Scan naar een leesbare samenvatting: welke context valt op, wat moet je eerst toetsen en welke managementstap hoort hier direct achteraan."
              : "Deze laag opent met de Frictiescore als samenvatting: wat keert terug, waar lijkt werkfrictie beinvloedbaar en waar moet management eerst doorvragen.";
  const readinessLabel = activationState.readinessLabel;
  const focusBadgeLabel =
    stats.scan_type === "pulse"
      ? "Signaal -> bijsturen -> opnieuw meten"
      : stats.scan_type === "team"
        ? "Lokaliseren -> verifieren -> begrenzen"
        : stats.scan_type === "onboarding"
          ? "Vroege landing -> corrigeren -> opnieuw toetsen"
          : stats.scan_type === "leadership"
            ? "Duiden -> verifieren -> begrenzen"
            : stats.scan_type === "retention"
              ? "Signaleren -> valideren -> handelen"
              : "Terugblik -> duiden -> verbeteren";
  const methodologyBadgeLabel =
    stats.scan_type === "pulse"
      ? "Reviewcontext"
      : stats.scan_type === "team"
        ? "Lokale context"
        : stats.scan_type === "onboarding"
          ? "Vroege landing"
          : stats.scan_type === "leadership"
            ? "Managementcontext"
            : stats.scan_type === "retention"
              ? "Privacy-first"
              : "Rapportcontext";
  const productExperience =
    stats.scan_type === "retention"
      ? {
          familyRoleLabel: "Kernroute",
          familyRoleTone: "emerald" as const,
          summaryBarOrder: [
            "signal",
            "next-step",
            "response",
            "readiness",
          ] as const,
          heroAsideOrder: ["signal", "owner", "response", "readiness"] as const,
          summaryFocusLabel: "Eerste route",
          reviewLabel: "Reviewmoment",
          evidenceSectionOrder: "management-first" as const,
          recommendationOrder: "questions-first" as const,
          trustNotePlacement: "drivers" as const,
          trustNoteTitle: "Methodische status",
          trustNoteBody: scanDefinition.evidenceStatusText,
          trustNoteTone: "emerald" as const,
          summaryTone: "slate" as const,
          summarySignalLabel: "Retentiesignaal",
          summaryContextLabel: "Groepssignaal · eerst toetsen",
          summaryContextTone: "slate" as const,
          summaryLeadTitle: "Eerste bestuurlijke leesrichting",
          summaryLeadDescription:
            "Lees RetentieScan eerst als groepssignaal: waar staat behoud onder druk, wat vraagt eerst verificatie en welk managementspoor moet daarna in Wat nu als eerste route worden gekozen.",
          summaryCardEyebrow: "Behoudsspoor",
          promotedSummaryCards: 2,
          driverTitle: "Signaalbeeld en behoudsdruk",
          driverDescription:
            "Start bij retentiesignaal, trend en aanvullende signalen. Gebruik factoren en segmenten daarna om te bepalen waarom dit beeld ontstaat en waar behoud eerst nadere toetsing vraagt.",
          driverIntro:
            "Begin met het groepssignaal en open pas daarna factoren, trend en aanvullende lagen. Zo blijft RetentieScan een eerst-toetsen managementinstrument in plaats van een losse analysetabel.",
          driverAsideLabel: hasEnoughData
            ? "Behoudsdrivers beschikbaar"
            : "Wacht op meer data",
          driverAsideTone: hasEnoughData
            ? ("slate" as const)
            : ("amber" as const),
          driverTabOrder: ["signalen", "trend", "factoren", "aanvullend"],
          signalTabLabel: "Retentiesignaal",
          signalTabTitle: "Retentiesignaal op groepsniveau",
          signalTabDescription:
            "Laat zien hoe breed en hoe scherp behoudsdruk zich over de groep verdeelt, zonder dit als individuele voorspelling te lezen.",
          factorTabLabel: "Behoudsdrivers",
          factorTabTitle: "Werkfactoren achter behoudsdruk",
          factorTabDescription:
            "Gebruik de laagst scorende werkfactoren als eerste verklarende laag voor managementgesprekken en gerichte verificatie.",
          supplementalTabLabel: "Aanvullende signalen",
          supplementalTitle: "Aanvullende signalen en SDT-basis",
          supplementalDescription:
            "Deze laag voegt bevlogenheid, open signalen en basisbehoeften toe aan het retentiebeeld, zodat trend en werkbeleving samen gelezen worden.",
          actionTitle: "Waar behoud eerst aandacht vraagt",
          focusQuestionTitle: "Prioritaire verificatievragen",
          focusQuestionDescription:
            "Start met de factoren en signalen die het eerst verificatie vragen. Gebruik de vragen om te bepalen wat in Wat nu de eerste managementroute wordt.",
          playbookTitle: "Behoudsplaybooks onder de gekozen route",
          playbookDescription:
            "Deze playbooks vormen de uitvoerlaag onder de gekozen managementroute. Ze helpen van verificatie naar uitvoering te gaan zonder nieuwe prioriteiten te openen.",
          routeTitle: "Van retentiesignaal naar managementroute",
          routeDescription:
            "Deze laag bundelt de gekozen route, eerste eigenaar, eerste stap en het logische reviewmoment zonder de executive hoofdlijn te verstoren.",
          routeBadgeLabel: "Kernroute",
          afterSessionTitle: "Na de eerste managementsessie",
          afterSessionDescription:
            "Gebruik het eerste reviewmoment om bewust te kiezen: blijf je op hetzelfde behoudsspoor, is segmentverdieping logisch of vraagt de volgende stap vooral een gerichte interventie en vervolgmeting?",
        }
      : stats.scan_type === "team"
        ? {
            familyRoleLabel: "Specialistische vervolgstap",
            familyRoleTone: "blue" as const,
            summaryBarOrder: [
              "signal",
              "next-step",
              "response",
              "readiness",
            ] as const,
            heroAsideOrder: [
              "signal",
              "next-step",
              "response",
              "readiness",
            ] as const,
            summaryFocusLabel: "Eerste lokale route",
            reviewLabel: "Reviewmoment",
            evidenceSectionOrder: "profile-first" as const,
            recommendationOrder: "playbooks-first" as const,
            trustNotePlacement: "handoff" as const,
            trustNoteTitle: "Leesgrens van deze route",
            trustNoteBody: scanDefinition.segmentText,
            trustNoteTone: "amber" as const,
            summaryTone: "slate" as const,
            summarySignalLabel: "Teamsignaal",
            summaryContextLabel: "Lokale context · afdeling eerst",
            summaryContextTone: "slate" as const,
            summaryLeadTitle: "Eerste bestuurlijke leesrichting",
            summaryLeadDescription:
              "Lees TeamScan eerst als veilige lokale contextlaag: welke afdelingen vallen op, welke factor kleurt dat beeld en welke lokale verificatie hoort nu als eerste.",
            summaryCardEyebrow: "Lokaal spoor",
            promotedSummaryCards: 2,
            driverTitle: "Teamsignaal en lokale context",
            driverDescription:
              "Gebruik deze laag om het actuele teamsignaal gecontroleerd te verdiepen zonder TeamScan te verwarren met segment deep dive of manager ranking.",
            driverIntro:
              "Start bij de lokale read en gebruik daarna pas factoren, signaalverdeling en basisbehoeften om te bepalen welke afdelingen eerst verificatie vragen.",
            driverAsideLabel: hasEnoughData
              ? "Lokale read beschikbaar"
              : "Wacht op meer data",
            driverAsideTone: hasEnoughData
              ? ("slate" as const)
              : ("amber" as const),
            driverTabOrder: ["lokaal", "factoren", "signalen", "aanvullend"],
            signalTabLabel: "Signaalverdeling",
            signalTabTitle: "Teamsignaal op groepsniveau",
            signalTabDescription:
              "Laat zien hoe breed en hoe scherp het teamsignaal zich over de totale groep verdeelt voordat je naar afdelingen kijkt.",
            factorTabLabel: "Lokale drivers",
            factorTabTitle: "Werkfactoren achter lokale frictie",
            factorTabDescription:
              "Gebruik de scherpste werkfactoren als eerste verklarende laag om te bepalen welke afdelingen lokale verificatie verdienen.",
            supplementalTabLabel: "SDT-basis",
            supplementalTitle: "Werkbeleving en SDT-basis",
            supplementalDescription:
              "Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het huidige teamsignaal liggen en welke lokale context daardoor meer spanning laat zien.",
            actionTitle: "Waar eerst lokaal op handelen",
            focusQuestionTitle: "Prioritaire lokale verificatievragen",
            focusQuestionDescription:
              "Start met de factoren die het teamsignaal het scherpst kleuren en gebruik de vragen om te bepalen wat lokaal eerst getoetst moet worden.",
            playbookTitle: "Lokale playbooks en eerste verificatie",
            playbookDescription:
              "Deze playbooks vormen de uitvoerlaag onder de gekozen lokale route. Ze helpen van verificatie naar een begrensde vervolgstap te gaan zonder de vraag breder te maken dan nodig.",
            routeTitle: "Van TeamScan naar lokale managementroute",
            routeDescription:
              "Deze laag bundelt de gekozen lokale route, eerste eigenaar, eerste stap en de bewuste begrenzing van TeamScan zonder de executive hoofdlijn te verstoren.",
            routeBadgeLabel: "Kleine vervolgstap",
            afterSessionTitle: "Na de eerste managementsessie",
            afterSessionDescription:
              "Gebruik het eerste reviewmoment om bewust te kiezen: blijft een lokale vervolgstap logisch, is bredere duiding weer nodig of vraagt dit signaal juist minder lokalisatie dan gedacht?",
          }
        : stats.scan_type === "onboarding"
          ? {
              familyRoleLabel: "Begrensde peer-route",
              familyRoleTone: "blue" as const,
              summaryBarOrder: [
                "signal",
                "owner",
                "review",
                "readiness",
              ] as const,
              heroAsideOrder: [
                "signal",
                "owner",
                "review",
                "response",
              ] as const,
              summaryFocusLabel: "Eerste checkpoint",
              reviewLabel: "Reviewmoment",
              evidenceSectionOrder: "profile-first" as const,
              recommendationOrder: "playbooks-first" as const,
              trustNotePlacement: "handoff" as const,
              trustNoteTitle: "Leesgrens van deze route",
              trustNoteBody: scanDefinition.evidenceStatusText,
              trustNoteTone: "amber" as const,
              summaryTone: "slate" as const,
              summarySignalLabel: "Onboardingsignaal",
              summaryContextLabel: "Vroege landing · compacte teamread",
              summaryContextTone: "slate" as const,
              summaryLeadTitle: "Eerste bestuurlijke leesrichting",
              summaryLeadDescription:
                "Lees onboarding eerst als compacte teamread: waar stokt de vroege landing in de eerste 30-60-90 dagen, welke frictie is nu zichtbaar en welke beperkte correctie hoort daar direct bij.",
              summaryCardEyebrow: "Landingsspoor",
              promotedSummaryCards: 1,
              driverTitle: "Onboardingsignaal en vroege landing",
              driverDescription:
                "Gebruik deze laag om het actuele landingsbeeld gecontroleerd te verdiepen zonder onboarding te verwarren met client onboarding of een volledige 30-60-90-journey.",
              driverIntro:
                "Start bij de landingsduiding en gebruik daarna pas factoren, signaalverdeling en basisbehoeften om te bepalen welke vroege factor nu eerst aandacht vraagt.",
              driverAsideLabel: hasEnoughData
                ? "Landingsduiding beschikbaar"
                : "Wacht op meer data",
              driverAsideTone: hasEnoughData
                ? ("slate" as const)
                : ("amber" as const),
              driverTabOrder: ["factoren", "signalen", "aanvullend", "trend"],
              signalTabLabel: "Landingsbeeld",
              signalTabTitle: "Onboardingsignaal op groepsniveau",
              signalTabDescription:
                "Laat zien hoe breed en hoe scherp het huidige onboardingsignaal zich over de groep verdeelt zonder dit als journey- of retentieclaim te lezen.",
              factorTabLabel: "Landingsdrivers",
              factorTabTitle: "Werkfactoren achter vroege frictie",
              factorTabDescription:
                "Gebruik de scherpste werkfactoren als eerste managementspoor om te bepalen waar nieuwe instroom nu meer steun, duidelijkheid of inbedding nodig heeft.",
              supplementalTabLabel: "SDT-basis",
              supplementalTitle: "Werkbeleving en SDT-basis",
              supplementalDescription:
                "Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het huidige onboardingcheckpoint liggen en welke vroege context daardoor meer spanning laat zien.",
              actionTitle: "Waar eerst op handelen",
              focusQuestionTitle: "Prioritaire landingsvragen",
              focusQuestionDescription:
                "Start met de factoren die de vroege landing het scherpst kleuren en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat een correctieroute wordt gekozen.",
              playbookTitle: "Eerste correctie en borging",
              playbookDescription:
                "Deze uitvoerlaag helpt van verificatie naar een beperkte eerste correctie en een logisch volgend checkpoint te gaan, zonder de managementhoofdlijn zwaarder te maken dan nodig.",
              routeTitle: "Van landingsduiding naar eerste managementkeuze",
              routeDescription:
                "Deze laag brengt eerste managementgebruik, de gekozen correctie en het logische vervolgmoment samen zonder onboarding te verwarren met een brede lifecycle-suite.",
              routeBadgeLabel: "Begrensde peer-route",
              afterSessionTitle: "Na de eerste managementsessie",
              afterSessionDescription:
                "Gebruik het eerste reviewmoment om bewust te kiezen: blijft een later checkpoint logisch, vraagt deze instroomfrictie eerst extra verificatie of hoort de vraag thuis in een andere productvorm?",
            }
          : stats.scan_type === "leadership"
            ? {
                familyRoleLabel: "Begrensde support-route",
                familyRoleTone: "blue" as const,
                summaryBarOrder: [
                  "signal",
                  "next-step",
                  "review",
                  "readiness",
                ] as const,
                heroAsideOrder: [
                  "signal",
                  "next-step",
                  "review",
                  "response",
                ] as const,
                summaryFocusLabel: "Eerste check",
                reviewLabel: "Reviewmoment",
                evidenceSectionOrder: "profile-first" as const,
                recommendationOrder: "playbooks-first" as const,
                trustNotePlacement: "handoff" as const,
                trustNoteTitle: "Leesgrens van deze route",
                trustNoteBody: scanDefinition.evidenceStatusText,
                trustNoteTone: "amber" as const,
                summaryTone: "slate" as const,
                summarySignalLabel: "Leadershipsignaal",
                summaryContextLabel: "Compacte context · groepsniveau",
                summaryContextTone: "slate" as const,
                summaryLeadTitle: "Eerste bestuurlijke leesrichting",
                summaryLeadDescription:
                  "Lees Leadership Scan eerst als compacte contextread: welke managementcontext kleurt het bestaande people-signaal mee en welke kleine check hoort daar nu logisch bij.",
                summaryCardEyebrow: "Managementspoor",
                promotedSummaryCards: 1,
                driverTitle: "Managementcontext in beeld",
                driverDescription:
                  "Gebruik deze laag om het actuele leadershipbeeld gecontroleerd te verdiepen zonder Leadership Scan te verwarren met TeamScan, segment deep dive of een named leader view.",
                driverIntro:
                  "Start bij de begrensde read en gebruik daarna pas factoren, signaalverdeling en basisbehoeften om te bepalen welke context eerst een kleine check verdient.",
                driverAsideLabel: hasEnoughData
                  ? "Duiding beschikbaar"
                  : "Wacht op meer data",
                driverAsideTone: hasEnoughData
                  ? ("slate" as const)
                  : ("amber" as const),
                driverTabOrder: ["factoren", "signalen", "aanvullend", "trend"],
                signalTabLabel: "Managementbeeld",
                signalTabTitle: "Leadershipsignaal op groepsniveau",
                signalTabDescription:
                  "Laat zien hoe breed en hoe scherp het huidige managementcontextsignaal zich over de groep verdeelt zonder dit te lezen als named leader of performanceclaim.",
                factorTabLabel: "Managementdrivers",
                factorTabTitle: "Werkfactoren achter managementfrictie",
                factorTabDescription:
                  "Gebruik de scherpste werkfactoren als eerste managementspoor om te bepalen waar de huidige aansturing of prioritering eerst duiding vraagt.",
                supplementalTabLabel: "SDT-basis",
                supplementalTitle: "Werkbeleving en SDT-basis",
                supplementalDescription:
                  "Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het huidige leadershipsignaal liggen en welke managementcontext daardoor meer spanning laat zien.",
                actionTitle: "Waar eerst op handelen",
                focusQuestionTitle: "Prioritaire managementvragen",
                focusQuestionDescription:
                  "Start met de factoren die het leadershipbeeld het scherpst kleuren en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat een begrensde vervolgstap wordt gekozen.",
                playbookTitle: "Begrensde checks en eerste vervolgstap",
                playbookDescription:
                "Deze checks vormen de uitvoerlaag onder de gekozen route. Ze helpen van duiding naar een kleine vervolgstap te gaan zonder named leader output te openen.",
                routeTitle: "Van leadershipread naar begrensde vervolgstap",
                routeDescription:
                  "Deze laag brengt de gekozen check, kleine vervolgstap en het reviewmoment samen zonder Leadership Scan te laten lezen als een quasi-peer route.",
                routeBadgeLabel: "Kleine vervolgstap",
                afterSessionTitle: "Na de eerste managementsessie",
                afterSessionDescription:
                  "Gebruik het eerste reviewmoment om bewust te kiezen: blijft een kleine check genoeg, vraagt de vraag toch bredere duiding of hoort Leadership Scan hier juist te stoppen?",
              }
            : stats.scan_type === "exit"
              ? {
                  familyRoleLabel: "Kernroute",
                  familyRoleTone: "blue" as const,
                  summaryBarOrder: [
                    "signal",
                    "owner",
                    "response",
                    "readiness",
                  ] as const,
                  heroAsideOrder: [
                    "signal",
                    "owner",
                    "response",
                    "readiness",
                  ] as const,
                  summaryFocusLabel: "Eerste route",
                  reviewLabel: "Reviewmoment",
                  evidenceSectionOrder: "management-first" as const,
                  recommendationOrder: "questions-first" as const,
                  trustNotePlacement: "drivers" as const,
                  trustNoteTitle: "Methodische status",
                  trustNoteBody: scanDefinition.evidenceStatusText,
                  trustNoteTone: "blue" as const,
                  summaryTone: "slate" as const,
                  summarySignalLabel: "Frictiescore",
                  summaryContextLabel: "Werkfrictie · verklarende laag",
                  summaryContextTone: "slate" as const,
                  summaryLeadTitle: "Eerste bestuurlijke leesrichting",
                  summaryLeadDescription:
                    "Lees ExitScan eerst via de Frictiescore: wat keert terug, waar lijkt werkfrictie beinvloedbaar en welk managementspoor moet nu als eerste gekozen worden.",
                  summaryCardEyebrow: "Vertrekspoor",
                  promotedSummaryCards: 2,
                  driverTitle: "Kernsignalen en vertrekbeeld",
                  driverDescription:
                    "Start bij de scherpste werkfactoren en gebruik daarna pas signaalverdeling en aanvullende lagen om het vertrekbeeld verder te onderbouwen.",
                  driverIntro:
                    "Begin met de factoren die het vertrekverhaal het meest kleuren. Gebruik signaalverdeling en SDT daarna om het managementgesprek scherper en concreter te maken.",
                  driverAsideLabel: hasEnoughData
                    ? "Vertrekdrivers beschikbaar"
                    : "Wacht op meer data",
                  driverAsideTone: hasEnoughData
                    ? ("slate" as const)
                    : ("amber" as const),
                  driverTabOrder: [
                    "factoren",
                    "signalen",
                    "aanvullend",
                    "trend",
                  ],
                  signalTabLabel: "Frictiescore",
                  signalTabTitle: "Frictiescore op groepsniveau",
                  signalTabDescription:
                    "Laat zien hoe breed en hoe scherp de Frictiescore zich over de groep verdeelt, zodat je werkfrictie en vertrekduiding in context kunt lezen.",
                  factorTabLabel: "Vertrekdrivers",
                  factorTabTitle: "Laagste scores per werkfactor",
                  factorTabDescription:
                    "Deze lijst toont per werkfactor de score en relatieve zwaarte.",
                  supplementalTabLabel: "SDT-basis",
                  supplementalTitle: "Werkbeleving en SDT-basis",
                  supplementalDescription:
                    "Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het vertrekbeeld liggen en waar vervolgvragen het meeste opleveren.",
                  actionTitle: "Waar eerst op handelen",
                  focusQuestionTitle: "Prioritaire focusvragen",
                  focusQuestionDescription:
                    "Start met de factoren die het vertrekbeeld het scherpst kleuren en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat de eerste route wordt gekozen.",
                  playbookTitle: "Besluit- en eigenaarschapsroutes",
                  playbookDescription:
                    "Deze playbooks vormen de uitvoerlaag onder de gekozen managementroute. Ze helpen van vertrekduiding naar uitvoering te gaan zonder nieuwe prioriteiten buiten het gekozen spoor te openen.",
                  routeTitle: "Van vertrekduiding naar managementroute",
                  routeDescription:
                    "Deze laag bundelt de gekozen managementroute, eerste eigenaar, eerste stap en het logische reviewmoment zonder de kernflow bovenin te verstoren.",
                  routeBadgeLabel: "Kernroute",
                  afterSessionTitle: "Na de eerste managementsessie",
                  afterSessionDescription:
                    "Gebruik het eerste reviewmoment om bewust te kiezen: blijf je op hetzelfde vertrekspoor, vraagt deze scan verdere verdieping of wordt een tweede product logisch op basis van de eerste managementwaarde?",
                }
              : {
                  familyRoleLabel: "Begrensde support-route",
                  familyRoleTone: "blue" as const,
                  summaryBarOrder: [
                    "signal",
                    "next-step",
                    "review",
                    "readiness",
                  ] as const,
                  heroAsideOrder: [
                    "signal",
                    "next-step",
                    "review",
                    "response",
                  ] as const,
                  summaryFocusLabel: "Eerste herijking",
                  reviewLabel: "Reviewmoment",
                  evidenceSectionOrder: "profile-first" as const,
                  recommendationOrder: "playbooks-first" as const,
                  trustNotePlacement: "handoff" as const,
                  trustNoteTitle: "Leesgrens van deze route",
                  trustNoteBody: scanDefinition.evidenceStatusText,
                  trustNoteTone: "amber" as const,
                  summaryTone: "slate" as const,
                  summarySignalLabel: "Pulsesignaal",
                  summaryContextLabel: "Reviewlaag · herhaalritme",
                  summaryContextTone: "slate" as const,
                  summaryLeadTitle: "Eerste bestuurlijke leesrichting",
                  summaryLeadDescription:
                    "Gebruik deze eerste laag om het primaire managementsignaal en het eerste werkspoor snel scherp te krijgen, voordat een route, eigenaar en hercheckmoment worden gekozen.",
                  summaryCardEyebrow: "Pulse vervolgstap",
                  promotedSummaryCards: 2,
                  driverTitle: "Pulse groepsread en vergelijking",
                  driverDescription:
                    "Gebruik deze laag om het actuele Pulse-beeld gecontroleerd te verdiepen zonder de managementhoofdlijn kwijt te raken.",
                  driverIntro:
                    "Gebruik de tabs hieronder om tussen groepsread, factoren, aanvullende lagen en vergelijking te wisselen zonder de hoofdlijn van de duiding kwijt te raken.",
                  driverAsideLabel: hasEnoughData
                    ? "Pulse read beschikbaar"
                    : "Wacht op meer data",
                  driverAsideTone: hasEnoughData
                    ? ("slate" as const)
                    : ("amber" as const),
                  driverTabOrder: [
                    "factoren",
                    "trend",
                    "signalen",
                    "aanvullend",
                  ],
                  signalTabLabel: "Signaalverdeling",
                  signalTabTitle: "Signaalverdeling",
                  signalTabDescription:
                    "Laat zien hoe breed en hoe scherp de signalen zich over de groep verdelen op dit meetmoment.",
                  factorTabLabel: "Factoren",
                  factorTabTitle: "Organisatiefactoren",
                  factorTabDescription:
                    "De factoren hieronder helpen bepalen waar managementgesprekken en kleine correcties nu het meeste opleveren.",
                  supplementalTabLabel: "SDT-basis",
                  supplementalTitle: "SDT basisbehoeften",
                  supplementalDescription:
                    "Deze laag laat zien hoe de fundamentele werkbeleving onder de actuele Pulse-signalen mee beweegt.",
                  actionTitle: "Prioriteiten en route-uitvoer",
                  focusQuestionTitle: "Prioritaire focusvragen",
                  focusQuestionDescription:
                  "Start met de factoren die het scherpst afwijken en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat een route wordt gekozen.",
                  playbookTitle: "Pulse playbooks en eerstvolgende correctie",
                  playbookDescription:
                  "Deze playbooks vormen de uitvoerlaag onder de gekozen route. Ze helpen van verificatie naar correctie en een logisch hercheckmoment te gaan.",
                routeTitle: "Van Pulse read naar herhaalritme",
                  routeDescription:
                    "Deze laag brengt eerste managementgebruik, de gekozen correctie en het logische volgende meetmoment samen zonder Pulse te verwarren met een bredere kernroute of hoofdrapport.",
                routeBadgeLabel: "Kleine vervolgstap",
                  afterSessionTitle: "Na de eerste managementsessie",
                  afterSessionDescription:
                  "Gebruik het eerste reviewmoment om bewust te kiezen: doe je nog een compacte Pulse-check, verdiep je eerst de vraag verder of vraagt het thema nu een andere productvorm?",
                };
  const presentationMetrics = buildPresentationMetrics({
    productExperience,
    scanDefinition,
    dashboardViewModel,
    averageRiskScore,
    totalCompleted: stats.total_completed,
    totalInvited: stats.total_invited,
    compositionStateMeta,
    hasEnoughData,
  });
  const summaryItems = productExperience.summaryBarOrder.map(
    (key) => presentationMetrics[key],
  );
  const heroAsideItems = productExperience.heroAsideOrder.map(
    (key) => presentationMetrics[key],
  );
  const sectionAnchors = [
    { id: "samenvatting", label: "Samenvatting" },
    ...(showManagementOutput
      ? [
          {
            id: "handoff",
            label: showPartialManagementOutput
              ? "Compacte read"
              : stats.scan_type === "retention"
                ? "Vervolg"
                : stats.scan_type === "team"
                  ? "Lokale read"
                  : "Vervolg",
          },
          ...(showDetailedManagementOutput
            ? [
                {
                  id: "drivers",
                  label:
                    stats.scan_type === "retention"
                      ? "Signalen"
                      : stats.scan_type === "team"
                        ? "Lokaal"
                        : "Drivers",
                },
                {
                  id: "acties",
                  label:
                    stats.scan_type === "retention"
                      ? "Behoudsacties"
                      : stats.scan_type === "team"
                        ? "Lokale acties"
                        : "Acties",
                },
                {
                  id: "route",
                  label:
                    stats.scan_type === "retention" ||
                    stats.scan_type === "exit"
                      ? "Kernroute"
                      : stats.scan_type === "team" ||
                          stats.scan_type === "pulse" ||
                          stats.scan_type === "onboarding" ||
                          stats.scan_type === "leadership"
                        ? "Vervolgroute"
                        : "Route",
                },
              ]
            : []),
        ]
      : []),
    { id: "methodiek", label: "Methodiek" },
    ...(utilitySectionVisible
      ? [
          {
            id: showClientExecutionFlow ? "uitvoering" : "operatie",
            label: showClientExecutionFlow ? "Uitvoering" : "Operatie",
          },
        ]
      : []),
  ];
  const promotedSummaryCards =
    showDetailedManagementOutput && productExperience.promotedSummaryCards > 0
      ? dashboardViewModel.topSummaryCards.slice(
          0,
          productExperience.promotedSummaryCards,
        )
      : [];
  const handoffSummaryCards =
    showDetailedManagementOutput && productExperience.promotedSummaryCards > 0
      ? dashboardViewModel.topSummaryCards.slice(
          productExperience.promotedSummaryCards,
        )
      : dashboardViewModel.topSummaryCards;
  const availableDriverTabs = hasEnoughData
    ? [
        ...(stats.scan_type === "team" && teamLocalRead
          ? [
              {
                id: "lokaal",
                label: "Lokale read",
                content: (
                  <div className="space-y-5">
                    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-sm font-semibold text-slate-950">
                          {teamLocalRead.summaryTitle}
                        </h3>
                        <DashboardChip
                          label={`${teamLocalRead.coverageCount}/${teamLocalRead.totalResponses} met afdeling`}
                          tone="slate"
                        />
                        <DashboardChip
                          label={
                            teamLocalRead.status === "ready"
                              ? `${teamLocalRead.safeGroupCount} veilige afdelingen`
                              : "Fallback actief"
                          }
                          tone={
                            teamLocalRead.status === "ready"
                              ? "emerald"
                              : "amber"
                          }
                        />
                        <DashboardChip
                          label={
                            teamPriorityRead?.status === "ready"
                              ? `Meenemen in verificatie: ${teamPriorityRead.firstPriorityLabel}`
                              : teamPriorityRead?.status === "no_hard_order"
                                ? "Nog geen harde volgorde"
                                : "Prioriteit nog niet vrijgegeven"
                          }
                          tone={
                            teamPriorityRead?.status === "ready"
                              ? "amber"
                              : "slate"
                          }
                        />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {teamPriorityRead?.summaryBody ??
                          teamLocalRead.summaryBody}
                      </p>
                      <p className="mt-3 text-xs leading-6 text-slate-500">
                        {teamPriorityRead?.caution ?? teamLocalRead.caution}
                      </p>
                    </div>

                    {teamLocalRead.status === "ready" && teamPriorityRead ? (
                      <div className="grid gap-4 lg:grid-cols-3">
                        {teamPriorityRead.groups.map((group) => (
                          <DashboardPanel
                            key={group.label}
                            eyebrow={`${group.priorityTitle} · Afdeling · n = ${group.n}`}
                            title={group.label}
                            value={`${group.avgSignal.toFixed(1)}/10`}
                            body={`${group.summary} ${group.priorityBody} Eerste lokale factor: ${group.topFactorLabel}.`}
                            tone={group.priorityTone}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                        TeamScan blijft in deze situatie bewust op
                        organisatieniveau. Zodra genoeg afdelingsmetadata en
                        veilige groepsgroottes beschikbaar zijn, verschijnt de
                        lokale read hier.
                      </div>
                    )}
                  </div>
                ),
              },
            ]
          : []),
        {
          id: "signalen",
          label: productExperience.signalTabLabel,
          content: (
            <DashboardChartPanel
              eyebrow="Signaalbeeld"
              title={productExperience.signalTabTitle}
              description={productExperience.signalTabDescription}
              tone="slate"
              variant="quiet"
            >
              <div className="mt-1">
                <RiskCharts
                  distribution={riskDistribution}
                  histogramBins={riskHistogram}
                  averageScore={averageRiskScore}
                  scanType={stats.scan_type}
                />
              </div>
            </DashboardChartPanel>
          ),
        },
        {
          id: "factoren",
          label: productExperience.factorTabLabel,
          content: (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-950">
                {productExperience.factorTabTitle}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {productExperience.factorTabDescription}
              </p>
              <div className="mt-4">
                <FactorTable
                  factorAverages={factorData.orgAverages}
                  scanType={stats.scan_type}
                />
              </div>
            </div>
          ),
        },
        {
          id: "aanvullend",
          label: productExperience.supplementalTabLabel,
          content: (
            <div className="space-y-5">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-950">
                    {productExperience.supplementalTitle}
                  </h3>
                  <DashboardChip
                    label="Autonomie · Competentie · Verbondenheid"
                    tone="slate"
                  />
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {productExperience.supplementalDescription}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {(["autonomy", "competence", "relatedness"] as const).map(
                    (dimension) => (
                      <SdtGauge
                        key={dimension}
                        label={FACTOR_LABELS[dimension]}
                        score={factorData.sdtAverages[dimension] ?? 5.5}
                      />
                    ),
                  )}
                </div>
              </div>

              {stats.scan_type === "retention" && retentionThemes.length > 0 ? (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-950">
                    Open signalen op groepsniveau
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Geclusterd zodat open antwoorden als managementsignaal
                    gelezen kunnen worden, niet als losse klachtenlijst.
                  </p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {retentionThemes.map((theme) => (
                      <div
                        key={theme.key}
                        className="rounded-[20px] border border-white/80 bg-white/80 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">
                            {theme.title}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                            {theme.count}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          {theme.implication}
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Voorbeeldsignaal
                        </p>
                        <p className="mt-1 text-sm italic leading-6 text-slate-600">
                          &quot;{theme.sample}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ),
        },
        ...(stats.scan_type === "retention" &&
        previousStats &&
        currentRetentionSignals &&
        previousRetentionSignals
          ? [
              {
                id: "trend",
                label: "Trend",
                content: (
                  <RetentionTrendSection
                    current={currentRetentionSignals}
                    previous={previousRetentionSignals}
                    previousDate={previousStats.created_at}
                    previousCampaignName={previousStats.campaign_name}
                    trendCards={retentionTrendCards}
                  />
                ),
              },
            ]
          : stats.scan_type === "pulse" &&
              previousStats &&
              pulseComparison &&
              pulseComparison.status !== "no_previous"
            ? [
                {
                  id: "trend",
                  label: "Vergelijking",
                  content: (
                    <PulseTrendSection
                      comparison={pulseComparison}
                      previousDate={previousStats.created_at}
                      previousCampaignName={previousStats.campaign_name}
                    />
                  ),
                },
              ]
            : []),
      ]
    : [];
  const driverTabs = hasEnoughData
    ? productExperience.driverTabOrder.flatMap((tabId) =>
        availableDriverTabs.filter((tab) => tab.id === tabId),
      )
    : [];
  const trustNote = (
    <div
      className={`rounded-[22px] border px-4 py-4 ${
        productExperience.trustNoteTone === "emerald"
          ? "border-emerald-200 bg-emerald-50"
          : productExperience.trustNoteTone === "amber"
            ? "border-amber-200 bg-amber-50"
            : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.18em] ${
          productExperience.trustNoteTone === "emerald"
            ? "text-emerald-800"
            : productExperience.trustNoteTone === "amber"
              ? "text-amber-900"
              : "text-slate-600"
        }`}
      >
        {productExperience.trustNoteTitle}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        {productExperience.trustNoteBody}
      </p>
    </div>
  );
  const profileCardsSection =
    dashboardViewModel.profileCards.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {dashboardViewModel.profileCards.map((card) => (
          <DashboardPanel
            key={`${card.title}-${card.value ?? "profile"}`}
            eyebrow={card.title}
            title={card.value || card.title}
            body={card.body}
            tone={normalizeInformationalTone(card.tone)}
          />
        ))}
      </div>
    ) : null;
  const managementBlocksSection =
    dashboardViewModel.managementBlocks.length > 0 ? (
      <div className="grid gap-4 lg:grid-cols-3">
        {dashboardViewModel.managementBlocks.map((block) => (
          <div
            key={block.title}
            className={`rounded-[22px] border p-4 ${
              block.tone === "emerald"
                ? "border-[#d2e6e0] bg-[#eef7f4]"
                : block.tone === "amber"
                  ? "border-[#eadfbe] bg-[#faf6ea]"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                block.tone === "emerald"
                  ? "text-[#3C8D8A]"
                  : block.tone === "amber"
                    ? "text-[#8C6B1F]"
                    : "text-slate-600"
              }`}
            >
              {block.title}
            </p>
            {block.intro ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {block.intro}
              </p>
            ) : null}
            <ul className="mt-3 space-y-2">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-6 text-slate-700"
                >
                  <span className="text-slate-400">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ) : null;
  const focusQuestionsBlock = (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-950">
        {productExperience.focusQuestionTitle}
      </h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {productExperience.focusQuestionDescription}
      </p>
      <div className="mt-4">
        <RecommendationList
          factorAverages={factorData.orgAverages}
          scanType={stats.scan_type}
          bandOverride={
            stats.scan_type === "onboarding" || stats.scan_type === "leadership"
              ? dashboardViewModel.managementBandOverride
              : undefined
          }
        />
      </div>
    </div>
  );
  const playbooksBlock =
    stats.scan_type === "retention" ||
    stats.scan_type === "exit" ||
    stats.scan_type === "pulse" ||
    stats.scan_type === "team" ||
    stats.scan_type === "onboarding" ||
    stats.scan_type === "leadership" ? (
      <>
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-950">
            {productExperience.playbookTitle}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {productExperience.playbookDescription}
          </p>
          {stats.scan_type === "retention" && playbookCalibrationNote ? (
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {playbookCalibrationNote}
            </p>
          ) : null}
          <div className="mt-4">
            <ActionPlaybookList
              factorAverages={factorData.orgAverages}
              scanType={stats.scan_type}
              bandOverride={
                stats.scan_type === "onboarding" ||
                stats.scan_type === "leadership"
                  ? dashboardViewModel.managementBandOverride
                  : undefined
              }
            />
          </div>
        </div>

        {stats.scan_type === "retention" && hasSegmentDeepDive ? (
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-950">
              Segment-specifieke playbooks
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Alleen zichtbaar als segmentvergelijking voldoende respons en
              metadata heeft.
            </p>
            <div className="mt-4">
              {retentionSegmentPlaybooks.length > 0 ? (
                <SegmentPlaybookList segments={retentionSegmentPlaybooks} />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                  Nog geen segmenten met voldoende n en voldoende afwijking om
                  apart te tonen.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </>
    ) : null;

  const dominantBand = (["HOOG", "MIDDEN", "LAAG"] as const).reduce(
    (current, candidate) =>
      riskDistribution[current] >= riskDistribution[candidate]
        ? current
        : candidate,
  );
  const totalRiskResponses =
    riskDistribution.HOOG + riskDistribution.MIDDEN + riskDistribution.LAAG;
  const dominantPct =
    totalRiskResponses > 0
      ? Math.round((riskDistribution[dominantBand] / totalRiskResponses) * 100)
      : 0;
  const bandLabels = {
    HOOG: "Direct prioriteren",
    MIDDEN: "Eerst toetsen",
    LAAG: "Volgen",
  } as const;
  const focusPanelItems = showManagementOutput
    ? [
        {
          text: dashboardViewModel.primaryQuestion.title,
          moduleLabel: scanDefinition.productName,
        },
        {
          text: dashboardViewModel.nextStep.title,
          moduleLabel: scanDefinition.productName,
        },
      ]
    : [];
  async function openActionCenterRoute() {
    "use server";

    const admin = createAdminClient();
    const actionCenterHref = buildActionCenterRouteOpenRedirect(id, "campaign-detail");
    const { data: currentDeliveryRecord, error: loadError } = await admin
      .from("campaign_delivery_records")
      .select("id, lifecycle_stage, first_management_use_confirmed_at")
      .eq("campaign_id", id)
      .maybeSingle();

    if (loadError || !currentDeliveryRecord) {
      redirect(`/campaigns/${id}?bridge=open-unavailable`);
    }

    if (hasOpenedActionCenterRoute(currentDeliveryRecord)) {
      redirect(actionCenterHref);
    }

    if (!canOpenActionCenterRoute(currentDeliveryRecord)) {
      redirect(`/campaigns/${id}?bridge=open-unavailable`);
    }

    const openedAt = new Date().toISOString();
    const { data: updatedRecord, error } = await admin
      .from("campaign_delivery_records")
      .update(buildActionCenterRouteOpenPatch(openedAt))
      .eq("id", currentDeliveryRecord.id)
      .is("first_management_use_confirmed_at", null)
      .in("lifecycle_stage", getActionCenterRouteOpenableStages())
      .select("id")
      .maybeSingle();

    if (error) {
      redirect(`/campaigns/${id}?bridge=open-unavailable`);
    }

    if (!updatedRecord) {
      const { data: latestDeliveryRecord } = await admin
        .from("campaign_delivery_records")
        .select("id, lifecycle_stage, first_management_use_confirmed_at")
        .eq("campaign_id", id)
        .maybeSingle();

      if (latestDeliveryRecord && hasOpenedActionCenterRoute(latestDeliveryRecord)) {
        redirect(actionCenterHref);
      }

      redirect(`/campaigns/${id}?bridge=open-unavailable`);
    }

    redirect(actionCenterHref);
  }
  const actionCenterRouteAction =
    actionCenterBridge.presentation.ctaKind === "open" ? (
      <div className="flex flex-col gap-2">
        {actionCenterBridge.bridgeState === "candidate" ? (
          <form action={openActionCenterRoute}>
            <button
              type="submit"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
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
        <p className="max-w-sm text-sm leading-6 text-slate-500">
          {actionCenterBridge.presentation.body}
        </p>
      </div>
    ) : null;
  const summaryActions = (
    <>
      {actionCenterRouteAction}
      {!showManagementOutput ? (
        <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
          {activationState.heroActionLabel}
        </div>
      ) : showPartialManagementOutput ? (
        <>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
            Aanbevelingen blijven nog begrensd
          </div>
          <PdfDownloadButton
            campaignId={id}
            campaignName={stats.campaign_name}
            scanType={stats.scan_type}
          />
        </>
      ) : prefersReportFirst ? (
        <PdfDownloadButton
          campaignId={id}
          campaignName={stats.campaign_name}
          scanType={stats.scan_type}
        />
      ) : stats.scan_type === "pulse" ||
        stats.scan_type === "team" ||
        stats.scan_type === "onboarding" ||
        stats.scan_type === "leadership" ? (
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          {stats.scan_type === "pulse"
            ? "Pulse: eerste vervolgstap live"
            : stats.scan_type === "team"
              ? "TeamScan: lokale read live"
              : stats.scan_type === "onboarding"
                ? "Onboarding: checkpoint read live"
                : "Leadership Scan: management read live"}
        </div>
      ) : (
        <PdfDownloadButton
          campaignId={id}
          campaignName={stats.campaign_name}
          scanType={stats.scan_type}
        />
      )}
    </>
  );

  const organizationName = organization?.name ?? "Organisatie"
  const routePeriodLabel = formatRoutePeriodLabel(stats.campaign_name, stats.created_at)
  const scopeLabel = deriveScopeLabel(respondents)
  const moduleKey =
    stats.scan_type === "team" ? null : getDashboardModuleKeyForScanType(stats.scan_type)
  const moduleLabel = moduleKey ? getDashboardModuleLabel(moduleKey) : scanDefinition.productName
  const moduleHref = moduleKey ? getDashboardModuleHref(moduleKey) : "/dashboard"
  const moduleBackLinkLabel = getDashboardModuleBackLinkLabel(stats.scan_type)
  const factorPriorityRows = buildFactorPriorityRows(factorData.orgAverages)
  const sdtRows = buildSdtRows(factorData.sdtAverages)
  const responseContextNote = buildResponseContextNote(
    stats.total_completed,
    stats.completion_rate_pct ?? 0,
  )

  if (
    showManagementOutput &&
    (stats.scan_type === "exit" || stats.scan_type === "retention")
  ) {
    const topFactor = factorPriorityRows[0]?.factor ?? null
    const secondFactor = factorPriorityRows[1]?.factor ?? null
    const headerActions = (
      <PdfDownloadButton
        campaignId={id}
        campaignName={stats.campaign_name}
        scanType={stats.scan_type}
      />
    )

    if (stats.scan_type === "exit") {
      const exitDistribution = buildExitPictureDistribution(responses)
      const exitNarratives = buildExitNarratives({
        topFactorLabel: topFactor,
        secondFactorLabel: secondFactor,
        topExitReasonLabel,
        topContributingReasonLabel,
        strongWorkSignalRate,
        distribution: exitDistribution,
      })
      const distributionSegments = [
        {
          label: "Werkfrictie",
          value: `${exitDistribution.workPercent}%`,
          percent: exitDistribution.workPercent,
        },
        {
          label: "Trekfactoren",
          value: `${exitDistribution.pullPercent}%`,
          percent: exitDistribution.pullPercent,
        },
        {
          label: "Situationele context",
          value: `${exitDistribution.situationalPercent}%`,
          percent: exitDistribution.situationalPercent,
        },
      ].filter((segment) => segment.percent > 0)
      const dominantCategory =
        [...distributionSegments].sort(
          (left, right) => right.percent - left.percent,
        )[0] ?? null
      const contributingItems = [
        secondFactor
          ? {
              label: "Meespelende factor",
              value: secondFactor,
              body: `${secondFactor} kleurt het vertrekbeeld mee naast de sterkste factor en hoort daarom in dezelfde analytische lezing thuis.`,
            }
          : null,
        topContributingReasonLabel
          ? {
              label: "Meelezende context",
              value: topContributingReasonLabel,
              body: `${topContributingReasonLabel} komt als contextlaag terug onder de hoofdreden en helpt de samenhang van het vertrekbeeld te begrijpen.`,
            }
          : null,
      ].filter(
        (
          item,
        ): item is { label: string; value: string; body: string } =>
          Boolean(item),
      )
      return (
        <ExitProductDashboard
          moduleHref={moduleHref}
          moduleLabel={moduleLabel}
          moduleBackLinkLabel={moduleBackLinkLabel}
          campaignName={stats.campaign_name}
          organizationName={organizationName}
          routePeriodLabel={routePeriodLabel}
          scopeLabel={scopeLabel}
          statusLabel={compositionStateMeta.label}
          headerActions={headerActions}
          averageSignalScoreLabel={
            averageRiskScore !== null
              ? `${averageRiskScore.toFixed(1)}/10`
              : "Nog niet beschikbaar"
          }
          strongestFactorLabel={topFactor ?? "Nog niet beschikbaar"}
          strongWorkSignalLabel={
            responses.some((response) => Boolean(response.preventability))
              ? `${strongWorkSignalRate}%`
              : "Nog niet beschikbaar"
          }
          primaryReasonTitle={
            topExitReasonLabel ?? dominantCategory?.label ?? "Nog niet beschikbaar"
          }
          primaryReasonBody={
            topExitReasonLabel !== null
              ? "Deze hoofdreden komt het vaakst terug in de leesbare responses en opent daarom als eerste de analytische lezing van dit vertrekbeeld."
              : dominantCategory !== null
                ? `${dominantCategory.value} van het leesbare vertrekbeeld valt in ${dominantCategory.label.toLowerCase()}. Daarmee is dit nu de dominante categorie in deze wave.`
                : "Onvoldoende data om een hoofdreden of dominante categorie eerlijk vrij te geven."
          }
          whyItMattersItems={exitNarratives}
          contributingItems={contributingItems}
          totalInvited={String(stats.total_invited)}
          totalCompleted={String(stats.total_completed)}
          responseRate={`${stats.completion_rate_pct}%`}
          responseContextNote={responseContextNote}
          topFactors={factorPriorityRows}
          distributionSegments={distributionSegments}
          factorRows={factorPriorityRows}
          sdtRows={sdtRows}
          methodologyContent={
            <MethodologyCard
              scanType={stats.scan_type}
              hasSegmentDeepDive={hasSegmentDeepDive}
              signalLabel={scanDefinition.signalLabel}
              embedded
            />
          }
        />
      )
    }

    const retentionNarratives = buildRetentionNarratives({
      topFactorLabel: topFactor,
      secondFactorLabel: secondFactor,
      retentionThemes,
      averageRiskScore,
      turnoverIntention: retentionSupplemental.turnoverIntention,
      engagement: retentionSupplemental.engagement,
    })
    const retentionSegments = buildRetentionSignalSegments(riskDistribution)
    const engagementSegments = buildEngagementSegments(responses)

    return (
      <div className="space-y-8">
        <div className="space-y-3 border-b border-slate-200/80 pb-4">
          <p className="text-[0.78rem] font-medium tracking-[0.01em] text-slate-500">
            <Link href="/dashboard" className="transition-colors hover:text-slate-700">
              Overzicht
            </Link>{" "}
            /{" "}
            <Link href={moduleHref} className="transition-colors hover:text-slate-700">
              {moduleLabel}
            </Link>{" "}
            / <span className="text-slate-700">{stats.campaign_name}</span>
          </p>
          <Link
            href={moduleHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            ← {moduleBackLinkLabel}
          </Link>
        </div>

        <ManagementReadHeader
          tone="retention"
          productLabel="RetentieScan"
          title={stats.campaign_name}
          orgLabel={organizationName}
          periodLabel={routePeriodLabel}
          scopeLabel={scopeLabel}
          statusLabel={compositionStateMeta.label}
          contextLine={`${topFactor ?? "De route"} opent het eerste behoudsbeeld. Behoudsdruk moet hier eerst gelezen worden, niet direct vertaald naar eigenaarschap of actieontwerp.`}
          actions={headerActions}
        />

        <ManagementReadSection eyebrow="Bestuurlijke handoff" title="Behoudsdruk en responsbeeld">
          <div className="space-y-5">
            <p className="max-w-4xl text-[1rem] leading-7 text-[color:var(--dashboard-text)]">
              Deze route laat eerst zien waar behoud onder druk staat en welke samenhang daaronder ligt. De pagina bewaakt bewust de grens tussen bestuurlijke duiding en commitment: ze opent de routelezing, maar schuift vervolgstructuur door naar Action Center.
            </p>
            <ManagementReadInfoGrid
              items={[
                { label: "Retentiesignaal", value: averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : "Nog niet vrij" },
                { label: "Vertrekintentie", value: retentionSupplemental.turnoverIntention !== null ? `${retentionSupplemental.turnoverIntention.toFixed(1)}/10` : "Nog niet vrij" },
                { label: "Bevlogenheid", value: retentionSupplemental.engagement !== null ? `${retentionSupplemental.engagement.toFixed(1)}/10` : "Nog niet vrij" },
                { label: "Respons", value: `${stats.completion_rate_pct ?? 0}%` },
              ]}
            />
          </div>
        </ManagementReadSection>

        <ManagementReadSection
          eyebrow="Drivers"
          title="Drivers en prioriteitenbeeld"
          note={`Driverbeeld op basis van n = ${responses.length}. Groei, belasting, leiderschap en context blijven afzonderlijk bestuurlijk leesbaar.`}
        >
          <ManagementReadFactorTable rows={factorPriorityRows} />
        </ManagementReadSection>

        <ManagementReadSection
          eyebrow="Synthese"
          title="Kernsignalen in samenhang"
          note="Kernsignalen blijven samengevat, maar niet opgeblazen tot actieontwerp. Het rapport blijft de inhoudelijke waarheid."
        >
          <ManagementReadNarratives items={retentionNarratives} />
        </ManagementReadSection>

        <ManagementReadSection
          eyebrow="Retentiebeeld"
          title="Retentiesignaal, vertrekintentie en bevlogenheidsverhouding"
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <ManagementReadDistribution
              tone="retention"
              label="Retentiesignaal"
              value={averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : "Nog niet vrij"}
              narrative="De verdeling tussen actief vertrekdenkend, latent risico en stabiel blijft bestuurlijk belangrijk. Juist de middengroep is vaak het eerst relevant voor een managementread."
              segments={retentionSegments}
            />
            <ManagementReadDistribution
              tone="retention"
              label="Bevlogenheidsverhouding"
              value={retentionSupplemental.engagement !== null ? `${retentionSupplemental.engagement.toFixed(1)}/10` : "Nog niet vrij"}
              narrative="Bevlogenheid leest hier niet los, maar in verhouding tot behoudsdruk en vertrekintentie. Daardoor blijft de route behoudsdruk-first in plaats van actie-first."
              segments={engagementSegments}
            />
          </div>
        </ManagementReadSection>

        <ManagementReadSection
          eyebrow="Verdieping"
          title="SDT en organisatiefactoren"
          note="Ook hier blijft de verdiepingslaag rapporttrouw: SDT verklaart niet los, maar helpt de primaire organisatiefactoren bestuurlijk scherper te lezen."
        >
          <ManagementReadFactorTable rows={sdtRows} />
        </ManagementReadSection>

        <ManagementReadBridge
          tone="retention"
          title="Van behoudsdruk naar mogelijke vervolgrichting"
          body="De routepagina toont wat bestuurlijk als eerste gelezen moet worden. Eventuele eigenaarschap-, actie- en reviewstructuur hoort pas in Action Center thuis."
          action={actionCenterRouteAction}
        />
      </div>
    )
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr),320px] xl:items-start">
      <div className="min-w-0 space-y-7">
        <div className="border-b border-slate-200/80 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-[0.78rem] font-medium tracking-[0.01em] text-slate-500">
                <Link href="/dashboard" className="transition-colors hover:text-slate-700">
                  Overzicht
                </Link>{" "}
                /{" "}
                <Link href={moduleHref} className="transition-colors hover:text-slate-700">
                  {moduleLabel}
                </Link>{" "}
                / <span className="text-slate-700">{stats.campaign_name}</span>
              </p>
              <Link
                href={moduleHref}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
              >
                ← {moduleBackLinkLabel}
              </Link>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 lg:text-right">
              Campagnedetail brengt samenvatting, uitvoering en vervolgstap
              bij elkaar zonder onnodige omwegen.
            </p>
          </div>
        </div>

        <div id="samenvatting" className="scroll-mt-36 space-y-5">
          <DashboardHero
            eyebrow={scanDefinition.productName}
            title={stats.campaign_name}
            description={buildHeroDescription({
              scanType: stats.scan_type,
              isActive: stats.is_active,
              completionRate: stats.completion_rate_pct ?? 0,
              pendingCount,
              hasEnoughData,
              averageRiskScore,
              scanDefinition,
            })}
            tone="slate"
            variant="editorial"
            meta={
              <>
                <DashboardChip
                  label={stats.is_active ? "Actief" : "Gesloten"}
                  tone={stats.is_active ? "emerald" : "slate"}
                />
                <DashboardChip
                  label={productExperience.familyRoleLabel}
                  tone={productExperience.familyRoleTone}
                />
                <DashboardChip
                  label={`${stats.completion_rate_pct ?? 0}% respons`}
                  tone="slate"
                />
                <DashboardChip
                  label={compositionStateMeta.label}
                  tone={compositionStateMeta.tone}
                />
                <DashboardChip
                  label={getDeliveryModeLabel(
                    campaignMeta?.delivery_mode ?? null,
                    stats.scan_type,
                  )}
                  tone="slate"
                />
              </>
            }
            actions={
              !showManagementOutput ? (
                <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
                  {activationState.heroActionLabel}
                </div>
              ) : showPartialManagementOutput ? (
                <>
                  <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
                    Compacte read zichtbaar, aanbevelingen nog begrensd
                  </div>
                  <PdfDownloadButton
                    campaignId={id}
                    campaignName={stats.campaign_name}
                    scanType={stats.scan_type}
                  />
                </>
              ) : prefersReportFirst ? (
                <>
                  {!profile?.is_verisight_admin ? (
                    <OnboardingAdvancer fromStep={1} />
                  ) : null}
                  <div className="relative">
                    {!profile?.is_verisight_admin ? (
                      <OnboardingBalloon
                        step={2}
                        label="Download hier je rapport"
                        align="left"
                      />
                    ) : null}
                    <PdfDownloadButton
                      campaignId={id}
                      campaignName={stats.campaign_name}
                      scanType={stats.scan_type}
                    />
                  </div>
                </>
              ) : stats.scan_type === "pulse" ||
                stats.scan_type === "team" ||
                stats.scan_type === "onboarding" ||
                stats.scan_type === "leadership" ? (
                <>
                  {!profile?.is_verisight_admin ? (
                    <OnboardingAdvancer fromStep={1} />
                  ) : null}
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                    {stats.scan_type === "pulse"
                      ? "Pulse: eerste vervolgstap live"
                      : stats.scan_type === "team"
                        ? "TeamScan: lokale read live"
                        : stats.scan_type === "onboarding"
                          ? "Onboarding: checkpoint read live"
                          : "Leadership Scan: management read live"}
                  </div>
                </>
              ) : (
                <>
                  {!profile?.is_verisight_admin ? (
                    <OnboardingAdvancer fromStep={1} />
                  ) : null}
                  <div className="relative">
                    {!profile?.is_verisight_admin ? (
                      <OnboardingBalloon
                        step={2}
                        label="Download hier je rapport"
                        align="left"
                      />
                    ) : null}
                    <PdfDownloadButton
                      campaignId={id}
                      campaignName={stats.campaign_name}
                      scanType={stats.scan_type}
                    />
                  </div>
                </>
              )
            }
            aside={
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {heroAsideItems.map((item) => (
                    <DashboardKeyValue
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      accent={item.accent}
                      helpText={item.helpText}
                      variant="quiet"
                    />
                  ))}
                </div>
                <div className="border-t border-[color:var(--dashboard-frame-border)] pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Campagnestatus
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {`${stats.total_completed}/${stats.total_invited || 0} ingevuld`}
                    .{" "}
                    {pendingCount > 0
                      ? `${pendingCount} respondent(en) zijn nog niet afgerond.`
                      : "Alle uitgenodigde respondenten hebben afgerond."}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    State: {compositionStateMeta.label}.{" "}
                    {compositionStateMeta.trust}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {activationState.statusDetail}
                  </p>
                </div>
              </div>
            }
          />

          {buildInsightWarnings({
            responsesLength: responses.length,
            hasMinDisplay,
            hasEnoughData,
            scanType: stats.scan_type,
          }).map((notice) => (
            <div
              key={notice.title}
              className={`rounded-[20px] border px-4 py-3.5 text-sm ${
                notice.tone === "amber"
                  ? "border-amber-200 bg-amber-50/85 text-amber-900"
                  : notice.tone === "red"
                    ? "border-red-200 bg-red-50/85 text-red-900"
                    : "border-slate-200 bg-white/80 text-slate-900"
              }`}
            >
              <p className="font-semibold">{notice.title}</p>
              <p className="mt-1 leading-6">{notice.body}</p>
            </div>
          ))}

          {showManagementOutput ? (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <SignalStatCard
                label="Signaal-index"
                value={
                  averageRiskScore !== null
                    ? `${averageRiskScore.toFixed(1)}/10`
                    : "-"
                }
                subline={
                  averageRiskScore !== null
                    ? stats.scan_type === "exit"
                      ? undefined
                      : bandLabels[getRiskBandFromScore(averageRiskScore)]
                    : undefined
                }
                band={
                  averageRiskScore !== null
                    ? stats.scan_type === "exit"
                      ? "neutral"
                      : getRiskBandFromScore(averageRiskScore)
                    : undefined
                }
              />
              <SignalStatCard
                label="Respons"
                value={`${stats.completion_rate_pct ?? 0}%`}
                subline={`${stats.total_completed} van ${stats.total_invited} responsen`}
                band="neutral"
              />
              <SignalStatCard
                label={stats.scan_type === "exit" ? "Spreiding in beeld" : "Risicoband"}
                value={`${dominantPct}%`}
                subline={
                  stats.scan_type === "exit"
                    ? "van de responses valt in de grootste zichtbare groep"
                    : `valt nu in ${bandLabels[dominantBand].toLowerCase()}`
                }
                band={stats.scan_type === "exit" ? "neutral" : dominantBand}
              />
              <InsightStatCard
                label="Sterkste factor"
                value={topExitReasonLabel ?? topContributingReasonLabel ?? "-"}
                subline="vraagt nu als eerste aandacht"
              />
            </div>
          ) : null}
        </div>

        <DashboardSummaryBar
          items={summaryItems}
          anchors={sectionAnchors}
          variant="quiet"
          actions={summaryActions}
        />

        {showClientExecutionFlow ? (
          <DashboardSection
            id="uitvoering"
            eyebrow="Uitvoering"
            title="Uitvoering"
            description="Gebruik dit blok alleen voor uitvoeringsstappen rond uitnodigingen en import."
            aside={<DashboardChip label="Klantuitvoering" tone="slate" />}
            variant="quiet"
          >
            <GuidedSelfServePanel
              campaignId={id}
              scanType={stats.scan_type}
              isActive={stats.is_active}
              deliveryMode={campaignMeta?.delivery_mode ?? null}
              importReady={importReady}
              hasSegmentDeepDive={hasSegmentDeepDive}
              totalInvited={stats.total_invited}
              totalCompleted={stats.total_completed}
              invitesNotSent={invitesNotSent}
              hasMinDisplay={hasMinDisplay}
              hasEnoughData={hasEnoughData}
              pendingCount={pendingCount}
              importQaConfirmed={guidedSetupDiscipline.importQaConfirmed}
              launchTimingConfirmed={
                guidedSetupDiscipline.launchTimingConfirmed
              }
              communicationReady={guidedSetupDiscipline.communicationReady}
              remindableCount={remindableCount}
              unsentRespondents={unsentRespondents}
              launchDate={deliveryRecord?.launch_date ?? null}
              launchConfirmedAt={deliveryRecord?.launch_confirmed_at ?? null}
              participantCommsConfig={
                deliveryRecord?.participant_comms_config ?? null
              }
              reminderConfig={deliveryRecord?.reminder_config ?? null}
              memberRole={membership?.role ?? null}
            />
          </DashboardSection>
        ) : null}

        {showPartialManagementOutput ? (
          <DashboardSection
            id="handoff"
            eyebrow="Eerste vervolgstap"
            title="Eerste compacte samenvatting"
            description="De eerste veilige dashboardlaag is zichtbaar, maar deze campagne blijft nog bewust compact tot meer respons en vollediger scores een rijker beeld dragen."
            aside={
              <DashboardChip
                label={compositionStateMeta.label}
                tone={compositionStateMeta.tone}
              />
            }
            tone="slate"
            variant="quiet"
          >
            <div className="space-y-5">
              <DashboardRecommendationRail
                eyebrow="Trustgrens"
                title="Aanbevelingen blijven nog begrensd"
                description="Gebruik nu alleen de compacte read, de eerste managementvraag en het bijbehorende trustsignaal. Drivers, playbooks en vervolgblokken blijven bewust nog deels dicht."
                tone="amber"
                variant="quiet"
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <DashboardPanel
                    eyebrow="Wat nu wel zichtbaar is"
                    title="Eerste samenvatting"
                    body="Gebruik de hero, samenvatting en eerste managementvraag om richting te houden zonder het beeld zwaarder te maken dan de data nu draagt."
                    tone="slate"
                  />
                  <DashboardPanel
                    eyebrow="Wat bewust nog wacht"
                    title="Nog geen volle aanbevelingslaag"
                    body="Drivers, aanbevelingen en de vervolgrichting openen pas zodra minstens 10 complete responses beschikbaar zijn en privacygrenzen niet meer onnodig veel verbergen."
                    tone="amber"
                  />
                </div>
              </DashboardRecommendationRail>
              <ManagementReadGuide
                scanType={stats.scan_type}
                hasMinDisplay={hasMinDisplay}
                hasEnoughData={hasEnoughData}
              />
            </div>
          </DashboardSection>
        ) : null}

        {showManagementOutput && promotedSummaryCards.length > 0 ? (
          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4 shadow-[0_12px_32px_rgba(19,32,51,0.05)] sm:p-5">
            <div className="flex flex-col gap-3 border-b border-[color:var(--border)]/80 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {productExperience.summaryLeadTitle}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text)]">
                  {productExperience.summaryLeadDescription}
                </p>
              </div>
              <DashboardChip
                label={productExperience.summaryContextLabel}
                tone={productExperience.summaryContextTone}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {promotedSummaryCards.map((card) => (
                <DashboardPanel
                  key={`${card.title}-${card.value ?? "summary"}`}
                  eyebrow={productExperience.summaryCardEyebrow}
                  title={card.title}
                  value={card.value}
                  body={card.body}
                  tone={normalizeInformationalTone(card.tone)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {showDetailedManagementOutput ? (
          <DashboardSection
            id="handoff"
            eyebrow="Eerste vervolgstap"
            title={handoffTitle}
            description={handoffDescription}
            aside={
              <DashboardChip
                label={readinessLabel}
                tone={hasEnoughData ? "emerald" : "amber"}
              />
            }
            tone="slate"
            variant="quiet"
          >
            <div className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr),minmax(320px,0.7fr)]">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {buildDecisionPanels({
                    stats,
                    averageRiskScore,
                    scanDefinition,
                    strongWorkSignalRate,
                    retentionSupplemental,
                    factorAverages: factorData.orgAverages,
                    hasEnoughData,
                    hasMinDisplay,
                  }).map((panel) => (
                    <DashboardPanel
                      key={panel.title}
                      eyebrow={panel.eyebrow}
                      title={panel.title}
                      value={panel.value}
                      body={panel.body}
                      tone={panel.tone}
                    />
                  ))}
                  {handoffSummaryCards.map((card) => (
                    <DashboardPanel
                      key={`${card.title}-${card.value ?? "card"}`}
                      eyebrow={productExperience.summaryCardEyebrow}
                      title={card.title}
                      value={card.value}
                      body={card.body}
                      tone={normalizeInformationalTone(card.tone)}
                    />
                  ))}
                </div>

                <div className="grid gap-4">
                  <DashboardPanel
                    eyebrow="Eerste managementvraag"
                    title={dashboardViewModel.primaryQuestion.title}
                    body={dashboardViewModel.primaryQuestion.body}
                    tone={normalizeInformationalTone(
                      dashboardViewModel.primaryQuestion.tone,
                    )}
                  />
                  <DashboardPanel
                    eyebrow="Logische vervolgstap"
                    title={dashboardViewModel.nextStep.title}
                    body={dashboardViewModel.nextStep.body}
                    tone={normalizeInformationalTone(
                      dashboardViewModel.nextStep.tone,
                    )}
                  />
                </div>
              </div>

              {stats.scan_type === "team" && hasEnoughData ? (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-sm font-semibold text-slate-950">
                      Lokale vervolgstap
                    </h3>
                    <DashboardChip
                      label={
                        primaryTeamPriority
                          ? `Eerst: ${primaryTeamPriority.label}`
                          : "Kleine vervolgstap"
                      }
                      tone={primaryTeamPriority ? "amber" : "slate"}
                    />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {primaryTeamPriority && primaryTeamPlaybook
                      ? `Gebruik deze TeamScan nu als compacte vervolgstap: ${primaryTeamPriority.label} vraagt eerst verificatie op ${primaryTeamPriority.topFactorLabel.toLowerCase()}, daarna kies je bewust wie de eerste lokale stap trekt en hoe klein de review blijft.`
                      : "TeamScan geeft al wel lokale richting, maar blijft bewust klein zolang er nog geen eerlijke eerste prioriteit kan worden vrijgegeven."}
                  </p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-4">
                    <DashboardPanel
                      eyebrow="Afdeling"
                      title={
                        primaryTeamPriority?.label ?? "Nog niet vrijgegeven"
                      }
                      value={primaryTeamPriority?.priorityTitle}
                      body={
                        primaryTeamPriority
                          ? `${primaryTeamPriority.topFactorLabel} is hier nu het scherpste lokale spoor.`
                          : "Gebruik meerdere zichtbare afdelingen voorlopig als gespreksinput zonder geforceerde top-1."
                      }
                      tone={primaryTeamPriority ? "amber" : "slate"}
                    />
                    <DashboardPanel
                      eyebrow="Eerste eigenaar"
                      title={
                        primaryTeamPlaybook?.owner ?? "HR + afdelingsleider"
                      }
                      body="Maak expliciet wie het eerste lokale gesprek trekt en wie de vervolgstap terugbrengt in de review."
                      tone="slate"
                    />
                    <DashboardPanel
                      eyebrow="Begrensde eerste actie"
                      title={
                        primaryTeamPlaybook?.actions[0] ??
                        "Kies eerst een kleine lokale check"
                      }
                      body={
                        primaryTeamPlaybook?.decision ??
                        "TeamScan blijft hier gericht op een kleine lokale verificatie of correctie, niet op een brede interventie."
                      }
                      tone="slate"
                    />
                    <DashboardPanel
                      eyebrow="Reviewmoment"
                      title={
                        primaryTeamPlaybook?.review ?? "Lokale hercheck eerst"
                      }
                      body="Gebruik het reviewmoment om bewust te kiezen: nog een lokale vervolgstap, terug naar het bredere beeld of juist stoppen."
                      tone="amber"
                    />
                  </div>
                </div>
              ) : null}

              {productExperience.trustNotePlacement === "handoff"
                ? trustNote
                : null}

              {productExperience.evidenceSectionOrder === "management-first" ? (
                <>
                  {managementBlocksSection}
                  {profileCardsSection}
                </>
              ) : (
                <>
                  {profileCardsSection}
                  {managementBlocksSection}
                </>
              )}
            </div>
          </DashboardSection>
        ) : null}

        {showDetailedManagementOutput ? (
          <DashboardSection
            id="drivers"
            eyebrow="Wat drijft dit beeld?"
            title={productExperience.driverTitle}
            description={productExperience.driverDescription}
            aside={
              <DashboardChip
                label={productExperience.driverAsideLabel}
                tone={productExperience.driverAsideTone}
              />
            }
            variant="quiet"
          >
            {hasEnoughData ? (
              <div className="space-y-5">
                {productExperience.trustNotePlacement === "drivers"
                  ? trustNote
                  : null}
                <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-4 text-sm leading-6 text-[color:var(--text)]">
                  {productExperience.driverIntro}
                </div>
                <DashboardTabs tabs={driverTabs} />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Verdiepende analyse wordt zichtbaar vanaf {MIN_N_PATTERNS}{" "}
                ingevulde responses. Tot die tijd blijft het dashboard bewust
                compact en voorzichtig.
              </div>
            )}
          </DashboardSection>
        ) : null}

        {showDetailedManagementOutput ? (
          <DashboardSection
            id="acties"
            eyebrow="Waar eerst op handelen"
            title={productExperience.actionTitle}
            description={dashboardViewModel.focusSectionIntro}
            aside={<DashboardChip label={focusBadgeLabel} tone="slate" />}
            tone="slate"
            variant="quiet"
          >
            {hasEnoughData ? (
              <div className="space-y-5">
                {stats.scan_type === "team" && teamPriorityRead ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-slate-950">
                      {teamPriorityRead.status === "ready"
                        ? "Eerste lokale verificatie en vervolgstap"
                        : "Lokale prioriteit blijft compact"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {teamPriorityRead.summaryBody}
                    </p>
                    {primaryTeamPriority && primaryTeamPlaybook ? (
                      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                        <DashboardPanel
                          eyebrow="Afdeling eerst"
                          title={primaryTeamPriority.label}
                          value={primaryTeamPriority.priorityTitle}
                          body={`${primaryTeamPriority.topFactorLabel} is hier nu het scherpste lokale spoor. Gebruik deze afdeling als eerste managementcheck, niet als definitieve eindconclusie.`}
                          tone="amber"
                        />
                        <DashboardPanel
                          eyebrow="Eerste eigenaar"
                          title={primaryTeamPlaybook.owner}
                          body="Deze combinatie trekt de eerste lokale check en bewaakt tegelijk dat TeamScan compact blijft."
                          tone="slate"
                        />
                        <DashboardPanel
                          eyebrow="Eerste check"
                          title={primaryTeamPlaybook.validate}
                          body={
                            primaryTeamQuestions[0] ??
                            "Gebruik het eerstvolgende afdelingsgesprek om dit lokale spoor expliciet te verifieren."
                          }
                          tone="slate"
                        />
                        <DashboardPanel
                          eyebrow="Reviewmoment"
                          title={
                            primaryTeamPlaybook.actions[0] ??
                            primaryTeamPlaybook.title
                          }
                          body={
                            primaryTeamPlaybook.review ??
                            "Leg direct vast wanneer deze lokale check opnieuw wordt gelezen en of TeamScan daarna nog een tweede stap nodig heeft."
                          }
                          tone="slate"
                        />
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                        TeamScan toont hier bewust nog geen harde eerste
                        volgorde. Gebruik de lokale read om meerdere afdelingen
                        te bespreken, een eigenaar te benoemen en pas na de
                        eerste check te bepalen of een hardere volgorde
                        nodig is.
                      </div>
                    )}
                  </div>
                ) : null}

                {productExperience.recommendationOrder === "playbooks-first" ? (
                  <>
                    {playbooksBlock}
                    {focusQuestionsBlock}
                  </>
                ) : (
                  <>
                    {focusQuestionsBlock}
                    {playbooksBlock}
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Focusvragen en route-uitvoer worden betekenisvoller zodra het
                dashboard minstens {MIN_N_PATTERNS} responses heeft.
              </div>
            )}
          </DashboardSection>
        ) : null}

        {showDetailedManagementOutput ? (
          <DashboardSection
            id="route"
            eyebrow="Vervolg na het eerste gesprek"
            title={productExperience.routeTitle}
            description={productExperience.routeDescription}
            aside={
              <DashboardChip
                label={productExperience.routeBadgeLabel}
                tone="slate"
              />
            }
            variant="quiet"
          >
            <div className="space-y-5">
              <ManagementReadGuide
                scanType={stats.scan_type}
                hasMinDisplay={hasMinDisplay}
                hasEnoughData={hasEnoughData}
              />

              {dashboardViewModel.followThroughCards.length > 0 ? (
                <DashboardTimeline
                  title={dashboardViewModel.followThroughTitle}
                  description={dashboardViewModel.followThroughIntro}
                  items={dashboardViewModel.followThroughCards}
                />
              ) : null}

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-950">
                  {productExperience.afterSessionTitle}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {productExperience.afterSessionDescription}
                </p>
                {stats.scan_type === "team" ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <DashboardPanel
                      eyebrow="Als de lokale check bevestigt"
                      title="Blijf op dezelfde route"
                      body="Doe alleen een volgende lokale check als route, lokale actie en reviewmoment uit deze TeamScan al expliciet zijn gemaakt."
                      tone="slate"
                    />
                    <DashboardPanel
                      eyebrow="Als de vraag breder wordt"
                        title="Ga terug naar het bredere beeld"
                      body="Schakel niet door naar extra lokalisatie als de echte vraag weer organisatieniveau, behoudsbeeld of bredere duiding vraagt."
                      tone="amber"
                    />
                    <DashboardPanel
                      eyebrow="Als de onderbouwing te smal blijft"
                      title="Stop met verder lokaliseren"
                      body="Open geen extra TeamScan-verbreding zolang metadata, groepsgrootte of lokale bevestiging daar nog geen eerlijke basis voor geven."
                      tone="amber"
                    />
                  </div>
                ) : null}
                {stats.scan_type === "leadership" ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <DashboardPanel
                      eyebrow="Als de managementcheck bevestigt"
                      title="Blijf op dezelfde route"
                      body="Doe alleen een volgende Leadership-check als eigenaar, kleine verificatie of correctie en reviewmoment uit deze samenvatting al expliciet zijn gemaakt."
                      tone="slate"
                    />
                    <DashboardPanel
                      eyebrow="Als de vraag breder wordt"
                        title="Ga terug naar het bredere beeld"
                      body="Schakel niet door naar extra Leadership-verbreding als de echte vraag weer lokale lokalisatie, bredere duiding of een ander productspoor vraagt."
                      tone="amber"
                    />
                    <DashboardPanel
                      eyebrow="Als de onderbouwing te smal blijft"
                      title="Open geen named leaders of 360"
                      body="Maak Leadership Scan niet groter dan deze wave draagt zolang groepsniveau, suppressie en de huidige data nog geen eerlijke basis geven voor named leader of 360-output."
                      tone="amber"
                    />
                  </div>
                ) : null}
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {firstNextStepGuidance.cards.map((card) => (
                    <DashboardPanel
                      key={card.key}
                      eyebrow={
                        card.key === "insight"
                          ? "Inzicht"
                          : card.key === "action"
                            ? "Eerste actie"
                            : "Geen standaard vervolg"
                      }
                      title={card.title}
                      body={card.body}
                      tone="slate"
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-[24px] border border-white/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(19,32,51,0.05)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Alleen als vervolg echt nodig is
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                        Gebruik deze routes alleen als de eerste stap al expliciet is gemaakt. Zo blijft vervolg
                        gericht, in plaats van automatisch groter te worden.
                      </p>
                    </div>
                    <DashboardChip label="Compacte vervolgroutes" tone="slate" />
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {firstNextStepGuidance.followOnSuggestions.map(
                      (suggestion) => (
                        <div
                          key={suggestion.productLabel}
                          className="rounded-[22px] border border-slate-200 bg-slate-50/88 px-4 py-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Alleen als
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {suggestion.productLabel}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {suggestion.when}
                          </p>
                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            {suggestion.boundary}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>
        ) : null}

        <div id="methodiek" className="scroll-mt-36">
          <DashboardDisclosure
            defaultOpen={disclosureDefaults.methodologyOpen}
            title="Methodiek, privacy en leeswijzer"
            description="Gebruik dit als contextlaag voor interpretatie, privacy en betrouwbaarheid."
            badge={<DashboardChip label={methodologyBadgeLabel} tone="slate" />}
          >
            <MethodologyCard
              scanType={stats.scan_type}
              hasSegmentDeepDive={hasSegmentDeepDive}
              signalLabel={scanDefinition.signalLabel}
              embedded
            />
          </DashboardDisclosure>
        </div>

        {utilitySectionVisible ? (
          <DashboardSection
            id="operatie"
            eyebrow={showClientExecutionFlow ? "Uitvoering" : "Utilitylaag"}
            title={
              showClientExecutionFlow
                ? "Responsmonitoring en begrensde uitvoerlaag"
                : "Operatie, respondenten en uitvoering"
            }
            description={
              showClientExecutionFlow
                ? "Gebruik deze laag om deelnemers, uitnodigingen en respons netjes te volgen. Productsetup, campagne-inrichting en uitvoercontrole blijven bij Verisight."
                : "Alles onder deze lijn ondersteunt uitvoering en beheer. De managementhoofdlijn blijft hierboven compact en bestuurlijk."
            }
            aside={
              <DashboardChip
                label={
                  showClientExecutionFlow
                    ? "Begeleide uitvoering"
                : "Beheer en operatie"
                }
                tone="slate"
              />
            }
            variant="quiet"
          >
            <div className="space-y-4">
              {canManageCampaign ? (
                <DashboardDisclosure
                  defaultOpen={!hasEnoughData}
                  title="Campagnestatus en uitvoercontrole"
                  description="Gebruik deze laag voor lifecycle, readiness, vervolgstappen en foutopvang nadat het managementbeeld helder is."
                  badge={
                    <DashboardChip
                      label={
                        readinessState.launchReady
                          ? "Uitvoer op orde"
                          : "Aandacht nodig"
                      }
                      tone={readinessState.launchReady ? "emerald" : "amber"}
                    />
                  }
                >
                  <div className="space-y-4">
                    <CampaignActions
                      campaignId={id}
                      isActive={stats.is_active}
                      pendingCount={pendingCount}
                      canResendInvites={canExecuteCampaign}
                      canArchiveCampaign={canManageCampaign}
                    />
                    <CampaignHealthIndicator
                      totalInvited={stats.total_invited}
                      totalCompleted={stats.total_completed}
                      invitesNotSent={invitesNotSent}
                      incompleteScores={incompleteScores}
                      hasEnoughData={hasEnoughData}
                      hasMinDisplay={hasMinDisplay}
                    />
                    <div
                      className={`rounded-[24px] border px-4 py-4 ${
                        readinessState.launchReady
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Implementatiereadiness
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-950">
                            {readinessState.headline}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                          {readinessState.launchReady
                            ? "Uitvoer op orde"
                            : "Nog aandacht nodig"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {readinessState.detail}
                      </p>
                      <p className="mt-3 text-sm font-medium leading-6 text-slate-800">
                        Volgende stap: {readinessState.nextStep}
                      </p>
                    </div>
                    {stats.is_active ? (
                      <PreflightChecklist
                        campaignId={id}
                        scanType={stats.scan_type}
                        deliveryMode={campaignMeta?.delivery_mode ?? null}
                        totalInvited={stats.total_invited}
                        totalCompleted={stats.total_completed}
                        invitesNotSent={invitesNotSent}
                        importReady={importReady}
                        incompleteScores={incompleteScores}
                        hasMinDisplay={hasMinDisplay}
                        hasEnoughData={hasEnoughData}
                        activeClientAccessCount={activeClientAccessCount ?? 0}
                        pendingClientInviteCount={pendingClientInviteCount ?? 0}
                        record={deliveryRecord}
                        checkpoints={deliveryCheckpoints}
                        leadOptions={deliveryLeadOptions}
                        leadLoadError={deliveryLeadError}
                        linkedLearningDossierCount={learningDossiers.length}
                        learningCloseoutEvidenceCount={
                          learningCloseoutEvidenceCount
                        }
                        editable={isVerisightAdmin}
                        auditEvents={auditEvents}
                      />
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        Deze campagne is gesloten. Rapportage en dashboard
                        blijven beschikbaar, maar respondenten kunnen niet meer
                        invullen.
                      </div>
                    )}
                  </div>
                </DashboardDisclosure>
              ) : null}

              <DashboardDisclosure
                defaultOpen={disclosureDefaults.respondentsOpen}
                title="Respondenten en uitnodigingen"
                description="Operationele detailweergave voor import, responsmonitoring en uitnodigingsbeheer."
                badge={
                  <DashboardChip
                    label={`${respondents.length} respondenten`}
                    tone="slate"
                  />
                }
              >
                {respondents.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-base font-semibold text-slate-900">
                      Nog geen respondenten toegevoegd
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {showClientExecutionFlow
                        ? "Gebruik de begeleide uitvoerflow hierboven om eerst het deelnemersbestand aan te leveren. Daarna verschijnen uitnodigingen, responsmonitoring en deze tabel automatisch."
                        : "Voeg eerst respondenten toe via de setupflow. Daarna komen uitnodigingen, responsmonitoring en deze tabel automatisch beschikbaar."}
                    </p>
                    {!showClientExecutionFlow && canManageCampaign ? (
                      <Link
                        href="/beheer"
                        className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        Naar setup
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <RespondentTable
                    respondents={respondents}
                    responses={safeTableResponses}
                    scanType={stats.scan_type}
                    hasMinDisplay={hasMinDisplay}
                    canManageCampaign={canManageCampaign}
                  />
                )}
              </DashboardDisclosure>

              {profile?.is_verisight_admin ? (
                <DashboardDisclosure
                  defaultOpen={false}
                  title="Pilot- en early-customer-learning"
                  description="Gebruik de dossierbron om buyer-signalen, implementatielessen, eerste duiding en de gekozen repeat- of expansionrichting expliciet vast te leggen voor deze campagne."
                  badge={
                    <DashboardChip
                      label={
                        learningDossiers.length === 0
                          ? "Nog geen dossier"
                          : learningCloseoutEvidenceCount > 0
                            ? `${learningCloseoutEvidenceCount} closeout-signaal`
                            : `${learningDossiers.length} gekoppeld, closeout open`
                      }
                      tone={
                        learningDossiers.length > 0 &&
                        learningCloseoutEvidenceCount > 0
                          ? "emerald"
                          : "amber"
                      }
                    />
                  }
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)]">
                    <DashboardPanel
                      eyebrow="Waarom nu"
                      title={
                        learningDossiers.length > 0
                        ? "Deze campagne is al opgenomen in de learninglus"
                          : "Koppel deze campagne aan een learningdossier"
                      }
                      body={
                        learningDossiers.length > 0
                          ? "Gebruik gekoppelde dossiers om implementationfrictie, launchsignalen, managementgebruik en gekozen vervolgroutes expliciet terug te laten landen in product, report, onboarding, sales en operations."
                          : "Zodra deze campagne leerwaarde geeft, koppel je hem aan een dossier in de dossierbron. Zo blijven echte uitvoerlessen en vervolgkeuzes niet hangen in losse notities."
                      }
                      tone={learningDossiers.length > 0 ? "slate" : "amber"}
                    />
                    <DashboardPanel
                      eyebrow="Closeoutdiscipline"
                      title={
                        learningCloseoutEvidenceCount > 0
                          ? "Learning kan naar formele closeout toewerken"
                          : learningDossiers.length > 0
                            ? "Learning bestaat, maar closeout-evidence mist nog"
                            : "Nog geen learning-closeout mogelijk"
                      }
                      body={
                        learningCloseoutEvidenceCount > 0
                          ? "Er is al minstens één expliciete review-, vervolg- of stopuitkomst vastgelegd. Daarmee kan delivery later eerlijker naar opvolging of learning closeout bewegen."
                          : learningDossiers.length > 0
                            ? "Er zijn al gekoppelde dossiers, maar nog geen expliciete review-, vervolg- of stopuitkomst. Houd delivery dus bewust open tot die opvolging echt is vastgelegd."
                            : "Zonder gekoppeld learningdossier hoort delivery-closeout nog niet als afgerond te voelen."
                      }
                      tone={
                        learningCloseoutEvidenceCount > 0 ? "emerald" : "amber"
                      }
                    />
                    <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                      <p className="text-sm font-semibold text-slate-950">
                        Gekoppelde dossiers
                      </p>
                      {learningDossiers.length === 0 ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                      Er is nog geen dossier gekoppeld aan deze campagne.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {learningDossiers.map((dossier) => (
                            <div
                              key={dossier.id}
                              className="rounded-2xl border border-white/80 bg-white px-4 py-3"
                            >
                              <p className="text-sm font-semibold text-slate-950">
                                {dossier.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Status: {dossier.triage_status}. Laatst
                                bijgewerkt:{" "}
                                {new Intl.DateTimeFormat("nl-NL", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                  timeZone: "Europe/Amsterdam",
                                }).format(new Date(dossier.updated_at))}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/beheer/klantlearnings?campaign=${id}`}
                        className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Open dossierbron
                      </Link>
                    </div>
                  </div>
                </DashboardDisclosure>
              ) : null}
            </div>
          </DashboardSection>
        ) : null}
      </div>
      {focusPanelItems.length > 0 ? (
        <div className="xl:pt-[360px]">
          <FocusPanel items={focusPanelItems} variant="campaign-detail" />
        </div>
      ) : null}
    </div>
  );
}


