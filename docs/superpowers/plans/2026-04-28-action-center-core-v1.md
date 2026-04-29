# Action Center Core V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one small canonical semantics layer that makes Action Center routes read as stronger management routes through better review meaning, sharper action framing, a compact result loop, and a clearer finished-vs-stopped distinction, without adding new manager input flows.

**Architecture:** Keep `frontend/lib/action-center-route-contract.ts` as the canonical route truth and add one new pure projection layer that derives `review semantics`, `action frame`, `result loop`, and `closing semantics` from existing route, owner, update, and dossier truth. `frontend/lib/action-center-live.ts` becomes the only place that maps that projection into `ActionCenterPreviewItem`, and `frontend/components/dashboard/action-center-preview.tsx` only renders the new semantics; it does not invent local copy or fallback logic.

**Tech Stack:** Next.js App Router, React 19, TypeScript, server components, client component rendering in `action-center-preview`, existing Supabase-backed route truth, Vitest source and unit tests, existing browser QA flow with seeded Action Center pilot accounts.

---

## File Structure

### New files
- `frontend/lib/action-center-core-semantics.ts`
  - Pure projection layer from route contract + existing preview/update truth to canonical UI semantics.
  - Defines `ActionCenterReviewSemantics`, `ActionCenterActionFrame`, `ActionCenterResultLoop`, `ActionCenterClosingSemantics`, and the combined projection type.
  - Holds the canonical fallback order for `reviewQuestion`, `whyNow`, `firstStep`, `expectedEffect`, `whatWasTried`, `whatWeObserved`, `whatWasDecided`, and the temporary `opschalen -> bijstellen` UI mapping.
- `frontend/lib/action-center-core-semantics.test.ts`
  - Unit tests for review question derivation, action frame fallback order, mini-result loop fallback order, and `opschalen` UI projection.

### Existing files to modify
- `frontend/lib/action-center-preview-model.ts`
  - Extend `ActionCenterPreviewItem` with the new projected semantics in a single grouped field so the UI does not keep flattening ad hoc semantics.
- `frontend/lib/action-center-live.ts`
  - Stop sprinkling review/action/result meaning across `summary`, `reason`, `nextStep`, `expectedEffect`, and `updates`.
  - Project one `coreSemantics` object via `action-center-core-semantics.ts` and attach it to every preview item.
- `frontend/lib/action-center-route-contract.ts`
  - Only modify if a small helper or normalized review outcome mapper is needed for the new projection layer.
  - Do not add new persisted datastore fields in this phase.
- `frontend/components/dashboard/action-center-preview.tsx`
  - Render the new review meaning on route detail.
  - Render the new action frame on route detail.
  - Render the compact result loop on route detail.
  - Render the small closing semantics on route detail.
  - Keep landing/overview compact by showing only summary signals from the same canonical semantics.
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
  - Guardrail: Action Center keeps detail-first meaning and landing summary without new form-heavy workflow.

### Existing files to check, but not modify unless tests force it
- `frontend/app/(dashboard)/action-center/page.tsx`
- `frontend/lib/suite-access.ts`
- `frontend/lib/action-center-live.ts`
- `frontend/tests/e2e/action-center-manager-access.spec.ts`

---

### Task 1: Add one canonical Action Center core semantics projection

**Files:**
- Create: `frontend/lib/action-center-core-semantics.ts`
- Create: `frontend/lib/action-center-core-semantics.test.ts`
- Test: `frontend/lib/action-center-core-semantics.test.ts`

- [ ] **Step 1: Write the failing unit tests for review semantics, action frame, result loop, and `opschalen` fallback**

