# Action Center Review Reschedule Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bounded Action Center review reschedule flows so HR can change or cancel an eligible ExitScan review moment inside Action Center, with canonical schedule truth, audited revisions, updated `.ics` artifacts, and stale-reminder suppression.

**Architecture:** Keep Action Center canonical by treating review rescheduling as a route-scoped mutation of the current review date plus a persisted audit/revision log. The implementation adds one shared reschedule contract, one bounded reschedule API, one audit table for sequence tracking, small review-detail controls inside the existing reviewmomenten surface, and reuse of the existing invite + ICS stack so updated and cancelled artifacts mirror canonical Action Center state instead of inventing a second calendar system.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, Supabase SQL patch + schema snapshot, existing Action Center review-invite contract, existing follow-through mail ledger, existing reviewmomenten page shell.

---

## Scope Check

This child plan assumes the live baselines from merged PRs #136, #139, #140, and #142 are already present in the current worktree.

Verify before implementation starts:

- `git rev-parse --verify 31832e58b4209428ca64f0a628b0f7744e5212f2`
- `git rev-parse --verify d84536f0ceaf8bcc9109cc74104d1bfe9c8a3a2e`
- `git rev-parse --verify fdf8641fc07976b8c653f250291092fde6b756ad`
- `git merge-base --is-ancestor fdf8641fc07976b8c653f250291092fde6b756ad HEAD`

If one of these checks fails, sync the worktree from `main` before implementing this child plan.

In scope here:

- canonical review-date mutation for eligible Action Center ExitScan routes
- explicit route review `reschedule` and `cancel` operations
- persisted audit/revision log for who changed the schedule and when
- invite artifact revision semantics for updated and cancelled `.ics`
- stale reminder suppression after review-date changes
- one bounded set of review-detail controls inside the existing reviewmomenten surface

Explicitly out of scope here:

- Microsoft Graph or native Outlook mailbox updates
- manager reply flows or off-platform canonical writes
- route-family broadening beyond ExitScan
- broader HR rhythm console redesign
- follow-through mail trigger expansion beyond reschedule-awareness
- free-form multi-step workflow automation

## Product Rules To Preserve

- Action Center remains canonical for review date and review state.
- Calendar artifacts mirror canonical Action Center state; they never become truth themselves.
- No external calendar edit may silently rewrite Action Center state.
- Phase 1 remains ExitScan-only for schedule mutations.
- Only actors already allowed to schedule Action Center reviews may reschedule or cancel them.
- Reschedule and cancel are explicit bounded actions; this slice must not open generic schedule editing everywhere in Action Center.
- Reminder and escalation logic continue to come from the HR Rhythm Console; reschedule flows only make those signals safe after a date change.

## Canonical Behavior

Schedule mutation rules for this slice:

| Mutation | Canonical effect | Allowed when | Artifact effect |
| --- | --- | --- | --- |
| `reschedule` | replace the current canonical review date with a new future ISO date | route is active, eligible, and actor can schedule reviews | existing `.ics` preview/download shifts to `REQUEST` with incremented sequence |
| `cancel` | clear the current canonical review date and record a cancellation reason | route is active, eligible, and actor can schedule reviews | existing `.ics` preview/download becomes `CANCEL` with incremented sequence |

Additional bounded rules:

- Canonical route review date remains the `action_center_manager_responses.review_scheduled_for` field for routes that already have Action Center review truth.
- This slice does not backfill or rewrite legacy `pilot_learning_dossiers.review_moment`.
- Sequence must be monotonic per route review artifact:
  - first schedule export starts at `0`
  - each reschedule increments by `1`
  - cancel also increments by `1`
- Stale reminders must be suppressed when:
  - a planned trigger still points to the previous review date
  - the route is cancelled
  - the route is closed before dispatch

## File Structure

