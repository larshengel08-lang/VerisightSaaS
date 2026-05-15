# Action Center Triggered Follow-Through Mail Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded automatic follow-through mail layer for eligible Action Center ExitScan routes so assignment, review, and unresolved follow-up pressure can reach managers and HR without requiring manual dashboard checking, while keeping Action Center the only canonical truth.

**Architecture:** Read trigger truth from the existing Action Center route contract, contextual deeplink foundation, review invite contract, and persisted HR rhythm config. Derive candidate follow-through mail events server-side, persist a send/suppression ledger for dedupe and stale-schedule protection, and dispatch through one bounded internal email route guarded for cron/manual operator use. Reuse the live `email + ICS` review-invite baseline for review-centric mails, and keep Graph, reply-based writes, reschedule flows, and route-family expansion out of scope.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Supabase SQL patch + schema snapshot, existing Action Center governance + rhythm helpers, Resend HTTP API via `fetch`, existing `frontend/vercel.json` for one bounded cron entry.

---

## Scope Check

This child plan assumes the live baselines from merged PR #136 and PR #140 are already present in the current worktree.

Verify before implementation starts:

- `git rev-parse --verify 31832e58b4209428ca64f0a628b0f7744e5212f2`
- `git rev-parse --verify d84536f0ceaf8bcc9109cc74104d1bfe9c8a3a2e`
- `git merge-base --is-ancestor d84536f0ceaf8bcc9109cc74104d1bfe9c8a3a2e HEAD`

If one of these checks fails, sync the worktree from `main` before implementing this child plan.

In scope here:

- automatic outbound emails for the exact phase-1 trigger families:
  - `assignment_created`
  - `review_upcoming`
  - `review_overdue`
  - `follow_up_open_after_review`
- one bounded send/suppression ledger for dedupe, stale-schedule suppression, and auditability
- server-side recipient resolution for assigned managers and scoped HR oversight recipients
- reuse of the live Action Center review invite + `.ics` baseline inside review-centric mails
- one bounded internal dispatch route for cron/manual operator execution
- one minimal daily cron entry in `frontend/vercel.json`

Explicitly out of scope here:

- Microsoft Graph or native Outlook mailbox APIs
- inbound email parsing, RSVP ingestion, or any reply-based canonical writes
- review reschedule / cancel mutation rules
- route-family broadening beyond ExitScan
- marketing/newsletter/general CRM mail infrastructure
- new manager or HR workbench surfaces
- free-form workflow rules or multi-step automation builders

## Product Rules To Preserve

- Action Center stays the only canonical source for owner, review date, review outcome, closeout, and follow-up state.
- This slice reads cadence, reminder, and escalation boundaries from the live HR Rhythm Console contract; it does not redefine them.
- All phase-1 automated mails remain ExitScan-only.
- Trigger families are fixed in this slice; recipient-specific variants may exist, but they must stay within those four canonical trigger families.
- Review-centric mails may reuse the existing `.ics` artifact path, but calendar artifacts remain mirrors of canonical Action Center state.
- Email content may activate and route attention, but never confirm completion, postpone reviews, or mutate state off-platform.
- The system must suppress duplicate, stale, or now-ineligible sends rather than "best effort" mailing.

## Trigger Contract

Phase-1 trigger families and primary recipients:

| Trigger family | Canonical event source | Primary recipient | Escalation behavior |
| --- | --- | --- | --- |
| `assignment_created` | `route.ownerAssignedAt` becomes present for an eligible ExitScan route | assigned manager email | none |
| `review_upcoming` | scheduled review enters the configured reminder window and reminders are enabled | assigned manager email | none |
| `review_overdue` | scheduled review date is now in the past and review is not completed | assigned manager email | once overdue days reach `escalationLeadDays`, the same trigger family may also emit an HR-oversight variant |
| `follow_up_open_after_review` | review is completed, route remains active, no closeout/successor resolves it, and the post-review window remains open | scoped HR oversight recipients | no manager-only variant |

