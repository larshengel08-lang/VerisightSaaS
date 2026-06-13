import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const island = readFileSync(new URL('./dashboard-state-actions.tsx', import.meta.url), 'utf8')
const card = readFileSync(new URL('./dashboard-state-card.tsx', import.meta.url), 'utf8')

describe('dashboard state interaction island', () => {
  it('is a client component wired to the dashboard server actions', () => {
    expect(island).toContain("'use client'")
    expect(island).toContain('confirmReminderSentAction')
    expect(island).toContain('closeCampaignAction')
  })

  it('implements the copy → confirm reminder flow', () => {
    expect(island).toContain('navigator.clipboard.writeText')
    expect(island).toContain('Ik heb de herinnering verstuurd')
  })

  it('confirms before closing a campaign', () => {
    expect(island).toContain('Campagne sluiten')
    expect(island).toMatch(/confirm\(/)
  })
})

describe('dashboard state card', () => {
  it('renders the resolved primary message and delegates interactive CTAs to the island', () => {
    expect(card).toContain('state.primaryMessage')
    expect(card).toContain('DashboardStateActions')
    expect(card).toContain('state.showProgress')
  })

  it('keeps no inline analysis (no charts/factor tables)', () => {
    expect(card).not.toContain('RiskCharts')
    expect(card).not.toContain('FactorTable')
  })
})
