# Action Center Follow-Up Route Trigger V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small HR-only `Start vervolgroute` trigger on closed Action Center routes that creates one new follow-up route with the same scope, a newly chosen manager, and a canonical `triggerReason`.

**Architecture:** Build on the existing closeout, reopen, and follow-up relation layers instead of introducing a new workflow system. Extend the existing follow-up relation truth with a required `triggerReason`, enforce a single active direct successor per closed source route in the write-path, and expose a minimal HR UI that only asks for the next manager and reason before creating the new route handoff.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright, Supabase Postgres schema/RLS, existing Action Center preview/detail projection, existing manager response and workspace membership truth.

---

### Task 1: Lock V1 follow-up-trigger semantics in tests

**Files:**
- Modify: `frontend/lib/action-center-route-reopen.test.ts`
- Modify: `frontend/app/api/action-center-route-follow-ups/route.test.ts`
- Modify: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
- Create: `frontend/lib/action-center-follow-up-route-trigger.test.ts`

- [ ] **Step 1: Write the failing truth test for required trigger reasons**

Add a new failing test in `frontend/lib/action-center-route-reopen.test.ts`:

```ts
it('requires a triggerReason on follow-up relations', () => {
  expect(() =>
    projectActionCenterRouteFollowUpRelation({
      route_relation_type: 'follow-up-from',
      source_route_id: 'campaign-1::org-1::department::sales',
      target_route_id: 'campaign-1::org-1::department::finance',
      recorded_at: '2026-05-01T10:00:00.000Z',
      recorded_by_role: 'hr',
    }),
  ).toThrow(/trigger_reason/i)
})
```

- [ ] **Step 2: Run the truth test to verify it fails**

Run:

```bash
npx vitest run lib/action-center-route-reopen.test.ts
```

Expected:
- FAIL with a missing `trigger_reason` assertion or parser failure.

- [ ] **Step 3: Write the failing API tests for V1 constraints**

Extend `frontend/app/api/action-center-route-follow-ups/route.test.ts` with failing tests for:
- missing `trigger_reason` returns `400`
- second active direct follow-up from the same closed source returns `409`
- non-closed source route returns `409`

Use tests like:

```ts
it('rejects follow-up creation without a trigger reason', async () => {
  const response = await POST(
    makeRequest({
      source_campaign_id: 'campaign-1',
      source_route_scope_value: 'org-1::department::sales',
      target_campaign_id: 'campaign-1',
      target_route_scope_value: 'org-1::department::sales',
    }),
  )

  expect(response.status).toBe(400)
})
```

```ts
it('rejects a second active direct follow-up for the same closed source route', async () => {
  // mock an existing active follow-up relation row for the same source route
  expect(response.status).toBe(409)
})
```

```ts
it('rejects follow-up creation when the source route is not closed', async () => {
  // mock source route with no active closeout
  expect(response.status).toBe(409)
})
```

- [ ] **Step 4: Run the API test file to verify the new tests fail**

Run:

```bash
npx vitest run app/api/action-center-route-follow-ups/route.test.ts
```

Expected:
- FAIL on the new `trigger_reason`, single-successor, and closed-source assertions.

- [ ] **Step 5: Write the failing shell/UI test for the new HR trigger fields**

In `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`, add a failing test that expects:
- a closed route can render `Start vervolgroute`
- the HR flow now includes manager choice and a `triggerReason` choice

Example expectation block:

```ts
expect(markup).toContain('Start vervolgroute')
expect(markup).toContain('Kies manager')
expect(markup).toContain('Kies aanleiding')
```

- [ ] **Step 6: Run the shell test to verify it fails**

Run:

```bash
npx vitest run "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- FAIL because the trigger fields are not yet rendered.

---

### Task 2: Extend canonical follow-up truth with `triggerReason`

**Files:**
- Modify: `frontend/lib/action-center-route-reopen.ts`
- Modify: `frontend/lib/action-center-route-reopen.test.ts`
- Create: `frontend/lib/action-center-follow-up-route-trigger.test.ts`

- [ ] **Step 1: Add the canonical trigger reason type and parser**

In `frontend/lib/action-center-route-reopen.ts`, add:

```ts
export type ActionCenterRouteFollowUpTriggerReason =
  | 'nieuw-campaign-signaal'
  | 'nieuw-segment-signaal'
  | 'hernieuwde-hr-beoordeling'
