import type { ReactNode } from 'react'
import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'

interface Props {
  items: MtoDepartmentReadItem[]
}

export function MtoDepartmentReadList({ items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <details
          key={`${item.segmentLabel}-${item.factorKey}`}
          open={index === 0}
          className="group rounded-[22px] border border-[color:var(--border)] bg-white p-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)]"
        >
          <summary className="flex cursor-pointer list-none flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Afdeling - {item.segmentLabel}
              </p>
              <h3 className="mt-2 text-base font-semibold text-[color:var(--ink)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                Binnen deze afdeling geeft <span className="font-semibold">{item.factorLabel}</span> nu het scherpste
                signaal. Gebruik dit als bounded afdelingsread binnen MTO en lees de vervolgstap nog niet als suitebrede
                action engine.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 text-sm text-[color:var(--text)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Afdelingsread</p>
                <p className="mt-1 font-semibold text-[color:var(--ink)]">n = {item.n}</p>
                <p className="mt-1">Signaal: {item.avgSignal.toFixed(1)}/10</p>
                <p className="mt-1">Delta vs organisatie: {item.deltaVsOrg >= 0 ? '+' : ''}{item.deltaVsOrg.toFixed(1)}</p>
              </div>
              <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
                <span className="group-open:hidden">Open</span>
                <span className="hidden group-open:inline">Verberg</span>
                {' '}afdeling
              </span>
            </div>
          </summary>

          <div className="mt-4 border-t border-[color:var(--border)]/80 pt-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Column title="Stay-intent" tone="slate">
                <p className="text-sm leading-6 text-[color:var(--text)]">
                  {item.stayIntentAverage === null ? 'Nog niet zichtbaar' : `${item.stayIntentAverage.toFixed(1)}/10`}
                </p>
              </Column>
              <Column title="Eerste besluit" tone="blue">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.decision}</p>
              </Column>
              <Column title="Eerste eigenaar" tone="emerald">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.owner}</p>
              </Column>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Column title="Eerst valideren" tone="blue">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.validate}</p>
              </Column>
              <Column title="Bounded handoff" tone="emerald">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.handoffBody}</p>
              </Column>
              <Column title="Niet overhaasten" tone="amber">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.caution}</p>
              </Column>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Column title="Logische acties" tone="emerald">
                <ul className="space-y-2">
                  {item.actions.map((action) => (
                    <li key={action} className="flex gap-2 text-sm leading-6 text-[color:var(--text)]">
                      <span className="text-[color:var(--muted)]">&bull;</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </Column>
              <Column title="Reviewmoment" tone="slate">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.review ?? 'Leg direct een reviewmoment vast voordat deze afdelingsread breder wordt gebruikt.'}</p>
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