```ts
import { describe, expect, it } from 'vitest'
import type { ActionCenterRouteContract } from '@/lib/action-center-route-contract'
import {
  projectActionCenterCoreSemantics,
  type ActionCenterCoreProjectionInput,
} from './action-center-core-semantics'

function buildBaseInput(
  overrides: Partial<ActionCenterCoreProjectionInput> = {},
): ActionCenterCoreProjectionInput {
  const route: ActionCenterRouteContract = {
    campaignId: 'cmp-1',
    entryStage: 'active',
    routeOpenedAt: '2026-04-28T09:00:00.000Z',
    ownerAssignedAt: '2026-04-28T09:00:00.000Z',
    routeStatus: 'in-uitvoering',
    reviewOutcome: 'geen-uitkomst',
    reviewCompletedAt: null,
    outcomeRecordedAt: null,
    outcomeSummary: null,
    intervention: 'Plan binnen twee weken een teamgesprek over rolverwachting.',
    owner: 'Manager IT',
    expectedEffect: 'Meer duidelijkheid over prioriteiten en rolverdeling.',
    reviewScheduledFor: '2026-05-12T09:00:00.000Z',
    reviewReason: 'Een eerste gesprek en kleine correctie hebben tijd nodig om effect te laten zien.',
    blockedBy: null,
  }

  return {
    route,
    title: 'Rolduidelijkheid in IT',
    summary: 'Werkdruk en rolverwachting lopen door elkaar.',
    reason: 'Respondenten noemen onduidelijke prioriteiten en wisselende verwachtingen.',
    nextStep: 'Voer een teamgesprek en leg drie concrete werkafspraken vast.',
    ownerName: 'Manager IT',
    updates: [],
    latestOutcomeSummary: null,
    ...overrides,
  }
}

describe('action center core semantics', () => {
  it('derives review question from review reason and expected effect before falling back to route copy', () => {
    const semantics = projectActionCenterCoreSemantics(
      buildBaseInput(),
    )

    expect(semantics.review.reason).toContain('tijd nodig')
    expect(semantics.review.question).toContain('welk effect')
  })

  it('keeps review question derived instead of leaving it as free per-route copy', () => {
    const semantics = projectActionCenterCoreSemantics(
      buildBaseInput({
        route: {
          ...buildBaseInput().route,
          reviewReason: null,
          expectedEffect: null,
        },
        reason: 'Onboarding loopt vast op de eerste week.',
        nextStep: 'Laat de leidinggevende binnen vijf werkdagen een checkpoint doen.',
      }),
    )

    expect(semantics.review.question).toContain('checkpoint')
  })

  it('maps action frame fields with canonical fallback order', () => {
    const semantics = projectActionCenterCoreSemantics(
      buildBaseInput({
        route: {
          ...buildBaseInput().route,
          intervention: null,
          expectedEffect: null,
        },
        nextStep: 'Plan een kort herstelgesprek.',
      }),
    )

    expect(semantics.action.whyNow).toContain('Respondenten noemen')
    expect(semantics.action.firstStep).toContain('herstelgesprek')
    expect(semantics.action.owner).toBe('Manager IT')
    expect(semantics.action.expectedEffect).toBeTruthy()
  })

  it('projects a compact result loop from updates and route outcome truth', () => {
    const semantics = projectActionCenterCoreSemantics(
      buildBaseInput({
        updates: [
          {
            id: 'upd-1',
            author: 'HR',
            dateLabel: '29 apr',
            note: 'Gesprek gevoerd, werkafspraken zijn expliciet gemaakt.',
          },
        ],
        latestOutcomeSummary: 'Nog twee weken volgen, daarna beslissen of bijsturing nodig blijft.',
      }),
    )

    expect(semantics.result.whatWasTried).toContain('Gesprek gevoerd')
    expect(semantics.result.whatWeObserved).toBeTruthy()
    expect(semantics.result.whatWasDecided).toContain('bijsturing')
  })

  it('maps opschalen to bijstellen in visible review semantics during this phase', () => {
    const semantics = projectActionCenterCoreSemantics(
      buildBaseInput({
        route: {
          ...buildBaseInput().route,
          reviewOutcome: 'opschalen',
        },
      }),
    )

    expect(semantics.review.visibleOutcome).toBe('bijstellen')
    expect(semantics.review.rawOutcome).toBe('opschalen')
  })

  it('distinguishes afgerond from gestopt in closing semantics', () => {
    const completed = projectActionCenterCoreSemantics(
      buildBaseInput({
        route: {
          ...buildBaseInput().route,
          routeStatus: 'afgerond',
          reviewOutcome: 'afronden',
        },
      }),
    )

    const stopped = projectActionCenterCoreSemantics(
      buildBaseInput({
        route: {
          ...buildBaseInput().route,
          routeStatus: 'gestopt',
          reviewOutcome: 'stoppen',
        },
      }),
    )

    expect(completed.closing.kind).toBe('afgerond')
    expect(stopped.closing.kind).toBe('gestopt')
  })
})
```

