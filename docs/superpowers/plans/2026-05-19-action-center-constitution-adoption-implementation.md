# Action Center Constitution + Adoption Measurement Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the bounded Action Center constitution layer so canonical objects, states, transitions, role boundaries, route defaults, governance rules, and adoption measurement readiness become executable product truth for `exit` and `retention`.

**Architecture:** Add one shared constitution contract in `frontend/lib` and make existing Action Center modules import from it instead of carrying their own implicit truth. Keep all write behavior canonical to Action Center, wire route defaults and role policy into the existing review rhythm / reschedule / closeout / reopen / invite / mail / Graph modules, and add a measurement-readiness event contract without claiming adoption proof.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, existing Action Center loaders and API routes, Supabase SQL patch files plus `schema.sql`, Vercel cron/mail/invite plumbing already present in the worktree.

---

## Scope Check

This plan is one bounded implementation program. It does **not** broaden Action Center into:

- new route families beyond `exit` and `retention`
- generic workflow software
- new Graph-dependent product depth
- off-platform canonical writes
- standalone module packaging

This plan assumes the hardened spec is the active source of truth:

- [2026-05-19-action-center-constitution-adoption-design.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-19-action-center-constitution-adoption-design.md)

---

## File Structure Guidance

The implementation should cluster around these responsibilities:

- `frontend/lib/action-center-constitution.ts`
  - new single source of truth for canonical objects, states, transitions, route defaults, and permission constraints
- `frontend/lib/action-center-adoption-metrics.ts`
  - new contract for measurement-ready metric definitions and event anchors
- `frontend/lib/action-center-governance.ts`
  - extend to enforce spec-level actor rules
- `frontend/lib/action-center-route-defaults.ts`
  - narrow to route-family defaults and import shared truth from the constitution contract
- `frontend/lib/action-center-review-rhythm*.ts`
  - align cadence and stale/escalation derivation to constitution defaults
- `frontend/lib/action-center-review-reschedule*.ts`
  - enforce canonical reschedule rules and actor boundaries
- `frontend/lib/action-center-route-closeout.ts`
  - enforce closeout semantics and required closeout fields
- `frontend/lib/action-center-route-reopen.ts`
  - enforce reopen semantics and audit reasons
- `frontend/lib/action-center-follow-through-mail*.ts`
  - classify events as notification-only and emit measurement-ready events
- `frontend/lib/action-center-graph-*.ts`
  - explicitly mirror calendar artifacts only, never route truth
- `frontend/app/api/action-center-*/route.ts`
  - route-level permission and off-platform boundary enforcement
- `supabase/action_center_constitution_adoption_readiness.sql`
  - new SQL patch for auditlog and adoption-event readiness data
- `supabase/schema.sql`
  - canonical schema mirror for the above patch

Do **not** spread new product truth across multiple ad hoc helpers. Make the constitution module the import point for every downstream write-path.

---

### Task 1: Create The Shared Constitution Contract

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.test.ts`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.ts`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.ts`

- [ ] **Step 1: Write the failing constitution contract tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_CANONICAL_ROUTE_STATES,
  ACTION_CENTER_CANONICAL_REVIEW_STATES,
  ACTION_CENTER_TRANSITION_RULES,
  getActionCenterApprovedRouteDefault,
  isActionCenterCanonicalRouteStateTransitionAllowed,
} from '@/lib/action-center-constitution'

describe('action-center constitution', () => {
  it('exposes only exit and retention as approved route defaults', () => {
    expect(getActionCenterApprovedRouteDefault('exit')?.scanType).toBe('exit')
    expect(getActionCenterApprovedRouteDefault('retention')?.scanType).toBe('retention')
    expect(getActionCenterApprovedRouteDefault('pulse')).toBeNull()
  })

  it('blocks manager route close transitions', () => {
    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'manager_participant',
        object: 'follow_through_route',
        fromState: 'open',
        toState: 'closed',
      }),
    ).toBe(false)
  })

  it('allows hr closeout and reopen transitions', () => {
    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'follow_through_route',
        fromState: 'open',
        toState: 'closed',
      }),
    ).toBe(true)

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'follow_through_route',
        fromState: 'closed',
        toState: 'reopened',
      }),
    ).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-constitution.test.ts
```

Expected:

```text
FAIL  Cannot find module '@/lib/action-center-constitution'
```

- [ ] **Step 3: Write the minimal constitution contract**

