# Action Center Route Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a canonical route-closeout layer above Action Center route action cards so HR can explicitly close routes, while open routes still derive their live status from action aggregation and can surface a lightweight `klaar-voor-closeout` attention signal.

**Architecture:** Introduce a dedicated route-closeout truth module plus storage/write path, keep action aggregation as the source of live open-route status, and layer a derived `readyForCloseout` attention signal on top for routes whose actions are complete but not yet formally closed. UI projection must follow one strict order: explicit closeout first, otherwise open-status aggregation, with `readyForCloseout` as a non-status hint only.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright, Supabase Postgres schema/RLS, existing Action Center route/action/review semantics, admin/HR dashboard surfaces.

---

### Task 1: Lock closeout semantics and attention rules in tests

**Files:**
- Create: `frontend/lib/action-center-route-closeout.test.ts`
- Modify: `frontend/lib/action-center-route-contract.test.ts`
- Modify: `frontend/lib/action-center-live.test.ts`
- Modify: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Add failing route-closeout truth tests**

```ts
import { describe, expect, it } from 'vitest'
import { projectActionCenterRouteCloseout } from '@/lib/action-center-route-closeout'

describe('projectActionCenterRouteCloseout', () => {
  it('accepts a canonical HR closeout with structured reason', () => {
    const closeout = projectActionCenterRouteCloseout({
      route_id: 'route-1',
      closeout_status: 'afgerond',
      closeout_reason: 'voldoende-opgepakt',
      closeout_note: 'Voor nu voldoende belegd in teamritme.',
      closed_at: '2026-05-20T09:00:00.000Z',
      closed_by_role: 'hr',
    })

    expect(closeout.closeoutStatus).toBe('afgerond')
    expect(closeout.closeoutReason).toBe('voldoende-opgepakt')
    expect(closeout.closedByRole).toBe('hr')
  })

  it('rejects closeout rows without a structured reason', () => {
    expect(() =>
      projectActionCenterRouteCloseout({
        route_id: 'route-1',
        closeout_status: 'afgerond',
        closeout_note: 'Alleen notitie',
        closed_at: '2026-05-20T09:00:00.000Z',
        closed_by_role: 'hr',
      }),
    ).toThrow(/closeout_reason/i)
  })
})
```

- [ ] **Step 2: Add failing aggregation tests for `readyForCloseout`**

```ts
import { describe, expect, it } from 'vitest'
import { summarizeActionCenterRouteActions } from '@/lib/action-center-route-contract'

describe('summarizeActionCenterRouteActions', () => {
  it('marks a route ready for closeout when all actions are completed or stopped', () => {
    const summary = summarizeActionCenterRouteActions(
      [
        { actionId: 'a-1', status: 'afgerond', reviewScheduledFor: '2026-05-10' },
        { actionId: 'a-2', status: 'gestopt', reviewScheduledFor: '2026-05-12' },
      ],
      '2026-05-20',
    )

    expect(summary.routeStatus).toBe('in-uitvoering')
    expect(summary.readyForCloseout).toBe(true)
  })

  it('does not mark ready for closeout while any action is still open or in review', () => {
    const summary = summarizeActionCenterRouteActions(
      [
        { actionId: 'a-1', status: 'afgerond', reviewScheduledFor: '2026-05-10' },
        { actionId: 'a-2', status: 'open', reviewScheduledFor: '2026-05-22' },
      ],
      '2026-05-20',
    )

    expect(summary.readyForCloseout).toBe(false)
  })
})
```

- [ ] **Step 3: Add failing route-priority tests**

```ts
import { describe, expect, it } from 'vitest'
import { projectActionCenterRoute } from '@/lib/action-center-route-contract'

describe('projectActionCenterRoute closeout priority', () => {
  it('lets explicit route closeout override action aggregation', () => {
    const route = projectActionCenterRoute(
      makeLiveContext({
        routeActions: [
          { actionId: 'a-1', status: 'open', reviewScheduledFor: '2026-05-25' },
        ],
        routeCloseout: {
          routeId: 'campaign-1::scope-1',
          closeoutStatus: 'afgerond',
          closeoutReason: 'voldoende-opgepakt',
          closeoutNote: 'Bestuurlijk klaar voor nu.',
          closedAt: '2026-05-20T09:00:00.000Z',
          closedByRole: 'hr',
        },
      }),
    )

    expect(route.routeStatus).toBe('afgerond')
  })
})
```