- [ ] **Step 2: Run the new test file and verify it fails**

Run:

```powershell
npm test -- "lib/action-center-core-semantics.test.ts"
```

Expected:

```text
FAIL  lib/action-center-core-semantics.test.ts
Error: Cannot find module './action-center-core-semantics'
```

- [ ] **Step 3: Add the minimal semantics projection implementation**

```ts
import type { ActionCenterReviewOutcome, ActionCenterRouteContract } from '@/lib/action-center-route-contract'
import type { ActionCenterPreviewUpdate } from '@/lib/action-center-preview-model'

export interface ActionCenterCoreProjectionInput {
  route: ActionCenterRouteContract
  title: string
  summary: string
  reason: string
  nextStep: string
  ownerName: string | null
  updates: ActionCenterPreviewUpdate[]
  latestOutcomeSummary: string | null
}

export interface ActionCenterReviewSemantics {
  reason: string | null
  question: string
  rawOutcome: ActionCenterReviewOutcome
  visibleOutcome: Exclude<ActionCenterReviewOutcome, 'opschalen'> | 'bijstellen'
}

export interface ActionCenterActionFrame {
  whyNow: string
  firstStep: string
  owner: string
  expectedEffect: string
}

export interface ActionCenterResultLoop {
  whatWasTried: string
  whatWeObserved: string | null
  whatWasDecided: string
}

export interface ActionCenterClosingSemantics {
  kind: 'lopend' | 'afgerond' | 'gestopt'
  summary: string | null
}

export interface ActionCenterCoreSemantics {
  review: ActionCenterReviewSemantics
  action: ActionCenterActionFrame
  result: ActionCenterResultLoop
  closing: ActionCenterClosingSemantics
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function mapVisibleReviewOutcome(outcome: ActionCenterReviewOutcome) {
  return outcome === 'opschalen' ? 'bijstellen' : outcome
}

function buildReviewQuestion(input: ActionCenterCoreProjectionInput) {
  const reviewReason = normalizeText(input.route.reviewReason)
  const expectedEffect = normalizeText(input.route.expectedEffect)
  const nextStep = normalizeText(input.nextStep)
  const reason = normalizeText(input.reason)

  if (reviewReason && expectedEffect) {
    return `We toetsen welk effect zichtbaar is na de gekozen eerste stap: ${expectedEffect}`
  }

  if (reviewReason && nextStep) {
    return `We toetsen of deze stap echt is uitgevoerd en wat die heeft teruggebracht: ${nextStep}`
  }

  if (expectedEffect) {
    return `We toetsen of dit verwachte effect zichtbaar of bevestigd is: ${expectedEffect}`
  }

  if (nextStep) {
    return `We toetsen wat deze eerste stap concreet heeft opgeleverd: ${nextStep}`
  }

  return `We toetsen wat deze opvolging nu duidelijker maakt: ${reason ?? input.summary}`
}

function buildExpectedEffect(input: ActionCenterCoreProjectionInput) {
  return (
    normalizeText(input.route.expectedEffect) ??
    `Meer duidelijkheid na deze eerste stap: ${normalizeText(input.reason) ?? input.summary}`
  )
}

function buildResultLoop(input: ActionCenterCoreProjectionInput) {
  const latestUpdate = input.updates[0]?.note?.trim() || null
  const latestOutcome = normalizeText(input.latestOutcomeSummary) ?? normalizeText(input.route.outcomeSummary)
  const firstStep = normalizeText(input.route.intervention) ?? normalizeText(input.nextStep) ?? input.summary
  const expectedEffect = normalizeText(input.route.expectedEffect)

  return {
    whatWasTried: latestUpdate ?? firstStep,
    whatWeObserved: latestUpdate ?? expectedEffect,
    whatWasDecided:
      latestOutcome ??
      (input.route.reviewOutcome === 'geen-uitkomst'
        ? 'Nog geen expliciete reviewuitkomst vastgelegd.'
        : `Laatste reviewuitkomst: ${mapVisibleReviewOutcome(input.route.reviewOutcome)}`),
  }
}

export function projectActionCenterCoreSemantics(
  input: ActionCenterCoreProjectionInput,
): ActionCenterCoreSemantics {
  const rawOutcome = input.route.reviewOutcome
  const visibleOutcome = mapVisibleReviewOutcome(rawOutcome)
  const owner = normalizeText(input.route.owner) ?? normalizeText(input.ownerName) ?? 'Nog niet toegewezen'
  const expectedEffect = buildExpectedEffect(input)

  return {
    review: {
      reason: normalizeText(input.route.reviewReason),
      question: buildReviewQuestion(input),
      rawOutcome,
      visibleOutcome,
    },
    action: {
      whyNow: normalizeText(input.reason) ?? normalizeText(input.summary) ?? input.title,
      firstStep: normalizeText(input.route.intervention) ?? normalizeText(input.nextStep) ?? input.summary,
      owner,
      expectedEffect,
    },
    result: buildResultLoop(input),
    closing: {
      kind:
        input.route.routeStatus === 'afgerond'
          ? 'afgerond'
          : input.route.routeStatus === 'gestopt'
            ? 'gestopt'
            : 'lopend',
      summary: normalizeText(input.route.outcomeSummary),
    },
  }
}
```

