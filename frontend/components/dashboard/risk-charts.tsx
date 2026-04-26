'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  type PieLabelRenderProps,
} from 'recharts'
import { getManagementBandLabel, RISK_COLORS } from '@/lib/management-language'
import type { ScanType } from '@/lib/types'

interface Props {
  distribution: { HOOG: number; MIDDEN: number; LAAG: number }
  histogramBins: { range: string; count: number }[]
  averageScore: number | null
  scanType: ScanType
}

export function StackedRiskBar({
  distribution,
}: {
  distribution: { HOOG: number; MIDDEN: number; LAAG: number }
}) {
  const total = distribution.HOOG + distribution.MIDDEN + distribution.LAAG
  if (total === 0) return null

  const segments = [
    { key: 'HOOG' as const, label: 'Direct prioriteren', value: distribution.HOOG },
    { key: 'MIDDEN' as const, label: 'Eerst toetsen', value: distribution.MIDDEN },
    { key: 'LAAG' as const, label: 'Volgen', value: distribution.LAAG },
  ].filter((segment) => segment.value > 0)

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((segment) => (
          <div
            key={segment.key}
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: RISK_COLORS[segment.key],
            }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: RISK_COLORS[segment.key] }} />
            <span className="text-[0.75rem] text-[color:var(--dashboard-text)]">
              {segment.label}{' '}
              <span className="font-medium text-[color:var(--dashboard-ink)]">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RiskCharts({ distribution, histogramBins, averageScore, scanType }: Props) {
  const totalResponses = distribution.HOOG + distribution.MIDDEN + distribution.LAAG
  const pieLabels =
    scanType === 'exit'
      ? { HOOG: getManagementBandLabel('HOOG'), MIDDEN: getManagementBandLabel('MIDDEN'), LAAG: getManagementBandLabel('LAAG') }
      : scanType === 'team'
        ? { HOOG: 'Direct lokaal aandachtspunt', MIDDEN: 'Lokaal aandacht nodig', LAAG: 'Lokaal voorlopig stabiel' }
        : scanType === 'onboarding'
          ? { HOOG: 'Direct checkpoint aandachtspunt', MIDDEN: 'Checkpoint aandacht nodig', LAAG: 'Checkpoint voorlopig stabiel' }
          : { HOOG: getManagementBandLabel('HOOG'), MIDDEN: getManagementBandLabel('MIDDEN'), LAAG: getManagementBandLabel('LAAG') }

  const pieData = [
    { name: pieLabels.HOOG, value: distribution.HOOG, color: RISK_COLORS.HOOG },
    { name: pieLabels.MIDDEN, value: distribution.MIDDEN, color: RISK_COLORS.MIDDEN },
    { name: pieLabels.LAAG, value: distribution.LAAG, color: RISK_COLORS.LAAG },
  ].filter((distributionItem) => distributionItem.value > 0)

  const dominantBand = [
    { band: 'HOOG', value: distribution.HOOG },
    { band: 'MIDDEN', value: distribution.MIDDEN },
    { band: 'LAAG', value: distribution.LAAG },
  ].sort((left, right) => right.value - left.value)[0]

  const dominantPercent = totalResponses > 0 ? Math.round((dominantBand.value / totalResponses) * 100) : 0

  const introText =
    scanType === 'exit'
      ? 'De signaalverdeling laat zien hoe breed het vertrekbeeld is verdeeld over voorlopige stabiliteit, aandacht en directe aandachtspunten.'
      : scanType === 'team'
        ? 'De signaalverdeling laat zien hoe breed het huidige lokale beeld is verdeeld over directe aandachtspunten, aandacht en voorlopige stabiliteit.'
        : scanType === 'onboarding'
          ? 'De signaalverdeling laat zien hoe breed het huidige onboardingcheckpoint is verdeeld over directe aandachtspunten, aandacht en voorlopige stabiliteit.'
          : 'De signaalverdeling laat zien hoe reacties zijn verdeeld over voorlopige stabiliteit, aandacht en directe aandachtspunten.'

  const insightText = scanType === 'exit'
    ? dominantBand.band === 'HOOG'
      ? `${dominantPercent}% van de exitreacties valt in ${getManagementBandLabel('HOOG').toLowerCase()}. Dat wijst op een breder werkgerelateerd vertrekbeeld dat eerst managementverificatie verdient.`
      : dominantBand.band === 'LAAG'
        ? `${dominantPercent}% van de exitreacties valt in ${getManagementBandLabel('LAAG').toLowerCase()}. Dat wijst niet op een breed werkpatroon, maar laat nog steeds ruimte voor afwijkende factoren.`
        : `${dominantPercent}% van de exitreacties valt in ${getManagementBandLabel('MIDDEN').toLowerCase()}. Dat past bij een beeld met terugkerende signalen, maar nog zonder eenduidige managementduiding.`
    : dominantBand.band === 'HOOG'
      ? `${dominantPercent}% van de reacties valt in de hoogste risicoband. Kijk eerst naar de topfactoren en plan snelle verdieping.`
      : dominantBand.band === 'LAAG'
        ? `${dominantPercent}% van de reacties valt in de laagste risicoband. Het blijft zinvol om de opvallendste factoren te controleren.`
        : `${dominantPercent}% van de reacties valt in de middelste risicoband. Gebruik de topfactoren om gericht door te vragen.`

  return (
    <div className="space-y-6">
      <StackedRiskBar distribution={distribution} />

      <div className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-4 text-sm text-[color:var(--dashboard-text)]">
        <p className="font-medium text-[color:var(--dashboard-ink)]">
          {scanType === 'exit'
            ? 'Wat zegt dit over het vertrekbeeld?'
            : scanType === 'team'
              ? 'Wat betekent dit voor lokale duiding?'
              : scanType === 'onboarding'
                ? 'Wat betekent dit voor dit checkpoint?'
                : 'Wat betekent dit voor behoudsduiding?'}
        </p>
        <p className="mt-1">{introText}</p>
        <p className="mt-2 text-[color:var(--dashboard-ink)]">{insightText}</p>
      </div>

      {averageScore !== null ? (
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={histogramBins} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#7c8a95' }} />
            <YAxis tick={{ fontSize: 10, fill: '#7c8a95' }} allowDecimals={false} />
            <ReferenceLine
              x={`${Math.floor(averageScore)}-${Math.ceil(averageScore)}`}
              stroke="#7C8A95"
              strokeDasharray="3 3"
            />
            <Bar dataKey="count" fill="#94A3B8" radius={[2, 2, 0, 0]} />
            <Tooltip formatter={(value) => [`${value} reacties`, 'Aantal']} />
          </BarChart>
        </ResponsiveContainer>
      ) : null}

      <details>
        <summary className="cursor-pointer select-none text-[0.8rem] text-[color:var(--dashboard-muted)]">
          Toon taartdiagram
        </summary>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
              label={({ name, percent }: PieLabelRenderProps) =>
                (percent ?? 0) > 0.05 ? `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {pieData.map((distributionItem) => (
                <Cell key={distributionItem.name} fill={distributionItem.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} reacties`]} />
          </PieChart>
        </ResponsiveContainer>
      </details>
    </div>
  )
}
