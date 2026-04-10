'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  type PieLabelRenderProps,
} from 'recharts'

interface Props {
  distribution: { HOOG: number; MIDDEN: number; LAAG: number }
  riskScores: number[]
}

const COLORS = { HOOG: '#DC2626', MIDDEN: '#F59E0B', LAAG: '#16A34A' }

export function RiskCharts({ distribution, riskScores }: Props) {
  const pieData = [
    { name: 'Hoog signaal', value: distribution.HOOG, color: COLORS.HOOG },
    { name: 'Middensignaal', value: distribution.MIDDEN, color: COLORS.MIDDEN },
    { name: 'Laag signaal', value: distribution.LAAG, color: COLORS.LAAG },
  ].filter(d => d.value > 0)

  // Histogram bins 1–10 (9 bins: 1-2, 2-3, …, 9-10 incl.)
  const bins = Array.from({ length: 9 }, (_, i) => {
    const lo = i + 1
    const hi = i + 2
    return {
      range: `${lo}–${hi}`,
      // Laatste bin (9–10) is inclusief de bovengrens zodat score=10 niet valt buiten het histogram
      count: riskScores.filter(s => s >= lo && (i === 8 ? s <= hi : s < hi)).length,
    }
  })

  const avg = riskScores.length
    ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length
    : null

  return (
    <div className="space-y-4">
      {/* Donut */}
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
            {pieData.map(entry => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v} responses`]} />
        </PieChart>
      </ResponsiveContainer>

      {/* Histogram */}
      {avg && (
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={bins} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <ReferenceLine x={`${Math.floor(avg)}–${Math.ceil(avg)}`} stroke="#6B7280" strokeDasharray="3 3" />
            <Bar dataKey="count" fill="#2563EB" radius={[2, 2, 0, 0]} />
            <Tooltip formatter={(v) => [`${v} responses`, 'Aantal']} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
