# Action Center HR Demo / Seed Hardening

Date: 2026-04-29  
Status: Proposed  
Owner: Codex  
Scope: Logged-in suite only

## 1. Goal

This phase creates one stable, rich HR demo route that makes the current Action Center product line convincingly visible in the browser.

The purpose is not to add new product capability. The purpose is to make the existing capability:

- visible
- believable
- repeatable
- regression-safe

The main bottleneck after the route contract, HR bridge, and Action Center Core V1 work is no longer architecture. The bottleneck is that the HR happy path is still not rich enough in live seed data to prove the product end to end in the browser.

This phase solves that.

## 2. Product Role

This is a demo-hardening and QA-hardening phase.

It is not:

- a new Action Center feature phase
- a new manager workflow phase
- a broad redesign phase
- a multi-scenario fixture platform

It is:

- one canonical HR campaign
- one canonical active follow-up route
- one stable suite flow
- one reusable browser-QA path

## 3. Desired Outcome

After this phase, a reviewer should be able to log in as HR and live-see:

- why a route is reviewed
- what gets tested at review
- what the first step is
- what was tried
- what was observed
- what was decided
- how the route closes

This must be visible across:

- overview
- reports
- campaign detail
- Action Center landing
- Action Center detail

The strongest proof points are:

- campaign detail
- Action Center detail

## 4. Recommended Approach

### Chosen approach

Build one curated but truthful HR demo route.

That means:

- the route is deliberately seeded to be rich enough for product review
- the route is still backed by real campaign truth, route truth, checkpoint truth, and update truth
- no UI-only fake states are allowed

### Why this approach

This gives the best balance between:

- product credibility
- browser-QA repeatability
- low maintenance
- low scope explosion

### Rejected alternatives

#### Seed-only hardening

Too fragile. It might create a better live route once, but not a dependable product-review path.

#### Full fixture framework

Too heavy for this phase. It would over-optimize infrastructure before the single most important HR route is solid.

## 5. Canonical Demo Route

This phase introduces one canonical HR demo campaign that carries one canonical active route.

That route must be rich enough to drive all four Action Center Core V1 semantic layers:

### Review layer

The route must carry:

- `reviewReason`
- `reviewQuestion`
- `reviewOutcome`

These must be real route/checkpoint-backed values, not local display placeholders.

#### Canonical source order for review semantics

For this phase, the demo route must project review semantics through one fixed source order:

- `reviewReason`
  primary: route-level review reason truth
  fallback: latest review checkpoint reason truth
- `reviewQuestion`
  primary: latest review checkpoint question truth when explicitly present
  fallback: projector-derived question from route-level review reason truth
  no fallback to ad hoc component copy or one-off seed labels
- `reviewOutcome`
  primary: latest review checkpoint outcome truth
  fallback: route-level review outcome truth when checkpoint truth is absent

This keeps `reviewQuestion` semantics-first in this phase without inventing a new input flow. It may still be a projected presentation field, but its projection rule must stay global and shared.

### Action layer

The route must carry:

- `whyNow`
- `firstStep`
- `owner`
- `expectedEffect`

The first step must read like a real action, not a result statement or summary fragment.

### Result layer

The route must carry:

- `whatWasTried`
- `whatWeObserved`
- `whatWasDecided`

These values must be grounded in explicit route, checkpoint, dossier, or update truth already supported by the semantics projector.

#### Canonical source order for action and result semantics

For this phase, every visible semantic field must resolve through one deterministic source order:

- `whyNow`
  primary: route-level reason truth
  fallback: route summary only when the reason layer is empty
- `firstStep`
  primary: route-level next-step or intervention truth
  fallback: latest action-oriented update truth when no canonical next step exists
- `owner`
  primary: route owner truth
  fallback: assigned manager truth already used by the route projector
- `expectedEffect`
  primary: route-level expected effect truth
  fallback: first-value or outcome expectation truth already consumed by the semantics projector
- `whatWasTried`
  primary: latest action-oriented update truth
  fallback: latest explicit intervention checkpoint truth
- `whatWeObserved`
  primary: latest observation-oriented update truth
  fallback: latest review checkpoint observation truth
- `whatWasDecided`
  primary: latest explicit decision truth from review or closeout checkpoint
  fallback: route-level review outcome summary truth

Seed content may enrich these sources, but it may not bypass them. The demo must look rich because the projector has rich truth, not because individual surfaces inject favorable copy.

### Closeout layer

The route must visibly support:

- a compact closeout summary
- a historically visible closeout signal within the same campaign path

This phase does not require the canonical visible route to be fully closed. The chosen demo shape is:

- one canonically active route as the main live path
- one historically visible closeout signal tied to that same campaign path through real route, checkpoint, or closeout truth

That keeps the main demo route active while still making "how something closes" live-demonstrable without inventing a second primary route.

## 6. Suite Visibility Contract

The campaign and route must appear coherently across the suite.

### Overview

Overview must stay light.

It should show:

- that the campaign matters now
- that active follow-up exists
- where HR should go next

It must not become a second Action Center.

### Reports

Reports must stay an interpretation bridge.

It should show:

- that this campaign/report is content-rich enough for follow-up
- that follow-up already exists when applicable
- where HR should go next

It must not become a second decision screen.

### Campaign detail

