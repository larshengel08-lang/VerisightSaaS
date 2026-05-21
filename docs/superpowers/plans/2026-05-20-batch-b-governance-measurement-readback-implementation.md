# Batch B Governance Measurement Readback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Action Center into a bounded HR operating layer with unified governance queues, auditable intervention logic, and safe measurement readback for `exit` and `retention` without implying proof or broadening into workflow software.

**Architecture:** Extend the existing Batch A route/action/review truth instead of reopening it. First derive a stable governance-queue layer from canonical preview, lifecycle, and route-default data; then add bounded HR intervention writes with auditable storage; then build readback and metrics on top of canonical events; finally wire queue and readback surfaces into the existing Action Center dashboard and lock the batch down with route-family scenario coverage and regression verification.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, Supabase SQL patch files plus `schema.sql`, existing Action Center preview/governance/metrics helpers, existing route/action/review APIs.

---

## Scope Check

This plan implements **Batch B** only.

In scope:

- unified HR governance queue taxonomy
- auditable HR intervention contract
- route-level, action-level, review-level, governance-signal, and route-family measurement readback
- bounded metric formulas and KPI interpretation rails
- buyer-safe reporting vocabulary surfaces
- ExitScan / RetentieScan readback alignment
- full Batch B regression and verification hardening

Out of scope:

- route expansion beyond `exit` and `retention`
- Graph dependency, Teams/Slack, or multichannel broadening
- off-platform canonical writes
- causal impact claims or adoption proof
- standalone buyer packaging as the main workstream
- generic analytics platform behavior
- generic workflow, project management, task board, or case-management behavior
- reopening Batch A truth unless a blocking inconsistency is discovered

Source specs:

- [2026-05-20-action-center-enterprise-roadmap.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-action-center-enterprise-roadmap.md)
- [2026-05-20-batch-b-governance-measurement-readback-spec.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-batch-b-governance-measurement-readback-spec.md)
- [2026-05-20-batch-a-productization-of-execution-spec.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-batch-a-productization-of-execution-spec.md)

---

## File Structure Guidance

- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.ts`
  - keep shared governance labels and route-signal derivation; delegate queue-specific logic to focused helpers
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-queues.ts`
  - create unified queue taxonomy, queue-item type, trigger derivation, urgency ordering, suppression model
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-queues.test.ts`
  - queue derivation, ordering, false-positive suppression, route-family consistency
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-interventions.ts`
  - allowed intervention types, validation, auditable intervention payloads, close/continue/reopen policy checks
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-interventions.test.ts`
  - intervention boundaries, actor restrictions, suppression audit requirements
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-governance-interventions\route.ts`
  - bounded HR intervention write surface
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-governance-interventions\route.test.ts`
  - fail-closed API behavior for HR governance actions
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-measurement-readback.ts`
  - route/action/review/governance/route-family readback models, visibility levels, buyer-safe vocabulary mapping
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-measurement-readback.test.ts`
  - readback layers, visibility gating, non-proof language
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-bounded-execution-metrics.ts`
  - extend existing event definitions to cover Batch B metric formulas without loosening metadata rules
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-bounded-execution-metrics.test.ts`
  - metric formulas, route-family anchors, visibility tagging
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.ts`
  - merge queue derivation and readback summaries into dashboard page data
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-page-data.ts`
  - expose queue and readback payloads to dashboard shells
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-governance-queue.tsx`
  - unified HR queue UI, route-first and urgency-first
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-governance-queue.test.tsx`
  - queue rendering, why-in-queue messaging, direct action affordances
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-measurement-readback.tsx`
  - secondary readback layer above queue
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-measurement-readback.test.tsx`
  - bounded readback copy, route-family differentiation, no proof language
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-oversight.tsx`
  - either slim down into queue preview or defer to new queue component
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-oversight.test.tsx`
  - ensure current oversight survives until queue takes over
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\(dashboard)\action-center\page.tsx`
  - mount unified queue and secondary readback
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\(dashboard)\action-center\page.overview-shell.test.ts`
  - dashboard shell expectations for queue/readback
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\action_center_constitution_adoption_readiness.sql`
  - add governance intervention audit storage and any bounded event/table parity
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\schema.sql`
  - canonical schema mirror
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-20-batch-b-governance-measurement-readback-implementation.md`
  - record verification notes at closeout

---

