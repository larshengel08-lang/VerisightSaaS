# Action Center Lineage Read Summaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small shared lineage/read summary layer so HR and managers can see one-step-back and one-step-forward route context in overview and detail without adding new workflow or truth.

**Architecture:** Extend the existing Action Center route projector so it derives a compact lineage summary from existing reopen event truth and `follow-up-from` route relations. Surface those derived labels in the existing route summary/header UI, keeping overview compact and detail slightly richer, while preserving a single deterministic read contract for middle routes and inconsistent data fallback.

**Tech Stack:** Next.js App Router, TypeScript, React, Vitest, Playwright, Supabase-backed Action Center truth

---

### Task 1: Add lineage summary projector coverage first

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-core-semantics.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-live.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-core-semantics.test.ts`

- [ ] **Step 1: Write the failing lineage projector tests**

Add tests that pin the intended read contract:

```ts
it("projects a follow-up route as vervolg op eerdere route", () => {
  const projected = projectActionCenterRoute({
    ...buildBaseRoute(),
    routeRelations: [
      buildFollowUpRelation({
        sourceRouteId: "campaign-a::department::finance",
        targetRouteId: "campaign-b::department::finance",
        recordedAt: "2026-05-01T10:00:00.000Z",
      }),
    ],
    routeId: "campaign-b::department::finance",
  })

  expect(projected.lineageSummary?.backwardLabel).toBe("Vervolg op eerdere route")
  expect(projected.lineageSummary?.forwardLabel).toBeNull()
})

it("projects a middle route with overview-backward and detail-both lineage", () => {
  const projected = projectActionCenterRoute({
    ...buildBaseRoute(),
    routeId: "campaign-b::department::finance",
    routeRelations: [
      buildFollowUpRelation({
        sourceRouteId: "campaign-a::department::finance",
        targetRouteId: "campaign-b::department::finance",
        recordedAt: "2026-05-01T09:00:00.000Z",
      }),
      buildFollowUpRelation({
        sourceRouteId: "campaign-b::department::finance",
        targetRouteId: "campaign-c::department::finance",
        recordedAt: "2026-05-02T09:00:00.000Z",
      }),
    ],
  })

  expect(projected.lineageSummary?.overviewLabel).toBe("Vervolg op eerdere route")
  expect(projected.lineageSummary?.detailLabels).toEqual([
    "Vervolg op eerdere route",
    "Later opgevolgd",
  ])
})

it("prefers reopen over follow-up for backward lineage", () => {
  const projected = projectActionCenterRoute({
    ...buildBaseRoute(),
    routeReopens: [
      buildRouteReopen({
        routeId: "campaign-a::department::finance",
        reopenedAt: "2026-05-03T12:00:00.000Z",
      }),
    ],
    routeRelations: [
      buildFollowUpRelation({
        sourceRouteId: "campaign-z::department::finance",
        targetRouteId: "campaign-a::department::finance",
        recordedAt: "2026-05-01T10:00:00.000Z",
      }),
    ],
    routeId: "campaign-a::department::finance",
  })

  expect(projected.lineageSummary?.backwardLabel).toBe("Heropend traject")
})

