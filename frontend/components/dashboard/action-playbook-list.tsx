import type { ReactNode } from 'react'
import { getProductModule } from '@/lib/products/shared/registry'
import type { ScanType } from '@/lib/types'
import { FACTOR_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

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
      {items.map((item) => (
        <div key={item.factor} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {FACTOR_LABELS[item.factor]} · {item.band === 'HOOG' ? 'urgent playbook' : 'aandacht playbook'}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">{item.playbook?.title}</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Prioriteit {item.signalValue.toFixed(1)}/10
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <PlaybookColumn title="Eerst valideren" tone="blue">
              <p className="text-sm leading-6 text-slate-700">{item.playbook?.validate}</p>
            </PlaybookColumn>
            <PlaybookColumn title="Logische acties" tone="emerald">
              <ul className="space-y-2">
                {item.playbook?.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span className="text-slate-400">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </PlaybookColumn>
            <PlaybookColumn title="Niet overhaasten" tone="amber">
              <p className="text-sm leading-6 text-slate-700">{item.playbook?.caution}</p>
            </PlaybookColumn>
          </div>
        </div>
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
  tone: 'blue' | 'emerald' | 'amber'
  children: ReactNode
}) {
  const classes =
    tone === 'emerald'
      ? 'border-emerald-100 bg-emerald-50'
      : tone === 'amber'
        ? 'border-amber-100 bg-amber-50'
        : 'border-blue-100 bg-blue-50'
  const labelClass =
    tone === 'emerald'
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