### Task 1: Build Unified Governance Queue Taxonomy And Derivation

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-queues.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-queues.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.ts`

- [ ] **Step 1: Write the failing queue-derivation tests**

```ts
import { describe, expect, it } from 'vitest'
import { buildActionCenterGovernanceQueue } from '@/lib/action-center-governance-queues'

describe('buildActionCenterGovernanceQueue', () => {
  it('prioritizes repeated no-progress above route-ready-for-closeout', () => {
    const queue = buildActionCenterGovernanceQueue({
      items: [makeCloseoutReadyRoute(), makeRepeatedNoProgressRoute()],
      now: new Date('2026-05-21T10:00:00.000Z'),
    })

    expect(queue.items.map((item) => item.primarySignal)).toEqual([
      'repeated_review_without_progress',
      'route_ready_for_closeout',
    ])
  })

  it('adds explicit why-in-queue copy', () => {
    const queue = buildActionCenterGovernanceQueue({
      items: [makeBlockedActionRoute()],
      now: new Date('2026-05-21T10:00:00.000Z'),
    })

    expect(queue.items[0]).toMatchObject({
      primarySignal: 'blocked_action',
      whyInQueue: expect.stringContaining('blokkering'),
      expectedHrAction: expect.stringContaining('HR review'),
    })
  })

  it('supports false-positive suppression without deleting queue history', () => {
    const queue = buildActionCenterGovernanceQueue({
      items: [makeMissingReviewFalsePositiveRoute()],
      suppressedSignals: [
        {
          routeId: 'retention::team-cs',
          signalCode: 'action_review_due',
          reasonCode: 'review-already-completed',
        },
      ],
      now: new Date('2026-05-21T10:00:00.000Z'),
    })

    expect(queue.items).toHaveLength(0)
    expect(queue.suppressedItems[0].signalCode).toBe('action_review_due')
  })
})
```

- [ ] **Step 2: Run the focused governance-queue suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts lib/action-center-governance-queues.test.ts
```

Expected:

```text
FAIL  unified governance queue helpers do not exist yet
```

- [ ] **Step 3: Create the unified queue helper**

```ts
export type ActionCenterGovernanceQueueCode =
  | 'needs_owner_or_assignment_issue'
  | 'missing_action_where_execution_expected'
  | 'action_review_due'
  | 'stuck_action'
  | 'blocked_action'
  | 'action_sprawl_risk'
  | 'repeated_review_without_progress'
  | 'route_ready_for_closeout'
  | 'route_stale_despite_actions'
  | 'HR_review_required'

export interface ActionCenterGovernanceQueueItem {
  routeId: string
  routeFamily: ActionCenterApprovedRouteFamily
  scopeLabel: string
  managerOwner: string | null
  primarySignal: ActionCenterGovernanceQueueCode
  secondarySignals: ActionCenterGovernanceQueueCode[]
  severity: 'high' | 'medium'
  whyInQueue: string
  expectedHrAction: string
  recommendation: string
  timeInQueueDays: number
}

export function buildActionCenterGovernanceQueue(args: {
  items: ActionCenterPreviewItem[]
  now: Date
  suppressedSignals?: ActionCenterSuppressedGovernanceSignal[]
}) {
  const derivedItems = args.items.flatMap((item) => deriveQueueItemsForRoute({ item, now: args.now }))
  const visibleItems = derivedItems.filter((item) => !isSuppressed(item, args.suppressedSignals ?? []))
  const suppressedItems = derivedItems
    .filter((item) => isSuppressed(item, args.suppressedSignals ?? []))
    .map((item) => toSuppressedQueueItem(item, args.suppressedSignals ?? []))

  return {
    items: sortGovernanceQueueItems(visibleItems),
    suppressedItems,
  }
}
```

- [ ] **Step 4: Merge queue derivation into review-rhythm data**

```ts
const governanceQueue = buildActionCenterGovernanceQueue({
  items: eligibleItems,
  now: args.now,
})

return {
  configByRouteId,
  summary,
  oversight: governanceAwareOversight,
  governanceQueue,
}
```

- [ ] **Step 5: Re-run the governance-queue suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts lib/action-center-governance-queues.test.ts
```

Expected:

```text
PASS  governance queue derivation and oversight integration
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-governance.ts frontend/lib/action-center-governance-queues.ts frontend/lib/action-center-governance-queues.test.ts frontend/lib/action-center-review-rhythm-data.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center governance queue taxonomy"
```

### Task 2: Add Auditable HR Intervention Logic And API

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-interventions.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-interventions.test.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-governance-interventions\route.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-governance-interventions\route.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\action_center_constitution_adoption_readiness.sql`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\schema.sql`

- [ ] **Step 1: Write the failing intervention-boundary tests**

```ts
import { describe, expect, it } from 'vitest'
import { validateActionCenterGovernanceIntervention } from '@/lib/action-center-governance-interventions'

