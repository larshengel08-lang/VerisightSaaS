# Action Center Native Outlook / Graph Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute this plan task-by-task. Keep this slice bounded to the Graph enhancement path only.

**Goal:** Add an optional native Microsoft Graph calendar path for Outlook-friendly customers so eligible ExitScan review invites can create, update, and cancel Outlook calendar events while Action Center remains the canonical source of review truth.

**Architecture:** Treat Graph as a provider adapter layered on top of the live `email + ICS` contract. Action Center remains canonical for schedule state, revision sequencing, and route identity. The Graph layer only mirrors canonical review schedule state into Outlook event objects, persists provider event identity, and falls back cleanly to the existing `.ics` flow whenever Graph is unavailable, unconsented, or mismatched.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Supabase SQL patch + schema snapshot, existing review invite / reschedule / reminder infrastructure, Microsoft Graph REST API, optional server-side token exchange, Vitest.

---

## Scope Check

This child plan assumes the following live baselines already exist on `main`:

- contextual Action Center deeplinks
- bounded review invite contract + `.ics` rendering
- HR Rhythm Console
- triggered follow-through mail layer
- review reschedule flows with revision-aware cancel semantics

Verify before implementation starts:

- `git merge-base --is-ancestor c0d9653f397ac45ec91a24acefcfa48dc877164b HEAD`
- `git merge-base --is-ancestor fdf8641fc07976b8c653f250291092fde6b756ad HEAD`
- `git merge-base --is-ancestor d84536f0ceaf8bcc9109cc74104d1bfe9c8a3a2e HEAD`

If one of these checks fails, sync the worktree from `main` before writing code.

In scope here:

- explicit Graph capability detection for Outlook-friendly customers
- persisted mapping between Action Center review route identity and Graph event identity
- native Graph create/update/cancel mirroring for eligible review invites
- strict fallback to existing `email + ICS` when Graph is unavailable
- organizer ownership model and consent gating
- bounded UI affordance to use Graph where available

Explicitly out of scope here:

- Microsoft Teams integration
- mailbox reply parsing
- off-platform canonical writes back into Action Center
- non-ExitScan route families
- generic calendar provider abstraction beyond Microsoft Graph
- HR rhythm redesign
- route parity broadening

## Product Rules To Preserve

- Action Center remains canonical for review date, revision sequence, and route identity.
- Graph event identity may never become canonical schedule truth.
- When Graph is unavailable, the product must continue to work via existing `email + ICS`.
- First Graph release remains ExitScan-only.
- Graph support is a customer-fit enhancement, not a prerequisite for the Action Center follow-through proposition.
- No external calendar edits may silently rewrite Action Center schedule state.
- Native sync must reuse existing revision semantics for `REQUEST` and `CANCEL`.

## Outlook-Friendly Boundary

For this child plan, `Outlook-friendly` means:

- customer primarily uses Outlook / Exchange for calendar behavior
- customer IT can support an explicit Microsoft consent path
- organizer mailbox model is known and bounded
- fallback to `.ics` remains acceptable if Graph consent is missing or revoked

Unsupported in the first Graph release:

- delegated user-by-user mailbox ownership without a stable service-side organizer model
- hybrid multi-tenant mailbox routing rules per review
- cross-provider calendar sync
- silent recovery of manually edited Outlook event identity

## Canonical Behavior

| Action Center event | Canonical truth | Graph effect | Fallback |
| --- | --- | --- | --- |
| initial review invite | existing review invite preview/download data | create Graph calendar event and persist provider event id | `.ics` download remains available |
| review reschedule | `action_center_manager_responses.review_scheduled_for` + revision ledger | patch existing Graph event with new start/end + increment-aligned metadata | `.ics` update remains available |
| review cancel | canonical review date cleared + cancel revision | cancel/delete Graph event according to bounded provider policy | `METHOD:CANCEL` `.ics` remains available |

Additional rules:

- Graph event sync may only run after invite eligibility succeeds.
- Graph event sync must use the same canonical route identity as invite / reschedule flows.
- Provider event identity must be unique per canonical review route.
- If provider sync fails, canonical Action Center state must still commit and fallback artifacts must remain available.

## File Structure

| File | Responsibility |
| --- | --- |
| `supabase/action_center_graph_calendar_links.sql` | New SQL patch for persisted Graph event identity + sync state |
| `supabase/schema.sql` | Schema snapshot update for Graph sync table and policies |
| `frontend/lib/action-center-graph-calendar.ts` | Shared provider contract, capability model, and event identity helpers |
| `frontend/lib/action-center-graph-calendar.test.ts` | Contract tests for Graph capability, event identity, and fallback semantics |
| `frontend/lib/action-center-graph-client.ts` | Server-side Graph HTTP wrapper for create/update/cancel event calls |
| `frontend/lib/action-center-graph-client.test.ts` | Tests for request shaping and fail-closed provider behavior |
| `frontend/lib/action-center-graph-sync.ts` | Canonical sync orchestration from invite/reschedule state into Graph |
| `frontend/lib/action-center-graph-sync.test.ts` | Tests for create/update/cancel mirroring and fallback behavior |
| `frontend/app/api/action-center-review-invites/route.ts` | Optional native sync branch layered on top of existing invite route |
| `frontend/app/api/action-center-review-invites/route.test.ts` | Regression coverage for Graph-enabled and Graph-disabled invite behavior |
| `frontend/app/api/action-center-review-reschedules/route.ts` | Trigger Graph update/cancel mirror after canonical schedule mutation succeeds |
| `frontend/app/api/action-center-review-reschedules/route.test.ts` | Regression coverage for provider mirror after reschedule/cancel |
| `frontend/components/dashboard/review-moment-detail-panel.tsx` | Small bounded affordance for Outlook sync availability |
| `frontend/components/dashboard/review-moment-detail-panel.test.ts` | UI contract for bounded Outlook sync affordance |