it("falls back to the most recent follow-up neighbor when data is inconsistent", () => {
  const projected = projectActionCenterRoute({
    ...buildBaseRoute(),
    routeId: "campaign-b::department::finance",
    routeRelations: [
      buildFollowUpRelation({
        sourceRouteId: "campaign-a::department::finance",
        targetRouteId: "campaign-b::department::finance",
        recordedAt: "2026-05-01T08:00:00.000Z",
      }),
      buildFollowUpRelation({
        sourceRouteId: "campaign-a2::department::finance",
        targetRouteId: "campaign-b::department::finance",
        recordedAt: "2026-05-01T11:00:00.000Z",
      }),
    ],
  })

  expect(projected.lineageSummary?.backwardRouteId).toBe("campaign-a2::department::finance")
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run lib/action-center-core-semantics.test.ts lib/action-center-live.test.ts
```

Expected: FAIL with missing `lineageSummary` fields or incorrect projection behavior.

- [ ] **Step 3: Commit the failing tests**

```bash
git add frontend/lib/action-center-core-semantics.test.ts frontend/lib/action-center-live.test.ts
git commit -m "test: define action center lineage summary contract"
```

### Task 2: Implement deterministic lineage projector logic

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-core-semantics.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-route-reopen.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-live.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-core-semantics.test.ts`

- [ ] **Step 1: Add minimal lineage summary types**

Add a focused type near the existing projected route types:

```ts
export type ActionCenterLineageLabel =
  | "Heropend traject"
  | "Vervolg op eerdere route"
  | "Later opgevolgd"

export type ActionCenterLineageSummary = {
  overviewLabel: ActionCenterLineageLabel | null
  backwardLabel: ActionCenterLineageLabel | null
  backwardRouteId: string | null
  forwardLabel: ActionCenterLineageLabel | null
  forwardRouteId: string | null
  detailLabels: ActionCenterLineageLabel[]
}
```

- [ ] **Step 2: Implement reusable neighbor resolution helpers**

Add small pure helpers that keep the rules local and testable:

```ts
function pickMostRecentRelation<T extends { recordedAt: string }>(rows: T[]): T | null {
  return rows
    .slice()
    .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))[0] ?? null
}

function pickMostRecentReopen<T extends { reopenedAt: string }>(rows: T[]): T | null {
  return rows
    .slice()
    .sort((a, b) => Date.parse(b.reopenedAt) - Date.parse(a.reopenedAt))[0] ?? null
}
```

- [ ] **Step 3: Implement the lineage summary projector**

Add a projector that only reads existing truth:

```ts
export function projectActionCenterLineageSummary(input: {
  routeId: string
  routeReopens: ActionCenterRouteReopen[]
  routeRelations: ActionCenterRouteRelation[]
}): ActionCenterLineageSummary {
  const reopen = pickMostRecentReopen(
    input.routeReopens.filter((row) => row.routeId === input.routeId),
  )

  const backwardRelation = pickMostRecentRelation(
    input.routeRelations.filter((row) => row.targetRouteId === input.routeId),
  )

  const forwardRelation = pickMostRecentRelation(
    input.routeRelations.filter((row) => row.sourceRouteId === input.routeId),
  )

  const backwardLabel = reopen
    ? "Heropend traject"
    : backwardRelation
      ? "Vervolg op eerdere route"
      : null

  const forwardLabel = forwardRelation ? "Later opgevolgd" : null

  return {
    overviewLabel: backwardLabel ?? forwardLabel,
    backwardLabel,
    backwardRouteId: backwardRelation?.sourceRouteId ?? null,
    forwardLabel,
    forwardRouteId: forwardRelation?.targetRouteId ?? null,
    detailLabels: [backwardLabel, forwardLabel].filter(Boolean) as ActionCenterLineageLabel[],
  }
}
```

- [ ] **Step 4: Thread the summary into the existing projected route shape**

When projecting route cards/items, add:

```ts
lineageSummary: projectActionCenterLineageSummary({
  routeId,
  routeReopens,
  routeRelations,
}),
```

Do not add new persistence or mutation logic in this step.

- [ ] **Step 5: Run targeted tests to verify the projector passes**

Run:

```bash
npx vitest run lib/action-center-core-semantics.test.ts lib/action-center-live.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit the projector implementation**

```bash
git add frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-route-reopen.ts frontend/lib/action-center-live.ts frontend/lib/action-center-core-semantics.test.ts frontend/lib/action-center-live.test.ts
git commit -m "feat: project action center lineage summaries"
```

### Task 3: Surface overview lineage labels in the route list

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\components\dashboard\action-center-preview.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\app\(dashboard)\action-center\page.tsx`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\app\(dashboard)\action-center\page.route-shell.test.ts`

- [ ] **Step 1: Add failing overview rendering tests**

Add assertions that route cards render only the compact overview label:

```ts
it("shows a compact lineage label for a follow-up route in the route list", async () => {
  renderRouteShell({
    items: [
      buildRouteItem({
        lineageSummary: {
          overviewLabel: "Vervolg op eerdere route",
          backwardLabel: "Vervolg op eerdere route",
          backwardRouteId: "campaign-a::department::finance",
          forwardLabel: null,
          forwardRouteId: null,
          detailLabels: ["Vervolg op eerdere route"],
        },
      }),
    ],
  })

  expect(screen.getByText("Vervolg op eerdere route")).toBeInTheDocument()
})

it("prefers the backward lineage label over forward lineage in overview", async () => {
  renderRouteShell({
    items: [
      buildRouteItem({
        lineageSummary: {
          overviewLabel: "Vervolg op eerdere route",
          backwardLabel: "Vervolg op eerdere route",
          backwardRouteId: "campaign-a::department::finance",
          forwardLabel: "Later opgevolgd",
          forwardRouteId: "campaign-c::department::finance",
          detailLabels: ["Vervolg op eerdere route", "Later opgevolgd"],
        },
      }),
    ],
  })

  expect(screen.getAllByText("Vervolg op eerdere route")).not.toHaveLength(0)
  expect(screen.queryByText("Later opgevolgd")).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the overview tests to verify they fail**

Run:

```bash
npx vitest run "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected: FAIL because the overview surface does not yet render the lineage label.

- [ ] **Step 3: Render the compact overview label**

In the existing route card/preview summary area, add a small secondary line:

```tsx
{item.lineageSummary?.overviewLabel ? (
  <p className="text-xs text-muted-foreground">
    {item.lineageSummary.overviewLabel}
  </p>
) : null}
```

Keep this close to the route title/summary, not as a separate panel.

- [ ] **Step 4: Re-run the overview tests**

Run:

```bash
npx vitest run "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the overview UI**

```bash
git add "frontend/components/dashboard/action-center-preview.tsx" "frontend/app/(dashboard)/action-center/page.tsx" "frontend/app/(dashboard)/action-center/page.route-shell.test.ts"
git commit -m "feat: show action center lineage labels in overview"
```

### Task 4: Surface richer detail lineage context with direct links

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\components\dashboard\action-center-preview.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\lib\action-center-live.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\tests\e2e\action-center-route-reopen.spec.ts`

- [ ] **Step 1: Add failing detail tests for dual lineage**

Add a render test for the selected route detail state:

```ts
it("shows both backward and forward lineage in detail for a middle route", () => {
  renderPreview({
    selectedItem: buildRouteItem({
      lineageSummary: {
        overviewLabel: "Vervolg op eerdere route",
        backwardLabel: "Vervolg op eerdere route",
        backwardRouteId: "campaign-a::department::finance",
        forwardLabel: "Later opgevolgd",
        forwardRouteId: "campaign-c::department::finance",
        detailLabels: ["Vervolg op eerdere route", "Later opgevolgd"],
      },
    }),
  })

  expect(screen.getByText("Vervolg op eerdere route")).toBeInTheDocument()
  expect(screen.getByText("Later opgevolgd")).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the detail tests to verify they fail**

Run:

```bash
npx vitest run lib/action-center-live.test.ts
```

Expected: FAIL because the detail surface does not yet show both lineage readings.

- [ ] **Step 3: Render compact lineage links in the detail header**

Add a small inline block near the route heading:

```tsx
<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
  {selected.lineageSummary?.backwardLabel && selected.lineageSummary.backwardRouteId ? (
    <button onClick={() => focusRoute(selected.lineageSummary!.backwardRouteId!)}>
      {selected.lineageSummary.backwardLabel}
    </button>
  ) : null}
  {selected.lineageSummary?.forwardLabel && selected.lineageSummary.forwardRouteId ? (
    <button onClick={() => focusRoute(selected.lineageSummary!.forwardRouteId!)}>
      {selected.lineageSummary.forwardLabel}
    </button>
  ) : null}
</div>
```

Use the existing focus/open route mechanism rather than introducing a new router path helper.

- [ ] **Step 4: Add browser coverage for the detail links**

Extend the existing route reopen/follow-up Playwright flow:

```ts
test("detail lineage lets HR navigate to previous and next route context", async ({ page }) => {
  await page.goto("/action-center", { waitUntil: "domcontentloaded" })
  await expect(page.getByText("Vervolg op eerdere route")).toBeVisible()
  await page.getByRole("button", { name: "Vervolg op eerdere route" }).click()
  await expect(page.getByText("Later opgevolgd")).toBeVisible()
})
```

- [ ] **Step 5: Run the detail unit test and browser spec**

Run:

```bash
npx vitest run lib/action-center-live.test.ts
npx playwright test tests/e2e/action-center-route-reopen.spec.ts --project=chromium --workers=1
```

Expected: PASS

- [ ] **Step 6: Commit the detail lineage UI**

```bash
git add frontend/components/dashboard/action-center-preview.tsx frontend/lib/action-center-live.test.ts frontend/tests/e2e/action-center-route-reopen.spec.ts
git commit -m "feat: add action center detail lineage context"
```

### Task 5: Verify the full lineage summary slice end-to-end

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\tests\e2e\action-center-manager-access.spec.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\scripts\seed-action-center-manager-pilot.mjs`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\action-center-follow-up-route-trigger\frontend\tests\e2e\action-center-manager-access.spec.ts`

- [ ] **Step 1: Ensure the seed still exposes previous/current/next route data**

If the current seed only creates one direction of lineage, extend it minimally:

```js
await upsertRouteRelation({
  source_route_id: sourceRouteId,
  target_route_id: currentRouteId,
  route_relation_type: "follow-up-from",
  trigger_reason: "hernieuwde-hr-beoordeling",
  recorded_at: now,
})

await upsertRouteRelation({
  source_route_id: currentRouteId,
  target_route_id: nextRouteId,
  route_relation_type: "follow-up-from",
  trigger_reason: "nieuw-campaign-signaal",
  recorded_at: later,
})
```

- [ ] **Step 2: Add a manager-facing browser assertion**

Extend the manager spec to verify the compact label also makes sense outside HR:

```ts
test("manager sees compact lineage context on a follow-up route", async ({ page }) => {
  await page.goto("/action-center", { waitUntil: "domcontentloaded" })
  await expect(page.getByText("Vervolg op eerdere route")).toBeVisible()
})
```

- [ ] **Step 3: Run the seed, unit tests, browser tests, lint, and build**

Run:

```bash
node ./scripts/seed-action-center-manager-pilot.mjs
npx vitest run lib/action-center-core-semantics.test.ts lib/action-center-live.test.ts "app/(dashboard)/action-center/page.route-shell.test.ts"
npx eslint "components/dashboard/action-center-preview.tsx" "lib/action-center-core-semantics.ts" "lib/action-center-live.ts" "lib/action-center-core-semantics.test.ts" "lib/action-center-live.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts" "tests/e2e/action-center-route-reopen.spec.ts" "tests/e2e/action-center-manager-access.spec.ts"
npx playwright test tests/e2e/action-center-route-reopen.spec.ts tests/e2e/action-center-manager-access.spec.ts --project=chromium --workers=1
npm run build
```

Expected:
- seed succeeds
- targeted Vitest passes
- ESLint is clean
- Playwright passes
- build succeeds

- [ ] **Step 4: Commit the verification slice**

```bash
git add frontend/tests/e2e/action-center-manager-access.spec.ts frontend/tests/e2e/action-center-route-reopen.spec.ts frontend/scripts/seed-action-center-manager-pilot.mjs
git commit -m "test: verify action center lineage summaries"
```

## Spec Coverage Check
- Shared small lineage summary for HR and manager: Tasks 2-4
- One step back and one step forward only: Tasks 1-2
- Canonical labels `Heropend traject`, `Vervolg op eerdere route`, `Later opgevolgd`: Tasks 1-4
- Overview compact / detail slightly richer: Tasks 3-4
- Reopen precedence over follow-up: Task 1 and Task 2
- Middle-route projection rule: Task 1 and Task 4
- Deterministic fallback for inconsistent neighbor data: Task 1 and Task 2
- No new truth or workflow additions: enforced by Task 2 scope and Task 4 reuse of existing focus behavior

