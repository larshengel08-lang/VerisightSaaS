# Action Center Tenant Admin, Executive Readback, And Rehearsal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the next bounded enterprise-operating layer for Action Center by shipping a tenant-admin surface, an executive readback surface, and a first-route onboarding/support rehearsal pack.

**Architecture:** Build one compact readback/helper layer that both new pages can share. Keep all new runtime surfaces read-only except for links into the already-shipped bounded admin endpoints. Put the rehearsal layer in ops docs plus explicit links from the new tenant-admin surface so operating discipline is visible without inventing a broader workflow system.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, existing Action Center access helpers, existing Action Center admin routes, Markdown operating artifacts.

---

## File Structure

### Existing files to modify

- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\beheer\page.tsx`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\action-center\page.tsx`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\lib\dashboard\shell-navigation.ts`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\superpowers\specs\2026-05-23-action-center-first-pass-readiness-assessment.md`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\superpowers\specs\2026-05-23-action-center-enterprise-operating-verification-sheet.md`

### New files to create

- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\lib\action-center-enterprise-readback.ts`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\lib\action-center-enterprise-readback.test.ts`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\beheer\action-center-governance\page.tsx`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\beheer\action-center-governance\page.test.ts`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\action-center\executive\page.tsx`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\action-center\executive\page.test.ts`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_FIRST_ROUTE_ONBOARDING_REHEARSAL.md`
- `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_SUPPORT_REHEARSAL_SCORECARD.md`

### Responsibility split

- `action-center-enterprise-readback*` is the shared bounded projection layer for tenant-admin and executive readback summaries.
- `beheer/action-center-governance/page.tsx` is the tenant-admin surface for governance controls, links, and rehearsal entry.
- `action-center/executive/page.tsx` is the read-only executive surface.
- The rehearsal docs define the first-route operating drill without pretending a live result exists.

---

### Task 1: Add the shared enterprise readback helper

**Files:**
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\lib\action-center-enterprise-readback.ts`
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\lib\action-center-enterprise-readback.test.ts`

- [ ] **Step 1: Write the failing tests**

Include tests for:

```ts
it('builds a tenant admin summary with approval, support, and export counts', () => {
  expect(
    buildActionCenterTenantAdminSummary({
      routeActivationApprovals: [{ routeFamily: 'exit', approvalStatus: 'approved', scopeValue: 'org-1::department::ops', createdAt: '2026-05-23T09:00:00.000Z' }],
      supportAccessEvents: [{ accessKind: 'support', accessReason: 'Check route', createdAt: '2026-05-23T09:10:00.000Z' }],
      auditExportRequests: [{ exportScope: 'bounded_summary', requestStatus: 'generated', createdAt: '2026-05-23T09:20:00.000Z' }],
    }).controlCounts,
  ).toEqual({
    routeActivationApprovals: 1,
    supportAccessEvents: 1,
    auditExportRequests: 1,
  })
})

it('builds a read-only executive summary without manager/task framing', () => {
  expect(
    buildActionCenterExecutiveReadback({
      routeActivationApprovals: [],
      supportAccessEvents: [],
      openRouteCount: 4,
      staleRouteCount: 1,
      closeoutReadyRouteCount: 2,
    }).headline,
  ).toContain('Bestuurlijke follow-through readback')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
npx vitest run "lib/action-center-enterprise-readback.test.ts"
```

Expected: FAIL because the helper does not exist yet.

- [ ] **Step 3: Implement the minimal helper**

Create a helper shaped like:

```ts
export function buildActionCenterTenantAdminSummary(args: {
  routeActivationApprovals: Array<{ routeFamily: string; approvalStatus: string; scopeValue: string; createdAt: string }>
  supportAccessEvents: Array<{ accessKind: string; accessReason: string; createdAt: string }>
  auditExportRequests: Array<{ exportScope: string; requestStatus: string; createdAt: string }>
}) {
  return {
    headline: 'Tenant-admin governance overzicht',
    controlCounts: {
      routeActivationApprovals: args.routeActivationApprovals.length,
      supportAccessEvents: args.supportAccessEvents.length,
      auditExportRequests: args.auditExportRequests.length,
    },
  }
}
```

Also add a read-only executive builder that returns:

```ts
{
  headline: 'Bestuurlijke follow-through readback'
  summaryRows: [...]
  operatingBoundaryNote: 'Deze readback toont ritme, review en closeout; geen impactclaim.'
}
```

