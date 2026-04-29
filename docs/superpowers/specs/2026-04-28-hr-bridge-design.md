# HR Bridge Design

Date: 2026-04-28
Owner: Codex
Status: Draft for review

## 1. Goal

The next major product step is not deeper Action Center behavior yet. It is the HR bridge into Action Center.

This step should make the suite flow from overview, reports, and campaign detail into Action Center much clearer for HR, with less interpretation work and a more explicit transition from signal to follow-up.

The intended user outcome is:

- HR can quickly tell whether something is only attention, a route candidate, or active follow-up
- HR knows where to go next on each surface
- campaign detail becomes the primary place where a follow-up route is explicitly opened
- Action Center only carries explicitly opened routes

This is the strongest base before deepening Action Center itself around action quality, review decisions, result loop, and closing logic.

## 2. Product Thesis

This phase is bridge-first.

The suite should behave as:

- overview signals
- reports interpret
- campaign detail decides
- Action Center executes

The product does not need broader complexity in this phase. It needs a clearer and more consistent path from insight to explicit follow-up.

The core change is not a new module or a broad redesign. It is a stronger shared semantic layer plus one explicit route-open action at the right place in the suite.

## 3. Scope

### In scope

1. One canonical HR-facing status layer across the suite:
   - `alleen aandacht`
   - `route-kandidaat`
   - `actieve opvolging`

2. One shared entry-state projection helper used by:
   - `overview`
   - `reports`
   - `campaign detail`

3. Surface-specific CTA behavior that stays consistent with the same status semantics:
   - overview gives light directional CTA
   - reports acts as an interpretation-to-follow-up bridge
   - campaign detail is the primary route-open decision point

4. An explicit `Open in Action Center` action for `route-kandidaat`
   - strongest and primary on campaign detail
   - not available in reports
   - light directional path on overview

5. Consistent active-route back-reference from overview, reports, and campaign detail into Action Center

### Out of scope

1. No deeper Action Center core work yet:
   - no action-template improvements
   - no richer review decisions
   - no result-loop deepening
   - no stronger closing logic

2. No new governance or workflow burden:
   - no wizard
   - no extra required fields before route open
   - no more complex route state machine

3. No shell rearchitecture

4. No manager-flow expansion

5. No analytics duplication inside Action Center

## 4. Canonical Status Model

This phase uses one product status layer above the existing route contract.

That status layer cannot come from Action Center route truth alone, because `route-kandidaat` exists before an explicit route is opened.

This phase therefore requires one canonical pre-route input layer: **bridge assessment truth**.

The shared HR bridge helper may only consume:

1. canonical Action Center route truth, when a route already exists
2. canonical bridge assessment truth, when no route exists yet

It may not derive `route-kandidaat` from local UI conditions or screen-specific heuristics.

### Bridge assessment truth

Before a route exists, the system must expose one shared assessment object per relevant source signal.

Recommended minimum shape:

```ts
type BridgeAssessmentTruth = {
  sourceType: 'campaign' | 'report'
  sourceId: string
  assessmentState: 'attention' | 'candidate'
  signalReadable: boolean
  managementMeaningClear: boolean
  plausibleFollowUpExists: boolean
  assessedAt: string
}
```

This is not a second Action Center route model.

It is a pre-route product truth used only to determine whether HR is still looking at `alleen aandacht` or has reached `route-kandidaat`.

### Canonical input rules

The shared helper must resolve HR bridge state in this order:

1. if an explicit Action Center route exists for the source, project `actieve opvolging`
2. else if canonical bridge assessment truth says `candidate`, project `route-kandidaat`
3. else project `alleen aandacht`

### Allowed non-route inputs before route creation

Before an Action Center route exists, the helper may use only fields from canonical bridge assessment truth, specifically:

- `assessmentState`
- `signalReadable`
- `managementMeaningClear`
- `plausibleFollowUpExists`
- source identity needed to join the assessment back to the campaign or report

It may not use:

- local screen composition
- presence or absence of ad hoc UI blocks
- one-off report rendering conditions
- copy-level interpretation in overview, reports, or campaign detail

### Why this matters

This prevents overview, reports, and campaign detail from inventing their own candidate logic.

The screens may project the same state differently in visual weight, but they must read one shared product truth for whether something is still `alleen aandacht` or has become `route-kandidaat`.

### `alleen aandacht`

Meaning:

- there is a relevant signal
- it deserves attention
- but it is not yet ready to be opened as explicit follow-up

User interpretation:

- this still needs more understanding before follow-up is opened

Product rule:

- attention is a signal state, not a follow-up state

### `route-kandidaat`

Meaning:

- the signal is clear enough to justify follow-up
- there is not yet an explicitly opened Action Center route
- campaign detail may offer the route-open decision

User interpretation:

- this is now ready to become explicit follow-up

Product rule:

- candidate is pre-route, but action-worthy

### `actieve opvolging`

Meaning:

- the route has been explicitly opened
- it now belongs to Action Center
- other HR screens reference it, but do not carry the route as the primary execution layer

User interpretation:

- this is already running in Action Center

Product rule:

- active means explicitly opened, not just likely follow-up

## 5. Transition Logic

The intended movement in this phase is:

1. `alleen aandacht`
2. `route-kandidaat`
3. `actieve opvolging`

This is the primary UX story.

