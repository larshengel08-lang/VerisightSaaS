# Action Center Route Contract V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce one canonical Action Center route projection above the current delivery and dossier truth, make the HR-to-Action Center transition explicit, and render expected effect, review reason, and review outcome consistently without creating local semantics in multiple UI surfaces.

**Architecture:** Add one new route-contract projection layer in `frontend/lib` and keep every suite surface downstream of that projection. Existing sources of truth (`CampaignDeliveryRecord`, `PilotLearningDossier`, checkpoints, and `LiveActionCenterCampaignContext`) remain the inputs; UI and telemetry consume the canonical route shape instead of reinterpreting raw fields independently.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, existing suite telemetry helpers, existing dashboard/action-center React components.

---

## File Structure

### New files
- `frontend/lib/action-center-route-contract.ts`
  - Canonical route types.
  - Entry-stage classifier (`attention`, `candidate`, `active`).
  - Route-status and review-outcome projection.
  - A single pure projection function from current live context into route contract.
- `frontend/lib/action-center-route-contract.test.ts`
  - Unit tests for the route contract, entry-stage rules, status mapping, and required field expectations.
- `frontend/lib/dashboard/action-center-entry-state.ts`
  - Small helper that converts route stage + route completeness into UI copy/badge data for overview, reports, and campaign detail.

### Existing files to modify
- `frontend/lib/action-center-live.ts`
  - Replace ad hoc field projection with canonical route projection + preview-item projection.
- `frontend/lib/action-center-live.test.ts`
  - Update live builder tests to assert route projection behavior and preview-item mapping.
- `frontend/components/dashboard/action-center-preview.tsx`
  - Extend `ActionCenterPreviewItem` to carry `expectedEffect`, `reviewReason`, and `reviewOutcome`.
  - Render those fields in overview/detail states with low-noise hierarchy.
- `frontend/app/(dashboard)/action-center/page.tsx`
  - Keep page logic thin; consume projected routes/items and avoid local re-interpretation.
- `frontend/lib/telemetry/events.ts`
  - Extend the suite telemetry event vocabulary with the minimum route-contract V1 evidence events.
- `frontend/lib/telemetry/events.test.ts`
  - Add tests for the new event types and count helpers.
- `frontend/app/(dashboard)/dashboard/page.tsx`
  - Show entry-stage visibility on the HR overview using the shared entry-state helper.
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
  - Show route-candidate vs active-route state on the campaign detail path using the shared helper.
- `frontend/app/(dashboard)/reports/page.tsx`
  - Show route-candidate vs active-route state in the reports access/list layer using the shared helper.
- `frontend/app/(dashboard)/dashboard/page.test.ts`
  - Update guardrails for the overview state labels.
- `frontend/app/(dashboard)/campaigns/[id]/page.test.ts`
  - Add assertions that campaign detail distinguishes candidate vs active follow-up.
- `frontend/app/(dashboard)/reports/page.route-shell.test.ts`
  - Add assertions that reports keeps the follow-up state semantics visible.
- `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
  - Add assertions for expected effect, review reason, and route semantics copy.

### Existing files to check, but not modify unless tests fail
- `frontend/lib/pilot-learning.ts`
- `frontend/lib/ops-delivery.ts`
- `frontend/lib/suite-access.ts`
- `frontend/lib/suite-access-server.ts`

---

### Task 1: Add the canonical route contract

**Files:**
- Create: `frontend/lib/action-center-route-contract.ts`
- Create: `frontend/lib/action-center-route-contract.test.ts`
- Test: `frontend/lib/action-center-route-contract.test.ts`

- [ ] **Step 1: Write the failing route-contract test**

```ts
import { describe, expect, it } from 'vitest'
import {
  classifyActionCenterEntryStage,
  projectActionCenterRoute,
  type ActionCenterRouteStatus,
  type ActionCenterReviewOutcome,
} from './action-center-route-contract'
import type { LiveActionCenterCampaignContext } from './action-center-live'

