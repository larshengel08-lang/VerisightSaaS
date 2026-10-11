import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const bron = readFileSync(join(__dirname, '..', 'components', 'marketing', 'home-page-content.tsx'), 'utf8')
const live = bron.slice(0, bron.indexOf('function SuitePreviewSection'))

describe('homepage polijstronde (spec par. 7)', () => {
  it('hero zegt niets meer wat het rapport niet zegt', () => {
    for (const oud of ['veruit het laagst', 'Eerste managementvraag', 'Waardering en erkenning', 'Illustratief voorbeeld']) {
      expect(live).not.toContain(oud)
    }
  })

  it('hero toont de echte rapportafbeelding met label en alt-tekst', () => {
    expect(live).toContain('/images/voorbeeld-loep-behoud-p02.')
    expect(live).toContain('Voorbeeld van pagina twee uit een Loep Behoud-rapport')
    expect(live).toMatch(/>\s*Voorbeeld\s*</)
    const pad = join(__dirname, '..', 'public', 'images')
    const bestand = ['voorbeeld-loep-behoud-p02.webp', 'voorbeeld-loep-behoud-p02.png']
      .map((n) => join(pad, n)).find((p) => { try { return statSync(p).isFile() } catch { return false } })
    expect(bestand).toBeTruthy()
    expect(statSync(bestand!).size).toBeLessThan(250 * 1024)
  })

  it('invultijd komt uit SURVEY_MINUTES, niet uit vaste tekst', () => {
    expect(live).not.toContain('tien minuten')
    expect(live).toContain('SURVEY_MINUTES')
  })

  it('kaartteksten rond 40 woorden', () => {
    const blok = live.slice(live.indexOf('const managementFlowSteps'), live.indexOf('function ManagementFlowVisual'))
    const bodies = [...blok.matchAll(/body:\s*(?:'([^']*)'|`([^`]*)`)/g)].map((m) => m[1] ?? m[2])
    expect(bodies).toHaveLength(3)
    for (const b of bodies) {
      const woorden = b.replace(/\$\{[^}]*\}/g, 'X').trim().split(/\s+/).length
      expect(woorden).toBeGreaterThanOrEqual(36)
      expect(woorden).toBeLessThanOrEqual(44)
    }
  })

  it('geen streepjes in de live homepage', () => {
    // en-dash (U+2013) en em-dash (U+2014), via code points zodat deze test zelf streepjesvrij blijft
    expect(live).not.toMatch(new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']'))
  })
})
