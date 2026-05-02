# Action Center Pilot Go / No-Go Review

Date: 2026-05-02  
Reviewer: Codex  
Status: **No-go for external pilot use today**

## Scope

This review checks the current Action Center state against the central roadmap exit criteria for pilot-ready commercial use.

The review is intentionally narrow:

- can the critical HR and manager route flows be trusted?
- are the key governance writes authority-safe in runtime, not just in specs?
- is the product operationally supportable enough for a first external pilot?

## Verdict

**No-go today.**

Action Center is materially closer to pilot-ready than before:

- route semantics are strong
- closeout / reopen / follow-up direction exists
- reporting, governance, ops, UX, scan handoff, and pilot operationalization all now exist as bounded capabilities
- targeted API and build evidence is green

But the first-pilot gate is still blocked by runtime trust and browser-path evidence on core route governance flows.

## What is green

Fresh evidence collected in this review:

- `vitest`: `36 passed`
  - `app/api/action-center-route-actions/route.test.ts`
  - `app/api/action-center-route-closeouts/route.test.ts`
  - `app/api/action-center-route-follow-ups/route.test.ts`
  - `app/api/action-center-route-reopens/route.test.ts`
  - `app/(dashboard)/beheer/health/page.test.ts`
- `npm run build`: passes
  - still with the pre-existing warning on `components/marketing/home-insight-action-demo.tsx`
- pilot docs and health-review operational layer are present

Interpretation:

- the bounded API contracts are largely correct in code
- the app still builds cleanly
- the internal pilot operating layer is present enough to use once the critical runtime blockers are removed

## What is red

Fresh browser evidence collected in this review:

- `Playwright`: `2 passed`, `4 failed`
  - passed:
    - HR shared shell access
    - manager denied access on insight routes
  - failed:
    - HR happy-path continuity through campaign detail into focused Action Center route
    - manager bounded first-response save flow
    - HR route closeout browser flow
    - HR follow-up route browser flow

Interpretation:

- the product is not yet pilot-ready for external use because multiple first-pilot critical browser paths still fail
- the failures are not all equal: some are selector or fixture drift, but at least one is a real runtime blocker

## Root causes identified in this review

### 1. Real runtime blocker: governance audit-role mismatch in live Supabase

The live database contract for route governance tables still lags behind the shipped governance code.

Confirmed from live table metadata:

- `public.action_center_route_relations.recorded_by_role` still accepts only the older narrower set in runtime
- current route follow-up code writes richer governance roles such as:
  - `verisight_admin`
  - `hr_owner`
  - `hr_member`

This mismatch explains the observed `500` on the follow-up browser flow.

The same mismatch is very likely to affect:

- `action_center_route_closeouts.closed_by_role`
- `action_center_route_reopens.reopened_by_role`

because the current code already persists the richer audit roles there too.

Practical consequence:

- follow-up is not trustworthy in live runtime today
- closeout and reopen are likely also still schema-fragile until the same compat patch is applied live

### 2. Browser coverage drift exists on top of the runtime blocker

This review also exposed test and fixture drift:

- the seed artifact no longer carried the closeout route context expected by the browser test
- several browser assertions still reflected older copy or older field labels
- the happy-path test still assumed a narrower campaign-detail handoff contract than the current route identity model

These issues matter, but they are not the main go / no-go blocker.

Why:

- they reduce confidence in automated browser evidence
- but they do not by themselves prove the product is unsafe
- the live governance-role mismatch does

## Exit-criteria assessment

### Product understanding

**Mostly green**

The route model now reads much more clearly than before:

- route summary exists
- lineage is bounded and readable
- historical versus active route states are clearer

### HR usability

**Not yet green**

Reason:

- the browser evidence for closeout and follow-up does not currently pass
- follow-up specifically hits a live `500`

### Manager usability

**Partially green, not yet fully green**

Reason:

- access boundaries are working
- but the bounded first-response browser flow is not yet passing as evidence

### Bestuurlijke terugleesbaarheid

**Green enough for first pilot scope**

Reason:

- direct lineage exists
- route-level readback exists
- overview/detail readback is materially improved

### Governance trust

**Not yet green**

Reason:

- code-level hardening is strong
- live schema compatibility for governance audit roles is still incomplete

### Operational stability

**Not yet green**

Reason:

- build is green
- targeted API tests are green
- but the critical browser path set is still not fully dependable

### UX confidence

**Mostly green, but not sufficient to override red runtime gates**

### Commercial clarity

**Green**

Action Center now clearly reads as:

- the follow-through layer after a scan
- not a standalone tasking product

### Pilot operational readiness

**Green enough once runtime blockers are removed**

Reason:

- pilot playbook exists
- readiness checklist exists
- health review now surfaces pilot operational guidance

## Minimum blockers before go

Action Center should not be treated as external-pilot-ready until all of the following are true:

1. The live governance-role compat patch is applied to:
- `action_center_route_closeouts`
- `action_center_route_reopens`
- `action_center_route_relations`

2. The critical browser flow set is rerun successfully:
- HR opens route from post-scan context
- manager sees route
- manager saves bounded first step
- save survives reload
- HR closes route
- HR starts follow-up route
- lineage remains readable for both HR and manager

3. The browser suite is updated so that its assertions match the current shipped surface rather than older copy or seed contracts.

## Smallest path from no-go to go

The shortest realistic path is:

1. apply the governance role compat patch live
2. repair the stale seed/browser expectations
3. rerun the critical Playwright suite
4. re-issue this go / no-go review

## Final recommendation

**Do not start an external paid or design-partner pilot from the current state today.**

This is close enough that the next pass should be a hardening slice, not a new product wave.

The product core is no longer the problem.
The remaining gate is:

- live governance/runtime trust
- plus clean browser proof on the core HR and manager path