| File | Responsibility |
| --- | --- |
| `supabase/action_center_review_reschedule_flows.sql` | New SQL patch for persisted review schedule revision/audit rows |
| `supabase/schema.sql` | Schema snapshot update for the new audit table and policies |
| `frontend/lib/action-center-review-reschedule.ts` | Shared reschedule/cancel contract, input validation, revision helpers, and artifact mode helpers |
| `frontend/lib/action-center-review-reschedule.test.ts` | Unit tests for canonical reschedule/cancel semantics, sequence increments, and invalid transitions |
| `frontend/lib/action-center-review-reschedule-policy.test.ts` | Schema contract test for audit/revision persistence and bounded policies |
| `frontend/lib/action-center-review-reschedule-data.ts` | Server-side loader for current schedule truth, latest revision row, and mutation eligibility |
| `frontend/lib/action-center-review-reschedule-data.test.ts` | Loader tests for ExitScan-only gating, active-route checks, and latest revision lookup |
| `frontend/app/api/action-center-review-reschedules/route.ts` | Bounded POST route for `reschedule` and `cancel` mutations |
| `frontend/app/api/action-center-review-reschedules/route.test.ts` | Route tests for auth, permission boundaries, active-route gating, and audit persistence |
| `frontend/app/api/action-center-review-invites/invite-helpers.ts` | Reuse latest schedule revision/cancel state when building invite previews and downloads |
| `frontend/app/api/action-center-review-invites/route.test.ts` | Regression coverage for updated/cancelled artifact sequencing |
| `frontend/lib/action-center-review-invite-ics.ts` | Reuse explicit revision/method semantics for updated and cancelled review artifacts |
| `frontend/lib/action-center-review-invite-ics.test.ts` | Unit coverage for revision monotonicity and cancel output |
| `frontend/lib/action-center-follow-through-mail-data.ts` | Use latest canonical review date so reminder planning follows reschedules |
| `frontend/lib/action-center-follow-through-mail-planner.test.ts` | Regression coverage for stale reminder suppression after reschedule/cancel |
| `frontend/components/dashboard/review-moment-detail-panel.tsx` | Adds small bounded reschedule/cancel controls to the existing review-detail card |
| `frontend/components/dashboard/review-moment-detail-panel.test.ts` | Source/render contract for bounded reschedule controls |

Do **not** touch:

- `frontend/app/(dashboard)/action-center/page.tsx`
- `frontend/components/dashboard/action-center-preview.tsx`
- `frontend/app/api/action-center-follow-through-mails/route.ts` beyond consuming refreshed canonical schedule truth already exposed by shared helpers
- any Graph-specific integration code
- unrelated manager action or closeout surfaces

---

### Task 1: Add the Review Reschedule Contract and Audit Schema

**Files:**
- Create: `supabase/action_center_review_reschedule_flows.sql`
- Modify: `supabase/schema.sql`
- Create: `frontend/lib/action-center-review-reschedule.ts`
- Create: `frontend/lib/action-center-review-reschedule.test.ts`
- Create: `frontend/lib/action-center-review-reschedule-policy.test.ts`

- [ ] **Step 1: Write the failing contract tests**

```ts
// frontend/lib/action-center-review-reschedule.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildNextActionCenterReviewScheduleRevision,
  getActionCenterReviewScheduleArtifactMode,
  validateActionCenterReviewRescheduleInput,
} from './action-center-review-reschedule'

describe('action center review reschedule contract', () => {
  it('accepts a bounded reschedule payload with a future ISO date', () => {
    expect(
      validateActionCenterReviewRescheduleInput({
        operation: 'reschedule',
        routeId: 'cmp-exit-1::org-1::department::operations',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'cmp-exit-1',
        orgId: 'org-1',
        scanType: 'exit',
        reviewDate: '2026-06-03',
        reason: 'manager-beschikbaar',
      }),
    ).toMatchObject({
      operation: 'reschedule',
      reviewDate: '2026-06-03',
    })
  })

  it('rejects cancel without an explicit bounded reason', () => {
    expect(() =>
      validateActionCenterReviewRescheduleInput({
        operation: 'cancel',
        routeId: 'cmp-exit-1::org-1::department::operations',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'cmp-exit-1',
        orgId: 'org-1',
        scanType: 'exit',
        reviewDate: null,
        reason: null,
      }),
    ).toThrow('Ongeldige review reschedule input.')
  })

  it('increments the artifact revision monotonically from the latest audit row', () => {
    expect(buildNextActionCenterReviewScheduleRevision(4)).toBe(5)
  })

  it('maps cancel operations to CANCEL artifacts and reschedules to REQUEST artifacts', () => {
    expect(getActionCenterReviewScheduleArtifactMode('cancel')).toBe('CANCEL')
    expect(getActionCenterReviewScheduleArtifactMode('reschedule')).toBe('REQUEST')
  })
})
```

