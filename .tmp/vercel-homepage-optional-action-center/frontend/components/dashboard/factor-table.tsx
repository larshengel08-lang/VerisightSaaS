'use client'

import { buildFactorPresentation, getRiskBandFromScore, RISK_BG_COLORS, RISK_COLORS } from '@/lib/management-language'
import { FACTOR_LABELS } from '@/lib/types'
import type { ScanType } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
}

export function FactorTable({ factorAverages, scanType }: Props) {
  const rows = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
    .map((factor) => {
      const score = factorAverages[factor]
      const riskVal = 11 - score
      const band = getRiskBandFromScore(riskVal)
      const presentation = buildFactorPresentation({ score, signalScore: riskVal })
      return { factor, score, riskVal, band, presentation }
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

          <span className="w-16 shrink-0 text-right text-[0.875rem] font-medium text-[color:var(--dashboard-ink)]">
            {row.presentation.scoreDisplay}
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
