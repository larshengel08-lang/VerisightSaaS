import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('pdf download button guardrails', () => {
  it('releases the loading state with the tracked format key and never references a missing setter', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('setLoadingFormat(null)')
    expect(source).not.toContain('setLoading(false)')
  })
})
