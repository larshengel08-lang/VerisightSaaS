# Action Center HR Oversight / Stale-Route Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded HR oversight layer to the existing Action Center reviewmomenten flow so HR can see which enabled follow-through routes are upcoming, overdue, stale, or escalation-sensitive, without introducing a generic operations cockpit or new Action Center layer.

**Architecture:** Reuse the existing Action Center route defaults, review rhythm config, follow-through mail truth, and reviewmomenten page shell. Compute oversight state server-side from canonical route, schedule, and rhythm data; expose one bounded HR-facing summary/overview block; and keep review actions, assignment changes, and route-family broadening out of scope.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, existing Action Center page-data + review rhythm loaders, existing route defaults contract, existing reviewmomenten page shell, Supabase-backed Action Center truth.

---

## Scope Check

This child plan assumes the live baselines from the following merged work are already present in the current worktree:

- contextual entry / deeplink foundation
- HR Rhythm Console
- Triggered Follow-Through Mail Layer
- Review Reschedule Flows
- Native Outlook / Graph integration
- Route Defaults and bounded suite parity
- parity follow-up hotfix for persistence guards

Verify before implementation starts:

- `git merge-base --is-ancestor b8e2bb9c08de680a3846801db0453a2b2dc93f66 HEAD`

If this check fails, sync the worktree from `main` before implementing this child plan.

In scope here:

- one bounded HR oversight summary for enabled Action Center route families
- explicit classification of visible routes into:
  - `upcoming`
  - `overdue`
  - `stale`
  - `escalation-sensitive`
  - `resolved`
- server-derived stale-route detection from canonical review date + rhythm config
- server-derived escalation-sensitive detection from overdue age + rhythm config
- a compact HR-facing overview block inside the existing reviewmomenten route
- guardrails that keep blocked families out of oversight counts and lists

Explicitly out of scope here:

- new outbound mail trigger families
- changing reminder cadence or reminder delivery semantics
- manager assignment or reassignment execution
- review reschedule mutation changes
- closeout/reopen redesign
- new Action Center pages, tabs, or query views
- route-family expansion beyond currently enabled families
- buyer-facing packaging or commercialization work

## Product Rules To Preserve

- Action Center remains canonical truth; oversight state is derived, not hand-entered.
- HR oversight stays inside the existing reviewmomenten surface and must not create another workbench layer.
- Enabled route families remain bounded to the shared route-defaults contract.
- Blocked families (`pulse`, `onboarding`, `leadership`, `team`) stay fail-closed in overview state.
- Escalation-sensitive is a read/governance signal only in this slice; it must not auto-trigger new behavior by itself.
- This slice may expose “what needs HR attention now,” but it must not turn reviewmomenten into a generic planning or task-management board.

## Oversight Contract

This slice should introduce one shared oversight model derived from existing truth:

| Oversight state | Meaning |
| --- | --- |
| `upcoming` | review is scheduled in the future and still within bounded cadence health |
| `overdue` | review date is in the past but not yet stale and not yet escalation-sensitive |
| `stale` | review date is missing, invalid, or overdue beyond the configured cadence window |
| `escalation-sensitive` | review is overdue and has crossed the configured escalation threshold while route is still unresolved |
| `resolved` | route is effectively no longer active for HR follow-through pressure |

Additional rules:

- `resolved` should include closed routes and routes whose follow-through has already resolved through closeout/successor semantics.
- `stale` must be derived from canonical route + rhythm state, not from mail-send history.
- `escalation-sensitive` must be impossible for resolved routes.
- one route may only contribute to one oversight state at a time.

## File Structure

| File | Responsibility |
| --- | --- |
| `frontend/lib/action-center-review-oversight.ts` | Shared oversight types, classification helpers, and bounded summary derivation |
| `frontend/lib/action-center-review-oversight.test.ts` | Unit tests for state classification, stale detection, escalation-sensitive detection, and blocked-family guarding |
| `frontend/lib/action-center-review-rhythm-data.ts` | Extend the existing loader with oversight summary/list payloads derived from canonical route truth |
| `frontend/lib/action-center-review-rhythm-data.test.ts` | Loader tests for oversight grouping, enabled-family-only behavior, and permission-safe visibility |
| `frontend/components/dashboard/review-rhythm-oversight.tsx` | Compact HR oversight summary/list component inside reviewmomenten |
| `frontend/components/dashboard/review-rhythm-oversight.test.tsx` | Render/source-contract tests for bounded overview copy and no extra layer creation |
| `frontend/components/dashboard/review-moment-page-client.tsx` | Thread the new oversight block into the existing reviewmomenten client surface |
| `frontend/components/dashboard/review-moment-page-client.test.ts` | Source-contract updates for bounded oversight placement |
| `frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx` | Server shell wiring for oversight payload into the existing reviewmomenten route |
| `frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts` | Source-contract test for oversight wiring inside the existing route |

Do **not** touch:

- `frontend/app/api/action-center-follow-through-mails/route.ts`
- `frontend/app/api/action-center-review-reschedules/route.ts`
- `frontend/app/api/action-center-review-rhythm/route.ts`
- `frontend/lib/action-center-route-defaults.ts` except for type-safe reuse
- Outlook / Graph sync helpers
- unrelated Action Center overview, action, or manager pages

---

### Task 1: Add the Shared Review Oversight Contract

**Files:**
- Create: `frontend/lib/action-center-review-oversight.ts`
- Create: `frontend/lib/action-center-review-oversight.test.ts`

- [ ] **Step 1: Write the failing contract tests**

Test requirements:

- classify an enabled route as `upcoming` when the review is scheduled in the future
- classify an enabled route as `overdue` when the review is in the past but still inside cadence health
- classify an enabled route as `stale` when:
  - review date is missing
  - review date is invalid
  - overdue age is greater than cadence window