Additional phase-1 rules:

- `assignment_created` is one-shot per unique `ownerAssignedAt` for a route.
- `review_upcoming` must be suppressed when `remindersEnabled === false`.
- `review_overdue` must be suppressed when the route is closed, the review is already completed, or the scheduled review date is stale because the route was rescheduled before dispatch.
- `follow_up_open_after_review` only applies when:
  - `reviewCompletedAt` is present
  - `reviewOutcome` is not `afronden` or `stoppen`
  - route status is not `afgerond` or `gestopt`
  - `hasFollowUpTarget === false`
  - no closeout record resolves the route

## File Structure

| File | Responsibility |
| --- | --- |
| `supabase/action_center_follow_through_mail_layer.sql` | New SQL patch for the bounded Action Center follow-through mail ledger |
| `supabase/schema.sql` | Schema snapshot update for the new ledger table and policies |
| `frontend/lib/action-center-follow-through-mail.ts` | Shared trigger types, dedupe key helpers, suppression reasons, and delivery contract types |
| `frontend/lib/action-center-follow-through-mail.test.ts` | Unit tests for trigger families, dedupe keys, and suppression semantics |
| `frontend/lib/action-center-follow-through-mail-policy.test.ts` | Schema contract test for the new ledger table and policies |
| `frontend/lib/action-center-follow-through-mail-data.ts` | Server-side loader for eligible ExitScan routes, recipients, rhythm config, and route truth required for mailing |
| `frontend/lib/action-center-follow-through-mail-data.test.ts` | Loader tests for ExitScan-only gating, recipient scope, and rhythm inheritance |
| `frontend/lib/action-center-follow-through-mail-planner.ts` | Candidate event planner that turns route truth + rhythm config into deduped mail jobs |
| `frontend/lib/action-center-follow-through-mail-planner.test.ts` | Planner tests for trigger eligibility, stale suppression, escalation timing, and duplicate prevention |
| `frontend/lib/action-center-follow-through-mail-render.ts` | Subject/text/html builders that reuse contextual deeplinks and review invite artifact links |
| `frontend/lib/action-center-follow-through-mail-render.test.ts` | Render tests for bounded copy, deeplink presence, and review-invite reuse |
| `frontend/lib/action-center-follow-through-mail-delivery.ts` | Resend-backed sender + ledger persistence helpers |
| `frontend/lib/action-center-follow-through-mail-delivery.test.ts` | Delivery tests for send payload shape, error handling, and ledger writes |
| `frontend/app/api/action-center-follow-through-mails/route.ts` | Internal dry-run/dispatch route for cron or trusted manual execution |
| `frontend/app/api/action-center-follow-through-mails/route.test.ts` | Route tests for auth, dry-run vs dispatch, permission-safe delivery, and non-eligible route blocking |
| `frontend/vercel.json` | Adds one bounded cron entry to invoke the mail dispatch route daily |
| `frontend/lib/action-center-follow-through-mail-cron.test.ts` | Source-contract test for the bounded cron path only |

Do **not** touch:

- `frontend/lib/action-center-review-rhythm.ts` except for type-safe reuse
- `frontend/app/api/action-center-review-rhythm/route.ts`
- `frontend/lib/action-center-review-invite-ics.ts` except for type-safe reuse
- any Graph-specific connector, mailbox sync, or calendar API integration
- unrelated Action Center page shells or manager-facing UI flows

---

### Task 1: Add the Follow-Through Mail Ledger and Shared Trigger Contract

**Files:**
- Create: `supabase/action_center_follow_through_mail_layer.sql`
- Modify: `supabase/schema.sql`
- Create: `frontend/lib/action-center-follow-through-mail.ts`
- Create: `frontend/lib/action-center-follow-through-mail.test.ts`
- Create: `frontend/lib/action-center-follow-through-mail-policy.test.ts`

- [ ] **Step 1: Write the failing contract tests**