- [ ] **Step 4: Run the semantics tests and verify they pass**

Run:

```powershell
npm test -- "lib/action-center-core-semantics.test.ts"
```

Expected:

```text
PASS  lib/action-center-core-semantics.test.ts
6 passed
```

- [ ] **Step 5: Commit the new semantics layer**

```bash
git add frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-core-semantics.test.ts
git commit -m "feat: add action center core semantics projection"
```

---

### Task 2: Extend preview model and live item projection with canonical core semantics

**Files:**
- Modify: `frontend/lib/action-center-preview-model.ts`
- Modify: `frontend/lib/action-center-live.ts`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Add a failing guardrail test that requires canonical core semantics on preview items**

Add this test to `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`:

```ts
it('projects canonical review, action and result semantics into live action center items', () => {
  const source = readFileSync(new URL('../../../lib/action-center-live.ts', import.meta.url), 'utf8')
  const modelSource = readFileSync(new URL('../../../lib/action-center-preview-model.ts', import.meta.url), 'utf8')

  expect(modelSource).toContain('coreSemantics')
  expect(source).toContain('projectActionCenterCoreSemantics')
  expect(source).toContain('reviewOutcome: route.reviewOutcome')
  expect(source).toContain('coreSemantics:')
})
```

- [ ] **Step 2: Run the Action Center route-shell tests and verify the new assertion fails**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
FAIL  app/(dashboard)/action-center/page.route-shell.test.ts
expected source to contain "coreSemantics"
```

- [ ] **Step 3: Extend the preview item model with one grouped semantics field**

Update `frontend/lib/action-center-preview-model.ts`:

```ts
import type { ActionCenterReviewOutcome } from '@/lib/action-center-route-contract'
import type { ActionCenterCoreSemantics } from '@/lib/action-center-core-semantics'