- [ ] **Step 4: Add failing live projection and page-shell tests**

```ts
it('shows a ready-for-closeout hint on open routes whose actions are all completed', () => {
  const items = buildLiveActionCenterItems([
    makeRouteContext({
      routeActions: [
        makeAction({ status: 'afgerond', reviewScheduledFor: '2026-05-10' }),
      ],
    }),
  ])

  expect(items[0]?.coreSemantics.routeCloseout?.readyForCloseout).toBe(true)
})

it('shows explicit closeout metadata in the route shell when present', () => {
  const screen = renderActionCenterRouteShell(
    makePreviewItem({
      coreSemantics: {
        routeCloseout: {
          closeoutStatus: 'gestopt',
          closeoutReason: 'bewust-niet-voortzetten',
          closeoutNote: 'Route bewust beeindigd na lokaal overleg.',
          closedAt: '2026-05-20T09:00:00.000Z',
          closedByRole: 'hr',
          readyForCloseout: false,
        },
      },
    }),
  )

  expect(screen.getByText('Route afgesloten')).toBeVisible()
  expect(screen.getByText('bewust niet voortzetten', { exact: false })).toBeVisible()
})
```

- [ ] **Step 5: Run the focused test set to verify these scenarios fail first**

Run:

```powershell
npx vitest run "lib/action-center-route-closeout.test.ts" "lib/action-center-route-contract.test.ts" "lib/action-center-live.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- missing module failures for `action-center-route-closeout`
- aggregation/projection failures for `readyForCloseout` and closeout override

- [ ] **Step 6: Commit the red contract tests**

```powershell
git add frontend/lib/action-center-route-closeout.test.ts frontend/lib/action-center-route-contract.test.ts frontend/lib/action-center-live.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "test: lock action center route closeout semantics"
```

### Task 2: Implement canonical route-closeout truth and open-route attention derivation

**Files:**
- Create: `frontend/lib/action-center-route-closeout.ts`
- Modify: `frontend/lib/action-center-route-contract.ts`
- Modify: `frontend/lib/action-center-core-semantics.ts`

- [ ] **Step 1: Add the closeout truth module**

```ts
export type ActionCenterRouteCloseoutStatus = 'afgerond' | 'gestopt'

export type ActionCenterRouteCloseoutReason =
  | 'voldoende-opgepakt'
  | 'effect-voldoende-zichtbaar'
  | 'geen-verdere-opvolging-nodig'
  | 'geen-lokale-vervolgstap-nodig'
  | 'bewust-niet-voortzetten'
  | 'elders-opgepakt'

export type ActionCenterRouteCloseoutRole = 'hr' | 'manager'

export interface ActionCenterRouteCloseoutRecord {
  routeId: string
  closeoutStatus: ActionCenterRouteCloseoutStatus
  closeoutReason: ActionCenterRouteCloseoutReason
  closeoutNote: string | null
  closedAt: string
  closedByRole: ActionCenterRouteCloseoutRole
}