```ts
// frontend/lib/action-center-follow-through-mail.test.ts
import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_FOLLOW_THROUGH_TRIGGER_TYPES,
  buildActionCenterFollowThroughMailDedupeKey,
  getActionCenterFollowThroughMailSuppressionReason,
} from './action-center-follow-through-mail'

describe('action center follow-through mail contract', () => {
  it('exposes the bounded phase-1 trigger families only', () => {
    expect(ACTION_CENTER_FOLLOW_THROUGH_TRIGGER_TYPES).toEqual([
      'assignment_created',
      'review_upcoming',
      'review_overdue',
      'follow_up_open_after_review',
    ])
  })

  it('builds a stable dedupe key from route, trigger family, recipient, and canonical source marker', () => {
    expect(
      buildActionCenterFollowThroughMailDedupeKey({
        routeId: 'camp-1::org::sales',
        triggerType: 'review_upcoming',
        recipientEmail: 'manager@example.com',
        sourceMarker: '2026-05-20',
      }),
    ).toBe('camp-1::org::sales::review_upcoming::manager@example.com::2026-05-20')
  })

  it('suppresses review-upcoming reminders when reminders are disabled', () => {
    expect(
      getActionCenterFollowThroughMailSuppressionReason({
        triggerType: 'review_upcoming',
        remindersEnabled: false,
        routeStatus: 'reviewbaar',
        reviewCompletedAt: null,
        reviewScheduledFor: '2026-05-20',
        reviewOutcome: 'geen-uitkomst',
      }),
    ).toBe('reminders-disabled')
  })

  it('suppresses follow-up-open-after-review when the route is already closed or resolved', () => {
    expect(
      getActionCenterFollowThroughMailSuppressionReason({
        triggerType: 'follow_up_open_after_review',
        remindersEnabled: true,
        routeStatus: 'afgerond',
        reviewCompletedAt: '2026-05-10T12:00:00.000Z',
        reviewScheduledFor: '2026-05-09',
        reviewOutcome: 'afronden',
        hasFollowUpTarget: true,
      }),
    ).toBe('route-resolved')
  })
})
```

```ts
// frontend/lib/action-center-follow-through-mail-policy.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schemaSql = readFileSync(new URL('../../supabase/schema.sql', import.meta.url), 'utf8')

describe('action center follow-through mail schema policy', () => {
  it('defines a bounded ledger table with dedupe uniqueness and service-only policies', () => {
    expect(schemaSql).toMatch(/create table if not exists public\.action_center_follow_through_mail_events/i)
    expect(schemaSql).toMatch(/trigger_type\s+text\s+not null/i)
    expect(schemaSql).toMatch(/recipient_email\s+text\s+not null/i)
    expect(schemaSql).toMatch(/dedupe_key\s+text\s+not null/i)
    expect(schemaSql).toMatch(/delivery_status\s+text\s+not null/i)
    expect(schemaSql).toMatch(/unique\s*\(\s*dedupe_key\s*\)/i)
    expect(schemaSql).toMatch(/create policy "service_role_can_select_action_center_follow_through_mail_events"/i)
    expect(schemaSql).toMatch(/create policy "service_role_can_insert_action_center_follow_through_mail_events"/i)
  })
})
```

