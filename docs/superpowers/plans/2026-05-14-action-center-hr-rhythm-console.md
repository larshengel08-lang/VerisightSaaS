# Action Center HR Rhythm Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded HR Rhythm Console to the existing Action Center reviewmomenten surface so HR can configure review cadence, reminder timing, and escalation timing for visible ExitScan follow-through routes without introducing generic workflow automation.

**Architecture:** Keep the canonical rhythm config in Action Center as route-scoped persisted data, load it server-side next to the existing reviewmomenten page data, and edit it through one bounded route handler. Reuse the live reviewmomenten page instead of creating a new Action Center layer, and keep the mail engine, reschedule flows, and Graph integration out of scope.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, Supabase SQL patch + schema snapshot, existing Action Center page-data loader, existing reviewmomenten page shell, existing suite access permissions.

---

## Scope Check

This child plan assumes the live baseline from merged PR #136 is already present in the current worktree.

Verify before implementation starts:

- `git rev-parse --verify 31832e58b4209428ca64f0a628b0f7744e5212f2`

If that commit is missing, sync the worktree from `main` before implementing this child plan.

In scope here:

- persisted route-scoped review rhythm config for Action Center
- HR-facing review cadence, reminder timing, and escalation timing controls
- a bounded overview block for upcoming, overdue, stale, and escalation-sensitive review routes
- permission-safe save/update behavior inside the existing reviewmomenten surface

Explicitly out of scope here:

- automatic email sending
- review reschedule / cancel / sequence changes
- Microsoft Graph integration
- route-family expansion beyond ExitScan
- generic task automation or free-form workflow rules
- owner reassignment execution itself

## Product Rules To Preserve

- Action Center remains canonical truth for review rhythm configuration.
- This console only governs rhythm metadata; it does not send reminders itself.
- HR can manage rhythm, but managers do not gain a broad new planning workbench.
- The UI stays inside the existing reviewmomenten route and must not create another Action Center layer.
- ExitScan remains the only route family allowed to persist rhythm config in this slice.
- Owner reassignment remains bounded elsewhere; this console may explain the boundary, but must not broaden assignment behavior.

## File Structure

| File | Responsibility |
| --- | --- |
| `supabase/action_center_review_rhythm_console.sql` | New bounded SQL patch for persisted Action Center review rhythm config table, constraints, and policies |
| `supabase/schema.sql` | Schema snapshot update for the new Action Center review rhythm config table and policies |
| `frontend/lib/action-center-review-rhythm.ts` | Rhythm config types, defaults, normalization, validation, and overview derivation helpers |
| `frontend/lib/action-center-review-rhythm.test.ts` | Unit tests for defaults, validation, ExitScan-only guarding, and overview classification |
| `frontend/lib/action-center-review-rhythm-policy.test.ts` | Schema contract test for new table and policy shape |
| `frontend/lib/action-center-review-rhythm-data.ts` | Server-side loader and payload shaping for visible route configs and HR console summary |
| `frontend/lib/action-center-review-rhythm-data.test.ts` | Loader tests for visibility, ExitScan-only persistence, and permission-aware summary behavior |
| `frontend/app/api/action-center-review-rhythm/route.ts` | Bounded GET/POST route for loading and saving rhythm config |
| `frontend/app/api/action-center-review-rhythm/route.test.ts` | Route tests for auth, permission boundaries, validation, and save behavior |
| `frontend/components/dashboard/review-rhythm-console.tsx` | HR-facing client component for config form + bounded overview cards |
| `frontend/components/dashboard/review-rhythm-console.test.tsx` | Render and source-contract tests for the HR rhythm console |
| `frontend/components/dashboard/review-moment-page-client.tsx` | Threads the new HR rhythm console into the existing reviewmomenten page without creating a new layer |
| `frontend/components/dashboard/review-moment-page-client.test.ts` | Updated source-contract test for bounded rhythm-console placement |
| `frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx` | Server shell wiring for rhythm config data and management permission prop |
| `frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts` | Source-contract test for server-side wiring into the existing reviewmomenten route |

