import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("reports route shell", () => {
  it("keeps reports anchored to practical discussion and follow-up", () => {
    const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(source).toContain("Rapportbibliotheek");
    expect(source).toContain('variant="editorial"');
    expect(source).toContain("Klaar voor bespreking");
    expect(source).toContain("Open campagnedetail");
    expect(source).toContain("Action Center");
  });

  it("keeps filtering and library access tied to real report readiness", () => {
    const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(source).toContain("normalizeCategory");
    expect(source).toContain("filterReportLibraryEntries");
    expect(source).toContain(
      "Rapporten verschijnen pas als een campagne genoeg respons en duiding heeft",
    );
    expect(source).toContain("Eerst bespreken");
    expect(source).not.toContain("download center");
  });

  it("never offers direct route-open from reports for a candidate", () => {
    const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(source).toContain("Ga naar campaign detail");
    expect(source).not.toContain('entry.bridgeState === "active"');
  });
});