```

And extend `ActionCenterRouteFollowUpRelationRecord`:

```ts
export interface ActionCenterRouteFollowUpRelationRecord {
  routeRelationType: ActionCenterRouteRelationType
  sourceRouteId: string
  targetRouteId: string
  recordedAt: string
  recordedByRole: ActionCenterRouteReopenRole
  triggerReason: ActionCenterRouteFollowUpTriggerReason
}
```

- [ ] **Step 2: Update the projector to require `trigger_reason`**

Update `projectActionCenterRouteFollowUpRelation(...)` so it accepts both DB and camelCase input:

```ts
const triggerReason = normalizeText(
  typeof input?.trigger_reason === 'string'
    ? input.trigger_reason
    : typeof input?.triggerReason === 'string'
      ? input.triggerReason
      : null,
) as ActionCenterRouteFollowUpTriggerReason | null

if (!triggerReason || !FOLLOW_UP_TRIGGER_REASONS.has(triggerReason)) {
  throw new Error('Ongeldige action center route relation input: trigger_reason is verplicht.')
}
```

- [ ] **Step 3: Add a small label helper for trigger reasons**

Still in `frontend/lib/action-center-route-reopen.ts`, add:

```ts
export function getActionCenterFollowUpTriggerReasonLabel(
  reason: ActionCenterRouteFollowUpTriggerReason,
) {
  switch (reason) {
    case 'nieuw-campaign-signaal':
      return 'Nieuw campaign-signaal'
    case 'nieuw-segment-signaal':
      return 'Nieuw segmentsignaal'
    case 'hernieuwde-hr-beoordeling':
    default:
      return 'Hernieuwde HR-beoordeling'
  }
}
```

- [ ] **Step 4: Add a dedicated truth helper test for V1 trigger semantics**

Create `frontend/lib/action-center-follow-up-route-trigger.test.ts` with tests like:

```ts
import { describe, expect, it } from 'vitest'
import {
  getActionCenterFollowUpTriggerReasonLabel,
  projectActionCenterRouteFollowUpRelation,
} from './action-center-route-reopen'

describe('action center follow-up route trigger truth', () => {
  it('accepts a canonical trigger reason', () => {
    const relation = projectActionCenterRouteFollowUpRelation({
      route_relation_type: 'follow-up-from',
      source_route_id: 'campaign-1::org-1::department::sales',
      target_route_id: 'campaign-1::org-1::department::finance',
      recorded_at: '2026-05-01T10:00:00.000Z',
      recorded_by_role: 'hr',
      trigger_reason: 'nieuw-campaign-signaal',
    })

    expect(relation.triggerReason).toBe('nieuw-campaign-signaal')
    expect(getActionCenterFollowUpTriggerReasonLabel(relation.triggerReason)).toBe('Nieuw campaign-signaal')
  })
})
```

- [ ] **Step 5: Run the truth tests to verify they pass**

Run:

```bash
npx vitest run lib/action-center-route-reopen.test.ts lib/action-center-follow-up-route-trigger.test.ts
```

Expected:
- PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/action-center-route-reopen.ts frontend/lib/action-center-route-reopen.test.ts frontend/lib/action-center-follow-up-route-trigger.test.ts
git commit -m "feat: add canonical follow-up trigger reasons"
```

---

### Task 3: Add the persistence and write-path guardrails

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `frontend/lib/action-center-route-relations-policy.test.ts`
- Modify: `frontend/app/api/action-center-route-follow-ups/route.ts`
- Modify: `frontend/app/api/action-center-route-follow-ups/route.test.ts`

- [ ] **Step 1: Add `trigger_reason` to the relation table**

In `supabase/schema.sql`, extend `action_center_route_relations`:

```sql
trigger_reason text not null
  check (
    trigger_reason in (
      'nieuw-campaign-signaal',
      'nieuw-segment-signaal',
      'hernieuwde-hr-beoordeling'
    )
  ),
```

