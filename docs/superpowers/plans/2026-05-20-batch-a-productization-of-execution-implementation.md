# Batch A Productization of Execution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Productize Action Center into an enterprise-worthy bounded execution layer for `exit` and `retention` by finishing action-card truth, manager execution UX, and route differentiation without broadening Action Center into workflow software.

**Architecture:** Keep the existing route-bound action-card model and harden it in place. Finalize canonical action contract, validation, lifecycle, and review consequences in shared helpers first; then align manager create/update/review UX to that truth; then finalize route differentiation defaults for `ExitScan` and `RetentieScan`; finally lock the batch down with regression tests and closeout verification.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Vitest, existing Action Center route/action/review APIs, existing review-rhythm oversight surfaces, Supabase SQL patch files plus `schema.sql`.

---

## Scope Check

This plan implements **Batch A** only.

In scope:

- Action Card Contract & Validation
- Action Lifecycle & Transition Matrix
- Draft / Invalid / HR Review Flow
- Manager Create / Update / Review UX
- ExitScan and RetentieScan Route Defaults
- Test and Regression Hardening

Out of scope:

- route-family expansion beyond `exit` and `retention`
- Teams / Slack / multichannel expansion
- Graph-required behavior
- off-platform canonical writes
- broad analytics and measurement-readback surfaces
- buyer packaging as a main workstream
- project boards, task boards, case management, or workflow broadening
- adoption proof or intervention impact claims

Source specs:

- [2026-05-20-action-center-enterprise-roadmap.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-action-center-enterprise-roadmap.md)
- [2026-05-20-batch-a-productization-of-execution-spec.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-batch-a-productization-of-execution-spec.md)
- [2026-05-20-action-center-bounded-execution-enterprise-design.md](/C:/Users/larsh/Desktop/Business/Verisight/.worktrees/spec-hr-routebeheer-structure/docs/superpowers/specs/2026-05-20-action-center-bounded-execution-enterprise-design.md)

---

## File Structure Guidance

- `frontend/lib/action-center-constitution.ts`
  - canonical action states, transition truth, approved route-family defaults, and route/action/review boundary rules
- `frontend/lib/action-center-route-actions.ts`
  - action-card contract, validation rules, invalid examples to behavior mapping, route-to-action limits
- `frontend/app/api/action-center-route-actions/route.ts`
  - fail-closed action creation, draft / invalid / HR-review persistence behavior, route-family gating
- `frontend/lib/action-center-action-reviews.ts`
  - review evidence grammar, review-outcome consequence helpers, bounded note semantics
- `frontend/app/api/action-center-action-reviews/route.ts`
  - review writes, transition enforcement, no off-platform truth drift
- `frontend/components/dashboard/action-center-route-action-editor.tsx`
  - low-friction manager create/update flow
- `frontend/components/dashboard/action-center-action-review-editor.tsx`
  - compact repeated-use review flow
- `frontend/components/dashboard/action-center-preview.tsx`
  - route-context execution entry, invalid correction feedback, blocked-action behavior
- `frontend/lib/action-center-route-defaults.ts`
  - finalized ExitScan and RetentieScan route defaults
- `frontend/lib/action-center-route-defaults.test.ts`
  - route differentiation regression tests
- `frontend/lib/action-center-governance.ts`
  - sprawl, repeated-review-without-progress, closeout-readiness signals
- `frontend/lib/action-center-review-rhythm-data.ts`
  - oversight integration for Batch A governance surfaces
- `supabase/action_center_constitution_adoption_readiness.sql`
  - keep schema patch parity for any new bounded-execution fields or constraints
- `supabase/schema.sql`
  - canonical schema mirror

---

### Task 1: Finalize Action Card Contract And Validation

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-actions.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-actions.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-actions\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-actions\route.test.ts`

- [ ] **Step 1: Write the failing contract and validation tests**

```ts
it('rejects employee-dossier-like action text', () => {
  expect(() =>
    validateActionCenterRouteActionDraftInput({
      primary_action_theme_key: 'werkdruk',
      primary_action_text: 'Monitor employee X in detail for risk.',
      primary_action_expected_effect: 'Track individual risk more closely.',
      primary_action_status: 'open',
      review_scheduled_for: '2026-07-01',
    }),
  ).toThrow('Route action is outside bounded execution.')
})

