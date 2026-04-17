import { getProductModule } from '@/lib/products/shared/registry'
import type { ScanType } from '@/lib/types'
import { FACTOR_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity'] as const

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
}

export function RecommendationList({ factorAverages, scanType }: Props) {
  const productModule = getProductModule(scanType)
  const questionSet = productModule.getFocusQuestions()
  const playbooks = productModule.getActionPlaybooks()
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
        questions: questionSet[factor]?.[band] ?? [],
        playbook: playbooks[factor]?.[band] ?? null,
      }
    })
    .sort((a, b) => b.signalValue - a.signalValue)
    .filter((item) => item.questions.length > 0)

  const bandStyle: Record<string, { wrapper: string; badge: string; label: string }> = {
    HOOG: {
      wrapper: 'border-[#e7d8d0] bg-[#fcf5f1]',
      badge: 'bg-[#f3e4dc] text-[#8e5f46]',
      label: 'Urgent',
    },
    MIDDEN: {
      wrapper: 'border-[#eadfbe] bg-[#faf6ea]',
      badge: 'bg-[#f5ebc7] text-[#8C6B1F]',
      label: 'Aandacht',
    },
    LAAG: {
      wrapper: 'border-[#d2e6e0] bg-[#eef7f4]',
      badge: 'bg-[#dcefea] text-[#3C8D8A]',
      label: 'Monitoren',
    },
  }

  const badgeCopy =
    scanType === 'exit'
      ? { HOOG: 'Nu kiezen', MIDDEN: 'Eerst toetsen', LAAG: 'Monitoren' }
      : { HOOG: 'Nu prioriteren', MIDDEN: 'Eerst valideren', LAAG: 'Monitoren' }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.factor}
          open={index === 0}
          className={`group rounded-[20px] border p-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)] ${bandStyle[item.band].wrapper}`}
        >
          <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[color:var(--ink)]">{FACTOR_LABELS[item.factor]}</p>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${bandStyle[item.band].badge}`}>
                  {bandStyle[item.band].label}
                </span>
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                {scanType === 'exit' ? 'Verificatiespoor' : 'Prioriteit'} {item.signalValue.toFixed(1)}/10
              </p>
              <p className="text-sm leading-6 text-[color:var(--text)]">
                {badgeCopy[item.band as keyof typeof badgeCopy]}. Open voor vragen, eigenaar, eerste actie en reviewmoment.
              </p>
            </div>
            <span className="rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
              <span className="group-open:hidden">Open</span>
              <span className="hidden group-open:inline">Verberg</span>
              {' '}spoor
            </span>
          </summary>
          <div className="mt-4 border-t border-white/70 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {scanType === 'exit' ? 'Validatie- en besluitvragen' : 'Validatie- en opvolgvragen'}
            </p>
            <ul className="space-y-2">
              {item.questions.map((question) => (
                <li key={question} className="flex gap-2 text-sm leading-6 text-[color:var(--text)]">
                  <span className="text-[color:var(--muted)]">&bull;</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
            {item.playbook ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FollowThroughCell title="Eerste gesprek" body={item.questions[0] ?? item.playbook.validate} />
                <FollowThroughCell title="Eerste eigenaar" body={item.playbook.owner} />
                <FollowThroughCell title="Eerste actie" body={item.playbook.actions[0] ?? item.playbook.decision} />
                <FollowThroughCell
                  title="Reviewmoment"
                  body={
                    item.playbook.review ??
                    (scanType === 'exit'
                      ? 'Check binnen 60-90 dagen of dit spoor terugkomt in de volgende exitbatch en in managementgesprekken.'
                      : 'Check binnen 45-90 dagen of dit spoor verschuift in teamgesprekken, opvolging en een volgende meting.')
                  }
                />
              </div>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  )
}

function FollowThroughCell({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{body}</p>
    </div>
  )
}