Place it near:

```sql
route_relation_type text not null check (route_relation_type in ('follow-up-from')),
source_route_id text not null,
target_route_id text not null,
recorded_at timestamptz not null,
recorded_by_role text not null check (recorded_by_role in ('hr', 'manager')),
```

- [ ] **Step 2: Update the schema policy test to assert the new column is present**

In `frontend/lib/action-center-route-relations-policy.test.ts`, add:

```ts
expect(schema).toContain('trigger_reason text not null')
expect(schema).toContain("'nieuw-campaign-signaal'")
expect(schema).toContain("'nieuw-segment-signaal'")
expect(schema).toContain("'hernieuwde-hr-beoordeling'")
```

- [ ] **Step 3: Introduce a small write input parser for the new trigger**

In `frontend/app/api/action-center-route-follow-ups/route.ts`, extend the request body:

```ts
type FollowUpRequestBody = {
  source_campaign_id?: string
  source_route_scope_value?: string
  target_campaign_id?: string
  target_route_scope_value?: string
  trigger_reason?: string
  manager_user_id?: string
}
```

Update parsing:

```ts
const triggerReason = normalizeText(input?.trigger_reason)
const managerUserId = normalizeText(input?.manager_user_id)

if (!sourceCampaignId || !sourceRouteScopeValue || !targetCampaignId || !targetRouteScopeValue || !triggerReason || !managerUserId) {
  throw new Error('Ongeldige follow-up input.')
}
```

- [ ] **Step 4: Add server-side closed-source and single-successor validation**

In the same API file, add helper loaders that:
- load the source route closeout
- load the latest follow-up relation for that source route
- confirm there is no active direct successor already

Use patterns like:

```ts
const { data: sourceCloseout } = await adminClient
  .from('action_center_route_closeouts')
  .select('*')
  .eq('route_id', sourceIdentity.route_id)
  .maybeSingle()

if (!sourceCloseout?.route_id) {
  return NextResponse.json({ detail: 'Alleen gesloten routes kunnen een vervolgroute starten.' }, { status: 409 })
}
```

And:

```ts
const { data: existingFollowUps } = await adminClient
  .from('action_center_route_relations')
  .select('*')
  .eq('route_relation_type', 'follow-up-from')
  .eq('source_route_id', sourceIdentity.route_id)

if ((existingFollowUps ?? []).length > 0) {
  return NextResponse.json({ detail: 'Deze route heeft al een actieve directe vervolgroute.' }, { status: 409 })
}
```

- [ ] **Step 5: Persist the canonical trigger reason**

Update the `upsert(...)` payload:

```ts
{
  campaign_id: targetCampaign.id,
  org_id: targetCampaign.organization_id,
  route_relation_type: relation.routeRelationType,
  source_route_id: relation.sourceRouteId,
  target_route_id: relation.targetRouteId,
  recorded_at: relation.recordedAt,
  recorded_by_role: relation.recordedByRole,
  trigger_reason: relation.triggerReason,
  created_by: user.id,
  updated_by: user.id,
  updated_at: relation.recordedAt,
}
```

- [ ] **Step 6: Run the API and policy tests**

Run:

```bash
npx vitest run app/api/action-center-route-follow-ups/route.test.ts lib/action-center-route-relations-policy.test.ts
```