it('marks broad project language for HR review', () => {
  const result = validateActionCenterRouteActionDraftInput({
    primary_action_theme_key: 'werkdruk',
    primary_action_text: 'Start een breed HR-project om werkdruk overal op te lossen.',
    primary_action_expected_effect: 'De cultuur moet verbeteren.',
    primary_action_status: 'open',
    review_scheduled_for: '2026-07-01',
  })

  expect(result.validationDisposition).toBe('needs_hr_review')
  expect(result.semanticState).toBe('draft')
})

it('blocks more than three active actions on a route', async () => {
  const response = await POST(makeRouteActionRequest({ existingActiveActionCount: 3 }))
  expect(response.status).toBe(409)
})
```

- [ ] **Step 2: Run the focused tests to confirm the gaps**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-actions.test.ts app/api/action-center-route-actions/route.test.ts
```

Expected:

```text
FAIL  bounded action contract expectations are not yet enforced
```

- [ ] **Step 3: Implement the bounded action-card contract**

```ts
export type ActionCenterActionDraftDisposition = 'valid' | 'invalid' | 'needs_hr_review'

export function validateActionCenterRouteActionDraftInput(
  input: Partial<ActionCenterRouteActionDraftInput> | null | undefined,
): ValidatedActionCenterRouteActionDraft {
  const validated = validateRequiredActionDraftFields(input)

  if (looksLikeEmployeeDossierLanguage(validated.primary_action_text, validated.primary_action_expected_effect)) {
    return {
      ...validated,
      semanticState: 'draft',
      validationDisposition: 'invalid',
    }
  }

  if (looksLikeBroadProjectLanguage(validated.primary_action_text, validated.primary_action_expected_effect)) {
    return {
      ...validated,
      semanticState: 'draft',
      validationDisposition: 'needs_hr_review',
    }
  }

  return {
    ...validated,
    semanticState: 'draft',
    validationDisposition: 'valid',
  }
}
```

- [ ] **Step 4: Enforce route-to-action limits in the API**

```ts
if (activeActionCount > 2 && validated.validationDisposition === 'valid') {
  return NextResponse.json(
    { detail: 'Route exceeds bounded active-action limit.' },
    { status: 409 },
  )
}
```

- [ ] **Step 5: Re-run the focused tests**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-actions.test.ts app/api/action-center-route-actions/route.test.ts
```

Expected:

```text
PASS  contract and route-action validation suites
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-route-actions.ts frontend/lib/action-center-route-actions.test.ts frontend/app/api/action-center-route-actions/route.ts frontend/app/api/action-center-route-actions/route.test.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Finalize Action Center action-card contract"
```

### Task 2: Finalize Action Lifecycle And Transition Truth

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-constitution.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-action-reviews.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-action-reviews.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-action-reviews\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-action-reviews\route.test.ts`

- [ ] **Step 1: Add failing transition-truth tests**

```ts
it('allows in_review to active for no-progress review outcomes', () => {
  expect(
    isActionCenterActionStateTransitionAllowed({
      actor: 'manager_participant',
      fromState: 'in_review',
      toState: 'active',
    }),
  ).toBe(true)
})

it('does not allow blocked to completed without review', () => {
  expect(
    isActionCenterActionStateTransitionAllowed({
      actor: 'manager_participant',
      fromState: 'blocked',
      toState: 'completed',
    }),
  ).toBe(false)
})

it('maps effect-zichtbaar to completed', () => {
  expect(resolveActionCenterActionReviewTransition('effect-zichtbaar')).toBe('completed')
})
```

- [ ] **Step 2: Run the transition suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-constitution.test.ts lib/action-center-action-reviews.test.ts app/api/action-center-action-reviews/route.test.ts
```

Expected:

```text
FAIL  transition matrix or review consequence gaps
```

- [ ] **Step 3: Finalize lifecycle states and transition helpers**

```ts
export const ACTION_CENTER_ACTION_TRANSITION_RULES = Object.freeze([
  { fromState: 'draft', toState: 'active', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'active', toState: 'review_due', actors: ['system_channel'] },
  { fromState: 'review_due', toState: 'in_review', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'in_review', toState: 'active', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'in_review', toState: 'completed', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'in_review', toState: 'stopped', actors: ['manager_participant', 'hr_rhythm_owner'] },
  { fromState: 'blocked', toState: 'in_review', actors: ['manager_participant', 'hr_rhythm_owner'] },
] as const)
```

- [ ] **Step 4: Enforce canonical review consequences in the review route**

```ts
const nextSemanticState = resolveActionCenterActionReviewTransition(validated.action_outcome)

