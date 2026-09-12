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

  it('toont een waarschuwing als het sluiten lukte maar de mail niet', () => {
    expect(island).toContain('setNotice')
    expect(island).toContain('result.warning')
    expect(island).toContain('role="status"')
  })

  it('defect 1: bouwt de notice buiten de ctaKind-branches, zodat die de state-overgang na het sluiten overleeft', () => {
    // De notice moet ná de laatste ctaKind-check gedefinieerd zijn zodat elke
    // branch (copy_reminder, close_campaign, én de fallback/vroege return)
    // 'm kan renderen, in plaats van 'm lokaal in de close_campaign-tak te
    // bouwen zoals de gefixte bug deed.
    const noticeBlockIdx = island.indexOf('const noticeBlock')
    const firstCtaKindCheckIdx = island.indexOf("state.ctaKind ===")
    expect(noticeBlockIdx).toBeGreaterThan(-1)
    expect(firstCtaKindCheckIdx).toBeGreaterThan(-1)
    expect(noticeBlockIdx).toBeLessThan(firstCtaKindCheckIdx)

    // Er mag geen losse, branch-lokale <p role="status">-opbouw meer bestaan
    // (dat was precies de bug: alleen zichtbaar in de close_campaign-tak).
    const roleStatusMatches = island.match(/role="status"/g) ?? []
    expect(roleStatusMatches.length).toBe(1)
  })

  it('defect 1: rendert de notice ook buiten de close_campaign-tak (copy_reminder en de fallback na beide branches)', () => {
    const copyReminderIdx = island.indexOf("state.ctaKind === 'copy_reminder'")
    const closeCampaignIdx = island.indexOf("state.ctaKind === 'close_campaign'")
    expect(copyReminderIdx).toBeGreaterThan(-1)
    expect(closeCampaignIdx).toBeGreaterThan(copyReminderIdx)

    // noticeBlock moet in de copy_reminder-tak worden meegerenderd...
    const copyReminderBranch = island.slice(copyReminderIdx, closeCampaignIdx)
    expect(copyReminderBranch).toContain('{noticeBlock}')

    // ...en de allerlaatste return (ná de close_campaign-tak, i.p.v. een kaal
    // `return null`) moet de notice ook nog kunnen tonen in plaats van 'm weg
    // te gooien op de eerste render nadat de state al is overgegaan.
    const closeCampaignBranch = island.slice(closeCampaignIdx)
    const finalReturnIdx = closeCampaignBranch.lastIndexOf('return ')
    expect(closeCampaignBranch.slice(finalReturnIdx)).toContain('noticeBlock')
  })

  it('defect 1: de vroege return (geen campaignId/ctaLabel) gooit een openstaande notice niet weg', () => {
    const earlyReturnBlock = island.slice(
      island.indexOf('if (!state.campaignId'),
      island.indexOf('async function handleCopyReminder'),
    )
    expect(earlyReturnBlock).toContain('noticeBlock')
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