describe('validateActionCenterGovernanceIntervention', () => {
  it('allows HR to request manager update on stuck_action', () => {
    expect(
      validateActionCenterGovernanceIntervention({
        queueCode: 'stuck_action',
        interventionType: 'request_manager_update',
        actorRole: 'hr_member',
      }).allowed,
    ).toBe(true)
  })

  it('blocks HR from rewriting manager history', () => {
    expect(
      validateActionCenterGovernanceIntervention({
        queueCode: 'blocked_action',
        interventionType: 'rewrite_manager_history',
        actorRole: 'hr_owner',
      }).allowed,
    ).toBe(false)
  })

  it('requires suppression reason for false-positive dismissal', () => {
    expect(() =>
      validateActionCenterGovernanceIntervention({
        queueCode: 'action_review_due',
        interventionType: 'suppress_false_signal',
        actorRole: 'hr_member',
        reasonCode: null,
      }),
    ).toThrow('Suppression requires a reason code.')
  })
})
```

- [ ] **Step 2: Run the focused intervention suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-governance-interventions.test.ts app/api/action-center-governance-interventions/route.test.ts
```

Expected:

```text
FAIL  governance interventions are not implemented yet
```

- [ ] **Step 3: Implement bounded intervention validation**

```ts
export type ActionCenterGovernanceInterventionType =
  | 'observe_only'
  | 'request_manager_update'
  | 'send_bounded_reminder'
  | 'require_action_review'
  | 'mark_hr_review_required'
  | 'request_action_correction'
  | 'suppress_false_signal'
  | 'close_route'
  | 'continue_route'
  | 'reopen_route'

export function validateActionCenterGovernanceIntervention(
  input: ActionCenterGovernanceInterventionInput,
) {
  if (input.interventionType === 'suppress_false_signal' && !input.reasonCode) {
    throw new Error('Suppression requires a reason code.')
  }

  if (input.interventionType === 'rewrite_manager_history') {
    return { allowed: false as const, reason: 'Intervention is outside bounded governance.' }
  }

  return {
    allowed: isAllowedQueueIntervention(input),
    reason: null,
  }
}
```

- [ ] **Step 4: Add an auditable intervention write surface**

```ts
const intervention = validateActionCenterGovernanceIntervention(validatedBody)
if (!intervention.allowed) {
  return NextResponse.json({ detail: intervention.reason }, { status: 403 })
}

await admin.from('action_center_governance_interventions').insert({
  route_id: validatedBody.routeId,
  action_id: validatedBody.actionId,
  queue_code: validatedBody.queueCode,
  intervention_type: validatedBody.interventionType,
  reason_code: validatedBody.reasonCode,
  actor_role: writeAccess.auditRole,
  actor_user_id: session.user.id,
})
```

- [ ] **Step 5: Add schema parity for intervention audit storage**

```sql
create table if not exists public.action_center_governance_interventions (
  id uuid primary key default gen_random_uuid(),
  route_id text not null,
  action_id text null,
  queue_code text not null,
  intervention_type text not null,
  reason_code text null,
  actor_role text not null,
  actor_user_id uuid not null,
  created_at timestamptz not null default timezone('utc', now())
);
```

- [ ] **Step 6: Re-run the intervention suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-governance-interventions.test.ts app/api/action-center-governance-interventions/route.test.ts
```

Expected:

```text
PASS  bounded HR intervention validation and API routes
```

- [ ] **Step 7: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-governance.ts frontend/lib/action-center-governance-interventions.ts frontend/lib/action-center-governance-interventions.test.ts frontend/app/api/action-center-governance-interventions/route.ts frontend/app/api/action-center-governance-interventions/route.test.ts supabase/action_center_constitution_adoption_readiness.sql supabase/schema.sql
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center HR governance interventions"
```

### Task 3: Build Measurement Readback Layers And Visibility Contract

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-measurement-readback.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-measurement-readback.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-page-data.ts`

- [ ] **Step 1: Write the failing readback-layer tests**

```ts
import { describe, expect, it } from 'vitest'
import { buildActionCenterMeasurementReadback } from '@/lib/action-center-measurement-readback'

