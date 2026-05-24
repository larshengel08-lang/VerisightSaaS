# Action Center Enterprise Operating Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the highest-risk Action Center enterprise-operating gaps without expanding product scope, route scope, or commercial claims.

**Architecture:** Add one bounded admin-governance layer around the existing Action Center runtime instead of redesigning Action Center itself. The wave should introduce explicit tenant/admin controls, route-activation approval truth, support-access logging, audit-export scaffolding, and retention/deletion policy artifacts while preserving the current `exit` / `retention` route-bound model.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Supabase schema + SQL migrations, existing Action Center access/governance helpers, admin health surfaces, Markdown operating artifacts.

---

## File Structure

### Existing files to modify

- `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\suite-access.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\suite-access.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\workspace-members\route.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\health\page.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\supabase\schema.sql`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-first-pass-readiness-assessment.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-tenant-admin-gap-table.md`

### New files to create

- `C:\Users\larsh\Desktop\Business\Verisight\migrations\2026_05_23_add_action_center_enterprise_admin_controls.sql`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\action-center-admin-governance.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\action-center-admin-governance.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\route-activation-approvals\route.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\route-activation-approvals\route.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\support-access-events\route.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\support-access-events\route.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\audit-exports\route.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\audit-exports\route.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-enterprise-operating-verification-sheet.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\ops\ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md`
- `C:\Users\larsh\Desktop\Business\Verisight\docs\ops\ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md`

### Responsibility split

- `suite-access*` remains the runtime truth for personas, visibility, and bounded capabilities.
- `action-center-admin-governance*` becomes the compact helper layer for admin-control decisions that should not be spread across route handlers.
- `admin/*` API routes expose enterprise-operating controls without broadening the end-user Action Center surface.
- SQL migration + `schema.sql` become the source of truth for new approval/log/export tables.
- Docs in `docs/superpowers/specs` and `docs/ops` become the explicit operating proof layer that the readiness assessment currently lacks.

---

### Task 1: Create the enterprise-operating verification sheet and close the doc-level gaps

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-enterprise-operating-verification-sheet.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\docs\ops\ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\docs\ops\ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-first-pass-readiness-assessment.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-tenant-admin-gap-table.md`

- [ ] **Step 1: Write the failing doc assertions as a checklist**

Add these expected headings to the verification sheet draft:

```md
# Action Center Enterprise Operating Verification Sheet

## Capability Status Grid
## Activation Approval Controls
## Support Access Logging
## Audit Export Readiness
## Retention And Deletion Controls
## Blocking Risks
```

- [ ] **Step 2: Verify the sheet does not exist yet**

Run:

```powershell
Test-Path "C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-enterprise-operating-verification-sheet.md"
```

Expected: `False`

- [ ] **Step 3: Write the verification sheet**

Include one row per high-risk gap with:

```md
| Capability | Required for near-standalone? | Current runtime evidence | Required owner | Next verification step | Blocking? |
|---|---|---|---|---|---|
| Tenant admin role | yes | not explicit | product + engineering | verify role and scope model | yes |
```

Also include explicit sections for:

- tenant admin
- executive viewer
- route activation approvals
- audit export
- support access logging
- retention/deletion policy

- [ ] **Step 4: Write the retention/deletion policy**

The new policy doc must explicitly define:

```md
## Scope
- Action Center route truth
- Action Center workspace membership truth
- Action Center approval and support-access records

## Retention Rules
- operational runtime truth
- support-access records
- audit export request records

## Deletion And Archival Rules
- what can be archived
- what cannot be silently deleted
- who approves deletion
```

- [ ] **Step 5: Write the support-access and incident matrix**

The matrix must separate:

```md
| Case | Owner | Response path | Logged artifact | Escalation |
|---|---|---|---|---|
| Product issue | Product/engineering | fix runtime issue | support access event | engineering |
| Governance issue | HR/governance owner | review route/admin truth | support access event | governance |
| Privacy question | Founder/privacy owner | review boundaries and retention rules | support access event | privacy |
```

- [ ] **Step 6: Reconcile the two existing readiness docs**

Update the readiness assessment and gap table so they reference the new verification sheet and policy docs as the next operating layer instead of only calling for them abstractly.

- [ ] **Step 7: Run a placeholder and heading sanity check**

Run:

```powershell
rg -n "TODO|TBD|placeholder" "C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-enterprise-operating-verification-sheet.md" "C:\Users\larsh\Desktop\Business\Verisight\docs\ops\ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md" "C:\Users\larsh\Desktop\Business\Verisight\docs\ops\ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md"
```

Expected: no matches

- [ ] **Step 8: Commit**

```bash
git add docs/superpowers/specs/2026-05-23-action-center-enterprise-operating-verification-sheet.md docs/ops/ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md docs/ops/ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md docs/superpowers/specs/2026-05-23-action-center-first-pass-readiness-assessment.md docs/superpowers/specs/2026-05-23-action-center-tenant-admin-gap-table.md
git commit -m "docs: add action center enterprise operating verification layer"
```

---

### Task 2: Add the bounded admin-governance capability layer

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\action-center-admin-governance.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\action-center-admin-governance.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\suite-access.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\suite-access.test.ts`

