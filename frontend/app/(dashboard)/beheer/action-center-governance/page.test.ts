import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center governance admin page', () => {
  it('renders a bounded tenant-admin governance surface', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('eyebrow="Tenant-admin governance"')
    expect(source).toContain('title="Action Center governance controls"')
    expect(source).toContain('Route activation approvals')
    expect(source).toContain('Support access log')
    expect(source).toContain('Audit export summary')
    expect(source).toContain('Open onboarding rehearsal')
  })
})