export function projectActionCenterRouteCloseout(input: Record<string, unknown>): ActionCenterRouteCloseoutRecord {
  // validate route_id, closeout_status, closeout_reason, closed_at, closed_by_role
  // return normalized record
}
```

- [ ] **Step 2: Extend action aggregation with `readyForCloseout`**

```ts
export function summarizeActionCenterRouteActions(
  actions: Array<{ actionId: string; status: 'open' | 'in_review' | 'afgerond' | 'gestopt'; reviewScheduledFor: string }>,
  today = new Date().toISOString().slice(0, 10),
) {
  const hasReviewable = actions.some(
    (action) => action.status === 'in_review' || (action.status === 'open' && action.reviewScheduledFor <= today),
  )
  const hasRunning = actions.some((action) => action.status === 'open' || action.status === 'in_review')
  const allFinished = actions.length > 0 && actions.every((action) => action.status === 'afgerond' || action.status === 'gestopt')

  return {
    routeStatus: hasReviewable ? 'reviewbaar' : hasRunning ? 'in-uitvoering' : 'in-uitvoering',
    readyForCloseout: allFinished,
    nextReviewScheduledFor: hasRunning
      ? actions
          .filter((action) => action.status === 'open' || action.status === 'in_review')
          .map((action) => action.reviewScheduledFor)
          .sort()[0] ?? null
      : null,
  }
}
```

- [ ] **Step 3: Add route-level closeout projection into core semantics**

```ts
export interface ActionCenterRouteCloseoutProjection {
  closeoutStatus: 'afgerond' | 'gestopt' | null
  closeoutReason: string | null
  closeoutNote: string | null
  closedAt: string | null
  closedByRole: 'hr' | 'manager' | null
  readyForCloseout: boolean
}
```

Wire this into `projectActionCenterCoreSemantics(...)` so the closeout projection exists on every route:
- explicit record populates the closeout fields and forces `readyForCloseout = false`
- no explicit record keeps closeout fields `null` and fills `readyForCloseout` from action aggregation

- [ ] **Step 4: Run the focused tests and make them pass**

Run:

```powershell
npx vitest run "lib/action-center-route-closeout.test.ts" "lib/action-center-route-contract.test.ts" "lib/action-center-live.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- PASS on new closeout and `readyForCloseout` assertions

- [ ] **Step 5: Commit the truth-layer implementation**

```powershell
git add frontend/lib/action-center-route-closeout.ts frontend/lib/action-center-route-contract.ts frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-route-closeout.test.ts frontend/lib/action-center-route-contract.test.ts frontend/lib/action-center-live.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: add action center route closeout semantics"
```

### Task 3: Add storage, API contract, and permissions for HR closeout

**Files:**
- Modify: `supabase/schema.sql`
- Create: `frontend/app/api/action-center-route-closeouts/route.ts`
- Create: `frontend/app/api/action-center-route-closeouts/route.test.ts`
- Modify: `frontend/lib/action-center-live-context.ts`
- Modify: `frontend/app/(dashboard)/action-center/page.tsx`

- [ ] **Step 1: Add the Supabase table and RLS contract**

```sql
create table if not exists public.action_center_route_closeouts (
  id uuid primary key default gen_random_uuid(),
  route_id text not null unique,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  org_id uuid references public.organizations(id) on delete cascade not null,
  route_scope_type text not null check (route_scope_type in ('department', 'item')),
  route_scope_value text not null,
  closeout_status text not null check (closeout_status in ('afgerond', 'gestopt')),
  closeout_reason text not null check (
    closeout_reason in (
      'voldoende-opgepakt',
      'effect-voldoende-zichtbaar',
      'geen-verdere-opvolging-nodig',
      'geen-lokale-vervolgstap-nodig',
      'bewust-niet-voortzetten',
      'elders-opgepakt'
    )
  ),
  closeout_note text,
  closed_at timestamptz not null,
  closed_by_role text not null check (closed_by_role in ('hr', 'manager')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Enable RLS and add policies so:
- Verisight admin can read/write
- HR owner/admin path used by the suite shell can read/write
- managers can read closeout on their own routes but not write it in this phase

- [ ] **Step 2: Implement the closeout API route**

```ts
export async function POST(request: Request) {
  // authenticate
  // validate submitted closeout_status, closeout_reason, closeout_note
  // server-verify campaign/org/scope/route tuple
  // ensure current user has HR/admin write permission for the route
  // upsert action_center_route_closeouts by route_id
}
```

User-entered fields only:
- `closeout_status`
- `closeout_reason`
- `closeout_note`

Server-derived or verified:
- `route_id`
- `campaign_id`
- `org_id`
- `route_scope_type`
- `route_scope_value`
- `closed_at`
- `closed_by_role`

- [ ] **Step 3: Load closeouts into the Action Center page context**

In `frontend/app/(dashboard)/action-center/page.tsx`:
- fetch `action_center_route_closeouts` for visible campaigns
- group them by canonical `routeId`
- pass `routeCloseout` into each `LiveActionCenterCampaignContext`

- [ ] **Step 4: Add failing-then-passing API tests**

```ts
it('rejects route closeout writes without HR/admin permissions', async () => {
  // manager-only context -> 403
})

