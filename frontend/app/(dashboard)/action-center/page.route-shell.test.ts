import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("action center landing shell", () => {
  it("keeps the server page thin and delegates the UI to ActionCenterPreview", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("buildLiveActionCenterItems(liveContexts)");
    expect(pageSource).toContain("getLiveActionCenterSummary(items)");
    expect(pageSource).toContain("<ActionCenterPreview");
    expect(pageSource).toContain("hideSidebar");
  });

  it("passes a focused campaign id from the route shell into the preview", () => {
    const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(pageSource).toContain("searchParams");
    expect(pageSource).toContain("focusItemId");
    expect(pageSource).toContain("initialSelectedItemId={focusItemId}");
  });

  it("keeps route detail rendering delegated to preview helpers", () => {
    const previewSource = readFileSync(
      new URL("../../../components/dashboard/action-center-preview.tsx", import.meta.url),
      "utf8",
    );

    expect(previewSource).toContain("RouteFieldCard");
    expect(previewSource).toContain("RouteOutcomeCard");
    expect(previewSource).toContain("getReviewOutcomeMeta");
    expect(previewSource).toContain("getOwnerDisplayName");
    expect(previewSource).toContain("initialItems.find((item) => item.id === initialSelectedItemId)");
  });

  it("requires preview items to carry canonical core semantics as one grouped field", () => {
    const previewModelSource = readFileSync(
      new URL("../../../lib/action-center-preview-model.ts", import.meta.url),
      "utf8",
    );
    const liveProjectionSource = readFileSync(
      new URL("../../../lib/action-center-live.ts", import.meta.url),
      "utf8",
    );

    expect(previewModelSource).toContain("coreSemantics:");
    expect(previewModelSource).toContain("ActionCenterCoreSemantics");
    expect(liveProjectionSource).toContain("projectActionCenterCoreSemantics");
    expect(liveProjectionSource).toContain("coreSemantics: projectActionCenterCoreSemantics(");
  });
});
