import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const island = readFileSync(new URL('./dashboard-state-actions.tsx', import.meta.url), 'utf8')
const card = readFileSync(new URL('./dashboard-state-card.tsx', import.meta.url), 'utf8')

describe('dashboard state interaction island', () => {
  it('is a client component wired to all four dashboard server actions', () => {
    expect(island).toContain("'use client'")
    expect(island).toContain('confirmReminderSentAction')
    expect(island).toContain('closeCampaignAction')
    expect(island).toContain('extendCampaignAction')
    expect(island).toContain('skipReminderAction')
  })

  it('implements the copy → confirm reminder flow', () => {
    expect(island).toContain('navigator.clipboard.writeText')
    expect(island).toContain('Ik heb de herinnering verstuurd')
  })

  it('sluit via een eigen dialoog die de gevolgen benoemt, niet via browser-confirm (spec 2026-09-16 par. 4.3)', () => {
    expect(island).not.toMatch(/(?<![A-Za-z_])confirm\(/)
    expect(island).toContain('ConfirmDialog')
    expect(island).toContain('Daarna kan niemand meer invullen en staat het rapport klaar.')
    expect(island).toContain('die komen er dan niet.')
    expect(island).toContain('Wil je liever twee weken verlengen?')
    expect(island).toContain("'Twee weken verlengen'")
    expect(island).toContain("'Toch sluiten'")
    expect(island).toContain('state.reportThreshold')
    expect(island).toContain('state.canExtend')
  })

  it('rendert de secundaire acties als echte knoppen (verlengen, sluiten, herinnering overslaan)', () => {
    expect(island).toContain('state.secondaryActions')
    expect(island).toContain("case 'skip_reminder'")
    expect(island).toContain("case 'extend'")
    expect(island).toContain("case 'close_campaign'")
  })

  it('toont een waarschuwing als een actie lukte maar een neveneffect niet', () => {
    expect(island).toContain('setNotice')
    expect(island).toContain('result.warning')
    expect(island).toContain('role="status"')
  })

  it('defect 1 (2026-09-12): de notice wordt op één plek gebouwd en in de laatste return meegerenderd, ongeacht ctaKind', () => {
    const noticeBlockIdx = island.indexOf('const noticeBlock')
    const firstCtaKindCheckIdx = island.indexOf("state.ctaKind ===")
    expect(noticeBlockIdx).toBeGreaterThan(-1)
    expect(firstCtaKindCheckIdx).toBeGreaterThan(-1)
    expect(noticeBlockIdx).toBeLessThan(firstCtaKindCheckIdx)
    const roleStatusMatches = island.match(/role="status"/g) ?? []
    expect(roleStatusMatches.length).toBe(1)
    const mainReturn = island.slice(
      island.indexOf('const secondaryActions = state.secondaryActions'),
      island.indexOf('function buildCloseDialog'),
    )
    expect(mainReturn).toContain('{noticeBlock}')
  })

  it('defect 1: de vroege return (geen campaignId) gooit een openstaande notice niet weg', () => {
    const earlyReturnBlock = island.slice(island.indexOf('if (!campaignId)'), island.indexOf('const isBusy'))
    expect(earlyReturnBlock).toContain('noticeBlock')
  })

  it('vangt een afgewezen server action af: foutmelding tonen en busy altijd terugzetten', () => {
    const run = island.slice(island.indexOf('async function run'), island.indexOf('if (!campaignId)'))
    expect(run).toContain('try {')
    expect(run).toContain('} catch')
    expect(run).toContain('} finally {')
    expect(run).toContain("setBusy('idle')")
  })

  it('leidt het aantal verlengingen in de sluitdialoog af van MAX_EXTENSIONS', () => {
    expect(island).toContain('MAX_EXTENSIONS')
    expect(island).not.toContain('drie keer')
  })

  it('bevat geen em- of en-dashes in klantcopy', () => {
    expect(island).not.toMatch(/[—–]/)
  })

  it('biedt op de herinneringsdag onderwerp en bericht apart, elk met een eigen kopieerknop (spec 2026-09-16 par. 4.4)', () => {
    expect(island).toContain('splitReminderText')
    expect(island).toContain('ReminderComposer')
    expect(island).toContain('>Onderwerp<')
    expect(island).toContain('>Bericht<')
    expect(island).not.toContain('Kopieer herinneringstekst')
  })

  it('laat pas bevestigen dat de herinnering is verstuurd nadat er iets gekopieerd is', () => {
    expect(island).toContain('disabled={!copied || isBusy}')
    expect(island).toContain('Kopieer eerst het onderwerp en het bericht')
  })
})

describe('dashboard state card', () => {
  it('renders the resolved primary message and delegates interactive CTAs to the island', () => {
    expect(card).toContain('state.primaryMessage')
    expect(card).toContain('DashboardStateActions')
    expect(card).toContain('state.showProgress')
    expect(card).toContain('CampaignTimeline')
  })

  it('keeps no inline analysis (no charts/factor tables)', () => {
    expect(card).not.toContain('RiskCharts')
    expect(card).not.toContain('FactorTable')
  })

  it('defect 2 (source guard): mount van DashboardStateActions is niet gegated op ctaKind/islandCta', () => {
    expect(card).not.toContain('islandCta')
    expect(card).toMatch(/\n\s*<DashboardStateActions state=\{state\} reminderText=\{reminderText\} \/>\s*\n/)
  })

  it('rendert secundaire acties niet meer zelf als dode tekst; het eiland maakt er knoppen van', () => {
    expect(card).not.toContain('secondaryActions.map')
    expect(card).not.toContain('non-interactive')
  })

  it('rendert een mailto-CTA als gewone link (eindtoestand, spec 4.5)', () => {
    expect(card).toContain("startsWith('mailto:')")
  })
})