describe('buildActionCenterMeasurementReadback', () => {
  it('builds route, action, review, governance, and route-family layers', () => {
    const readback = buildActionCenterMeasurementReadback(makeReadbackFixture())

    expect(readback.layers.routeLevel.routesOpen).toBeGreaterThan(0)
    expect(readback.layers.actionLevel.activeActionCount).toBeGreaterThan(0)
    expect(readback.layers.reviewLevel.reviewDueCount).toBeGreaterThanOrEqual(0)
    expect(readback.layers.governanceSignalLevel.blockedActionCount).toBeGreaterThanOrEqual(0)
    expect(readback.layers.routeFamilyLevel.exit.defaultReviewWindowDays.max).toBe(90)
  })

  it('keeps buyer-safe vocabulary free of proof claims', () => {
    const readback = buildActionCenterMeasurementReadback(makeReadbackFixture())
    expect(readback.buyerSafeVocabulary).toContain('route ready for closeout')
    expect(readback.buyerSafeVocabulary).not.toContain('impact achieved')
  })
})
```

- [ ] **Step 2: Run the focused readback suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-measurement-readback.test.ts lib/action-center-page-data.test.ts lib/action-center-review-rhythm-data.test.ts
```

Expected:

```text
FAIL  measurement readback layers do not exist yet
```

- [ ] **Step 3: Implement the readback builder**

```ts
export type ActionCenterReadbackVisibility =
  | 'internal_only'
  | 'hr_operating_readback'
  | 'buyer_safe_reporting'

export function buildActionCenterMeasurementReadback(input: ActionCenterMeasurementReadbackInput) {
  return {
    layers: {
      routeLevel: buildRouteLevelReadback(input),
      actionLevel: buildActionLevelReadback(input),
      reviewLevel: buildReviewLevelReadback(input),
      governanceSignalLevel: buildGovernanceSignalReadback(input),
      routeFamilyLevel: buildRouteFamilyReadback(input),
    },
    buyerSafeVocabulary: [
      'follow-through reviewed',
      'action completed',
      'action stopped',
      'route still open',
      'route ready for closeout',
      'continuation needed',
      'review overdue',
      'operating rhythm stalled',
      'bounded execution active',
    ],
  }
}
```

- [ ] **Step 4: Thread readback through page-data helpers**

```ts
const readback = buildActionCenterMeasurementReadback({
  items,
  governanceQueue: reviewRhythmData.governanceQueue,
  now,
})

return {
  ...basePageData,
  governanceQueue: reviewRhythmData.governanceQueue,
  measurementReadback: readback,
}
```

- [ ] **Step 5: Re-run the readback suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-measurement-readback.test.ts lib/action-center-page-data.test.ts lib/action-center-review-rhythm-data.test.ts
```

Expected:

```text
PASS  measurement readback layers and page-data integration
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-measurement-readback.ts frontend/lib/action-center-measurement-readback.test.ts frontend/lib/action-center-review-rhythm-data.ts frontend/lib/action-center-page-data.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center measurement readback layers"
```

### Task 4: Finalize Metric Definitions, Visibility, And KPI Interpretation

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-bounded-execution-metrics.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-bounded-execution-metrics.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-measurement-readback.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-measurement-readback.test.ts`

- [ ] **Step 1: Write the failing metric-definition tests**

```ts
import { describe, expect, it } from 'vitest'
import { buildActionCenterMetricCatalog } from '@/lib/action-center-bounded-execution-metrics'

describe('buildActionCenterMetricCatalog', () => {
  it('defines blocked_action_rate and route_ready_for_closeout_rate', () => {
    const catalog = buildActionCenterMetricCatalog()
    expect(catalog.blocked_action_rate.visibility).toBe('buyer_safe_reporting')
    expect(catalog.route_ready_for_closeout_rate.doesNotProve).toContain('route success')
  })

  it('keeps action completion readback bounded', () => {
    const catalog = buildActionCenterMetricCatalog()
    expect(catalog.action_completion_rate.interpretation).toContain('completed state')
    expect(catalog.action_completion_rate.doesNotProve).toContain('route resolution')
  })
})
```

- [ ] **Step 2: Run the focused metric suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-bounded-execution-metrics.test.ts lib/action-center-measurement-readback.test.ts
```

Expected:

```text
FAIL  Batch B metric catalog is incomplete
```

- [ ] **Step 3: Extend the metric catalog**

```ts
export interface ActionCenterMetricDefinition {
  formula: string
  objectAnchor: 'route' | 'action' | 'review' | 'governance_signal'
  visibility: 'internal_only' | 'hr_operating_readback' | 'buyer_safe_reporting'
  interpretation: string
  doesNotProve: string
}

