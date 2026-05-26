'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getRiskBandFromScore, RISK_COLORS } from '@/lib/management-language'

type FactorRow = {
  factor: string
  score: string
  scoreValue: number
  signal?: string
  signalValue: number
  band: string
  note: string
}

type SdtRow = {
  factor: string
  score: string
  scoreValue: number
  signal: string
  band: string
  note: string
}

function getBandColor(signalValue: number) {
  return RISK_COLORS[getRiskBandFromScore(signalValue)]
}

export function ExitDriversPriorityChart({ rows }: { rows: FactorRow[] }) {
  const data = [...rows]
    .sort((left, right) => left.scoreValue - right.scoreValue)
    .map((row) => ({
      ...row,
      value: Number(row.scoreValue.toFixed(1)),
      fill: getBandColor(row.signalValue),
    }))

  return (
    <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-white/82 p-5">
      <p className="text-sm font-medium text-slate-400">Prioriteitenbeeld</p>
      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 28, bottom: 12, left: 12 }}
          >
            <CartesianGrid stroke="#E9E5DE" horizontal={false} />
            <ReferenceLine x={5.5} stroke="#D5CEC4" strokeDasharray="4 4" />
            <XAxis
              type="number"
              dataKey="value"
              domain={[1, 10]}
              tick={{ fontSize: 11, fill: '#7C8A95' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="factor"
              width={140}
              tick={{ fontSize: 12, fill: '#4B5563' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(36,50,71,0.04)' }}
              formatter={(value, _name, item) => {
                const row = item.payload as (typeof data)[number]
                return [`${Number(value).toFixed(1)}`, row.factor]
              }}
              labelFormatter={(_label, payload) => {
                const row = payload?.[0]?.payload as ((typeof data)[number] | undefined)
                return row ? `${row.factor} · ${row.note}` : ''
              }}
            />
            <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={34}>
              {data.map((entry) => (
                <Cell key={entry.factor} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                formatter={(value) => Number(value).toFixed(1)}
                fill="#243247"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ExitSdtNeedsChart({ rows }: { rows: SdtRow[] }) {
  const orderedRows = [...rows].reverse().map((row) => ({
    ...row,
    value: Number(row.scoreValue.toFixed(1)),
  }))

  return (
    <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-white/82 p-5">
      <p className="text-sm font-medium text-slate-400">SDT-basisbehoeften</p>
      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={orderedRows}
            layout="vertical"
            margin={{ top: 10, right: 24, bottom: 10, left: 34 }}
          >
            <CartesianGrid stroke="#EFE8DE" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: '#7C8A95' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Score (1-10)',
                position: 'insideBottom',
                offset: -6,
                fill: '#64748B',
                fontSize: 12,
              }}
            />
            <YAxis
              type="category"
              dataKey="factor"
              width={120}
              tick={{ fontSize: 12, fill: '#4B5563' }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={5.5} stroke="#CBD5E1" strokeDasharray="4 4" />
            <ReferenceLine x={7} stroke="#F1998F" strokeDasharray="2 3" />
            <Tooltip formatter={(value) => `${Number(value).toFixed(1)}/10`} />
            <Bar dataKey="value" fill="#D19422" radius={[0, 0, 0, 0]} barSize={42}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value) => Number(value).toFixed(1)}
                fill="#4B5563"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ExitOrgFactorsChart({ rows }: { rows: FactorRow[] }) {
  const data = [...rows].map((row) => ({
    ...row,
    value: Number(row.scoreValue.toFixed(1)),
  }))

  return (
    <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-white/82 p-5">
      <p className="text-sm font-medium text-slate-400">Organisatiefactoren</p>
      <div className="mt-4 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 24, bottom: 10, left: 24 }}
          >
            <CartesianGrid stroke="#EFE8DE" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: '#7C8A95' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="factor"
              width={136}
              tick={{ fontSize: 12, fill: '#4B5563' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}/10`}
              labelFormatter={(label) => String(label)}
            />
            <Bar dataKey="value" fill="#243247" radius={[0, 0, 0, 0]} barSize={34}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value) => Number(value).toFixed(1)}
                fill="#4B5563"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
