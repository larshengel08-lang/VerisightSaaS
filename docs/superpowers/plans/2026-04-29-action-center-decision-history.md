# Action Center Decision History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a canonical internal decision layer, shared action progression projection, and stable decision history so Action Center routes become more decision-driven without adding manager input.

**Architecture:** Extend the existing route/core-semantics pipeline rather than creating a separate workflow. Add one small decision/history contract adjacent to the route contract, build one shared projector that composes legacy fallback and new truth into stable detail semantics, and then update Action Center detail and landing to read from that single layer.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, ESLint

---

## File structure

### Existing files to modify

- `frontend/lib/action-center-route-contract.ts`
  - Extend route-adjacent canonical types with the minimal decision-history record contract and any shared enums/helpers needed by projectors.
- `frontend/lib/action-center-core-semantics.ts`
  - Replace the current Core V1-only route semantics with the new decision-first projection model.
- `frontend/lib/action-center-live.ts`
  - Feed live Action Center preview items from the new semantics, including landing-safe compact decision summaries.
- `frontend/components/dashboard/action-center-preview.tsx`
  - Render richer detail semantics and compact landing summaries without adding new manager input.
- `frontend/lib/action-center-core-semantics.test.ts`
  - Cover the new truth/projection rules, legacy fallback behavior, and stable history ordering.
- `frontend/lib/action-center-live.test.ts`
  - Cover live projection, telemetry-safe semantics, and landing/detail summary behavior.
- `frontend/lib/action-center-preview-display.test.ts`
  - Guard detail rendering and compact landing rendering against regressions.
- `frontend/lib/action-center-preview-route-fields-render.test.ts`
  - Assert the route field surface now reads from decision/history semantics instead of older first-step-only semantics.
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
  - Guard the read-only Action Center shell against regressions in the new detail/landing language.

### New files to create

- `frontend/lib/action-center-decision-history.ts`
  - Canonical decision-layer types, shared migration/projector helpers, and stable ordering logic.
- `frontend/lib/action-center-decision-history.test.ts`
  - Unit tests for identity, ordering, legacy migration, and currentStep/nextStep projection rules.

### Boundaries to preserve

- Do not add new manager write flows.
- Do not add new dashboard/reports/campaign-detail work in this plan.
- Do not introduce a broad audit log model or event timeline UI.

---

### Task 1: Add the canonical decision/history contract

**Files:**
- Create: `frontend/lib/action-center-decision-history.ts`
- Modify: `frontend/lib/action-center-route-contract.ts`
- Test: `frontend/lib/action-center-decision-history.test.ts`

- [ ] **Step 1: Write the failing tests for identity, ordering, and legacy migration**