export interface ActionCenterPreviewItem {
  id: string
  code: string
  title: string
  summary: string
  reason: string
  sourceLabel: string
  orgId?: string | null
  scopeType?: 'department' | 'item' | 'org'
  teamId: string
  teamLabel: string
  ownerId?: string | null
  ownerName: string | null
  ownerRole: string
  ownerSubtitle: string
  reviewOwnerName: string | null
  priority: ActionCenterPreviewPriority
  status: ActionCenterPreviewStatus
  reviewDate: string | null
  expectedEffect: string | null
  reviewReason: string | null
  reviewOutcome: ActionCenterReviewOutcome
  reviewDateLabel: string
  reviewRhythm: string
  signalLabel: string
  signalBody: string
  nextStep: string
  peopleCount: number
  openSignals: string[]
  updates: ActionCenterPreviewUpdate[]
  coreSemantics: ActionCenterCoreSemantics
}
```

- [ ] **Step 4: Project the canonical semantics in `action-center-live.ts`**

Add the import:

```ts
import { projectActionCenterCoreSemantics } from '@/lib/action-center-core-semantics'
```

Then attach `coreSemantics` when building each preview item:

```ts
const coreSemantics = projectActionCenterCoreSemantics({
  route,
  title: defaults.title,
  summary:
    context.deliveryRecord?.customer_handoff_note ||
    route.expectedEffect ||
    defaults.fallbackSummary,
  reason:
    route.reviewReason ||
    defaults.managementQuestion,
  nextStep,
  ownerName: route.owner,
  updates,
  latestOutcomeSummary: route.outcomeSummary,
})

return [{
  id: context.campaign.id,
  code: defaults.code,
  title: defaults.title,
  summary:
    context.deliveryRecord?.customer_handoff_note ||
    route.expectedEffect ||
    defaults.fallbackSummary,
  reason:
    route.reviewReason ||
    defaults.managementQuestion,
  sourceLabel: definition.productName,
  orgId: context.campaign.organization_id,
  scopeType: context.scopeType,
  teamId: context.scopeValue,
  teamLabel: context.scopeLabel,
  ownerName: route.owner,
  ownerRole: defaults.ownerRole,
  ownerSubtitle: context.organizationName,
  reviewOwnerName: route.owner,
  priority,
  status,
  reviewDate: route.reviewScheduledFor,
  expectedEffect: route.expectedEffect,
  reviewReason: route.reviewReason,
  reviewOutcome: route.reviewOutcome,
  reviewDateLabel,
  reviewRhythm: defaults.reviewRhythm,
  signalLabel: defaults.signalLabel,
  signalBody: getSignalBody(context.campaign.scan_type, context.deliveryRecord, latestUpdate),
  nextStep,
  peopleCount: context.peopleCount,
  openSignals,
  updates,
  coreSemantics,
} satisfies ActionCenterPreviewItem]
```

- [ ] **Step 5: Run the Action Center route-shell test again and verify it passes**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  app/(dashboard)/action-center/page.route-shell.test.ts
```

- [ ] **Step 6: Commit the preview model and live projection**

```bash
git add frontend/lib/action-center-preview-model.ts frontend/lib/action-center-live.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: wire action center core semantics into live items"
```

---

### Task 3: Render the full semantics on Action Center route detail

**Files:**
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Add a failing route-shell test for detail-first review and action rendering**

Append to `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`:

```ts
it('renders review meaning and the action frame from canonical core semantics on route detail', () => {
  const source = readFileSync(
    new URL('../../../components/dashboard/action-center-preview.tsx', import.meta.url),
    'utf8',
  )

  expect(source).toContain('Waarom we opnieuw kijken')
  expect(source).toContain('Wat we dan toetsen')
  expect(source).toContain('Laatste reviewuitkomst')
  expect(source).toContain('Waarom nu')
  expect(source).toContain('Eerste stap')
  expect(source).toContain('Verwacht effect')
})
```

- [ ] **Step 2: Run the route-shell test and verify it fails**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
FAIL  app/(dashboard)/action-center/page.route-shell.test.ts
expected source to contain "Waarom we opnieuw kijken"
```

- [ ] **Step 3: Render review meaning and action frame in the selected-item detail panel**

In `frontend/components/dashboard/action-center-preview.tsx`, inside the selected item detail surface, add a compact detail block driven only by `selectedItem.coreSemantics`:

```tsx
const detailSemantics = selectedItem?.coreSemantics ?? null
```

Then render:

```tsx
{detailSemantics ? (
  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr),minmax(320px,0.95fr)]">
    <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Review
      </p>
      <div className="mt-3 space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Waarom we opnieuw kijken</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {detailSemantics.review.reason ?? 'Nog geen expliciete reviewreden vastgelegd.'}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Wat we dan toetsen</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {detailSemantics.review.question}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Laatste reviewuitkomst</p>
          <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getReviewOutcomeMeta(detailSemantics.review.visibleOutcome).className}`}>
            {getReviewOutcomeMeta(detailSemantics.review.visibleOutcome).label}
          </span>
        </div>
      </div>
    </section>

    <section className="rounded-[24px] border border-slate-200 bg-slate-50/85 px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Eerste route
      </p>
      <div className="mt-3 space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Waarom nu</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {detailSemantics.action.whyNow}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Eerste stap</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {detailSemantics.action.firstStep}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-950">Eigenaar</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {detailSemantics.action.owner}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Verwacht effect</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {detailSemantics.action.expectedEffect}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
) : null}
```