Do **not** touch:

- `frontend/app/api/action-center-review-invites/route.ts`
- `frontend/lib/action-center-review-invite.ts`
- `frontend/lib/action-center-review-invite-ics.ts`
- any Graph-specific connector or external mailbox integration
- unrelated Action Center overview or manager pages

---

### Task 1: Add the Persisted Review Rhythm Contract

**Files:**
- Create: `supabase/action_center_review_rhythm_console.sql`
- Modify: `supabase/schema.sql`
- Create: `frontend/lib/action-center-review-rhythm.ts`
- Create: `frontend/lib/action-center-review-rhythm.test.ts`
- Create: `frontend/lib/action-center-review-rhythm-policy.test.ts`

- [ ] **Step 1: Write the failing contract tests**

```ts
// frontend/lib/action-center-review-rhythm.test.ts
import { describe, expect, it } from 'vitest'
import {
  buildDefaultActionCenterReviewRhythmConfig,
  classifyActionCenterReviewRhythmStatus,
  normalizeActionCenterReviewRhythmConfig,
  validateActionCenterReviewRhythmInput,
} from './action-center-review-rhythm'

describe('action center review rhythm contract', () => {
  it('provides the bounded default config for ExitScan routes', () => {
    expect(buildDefaultActionCenterReviewRhythmConfig()).toEqual({
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      remindersEnabled: true,
    })
  })

  it('normalizes persisted payloads and falls back to defaults when values are missing', () => {
    expect(
      normalizeActionCenterReviewRhythmConfig({
        cadence_days: null,
        reminder_lead_days: 5,
        escalation_lead_days: null,
        reminders_enabled: null,
      }),
    ).toEqual({
      cadenceDays: 14,
      reminderLeadDays: 5,
      escalationLeadDays: 7,
      remindersEnabled: true,
    })
  })

  it('rejects invalid cadence and escalation combinations', () => {
    expect(
      validateActionCenterReviewRhythmInput({
        cadenceDays: 7,
        reminderLeadDays: 7,
        escalationLeadDays: 5,
        remindersEnabled: true,
      }),
    ).toEqual({
      ok: false,
      reason: 'invalid-reminder-window',
    })
  })

  it('classifies stale routes when the review date is far behind the cadence window', () => {
    const status = classifyActionCenterReviewRhythmStatus({
      reviewDate: '2026-05-01',
      now: new Date('2026-05-28T12:00:00.000Z'),
      config: {
        cadenceDays: 14,
        reminderLeadDays: 3,
        escalationLeadDays: 7,
        remindersEnabled: true,
      },
      itemStatus: 'reviewbaar',
    })

    expect(status).toBe('stale')
  })
})
```

```ts
// frontend/lib/action-center-review-rhythm-policy.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schemaSql = readFileSync(new URL('../../supabase/schema.sql', import.meta.url), 'utf8')

describe('action center review rhythm schema policy', () => {
  it('defines a dedicated review rhythm config table and bounded HR/admin policies', () => {
    expect(schemaSql).toMatch(/create table if not exists public\.action_center_review_rhythm_configs/i)
    expect(schemaSql).toMatch(/cadence_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/reminder_lead_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/escalation_lead_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/create policy "hr_and_admins_can_select_action_center_review_rhythm_configs"/i)
    expect(schemaSql).toMatch(/create policy "hr_and_admins_can_upsert_action_center_review_rhythm_configs"/i)
  })
})
```