- [ ] **Step 2: Run the contract tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail.test.ts" "lib/action-center-follow-through-mail-policy.test.ts"
```

Expected: FAIL because the shared helper and schema contract do not exist yet.

- [ ] **Step 3: Add the SQL patch and shared trigger helper**

Implementation requirements:

- Create `public.action_center_follow_through_mail_events` with at least:
  - `id`
  - `org_id`
  - `route_id`
  - `route_scope_value`
  - `route_source_id`
  - `scan_type`
  - `trigger_type`
  - `recipient_role`
  - `recipient_email`
  - `source_marker`
  - `dedupe_key`
  - `delivery_status`
  - `suppression_reason`
  - `provider_message_id`
  - `sent_at`
  - `created_at`
- Constrain `scan_type` to `exit` in this phase.
- Constrain `trigger_type` to the four bounded phase-1 trigger families.
- Constrain `delivery_status` to bounded values such as `sent`, `suppressed`, and `failed`.
- Make `dedupe_key` unique.
- Keep RLS service-role only for phase 1; no direct end-user writes or reads.

In `frontend/lib/action-center-follow-through-mail.ts`:

- Export the trigger-family tuple and types.
- Export recipient-role types for at least `manager` and `hr_oversight`.
- Export suppression reasons including:
  - `reminders-disabled`
  - `route-closed`
  - `review-completed`
  - `route-resolved`
  - `missing-recipient`
  - `unsupported-route`
  - `stale-schedule`
  - `duplicate`
- Export helpers for:
  - dedupe key generation
  - closed/resolved route detection
  - suppression reason derivation used by the planner

- [ ] **Step 4: Run the contract tests and confirm they pass**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail.test.ts" "lib/action-center-follow-through-mail-policy.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit the contract slice**

```bash
git add supabase/action_center_follow_through_mail_layer.sql supabase/schema.sql frontend/lib/action-center-follow-through-mail.ts frontend/lib/action-center-follow-through-mail.test.ts frontend/lib/action-center-follow-through-mail-policy.test.ts
git commit -m "Add Action Center follow-through mail ledger contract"
```

---

### Task 2: Add the Eligible Route Loader and Candidate Event Planner

**Files:**
- Create: `frontend/lib/action-center-follow-through-mail-data.ts`
- Create: `frontend/lib/action-center-follow-through-mail-data.test.ts`
- Create: `frontend/lib/action-center-follow-through-mail-planner.ts`
- Create: `frontend/lib/action-center-follow-through-mail-planner.test.ts`

- [ ] **Step 1: Write the failing loader and planner tests**

```ts
// frontend/lib/action-center-follow-through-mail-data.test.ts
import { describe, expect, it } from 'vitest'
import { buildActionCenterFollowThroughMailRouteSnapshot } from './action-center-follow-through-mail-data'

describe('action center follow-through mail data', () => {
  it('rejects non-ExitScan routes before they enter the mail planner', () => {
    expect(
      buildActionCenterFollowThroughMailRouteSnapshot({
        routeId: 'camp-2::org::support',
        scanType: 'retention',
        routeStatus: 'reviewbaar',
      }),
    ).toEqual({
      ok: false,
      reason: 'unsupported-route',
    })
  })

  it('keeps scoped HR oversight recipients bounded to writable review-rhythm actors only', () => {
    const snapshot = buildActionCenterFollowThroughMailRouteSnapshot({
      routeId: 'camp-1::org::sales',
      scanType: 'exit',
      routeStatus: 'reviewbaar',
      hrRecipients: [
        { email: 'hr-owner@example.com', role: 'hr_owner', canUpdate: true, canScheduleReview: true, scopeValue: 'org-1::department::sales' },
        { email: 'viewer@example.com', role: 'viewer', canUpdate: false, canScheduleReview: false, scopeValue: 'org-1::department::sales' },
      ],
    })

    expect(snapshot.ok && snapshot.value.hrOversightRecipients).toEqual([
      { email: 'hr-owner@example.com', auditRole: 'hr_owner' },
    ])
  })
})
```

```ts
// frontend/lib/action-center-follow-through-mail-planner.test.ts
import { describe, expect, it } from 'vitest'
import { planActionCenterFollowThroughMailJobs } from './action-center-follow-through-mail-planner'

