# Admin Ops Surface Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the admin information architecture so `/beheer` remains the setup hub, `/beheer/contact-aanvragen` and `/beheer/klantlearnings` remain the only primary specialist admin pages, and `billing`, `health`, and `proof` become lower-weight secondary surfaces without losing their underlying capabilities.

**Architecture:** Keep all backend registries, telemetry, and proof APIs intact. Make the change entirely in the admin information architecture layer: remove `billing`, `health`, and `proof` from primary navigation and primary `/beheer` entrypoints, add compact secondary summary surfaces to `/beheer`, add a compact proof summary surface to `/beheer/klantlearnings`, and leave the old standalone routes temporarily alive as transition deep links.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind CSS, Supabase server access, existing dashboard primitives and admin registries.

---

## File Map

### Primary implementation files

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\page.tsx`
  - Remove `billing`, `health`, and `proof` as primary admin actions
  - Add collapsed `Operations & registries` summary section
  - Reuse existing server-loaded setup data and add compact registry summaries

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\klantlearnings\page.tsx`
  - Add a lower-weight proof summary surface
  - Keep the page’s existing learning workbench role intact

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\dashboard-shell-config.ts`
  - Confirm admin shell navigation exposes only `Setup`, `Leads`, `Learnings`
  - Remove any lingering expectation that `billing`, `health`, or `proof` are primary

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\shell-navigation.ts`
  - Confirm admin nav labels and current-label logic stay coherent after IA simplification

### Secondary validation / cleanup files

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\page.test.ts`
  - Update assertions for secondary ops summaries instead of primary workbench exposure

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\color-semantics.test.ts`
  - Adjust if color or tone assumptions change during the new summary section

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\klantlearnings\page.test.ts`
  - Add assertions for proof summary presence without turning proof into a standalone primary destination

- Inspect only, do not remove yet:
  - `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\billing\page.tsx`
  - `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\health\page.tsx`
  - `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\proof\page.tsx`
  - These remain transition deep-link pages in this pass

### Registry and data helpers to reuse, not redesign

- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\billing-registry.ts`
- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\billing-registry-server.ts`
- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\action-center-ops-health.ts`
- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\telemetry\store.ts`
- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\proof-registry.ts`
- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\proof-registry-server.ts`

## Task 1: Lock the admin navigation to the reduced page set

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\dashboard-shell-config.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\shell-navigation.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\dashboard-shell.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\shell-navigation.test.ts`

- [ ] Review the existing admin navigation sources and confirm there is no remaining primary nav item for `billing`, `health`, or `proof`.

Run:

```powershell
Get-Content 'C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\dashboard-shell-config.ts'
Get-Content 'C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\shell-navigation.ts'
```

Expected: only `Setup`, `Leads`, and `Learnings` are present in admin shell nav.

- [ ] Add or update tests so the reduced primary admin nav becomes explicit and guarded.

Run:

```powershell
npx jest "lib/dashboard/dashboard-shell.test.ts" "lib/dashboard/shell-navigation.test.ts"
```

Expected: failing or incomplete coverage before updates.

- [ ] Make the minimal code changes needed so current-label and nav behavior remain correct for the simplified IA.

- [ ] Re-run the targeted navigation tests.

Run:

```powershell
npx jest "lib/dashboard/dashboard-shell.test.ts" "lib/dashboard/shell-navigation.test.ts"
```

Expected: PASS.

- [ ] Commit.

```powershell
git add frontend/lib/dashboard/dashboard-shell-config.ts frontend/lib/dashboard/shell-navigation.ts frontend/lib/dashboard/dashboard-shell.test.ts frontend/lib/dashboard/shell-navigation.test.ts
git commit -m "refactor: lock admin nav to setup leads and learnings"
```

## Task 2: Replace primary billing/health/proof entrypoints on `/beheer`

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\page.tsx`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\page.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\color-semantics.test.ts`

- [ ] Inspect the current `/beheer` hero actions and secondary workbench rows.

Run:

```powershell
Get-Content 'C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\page.tsx' | Select-Object -First 420
```

