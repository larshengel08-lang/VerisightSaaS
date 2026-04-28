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
  const initialTab = defaultTabId && tabs.some((tab) => tab.id === defaultTabId) ? defaultTabId : firstTab
  const [activeTab, setActiveTab] = useState(initialTab)

  if (tabs.length === 0) return null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2.5 border-b border-[color:var(--dashboard-frame-border)]/80 pb-3">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 rounded-full border px-4 py-2.5 text-[0.82rem] font-semibold tracking-[-0.01em] transition-colors ${
                active
                  ? 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[color:var(--dashboard-accent-strong)]'
                  : 'border-transparent bg-transparent text-[color:var(--dashboard-muted)] hover:border-[color:var(--dashboard-frame-border)] hover:bg-[color:var(--dashboard-soft)] hover:text-[color:var(--dashboard-ink)]'
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
