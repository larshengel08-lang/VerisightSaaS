# Action Center Bounded Execution Enterprise Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the existing route-bound manager action model into an enterprise-grade bounded execution layer for `exit` and `retention`, without broadening Action Center into generic workflow software.

**Architecture:** Keep the route canonical and elevate the current action-card layer by centralizing action contract, transition truth, thresholds, and measurement event semantics in the shared constitution helpers. Then align the existing action APIs, review flows, review rhythm oversight, and compact manager editors to that truth so draft validation, HR intervention, execution signals, and operating metrics all derive from one bounded model.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, existing Action Center route/action/review APIs, Supabase SQL patch files plus `schema.sql`, existing review rhythm oversight surfaces.

---

## Scope Check

This plan implements the hardened bounded-execution spec and nothing broader.

In scope:

- route-bound action-card contract
- draft/invalid/HR-review action validation
- semantic action lifecycle and transition enforcement
- compact manager create/review UX
- HR execution signals
- measurement-readiness events and metric support

Out of scope:

- new route families beyond `exit` and `retention`
- Teams / Slack / multichannel expansion
- Graph-required behavior
- off-platform canonical writes
- subtasks, project boards, or generic workflow automation
- manager route closeout or reopen
- buyer-facing packaging artifacts themselves
- adoption proof claims

Source of truth:

- [2026-05-20-action-center-bounded-execution-enterprise-design.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-action-center-bounded-execution-enterprise-design.md)

---

## File Structure Guidance

Use the existing Action Center modules instead of creating a second execution model:

- `frontend/lib/action-center-constitution.ts`
  - extend as the canonical source for action states, transition rules, route thresholds, and draft dispositions
- `frontend/lib/action-center-route-actions.ts`
  - upgrade from simple route-action validation to bounded execution contract validation
- `frontend/lib/action-center-action-reviews.ts`
  - upgrade review payloads to evidence grammar plus outcome-to-state consequence helpers
- `frontend/app/api/action-center-route-actions/route.ts`
  - enforce draft validation, HR-review disposition, and active-action limits
- `frontend/app/api/action-center-action-reviews/route.ts`
  - enforce review consequence mapping and canonical state changes
- `frontend/components/dashboard/action-center-route-action-editor.tsx`
  - keep the create flow compact, bounded, and route-contextual
- `frontend/components/dashboard/action-center-action-review-editor.tsx`
  - simplify review UX while still collecting bounded evidence
- `frontend/lib/action-center-review-rhythm-data.ts`
  - derive HR governance signals for action execution
- `frontend/components/dashboard/review-rhythm-oversight.tsx`
  - show HR-only bounded action execution signals
- `frontend/lib/action-center-bounded-execution-metrics.ts`
  - new helper for event names, payload shapes, and metric formulas
- `supabase/action_center_constitution_adoption_readiness.sql`
  - extend the existing readiness patch instead of creating a second schema stream
- `supabase/schema.sql`
  - keep the canonical schema mirror in sync

---

### Task 1: Harden The Action Card Contract And Draft Validation

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-actions.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-actions.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-actions\route.test.ts`

- [ ] **Step 1: Write the failing validation tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  validateActionCenterRouteActionDraftInput,
  type ActionCenterRouteActionDraftInput,
} from '@/lib/action-center-route-actions'

describe('validateActionCenterRouteActionDraftInput', () => {
  it('marks a concrete route-bound action as valid', () => {
    const result = validateActionCenterRouteActionDraftInput({
      primary_action_theme_key: 'werkdruk',
      primary_action_text: 'Plan deze week twee gerichte teamgesprekken over piekbelasting.',
      primary_action_expected_effect: 'Binnen twee weken moet zichtbaar worden of piekmomenten eerder worden gemeld.',
      primary_action_status: 'open',
      review_scheduled_for: '2026-07-01',
    } satisfies Partial<ActionCenterRouteActionDraftInput>)

    expect(result.validationDisposition).toBe('valid')
    expect(result.semanticState).toBe('draft')
  })

  it('holds broad project language for HR review', () => {
    expect(() =>
      validateActionCenterRouteActionDraftInput({
        primary_action_theme_key: 'werkdruk',
        primary_action_text: 'Start een breed HR-project om werkdruk overal op te lossen.',
        primary_action_expected_effect: 'De cultuur moet verbeteren.',
        primary_action_status: 'open',
        review_scheduled_for: '2026-07-01',
      }),
    ).toThrow('Route action requires HR review.')
  })

  it('rejects dossier-like language', () => {
    expect(() =>
      validateActionCenterRouteActionDraftInput({
        primary_action_theme_key: 'werkdruk',
        primary_action_text: 'Monitor employee X in detail.',
        primary_action_expected_effect: 'Track individual risk more closely.',
        primary_action_status: 'open',
        review_scheduled_for: '2026-07-01',
      }),
    ).toThrow('Route action is outside bounded execution.')
  })
})
```

