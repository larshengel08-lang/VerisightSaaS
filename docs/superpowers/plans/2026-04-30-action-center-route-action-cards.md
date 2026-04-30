# Action Center Route Action Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Action Center from one route-level handoff into a department-route container that can carry multiple manager action cards, each with its own review cycle, while keeping route overview compact and non-tasky.

**Architecture:** Keep route truth as the upper container, introduce canonical action truth plus lightweight per-action review truth, and derive route status from one shared aggregation function. Preserve the existing manager-assignment and route-opening semantics from the previous phase; add action cards and action reviews as the new execution layer instead of turning manager responses into a full task system.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright, Supabase Postgres schema/RLS, existing Action Center live projection and dashboard components.

---

## Implementation precondition

This plan assumes implementation starts from an up-to-date branch that already contains the merged limited-manager-interaction seams:

- `frontend/lib/action-center-manager-responses.ts`
- `frontend/lib/action-center-route-contract.ts`
- `frontend/app/api/action-center-manager-responses/route.ts`
- `frontend/tests/e2e/action-center-manager-access.spec.ts`

If the local worktree does not contain those files, refresh from the latest shared Action Center branch before Task 1. Do not implement this plan on top of the stale local `main` snapshot alone.

### Task 1: Lock the new route/action/review contract in tests

**Files:**
- Create: `frontend/lib/action-center-route-actions.test.ts`
- Create: `frontend/lib/action-center-action-reviews.test.ts`
- Modify: `frontend/lib/action-center-route-contract.test.ts`
- Modify: `frontend/lib/action-center-live.test.ts`
- Modify: `frontend/app/(dashboard)/beheer/klantlearnings/action-center-preview.test.ts`

- [ ] **Step 1: Add failing action-truth tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  buildRouteAction,
  classifyRouteActionStatus,
} from '@/lib/action-center-route-actions'

describe('buildRouteAction', () => {
  it('creates a canonical open action card with one theme and one review moment', () => {
    const action = buildRouteAction({
      id: 'action-1',
      routeId: 'route-1',
      themeKey: 'leadership',
      actionText: 'Plan twee gerichte teamgesprekken over vertrekredenen.',
      reviewScheduledFor: '2026-05-15',
      expectedEffect: 'Zichtbaar maken of vertrekreden vooral rolduidelijkheid of leiderschap raakt.',
      status: 'open',
      createdAt: '2026-04-30T10:00:00.000Z',
      updatedAt: '2026-04-30T10:00:00.000Z',
    })

    expect(action.themeKey).toBe('leadership')
    expect(action.status).toBe('open')
    expect(action.reviewScheduledFor).toBe('2026-05-15')
  })

  it('rejects an action without a theme or review date', () => {
    expect(() =>
      buildRouteAction({
        id: 'action-2',
        routeId: 'route-1',
        themeKey: '',
        actionText: 'Doe iets',
        reviewScheduledFor: '',
        expectedEffect: 'Iets zien',
        status: 'open',
        createdAt: '2026-04-30T10:00:00.000Z',
        updatedAt: '2026-04-30T10:00:00.000Z',
      }),
    ).toThrow(/themeKey|reviewScheduledFor/)
  })
})

describe('classifyRouteActionStatus', () => {
  it('moves an action to in_review when the review date is due', () => {
    expect(
      classifyRouteActionStatus({
        status: 'open',
        reviewScheduledFor: '2026-04-30',
        today: '2026-04-30',
      }),
    ).toBe('in_review')
  })
})
```

- [ ] **Step 2: Add failing action-review tests**

```ts
import { describe, expect, it } from 'vitest'
import { buildActionReview } from '@/lib/action-center-action-reviews'

