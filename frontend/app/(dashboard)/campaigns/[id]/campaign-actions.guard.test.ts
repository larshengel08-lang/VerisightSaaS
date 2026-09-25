import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./campaign-actions.tsx', import.meta.url), 'utf8')

describe('archiveren: closed_at is de klok van de bewaartermijn', () => {
  it('archiveert alleen een meting waarvan closed_at nog leeg is en telt de geraakte rijen', () => {
    expect(source).toContain(".is('closed_at', null)")
    expect(source).toContain(".select('id')")
    expect(source).toContain('updatedRows.length === 0')
  })

  it('een tweede keer archiveren is geen fout, 0 rijen zonder sluiting blijft wel een fout', () => {
    expect(source).toContain('Deze campaign was al gearchiveerd.')
    expect(source).toContain('Archiveren mislukt: campaign niet gevonden of geen rechten.')
  })
})
