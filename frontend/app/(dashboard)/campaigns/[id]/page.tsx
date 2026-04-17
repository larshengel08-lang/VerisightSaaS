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
          .select('id, title, triage_status, updated_at')
          .eq('campaign_id', id)
          .order('updated_at', { ascending: false })
          .limit(3)
      : { data: [] }
  const learningDossiers = (learningDossiersRaw ?? []) as Array<{
    id: string
    title: string
    triage_status: string
    updated_at: string
  }>
  const lifecycleDecisionCards = getLifecycleDecisionCards(stats.scan_type)
  const handoffTitle =
    stats.scan_type === 'retention'
      ? 'Bestuurlijke handoff en prioritering'
      : stats.scan_type === 'pulse'
        ? 'Pulse duiding en eerste vervolgactie'
        : 'Vertrekduiding en managementgesprek'
  const handoffDescription =
    stats.scan_type === 'retention'
      ? 'Deze laag vertaalt RetentieScan naar een duidelijke lijn: wat is het beeld, wat moet je eerst toetsen en welke acties verdienen nu bestuurlijke aandacht.'
      : stats.scan_type === 'pulse'
        ? 'Deze laag vertaalt Pulse naar een bestuurlijk leesbare momentopname: wat vraagt nu aandacht, wat moet je als eerste bijsturen en welke review hoort hier direct achteraan.'
        : 'Deze laag brengt ExitScan terug tot een bestuurlijk leesbaar vertrekbeeld: wat keert terug, wat lijkt beinvloedbaar en waar moet management eerst doorvragen.'
  const readinessLabel = hasEnoughData
    ? 'Beslisniveau bereikt'
    : hasMinDisplay
      ? 'Indicatief beeld'
      : 'Nog in opbouw'
  const focusBadgeLabel =
    stats.scan_type === 'pulse'
      ? 'Signaal -> bijsturen -> opnieuw meten'
      : stats.scan_type === 'retention'
        ? 'Signaleren -> valideren -> handelen'
        : 'Terugblik -> duiden -> verbeteren'
  const methodologyBadgeLabel =
    stats.scan_type === 'pulse'
      ? 'Snapshotcontext'
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
            'Lees RetentieScan eerst als groepssignaal: waar staat behoud onder druk, wat vraagt eerst verificatie en welk spoor verdient nu expliciet eigenaarschap.',
          summaryCardEyebrow: 'Behoudsspoor',
          promotedSummaryCards: 2,
          driverTitle: 'Signaalbeeld en behoudsdruk',
          driverDescription:
            'Start bij retentiesignaal, trend en aanvullende signalen. Gebruik factoren en segmenten daarna om te bepalen waar behoud eerst verificatie of opvolging vraagt.',
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
            'Gebruik de laagst scorende werkfactoren als eerste verificatiespoor voor managementgesprekken en teamopvolging.',
          supplementalTabLabel: 'Aanvullende signalen',
          supplementalTitle: 'Aanvullende signalen en SDT-basis',
          supplementalDescription:
            'Deze laag voegt bevlogenheid, open signalen en basisbehoeften toe aan het retentiebeeld, zodat trend en werkbeleving samen gelezen worden.',
          actionTitle: 'Waar behoud eerst aandacht vraagt',
          focusQuestionTitle: 'Prioritaire verificatievragen',
          focusQuestionDescription:
            'Start met de factoren en signalen die het eerst verificatie vragen. Gebruik de vragen direct als brug naar eigenaar, eerste interventie en reviewmoment.',
          playbookTitle: 'Behoudsplaybooks en eerste interventies',
          playbookDescription:
            'Deze routes helpen RetentieScan om niet bij signalering te blijven hangen, maar te landen in verificatie, interventie en review.',
          routeTitle: 'Van retentiesignaal naar managementroute',
          routeDescription:
            'Deze laag brengt de eerste managementread, verificatie en het logische reviewmoment samen zonder de executive hoofdlijn te verstoren.',
          routeBadgeLabel: 'Behoudsroute',
          afterSessionTitle: 'Na de eerste managementsessie',
          afterSessionDescription:
            'Gebruik het eerste reviewmoment om bewust te kiezen: blijf je op hetzelfde behoudsspoor, is segmentverdieping logisch of vraagt de volgende stap vooral een gerichte interventie en vervolgmeting?',
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
              'Start met de factoren die het vertrekbeeld het scherpst kleuren en gebruik de vragen direct als brug naar gesprek, eigenaar, eerste actie en reviewmoment.',
            playbookTitle: 'Besluit- en eigenaarschapsroutes',
            playbookDescription:
              'Deze routes helpen ExitScan om niet bij vertrekduiding te blijven hangen, maar snel naar keuze, eigenaar, eerste actie en reviewmoment te gaan.',
            routeTitle: 'Van vertrekduiding naar managementroute',
            routeDescription:
              'Deze laag brengt de eerste managementread, de gekozen verbeterrichting en het logische reviewmoment samen zonder de kernflow bovenin te verstoren.',
            routeBadgeLabel: 'Vertrekroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijf je op hetzelfde vertrekspoor, vraagt deze scan verdere verdieping of wordt een tweede product logisch op basis van de eerste managementwaarde?',
          }
        : {
            summaryTone: 'blue' as const,
            summarySignalLabel: 'Primair signaal',
            summaryContextLabel: 'Managementread',
            summaryContextTone: 'blue' as const,
            summaryLeadTitle: 'Eerste bestuurlijke leesrichting',
            summaryLeadDescription:
              'Gebruik deze eerste laag om het primaire managementsignaal, de eerste keuze en het logische vervolggesprek snel scherp te krijgen.',
            summaryCardEyebrow: 'Productsignaal',
            promotedSummaryCards: 0,
            driverTitle: 'Analyse en driververdieping',
            driverDescription:
              'Gebruik deze laag om het managementbeeld gecontroleerd te verdiepen, zonder de executive hoofdlijn kwijt te raken.',
            driverIntro:
              'Gebruik de tabs hieronder om tussen signaalverdeling, factoren en aanvullende lagen te wisselen zonder de hoofdlijn van het managementbeeld kwijt te raken.',
            driverAsideLabel: hasEnoughData ? 'Live analyse' : 'Wacht op meer data',
            driverAsideTone: hasEnoughData ? ('blue' as const) : ('amber' as const),
            driverTabOrder: ['signalen', 'factoren', 'aanvullend', 'trend'],
            signalTabLabel: 'Signaalverdeling',
            signalTabTitle: 'Signaalverdeling',
            signalTabDescription: 'Laat zien hoe breed en hoe scherp de signalen zich over de groep verdelen.',
            factorTabLabel: 'Factoren',
            factorTabTitle: 'Organisatiefactoren',
            factorTabDescription:
              'De factoren hieronder helpen bepalen waar managementgesprekken het meeste opleveren.',
            supplementalTabLabel: 'SDT-basis',
            supplementalTitle: 'SDT basisbehoeften',
            supplementalDescription:
              'Deze laag laat zien hoe de fundamentele werkbeleving onder de signalen zich ontwikkelt.',
            actionTitle: 'Prioriteiten, hypotheses en eerste acties',
            focusQuestionTitle: 'Prioritaire focusvragen',
            focusQuestionDescription:
              'Start met de factoren die het scherpst afwijken en gebruik de vragen direct als brug naar gesprek, eigenaar, eerste actie en reviewmoment.',
            playbookTitle: 'Action playbooks',
            playbookDescription:
              'Deze playbooks helpen deze dashboardread om niet bij signalering te blijven hangen, maar te landen in keuze, actie en een logisch reviewmoment.',
            routeTitle: 'Van eerste managementread naar vervolgroute',
            routeDescription:
              'Deze laag brengt adoptie, eerste managementgebruik en het logische reviewmoment samen zonder de kernflow bovenin te verstoren.',
            routeBadgeLabel: 'Managementroute',
            afterSessionTitle: 'Na de eerste managementsessie',
            afterSessionDescription:
              'Gebruik het eerste reviewmoment om bewust te kiezen: blijf je op dezelfde route, verdiep je deze scan of wordt een tweede product logisch op basis van de waarde die al zichtbaar is?',
          }
  const summaryItems: Array<{
    label: string
    value: string
    tone?: 'slate' | 'blue' | 'emerald' | 'amber'
  }> = [
    { label: 'Scan', value: scanDefinition.productName, tone: stats.scan_type === 'retention' ? 'emerald' : 'blue' },
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
    { id: 'handoff', label: stats.scan_type === 'retention' ? 'Behoudsread' : 'Handoff' },
    { id: 'drivers', label: stats.scan_type === 'retention' ? 'Signalen' : 'Drivers' },
    { id: 'acties', label: stats.scan_type === 'retention' ? 'Behoudsacties' : 'Acties' },
    { id: 'route', label: stats.scan_type === 'retention' ? 'Behoudsroute' : 'Route' },
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
            <>
              {!profile?.is_verisight_admin ? <OnboardingAdvancer fromStep={1} /> : null}
              <div className="relative">
                {!profile?.is_verisight_admin ? (
                  <OnboardingBalloon step={2} label="Download hier je rapport" align="left" />
                ) : null}
                <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} />
              </div>
            </>
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
          stats.scan_type === 'pulse' ? (
            <div className="rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57]">
              Pulse: snapshot + reviewloop
            </div>
          ) : (
            <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} />
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
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-950">{productExperience.focusQuestionTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {productExperience.focusQuestionDescription}
              </p>
              <div className="mt-4">
                <RecommendationList factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
              </div>
            </div>

            {stats.scan_type === 'retention' || stats.scan_type === 'exit' ? (
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
                    <ActionPlaybookList factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
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
            Focusvragen en playbooks worden betekenisvoller zodra het dashboard minstens {MIN_N_PATTERNS} responses heeft.
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
                    label={learningDossiers.length > 0 ? `${learningDossiers.length} gekoppeld` : 'Nog geen dossier'}
                    tone={learningDossiers.length > 0 ? 'blue' : 'amber'}
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