```ts
// frontend/lib/action-center-review-reschedule-policy.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schemaSql = readFileSync(new URL('../../supabase/schema.sql', import.meta.url), 'utf8')

describe('action center review reschedule schema policy', () => {
  it('defines a dedicated review schedule revision table with bounded hr/admin policies', () => {
    expect(schemaSql).toMatch(/create table if not exists public\.action_center_review_schedule_revisions/i)
    expect(schemaSql).toMatch(/operation\s+text\s+not null/i)
    expect(schemaSql).toMatch(/revision\s+integer\s+not null/i)
    expect(schemaSql).toMatch(/review_date\s+date/i)
    expect(schemaSql).toMatch(/changed_by_role\s+text\s+not null/i)
    expect(schemaSql).toMatch(/create policy "service_role_can_select_action_center_review_schedule_revisions"/i)
    expect(schemaSql).toMatch(/create policy "service_role_can_insert_action_center_review_schedule_revisions"/i)
  })
})
```

- [ ] **Step 2: Run the contract tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-review-reschedule.test.ts" "lib/action-center-review-reschedule-policy.test.ts"
```

Expected: FAIL because the helper and schema contract do not exist yet.

- [ ] **Step 3: Add the SQL patch and shared reschedule helper**

```sql
-- supabase/action_center_review_reschedule_flows.sql
create table if not exists public.action_center_review_schedule_revisions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_id text not null,
  route_scope_value text not null,
  route_source_id uuid not null references public.campaigns(id) on delete cascade,
  scan_type text not null check (scan_type in ('exit')),
  operation text not null check (operation in ('reschedule', 'cancel')),
  revision integer not null check (revision >= 0),
  review_date date,
  previous_review_date date,
  reason text not null,
  changed_by uuid not null,
  changed_by_role text not null check (changed_by_role in ('verisight_admin', 'hr_owner', 'hr_member')),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_action_center_review_schedule_revisions_route_revision
  on public.action_center_review_schedule_revisions(route_id, revision);

alter table public.action_center_review_schedule_revisions enable row level security;

drop policy if exists "service_role_can_select_action_center_review_schedule_revisions" on public.action_center_review_schedule_revisions;
create policy "service_role_can_select_action_center_review_schedule_revisions"
  on public.action_center_review_schedule_revisions for select
  to service_role
  using (true);

drop policy if exists "service_role_can_insert_action_center_review_schedule_revisions" on public.action_center_review_schedule_revisions;
create policy "service_role_can_insert_action_center_review_schedule_revisions"
  on public.action_center_review_schedule_revisions for insert
  to service_role
  with check (true);

notify pgrst, 'reload schema';
```

```ts
// frontend/lib/action-center-review-reschedule.ts
export type ActionCenterReviewRescheduleOperation = 'reschedule' | 'cancel'