it('persists a canonical HR closeout with structured reason', async () => {
  // hr/admin context -> 200
  // assert server-derived route identity
})
```

- [ ] **Step 5: Run the API tests and route page tests**

Run:

```powershell
npx vitest run "app/api/action-center-route-closeouts/route.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts" "lib/action-center-live.test.ts"
```

Expected:
- PASS with HR-only write semantics and loaded closeout context

- [ ] **Step 6: Commit the storage + API layer**

```powershell
git add supabase/schema.sql frontend/app/api/action-center-route-closeouts/route.ts frontend/app/api/action-center-route-closeouts/route.test.ts frontend/lib/action-center-live-context.ts frontend/app/(dashboard)/action-center/page.tsx frontend/lib/action-center-live.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: add action center route closeout api"
```

### Task 4: Project closeout and `readyForCloseout` into overview and detail UI

**Files:**
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Create: `frontend/lib/action-center-route-closeout-ui.test.ts`
- Modify: `frontend/lib/action-center-preview-route-fields.test.ts`

- [ ] **Step 1: Add failing UI tests for closeout and ready-for-closeout**

```ts
it('shows a ready-for-closeout hint on an open route whose actions are all finished', () => {
  const item = makePreviewItem({
    coreSemantics: {
      routeCloseout: {
        closeoutStatus: null,
        closeoutReason: null,
        closeoutNote: null,
        closedAt: null,
        closedByRole: null,
        readyForCloseout: true,
      },
    },
  })

  const screen = render(<ActionCenterPreview initialItems={[item]} ... />)
  expect(screen.getByText('Klaar voor closeout')).toBeVisible()
})

it('shows a route closed panel when explicit closeout exists', () => {
  const item = makePreviewItem({
    coreSemantics: {
      routeCloseout: {
        closeoutStatus: 'afgerond',
        closeoutReason: 'voldoende-opgepakt',
        closeoutNote: 'Voor nu bestuurlijk afgesloten.',
        closedAt: '2026-05-20T09:00:00.000Z',
        closedByRole: 'hr',
        readyForCloseout: false,
      },
    },
  })

  const screen = render(<ActionCenterPreview initialItems={[item]} ... />)
  expect(screen.getByText('Route afgesloten')).toBeVisible()
  expect(screen.getByText('voldoende opgepakt', { exact: false })).toBeVisible()
})
```

- [ ] **Step 2: Implement overview-card signaling**

In `action-center-preview.tsx`:
- if explicit closeout exists, render closeout status as the top route reading
- if no closeout but `readyForCloseout === true`, render a lightweight hint such as `Klaar voor closeout`
- do not treat that hint as the main route status pill

- [ ] **Step 3: Implement detail closeout panel**

Add a compact detail block that shows:
- `Route afgesloten`
- closeout status label
- closeout reason label
- optional note
- closed date
- role label

If the route is open but `readyForCloseout === true`, show a lighter prompt such as:
- `Inhoudelijk klaar voor bestuurlijke afsluiting`

- [ ] **Step 4: Keep projection order strict**

Ensure detail/overview use:
1. explicit closeout first
2. open aggregation second
3. `readyForCloseout` only as a hint

No surface may invent its own closeout interpretation.

- [ ] **Step 5: Run the UI-focused tests**

Run:

```powershell
npx vitest run "lib/action-center-route-closeout-ui.test.ts" "lib/action-center-preview-route-fields.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- PASS for explicit closeout rendering and lightweight ready-for-closeout hinting

- [ ] **Step 6: Commit the UI projection layer**

```powershell
git add frontend/components/dashboard/action-center-preview.tsx frontend/lib/action-center-route-closeout-ui.test.ts frontend/lib/action-center-preview-route-fields.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: surface action center route closeout"
```

### Task 5: Add HR closeout browser flow and permissions verification

**Files:**
- Modify: `frontend/tests/e2e/action-center-manager-access.spec.ts`
- Create: `frontend/tests/e2e/action-center-route-closeout.spec.ts`
- Modify: `frontend/scripts/seed-action-center-manager-pilot.mjs`

