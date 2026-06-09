import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('beheer contact-aanvragen admin alignment', () => {
  it('keeps lead triage operational and visibly separate from buyer-facing dashboard language', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('surface="ops"')
    expect(source).toContain('Operationele leadtriage')
    expect(source).toContain('Adminroute voor website-aanvragen')
    expect(source).toContain('Werk direct de triage, handoff en learningstatus bij')
    expect(source).toContain('Geen contactaanvragen in beeld')
  })
})