export interface ActionCenterReviewRescheduleInput {
  operation: ActionCenterReviewRescheduleOperation
  routeId: string
  routeScopeValue: string
  routeSourceId: string
  orgId: string
  scanType: string
  reviewDate: string | null
  reason: string | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isIsoDate(value: string | null | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

export function validateActionCenterReviewRescheduleInput(input: ActionCenterReviewRescheduleInput | null) {
  const operation = input?.operation
  const routeId = normalizeText(input?.routeId)
  const routeScopeValue = normalizeText(input?.routeScopeValue)
  const routeSourceId = normalizeText(input?.routeSourceId)
  const orgId = normalizeText(input?.orgId)
  const scanType = normalizeText(input?.scanType)
  const reviewDate = normalizeText(input?.reviewDate)
  const reason = normalizeText(input?.reason)

  if (
    (operation !== 'reschedule' && operation !== 'cancel') ||
    !routeId ||
    !routeScopeValue ||
    !routeSourceId ||
    !orgId ||
    scanType !== 'exit'
  ) {
    throw new Error('Ongeldige review reschedule input.')
  }

  if (operation === 'reschedule' && !isIsoDate(reviewDate)) {
    throw new Error('Ongeldige review reschedule input.')
  }

  if (!reason) {
    throw new Error('Ongeldige review reschedule input.')
  }

  return {
    operation,
    routeId,
    routeScopeValue,
    routeSourceId,
    orgId,
    scanType,
    reviewDate: operation === 'cancel' ? null : reviewDate,
    reason,
  } as const
}

export function buildNextActionCenterReviewScheduleRevision(latestRevision: number | null) {
  return (latestRevision ?? -1) + 1
}

export function getActionCenterReviewScheduleArtifactMode(operation: ActionCenterReviewRescheduleOperation) {
  return operation === 'cancel' ? 'CANCEL' : 'REQUEST'
}
```

- [ ] **Step 4: Run the contract tests and confirm they pass**

Run:

```bash
npx vitest run "lib/action-center-review-reschedule.test.ts" "lib/action-center-review-reschedule-policy.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit the contract slice**

```bash
git add supabase/action_center_review_reschedule_flows.sql supabase/schema.sql frontend/lib/action-center-review-reschedule.ts frontend/lib/action-center-review-reschedule.test.ts frontend/lib/action-center-review-reschedule-policy.test.ts
git commit -m "Add Action Center review reschedule contract"
```

---

### Task 2: Add the Canonical Schedule Loader and Reschedule Route

**Files:**
- Create: `frontend/lib/action-center-review-reschedule-data.ts`
- Create: `frontend/lib/action-center-review-reschedule-data.test.ts`
- Create: `frontend/app/api/action-center-review-reschedules/route.ts`
- Create: `frontend/app/api/action-center-review-reschedules/route.test.ts`

- [ ] **Step 1: Write the failing loader and route tests**

```ts
// frontend/lib/action-center-review-reschedule-data.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAdminFrom } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { getActionCenterReviewRescheduleState } from './action-center-review-reschedule-data'

describe('action center review reschedule data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the current canonical review date and latest revision for an eligible ExitScan route', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'cmp-exit-1', organization_id: 'org-1', scan_type: 'exit' },
            error: null,
          }),
        }
      }

      if (table === 'action_center_manager_responses') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              campaign_id: 'cmp-exit-1',
              route_scope_type: 'department',
              route_scope_value: 'org-1::department::operations',
              review_scheduled_for: '2026-05-28',
            },
            error: null,
          }),
        }
      }

      if (table === 'action_center_review_schedule_revisions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ revision: 2, operation: 'reschedule', review_date: '2026-05-28' }],
            error: null,
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const result = await getActionCenterReviewRescheduleState({
      routeId: 'cmp-exit-1::org-1::department::operations',
      routeScopeValue: 'org-1::department::operations',
      routeSourceId: 'cmp-exit-1',
      orgId: 'org-1',
    })

    expect(result).toMatchObject({
      reviewDate: '2026-05-28',
      latestRevision: 2,
      scanType: 'exit',
    })
  })

  it('rejects non-ExitScan routes in this slice', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'cmp-ret-1', organization_id: 'org-1', scan_type: 'retention' },
            error: null,
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    await expect(
      getActionCenterReviewRescheduleState({
        routeId: 'cmp-ret-1::org-1::department::operations',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'cmp-ret-1',
        orgId: 'org-1',
      }),
    ).rejects.toThrow('Review reschedule blijft in deze slice beperkt tot ExitScan.')
  })
})
```

```ts
// frontend/app/api/action-center-review-reschedules/route.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetUser,
  mockLoadSuiteAccessContext,
  mockAdminFrom,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockLoadSuiteAccessContext: vi.fn(),
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

vi.mock('@/lib/suite-access-server', () => ({
  loadSuiteAccessContext: mockLoadSuiteAccessContext,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { POST } from './route'

function makeRequest(body: Record<string, unknown>) {
  return new Request('https://app.verisight.nl/api/action-center-review-reschedules', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createMaybeSingleQuery(result: { data: Record<string, unknown> | null; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createUpdateQuery(result: { data: Record<string, unknown> | null; error: unknown }) {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createInsertQuery(result: { data: Record<string, unknown> | null; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

function buildBody(overrides: Record<string, unknown> = {}) {
  return {
    operation: 'reschedule',
    routeId: 'cmp-exit-1::org-1::department::operations',
    routeScopeValue: 'org-1::department::operations',
    routeSourceId: 'cmp-exit-1',
    orgId: 'org-1',
    scanType: 'exit',
    reviewDate: '2026-06-03',
    reason: 'manager-beschikbaar',
    ...overrides,
  }
}

describe('action center review reschedules route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'hr@northwind.example',
        },
      },
    })

    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canScheduleActionCenterReview: true,
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: 'org-1', role: 'member' }],
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'user-1',
          display_name: 'HR Member',
          login_email: 'hr@northwind.example',
          access_role: 'hr_member',
          scope_type: 'org',
          scope_value: 'org-1::org::org-1',
          can_view: true,
          can_update: true,
          can_assign: false,
          can_schedule_review: true,
        },
      ],
    })
  })

  it('rejects actors without review scheduling rights', async () => {
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canUpdateActionCenter: false,
        canScheduleActionCenterReview: false,
        isVerisightAdmin: false,
      },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    const response = await POST(
      makeRequest({
        operation: 'reschedule',
        routeId: 'cmp-exit-1::org-1::department::operations',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'cmp-exit-1',
        orgId: 'org-1',
        scanType: 'exit',
        reviewDate: '2026-06-03',
        reason: 'manager-beschikbaar',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('persists a reschedule revision and updates the canonical manager-response review date', async () => {
    const updateQuery = createUpdateQuery({
      data: {
        route_id: 'cmp-exit-1::org-1::department::operations',
        route_scope_value: 'org-1::department::operations',
        review_scheduled_for: '2026-06-03',
      },
      error: null,
    })

    const insertQuery = createInsertQuery({
      data: {
        route_id: 'cmp-exit-1::org-1::department::operations',
        revision: 3,
        operation: 'reschedule',
        previous_review_date: '2026-05-28',
        review_date: '2026-06-03',
        reason: 'manager-beschikbaar',
        changed_by: 'user-1',
        changed_by_role: 'hr_member',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: { id: 'cmp-exit-1', organization_id: 'org-1', scan_type: 'exit' },
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        return {
          ...createMaybeSingleQuery({
            data: {
              route_id: 'cmp-exit-1::org-1::department::operations',
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
            },
            error: null,
          }),
          insert: insertQuery.insert,
          select: insertQuery.select,
          single: insertQuery.single,
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildBody()))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      revision: 3,
      operation: 'reschedule',
      reviewDate: '2026-06-03',
    })
    expect(updateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2026-06-03',
    })
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        revision: 3,
        operation: 'reschedule',
        previous_review_date: '2026-05-28',
        review_date: '2026-06-03',
      }),
    )
  })

  it('persists cancel as a cleared canonical review date plus a CANCEL revision row', async () => {
    const updateQuery = createUpdateQuery({
      data: {
        route_id: 'cmp-exit-1::org-1::department::operations',
        route_scope_value: 'org-1::department::operations',
        review_scheduled_for: null,
      },
      error: null,
    })

    const insertQuery = createInsertQuery({
      data: {
        route_id: 'cmp-exit-1::org-1::department::operations',
        revision: 4,
        operation: 'cancel',
        previous_review_date: '2026-06-03',
        review_date: null,
        reason: 'manager-niet-meer-betrokken',
        changed_by: 'user-1',
        changed_by_role: 'hr_member',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: { id: 'cmp-exit-1', organization_id: 'org-1', scan_type: 'exit' },
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        return {
          ...createMaybeSingleQuery({
            data: {
              route_id: 'cmp-exit-1::org-1::department::operations',
              revision: 3,
              operation: 'reschedule',
              review_date: '2026-06-03',
            },
            error: null,
          }),
          insert: insertQuery.insert,
          select: insertQuery.select,
          single: insertQuery.single,
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildBody({
          operation: 'cancel',
          reviewDate: null,
          reason: 'manager-niet-meer-betrokken',
        }),
      ),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      revision: 4,
      operation: 'cancel',
      reviewDate: null,
    })
    expect(updateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: null,
    })
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        revision: 4,
        operation: 'cancel',
        previous_review_date: '2026-06-03',
        review_date: null,
      }),
    )
  })
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-review-reschedule-data.test.ts" "app/api/action-center-review-reschedules/route.test.ts"
```

Expected: FAIL because the loader and route do not exist yet.

- [ ] **Step 3: Add the reschedule state loader**

Implementation requirements in `frontend/lib/action-center-review-reschedule-data.ts`:

- Load:
  - campaign/org/scan truth from `campaigns`
  - current canonical review date from `action_center_manager_responses.review_scheduled_for`
  - latest schedule revision row from `action_center_review_schedule_revisions`
- Reuse the existing route-scope identity semantics from `action-center-manager-responses.ts`.
- Reject:
  - route/org mismatches
  - non-ExitScan routes
  - routes without canonical Action Center review truth
- Return one bounded state object with:
  - current review date
  - latest revision number
  - latest operation
  - scan type

- [ ] **Step 4: Add the bounded reschedule route**

Implementation requirements in `frontend/app/api/action-center-review-reschedules/route.ts`:

- Reuse the same HR/admin scheduling boundary already enforced by `action-center-review-rhythm/route.ts`.
- Accept only:
  - `operation: 'reschedule'` with a future ISO date
  - `operation: 'cancel'` with no date and an explicit reason
- Load current canonical state through `getActionCenterReviewRescheduleState`.
- Compute `nextRevision` from the latest revision row.
- On `reschedule`:
  - upsert the canonical `action_center_manager_responses.review_scheduled_for`
  - insert a revision row with `operation = 'reschedule'`
- On `cancel`:
  - update canonical `review_scheduled_for` to `null`
  - insert a revision row with `operation = 'cancel'`
- Persist:
  - `previous_review_date`
  - `review_date`
  - `reason`
  - `changed_by`
  - `changed_by_role`
- Return compact mutation output including:
  - `revision`
  - `operation`
  - `reviewDate`

- [ ] **Step 5: Run the tests and confirm they pass**

Run:

```bash
npx vitest run "lib/action-center-review-reschedule-data.test.ts" "app/api/action-center-review-reschedules/route.test.ts"
```

Expected: PASS.

- [ ] **Step 6: Commit the reschedule route slice**

```bash
git add frontend/lib/action-center-review-reschedule-data.ts frontend/lib/action-center-review-reschedule-data.test.ts frontend/app/api/action-center-review-reschedules/route.ts frontend/app/api/action-center-review-reschedules/route.test.ts
git commit -m "Add Action Center review reschedule route"
```

---

### Task 3: Thread Revision Semantics into Invite Artifacts

**Files:**
- Modify: `frontend/app/api/action-center-review-invites/invite-helpers.ts`
- Modify: `frontend/lib/action-center-review-invite-ics.ts`
- Modify: `frontend/lib/action-center-review-invite-ics.test.ts`
- Modify: `frontend/app/api/action-center-review-invites/route.test.ts`

- [ ] **Step 1: Write the failing invite revision tests**

```ts
// frontend/lib/action-center-review-invite-ics.test.ts
import { describe, expect, it } from 'vitest'
import { renderActionCenterReviewInviteIcs } from './action-center-review-invite-ics'

describe('action center review invite ics revision semantics', () => {
  const draft = {
    reviewItemId: 'cmp-exit-1::org-1::department::operations',
    routeId: 'cmp-exit-1::org-1::department::operations',
    campaignId: 'cmp-exit-1',
    recipientEmail: 'manager@example.com',
    recipientName: 'Manager',
    subject: 'Reviewmoment ExitScan Q2 / Operations',
    actionCenterHref: 'https://app.verisight.nl/action-center?focus=cmp-exit-1',
    emailText: 'Open dit reviewmoment in Action Center.',
    emailHtml: '<p>Open dit reviewmoment in Action Center.</p>',
    reviewDate: '2026-06-03',
    deliveryModel: { channel: 'email-ics', organizerMode: 'organizer', nativeMicrosoftRequired: false },
    writePolicy: { calendarRsvp: 'hint-only', canonicalReviewState: 'action-center-only' },
  } as const

  it('renders an incremented SEQUENCE for reschedules', () => {
    const ics = renderActionCenterReviewInviteIcs({
      draft,
      method: 'REQUEST',
      revision: 3,
      organizerEmail: 'hr@verisight.nl',
    })

    expect(ics).toContain('SEQUENCE:3')
  })

  it('renders STATUS:CANCELLED for cancelled review artifacts', () => {
    const ics = renderActionCenterReviewInviteIcs({
      draft,
      method: 'CANCEL',
      revision: 4,
      organizerEmail: 'hr@verisight.nl',
    })

    expect(ics).toContain('METHOD:CANCEL')
    expect(ics).toContain('STATUS:CANCELLED')
    expect(ics).toContain('SEQUENCE:4')
  })
})
```

```ts
// frontend/app/api/action-center-review-invites/route.test.ts
it('returns CANCEL artifacts with the latest persisted revision after a route review cancellation', async () => {
  mockAdminFrom.mockImplementation((table: string) => {
    if (table === 'campaigns') {
      return createMaybeSingleQuery({
        data: {
          id: 'cmp-exit-1',
          name: 'ExitScan Q2',
          scan_type: 'exit',
          organization_id: 'org-1',
        },
        error: null,
      })
    }

    if (table === 'organizations') {
      return createMaybeSingleQuery({
        data: {
          id: 'org-1',
          name: 'Northwind',
          contact_email: 'northwind-hr@example.com',
        },
        error: null,
      })
    }

    if (table === 'action_center_workspace_members') {
      return createMaybeSingleQuery({
        data: buildManagerMembershipRow(),
        error: null,
      })
    }

    if (table === 'action_center_review_schedule_revisions') {
      return createMaybeSingleQuery({
        data: {
          route_id: mockItem.id,
          revision: 5,
          operation: 'cancel',
          review_date: null,
        },
        error: null,
      })
    }

    throw new Error(`Unhandled table ${table}`)
  })

  const previewResponse = await GET(
    new Request(
      `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}`,
    ),
  )

  expect(previewResponse.status).toBe(200)
  await expect(previewResponse.json()).resolves.toEqual(
    expect.objectContaining({
      reviewItemId: mockItem.id,
      revision: 5,
      method: 'CANCEL',
    }),
  )

  const icsResponse = await GET(
    new Request(
      `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&format=ics`,
    ),
  )

  expect(icsResponse.status).toBe(200)
  const body = await icsResponse.text()
  expect(body).toContain('METHOD:CANCEL')
  expect(body).toContain('STATUS:CANCELLED')
  expect(body).toContain('SEQUENCE:5')
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-review-invite-ics.test.ts" "app/api/action-center-review-invites/route.test.ts"
```

Expected: FAIL because invite preview/download still ignores persisted revision state.

- [ ] **Step 3: Load latest revision state inside invite helpers**

Implementation requirements in `frontend/app/api/action-center-review-invites/invite-helpers.ts`:

- Query the latest row in `action_center_review_schedule_revisions` for the route.
- Return:
  - latest revision number
  - latest operation
  - whether the canonical review is currently cancelled
- Do not infer cancellation from the request alone; read persisted canonical state.

- [ ] **Step 4: Reuse revision/method semantics in the invite route**

Implementation requirements:

- Default artifact revision to the persisted latest revision when no explicit override is supplied.
- For cancelled schedules:
  - preview JSON should expose that the artifact mode is `CANCEL`
  - `.ics` output should use `METHOD:CANCEL` and `STATUS:CANCELLED`
- Keep the current bounded invite eligibility checks intact for active routes.

- [ ] **Step 5: Run the tests and confirm they pass**

Run:

```bash
npx vitest run "lib/action-center-review-invite-ics.test.ts" "app/api/action-center-review-invites/route.test.ts"
```

Expected: PASS.

- [ ] **Step 6: Commit the invite revision slice**

```bash
git add frontend/app/api/action-center-review-invites/invite-helpers.ts frontend/lib/action-center-review-invite-ics.ts frontend/lib/action-center-review-invite-ics.test.ts frontend/app/api/action-center-review-invites/route.test.ts
git commit -m "Add Action Center invite revision semantics"
```

---

### Task 4: Make Follow-Through Reminder Planning Reschedule-Safe

**Files:**
- Modify: `frontend/lib/action-center-follow-through-mail-data.ts`
- Modify: `frontend/lib/action-center-follow-through-mail-planner.test.ts`

- [ ] **Step 1: Write the failing stale-reminder regression test**

```ts
// frontend/lib/action-center-follow-through-mail-planner.test.ts
it('suppresses a planned review reminder when the canonical review date changed after scheduling', () => {
  const result = planActionCenterFollowThroughMailJobs({
    now: new Date('2026-05-18T08:00:00.000Z'),
    snapshots: [
      {
        routeId: 'camp-1::org::sales',
        routeScopeValue: 'org-1::department::sales',
        orgId: 'org-1',
        campaignId: 'camp-1',
        campaignName: 'ExitScan Q2',
        scopeLabel: 'Sales',
        scanType: 'exit',
        routeStatus: 'reviewbaar',
        reviewScheduledFor: '2026-05-25',
        reviewCompletedAt: null,
        reviewOutcome: 'geen-uitkomst',
        ownerAssignedAt: '2026-05-10T09:00:00.000Z',
        hasFollowUpTarget: false,
        remindersEnabled: true,
        cadenceDays: 14,
        reminderLeadDays: 7,
        escalationLeadDays: 7,
        managerRecipient: { email: 'manager@example.com', name: 'Manager' },
        hrOversightRecipients: [],
      },
    ],
    existingDedupeKeys: new Set([
      'camp-1::org::sales::review_upcoming::manager@example.com::2026-05-20',
    ]),
  })

  expect(result.jobs.find((job) => job.sourceMarker === '2026-05-20')).toBeUndefined()
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail-planner.test.ts"
```

Expected: FAIL because the current planner suite does not explicitly guard the prior review date marker after reschedule.

- [ ] **Step 3: Thread latest canonical review date through the follow-through loader**

Implementation requirements in `frontend/lib/action-center-follow-through-mail-data.ts`:

- When building dispatch snapshots, always use the latest canonical `review_scheduled_for` after any reschedule/cancel.
- Do not read schedule from stale invite artifacts or stale prior ledger rows.
- Keep ExitScan-only gating intact.

- [ ] **Step 4: Run the planner regression test and confirm it passes**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail-planner.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit the stale-reminder safety slice**

```bash
git add frontend/lib/action-center-follow-through-mail-data.ts frontend/lib/action-center-follow-through-mail-planner.test.ts
git commit -m "Make Action Center reminders reschedule-safe"
```

---

### Task 5: Add Bounded Reviewmomenten Reschedule Controls

**Files:**
- Modify: `frontend/components/dashboard/review-moment-detail-panel.tsx`
- Modify: `frontend/components/dashboard/review-moment-detail-panel.test.ts`

- [ ] **Step 1: Write the failing UI contract tests**

```ts
// frontend/components/dashboard/review-moment-detail-panel.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./review-moment-detail-panel.tsx', import.meta.url), 'utf8')

describe('review moment detail panel reschedule controls', () => {
  it('keeps reschedule controls bounded to the existing review detail surface', () => {
    expect(source).toContain('Verplaats review')
    expect(source).toContain('Annuleer review')
    expect(source).not.toContain('workflow builder')
    expect(source).not.toContain('Outlook sync')
  })
})
```

- [ ] **Step 2: Run the UI contract test and verify it fails**

Run:

```bash
npx vitest run "components/dashboard/review-moment-detail-panel.test.ts"
```

Expected: FAIL because the panel does not yet expose reschedule controls.

- [ ] **Step 3: Add the bounded review controls**

Implementation requirements in `frontend/components/dashboard/review-moment-detail-panel.tsx`:

- Keep controls inside the existing detail card.
- Show only when:
  - actor can schedule review
  - route is active
  - route is ExitScan-eligible
- Add:
  - a compact date input + “Verplaats review”
  - a compact “Annuleer review” action
- Do not add:
  - a new page
  - a generic scheduler UI
  - Graph or mailbox wording

- [ ] **Step 4: Run the UI contract test and confirm it passes**

Run:

```bash
npx vitest run "components/dashboard/review-moment-detail-panel.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit the UI slice**

```bash
git add frontend/components/dashboard/review-moment-detail-panel.tsx frontend/components/dashboard/review-moment-detail-panel.test.ts
git commit -m "Add Action Center review reschedule controls"
```

---

### Task 6: Verify the Full Reschedule Slice

**Files:**
- Verify only; no new files required unless a failing test forces a targeted fix inside the files above

- [ ] **Step 1: Run the bounded reschedule suite**

Run:

```bash
npx vitest run "lib/action-center-review-reschedule.test.ts" "lib/action-center-review-reschedule-policy.test.ts" "lib/action-center-review-reschedule-data.test.ts" "app/api/action-center-review-reschedules/route.test.ts" "lib/action-center-review-invite-ics.test.ts" "app/api/action-center-review-invites/route.test.ts" "lib/action-center-follow-through-mail-planner.test.ts" "components/dashboard/review-moment-detail-panel.test.ts"
```

Expected: PASS.

- [ ] **Step 2: Run the adjacent Action Center regression suite**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm.test.ts" "lib/action-center-review-rhythm-data.test.ts" "app/api/action-center-review-rhythm/route.test.ts" "lib/action-center-review-invite.test.ts" "app/api/action-center-follow-through-mails/route.test.ts" "components/dashboard/review-moment-page-client.test.ts" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts"
```

Expected: PASS.

- [ ] **Step 3: Run a production build**

Run:

```bash
npm run build
```

Expected: compile, lint, and typecheck pass for this slice; if build still stops on the known auth-page Supabase env blocker, document it explicitly and confirm the reschedule slice introduced no new build error before that point.

- [ ] **Step 4: Manually verify the bounded product rules**

Confirm:

- only ExitScan routes expose reschedule/cancel
- cancel clears canonical review date and yields `CANCEL` artifacts
- reschedule increments invite revision monotonically
- stale reminders referencing the old date no longer emit
- no off-platform action mutates Action Center truth

- [ ] **Step 5: Commit the verification pass**

```bash
git add .
git commit -m "Verify Action Center review reschedule flows"
```

---

## Notes for the Implementer

- Prefer a dedicated reschedule route over broadening the existing invite route into a mutation surface.
- Keep revision semantics persisted in the audit table, not inferred from mail ledger rows.
- If you discover routes where canonical review truth still lives only in legacy dossier fields, stop and make that limitation explicit instead of silently mutating mixed truth stores.
- If a UI step starts pulling in modal choreography or complex client state, reduce it back to the smallest bounded interaction that still proves the slice.
