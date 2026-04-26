'use client'

import { buildFactorPresentation, getRiskBandFromScore, RISK_COLORS, RISK_BG_COLORS } from '@/lib/management-language'
import { getScanDefinition } from '@/lib/scan-definitions'
import { FACTOR_LABELS } from '@/lib/types'
import type { ScanType } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
}

export function FactorTable({ factorAverages, scanType }: Props) {
  const scanDefinition = getScanDefinition(scanType)
  const rows = ORG_FACTORS
    .filter(f => f in factorAverages)
    .map(f => {
      const score    = factorAverages[f]
      const riskVal  = 11 - score
      const band = getRiskBandFromScore(riskVal)
      const presentation = buildFactorPresentation({ score, signalScore: riskVal })
      return { factor: f, score, riskVal, band, presentation }
    })
    .sort((a, b) => b.riskVal - a.riskVal)

  const introText =
    scanType === 'exit'
      ? 'De belevingsscore laat zien hoe vertrekkers een thema gemiddeld ervoeren. Het managementlabel vertaalt dat naar wat dit bestuurlijk nu vraagt.'
      : scanType === 'team'
        ? `De belevingsscore laat zien hoe medewerkers hun directe werkcontext gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit lokaal bestuurlijk vraagt.`
      : scanType === 'onboarding'
        ? `De belevingsscore laat zien hoe nieuwe medewerkers dit checkpoint gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit in de vroege managementread vraagt.`
      : `De belevingsscore laat zien hoe medewerkers een thema gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit bestuurlijk vraagt voor behoud.`

  const BAND_LABELS = { HOOG: 'Direct prioriteren', MIDDEN: 'Eerst toetsen', LAAG: 'Volgen' }

  return (
    <div className="space-y-1">
      <p className="mb-4 text-[0.85rem] leading-6" style={{ color: 'var(--dashboard-muted)' }}>
        {introText}
      </p>
      {rows.map((row, i) => (
        <div
          key={row.factor}
          className="flex items-center gap-4 py-3"
          style={{
            borderBottom: i < rows.length - 1 ? '1px solid rgba(19,32,51,0.06)' : undefined,
          }}
        >
          {/* Factor label */}
          <span
            className="w-40 shrink-0 text-[0.875rem]"
            style={{ color: 'var(--dashboard-ink)' }}
          >
            {FACTOR_LABELS[row.factor]}
          </span>

          {/* Progress bar */}
          <div
            className="h-[6px] flex-1 overflow-hidden rounded-[3px]"
            style={{ background: 'rgba(19,32,51,0.08)' }}
          >
            <div
              className="h-full rounded-[3px] transition-all"
              style={{
                width: `${((row.score - 1) / 9) * 100}%`,
                backgroundColor: RISK_COLORS[row.band],
              }}
            />
          </div>

          {/* Score */}
          <span
            className="w-16 shrink-0 text-right text-[0.875rem] font-medium"
            style={{ color: 'var(--dashboard-ink)' }}
          >
            {row.presentation.scoreDisplay}
          </span>

          {/* Badge pill */}
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase"
            style={{
              background: RISK_BG_COLORS[row.band],
              color: RISK_COLORS[row.band],
              letterSpacing: '0.04em',
              minWidth: '7rem',
              textAlign: 'center',
            }}
          >
            {BAND_LABELS[row.band]}
          </span>
        </div>
      ))}
    </div>
  )
}
