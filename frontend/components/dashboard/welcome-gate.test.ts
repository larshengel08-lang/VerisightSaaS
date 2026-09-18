import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./welcome-gate.tsx', import.meta.url), 'utf8')

describe('welkomstscherm vóór de wizard (walkthrough 3.1)', () => {
  it('noemt de meting niet "je eerste scan": bij een vervolgmeting is dat onwaar', () => {
    expect(src).toContain('Je meting staat klaar.')
    expect(src).not.toContain('Je eerste scan')
  })
  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
