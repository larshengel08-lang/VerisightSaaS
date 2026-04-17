'use client'

import { buildFactorPresentation, getManagementBandBadgeClasses, getRiskBandFromScore } from '@/lib/management-language'
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
      ? 'De belevingsscore laat zien hoe vertrekkers een thema gemiddeld ervoeren. Het managementlabel vertaalt dat naar wat dit bestuurlijk nu vraagt. De signaallogica blijft ondersteunend en is geen tweede hoofdscore.'
      : scanType === 'team'
        ? `De belevingsscore laat zien hoe medewerkers hun directe werkcontext gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit lokaal bestuurlijk vraagt. Het ${scanDefinition.signalLabelLower} per factor blijft ondersteunende logica, geen tweede hoofdscore.`
      : scanType === 'onboarding'
        ? `De belevingsscore laat zien hoe nieuwe medewerkers dit checkpoint gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit in de vroege managementread vraagt. Het ${scanDefinition.signalLabelLower} per factor blijft ondersteunende logica, geen tweede hoofdscore.`
      : `De belevingsscore laat zien hoe medewerkers een thema gemiddeld ervaren. Het managementlabel vertaalt dat naar wat dit bestuurlijk vraagt voor behoud. Het ${scanDefinition.signalLabelLower} per factor blijft ondersteunende logica, geen tweede hoofdscore.`

  return (
    <div className="space-y-2">
      <p className="text-xs leading-5 text-gray-500">
        {introText} Het is geen extra meting of bewijslaag.
      </p>
      {rows.map(row => (
        <div key={row.factor} className="flex items-center gap-3">
          {/* Naam */}
          <span className="text-sm text-gray-700 w-44 flex-shrink-0">
            {FACTOR_LABELS[row.factor]}
          </span>

          {/* Balk */}
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${((row.score - 1) / 9) * 100}%`,
                backgroundColor:
                  row.band === 'HOOG' ? '#DC2626'
                  : row.band === 'MIDDEN' ? '#F59E0B'
                  : '#16A34A',
              }}
            />
          </div>

          {/* Score */}
          <span className="text-sm font-semibold text-gray-800 w-20 text-right">
            {row.presentation.scoreDisplay}
          </span>

          {/* Badge */}
          <span className={`text-xs font-bold px-2 py-0.5 rounded min-w-[124px] text-center ${getManagementBandBadgeClasses(row.band)}`}>
            {row.presentation.managementLabel}
          </span>
        </div>
      ))}
    </div>
  )
}
