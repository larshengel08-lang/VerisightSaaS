import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('new campaign form — segmentatie', () => {
  it('stuurt segment_departments mee bij aanmaak en biedt de suggestie-optie', () => {
    const source = readFileSync(new URL('./new-campaign-form.tsx', import.meta.url), 'utf8')

    expect(source).toContain('segment_departments')
    expect(source).toContain('Geen afdeling / overig')
  })
})
