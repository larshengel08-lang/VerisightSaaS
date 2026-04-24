import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Pulse buyer-facing shell', () => {
  it('keeps the Pulse page compact, review-first and free from retention drift terms', () => {
    const pulsePageSource = readFileSync(
      new URL('../app/producten/_components/pulse-bounded-page.tsx', import.meta.url),
      'utf8',
    )

    expect(pulsePageSource).toContain('Gebruik Pulse pas na een eerdere managementread.')
    expect(pulsePageSource).toContain('Welke compacte reviewvraag vraagt nu direct aandacht?')
    expect(pulsePageSource).toContain('Wat u ontvangt is een compacte managementhandoff.')
    expect(pulsePageSource).toContain('Pulse blijft een bounded vervolgroute.')
    expect(pulsePageSource).not.toContain('reviewmetingen')
    expect(pulsePageSource).not.toContain('ritmesignaal')
    expect(pulsePageSource).not.toContain('effectcheck')
    expect(pulsePageSource).not.toContain('eerste baseline')
    expect(pulsePageSource).not.toContain('review, hercheck en ritme')
  })

  it('keeps shared Pulse shell copy aligned with the bounded review-first route', () => {
    const campaignPageSource = readFileSync(
      new URL('../app/(dashboard)/campaigns/[id]/page.tsx', import.meta.url),
      'utf8',
    )
    const campaignHelpersSource = readFileSync(
      new URL('../app/(dashboard)/campaigns/[id]/page-helpers.tsx', import.meta.url),
      'utf8',
    )
    const productsOverviewSource = readFileSync(
      new URL('../app/producten/page.tsx', import.meta.url),
      'utf8',
    )

    expect(campaignPageSource).toContain('Reviewcontext')
    expect(campaignPageSource).toContain('Reviewlaag · bounded repeat motion')
    expect(campaignPageSource).toContain('Pulse groepsread en bounded vergelijking')
    expect(campaignPageSource).not.toContain('Deze laag vertaalt Pulse naar een bestuurlijk leesbare momentopname')
    expect(campaignPageSource).not.toContain('Snapshotcontext')
    expect(campaignPageSource).not.toContain('Pulse snapshot en reviewdelta')

    expect(campaignHelpersSource).toContain('compacte managementread')
    expect(campaignHelpersSource).toContain('Lees Pulse als compacte groepsread')
    expect(campaignHelpersSource).toContain('bounded reviewlaag')
    expect(campaignHelpersSource).not.toContain('Lees Pulse als snapshot')
    expect(campaignHelpersSource).not.toContain('snapshot met reviewcontext')

    expect(productsOverviewSource).toContain('Compacte reviewroute na een eerdere managementread.')
    expect(productsOverviewSource).not.toContain('Compacte reviewlaag na diagnose of baseline.')
  })
})