- [ ] **Step 2: Run the contract tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm.test.ts" "lib/action-center-review-rhythm-policy.test.ts"
```

Expected: FAIL because the helper and schema contract do not exist yet.

- [ ] **Step 3: Add the SQL patch and shared rhythm helper**

```sql
-- supabase/action_center_review_rhythm_console.sql
create table if not exists public.action_center_review_rhythm_configs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  route_id text not null,
  route_scope_value text not null,
  route_source_type text not null default 'campaign' check (route_source_type = 'campaign'),
  route_source_id uuid not null references public.campaigns(id) on delete cascade,
  scan_type text not null check (scan_type = 'exit'),
  cadence_days smallint not null check (cadence_days in (7, 14, 30)),
  reminder_lead_days smallint not null check (reminder_lead_days in (1, 3, 5)),
  escalation_lead_days smallint not null check (escalation_lead_days in (3, 7, 14)),
  reminders_enabled boolean not null default true,
  updated_by_role text not null check (updated_by_role in ('verisight_admin', 'hr_owner', 'hr_member')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(route_id)
);

alter table public.action_center_review_rhythm_configs enable row level security;

drop policy if exists "hr_and_admins_can_select_action_center_review_rhythm_configs" on public.action_center_review_rhythm_configs;
create policy "hr_and_admins_can_select_action_center_review_rhythm_configs"
  on public.action_center_review_rhythm_configs for select
  using (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "hr_and_admins_can_upsert_action_center_review_rhythm_configs" on public.action_center_review_rhythm_configs;
create policy "hr_and_admins_can_upsert_action_center_review_rhythm_configs"
  on public.action_center_review_rhythm_configs for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');
```

```ts
// frontend/lib/action-center-review-rhythm.ts
import type { ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'

export interface ActionCenterReviewRhythmConfig {
  cadenceDays: 7 | 14 | 30
  reminderLeadDays: 1 | 3 | 5
  escalationLeadDays: 3 | 7 | 14
  remindersEnabled: boolean
}

export type ActionCenterReviewRhythmHealth = 'upcoming' | 'overdue' | 'stale' | 'completed'

export function buildDefaultActionCenterReviewRhythmConfig(): ActionCenterReviewRhythmConfig {
  return {
    cadenceDays: 14,
    reminderLeadDays: 3,
    escalationLeadDays: 7,
    remindersEnabled: true,
  }
}

export function normalizeActionCenterReviewRhythmConfig(input: {
  cadence_days?: number | null
  reminder_lead_days?: number | null
  escalation_lead_days?: number | null
  reminders_enabled?: boolean | null
}): ActionCenterReviewRhythmConfig {
  const defaults = buildDefaultActionCenterReviewRhythmConfig()

  return {
    cadenceDays: input.cadence_days === 7 || input.cadence_days === 30 ? input.cadence_days : defaults.cadenceDays,
    reminderLeadDays:
      input.reminder_lead_days === 1 || input.reminder_lead_days === 5 ? input.reminder_lead_days : defaults.reminderLeadDays,
    escalationLeadDays:
      input.escalation_lead_days === 3 || input.escalation_lead_days === 14 ? input.escalation_lead_days : defaults.escalationLeadDays,
    remindersEnabled: input.reminders_enabled ?? defaults.remindersEnabled,
  }
}

export function validateActionCenterReviewRhythmInput(config: ActionCenterReviewRhythmConfig) {
  if (config.remindersEnabled && config.reminderLeadDays >= config.cadenceDays) {
    return { ok: false as const, reason: 'invalid-reminder-window' as const }
  }

  if (config.escalationLeadDays <= config.reminderLeadDays) {
    return { ok: false as const, reason: 'invalid-escalation-window' as const }
  }

  return { ok: true as const, reason: null }
}

export function classifyActionCenterReviewRhythmStatus(args: {
  reviewDate: string | null
  now: Date
  config: ActionCenterReviewRhythmConfig
  itemStatus: ActionCenterPreviewStatus
}): ActionCenterReviewRhythmHealth {
  if (args.itemStatus === 'afgerond' || args.itemStatus === 'gestopt') {
    return 'completed'
  }

  if (!args.reviewDate) {
    return 'stale'
  }

  const scheduled = new Date(`${args.reviewDate}T00:00:00.000Z`)
  const diffDays = Math.floor((args.now.getTime() - scheduled.getTime()) / 86_400_000)

  if (diffDays > args.config.cadenceDays) {
    return 'stale'
  }

  if (diffDays > 0) {
    return 'overdue'
  }

  return 'upcoming'
}
```

- [ ] **Step 4: Run the contract tests and verify they pass**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm.test.ts" "lib/action-center-review-rhythm-policy.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the persisted rhythm contract**

```bash
git add supabase/action_center_review_rhythm_console.sql supabase/schema.sql frontend/lib/action-center-review-rhythm.ts frontend/lib/action-center-review-rhythm.test.ts frontend/lib/action-center-review-rhythm-policy.test.ts
git commit -m "feat(action-center): add review rhythm contract"
```

---

### Task 2: Add Server-Side Rhythm Loading and Save Route

**Files:**
- Create: `frontend/lib/action-center-review-rhythm-data.ts`
- Create: `frontend/lib/action-center-review-rhythm-data.test.ts`
- Create: `frontend/app/api/action-center-review-rhythm/route.ts`
- Create: `frontend/app/api/action-center-review-rhythm/route.test.ts`

- [ ] **Step 1: Write the failing loader and route tests**

```ts
// frontend/lib/action-center-review-rhythm-data.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAdminFrom } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { getActionCenterReviewRhythmData } from './action-center-review-rhythm-data'

describe('action center review rhythm data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns visible ExitScan route configs and bounded overview counts', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_review_rhythm_configs') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                route_id: 'cmp-exit-1::org-1::department::operations',
                cadence_days: 14,
                reminder_lead_days: 3,
                escalation_lead_days: 7,
                reminders_enabled: true,
              },
            ],
          }),
        }
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const result = await getActionCenterReviewRhythmData({
      items: [
        {
          id: 'cmp-exit-1::org-1::department::operations',
          status: 'reviewbaar',
          reviewDate: '2026-05-01',
          sourceLabel: 'ExitScan',
        },
      ] as never,
      now: new Date('2026-05-28T12:00:00.000Z'),
    })

    expect(result.configByRouteId['cmp-exit-1::org-1::department::operations']).toMatchObject({
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      remindersEnabled: true,
    })
    expect(result.summary.staleCount).toBe(1)
  })
})
```

```ts
// frontend/app/api/action-center-review-rhythm/route.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetUser,
  mockLoadSuiteAccessContext,
  mockUpsert,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockLoadSuiteAccessContext: vi.fn(),
  mockUpsert: vi.fn(),
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
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}))