describe('buildActionReview', () => {
  it('captures observation plus compact action outcome without creating a second route decision line', () => {
    const review = buildActionReview({
      actionReviewId: 'review-1',
      actionId: 'action-1',
      reviewedAt: '2026-05-15T09:00:00.000Z',
      observation: 'Managers zien meer openheid in teamgesprekken.',
      actionOutcome: 'effect-zichtbaar',
      followUpNote: 'Volgende stap: zelfde ritme nog twee weken vasthouden.',
    })

    expect(review.actionOutcome).toBe('effect-zichtbaar')
    expect(review.followUpNote).toContain('Volgende stap')
  })
})
```

- [ ] **Step 3: Add failing route aggregation tests**

```ts
import { describe, expect, it } from 'vitest'
import { aggregateRouteStatus } from '@/lib/action-center-route-contract'

describe('aggregateRouteStatus', () => {
  it('prefers reviewbaar over in-uitvoering for mixed open and due-review actions', () => {
    expect(
      aggregateRouteStatus([
        { status: 'open', reviewScheduledFor: '2026-04-30' },
        { status: 'open', reviewScheduledFor: '2026-05-10' },
      ], '2026-04-30'),
    ).toBe('reviewbaar')
  })

  it('keeps a route afgerond when only completed and stopped actions remain and at least one is completed', () => {
    expect(
      aggregateRouteStatus([
        { status: 'afgerond', reviewScheduledFor: '2026-04-10' },
        { status: 'gestopt', reviewScheduledFor: '2026-04-12' },
      ], '2026-04-30'),
    ).toBe('afgerond')
  })
})
```

- [ ] **Step 4: Add failing live-projection and preview tests**

```ts
it('projects action counts and next review into the route overview card', () => {
  const projected = buildLiveActionCenterItems([
    makeRouteContext({
      actions: [
        makeAction({ status: 'open', reviewScheduledFor: '2026-05-10' }),
        makeAction({ status: 'in_review', reviewScheduledFor: '2026-04-30' }),
      ],
    }),
  ])

  expect(projected[0]?.status).toBe('reviewbaar')
  expect(projected[0]?.summary).toContain('2 acties')
  expect(projected[0]?.reviewDate).toBe('2026-04-30')
})
```

- [ ] **Step 5: Run tests to verify the contract is not implemented yet**

Run:

```powershell
npm test -- "lib/action-center-route-actions.test.ts" "lib/action-center-action-reviews.test.ts" "lib/action-center-route-contract.test.ts" "lib/action-center-live.test.ts" "app/(dashboard)/beheer/klantlearnings/action-center-preview.test.ts"
```

Expected:
- new test files fail as missing modules
- route aggregation/live tests fail because multiple-action aggregation does not exist yet

- [ ] **Step 6: Commit the red tests**

```powershell
git add frontend/lib/action-center-route-actions.test.ts frontend/lib/action-center-action-reviews.test.ts frontend/lib/action-center-route-contract.test.ts frontend/lib/action-center-live.test.ts frontend/app/(dashboard)/beheer/klantlearnings/action-center-preview.test.ts
git commit -m "test: lock action center route action cards contract"
```

### Task 2: Implement canonical action truth and action-review truth

**Files:**
- Create: `frontend/lib/action-center-route-actions.ts`
- Create: `frontend/lib/action-center-action-reviews.ts`
- Modify: `frontend/lib/action-center-route-contract.ts`

- [ ] **Step 1: Implement the action domain module**

```ts
export type RouteActionThemeKey =
  | 'leadership'
  | 'culture'
  | 'growth'
  | 'compensation'
  | 'workload'
  | 'role_clarity'

export type RouteActionStatus = 'open' | 'in_review' | 'afgerond' | 'gestopt'

export interface RouteActionRecord {
  actionId: string
  routeId: string
  themeKey: RouteActionThemeKey
  actionText: string
  reviewScheduledFor: string
  expectedEffect: string
  status: RouteActionStatus
  createdAt: string
  updatedAt: string
}

export function buildRouteAction(input: RouteActionRecord): RouteActionRecord {
  if (!input.themeKey || !input.reviewScheduledFor) {
    throw new Error('themeKey and reviewScheduledFor are required for route actions')
  }

  return input
}