This phase does not yet try to fully model backward or closing transitions such as:

- active back to candidate
- active to stopped
- active to closed

Those remain part of the later Action Center core deepening work.

## 6. Screen Roles

### Overview

Role:

- show what is happening
- show the HR bridge status
- point HR to the right deeper surface

Behavior:

- must stay light
- must not open routes directly
- must not become an execution screen

CTA policy:

- `alleen aandacht` -> `Bekijk campagne` or `Bekijk rapport`
- `route-kandidaat` -> `Beoordeel opvolging`
- `actieve opvolging` -> `Open in Action Center`

### Reports

Role:

- clarify what the signal means
- help HR feel whether the signal is still interpretation or already moving toward follow-up

Behavior:

- bridge between meaning and action
- stronger than overview, but not the primary route-open screen
- must not become a second decision screen

CTA policy:

- `alleen aandacht` -> `Lees campagne`
- `route-kandidaat` -> `Ga naar campaign detail`
- `actieve opvolging` -> `Open in Action Center`

### Campaign detail

Role:

- primary HR decision point
- lowest interpretation burden before opening follow-up

Behavior:

- clearest bridge status
- clearest rationale
- strongest route-open CTA

CTA policy:

- `alleen aandacht` -> no primary route-open action
- `route-kandidaat` -> primary CTA `Open in Action Center`
- `actieve opvolging` -> primary CTA `Open in Action Center`

### Action Center

Role:

- execution layer

Behavior:

- only explicitly opened routes live here
- candidate stays outside this module
- source context may be shown, but candidate is not treated as a real route in the module

## 7. Route-Open Behavior

`Open in Action Center` must be a real product action, not only a navigation label.

When HR activates it on campaign detail:

- the route becomes explicitly opened
- the route becomes part of Action Center
- campaign detail changes from `route-kandidaat` to `actieve opvolging`
- overview and reports should subsequently point to active follow-up
- Action Center opens the relevant route

This action should remain lightweight:

- no large wizard
- no required extra setup burden
- no major extra configuration

If a route already exists:

- the same CTA opens the existing route in Action Center

If a route does not yet exist:

- the same CTA opens it and then routes into Action Center

This should feel like one product action from the HR point of view.

## 8. Shared Projection Layer

This phase should use one shared helper to map canonical route truth and canonical bridge assessment truth into HR-facing semantics.

Recommended output shape:

```ts
type HrBridgeState = {
  label: string
  tone: 'slate' | 'amber' | 'emerald'
  body: string
  ctaKind: 'view' | 'evaluate' | 'open'
}
```

Minimum semantic mapping:

- `attention` -> `Nog geen opvolging geopend`
- `candidate` -> `Route-kandidaat`
- `active` -> `Actieve opvolging`

Important rule:

- this helper must be the shared source of HR-facing semantic state
- surfaces may vary in presentation weight, but not in meaning
- `route-kandidaat` must come from shared bridge assessment truth, not from UI inference

## 9. CTA Strategy by Surface

The suite should use one semantic status layer but different CTA weights.

### Overview

- informational
- directional only

### Reports

- stronger bridge
- interprets toward follow-up
- routes HR into campaign detail for candidate decisions
- links directly to Action Center only for active follow-up

### Campaign detail

- strongest decision
- primary place to explicitly open the route

This prevents two major problems:

1. overview becoming too operational
2. Action Center receiving candidate noise too early

## 10. Architectural Rules

This phase should follow this chain:

1. route contract
2. entry-state projection
3. HR-surface rendering
4. route-open action
5. Action Center active route

Rules:

- no local candidate logic per screen
- no separate CTA semantics per surface
- no UI-layer route heuristics
- no second follow-up model next to the canonical route contract

## 11. UX Guardrails

Avoid:

1. making overview too heavy
2. turning reports into a second decision screen
3. keeping campaign detail too implicit
4. showing candidate routes as if they already belong in Action Center
5. using visually similar labels with different underlying meanings

This bridge is successful only if it reduces HR translation work, not if it adds a new conceptual layer they must learn.

## 12. Testing and Verification

This phase should be validated at three levels.

### Unit / projection tests

- the shared entry-state helper maps route truth into the correct HR states
- surfaces do not re-implement conflicting semantics

### Surface tests

- overview reflects the shared states
- reports reflects the shared states
- campaign detail reflects the shared states
- campaign detail exposes the primary route-open action for `route-kandidaat`

### Browser verification

Confirm:

- overview feels light
- reports feels like a bridge from interpretation to follow-up
- campaign detail feels like the explicit decision point
- Action Center only carries explicitly opened routes
- there is no contradictory candidate/active labeling across surfaces

## 13. Success Criteria

This phase succeeds if HR can answer three questions faster and with less mental translation:

1. what is happening here?
2. is this ready for follow-up?
3. where do I take the next step?

More concretely:

- overview is informative but light
- reports clearly bridges meaning to next action
- campaign detail clearly offers route-open behavior
- Action Center remains protected as the active-follow-up layer

## 14. Follow-On Phase

Only after this bridge is strong should the next major step focus on Action Center core deepening:

- actiekwaliteit
- reviewbeslissingen
- resultaatlus
- afsluitlogica

That sequence matters.

If Action Center is deepened before the bridge is strong, HR will still spend too much effort deciding whether and how something should enter the module.
