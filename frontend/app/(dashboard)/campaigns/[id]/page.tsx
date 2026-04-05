import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RiskCharts } from '@/components/dashboard/risk-charts'
import { FactorTable } from '@/components/dashboard/factor-table'
import { RecommendationList } from '@/components/dashboard/recommendation-list'
import { RespondentTable } from '@/components/dashboard/respondent-table'
import type { CampaignStats, SurveyResponse, Respondent } from '@/lib/types'
import { FACTOR_LABELS } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Campaign stats
  const { data: statsRow } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('campaign_id', id)
    .single()

  if (!statsRow) notFound()
  const stats = statsRow as CampaignStats

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
  const MIN_N = 5
  const hasEnoughData = responses.length >= MIN_N

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
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
          <PdfDownloadButton campaignId={id} campaignName={stats.campaign_name} />
        </div>
      </div>

      {/* KPI-rij */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Uitgenodigd"  value={stats.total_invited} />
        <KpiCard label="Ingevuld"     value={stats.total_completed} />
        <KpiCard label="Respons"      value={`${stats.completion_rate_pct ?? 0}%`} />
        <KpiCard
          label="Gem. risico"
          value={stats.avg_risk_score ? `${stats.avg_risk_score.toFixed(1)}/10` : '–'}
          accent={stats.avg_risk_score ? true : false}
        />
        <KpiCard
          label="Vermijdbaar"
          value={hasEnoughData ? `${computeAvoidableRate(responses)}%` : '–'}
        />
      </div>

      {!hasEnoughData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-6">
          Minimaal {MIN_N} responses nodig voor patroonanalyse en grafieken (nu: {responses.length}).
        </div>
      )}

      {/* Grafieken + factortabel */}
      {hasEnoughData && (
        <>
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Risicodistributie</h2>
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

          {/* Aanbevelingen */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Prioritaire aanbevelingen</h2>
            <RecommendationList factorAverages={factorData.orgAverages} />
          </div>
        </>
      )}

      {/* Respondenten */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Respondenten</h2>
        <RespondentTable
          respondents={respondents}
          responses={responses}
          scanType={stats.scan_type}
        />
      </div>
    </div>
  )
}

// ── Hulpcomponenten ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className={`text-xl font-bold ${accent ? 'text-blue-600' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
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

function PdfDownloadButton({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  // Server action voor PDF download via FastAPI
  return (
    <a
      href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/campaigns/${campaignId}/report-public`}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
      download={`RetentionPulse_${campaignName.replace(/ /g, '_')}.pdf`}
    >
      ⬇ PDF-rapport
    </a>
  )
}

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

function computeAvoidableRate(responses: SurveyResponse[]) {
  const total    = responses.filter(r => r.preventability).length
  const avoidable = responses.filter(r => r.preventability === 'REDBAAR').length
  if (!total) return 0
  return Math.round((avoidable / total) * 100)
}
