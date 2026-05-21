import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('/producten later vervolg section', () => {
  it('keeps only a centered Exitscan Live card and removes the old extra options', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'producten-content.tsx'),
      'utf8',
    )

    expect(source).toContain(".filter(([title]) => title === 'ExitScan Live Start')")
    expect(source).toContain("['Exitscan Live', body] as const")
    expect(source).not.toContain("title === 'Reviewcadans'")
    expect(source).toContain('maxWidth: 720')
    expect(source).not.toContain('<FollowOnRoutesAccordion')
  })
})