- [ ] **Step 2: Run the tests to confirm the gap**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-actions.test.ts app/api/action-center-route-actions/route.test.ts
```

Expected:

```text
FAIL  validateActionCenterRouteActionDraftInput
Error: Route action requires HR review.
```

- [ ] **Step 3: Implement bounded draft validation and disposition**

```ts
export type ActionCenterActionDraftDisposition =
  | 'valid'
  | 'invalid'
  | 'needs_hr_review'

export type ActionCenterActionSemanticState =
  | 'draft'
  | 'active'
  | 'review_due'
  | 'in_review'
  | 'blocked'
  | 'completed'
  | 'stopped'
  | 'superseded'

export type ValidatedActionCenterRouteActionDraft = ActionCenterRouteActionDraftInput & {
  semanticState: 'draft'
  validationDisposition: ActionCenterActionDraftDisposition
}

export function validateActionCenterRouteActionDraftInput(
  input: Partial<ActionCenterRouteActionDraftInput> | null | undefined,
): ValidatedActionCenterRouteActionDraft {
  const validated = /* existing field validation */

  if (looksLikeEmployeeDossierLanguage(validated.primary_action_text, validated.primary_action_expected_effect)) {
    throw new Error('Route action is outside bounded execution.')
  }

  if (looksLikeBroadProjectLanguage(validated.primary_action_text, validated.primary_action_expected_effect)) {
    throw new Error('Route action requires HR review.')
  }

  return {
    ...validated,
    semanticState: 'draft',
    validationDisposition: 'valid',
  }
}
```

- [ ] **Step 4: Re-run the focused tests**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-actions.test.ts app/api/action-center-route-actions/route.test.ts
```

Expected:

```text
PASS  lib/action-center-route-actions.test.ts
PASS  app/api/action-center-route-actions/route.test.ts
```

- [ ] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-constitution.ts frontend/lib/action-center-route-actions.ts frontend/lib/action-center-route-actions.test.ts frontend/app/api/action-center-route-actions/route.test.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Harden Action Center action-card validation"
```

### Task 2: Enforce The Action Lifecycle And Transition Matrix

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-action-reviews.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-action-reviews.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-action-reviews\route.test.ts`

- [ ] **Step 1: Write failing transition tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  isActionCenterActionStateTransitionAllowed,
  resolveActionCenterActionReviewTransition,
} from '@/lib/action-center-constitution'

describe('action state transition matrix', () => {
  it('does not allow draft to jump to completed', () => {
    expect(
      isActionCenterActionStateTransitionAllowed({
        actor: 'manager_participant',
        fromState: 'draft',
        toState: 'completed',
      }),
    ).toBe(false)
  })

  it('does not allow blocked to jump to completed without review', () => {
    expect(
      isActionCenterActionStateTransitionAllowed({
        actor: 'manager_participant',
        fromState: 'blocked',
        toState: 'completed',
      }),
    ).toBe(false)
  })

  it('maps review outcomes back to canonical action states', () => {
    expect(resolveActionCenterActionReviewTransition('effect-zichtbaar')).toBe('completed')
    expect(resolveActionCenterActionReviewTransition('bijsturen-nodig')).toBe('active')
    expect(resolveActionCenterActionReviewTransition('nog-te-vroeg')).toBe('active')
    expect(resolveActionCenterActionReviewTransition('stoppen')).toBe('stopped')
  })
})
```

- [ ] **Step 2: Run the lifecycle tests and confirm failure**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-constitution.test.ts lib/action-center-action-reviews.test.ts app/api/action-center-action-reviews/route.test.ts
```

Expected:

```text
FAIL  isActionCenterActionStateTransitionAllowed is not a function
```

- [ ] **Step 3: Implement transition truth and review consequence mapping**

