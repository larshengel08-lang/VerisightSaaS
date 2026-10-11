import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const bron = readFileSync(join(__dirname, '..', 'components', 'marketing', 'home-page-content.tsx'), 'utf8')
const grens = bron.indexOf('function SuitePreviewSection')
const live = bron.slice(0, grens)

describe('homepage polijstronde (spec par. 7)', () => {
  it('meet het live deel van de homepage, niet een lege of volledige bron', () => {
    // Verdwijnt het gearchiveerde blok, dan zou slice(0, -1) stilletjes bijna
    // alles meten; dan moet deze test de grens opnieuw kiezen.
    expect(grens).toBeGreaterThan(0)
  })

  it('hero zegt niets meer wat het rapport niet zegt', () => {
    for (const oud of ['veruit het laagst', 'Eerste managementvraag', 'Waardering en erkenning', 'Illustratief voorbeeld']) {
      expect(live).not.toContain(oud)
    }
  })

  it('hero toont de echte rapportafbeelding met label en alt-tekst', () => {
    const src = live.match(/src="(\/images\/voorbeeld-loep-behoud-p02\.[a-z]+)"/)?.[1]
    expect(src).toBeTruthy()
    expect(live).toContain('Voorbeeld van pagina twee uit een Loep Behoud-rapport')
    expect(live).toMatch(/>\s*Voorbeeld\s*</)
    // Precies het bestand dat de component laadt, niet een van twee mogelijke.
    const bestand = join(__dirname, '..', 'public', ...src!.split('/').filter(Boolean))
    expect(statSync(bestand).isFile()).toBe(true)
    expect(statSync(bestand).size).toBeLessThan(250 * 1024)
  })

  it('invultijd komt uit SURVEY_MINUTES, niet uit vaste tekst', () => {
    expect(live).not.toContain('tien minuten')
    expect(live).toContain("import { SURVEY_MINUTES } from '@/lib/campaign-setup'")
    for (const scan of ['exit', 'retention', 'onboarding']) {
      expect(live).toContain(`surveyMinutesFor('${scan}')`)
    }
    expect(live).toContain('in ${minSurveyMinutes} tot ${maxSurveyMinutes} minuten ingevuld')
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
