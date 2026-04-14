import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CampaignActions } from './campaign-actions'
import { PdfDownloadButton } from './pdf-download-button'
import { ActionPlaybookList } from '@/components/dashboard/action-playbook-list'
import {
  DashboardChip,
  DashboardDisclosure,
  DashboardHero,
  DashboardKeyValue,
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { FactorTable } from '@/components/dashboard/factor-table'
import { OnboardingAdvancer, OnboardingBalloon } from '@/components/dashboard/onboarding-balloon'
import { PreflightChecklist } from '@/components/dashboard/preflight-checklist'
import { RecommendationList } from '@/components/dashboard/recommendation-list'
import { RespondentTable } from '@/components/dashboard/respondent-table'
import { RiskCharts } from '@/components/dashboard/risk-charts'
import { SegmentPlaybookList } from '@/components/dashboard/segment-playbook-list'
import {
  buildDecisionPanels,
  buildHeroDescription,
  buildInsightWarnings,
  buildRetentionSegmentPlaybooks,
  buildRetentionTrendCards,
  buildRiskHistogram,
  buildSafeTableResponses,
  CampaignHealthIndicator,
  clusterRetentionOpenSignals,
  computeAverageRiskScore,
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
  RetentionTrendSection,
  SdtGauge,
} from './page-helpers'
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

  const [{ data: profile }, { data: membership }, { data: campaignMeta }] = await Promise.all([
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
    supabase.from('campaigns').select('enabled_modules').eq('id', id).maybeSingle(),
  ])

  const canManageCampaign =
    profile?.is_verisight_admin === true ||
    membership?.role === 'owner' ||
    membership?.role === 'member'
  const hasSegmentDeepDive = hasCampaignAddOn(campaignMeta, 'segment_deep_dive')

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
  if (stats.scan_type === 'retention' && previousStats) {
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

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        ← Terug naar campaignoverzicht
      </Link>

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
                value={averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : '–'}
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

      <DashboardSection
        eyebrow="Eerst lezen"
        title="Beslisoverzicht"
        description="Deze bovenste laag laat eerst het managementbeeld zien: hoe stevig het patroon is, wat dit product nu zegt en welke vraag of vervolgstap als eerste telt."
        aside={
          <DashboardChip
            label={hasEnoughData ? 'Decision dashboard' : 'Nog in opbouw'}
            tone={hasEnoughData ? 'blue' : 'amber'}
          />
        }
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
              {dashboardViewModel.topSummaryCards.map((card) => (
                <DashboardPanel
                  key={`${card.title}-${card.value ?? 'card'}`}
                  eyebrow="Productspecifiek signaal"
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
        </div>
      </DashboardSection>

      {(dashboardViewModel.managementBlocks.length > 0 ||
        (stats.scan_type === 'retention' &&
          previousStats &&
          currentRetentionSignals &&
          previousRetentionSignals)) ? (
        <DashboardSection
          eyebrow={stats.scan_type === 'retention' ? 'Verifieren en prioriteren' : 'Vertrek duiden'}
          title={
            stats.scan_type === 'retention'
              ? 'Managementduiding en prioritering'
              : 'Vertrekduiding en managementgesprek'
          }
          description={
            stats.scan_type === 'retention'
              ? 'Deze laag vertaalt RetentieScan naar een duidelijke lijn: wat is het beeld, wat moet je eerst toetsen en welke acties verdienen nu bestuurlijke aandacht.'
              : 'Deze laag brengt ExitScan terug tot een bestuurlijk leesbaar vertrekbeeld: wat keert terug, wat lijkt beinvloedbaar en waar moet management eerst doorvragen.'
          }
        >
          <div className="space-y-4">
            {stats.scan_type === 'retention' &&
            previousStats &&
            currentRetentionSignals &&
            previousRetentionSignals ? (
              <RetentionTrendSection
                current={currentRetentionSignals}
                previous={previousRetentionSignals}
                previousDate={previousStats.created_at}
                previousCampaignName={previousStats.campaign_name}
                trendCards={retentionTrendCards}
              />
            ) : null}

            {dashboardViewModel.managementBlocks.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {dashboardViewModel.managementBlocks.map((block) => (
                  <div
                    key={block.title}
                    className={`rounded-[22px] border p-4 ${
                      block.tone === 'emerald'
                        ? 'border-emerald-100 bg-emerald-50/70'
                        : block.tone === 'amber'
                          ? 'border-amber-100 bg-amber-50/70'
                          : 'border-blue-100 bg-blue-50/70'
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                        block.tone === 'emerald'
                          ? 'text-emerald-700'
                          : block.tone === 'amber'
                            ? 'text-amber-700'
                            : 'text-blue-700'
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
      ) : null}

      {canManageCampaign ? (
        <DashboardSection
          eyebrow="Operatie"
          title="Campagnestatus en launchcontrole"
          description="Deze laag is bewust operationeel gehouden: gebruik hem voor reminders, archiveren, launchchecks en responsmonitoring nadat het managementbeeld helder is."
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
            {stats.is_active ? (
              <PreflightChecklist
                campaignId={id}
                scanType={stats.scan_type}
                totalInvited={stats.total_invited}
                invitesNotSent={invitesNotSent}
                incompleteScores={incompleteScores}
                hasMinDisplay={hasMinDisplay}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                Deze campagne is gesloten. Rapportage en dashboard blijven beschikbaar, maar respondenten kunnen niet meer invullen.
              </div>
            )}
          </div>
        </DashboardSection>
      ) : null}

      <DashboardDisclosure
        defaultOpen={disclosureDefaults.analysisOpen}
        title="Analyse en drivers"
        description="Verdiep het signaal pas nadat het beslisoverzicht helder is."
        badge={
          <DashboardChip
            label={hasEnoughData ? 'Live analyse' : 'Wacht op meer data'}
            tone={hasEnoughData ? 'blue' : 'amber'}
          />
        }
      >
        {hasEnoughData ? (
          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-950">Signaalverdeling</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Laat zien hoe breed en hoe scherp de signalen zich over de groep verdelen.
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
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-950">Organisatiefactoren</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  De factoren hieronder helpen bepalen waar managementgesprekken het meeste opleveren.
                </p>
                <div className="mt-4">
                  <FactorTable factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-950">SDT basisbehoeften</h3>
                <DashboardChip label="Autonomie · Competentie · Verbondenheid" tone="slate" />
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Deze laag laat zien hoe de fundamentele werkbeleving onder de signalen zich ontwikkelt.
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
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Verdiepende analyse wordt zichtbaar vanaf {MIN_N_PATTERNS} ingevulde responses. Tot die tijd blijft het dashboard bewust compact en voorzichtig.
          </div>
        )}
      </DashboardDisclosure>

      <DashboardDisclosure
        defaultOpen={disclosureDefaults.focusOpen}
        title="Van signaal naar gesprek en actie"
        description={dashboardViewModel.focusSectionIntro}
        badge={
          <DashboardChip
            label={stats.scan_type === 'retention' ? 'Signaleren → valideren → handelen' : 'Terugblik → duiden → verbeteren'}
            tone="emerald"
          />
        }
      >
        {hasEnoughData ? (
          <div className="space-y-5">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-950">Prioritaire focusvragen</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Start met de factoren die het scherpst afwijken.
              </p>
              <div className="mt-4">
                <RecommendationList factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
              </div>
            </div>

            {stats.scan_type === 'retention' ? (
              <>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-950">Action playbooks</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Deze playbooks helpen RetentieScan om niet bij signalering te blijven hangen.
                  </p>
                  {playbookCalibrationNote ? (
                    <p className="mt-2 text-xs leading-6 text-slate-500">{playbookCalibrationNote}</p>
                  ) : null}
                  <div className="mt-4">
                    <ActionPlaybookList factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
                  </div>
                </div>

                {hasSegmentDeepDive ? (
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

                {retentionThemes.length > 0 ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-slate-950">Verbetersignalen uit open antwoorden</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Geclusterd op groepsniveau, zodat open tekst niet als losse klachtenlijst gelezen hoeft te worden.
                    </p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                      {retentionThemes.map((theme) => (
                        <div
                          key={theme.key}
                          className="rounded-[20px] border border-white/80 bg-white/80 p-4 shadow-sm"
                        >
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
              </>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Focusvragen en playbooks worden betekenisvoller zodra het dashboard minstens {MIN_N_PATTERNS} responses heeft.
          </div>
        )}
      </DashboardDisclosure>

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

      <DashboardDisclosure
        defaultOpen={disclosureDefaults.methodologyOpen}
        title="Methodologie en leeswijzer"
        description="Gebruik dit als contextlaag voor interpretatie, privacy en betrouwbaarheid."
        badge={
          <DashboardChip
            label={stats.scan_type === 'retention' ? 'Privacy-first' : 'Rapportcontext'}
            tone="slate"
          />
        }
      >
        <MethodologyCard
          scanType={stats.scan_type}
          hasSegmentDeepDive={hasSegmentDeepDive}
          signalLabel={scanDefinition.signalLabel}
          embedded
        />
      </DashboardDisclosure>
    </div>
  )
}
