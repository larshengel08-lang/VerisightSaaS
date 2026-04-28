import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("action center landing shell", () => {
  it("keeps the landing framed as a dedicated management module", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
    const previewSource = readFileSync(
      new URL("../../../components/dashboard/action-center-preview.tsx", import.meta.url),
      "utf8",
    );

    expect(pageSource).toContain("Wat hier straks landt");
    expect(pageSource).toContain("Action Center managementroute");
    expect(previewSource).toContain("Managementritme");
    expect(previewSource).toContain("Aanbevolen focus");
    expect(previewSource).toContain("Action Center blijft een eigen suite-module");
    expect(previewSource).toContain("Open focusactie");
  });

  it("keeps detail states anchored to action, review and ownership truth", () => {
    const previewSource = readFileSync(
      new URL("../../../components/dashboard/action-center-preview.tsx", import.meta.url),
      "utf8",
    );

    expect(previewSource).toContain("Waarom dit nu speelt");
    expect(previewSource).toContain("Behandelroute");
    expect(previewSource).toContain("Reviewritme");
    expect(previewSource).toContain("Eigenaarschap");
    expect(previewSource).toContain("Teamcontext");
    expect(previewSource).toContain("Open teamacties");
  });
});
