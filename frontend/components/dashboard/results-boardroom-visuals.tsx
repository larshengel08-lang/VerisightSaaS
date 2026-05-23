'use client'

import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getRiskBandFromScore, RISK_COLORS } from '@/lib/management-language'

export type BoardroomFactorRow = {
  factor: string
  score: string
  scoreValue: number
  signal?: string
  signalValue: number
  band: string
  note: string
  question?: string
}

export type BoardroomSdtRow = {
  factor: string
  score: string
  scoreValue: number
  signal: string
  band: string
  note: string
}

export type CompositionSegment = {
  label: string
  value: string
  percent: number
}

function getBandColor(signalValue: number) {
  return RISK_COLORS[getRiskBandFromScore(signalValue)]
}

function formatTooltipValue(value: unknown) {
  return typeof value === 'number' ? `${value.toFixed(1)}/10` : 'Nog niet beschikbaar'
}

export function PriorityScatterPlot({
  rows,
  xLabel = 'Beleving',
  yLabel = 'Bestuurlijke aandacht',
}: {
  rows: BoardroomFactorRow[]
  xLabel?: string
  yLabel?: string
}) {
  const data = rows.map((row, index) => ({
    ...row,
    x: Number(row.scoreValue.toFixed(1)),
    y: Number(row.signalValue.toFixed(1)),
    fill: getBandColor(row.signalValue),
    displayLabel: index < 3 ? row.factor : '',
  }))

  return (
    <div className="space-y-4 border border-[rgba(13,27,42,0.15)] bg-white p-4 sm:p-5">
      <div className="grid gap-px border border-[rgba(13,27,42,0.15)] bg-[rgba(13,27,42,0.15)] sm:grid-cols-3">
        {[
          {
            title: 'Volgen',
            body: 'Linksonder: signalen blijven zichtbaar, maar vragen nu nog geen eerste MT-prioriteit.',
          },
          {
            title: 'Eerst toetsen',
            body: 'Middengebied: eerst verifiëren of het beeld structureel terugkomt.',
          },
          {
            title: 'Direct prioriteren',
            body: 'Rechtsboven: lage beleving en hoge bestuurlijke aandacht vragen eerst MT-aandacht.',
          },
        ].map((zone) => (
          <div key={zone.title} className="space-y-2 bg-[#F4F1EA] px-4 py-3">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
              {zone.title}
            </p>
            <p className="text-sm leading-6 text-[#44505C]">{zone.body}</p>
          </div>
        ))}
      </div>

      <div className="h-[330px] w-full border border-[rgba(13,27,42,0.15)] bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 24, right: 30, bottom: 22, left: 18 }}>
            <CartesianGrid stroke="rgba(13,27,42,0.08)" vertical={false} />
            <ReferenceArea x1={1} x2={4.5} y1={1} y2={4.5} fill="rgba(19,32,51,0.04)" />
            <ReferenceArea x1={4.5} x2={7} y1={4.5} y2={7} fill="rgba(244,241,234,0.9)" />
            <ReferenceArea x1={7} x2={10} y1={7} y2={10} fill="rgba(254,178,52,0.14)" />
            <ReferenceLine x={5.5} stroke="rgba(13,27,42,0.18)" strokeDasharray="4 4" />
            <ReferenceLine y={4.5} stroke="rgba(13,27,42,0.18)" strokeDasharray="4 4" />
            <ReferenceLine y={7} stroke="rgba(13,27,42,0.18)" strokeDasharray="4 4" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[1, 10]}
              tickCount={10}
              tick={{ fontSize: 11, fill: '#44505C' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: xLabel,
                position: 'insideBottom',
                offset: -4,
                fill: '#44505C',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[1, 10]}
              tickCount={10}
              tick={{ fontSize: 11, fill: '#44505C' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: yLabel,
                angle: -90,
                position: 'insideLeft',
                fill: '#44505C',
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '4 4', stroke: 'rgba(13,27,42,0.24)' }}
              formatter={(value, _name, item) => {
                const row = item.payload as (typeof data)[number]
                return [formatTooltipValue(value), row.factor]
              }}
              labelFormatter={(_label, payload) => {
                const row = payload?.[0]?.payload as (typeof data)[number] | undefined
                return row ? `${row.factor} — ${row.note}` : ''
              }}
              contentStyle={{
                borderRadius: 0,
                border: '1px solid rgba(13,27,42,0.15)',
                boxShadow: 'none',
                backgroundColor: '#ffffff',
              }}
            />
            <Scatter data={data}>
              {data.map((entry) => (
                <Cell key={entry.factor} fill={entry.fill} stroke="#132033" strokeWidth={1.25} />
              ))}
              <LabelList
                dataKey="displayLabel"
                position="right"
                offset={8}
                fontSize={11}
                fill="#132033"
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm leading-6 text-[#44505C]">
        Linksonder is minder urgent; rechtsboven vraagt bestuurlijk eerst aandacht. Gebruik dit
        beeld voor verificatie en prioritering, niet als harde oorzaakverklaring.
      </p>
    </div>
  )
}

export function SignalCompositionRibbon({
  title,
  segments,
  note,
}: {
  title: string
  segments: CompositionSegment[]
  note?: string
}) {
  return (
    <div className="space-y-4 border border-[rgba(13,27,42,0.15)] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#44505C]">
          {title}
        </p>
        {note ? <p className="text-xs leading-5 text-[#44505C]">{note}</p> : null}
      </div>
      <div className="flex min-h-12 overflow-hidden border border-[rgba(13,27,42,0.15)] bg-[#F4F1EA]">
        {segments.length > 0 ? (
          segments.map((segment, index) => (
            <div
              key={`${segment.label}-${index}`}
              className="flex min-w-0 items-center justify-between gap-2 border-r border-[rgba(13,27,42,0.15)] px-3 py-3 text-[#132033] last:border-r-0"
              style={{
                width: `${Math.max(segment.percent, 12)}%`,
                backgroundColor: index % 2 === 0 ? '#feb234' : '#ffffff',
              }}
            >
              <span className="min-w-0 truncate text-sm font-semibold">{segment.label}</span>
              <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
                {segment.value}
              </span>
            </div>
          ))
        ) : (
          <div className="px-3 py-3 text-sm text-[#44505C]">Nog geen patroonbeeld beschikbaar.</div>
        )}
      </div>
    </div>
  )
}

function buildTrianglePoint(rows: BoardroomSdtRow[]) {
  if (rows.length === 0) return { x: 50, y: 56 }

  const byKey = {
    autonomie: rows.find((row) => row.factor.toLowerCase().includes('autonomie'))?.scoreValue ?? 0,
    competentie:
      rows.find((row) => row.factor.toLowerCase().includes('competentie'))?.scoreValue ?? 0,
    verbondenheid:
      rows.find((row) => row.factor.toLowerCase().includes('verbondenheid'))?.scoreValue ?? 0,
  }

  const total = byKey.autonomie + byKey.competentie + byKey.verbondenheid
  if (total <= 0) return { x: 50, y: 56 }

  const vertices = {
    autonomie: { x: 50, y: 10 },
    competentie: { x: 12, y: 82 },
    verbondenheid: { x: 88, y: 82 },
  }

  return {
    x:
      (byKey.autonomie * vertices.autonomie.x +
        byKey.competentie * vertices.competentie.x +
        byKey.verbondenheid * vertices.verbondenheid.x) /
      total,
    y:
      (byKey.autonomie * vertices.autonomie.y +
        byKey.competentie * vertices.competentie.y +
        byKey.verbondenheid * vertices.verbondenheid.y) /
      total,
  }
}

export function SdtTriangleMap({ rows }: { rows: BoardroomSdtRow[] }) {
  const point = buildTrianglePoint(rows)

  return (
    <div className="grid gap-5 border border-[rgba(13,27,42,0.15)] bg-white p-5 lg:grid-cols-[minmax(220px,0.72fr),minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="border border-[rgba(13,27,42,0.15)] bg-[#F4F1EA] p-3">
          <svg
            viewBox="0 0 100 92"
            className="h-[190px] w-full"
            role="img"
            aria-label="SDT driehoekskaart"
          >
            <path d="M50 10 L12 82 L88 82 Z" fill="#ffffff" stroke="#132033" strokeWidth="1.5" />
            <path
              d="M50 10 L50 82"
              stroke="rgba(13,27,42,0.15)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <path
              d="M12 82 L69 46"
              stroke="rgba(13,27,42,0.15)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <path
              d="M88 82 L31 46"
              stroke="rgba(13,27,42,0.15)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle cx={point.x} cy={point.y} r="4.5" fill="#feb234" stroke="#132033" strokeWidth="1.5" />
            <text x="50" y="4" textAnchor="middle" className="fill-[#132033] text-[5px] font-semibold">
              AUTONOMIE
            </text>
            <text x="8" y="89" textAnchor="start" className="fill-[#132033] text-[5px] font-semibold">
              COMPETENTIE
            </text>
            <text x="92" y="89" textAnchor="end" className="fill-[#132033] text-[5px] font-semibold">
              VERBONDENHEID
            </text>
          </svg>
        </div>
        <p className="text-sm leading-6 text-[#44505C]">
          De positie van de punt laat zien welke basisbehoeften relatief meer onder druk staan.
          Lees dit als verdieping, niet als losse diagnose.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.factor}
            className="space-y-2 border border-[rgba(13,27,42,0.15)] bg-[#F4F1EA] px-4 py-3"
          >
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#44505C]">
              {row.factor}
            </p>
            <p className="dash-number text-[1.4rem] leading-none tracking-[-0.05em] text-[#132033]">
              {row.score}
            </p>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#A06D11]">
              {row.band}
            </p>
            <p className="text-sm leading-6 text-[#44505C]">{row.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
