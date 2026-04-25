import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CampaignActions } from './campaign-actions'
import { buildCampaignAccessState, buildCampaignRouteUnavailableState } from './campaign-access'
import { PdfDownloadButton } from './pdf-download-button'
import {
  DashboardChip,
  DashboardContextHeader,
  DashboardDisclosure,
  DashboardHero,
  DashboardKeyValue,
  DashboardPanel,
  DashboardPrimaryNav,
  DashboardSection,
  DashboardTimeline,
} from '@/components/dashboard/dashboard-primitives'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { FactorTable } from '@/components/dashboard/factor-table'
import { ManagementReadGuide } from '@/components/dashboard/onboarding-panels'
import { OnboardingAdvancer } from '@/components/dashboard/onboarding-balloon'
import { PreflightChecklist } from '@/components/dashboard/preflight-checklist'
import { RespondentTable } from '@/components/dashboard/respondent-table'
import { RiskCharts } from '@/components/dashboard/risk-charts'
import { getContactRequestsForAdmin } from '@/lib/contact-requests'
import {
  ActionPlaybookList,
  buildActionExecutionCore,
  buildDriverDrilldownModel,
  buildDecisionPanels,
  buildEvidenceReadingFlow,
  buildHeroDescription,
  buildInsightWarnings,
  buildPulseComparisonState,
  buildResponseReadState,
  buildRetentionSegmentPlaybooks,
  buildRetentionTrendCards,
  buildRiskHistogram,
  buildSafeTableResponses,
  buildScoreInterpretationGuide,
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
} from './page-helpers'
import {
  buildDashboardArchitecture,
  buildDashboardVisibilityState,
  getScoreInterpretationTitle,
} from './dashboard-architecture'
import { buildCampaignReadinessState } from '@/lib/implementation-readiness'
import { getLifecycleDecisionCards } from '@/lib/client-onboarding'
import {
  buildFactorPresentation,
  getManagementBandBadgeClasses,
  getManagementBandLabel,
  getRiskBandFromScore,
} from '@/lib/management-language'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import { buildTeamLocalReadState, buildTeamPriorityReadState } from '@/lib/products/team'
import { getProductModule } from '@/lib/products/shared/registry'
import { getScanDefinition } from '@/lib/scan-definitions'
import { FACTOR_LABELS, hasCampaignAddOn } from '@/lib/types'
import type { CampaignStats, MemberRole, Respondent, SurveyResponse } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function CampaignPage({ params, searchParams }: Props) {
  const { id } = await params
  const resolvedSearchParams = (await searchParams) ?? {}
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle()
    : { data: null }
  const isVerisightAdmin = profile?.is_verisight_admin === true

  const { data: statsRow } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('campaign_id', id)
    .maybeSingle()

  if (!statsRow) {
    if (!(await campaignExists(id))) {
      notFound()
    }

    return (
      <CampaignRouteUnavailable
        state={buildCampaignRouteUnavailableState('missing_data')}
      />
    )
  }
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
    { data: membership },
    { data: campaignMeta },
    { data: organization },
    { count: activeClientAccessCount },
    { count: pendingClientInviteCount },
  ] = await Promise.all([
    user
      ? supabase
          .from('org_members')
          .select('role')
          .eq('org_id', stats.organization_id)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('campaigns').select('enabled_modules, delivery_mode').eq('id', id).maybeSingle(),
    supabase.from('organizations').select('name').eq('id', stats.organization_id).maybeSingle(),
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
  const accessState = buildCampaignAccessState({
    isVerisightAdmin,
    membershipRole: (membership?.role ?? null) as MemberRole | null,
  })

  if (!accessState.canRead) {
    return <CampaignRouteUnavailable state={buildCampaignRouteUnavailableState('denied')} />
  }

  const canManageCampaign = accessState.canManage
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
  const averageRiskScore = computeAverageSignalScore(responses)
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
  const handoffTitle =
    stats.scan_type === 'retention'
      ? 'Bestuurlijke handoff'
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
      ? 'Deze laag volgt dezelfde lijn als het rapport: waar staat behoud onder druk, waarom telt dat bestuurlijk en wat moet eerst geverifieerd worden.'
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
            'Lees RetentieScan eerst als groepssignaal: waar staat behoud onder druk, wat vraagt eerst verificatie en welk managementspoor moet daarna in Wat nu als eerste route worden gekozen.',
          summaryCardEyebrow: 'Behoudsspoor',
          promotedSummaryCards: 2,
          driverTitle: 'Signaalbeeld en behoudsdruk',
          driverDescription:
            'Start bij retentiesignaal, trend en aanvullende signalen. Gebruik factoren en segmenten daarna om te bepalen waarom dit beeld ontstaat en waar behoud eerst nadere toetsing vraagt.',
          driverIntro:
            'Begin met het groepssignaal en open pas daarna factoren, trend en aanvullende lagen. Zo blijft RetentieScan een verification-first managementinstrument in plaats van een losse analysetabel.',
          driverAsideLabel: hasEnoughData ? 'Behoudsdrivers beschikbaar' : 'Wacht op meer data',
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
          routeBadgeLabel: 'Kernroute',
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
            driverAsideLabel: hasEnoughData ? 'Lokale read beschikbaar' : 'Wacht op meer data',
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
            routeBadgeLabel: 'Bounded vervolgroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijft een lokale vervolgstap logisch, is bredere duiding weer nodig of vraagt dit signaal juist minder lokalisatie dan gedacht?',
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
            driverAsideLabel: hasEnoughData ? 'Checkpointread beschikbaar' : 'Wacht op meer data',
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
            routeBadgeLabel: 'Bounded vervolgroute',
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
            driverAsideLabel: hasEnoughData ? 'Managementread beschikbaar' : 'Wacht op meer data',
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
            routeBadgeLabel: 'Bounded vervolgroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijft een begrensde managementroute logisch, vraagt de vraag toch bredere duiding of hoort Leadership Scan juist niet verder op te schalen binnen deze context?',
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
            driverAsideLabel: hasEnoughData ? 'Vertrekdrivers beschikbaar' : 'Wacht op meer data',
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
            routeBadgeLabel: 'Kernroute',
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
            driverAsideLabel: hasEnoughData ? 'Pulse read beschikbaar' : 'Wacht op meer data',
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
              'Deze laag brengt eerste managementgebruik, de gekozen correctie en het logische volgende meetmoment samen zonder Pulse te verwarren met een bredere kernroute of hoofdrapport.',
            routeBadgeLabel: 'Bounded vervolgroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: doe je nog een bounded Pulse, verdiep je eerst de vraag verder of vraagt het thema nu een andere productvorm?',
          }
  const architecture = buildDashboardArchitecture({
    scanType: stats.scan_type,
    canManageCampaign,
    hasSegmentDeepDive,
  })
  const visibility = buildDashboardVisibilityState({
    scanType: stats.scan_type,
    hasMinDisplay,
    hasEnoughData,
    hasSegmentDeepDive,
    canManageCampaign,
    respondentsCount: respondents.length,
    isArchivedPeriod: !stats.is_active,
  })
  const requestedView = getSingleSearchParam(resolvedSearchParams.view)
  const currentView = isDashboardView(requestedView) ? requestedView : 'overview'
  const selectedDriverKey = getSingleSearchParam(resolvedSearchParams.driver)
  const driverDrilldown = buildDriverDrilldownModel({
    factorAverages: factorData.orgAverages,
    selectedFactorKey: selectedDriverKey,
  })
  const selectedDriverBand =
    typeof driverDrilldown.selectedFactor?.signalValue === 'number'
      ? getRiskBandFromScore(driverDrilldown.selectedFactor.signalValue)
      : null
  const selectedDriverPresentation =
    driverDrilldown.selectedFactor && selectedDriverBand
      ? buildFactorPresentation({
          score: driverDrilldown.selectedFactor.score,
          signalScore: driverDrilldown.selectedFactor.signalValue,
        })
      : null
  const selectedDriverQuestions =
    driverDrilldown.selectedFactor && selectedDriverBand
      ? productModule.getFocusQuestions()[driverDrilldown.selectedFactor.factorKey]?.[selectedDriverBand] ?? []
      : []
  const selectedDriverPlaybook =
    driverDrilldown.selectedFactor && selectedDriverBand
      ? productModule.getActionPlaybooks()[driverDrilldown.selectedFactor.factorKey]?.[selectedDriverBand] ?? null
      : null
  const primaryNavItems = architecture.primaryViews.map((view) => ({
    href: buildDashboardViewHref(view.id, currentView === 'overview' ? driverDrilldown.selectedFactorKey : null),
    label: view.label,
    active: currentView === view.id,
  }))
  const responseRead = buildResponseReadState({
    totalInvited: stats.total_invited,
    totalCompleted: stats.total_completed,
    completionRate: stats.completion_rate_pct ?? 0,
    pendingCount,
    hasMinDisplay,
    hasEnoughData,
    isActive: stats.is_active,
  })
  const highlightedActionRows = driverDrilldown.highlightedFactors
    .map((factor) => {
      const band = getRiskBandFromScore(factor.signalValue)
      const playbook = productModule.getActionPlaybooks()[factor.factorKey]?.[band] ?? null
      const focusQuestion = productModule.getFocusQuestions()[factor.factorKey]?.[band]?.[0] ?? null
      return playbook
        ? {
            factorLabel: factor.factorLabel,
            title: playbook.title,
            body: playbook.actions[0] ?? playbook.decision,
            question: focusQuestion,
          }
        : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .slice(0, 3)
  const synthesisVoiceCards =
    stats.scan_type === 'retention'
      ? retentionThemes.map((theme) => ({
          title: theme.title,
          body: theme.implication,
          quote: theme.sample,
          count: theme.count,
        }))
      : []
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
  const scoreInterpretationTitle = getScoreInterpretationTitle(stats.scan_type)
  const scoreInterpretationGuide = buildScoreInterpretationGuide(stats.scan_type)
  const decisionPanels = buildDecisionPanels({
    stats,
    averageRiskScore,
    scanDefinition,
    strongWorkSignalRate,
    retentionSupplemental,
    factorAverages: factorData.orgAverages,
    hasEnoughData,
    hasMinDisplay,
  })
  const actionExecutionCore = buildActionExecutionCore({
    selectedPlaybook: selectedDriverPlaybook ?? null,
    nextStep: dashboardViewModel.nextStep,
    highlightedActionQuestion: highlightedActionRows[0]?.question ?? null,
    followThroughCard: dashboardViewModel.followThroughCards[0] ?? null,
  })
  const evidenceReadingFlow = buildEvidenceReadingFlow({
    showDriverDrilldown: visibility.showDriverDrilldown,
    showSegmentAnalysis: visibility.showSegmentAnalysis,
  })
  const redesignView = (
    <div className="space-y-6 pb-8">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        Terug naar campaignoverzicht
      </Link>

      <div className="space-y-4">
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

      <DashboardContextHeader
        eyebrow={`${scanDefinition.productName} · ${scanDefinition.signalLabel}`}
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
        meta={
          <>
            <DashboardChip label={stats.is_active ? 'Actief' : 'Archief'} tone={stats.is_active ? 'emerald' : 'slate'} />
            <DashboardChip label={`${organization?.name ?? 'Organisatie'} · ${formatCampaignPeriod(stats.created_at)}`} tone="slate" />
            <DashboardChip label={readinessLabel} tone={hasEnoughData ? 'blue' : 'amber'} />
            <DashboardChip label={accessState.roleChip} tone={accessState.canManage ? 'blue' : 'slate'} />
            <DashboardChip label={accessState.scopeChip} tone={accessState.canManage ? 'emerald' : 'slate'} />
            {hasSegmentDeepDive ? <DashboardChip label="Segment deep dive" tone="emerald" /> : null}
          </>
        }
        actions={
          <>
            <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
            {!profile?.is_verisight_admin ? <OnboardingAdvancer fromStep={1} /> : null}
          </>
        }
        aside={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <DashboardKeyValue label="Respons" value={`${stats.completion_rate_pct ?? 0}%`} />
            <DashboardKeyValue label="Uitgenodigd" value={`${stats.total_invited}`} />
            <DashboardKeyValue label="Ingevuld" value={`${stats.total_completed}`} />
            <DashboardKeyValue
              label={scanDefinition.signalLabel}
              value={averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : '-'}
              helpText={scanDefinition.signalHelp}
            />
          </div>
        }
      />

      {accessState.noteTitle && accessState.noteBody ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Accountrol en ownerduiding</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{accessState.noteTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{accessState.noteBody}</p>
        </div>
      ) : null}

      <DashboardPrimaryNav items={primaryNavItems} />

      {currentView === 'overview' ? (
        <div className="space-y-6">
          {visibility.showResponseInterpretation ? (
            <DashboardSection
              id="response"
              eyebrow="Responsinterpretatie"
              title="Respons, leesdiscipline en betrouwbaarheid"
              description="Snelle leeslaag voor de vraag of deze wave nu al bestuurlijk gelezen kan worden of nog vooral voorzichtigheid vraagt."
              aside={<DashboardChip label={responseRead.badge} tone={responseRead.badgeTone} />}
            >
              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                  <div className="grid gap-4 lg:grid-cols-[160px,minmax(0,1fr),minmax(280px,0.95fr)] lg:items-center">
                    <div className="flex justify-center lg:justify-start">
                      <ResponseReadinessMeter completionRate={stats.completion_rate_pct ?? 0} tone={responseRead.badgeTone} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lees deze respons zo</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        Gebruik respons niet als neutrale metadata, maar als eerste leesdiscipline: bepaalt deze wave al een stevig patroonbeeld, of vooral de mate van voorzichtigheid bij de eerste managementread?
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <OverviewCueCard
                        eyebrow="Leesstatus"
                        title={responseRead.quickLabel}
                        body={responseRead.title}
                        tone={responseRead.badgeTone}
                      />
                      <OverviewCueCard
                        eyebrow="Voorzichtigheid"
                        title="Wat dit nu betekent"
                        body={responseRead.caution}
                        tone="slate"
                      />
                      <OverviewCueCard
                        eyebrow="Volgende stap"
                        title="Waar kijk je daarna"
                        body={responseRead.nextStep}
                        tone="blue"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <OverviewQuickMetric label="Uitgenodigd" value={`${stats.total_invited}`} />
                  <OverviewQuickMetric label="Ingevuld" value={`${stats.total_completed}`} />
                  <OverviewQuickMetric label="Respons" value={`${stats.completion_rate_pct ?? 0}%`} />
                  <OverviewQuickMetric label="Open" value={`${pendingCount}`} />
                </div>
              </div>
            </DashboardSection>
          ) : null}

          <div id="handoff" className="scroll-mt-36">
            <DashboardHero
              eyebrow={handoffTitle}
              title={dashboardViewModel.primaryQuestion.title}
              description={`${handoffDescription} ${dashboardViewModel.primaryQuestion.body}`}
              tone={stats.scan_type === 'retention' ? 'emerald' : 'blue'}
              meta={
                <>
                  <DashboardChip label={focusBadgeLabel} tone="blue" />
                  <DashboardChip label={productExperience.summaryContextLabel} tone={productExperience.summaryContextTone} />
                </>
              }
              actions={
                <Link
                  href={buildDashboardViewHref('action', driverDrilldown.selectedFactorKey)}
                  className="inline-flex rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] transition-colors hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal-light)]"
                >
                  Naar eerste route
                </Link>
              }
              aside={
                <div className="grid gap-3">
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bestuurlijke handoff</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Start hier: wat speelt nu, waarom telt dat en welke eerste route hoort daarbij.
                    </p>
                  </div>
                  <OverviewCueCard
                    eyebrow="Waarom telt dit"
                    title={decisionPanels[0]?.title ?? scanDefinition.signalLabel}
                    body={decisionPanels[0]?.body ?? dashboardViewModel.primaryQuestion.body}
                    tone={decisionPanels[0]?.tone ?? 'blue'}
                  />
                  <OverviewCueCard
                    eyebrow="Wat eerst doen"
                    title={selectedDriverPlaybook?.title ?? dashboardViewModel.nextStep.title}
                    body={selectedDriverPlaybook?.decision ?? dashboardViewModel.nextStep.body}
                    tone={selectedDriverPlaybook ? 'emerald' : dashboardViewModel.nextStep.tone}
                  />
                </div>
              }
            />
          </div>

          {visibility.showScoreInterpretation ? (
            <DashboardSection
              id="score"
              eyebrow="Score-interpretatie"
              title={scoreInterpretationTitle}
              description={scoreInterpretationGuide.intro}
              aside={<DashboardChip label={scanDefinition.signalLabel} tone="slate" />}
            >
              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hoe lees je dit nu</p>
                  <div className="mt-3 grid gap-3 lg:grid-cols-3">
                    {scoreInterpretationGuide.steps.map((step) => (
                      <OverviewCueCard
                        key={step.title}
                        eyebrow="Leesvolgorde"
                        title={step.title}
                        body={step.body}
                        tone="slate"
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr),minmax(300px,0.8fr)]">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <RiskCharts
                      distribution={riskDistribution}
                      histogramBins={riskHistogram}
                      averageScore={averageRiskScore}
                      scanType={stats.scan_type}
                    />
                  </div>
                  <div className="grid gap-4">
                    {decisionPanels.map((panel) => (
                      <DashboardPanel
                        key={`${panel.eyebrow}-${panel.title}`}
                        eyebrow={panel.eyebrow}
                        title={panel.title}
                        value={panel.value}
                        body={panel.body}
                        tone={panel.tone}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </DashboardSection>
          ) : null}
          <DashboardSection
            id="synthesis"
            eyebrow="Signalen in samenhang"
            title="Managementsynthese van hoofdredenen en meespelende factoren"
            description={productExperience.summaryLeadDescription}
            aside={<DashboardChip label={productExperience.summaryLeadTitle} tone="slate" />}
          >
            <div className="space-y-5">
              {dashboardViewModel.managementBlocks.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  {dashboardViewModel.managementBlocks.map((block) => (
                    <div key={block.title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{block.title}</p>
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

              {synthesisVoiceCards.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  {synthesisVoiceCards.slice(0, 3).map((voice) => (
                    <div key={voice.title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">{voice.title}</p>
                        <DashboardChip label={`${voice.count} signalen`} tone="slate" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{voice.body}</p>
                      <p className="mt-3 text-sm italic leading-6 text-slate-600">&quot;{voice.quote}&quot;</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </DashboardSection>

          <DashboardSection
            id="drivers"
            eyebrow="Drivers en prioriteiten"
            title="Topdrivers eerst, daarna pas volle factorlezing"
            description={productExperience.driverDescription}
            aside={<DashboardChip label={productExperience.driverAsideLabel} tone={productExperience.driverAsideTone} />}
          >
            {visibility.showDriverDrilldown ? (
              <div className="grid gap-5 xl:grid-cols-[320px,minmax(0,1fr)]">
                <div className="space-y-3">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Topdrivers eerst</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Open hier alleen de zwaarste twee drivers. Daarmee blijft de prioriteitenlezing scherp en voelt deze drilldown als keuze, niet als een mechanische factorlijst.
                    </p>
                  </div>
                  {driverDrilldown.highlightedFactors.map((factor, index) => {
                    const band = getRiskBandFromScore(factor.signalValue)
                    const isActive = factor.factorKey === driverDrilldown.selectedFactorKey
                    return (
                      <Link
                        key={factor.factorKey}
                        href={buildDashboardViewHref('overview', factor.factorKey)}
                        className={`block rounded-[22px] border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal-light)] ${
                          isActive
                            ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-white'
                            : 'border-[color:var(--border)] bg-[color:var(--bg)] hover:border-[color:var(--teal)]'
                        }`}
                      >
                        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isActive ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                          Top {index + 1}
                        </p>
                        <p className="mt-2 text-base font-semibold">{factor.factorLabel}</p>
                        <p className={`mt-2 text-sm ${isActive ? 'text-white/85' : 'text-[color:var(--text)]'}`}>
                          Signaal {factor.signalValue.toFixed(1)}/10 · {getManagementBandLabel(band)}
                        </p>
                      </Link>
                    )
                  })}
                </div>
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg)] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-[color:var(--ink)]">{driverDrilldown.selectedFactor?.factorLabel ?? 'Nog geen driver zichtbaar'}</h3>
                      {selectedDriverBand ? (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getManagementBandBadgeClasses(selectedDriverBand)}`}>
                          {getManagementBandLabel(selectedDriverBand)}
                        </span>
                      ) : null}
                    </div>
                    {selectedDriverPresentation ? (
                      <p className="mt-3 text-sm leading-6 text-[color:var(--text)]">
                        Werkbelevingsscore {selectedDriverPresentation.scoreDisplay}. Managementlabel:{' '}
                        {selectedDriverPresentation.managementLabel}. Signaal:{' '}
                        {selectedDriverPresentation.signalDisplay}.
                      </p>
                    ) : null}
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <DashboardPanel
                        eyebrow="Factorlezing"
                        title={selectedDriverPresentation?.managementLabel ?? 'Factorbeeld volgt bij meer data'}
                        value={driverDrilldown.selectedFactor ? `${driverDrilldown.selectedFactor.signalValue.toFixed(1)}/10` : undefined}
                        body={`Werkbelevingsscore ${selectedDriverPresentation?.scoreDisplay ?? '-'}. ${productExperience.focusQuestionDescription}`}
                        tone="blue"
                      />
                      <DashboardPanel
                        eyebrow="Eerste prioriteit"
                        title={selectedDriverPlaybook?.title ?? dashboardViewModel.nextStep.title}
                        body={selectedDriverPlaybook?.decision ?? dashboardViewModel.nextStep.body}
                        tone="emerald"
                      />
                    </div>
                  </div>
                  {selectedDriverQuestions.length > 0 ? (
                    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-sm font-semibold text-slate-950">Prioritaire verificatievragen</h3>
                      <div className="mt-3 grid gap-3">
                        {selectedDriverQuestions.slice(0, 3).map((question) => (
                          <div key={question} className="rounded-2xl border border-white/80 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                            {question}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Verdiepende driverlezing wordt zichtbaar vanaf {MIN_N_PATTERNS} ingevulde responses. Tot die tijd blijft dit dashboard bewust op hoofdsignaal, responsread en eerste managementroute.
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            id="action"
            eyebrow="Eerste route en actie"
            title="Van interpretatie naar eigenaar, eerste stap en review"
            description="Deze laag vertaalt de managementread naar een compacte eerste route zonder in campaign-operatie of methodiek te vervallen."
            aside={<DashboardChip label={focusBadgeLabel} tone="emerald" />}
            tone="emerald"
          >
            <div className="space-y-4">
              <div className="rounded-[22px] border border-[#d2e6e0] bg-[#eef7f4] px-4 py-4 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Operationele vertaalslag</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Deze view hoort minder te duiden en meer te laten uitvoeren: gekozen route, eerste eigenaar, eerste stap en reviewmoment komen hier samen in een compacte actielaag.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-4">
                <DashboardPanel eyebrow="Eerste route" title={selectedDriverPlaybook?.title ?? dashboardViewModel.nextStep.title} body={selectedDriverPlaybook?.decision ?? dashboardViewModel.nextStep.body} tone="blue" />
                <DashboardPanel eyebrow="Owner" title={selectedDriverPlaybook?.owner ?? 'HR + lijnmanagement'} body="Maak expliciet wie de eerste managementcheck trekt en wie de review terugbrengt in de vervolgronde." tone="emerald" />
                <DashboardPanel eyebrow="First step" title={selectedDriverPlaybook?.actions[0] ?? highlightedActionRows[0]?.title ?? 'Kies een eerste gerichte verificatie'} body={highlightedActionRows[0]?.question ?? selectedDriverPlaybook?.validate ?? dashboardViewModel.primaryQuestion.body} tone="blue" />
                <DashboardPanel eyebrow="Review moment" title={selectedDriverPlaybook?.review ?? dashboardViewModel.followThroughCards[0]?.title ?? 'Plan een eerste review'} body={dashboardViewModel.followThroughCards[0]?.body ?? 'Leg direct vast wanneer deze eerste route opnieuw gelezen en eventueel begrensd bijgesteld wordt.'} tone="amber" />
              </div>
            </div>
          </DashboardSection>

          <div id="methodology" className="scroll-mt-36">
            <DashboardDisclosure
              defaultOpen={false}
              title="Compacte methodiek en leeswijzer"
              description="Zichtbaar als trustlaag, maar bewust secundair in de managementflow."
              badge={<DashboardChip label={methodologyBadgeLabel} tone="slate" />}
            >
              <MethodologyCard scanType={stats.scan_type} hasSegmentDeepDive={hasSegmentDeepDive} signalLabel={scanDefinition.signalLabel} embedded />
            </DashboardDisclosure>
          </div>
        </div>
      ) : null}

      {currentView === 'evidence' ? (
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr),280px]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_10px_28px_rgba(19,32,51,0.05)] sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{evidenceReadingFlow.intro.title}</p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{evidenceReadingFlow.intro.body}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{evidenceReadingFlow.supportPrompt}</p>
            </div>
            <div className="rounded-[24px] border border-[color:var(--border)] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(19,32,51,0.04)] sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Leesvolgorde</p>
              <div className="mt-3 space-y-2">
                {evidenceReadingFlow.intro.sequence.map((step) => (
                  <div key={step} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DashboardDisclosure
            defaultOpen={visibility.showDriverDrilldown}
            title={evidenceReadingFlow.primaryEntry.title}
            description="Drivers, signalen en product-specifieke tabs blijven samen in één compacte evidence-ingang."
            badge={<DashboardChip label={evidenceReadingFlow.primaryEntry.badge} tone="blue" />}
          >
            {visibility.showDriverDrilldown ? (
              <div className="space-y-4">
                <div className="rounded-[20px] border border-[#dbe8e3] bg-[#f6faf8] px-4 py-3 text-sm leading-6 text-slate-700">
                  {evidenceReadingFlow.supportPrompt}
                </div>
                <div className="max-w-5xl">
                  <DashboardTabs tabs={driverTabs} />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                {evidenceReadingFlow.primaryEntry.emptyState}
              </div>
            )}
          </DashboardDisclosure>

          <div className="rounded-[24px] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,250,0.88))] px-4 py-4 shadow-[0_12px_30px_rgba(19,32,51,0.05)] sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--border)]/80 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Verdiep verder als nodig</p>
                <h3 className="mt-1 text-base font-semibold text-[color:var(--ink)]">Verklarende lagen onder de kernverdieping</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                  SDT en organisatiefactoren blijven hier bewust smaller en rustiger gepositioneerd. Ze ondersteunen de managementlezing, maar vervangen de kernverdieping niet.
                </p>
              </div>
              <DashboardChip label="Secundaire onderbouwing" tone="slate" />
            </div>

            <div className="mt-4 space-y-3">
              <DashboardDisclosure
                defaultOpen={false}
                title={evidenceReadingFlow.sections.sdt.title}
                description={evidenceReadingFlow.sections.sdt.description}
                badge={<DashboardChip label={evidenceReadingFlow.sections.sdt.badge} tone="slate" />}
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  {(['autonomy', 'competence', 'relatedness'] as const).map((dimension) => (
                    <SdtGauge key={dimension} label={FACTOR_LABELS[dimension]} score={factorData.sdtAverages[dimension] ?? 5.5} />
                  ))}
                </div>
              </DashboardDisclosure>

              <DashboardDisclosure
                defaultOpen={false}
                title={evidenceReadingFlow.sections.factors.title}
                description={evidenceReadingFlow.sections.factors.description}
                badge={<DashboardChip label={evidenceReadingFlow.sections.factors.badge} tone="slate" />}
              >
                <FactorTable factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
              </DashboardDisclosure>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr),minmax(300px,0.85fr)]">
            <DashboardDisclosure
              defaultOpen={false}
              title={evidenceReadingFlow.sections.segments.title}
              description={evidenceReadingFlow.sections.segments.description}
              badge={<DashboardChip label={evidenceReadingFlow.sections.segments.badge} tone={evidenceReadingFlow.sections.segments.tone} />}
            >
              {visibility.showSegmentAnalysis ? (
                retentionSegmentPlaybooks.length > 0 ? (
                  <SegmentPlaybookList segments={retentionSegmentPlaybooks} />
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                    Er zijn nog geen segmenten met voldoende n en voldoende afwijking om apart vrij te geven.
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                  Segmentanalyse blijft hier bewust verborgen totdat deep dive, thresholds en privacycondities tegelijk zijn gehaald.
                </div>
              )}
            </DashboardDisclosure>

            <DashboardDisclosure
              defaultOpen={false}
              title={evidenceReadingFlow.sections.methodology.title}
              description={evidenceReadingFlow.sections.methodology.description}
              badge={<DashboardChip label={evidenceReadingFlow.sections.methodology.badge} tone="slate" />}
            >
              <div className="space-y-4">
                <MethodologyCard scanType={stats.scan_type} hasSegmentDeepDive={hasSegmentDeepDive} signalLabel={scanDefinition.signalLabel} embedded />
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="max-w-xl">
                    <p className="text-sm font-semibold text-slate-900">Volledig rapport en accountability direct bereikbaar</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Gebruik dit alleen wanneer delen, bespreking of volledige technische verantwoording nodig wordt.
                    </p>
                  </div>
                  <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} scanType={stats.scan_type} />
                </div>
              </div>
            </DashboardDisclosure>
          </div>
        </div>
      ) : null}
      {currentView === 'action' ? (
        <div className="space-y-5">
          <DashboardSection id="route" eyebrow="Actie" title={productExperience.routeTitle} description="Deze view zet de gekozen route direct om in uitvoering: eerst eigenaarschap en volgorde, daarna pas extra guidance." aside={<DashboardChip label={productExperience.routeBadgeLabel} tone="blue" />}>
            <div className="space-y-5">
              <div className="rounded-[22px] border border-[#d2e6e0] bg-[#eef7f4] px-4 py-4 sm:px-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#245853]">Uitvoeren, niet opnieuw samenvatten</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Kies hier eerst route, eigenaar, eerste stap en reviewmoment. Verificatievragen en playbooks blijven hieronder bewust secundair.
                </p>
              </div>
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(320px,0.85fr)]">
                <ActionCoreRouteCard title={actionExecutionCore.route.title} body={actionExecutionCore.route.body} tone={actionExecutionCore.route.tone} />
                <div className="grid gap-3">
                  <OverviewCueCard eyebrow="Owner" title={actionExecutionCore.owner.title} body={actionExecutionCore.owner.body} tone={actionExecutionCore.owner.tone} />
                  <OverviewCueCard eyebrow="First step" title={actionExecutionCore.firstStep.title} body={actionExecutionCore.firstStep.body} tone={actionExecutionCore.firstStep.tone} />
                  <OverviewCueCard eyebrow="Review moment" title={actionExecutionCore.review.title} body={actionExecutionCore.review.body} tone={actionExecutionCore.review.tone} />
                </div>
              </div>
              <DashboardDisclosure defaultOpen={false} title="Vervolg en borging" description={actionExecutionCore.supportPrompt} badge={<DashboardChip label="Secundair" tone="slate" />}>
                <div className="space-y-4">
                  {dashboardViewModel.followThroughCards.length > 0 ? <DashboardTimeline title={dashboardViewModel.followThroughTitle} description={dashboardViewModel.followThroughIntro} items={dashboardViewModel.followThroughCards} /> : null}
                  <ManagementReadGuide scanType={stats.scan_type} hasMinDisplay={hasMinDisplay} hasEnoughData={hasEnoughData} />
                </div>
              </DashboardDisclosure>
            </div>
          </DashboardSection>

          <DashboardSection id="playbooks" eyebrow="Verificatie en playbooks" title={productExperience.playbookTitle} description="Open deze laag pas nadat de kernroute gekozen is. Gebruik hem als ondersteuning, niet als tweede overzicht." aside={<DashboardChip label={visibility.showActionPlaybooks ? 'On demand' : 'Wacht op meer data'} tone={visibility.showActionPlaybooks ? 'emerald' : 'amber'} />} tone="emerald">
            {visibility.showActionPlaybooks ? (
              <div className="space-y-5">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ondersteunende laag</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Deze onderdelen helpen alleen als je de gekozen route verder wilt toetsen of vertalen. Ze horen niet boven de kernroute te concurreren.
                  </p>
                </div>
                <DashboardDisclosure defaultOpen={false} title="Verificatievragen" description="Gebruik dit als eerste operationele check, niet als tweede synthese." badge={<DashboardChip label="Vraaggestuurd" tone="slate" />}>
                  <RecommendationList factorAverages={factorData.orgAverages} scanType={stats.scan_type} bandOverride={stats.scan_type === 'onboarding' || stats.scan_type === 'leadership' ? dashboardViewModel.managementBandOverride : undefined} />
                </DashboardDisclosure>
                <DashboardDisclosure defaultOpen={false} title="Uitvoerplaybooks" description="Pas openklappen zodra route en eigenaar gekozen zijn." badge={<DashboardChip label="Uitvoering" tone="slate" />}>
                  <ActionPlaybookList factorAverages={factorData.orgAverages} scanType={stats.scan_type} bandOverride={stats.scan_type === 'onboarding' || stats.scan_type === 'leadership' ? dashboardViewModel.managementBandOverride : undefined} />
                </DashboardDisclosure>
                {visibility.showSegmentAnalysis ? <DashboardDisclosure defaultOpen={false} title="Segment-specifieke routeverdieping" description="Niet centraal, wel beschikbaar wanneer segmentveiligheid en parity dit toelaten." badge={<DashboardChip label="Conditioneel" tone="slate" />}>{retentionSegmentPlaybooks.length > 0 ? <SegmentPlaybookList segments={retentionSegmentPlaybooks} /> : <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">Segmenten halen nu nog niet tegelijk n, afwijking en publicatiegrens.</div>}</DashboardDisclosure> : null}
              </div>
            ) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">Actieplaybooks komen pas vrij zodra deze wave genoeg onderbouwing heeft voor een betekenisvollere eerste route.</div>}
          </DashboardSection>

          {(stats.scan_type === 'team' || stats.scan_type === 'leadership') ? <DashboardSection id="bounded-fallback" eyebrow="Bounded fallback" title="Terug naar bredere duiding wanneer deze bounded route te smal wordt" description="Non-core routes blijven bewust begrensd. Als de vraag breder wordt, gaat de interface terug naar bredere duiding in plaats van deze route groter te maken." aside={<DashboardChip label="Canon boundary" tone="amber" />}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{lifecycleDecisionCards.map((card) => <DashboardPanel key={card.title} eyebrow={card.fit} title={card.title} body={card.body} tone="blue" />)}</div></DashboardSection> : null}
        </div>
      ) : null}

      {currentView === 'campaign' ? (
        visibility.showCampaignView ? (
          <div className="space-y-6">
            <DashboardSection id="campaign-view" eyebrow="Campagne" title="Campaign operations en implementatie" description="Deze view houdt delivery, respondenten en adminwerk apart van de managementleeslaag." aside={<DashboardChip label="Operations second" tone="slate" />}>
              <div className="space-y-4">
                {visibility.showArchivedNotice ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">Deze periode is gearchiveerd. Rapportage en dashboard blijven beschikbaar, maar de campaignflow is niet meer actief.</div> : null}
                {visibility.showCampaignControls ? <DashboardDisclosure defaultOpen={!hasEnoughData} title="Campagnestatus en launchcontrole" description="Readiness, lifecycle en delivery horen hier, niet in het primaire managementoverzicht." badge={<DashboardChip label={readinessState.launchReady ? 'Klaar voor livegang' : 'Aandacht nodig'} tone={readinessState.launchReady ? 'emerald' : 'amber'} />}><div className="space-y-4"><CampaignActions campaignId={id} isActive={stats.is_active} pendingCount={pendingCount} canManageCampaign={canManageCampaign} /><CampaignHealthIndicator totalInvited={stats.total_invited} totalCompleted={stats.total_completed} invitesNotSent={invitesNotSent} incompleteScores={incompleteScores} hasEnoughData={hasEnoughData} hasMinDisplay={hasMinDisplay} />{stats.is_active ? <PreflightChecklist campaignId={id} scanType={stats.scan_type} deliveryMode={campaignMeta?.delivery_mode ?? null} totalInvited={stats.total_invited} totalCompleted={stats.total_completed} invitesNotSent={invitesNotSent} incompleteScores={incompleteScores} hasMinDisplay={hasMinDisplay} hasEnoughData={hasEnoughData} activeClientAccessCount={activeClientAccessCount ?? 0} pendingClientInviteCount={pendingClientInviteCount ?? 0} record={deliveryRecord} checkpoints={deliveryCheckpoints} leadOptions={deliveryLeadOptions} leadLoadError={deliveryLeadError} linkedLearningDossierCount={learningDossiers.length} learningCloseoutEvidenceCount={learningCloseoutEvidenceCount} editable={isVerisightAdmin} /> : null}</div></DashboardDisclosure> : null}
                <DashboardDisclosure defaultOpen={disclosureDefaults.respondentsOpen} title="Respondenten en uitnodigingen" description="Operationele detailweergave voor import, responsmonitoring en uitnodigingsbeheer." badge={<DashboardChip label={`${respondents.length} respondenten`} tone="slate" />}>{visibility.showRespondentTable ? <RespondentTable respondents={respondents} responses={safeTableResponses} scanType={stats.scan_type} hasMinDisplay={hasMinDisplay} canManageCampaign={canManageCampaign} /> : <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center"><p className="text-base font-semibold text-slate-900">Nog geen respondenten toegevoegd</p><p className="mt-2 text-sm leading-6 text-slate-600">Voeg eerst respondenten toe via de setupflow. Daarna komen uitnodigingen, responsmonitoring en deze tabel automatisch beschikbaar.</p></div>}</DashboardDisclosure>
              </div>
            </DashboardSection>
          </div>
        ) : <DashboardSection id="campaign-empty" eyebrow="Campagne" title="Campaign-operatie is nu niet beschikbaar" description="Er zijn nog geen operationele gegevens om te tonen. De managementread blijft wel beschikbaar in Overzicht." aside={<DashboardChip label="Deterministisch verborgen" tone="amber" />}><div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">Deze campaign heeft nog geen operationele detailstaat die veilig of zinvol getoond kan worden.</div></DashboardSection>
      ) : null}
    </div>
  )

  return redesignView
}

function getSingleSearchParam(value: string | string[] | undefined) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}

function isDashboardView(value: string | null): value is 'overview' | 'evidence' | 'action' | 'campaign' {
  return value === 'overview' || value === 'evidence' || value === 'action' || value === 'campaign'
}

function buildDashboardViewHref(
  view: 'overview' | 'evidence' | 'action' | 'campaign',
  selectedDriverKey: string | null,
) {
  const params = new URLSearchParams()
  params.set('view', view)
  if (selectedDriverKey && view !== 'campaign') {
    params.set('driver', selectedDriverKey)
  }
  return `?${params.toString()}`
}

function _legacyBuildResponseReadState(args: {
  totalInvited: number
  totalCompleted: number
  completionRate: number
  pendingCount: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  isActive: boolean
}) {
  if (args.totalInvited === 0) {
    return {
      title: 'Nog geen responsbasis',
      body: 'Er zijn nog geen uitnodigingen verstuurd of zichtbaar. Gebruik deze laag pas als eerste responses binnenkomen.',
      badge: 'Nog leeg',
      badgeTone: 'amber' as const,
    }
  }
  if (args.hasEnoughData) {
    return {
      title: 'Respons sterk genoeg voor managementlezing',
      body: args.pendingCount > 0 ? `Met ${args.totalCompleted} van ${args.totalInvited} responses ligt er een stevig patroonbeeld. Er staan nog ${args.pendingCount} responses open, maar de hoofdlijn is nu leesbaar.` : `Met ${args.totalCompleted} van ${args.totalInvited} responses ligt er een stevig patroonbeeld. De wave kan nu als volwaardige managementread worden gelezen.`,
      badge: 'Stevige respons',
      badgeTone: 'emerald' as const,
    }
  }
  if (args.hasMinDisplay) {
    return {
      title: 'Indicatief beeld, nog geen volle patroonlaag',
      body: args.isActive ? 'Er is al genoeg respons om richting te lezen, maar nog niet genoeg om de diepere driverlaag en bredere routes volledig vrij te geven.' : 'De wave is gesloten, maar blijft qua onderbouwing indicatief. Lees de uitkomst als eerste richting en houd diepe duiding beperkt.',
      badge: 'Indicatief',
      badgeTone: 'amber' as const,
    }
  }
  return {
    title: 'Nog in opbouw',
    body: `Met ${args.totalCompleted} van ${args.totalInvited} responses is dit nog te smal voor patroonanalyse. Gebruik voorlopig alleen de contextlaag en laat de wave eerst verder vullen.`,
    badge: 'In opbouw',
    badgeTone: 'amber' as const,
  }
}

function _legacyBuildScoreInterpretationDescription(scanType: CampaignStats['scan_type']) {
  switch (scanType) {
    case 'exit':
      return 'Lees de frictiescore samen met de verdeling van het vertrekbeeld. De score geeft richting, de banding en spreiding laten zien hoe breed dat beeld in de groep terugkomt.'
    case 'retention':
      return 'Lees het retentiesignaal als groepssignaal. De verdeling laat zien hoe breed behoudsdruk zichtbaar is en helpt voorkomen dat één metric het hele verhaal overneemt.'
    case 'pulse':
      return 'Gebruik deze laag als bounded reviewhulp voor dit meetmoment. De score helpt lezen waar de snapshot nu staat, niet om er een brede trendcockpit van te maken.'
    case 'team':
      return 'Gebruik deze laag eerst op groepsniveau. Pas daarna bepaal je of lokale context veilig genoeg zichtbaar mag worden.'
    case 'onboarding':
      return 'Lees dit als checkpointverdeling: hoe breed valt dit vroege integratiebeeld nu over de groep, zonder er direct een brede lifecycleclaim aan te hangen.'
    case 'leadership':
      return 'Lees dit als managementcontextverdeling op groepsniveau. De score ondersteunt interpretatie, maar opent geen named leader- of performancelezing.'
    default:
      return 'Deze laag helpt de hoofdscore en verdeling correct te lezen voordat de synthese en acties worden geopend.'
  }
}

function formatCampaignPeriod(value: string) {
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'medium',
    timeZone: 'Europe/Amsterdam',
  }).format(new Date(value))
}

function ResponseReadinessMeter({
  completionRate,
  tone,
}: {
  completionRate: number
  tone: 'slate' | 'blue' | 'emerald' | 'amber'
}) {
  const accent = tone === 'emerald' ? '#3C8D8A' : tone === 'blue' ? '#234B57' : tone === 'amber' ? '#8C6B1F' : '#5B6878'
  const boundedRate = Math.max(0, Math.min(100, completionRate))
  const endAngle = (boundedRate / 100) * 360
  return (
    <div
      aria-hidden="true"
      className="flex h-20 w-20 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-sm font-semibold text-[color:var(--ink)]"
      style={{ background: `conic-gradient(${accent} 0deg ${endAngle}deg, #e9eef2 ${endAngle}deg 360deg)` }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">{Math.round(completionRate)}%</span>
    </div>
  )
}

function OverviewCueCard({
  eyebrow,
  title,
  body,
  tone,
}: {
  eyebrow: string
  title: string
  body: string
  tone: 'slate' | 'blue' | 'emerald' | 'amber'
}) {
  const toneClasses =
    tone === 'emerald'
      ? 'border-[#d2e6e0] bg-[#eef7f4]'
      : tone === 'blue'
        ? 'border-[#d6e4e8] bg-[#f3f8f8]'
        : tone === 'amber'
          ? 'border-[#eadfbe] bg-[#faf6ea]'
          : 'border-white/80 bg-white/90'
  const eyebrowClasses =
    tone === 'emerald'
      ? 'text-[#245853]'
      : tone === 'blue'
        ? 'text-[#234B57]'
        : tone === 'amber'
          ? 'text-[#8C6B1F]'
          : 'text-slate-500'

  return (
    <div className={`rounded-[20px] border px-4 py-3 ${toneClasses}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${eyebrowClasses}`}>{eyebrow}</p>
      <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[color:var(--text)]">{body}</p>
    </div>
  )
}

function OverviewQuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[color:var(--border)] bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">{value}</p>
    </div>
  )
}

function ActionCoreRouteCard({
  title,
  body,
  tone,
}: {
  title: string
  body: string
  tone: 'blue' | 'emerald' | 'amber'
}) {
  const toneClasses =
    tone === 'emerald'
      ? 'border-[#d2e6e0] bg-[#eef7f4]'
      : tone === 'amber'
        ? 'border-[#eadfbe] bg-[#faf6ea]'
        : 'border-[#d6e4e8] bg-[#f3f8f8]'
  const eyebrowClass =
    tone === 'emerald' ? 'text-[#245853]' : tone === 'amber' ? 'text-[#8C6B1F]' : 'text-[#234B57]'

  return (
    <div className={`rounded-[24px] border px-5 py-5 ${toneClasses}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${eyebrowClass}`}>Gekozen route</p>
      <p className="mt-3 text-xl font-semibold text-[color:var(--ink)]">{title}</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text)]">{body}</p>
    </div>
  )
}

async function campaignExists(id: string) {
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('campaigns').select('id').eq('id', id).maybeSingle()
    return Boolean(data)
  } catch {
    return false
  }
}

function CampaignRouteUnavailable({
  state,
}: {
  state: ReturnType<typeof buildCampaignRouteUnavailableState>
}) {
  return (
    <div className="space-y-6 pb-8">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        Terug naar campaignoverzicht
      </Link>

      <DashboardSection
        eyebrow={state.eyebrow}
        title={state.title}
        description={state.body}
        aside={<DashboardChip label={state.chipLabel} tone="amber" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DashboardPanel
            eyebrow="Waarom je dit ziet"
            title="Route niet vrijgegeven voor dit account"
            body="Deze route stopt hier bewust vroeg, zodat denied of no-access direct zichtbaar wordt in plaats van als laadstaat te blijven hangen."
            tone="amber"
          />
          <DashboardPanel
            eyebrow="Volgende stap"
            title="Open alleen campaigns uit je eigen overzicht"
            body="Ga terug naar het campaignoverzicht of laat Verisight bevestigen welke campaign voor jouw account zichtbaar hoort te zijn."
            tone="blue"
          />
        </div>
      </DashboardSection>
    </div>
  )
}