- classify an enabled route as `escalation-sensitive` when overdue age crosses escalation threshold and the route is unresolved
- never classify blocked route families into oversight output
- never classify resolved routes as `overdue`, `stale`, or `escalation-sensitive`

- [ ] **Step 2: Run the contract tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-review-oversight.test.ts"
```

Expected: FAIL because the shared oversight helper does not exist yet.

- [ ] **Step 3: Add the shared oversight helper**

Implementation requirements:

- define a bounded oversight state union
- expose one classification helper that takes:
  - route scan type
  - route status
  - review date
  - review completed date
  - review outcome
  - follow-up target presence
  - rhythm config
  - current time
- expose one summary helper that turns visible route items into count buckets
- use existing route-default and rhythm helpers rather than re-encoding cadence math ad hoc

- [ ] **Step 4: Re-run the oversight contract tests**

Run:

```bash
npx vitest run "lib/action-center-review-oversight.test.ts"
```

Expected: PASS.

### Task 2: Thread Oversight State Through the Existing Review Rhythm Loader

**Files:**
- Modify: `frontend/lib/action-center-review-rhythm-data.ts`
- Modify: `frontend/lib/action-center-review-rhythm-data.test.ts`
- Import: `frontend/lib/action-center-review-oversight.ts`

- [ ] **Step 1: Extend the failing loader tests first**

Test requirements:

- the loader returns an oversight summary for visible enabled routes only
- blocked families do not appear in oversight counts
- visible enabled routes can appear in stale/escalation-sensitive groupings
- overview remains permission-safe and scoped to what the user can already see in reviewmomenten

- [ ] **Step 2: Run the loader tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm-data.test.ts"
```

Expected: FAIL because the oversight payload is not returned yet.

- [ ] **Step 3: Extend the loader**

Implementation requirements:

- derive oversight summary and optional spotlight lists from already-visible reviewmomenten items
- keep route-family eligibility strictly bound to shared route defaults
- do not add any new write behavior
- keep returned payload compact; prefer counts + a small spotlight list rather than a second giant page dataset

- [ ] **Step 4: Re-run the loader tests**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm-data.test.ts" "lib/action-center-review-oversight.test.ts"
```

Expected: PASS.

### Task 3: Add the Bounded HR Oversight Block to Reviewmomenten

**Files:**
- Create: `frontend/components/dashboard/review-rhythm-oversight.tsx`
- Create: `frontend/components/dashboard/review-rhythm-oversight.test.tsx`
- Modify: `frontend/components/dashboard/review-moment-page-client.tsx`
- Modify: `frontend/components/dashboard/review-moment-page-client.test.ts`
- Modify: `frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx`
- Modify: `frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts`

- [ ] **Step 1: Add failing source/render tests first**

Test requirements:

- oversight stays inside the existing reviewmomenten route
- visible copy stays bounded to rhythm/governance language
- forbidden copy stays out:
  - `automation builder`
  - `workflow`
  - `project planning`
  - `task board`
  - `new tool`
- the page threads the oversight payload from the server shell into the client surface

- [ ] **Step 2: Run the page/component tests and verify they fail**

Run:

```bash
npx vitest run "components/dashboard/review-rhythm-oversight.test.tsx" "components/dashboard/review-moment-page-client.test.ts" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts"
```

Expected: FAIL because the component and wiring do not exist yet.

- [ ] **Step 3: Implement the bounded oversight UI**

Implementation requirements:

- render one compact summary block for:
  - overdue
  - stale
  - escalation-sensitive
  - upcoming
- optionally render a short “needs HR attention now” list using already-visible routes only
- preserve the current reviewmomenten information hierarchy
- avoid adding new filters, tabs, or global navigation
- keep the UI useful on desktop and mobile

- [ ] **Step 4: Re-run the page/component tests**

Run:

```bash
npx vitest run "components/dashboard/review-rhythm-oversight.test.tsx" "components/dashboard/review-moment-page-client.test.ts" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts"
```

Expected: PASS.

### Task 4: Run the Bounded Verification Suite

**Files:**
- No new files

- [ ] Run the bounded reviewmomenten / oversight verification suite:

```bash
npx vitest run "lib/action-center-review-oversight.test.ts" "lib/action-center-review-rhythm-data.test.ts" "components/dashboard/review-rhythm-oversight.test.tsx" "components/dashboard/review-moment-page-client.test.ts" "components/dashboard/review-rhythm-console.test.tsx" "app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts"
```

Expected: PASS.

- [ ] Run the adjacent bounded Action Center regression suite:

```bash
npx vitest run "lib/action-center-route-defaults.test.ts" "lib/action-center-review-rhythm.test.ts" "lib/action-center-review-invite.test.ts" "lib/action-center-review-reschedule.test.ts" "lib/action-center-follow-through-mail-planner.test.ts" "components/dashboard/review-moment-detail-panel.test.ts"
```

Expected: PASS.

- [ ] If practical, run:

```bash
npm run build
```

Expected:

- compile/typecheck must stay green for this slice
- if build still stops on the known auth/Supabase prerender env baseline, document that explicitly and do not misattribute it to this slice

## Acceptance Criteria

- HR can see a compact oversight summary for enabled follow-through routes inside `reviewmomenten`.
- Oversight state is fully derived from canonical Action Center truth and shared rhythm config.
- `stale` and `escalation-sensitive` are explicit and test-covered.
- Blocked route families remain absent from oversight output.
- No new Action Center page, workflow layer, or route family is introduced.
- Bounded reviewmomenten and adjacent Action Center regression suites are green.

## Commit

Suggested commit message:

```bash
Add Action Center HR oversight stale-route governance
```