import { POST } from './route'

describe('action center review rhythm route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'hr@northwind.example' } },
    })

    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canScheduleActionCenterReview: true,
        organizationIds: ['org-1'],
        workspaceOrgIds: ['org-1'],
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: 'org-1', role: 'member' }],
      workspaceMemberships: [],
    })

    mockUpsert.mockResolvedValue({ error: null })
  })

  it('rejects saves when the actor cannot manage review rhythm', async () => {
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canUpdateActionCenter: false,
        canScheduleActionCenterReview: true,
        organizationIds: ['org-1'],
        workspaceOrgIds: ['org-1'],
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
      workspaceMemberships: [],
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-rhythm', {
        method: 'POST',
        body: JSON.stringify({
          routeId: 'cmp-exit-1::org-1::department::operations',
          routeSourceId: 'cmp-exit-1',
          orgId: 'org-1',
          scanType: 'exit',
          cadenceDays: 14,
          reminderLeadDays: 3,
          escalationLeadDays: 7,
          remindersEnabled: true,
        }),
      }),
    )

    expect(response.status).toBe(403)
  })

  it('persists a bounded ExitScan rhythm config payload', async () => {
    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-rhythm', {
        method: 'POST',
        body: JSON.stringify({
          routeId: 'cmp-exit-1::org-1::department::operations',
          routeScopeValue: 'org-1::department::operations',
          routeSourceId: 'cmp-exit-1',
          orgId: 'org-1',
          scanType: 'exit',
          cadenceDays: 14,
          reminderLeadDays: 3,
          escalationLeadDays: 7,
          remindersEnabled: true,
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(mockUpsert).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the loader and route tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm-data.test.ts" "app/api/action-center-review-rhythm/route.test.ts"
```

Expected: FAIL because the loader and route do not exist yet.

- [ ] **Step 3: Implement the server-side loader and bounded save route**

```ts
// frontend/lib/action-center-review-rhythm-data.ts
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import { buildDefaultActionCenterReviewRhythmConfig, classifyActionCenterReviewRhythmStatus, normalizeActionCenterReviewRhythmConfig } from '@/lib/action-center-review-rhythm'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getActionCenterReviewRhythmData(args: {
  items: ActionCenterPreviewItem[]
  now: Date
}) {
  const routeIds = args.items
    .filter((item) => item.sourceLabel === 'ExitScan')
    .map((item) => item.id)

  const admin = createAdminClient()
  const { data } =
    routeIds.length > 0
      ? await admin.from('action_center_review_rhythm_configs').select('*').in('route_id', routeIds)
      : { data: [] }

  const configByRouteId = Object.fromEntries(
    (data ?? []).map((row: Record<string, unknown>) => [
      row.route_id as string,
      normalizeActionCenterReviewRhythmConfig({
        cadence_days: row.cadence_days as number | null,
        reminder_lead_days: row.reminder_lead_days as number | null,
        escalation_lead_days: row.escalation_lead_days as number | null,
        reminders_enabled: row.reminders_enabled as boolean | null,
      }),
    ]),
  )

  const summary = args.items.reduce(
    (acc, item) => {
      const config = configByRouteId[item.id] ?? buildDefaultActionCenterReviewRhythmConfig()
      const health = classifyActionCenterReviewRhythmStatus({
        reviewDate: item.reviewDate,
        now: args.now,
        config,
        itemStatus: item.status,
      })

      if (health === 'stale') acc.staleCount += 1
      if (health === 'overdue') acc.overdueCount += 1
      if (health === 'upcoming') acc.upcomingCount += 1
      if (config.remindersEnabled && health !== 'completed') acc.reminderManagedCount += 1

      return acc
    },
    { staleCount: 0, overdueCount: 0, upcomingCount: 0, reminderManagedCount: 0 },
  )

  return { configByRouteId, summary }
}
```

```ts
// frontend/app/api/action-center-review-rhythm/route.ts
import { NextResponse } from 'next/server'
import { validateActionCenterReviewRhythmInput } from '@/lib/action-center-review-rhythm'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

function canManageReviewRhythm(context: {
  canViewActionCenter: boolean
  canUpdateActionCenter: boolean
  canScheduleActionCenterReview: boolean
}) {
  return context.canViewActionCenter && context.canUpdateActionCenter && context.canScheduleActionCenterReview
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    routeId: string
    routeScopeValue: string
    routeSourceId: string
    orgId: string
    scanType: string
    cadenceDays: 7 | 14 | 30
    reminderLeadDays: 1 | 3 | 5
    escalationLeadDays: 3 | 7 | 14
    remindersEnabled: boolean
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const suiteAccess = await loadSuiteAccessContext(supabase, user.id)
  if (!canManageReviewRhythm(suiteAccess.context)) {
    return NextResponse.json({ detail: 'Geen toegang om reviewritme te beheren.' }, { status: 403 })
  }

  if (body.scanType !== 'exit') {
    return NextResponse.json({ detail: 'Reviewritme blijft in deze slice beperkt tot ExitScan.' }, { status: 409 })
  }

  const validation = validateActionCenterReviewRhythmInput({
    cadenceDays: body.cadenceDays,
    reminderLeadDays: body.reminderLeadDays,
    escalationLeadDays: body.escalationLeadDays,
    remindersEnabled: body.remindersEnabled,
  })

  if (!validation.ok) {
    return NextResponse.json({ detail: validation.reason }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('action_center_review_rhythm_configs').upsert(
    {
      org_id: body.orgId,
      route_id: body.routeId,
      route_scope_value: body.routeScopeValue,
      route_source_id: body.routeSourceId,
      scan_type: body.scanType,
      cadence_days: body.cadenceDays,
      reminder_lead_days: body.reminderLeadDays,
      escalation_lead_days: body.escalationLeadDays,
      reminders_enabled: body.remindersEnabled,
      updated_by_role: suiteAccess.context.isVerisightAdmin ? 'verisight_admin' : 'hr_member',
    },
    { onConflict: 'route_id' },
  )

  if (error) {
    return NextResponse.json({ detail: 'Reviewritme kon niet worden opgeslagen.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Run the loader and route tests and verify they pass**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm-data.test.ts" "app/api/action-center-review-rhythm/route.test.ts" "lib/action-center-review-rhythm.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the server-side rhythm slice**

```bash
git add frontend/lib/action-center-review-rhythm-data.ts frontend/lib/action-center-review-rhythm-data.test.ts frontend/app/api/action-center-review-rhythm/route.ts frontend/app/api/action-center-review-rhythm/route.test.ts
git commit -m "feat(action-center): add review rhythm data and route"
```

---

### Task 3: Add the HR Rhythm Console UI to the Reviewmomenten Surface

**Files:**
- Create: `frontend/components/dashboard/review-rhythm-console.tsx`
- Create: `frontend/components/dashboard/review-rhythm-console.test.tsx`
- Modify: `frontend/components/dashboard/review-moment-page-client.tsx`
- Modify: `frontend/components/dashboard/review-moment-page-client.test.ts`
- Modify: `frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx`
- Modify: `frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts`

- [ ] **Step 1: Write the failing UI and shell tests**

```ts
// frontend/components/dashboard/review-rhythm-console.test.tsx
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReviewRhythmConsole } from './review-rhythm-console'

describe('review rhythm console', () => {
  it('renders bounded HR rhythm controls and overview copy', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewRhythmConsole, {
        selectedRouteId: 'cmp-exit-1::org-1::department::operations',
        selectedRouteLabel: 'Operations',
        canManageReviewRhythm: true,
        config: {
          cadenceDays: 14,
          reminderLeadDays: 3,
          escalationLeadDays: 7,
          remindersEnabled: true,
        },
        summary: {
          staleCount: 1,
          overdueCount: 2,
          upcomingCount: 4,
          reminderManagedCount: 5,
        },
      }),
    )

    expect(markup).toContain('HR Rhythm Console')
    expect(markup).toContain('Cadence')
    expect(markup).toContain('Reminder')
    expect(markup).toContain('Escalatie')
    expect(markup).not.toContain('workflow')
  })
})
```

```ts
// frontend/components/dashboard/review-moment-page-client.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('review moment page client source', () => {
  it('threads the bounded HR rhythm console into the existing reviewmomenten surface', () => {
    const source = readFileSync(new URL('./review-moment-page-client.tsx', import.meta.url), 'utf8')

    expect(source).toContain('ReviewRhythmConsole')
    expect(source).toContain('canManageReviewRhythm')
    expect(source).toContain('rhythmConfigByRouteId')
    expect(source).not.toContain('Graph')
    expect(source).not.toContain('automation builder')
  })
})
```

```ts
// frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center reviewmomenten entry shell', () => {
  it('threads review rhythm data and management permission into the existing reviewmomenten page', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getActionCenterReviewRhythmData')
    expect(source).toContain('canManageReviewRhythm=')
    expect(source).toContain('rhythmConfigByRouteId=')
    expect(source).toContain('rhythmSummary=')
  })
})
```

- [ ] **Step 2: Run the UI and shell tests and verify they fail**

Run:

```bash
npx vitest run "components/dashboard/review-rhythm-console.test.tsx" "components/dashboard/review-moment-page-client.test.ts" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts"
```

Expected: FAIL because the console component and server wiring do not exist yet.

- [ ] **Step 3: Implement the bounded HR rhythm console and wire it into the reviewmomenten page**

```tsx
// frontend/components/dashboard/review-rhythm-console.tsx
'use client'

import { useState } from 'react'
import { DashboardPanel } from '@/components/dashboard/dashboard-primitives'
import type { ActionCenterReviewRhythmConfig } from '@/lib/action-center-review-rhythm'

const CADENCE_OPTIONS = [7, 14, 30] as const
const REMINDER_OPTIONS = [1, 3, 5] as const
const ESCALATION_OPTIONS = [3, 7, 14] as const

export function ReviewRhythmConsole(args: {
  selectedRouteId: string | null
  selectedRouteLabel: string | null
  canManageReviewRhythm: boolean
  config: ActionCenterReviewRhythmConfig
  summary: {
    staleCount: number
    overdueCount: number
    upcomingCount: number
    reminderManagedCount: number
  }
}) {
  const [draft, setDraft] = useState(args.config)

  return (
    <DashboardPanel
      surface="ops"
      eyebrow="Reviewritme"
      title="HR Rhythm Console"
      body="Beheer cadence, reminder-venster en escalatiemoment voor de gekozen opvolgroute zonder een generieke workflowlaag toe te voegen."
      tone="slate"
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 text-sm">Stale: {args.summary.staleCount}</div>
          <div className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 text-sm">Overdue: {args.summary.overdueCount}</div>
          <div className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 text-sm">Upcoming: {args.summary.upcomingCount}</div>
          <div className="rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 text-sm">Reminder-managed: {args.summary.reminderManagedCount}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[color:var(--dashboard-ink)]">Cadence</span>
            <select
              disabled={!args.canManageReviewRhythm || !args.selectedRouteId}
              value={String(draft.cadenceDays)}
              onChange={(event) => setDraft((current) => ({ ...current, cadenceDays: Number(event.target.value) as 7 | 14 | 30 }))}
              className="w-full rounded-xl border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-sm"
            >
              {CADENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} dagen</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[color:var(--dashboard-ink)]">Reminder</span>
            <select
              disabled={!args.canManageReviewRhythm || !draft.remindersEnabled || !args.selectedRouteId}
              value={String(draft.reminderLeadDays)}
              onChange={(event) => setDraft((current) => ({ ...current, reminderLeadDays: Number(event.target.value) as 1 | 3 | 5 }))}
              className="w-full rounded-xl border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-sm"
            >
              {REMINDER_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} dagen</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[color:var(--dashboard-ink)]">Escalatie</span>
            <select
              disabled={!args.canManageReviewRhythm || !args.selectedRouteId}
              value={String(draft.escalationLeadDays)}
              onChange={(event) => setDraft((current) => ({ ...current, escalationLeadDays: Number(event.target.value) as 3 | 7 | 14 }))}
              className="w-full rounded-xl border border-[color:var(--dashboard-frame-border)] bg-white px-3 py-2 text-sm"
            >
              {ESCALATION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option} dagen</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </DashboardPanel>
  )
}
```

```tsx
// frontend/components/dashboard/review-moment-page-client.tsx
import { ReviewRhythmConsole } from '@/components/dashboard/review-rhythm-console'

// inside ReviewMomentPageClient props:
// canManageReviewRhythm: boolean
// rhythmConfigByRouteId: Record<string, ActionCenterReviewRhythmConfig>
// rhythmSummary: { staleCount: number; overdueCount: number; upcomingCount: number; reminderManagedCount: number }

      <ReviewRhythmConsole
        selectedRouteId={selectedItem?.id ?? null}
        selectedRouteLabel={selectedItem?.teamLabel ?? null}
        canManageReviewRhythm={canManageReviewRhythm}
        config={
          (selectedItem?.id ? rhythmConfigByRouteId[selectedItem.id] : null) ?? {
            cadenceDays: 14,
            reminderLeadDays: 3,
            escalationLeadDays: 7,
            remindersEnabled: true,
          }
        }
        summary={rhythmSummary}
      />
```

```tsx
// frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx
import { getActionCenterReviewRhythmData } from '@/lib/action-center-review-rhythm-data'

  const rhythmData = await getActionCenterReviewRhythmData({
    items: pageData.items,
    now,
  })

  const canManageReviewRhythm = context.canUpdateActionCenter && context.canScheduleActionCenterReview

  return (
    <ReviewMomentPageClient
      items={pageData.items}
      governanceCounts={computeReviewMomentGovernanceCounts(pageData.items, now)}
      organizationName={getReviewOrganizationName(pageData.organizationNames)}
      lastUpdated={now.toISOString()}
      canScheduleActionCenterReview={context.canScheduleActionCenterReview}
      inviteDownloadEligibleRouteIds={pageData.inviteDownloadEligibleRouteIds}
      canManageReviewRhythm={canManageReviewRhythm}
      rhythmConfigByRouteId={rhythmData.configByRouteId}
      rhythmSummary={rhythmData.summary}
    />
  )
```

- [ ] **Step 4: Run the UI and shell tests and verify they pass**

Run:

```bash
npx vitest run "components/dashboard/review-rhythm-console.test.tsx" "components/dashboard/review-moment-page-client.test.ts" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts" "app/api/action-center-review-rhythm/route.test.ts"
```

Expected: PASS

- [ ] **Step 5: Commit the HR rhythm console UI**

```bash
git add frontend/components/dashboard/review-rhythm-console.tsx frontend/components/dashboard/review-rhythm-console.test.tsx frontend/components/dashboard/review-moment-page-client.tsx frontend/components/dashboard/review-moment-page-client.test.ts frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts
git commit -m "feat(action-center): add hr rhythm console"
```

---

### Task 4: Run the Bounded Integration Verification

**Files:**
- Verify: `frontend/lib/action-center-review-rhythm.test.ts`
- Verify: `frontend/lib/action-center-review-rhythm-policy.test.ts`
- Verify: `frontend/lib/action-center-review-rhythm-data.test.ts`
- Verify: `frontend/app/api/action-center-review-rhythm/route.test.ts`
- Verify: `frontend/components/dashboard/review-rhythm-console.test.tsx`
- Verify: `frontend/components/dashboard/review-moment-page-client.test.ts`
- Verify: `frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts`
- Verify: `frontend/components/dashboard/review-moment-detail-panel.test.ts`

- [ ] **Step 1: Run the full bounded rhythm suite**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm.test.ts" "lib/action-center-review-rhythm-policy.test.ts" "lib/action-center-review-rhythm-data.test.ts" "app/api/action-center-review-rhythm/route.test.ts" "components/dashboard/review-rhythm-console.test.tsx" "components/dashboard/review-moment-page-client.test.ts" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts" "components/dashboard/review-moment-detail-panel.test.ts"
```

Expected: PASS

- [ ] **Step 2: Verify the reviewmomenten shell still stays bounded**

Re-check these conditions in the passing suite:

- no Graph copy in the reviewmomenten page shell
- no generic workflow/automation language in the new console
- no change to the existing `.ics` CTA contract
- no change to invite route behavior

- [ ] **Step 3: Commit the integration verification checkpoint**

```bash
git add -A
git commit -m "test(action-center): verify hr rhythm console slice"
```

---

## Verification Checklist

- [ ] only ExitScan routes can persist review rhythm config in this slice
- [ ] only actors with both `canUpdateActionCenter` and `canScheduleActionCenterReview` can save rhythm config
- [ ] reminder timing cannot exceed or collide with cadence
- [ ] escalation timing cannot precede reminder timing
- [ ] the console stays inside the existing `reviewmomenten` route
- [ ] no reminder emails are sent in this slice
- [ ] no owner reassignment execution is introduced in this slice
- [ ] no Graph dependency is introduced in this slice

## Suggested Follow-Up Plan

After this child plan is implemented and verified, the next child plan to write should be:

- `docs/superpowers/plans/2026-05-14-action-center-triggered-follow-through-mail-layer.md`

That plan can then safely assume:

- cadence defaults are explicit
- reminder timing and escalation timing are explicit
- save-time validation exists
- the reviewmomenten surface already contains a bounded HR rhythm control layer
