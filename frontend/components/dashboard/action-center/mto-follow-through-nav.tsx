import React from 'react'
import type { MtoActionCenterViewModel } from '@/lib/action-center/mto-cockpit'

export function MtoFollowThroughNav(props: {
  items: MtoActionCenterViewModel['followThroughNavigation']
  activeKey: string | null
  onOpenSection: (key: string) => void
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {props.items.map((item) => {
        const toneClass =
          item.tone === 'amber'
            ? 'border-amber-200 bg-amber-50'
            : item.tone === 'blue'
              ? 'border-blue-200 bg-blue-50'
              : 'border-slate-200 bg-white'
        const activeClass = props.activeKey === item.key ? 'ring-2 ring-slate-900/10' : ''

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => props.onOpenSection(item.key)}
            className={`rounded-[22px] border px-4 py-4 text-left transition hover:border-blue-200 ${toneClass} ${activeClass}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
          </button>
        )
      })}
    </section>
  )
}
