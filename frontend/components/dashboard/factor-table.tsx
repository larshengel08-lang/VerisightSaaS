'use client'

import { buildFactorPresentation, getRiskBandFromScore, RISK_BG_COLORS, RISK_COLORS } from '@/lib/management-language'
import { FACTOR_LABELS } from '@/lib/types'
import type { ScanType } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

type FactorTrend = {
  delta: number
  direction: 'up' | 'down' | 'neutral'
}

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
  previousFactorAverages?: Record<string, number>
}

function getFactorTrend(score: number, previousScore: number): FactorTrend {
  const delta = score - previousScore

  if (delta > 0.3) return { delta, direction: 'up' }
  if (delta < -0.3) return { delta, direction: 'down' }
  return { delta, direction: 'neutral' }
}

function TrendIndicator({ direction }: { direction: FactorTrend['direction'] }) {
  const color =
    direction === 'up' ? '#2E7C6D' : direction === 'down' ? '#C65B52' : '#8A7D6E'

  if (direction === 'up') {
    return (
      <svg aria-hidden="true" viewBox="0 0 10 10" className="h-2.5 w-2.5" style={{ color }}>
        <path d="M5 1 9 6H6.25V9H3.75V6H1z" fill="currentColor" />
      </svg>
    )
  }

  if (direction === 'down') {
    return (
      <svg aria-hidden="true" viewBox="0 0 10 10" className="h-2.5 w-2.5" style={{ color }}>
        <path d="M3.75 1h2.5v3H9L5 9 1 4h2.75z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" className="h-2.5 w-2.5" style={{ color }}>
      <rect x="1.5" y="4.25" width="7" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  )
}

export function FactorTable({ factorAverages, scanType, previousFactorAverages }: Props) {
  const rows = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
    .map((factor) => {
      const score = factorAverages[factor]
      const riskVal = 11 - score
      const band = getRiskBandFromScore(riskVal)
      const presentation = buildFactorPresentation({ score, signalScore: riskVal })
      const previousScore = previousFactorAverages?.[factor]
      const trend =
        typeof previousScore === 'number' ? getFactorTrend(score, previousScore) : null

      return { factor, score, riskVal, band, presentation, previousScore, trend }
    })
    .sort((left, right) => right.riskVal - left.riskVal)

  const introText =
    scanType === 'exit'
      ? 'De belevingsscore laat zien hoe vertrekkers een thema gemiddeld ervoeren. Het managementlabel vertaalt dat naar wat dit bestuurlijk nu vraagt.'
      : scanType === 'team'
        ? 'De belevingsscore laat zien hoe medewerkers hun directe werkcontext gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit lokaal bestuurlijk vraagt.'
        : scanType === 'onboarding'
          ? 'De belevingsscore laat zien hoe nieuwe medewerkers dit checkpoint gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit in de vroege managementread vraagt.'
          : 'De belevingsscore laat zien hoe medewerkers een thema gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit bestuurlijk vraagt voor behoud.'

  const bandLabels = { HOOG: 'Direct prioriteren', MIDDEN: 'Eerst toetsen', LAAG: 'Volgen' }

  return (
    <div className="space-y-1">
      <p className="mb-4 text-[0.85rem] leading-6 text-[color:var(--dashboard-muted)]">{introText}</p>
      {rows.map((row, index) => (
        <div
          key={row.factor}
          className="flex items-center gap-4 py-3"
          style={{
            borderBottom: index < rows.length - 1 ? '1px solid rgba(19,32,51,0.06)' : undefined,
          }}
        >
          <span className="w-40 shrink-0 text-[0.875rem] text-[color:var(--dashboard-ink)]">
            {FACTOR_LABELS[row.factor]}
          </span>

          <div className="h-[6px] flex-1 overflow-hidden rounded-[3px] bg-[rgba(19,32,51,0.08)]">
            <div
              className="h-full rounded-[3px]"
              style={{
                width: `${((row.score - 1) / 9) * 100}%`,
                backgroundColor: RISK_COLORS[row.band],
              }}
            />
          </div>

          <span className="w-20 shrink-0 text-right text-[0.875rem] font-medium text-[color:var(--dashboard-ink)]">
            <span className="inline-flex items-center justify-end gap-1.5">
              <span>{row.presentation.scoreDisplay}</span>
              {row.trend && typeof row.previousScore === 'number' ? (
                <span
                  className="inline-flex items-center"
                  title={`Vorige score: ${row.previousScore.toFixed(1)}/10`}
                  aria-label={`Vorige score: ${row.previousScore.toFixed(1)}/10`}
                >
                  <TrendIndicator direction={row.trend.direction} />
                </span>
              ) : null}
            </span>
          </span>

          <span
            className="min-w-[7rem] shrink-0 rounded-full px-2.5 py-0.5 text-center text-[0.65rem] font-medium uppercase tracking-[0.04em]"
            style={{
              background: RISK_BG_COLORS[row.band],
              color: RISK_COLORS[row.band],
            }}
          >
            {bandLabels[row.band]}
          </span>
        </div>
      ))}
    </div>
  )
}
