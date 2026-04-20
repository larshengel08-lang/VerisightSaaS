import type { MtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'

interface Props {
  suite: MtoActionCenterViewModel['departmentSuite']
}

export function MtoDepartmentOverview({ suite }: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Afdelingssuite</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{suite.headline}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{suite.summary}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {suite.stats.map((stat) => {
          const toneClass =
            stat.tone === 'amber'
              ? 'border-amber-200 bg-amber-50'
              : stat.tone === 'blue'
                ? 'border-blue-200 bg-blue-50'
                : 'border-slate-200 bg-slate-50'

          return (
            <div key={stat.label} className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{stat.value}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