- [ ] **Step 1: Extend the pilot seed so an HR user and manager route can exercise closeout**

Make sure the seed still creates:
- one HR owner
- at least one manager-assigned department route
- action cards and reviews can exist before closeout

Optionally include one seeded route that is already closeout-ready.

- [ ] **Step 2: Add the HR closeout happy-path browser spec**

```ts
test('hr can explicitly close a route that is ready for closeout', async ({ page }) => {
  await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
  await openFocusedRoute(page, pilot.routeContext.focusItemId)

  await expect(page.getByText('Klaar voor closeout')).toBeVisible()
  await page.getByRole('button', { name: 'Route afsluiten', exact: true }).click()
  await page.getByLabel('Afsluitstatus').selectOption('afgerond')
  await page.getByLabel('Afsluitreden').selectOption('voldoende-opgepakt')
  await page.getByLabel('Toelichting').fill('Voor nu voldoende opgepakt in teamritme.')
  await page.getByRole('button', { name: 'Closeout opslaan', exact: true }).click()

  await expect(page.getByText('Route afgesloten')).toBeVisible()
  await expect(page.getByText('Voor nu voldoende opgepakt in teamritme.')).toBeVisible()
})
```

- [ ] **Step 3: Extend manager-access verification**

Add assertions that:
- managers can see closeout state on their own routes
- managers cannot write route-closeout in this phase
- insights/report denial still stays intact

- [ ] **Step 4: Run seed + browser verification**

Run:

```powershell
node ./scripts/seed-action-center-manager-pilot.mjs
$env:PLAYWRIGHT_PORT='3012'
npx playwright test tests/e2e/action-center-manager-access.spec.ts tests/e2e/action-center-route-closeout.spec.ts --project=chromium --workers=1
```

Expected:
- HR can close a route
- manager can read but not write closeout
- closeout survives reload and remains aligned in the route shell

- [ ] **Step 5: Commit the browser coverage**

```powershell
git add frontend/tests/e2e/action-center-manager-access.spec.ts frontend/tests/e2e/action-center-route-closeout.spec.ts frontend/scripts/seed-action-center-manager-pilot.mjs
git commit -m "test: verify action center route closeout in browser"
```

### Task 6: Full regression pass and PR readiness

**Files:**
- Modify only if verification exposes regressions

- [ ] **Step 1: Run the relevant unit/integration suite**

Run:

```powershell
npx vitest run "lib/action-center-route-closeout.test.ts" "lib/action-center-route-contract.test.ts" "lib/action-center-live.test.ts" "lib/action-center-core-semantics.test.ts" "lib/action-center-route-actions.test.ts" "lib/action-center-action-reviews.test.ts" "app/api/action-center-route-closeouts/route.test.ts" "app/api/action-center-route-actions/route.test.ts" "app/api/action-center-action-reviews/route.test.ts" "lib/action-center-preview-route-fields.test.ts" "lib/action-center-route-closeout-ui.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- all targeted route/action/review/closeout tests pass

- [ ] **Step 2: Run lint on touched files**

Run:

```powershell
npx eslint "app/api/action-center-route-closeouts/route.ts" "app/(dashboard)/action-center/page.tsx" "components/dashboard/action-center-preview.tsx" "lib/action-center-route-closeout.ts" "lib/action-center-route-contract.ts" "lib/action-center-core-semantics.ts" "tests/e2e/action-center-manager-access.spec.ts" "tests/e2e/action-center-route-closeout.spec.ts"
```

Expected:
- no lint errors

- [ ] **Step 3: Run the production build**

Run:

```powershell
npm run build
```

Expected:
- successful Next.js production build

- [ ] **Step 4: Run the browser verification one final time**

Run:

```powershell
node ./scripts/seed-action-center-manager-pilot.mjs
$env:PLAYWRIGHT_PORT='3012'
npx playwright test tests/e2e/action-center-manager-access.spec.ts tests/e2e/action-center-route-closeout.spec.ts --project=chromium --workers=1
```

Expected:
- all HR/manager closeout flows pass after a fresh seed

- [ ] **Step 5: Commit final verification fixes if needed**

```powershell
git add -A
git commit -m "chore: finalize action center route closeout"
```