Expected:
- PASS

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql frontend/lib/action-center-route-relations-policy.test.ts frontend/app/api/action-center-route-follow-ups/route.ts frontend/app/api/action-center-route-follow-ups/route.test.ts
git commit -m "feat: enforce follow-up trigger write constraints"
```

---

### Task 4: Create the new route carrier for the follow-up handoff

**Files:**
- Modify: `frontend/app/api/action-center-route-follow-ups/route.ts`
- Modify: `frontend/app/api/action-center-route-follow-ups/route.test.ts`
- Modify: `frontend/lib/action-center-manager-responses.ts`
- Modify: `frontend/lib/action-center-live-context.ts`

- [ ] **Step 1: Decide on the minimal carrier created by the trigger**

Use the existing manager-response layer as the lightweight route handoff carrier instead of inventing a new route table in V1.

The follow-up trigger should create:
- a new `action_center_manager_responses` row
- for the target campaign + same scope
- with the chosen manager
- and with a bounded handoff response type like `schedule`

Document this in the API with a short comment:

```ts
// V1 follow-up routes are opened through the existing manager-response carrier.
// HR does not create an action here; it only creates a new manager handoff route.
```

- [ ] **Step 2: Add a helper to build the handoff response**

In `frontend/app/api/action-center-route-follow-ups/route.ts`, add:

```ts
function buildFollowUpManagerResponse(args: {
  campaignId: string
  orgId: string
  routeScopeType: 'department' | 'item'
  routeScopeValue: string
  managerUserId: string
}) {
  return {
    campaign_id: args.campaignId,
    org_id: args.orgId,
    route_scope_type: args.routeScopeType,
    route_scope_value: args.routeScopeValue,
    manager_user_id: args.managerUserId,
    response_type: 'schedule',
    response_note: 'Vervolgroute geopend door HR.',
    review_scheduled_for: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    primary_action_theme_key: null,
    primary_action_text: null,
    primary_action_expected_effect: null,
    primary_action_status: null,
  }
}
```

- [ ] **Step 3: Create or upsert the new route carrier before writing the relation**

Still in the API, insert into `action_center_manager_responses`:

```ts
const { data: managerResponse, error: managerResponseError } = await adminClient
  .from('action_center_manager_responses')
  .upsert(buildFollowUpManagerResponse({...}), {
    onConflict: 'campaign_id,route_scope_type,route_scope_value',
  })
  .select('*')
  .single()

if (managerResponseError || !managerResponse) {
  return NextResponse.json({ detail: managerResponseError?.message ?? 'Vervolgroute openen mislukt.' }, { status: 500 })
}
```

- [ ] **Step 4: Update the tests so the API now expects carrier creation**

In `frontend/app/api/action-center-route-follow-ups/route.test.ts`, extend the admin mock to handle:
- `action_center_manager_responses`
- `action_center_route_relations`

Assert both writes happen:

```ts
expect(managerResponseUpsert.upsert).toHaveBeenCalled()
expect(relationUpsert.upsert).toHaveBeenCalledWith(
  expect.objectContaining({
    trigger_reason: 'nieuw-campaign-signaal',
  }),
  { onConflict: 'source_route_id,target_route_id,route_relation_type' },
)
```

- [ ] **Step 5: Run the API tests**

Run:

```bash
npx vitest run app/api/action-center-route-follow-ups/route.test.ts
```

Expected:
- PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/app/api/action-center-route-follow-ups/route.ts frontend/app/api/action-center-route-follow-ups/route.test.ts frontend/lib/action-center-live-context.ts frontend/lib/action-center-manager-responses.ts
git commit -m "feat: create follow-up route carrier from hr trigger"
```

---

### Task 5: Surface the trigger in the Action Center UI

**Files:**
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Add the new follow-up endpoint prop and HR-only trigger state**

In `frontend/app/(dashboard)/action-center/page.tsx`, pass the endpoint:

```tsx
routeFollowUpEndpoint="/api/action-center-route-follow-ups"
```

In `frontend/components/dashboard/action-center-preview.tsx`, add local state:

```ts
const [followUpManagerUserId, setFollowUpManagerUserId] = useState('')
const [followUpTriggerReason, setFollowUpTriggerReason] = useState<ActionCenterRouteFollowUpTriggerReason>('nieuw-campaign-signaal')
const [followUpPending, setFollowUpPending] = useState(false)
```

- [ ] **Step 2: Render the minimal HR trigger only on closed routes**

Still in the preview component, render only when:
- current user is HR/Verisight
- selected route is closed
- no direct active follow-up target exists

Render:

```tsx
<button type="button">Start vervolgroute</button>
<label>Kies manager</label>
<select>{/* manager options */}</select>
<label>Kies aanleiding</label>
<select>
  <option value="nieuw-campaign-signaal">Nieuw campaign-signaal</option>
  <option value="nieuw-segment-signaal">Nieuw segmentsignaal</option>
  <option value="hernieuwde-hr-beoordeling">Hernieuwde HR-beoordeling</option>
</select>
```

