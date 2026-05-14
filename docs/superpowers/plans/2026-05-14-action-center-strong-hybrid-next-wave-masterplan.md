# Action Center Strong Hybrid Next Wave Masterplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose the post-live Action Center strong-hybrid roadmap into the next bounded execution waves after the review-invite foundation is live on `main`.

**Architecture:** Treat the next maturity phase as a program, not a single feature. The live review-invite foundation remains the base layer; the next work must be split into independent child plans for triggered mail, HR rhythm control, review rescheduling, optional native Outlook integration, and broader route parity.

**Tech Stack:** Next.js App Router, TypeScript, React 19, Supabase-backed Action Center data loaders, Vercel deploy flow, standards-based email + ICS baseline, optional later Microsoft Graph integration.

---

## Scope Check

This file is a **post-live masterplan**, not a directly executable implementation slice.

The following scope is too large and too cross-cutting for one implementation plan:

- automatic email triggers / reminders
- HR rhythm console
- review reschedule flows
- native Outlook / Graph integration
- broader suite parity outside the bounded invite slice

This masterplan therefore defines:

- what is already live and may be reused
- which child plans must exist next
- the required order, dependencies, and rollout gates
- which work can happen before later work is allowed to start

Do **not** implement directly from this file. Each workstream below should become its own child plan before coding starts.

## Live Baseline

