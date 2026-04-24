'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  type PieLabelRenderProps,
} from 'recharts'
import { getManagementBandLabel } from '@/lib/management-language'
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
      ? { HOOG: getManagementBandLabel('HOOG'), MIDDEN: getManagementBandLabel('MIDDEN'), LAAG: getManagementBandLabel('LAAG') }
      : scanType === 'team'
        ? { HOOG: 'Direct lokaal aandachtspunt', MIDDEN: 'Lokaal aandacht nodig', LAAG: 'Lokaal voorlopig stabiel' }
        : scanType === 'onboarding'
          ? { HOOG: 'Direct checkpoint aandachtspunt', MIDDEN: 'Checkpoint aandacht nodig', LAAG: 'Checkpoint voorlopig stabiel' }
      : { HOOG: getManagementBandLabel('HOOG'), MIDDEN: getManagementBandLabel('MIDDEN'), LAAG: getManagementBandLabel('LAAG') }
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
      ? 'De signaalverdeling laat zien hoe breed het vertrekbeeld is verdeeld over voorlopige stabiliteit, aandacht en directe aandachtspunten. Dat helpt bepalen hoe scherp de managementread nu is.'
      : scanType === 'team'
        ? 'De signaalverdeling laat zien hoe breed het huidige lokale beeld is verdeeld over directe aandachtspunten, aandacht en voorlopige stabiliteit.'
        : scanType === 'onboarding'
          ? 'De signaalverdeling laat zien hoe breed het huidige onboardingcheckpoint is verdeeld over directe aandachtspunten, aandacht en voorlopige stabiliteit. Dat helpt bepalen of dit meetmoment vooral borging of juist een eerste correctie vraagt.'
      : 'De signaalverdeling laat zien hoe responses zijn verdeeld over voorlopige stabiliteit, aandacht en directe aandachtspunten. Dit zegt iets over de breedte en intensiteit van signalen in de groep, niet over een bewezen oorzaak.'

  const insightText = scanType === 'exit'
    ? dominantBand.band === 'HOOG'
      ? `${dominantPercent}% van de exitresponses valt in ${getManagementBandLabel('HOOG').toLowerCase()}. Dat wijst op een breder werkgerelateerd vertrekbeeld dat eerst managementverificatie verdient.`
      : dominantBand.band === 'LAAG'
        ? `${dominantPercent}% van de exitresponses valt in ${getManagementBandLabel('LAAG').toLowerCase()}. Dat wijst niet op een breed werkpatroon, maar laat nog steeds ruimte voor afwijkende factoren, teams of vertrekredenen.`
        : `${dominantPercent}% van de exitresponses valt in ${getManagementBandLabel('MIDDEN').toLowerCase()}. Dat past bij een beeld met terugkerende signalen, maar nog zonder eenduidige managementduiding.`
    : scanType === 'team'
      ? dominantBand.band === 'HOOG'
        ? `${dominantPercent}% van de responses valt in direct lokaal aandachtspunt. Voor HR wijst dit op een scherp lokaal spoor: kijk eerst naar afdelingen, topfactoren en veilige lokale context.`
        : dominantBand.band === 'LAAG'
          ? `${dominantPercent}% van de responses valt in lokaal voorlopig stabiel. Voor HR wijst dit niet op een breed lokaal probleem, maar afdelingen en topfactoren kunnen nog steeds verificatie vragen.`
          : `${dominantPercent}% van de responses valt in lokaal aandacht nodig. Voor HR betekent dit meestal dat lokalisatie mogelijk is, maar nog terughoudend gelezen moet worden.`
      : scanType === 'onboarding'
        ? dominantBand.band === 'HOOG'
          ? `${dominantPercent}% van de responses valt in direct checkpoint aandachtspunt. Voor HR wijst dit op een scherp vroeg spoor: kijk eerst naar de topfactoren en kies een kleine, zichtbare correctie voor het volgende checkpoint.`
          : dominantBand.band === 'LAAG'
            ? `${dominantPercent}% van de responses valt in checkpoint voorlopig stabiel. Voor HR wijst dit op een overwegend stabiele instroomervaring, maar topfactoren blijven nuttig om te borgen wat werkt.`
            : `${dominantPercent}% van de responses valt in checkpoint aandacht nodig. Voor HR betekent dit meestal dat de instroomervaring gemengd maar leesbaar is: kies eerst een beperkte managementvraag en houd de volgende check bewust bounded.`
      : dominantBand.band === 'HOOG'
      ? `${dominantPercent}% van de responses valt in ${getManagementBandLabel('HOOG').toLowerCase()}. Voor HR wijst dit op een breed en relatief scherp spoor: kijk eerst naar de topfactoren en plan snelle verdieping.`
      : dominantBand.band === 'LAAG'
        ? `${dominantPercent}% van de responses valt in ${getManagementBandLabel('LAAG').toLowerCase()}. Voor HR wijst dit niet op een breed ${scanDefinition.signalLabelLower}, maar het blijft zinvol om de opvallendste factoren en open antwoorden te controleren.`
        : `${dominantPercent}% van de responses valt in ${getManagementBandLabel('MIDDEN').toLowerCase()}. Voor HR betekent dit meestal geen eenduidig crisisbeeld, maar wel terugkerende signalering: gebruik de topfactoren en segmenten om gericht door te vragen.`

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">
          {scanType === 'exit'
            ? 'Wat zegt dit over het vertrekbeeld?'
            : scanType === 'team'
              ? 'Wat betekent dit voor lokale duiding?'
              : scanType === 'onboarding'
                ? 'Wat betekent dit voor dit checkpoint?'
              : 'Wat betekent dit voor behoudsduiding?'}
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
            <Bar dataKey="count" fill="#94A3B8" radius={[2, 2, 0, 0]} />
            <Tooltip formatter={(v) => [`${v} responses`, 'Aantal']} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
