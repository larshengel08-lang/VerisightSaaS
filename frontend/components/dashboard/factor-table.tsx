'use client'

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
      const urgency  = riskVal >= 7 ? 'URGENT' : riskVal >= 4.5 ? 'AANDACHT' : 'OK'
      return { factor: f, score, riskVal, urgency }
    })
    .sort((a, b) => b.riskVal - a.riskVal)

  const urgencyStyle: Record<string, string> = {
    URGENT:   'bg-red-100 text-red-700',
    AANDACHT: 'bg-amber-100 text-amber-700',
    OK:       'bg-green-100 text-green-700',
  }
  const urgencyCopy =
    scanType === 'exit'
      ? {
          URGENT: 'NU DUIDEN',
          AANDACHT: 'DOORVRAGEN',
          OK: 'MONITOREN',
        }
      : {
          URGENT: 'URGENT',
          AANDACHT: 'AANDACHT',
          OK: 'MONITOREN',
        }
  const introText =
    scanType === 'exit'
      ? 'De belevingsscore laat zien hoe vertrekkers een thema gemiddeld ervoeren. De frictiescore per factor vertaalt dat naar prioriteit voor vertrekduiding: hoe hoger de signalering, hoe eerder dit thema managementverificatie verdient.'
      : `De belevingsscore laat zien hoe medewerkers een thema gemiddeld ervaren. Het ${scanDefinition.signalLabelLower} per factor vertaalt dat naar prioriteit voor behoudsduiding: hoe hoger de signalering, hoe eerder dit thema verificatie en opvolging vraagt.`

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
                  row.urgency === 'URGENT' ? '#DC2626'
                  : row.urgency === 'AANDACHT' ? '#F59E0B'
                  : '#16A34A',
              }}
            />
          </div>

          {/* Score */}
          <span className="text-sm font-semibold text-gray-800 w-20 text-right">
            {row.riskVal.toFixed(1)}
          </span>

          {/* Badge */}
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded w-20 text-center ${urgencyStyle[row.urgency]}`}>
            {urgencyCopy[row.urgency as keyof typeof urgencyCopy]}
          </span>
        </div>
      ))}
    </div>
  )
}