```ts
import { describe, expect, it } from 'vitest'
import {
  buildLegacyDecisionEntryId,
  compareDecisionHistoryEntries,
  projectLegacyDecisionRecord,
  type ActionCenterDecisionRecord,
} from './action-center-decision-history'

describe('action-center decision history contract', () => {
  it('builds a stable legacy decision entry id from one legacy review moment', () => {
    const id = buildLegacyDecisionEntryId({
      routeId: 'route-1',
      reviewCompletedAt: '2026-04-25T10:00:00.000Z',
      reviewOutcome: 'bijstellen',
    })

    expect(id).toBe('legacy:route-1:2026-04-25T10:00:00.000Z:bijstellen')
  })

  it('orders decision entries by decisionRecordedAt descending before older fallback timestamps', () => {
    const left: ActionCenterDecisionRecord = {
      decisionEntryId: 'decision-2',
      sourceRouteId: 'route-1',
      decision: 'afronden',
      decisionReason: 'Het effect is bevestigd.',
      nextCheck: 'Geen nieuwe toets nodig.',
      decisionRecordedAt: '2026-04-28T09:00:00.000Z',
      reviewCompletedAt: '2026-04-28T08:00:00.000Z',
    }
    const right: ActionCenterDecisionRecord = {
      decisionEntryId: 'decision-1',
      sourceRouteId: 'route-1',
      decision: 'doorgaan',
      decisionReason: 'De eerste stap loopt nog.',
      nextCheck: 'Toets volgende week of de frictie daalt.',
      decisionRecordedAt: '2026-04-25T09:00:00.000Z',
      reviewCompletedAt: '2026-04-25T08:00:00.000Z',
    }

    expect(compareDecisionHistoryEntries(left, right)).toBeLessThan(0)
    expect(compareDecisionHistoryEntries(right, left)).toBeGreaterThan(0)
  })

  it('projects one legacy decision record from legacy review truth using the canonical fallback order', () => {
    const record = projectLegacyDecisionRecord({
      sourceRouteId: 'route-1',
      reviewOutcome: 'bijstellen',
      reviewCompletedAt: '2026-04-25T10:00:00.000Z',
      reviewReason: 'De eerste stap gaf nog geen stabiele verbetering.',
      reviewQuestion: 'Moet de vervolgstap worden aangescherpt?',
      managementActionOutcome: null,
      latestObservation: 'Werkdruk bleef zichtbaar in hetzelfde team.',
    })

    expect(record).toMatchObject({
      sourceRouteId: 'route-1',
      decision: 'bijstellen',
      decisionReason: 'De eerste stap gaf nog geen stabiele verbetering.',
      nextCheck: 'Moet de vervolgstap worden aangescherpt?',
      decisionRecordedAt: '2026-04-25T10:00:00.000Z',
    })
  })
})
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```bash
npm test -- "lib/action-center-decision-history.test.ts"
```

Expected:
- FAIL because `action-center-decision-history.ts` does not exist yet

- [ ] **Step 3: Add the minimal contract to `action-center-route-contract.ts`**

```ts
export type ActionCenterDecision =
  | 'doorgaan'
  | 'bijstellen'
  | 'afronden'
  | 'stoppen'

export interface ActionCenterDecisionRecord {
  decisionEntryId: string
  sourceRouteId: string
  decision: ActionCenterDecision
  decisionReason: string | null
  nextCheck: string | null
  decisionRecordedAt: string
  reviewCompletedAt: string | null
  currentStepSnapshot?: string | null
  observationSnapshot?: string | null
}
```

- [ ] **Step 4: Create `action-center-decision-history.ts` with stable helpers**

```ts
import type { ActionCenterDecision, ActionCenterDecisionRecord, ActionCenterReviewOutcome } from './action-center-route-contract'

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function coerceDecision(
  reviewOutcome: ActionCenterReviewOutcome | null | undefined,
  managementActionOutcome: string | null | undefined,
): ActionCenterDecision | null {
  if (reviewOutcome === 'doorgaan' || reviewOutcome === 'bijstellen' || reviewOutcome === 'afronden' || reviewOutcome === 'stoppen') {
    return reviewOutcome
  }

  const fallback = normalizeText(managementActionOutcome)
  if (fallback === 'doorgaan' || fallback === 'bijstellen' || fallback === 'afronden' || fallback === 'stoppen') {
    return fallback
  }

  return null
}

export function buildLegacyDecisionEntryId(args: {
  routeId: string
  reviewCompletedAt: string | null
  reviewOutcome: ActionCenterReviewOutcome | null | undefined
}) {
  return `legacy:${args.routeId}:${args.reviewCompletedAt ?? 'unknown-review'}:${args.reviewOutcome ?? 'geen-uitkomst'}`
}

export function compareDecisionHistoryEntries(left: ActionCenterDecisionRecord, right: ActionCenterDecisionRecord) {
  const leftPrimary = new Date(left.decisionRecordedAt).getTime()
  const rightPrimary = new Date(right.decisionRecordedAt).getTime()

  if (leftPrimary !== rightPrimary) {
    return rightPrimary - leftPrimary
  }

  const leftFallback = left.reviewCompletedAt ? new Date(left.reviewCompletedAt).getTime() : Number.NEGATIVE_INFINITY
  const rightFallback = right.reviewCompletedAt ? new Date(right.reviewCompletedAt).getTime() : Number.NEGATIVE_INFINITY

  if (leftFallback !== rightFallback) {
    return rightFallback - leftFallback
  }

  return left.decisionEntryId.localeCompare(right.decisionEntryId)
}