if (
  !isActionCenterActionStateTransitionAllowed({
    actor: 'manager_participant',
    fromState: currentSemanticState,
    toState: nextSemanticState,
  })
) {
  return NextResponse.json({ detail: 'Route action transition is not allowed.' }, { status: 409 })
}
```

- [ ] **Step 5: Re-run the transition suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-constitution.test.ts lib/action-center-action-reviews.test.ts app/api/action-center-action-reviews/route.test.ts
```

Expected:

```text
PASS  lifecycle and review consequence suites
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-constitution.ts frontend/lib/action-center-constitution.test.ts frontend/lib/action-center-action-reviews.ts frontend/lib/action-center-action-reviews.test.ts frontend/app/api/action-center-action-reviews/route.ts frontend/app/api/action-center-action-reviews/route.test.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Finalize Action Center lifecycle truth"
```

### Task 3: Implement Draft, Invalid, And HR Review Flow

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-actions\route.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\api\action-center-route-actions\route.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-route-action-editor.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-preview.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-action-editor.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\app\(dashboard)\action-center\page.route-shell.test.ts`

- [ ] **Step 1: Add failing UX and API tests for draft/invalid/HR-review behavior**

```ts
it('returns validationDisposition for invalid action drafts', async () => {
  const response = await POST(makeRouteActionRequest({ primary_action_text: 'Improve culture everywhere.' }))
  const result = await response.json()
  expect(result.validationDisposition).toBe('needs_hr_review')
})