This is the strongest bridge surface.

It must show:

- why the campaign matters
- that follow-up is active
- that Action Center is the live execution layer

If any surface needs to feel unquestionably real in the demo, it is this one.

### Action Center landing

Landing must remain compact.

It should show:

- visible route outcome
- canonical first step
- enough context to prove an active route exists

It must not dump the full result loop.

### Action Center detail

This is the main proof surface.

It must clearly render:

- review meaning
- action frame
- result loop
- closeout semantics

## 7. Seed Truth Contract

The demo route must be backed by one stable truth bundle.

### Campaign truth

The campaign must have:

- a stable `campaignId`
- a stable organization context
- sufficient readiness/report-read truth
- stable visibility in overview and reports

#### Deterministic surfacing rule

The demo campaign may not rely on accidental ranking. In this phase it must be deterministically surfaced through one explicit rule shared by browser-QA and product review:

- overview must expose the campaign through a fixed featured or focus slot, or through an equally deterministic selection rule already supported by the page
- reports must expose the campaign through a fixed featured or first-class visible report card, or through a stable deeplinkable selection rule
- if a deterministic featured slot is not available, the QA path must use a fixed direct URL from overview or reports into the canonical campaign detail page

The important constraint is that reviewers should not need to search, scroll unpredictably, or depend on changing sort order to find the seeded campaign.

### Route truth

The route must be truly active and visible in Action Center.

It must have:

- active entry stage
- stable route status
- owner
- review schedule
- review semantics inputs
- intervention/step truth
- expected effect truth
- result/update truth
- closeout-capable truth that can render a historical closeout signal without making the main route inactive

### Checkpoint and update truth

The route must include enough historical truth to feed:

- review meaning
- result-loop display
- closeout display

At minimum, the route should have:

- one meaningful review moment
- one explicit update note that reflects action or observation
- one explicit decision source

### Phase shape

The best seeded route is a middle-to-late stage route, not a fresh just-opened route.

That means the demo route should already have:

- opened follow-up
- at least one concrete first step
- at least one review
- at least one explicit update
- at least one visible decision or closeout signal

## 8. QA Contract

This phase must produce a repeatable QA path, not just better seed data.

### Stable entry points

The route should be anchored by:

- one fixed HR login
- one fixed demo campaign ID
- one fixed route context

### Browser-QA flow

The expected QA path is:

1. Log in as HR
2. Open overview
3. Confirm the demo campaign is visible and relevant
4. Open reports
5. Confirm the same campaign appears with meaningful bridge context
6. Open campaign detail
7. Confirm active follow-up is visible
8. Open Action Center
9. Open the canonical route detail
10. Confirm review, step, result, and closeout semantics

### Minimum live assertions

Browser QA should be able to confirm:

- active follow-up is visible
- review reason is visible
- review question is visible
- review outcome is visible
- first step is visible
- what was tried is visible
- what was decided is visible
- closeout summary is visible when applicable

### Non-goals for QA

This should not become a giant end-to-end scenario matrix.

It is intentionally:

- one route
- one HR path
- one strong live demo

## 9. Scope

### In scope

- one canonical HR demo campaign
- one rich active route
- seed truth hardening for that route
- route visibility across suite surfaces
- stable QA/browser entry points
- focused test support where necessary

### Out of scope

- new manager workflows
- broader Action Center core feature depth
- multiple demo route families
- generalized scenario framework
- structural redesign of the module

## 10. Constraints and Guardrails

### No fake UI state

The route may be curated, but must remain truthful.

Anything visible in the UI must come from:

- campaign truth
- route truth
- checkpoint truth
- update truth

### No product-depth inflation

This phase must not add workflow depth just to make the demo look better.

If the demo is weak, the fix is richer truth and better visibility, not new interaction layers.

### No overview overload

Overview must remain lightweight and directional.

### No second decision surface in reports

Reports must remain interpretation-to-next-step, not a second route editor.

## 11. Acceptance Criteria

This phase is successful when:

1. One stable HR demo campaign exists and is always reachable.
2. The campaign is meaningfully visible in overview, reports, campaign detail, and Action Center.
3. Action Center detail clearly shows review reason, review question, review outcome, first step, what was tried, what was decided, and closeout summary.
4. Browser QA can repeatedly walk the same route without relying on accidental seed state.
5. The route remains backed by real product truth instead of UI-only shortcuts.

## 12. Risks

### Risk: seed truth is still too thin

If the route is only technically active but semantically shallow, the demo still will not persuade.

Mitigation:

- explicitly seed review, update, decision, and closeout truth

### Risk: QA path depends on fragile ordering

If the route depends on whichever campaign happens to sort highest, the path will stay flaky.

Mitigation:

- anchor on fixed campaign identity and deterministic route references

### Risk: campaign detail and Action Center drift apart

If both surfaces read from different route assumptions, the demo will feel fake even when both pages individually work.

Mitigation:

- keep the route contract canonical
- keep the seeded path inside the same truth chain

## 13. Recommended Next Step After This Phase

Once this HR demo/seed hardening phase is complete, the next product phase should return to Action Center core depth:

- stronger actiekwaliteit
- richer review decisions
- stronger result loop over time
- only later, limited manager interaction where truly necessary

That order is intentional:

1. first make the current product convincingly visible
2. then deepen the product
