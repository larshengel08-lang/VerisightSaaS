import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('aanpak content roles copy', () => {
  it('uses the updated management discussion copy in role step 3', () => {
    const aanpakSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'aanpak-content.tsx'),
      'utf8',
    )

    expect(aanpakSource).toContain(
      'U ontvangt het rapport en de managementbespreking. Samen bepalen we wat opvalt, wat eerst telt en wie wat oppakt.',
    )
    expect(aanpakSource).not.toContain(
      'U gebruikt de eerste output om te zien wat opvalt, waar aandacht nodig is en of een vervolgrichting later logisch wordt.',
    )
  })
})
