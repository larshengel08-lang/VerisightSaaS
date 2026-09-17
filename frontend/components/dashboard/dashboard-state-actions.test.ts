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
    // Scope tot DashboardStateActions zelf: ReminderComposer (spec-review
    // 2026-09-17) heeft zijn eigen, aparte role="status" om per veld te
    // melden dat er iets gekopieerd is, los van deze notice-regressieguard.
    const ownScope = island.slice(0, island.indexOf('function ReminderComposer'))
    const roleStatusMatches = ownScope.match(/role="status"/g) ?? []
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

  it('toont bij een mislukte kopieeractie een melding per veld, geen valse bevestiging (spec-review 2026-09-17)', () => {
    const copyFn = island.slice(island.indexOf('async function copy'), island.indexOf('return (', island.indexOf('async function copy')))
    expect(copyFn).toContain('try {')
    expect(copyFn).toContain('await navigator.clipboard.writeText')
    expect(copyFn).toContain('} catch {')
    const tryBlock = copyFn.slice(copyFn.indexOf('try {'), copyFn.indexOf('} catch'))
    const catchBlock = copyFn.slice(copyFn.indexOf('} catch'))
    // markCopied (en dus onCopied naar de ouder) mag alleen ná een geslaagde
    // writeText lopen, nooit in de catch-tak.
    expect(tryBlock).not.toContain('markCopied')
    expect(catchBlock).toContain('setErrorField(which)')
    expect(catchBlock).toContain('.select()')
    expect(island).toContain('Kopiëren lukte niet. Selecteer de tekst en kopieer met Ctrl+C.')
  })

  it('telt een handmatige kopieeractie (Ctrl+C) ook mee via onCopy op beide velden', () => {
    expect(island).toContain("onCopy={() => markCopied('subject')}")
    expect(island).toContain("onCopy={() => markCopied('body')}")
  })

  it('ontgrendelt bevestigen pas als onderwerp én bericht allebei zijn gekopieerd', () => {
    expect(island).toContain('copiedRef.current.subject && copiedRef.current.body')
  })

  it('herkent de gedegradeerde herinneringstekst (geen surveylink) en toont die als alert, geen bewerkbare composer', () => {
    expect(island).toContain('isReminderTextAvailable')
    const ctaBlock = island.slice(island.indexOf("state.ctaKind === 'copy_reminder'"), island.indexOf("state.ctaKind === 'close_campaign'"))
    expect(ctaBlock).toContain('isReminderTextAvailable(reminderText) ? (')
    expect(ctaBlock).toContain('<ReminderComposer')
    expect(ctaBlock).toContain('role="alert"')
  })

  it('rendert de composer met key={reminderText} zodat een ververste tekst de velden reset', () => {
    expect(island).toContain('key={reminderText}')
  })

  it('bewaart de kopieer-flash-timeout in een ref en ruimt hem op bij een nieuwe kopie en bij unmount', () => {
    expect(island).toContain('flashTimeoutRef')
    const flashFn = island.slice(island.indexOf('function flash('), island.indexOf('function markCopied'))
    expect(flashFn).toContain('clearTimeout(flashTimeoutRef.current)')
    const cleanupEffect = island.slice(island.indexOf('useEffect(() => {'), island.indexOf('function flash('))
    expect(cleanupEffect).toContain('clearTimeout(flashTimeoutRef.current)')
  })

  it('heeft aria-labels op de kopieerknoppen en een aria-live-melding voor screenreaders', () => {
    expect(island).toContain('aria-label="Kopieer onderwerp"')
    expect(island).toContain('aria-label="Kopieer bericht"')
    expect(island).toContain('aria-live="polite"')
    expect(island).toContain('sr-only')
  })

  it('gebruikt resize-y op het bericht en text-base sm:text-xs op de velden tegen iOS-zoom', () => {
    expect(island).toContain('resize-y')
    expect(island).toContain('text-base sm:text-xs')
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