```ts
export const ACTION_CENTER_ACTION_TRANSITION_RULES = [
  { fromState: 'draft', toState: 'active', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'active', toState: 'review_due', actors: ['system_channel'] },
  { fromState: 'review_due', toState: 'in_review', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'in_review', toState: 'active', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'in_review', toState: 'completed', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'in_review', toState: 'stopped', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'blocked', toState: 'in_review', actors: ['manager_participant', 'hr_rhythm_owner'] },
] as const

export function resolveActionCenterActionReviewTransition(outcome: ActionCenterActionOutcome) {
  switch (outcome) {
    case 'effect-zichtbaar':
      return 'completed'
    case 'stoppen':
      return 'stopped'
    case 'bijsturen-nodig':
    case 'nog-te-vroeg':
    default:
      return 'active'
  }
}
```

- [ ] **Step 4: Re-run the lifecycle suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-constitution.test.ts lib/action-center-action-reviews.test.ts app/api/action-center-action-reviews/route.test.ts
```

Expected:

```text
PASS  lib/action-center-constitution.test.ts
PASS  lib/action-center-action-reviews.test.ts
PASS  app/api/action-center-action-reviews/route.test.ts
```

- [ ] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-constitution.ts frontend/lib/action-center-constitution.test.ts frontend/lib/action-center-action-reviews.ts frontend/lib/action-center-action-reviews.test.ts frontend/app/api/action-center-action-reviews/route.test.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center action transition truth"
```

### Task 3: Add Route Thresholds, Draft Persistence, And Compact Manager Editors

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-route-action-editor.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-action-review-editor.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-action-editor.test.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-action-review-editor.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\tests\e2e\action-center-route-action-cards.spec.ts`

- [ ] **Step 1: Write failing threshold and compact-UX tests**

```ts
it('exposes stricter execution thresholds per approved route family', () => {
  expect(getActionCenterRouteDefaults('exit')).toMatchObject({
    reviewWindowDays: { min: 60, max: 90 },
    stuckActiveWarningDays: 30,
    reviewDueGraceDays: 7,
    sprawlRiskCount: 3,
  })

  expect(getActionCenterRouteDefaults('retention')).toMatchObject({
    reviewWindowDays: { min: 45, max: 90 },
    reviewDueGraceDays: 7,
  })
})

it('renders a compact review form with evidence source and conditional guidance', () => {
  const html = renderToStaticMarkup(
    React.createElement(ActionCenterActionReviewEditor, { onSave: vi.fn() }),
  )

  expect(html).toContain('Wat zagen we terug?')
  expect(html).toContain('Bron van observatie')
  expect(html).toContain('Hoe zeker zijn we hiervan?')
})
```

- [ ] **Step 2: Run the focused editor/defaults tests**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-defaults.test.ts lib/action-center-route-action-editor.test.ts lib/action-center-action-review-editor.test.ts
```

Expected:

```text
FAIL  expected stuckActiveWarningDays to be defined
FAIL  Cannot find module '@/components/dashboard/action-center-action-review-editor'
```

- [ ] **Step 3: Implement route thresholds and lighter create/review editors**

```ts
export type ActionCenterExecutionThresholds = {
  stuckActiveWarningDays: number
  reviewDueGraceDays: number
  sprawlRiskCount: number
  repeatedReviewWarningCount: number
}

// route defaults
exit: {
  reviewWindowDays: { min: 60, max: 90 },
  stuckActiveWarningDays: 30,
  reviewDueGraceDays: 7,
  sprawlRiskCount: 3,
  repeatedReviewWarningCount: 2,
}

// review editor fields
type ActionCenterActionReviewEditorValue = {
  observation: string
  actionOutcome: ActionCenterActionOutcome
  evidenceSource: ActionCenterActionEvidenceSource
  confidenceLevel: ActionCenterActionConfidenceLevel
  followUpNote: string
}
```

- [ ] **Step 4: Re-run the editor/defaults suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-defaults.test.ts lib/action-center-route-action-editor.test.ts lib/action-center-action-review-editor.test.ts tests/e2e/action-center-route-action-cards.spec.ts
```

Expected:

```text
PASS  lib/action-center-route-defaults.test.ts
PASS  lib/action-center-route-action-editor.test.ts
PASS  lib/action-center-action-review-editor.test.ts
```

- [ ] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-route-defaults.ts frontend/lib/action-center-route-defaults.test.ts frontend/components/dashboard/action-center-route-action-editor.tsx frontend/components/dashboard/action-center-action-review-editor.tsx frontend/lib/action-center-route-action-editor.test.ts frontend/lib/action-center-action-review-editor.test.ts frontend/tests/e2e/action-center-route-action-cards.spec.ts
git -C 'C:\Users\\larsh\\Desktop\\Business\\Verisight\\.worktrees\\spec-hr-routebeheer-structure' commit -m "Simplify Action Center manager execution flow"
```