describe('action center follow-through mail planner', () => {
  const baseSnapshot = {
    routeId: 'camp-1::org::sales',
    orgId: 'org-1',
    campaignId: 'camp-1',
    campaignName: 'ExitScan Q2',
    scopeLabel: 'Sales',
    scanType: 'exit',
    routeStatus: 'reviewbaar',
    reviewScheduledFor: '2026-05-20',
    reviewCompletedAt: null,
    reviewOutcome: 'geen-uitkomst',
    ownerAssignedAt: '2026-05-10T09:00:00.000Z',
    hasFollowUpTarget: false,
    remindersEnabled: true,
    cadenceDays: 14,
    reminderLeadDays: 3,
    escalationLeadDays: 7,
    managerRecipient: { email: 'manager@example.com', name: 'Manager' },
    hrOversightRecipients: [{ email: 'hr-owner@example.com', auditRole: 'hr_owner' }],
  } as const

  it('emits assignment-created once per owner-assignment marker', () => {
    const jobs = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-12T08:00:00.000Z'),
      snapshots: [baseSnapshot],
      existingDedupeKeys: new Set<string>(),
    })

    expect(jobs.some((job) => job.triggerType === 'assignment_created')).toBe(true)
  })

  it('suppresses review-upcoming when the review moved outside the current reminder window', () => {
    const jobs = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-01T08:00:00.000Z'),
      snapshots: [baseSnapshot],
      existingDedupeKeys: new Set<string>(),
    })

    expect(jobs.some((job) => job.triggerType === 'review_upcoming')).toBe(false)
  })

  it('adds an HR oversight variant when review-overdue crosses the escalation window', () => {
    const jobs = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-29T08:00:00.000Z'),
      snapshots: [baseSnapshot],
      existingDedupeKeys: new Set<string>(),
    })

    expect(
      jobs.filter((job) => job.triggerType === 'review_overdue').map((job) => job.recipientRole),
    ).toEqual(expect.arrayContaining(['manager', 'hr_oversight']))
  })

  it('suppresses follow-up-open-after-review when the route already has a successor', () => {
    const jobs = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-06-10T08:00:00.000Z'),
      snapshots: [
        {
          ...baseSnapshot,
          reviewCompletedAt: '2026-05-25T12:00:00.000Z',
          reviewOutcome: 'doorgaan',
          hasFollowUpTarget: true,
        },
      ],
      existingDedupeKeys: new Set<string>(),
    })

    expect(jobs.some((job) => job.triggerType === 'follow_up_open_after_review')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail-data.test.ts" "lib/action-center-follow-through-mail-planner.test.ts"
```

Expected: FAIL because the loader and planner do not exist yet.

- [ ] **Step 3: Add the eligible route loader**

Implementation requirements in `frontend/lib/action-center-follow-through-mail-data.ts`:

- Build a bounded server-side snapshot for mailing that includes:
  - org id
  - campaign id / name
  - route id
  - scope label / scope value
  - scan type
  - route status
  - review scheduled date
  - review completed timestamp
  - review outcome
  - owner assigned timestamp
  - follow-up successor truth
  - route closeout truth
  - assigned manager recipient
  - scoped HR oversight recipients
  - inherited rhythm config
- Reuse existing Action Center live truth and route contract fields instead of duplicating business logic.
- Reuse the live review-rhythm config table and defaulting logic from `frontend/lib/action-center-review-rhythm.ts`.
- Reuse the same route-scope semantics already enforced by the HR Rhythm Console when selecting HR oversight recipients.
- Reject non-ExitScan routes before they reach the planner.
- Keep recipient resolution permission-safe:
  - manager recipient must come from the assigned manager workspace row with a non-empty login email
  - HR oversight recipients must be limited to roles that already satisfy the review-rhythm write boundary for the route scope

- [ ] **Step 4: Add the candidate event planner**

Implementation requirements in `frontend/lib/action-center-follow-through-mail-planner.ts`:

- Accept route snapshots, `now`, and the set of existing ledger dedupe keys.
- Emit bounded candidate jobs only for the four phase-1 trigger families.
- Use canonical source markers for dedupe:
  - `assignment_created`: `ownerAssignedAt`
  - `review_upcoming`: `reviewScheduledFor`
  - `review_overdue`: `reviewScheduledFor` plus recipient role variant
  - `follow_up_open_after_review`: `reviewCompletedAt`
- Apply suppression before a send job is emitted:
  - reminders disabled
  - missing recipient
  - unsupported route
  - duplicate dedupe key
  - stale schedule / stale review date
  - closed or resolved route
- Escalation behavior:
  - do not invent a fifth trigger family
  - instead, allow `review_overdue` to emit a manager variant and an HR oversight variant after `escalationLeadDays`
- Follow-up-after-review behavior:
  - wait until `escalationLeadDays` have elapsed after `reviewCompletedAt`
  - require the route to remain open and unresolved
  - send to HR oversight recipients only

- [ ] **Step 5: Run the tests and confirm they pass**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail-data.test.ts" "lib/action-center-follow-through-mail-planner.test.ts"
```

Expected: PASS.

- [ ] **Step 6: Commit the planner slice**

```bash
git add frontend/lib/action-center-follow-through-mail-data.ts frontend/lib/action-center-follow-through-mail-data.test.ts frontend/lib/action-center-follow-through-mail-planner.ts frontend/lib/action-center-follow-through-mail-planner.test.ts
git commit -m "Plan Action Center follow-through mail jobs"
```

---

### Task 3: Add the Mail Renderer and Resend Delivery Helper

**Files:**
- Create: `frontend/lib/action-center-follow-through-mail-render.ts`
- Create: `frontend/lib/action-center-follow-through-mail-render.test.ts`
- Create: `frontend/lib/action-center-follow-through-mail-delivery.ts`
- Create: `frontend/lib/action-center-follow-through-mail-delivery.test.ts`

- [ ] **Step 1: Write the failing renderer and delivery tests**

```ts
// frontend/lib/action-center-follow-through-mail-render.test.ts
import { describe, expect, it } from 'vitest'
import { renderActionCenterFollowThroughMail } from './action-center-follow-through-mail-render'

describe('action center follow-through mail render', () => {
  it('renders a bounded review-upcoming mail with contextual deeplink and invite artifact link', () => {
    const rendered = renderActionCenterFollowThroughMail({
      triggerType: 'review_upcoming',
      recipientRole: 'manager',
      campaignName: 'ExitScan Q2',
      scopeLabel: 'Sales',
      actionCenterHref: 'https://app.verisight.nl/dashboard/action-center?focus=review-1&view=reviews&source=notification',
      inviteArtifactHref: 'https://app.verisight.nl/api/action-center-review-invites?reviewItemId=review-1&format=ics',
    })

    expect(rendered.subject).toContain('Reviewmoment')
    expect(rendered.emailText).toContain('Action Center')
    expect(rendered.emailText).toContain('https://app.verisight.nl/dashboard/action-center')
    expect(rendered.emailHtml).toContain('format=ics')
  })

  it('does not instruct recipients to confirm or reschedule by email', () => {
    const rendered = renderActionCenterFollowThroughMail({
      triggerType: 'review_overdue',
      recipientRole: 'manager',
      campaignName: 'ExitScan Q2',
      scopeLabel: 'Sales',
      actionCenterHref: 'https://app.verisight.nl/dashboard/action-center?focus=review-1&view=reviews&source=notification',
    })

    expect(rendered.emailText).not.toMatch(/reply|beantwoord|mail terug|reschedule|verplaats/i)
  })
})
```

```ts
// frontend/lib/action-center-follow-through-mail-delivery.test.ts
import { describe, expect, it, vi } from 'vitest'
import { deliverActionCenterFollowThroughMail } from './action-center-follow-through-mail-delivery'

describe('action center follow-through mail delivery', () => {
  it('posts a bounded Resend payload and returns the provider id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 're_123' }),
    })

    const result = await deliverActionCenterFollowThroughMail(
      {
        recipientEmail: 'manager@example.com',
        subject: 'Reviewmoment ExitScan Q2 / Sales',
        emailText: 'Open Action Center',
        emailHtml: '<p>Open Action Center</p>',
      },
      {
        fetchImpl: fetchMock,
        resendApiKey: 're_test',
        emailFrom: 'Verisight <noreply@verisight.nl>',
      },
    )

    expect(result).toEqual({
      ok: true,
      providerMessageId: 're_123',
    })
  })
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail-render.test.ts" "lib/action-center-follow-through-mail-delivery.test.ts"
```

Expected: FAIL because the renderer and delivery helper do not exist yet.

- [ ] **Step 3: Add the bounded renderer**

Implementation requirements in `frontend/lib/action-center-follow-through-mail-render.ts`:

- Render subject/text/html for the four trigger families only.
- Reuse the contextual deeplink foundation from `frontend/lib/action-center-entry.ts`.
- Reuse the existing review invite contract for review-centric mails:
  - include the Action Center review deeplink
  - include a link to the existing `.ics` artifact for `review_upcoming` and `review_overdue`
  - do not create a second calendar artifact format
- Keep copy bounded and operational:
  - why this route needs attention
  - what to open in Action Center
  - for review-centric messages, where to download the calendar artifact
- Never instruct people to reply by email, confirm completion by email, or reschedule off-platform.

- [ ] **Step 4: Add the Resend delivery helper**

Implementation requirements in `frontend/lib/action-center-follow-through-mail-delivery.ts`:

- Use the same `fetch('https://api.resend.com/emails', ...)` integration style already present in `frontend/app/api/contact/route.ts`.
- Keep this helper transactional and bounded:
  - one recipient per send
  - HTML + plain text
  - no marketing batch semantics
  - no attachments beyond existing bounded review artifact links
- Return structured success/failure output including provider id or reason.
- Keep provider/env resolution explicit and server-only.

- [ ] **Step 5: Run the tests and confirm they pass**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail-render.test.ts" "lib/action-center-follow-through-mail-delivery.test.ts"
```

Expected: PASS.

- [ ] **Step 6: Commit the render/delivery slice**

```bash
git add frontend/lib/action-center-follow-through-mail-render.ts frontend/lib/action-center-follow-through-mail-render.test.ts frontend/lib/action-center-follow-through-mail-delivery.ts frontend/lib/action-center-follow-through-mail-delivery.test.ts
git commit -m "Add Action Center follow-through mail rendering"
```

---

### Task 4: Add the Internal Dispatch Route and Daily Cron Entry

**Files:**
- Create: `frontend/app/api/action-center-follow-through-mails/route.ts`
- Create: `frontend/app/api/action-center-follow-through-mails/route.test.ts`
- Modify: `frontend/vercel.json`
- Create: `frontend/lib/action-center-follow-through-mail-cron.test.ts`

- [ ] **Step 1: Write the failing route and cron tests**

```ts
// frontend/app/api/action-center-follow-through-mails/route.test.ts
import { describe, expect, it } from 'vitest'

describe('POST /api/action-center-follow-through-mails', () => {
  it('rejects unauthenticated dispatch requests', async () => {
    expect(true).toBe(false)
  })

  it('supports dry-run responses without sending mail', async () => {
    expect(true).toBe(false)
  })

  it('blocks non-eligible routes from leaving the dispatcher', async () => {
    expect(true).toBe(false)
  })
})
```

```ts
// frontend/lib/action-center-follow-through-mail-cron.test.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const vercelJson = readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')

describe('action center follow-through mail cron config', () => {
  it('adds exactly one bounded cron path for the mail dispatcher', () => {
    expect(vercelJson).toMatch(/"crons"/)
    expect(vercelJson).toMatch(/"path"\s*:\s*"\/api\/action-center-follow-through-mails"/)
  })
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npx vitest run "app/api/action-center-follow-through-mails/route.test.ts" "lib/action-center-follow-through-mail-cron.test.ts"
```

Expected: FAIL because the route and cron config do not exist yet.

- [ ] **Step 3: Add the bounded dispatch route**

Implementation requirements in `frontend/app/api/action-center-follow-through-mails/route.ts`:

- Support two bounded modes only:
  - `dry-run`: returns planned candidate jobs and suppression summaries without sending
  - `dispatch`: sends eligible jobs and records ledger rows
- Guard execution so only trusted invocations can dispatch:
  - Vercel cron invocation, or
  - trusted bearer secret / internal token
- Use the route loader, planner, renderer, and delivery helper from earlier tasks.
- Before each send:
  - re-check dedupe against the ledger
  - re-check route eligibility
  - re-check recipient availability
- Record sent, suppressed, and failed outcomes in the ledger.
- Return compact operational JSON:
  - planned count
  - sent count
  - suppressed count
  - failed count
  - route ids or dedupe keys only where needed for debugging

- [ ] **Step 4: Add the bounded cron entry**

Implementation requirements in `frontend/vercel.json`:

- Add exactly one cron entry for the follow-through dispatcher.
- Run it at a conservative daily cadence in phase 1.
- Point it only to `/api/action-center-follow-through-mails`.
- Do not add any second cron, queue, or workflow orchestration in this slice.

- [ ] **Step 5: Run the tests and confirm they pass**

Run:

```bash
npx vitest run "app/api/action-center-follow-through-mails/route.test.ts" "lib/action-center-follow-through-mail-cron.test.ts"
```

Expected: PASS.

- [ ] **Step 6: Commit the dispatch slice**

```bash
git add frontend/app/api/action-center-follow-through-mails/route.ts frontend/app/api/action-center-follow-through-mails/route.test.ts frontend/vercel.json frontend/lib/action-center-follow-through-mail-cron.test.ts
git commit -m "Add Action Center follow-through mail dispatch route"
```

---

### Task 5: Verify the Bounded Mail Layer End-to-End

**Files:**
- Verify only; no new files required unless a failing test forces a targeted fix inside the files above

- [ ] **Step 1: Run the bounded follow-through mail suite**

Run:

```bash
npx vitest run "lib/action-center-follow-through-mail.test.ts" "lib/action-center-follow-through-mail-policy.test.ts" "lib/action-center-follow-through-mail-data.test.ts" "lib/action-center-follow-through-mail-planner.test.ts" "lib/action-center-follow-through-mail-render.test.ts" "lib/action-center-follow-through-mail-delivery.test.ts" "app/api/action-center-follow-through-mails/route.test.ts" "lib/action-center-follow-through-mail-cron.test.ts"
```

Expected: PASS.

- [ ] **Step 2: Run the adjacent regression suite**

Run:

```bash
npx vitest run "lib/action-center-review-rhythm.test.ts" "lib/action-center-review-rhythm-data.test.ts" "app/api/action-center-review-rhythm/route.test.ts" "lib/action-center-review-invite.test.ts" "app/api/action-center-review-invites/route.test.ts" "components/dashboard/review-moment-detail-panel.test.ts"
```

Expected: PASS, proving no drift in the live rhythm/invite baselines.

- [ ] **Step 3: Run a production build**

Run:

```bash
npm run build
```

Expected: PASS with no new type or route-handler regressions.

- [ ] **Step 4: Manually verify the bounded product rules**

Confirm:

- only ExitScan routes are planned for outbound mail
- review-upcoming mails honor `remindersEnabled`
- overdue escalation does not invent a fifth trigger family
- no mail variant instructs reply-based writes or rescheduling by email
- review-centric mails point back to Action Center and the existing `.ics` artifact path
- non-eligible routes and missing-recipient routes are suppressed, not sent

- [ ] **Step 5: Commit the verification pass**

```bash
git add .
git commit -m "Verify Action Center follow-through mail layer"
```

---

## Notes for the Implementer

- Keep this slice operational and quiet. If an implementation idea starts looking like a workflow engine, it is probably wrong.
- Reuse existing live helpers before adding any new Action Center truth-mapping layer.
- If you discover that `follow_up_open_after_review` cannot be derived safely from current route truth, stop and tighten that condition before coding around it.
- If dispatch safety depends on extra env vars or secrets, add them minimally and document them inside the implementation PR description rather than opening a broad configuration program here.
