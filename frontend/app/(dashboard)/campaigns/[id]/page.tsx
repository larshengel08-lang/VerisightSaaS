import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FactorTable } from '@/components/dashboard/factor-table'
import { RiskCharts } from '@/components/dashboard/risk-charts'
import { RecommendationList } from '@/components/dashboard/recommendation-list'
import { ActionPlaybookList } from '@/components/dashboard/action-playbook-list'
import { SegmentPlaybookList } from '@/components/dashboard/segment-playbook-list'
import { RespondentTable } from '@/components/dashboard/respondent-table'
import { CampaignActions } from './campaign-actions'
import { PdfDownloadButton } from './pdf-download-button'
import { OnboardingBalloon, OnboardingAdvancer } from '@/components/dashboard/onboarding-balloon'
import { PreflightChecklist } from '@/components/dashboard/preflight-checklist'
import { getScanDefinition } from '@/lib/scan-definitions'
import { getProductModule } from '@/lib/products/shared/registry'
import type { CampaignStats, SurveyResponse, Respondent } from '@/lib/types'
import { FACTOR_LABELS, hasCampaignAddOn } from '@/lib/types'
import type { SegmentPlaybookEntry, SignalTrendCard } from '@/lib/products/shared/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Campaign stats
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

  const [{ data: profile }, { data: membership }] = await Promise.all([
    user
      ? supabase
          .from('profiles')
          .select('is_verisight_admin')
          .eq('id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from('org_members')
          .select('role')
          .eq('org_id', stats.organization_id)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const canManageCampaign =
    profile?.is_verisight_admin === true ||
    membership?.role === 'owner' ||
    membership?.role === 'member'

  const { data: campaignMeta } = await supabase
    .from('campaigns')
    .select('enabled_modules')
    .eq('id', id)
    .maybeSingle()
  const hasSegmentDeepDive = hasCampaignAddOn(campaignMeta, 'segment_deep_dive')

  // Alle responses voor patroonanalyse
  const { data: responsesRaw } = await supabase
    .from('survey_responses')
    .select(`
      id, respondent_id, risk_score, risk_band, preventability, stay_intent_score, uwes_score, turnover_intention_score,
      exit_reason_code, sdt_scores, org_scores, open_text_raw, open_text_analysis, full_result,
      submitted_at,
      respondents!inner(
        id, campaign_id, department, role_level,
        completed, completed_at, token
      )
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
        respondents!inner(
          id, campaign_id, department, role_level,
          completed, completed_at, token
        )
      `)
      .eq('respondents.campaign_id', previousStats.campaign_id)

    previousResponses = (previousResponsesRaw ?? []) as unknown as (SurveyResponse & {
      respondents: Respondent
    })[]
  }
  const safeTableResponses = buildSafeTableResponses(stats.scan_type, responses)
  const riskHistogram = buildRiskHistogram(responses)
  const averageRiskScore = computeAverageRiskScore(responses)

  // Alle respondenten (inclusief niet-ingevuld)
  const { data: allRespondents } = await supabase
    .from('respondents')
    .select('*')
    .eq('campaign_id', id)
    .order('completed_at', { ascending: false, nullsFirst: false })

  const respondents = (allRespondents ?? []) as Respondent[]

  // Patroondata berekenen (client-side via component)
  const factorData = computeFactorAverages(responses)
  const riskDistribution = {
    HOOG:   stats.band_high,
    MIDDEN: stats.band_medium,
    LAAG:   stats.band_low,
  }

  const scanDefinition = getScanDefinition(stats.scan_type)
  const productModule = getProductModule(stats.scan_type)
  const scanLabel = scanDefinition.productName
  // Minimumdrempels — onder deze grenzen zijn uitspraken statistisch onbetrouwbaar
  // en bestaat het risico dat individuele respondenten indirect herleidbaar zijn.
  const MIN_N_PATTERNS = 10   // minimum voor patroonanalyse en grafieken
  const MIN_N_DISPLAY  = 5    // minimum om überhaupt scores te tonen
  const hasEnoughData  = responses.length >= MIN_N_PATTERNS
  const hasMinDisplay  = responses.length >= MIN_N_DISPLAY

  // Health indicator berekeningen
  const invitesNotSent   = respondents.filter(r => !r.sent_at && !r.completed).length
  const incompleteScores = responses.filter(r => !r.org_scores || !r.sdt_scores).length
  // Respondenten die de survey nog niet hebben ingevuld (ongeacht uitnodigingsstatus)
  const pendingCount = stats.total_invited - stats.total_completed
  const retentionSupplemental = computeRetentionSupplementalAverages(responses)
  const retentionThemes = stats.scan_type === 'retention' ? clusterRetentionOpenSignals(responses) : []
  const previousRetentionSupplemental =
    stats.scan_type === 'retention' && previousResponses.length > 0
      ? computeRetentionSignalAverages(previousResponses)
      : null
  const currentRetentionSignals =
    stats.scan_type === 'retention'
      ? {
          retentionSignal: averageRiskScore,
          ...retentionSupplemental,
        }
      : null
  const dashboardViewModel = productModule.buildDashboardViewModel({
    signalLabelLower: scanDefinition.signalLabelLower,
    engagement: retentionSupplemental.engagement,
    turnoverIntention: retentionSupplemental.turnoverIntention,
    stayIntent: retentionSupplemental.stayIntent,
    hasEnoughData,
    factorAverages: factorData.orgAverages,
  })
  const retentionTrendCards =
    stats.scan_type === 'retention' && currentRetentionSignals && previousRetentionSupplemental
      ? buildRetentionTrendCards({
          current: currentRetentionSignals,
          previous: previousRetentionSupplemental,
        })
      : []
  const retentionSegmentPlaybooks =
    stats.scan_type === 'retention' && hasEnoughData
      ? buildRetentionSegmentPlaybooks({
          responses,
          orgAverageSignal: averageRiskScore,
          playbooks: productModule.getActionPlaybooks(),
        })
      : []
  const playbookCalibrationNote =
    stats.scan_type === 'retention' ? productModule.getActionPlaybookCalibrationNote?.() ?? null : null

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← Alle campaigns
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {scanLabel}
              </span>
              <span className={`text-xs font-medium ${stats.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.is_active ? 'Actief' : 'Gesloten'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{stats.campaign_name}</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Stap 1 afgerond: zet onboarding door naar stap 2 */}
            {!profile?.is_verisight_admin && <OnboardingAdvancer fromStep={1} />}
            <div className="relative">
              {!profile?.is_verisight_admin && (
                <OnboardingBalloon step={2} label="Download hier je rapport" align="right" />
              )}
              <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} />
            </div>
            <CampaignActions
              campaignId={id}
              isActive={stats.is_active}
              pendingCount={pendingCount}
              canManageCampaign={canManageCampaign}
            />
          </div>
        </div>
      </div>

      {/* KPI-rij */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Uitgenodigd"  value={stats.total_invited} />
        <KpiCard label="Ingevuld"     value={stats.total_completed} />
        <KpiCard label="Respons"      value={`${stats.completion_rate_pct ?? 0}%`} />
        <KpiCard
          label={`Gem. ${scanDefinition.signalLabelLower}`}
          value={stats.avg_risk_score ? `${stats.avg_risk_score.toFixed(1)}/10` : '–'}
          accent={stats.avg_risk_score ? true : false}
          tooltip={scanDefinition.signalHelp}
        />
        {stats.scan_type === 'exit' ? (
          <KpiCard
            label="Sterk werksignaal"
            value={hasEnoughData ? `${computeStrongWorkSignalRate(responses)}%` : '–'}
            tooltip="Percentage responses waarbij de antwoorden relatief sterk wijzen op beinvloedbare werkfactoren rondom vertrek."
          />
        ) : (
          <KpiCard
            label="Gem. bevlogenheid"
            value={hasEnoughData && retentionSupplemental.engagement !== null ? `${retentionSupplemental.engagement.toFixed(1)}/10` : '–'}
            tooltip="Gemiddelde bevlogenheid op basis van de UWES-3 items. Hoger = energieker en positiever werkbeeld."
          />
        )}
      </div>

      {dashboardViewModel.supplementalCards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
          {dashboardViewModel.supplementalCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl p-4 ${
                card.tone === 'blue'
                  ? 'border border-blue-100 bg-blue-50'
                  : 'border border-emerald-100 bg-emerald-50'
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${
                card.tone === 'blue' ? 'text-blue-700' : 'text-emerald-700'
              }`}>
                {card.title}
              </p>
              {card.value ? (
                <p className="mt-2 text-3xl font-bold text-slate-950">{card.value}</p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
            </div>
          ))}
        </div>
      )}

      {stats.scan_type === 'retention' && previousStats && currentRetentionSignals && previousRetentionSupplemental && (
        <RetentionTrendSection
          current={currentRetentionSignals}
          previous={previousRetentionSupplemental}
          previousDate={previousStats.created_at}
          previousCampaignName={previousStats.campaign_name}
          trendCards={retentionTrendCards}
        />
      )}

      {dashboardViewModel.profileCards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
          {dashboardViewModel.profileCards.map((card) => (
            <div
              key={`${card.title}-${card.value}`}
              className={`rounded-xl p-4 ${
                card.tone === 'amber'
                  ? 'border border-amber-100 bg-amber-50'
                  : card.tone === 'blue'
                    ? 'border border-blue-100 bg-blue-50'
                    : 'border border-emerald-100 bg-emerald-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  card.tone === 'amber'
                    ? 'text-amber-700'
                    : card.tone === 'blue'
                      ? 'text-blue-700'
                      : 'text-emerald-700'
                }`}
              >
                {card.title}
              </p>
              {card.value ? <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p> : null}
              <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
            </div>
          ))}
        </div>
      )}

      {dashboardViewModel.managementBlocks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
          {dashboardViewModel.managementBlocks.map((block) => {
            const toneClasses =
              block.tone === 'emerald'
                ? 'border-emerald-100 bg-emerald-50'
                : block.tone === 'amber'
                  ? 'border-amber-100 bg-amber-50'
                  : 'border-blue-100 bg-blue-50'
            const titleClasses =
              block.tone === 'emerald'
                ? 'text-emerald-700'
                : block.tone === 'amber'
                  ? 'text-amber-700'
                  : 'text-blue-700'

            return (
              <div key={block.title} className={`rounded-xl border p-4 ${toneClasses}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${titleClasses}`}>{block.title}</p>
                {block.intro ? (
                  <p className="mt-2 text-sm leading-6 text-slate-700">{block.intro}</p>
                ) : null}
                <ul className="mt-3 space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {/* Campaign health indicator */}
      {canManageCampaign && (
        <CampaignHealthIndicator
          totalInvited={stats.total_invited}
          totalCompleted={stats.total_completed}
          invitesNotSent={invitesNotSent}
          incompleteScores={incompleteScores}
          hasEnoughData={hasEnoughData}
          hasMinDisplay={hasMinDisplay}
        />
      )}

      {/* Pre-flight checklist (alleen zichtbaar als campaign nog actief is) */}
      {canManageCampaign && stats.is_active && (
        <PreflightChecklist
          campaignId={id}
          scanType={stats.scan_type}
          totalInvited={stats.total_invited}
          invitesNotSent={invitesNotSent}
          incompleteScores={incompleteScores}
          hasMinDisplay={hasMinDisplay}
        />
      )}

      {/* Anonimiteits- en betrouwbaarheidswaarschuwing */}
      {!hasMinDisplay && responses.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800 mb-6">
          <strong>Let op:</strong> Met minder dan {MIN_N_DISPLAY} responses zijn scores niet betrouwbaar
          en bestaat het risico dat individuele respondenten herleidbaar zijn. Nodig meer respondenten uit
          voordat je conclusies trekt.
        </div>
      )}
      {hasMinDisplay && !hasEnoughData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-6">
          <strong>Beperkte statistische betrouwbaarheid</strong> — patroonanalyse en grafieken worden
          zichtbaar vanaf {MIN_N_PATTERNS} responses (nu: {responses.length}). Scores zijn indicatief;
          trek nog geen definitieve conclusies op groepsniveau.
        </div>
      )}
      {hasEnoughData && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 mb-6">
          Scores zijn gebaseerd op de Zelfdeterminatietheorie (Van den Broeck et al., 2010).
          Resultaten zijn indicatief en dienen als input voor gesprek — niet als objectief oordeel over individuen.
          {stats.scan_type === 'retention'
            ? ' Binnen RetentieScan tonen we alleen groeps- en segmentinzichten, geen individuele medewerker-scores.'
            : ' Individuele scores blijven beperkt tot de exit-context en moeten altijd met zorg worden gelezen.'}
        </div>
      )}

      <MethodologyCard
        scanType={stats.scan_type}
        hasSegmentDeepDive={hasSegmentDeepDive}
        signalLabel={scanDefinition.signalLabel}
      />

      {/* Grafieken + factortabel */}
      {hasEnoughData && (
        <>
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Signaalverdeling</h2>
              <RiskCharts
                distribution={riskDistribution}
                histogramBins={riskHistogram}
                averageScore={averageRiskScore}
                scanType={stats.scan_type}
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Organisatiefactoren</h2>
              <FactorTable factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
            </div>
          </div>

          {/* SDT */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              SDT Basisbehoeften
              <span className="ml-2 font-normal text-gray-400 text-xs">
                Van den Broeck et al. (2010)
              </span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {(['autonomy', 'competence', 'relatedness'] as const).map(dim => {
                const score = factorData.sdtAverages[dim] ?? 5.5
                return (
                  <SdtGauge
                    key={dim}
                    label={FACTOR_LABELS[dim]}
                    score={score}
                  />
                )
              })}
            </div>
          </div>

          {/* Focusvragen */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Prioritaire focusvragen</h2>
            <RecommendationList factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
          </div>

          {stats.scan_type === 'retention' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Action playbooks</h2>
              <p className="text-sm leading-7 text-gray-600">
                Deze playbooks helpen management voorkomen dat RetentieScan alleen een signaal blijft. Ze combineren wat je
                eerst moet valideren, welke acties logisch zijn en wat je juist niet te snel moet concluderen.
              </p>
              {playbookCalibrationNote ? (
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {playbookCalibrationNote}
                </p>
              ) : null}
              <div className="mt-4">
                <ActionPlaybookList factorAverages={factorData.orgAverages} scanType={stats.scan_type} />
              </div>
            </div>
          )}

          {stats.scan_type === 'retention' && hasSegmentDeepDive && retentionSegmentPlaybooks.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Segment-specifieke playbooks</h2>
              <p className="text-sm leading-7 text-gray-600">
                Deze verfijning laat zien welke afdelingen of functieniveaus relatief scherper afwijken dan het organisatieniveau
                en welke eerste actie daar het meest logisch lijkt.
              </p>
              <div className="mt-4">
                <SegmentPlaybookList segments={retentionSegmentPlaybooks} />
              </div>
            </div>
          )}

          {stats.scan_type === 'retention' && retentionThemes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Verbetersignalen uit open antwoorden</h2>
              <p className="text-sm leading-7 text-gray-600">
                Dit zijn geclusterde groepssignalen uit open antwoorden. Lees ze als richting voor verificatie en actie,
                niet als losse klachtenlijst of individueel oordeel.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {retentionThemes.map((theme) => (
                  <div key={theme.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{theme.title}</p>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500">
                        {theme.count}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{theme.implication}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Voorbeeldsignaal</p>
                    <p className="mt-1 text-sm italic leading-6 text-slate-600">&quot;{theme.sample}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Respondenten */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Respondenten</h2>
          {canManageCampaign && respondents.length > 0 && (
            <Link
              href="/beheer"
              className="text-xs text-blue-600 hover:underline"
            >
              + Meer uitnodigen
            </Link>
          )}
        </div>
        {respondents.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
            <div className="text-3xl mb-3">📨</div>
            <p className="text-sm font-medium text-gray-700 mb-1">Nog geen respondenten</p>
            <p className="text-xs text-gray-400 mb-4">
              Nodig medewerkers uit via e-mail of genereer anonieme survey-links.
            </p>
            <Link
              href="/beheer"
              className="inline-block bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Respondenten toevoegen →
            </Link>
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
      </div>
    </div>
  )
}

// ── Hulpcomponenten ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  accent = false,
  tooltip,
}: {
  label: string
  value: string | number
  accent?: boolean
  tooltip?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className={`text-xl font-bold ${accent ? 'text-blue-600' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
        {label}
        {tooltip && (
          <span className="text-gray-300 cursor-help" title={tooltip}>ⓘ</span>
        )}
      </div>
    </div>
  )
}

function SdtGauge({ label, score }: { label: string; score: number }) {
  const pct  = ((score - 1) / 9) * 100
  const color = score >= 7 ? 'bg-green-500' : score >= 4.5 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = score >= 7 ? 'text-green-700' : score >= 4.5 ? 'text-amber-700' : 'text-red-700'

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  )
}

function MethodologyCard({
  scanType,
  hasSegmentDeepDive,
  signalLabel,
}: {
  scanType: 'exit' | 'retention'
  hasSegmentDeepDive: boolean
  signalLabel: string
}) {
  const scanDefinition = getScanDefinition(scanType)
  const productModule = getProductModule(scanType)
  const signaalbandenText = productModule.buildDashboardViewModel({
    signalLabelLower: scanDefinition.signalLabelLower,
    engagement: null,
    turnoverIntention: null,
    stayIntent: null,
    hasEnoughData: true,
    factorAverages: {},
  }).signaalbandenText
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Methodologie & uitleg</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            {scanDefinition.methodologyText}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{signalLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {scanDefinition.signalHelp}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signaalbanden</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {signaalbandenText}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Betrouwbaarheid</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {scanDefinition.reliabilityText}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Segment deep dive</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {hasSegmentDeepDive
              ? `${scanDefinition.segmentText} Deze campagne gebruikt die add-on al.`
              : scanDefinition.segmentText}
          </p>
        </div>
      </div>
    </div>
  )
}

function RetentionTrendSection({
  current,
  previous,
  previousDate,
  previousCampaignName,
  trendCards,
}: {
  current: RetentionSignalAverages
  previous: RetentionSignalAverages
  previousDate: string
  previousCampaignName: string
  trendCards: SignalTrendCard[]
}) {
  const signalDelta = current.retentionSignal !== null && previous.retentionSignal !== null
    ? Number((current.retentionSignal - previous.retentionSignal).toFixed(1))
    : null
  const isImproving = signalDelta !== null && signalDelta < -0.1
  const isWorsening = signalDelta !== null && signalDelta > 0.1
  const label = isImproving ? 'Verbeterd' : isWorsening ? 'Verslechterd' : 'Stabiel'
  const toneClasses = isImproving
    ? 'border-emerald-100 bg-emerald-50'
    : isWorsening
      ? 'border-amber-100 bg-amber-50'
      : 'border-blue-100 bg-blue-50'
  const labelClasses = isImproving
    ? 'text-emerald-700'
    : isWorsening
      ? 'text-amber-700'
      : 'text-blue-700'

  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(previousDate))

  return (
    <div className="mb-6 space-y-4">
      <div className={`rounded-xl border p-4 ${toneClasses}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${labelClasses}`}>Trend sinds vorige meting</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Vergeleken met <span className="font-semibold">{previousCampaignName}</span> van {formattedDate} veranderde het
              gemiddelde retentiesignaal van {previous.retentionSignal?.toFixed(1) ?? '–'}/10 naar {current.retentionSignal?.toFixed(1) ?? '–'}/10.
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delta retentiesignaal</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {signalDelta === null ? '–' : `${signalDelta > 0 ? '+' : ''}${signalDelta.toFixed(1)}`}
            </p>
          </div>
        </div>
      </div>

      {trendCards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {trendCards.map((card) => (
            <div
              key={card.key}
              className={`rounded-xl border p-4 ${
                card.tone === 'emerald'
                  ? 'border-emerald-100 bg-emerald-50'
                  : card.tone === 'amber'
                    ? 'border-amber-100 bg-amber-50'
                    : 'border-blue-100 bg-blue-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  card.tone === 'emerald'
                    ? 'text-emerald-700'
                    : card.tone === 'amber'
                      ? 'text-amber-700'
                      : 'text-blue-700'
                }`}
              >
                {card.title}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {card.currentValue.toFixed(1)}/10
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vorige meting {card.previousValue.toFixed(1)}/10 · delta {card.delta > 0 ? '+' : ''}{card.delta.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// PdfDownloadButton is verplaatst naar pdf-download-button.tsx (client component)

// ── Datahulpfuncties ─────────────────────────────────────────────────────────

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

function computeFactorAverages(responses: SurveyResponse[]) {
  const orgTotals: Record<string, number[]> = {}
  const sdtTotals: Record<string, number[]> = {}

  for (const r of responses) {
    // Org scores
    for (const factor of ORG_FACTORS) {
      const val = r.org_scores?.[factor]
      if (typeof val === 'number') {
        orgTotals[factor] = [...(orgTotals[factor] ?? []), val]
      }
    }
    // SDT scores
    for (const dim of ['autonomy', 'competence', 'relatedness']) {
      const val = r.sdt_scores?.[dim]
      if (typeof val === 'number') {
        sdtTotals[dim] = [...(sdtTotals[dim] ?? []), val]
      }
    }
  }

  const avg = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 5.5

  return {
    orgAverages: Object.fromEntries(
      ORG_FACTORS.map(f => [f, avg(orgTotals[f] ?? [])])
    ),
    sdtAverages: {
      autonomy:    avg(sdtTotals['autonomy']    ?? []),
      competence:  avg(sdtTotals['competence']  ?? []),
      relatedness: avg(sdtTotals['relatedness'] ?? []),
    },
  }
}

function computeStrongWorkSignalRate(responses: SurveyResponse[]) {
  const total    = responses.filter(r => r.preventability).length
  const strongSignal = responses.filter(r => r.preventability === 'STERK_WERKSIGNAAL').length
  if (!total) return 0
  return Math.round((strongSignal / total) * 100)
}

function computeRetentionSupplementalAverages(responses: SurveyResponse[]) {
  const engagement = responses
    .map((response) => response.uwes_score)
    .filter((value): value is number => typeof value === 'number')
  const turnoverIntention = responses
    .map((response) => response.turnover_intention_score)
    .filter((value): value is number => typeof value === 'number')
  const stayIntent = responses
    .map((response) => response.stay_intent_score)
    .filter((value): value is number => typeof value === 'number')
    .map((value) => ((value - 1) / 4) * 9 + 1)

  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null

  return {
    engagement: average(engagement),
    turnoverIntention: average(turnoverIntention),
    stayIntent: average(stayIntent),
  }
}

type RetentionSignalAverages = {
  retentionSignal: number | null
  engagement: number | null
  turnoverIntention: number | null
  stayIntent: number | null
}

function computeRetentionSignalAverages(responses: SurveyResponse[]): RetentionSignalAverages {
  return {
    retentionSignal: computeAverageRiskScore(responses),
    ...computeRetentionSupplementalAverages(responses),
  }
}

function buildRetentionTrendCards(args: {
  current: RetentionSignalAverages
  previous: RetentionSignalAverages
}): SignalTrendCard[] {
  const metricDefinitions = [
    {
      key: 'engagement',
      title: 'Trend bevlogenheid',
      currentValue: args.current.engagement,
      previousValue: args.previous.engagement,
      improvingDelta: 0.1,
      improvedBody: 'De energie en positieve betrokkenheid zijn hoger dan in de vorige meting. Toets vooral wat je wilt behouden.',
      worsenedBody: 'De energie is gedaald ten opzichte van de vorige meting. Kijk vooral of werkdruk, leiderschap of perspectief mee verschuiven.',
      stableBody: 'Bevlogenheid beweegt beperkt. Gebruik dit om te toetsen of acties al effect hebben of nog onvoldoende zichtbaar zijn.',
    },
    {
      key: 'stay_intent',
      title: 'Trend stay-intent',
      currentValue: args.current.stayIntent,
      previousValue: args.previous.stayIntent,
      improvingDelta: 0.1,
      improvedBody: 'De expliciete bereidheid om te blijven ligt hoger dan in de vorige meting. Leg vast welke factoren dit waarschijnlijk ondersteunen.',
      worsenedBody: 'Stay-intent is gedaald. Dit is vaak een signaal dat managementgesprekken en vervolgacties niet te lang moeten wachten.',
      stableBody: 'Stay-intent is stabiel. Kijk vooral of dat past bij de ontwikkeling van werkfactoren en vertrekintentie.',
    },
    {
      key: 'turnover_intention',
      title: 'Trend vertrekintentie',
      currentValue: args.current.turnoverIntention,
      previousValue: args.previous.turnoverIntention,
      improvingDelta: -0.1,
      improvedBody: 'Vertrekintentie is lager dan in de vorige meting. Dat is positief, maar alleen geloofwaardig als werkfactoren mee verbeteren.',
      worsenedBody: 'Vertrekintentie is opgelopen. Toets snel of dit vooral geconcentreerd zit in specifieke teams of rollen.',
      stableBody: 'Vertrekintentie blijft ongeveer gelijk. Gebruik segmentvergelijking om te zien waar het beeld het meest afwijkt.',
    },
  ] as const

  return metricDefinitions
    .filter((metric) => metric.currentValue !== null && metric.previousValue !== null)
    .map((metric) => {
      const delta = Number((metric.currentValue! - metric.previousValue!).toFixed(1))
      const improved = metric.improvingDelta > 0 ? delta >= metric.improvingDelta : delta <= metric.improvingDelta
      const worsened = metric.improvingDelta > 0 ? delta <= -Math.abs(metric.improvingDelta) : delta >= Math.abs(metric.improvingDelta)
      const direction = improved ? 'improved' : worsened ? 'worsened' : 'stable'

      return {
        key: metric.key,
        title: metric.title,
        currentValue: metric.currentValue!,
        previousValue: metric.previousValue!,
        delta,
        direction,
        tone: improved ? 'emerald' : worsened ? 'amber' : 'blue',
        body: improved ? metric.improvedBody : worsened ? metric.worsenedBody : metric.stableBody,
      } satisfies SignalTrendCard
    })
}

function buildRetentionSegmentPlaybooks(args: {
  responses: (SurveyResponse & { respondents: Respondent })[]
  orgAverageSignal: number | null
  playbooks: Record<string, Record<string, { title: string; validate: string; actions: string[]; caution: string }>>
}): SegmentPlaybookEntry[] {
  if (args.orgAverageSignal === null) return []
  const orgAverageSignal = args.orgAverageSignal

  const groups = new Map<string, {
    segmentType: 'department' | 'role_level'
    segmentLabel: string
    responses: (SurveyResponse & { respondents: Respondent })[]
  }>()

  for (const response of args.responses) {
    const department = response.respondents.department?.trim()
    if (department) {
      const key = `department:${department}`
      const group = groups.get(key) ?? { segmentType: 'department' as const, segmentLabel: department, responses: [] }
      group.responses.push(response)
      groups.set(key, group)
    }

    const roleLevel = response.respondents.role_level?.trim()
    if (roleLevel) {
      const key = `role_level:${roleLevel}`
      const group = groups.get(key) ?? {
        segmentType: 'role_level' as const,
        segmentLabel: formatRoleLevel(roleLevel),
        responses: [],
      }
      group.responses.push(response)
      groups.set(key, group)
    }
  }

  return Array.from(groups.values())
    .filter((group) => group.responses.length >= 5)
    .map((group) => {
      const segmentFactorAverages = computeFactorAverages(group.responses).orgAverages
      const sortedFactors = Object.entries(segmentFactorAverages)
        .map(([factor, score]) => ({
          factor,
          factorLabel: FACTOR_LABELS[factor] ?? factor,
          signalValue: 11 - score,
        }))
        .sort((left, right) => right.signalValue - left.signalValue)
      const topFactor = sortedFactors[0]
      if (!topFactor) return null

      const avgSignal = computeAverageRiskScore(group.responses)
      if (avgSignal === null) return null

      const band = topFactor.signalValue >= 7 ? 'HOOG' : topFactor.signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
      const playbook = args.playbooks[topFactor.factor]?.[band]
      if (!playbook) return null

      return {
        segmentType: group.segmentType,
        segmentLabel: group.segmentLabel,
        factorKey: topFactor.factor,
        factorLabel: topFactor.factorLabel,
        n: group.responses.length,
        avgSignal,
        deltaVsOrg: Number((avgSignal - orgAverageSignal).toFixed(1)),
        signalValue: Number(topFactor.signalValue.toFixed(1)),
        title: playbook.title,
        validate: playbook.validate,
        actions: playbook.actions,
        caution: playbook.caution,
      } satisfies SegmentPlaybookEntry
    })
    .filter((value): value is SegmentPlaybookEntry => Boolean(value))
    .filter((segment) => segment.avgSignal >= 4.5 || segment.deltaVsOrg >= 0.4)
    .sort((left, right) => (right.deltaVsOrg - left.deltaVsOrg) || (right.avgSignal - left.avgSignal))
    .slice(0, 3)
}

function formatRoleLevel(value: string) {
  const labels: Record<string, string> = {
    uitvoerend: 'Uitvoerend',
    specialist: 'Specialist',
    senior: 'Senior',
    manager: 'Manager',
    director: 'Director',
    c_level: 'C-level',
  }

  return labels[value] ?? value
}

type RetentionTheme = {
  key: string
  title: string
  count: number
  implication: string
  sample: string
}

function clusterRetentionOpenSignals(responses: SurveyResponse[]): RetentionTheme[] {
  const definitions = [
    {
      key: 'leadership',
      title: 'Leiderschap en ondersteuning',
      keywords: ['leidinggevende', 'manager', 'feedback', 'aansturing', 'sturing', 'coach'],
      implication: 'Dit wijst vaak op een behoefte aan duidelijker leiderschap, betere feedback of meer autonomie-ondersteuning.',
    },
    {
      key: 'culture',
      title: 'Veiligheid en samenwerking',
      keywords: ['cultuur', 'veilig', 'samenwerking', 'team', 'vertrouwen', 'uitspreken'],
      implication: 'Dit signaal vraagt meestal om verificatie van psychologische veiligheid, teamdynamiek en cultuurfit.',
    },
    {
      key: 'growth',
      title: 'Groei en perspectief',
      keywords: ['groei', 'ontwikkeling', 'loopbaan', 'doorgroei', 'perspectief', 'leren'],
      implication: 'Dit signaal wijst vaak op behoefte aan ontwikkelruimte of een geloofwaardig toekomstperspectief.',
    },
    {
      key: 'compensation',
      title: 'Beloning en voorwaarden',
      keywords: ['salaris', 'beloning', 'voorwaarden', 'arbeidsvoorwaarden', 'vergoeding', 'loon'],
      implication: 'Dit gaat vaak niet alleen over hoogte, maar ook over ervaren eerlijkheid en passendheid van voorwaarden.',
    },
    {
      key: 'workload',
      title: 'Werkdruk en herstel',
      keywords: ['werkdruk', 'druk', 'belasting', 'hersteltijd', 'planning', 'teveel'],
      implication: 'Dit vraagt meestal om onderscheid tussen structurele overbelasting en tijdelijk piekwerk.',
    },
    {
      key: 'role_clarity',
      title: 'Prioriteiten en rolhelderheid',
      keywords: ['prioriteit', 'rol', 'verwachting', 'duidelijk', 'verantwoordelijkheid', 'tegenstrijdig'],
      implication: 'Dit signaal wijst vaak op onduidelijkheid over prioriteiten, verwachtingen of beslisruimte.',
    },
  ]

  const rawTexts = responses
    .map((response) => response.open_text_raw?.trim())
    .filter((value): value is string => Boolean(value))

  if (rawTexts.length === 0) return []

  const buckets = definitions.map((definition) => ({
    ...definition,
    matches: [] as string[],
  }))
  const overige: string[] = []

  for (const text of rawTexts) {
    const normalized = text.toLowerCase()
    const matchingBucket = buckets.find((bucket) =>
      bucket.keywords.some((keyword) => normalized.includes(keyword)),
    )
    if (matchingBucket) {
      matchingBucket.matches.push(text)
    } else {
      overige.push(text)
    }
  }

  const themes = buckets
    .filter((bucket) => bucket.matches.length > 0)
    .map((bucket) => ({
      key: bucket.key,
      title: bucket.title,
      count: bucket.matches.length,
      implication: bucket.implication,
      sample: bucket.matches[0],
    }))
    .sort((a, b) => b.count - a.count)

  if (overige.length > 0) {
    themes.push({
      key: 'other',
      title: 'Overige verbetersignalen',
      count: overige.length,
      implication: 'Hier zitten signalen die niet netjes in één hoofdcategorie vallen, maar wel aandacht kunnen vragen in de volgende gespreksronde.',
      sample: overige[0],
    })
  }

  return themes.slice(0, 3)
}

function buildSafeTableResponses(
  scanType: 'exit' | 'retention',
  responses: (SurveyResponse & { respondents: Respondent })[],
) {
  if (scanType === 'retention') {
    return responses.map((response) => ({
      respondent_id: response.respondent_id,
    }))
  }

  return responses.map((response) => ({
    respondent_id: response.respondent_id,
    risk_score: response.risk_score,
    risk_band: response.risk_band,
    preventability: response.preventability,
  }))
}

function buildRiskHistogram(responses: SurveyResponse[]) {
  const scores = responses
    .map((response) => response.risk_score)
    .filter((score): score is number => typeof score === 'number')

  return Array.from({ length: 9 }, (_, index) => {
    const low = index + 1
    const high = index + 2
    return {
      range: `${low}-${high}`,
      count: scores.filter((score) => score >= low && (index === 8 ? score <= high : score < high)).length,
    }
  })
}

function computeAverageRiskScore(responses: SurveyResponse[]) {
  const scores = responses
    .map((response) => response.risk_score)
    .filter((score): score is number => typeof score === 'number')

  if (scores.length === 0) return null
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

// ── Campaign Health Indicator ────────────────────────────────────────────────

function CampaignHealthIndicator({
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasEnoughData,
  hasMinDisplay,
}: {
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasEnoughData: boolean
  hasMinDisplay: boolean
}) {
  const checks: { label: string; ok: boolean; warn?: boolean; detail?: string }[] = [
    {
      label: 'Uitnodigingen verstuurd',
      ok: invitesNotSent === 0,
      warn: invitesNotSent > 0,
      detail: invitesNotSent > 0 ? `${invitesNotSent} respondent(en) hebben nog geen uitnodiging ontvangen` : undefined,
    },
    {
      label: 'Minimum responses bereikt',
      ok: hasMinDisplay,
      warn: !hasMinDisplay && totalCompleted > 0,
      detail: !hasMinDisplay ? `${totalCompleted} van min. 5 vereist voor weergave` : undefined,
    },
    {
      label: 'Voldoende data voor analyse',
      ok: hasEnoughData,
      warn: hasMinDisplay && !hasEnoughData,
      detail: !hasEnoughData ? `${totalCompleted} van min. 10 vereist voor patroonanalyse` : undefined,
    },
    {
      label: 'Alle scores volledig',
      ok: incompleteScores === 0,
      warn: incompleteScores > 0,
      detail: incompleteScores > 0 ? `${incompleteScores} response(s) met ontbrekende scores` : undefined,
    },
  ]

  const errors  = checks.filter(c => !c.ok && !c.warn)
  const warnings = checks.filter(c => c.warn)
  const allOk   = errors.length === 0 && warnings.length === 0

  if (totalInvited === 0) return null

  return (
    <div className={`rounded-xl border px-4 py-3 mb-4 ${
      allOk ? 'bg-green-50 border-green-200' :
      errors.length > 0 ? 'bg-red-50 border-red-200' :
      'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${
          allOk ? 'text-green-700' : errors.length > 0 ? 'text-red-700' : 'text-amber-700'
        }`}>
          Campaign status
        </span>
        <span className={`text-xs font-bold ${
          allOk ? 'text-green-600' : errors.length > 0 ? 'text-red-600' : 'text-amber-600'
        }`}>
          {allOk ? '✓ Alles in orde' : errors.length > 0 ? '✗ Actie vereist' : `⚠ ${warnings.length} aandachtspunt${warnings.length > 1 ? 'en' : ''}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(check => (
          <span key={check.label} className="flex items-center gap-1 text-xs" title={check.detail}>
            <span className={check.ok ? 'text-green-600' : check.warn ? 'text-amber-600' : 'text-red-600'}>
              {check.ok ? '✓' : check.warn ? '⚠' : '✗'}
            </span>
            <span className={`${
              check.ok ? 'text-green-700' : check.warn ? 'text-amber-700' : 'text-red-700'
            }`}>
              {check.label}
              {check.detail && <span className="text-gray-500"> — {check.detail}</span>}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// PreflightChecklist is verplaatst naar components/dashboard/preflight-checklist.tsx (client component)
