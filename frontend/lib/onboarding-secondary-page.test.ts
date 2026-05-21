import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Onboarding secondary page card treatment', () => {
  it('uses the refreshed product-detail card system instead of the older flat onboarding panels', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'onboarding-secondary-page.tsx'),
      'utf8',
    )

    expect(source).toContain("const cardShadow = '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)'")
    expect(source).toContain('const featureCardStyle = {')
    expect(source).toContain('const rowCardStyle = {')
    expect(source).toContain("borderRadius: 28")
    expect(source).toContain("borderRadius: 22")
    expect(source).not.toContain("backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`")
    expect(source).not.toContain("background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`")
    expect(source).toContain("{ ...featureCardStyle, padding: '28px' }")
    expect(source).toContain("{ ...featureCardStyle, alignItems: 'flex-start', display: 'flex', gap: 12, padding: '20px 22px' }")
    expect(source).toContain("{ ...rowCardStyle, display: 'flex', gap: 12, padding: '16px 18px', fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }")
    expect(source).not.toContain('Vanaf EUR 4.500 als baseline')
  })
})
