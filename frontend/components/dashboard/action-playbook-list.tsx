import type { ReactNode } from 'react'
import { getProductModule } from '@/lib/products/shared/registry'
import type { ScanType } from '@/lib/types'
import { FACTOR_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity'] as const

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
}

export function ActionPlaybookList({ factorAverages, scanType }: Props) {
  const playbooks = getProductModule(scanType).getActionPlaybooks()
  const items = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
    .map((factor) => {
      const score = factorAverages[factor]
      const signalValue = 11 - score
      const band = signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
      return {
        factor,
        signalValue,
        band,
        playbook: playbooks[factor]?.[band] ?? null,
      }
    })
    .filter((item) => item.playbook)
    .sort((a, b) => b.signalValue - a.signalValue)
    .slice(0, 2)

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <details
          key={item.factor}
          open={index === 0}
          className="group rounded-[22px] border border-[color:var(--border)] bg-white p-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)]"
        >
          <summary className="flex cursor-pointer list-none flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {FACTOR_LABELS[item.factor]} - {item.band === 'HOOG' ? 'urgent playbook' : 'aandacht playbook'}
              </p>
              <h3 className="mt-2 text-base font-semibold text-[color:var(--ink)]">{item.playbook?.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">
                Open voor besluit, eigenaar, validatie, eerste acties en reviewmoment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[color:var(--bg)] px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
                Prioriteit {item.signalValue.toFixed(1)}/10
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
                <span className="group-open:hidden">Open</span>
                <span className="hidden group-open:inline">Verberg</span>
                {' '}route
              </span>
            </div>
          </summary>

          <div className="mt-4 border-t border-[color:var(--border)]/80 pt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <PlaybookColumn title="Eerste besluit" tone="blue">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.playbook?.decision}</p>
              </PlaybookColumn>
              <PlaybookColumn title="Eerste eigenaar" tone="slate">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.playbook?.owner}</p>
              </PlaybookColumn>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <PlaybookColumn title="Eerst valideren" tone="blue">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.playbook?.validate}</p>
              </PlaybookColumn>
              <PlaybookColumn title="Logische acties" tone="emerald">
                <ul className="space-y-2">
                  {item.playbook?.actions.map((action) => (
                    <li key={action} className="flex gap-2 text-sm leading-6 text-[color:var(--text)]">
                      <span className="text-[color:var(--muted)]">&bull;</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </PlaybookColumn>
              <PlaybookColumn title="Niet overhaasten" tone="amber">
                <p className="text-sm leading-6 text-[color:var(--text)]">{item.playbook?.caution}</p>
              </PlaybookColumn>
            </div>

            <div className="mt-4">
              <PlaybookColumn title="Reviewmoment" tone="slate">
                <p className="text-sm leading-6 text-[color:var(--text)]">
                  {item.playbook?.review ??
                    (scanType === 'exit'
                      ? 'Plan binnen 60-90 dagen een review op dit spoor: wat is gekozen, wat is uitgevoerd en wat keert terug in de volgende exitbatch?'
                      : 'Plan binnen 45-90 dagen een review of vervolgmeting: wat is geverifieerd, welke eerste interventie loopt en wat verschuift er in het retentiesignaal?')}
                </p>
              </PlaybookColumn>
            </div>
          </div>
        </details>
      ))}
    </div>
  )
}

function PlaybookColumn({
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