Expected: current page still exposes `Health`, `Billing`, and `Proof` as explicit admin destinations.

- [ ] Update `/beheer` tests first so they assert the intended IA:
  - setup remains primary
  - `Contact-aanvragen` and `Klantlearnings` stay visible
  - `Health`, `Billing`, and `Proof` no longer appear as equal primary workbench destinations
  - an `Operations & registries` secondary surface is expected

- [ ] Run the targeted `/beheer` tests to verify they fail before implementation.

Run:

```powershell
npx jest "app/(dashboard)/beheer/page.test.ts" "app/(dashboard)/beheer/color-semantics.test.ts"
```

Expected: FAIL on new assertions.

- [ ] Update `/beheer` so the primary setup experience stays dominant and `Health`, `Billing`, and `Proof` move into one collapsed secondary `Operations & registries` section.

Implementation rules:
- keep the existing setup flow intact
- keep `Contact-aanvragen` and `Klantlearnings` as the only primary secondary links
- use compact summary panels for:
  - billing readiness
  - health signals
  - proof status
- do not embed large tables from the old standalone pages

- [ ] Re-run the targeted `/beheer` tests.

Run:

```powershell
npx jest "app/(dashboard)/beheer/page.test.ts" "app/(dashboard)/beheer/color-semantics.test.ts"
```

Expected: PASS.

- [ ] Commit.

```powershell
git add frontend/app/(dashboard)/beheer/page.tsx frontend/app/(dashboard)/beheer/page.test.ts frontend/app/(dashboard)/beheer/color-semantics.test.ts
git commit -m "feat: simplify admin beheer ops entrypoints"
```

## Task 3: Add proof summary to `/beheer/klantlearnings`

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\klantlearnings\page.tsx`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\klantlearnings\page.test.ts`
- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\proof-registry.ts`
- Reuse: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\proof-registry-server.ts`

- [ ] Inspect the current `klantlearnings` page structure and find the correct low-weight insertion point for proof state.

Run:

```powershell
Get-Content 'C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\klantlearnings\page.tsx' | Select-Object -First 320
```

Expected: the page currently focuses on delivery learnings without a compact integrated proof summary.

- [ ] Add or update tests so proof summary presence is explicit:
  - proof summary exists
  - it is lower-weight than the core learnings workspace
  - it does not turn `Proof` into a separate primary CTA on the page

- [ ] Run the targeted `klantlearnings` test to verify it fails before implementation.

Run:

```powershell
npx jest "app/(dashboard)/beheer/klantlearnings/page.test.ts"
```

Expected: FAIL on new proof summary assertions.

- [ ] Implement the compact proof summary using existing proof registry helpers.

Implementation rules:
- show:
  - lesson / sales / public counts
  - approval/proof summary language
- keep it compact
- do not embed the full proof registry table here
- do not add a primary navigation treatment

- [ ] Re-run the `klantlearnings` test.

Run:

```powershell
npx jest "app/(dashboard)/beheer/klantlearnings/page.test.ts"
```

Expected: PASS.

- [ ] Commit.

```powershell
git add frontend/app/(dashboard)/beheer/klantlearnings/page.tsx frontend/app/(dashboard)/beheer/klantlearnings/page.test.ts
git commit -m "feat: integrate proof summary into klantlearnings"
```

## Task 4: Preserve old standalone routes as transition deep links

