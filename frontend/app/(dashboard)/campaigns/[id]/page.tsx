import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CampaignActions } from './campaign-actions'
import { PdfDownloadButton } from './pdf-download-button'
import {
  DashboardChip,
  DashboardDisclosure,
  DashboardHero,
  DashboardKeyValue,
  DashboardPanel,
  DashboardSection,
  DashboardSummaryBar,
  DashboardTimeline,
} from '@/components/dashboard/dashboard-primitives'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { FactorTable } from '@/components/dashboard/factor-table'
import { ManagementReadGuide } from '@/components/dashboard/onboarding-panels'
import { OnboardingAdvancer, OnboardingBalloon } from '@/components/dashboard/onboarding-balloon'
import { PreflightChecklist } from '@/components/dashboard/preflight-checklist'
import { RespondentTable } from '@/components/dashboard/respondent-table'
import { RiskCharts } from '@/components/dashboard/risk-charts'
import { getContactRequestsForAdmin } from '@/lib/contact-requests'
import {
  ActionPlaybookList,
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
  computeAverageRiskScore,
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
} from './page-helpers'
import { buildCampaignReadinessState, getDeliveryModeLabel } from '@/lib/implementation-readiness'
import { getLifecycleDecisionCards } from '@/lib/client-onboarding'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import { buildTeamLocalReadState, buildTeamPriorityReadState } from '@/lib/products/team'
import { getProductModule } from '@/lib/products/shared/registry'
import { getScanDefinition } from '@/lib/scan-definitions'
import { FACTOR_LABELS, hasCampaignAddOn } from '@/lib/types'
import type { CampaignStats, Respondent, SurveyResponse } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: statsRow } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('campaign_id', id)
    .single()

  if (!statsRow) notFound()
  const stats = statsRow as CampaignStats

  const { data: previousStatsRows } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('organization_id', stats.organization_id)
    .eq('scan_type', stats.scan_type)
    .lt('created_at', stats.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
  const previousStats = (previousStatsRows?.[0] as CampaignStats | undefined) ?? null

  const [
    { data: profile },
    { data: membership },
    { data: campaignMeta },
    { count: activeClientAccessCount },
    { count: pendingClientInviteCount },
  ] = await Promise.all([
    user
      ? supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from('org_members')
          .select('role')
          .eq('org_id', stats.organization_id)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('campaigns').select('enabled_modules, delivery_mode').eq('id', id).maybeSingle(),
    supabase
      .from('org_members')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', stats.organization_id)
      .in('role', ['viewer', 'member']),
    supabase
      .from('org_invites')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', stats.organization_id)
      .is('accepted_at', null),
  ])

  const canManageCampaign =
    profile?.is_verisight_admin === true ||
    membership?.role === 'owner' ||
    membership?.role === 'member'
  const isVerisightAdmin = profile?.is_verisight_admin === true
  const hasSegmentDeepDive = hasCampaignAddOn(campaignMeta, 'segment_deep_dive')
  const { data: deliveryRecordRaw } = await supabase
    .from('campaign_delivery_records')
    .select('*')
    .eq('campaign_id', id)
    .maybeSingle()
  const deliveryRecord = (deliveryRecordRaw ?? null) as CampaignDeliveryRecord | null
  const { data: deliveryCheckpointsRaw } = deliveryRecord
    ? await supabase
        .from('campaign_delivery_checkpoints')
        .select('*')
        .eq('delivery_record_id', deliveryRecord.id)
        .order('created_at', { ascending: true })
    : { data: [] }
  const deliveryCheckpoints = (deliveryCheckpointsRaw ?? []) as CampaignDeliveryCheckpoint[]
  const {
    rows: deliveryLeadOptions,
    configError: deliveryLeadConfigError,
    loadError: deliveryLeadLoadError,
  } = isVerisightAdmin
    ? await getContactRequestsForAdmin(100)
    : { rows: [], configError: null, loadError: null }
  const deliveryLeadError = deliveryLeadConfigError ?? deliveryLeadLoadError

  const { data: responsesRaw } = await supabase
    .from('survey_responses')
    .select(`
      id, respondent_id, risk_score, risk_band, preventability, stay_intent_score, uwes_score, turnover_intention_score,
      exit_reason_code, sdt_scores, org_scores, open_text_raw, open_text_analysis, full_result,
      submitted_at,
      respondents!inner(id, campaign_id, department, role_level, completed, completed_at, token)
    `)
    .eq('respondents.campaign_id', id)
  const responses = (responsesRaw ?? []) as unknown as (SurveyResponse & {
    respondents: Respondent
  })[]

  let previousResponses: (SurveyResponse & { respondents: Respondent })[] = []
  if ((stats.scan_type === 'retention' || stats.scan_type === 'pulse') && previousStats) {
    const { data: previousResponsesRaw } = await supabase
      .from('survey_responses')
      .select(`
        id, respondent_id, risk_score, risk_band, preventability, stay_intent_score, uwes_score, turnover_intention_score,
        exit_reason_code, sdt_scores, org_scores, open_text_raw, open_text_analysis, full_result,
        submitted_at,
        respondents!inner(id, campaign_id, department, role_level, completed, completed_at, token)
      `)
      .eq('respondents.campaign_id', previousStats.campaign_id)

    previousResponses = (previousResponsesRaw ?? []) as unknown as (SurveyResponse & {
      respondents: Respondent
    })[]
  }

  const { data: allRespondents } = await supabase
    .from('respondents')
    .select('*')
    .eq('campaign_id', id)
    .order('completed_at', { ascending: false, nullsFirst: false })
  const respondents = (allRespondents ?? []) as Respondent[]

  const factorData = computeFactorAverages(responses)
  const averageRiskScore = computeAverageRiskScore(responses)
  const strongWorkSignalRate = stats.scan_type === 'exit' ? computeStrongWorkSignalRate(responses) : null
  const topExitReasonLabel = stats.scan_type === 'exit' ? getTopExitReasonLabel(responses) : null
  const topContributingReasonLabel =
    stats.scan_type === 'exit' ? getTopContributingReasonLabel(responses) : null
  const signalVisibilityAverage =
    stats.scan_type === 'exit' ? computeAverageSignalVisibility(responses) : null
  const retentionSupplemental = computeRetentionSupplementalAverages(responses)
  const currentRetentionSignals =
    stats.scan_type === 'retention'
      ? { retentionSignal: averageRiskScore, ...retentionSupplemental }
      : null
  const previousRetentionSignals =
    stats.scan_type === 'retention' && previousResponses.length > 0
      ? computeRetentionSignalAverages(previousResponses)
      : null
  const currentPulseSignals =
    stats.scan_type === 'pulse'
      ? computePulseSignalAverages(responses)
      : null
  const previousPulseSignals =
    stats.scan_type === 'pulse' && previousResponses.length > 0
      ? computePulseSignalAverages(previousResponses)
      : null
  const pulseComparison =
    stats.scan_type === 'pulse'
      ? buildPulseComparisonState({
          current: currentPulseSignals ?? computePulseSignalAverages([]),
          previous: previousPulseSignals,
          currentResponsesLength: responses.length,
          previousResponsesLength: previousResponses.length,
        })
      : null
  const teamLocalRead =
    stats.scan_type === 'team'
      ? buildTeamLocalReadState(responses)
      : null
  const teamPriorityRead =
    stats.scan_type === 'team' && teamLocalRead
      ? buildTeamPriorityReadState(teamLocalRead)
      : null

  const hasEnoughData = responses.length >= MIN_N_PATTERNS
  const hasMinDisplay = responses.length >= MIN_N_DISPLAY
  const scanDefinition = getScanDefinition(stats.scan_type)
  const productModule = getProductModule(stats.scan_type)
  const teamPriorityBand = (signalValue: number) =>
    signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
  const pendingCount = stats.total_invited - stats.total_completed
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
  })

  const invitesNotSent = respondents.filter((respondent) => !respondent.sent_at && !respondent.completed).length
  const incompleteScores = responses.filter((response) => !response.org_scores || !response.sdt_scores).length
  const readinessState = buildCampaignReadinessState({
    totalInvited: stats.total_invited,
    totalCompleted: stats.total_completed,
    invitesNotSent,
    incompleteScores,
    hasMinDisplay,
    hasEnoughData,
    activeClientAccessCount: activeClientAccessCount ?? 0,
    pendingClientInviteCount: pendingClientInviteCount ?? 0,
  })
  const riskDistribution = {
    HOOG: stats.band_high,
    MIDDEN: stats.band_medium,
    LAAG: stats.band_low,
  }
  const riskHistogram = buildRiskHistogram(responses)
  const safeTableResponses = buildSafeTableResponses(stats.scan_type, responses)
  const retentionTrendCards =
    stats.scan_type === 'retention' && currentRetentionSignals && previousRetentionSignals
      ? buildRetentionTrendCards({ current: currentRetentionSignals, previous: previousRetentionSignals })
      : []
  const retentionSegmentPlaybooks =
    stats.scan_type === 'retention' && hasEnoughData
      ? buildRetentionSegmentPlaybooks({
          responses,
          orgAverageSignal: averageRiskScore,
          playbooks: productModule.getActionPlaybooks(),
        })
      : []
  const retentionThemes = stats.scan_type === 'retention' ? clusterRetentionOpenSignals(responses) : []
  const playbookCalibrationNote =
    stats.scan_type === 'retention'
      ? productModule.getActionPlaybookCalibrationNote?.() ?? null
      : null
  const disclosureDefaults = getDisclosureDefaults({
    scanType: stats.scan_type,
    hasEnoughData,
    hasMinDisplay,
    respondentsLength: respondents.length,
    canManageCampaign,
  })
  const { data: learningDossiersRaw } =
    profile?.is_verisight_admin === true
      ? await supabase
          .from('pilot_learning_dossiers')
          .select('id, title, triage_status, updated_at, review_moment, next_route, stop_reason, management_action_outcome, adoption_outcome')
          .eq('campaign_id', id)
          .order('updated_at', { ascending: false })
          .limit(3)
      : { data: [] }
  const learningDossiers = (learningDossiersRaw ?? []) as Array<{
    id: string
    title: string
    triage_status: string
    updated_at: string
    review_moment: string | null
    next_route: string | null
    stop_reason: string | null
    management_action_outcome: string | null
    adoption_outcome: string | null
  }>
  const learningCloseoutEvidenceCount = learningDossiers.filter((dossier) =>
    Boolean(
      dossier.review_moment ||
        dossier.next_route ||
        dossier.stop_reason ||
        dossier.management_action_outcome ||
        dossier.adoption_outcome,
    ),
  ).length
  const lifecycleDecisionCards = getLifecycleDecisionCards(stats.scan_type)
  const primaryTeamPriority =
    stats.scan_type === 'team' && teamPriorityRead?.status === 'ready'
      ? teamPriorityRead.groups.find((group) => group.isPrimary) ?? null
      : null
  const primaryTeamQuestions =
    stats.scan_type === 'team' && primaryTeamPriority
      ? productModule.getFocusQuestions()[primaryTeamPriority.topFactorKey]?.[
          teamPriorityBand(primaryTeamPriority.topFactorSignalValue)
        ] ?? []
      : []
  const primaryTeamPlaybook =
    stats.scan_type === 'team' && primaryTeamPriority
      ? productModule.getActionPlaybooks()[primaryTeamPriority.topFactorKey]?.[
          teamPriorityBand(primaryTeamPriority.topFactorSignalValue)
        ] ?? null
      : null
  const handoffTitle =
    stats.scan_type === 'retention'
      ? 'Bestuurlijke handoff en prioritering'
      : stats.scan_type === 'pulse'
        ? 'Pulse duiding en eerste vervolgactie'
        : stats.scan_type === 'team'
          ? 'Lokale duiding en eerste verificatie'
          : stats.scan_type === 'onboarding'
            ? 'Checkpoint duiding en eerste vervolgstap'
            : stats.scan_type === 'leadership'
              ? 'Managementcontext en eerste verificatie'
        : 'Vertrekduiding en managementgesprek'
  const handoffDescription =
    stats.scan_type === 'retention'
      ? 'Deze laag vertaalt RetentieScan naar een duidelijke lijn: wat is het beeld, wat moet je eerst toetsen en welke acties verdienen nu bestuurlijke aandacht.'
      : stats.scan_type === 'pulse'
        ? 'Deze laag vertaalt Pulse naar een bestuurlijk leesbare momentopname: wat vraagt nu aandacht, wat moet je als eerste bijsturen en welke review hoort hier direct achteraan.'
        : stats.scan_type === 'team'
          ? 'Deze laag vertaalt TeamScan naar een bestuurlijk leesbare lokale read: welke afdelingen vallen op, wat moet je eerst toetsen en welke lokale context vraagt nu als eerste aandacht.'
          : stats.scan_type === 'onboarding'
            ? 'Deze laag vertaalt onboarding naar een bestuurlijk leesbaar checkpointbeeld: wat valt nu op in vroege integratie, wat moet je eerst toetsen en welke beperkte correctie hoort hier direct achteraan.'
            : stats.scan_type === 'leadership'
              ? 'Deze laag vertaalt Leadership Scan naar een bestuurlijk leesbare managementread: welke context valt op, wat moet je eerst toetsen en welke begrensde managementstap hoort hier direct achteraan.'
        : 'Deze laag brengt ExitScan terug tot een bestuurlijk leesbaar vertrekbeeld: wat keert terug, wat lijkt beinvloedbaar en waar moet management eerst doorvragen.'
  const readinessLabel = hasEnoughData
    ? 'Beslisniveau bereikt'
    : hasMinDisplay
      ? 'Indicatief beeld'
      : 'Nog in opbouw'
  const focusBadgeLabel =
    stats.scan_type === 'pulse'
      ? 'Signaal -> bijsturen -> opnieuw meten'
      : stats.scan_type === 'team'
        ? 'Lokaliseren -> verifieren -> begrenzen'
        : stats.scan_type === 'onboarding'
          ? 'Checkpoint -> corrigeren -> opnieuw toetsen'
          : stats.scan_type === 'leadership'
            ? 'Duiden -> verifieren -> begrenzen'
      : stats.scan_type === 'retention'
        ? 'Signaleren -> valideren -> handelen'
        : 'Terugblik -> duiden -> verbeteren'
  const methodologyBadgeLabel =
    stats.scan_type === 'pulse'
      ? 'Snapshotcontext'
      : stats.scan_type === 'team'
        ? 'Lokale context'
        : stats.scan_type === 'onboarding'
          ? 'Checkpointcontext'
          : stats.scan_type === 'leadership'
            ? 'Managementcontext'
      : stats.scan_type === 'retention'
        ? 'Privacy-first'
        : 'Rapportcontext'
  const productExperience =
    stats.scan_type === 'retention'
      ? {
          summaryTone: 'emerald' as const,
          summarySignalLabel: 'Retentiesignaal',
          summaryContextLabel: 'Groepssignaal · verification-first',
          summaryContextTone: 'emerald' as const,
          summaryLeadTitle: 'Eerste bestuurlijke leesrichting',
          summaryLeadDescription:
            'Lees RetentieScan eerst als groepssignaal: waar staat behoud onder druk, wat vraagt eerst verificatie en welk spoor moet daarna in Wat nu als eerste route worden gekozen.',
          summaryCardEyebrow: 'Behoudsspoor',
          promotedSummaryCards: 2,
          driverTitle: 'Signaalbeeld en behoudsdruk',
          driverDescription:
            'Start bij retentiesignaal, trend en aanvullende signalen. Gebruik factoren en segmenten daarna om te bepalen waarom dit beeld ontstaat en waar behoud eerst nadere toetsing vraagt.',
          driverIntro:
            'Begin met het groepssignaal en open pas daarna factoren, trend en aanvullende lagen. Zo blijft RetentieScan een verification-first managementinstrument in plaats van een losse analysetabel.',
          driverAsideLabel: hasEnoughData ? 'Behoudsdrivers live' : 'Wacht op meer data',
          driverAsideTone: hasEnoughData ? ('emerald' as const) : ('amber' as const),
          driverTabOrder: ['signalen', 'trend', 'factoren', 'aanvullend'],
          signalTabLabel: 'Retentiesignaal',
          signalTabTitle: 'Retentiesignaal op groepsniveau',
          signalTabDescription:
            'Laat zien hoe breed en hoe scherp behoudsdruk zich over de groep verdeelt, zonder dit als individuele voorspelling te lezen.',
          factorTabLabel: 'Behoudsdrivers',
          factorTabTitle: 'Werkfactoren achter behoudsdruk',
          factorTabDescription:
            'Gebruik de laagst scorende werkfactoren als eerste verklarende laag voor managementgesprekken en gerichte verificatie.',
          supplementalTabLabel: 'Aanvullende signalen',
          supplementalTitle: 'Aanvullende signalen en SDT-basis',
          supplementalDescription:
            'Deze laag voegt bevlogenheid, open signalen en basisbehoeften toe aan het retentiebeeld, zodat trend en werkbeleving samen gelezen worden.',
          actionTitle: 'Waar behoud eerst aandacht vraagt',
          focusQuestionTitle: 'Prioritaire verificatievragen',
          focusQuestionDescription:
            'Start met de factoren en signalen die het eerst verificatie vragen. Gebruik de vragen om te bepalen wat in Wat nu de eerste managementroute wordt.',
          playbookTitle: 'Behoudsplaybooks onder de gekozen route',
          playbookDescription:
            'Deze playbooks vormen de uitvoerlaag onder de gekozen managementroute. Ze helpen van verificatie naar uitvoering te gaan zonder nieuwe prioriteiten te openen.',
          routeTitle: 'Van retentiesignaal naar managementroute',
          routeDescription:
            'Deze laag bundelt de gekozen route, eerste eigenaar, eerste stap en het logische reviewmoment zonder de executive hoofdlijn te verstoren.',
          routeBadgeLabel: 'Behoudsroute',
          afterSessionTitle: 'Na de eerste managementsessie',
          afterSessionDescription:
            'Gebruik het eerste reviewmoment om bewust te kiezen: blijf je op hetzelfde behoudsspoor, is segmentverdieping logisch of vraagt de volgende stap vooral een gerichte interventie en vervolgmeting?',
        }
      : stats.scan_type === 'team'
        ? {
            summaryTone: 'blue' as const,
            summarySignalLabel: 'Teamsignaal',
            summaryContextLabel: 'Lokale read · department-first',
            summaryContextTone: 'blue' as const,
            summaryLeadTitle: 'Eerste bestuurlijke leesrichting',
          summaryLeadDescription:
              'Lees TeamScan eerst als veilige lokale contextlaag: welke afdelingen vallen op, welke factor kleurt dat beeld en welke lokale verificatie hoort nu als eerste.',
            summaryCardEyebrow: 'Lokaal spoor',
            promotedSummaryCards: 2,
            driverTitle: 'Teamsignaal en lokale context',
            driverDescription:
              'Gebruik deze laag om het actuele teamsignaal gecontroleerd te verdiepen zonder TeamScan te verwarren met segment deep dive of manager ranking.',
            driverIntro:
              'Start bij de lokale read en gebruik daarna pas factoren, signaalverdeling en basisbehoeften om te bepalen welke afdelingen eerst verificatie vragen.',
            driverAsideLabel: hasEnoughData ? 'Lokale read live' : 'Wacht op meer data',
            driverAsideTone: hasEnoughData ? ('blue' as const) : ('amber' as const),
            driverTabOrder: ['lokaal', 'factoren', 'signalen', 'aanvullend'],
            signalTabLabel: 'Signaalverdeling',
            signalTabTitle: 'Teamsignaal op groepsniveau',
            signalTabDescription:
              'Laat zien hoe breed en hoe scherp het teamsignaal zich over de totale groep verdeelt voordat je naar afdelingen kijkt.',
            factorTabLabel: 'Lokale drivers',
            factorTabTitle: 'Werkfactoren achter lokale frictie',
          factorTabDescription:
              'Gebruik de scherpste werkfactoren als eerste verklarende laag om te bepalen welke afdelingen lokale verificatie verdienen.',
            supplementalTabLabel: 'SDT-basis',
            supplementalTitle: 'Werkbeleving en SDT-basis',
            supplementalDescription:
              'Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het huidige teamsignaal liggen en welke lokale context daardoor meer spanning laat zien.',
            actionTitle: 'Waar eerst lokaal op handelen',
            focusQuestionTitle: 'Prioritaire lokale verificatievragen',
            focusQuestionDescription:
              'Start met de factoren die het teamsignaal het scherpst kleuren en gebruik de vragen om te bepalen wat lokaal eerst getoetst moet worden.',
            playbookTitle: 'Lokale playbooks en eerste verificatie',
            playbookDescription:
              'Deze playbooks vormen de uitvoerlaag onder de gekozen lokale route. Ze helpen van verificatie naar een begrensde vervolgstap te gaan zonder de vraag breder te maken dan nodig.',
            routeTitle: 'Van TeamScan naar lokale managementroute',
            routeDescription:
              'Deze laag bundelt de gekozen lokale route, eerste eigenaar, eerste stap en de bewuste begrenzing van TeamScan zonder de executive hoofdlijn te verstoren.',
            routeBadgeLabel: 'Lokale route',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijft een lokale vervolgstap logisch, is bredere diagnose weer nodig of vraagt dit signaal juist minder lokalisatie dan gedacht?',
          }
      : stats.scan_type === 'onboarding'
        ? {
            summaryTone: 'blue' as const,
            summarySignalLabel: 'Onboardingsignaal',
            summaryContextLabel: 'Checkpoint-read · enkel meetmoment',
            summaryContextTone: 'blue' as const,
            summaryLeadTitle: 'Eerste bestuurlijke leesrichting',
            summaryLeadDescription:
              'Lees onboarding eerst als vroege lifecycle-read: welke succesvoorwaarden vallen op, welke frictie is nu zichtbaar en welke beperkte correctie hoort bij dit checkpoint.',
            summaryCardEyebrow: 'Checkpointspoor',
            promotedSummaryCards: 2,
            driverTitle: 'Onboardingsignaal en checkpointcontext',
            driverDescription:
              'Gebruik deze laag om het actuele checkpointbeeld gecontroleerd te verdiepen zonder onboarding te verwarren met client onboarding of een volledige 30-60-90-journey.',
            driverIntro:
              'Start bij de checkpointread en gebruik daarna pas factoren, signaalverdeling en basisbehoeften om te bepalen welke vroege factor nu eerst aandacht vraagt.',
            driverAsideLabel: hasEnoughData ? 'Checkpoint read live' : 'Wacht op meer data',
            driverAsideTone: hasEnoughData ? ('blue' as const) : ('amber' as const),
            driverTabOrder: ['signalen', 'factoren', 'aanvullend', 'trend'],
            signalTabLabel: 'Checkpointbeeld',
            signalTabTitle: 'Onboardingsignaal op groepsniveau',
            signalTabDescription:
              'Laat zien hoe breed en hoe scherp het huidige checkpointsignaal zich over de groep verdeelt zonder dit als journey- of retentieclaim te lezen.',
            factorTabLabel: 'Checkpointdrivers',
            factorTabTitle: 'Werkfactoren achter vroege frictie',
            factorTabDescription:
              'Gebruik de scherpste werkfactoren als eerste managementspoor om te bepalen waar nieuwe instroom nu meer steun, duidelijkheid of inbedding nodig heeft.',
            supplementalTabLabel: 'SDT-basis',
            supplementalTitle: 'Werkbeleving en SDT-basis',
            supplementalDescription:
              'Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het huidige onboardingcheckpoint liggen en welke vroege context daardoor meer spanning laat zien.',
            actionTitle: 'Waar eerst op handelen',
            focusQuestionTitle: 'Prioritaire checkpointvragen',
            focusQuestionDescription:
              'Start met de factoren die het checkpointbeeld het scherpst kleuren en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat een correctieroute wordt gekozen.',
            playbookTitle: 'Checkpointplaybooks en eerste correctie',
            playbookDescription:
              'Deze playbooks vormen de uitvoerlaag onder de gekozen correctieroute. Ze helpen van verificatie naar een beperkte eerste correctie en een logisch volgend checkpoint te gaan.',
            routeTitle: 'Van onboardingread naar managementroute',
            routeDescription:
              'Deze laag brengt eerste managementgebruik, de gekozen correctie en het logische vervolgmoment samen zonder onboarding te verwarren met een brede lifecycle-suite.',
            routeBadgeLabel: 'Checkpointroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijft een later checkpoint logisch, vraagt deze instroomfrictie eerst extra verificatie of hoort de vraag thuis in een andere productvorm?',
          }
      : stats.scan_type === 'leadership'
        ? {
            summaryTone: 'blue' as const,
            summarySignalLabel: 'Leadershipsignaal',
            summaryContextLabel: 'Managementread · group-level only',
            summaryContextTone: 'blue' as const,
            summaryLeadTitle: 'Eerste bestuurlijke leesrichting',
            summaryLeadDescription:
              'Lees Leadership Scan eerst als geaggregeerde managementcontext-read: welke leiderschaps- of prioriteringsfactor valt op, welke context vraagt nu duiding en welke kleine managementstap hoort daar logisch bij.',
            summaryCardEyebrow: 'Managementspoor',
            promotedSummaryCards: 2,
            driverTitle: 'Leadershipsignaal en managementcontext',
            driverDescription:
              'Gebruik deze laag om het actuele leadershipbeeld gecontroleerd te verdiepen zonder Leadership Scan te verwarren met TeamScan, segment deep dive of een named leader view.',
            driverIntro:
              'Start bij de managementread en gebruik daarna pas factoren, signaalverdeling en basisbehoeften om te bepalen welke context eerst duiding verdient.',
            driverAsideLabel: hasEnoughData ? 'Managementread live' : 'Wacht op meer data',
            driverAsideTone: hasEnoughData ? ('blue' as const) : ('amber' as const),
            driverTabOrder: ['signalen', 'factoren', 'aanvullend', 'trend'],
            signalTabLabel: 'Managementbeeld',
            signalTabTitle: 'Leadershipsignaal op groepsniveau',
            signalTabDescription:
              'Laat zien hoe breed en hoe scherp het huidige managementcontextsignaal zich over de groep verdeelt zonder dit te lezen als named leader of performanceclaim.',
            factorTabLabel: 'Managementdrivers',
            factorTabTitle: 'Werkfactoren achter managementfrictie',
            factorTabDescription:
              'Gebruik de scherpste werkfactoren als eerste managementspoor om te bepalen waar de huidige aansturing of prioritering eerst duiding vraagt.',
            supplementalTabLabel: 'SDT-basis',
            supplementalTitle: 'Werkbeleving en SDT-basis',
            supplementalDescription:
              'Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het huidige leadershipsignaal liggen en welke managementcontext daardoor meer spanning laat zien.',
            actionTitle: 'Waar eerst op handelen',
            focusQuestionTitle: 'Prioritaire managementvragen',
            focusQuestionDescription:
              'Start met de factoren die het leadershipbeeld het scherpst kleuren en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat een managementroute wordt gekozen.',
            playbookTitle: 'Managementplaybooks en eerste verificatie',
            playbookDescription:
              'Deze playbooks vormen de uitvoerlaag onder de gekozen managementroute. Ze helpen van duiding naar een begrensde eerste stap te gaan zonder named leader output te openen.',
            routeTitle: 'Van Leadership Scan naar managementroute',
            routeDescription:
              'Deze laag brengt eerste managementgebruik, de gekozen verificatie of correctie en het logische reviewmoment samen zonder Leadership Scan te verwarren met een hierarchy- of 360-suite.',
            routeBadgeLabel: 'Managementroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijft een begrensde managementroute logisch, vraagt de vraag toch bredere diagnose of hoort Leadership Scan juist niet verder op te schalen binnen deze context?',
          }
      : stats.scan_type === 'exit'
        ? {
            summaryTone: 'blue' as const,
            summarySignalLabel: 'Vertreksignaal',
            summaryContextLabel: 'Vertrekbeeld · beinvloedbare frictie',
            summaryContextTone: 'blue' as const,
            summaryLeadTitle: 'Eerste bestuurlijke leesrichting',
            summaryLeadDescription:
              'Lees ExitScan eerst als vertrekduiding: wat keert terug, welke werkfrictie lijkt beinvloedbaar en welk managementspoor moet nu als eerste gekozen worden.',
            summaryCardEyebrow: 'Vertrekspoor',
            promotedSummaryCards: 2,
            driverTitle: 'Kernsignalen en vertrekbeeld',
            driverDescription:
              'Start bij de scherpste werkfactoren en gebruik daarna pas signaalverdeling en aanvullende lagen om het vertrekbeeld verder te onderbouwen.',
            driverIntro:
              'Begin met de factoren die het vertrekverhaal het meest kleuren. Gebruik signaalverdeling en SDT daarna om het managementgesprek scherper en concreter te maken.',
            driverAsideLabel: hasEnoughData ? 'Vertrekdrivers live' : 'Wacht op meer data',
            driverAsideTone: hasEnoughData ? ('blue' as const) : ('amber' as const),
            driverTabOrder: ['factoren', 'signalen', 'aanvullend', 'trend'],
            signalTabLabel: 'Vertrekbeeld',
            signalTabTitle: 'Vertrekbeeld en spreiding',
            signalTabDescription:
              'Laat zien hoe breed en hoe scherp het vertrekbeeld zich over de groep verdeelt, zodat je factoren en vertrekduiding in context kunt lezen.',
            factorTabLabel: 'Vertrekdrivers',
            factorTabTitle: 'Werkfactoren achter vertrek',
            factorTabDescription:
              'Gebruik de scherpste werkfactoren als eerste managementspoor om te bepalen waar vertrek vooral beinvloedbare frictie raakt.',
            supplementalTabLabel: 'SDT-basis',
            supplementalTitle: 'Werkbeleving en SDT-basis',
            supplementalDescription:
              'Deze laag laat zien hoe autonomie, competentie en verbondenheid onder het vertrekbeeld liggen en waar vervolgvragen het meeste opleveren.',
            actionTitle: 'Waar eerst op handelen',
            focusQuestionTitle: 'Prioritaire focusvragen',
            focusQuestionDescription:
              'Start met de factoren die het vertrekbeeld het scherpst kleuren en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat de eerste route wordt gekozen.',
            playbookTitle: 'Besluit- en eigenaarschapsroutes',
            playbookDescription:
              'Deze playbooks vormen de uitvoerlaag onder de gekozen managementroute. Ze helpen van vertrekduiding naar uitvoering te gaan zonder nieuwe prioriteiten buiten het gekozen spoor te openen.',
            routeTitle: 'Van vertrekduiding naar managementroute',
            routeDescription:
              'Deze laag bundelt de gekozen managementroute, eerste eigenaar, eerste stap en het logische reviewmoment zonder de kernflow bovenin te verstoren.',
            routeBadgeLabel: 'Vertrekroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijf je op hetzelfde vertrekspoor, vraagt deze scan verdere verdieping of wordt een tweede product logisch op basis van de eerste managementwaarde?',
          }
        : {
            summaryTone: 'blue' as const,
            summarySignalLabel: 'Pulsesignaal',
            summaryContextLabel: 'Reviewlaag · bounded repeat motion',
            summaryContextTone: 'blue' as const,
            summaryLeadTitle: 'Eerste bestuurlijke leesrichting',
            summaryLeadDescription:
              'Gebruik deze eerste laag om het primaire managementsignaal en het eerste werkspoor snel scherp te krijgen, voordat een route, eigenaar en hercheckmoment worden gekozen.',
            summaryCardEyebrow: 'Pulse handoff',
            promotedSummaryCards: 2,
            driverTitle: 'Pulse snapshot en reviewdelta',
            driverDescription:
              'Gebruik deze laag om het actuele Pulse-beeld gecontroleerd te verdiepen zonder de managementhoofdlijn kwijt te raken.',
            driverIntro:
              'Gebruik de tabs hieronder om tussen snapshot, factoren, aanvullende lagen en reviewdelta te wisselen zonder de hoofdlijn van de managementread kwijt te raken.',
            driverAsideLabel: hasEnoughData ? 'Pulse read live' : 'Wacht op meer data',
            driverAsideTone: hasEnoughData ? ('blue' as const) : ('amber' as const),
            driverTabOrder: ['signalen', 'factoren', 'aanvullend', 'trend'],
            signalTabLabel: 'Signaalverdeling',
            signalTabTitle: 'Signaalverdeling',
            signalTabDescription: 'Laat zien hoe breed en hoe scherp de signalen zich over de groep verdelen op dit meetmoment.',
            factorTabLabel: 'Factoren',
            factorTabTitle: 'Organisatiefactoren',
            factorTabDescription:
              'De factoren hieronder helpen bepalen waar managementgesprekken en kleine correcties nu het meeste opleveren.',
            supplementalTabLabel: 'SDT-basis',
            supplementalTitle: 'SDT basisbehoeften',
            supplementalDescription:
              'Deze laag laat zien hoe de fundamentele werkbeleving onder de actuele Pulse-signalen mee beweegt.',
            actionTitle: 'Prioriteiten en route-uitvoer',
            focusQuestionTitle: 'Prioritaire focusvragen',
            focusQuestionDescription:
              'Start met de factoren die het scherpst afwijken en gebruik de vragen om te bepalen wat eerst getoetst moet worden voordat een bounded route wordt gekozen.',
            playbookTitle: 'Pulse playbooks en eerstvolgende correctie',
            playbookDescription:
              'Deze playbooks vormen de uitvoerlaag onder de gekozen bounded route. Ze helpen van verificatie naar correctie en een logisch hercheckmoment te gaan.',
            routeTitle: 'Van Pulse read naar bounded repeat motion',
            routeDescription:
              'Deze laag brengt eerste managementgebruik, de gekozen correctie en het logische volgende meetmoment samen zonder Pulse te verwarren met een brede diagnose- of rapportroute.',
            routeBadgeLabel: 'Pulse route',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: doe je nog een bounded Pulse, verdiep je eerst de vraag verder of vraagt het thema nu een andere productvorm?',
          }
  const summaryItems: Array<{
    label: string
    value: string
    tone?: 'slate' | 'blue' | 'emerald' | 'amber'
  }> = [
    {
      label: 'Scan',
      value: scanDefinition.productName,
      tone: stats.scan_type === 'retention' ? 'emerald' : 'blue',
    },
    {
      label: productExperience.summarySignalLabel,
      value: averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : 'Nog geen veilig beeld',
      tone: averageRiskScore !== null ? (stats.scan_type === 'retention' ? 'emerald' : 'blue') : 'amber',
    },
    {
      label: 'Responsstatus',
      value: `${stats.total_completed}/${stats.total_invited || 0} ingevuld`,
      tone: hasEnoughData ? 'emerald' : 'amber',
    },
    { label: 'Readiness', value: readinessLabel, tone: hasEnoughData ? 'blue' : 'amber' },
  ]
  const sectionAnchors = [
    { id: 'samenvatting', label: 'Samenvatting' },
    {
      id: 'handoff',
      label: stats.scan_type === 'retention' ? 'Behoudsread' : stats.scan_type === 'team' ? 'Lokale read' : 'Handoff',
    },
    {
      id: 'drivers',
      label: stats.scan_type === 'retention' ? 'Signalen' : stats.scan_type === 'team' ? 'Lokaal' : 'Drivers',
    },
    {
      id: 'acties',
      label: stats.scan_type === 'retention' ? 'Behoudsacties' : stats.scan_type === 'team' ? 'Lokale acties' : 'Acties',
    },
    {
      id: 'route',
      label: stats.scan_type === 'retention' ? 'Behoudsroute' : stats.scan_type === 'team' ? 'Lokale route' : 'Route',
    },
    { id: 'methodiek', label: 'Methodiek' },
    { id: 'operatie', label: 'Operatie' },
  ]
  const utilitySectionVisible = canManageCampaign || respondents.length > 0 || isVerisightAdmin
  const promotedSummaryCards =
    productExperience.promotedSummaryCards > 0
      ? dashboardViewModel.topSummaryCards.slice(0, productExperience.promotedSummaryCards)
      : []
  const handoffSummaryCards =
    productExperience.promotedSummaryCards > 0
      ? dashboardViewModel.topSummaryCards.slice(productExperience.promotedSummaryCards)
      : dashboardViewModel.topSummaryCards
  const availableDriverTabs = hasEnoughData
    ? [
        ...(
          stats.scan_type === 'team' && teamLocalRead
            ? [
                {
                  id: 'lokaal',
                  label: 'Lokale read',
                  content: (
                    <div className="space-y-5">
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-sm font-semibold text-slate-950">{teamLocalRead.summaryTitle}</h3>
                          <DashboardChip label={`${teamLocalRead.coverageCount}/${teamLocalRead.totalResponses} met afdeling`} tone="slate" />
                          <DashboardChip
                            label={
                              teamLocalRead.status === 'ready'
                                ? `${teamLocalRead.safeGroupCount} veilige afdelingen`
                                : 'Fallback actief'
                            }
                            tone={teamLocalRead.status === 'ready' ? 'emerald' : 'amber'}
                          />
                          <DashboardChip
                            label={
                              teamPriorityRead?.status === 'ready'
                                ? `Meenemen in verificatie: ${teamPriorityRead.firstPriorityLabel}`
                                : teamPriorityRead?.status === 'no_hard_order'
                                  ? 'Nog geen harde volgorde'
                                  : 'Prioriteit nog niet vrijgegeven'
                            }
                            tone={teamPriorityRead?.status === 'ready' ? 'amber' : 'blue'}
                          />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {teamPriorityRead?.summaryBody ?? teamLocalRead.summaryBody}
                        </p>
                        <p className="mt-3 text-xs leading-6 text-slate-500">
                          {teamPriorityRead?.caution ?? teamLocalRead.caution}
                        </p>
                      </div>

                      {teamLocalRead.status === 'ready' && teamPriorityRead ? (
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
                          TeamScan blijft in deze situatie bewust op organisatieniveau. Zodra genoeg afdelingsmetadata en veilige groepsgroottes beschikbaar zijn, verschijnt de lokale read hier.
                        </div>
                      )}
                    </div>
                  ),
                },
              ]
            : []
        ),
        {
          id: 'signalen',
          label: productExperience.signalTabLabel,
          content: (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-950">{productExperience.signalTabTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {productExperience.signalTabDescription}
              </p>
              <div className="mt-4">
                <RiskCharts
                  distribution={riskDistribution}
                  histogramBins={riskHistogram}
                  averageScore={averageRiskScore}
                  scanType={stats.scan_type}
                />
              </div>
            </div>
          ),
        },
        {
          id: 'factoren',
          label: productExperience.factorTabLabel,
          content: (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-950">{productExperience.factorTabTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {productExperience.factorTabDescription}
              </p>
              <div className="mt-4">
                <FactorTable factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
              </div>
            </div>
          ),
        },
        {
          id: 'aanvullend',
          label: productExperience.supplementalTabLabel,
          content: (
            <div className="space-y-5">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-950">{productExperience.supplementalTitle}</h3>
                  <DashboardChip label="Autonomie · Competentie · Verbondenheid" tone="slate" />
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {productExperience.supplementalDescription}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {(['autonomy', 'competence', 'relatedness'] as const).map((dimension) => (
                    <SdtGauge
                      key={dimension}
                      label={FACTOR_LABELS[dimension]}
                      score={factorData.sdtAverages[dimension] ?? 5.5}
                    />
                  ))}
                </div>
              </div>

              {stats.scan_type === 'retention' && retentionThemes.length > 0 ? (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-950">Open signalen op groepsniveau</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Geclusterd zodat open antwoorden als managementsignaal gelezen kunnen worden, niet als losse klachtenlijst.
                  </p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {retentionThemes.map((theme) => (
                      <div key={theme.key} className="rounded-[20px] border border-white/80 bg-white/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">{theme.title}</p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                            {theme.count}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-700">{theme.implication}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Voorbeeldsignaal
                        </p>
                        <p className="mt-1 text-sm italic leading-6 text-slate-600">&quot;{theme.sample}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ),
        },
        ...(
          stats.scan_type === 'retention' &&
          previousStats &&
          currentRetentionSignals &&
          previousRetentionSignals
            ? [
                {
                  id: 'trend',
                  label: 'Trend',
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
            : stats.scan_type === 'pulse' &&
                previousStats &&
                pulseComparison &&
                pulseComparison.status !== 'no_previous'
              ? [
                  {
                    id: 'trend',
                    label: 'Reviewdelta',
                    content: (
                      <PulseTrendSection
                        comparison={pulseComparison}
                        previousDate={previousStats.created_at}
                        previousCampaignName={previousStats.campaign_name}
                      />
                    ),
                  },
                ]
              : []
        ),
      ]
    : []
  const driverTabs = hasEnoughData
    ? productExperience.driverTabOrder.flatMap((tabId) =>
        availableDriverTabs.filter((tab) => tab.id === tabId),
      )
    : []

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        ← Terug naar campaignoverzicht
      </Link>

      <div id="samenvatting" className="scroll-mt-36 space-y-4">
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
          tone={stats.scan_type === 'retention' ? 'emerald' : 'blue'}
          meta={
            <>
              <DashboardChip
                label={stats.is_active ? 'Actief' : 'Gesloten'}
                tone={stats.is_active ? 'emerald' : 'slate'}
              />
              <DashboardChip label={`${stats.completion_rate_pct ?? 0}% respons`} tone="slate" />
              <DashboardChip
                label={
                  hasEnoughData
                    ? 'Beslisniveau bereikt'
                    : hasMinDisplay
                      ? 'Indicatief beeld'
                      : 'Nog onvoldoende responses'
                }
                tone={hasEnoughData ? 'blue' : 'amber'}
              />
              <DashboardChip
                label={getDeliveryModeLabel(campaignMeta?.delivery_mode ?? null, stats.scan_type)}
                tone="slate"
              />
            </>
          }
          actions={
            stats.scan_type === 'pulse' || stats.scan_type === 'team' || stats.scan_type === 'onboarding' || stats.scan_type === 'leadership' ? (
              <>
                {!profile?.is_verisight_admin ? <OnboardingAdvancer fromStep={1} /> : null}
                <div className="rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57]">
                  {stats.scan_type === 'pulse'
                    ? 'Pulse: management handoff live'
                    : stats.scan_type === 'team'
                      ? 'TeamScan: lokale read live'
                      : stats.scan_type === 'onboarding'
                        ? 'Onboarding: checkpoint read live'
                        : 'Leadership Scan: management read live'}
                </div>
              </>
            ) : (
              <>
                {!profile?.is_verisight_admin ? <OnboardingAdvancer fromStep={1} /> : null}
                <div className="relative">
                  {!profile?.is_verisight_admin ? (
                    <OnboardingBalloon step={2} label="Download hier je rapport" align="left" />
                  ) : null}
                  <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
                </div>
              </>
            )
          }
          aside={
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <DashboardKeyValue label="Respons" value={`${stats.completion_rate_pct ?? 0}%`} />
                <DashboardKeyValue label="Uitnodigingen" value={`${stats.total_invited}`} />
                <DashboardKeyValue label="Ingevuld" value={`${stats.total_completed}`} />
                <DashboardKeyValue
                  label={`Gem. ${scanDefinition.signalLabelLower}`}
                  value={averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : '-'}
                  accent={averageRiskScore !== null ? 'text-blue-700' : undefined}
                  helpText={scanDefinition.signalHelp}
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Campagnestatus</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {`${stats.total_completed}/${stats.total_invited || 0} ingevuld`}.{' '}
                  {pendingCount > 0
                    ? `${pendingCount} respondent(en) zijn nog niet afgerond.`
                    : 'Alle uitgenodigde respondenten hebben afgerond.'}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Route: {getDeliveryModeLabel(campaignMeta?.delivery_mode ?? null, stats.scan_type)}.
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
            className={`rounded-2xl border px-4 py-3 text-sm ${
              notice.tone === 'amber'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : notice.tone === 'red'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-blue-100 bg-blue-50 text-blue-900'
            }`}
          >
            <p className="font-semibold">{notice.title}</p>
            <p className="mt-1 leading-6">{notice.body}</p>
          </div>
        ))}
      </div>

      <DashboardSummaryBar
        items={summaryItems}
        anchors={sectionAnchors}
        actions={
          stats.scan_type === 'pulse' || stats.scan_type === 'team' || stats.scan_type === 'onboarding' || stats.scan_type === 'leadership' ? (
            <div className="rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57]">
              {stats.scan_type === 'pulse'
                ? 'Pulse: management handoff live'
                : stats.scan_type === 'team'
                  ? 'TeamScan: lokale read live'
                  : stats.scan_type === 'onboarding'
                    ? 'Onboarding: checkpoint read live'
                    : 'Leadership Scan: management read live'}
            </div>
          ) : (
            <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
          )
        }
      />

      {promotedSummaryCards.length > 0 ? (
        <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4 shadow-[0_12px_30px_rgba(19,32,51,0.05)] sm:p-5">
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
                key={`${card.title}-${card.value ?? 'summary'}`}
                eyebrow={productExperience.summaryCardEyebrow}
                title={card.title}
                value={card.value}
                body={card.body}
                tone={card.tone}
              />
            ))}
          </div>
        </div>
      ) : null}

      <DashboardSection
        id="handoff"
        eyebrow="Bestuurlijke handoff"
        title={handoffTitle}
        description={handoffDescription}
        aside={<DashboardChip label={readinessLabel} tone={hasEnoughData ? 'blue' : 'amber'} />}
        tone="blue"
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
                  key={`${card.title}-${card.value ?? 'card'}`}
                  eyebrow={productExperience.summaryCardEyebrow}
                  title={card.title}
                  value={card.value}
                  body={card.body}
                  tone={card.tone}
                />
              ))}
            </div>

            <div className="grid gap-4">
              <DashboardPanel
                eyebrow="Eerste managementvraag"
                title={dashboardViewModel.primaryQuestion.title}
                body={dashboardViewModel.primaryQuestion.body}
                tone={dashboardViewModel.primaryQuestion.tone}
              />
              <DashboardPanel
                eyebrow="Logische vervolgstap"
                title={dashboardViewModel.nextStep.title}
                body={dashboardViewModel.nextStep.body}
                tone={dashboardViewModel.nextStep.tone}
              />
            </div>
          </div>

          {stats.scan_type === 'team' && hasEnoughData ? (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-950">Lokale managementhandoff</h3>
                <DashboardChip
                  label={primaryTeamPriority ? `Eerst: ${primaryTeamPriority.label}` : 'Bounded handoff'}
                  tone={primaryTeamPriority ? 'amber' : 'blue'}
                />
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {primaryTeamPriority && primaryTeamPlaybook
                ? `Gebruik deze TeamScan nu als compacte handoff: ${primaryTeamPriority.label} vraagt eerst verificatie op ${primaryTeamPriority.topFactorLabel.toLowerCase()}, daarna kies je bewust wie de eerste lokale stap trekt en hoe begrensd de review blijft.`
                  : 'TeamScan geeft al wel lokale richting, maar houdt de handoff hier bewust bounded zolang er nog geen eerlijke eerste prioriteit kan worden vrijgegeven.'}
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-4">
                <DashboardPanel
                  eyebrow="Afdeling"
                  title={primaryTeamPriority?.label ?? 'Nog niet vrijgegeven'}
                  value={primaryTeamPriority?.priorityTitle}
                  body={
                    primaryTeamPriority
                      ? `${primaryTeamPriority.topFactorLabel} is hier nu het scherpste lokale spoor.`
                      : 'Gebruik meerdere zichtbare afdelingen voorlopig als gespreksinput zonder geforceerde top-1.'
                  }
                  tone={primaryTeamPriority ? 'amber' : 'blue'}
                />
                <DashboardPanel
                  eyebrow="Eerste eigenaar"
                  title={primaryTeamPlaybook?.owner ?? 'HR + afdelingsleider'}
                  body="Maak expliciet wie de eerste lokale managementhuddle trekt en wie de vervolgstap terugbrengt in de review."
                  tone="emerald"
                />
                <DashboardPanel
                  eyebrow="Begrensde eerste actie"
                  title={primaryTeamPlaybook?.actions[0] ?? 'Kies eerst een kleine lokale check'}
                  body={
                    primaryTeamPlaybook?.decision ??
                    'TeamScan blijft hier gericht op een kleine lokale verificatie of correctie, niet op een brede interventie.'
                  }
                  tone="blue"
                />
                <DashboardPanel
                  eyebrow="Reviewgrens"
                  title={primaryTeamPlaybook?.review ?? 'Lokale hercheck eerst'}
                  body="Gebruik het reviewmoment om bewust te kiezen: nog een lokale vervolgstap, terug naar bredere diagnose of juist stoppen met verder lokaliseren."
                  tone="amber"
                />
              </div>
            </div>
          ) : null}

          {dashboardViewModel.profileCards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dashboardViewModel.profileCards.map((card) => (
                <DashboardPanel
                  key={`${card.title}-${card.value ?? 'profile'}`}
                  eyebrow={card.title}
                  title={card.value || card.title}
                  body={card.body}
                  tone={card.tone}
                />
              ))}
            </div>
          ) : null}

          {dashboardViewModel.managementBlocks.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {dashboardViewModel.managementBlocks.map((block) => (
                <div
                  key={block.title}
                  className={`rounded-[22px] border p-4 ${
                    block.tone === 'emerald'
                      ? 'border-[#d2e6e0] bg-[#eef7f4]'
                      : block.tone === 'amber'
                        ? 'border-[#eadfbe] bg-[#faf6ea]'
                        : 'border-[#d6e4e8] bg-[#f3f8f8]'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                      block.tone === 'emerald'
                        ? 'text-[#3C8D8A]'
                        : block.tone === 'amber'
                          ? 'text-[#8C6B1F]'
                          : 'text-[#234B57]'
                    }`}
                  >
                    {block.title}
                  </p>
                  {block.intro ? <p className="mt-3 text-sm leading-6 text-slate-700">{block.intro}</p> : null}
                  <ul className="mt-3 space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                        <span className="text-slate-400">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </DashboardSection>

      <DashboardSection
        id="drivers"
        eyebrow="Wat drijft dit beeld?"
        title={productExperience.driverTitle}
        description={productExperience.driverDescription}
        aside={<DashboardChip label={productExperience.driverAsideLabel} tone={productExperience.driverAsideTone} />}
      >
        {hasEnoughData ? (
          <div className="space-y-5">
            <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-4 text-sm leading-6 text-[color:var(--text)]">
              {productExperience.driverIntro}
            </div>
            <DashboardTabs tabs={driverTabs} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Verdiepende analyse wordt zichtbaar vanaf {MIN_N_PATTERNS} ingevulde responses. Tot die tijd blijft het dashboard bewust compact en voorzichtig.
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        id="acties"
        eyebrow="Waar eerst op handelen"
        title={productExperience.actionTitle}
        description={dashboardViewModel.focusSectionIntro}
        aside={<DashboardChip label={focusBadgeLabel} tone="emerald" />}
        tone="emerald"
      >
        {hasEnoughData ? (
          <div className="space-y-5">
            {stats.scan_type === 'team' && teamPriorityRead ? (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-950">
                  {teamPriorityRead.status === 'ready'
                    ? 'Eerste lokale verificatie en handoff'
                    : 'Lokale prioriteit blijft bounded'}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{teamPriorityRead.summaryBody}</p>
                {primaryTeamPriority && primaryTeamPlaybook ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    <DashboardPanel
                      eyebrow="Afdeling eerst"
                      title={primaryTeamPriority.label}
                      value={primaryTeamPriority.priorityTitle}
                      body={`${primaryTeamPriority.topFactorLabel} is hier nu het scherpste lokale spoor. Gebruik deze afdeling als eerste bounded managementcheck, niet als definitieve eindconclusie.`}
                      tone="amber"
                    />
                    <DashboardPanel
                      eyebrow="Eerste eigenaar"
                      title={primaryTeamPlaybook.owner}
                      body="Deze combinatie trekt de eerste lokale check en bewaakt tegelijk dat TeamScan bounded blijft."
                      tone="blue"
                    />
                    <DashboardPanel
                      eyebrow="Eerste bounded check"
                      title={primaryTeamPlaybook.validate}
                      body={
                        primaryTeamQuestions[0] ??
                        'Gebruik het eerstvolgende afdelingsgesprek om dit lokale spoor expliciet te verifieren.'
                      }
                      tone="emerald"
                    />
                    <DashboardPanel
                      eyebrow="Reviewgrens"
                      title={primaryTeamPlaybook.actions[0] ?? primaryTeamPlaybook.title}
                      body={
                        primaryTeamPlaybook.review ??
                        'Leg direct vast wanneer deze lokale check opnieuw wordt gelezen en of TeamScan daarna nog een tweede bounded stap nodig heeft.'
                      }
                      tone="blue"
                    />
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                    TeamScan toont hier bewust nog geen harde eerste volgorde. Gebruik de lokale read om meerdere afdelingen te bespreken, een eigenaar te benoemen en pas na de eerste bounded check te bepalen of een hardere volgorde nodig is.
                  </div>
                )}
              </div>
            ) : null}

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-950">{productExperience.focusQuestionTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {productExperience.focusQuestionDescription}
              </p>
              <div className="mt-4">
                <RecommendationList
                  factorAverages={factorData.orgAverages}
                  scanType={stats.scan_type}
                  bandOverride={
                    stats.scan_type === 'onboarding' || stats.scan_type === 'leadership'
                      ? dashboardViewModel.managementBandOverride
                      : undefined
                  }
                />
              </div>
            </div>

            {stats.scan_type === 'retention' || stats.scan_type === 'exit' || stats.scan_type === 'pulse' || stats.scan_type === 'team' || stats.scan_type === 'onboarding' || stats.scan_type === 'leadership' ? (
              <>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-950">{productExperience.playbookTitle}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {productExperience.playbookDescription}
                  </p>
                  {stats.scan_type === 'retention' && playbookCalibrationNote ? (
                    <p className="mt-2 text-xs leading-6 text-slate-500">{playbookCalibrationNote}</p>
                  ) : null}
                  <div className="mt-4">
                    <ActionPlaybookList
                      factorAverages={factorData.orgAverages}
                      scanType={stats.scan_type}
                      bandOverride={
                        stats.scan_type === 'onboarding' || stats.scan_type === 'leadership'
                          ? dashboardViewModel.managementBandOverride
                          : undefined
                      }
                    />
                  </div>
                </div>

                {stats.scan_type === 'retention' && hasSegmentDeepDive ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-slate-950">Segment-specifieke playbooks</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Alleen zichtbaar als segmentvergelijking voldoende respons en metadata heeft.
                    </p>
                    <div className="mt-4">
                      {retentionSegmentPlaybooks.length > 0 ? (
                        <SegmentPlaybookList segments={retentionSegmentPlaybooks} />
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                          Nog geen segmenten met voldoende n en voldoende afwijking om apart te tonen.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Focusvragen en route-uitvoer worden betekenisvoller zodra het dashboard minstens {MIN_N_PATTERNS} responses heeft.
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        id="route"
        eyebrow="30–90 dagenroute"
        title={productExperience.routeTitle}
        description={productExperience.routeDescription}
        aside={<DashboardChip label={productExperience.routeBadgeLabel} tone="blue" />}
      >
        <div className="space-y-5">
          <ManagementReadGuide scanType={stats.scan_type} hasMinDisplay={hasMinDisplay} hasEnoughData={hasEnoughData} />

          {dashboardViewModel.followThroughCards.length > 0 ? (
            <DashboardTimeline
              title={dashboardViewModel.followThroughTitle}
              description={dashboardViewModel.followThroughIntro}
              items={dashboardViewModel.followThroughCards}
            />
          ) : null}

          <div className="rounded-[22px] border border-[#d6e4e8] bg-[#f3f8f8] p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-950">{productExperience.afterSessionTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {productExperience.afterSessionDescription}
            </p>
            {stats.scan_type === 'team' ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <DashboardPanel
                  eyebrow="Als de lokale check bevestigt"
                  title="Blijf bounded op dezelfde route"
                  body="Doe alleen een volgende lokale check als route, lokale actie en reviewmoment uit deze TeamScan al expliciet zijn gemaakt."
                  tone="blue"
                />
                <DashboardPanel
                  eyebrow="Als de vraag breder wordt"
                  title="Ga terug naar bredere diagnose"
                  body="Schakel niet door naar extra lokalisatie als de echte vraag weer organisatieniveau, behoudsbeeld of bredere diagnose vraagt."
                  tone="amber"
                />
                <DashboardPanel
                  eyebrow="Als de onderbouwing te smal blijft"
                  title="Stop met verder lokaliseren"
                  body="Open geen extra TeamScan-verbreding zolang metadata, groepsgrootte of lokale bevestiging daar nog geen eerlijke basis voor geven."
                  tone="emerald"
                />
              </div>
            ) : null}
            {stats.scan_type === 'leadership' ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <DashboardPanel
                  eyebrow="Als de managementcheck bevestigt"
                  title="Blijf bounded op dezelfde route"
                  body="Doe alleen een volgende Leadership-check als eigenaar, kleine verificatie of correctie en reviewmoment uit deze managementread al expliciet zijn gemaakt."
                  tone="blue"
                />
                <DashboardPanel
                  eyebrow="Als de vraag breder wordt"
                  title="Ga terug naar bredere diagnose"
                  body="Schakel niet door naar extra Leadership-verbreding als de echte vraag weer lokale lokalisatie, bredere diagnose of een ander productspoor vraagt."
                  tone="amber"
                />
                <DashboardPanel
                  eyebrow="Als de onderbouwing te smal blijft"
                  title="Open geen named leaders of 360"
                  body="Maak Leadership Scan niet groter dan deze wave draagt zolang groepsniveau, suppressie en de huidige data nog geen eerlijke basis geven voor named leader of 360-output."
                  tone="emerald"
                />
              </div>
            ) : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lifecycleDecisionCards.map((card) => (
                <DashboardPanel
                  key={card.title}
                  eyebrow={card.fit}
                  title={card.title}
                  body={card.body}
                  tone="blue"
                />
              ))}
            </div>
          </div>
        </div>
      </DashboardSection>

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
          eyebrow="Utilitylaag"
          title="Operatie, respondenten en delivery"
          description="Alles onder deze lijn ondersteunt uitvoering en beheer. De managementhoofdlijn blijft hierboven compact en bestuurlijk."
          aside={<DashboardChip label="Admin en operations" tone="slate" />}
        >
          <div className="space-y-4">
            {canManageCampaign ? (
              <DashboardDisclosure
                defaultOpen={!hasEnoughData}
                title="Campagnestatus en launchcontrole"
                description="Gebruik deze laag voor lifecycle, readiness, handoff en foutopvang nadat het managementbeeld helder is."
                badge={<DashboardChip label={readinessState.launchReady ? 'Launch-ready' : 'Aandacht nodig'} tone={readinessState.launchReady ? 'emerald' : 'amber'} />}
              >
                <div className="space-y-4">
                  <CampaignActions
                    campaignId={id}
                    isActive={stats.is_active}
                    pendingCount={pendingCount}
                    canManageCampaign={canManageCampaign}
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
                    className={`rounded-[22px] border px-4 py-4 ${
                      readinessState.launchReady
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Implementation readiness</p>
                        <p className="mt-1 text-base font-semibold text-slate-950">{readinessState.headline}</p>
                      </div>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                        {readinessState.launchReady ? 'Launch-ready' : 'Nog niet launch-ready'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{readinessState.detail}</p>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-800">Volgende stap: {readinessState.nextStep}</p>
                  </div>
                  {stats.is_active ? (
                    <PreflightChecklist
                      campaignId={id}
                      scanType={stats.scan_type}
                      deliveryMode={campaignMeta?.delivery_mode ?? null}
                      totalInvited={stats.total_invited}
                      totalCompleted={stats.total_completed}
                      invitesNotSent={invitesNotSent}
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
                      learningCloseoutEvidenceCount={learningCloseoutEvidenceCount}
                      editable={isVerisightAdmin}
                    />
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                      Deze campagne is gesloten. Rapportage en dashboard blijven beschikbaar, maar respondenten kunnen niet meer invullen.
                    </div>
                  )}
                </div>
              </DashboardDisclosure>
            ) : null}

            <DashboardDisclosure
              defaultOpen={disclosureDefaults.respondentsOpen}
              title="Respondenten en uitnodigingen"
              description="Operationele detailweergave voor import, responsmonitoring en uitnodigingsbeheer."
              badge={<DashboardChip label={`${respondents.length} respondenten`} tone="slate" />}
            >
              {respondents.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-base font-semibold text-slate-900">Nog geen respondenten toegevoegd</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Voeg eerst respondenten toe via de setupflow. Daarna komen uitnodigingen, responsmonitoring en deze tabel automatisch beschikbaar.
                  </p>
                  {canManageCampaign ? (
                    <Link
                      href="/beheer"
                      className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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
                description="Gebruik de learning-workbench om buyer-signalen, implementationlessen, eerste managementread en de gekozen repeat- of expansionrichting expliciet vast te leggen voor deze campaign."
                badge={
                  <DashboardChip
                    label={
                      learningDossiers.length === 0
                        ? 'Nog geen dossier'
                        : learningCloseoutEvidenceCount > 0
                          ? `${learningCloseoutEvidenceCount} closeout-signaal`
                          : `${learningDossiers.length} gekoppeld, closeout open`
                    }
                    tone={learningDossiers.length > 0 && learningCloseoutEvidenceCount > 0 ? 'blue' : 'amber'}
                  />
                }
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(320px,0.9fr)]">
                  <DashboardPanel
                    eyebrow="Waarom nu"
                    title={learningDossiers.length > 0 ? 'Campaign is al opgenomen in de learninglus' : 'Koppel deze campaign aan een learningdossier'}
                    body={
                      learningDossiers.length > 0
                        ? 'Gebruik gekoppelde dossiers om implementationfrictie, launchsignalen, managementgebruik en gekozen vervolgroutes expliciet terug te laten landen in product, report, onboarding, sales en operations.'
                        : 'Zodra deze campaign leerwaarde geeft, koppel je hem aan een dossier in de learning-workbench. Zo blijven echte deliverylessen en vervolgkeuzes niet hangen in losse handover-notes.'
                    }
                    tone={learningDossiers.length > 0 ? 'blue' : 'amber'}
                  />
                  <DashboardPanel
                    eyebrow="Closeoutdiscipline"
                    title={
                      learningCloseoutEvidenceCount > 0
                        ? 'Learning kan naar formele closeout toewerken'
                        : learningDossiers.length > 0
                          ? 'Learning bestaat, maar closeout-evidence mist nog'
                          : 'Nog geen learning-closeout mogelijk'
                    }
                    body={
                      learningCloseoutEvidenceCount > 0
                        ? 'Er is al minstens één expliciete review-, vervolg- of stopuitkomst vastgelegd. Daarmee kan delivery later eerlijker naar follow-up of learning closeout bewegen.'
                        : learningDossiers.length > 0
                          ? 'Er zijn al gekoppelde dossiers, maar nog geen expliciete review-, vervolg- of stopuitkomst. Houd delivery dus bewust open tot die follow-through echt is vastgelegd.'
                          : 'Zonder gekoppeld learningdossier hoort delivery-closeout nog niet als afgerond te voelen.'
                    }
                    tone={learningCloseoutEvidenceCount > 0 ? 'emerald' : 'amber'}
                  />
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-sm font-semibold text-slate-950">Gekoppelde dossiers</p>
                    {learningDossiers.length === 0 ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Er is nog geen dossier gekoppeld aan deze campaign.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {learningDossiers.map((dossier) => (
                          <div key={dossier.id} className="rounded-2xl border border-white/80 bg-white px-4 py-3">
                            <p className="text-sm font-semibold text-slate-950">{dossier.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Status: {dossier.triage_status}. Laatst bijgewerkt: {new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Amsterdam' }).format(new Date(dossier.updated_at))}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/beheer/klantlearnings?campaign=${id}`}
                      className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                    >
                      Open learning-workbench
                    </Link>
                  </div>
                </div>
              </DashboardDisclosure>
            ) : null}
          </div>
        </DashboardSection>
      ) : null}    </div>
  )
}
