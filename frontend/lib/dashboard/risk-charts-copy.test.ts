import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('risk charts copy', () => {
  it('keeps visible chart copy in Dutch', () => {
    const source = readFileSync(new URL('../../components/dashboard/risk-charts.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('responses')
    expect(source).toContain('reacties')
  })
})
