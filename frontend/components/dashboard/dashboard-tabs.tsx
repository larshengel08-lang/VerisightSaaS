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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                active
                  ? 'border-[#d6e4e8] bg-[#f3f8f8] text-[#234B57]'
                  : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] hover:border-[#d6e4e8] hover:text-[color:var(--ink)]'
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
