import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("campaign detail visual guardrails", () => {
  it("keeps factor trend indicators opt-in and threshold-bounded", () => {
    const source = readFileSync(
      new URL("../../components/dashboard/factor-table.tsx", import.meta.url),
      "utf8",
    )

    expect(source).toContain("previousFactorAverages?: Record<string, number>")
    expect(source).toContain("delta > 0.3")
    expect(source).toContain("delta < -0.3")
    expect(source).toContain("Vorige score:")
  })

  it("anchors score bars and empty states inside the current campaign-detail shell", () => {
    const source = readFileSync(
      new URL("../../app/(dashboard)/campaigns/[id]/page.tsx", import.meta.url),
      "utf8",
    )

    expect(source).toContain("DashboardEmptyCard")
    expect(source).toContain("scoreBarValue={stats.scan_type === \"retention\" ? averageRiskScore : undefined}")
    expect(source).toContain("DashboardScoreBar")
    expect(source).toContain("Loep Culture Index nog niet zichtbaar")
    expect(source).toContain("Behoudssignalen nog niet vrijgegeven")
    expect(source).toContain("Aanvullende context nog niet zichtbaar")
  })
})