```ts
export const ACTION_CENTER_APPROVED_ROUTE_FAMILIES = ['exit', 'retention'] as const
export type ActionCenterApprovedRouteFamily = (typeof ACTION_CENTER_APPROVED_ROUTE_FAMILIES)[number]

export const ACTION_CENTER_CANONICAL_ROUTE_STATES = [
  'open',
  'scheduled',
  'overdue',
  'stale',
  'escalation_sensitive',
  'closed',
  'reopened',
] as const

export const ACTION_CENTER_CANONICAL_REVIEW_STATES = [
  'scheduled',
  'completed',
  'missed',
  'cancelled',
  'rescheduled',
] as const

export type ActionCenterActor =
  | 'hr_rhythm_owner'
  | 'manager_participant'
  | 'system_channel'

export const ACTION_CENTER_TRANSITION_RULES = [
  {
    object: 'follow_through_route',
    fromState: 'open',
    toState: 'closed',
    actors: ['hr_rhythm_owner'],
  },
  {
    object: 'follow_through_route',
    fromState: 'closed',
    toState: 'reopened',
    actors: ['hr_rhythm_owner'],
  },
]

export function getActionCenterApprovedRouteDefault(scanType: string | null | undefined) {
  if (scanType === 'exit') {
    return {
      scanType: 'exit' as const,
      reviewWindowDays: { min: 60, max: 90 },
      staleAfterDays: 90,
    }
  }

  if (scanType === 'retention') {
    return {
      scanType: 'retention' as const,
      reviewWindowDays: { min: 45, max: 90 },
      staleAfterDays: 90,
    }
  }

  return null
}

export function isActionCenterCanonicalRouteStateTransitionAllowed(args: {
  actor: ActionCenterActor
  object: string
  fromState: string
  toState: string
}) {
  return ACTION_CENTER_TRANSITION_RULES.some(
    (rule) =>
      rule.object === args.object &&
      rule.fromState === args.fromState &&
      rule.toState === args.toState &&
      rule.actors.includes(args.actor),
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-constitution.test.ts
```

Expected:

```text
PASS  lib/action-center-constitution.test.ts
```

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure add frontend/lib/action-center-constitution.ts frontend/lib/action-center-constitution.test.ts
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure commit -m "Add Action Center constitution contract"
```

### Task 2: Align Route Defaults And Governance To The Constitution

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.test.ts`

- [ ] **Step 1: Write failing tests for approved-route defaults and governance boundaries**

```ts
it('returns route-specific defaults for exit and retention', () => {
  expect(getActionCenterRouteDefaults('exit')).toMatchObject({
    actionCenterStatus: 'enabled',
    routeEnabled: true,
    reviewWindowDays: { min: 60, max: 90 },
  })

  expect(getActionCenterRouteDefaults('retention')).toMatchObject({
    actionCenterStatus: 'enabled',
    routeEnabled: true,
    reviewWindowDays: { min: 45, max: 90 },
  })
})

it('does not allow manager canonical reschedule or close access', () => {
  expect(
    resolveActionCenterTransitionAccess({
      actorRole: 'manager',
      object: 'follow_through_route',
      fromState: 'open',
      toState: 'closed',
    }).allowed,
  ).toBe(false)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts
```

Expected:

```text
FAIL  reviewWindowDays does not exist
FAIL  resolveActionCenterTransitionAccess is not defined
```

- [ ] **Step 3: Implement route-default and governance alignment**

```ts
// action-center-route-defaults.ts
import { getActionCenterApprovedRouteDefault } from '@/lib/action-center-constitution'

export interface ActionCenterRouteDefaults {
  scanType: ActionCenterRouteDefaultsKnownScanType
  actionCenterStatus: 'enabled' | 'blocked'
  routeEnabled: boolean
  cadenceDays: number
  reminderLeadDays: number
  escalationLeadDays: number
  reviewWindowDays?: { min: number; max: number }
  staleAfterDays?: number
  closeoutPrompt?: string
  remindersEnabled: boolean
  providerEligible: boolean
}

// action-center-governance.ts
export function resolveActionCenterTransitionAccess(args: {
  actorRole: ActionCenterGovernanceActorRole
  object: 'follow_through_route' | 'review_moment' | 'owner_assignment'
  fromState: string
  toState: string
}) {
  const actor =
    args.actorRole === 'manager'
      ? 'manager_participant'
      : args.actorRole === 'verisight_admin' || args.actorRole === 'hr_owner' || args.actorRole === 'hr_member'
        ? 'hr_rhythm_owner'
        : 'system_channel'

  return {
    allowed: isActionCenterCanonicalRouteStateTransitionAllowed({
      actor,
      object: args.object,
      fromState: args.fromState,
      toState: args.toState,
    }),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts lib/action-center-constitution.test.ts
```

