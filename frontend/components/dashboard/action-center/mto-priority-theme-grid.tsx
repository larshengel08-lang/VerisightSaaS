import React from 'react'
import type { MtoActionCenterThemeCard } from '@/lib/action-center/mto-cockpit'

export function MtoPriorityThemeGrid(props: {
  themes: MtoActionCenterThemeCard[]
  onOpenTheme: (themeKey: string) => void
}) {
  if (props.themes.length === 0) {
    return (
      <section className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Nog geen prioriteitsthema's zichtbaar. Zodra er veilige afdelingsdata staat, opent deze managementlaag hier.
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prioriteitsthema&apos;s</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">Thema&apos;s die nu managementaandacht vragen</h3>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {props.themes.map((theme) => {
          const themeKey = `${theme.departmentLabel}:${theme.factorKey}`
          const toneClass =
            theme.actionHealth.tone === 'amber'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : theme.actionHealth.tone === 'blue'
                ? 'border-blue-200 bg-blue-50 text-blue-800'
                : 'border-slate-200 bg-slate-50 text-slate-700'

          return (
            <article key={themeKey} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{theme.departmentLabel}</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-950">{theme.factorLabel}</h4>
              <p className="mt-2 text-sm leading-7 text-slate-600">{theme.departmentRead.decision}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
                  {theme.actionHealth.label}
                </span>
                {theme.actionHealth.reviewDueCount > 0 ? (
                  <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900">
                    {theme.actionHealth.reviewDueCount} review nu
                  </span>
                ) : null}
                {theme.actionHealth.blockedCount > 0 ? (
                  <span className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900">
                    {theme.actionHealth.blockedCount} blokkade
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => props.onOpenTheme(themeKey)}
                className="mt-5 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                Open thema
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
