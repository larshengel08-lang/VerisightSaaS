import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('tarieven content pricing copy', () => {
  it('keeps only the updated hardcoded baseline prices in tarieven-content', () => {
    const tarievenSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'tarieven-content.tsx'),
      'utf8',
    )

    expect(tarievenSource).toContain("price: 'vanaf €4.500'")
    expect(tarievenSource).not.toContain('EUR 2.950')
    expect(tarievenSource).not.toContain('EUR 3.450')
    expect(tarievenSource).not.toContain('2.950')
    expect(tarievenSource).not.toContain('3.450')
  })
})