describe('action center route contract', () => {
  it('keeps route-candidate outside route status until a route is explicitly opened', () => {
    expect(
      classifyActionCenterEntryStage({
        hasReadableSignal: true,
        hasExplicitScope: true,
        hasInterventionCandidate: true,
        hasOwnerCandidate: true,
        hasReviewCandidate: true,
        routeOpenedAt: null,
      }),
    ).toBe('candidate')
  })

  it('projects an opened route to te-bespreken until owner, expected effect and review plan exist', () => {
    const route = projectActionCenterRoute(buildContext({
      routeOpenedAt: '2026-05-01T10:00:00.000Z',
      ownerLabel: null,
      expectedEffect: null,
      reviewScheduledFor: null,
      reviewReason: null,
    }))

    expect(route?.entryStage).toBe('active')
    expect(route?.routeStatus).toBe('te-bespreken')
    expect(route?.reviewOutcome).toBe('geen-uitkomst')
  })

  it('projects an opened route to in-uitvoering once intervention, owner, expected effect and review plan are complete', () => {
    const route = projectActionCenterRoute(buildContext({
      routeOpenedAt: '2026-05-01T10:00:00.000Z',
      ownerLabel: 'Manager Operations',
      expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
      reviewScheduledFor: '2026-05-14',
      reviewReason: 'Toets of het eerste gesprek is gevoerd en of het knelpunt specifieker is geworden.',
    }))

    expect(route?.routeStatus).toBe('in-uitvoering')
  })

  it('keeps reviewOutcome separate from routeStatus', () => {
    const route = projectActionCenterRoute(buildContext({
      routeOpenedAt: '2026-05-01T10:00:00.000Z',
      ownerLabel: 'Manager Operations',
      expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
      reviewScheduledFor: '2026-05-14',
      reviewReason: 'Toets of het eerste gesprek is gevoerd.',
      reviewOutcome: 'bijstellen',
      outcomeSummary: 'Gesprek is gevoerd, maar de actie moet smaller worden gemaakt.',
    }))

    expect(route?.routeStatus).toBe('in-uitvoering')
    expect(route?.reviewOutcome).toBe('bijstellen')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- "lib/action-center-route-contract.test.ts"
```

Expected:

```text
FAIL  lib/action-center-route-contract.test.ts
Error: Cannot find module './action-center-route-contract'
```

- [ ] **Step 3: Write the minimal route-contract implementation**

```ts
import type { LiveActionCenterCampaignContext } from './action-center-live'

export type ActionCenterEntryStage = 'attention' | 'candidate' | 'active'
export type ActionCenterRouteStatus = 'te-bespreken' | 'in-uitvoering' | 'geblokkeerd' | 'afgerond' | 'gestopt'
export type ActionCenterReviewOutcome = 'geen-uitkomst' | 'doorgaan' | 'bijstellen' | 'opschalen' | 'afronden' | 'stoppen'

export interface ActionCenterRouteContract {
  routeId: string
  campaignId: string
  organizationId: string
  sourceProduct: string
  scopeType: 'department' | 'item'
  scopeValue: string
  scopeLabel: string
  signalSummary: string
  managementQuestion: string
  sourceEvidenceLevel: 'onvoldoende' | 'leesbaar' | 'sterk'
  signalUpdatedAt: string | null
  intervention: string | null
  ownerUserId: string | null
  ownerLabel: string | null
  expectedEffect: string | null
  reviewScheduledFor: string | null
  reviewRhythm: string | null
  reviewReason: string | null
  routeStatus: ActionCenterRouteStatus | null
  reviewOutcome: ActionCenterReviewOutcome
  blockedReason: string | null
  outcomeSummary: string | null
  routeOpenedAt: string | null
  ownerAssignedAt: string | null
  reviewPlannedAt: string | null
  reviewCompletedAt: string | null
  outcomeRecordedAt: string | null
  closedAt: string | null
  latestUpdateSummary: string | null
  latestUpdateAt: string | null
  latestUpdateBy: string | null
  entryStage: ActionCenterEntryStage
}

export function classifyActionCenterEntryStage(args: {
  hasReadableSignal: boolean
  hasExplicitScope: boolean
  hasInterventionCandidate: boolean
  hasOwnerCandidate: boolean
  hasReviewCandidate: boolean
  routeOpenedAt: string | null
}): ActionCenterEntryStage {
  if (args.routeOpenedAt) return 'active'
  if (
    args.hasReadableSignal &&
    args.hasExplicitScope &&
    args.hasInterventionCandidate &&
    args.hasOwnerCandidate &&
    args.hasReviewCandidate
  ) {
    return 'candidate'
  }
  return 'attention'
}

export function projectActionCenterRoute(
  context: LiveActionCenterCampaignContext & {
    routeOpenedAt?: string | null
    expectedEffect?: string | null
    reviewReason?: string | null
    reviewOutcome?: ActionCenterReviewOutcome | null
  },
): ActionCenterRouteContract | null {
  const routeOpenedAt = context.routeOpenedAt ?? context.learningDossier?.created_at ?? null
  const intervention = context.learningDossier?.first_action_taken ?? context.deliveryRecord?.next_step ?? null
  const ownerLabel = context.assignedManager?.displayName ?? context.deliveryRecord?.operator_owner ?? null
  const expectedEffect = context.expectedEffect ?? context.learningDossier?.expected_first_value ?? null
  const reviewScheduledFor = context.learningDossier?.review_moment ?? null
  const reviewReason = context.reviewReason ?? context.learningDossier?.first_management_value ?? null
  const reviewOutcome = context.reviewOutcome ?? 'geen-uitkomst'

  const entryStage = classifyActionCenterEntryStage({
    hasReadableSignal: Boolean(context.stats),
    hasExplicitScope: Boolean(context.scopeValue && context.scopeLabel),
    hasInterventionCandidate: Boolean(intervention),
    hasOwnerCandidate: Boolean(ownerLabel),
    hasReviewCandidate: Boolean(reviewScheduledFor || reviewReason),
    routeOpenedAt,
  })

  if (entryStage !== 'active') {
    return {
      routeId: `${context.campaign.id}:${context.scopeValue}`,
      campaignId: context.campaign.id,
      organizationId: context.campaign.organization_id,
      sourceProduct: context.campaign.scan_type,
      scopeType: context.scopeType,
      scopeValue: context.scopeValue,
      scopeLabel: context.scopeLabel,
      signalSummary: context.learningDossier?.expected_first_value ?? context.deliveryRecord?.customer_handoff_note ?? '',
      managementQuestion: context.learningDossier?.first_management_value ?? '',
      sourceEvidenceLevel: context.stats ? 'leesbaar' : 'onvoldoende',
      signalUpdatedAt: context.learningDossier?.updated_at ?? context.deliveryRecord?.updated_at ?? null,
      intervention,
      ownerUserId: context.assignedManager?.userId ?? null,
      ownerLabel,
      expectedEffect,
      reviewScheduledFor,
      reviewRhythm: null,
      reviewReason,
      routeStatus: null,
      reviewOutcome,
      blockedReason: null,
      outcomeSummary: null,
      routeOpenedAt,
      ownerAssignedAt: null,
      reviewPlannedAt: null,
      reviewCompletedAt: null,
      outcomeRecordedAt: null,
      closedAt: null,
      latestUpdateSummary: null,
      latestUpdateAt: null,
      latestUpdateBy: null,
      entryStage,
    }
  }

  const routeStatus: ActionCenterRouteStatus =
    context.deliveryRecord?.exception_status && context.deliveryRecord.exception_status !== 'none'
      ? 'geblokkeerd'
      : intervention && ownerLabel && expectedEffect && reviewScheduledFor && reviewReason
        ? 'in-uitvoering'
        : 'te-bespreken'

  return {
    routeId: `${context.campaign.id}:${context.scopeValue}`,
    campaignId: context.campaign.id,
    organizationId: context.campaign.organization_id,
    sourceProduct: context.campaign.scan_type,
    scopeType: context.scopeType,
    scopeValue: context.scopeValue,
    scopeLabel: context.scopeLabel,
    signalSummary: context.learningDossier?.expected_first_value ?? context.deliveryRecord?.customer_handoff_note ?? '',
    managementQuestion: context.learningDossier?.first_management_value ?? '',
    sourceEvidenceLevel: context.stats ? 'leesbaar' : 'onvoldoende',
    signalUpdatedAt: context.learningDossier?.updated_at ?? context.deliveryRecord?.updated_at ?? null,
    intervention,
    ownerUserId: context.assignedManager?.userId ?? null,
    ownerLabel,
    expectedEffect,
    reviewScheduledFor,
    reviewRhythm: 'Maandelijks',
    reviewReason,
    routeStatus,
    reviewOutcome,
    blockedReason: routeStatus === 'geblokkeerd' ? context.deliveryRecord?.exception_status ?? 'blocked' : null,
    outcomeSummary: context.learningDossier?.management_action_outcome ?? null,
    routeOpenedAt,
    ownerAssignedAt: ownerLabel ? routeOpenedAt : null,
    reviewPlannedAt: reviewScheduledFor ? routeOpenedAt : null,
    reviewCompletedAt: reviewOutcome === 'geen-uitkomst' ? null : context.learningDossier?.updated_at ?? null,
    outcomeRecordedAt: context.learningDossier?.management_action_outcome ? context.learningDossier.updated_at : null,
    closedAt: null,
    latestUpdateSummary: context.learningDossier?.management_action_outcome ?? null,
    latestUpdateAt: context.learningDossier?.updated_at ?? context.deliveryRecord?.updated_at ?? null,
    latestUpdateBy: ownerLabel,
    entryStage,
  }
}
```

- [ ] **Step 4: Run the route-contract test to verify it passes**

Run:

```powershell
npm test -- "lib/action-center-route-contract.test.ts"
```

Expected:

```text
PASS  lib/action-center-route-contract.test.ts
4 passed
```

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/action-center-route-contract.ts frontend/lib/action-center-route-contract.test.ts
git commit -m "feat: add action center route contract v1"
```

### Task 2: Project live Action Center items from the canonical route

**Files:**
- Modify: `frontend/lib/action-center-live.ts`
- Modify: `frontend/lib/action-center-live.test.ts`
- Test: `frontend/lib/action-center-live.test.ts`

- [ ] **Step 1: Write the failing projection test**

```ts
it('projects preview items from the canonical route contract instead of raw dossier strings', () => {
  const items = buildLiveActionCenterItems([
    buildLiveContext({
      routeOpenedAt: '2026-05-01T10:00:00.000Z',
      expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
      reviewReason: 'Toets of het eerste gesprek is gevoerd en of de hypothese standhoudt.',
      reviewOutcome: 'geen-uitkomst',
    }),
  ])

  expect(items[0]).toMatchObject({
    status: 'in-uitvoering',
    expectedEffect: 'Binnen twee weken moet het eerste teamgesprek zijn gevoerd.',
    reviewReason: 'Toets of het eerste gesprek is gevoerd en of de hypothese standhoudt.',
    reviewOutcome: 'geen-uitkomst',
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- "lib/action-center-live.test.ts"
```

Expected:

```text
FAIL  lib/action-center-live.test.ts
Property 'expectedEffect' does not exist on type 'ActionCenterPreviewItem'
```

- [ ] **Step 3: Refactor `action-center-live.ts` to use the route projection**

```ts
import {
  projectActionCenterRoute,
  type ActionCenterReviewOutcome,
} from './action-center-route-contract'

function projectActionCenterPreviewItem(
  route: ActionCenterRouteContract,
  context: LiveActionCenterCampaignContext,
  index: number,
): ActionCenterPreviewItem {
  return {
    id: context.campaign.id,
    code: `ACT-${1000 + index + 1}`,
    title: context.learningDossier?.title || `${getScanDefinition(context.campaign.scan_type).productName}: ${context.campaign.name}`,
    summary: route.signalSummary,
    reason: route.managementQuestion,
    sourceLabel: getScanDefinition(context.campaign.scan_type).productName,
    orgId: context.campaign.organization_id,
    scopeType: context.scopeType,
    teamId: context.scopeValue,
    teamLabel: context.scopeLabel,
    ownerId: route.ownerUserId,
    ownerName: route.ownerLabel,
    ownerRole: route.ownerLabel ? `Manager - ${context.scopeLabel}` : 'Nog niet toegewezen',
    ownerSubtitle: context.scopeLabel,
    reviewOwnerName: route.ownerLabel,
    priority: getPriorityFromSignals({
      exceptionStatus: context.deliveryRecord?.exception_status,
      avgSignal: context.stats?.avg_signal_score ?? context.stats?.avg_risk_score ?? null,
      totalCompleted: context.stats?.total_completed ?? 0,
    }),
    status: route.routeStatus ?? 'te-bespreken',
    reviewDate: route.reviewScheduledFor,
    reviewDateLabel: formatShortDate(route.reviewScheduledFor),
    reviewRhythm: route.reviewRhythm ?? 'Maandelijks',
    reviewReason: route.reviewReason,
    reviewOutcome: route.reviewOutcome,
    expectedEffect: route.expectedEffect,
    signalLabel: `${getScanDefinition(context.campaign.scan_type).productName} - ${context.campaign.name}`,
    signalBody: route.latestUpdateSummary ?? route.signalSummary,
    nextStep: route.intervention ?? 'Nog geen vervolgstap vastgelegd.',
    peopleCount: context.peopleCount,
    openSignals: buildOpenSignals({
      status: route.routeStatus ?? 'te-bespreken',
      ownerName: route.ownerLabel,
      reviewDate: route.reviewScheduledFor,
      deliveryRecord: context.deliveryRecord,
    }),
    updates: buildUpdates({
      learningCheckpoints: context.learningCheckpoints,
      deliveryCheckpoints: context.deliveryCheckpoints,
      learningDossier: context.learningDossier,
      deliveryRecord: context.deliveryRecord,
      fallbackAuthor: context.organizationName,
    }),
  }
}

export function buildLiveActionCenterItems(contexts: LiveActionCenterCampaignContext[]): ActionCenterPreviewItem[] {
  return contexts
    .map((context) => ({ context, route: projectActionCenterRoute(context) }))
    .filter((entry) => entry.route?.entryStage === 'active')
    .map(({ context, route }, index) => projectActionCenterPreviewItem(route!, context, index))
    .sort((left, right) => {
      const statusDelta = getSortRank(left.status) - getSortRank(right.status)
      if (statusDelta !== 0) return statusDelta
      return compareReviewDate(left.reviewDate, right.reviewDate)
    })
}
```

- [ ] **Step 4: Run the live builder tests to verify they pass**

Run:

```powershell
npm test -- "lib/action-center-live.test.ts" "lib/action-center-route-contract.test.ts"
```

Expected:

```text
PASS  lib/action-center-live.test.ts
PASS  lib/action-center-route-contract.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/action-center-live.ts frontend/lib/action-center-live.test.ts
git commit -m "refactor: derive live action center items from route contract"
```

### Task 3: Render expected effect, review reason, and review outcome in the Action Center UI

**Files:**
- Modify: `frontend/components/dashboard/action-center-preview.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.tsx`
- Modify: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`
- Test: `frontend/app/(dashboard)/action-center/page.route-shell.test.ts`

- [ ] **Step 1: Write the failing shell test**

```ts
it('renders expected effect, review reason and review outcome as first-class route fields', () => {
  const previewSource = readFileSync(
    new URL('../../../components/dashboard/action-center-preview.tsx', import.meta.url),
    'utf8',
  )

  expect(previewSource).toContain('Verwacht effect')
  expect(previewSource).toContain('Waarom reviewen we dit')
  expect(previewSource).toContain('Laatste reviewuitkomst')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
FAIL  app/(dashboard)/action-center/page.route-shell.test.ts
Expected substring: Verwacht effect
```

- [ ] **Step 3: Extend the preview item type and render the new fields**

```ts
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
  reviewDateLabel: string
  reviewRhythm: string
  reviewReason: string | null
  reviewOutcome: 'geen-uitkomst' | 'doorgaan' | 'bijstellen' | 'opschalen' | 'afronden' | 'stoppen'
  expectedEffect: string | null
  signalLabel: string
  signalBody: string
  nextStep: string
  peopleCount: number
  openSignals: string[]
  updates: ActionCenterPreviewUpdate[]
}

<div className="grid gap-4 md:grid-cols-3">
  <DashboardInfoCard
    eyebrow="Verwacht effect"
    title={selectedItem.expectedEffect ?? 'Nog niet vastgelegd'}
    body="Wat moet deze route merkbaar veranderen voor de volgende review?"
  />
  <DashboardInfoCard
    eyebrow="Waarom reviewen we dit"
    title={selectedItem.reviewReason ?? 'Nog niet vastgelegd'}
    body="De reden voor dit reviewmoment moet expliciet zijn voordat de route als volledig in uitvoering telt."
  />
  <DashboardInfoCard
    eyebrow="Laatste reviewuitkomst"
    title={selectedItem.reviewOutcome === 'geen-uitkomst' ? 'Nog geen uitkomst' : selectedItem.reviewOutcome}
    body="Reviewuitkomst blijft los van route-status en beschrijft de laatste beslissing."
  />
</div>
```

- [ ] **Step 4: Run the route-shell test to verify it passes**

Run:

```powershell
npm test -- "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  app/(dashboard)/action-center/page.route-shell.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.tsx frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: render canonical route fields in action center"
```

### Task 4: Extend telemetry for route completeness and review completion

**Files:**
- Modify: `frontend/lib/telemetry/events.ts`
- Modify: `frontend/lib/telemetry/events.test.ts`
- Modify: `frontend/lib/action-center-live.ts`
- Modify: `frontend/lib/action-center-live.test.ts`
- Test: `frontend/lib/telemetry/events.test.ts`

- [ ] **Step 1: Write the failing telemetry test**

```ts
it('supports route-opened, owner-assigned, review-completed and outcome-recorded events', () => {
  expect(isSuiteTelemetryEventType('action_center_route_opened')).toBe(true)
  expect(isSuiteTelemetryEventType('action_center_owner_assigned')).toBe(true)
  expect(isSuiteTelemetryEventType('action_center_review_completed')).toBe(true)
  expect(isSuiteTelemetryEventType('action_center_outcome_recorded')).toBe(true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- "lib/telemetry/events.test.ts"
```

Expected:

```text
FAIL  lib/telemetry/events.test.ts
Expected true, received false
```

- [ ] **Step 3: Add the minimal event vocabulary and emit from route timestamps**

```ts
export type SuiteTelemetryEventType =
  | 'owner_access_confirmed'
  | 'first_value_confirmed'
  | 'first_management_use_confirmed'
  | 'manager_denied_insights'
  | 'action_center_review_scheduled'
  | 'action_center_closeout_recorded'
  | 'action_center_route_opened'
  | 'action_center_owner_assigned'
  | 'action_center_review_completed'
  | 'action_center_outcome_recorded'

if (route.routeOpenedAt) {
  events.push(
    buildSuiteTelemetryEvent('action_center_route_opened', {
      orgId,
      campaignId,
      actorId: actorId ?? null,
      payload: { scopeValue: route.scopeValue, routeStatus: route.routeStatus },
    }),
  )
}

if (route.ownerAssignedAt && route.ownerLabel) {
  events.push(
    buildSuiteTelemetryEvent('action_center_owner_assigned', {
      orgId,
      campaignId,
      actorId: actorId ?? null,
      payload: { ownerLabel: route.ownerLabel },
    }),
  )
}

if (route.reviewCompletedAt && route.reviewOutcome !== 'geen-uitkomst') {
  events.push(
    buildSuiteTelemetryEvent('action_center_review_completed', {
      orgId,
      campaignId,
      actorId: actorId ?? null,
      payload: { reviewOutcome: route.reviewOutcome },
    }),
  )
}

if (route.outcomeRecordedAt && route.outcomeSummary) {
  events.push(
    buildSuiteTelemetryEvent('action_center_outcome_recorded', {
      orgId,
      campaignId,
      actorId: actorId ?? null,
      payload: { outcomeSummary: route.outcomeSummary },
    }),
  )
}
```

- [ ] **Step 4: Run telemetry and live builder tests**

Run:

```powershell
npm test -- "lib/telemetry/events.test.ts" "lib/action-center-live.test.ts"
```

Expected:

```text
PASS  lib/telemetry/events.test.ts
PASS  lib/action-center-live.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/telemetry/events.ts frontend/lib/telemetry/events.test.ts frontend/lib/action-center-live.ts frontend/lib/action-center-live.test.ts
git commit -m "feat: add action center route evidence events"
```

### Task 5: Make candidate vs active follow-up visible in HR surfaces

**Files:**
- Create: `frontend/lib/dashboard/action-center-entry-state.ts`
- Modify: `frontend/app/(dashboard)/dashboard/page.tsx`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- Modify: `frontend/app/(dashboard)/reports/page.tsx`
- Modify: `frontend/app/(dashboard)/dashboard/page.test.ts`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/page.test.ts`
- Modify: `frontend/app/(dashboard)/reports/page.route-shell.test.ts`
- Test: `frontend/app/(dashboard)/dashboard/page.test.ts`
- Test: `frontend/app/(dashboard)/campaigns/[id]/page.test.ts`
- Test: `frontend/app/(dashboard)/reports/page.route-shell.test.ts`

- [ ] **Step 1: Write the failing HR surface tests**

```ts
expect(pageSource).toContain('route-kandidaat')
expect(pageSource).toContain('actieve opvolging')
expect(pageSource).toContain('Nog geen opvolging geopend')
```

```ts
expect(source).toContain('Kandidaat voor opvolging')
expect(source).toContain('Opvolging al geopend')
```

```ts
expect(pageSource).toContain('Nog geen opvolging geopend')
expect(pageSource).toContain('Al in Action Center')
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm test -- "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/reports/page.route-shell.test.ts"
```

Expected:

```text
FAIL  app/(dashboard)/dashboard/page.test.ts
FAIL  app/(dashboard)/campaigns/[id]/page.test.ts
FAIL  app/(dashboard)/reports/page.route-shell.test.ts
```

- [ ] **Step 3: Add one shared entry-state helper and use it everywhere**

```ts
export type ActionCenterEntryStateBadge = {
  label: string
  tone: 'slate' | 'amber' | 'emerald'
  body: string
}

export function getActionCenterEntryStateBadge(args: {
  entryStage: 'attention' | 'candidate' | 'active'
  routeStatus: 'te-bespreken' | 'in-uitvoering' | 'geblokkeerd' | 'afgerond' | 'gestopt' | null
}) : ActionCenterEntryStateBadge {
  if (args.entryStage === 'active') {
    return {
      label: 'Actieve opvolging',
      tone: args.routeStatus === 'geblokkeerd' ? 'amber' : 'emerald',
      body: 'Deze route is geopend in Action Center en heeft een canonieke opvolgstatus.',
    }
  }

  if (args.entryStage === 'candidate') {
    return {
      label: 'Route-kandidaat',
      tone: 'amber',
      body: 'Dit signaal is opvolgbaar, maar nog niet geopend als Action Center-route.',
    }
  }

  return {
    label: 'Nog geen opvolging geopend',
    tone: 'slate',
    body: 'Dit signaal vraagt nog oriëntatie of interpretatie voordat het een echte opvolgroute wordt.',
  }
}
```

```tsx
<DashboardChip label={entryState.label} tone={entryState.tone} />
<p className="mt-2 text-sm text-[color:var(--dashboard-text)]">{entryState.body}</p>
```

- [ ] **Step 4: Run the HR surface tests**

Run:

```powershell
npm test -- "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/reports/page.route-shell.test.ts"
```

Expected:

```text
PASS  app/(dashboard)/dashboard/page.test.ts
PASS  app/(dashboard)/campaigns/[id]/page.test.ts
PASS  app/(dashboard)/reports/page.route-shell.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/dashboard/action-center-entry-state.ts frontend/app/(dashboard)/dashboard/page.tsx frontend/app/(dashboard)/campaigns/[id]/page.tsx frontend/app/(dashboard)/reports/page.tsx frontend/app/(dashboard)/dashboard/page.test.ts frontend/app/(dashboard)/campaigns/[id]/page.test.ts frontend/app/(dashboard)/reports/page.route-shell.test.ts
git commit -m "feat: expose action center candidate and active states in hr surfaces"
```

### Task 6: Final verification and browser QA

**Files:**
- Modify: none
- Test: existing suite tests only

- [ ] **Step 1: Run the focused suite**

Run:

```powershell
npm test -- "lib/action-center-route-contract.test.ts" "lib/action-center-live.test.ts" "lib/telemetry/events.test.ts" "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/reports/page.route-shell.test.ts" "app/(dashboard)/action-center/page.route-shell.test.ts"
```

Expected:

```text
PASS  7 test files
```

- [ ] **Step 2: Run lint on the touched files**

Run:

```powershell
npx next lint --file "lib/action-center-route-contract.ts" --file "lib/action-center-route-contract.test.ts" --file "lib/action-center-live.ts" --file "lib/action-center-live.test.ts" --file "lib/telemetry/events.ts" --file "lib/telemetry/events.test.ts" --file "lib/dashboard/action-center-entry-state.ts" --file "components/dashboard/action-center-preview.tsx" --file "app/(dashboard)/action-center/page.tsx" --file "app/(dashboard)/dashboard/page.tsx" --file "app/(dashboard)/campaigns/[id]/page.tsx" --file "app/(dashboard)/reports/page.tsx"
```

Expected:

```text
✔ No ESLint warnings or errors
```

- [ ] **Step 3: Run browser QA against the dev server**

Run:

```powershell
npm run dev
```

Then verify:
- HR overview shows one of:
  - `Nog geen opvolging geopend`
  - `Route-kandidaat`
  - `Actieve opvolging`
- campaign detail shows candidate vs active follow-up clearly
- reports rows and featured card keep the same semantics
- Action Center route detail shows:
  - `Verwacht effect`
  - `Waarom reviewen we dit`
  - `Laatste reviewuitkomst`
- manager landing still reads clearly and does not expose HR-only context

Expected:

```text
No console errors
No hydration errors
No contradictory candidate/active labels across surfaces
```

- [ ] **Step 4: Commit the verified slice**

```bash
git add frontend/lib/action-center-route-contract.ts frontend/lib/action-center-route-contract.test.ts frontend/lib/action-center-live.ts frontend/lib/action-center-live.test.ts frontend/lib/telemetry/events.ts frontend/lib/telemetry/events.test.ts frontend/lib/dashboard/action-center-entry-state.ts frontend/components/dashboard/action-center-preview.tsx frontend/app/(dashboard)/action-center/page.tsx frontend/app/(dashboard)/dashboard/page.tsx frontend/app/(dashboard)/campaigns/[id]/page.tsx frontend/app/(dashboard)/reports/page.tsx frontend/app/(dashboard)/dashboard/page.test.ts frontend/app/(dashboard)/campaigns/[id]/page.test.ts frontend/app/(dashboard)/reports/page.route-shell.test.ts frontend/app/(dashboard)/action-center/page.route-shell.test.ts
git commit -m "feat: ship action center route contract v1"
```

---

## Self-Review

### Spec coverage
- Canoniek routecontract: covered by Task 1 and Task 2.
- HR -> Action Center entry rule: covered by Task 1 and Task 5.
- Expected effect / review reason / review outcome: covered by Task 2 and Task 3.
- Meetcontract and evidence: covered by Task 4.
- First vertical slice only: enforced by all tasks; no portfolio-deepening or later-horizon work included.

### Placeholder scan
- No `TODO`, `TBD`, or “implement later” markers remain.
- Every code-changing step contains concrete code.
- Every verification step contains exact commands.

### Type consistency
- One canonical route type: `ActionCenterRouteContract`.
- One entry-stage vocabulary: `attention`, `candidate`, `active`.
- One route-status vocabulary: `te-bespreken`, `in-uitvoering`, `geblokkeerd`, `afgerond`, `gestopt`.
- One review-outcome vocabulary: `geen-uitkomst`, `doorgaan`, `bijstellen`, `opschalen`, `afronden`, `stoppen`.

