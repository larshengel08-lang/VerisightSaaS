import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function bron() {
  return fs.readFileSync(path.join(process.cwd(), 'app/pilot/page.tsx'), 'utf8').replace(/\s+/g, ' ')
}

describe('/pilot volgt het product (weg a)', () => {
  it('levert een volledige scan met gespreksleidraad, geen bespreking', () => {
    for (const regel of [
      "'Een volledige Loep-scan',",
      "'Meting klaargezet door Loep; jij verstuurt en volgt de respons',",
      "'Managementrapport met prioriteiten',",
      "'Gespreksleidraad en besluitpagina in het rapport',",
      "'Eerste managementvraag en vervolgstap',",
    ]) {
      expect(bron(), regel).toContain(regel)
    }
  })

  it('vraagt feedback op het rapport en op hoe het MT-gesprek ermee liep', () => {
    expect(bron()).toContain("'Gerichte feedback op het proces, het rapport en hoe het gesprek met je MT ermee liep.',")
    expect(bron()).toContain("'Je MT bespreekt het rapport zelf en deelt achteraf hoe dat ging',")
    expect(bron()).toContain("'Eén MT-gesprek dat je zelf leidt, met het rapport als leidraad',")
  })

  it('maakt Loep het onderwerp in de hero en in de slotband', () => {
    expect(bron()).toContain('Loep gebruikt de pilot om het rapport en de klantreis aan te scherpen.')
    expect(bron()).toContain('Daarom stelt Loep tijdelijk 1 tot 2 founding pilots beschikbaar.')
    expect(bron()).toContain('Loep krijgt scherpe feedback, praktijkbewijs en, alleen bij tevredenheid, toestemming voor een referentie.')
  })

  it('blijft link-only en noindex', () => {
    expect(bron()).toContain('robots: { index: false, follow: false }')
  })
})