### Task 4: Derive HR Governance Signals And Route-Level Oversight

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-oversight.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\review-rhythm-oversight.test.tsx`

- [ ] **Step 1: Write failing governance-signal tests**

```ts
it('flags action sprawl risk above three active actions', () => {
  expect(
    deriveActionCenterExecutionSignals({
      scanType: 'exit',
      activeActionCount: 4,
      repeatedReviewWithoutProgressCount: 0,
      missingReviewCount: 0,
      staleRoute: false,
    }),
  ).toContain('action_sprawl_risk')
})

it('flags repeated review without progress after the route threshold', () => {
  expect(
    deriveActionCenterExecutionSignals({
      scanType: 'retention',
      activeActionCount: 1,
      repeatedReviewWithoutProgressCount: 3,
      missingReviewCount: 0,
      staleRoute: false,
    }),
  ).toContain('repeated_review_without_progress')
})
```

- [ ] **Step 2: Run the governance suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts components/dashboard/review-rhythm-oversight.test.tsx
```

Expected:

```text
FAIL  deriveActionCenterExecutionSignals is not defined
```

- [ ] **Step 3: Implement bounded HR execution signals**

```ts
export type ActionCenterExecutionSignal =
  | 'missing_action_where_execution_is_expected'
  | 'action_sprawl_risk'
  | 'missing_action_review'
  | 'stuck_action'
  | 'repeated_review_without_progress'
  | 'route_ready_for_closeout'

export function deriveActionCenterExecutionSignals(input: {
  scanType: ActionCenterApprovedRouteFamily
  activeActionCount: number
  repeatedReviewWithoutProgressCount: number
  missingReviewCount: number
  staleRoute: boolean
}) {
  const defaults = getActionCenterRouteDefaults(input.scanType)
  const signals: ActionCenterExecutionSignal[] = []

  if (input.activeActionCount > defaults.sprawlRiskCount) signals.push('action_sprawl_risk')
  if (input.repeatedReviewWithoutProgressCount > defaults.repeatedReviewWarningCount) {
    signals.push('repeated_review_without_progress')
  }

  return signals
}
```

- [ ] **Step 4: Re-run the governance suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts components/dashboard/review-rhythm-oversight.test.tsx
```

Expected:

```text
PASS  lib/action-center-governance.test.ts
PASS  lib/action-center-review-rhythm-data.test.ts
PASS  components/dashboard/review-rhythm-oversight.test.tsx
```

- [ ] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-governance.ts frontend/lib/action-center-governance.test.ts frontend/lib/action-center-review-rhythm-data.ts frontend/lib/action-center-review-rhythm-data.test.ts frontend/components/dashboard/review-rhythm-oversight.tsx frontend/components/dashboard/review-rhythm-oversight.test.tsx
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center execution governance signals"
```

### Task 5: Add Measurement-Readiness Events And SQL Support

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-bounded-execution-metrics.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-bounded-execution-metrics.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-actions\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-action-reviews\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\action_center_constitution_adoption_readiness.sql`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\schema.sql`

- [ ] **Step 1: Write failing metric-event tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  buildActionCenterMetricEvent,
  ACTION_CENTER_BOUNDED_EXECUTION_EVENT_TYPES,
} from '@/lib/action-center-bounded-execution-metrics'

describe('bounded execution metric events', () => {
  it('emits action draft and review events with canonical anchors', () => {
    expect(ACTION_CENTER_BOUNDED_EXECUTION_EVENT_TYPES).toContain('action_draft_created')
    expect(
      buildActionCenterMetricEvent('action_review_completed', {
        routeId: 'route-1',
        actionId: 'action-1',
        routeFamily: 'exit',
      }),
    ).toMatchObject({
      eventType: 'action_review_completed',
      objectAnchor: 'action_card',
      routeFamily: 'exit',
    })
  })
})
```

- [ ] **Step 2: Run the metrics tests and confirm failure**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-bounded-execution-metrics.test.ts app/api/action-center-route-actions/route.test.ts app/api/action-center-action-reviews/route.test.ts
```

Expected:

```text
FAIL  Cannot find module '@/lib/action-center-bounded-execution-metrics'
```

- [ ] **Step 3: Implement metric events and SQL support**