export function projectLegacyDecisionRecord(args: {
  sourceRouteId: string
  reviewOutcome: ActionCenterReviewOutcome | null | undefined
  reviewCompletedAt: string | null
  reviewReason: string | null | undefined
  reviewQuestion: string | null | undefined
  managementActionOutcome: string | null | undefined
  latestObservation: string | null | undefined
}): ActionCenterDecisionRecord | null {
  const decision = coerceDecision(args.reviewOutcome, args.managementActionOutcome)
  if (!decision) return null

  const reviewCompletedAt = args.reviewCompletedAt ?? new Date(0).toISOString()

  return {
    decisionEntryId: buildLegacyDecisionEntryId({
      routeId: args.sourceRouteId,
      reviewCompletedAt: args.reviewCompletedAt,
      reviewOutcome: args.reviewOutcome,
    }),
    sourceRouteId: args.sourceRouteId,
    decision,
    decisionReason: normalizeText(args.reviewReason) ?? normalizeText(args.latestObservation),
    nextCheck: normalizeText(args.reviewQuestion),
    decisionRecordedAt: reviewCompletedAt,
    reviewCompletedAt: args.reviewCompletedAt,
  }
}
```

- [ ] **Step 5: Run the decision-history tests again**

Run:

```bash
npm test -- "lib/action-center-decision-history.test.ts"
```

Expected:
- PASS

- [ ] **Step 6: Commit Task 1**

```bash
git add frontend/lib/action-center-route-contract.ts frontend/lib/action-center-decision-history.ts frontend/lib/action-center-decision-history.test.ts
git commit -m "feat: add action center decision history contract"
```

---

### Task 2: Replace the core semantics projector with decision-first semantics

**Files:**
- Modify: `frontend/lib/action-center-core-semantics.ts`
- Modify: `frontend/lib/action-center-route-contract.ts`
- Test: `frontend/lib/action-center-core-semantics.test.ts`
- Test: `frontend/lib/action-center-decision-history.test.ts`

- [ ] **Step 1: Write failing tests for decision truth precedence and action progression projection**

```ts
import { describe, expect, it } from 'vitest'
import { projectActionCenterCoreSemantics } from './action-center-core-semantics'
import type { ActionCenterRouteContract } from './action-center-route-contract'

