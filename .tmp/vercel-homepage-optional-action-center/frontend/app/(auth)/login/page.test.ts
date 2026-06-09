import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('auth release wording', () => {
  it('keeps login and activation copy tied to dashboard and campaign release', () => {
    const loginSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const completeAccountSource = readFileSync(new URL('../complete-account/page.tsx', import.meta.url), 'utf8')

    expect(loginSource).toContain('vrijgegeven')
    expect(loginSource).toContain('eerste read')
    expect(completeAccountSource).toContain('vrijgegeven')
    expect(completeAccountSource).toContain('juiste dashboard')
    expect(completeAccountSource).toContain('juiste campaign')
  })
})
