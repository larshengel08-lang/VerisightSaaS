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
})
