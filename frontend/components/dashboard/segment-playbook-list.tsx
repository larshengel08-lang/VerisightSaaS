import type { ReactNode } from 'react'
import type { SegmentPlaybookEntry } from '@/lib/products/shared/types'

interface Props {
  segments: SegmentPlaybookEntry[]
}

export function SegmentPlaybookList({ segments }: Props) {
  if (segments.length === 0) return null

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => (
        <details
          key={`${segment.segmentType}-${segment.segmentLabel}-${segment.factorKey}`}
          open={index === 0}
          className="group rounded-[22px] border border-[color:var(--border)] bg-white p-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)]"
        >
          <summary className="flex cursor-pointer list-none flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {segment.segmentType === 'department' ? 'Afdeling' : 'Functieniveau'} - {segment.segmentLabel}
              </p>
              <h3 className="mt-2 text-base font-semibold text-[color:var(--ink)]">{segment.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                Binnen deze groep geeft <span className="font-semibold">{segment.factorLabel}</span> het scherpste signaal.
                De gemiddelde signalering ligt op {segment.avgSignal.toFixed(1)}/10 en wijkt{' '}
                {segment.deltaVsOrg > 0
                  ? `${segment.deltaVsOrg.toFixed(1)} punt hoger`
                  : `${Math.abs(segment.deltaVsOrg).toFixed(1)} punt lager`}{' '}
                af dan het organisatieniveau.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 text-sm text-[color:var(--text)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Segment</p>
                <p className="mt-1 font-semibold text-[color:var(--ink)]">n = {segment.n}</p>
                <p className="mt-1">Topfactor: {segment.factorLabel}</p>
              </div>
              <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
                <span className="group-open:hidden">Open</span>
                <span className="hidden group-open:inline">Verberg</span>
                {' '}playbook
              </span>
            </div>
          </summary>

          <div className="mt-4 border-t border-[color:var(--border)]/80 pt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Column title="Eerste besluit" tone="blue">
                <p className="text-sm leading-6 text-[color:var(--text)]">{segment.decision}</p>
              </Column>
              <Column title="Eerste eigenaar" tone="slate">
                <p className="text-sm leading-6 text-[color:var(--text)]">{segment.owner}</p>
              </Column>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Column title="Eerst valideren" tone="blue">
                <p className="text-sm leading-6 text-[color:var(--text)]">{segment.validate}</p>
              </Column>
              <Column title="Logische acties" tone="emerald">
                <ul className="space-y-2">
                  {segment.actions.map((action) => (
                    <li key={action} className="flex gap-2 text-sm leading-6 text-[color:var(--text)]">
                      <span className="text-[color:var(--muted)]">&bull;</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </Column>
              <Column title="Niet overhaasten" tone="amber">
                <p className="text-sm leading-6 text-[color:var(--text)]">{segment.caution}</p>
              </Column>
            </div>
          </div>
        </details>
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
      ? 'border-[color:var(--border)] bg-[color:var(--bg)]'
      : tone === 'emerald'
        ? 'border-[#d2e6e0] bg-[#eef7f4]'
        : tone === 'amber'
          ? 'border-[#eadfbe] bg-[#faf6ea]'
          : 'border-[#d6e4e8] bg-[#f3f8f8]'
  const labelClass =
    tone === 'slate'
      ? 'text-[color:var(--text)]'
      : tone === 'emerald'
        ? 'text-[#3C8D8A]'
        : tone === 'amber'
          ? 'text-[#8C6B1F]'
          : 'text-[#234B57]'

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${labelClass}`}>{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}