- [ ] **Step 4: Run the route-shell test again and verify it passes**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  app/(dashboard)/action-center/page.route-shell.test.ts
```

- [ ] **Step 5: Commit the detail semantics rendering**

```bash
git add frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: render action center core detail semantics"
```

---

### Task 4: Add the compact result loop and small closing semantics to detail, plus a restrained landing summary

**Files:**
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Add failing tests for result loop, closing distinction, and compact landing summary**

Append to `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`:

```ts
it('renders a compact result loop and distinguishes afgerond from gestopt', () => {
  const source = readFileSync(
    new URL('../../../components/dashboard/action-center-preview.tsx', import.meta.url),
    'utf8',
  )

  expect(source).toContain('Wat is geprobeerd')
  expect(source).toContain('Wat zagen we terug')
  expect(source).toContain('Wat is besloten')
  expect(source).toContain('Afgerond voor nu')
  expect(source).toContain('Bewust gestopt')
})

it('keeps the landing summary compact instead of duplicating the full detail semantics', () => {
  const source = readFileSync(
    new URL('../../../components/dashboard/action-center-preview.tsx', import.meta.url),
    'utf8',
  )

  expect(source).toContain('Laatste route-read')
  expect(source).not.toContain('volledige detailsemantiek op de landingskaart')
})
```

- [ ] **Step 2: Run the route-shell test and verify it fails**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
FAIL  app/(dashboard)/action-center/page.route-shell.test.ts
expected source to contain "Wat is geprobeerd"
```

- [ ] **Step 3: Render the compact result loop and closing semantics in detail**

In `frontend/components/dashboard/action-center-preview.tsx`, add another compact section under the detail semantics:

```tsx
{detailSemantics ? (
  <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      Laatste route-read
    </p>
    <div className="mt-3 grid gap-4 lg:grid-cols-3">
      <div>
        <p className="text-sm font-semibold text-slate-950">Wat is geprobeerd</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {detailSemantics.result.whatWasTried}
        </p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-950">Wat zagen we terug</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {detailSemantics.result.whatWeObserved ?? 'Nog geen expliciete terugkoppeling vastgelegd.'}
        </p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-950">Wat is besloten</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {detailSemantics.result.whatWasDecided}
        </p>
      </div>
    </div>
    {detailSemantics.closing.kind !== 'lopend' ? (
      <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-sm font-semibold text-slate-950">
          {detailSemantics.closing.kind === 'afgerond' ? 'Afgerond voor nu' : 'Bewust gestopt'}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {detailSemantics.closing.summary ?? 'Deze route heeft een expliciete eindstatus gekregen.'}
        </p>
      </div>
    ) : null}
  </section>
) : null}
```

- [ ] **Step 4: Keep landing cards compact by reusing one or two short semantics lines**

Update the action/overview card rendering in `frontend/components/dashboard/action-center-preview.tsx` so it uses the projected semantics for a short summary, for example:

```tsx
<p className="mt-2 text-sm leading-6 text-slate-700">
  {item.coreSemantics.action.firstStep}
</p>
<p className="mt-2 text-xs leading-5 text-slate-500">
  Laatste route-read: {item.coreSemantics.review.visibleOutcome === 'geen-uitkomst'
    ? 'nog geen expliciete uitkomst'
    : getReviewOutcomeMeta(item.coreSemantics.review.visibleOutcome).label.toLowerCase()}
</p>
```