Expected:

```text
PASS  3 files
```

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure add frontend/lib/action-center-route-defaults.ts frontend/lib/action-center-governance.ts frontend/lib/action-center-route-defaults.test.ts frontend/lib/action-center-governance.test.ts
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure commit -m "Align Action Center defaults and governance"
```

### Task 3: Harden Canonical Mutation Modules And API Routes

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-reschedule.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-closeout.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-reopen.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-review-rhythm\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-review-reschedules\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-closeouts\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-reopens\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-review-rhythm\route.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-review-reschedules\route.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-closeouts\route.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-reopens\route.test.ts`

- [ ] **Step 1: Write failing route mutation tests for forbidden actors and required audit reasons**

```ts
it('rejects manager closeout attempts', async () => {
  const response = await POST(
    buildRequest({
      actorRole: 'manager',
      scanType: 'exit',
      routeId: 'route-1',
      reason: 'done',
    }),
  )

  expect(response.status).toBe(403)
})

it('rejects reopen without explicit reason', async () => {
  const response = await POST(
    buildRequest({
      actorRole: 'hr_owner',
      scanType: 'retention',
      routeId: 'route-1',
      reopenReason: '',
    }),
  )

  expect(response.status).toBe(400)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run app/api/action-center-route-closeouts/route.test.ts app/api/action-center-route-reopens/route.test.ts app/api/action-center-review-reschedules/route.test.ts
```

Expected:

```text
FAIL  manager closeout not rejected
FAIL  reopen reason not validated
```

- [ ] **Step 3: Implement constitution-based mutation guards**

```ts
// action-center-route-closeout.ts
const access = resolveActionCenterTransitionAccess({
  actorRole,
  object: 'follow_through_route',
  fromState: currentState,
  toState: 'closed',
})

if (!access.allowed) {
  throw new ActionCenterRouteCloseoutError('forbidden_transition')
}

if (!closeoutReason.trim()) {
  throw new ActionCenterRouteCloseoutError('missing_closeout_reason')
}

// action-center-review-reschedule.ts
if (actorRole === 'manager') {
  throw new ActionCenterReviewRescheduleError('manager_reschedule_not_allowed')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run app/api/action-center-review-rhythm/route.test.ts app/api/action-center-review-reschedules/route.test.ts app/api/action-center-route-closeouts/route.test.ts app/api/action-center-route-reopens/route.test.ts
```

Expected:

```text
PASS  4 files
```

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure add frontend/lib/action-center-review-rhythm.ts frontend/lib/action-center-review-reschedule.ts frontend/lib/action-center-route-closeout.ts frontend/lib/action-center-route-reopen.ts frontend/app/api/action-center-review-rhythm/route.ts frontend/app/api/action-center-review-reschedules/route.ts frontend/app/api/action-center-route-closeouts/route.ts frontend/app/api/action-center-route-reopens/route.ts frontend/app/api/action-center-review-rhythm/route.test.ts frontend/app/api/action-center-review-reschedules/route.test.ts frontend/app/api/action-center-route-closeouts/route.test.ts frontend/app/api/action-center-route-reopens/route.test.ts
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure commit -m "Harden Action Center canonical mutations"
```

### Task 4: Add Governance-Safe Adoption Measurement Readiness

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-adoption-metrics.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-adoption-metrics.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-follow-through-mail.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-entry.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-reschedule.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\schema.sql`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\action_center_constitution_adoption_readiness.sql`

- [ ] **Step 1: Write failing metric-contract tests**

```ts
it('defines metric formulas and event anchors for manager trigger open rate', () => {
  expect(getActionCenterAdoptionMetricDefinition('manager_trigger_open_rate')).toMatchObject({
    eventSource: 'contextual_entry',
    objectAnchor: 'follow_through_route',
    formula: 'unique_manager_contextual_entry_opens / unique_manager_trigger_deliveries',
  })
})

