import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('product detail hero prices', () => {
  it('uses the updated baseline price strings for Loep Vertrek and Loep Behoud', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )

    expect(source).toContain("vanaf €4.500 {'\\u2022'} Baseline")
    expect(source).not.toContain("EUR 2.950 {'\\u2022'} Baseline")
    expect(source).not.toContain("EUR 3.450 {'\\u2022'} Baseline")
  })
})