export function classifyRouteActionStatus(input: {
  status: RouteActionStatus
  reviewScheduledFor: string
  today: string
}): RouteActionStatus {
  if (input.status === 'open' && input.reviewScheduledFor <= input.today) {
    return 'in_review'
  }

  return input.status
}
```

- [ ] **Step 2: Implement the action-review domain module**

```ts
export type RouteActionOutcome =
  | 'effect-zichtbaar'
  | 'bijsturen-nodig'
  | 'nog-te-vroeg'
  | 'stoppen'

export interface ActionReviewRecord {
  actionReviewId: string
  actionId: string
  reviewedAt: string
  observation: string
  actionOutcome: RouteActionOutcome
  followUpNote: string
}

export function buildActionReview(input: ActionReviewRecord): ActionReviewRecord {
  if (!input.observation || !input.actionOutcome) {
    throw new Error('observation and actionOutcome are required for action reviews')
  }

  return input
}
```

- [ ] **Step 3: Add the canonical route-status aggregation helper**

```ts
import type { RouteActionRecord } from '@/lib/action-center-route-actions'

export type AggregatedRouteStatus =
  | 'open verzoek'
  | 'in uitvoering'
  | 'reviewbaar'
  | 'afgerond'
  | 'gestopt'

export function aggregateRouteStatus(
  actions: Array<Pick<RouteActionRecord, 'status' | 'reviewScheduledFor'>>,
  today: string,
): AggregatedRouteStatus {
  if (actions.length === 0) return 'open verzoek'

  const hasReviewableAction = actions.some(
    (action) => action.status === 'in_review' || (action.status === 'open' && action.reviewScheduledFor <= today),
  )
  if (hasReviewableAction) return 'reviewbaar'

  const hasOpenAction = actions.some((action) => action.status === 'open')
  if (hasOpenAction) return 'in uitvoering'

  const hasCompletedAction = actions.some((action) => action.status === 'afgerond')
  if (hasCompletedAction) return 'afgerond'

  return 'gestopt'
}
```

- [ ] **Step 4: Re-run the new unit tests**

Run:

```powershell
npm test -- "lib/action-center-route-actions.test.ts" "lib/action-center-action-reviews.test.ts" "lib/action-center-route-contract.test.ts"
```

Expected:
- all tests in those files pass

- [ ] **Step 5: Commit the truth-layer implementation**

```powershell
git add frontend/lib/action-center-route-actions.ts frontend/lib/action-center-action-reviews.ts frontend/lib/action-center-route-contract.ts frontend/lib/action-center-route-actions.test.ts frontend/lib/action-center-action-reviews.test.ts frontend/lib/action-center-route-contract.test.ts
git commit -m "feat: add action center route action truth"
```

### Task 3: Add persistence and server write paths

**Files:**
- Modify: `supabase/schema.sql`
- Create: `frontend/app/api/action-center-route-actions/route.ts`
- Create: `frontend/app/api/action-center-route-actions/route.test.ts`
- Create: `frontend/app/api/action-center-action-reviews/route.ts`
- Create: `frontend/app/api/action-center-action-reviews/route.test.ts`
- Modify: `frontend/app/api/action-center/workspace-members/route.ts`

- [ ] **Step 1: Add failing API tests for manager-owned writes**

```ts
it('rejects route-action creation when the manager is not assigned to the route scope', async () => {
  const response = await POST(makeRequest({
    campaign_id: 'campaign-1',
    route_scope_type: 'department',
    route_scope_value: 'finance',
    theme_key: 'leadership',
    action_text: 'Plan teamgesprekken',
    review_scheduled_for: '2026-05-15',
    expected_effect: 'Meer duidelijkheid over leiderschapsfrictie',
  }))

  expect(response.status).toBe(403)
})

