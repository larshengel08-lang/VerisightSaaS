'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

type TabItem = {
  id: string
  label: string
  content: ReactNode
}

export function DashboardTabs({
  tabs,
  defaultTabId,
}: {
  tabs: TabItem[]
  defaultTabId?: string
}) {
  const firstTab = tabs[0]?.id ?? ''
  const [activeTab, setActiveTab] = useState(defaultTabId ?? firstTab)

  if (tabs.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal-light)] ${
                active
                  ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--bg)] shadow-[0_10px_24px_rgba(19,32,51,0.12)]'
                  : 'border-[color:var(--border)] bg-white text-[color:var(--text)] hover:border-[color:var(--teal)] hover:text-[color:var(--ink)]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div>{tabs.find((tab) => tab.id === activeTab)?.content ?? tabs[0]?.content}</div>
    </div>
  )
}
