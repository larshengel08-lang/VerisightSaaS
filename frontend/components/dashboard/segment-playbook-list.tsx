import type { ReactNode } from 'react'
import type { SegmentPlaybookEntry } from '@/lib/products/shared/types'

interface Props {
  segments: SegmentPlaybookEntry[]
}

export function SegmentPlaybookList({ segments }: Props) {
  if (segments.length === 0) return null

  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <div
          key={`${segment.segmentType}-${segment.segmentLabel}-${segment.factorKey}`}
          className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {segment.segmentType === 'department' ? 'Afdeling' : 'Functieniveau'} · {segment.segmentLabel}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">{segment.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Binnen deze groep geeft <span className="font-semibold">{segment.factorLabel}</span> het scherpste signaal.
                De gemiddelde signalering ligt op {segment.avgSignal.toFixed(1)}/10 en wijkt{' '}
                {segment.deltaVsOrg > 0
                  ? `${segment.deltaVsOrg.toFixed(1)} punt hoger`
                  : `${Math.abs(segment.deltaVsOrg).toFixed(1)} punt lager`}{' '}
                af dan het organisatieniveau.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Segment</p>
              <p className="mt-1 font-semibold text-slate-950">n = {segment.n}</p>
              <p className="mt-1">Topfactor: {segment.factorLabel}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Column title="Eerste besluit" tone="blue">
              <p className="text-sm leading-6 text-slate-700">{segment.decision}</p>
            </Column>
            <Column title="Eerste eigenaar" tone="slate">
              <p className="text-sm leading-6 text-slate-700">{segment.owner}</p>
            </Column>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Column title="Eerst valideren" tone="blue">
              <p className="text-sm leading-6 text-slate-700">{segment.validate}</p>
            </Column>
            <Column title="Logische acties" tone="emerald">
              <ul className="space-y-2">
                {segment.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span className="text-slate-400">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </Column>
            <Column title="Niet overhaasten" tone="amber">
              <p className="text-sm leading-6 text-slate-700">{segment.caution}</p>
            </Column>
          </div>
        </div>
      ))}
    </div>
  )
}

function Column({
  title,
  tone,
  children,
}: {
  title: string
  tone: 'slate' | 'blue' | 'emerald' | 'amber'
  children: ReactNode
}) {
  const classes =
    tone === 'slate'
      ? 'border-slate-200 bg-slate-50'
      : tone === 'emerald'
      ? 'border-emerald-100 bg-emerald-50'
      : tone === 'amber'
        ? 'border-amber-100 bg-amber-50'
        : 'border-blue-100 bg-blue-50'
  const labelClass =
    tone === 'slate'
      ? 'text-slate-600'
      : tone === 'emerald'
      ? 'text-emerald-700'
      : tone === 'amber'
        ? 'text-amber-700'
        : 'text-blue-700'

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${labelClass}`}>{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}