it('accepts one valid route action and persists server-derived route identity', async () => {
  const response = await POST(makeRequest(validPayload))
  expect(response.status).toBe(200)
})
```

- [ ] **Step 2: Add the new Supabase tables and policies**

```sql
create table if not exists public.action_center_route_actions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  org_id uuid references public.organizations(id) on delete cascade not null,
  route_scope_type text not null check (route_scope_type in ('department', 'item')),
  route_scope_value text not null,
  manager_user_id uuid references auth.users(id) on delete cascade not null,
  theme_key text not null check (theme_key in ('leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity')),
  action_text text not null,
  review_scheduled_for date not null,
  expected_effect text not null,
  status text not null default 'open' check (status in ('open', 'in_review', 'afgerond', 'gestopt')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.action_center_action_reviews (
  id uuid primary key default gen_random_uuid(),
  action_id uuid references public.action_center_route_actions(id) on delete cascade not null,
  reviewed_at timestamptz not null,
  observation text not null,
  action_outcome text not null check (action_outcome in ('effect-zichtbaar', 'bijsturen-nodig', 'nog-te-vroeg', 'stoppen')),
  follow_up_note text not null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

- [ ] **Step 3: Implement the route-action API using server-derived identity**

```ts
export async function POST(request: Request) {
  const payload = routeActionSchema.parse(await request.json())
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const routeIdentity = await resolveWritableRouteIdentity({
    supabase,
    userId: user.id,
    campaignId: payload.campaign_id,
    scopeType: payload.route_scope_type,
    scopeValue: payload.route_scope_value,
  })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('action_center_route_actions')
    .insert({
      campaign_id: routeIdentity.campaignId,
      org_id: routeIdentity.orgId,
      route_scope_type: routeIdentity.scopeType,
      route_scope_value: routeIdentity.scopeValue,
      manager_user_id: routeIdentity.managerUserId,
      theme_key: payload.theme_key,
      action_text: payload.action_text,
      review_scheduled_for: payload.review_scheduled_for,
      expected_effect: payload.expected_effect,
      status: 'open',
      created_by: user.id,
      updated_by: user.id,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ action: data })
}
```

- [ ] **Step 4: Implement the action-review API**

```ts
export async function POST(request: Request) {
  const payload = actionReviewSchema.parse(await request.json())
  const routeIdentity = await resolveWritableActionIdentity({
    actionId: payload.action_id,
    userId,
    supabase,
  })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('action_center_action_reviews')
    .insert({
      action_id: routeIdentity.actionId,
      reviewed_at: payload.reviewed_at,
      observation: payload.observation,
      action_outcome: payload.action_outcome,
      follow_up_note: payload.follow_up_note,
      created_by: userId,
      updated_by: userId,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ review: data })
}
```

- [ ] **Step 5: Re-run API tests**

Run:

```powershell
npm test -- "app/api/action-center-route-actions/route.test.ts" "app/api/action-center-action-reviews/route.test.ts"
```

Expected:
- route-action API tests pass
- action-review API tests pass

- [ ] **Step 6: Commit persistence and API work**

```powershell
git add supabase/schema.sql frontend/app/api/action-center-route-actions/route.ts frontend/app/api/action-center-route-actions/route.test.ts frontend/app/api/action-center-action-reviews/route.ts frontend/app/api/action-center-action-reviews/route.test.ts frontend/app/api/action-center/workspace-members/route.ts
git commit -m "feat: persist action center route actions and reviews"
```

### Task 4: Wire live projection, route summary, and detail semantics

**Files:**
- Modify: `frontend/lib/action-center-live.ts`
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Modify: `frontend/app/(dashboard)/beheer/klantlearnings/page.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.tsx`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`

- [ ] **Step 1: Extend live route context to carry action cards and reviews**

```ts
export interface LiveActionCenterCampaignContext {
  // existing fields...
  routeActions: RouteActionRecord[]
  actionReviews: ActionReviewRecord[]
}
```

- [ ] **Step 2: Project route-level summary from action truth**

```ts
const routeStatus = aggregateRouteStatus(routeActions, today)
const nextReview = getNextReviewDate(routeActions)

return {
  ...baseItem,
  status: routeStatus,
  reviewDate: nextReview,
  summary: buildActionSummary({
    openCount: countByStatus(routeActions, 'open'),
    reviewCount: countReviewableActions(routeActions, today),
    completedCount: countByStatus(routeActions, 'afgerond'),
  }),
}
```

- [ ] **Step 3: Add route detail projection for action cards**

```ts
export interface ActionCenterRouteActionCard {
  actionId: string
  themeKey: string
  actionText: string
  reviewScheduledFor: string
  expectedEffect: string
  status: 'open' | 'in_review' | 'afgerond' | 'gestopt'
  latestReview: {
    reviewedAt: string
    observation: string
    actionOutcome: string
    followUpNote: string
  } | null
}
```

- [ ] **Step 4: Update the route overview and admin preview tests**

Run:

```powershell
npm test -- "lib/action-center-live.test.ts" "app/(dashboard)/beheer/klantlearnings/action-center-preview.test.ts"
```

Expected:
- route summary tests pass with multi-action aggregation
- preview tests pass with compact counts and next-review projection

- [ ] **Step 5: Commit the projection layer**

```powershell
git add frontend/lib/action-center-live.ts frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/beheer/klantlearnings/page.tsx frontend/app/(dashboard)/action-center/page.tsx frontend/app/(dashboard)/campaigns/[id]/page.tsx frontend/lib/action-center-live.test.ts frontend/app/(dashboard)/beheer/klantlearnings/action-center-preview.test.ts
git commit -m "feat: project action center route action cards"
```

### Task 5: Add manager and HR UI for action cards and per-action reviews

**Files:**
- Create: `frontend/components/dashboard/action-center-route-action-editor.tsx`
- Create: `frontend/components/dashboard/action-center-action-review-editor.tsx`
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Modify: `frontend/components/dashboard/pilot-learning-workbench.tsx`
- Modify: `frontend/tests/e2e/action-center-manager-access.spec.ts`
- Create: `frontend/tests/e2e/action-center-route-action-cards.spec.ts`

- [ ] **Step 1: Add the action-card editor component**

```tsx
export function ActionCenterRouteActionEditor(props: {
  routeId: string
  themeOptions: Array<{ value: string; label: string }>
  onSaved(action: RouteActionRecord): void
}) {
  return (
    <form>
      <select name="themeKey" required />
      <textarea name="actionText" required />
      <input name="reviewScheduledFor" type="date" required />
      <textarea name="expectedEffect" required />
      <button type="submit">Actie toevoegen</button>
    </form>
  )
}
```

- [ ] **Step 2: Add the per-action review editor**

```tsx
export function ActionCenterActionReviewEditor(props: {
  actionId: string
  onSaved(review: ActionReviewRecord): void
}) {
  return (
    <form>
      <textarea name="observation" required />
      <select name="actionOutcome" required>
        <option value="effect-zichtbaar">Effect zichtbaar</option>
        <option value="bijsturen-nodig">Bijsturen nodig</option>
        <option value="nog-te-vroeg">Nog te vroeg</option>
        <option value="stoppen">Stoppen</option>
      </select>
      <textarea name="followUpNote" required />
      <button type="submit">Review opslaan</button>
    </form>
  )
}
```

- [ ] **Step 3: Render action cards in detail and keep route cards compact**

```tsx
{route.actionCards.map((action) => (
  <article key={action.actionId}>
    <p>{action.themeLabel}</p>
    <h3>{action.actionText}</h3>
    <p>Review: {action.reviewScheduledForLabel}</p>
    <p>Verwacht effect: {action.expectedEffect}</p>
    <p>Status: {action.statusLabel}</p>
    {action.latestReview ? <p>{action.latestReview.observation}</p> : null}
  </article>
))}
```

- [ ] **Step 4: Add browser tests for the critical flows**

```ts
test('manager can add two actions under one department route and each keeps its own review date', async ({ page }) => {
  await page.goto('/action-center')
  await page.getByRole('button', { name: 'Actie toevoegen' }).click()
  await page.getByLabel('Thema').selectOption('leadership')
  await page.getByLabel('Wat ga je doen').fill('Plan twee teamgesprekken.')
  await page.getByLabel('Wanneer reviewen we dit').fill('2026-05-15')
  await page.getByLabel('Wat moet dit zichtbaar maken').fill('Of leiderschapsfrictie de hoofdreden is.')
  await page.getByRole('button', { name: 'Actie opslaan' }).click()

  await expect(page.getByText('Plan twee teamgesprekken.')).toBeVisible()
  await expect(page.getByText('15 mei 2026')).toBeVisible()
})
```

- [ ] **Step 5: Run the UI and browser tests**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
npx playwright test tests/e2e/action-center-manager-access.spec.ts tests/e2e/action-center-route-action-cards.spec.ts --project=chromium --workers=1
```

Expected:
- manager sees open route
- manager can add multiple actions inside one route
- each action keeps its own review moment
- route summary stays compact

- [ ] **Step 6: Commit the UI layer**

```powershell
git add frontend/components/dashboard/action-center-route-action-editor.tsx frontend/components/dashboard/action-center-action-review-editor.tsx frontend/components/dashboard/action-center-preview.tsx frontend/components/dashboard/pilot-learning-workbench.tsx frontend/tests/e2e/action-center-manager-access.spec.ts frontend/tests/e2e/action-center-route-action-cards.spec.ts
git commit -m "feat: add action center route action card ui"
```

### Task 6: Full verification, migration note, and PR closeout

**Files:**
- Modify: `docs/superpowers/specs/2026-04-30-action-center-route-action-cards-design.md` only if implementation reveals a real spec correction
- No planned source changes otherwise

- [ ] **Step 1: Run the targeted unit and integration suite**

```powershell
npm test -- "lib/action-center-route-actions.test.ts" "lib/action-center-action-reviews.test.ts" "lib/action-center-route-contract.test.ts" "lib/action-center-live.test.ts" "app/api/action-center-route-actions/route.test.ts" "app/api/action-center-action-reviews/route.test.ts" "app/(dashboard)/beheer/klantlearnings/action-center-preview.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- all targeted tests pass

- [ ] **Step 2: Run lint and build**

```powershell
npx eslint "components/dashboard/action-center-preview.tsx" "components/dashboard/action-center-route-action-editor.tsx" "components/dashboard/action-center-action-review-editor.tsx" "lib/action-center-route-actions.ts" "lib/action-center-action-reviews.ts" "lib/action-center-route-contract.ts" "lib/action-center-live.ts" "app/api/action-center-route-actions/route.ts" "app/api/action-center-action-reviews/route.ts"
npm run build
```

Expected:
- eslint exits 0
- build succeeds

- [ ] **Step 3: Run the browser verification path**

```powershell
node ./scripts/seed-action-center-manager-pilot.mjs
npx playwright test tests/e2e/action-center-manager-access.spec.ts tests/e2e/action-center-route-action-cards.spec.ts --project=chromium --workers=1
```

Expected:
- HR -> manager handoff still works
- manager can add and review multiple actions
- route semantics update correctly after reload

- [ ] **Step 4: Apply the Supabase migration in the target environment**

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'action_center_route_actions',
    'action_center_action_reviews'
  );
```

Expected:
- both tables exist before claiming browser-backed persistence is complete

- [ ] **Step 5: Commit, push, and open the PR**

```powershell
git status --short
git add -A
git commit -m "feat: add action center route action cards"
git push -u origin codex/action-center-route-action-cards
```

Expected:
- clean worktree
- branch pushed
- ready for PR review with browser verification noted
