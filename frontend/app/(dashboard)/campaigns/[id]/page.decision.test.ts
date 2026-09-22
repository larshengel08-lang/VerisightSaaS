import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('campagnedetail: besluit vastleggen (plan 3b)', () => {
  it('toont het blok alleen naast de downloadknop, in de staat report_ready', () => {
    expect(source.match(/<DecisionBlock/g)).toHaveLength(1)
    const before = source.slice(0, source.indexOf('<DecisionBlock'))
    // Direct voor het blok staat de gate, en de downloadknop staat erboven.
    expect(before.slice(-80)).toContain("state.kind === 'report_ready' ? (")
    expect(before).toContain('PdfDownloadButton')
  })

  it('geeft schrijfrecht door als canManage en niet als isAdmin', () => {
    expect(source).toContain('canManage={canManage}')
  })

  it('haalt het besluit alleen op als er een rapport is, en laat een queryfout de pagina niet omvallen', () => {
    expect(source).toContain(".from('campaign_decisions')")
    expect(source).toContain('decisionLoadError')
    const decisionPart = source.slice(source.indexOf(".from('campaign_decisions')"))
    expect(decisionPart.slice(0, 600)).not.toContain('throw new Error')
  })

  it('leest geen individuele antwoorden voor dit blok', () => {
    const decisionPart = source.slice(source.indexOf(".from('campaign_decisions')"), source.indexOf(".from('campaign_decisions')") + 600)
    expect(decisionPart).not.toContain('survey_responses')
  })
})
