import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FactorTable } from '@/components/dashboard/factor-table'
import { RiskCharts } from '@/components/dashboard/risk-charts'
import { RecommendationList } from '@/components/dashboard/recommendation-list'
import { RespondentTable } from '@/components/dashboard/respondent-table'
import { CampaignActions } from './campaign-actions'
import { PdfDownloadButton } from './pdf-download-button'
import { OnboardingBalloon, OnboardingAdvancer } from '@/components/dashboard/onboarding-balloon'
import { PreflightChecklist } from '@/components/dashboard/preflight-checklist'
import type { CampaignStats, SurveyResponse, Respondent } from '@/lib/types'
import { FACTOR_LABELS, hasCampaignAddOn } from '@/lib/types'

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
      id, respondent_id, risk_score, risk_band, preventability,
      exit_reason_code, sdt_scores, org_scores, full_result,
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

  const scanLabel = stats.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'
  // Minimumdrempels — onder deze grenzen zijn uitspraken statistisch onbetrouwbaar
  // en bestaat het risico dat individuele respondenten indirect herleidbaar zijn.
  const MIN_N_PATTERNS = 10   // minimum voor patroonanalyse en grafieken
  const MIN_N_DISPLAY  = 5    // minimum om überhaupt scores te tonen
  const hasEnoughData  = responses.length >= MIN_N_PATTERNS
  const hasMinDisplay  = responses.length >= MIN_N_DISPLAY

  // Health indicator berekeningen
  const invitesNotSent   = respondents.filter(r => !r.sent_at && !r.completed).length
  const completionRate   = stats.total_invited > 0
    ? (stats.total_completed / stats.total_invited) * 100 : 0
  const incompleteScores = responses.filter(r => !r.org_scores || !r.sdt_scores).length
  // Respondenten die de survey nog niet hebben ingevuld (ongeacht uitnodigingsstatus)
  const pendingCount = stats.total_invited - stats.total_completed

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
          label="Gem. frictiescore"
          value={stats.avg_risk_score ? `${stats.avg_risk_score.toFixed(1)}/10` : '–'}
          accent={stats.avg_risk_score ? true : false}
          tooltip="Frictieschaal 1–10: hogere score = sterker signaal van ervaren werkfrictie. HOOG ≥ 7 · MIDDEN 4.5–7 · LAAG < 4.5."
        />
        <KpiCard
          label="Sterk werksignaal"
          value={hasEnoughData ? `${computeStrongWorkSignalRate(responses)}%` : '–'}
          tooltip="Percentage responses waarbij de antwoorden relatief sterk wijzen op beïnvloedbare werkfactoren rondom vertrek."
        />
      </div>

      {/* Campaign health indicator */}
      {canManageCampaign && (
        <CampaignHealthIndicator
          totalInvited={stats.total_invited}
          totalCompleted={stats.total_completed}
          completionRate={completionRate}
          invitesNotSent={invitesNotSent}
          incompleteScores={incompleteScores}
          isActive={stats.is_active}
          hasEnoughData={hasEnoughData}
          hasMinDisplay={hasMinDisplay}
        />
      )}

      {/* Pre-flight checklist (alleen zichtbaar als campaign nog actief is) */}
      {canManageCampaign && stats.is_active && (
        <PreflightChecklist
          campaignId={id}
          totalInvited={stats.total_invited}
          totalCompleted={stats.total_completed}
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
          Individuele scores zijn alleen zichtbaar voor geautoriseerde HR-medewerkers.
        </div>
      )}

      <MethodologyCard hasSegmentDeepDive={hasSegmentDeepDive} />

      {/* Grafieken + factortabel */}
      {hasEnoughData && (
        <>
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Signaalverdeling</h2>
              <RiskCharts
                distribution={riskDistribution}
                riskScores={responses.map(r => r.risk_score).filter(Boolean) as number[]}
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Organisatiefactoren</h2>
              <FactorTable factorAverages={factorData.orgAverages} />
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
            <RecommendationList factorAverages={factorData.orgAverages} />
          </div>
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
            responses={responses}
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

function MethodologyCard({ hasSegmentDeepDive }: { hasSegmentDeepDive: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Methodologie & uitleg</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Verisight maakt zichtbaar waar uitstroompatronen terugkeren en waar vervolgactie waarschijnlijk het meeste
            oplevert. De uitkomsten zijn bedoeld om beter te prioriteren en door te vragen, niet om oorzaken definitief
            vast te stellen.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Frictiescore</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Schaal 1–10. Hogere score betekent dat werkfrictie in deze groep duidelijker terugkomt. Gebruik dit als
            prioriteringssignaal, niet als voorspelling.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signaalbanden</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            `Laag`, `Midden` en `Hoog` laten zien hoeveel aandacht een patroon vraagt. Ze helpen HR en MT bepalen wat
            eerst besproken of gevalideerd moet worden.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Betrouwbaarheid</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Grafieken en patroonanalyse tonen we pas vanaf minimaal 10 responses. Subgroepvergelijkingen blijven uit
            beeld bij kleine aantallen om ruis en herleidbaarheid te beperken.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Segment deep dive</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {hasSegmentDeepDive
              ? 'Deze campagne gebruikt segment deep dive. Verschillen tussen afdelingen, functieniveaus of diensttijd laten zien waar vervolgvalidatie waarschijnlijk het meeste oplevert. De vergelijking is beschrijvend, niet causaal.'
              : 'Als segment deep dive aanstaat, laat Verisight zien welke subgroepen relatief afwijken van het organisatieniveau. Dat helpt vooral bepalen waar vervolgvragen het meeste opleveren.'}
          </p>
        </div>
      </div>
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

// ── Campaign Health Indicator ────────────────────────────────────────────────

function CampaignHealthIndicator({
  totalInvited,
  totalCompleted,
  completionRate,
  invitesNotSent,
  incompleteScores,
  isActive,
  hasEnoughData,
  hasMinDisplay,
}: {
  totalInvited: number
  totalCompleted: number
  completionRate: number
  invitesNotSent: number
  incompleteScores: number
  isActive: boolean
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
