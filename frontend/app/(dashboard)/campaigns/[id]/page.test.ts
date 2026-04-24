import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail color semantics', () => {
  it('keeps informational layers neutral and reserves emerald or amber for real status meaning', () => {
    const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
    const helpersSource = readFileSync(new URL('./page-helpers.tsx', import.meta.url), 'utf8')
    const chartsSource = readFileSync(
      new URL('../../../../components/dashboard/risk-charts.tsx', import.meta.url),
      'utf8',
    )

    expect(pageSource).toContain("label: 'Readiness', value: readinessLabel, tone: hasEnoughData ? 'emerald' : 'amber'")
    expect(pageSource).toContain('aside={<DashboardChip label={focusBadgeLabel} tone="slate" />}')
    expect(pageSource).toContain('aside={<DashboardChip label={productExperience.routeBadgeLabel} tone="slate" />}')
    expect(pageSource).toContain("return tone === 'blue' ? 'slate' : tone")

    expect(helpersSource).toContain("tone: hasEnoughData ? 'slate' : hasMinDisplay ? 'amber' : 'amber'")
    expect(helpersSource).toContain("tone: 'amber'")
    expect(helpersSource).toContain("tone: 'slate'")
    expect(helpersSource).toContain('<CardColumn title="Logische acties" tone="slate">')

    expect(chartsSource).toContain('<Bar dataKey="count" fill="#94A3B8" radius={[2, 2, 0, 0]} />')
  })
})