- [ ] **Step 4: Re-run the tests and verify they pass**

Run:

```powershell
npx vitest run "lib/action-center-enterprise-readback.test.ts"
```

Expected: PASS.

---

### Task 2: Add the tenant-admin governance surface

**Files:**
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\beheer\action-center-governance\page.tsx`
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\beheer\action-center-governance\page.test.ts`
- Modify: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\beheer\page.tsx`

- [ ] **Step 1: Write the failing page test**

Add assertions like:

```ts
expect(source).toContain('eyebrow="Tenant-admin governance"')
expect(source).toContain('title="Action Center governance controls"')
expect(source).toContain('Route activation approvals')
expect(source).toContain('Support access log')
expect(source).toContain('Audit export summary')
expect(source).toContain('Open onboarding rehearsal')
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
npx vitest run "app/(dashboard)/beheer/action-center-governance/page.test.ts"
```

Expected: FAIL because the page does not exist yet.

- [ ] **Step 3: Implement the tenant-admin page**

The page should:

- require authenticated Verisight admin
- load:
  - route activation approvals
  - support access events
  - audit export requests
- project them through `buildActionCenterTenantAdminSummary`
- render compact panels and recent rows
- link to:
  - `/beheer/health`
  - `/action-center/executive`
  - `docs/ops/ACTION_CENTER_FIRST_ROUTE_ONBOARDING_REHEARSAL.md`
  - `docs/ops/ACTION_CENTER_SUPPORT_REHEARSAL_SCORECARD.md`

The page must not:

- become a generic admin center
- expose arbitrary tenant dumps
- add generic task/workflow controls

- [ ] **Step 4: Add a bounded entry point from beheer**

Add one extra action/link from `beheer/page.tsx`:

```tsx
<Link href="/beheer/action-center-governance">Open Action Center governance</Link>
```

Keep it in the existing ops/beheer family.

- [ ] **Step 5: Re-run the page test**

Run:

```powershell
npx vitest run "app/(dashboard)/beheer/action-center-governance/page.test.ts" "app/(dashboard)/beheer/page.test.ts"
```

Expected: PASS.

---

### Task 3: Add the executive readback surface

**Files:**
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\action-center\executive\page.tsx`
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\action-center\executive\page.test.ts`
- Modify: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\app\(dashboard)\action-center\page.tsx`
- Modify: `C:\Users\larsh\Desktop\wt\ac-admin-wave\frontend\lib\dashboard\shell-navigation.ts`

- [ ] **Step 1: Write the failing executive page test**

Add assertions like:

```ts
expect(source).toContain('eyebrow="Executive readback"')
expect(source).toContain('title="Bestuurlijke follow-through readback"')
expect(source).toContain('Geen impactclaim')
expect(source).toContain('Route activation approvals')
expect(source).not.toContain('Aanmaken')
expect(source).not.toContain('Projectboard')
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
npx vitest run "app/(dashboard)/action-center/executive/page.test.ts"
```

Expected: FAIL because the page does not exist yet.

- [ ] **Step 3: Implement the read-only executive page**

The page should:

- require authenticated user
- use `loadSuiteAccessContext`
- redirect when `!context.canViewExecutiveReadback`
- load bounded Action Center readback data
- render:
  - open routes
  - stale routes
  - closeout-ready routes
  - approval/support/export counts
  - one operating-boundary note

The hero copy should include:

```tsx
eyebrow="Executive readback"
title="Bestuurlijke follow-through readback"
description="Lees hier alleen ritme, review, closeout en governance-signalen terug. Geen manager-ranking, geen projectboard en geen impactclaim."
```

- [ ] **Step 4: Add bounded navigation entry points**

Do not broaden primary Action Center nav for everyone.
Instead:

- add a quick link from `action-center/page.tsx` when `context.canViewExecutiveReadback`
- add one conditional item in `ACTION_CENTER_NAV` only if you can keep it bounded to readback semantics
- otherwise keep it as a page-level CTA only

Prefer the CTA-only route if nav conditioning becomes messy.

- [ ] **Step 5: Re-run the executive tests**

Run:

```powershell
npx vitest run "app/(dashboard)/action-center/executive/page.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected: PASS.

---

### Task 4: Add the onboarding/support rehearsal pack

**Files:**
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_FIRST_ROUTE_ONBOARDING_REHEARSAL.md`
- Create: `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_SUPPORT_REHEARSAL_SCORECARD.md`
- Modify: `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\superpowers\specs\2026-05-23-action-center-first-pass-readiness-assessment.md`
- Modify: `C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\superpowers\specs\2026-05-23-action-center-enterprise-operating-verification-sheet.md`

- [ ] **Step 1: Write the rehearsal doc assertions**

The onboarding rehearsal doc must include:

```md
## Route Family
## Participants
## Preflight
## First Route Walkthrough
## Support Interruption Drill
## Exit Conditions
```

The scorecard must include:

```md
| Check | Pass rule | Evidence | Status |
```

- [ ] **Step 2: Verify the docs do not exist yet**

Run:

```powershell
Test-Path "C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_FIRST_ROUTE_ONBOARDING_REHEARSAL.md"
Test-Path "C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_SUPPORT_REHEARSAL_SCORECARD.md"
```

Expected: both `False`.

- [ ] **Step 3: Write the rehearsal docs**

Keep them bounded to:

- one approved route family at a time
- one HR operator
- one manager participant
- one support-side interruption drill
- no route expansion
- no causal proof claim

- [ ] **Step 4: Reconcile the readiness docs**

Update the assessment and verification sheet so they say:

- tenant/admin packaging is stronger
- executive readback surface exists
- onboarding/support rehearsal is defined
- live evidence is still missing

- [ ] **Step 5: Run a placeholder scan**

Run:

```powershell
rg -n "TODO|TBD|placeholder" "C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_FIRST_ROUTE_ONBOARDING_REHEARSAL.md" "C:\Users\larsh\Desktop\wt\ac-admin-wave\docs\ops\ACTION_CENTER_SUPPORT_REHEARSAL_SCORECARD.md"
```

Expected: no matches.

---

### Task 5: Final verification and closeout

**Files:**
- All touched files in this wave

- [ ] **Step 1: Run the focused verification set**

Run:

```powershell
npx vitest run "lib/action-center-enterprise-readback.test.ts" "app/(dashboard)/beheer/action-center-governance/page.test.ts" "app/(dashboard)/beheer/page.test.ts" "app/(dashboard)/action-center/executive/page.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts" "lib/action-center-admin-governance.test.ts" "lib/suite-access.test.ts" "lib/action-center-ops-health.test.ts" "app/api/action-center/admin/route-activation-approvals/route.test.ts" "app/api/action-center/admin/support-access-events/route.test.ts" "app/api/action-center/admin/audit-exports/route.test.ts"
```

Expected: PASS.

- [ ] **Step 2: Run diff hygiene**

Run:

```powershell
git diff --check
```

Expected: no whitespace or merge-marker issues for the wave.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/action-center-enterprise-readback.ts frontend/lib/action-center-enterprise-readback.test.ts frontend/app/(dashboard)/beheer/action-center-governance/page.tsx frontend/app/(dashboard)/beheer/action-center-governance/page.test.ts frontend/app/(dashboard)/beheer/page.tsx frontend/app/(dashboard)/action-center/executive/page.tsx frontend/app/(dashboard)/action-center/executive/page.test.ts frontend/app/(dashboard)/action-center/page.tsx frontend/lib/dashboard/shell-navigation.ts docs/ops/ACTION_CENTER_FIRST_ROUTE_ONBOARDING_REHEARSAL.md docs/ops/ACTION_CENTER_SUPPORT_REHEARSAL_SCORECARD.md docs/superpowers/specs/2026-05-23-action-center-first-pass-readiness-assessment.md docs/superpowers/specs/2026-05-23-action-center-enterprise-operating-verification-sheet.md
git commit -m "feat: add action center tenant admin and executive surfaces"
```

---

## Self-Review

### Spec coverage

This plan covers:

- tenant-admin packaging
- executive-viewer packaging
- onboarding/support rehearsal definition

It intentionally does not cover:

- route expansion
- standalone launch
- external GTM
- live evidence claims

### Placeholder scan

This plan contains no `TODO`, `TBD`, or `implement later` placeholders.

### Type consistency

This plan keeps all new surfaces bounded to the already-approved Action Center truth:

- route families remain `exit | retention`
- executive readback remains read-only
- tenant-admin remains governance/readback oriented
- rehearsal remains a drill, not proof