export function buildActionCenterMetricCatalog(): Record<string, ActionCenterMetricDefinition> {
  return {
    route_to_action_conversion_rate: {
      formula: 'routes_with_valid_action / routes_where_execution_expected',
      objectAnchor: 'route',
      visibility: 'hr_operating_readback',
      interpretation: 'Shows how often expected execution becomes an explicit action.',
      doesNotProve: 'Does not prove action quality or intervention success.',
    },
    blocked_action_rate: {
      formula: 'actions_with_blocker_signal / active_actions',
      objectAnchor: 'action',
      visibility: 'buyer_safe_reporting',
      interpretation: 'Shows how often execution is blocked inside active bounded actions.',
      doesNotProve: 'Does not prove root cause or organizational risk level.',
    },
  }
}
```

- [ ] **Step 4: Surface KPI interpretation in readback**

```ts
const metricCatalog = buildActionCenterMetricCatalog()

return {
  ...readback,
  metricInterpretationGuide: Object.entries(metricCatalog).map(([metricName, definition]) => ({
    metricName,
    interpretation: definition.interpretation,
    doesNotProve: definition.doesNotProve,
    visibility: definition.visibility,
  })),
}
```

- [ ] **Step 5: Re-run the metric suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-bounded-execution-metrics.test.ts lib/action-center-measurement-readback.test.ts
```

Expected:

```text
PASS  Batch B metric catalog and KPI interpretation rails
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-bounded-execution-metrics.ts frontend/lib/action-center-bounded-execution-metrics.test.ts frontend/lib/action-center-measurement-readback.ts frontend/lib/action-center-measurement-readback.test.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Finalize Action Center Batch B metric definitions"
```

### Task 5: Wire Unified Queue And Readback Into Dashboard Surfaces

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-governance-queue.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-governance-queue.test.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-measurement-readback.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-measurement-readback.test.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-oversight.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\(dashboard)\action-center\page.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\(dashboard)\action-center\page.overview-shell.test.ts`

- [ ] **Step 1: Write the failing dashboard-surface tests**

```tsx
import { render, screen } from '@testing-library/react'
import { ActionCenterGovernanceQueue } from '@/components/dashboard/action-center-governance-queue'

it('renders unified queue items with why-in-queue copy', () => {
  render(<ActionCenterGovernanceQueue queue={makeGovernanceQueueFixture()} />)
  expect(screen.getByText('Waarom nu in de queue')).toBeInTheDocument()
  expect(screen.getByText('HR review needed')).toBeInTheDocument()
})