it('marks every metric as readiness-only, not proof', () => {
  for (const metric of ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS) {
    expect(metric.provesAdoption).toBe(false)
  }
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-adoption-metrics.test.ts
```

Expected:

```text
FAIL  Cannot find module '@/lib/action-center-adoption-metrics'
```

- [ ] **Step 3: Implement the measurement-readiness contract and SQL patch**

```ts
export const ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS = [
  {
    name: 'manager_trigger_open_rate',
    formula: 'unique_manager_contextual_entry_opens / unique_manager_trigger_deliveries',
    eventSource: 'contextual_entry',
    objectAnchor: 'follow_through_route',
    provesAdoption: false,
  },
  {
    name: 'review_completion_rate',
    formula: 'canonically_completed_reviews / scheduled_reviews_in_window',
    eventSource: 'review_transition',
    objectAnchor: 'review_moment',
    provesAdoption: false,
  },
] as const

export function getActionCenterAdoptionMetricDefinition(name: string) {
  return ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS.find((metric) => metric.name === name) ?? null
}
```

```sql
create table if not exists action_center_adoption_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  route_id uuid not null,
  review_item_id uuid null,
  scan_type text not null,
  event_name text not null,
  event_source text not null,
  actor_role text not null,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-adoption-metrics.test.ts lib/action-center-follow-through-mail.test.ts lib/action-center-entry.test.ts
```

Expected:

```text
PASS  3 files
```

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure add frontend/lib/action-center-adoption-metrics.ts frontend/lib/action-center-adoption-metrics.test.ts frontend/lib/action-center-follow-through-mail.ts frontend/lib/action-center-entry.ts supabase/action_center_constitution_adoption_readiness.sql supabase/schema.sql
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure commit -m "Add Action Center adoption measurement readiness"
```

### Task 5: Harden Graph, Invite, And Mail Surfaces As Non-Canonical Mirrors

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-invite.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-invite-ics.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-follow-through-mail-planner.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-graph-sync.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-graph-calendar.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-invite.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-follow-through-mail-planner.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-graph-sync.test.ts`

- [ ] **Step 1: Write failing tests for non-canonical channel classification**

```ts
it('marks graph sync artifacts as mirror_only', () => {
  expect(buildGraphCalendarSyncPayload(fixture).mutationClass).toBe('mirror_only')
})

it('does not let invite planner emit canonical route state transitions', () => {
  const plan = buildActionCenterFollowThroughMailPlan(fixture)
  expect(plan.some((item) => item.kind === 'canonical_state_change')).toBe(false)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-review-invite.test.ts lib/action-center-follow-through-mail-planner.test.ts lib/action-center-graph-sync.test.ts
```

Expected:

```text
FAIL  mutationClass is undefined
FAIL  canonical_state_change guard missing
```

- [ ] **Step 3: Implement mirror-only channel guards**

```ts
return {
  mutationClass: 'mirror_only' as const,
  canonicalWrite: false,
  mirroredReviewState: reviewState,
}
```

```ts
if (candidate.kind === 'canonical_state_change') {
  throw new Error('channel surfaces may not emit canonical state changes')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-review-invite.test.ts lib/action-center-follow-through-mail-planner.test.ts lib/action-center-graph-sync.test.ts
```

Expected:

```text
PASS  3 files
```

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure add frontend/lib/action-center-review-invite.ts frontend/lib/action-center-review-invite-ics.ts frontend/lib/action-center-follow-through-mail-planner.ts frontend/lib/action-center-graph-sync.ts frontend/lib/action-center-graph-calendar.ts frontend/lib/action-center-review-invite.test.ts frontend/lib/action-center-follow-through-mail-planner.test.ts frontend/lib/action-center-graph-sync.test.ts
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure commit -m "Harden Action Center channel mirror boundaries"
```

### Task 6: Wire Oversight, Page Data, And UI To The Constitution

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-oversight.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-console.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-oversight.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-moment-detail-panel.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-moment-page-client.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\(dashboard)\action-center\reviewmomenten\page.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-oversight.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-console.test.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-oversight.test.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-moment-page-client.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\(dashboard)\action-center\reviewmomenten\page.entry-shell.test.ts`

- [ ] **Step 1: Write failing tests for constitution-backed UI labels and exclusions**

```ts
it('shows only constitution-approved route families in reviewmomenten governance surfaces', () => {
  expect(renderedHtml).toContain('ExitScan')
  expect(renderedHtml).toContain('RetentieScan')
  expect(renderedHtml).not.toContain('Pulse')
  expect(renderedHtml).not.toContain('Leadership')
})

it('keeps manager actions bounded to one primary action', () => {
  expect(source).toContain('primaryQuickAction')
  expect(source).not.toContain('secondaryTaskList')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-review-oversight.test.ts lib/action-center-review-rhythm-data.test.ts components/dashboard/review-rhythm-console.test.tsx components/dashboard/review-rhythm-oversight.test.tsx components/dashboard/review-moment-page-client.test.ts app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts
```

Expected:

```text
FAIL  constitution-specific route/UI assertions missing
```

- [ ] **Step 3: Implement constitution-backed loader and UI wiring**

```ts
const routeDefaults = getActionCenterApprovedRouteDefault(item.scanType)
if (!routeDefaults) {
  return null
}

return {
  ...item,
  primaryQuickAction: buildPrimaryQuickAction(item),
  routeDefaults,
}
```

```tsx
<ReviewRhythmConsole
  approvedRouteFamilies={['exit', 'retention']}
  primaryQuickAction={item.primaryQuickAction}
/>
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-review-oversight.test.ts lib/action-center-review-rhythm-data.test.ts components/dashboard/review-rhythm-console.test.tsx components/dashboard/review-rhythm-oversight.test.tsx components/dashboard/review-moment-page-client.test.ts app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts
```

Expected:

```text
PASS  6 files
```

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure add frontend/lib/action-center-review-oversight.ts frontend/lib/action-center-review-rhythm-data.ts frontend/components/dashboard/review-rhythm-console.tsx frontend/components/dashboard/review-rhythm-oversight.tsx frontend/components/dashboard/review-moment-detail-panel.tsx frontend/components/dashboard/review-moment-page-client.tsx frontend/app/(dashboard)/action-center/reviewmomenten/page.tsx frontend/lib/action-center-review-oversight.test.ts frontend/lib/action-center-review-rhythm-data.test.ts frontend/components/dashboard/review-rhythm-console.test.tsx frontend/components/dashboard/review-rhythm-oversight.test.tsx frontend/components/dashboard/review-moment-page-client.test.ts frontend/app/(dashboard)/action-center/reviewmomenten/page.entry-shell.test.ts
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure commit -m "Wire Action Center constitution into review surfaces"
```

### Task 7: Run Full Constitution Regression And Document Readiness

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-19-action-center-constitution-adoption-implementation.md`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-reschedule.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-closeout.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-reopen.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-follow-through-mail-planner.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-graph-sync.test.ts`

- [ ] **Step 1: Run the bounded regression suite**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npx vitest run lib/action-center-constitution.test.ts lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts lib/action-center-review-reschedule.test.ts lib/action-center-route-closeout.test.ts lib/action-center-route-reopen.test.ts lib/action-center-follow-through-mail-planner.test.ts lib/action-center-graph-sync.test.ts app/api/action-center-review-rhythm/route.test.ts app/api/action-center-review-reschedules/route.test.ts app/api/action-center-route-closeouts/route.test.ts app/api/action-center-route-reopens/route.test.ts components/dashboard/review-rhythm-console.test.tsx components/dashboard/review-rhythm-oversight.test.tsx components/dashboard/review-moment-page-client.test.ts
```

Expected:

```text
PASS  bounded constitution suite
```

- [ ] **Step 2: Run build to catch type or route regressions**

Run:

```bash
cd /d C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend
npm run build
```

Expected:

```text
Compiled successfully
Typecheck passes for Action Center changes
Known unrelated auth/Supabase prerender baseline may still remain
```

- [ ] **Step 3: Mark the plan with verification notes**

```md
- [ ] Verification notes added after constitution regression run:
  - bounded suite status
  - build status
  - known unrelated blockers, if any
```

- [ ] **Step 4: Commit**

```bash
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure add docs/superpowers/plans/2026-05-19-action-center-constitution-adoption-implementation.md
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure commit -m "Document Action Center constitution verification"
```

---

## Self-Review

### Spec coverage

The plan covers:

- canonical object and state truth via Task 1
- route defaults and role boundaries via Task 2
- transition enforcement via Task 3
- adoption measurement readiness via Task 4
- non-canonical channel behavior via Task 5
- reviewmomenten / oversight / manager quick-action wiring via Task 6
- bounded verification via Task 7

### Placeholder scan

No task says `TBD`, `TODO`, or `implement later`.

### Type consistency

Core names used consistently in the plan:

- `follow_through_route`
- `review_moment`
- `owner_assignment`
- `hr_rhythm_owner`
- `manager_participant`
- `system_channel`
- `manager_trigger_open_rate`
- `HR_chasing_reduction_proxy`

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-19-action-center-constitution-adoption-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