**Files:**
- Inspect: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\billing\page.tsx`
- Inspect: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\health\page.tsx`
- Inspect: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\proof\page.tsx`
- Test: existing page tests for those routes

- [ ] Confirm the old standalone pages still render and remain admin-gated, but are no longer advertised as primary destinations.

Run:

```powershell
npx jest "app/(dashboard)/beheer/billing/page.test.ts" "app/(dashboard)/beheer/health/page.test.ts" "app/(dashboard)/beheer/proof/page.test.ts"
```

Expected: PASS, preserving transition behavior.

- [ ] If any page still claims primary admin status in headings or CTA framing, soften the copy so it reads as an expert/deep-link registry rather than a peer of setup, leads, or learnings.

- [ ] Re-run the standalone route tests.

Run:

```powershell
npx jest "app/(dashboard)/beheer/billing/page.test.ts" "app/(dashboard)/beheer/health/page.test.ts" "app/(dashboard)/beheer/proof/page.test.ts"
```

Expected: PASS.

- [ ] Commit.

```powershell
git add frontend/app/(dashboard)/beheer/billing/page.tsx frontend/app/(dashboard)/beheer/health/page.tsx frontend/app/(dashboard)/beheer/proof/page.tsx
git commit -m "refactor: demote admin registry pages to transition deep links"
```

## Task 5: Full verification and cleanup pass

**Files:**
- Verify all modified files from Tasks 1-4

- [ ] Run the full focused admin test set.

Run:

```powershell
npx jest "app/(dashboard)/beheer/page.test.ts" "app/(dashboard)/beheer/color-semantics.test.ts" "app/(dashboard)/beheer/contact-aanvragen/page.test.ts" "app/(dashboard)/beheer/klantlearnings/page.test.ts" "app/(dashboard)/beheer/billing/page.test.ts" "app/(dashboard)/beheer/health/page.test.ts" "app/(dashboard)/beheer/proof/page.test.ts" "lib/dashboard/dashboard-shell.test.ts" "lib/dashboard/shell-navigation.test.ts"
```

Expected: PASS.

- [ ] Run eslint on the touched admin files.

Run:

```powershell
npx eslint "app/(dashboard)/beheer/page.tsx" "app/(dashboard)/beheer/klantlearnings/page.tsx" "app/(dashboard)/beheer/billing/page.tsx" "app/(dashboard)/beheer/health/page.tsx" "app/(dashboard)/beheer/proof/page.tsx" "lib/dashboard/dashboard-shell-config.ts" "lib/dashboard/shell-navigation.ts"
```

Expected: no new lint errors.

- [ ] Run a production build with the usual local public Supabase env fallback.

Run:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co'; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='test-anon-key'; npm run build
```

Expected: build succeeds; only unrelated existing warnings may remain.

- [ ] Sanity-check link behavior in code by searching for old primary admin references.

Run:

```powershell
rg -n "/beheer/billing|/beheer/health|/beheer/proof" "frontend"
```

Expected:
- old routes may still exist
- no primary admin hero/nav should advertise them as first-class destinations

- [ ] Commit the verification-safe final state.

```powershell
git add frontend/app/(dashboard)/beheer/page.tsx frontend/app/(dashboard)/beheer/klantlearnings/page.tsx frontend/app/(dashboard)/beheer/billing/page.tsx frontend/app/(dashboard)/beheer/health/page.tsx frontend/app/(dashboard)/beheer/proof/page.tsx frontend/app/(dashboard)/beheer/page.test.ts frontend/app/(dashboard)/beheer/color-semantics.test.ts frontend/app/(dashboard)/beheer/klantlearnings/page.test.ts frontend/lib/dashboard/dashboard-shell-config.ts frontend/lib/dashboard/shell-navigation.ts frontend/lib/dashboard/dashboard-shell.test.ts frontend/lib/dashboard/shell-navigation.test.ts
git commit -m "feat: simplify admin ops surfaces"
```

## Spec Coverage Check

- Primary pages preserved: covered by Tasks 1 and 2
- `billing` and `health` moved into `/beheer`: covered by Task 2
- `proof` moved into `klantlearnings`: covered by Task 3
- old routes preserved as transition deep links: covered by Task 4
- no capability loss: covered by Tasks 2-5

## Placeholder Scan

No `TODO`, `TBD`, or “implement later” placeholders remain in this plan.

## Type / Naming Consistency Check

- `Operations & registries` is the canonical name for the new secondary `/beheer` surface
- `Setup`, `Leads`, and `Learnings` are the canonical primary admin nav labels
- old routes remain “transition deep links” rather than “primary workbenches”

## Execution Handoff

Plan complete and saved to `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\plans\2026-05-17-admin-ops-surface-simplification.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