describe('action-center core semantics decision-first projection', () => {
  const baseRoute: ActionCenterRouteContract = {
    campaignId: 'campaign-1',
    entryStage: 'active',
    routeOpenedAt: '2026-04-20T10:00:00.000Z',
    ownerAssignedAt: '2026-04-20T11:00:00.000Z',
    routeStatus: 'in-uitvoering',
    reviewOutcome: 'bijstellen',
    reviewCompletedAt: '2026-04-25T10:00:00.000Z',
    outcomeRecordedAt: null,
    outcomeSummary: 'Werkdruk bleef zichtbaar in hetzelfde team.',
    intervention: 'Plan een gerichte teamreview met de manager.',
    owner: 'Sanne de Vries',
    expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
    reviewScheduledFor: '2026-05-02',
    reviewReason: 'De eerste stap gaf nog geen stabiele verbetering.',
    blockedBy: null,
  }

  it('prefers canonical decision truth over legacy review outcome when both exist', () => {
    const semantics = projectActionCenterCoreSemantics({
      campaign: { id: 'campaign-1', name: 'ExitScan april' } as never,
      assignedManager: { displayName: 'Sanne de Vries' } as never,
      deliveryRecord: { next_step: 'Herplan de teamreview voor volgende week.' } as never,
      learningDossier: {
        management_action_outcome: 'doorgaan',
        first_action_taken: 'Plan een gerichte teamreview met de manager.',
        expected_first_value: 'Werkdruktrend moet dalen.',
      } as never,
      learningCheckpoints: [],
      route: baseRoute,
      latestVisibleUpdateNote: 'De manager bevestigde dat de frictie nog niet daalt.',
      decisionRecords: [
        {
          decisionEntryId: 'decision-1',
          sourceRouteId: 'campaign-1',
          decision: 'bijstellen',
          decisionReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
          nextCheck: 'Toets over een week of de teamdruk zichtbaar daalt.',
          decisionRecordedAt: '2026-04-25T10:00:00.000Z',
          reviewCompletedAt: '2026-04-25T09:30:00.000Z',
        },
      ],
    })

    expect(semantics.latestDecision?.decision).toBe('bijstellen')
    expect(semantics.latestDecision?.decisionReason).toBe('De eerste teamreview gaf nog geen stabiele verbetering.')
    expect(semantics.actionProgress.currentStep).toBe('Plan een gerichte teamreview met de manager.')
    expect(semantics.actionProgress.nextStep).toBe('Herplan de teamreview voor volgende week.')
  })

  it('falls back to legacy truth when no canonical decision records exist', () => {
    const semantics = projectActionCenterCoreSemantics({
      campaign: { id: 'campaign-1', name: 'ExitScan april' } as never,
      assignedManager: { displayName: 'Sanne de Vries' } as never,
      deliveryRecord: { next_step: null } as never,
      learningDossier: {
        management_action_outcome: null,
        first_action_taken: 'Plan een gerichte teamreview met de manager.',
        expected_first_value: 'Werkdruktrend moet dalen.',
      } as never,
      learningCheckpoints: [],
      route: baseRoute,
      latestVisibleUpdateNote: 'De manager bevestigde dat de frictie nog niet daalt.',
      decisionRecords: [],
    })

    expect(semantics.latestDecision?.decision).toBe('bijstellen')
    expect(semantics.latestDecision?.nextCheck).toBeTruthy()
    expect(semantics.decisionHistory).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the semantics tests to verify they fail**

Run:

```bash
npm test -- "lib/action-center-core-semantics.test.ts"
```

Expected:
- FAIL because `decisionRecords`, `latestDecision`, `actionProgress`, or `decisionHistory` do not exist yet

- [ ] **Step 3: Extend the semantics interfaces in `action-center-core-semantics.ts`**

```ts
import type { ActionCenterDecisionRecord } from './action-center-route-contract'

export interface ActionCenterCoreSemantics {
  route: ActionCenterRouteContract
  reviewSemantics: {
    reviewReason: string
    reviewQuestion: string
    reviewOutcomeRaw: ActionCenterReviewOutcome
    reviewOutcomeVisible: ActionCenterVisibleReviewOutcome
  }
  latestDecision: ActionCenterDecisionRecord | null
  actionProgress: {
    currentStep: string | null
    nextStep: string | null
    expectedEffect: string | null
  }
  actionFrame: {
    whyNow: string
    firstStep: string
    owner: string
    expectedEffect: string
  }
  resultLoop: {
    whatWasTried: string | null
    whatWeObserved: string | null
    whatWasDecided: string | null
  }
  decisionHistory: ActionCenterDecisionRecord[]
  closingSemantics: {
    status: ActionCenterClosingStatus
    summary: string | null
    historicalSummary: string | null
  }
}
```

- [ ] **Step 4: Add decision-record input support and shared projection helpers**

```ts
import {
  compareDecisionHistoryEntries,
  projectLegacyDecisionRecord,
} from './action-center-decision-history'

export type ActionCenterCoreSemanticsProjectionInput = Pick<
  LiveActionCenterCampaignContext,
  'campaign' | 'assignedManager' | 'deliveryRecord' | 'learningDossier' | 'learningCheckpoints'
> & {
  route: ActionCenterRouteContract
  latestVisibleUpdateNote?: string | null
  decisionRecords?: ActionCenterDecisionRecord[]
}

function buildDecisionHistory(input: ActionCenterCoreSemanticsProjectionInput, reviewQuestion: string | null, latestObservation: string | null) {
  const canonical = [...(input.decisionRecords ?? [])]
    .filter((record) => record.sourceRouteId === input.route.campaignId)
    .sort(compareDecisionHistoryEntries)

  if (canonical.length > 0) {
    return canonical
  }

  const legacy = projectLegacyDecisionRecord({
    sourceRouteId: input.route.campaignId,
    reviewOutcome: input.route.reviewOutcome,
    reviewCompletedAt: input.route.reviewCompletedAt,
    reviewReason: input.route.reviewReason,
    reviewQuestion,
    managementActionOutcome: input.learningDossier?.management_action_outcome,
    latestObservation,
  })

  return legacy ? [legacy] : []
}
```

- [ ] **Step 5: Project action progression from one shared source order**

```ts
function projectActionProgress(args: {
  route: ActionCenterRouteContract
  deliveryNextStep: string | null | undefined
  firstActionTaken: string | null | undefined
  reviewQuestion: string | null
  expectedEffectFallback: string | null
}) {
  const currentStep = pickFirst([
    args.firstActionTaken,
    args.route.intervention,
  ])

  const nextStep = pickFirst([
    args.deliveryNextStep,
    args.reviewQuestion,
  ])

  const expectedEffect = pickFirst([
    args.route.expectedEffect,
    args.expectedEffectFallback,
    args.reviewQuestion,
  ])

  return {
    currentStep,
    nextStep,
    expectedEffect,
  }
}
```

- [ ] **Step 6: Return `latestDecision`, `actionProgress`, and `decisionHistory` from the live semantics projector**

```ts
  const latestObservation = getLatestObservation(context, route)
  const decisionHistory = buildDecisionHistory(context, reviewQuestion, latestObservation)
  const latestDecision = decisionHistory[0] ?? null
  const actionProgress = projectActionProgress({
    route,
    deliveryNextStep: context.deliveryRecord?.next_step,
    firstActionTaken: context.learningDossier?.first_action_taken,
    reviewQuestion,
    expectedEffectFallback: derivedExpectedEffect,
  })

  return {
    route,
    reviewSemantics: { ... },
    latestDecision,
    actionProgress,
    actionFrame: {
      whyNow: whyNow ?? ACTION_FRAME_FALLBACK,
      firstStep: actionProgress.currentStep ?? ACTION_FRAME_FALLBACK,
      owner: owner ?? UNASSIGNED_OWNER_LABEL,
      expectedEffect: actionProgress.expectedEffect ?? ACTION_FRAME_FALLBACK,
    },
    resultLoop: {
      whatWasTried: pickFirst([
        normalizeAttemptText(context.latestVisibleUpdateNote),
        actionProgress.currentStep,
      ]),
      whatWeObserved: pickFirst([latestObservation, observationFallback]),
      whatWasDecided: latestDecision?.decisionReason ?? getDecisionText({ ... }),
    },
    decisionHistory,
    closingSemantics: { ... },
  }
```

- [ ] **Step 7: Re-run the semantics tests**

Run:

```bash
npm test -- "lib/action-center-core-semantics.test.ts" "lib/action-center-decision-history.test.ts"
```

Expected:
- PASS

- [ ] **Step 8: Commit Task 2**

```bash
git add frontend/lib/action-center-route-contract.ts frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-core-semantics.test.ts frontend/lib/action-center-decision-history.test.ts
git commit -m "feat: project decision-first action center semantics"
```

---

### Task 3: Wire live Action Center items and compact landing summaries to the new semantics

**Files:**
- Modify: `frontend/lib/action-center-live.ts`
- Test: `frontend/lib/action-center-live.test.ts`
- Test: `frontend/lib/action-center-preview-route-fields-render.test.ts`

- [ ] **Step 1: Write failing tests for live item projection and compact landing summaries**

```ts
import { describe, expect, it } from 'vitest'
import { buildCompactLandingSummaryLines, finalizeActionCenterPreviewItem } from '@/components/dashboard/action-center-preview'

describe('action-center live summary projection', () => {
  it('uses current step and latest decision on landing instead of only first-step semantics', () => {
    const item = finalizeActionCenterPreviewItem({
      id: 'route-1',
      code: 'ACT-1001',
      title: 'Werkdruk blijft hoog in Operations',
      summary: 'De route vraagt een nieuwe lokale stap.',
      reason: 'Werkdruk bleef zichtbaar na de eerste interventie.',
      sourceLabel: 'ExitScan',
      teamId: 'team-1',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Sanne de Vries',
      ownerRole: 'Manager - Operations',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'Sanne de Vries',
      priority: 'hoog',
      status: 'in-uitvoering',
      reviewDate: '2026-05-02',
      reviewDateLabel: '2 mei',
      reviewRhythm: 'Wekelijks',
      signalLabel: 'ExitScan - Operations',
      signalBody: 'Werkdruk bleef zichtbaar in hetzelfde team.',
      nextStep: 'Herplan de teamreview voor volgende week.',
      expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
      reviewReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
      reviewOutcome: 'bijstellen',
      peopleCount: 14,
      updates: [],
      coreSemantics: {
        route: {} as never,
        reviewSemantics: {} as never,
        latestDecision: {
          decisionEntryId: 'decision-1',
          sourceRouteId: 'route-1',
          decision: 'bijstellen',
          decisionReason: 'De eerste teamreview gaf nog geen stabiele verbetering.',
          nextCheck: 'Toets over een week of de teamdruk zichtbaar daalt.',
          decisionRecordedAt: '2026-04-25T10:00:00.000Z',
          reviewCompletedAt: '2026-04-25T09:30:00.000Z',
        },
        actionProgress: {
          currentStep: 'Plan een gerichte teamreview met de manager.',
          nextStep: 'Herplan de teamreview voor volgende week.',
          expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
        },
        actionFrame: {
          whyNow: 'Werkdruk bleef zichtbaar na de eerste interventie.',
          firstStep: 'Plan een gerichte teamreview met de manager.',
          owner: 'Sanne de Vries',
          expectedEffect: 'Zichtbaar maken of de werkdruk lokaal afneemt.',
        },
        resultLoop: {
          whatWasTried: 'Plan een gerichte teamreview met de manager.',
          whatWeObserved: 'Werkdruk bleef zichtbaar in hetzelfde team.',
          whatWasDecided: 'Bijstellen',
        },
        decisionHistory: [],
        closingSemantics: {
          status: 'lopend',
          summary: null,
          historicalSummary: null,
        },
      },
    })

    expect(buildCompactLandingSummaryLines(item)).toEqual([
      { label: 'Besluit', value: 'bijstellen' },
      { label: 'Stap', value: 'Plan een gerichte teamreview met de manager.' },
    ])
  })
})
```

- [ ] **Step 2: Run the live tests to verify they fail**

Run:

```bash
npm test -- "lib/action-center-live.test.ts" "lib/action-center-preview-route-fields-render.test.ts"
```

Expected:
- FAIL because the compact summaries still read from the older first-step-only semantics

- [ ] **Step 3: Update the landing summary builder in `action-center-preview.tsx`**

```ts
export function buildCompactLandingSummaryLines(item: ActionCenterPreviewItem) {
  const latestDecision = item.coreSemantics.latestDecision
  const currentStep = item.coreSemantics.actionProgress.currentStep

  return [
    latestDecision ? { label: 'Besluit', value: latestDecision.decision } : null,
    currentStep ? { label: 'Stap', value: currentStep } : null,
  ]
    .filter((entry): entry is { label: string; value: string } => Boolean(entry?.value))
    .filter((entry, index, entries) => entries.findIndex((candidate) => candidate.value === entry.value) === index)
    .slice(0, 2)
}
```

- [ ] **Step 4: Pass decision records through the live item builder**

```ts
      const coreSemantics = projectActionCenterCoreSemantics({
        ...context,
        route,
        latestVisibleUpdateNote: latestUpdate,
        decisionRecords: [],
      })
```

Use `[]` explicitly in this phase if no live store exists yet, so the projector always follows the same signature and legacy fallback path.

- [ ] **Step 5: Re-run the live projection tests**

Run:

```bash
npm test -- "lib/action-center-live.test.ts" "lib/action-center-preview-route-fields-render.test.ts"
```

Expected:
- PASS

- [ ] **Step 6: Commit Task 3**

```bash
git add frontend/lib/action-center-live.ts frontend/lib/action-center-live.test.ts frontend/components/dashboard/action-center-preview.tsx frontend/lib/action-center-preview-route-fields-render.test.ts
git commit -m "feat: wire decision-first summaries into action center items"
```

---

### Task 4: Render decision-first detail UI without adding manager input

**Files:**
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Test: `frontend/lib/action-center-preview-display.test.ts`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Write failing display tests for detail-first decision blocks**

```ts
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActionCenterPreview } from '@/components/dashboard/action-center-preview'

describe('action center detail decision-first rendering', () => {
  it('shows latest decision, reason, next check, and compact decision history on detail', () => {
    render(
      <ActionCenterPreview
        initialItems={[buildDecisionHistoryItemFixture()]}
        initialSelectedItemId="route-1"
        fallbackOwnerName="Verisight"
        ownerOptions={[]}
        workbenchHref="/beheer/klantlearnings"
        readOnly
      />,
    )

    expect(screen.getByText('Laatste beslissing')).toBeInTheDocument()
    expect(screen.getByText('De eerste teamreview gaf nog geen stabiele verbetering.')).toBeInTheDocument()
    expect(screen.getByText('Toets over een week of de teamdruk zichtbaar daalt.')).toBeInTheDocument()
    expect(screen.getByText('Beslisgeschiedenis')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the display tests to verify they fail**

Run:

```bash
npm test -- "lib/action-center-preview-display.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- FAIL because the detail UI still only renders Core V1 review/action/result blocks

- [ ] **Step 3: Add a compact decision panel and decision history block in `action-center-preview.tsx`**

```tsx
function DecisionSummaryCard({ item }: { item: ActionCenterPreviewItem }) {
  const latestDecision = item.coreSemantics.latestDecision
  if (!latestDecision) return null

  return (
    <div className="rounded-[18px] border border-[#eadfce] bg-[#fcfaf6] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Laatste beslissing</p>
      <p className="mt-3 text-sm font-semibold text-[#132033]">{latestDecision.decision}</p>
      {latestDecision.decisionReason ? (
        <p className="mt-2 text-sm leading-7 text-[#32465d]">{latestDecision.decisionReason}</p>
      ) : null}
      {latestDecision.nextCheck ? (
        <p className="mt-2 text-sm leading-7 text-[#5d6f84]">Volgende toets: {latestDecision.nextCheck}</p>
      ) : null}
    </div>
  )
}

function DecisionHistoryCard({ item }: { item: ActionCenterPreviewItem }) {
  if (item.coreSemantics.decisionHistory.length === 0) return null

  return (
    <div className="rounded-[18px] border border-[#eadfce] bg-[#fcfaf6] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d8377]">Beslisgeschiedenis</p>
      <div className="mt-3 space-y-3">
        {item.coreSemantics.decisionHistory.map((entry) => (
          <div key={entry.decisionEntryId} className="rounded-[14px] border border-[#efe7dc] bg-white px-3 py-3">
            <p className="text-sm font-semibold text-[#132033]">{entry.decision}</p>
            {entry.decisionReason ? <p className="mt-1 text-sm text-[#42556b]">{entry.decisionReason}</p> : null}
            {entry.nextCheck ? <p className="mt-1 text-sm text-[#6d6458]">Volgende toets: {entry.nextCheck}</p> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Show the action progression in detail instead of only `firstStep`**

```tsx
<RouteFieldCard
  label="Huidige stap"
  value={selectedItem.coreSemantics.actionProgress.currentStep ?? selectedItem.coreSemantics.actionFrame.firstStep}
/>
{selectedItem.coreSemantics.actionProgress.nextStep ? (
  <RouteFieldCard
    label="Volgende stap"
    value={selectedItem.coreSemantics.actionProgress.nextStep}
  />
) : null}
<RouteFieldCard
  label="Verwacht effect"
  value={selectedItem.coreSemantics.actionProgress.expectedEffect ?? selectedItem.coreSemantics.actionFrame.expectedEffect}
/>
```

- [ ] **Step 5: Re-run the display/shell tests**

Run:

```bash
npm test -- "lib/action-center-preview-display.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- PASS

- [ ] **Step 6: Commit Task 4**

```bash
git add frontend/components/dashboard/action-center-preview.tsx frontend/lib/action-center-preview-display.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: render decision-first action center detail"
```

---

### Task 5: Full targeted verification and documentation alignment

**Files:**
- Modify: `docs/superpowers/specs/2026-04-29-action-center-decision-history-design.md` (only if implementation forces a naming correction)
- Test: `frontend/lib/action-center-decision-history.test.ts`
- Test: `frontend/lib/action-center-core-semantics.test.ts`
- Test: `frontend/lib/action-center-live.test.ts`
- Test: `frontend/lib/action-center-preview-display.test.ts`
- Test: `frontend/lib/action-center-preview-route-fields-render.test.ts`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Run the full targeted decision-history slice**

Run:

```bash
npm test -- "lib/action-center-decision-history.test.ts" "lib/action-center-core-semantics.test.ts" "lib/action-center-live.test.ts" "lib/action-center-preview-display.test.ts" "lib/action-center-preview-route-fields-render.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- PASS for the full decision-history slice

- [ ] **Step 2: Run ESLint on the touched files**

Run:

```bash
npx eslint "lib/action-center-decision-history.ts" "lib/action-center-decision-history.test.ts" "lib/action-center-core-semantics.ts" "lib/action-center-core-semantics.test.ts" "lib/action-center-live.ts" "lib/action-center-live.test.ts" "components/dashboard/action-center-preview.tsx" "lib/action-center-preview-display.test.ts" "lib/action-center-preview-route-fields-render.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:
- no lint errors

- [ ] **Step 3: Run a production build for the frontend**

Run:

```bash
npm run build
```

Expected:
- successful Next.js production build

- [ ] **Step 4: If naming drift appears, update the spec to match the implemented contract**

```md
- keep `decisionEntryId`, `decisionRecordedAt`, `currentStep`, `nextStep`, and `expectedEffect` aligned between spec and code
- do not leave any old Core V1-only names as the primary API if the implementation changed
```

- [ ] **Step 5: Commit Task 5**

```bash
git add frontend/lib/action-center-decision-history.ts frontend/lib/action-center-decision-history.test.ts frontend/lib/action-center-core-semantics.ts frontend/lib/action-center-core-semantics.test.ts frontend/lib/action-center-live.ts frontend/lib/action-center-live.test.ts frontend/components/dashboard/action-center-preview.tsx frontend/lib/action-center-preview-display.test.ts frontend/lib/action-center-preview-route-fields-render.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts docs/superpowers/specs/2026-04-29-action-center-decision-history-design.md
git commit -m "test: verify action center decision history slice"
```

---

## Self-review

### Spec coverage

- Small canonical decision-truth: covered in Task 1 and Task 2
- Stronger action contract (`currentStep`, `nextStep`, `expectedEffect`): covered in Task 2 and Task 4
- Decision history with identity/ordering: covered in Task 1 and Task 2
- Read-only manager experience: preserved in Task 4 by detail rendering only, with no new write flow
- Truth-first then presentation: task order enforces contract -> projector -> landing/detail rendering

### Placeholder scan

- No `TODO`, `TBD`, or “appropriate handling” placeholders remain
- Every task includes explicit file paths, code, commands, and expected results

### Type consistency

- `decisionEntryId`, `decisionRecordedAt`, `reviewCompletedAt`, `currentStep`, `nextStep`, `expectedEffect`, `decision`, `decisionReason`, and `nextCheck` are used consistently across tasks
- The plan keeps `reviewOutcome` as a separate existing field and does not conflate it with `decision`

