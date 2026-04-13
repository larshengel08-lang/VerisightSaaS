import { FACTOR_LABELS } from '@/lib/types'
import type { ScanType } from '@/lib/types'
import { getProductModule } from '@/lib/products/shared/registry'

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
        <div key={item.factor} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {FACTOR_LABELS[item.factor]} · {item.band === 'HOOG' ? 'urgent playbook' : 'aandacht playbook'}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">{item.playbook?.title}</h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
              prioriteit {item.signalValue.toFixed(1)}/10
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Eerst valideren</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.playbook?.validate}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Logische acties</p>
              <ul className="mt-2 space-y-2">
                {item.playbook?.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span className="text-slate-400">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Niet overhaasten</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.playbook?.caution}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