it('shows explicit correction feedback for invalid action text', () => {
  render(<ActionCenterRouteActionEditor {...props} />)
  expect(screen.getByText('Pas deze actie aan zodat hij bounded en route-specifiek is.')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused draft-flow suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run app/api/action-center-route-actions/route.test.ts lib/action-center-route-action-editor.test.ts "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
FAIL  draft / invalid / HR-review flow not fully surfaced
```

- [ ] **Step 3: Surface disposition-specific API results**

```ts
return NextResponse.json({
  action: projectedAction,
  validationDisposition: validated.validationDisposition,
  validationMessage:
    validated.validationDisposition === 'invalid'
      ? 'Pas deze actie aan zodat hij bounded en route-specifiek is.'
      : validated.validationDisposition === 'needs_hr_review'
        ? 'Deze actie vraagt eerst HR-beoordeling.'
        : null,
})
```

- [ ] **Step 4: Keep the editor correction path compact**

```tsx
{submissionState.validationDisposition === 'invalid' ? (
  <p className="text-sm text-[color:var(--dashboard-warning)]">
    Pas deze actie aan zodat hij bounded en route-specifiek is.
  </p>
) : null}
```

- [ ] **Step 5: Re-run the draft-flow suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run app/api/action-center-route-actions/route.test.ts lib/action-center-route-action-editor.test.ts "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  draft, invalid, and HR-review behavior
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/app/api/action-center-route-actions/route.ts frontend/app/api/action-center-route-actions/route.test.ts frontend/components/dashboard/action-center-route-action-editor.tsx frontend/components/dashboard/action-center-preview.tsx frontend/lib/action-center-route-action-editor.test.ts "frontend/app/(dashboard)/action-center/page.route-shell.test.ts"
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Wire Action Center draft and HR review flow"
```

### Task 4: Harden Manager Create, Update, And Review UX

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-route-action-editor.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-action-review-editor.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\components\dashboard\action-center-preview.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-action-review-editor.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-preview-route-fields.test.ts`

- [ ] **Step 1: Add failing repeated-use UX tests**

```ts
it('keeps the review form compact for repeated use', () => {
  render(<ActionCenterActionReviewEditor {...props} />)
  expect(screen.getByLabelText('Wat zagen we terug?')).toBeInTheDocument()
  expect(screen.getByLabelText('Bron')).toBeInTheDocument()
  expect(screen.queryByLabelText('Losse aanvullende analyse')).not.toBeInTheDocument()
})

it('shows one primary create action inside route context', () => {
  render(<ActionCenterPreview {...props} />)
  expect(screen.getAllByText('Actie toevoegen')).toHaveLength(1)
})
```

- [ ] **Step 2: Run the focused manager-UX suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-action-review-editor.test.ts lib/action-center-preview-route-fields.test.ts
```

Expected:

```text
FAIL  manager execution UX still too heavy or ambiguous
```

- [ ] **Step 3: Simplify the review entry contract**

```tsx
<fieldset>
  <legend>Wat zagen we terug?</legend>
  <ActionOutcomeRadioGroup value={value.actionOutcome} onChange={setActionOutcome} />
</fieldset>

<Select label="Bron" value={value.evidenceSource} onValueChange={setEvidenceSource}>
  <SelectItem value="manager-observation">Managerobservatie</SelectItem>
  <SelectItem value="team-conversation">Teamgesprek</SelectItem>
  <SelectItem value="other-bounded-source">Andere bounded bron</SelectItem>
</Select>
```

- [ ] **Step 4: Keep route-context entry primary**

```tsx
<Button type="button" onClick={openActionComposer}>
  Actie toevoegen
</Button>
```

- [ ] **Step 5: Re-run the manager-UX suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-action-review-editor.test.ts lib/action-center-preview-route-fields.test.ts
```

Expected:

```text
PASS  compact manager execution UX preserved
```

- [ ] **Step 6: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/components/dashboard/action-center-route-action-editor.tsx frontend/components/dashboard/action-center-action-review-editor.tsx frontend/components/dashboard/action-center-preview.tsx frontend/lib/action-center-action-review-editor.test.ts frontend/lib/action-center-preview-route-fields.test.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Harden Action Center manager execution UX"
```

### Task 5: Finalize ExitScan And RetentieScan Route Defaults

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-route-defaults.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-governance.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-rhythm-data.ts`

- [ ] **Step 1: Add failing route-differentiation tests**

```ts
it('keeps ExitScan review window at 60-90 days', () => {
  expect(getActionCenterRouteDefaults('exit')).toMatchObject({
    reviewWindowDays: { min: 60, max: 90 },
  })
})

it('keeps RetentieScan review window at 45-90 days', () => {
  expect(getActionCenterRouteDefaults('retention')).toMatchObject({
    reviewWindowDays: { min: 45, max: 90 },
  })
})

it('derives governance labels from bounded route family truth', () => {
  expect(getActionCenterGovernanceSignalLabel('route_ready_for_closeout')).toBe('Klaar voor closeout')
})
```

- [ ] **Step 2: Run the route-default and governance suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts
```

Expected:

```text
FAIL  route defaults or route differentiation readback incomplete
```

- [ ] **Step 3: Finalize route defaults and route-family alignment**

```ts
const ACTION_CENTER_EXECUTION_THRESHOLDS = {
  exit: {
    stuckActiveWarningDays: 30,
    reviewDueGraceDays: 7,
    sprawlRiskCount: 3,
    repeatedReviewWarningCount: 2,
  },
  retention: {
    stuckActiveWarningDays: { min: 21, max: 30 },
    reviewDueGraceDays: 7,
    sprawlRiskCount: 3,
    repeatedReviewWarningCount: 2,
  },
} satisfies Record<ActionCenterApprovedRouteFamily, ActionCenterExecutionThresholds>
```

- [ ] **Step 4: Re-run the route-default and governance suites**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts
```

Expected:

```text
PASS  route defaults and governance alignment suites
```

- [x] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add frontend/lib/action-center-route-defaults.ts frontend/lib/action-center-route-defaults.test.ts frontend/lib/action-center-governance.ts frontend/lib/action-center-governance.test.ts frontend/lib/action-center-review-rhythm-data.ts
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Finalize Action Center route differentiation defaults"
```

### Task 6: Harden Schema Parity And Full Batch-A Regressions

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\action_center_constitution_adoption_readiness.sql`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\supabase\schema.sql`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-20-batch-a-productization-of-execution-implementation.md`

- [x] **Step 1: Add any missing schema parity for new bounded-execution fields or constraints**

```sql
alter table public.action_center_route_actions
  add column if not exists semantic_state text,
  add column if not exists validation_disposition text;

alter table public.action_center_route_actions
  add constraint action_center_route_actions_semantic_state_check
  check (semantic_state in ('draft', 'active', 'review_due', 'in_review', 'blocked', 'completed', 'stopped', 'superseded'));
```

- [x] **Step 2: Run the full Batch A regression suite**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npx vitest run lib/action-center-constitution.test.ts lib/action-center-route-actions.test.ts lib/action-center-action-reviews.test.ts lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts lib/action-center-route-action-editor.test.ts lib/action-center-action-review-editor.test.ts lib/action-center-bounded-execution-metrics.test.ts app/api/action-center-route-actions/route.test.ts app/api/action-center-action-reviews/route.test.ts components/dashboard/review-rhythm-oversight.test.tsx
```

Expected:

```text
PASS  Batch A bounded execution regression suites
```

- [x] **Step 3: Run production build check for Action Center codepaths**

Run:

```powershell
Set-Location 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend'
npm run build
```

Expected:

```text
Compiled successfully for Action Center bounded execution changes; any remaining stop must be unrelated known environment baseline
```

- [x] **Step 4: Record verification notes in this plan**

```md
## Verification Notes

- Batch A contract validation verified
- Batch A transition matrix verified
- Draft / invalid / HR-review behavior verified
- Compact manager execution UX verified
- ExitScan and RetentieScan route differentiation defaults verified
- No Action Center route-family expansion or off-platform write broadening introduced
```

## Verification Notes

- 2026-05-21: added missing schema parity for `action_center_route_actions` and `action_center_action_reviews` in both owned SQL files, including Batch A `semantic_state` and `validation_disposition` constraints plus compact review evidence fields.
- Full Batch A regression suite passed with `12` test files and `132` tests green:
  `npx vitest run lib/action-center-constitution.test.ts lib/action-center-route-actions.test.ts lib/action-center-action-reviews.test.ts lib/action-center-route-defaults.test.ts lib/action-center-governance.test.ts lib/action-center-review-rhythm-data.test.ts lib/action-center-route-action-editor.test.ts lib/action-center-action-review-editor.test.ts lib/action-center-bounded-execution-metrics.test.ts app/api/action-center-route-actions/route.test.ts app/api/action-center-action-reviews/route.test.ts components/dashboard/review-rhythm-oversight.test.tsx`
- Production build check compiled successfully, then failed during type-check on an existing non-owned Action Center file:
  `components/dashboard/action-center-preview.tsx:891`
- Build blocker detail:
  `Type '"afgerond" | "gestopt" | "open-verzoek" | "te-bespreken" | "reviewbaar" | "in-uitvoering" | "geblokkeerd"' is not assignable to type 'ActionCenterRouteStatus | null'.`
- The build also reported existing ESLint warnings in `app/api/action-center-route-closeouts/route.ts`, `app/producten/[slug]/page.tsx`, `components/marketing/follow-on-route-page.tsx`, `components/marketing/home-insight-action-demo.tsx`, and `lib/action-center-governance.ts`.
- No Action Center route-family expansion or off-platform write broadening was introduced by this closeout.

- [x] **Step 5: Commit**

```powershell
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' add supabase/action_center_constitution_adoption_readiness.sql supabase/schema.sql docs/superpowers/plans/2026-05-20-batch-a-productization-of-execution-implementation.md
git -C 'C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure' commit -m "Close out Batch A execution hardening"
```

---

## Self-Review

### Spec coverage

- action-card contract, quality rules, and invalid examples: Task 1
- lifecycle and transition matrix: Task 2
- draft / invalid / HR-review flow: Task 3
- manager create / update / review UX: Task 4
- ExitScan / RetentieScan differentiation defaults: Task 5
- test and regression hardening: Task 6

### Placeholder scan

- No `TBD`, `TODO`, or “implement later” placeholders remain.
- Each task includes exact files, commands, and expected outcomes.

### Type consistency

- `validationDisposition`, `semanticState`, route defaults, and route/action/review semantics stay aligned with the Batch A spec vocabulary.
- No task introduces new route families, off-platform truth, or standalone workflow behavior.
