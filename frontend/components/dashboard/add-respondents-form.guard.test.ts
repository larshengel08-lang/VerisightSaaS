import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('add respondents form clarity', () => {
  it('treats department and role level as standard import metadata without segment add-on framing', () => {
    const source = readFileSync(new URL('./add-respondents-form.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('segment_deep_dive')
    expect(source).not.toContain('Segment deep dive staat aan voor deze campaign')
    expect(source).not.toContain('Acceptance-gate voor import')
    expect(source).not.toContain('Canonieke klantaanlevering')
  })
})