- [ ] **Step 1: Write the failing tests for the new capability layer**

Add tests like:

```ts
it('grants tenant admin only to verisight admin or explicit customer admin capability', () => {
  expect(resolveActionCenterAdminCapabilities({
    persona: 'customer_owner',
    memberRole: 'owner',
    workspaceRoles: [],
  }).canManageTenantAdmin).toBe(false)
})

it('keeps executive viewer aggregated and read-only', () => {
  expect(resolveActionCenterAdminCapabilities({
    persona: 'customer_viewer',
    memberRole: 'viewer',
    workspaceRoles: [],
  }).canViewExecutiveReadback).toBe(false)
})
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```powershell
npx vitest run "lib/action-center-admin-governance.test.ts" "lib/suite-access.test.ts"
```

Expected: fail because the helper does not exist and the new capability fields are not wired yet

- [ ] **Step 3: Implement the minimal helper**

Create a helper shaped like:

```ts
export interface ActionCenterAdminCapabilities {
  canManageTenantAdmin: boolean
  canApproveRouteActivation: boolean
  canRequestAuditExport: boolean
  canLogSupportAccess: boolean
  canViewExecutiveReadback: boolean
}

export function resolveActionCenterAdminCapabilities(...) {
  return {
    canManageTenantAdmin: false,
    canApproveRouteActivation: false,
    canRequestAuditExport: false,
    canLogSupportAccess: false,
    canViewExecutiveReadback: false,
  }
}
```

Then wire it into `suite-access.ts` as additive capability truth without broadening user-facing Action Center access.

- [ ] **Step 4: Re-run the tests and verify they pass**

Run:

```powershell
npx vitest run "lib/action-center-admin-governance.test.ts" "lib/suite-access.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/action-center-admin-governance.ts frontend/lib/action-center-admin-governance.test.ts frontend/lib/suite-access.ts frontend/lib/suite-access.test.ts
git commit -m "feat: add action center admin governance capabilities"
```

---

### Task 3: Add route-activation approval truth and support-access logging truth

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\migrations\2026_05_23_add_action_center_enterprise_admin_controls.sql`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\supabase\schema.sql`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\route-activation-approvals\route.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\route-activation-approvals\route.test.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\support-access-events\route.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\support-access-events\route.test.ts`

- [ ] **Step 1: Write the failing route tests**

Add tests like:

```ts
it('rejects route activation approval writes from non-admin actors', async () => {
  const response = await POST(buildRequest({ actorRole: 'customer_owner' }))
  expect(response.status).toBe(403)
})

it('stores support access events with reason and affected route scope', async () => {
  const response = await POST(buildSupportAccessRequest())
  expect(response.status).toBe(200)
})
```

- [ ] **Step 2: Run the new route tests to verify they fail**

Run:

```powershell
npx vitest run "app/api/action-center/admin/route-activation-approvals/route.test.ts" "app/api/action-center/admin/support-access-events/route.test.ts"
```

Expected: fail because the routes and backing tables do not exist yet

- [ ] **Step 3: Add the new SQL tables**

The migration and `schema.sql` must add bounded tables shaped like:

```sql
create table if not exists public.action_center_route_activation_approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  route_family text not null,
  scope_value text not null,
  requested_by uuid not null,
  approved_by uuid null,
  approval_status text not null check (approval_status in ('requested','approved','rejected','revoked')),
  rationale text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.action_center_support_access_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  route_id text null,
  scope_value text null,
  accessed_by uuid not null,
  access_reason text not null,
  access_kind text not null check (access_kind in ('support','privacy','governance','incident')),
  created_at timestamptz not null default now()
);
```

Keep scope bounded: no generic workflow admin tables.

- [ ] **Step 4: Implement the API routes**

Use the new admin-governance helper to enforce writes.
The route handlers should accept only the minimal bounded payload:

```ts
type RouteActivationApprovalBody = {
  orgId: string
  routeFamily: 'exit' | 'retention'
  scopeValue: string
  rationale?: string | null
}

type SupportAccessEventBody = {
  orgId: string
  routeId?: string | null
  scopeValue?: string | null
  accessKind: 'support' | 'privacy' | 'governance' | 'incident'
  accessReason: string
}
```

- [ ] **Step 5: Re-run the route tests and verify they pass**

Run:

```powershell
npx vitest run "app/api/action-center/admin/route-activation-approvals/route.test.ts" "app/api/action-center/admin/support-access-events/route.test.ts"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add migrations/2026_05_23_add_action_center_enterprise_admin_controls.sql supabase/schema.sql frontend/app/api/action-center/admin/route-activation-approvals/route.ts frontend/app/api/action-center/admin/route-activation-approvals/route.test.ts frontend/app/api/action-center/admin/support-access-events/route.ts frontend/app/api/action-center/admin/support-access-events/route.test.ts
git commit -m "feat: add action center activation approvals and support access logs"
```

---

### Task 4: Add bounded audit-export scaffolding and admin health readback

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\audit-exports\route.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\api\action-center\admin\audit-exports\route.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\beheer\health\page.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\action-center-ops-health.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\action-center-ops-health.test.ts`

- [ ] **Step 1: Write the failing audit-export and health tests**

Add tests like:

```ts
it('returns a bounded audit export summary instead of raw unrestricted dumps', async () => {
  const response = await GET(buildAuditExportRequest())
  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({
    routeActivations: expect.any(Array),
    supportAccessEvents: expect.any(Array),
  })
})

it('summarizes support access and route activation coverage in ops health', () => {
  expect(summarizeActionCenterOpsHealth(rows).supportAccessEventCount).toBe(1)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```powershell
npx vitest run "app/api/action-center/admin/audit-exports/route.test.ts" "lib/action-center-ops-health.test.ts"
```

Expected: fail because export shape and new ops counts do not exist yet

- [ ] **Step 3: Implement the bounded export route**

The route should return:

```ts
{
  routeActivations: Array<{ routeFamily: string; approvalStatus: string; scopeValue: string; createdAt: string }>
  supportAccessEvents: Array<{ accessKind: string; accessReason: string; createdAt: string }>
}
```

No unrestricted raw tenant dump, no generic export center.

- [ ] **Step 4: Extend the health summary**

Add support for:

- route activation approval counts
- support access event counts
- missing-control messaging when these are absent

Keep the health page admin-only and compact.

- [ ] **Step 5: Re-run the tests and verify they pass**

Run:

```powershell
npx vitest run "app/api/action-center/admin/audit-exports/route.test.ts" "lib/action-center-ops-health.test.ts"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/app/api/action-center/admin/audit-exports/route.ts frontend/app/api/action-center/admin/audit-exports/route.test.ts frontend/app/(dashboard)/beheer/health/page.tsx frontend/lib/action-center-ops-health.ts frontend/lib/action-center-ops-health.test.ts
git commit -m "feat: add action center audit export scaffolding and health readback"
```

---

### Task 5: Final verification and readiness closeout

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-first-pass-readiness-assessment.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-tenant-admin-gap-table.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\specs\2026-05-23-action-center-enterprise-operating-verification-sheet.md`

- [ ] **Step 1: Run the full bounded verification set**

Run:

```powershell
npx vitest run "lib/action-center-admin-governance.test.ts" "lib/suite-access.test.ts" "lib/action-center-ops-health.test.ts" "app/api/action-center/admin/route-activation-approvals/route.test.ts" "app/api/action-center/admin/support-access-events/route.test.ts" "app/api/action-center/admin/audit-exports/route.test.ts" "lib/action-center-governance.test.ts" "lib/action-center-route-contract.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected: PASS

- [ ] **Step 2: Run a diff hygiene check**

Run:

```powershell
git diff --check
```

Expected: no whitespace or merge-marker issues

- [ ] **Step 3: Update the verification sheet statuses**

Change each capability from speculative status to one of:

- `ready`
- `partial`
- `not_ready`

based on what actually shipped in this wave.

- [ ] **Step 4: Update the first-pass assessment**

Replace the now-resolved blockers around:

- runtime route-family drift
- route-shell semantic drift

and explicitly call out which enterprise-operating gaps are still unresolved after this wave.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-05-23-action-center-first-pass-readiness-assessment.md docs/superpowers/specs/2026-05-23-action-center-tenant-admin-gap-table.md docs/superpowers/specs/2026-05-23-action-center-enterprise-operating-verification-sheet.md
git commit -m "docs: close out action center enterprise operating gap wave"
```

---

## Self-Review

### Spec coverage

This plan covers the high-risk gaps called out in the assessment and gap table:

- tenant/admin role clarity
- route activation approvals
- support access logging
- audit export scaffolding
- retention/deletion operating policy
- admin health readback

It intentionally does not cover:

- standalone launch planning
- route expansion
- broader GTM
- generic workflow broadening

### Placeholder scan

This plan contains no `TODO`, `TBD`, or “implement later” placeholders.
All new artifacts and code paths are named explicitly.

### Type consistency

The new bounded control types stay aligned to the current Action Center truth:

- route families remain `exit | retention`
- support access kinds remain bounded
- approval status is explicit and finite
- no generic task/workflow/admin abstractions are introduced

## Execution Handoff

Plan complete and saved to `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\plans\2026-05-23-action-center-enterprise-operating-gaps-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
