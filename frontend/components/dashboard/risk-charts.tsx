'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  type PieLabelRenderProps,
} from 'recharts'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { ScanType } from '@/lib/types'

interface Props {
  distribution: { HOOG: number; MIDDEN: number; LAAG: number }
  histogramBins: { range: string; count: number }[]
  averageScore: number | null
  scanType: ScanType
}

const COLORS = { HOOG: '#DC2626', MIDDEN: '#F59E0B', LAAG: '#16A34A' }

export function RiskCharts({ distribution, histogramBins, averageScore, scanType }: Props) {
  const scanDefinition = getScanDefinition(scanType)
  const totalResponses = distribution.HOOG + distribution.MIDDEN + distribution.LAAG
  const pieLabels =
    scanType === 'exit'
      ? { HOOG: 'Hoog frictiesignaal', MIDDEN: 'Gemengd beeld', LAAG: 'Beperkt werksignaal' }
      : { HOOG: 'Hoog signaal', MIDDEN: 'Middensignaal', LAAG: 'Laag signaal' }
  const pieData = [
    { name: pieLabels.HOOG, value: distribution.HOOG, color: COLORS.HOOG },
    { name: pieLabels.MIDDEN, value: distribution.MIDDEN, color: COLORS.MIDDEN },
    { name: pieLabels.LAAG, value: distribution.LAAG, color: COLORS.LAAG },
  ].filter((d) => d.value > 0)

  const dominantBand = [
    { band: 'HOOG', value: distribution.HOOG },
    { band: 'MIDDEN', value: distribution.MIDDEN },
    { band: 'LAAG', value: distribution.LAAG },
  ].sort((a, b) => b.value - a.value)[0]

  const dominantPercent = totalResponses > 0
    ? Math.round((dominantBand.value / totalResponses) * 100)
    : 0

  const introText =
    scanType === 'exit'
      ? 'De signaalverdeling laat zien hoeveel exitresponses vallen in laag, midden en hoog frictiesignaal. Dat helpt bepalen of vertrek vooral incidenteel, gemengd of breder werkgerelateerd leest.'
      : 'De signaalverdeling laat zien hoe responses zijn verdeeld over laag, midden en hoog aandachtssignaal. Dit zegt iets over de breedte en intensiteit van signalen in de groep, niet over een bewezen oorzaak.'

  const insightText = scanType === 'exit'
    ? dominantBand.band === 'HOOG'
      ? `${dominantPercent}% van de exitresponses valt in hoog frictiesignaal. Dat wijst op een breder werkgerelateerd vertrekbeeld dat eerst managementverificatie verdient.`
      : dominantBand.band === 'LAAG'
        ? `${dominantPercent}% van de exitresponses valt in laag frictiesignaal. Dat wijst niet op een breed werkpatroon, maar laat nog steeds ruimte voor afwijkende factoren of teams.`
        : `${dominantPercent}% van de exitresponses valt in het middengebied. Dat past vaak bij een gemengd vertrekbeeld: wel signalen, maar nog geen eenduidige managementverklaring.`
    : dominantBand.band === 'HOOG'
      ? `${dominantPercent}% van de responses valt in hoog signaal. Voor HR wijst dit op een breed en relatief scherp aandachtssignaal: kijk eerst naar de topfactoren en plan snelle verdieping.`
      : dominantBand.band === 'LAAG'
        ? `${dominantPercent}% van de responses valt in laag signaal. Voor HR wijst dit niet op een breed ${scanDefinition.signalLabelLower}, maar het blijft zinvol om de opvallendste factoren en open antwoorden te controleren.`
        : `${dominantPercent}% van de responses valt in middensignaal. Voor HR betekent dit meestal geen eenduidig crisisbeeld, maar wel terugkerende signalering: gebruik de topfactoren en segmenten om gericht door te vragen.`

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">
          {scanType === 'exit' ? 'Wat zegt dit over vertrekduiding?' : 'Wat betekent signaalverdeling?'}
        </p>
        <p className="mt-1">{introText}</p>
        <p className="mt-2 text-slate-800">{insightText}</p>
      </div>

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
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v} responses`]} />
        </PieChart>
      </ResponsiveContainer>

      {averageScore !== null && (
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={histogramBins} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <ReferenceLine
              x={`${Math.floor(averageScore)}-${Math.ceil(averageScore)}`}
              stroke="#6B7280"
              strokeDasharray="3 3"
            />
            <Bar dataKey="count" fill="#2563EB" radius={[2, 2, 0, 0]} />
            <Tooltip formatter={(v) => [`${v} responses`, 'Aantal']} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