- [ ] **Step 3: Post the minimal payload to the new API**

Add a handler:

```ts
async function handleFollowUpCreate() {
  if (!selectedItem || !routeFollowUpEndpoint) return

  setFollowUpPending(true)
  try {
    const response = await fetch(routeFollowUpEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_campaign_id: selectedItem.campaignId,
        source_route_scope_value: selectedItem.coreSemantics.route.scopeValue,
        target_campaign_id: selectedItem.campaignId,
        target_route_scope_value: selectedItem.coreSemantics.route.scopeValue,
        manager_user_id: followUpManagerUserId,
        trigger_reason: followUpTriggerReason,
      }),
    })

    if (!response.ok) throw new Error('Vervolgroute openen mislukt.')
  } finally {
    setFollowUpPending(false)
  }
}
```

- [ ] **Step 4: Update the shell test to assert manager and reason inputs**

In `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`, verify the markup contains:

```ts
expect(markup).toContain('Start vervolgroute')
expect(markup).toContain('Kies manager')
expect(markup).toContain('Kies aanleiding')
expect(markup).toContain('Nieuw campaign-signaal')
```

- [ ] **Step 5: Run the shell and component tests**

Run:

```bash
npx vitest run "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.tsx frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: add hr follow-up route trigger ui"
```

---

### Task 6: Project the new route and lineage back into overview/detail

**Files:**
- Modify: `frontend/lib/action-center-core-semantics.ts`
- Modify: `frontend/lib/action-center-live.ts`
- Modify: `frontend/lib/action-center-route-contract.ts`
- Modify: `frontend/lib/action-center-live.test.ts`

- [ ] **Step 1: Keep the old route historical and the new route open**

In `frontend/lib/action-center-live.ts` and `frontend/lib/action-center-route-contract.ts`, preserve:
- source route stays closed
- new route reads as a normal open route
- new route gets lineage label `Vervolg op eerdere route`

Do not introduce a new special live status.

- [ ] **Step 2: Add a small semantics projection for follow-up successor state**

In `frontend/lib/action-center-core-semantics.ts`, add lightweight fields like:

```ts
followUpSemantics: {
  triggerReasonLabel: string | null
  isDirectSuccessor: boolean
}
```

Populate them from the relation truth.

- [ ] **Step 3: Extend live tests for the new trigger reason projection**

In `frontend/lib/action-center-live.test.ts`, add expectations like:

```ts
expect(followUpItem.coreSemantics.lineageSemantics.label).toBe('Vervolg op eerdere route')
expect(followUpItem.coreSemantics.followUpSemantics.triggerReasonLabel).toBe('Nieuw campaign-signaal')
```

- [ ] **Step 4: Run the live semantics tests**

Run:

```bash
npx vitest run lib/action-center-live.test.ts lib/action-center-route-reopen.test.ts
```

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-live.ts frontend/lib/action-center-route-contract.ts frontend/lib/action-center-live.test.ts
git commit -m "feat: project follow-up trigger lineage semantics"
```

---

### Task 7: Seed and browser verification

**Files:**
- Modify: `frontend/scripts/seed-action-center-manager-pilot.mjs`
- Modify: `frontend/tests/e2e/action-center-route-reopen.spec.ts`
- Modify: `frontend/tests/e2e/action-center-manager-access.spec.ts`

- [ ] **Step 1: Seed a closed route with no direct successor yet**

Update the seed so there is one stable closed route eligible for:
- `Start vervolgroute`
- manager selection
- trigger reason selection

Keep the artifact shape explicit:

```js
followUpTriggerContext: {
  sourceFocusItemId: closeoutRouteId,
  targetScopeValue: closeoutRouteScopeValue,
}
```

- [ ] **Step 2: Add a browser test for HR follow-up creation**

In `frontend/tests/e2e/action-center-route-reopen.spec.ts`, add a new scenario:

```ts
test('hr can start a vervolgroute from a closed route with manager and trigger reason', async ({ page }) => {
  await login(page, pilot.hrOwner.email, pilot.hrOwner.password)
  await openFocusedRoute(page, pilot.closeoutRouteContext.focusItemId)
  await page.getByRole('button', { name: 'Start vervolgroute' }).click()
  await page.getByLabel('Kies manager').selectOption({ label: 'Manager Operations' })
  await page.getByLabel('Kies aanleiding').selectOption('nieuw-campaign-signaal')
  await page.getByRole('button', { name: 'Bevestig vervolgroute' }).click()

  await expect(page.getByText('Vervolgroute aangemaakt')).toBeVisible()
  await expect(page.getByText('Vervolg op eerdere route')).toBeVisible()
})
```

- [ ] **Step 3: Assert the source route stays closed**

Still in the e2e test, re-open the original closed route and assert:

```ts
await expect(page.getByText('Route afgesloten', { exact: true })).toBeVisible()
await expect(page.getByText('Later opgevolgd')).toBeVisible()
```

- [ ] **Step 4: Run the seed and browser suite**

Run:

```bash
node ./scripts/seed-action-center-manager-pilot.mjs
PLAYWRIGHT_PORT=3020 npx playwright test tests/e2e/action-center-route-reopen.spec.ts tests/e2e/action-center-manager-access.spec.ts --project=chromium --workers=1
```

Expected:
- seed succeeds
- Playwright passes

- [ ] **Step 5: Commit**

```bash
git add frontend/scripts/seed-action-center-manager-pilot.mjs frontend/tests/e2e/action-center-route-reopen.spec.ts frontend/tests/e2e/action-center-manager-access.spec.ts
git commit -m "test: verify hr follow-up route trigger flow"
```

---

### Task 8: Final verification and PR prep

**Files:**
- Update PR notes after implementation

- [ ] **Step 1: Run the targeted unit and API suite**

Run:

```bash
npx vitest run lib/action-center-route-reopen.test.ts lib/action-center-follow-up-route-trigger.test.ts lib/action-center-route-relations-policy.test.ts lib/action-center-live.test.ts "app/(dashboard)/action-center/page.route-shell.test.ts" app/api/action-center-route-follow-ups/route.test.ts
```

Expected:
- PASS

- [ ] **Step 2: Run lint on touched files**

Run:

```bash
.\node_modules\.bin\eslint.cmd "lib/action-center-route-reopen.ts" "lib/action-center-follow-up-route-trigger.test.ts" "lib/action-center-route-relations-policy.test.ts" "lib/action-center-core-semantics.ts" "lib/action-center-live.ts" "lib/action-center-route-contract.ts" "app/api/action-center-route-follow-ups/route.ts" "app/api/action-center-route-follow-ups/route.test.ts" "components/dashboard/action-center-preview.tsx" "app/(dashboard)/action-center/page.tsx" "app/(dashboard)/action-center/page.route-shell.test.ts" "scripts/seed-action-center-manager-pilot.mjs" "tests/e2e/action-center-route-reopen.spec.ts"
```

Expected:
- no lint errors

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected:
- successful Next.js build

- [ ] **Step 4: Prepare the PR summary**

Call out:
- HR-only `Start vervolgroute` on closed routes
- required canonical `triggerReason`
- single active direct successor rule
- same-scope new route handoff with newly chosen manager
- source route remains closed and historical

- [ ] **Step 5: Final commit if needed**

```bash
git status --short
```

Expected:
- clean working tree before push / PR

---

## Self-Review

**Spec coverage:** The plan covers the new canonical trigger reason, the same-scope same-campaign follow-up carrier, the small HR UI trigger, the single-successor rule, the route lineage projection, and the browser-backed HR flow. It intentionally does not add free-form context fields, scope changes, or manager-authored action creation at trigger time.

**Placeholder scan:** No `TODO`, `TBD`, or “appropriate handling” placeholders remain. Validation and tests are spelled out concretely.

**Type consistency:** The plan consistently uses `triggerReason`, `follow-up-from`, `manager_user_id`, and the existing route scope value model across truth, API, UI, and tests.
