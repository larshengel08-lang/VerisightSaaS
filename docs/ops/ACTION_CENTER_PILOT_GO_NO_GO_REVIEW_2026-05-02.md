# Action Center Pilot Go / No-Go Review

Date: 2026-05-02  
Reviewer: Codex  
Status: **Go for bounded external pilot use**

## Scope

This review checks the current Action Center state against the central roadmap exit criteria for pilot-ready commercial use.

The review stays intentionally narrow:

- do the critical HR and manager route flows work in the live browser path?
- are the key governance writes authority-safe in runtime, not just in specs?
- is the product operationally supportable enough for a first external pilot?

## Verdict

**Go, within the current bounded pilot scope.**

Action Center now clears the minimum pilot gates that were previously still red:

- the governance-role runtime mismatch is resolved in live Supabase
- the critical HR closeout and follow-up browser proofs are green
- the manager bounded first-step flow persists correctly
- the targeted API contracts, health review, and production build are green

This is not a claim of broad enterprise readiness or unlimited scenario coverage.
It is a narrower judgment:

- a first external pilot can now be run against the currently defined Action Center scope
- with the existing pilot playbook, checklist, and operational guardrails

## Fresh evidence

### Browser proof

`Playwright`: `6 passed`

- `tests/e2e/action-center-hr-happy-path.spec.ts`
- `tests/e2e/action-center-manager-access.spec.ts`
- `tests/e2e/action-center-route-closeout.spec.ts`
- `tests/e2e/action-center-route-reopen.spec.ts`

Critical flows now proven end to end:

- HR can follow the post-scan route into Action Center
- HR sees one canonical route context
- manager access boundaries behave correctly
- manager can save a bounded first response and see it persist
- HR can explicitly close a route and read it back as closed
- HR can start a follow-up route and both HR and manager see the same direct lineage context

### API and ops proof

`vitest`: `36 passed`

- `app/api/action-center-route-actions/route.test.ts`
- `app/api/action-center-route-closeouts/route.test.ts`
- `app/api/action-center-route-follow-ups/route.test.ts`
- `app/api/action-center-route-reopens/route.test.ts`
- `app/(dashboard)/beheer/health/page.test.ts`

### Build proof

`npm run build`: passes

Remaining note:

- there is still a pre-existing warning on `components/marketing/home-insight-action-demo.tsx` for unused `goTo`
- this does not block the Action Center pilot gate

## What changed since the previous no-go

### 1. Live governance compatibility is aligned

The Supabase compat patch for governance audit roles is now live for:

- `action_center_route_closeouts`
- `action_center_route_reopens`
- `action_center_route_relations`

Practical consequence:

- route-governance writes now match the shipped runtime role model
- the earlier runtime/schema mismatch is no longer a blocker

### 2. The last browser blocker was real, but is now resolved

The remaining red path was not random browser instability.
It came from cross-test state drift:

- the closeout flow correctly closed the target route
- the follow-up test then inherited that mutated live state
- which removed the only open same-scope target route needed for `Start vervolgroute`

The fix was to make the follow-up browser proof reseed its pilot data explicitly before running.

Practical consequence:

- the critical pilot suite is now stable against its own stateful route mutations
- the follow-up path proves the intended product behavior again, not just a lucky run order

## Exit-criteria assessment

### Product understanding

**Green**

Users can now read:

- why the route exists
- who is now at bat
- whether the route is open, closed, historical, or followed up
- how direct lineage should be interpreted

### HR usability

**Green for bounded pilot scope**

HR can now reliably:

- open route context after scan handoff
- assign managers
- close routes
- start follow-up routes
- read closed and followed-up routes back in the browser

### Manager usability

**Green for bounded pilot scope**

Managers can now:

- access only their Action Center scope
- save a bounded first response
- reload and read that route state back correctly
- understand direct lineage context when relevant

### Bestuurlijke terugleesbaarheid

**Green**

The bounded route-level readback now covers:

- route summary
- closeout
- follow-up lineage
- direct historical context

### Governance trust

**Green for first pilot**

The critical write paths are now backed by live runtime evidence for:

- route actions
- route closeout
- route reopen
- route follow-up

### Operational stability

**Green for first pilot**

The current pilot slice now has:

- green targeted browser evidence
- green targeted API evidence
- green build evidence
- a health review surface
- a pilot playbook and readiness checklist

### UX confidence

**Green enough for first pilot**

The current surface is calm and semantically readable enough to avoid “internal prototype” feel on the core route flows.

### Commercial clarity

**Green**

Action Center reads clearly as:

- the follow-through layer after a scan
- not a standalone tasking product

### Pilot operational readiness

**Green for bounded pilot rollout**

The product now has:

- pilot playbook
- readiness checklist
- health review guidance
- enough operating context to support a first customer pilot without ad hoc rescue as the default mode

## Guardrails on this go decision

This is a **bounded** go decision, not an unrestricted one.

It assumes:

- the pilot stays inside the currently proven HR/manager route flows
- the seeded/demo/support paths from the pilot docs are followed
- governance-role compatibility stays aligned between code and Supabase
- any new Action Center wave re-runs this critical proof set before external use

## Remaining non-blocking observations

- the pilot suite still depends on explicit reseeding for the follow-up lineage proof, because these browser paths mutate live route state by design
- the pre-existing build warning on `home-insight-action-demo.tsx` should still be cleaned up, but it is outside the Action Center pilot gate
- broader scenario coverage beyond the current bounded route model still belongs to later product hardening, not to this go decision

## Final recommendation

**Proceed with a first bounded external pilot.**

Recommended posture:

- use the existing pilot playbook and checklist
- keep the pilot inside the currently proven route lifecycle
- treat the current critical browser suite as the standing regression gate for any new Action Center changes