Do not render the full review question or full result loop on the landing cards.

- [ ] **Step 5: Run the Action Center route-shell tests and verify they pass**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  app/(dashboard)/action-center/page.route-shell.test.ts
```

- [ ] **Step 6: Commit the compact result and closing semantics**

```bash
git add frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: add action center core result and closing semantics"
```

---

### Task 5: Full verification and browser QA for Action Center Core V1

**Files:**
- Test: `frontend/lib/action-center-core-semantics.test.ts`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
- Test: `frontend/app/(dashboard)/route-access.test.ts`
- Verify: `frontend/.tmp-visual-qa/`

- [ ] **Step 1: Run the targeted automated suite**

Run:

```powershell
npm test -- "lib/action-center-core-semantics.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts" "app/(dashboard)/route-access.test.ts"
```

Expected:

```text
PASS  lib/action-center-core-semantics.test.ts
PASS  app/(dashboard)/action-center/page.route-shell.test.ts
PASS  app/(dashboard)/route-access.test.ts
```

- [ ] **Step 2: Run lint on the touched Action Center files**

Run:

```powershell
npx next lint --file "lib/action-center-core-semantics.ts" --file "lib/action-center-preview-model.ts" --file "lib/action-center-live.ts" --file "components/dashboard/action-center-preview.tsx" --file "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
âœ” No ESLint warnings or errors
```

- [ ] **Step 3: Run browser QA against the seeded Action Center pilot**

Use the same seeded credentials from:

```text
frontend/tests/e2e/.action-center-pilot.json
```

Check in browser:
- HR login lands on `/dashboard`
- HR opening `/action-center` still works
- Action Center landing remains compact
- Selected route detail now shows:
  - why we are reviewing
  - what we are testing
  - latest visible review outcome
  - why now
  - first step
  - owner
  - expected effect
  - what was tried
  - what we observed
  - what was decided
- Manager login still lands on `/action-center`
- Manager denied states on `/reports` and `/campaigns/[id]` still work

Record screenshots into:

```text
frontend/.tmp-visual-qa/2026-04-28-action-center-core-v1
```

- [ ] **Step 4: Save a short QA summary**

Create:

```text
frontend/.tmp-visual-qa/2026-04-28-action-center-core-v1/summary.json
```

with keys:

```json
{
  "baseURL": "http://127.0.0.1:3008",
  "hr": {
    "landingCompact": true,
    "detailHasReviewSemantics": true,
    "detailHasActionFrame": true,
    "detailHasResultLoop": true,
    "detailShowsClosingOnlyWhenPresent": true
  },
  "manager": {
    "landsOnActionCenter": true,
    "reportsDenied": true,
    "campaignDenied": true
  }
}
```

- [ ] **Step 5: Commit the implementation work**

```bash
git add frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-core-semantics.test.ts frontend/lib/action-center-preview-model.ts frontend/lib/action-center-live.ts frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: strengthen action center core route semantics"
```

---

## Self-Review

### Spec coverage
- Review semantics: covered by Task 1 projection logic and Task 3 detail rendering.
- Action frame: covered by Task 1 fallback logic and Task 3 detail rendering.
- Mini-result loop: covered by Task 1 projection logic and Task 4 rendering.
- Small closing logic: covered by Task 1 projection logic and Task 4 rendering.
- `opschalen` temporary UI mapping: covered by Task 1 tests and projection helper.
- Detail-first, landing compact: covered by Tasks 3 and 4.
- No new manager input flow: preserved because no task adds forms, actions, or write paths.

### Placeholder scan
- No `TODO`, `TBD`, or "appropriate handling" placeholders remain.
- All test commands are explicit.
- Every code-changing step includes concrete code to add or shape to match.

### Type consistency
- `ActionCenterCoreProjectionInput`, `ActionCenterCoreSemantics`, and `coreSemantics` are introduced once and reused consistently.
- `visibleOutcome` is intentionally distinct from `rawOutcome` to preserve the `opschalen -> bijstellen` UI rule without mutating truth.