Do **not** touch:

- `frontend/app/(dashboard)/action-center/page.tsx`
- route parity files
- mail trigger planner semantics unrelated to provider mirroring
- any Teams or Slack surface
- any generic workflow builder surface

---

### Task 1: Add the Graph Calendar Identity Contract

**Files:**
- Create: `supabase/action_center_graph_calendar_links.sql`
- Modify: `supabase/schema.sql`
- Create: `frontend/lib/action-center-graph-calendar.ts`
- Create: `frontend/lib/action-center-graph-calendar.test.ts`

- [ ] Add failing contract tests for:
  - Outlook-friendly capability gating
  - stable provider event identity per canonical route
  - explicit fallback state when Graph is unavailable
  - no truth drift between canonical route id and provider mapping

- [ ] Add SQL for a bounded link table, for example:
  - `org_id`
  - `route_id`
  - `review_item_id`
  - `provider` limited to `microsoft_graph`
  - `event_id`
  - `organizer_email`
  - `sync_state`
  - `last_synced_revision`
  - `last_sync_error`
  - timestamps

- [ ] Keep policies service-role only in this first slice.

- [ ] Commit with:
  - `git commit -m "Add Action Center Graph calendar contract"`

### Task 2: Add the Graph Client and Capability Loader

**Files:**
- Create: `frontend/lib/action-center-graph-client.ts`
- Create: `frontend/lib/action-center-graph-client.test.ts`
- Modify: `frontend/lib/action-center-graph-calendar.ts`

- [ ] Add failing tests for:
  - create event payload shape
  - update event payload shape
  - cancel event payload shape
  - fail-closed network / token errors

- [ ] Keep the client explicit about:
  - no hidden retry storms
  - no canonical writes on provider failure
  - no implicit mailbox discovery beyond bounded config

- [ ] Make capability loading explicit about:
  - consent present vs absent
  - supported organizer model
  - Graph-enabled vs fallback-only customer state

- [ ] Commit with:
  - `git commit -m "Add Action Center Graph client"`

### Task 3: Add Canonical Graph Sync Orchestration

**Files:**
- Create: `frontend/lib/action-center-graph-sync.ts`
- Create: `frontend/lib/action-center-graph-sync.test.ts`
- Modify: `frontend/app/api/action-center-review-invites/route.ts`
- Modify: `frontend/app/api/action-center-review-reschedules/route.ts`

- [ ] Add failing orchestration tests for:
  - create Graph event on eligible initial invite
  - update Graph event on canonical reschedule
  - cancel Graph event on canonical cancel
  - fallback to `.ics` when Graph capability is unavailable
  - no duplicate provider event creation for the same canonical route

- [ ] Require the orchestration to:
  - reuse existing invite eligibility + revision semantics
  - persist `last_synced_revision`
  - avoid creating a second event when one already exists
  - fail closed without rolling back canonical Action Center state

- [ ] Keep the API behavior bounded:
  - canonical route succeeds even if provider sync fails
  - provider sync failure is visible in sync state
  - `.ics` fallback remains available

- [ ] Commit with:
  - `git commit -m "Add Action Center Graph sync orchestration"`

### Task 4: Add the Bounded Outlook Sync Affordance

**Files:**
- Modify: `frontend/components/dashboard/review-moment-detail-panel.tsx`
- Modify: `frontend/components/dashboard/review-moment-detail-panel.test.ts`

- [ ] Add a small bounded affordance only where all conditions hold:
  - review route is eligible
  - actor can already manage the review
  - customer/org is Graph-enabled

- [ ] Keep the UI bounded:
  - no broad new calendar management panel
  - no mailbox administration UI
  - no non-Outlook provider choices
  - no claim that Outlook is canonical

- [ ] Require test coverage for:
  - Graph-enabled affordance visible
  - fallback-only customers continue to see existing `.ics`
  - no wording drift toward “sync is truth”

- [ ] Commit with:
  - `git commit -m "Add Action Center Outlook sync affordance"`

### Task 5: End-to-End Verification

- [ ] Run bounded suites:

```bash
npx vitest run "lib/action-center-graph-calendar.test.ts" "lib/action-center-graph-client.test.ts" "lib/action-center-graph-sync.test.ts" "app/api/action-center-review-invites/route.test.ts" "app/api/action-center-review-reschedules/route.test.ts" "components/dashboard/review-moment-detail-panel.test.ts"
```

- [ ] Run a production-style build:

```bash
npm run build
```

- [ ] Verify expected outcome:
  - Graph-enabled path builds cleanly
  - existing `.ics` fallback still works
  - no new TypeScript or prerender regressions introduced by this slice

- [ ] Commit any final fixups with:
  - `git commit -m "Polish Action Center Graph integration"`

---

## Execution Order

1. Graph calendar identity contract
2. Graph client + capability loader
3. Canonical sync orchestration
4. Bounded Outlook sync affordance
5. Verification

## Acceptance Criteria

- Eligible ExitScan review invites can mirror into Outlook through Graph when capability is present.
- Reschedule and cancel reuse existing revision semantics and mirror correctly into Graph.
- Existing `.ics` flow remains fully usable without Graph.
- Canonical Action Center state never depends on provider success.
- No off-platform canonical writes are introduced.

## Notes

- This child plan deliberately treats Graph as an enhancement on top of the stable `email + ICS` foundation.
- If execution reveals missing org-level consent/config primitives, add them inside this slice only when they are strictly necessary for bounded Graph capability gating.