```ts
export const ACTION_CENTER_BOUNDED_EXECUTION_EVENT_TYPES = [
  'route_opened',
  'route_became_execution_expected',
  'action_draft_created',
  'action_draft_validated',
  'action_draft_rejected',
  'action_draft_sent_to_hr_review',
  'action_state_changed',
  'action_review_opened',
  'action_review_completed',
  'hr_chase_event',
] as const

export function buildActionCenterMetricEvent(
  eventType: ActionCenterBoundedExecutionEventType,
  payload: { routeId: string; actionId?: string | null; routeFamily: ActionCenterApprovedRouteFamily },
) {
  return {
    eventType,
    routeId: payload.routeId,
    actionId: payload.actionId ?? null,
    routeFamily: payload.routeFamily,
    objectAnchor: payload.actionId ? 'action_card' : 'follow_through_route',
  }
}
```

```sql
create table if not exists action_center_execution_events (
  id uuid primary key,
  event_type text not null,
  route_id uuid not null,
  action_id uuid null,
  route_family text not null check (route_family in ('exit', 'retention')),
  object_anchor text not null check (object_anchor in ('follow_through_route', 'action_card')),
  happened_at timestamptz not null default timezone('utc'::text, now())
);
```

- [ ] **Step 4: Re-run the metric suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-bounded-execution-metrics.test.ts app/api/action-center-route-actions/route.test.ts app/api/action-center-action-reviews/route.test.ts
```

Expected:

```text
PASS  lib/action-center-bounded-execution-metrics.test.ts
PASS  app/api/action-center-route-actions/route.test.ts
PASS  app/api/action-center-action-reviews/route.test.ts
```

- [ ] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-bounded-execution-metrics.ts frontend/lib/action-center-bounded-execution-metrics.test.ts frontend/app/api/action-center-route-actions/route.ts frontend/app/api/action-center-action-reviews/route.ts supabase/action_center_constitution_adoption_readiness.sql supabase/schema.sql
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Add Action Center bounded execution metrics"
```

### Task 6: Full Regression Verification And Plan Closeout

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-20-action-center-bounded-execution-enterprise-implementation.md`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-actions.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-action-reviews.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-bounded-execution-metrics.test.ts`

- [ ] **Step 1: Run the bounded execution regression suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-constitution.test.ts lib/action-center-route-actions.test.ts lib/action-center-action-reviews.test.ts lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts lib/action-center-route-action-editor.test.ts lib/action-center-action-review-editor.test.ts lib/action-center-bounded-execution-metrics.test.ts app/api/action-center-route-actions/route.test.ts app/api/action-center-action-reviews/route.test.ts
```

Expected:

```text
PASS  11 files
```

- [ ] **Step 2: Run the broader Action Center guardrail suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-review-rhythm.test.ts lib/action-center-review-reschedule.test.ts lib/action-center-follow-through-mail.test.ts lib/action-center-graph-sync.test.ts components/dashboard/review-rhythm-oversight.test.tsx tests/e2e/action-center-route-action-cards.spec.ts
```

Expected:

```text
PASS  Action Center adjacent regression suites
```

- [ ] **Step 3: Update the plan with verification notes**

```md
## Verification Notes

- Action contract, draft disposition, and HR-review validation verified
- Action transition matrix and review consequence mapping verified
- Manager create/review UX remained compact and bounded
- HR execution signals verified for sprawl, stuck review, and repeated no-progress loops
- Metric event schema minimum verified
```

- [ ] **Step 4: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add docs/superpowers/plans/2026-05-20-action-center-bounded-execution-enterprise-implementation.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Document bounded execution verification"
```

---

## Self-Review

### Spec coverage

- Action card contract: Task 1
- Valid/invalid action rules: Task 1
- Draft / invalid / HR-review flow: Task 1
- Enriched lifecycle and transition matrix: Task 2
- Review evidence grammar: Task 2 and Task 3
- Route-specific thresholds/defaults: Task 3
- HR intervention rules and governance signals: Task 4
- Metric formulas and event schema minimum: Task 5
- Buyer-proof boundedness support in labels/events: Task 5
- Regression / required tests: Task 6

### Placeholder scan

This plan intentionally contains:

- no `TBD`
- no `TODO`
- no “define later”
- no “similar to Task N”

### Type consistency

Canonical names used consistently in this plan:

- `ActionCenterActionDraftDisposition`
- `ActionCenterActionSemanticState`
- `resolveActionCenterActionReviewTransition`
- `deriveActionCenterExecutionSignals`
- `buildActionCenterMetricEvent`

---
