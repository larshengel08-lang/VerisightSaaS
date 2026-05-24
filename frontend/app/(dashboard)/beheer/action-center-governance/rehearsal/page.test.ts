import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center rehearsal page', () => {
  it('keeps the rehearsal bounded to one route family and one support drill', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('eyebrow="Rehearsal pack"')
    expect(source).toContain('title="First-route onboarding and support rehearsal"')
    expect(source).toContain('één routefamily tegelijk')
    expect(source).toContain('support interruption drill')
    expect(source).not.toContain('route expansion')
  })
})