it('renders buyer-safe readback without proof copy', () => {
  render(<ActionCenterMeasurementReadback readback={makeMeasurementReadbackFixture()} />)
  expect(screen.getByText('Bounded execution active')).toBeInTheDocument()
  expect(screen.queryByText('Impact achieved')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the dashboard-focused suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run components/dashboard/action-center-governance-queue.test.tsx components/dashboard/action-center-measurement-readback.test.tsx components/dashboard/review-rhythm-oversight.test.tsx "app/(dashboard)/action-center/page.overview-shell.test.ts"
```

Expected:

```text
FAIL  unified queue and readback surfaces are not mounted yet
```

- [ ] **Step 3: Create the unified queue component**

```tsx
export function ActionCenterGovernanceQueue({ queue }: { queue: ActionCenterGovernanceQueueModel }) {
  if (queue.items.length === 0) return null

  return (
    <DashboardSection
      surface="ops"
      eyebrow="Governance queue"
      title="Waar HR nu moet ingrijpen"
      description="Een route-first queue met bounded signalen, aanbevelingen en directe governance-acties."
    >
      {queue.items.map((item) => (
        <DashboardPanel key={`${item.routeId}:${item.primarySignal}`} surface="ops" tone={item.severity === 'high' ? 'amber' : 'slate'}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">{item.recommendation}</p>
          <p className="mt-2 text-sm font-semibold">{item.scopeLabel}</p>
          <p className="mt-1 text-xs text-[color:var(--dashboard-text)]">Waarom nu in de queue: {item.whyInQueue}</p>
        </DashboardPanel>
      ))}
    </DashboardSection>
  )
}
```

- [ ] **Step 4: Mount queue and readback on the Action Center page**

```tsx
<ActionCenterGovernanceQueue queue={pageData.governanceQueue} />
<ActionCenterMeasurementReadback readback={pageData.measurementReadback} />
```

- [ ] **Step 5: Re-run the dashboard suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run components/dashboard/action-center-governance-queue.test.tsx components/dashboard/action-center-measurement-readback.test.tsx components/dashboard/review-rhythm-oversight.test.tsx "app/(dashboard)/action-center/page.overview-shell.test.ts"
```

Expected:

```text
PASS  unified governance queue and readback dashboard surfaces
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/components/dashboard/action-center-governance-queue.tsx frontend/components/dashboard/action-center-governance-queue.test.tsx frontend/components/dashboard/action-center-measurement-readback.tsx frontend/components/dashboard/action-center-measurement-readback.test.tsx frontend/components/dashboard/review-rhythm-oversight.tsx "frontend/app/(dashboard)/action-center/page.tsx" "frontend/app/(dashboard)/action-center/page.overview-shell.test.ts"
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Wire Action Center Batch B governance surfaces"
```

### Task 6: Lock Route-Family Scenario Coverage, Test Strategy, And Regression Hardening

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-measurement-readback.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance-queues.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-measurement-readback.test.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-20-batch-b-governance-measurement-readback-implementation.md`

- [ ] **Step 1: Add scenario-readback tests for both route families**

```ts
it('keeps ExitScan completed-action readback non-causal', () => {
  const readback = buildActionCenterMeasurementReadback(makeExitCompletedActionFixture())
  expect(readback.layers.routeFamilyLevel.exit.closeoutQuestion).toContain('what was chosen')
  expect(readback.metricInterpretationGuide.find((item) => item.metricName === 'action_completion_rate')?.doesNotProve).toContain('route resolution')
})

it('keeps RetentieScan repeated-no-progress readback out of MTO-light framing', () => {
  const readback = buildActionCenterMeasurementReadback(makeRetentionNoProgressFixture())
  expect(readback.layers.routeFamilyLevel.retention.confidenceFraming).toContain('stay-intent')
  expect(JSON.stringify(readback)).not.toContain('MTO')
})
```

- [ ] **Step 2: Run the full Batch B regression slice**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-governance.test.ts lib/action-center-governance-queues.test.ts lib/action-center-governance-interventions.test.ts lib/action-center-review-rhythm-data.test.ts lib/action-center-measurement-readback.test.ts lib/action-center-bounded-execution-metrics.test.ts components/dashboard/action-center-governance-queue.test.tsx components/dashboard/action-center-measurement-readback.test.tsx components/dashboard/review-rhythm-oversight.test.tsx app/api/action-center-governance-interventions/route.test.ts "app/(dashboard)/action-center/page.overview-shell.test.ts"
```

Expected:

```text
PASS  Batch B governance and measurement readback regression suites
```

- [ ] **Step 3: Run the production build check for dashboard codepaths**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npm run build
```

Expected:

```text
Compiled successfully for Batch B Action Center changes; any remaining stop must be the known unrelated auth baseline.
```

- [ ] **Step 4: Record verification notes in this plan**

```md
## Verification Notes

- Unified HR governance queue verified
- Bounded HR intervention API verified
- Readback layers and visibility contract verified
- Metric formulas and KPI interpretation guide verified
- ExitScan and RetentieScan scenario readbacks verified
- No route-family expansion, off-platform canonical writes, or proof claims introduced
```

- [ ] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-measurement-readback.test.ts frontend/lib/action-center-governance-queues.test.ts frontend/components/dashboard/action-center-measurement-readback.test.tsx docs/superpowers/plans/2026-05-20-batch-b-governance-measurement-readback-implementation.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Close out Batch B governance readback hardening"
```

---

## Self-Review

### Spec coverage

- governance queue taxonomy and queue rules: Task 1
- intervention logic and audit behavior: Task 2
- measurement readback layers: Task 3
- metric definitions, visibility, and KPI interpretation: Task 4
- buyer-safe vocabulary and scenario readbacks in UI: Task 5
- route-family scenario coverage, test strategy, and verification hardening: Task 6

### Placeholder scan

- No `TBD`, `TODO`, or "implement later" placeholders remain.
- Each task includes exact files, commands, expected outcomes, and representative code.

### Type consistency

- queue codes, intervention types, metric names, and route-family labels match the Batch B spec vocabulary.
- No task introduces new route families, off-platform truth, or workflow broadening.