The following foundation is already live through merged [PR #136](https://github.com/larshengel08-lang/VerisightSaaS/pull/136):

- contextual Action Center entry and deeplink foundation
- shared review invite contract
- ICS renderer
- bounded review invite preview/download API
- reviewmomenten `.ics` CTA
- eligibility and origin hardening for outward-facing invite artifacts

This baseline means the next phase may assume:

- `reviewItemId`, `focus`, `view`, and `source` contextual landing are already in place
- review invites remain `email + ICS` capable without Microsoft Graph
- Action Center remains canonical truth for review state, owner state, closeout, and reopen
- scheduler permissions and `can_view` gating already matter and must stay aligned across UI and API

### Baseline Synchronization Rule

This masterplan assumes the current planning worktree already contains the live baseline from `main`.

Before writing any child plan from this file:

- verify the worktree contains merge commit `31832e58b4209428ca64f0a628b0f7744e5212f2` or an equivalent synced `main` baseline
- if the worktree is behind or materially diverged from that baseline, sync it from `main` first
- do not write child plans against a stale local assumption set

## Product Rules To Preserve

- Outlook-first remains the strategic direction, but `email + ICS` remains the baseline operational model.
- No off-platform canonical writes are allowed in the next phase unless a later child plan explicitly changes that rule.
- ExitScan remains the only route family assumed live-safe for strong-hybrid follow-through until parity work explicitly widens the perimeter.
- HR remains the rhythm owner; manager interactions should stay lighter than HR interactions.
- Reminder and review logic must land through contextual entry, not generic Action Center entry.

At masterplan level, `Outlook-friendly` means:

- the customer primarily works in Outlook / Exchange for calendar behavior
- standard email + ICS invites are operationally acceptable in the baseline
- there is a workable organizer mailbox model for review invites
- later customer IT posture could support a Graph consent path if the optional native integration becomes relevant

It does **not** mean that delegated per-manager calendar write access is available in the baseline.

## Required Child Plans

| Planned File | Responsibility |
| --- | --- |
| `docs/superpowers/plans/2026-05-14-action-center-triggered-follow-through-mail-layer.md` | Event model, templates, dedupe, reminder timing, and bounded trigger delivery |
| `docs/superpowers/plans/2026-05-14-action-center-hr-rhythm-console.md` | HR-facing review cadence control, reminder rules, escalation control, and overview |
| `docs/superpowers/plans/2026-05-14-action-center-review-reschedule-flows.md` | Canonical schedule changes, invite revision handling, and audit-safe reschedule/update/cancel behavior |
| `docs/superpowers/plans/2026-05-14-action-center-native-outlook-graph-integration.md` | Optional Microsoft Graph path, consent model, organizer ownership, and fallback rules |
| `docs/superpowers/plans/2026-05-14-action-center-route-defaults-and-suite-parity.md` | Route eligibility expansion, defaults per route family, and suite-broad parity gating |

Do **not** create code from this masterplan without first creating the relevant child plan file.

## Planning Contract

The sections below are **plan-authoring tasks only**.

Completing one of these tasks means:

- the named child-plan document has been written
- the child plan has been sanity-checked against this masterplan
- the child plan document has been committed

Completing one of these tasks does **not** mean:

- any feature code was written
- any database shape changed
- any UI was shipped
- any deploy or merge happened

## File Structure Guidance For The Next Wave

The next code changes should likely cluster around these areas:

- `frontend/lib/action-center-review-invite*.ts`
  - reuse for reminder copy, trigger contracts, invite revision semantics, and later Graph handoff boundaries
- `frontend/app/api/action-center-review-invites/*`
  - reuse for review invite generation, later invite updates/cancels, and schedule-aware payload handling
- `frontend/lib/action-center-page-data.ts`
  - extend only where new review rhythm or HR oversight state must be surfaced
- `frontend/components/dashboard/review-moment-*`
  - extend for review timing controls, review reschedule actions, and manager quick-entry only when child plans call for it
- future dedicated reminder/event plumbing
  - should live in new bounded files rather than growing the invite helper into a generic mail engine

Avoid:

- bolting reminder logic directly into the current review invite route
- mixing HR rhythm control into generic dashboard surfaces
- widening route eligibility in shared helpers before the parity plan exists

## Execution Order

The recommended next-wave **child-plan authoring order** is:

1. HR Rhythm Console
2. Triggered Follow-Through Mail Layer
3. Review Reschedule Flows
4. Native Outlook / Graph Integration
5. Route Defaults and Suite Parity

The reason for this order is:

- HR rhythm control defines the cadence, reminder, and escalation model that the mail layer must obey
- triggered mail remains the first major user-visible adoption unlock after that governance model exists
- rescheduling must be canonical before any native calendar sync path becomes trustworthy
- Graph should improve an already-stable baseline, not become the baseline
- parity should only expand after the rhythm model is proven on ExitScan

## Rollout Gates

### Gate A: Before Any Next-Wave Child Plan Starts

- [ ] PR #136 baseline is merged and live on `main`
- [ ] the current worktree contains merge commit `31832e58b4209428ca64f0a628b0f7744e5212f2` or an equivalent synced `main` baseline
- [ ] contextual entry remains stable in production
- [ ] review invite route and `.ics` CTA remain green in targeted tests

### Gate B: Before Triggered Mail Starts

- [ ] HR cadence defaults are explicit
- [ ] reminder timing and escalation timing rules are explicit
- [ ] owner reassignment boundaries are explicit
- [ ] mail events are bounded to Action Center truth and do not mutate canonical state
- [ ] dedupe/throttle rules exist so HR does not create spam loops

### Gate C: Before Review Reschedule Starts

- [ ] HR rhythm console defines who may change cadence vs individual review dates
- [ ] reminder engine is aware of schedule changes without stale sends
- [ ] review invite revision semantics are documented and tested

### Gate D: Before Native Outlook / Graph Starts

- [ ] `email + ICS` baseline works reliably without Graph
- [ ] organizer identity model is explicit
- [ ] consent, fallback, and customer eligibility rules are documented

### Gate E: Before Route Parity Starts

- [ ] at least 10 live ExitScan routes across at least 2 customer contexts have produced measurable rhythm data
- [ ] no invite/reminder regression has remained open in production for 2 consecutive weeks
- [ ] manager engagement after trigger is at least 60% within the expected follow-through window
- [ ] scheduled reviews completed or explicitly rescheduled are at least 70%
- [ ] HR oversight model is trusted in live use
- [ ] explicit route inclusion/exclusion matrix is ready for the next route family

## Planning Task 1: Write the HR Rhythm Console Child Plan

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-14-action-center-hr-rhythm-console.md`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-14-action-center-strong-hybrid-upsell-design.md`

- [ ] Define what HR may configure:
  - review cadence defaults
  - reminder timing
  - escalation timing
  - owner reassignment boundaries

- [ ] Define what HR may not configure in phase 1:
  - generic workflow automation
  - free-form arbitrary rule chains
  - cross-channel orchestration beyond the bounded reminder model

- [ ] Make the child plan explicit about the minimum overview surface:
  - upcoming reviews
  - overdue reviews
  - stale follow-through
  - pending escalations

- [ ] Require test coverage in the child plan for:
  - permission boundaries
  - invalid cadence/rule combinations
  - stale-overview correctness
  - no leakage into unrelated Action Center views

- [ ] Commit the child plan when written.

## Planning Task 2: Write the Triggered Follow-Through Mail Layer Child Plan

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-14-action-center-triggered-follow-through-mail-layer.md`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-14-action-center-strong-hybrid-upsell-design.md`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-14-action-center-outlook-email-ics-channel-contract.md`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-14-action-center-hr-rhythm-console.md`

- [ ] Define the exact trigger set for phase 1:
  - assignment created
  - review upcoming
  - review overdue
  - follow-up still open after review

- [ ] Make the child plan explicit about what it must not include:
  - no broad marketing mail framework
  - no Microsoft Graph dependency
  - no canonical writes by email reply
  - no route-family broadening beyond explicit eligibility

- [ ] Define the delivery contract:
  - event source
  - recipient resolution
  - template ownership
  - dedupe window
  - reminder suppression rules
  - contextual deeplink requirements

- [ ] Make the child plan explicitly inherit cadence, reminder, and escalation boundaries from the HR Rhythm Console child plan rather than redefining them ad hoc.

- [ ] Require testing for:
  - duplicate-send prevention
  - stale schedule suppression
  - non-eligible route blocking
  - permission-safe recipient selection

- [ ] Commit the child plan when written.

## Planning Task 3: Write the Review Reschedule Flows Child Plan

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-14-action-center-review-reschedule-flows.md`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-invite.ts`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\frontend\lib\action-center-review-invite-ics.ts`

- [ ] Define the canonical schedule mutation rules:
  - who may reschedule
  - which state changes count as reschedule vs cancel
  - how sequence / revision increments work

- [ ] Define the artifact behavior:
  - updated invite
  - cancelled invite
  - stale invite invalidation
  - relation to existing `.ics` baseline

- [ ] Keep the child plan explicit that:
  - Action Center date/state is canonical
  - calendar artifacts mirror canonical state
  - no external calendar edit may silently rewrite Action Center state

- [ ] Require testing for:
  - sequence monotonicity
  - stale reminder suppression after reschedule
  - cancel behavior for closed/stopped review tracks
  - auditability of who changed the schedule

- [ ] Commit the child plan when written.

## Planning Task 4: Write the Native Outlook / Graph Integration Child Plan

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-14-action-center-native-outlook-graph-integration.md`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-14-action-center-strong-hybrid-upsell-design.md`

- [ ] Define the integration as optional and additive:
  - baseline remains `email + ICS`
  - Graph path is a customer-fit enhancement
  - fallback must always exist

- [ ] Define the technical boundary:
  - organizer ownership model
  - consent model
  - token storage/refresh model
  - failure fallback to current invite artifacts

- [ ] Define the product gating:
  - which customers qualify
  - what `Outlook-friendly` means in terms of mailbox model, consent expectations, and IT tolerance
  - what is unsupported in the first Graph release

- [ ] Require testing for:
  - consent-not-available fallback
  - send/update/cancel parity with ICS path
  - no truth drift between Graph event identity and Action Center schedule identity

- [ ] Commit the child plan when written.

## Planning Task 5: Write the Route Defaults and Suite Parity Child Plan

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\plans\2026-05-14-action-center-route-defaults-and-suite-parity.md`
- Reference: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\spec-hr-routebeheer-structure\docs\superpowers\specs\2026-05-14-action-center-strong-hybrid-upsell-design.md`

- [ ] Define the first route expansion perimeter explicitly:
  - ExitScan remains baseline
  - RetentieScan is the first unlock candidate
  - other route families stay out until explicitly justified

- [ ] Define what parity means:
  - default owner model
  - default review cadence
  - default escalation expectation
  - default closeout discipline

- [ ] Require the child plan to include an inclusion/exclusion matrix per route family.

- [ ] Require testing for:
  - route eligibility guardrails
  - defaults applied only to in-scope routes
  - no accidental broadening of Action Center semantics in unrelated scan types

- [ ] Commit the child plan when written.

## Verification Checklist

- [ ] PR #136 live baseline is explicitly acknowledged in every child plan that depends on it
- [ ] every child plan first verifies that the current worktree still contains the live baseline contract from `main`
- [ ] no child plan assumes Microsoft Graph as the baseline delivery path
- [ ] no child plan introduces off-platform canonical writes
- [ ] child-plan order preserves rhythm before parity and baseline before Graph
- [ ] ExitScan-only baseline remains explicit until the parity child plan changes it

## Self-Review

Spec coverage check:

- automatic email triggers / reminders: covered by Task 1
- HR rhythm console: covered by Task 2
- review reschedule flows: covered by Task 3
- native Outlook / Graph integration: covered by Task 4
- broader suite parity: covered by Task 5

Placeholder scan:

- no `TODO`, `TBD`, or implied “decide later” placeholders remain

Type/term consistency:

- `email + ICS` baseline is used consistently
- `child plan` and `masterplan` roles are kept distinct
- `ExitScan` is consistently the baseline route family

## Execution Handoff

This masterplan is complete when it is saved and committed.

The next implementation-planning step should be to write **Planning Task 1** as the first actual child plan:

- `docs/superpowers/plans/2026-05-14-action-center-hr-rhythm-console.md`

Do not start coding the next wave from this document directly.
