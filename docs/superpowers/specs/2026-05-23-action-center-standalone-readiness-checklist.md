# Action Center Standalone Readiness Checklist

## Status
Proposed

## Purpose

Define the operating-readiness checklist that Action Center must pass before anyone treats it as sufficiently stable for **standalone consideration review**.

This checklist exists to make later review disciplined and evidence-backed while Action Center remains:

- embedded inside Loep today
- limited to approved route families only: `exit` and `retention`
- HR-governed
- route-bound
- post-scan follow-through only

This checklist does not authorize:

- launch
- standalone packaging
- standalone pricing
- separate GTM
- route expansion
- generic workflow broadening

## Status Scale

Every category must be evaluated using one of these values only:

- `not_ready`: at least one required pass test fails, the evidence is missing, or the current source of record is unclear within approved scope
- `partial`: some pass tests are met, but one or more required tests are still missing, too narrow, or not yet repeatable
- `ready`: all required pass tests are met with inspectable evidence inside the current approved scope

## Review Rule

The checklist is passed only when:

- no category remains `not_ready`
- all required pass tests per category are satisfied
- all blocking risks are either closed or explicitly accepted by the product/founder owner with rationale
- the supporting evidence is current enough to defend in a buyer, operator, governance, or internal product review

## Category Checklist

| Category | Requirement | Evidence needed | Observable pass tests | Status values | Blocking risk |
| --- | --- | --- | --- | --- | --- |
| `product readiness` | Action Center must be sufficiently stable inside Loep for approved route families only, with stable route -> action -> review -> continuation / closeout semantics. | current canonical spec set; live examples from approved route families; no unresolved ambiguity in action lifecycle, review rhythm, or closeout semantics | current source-of-record spec is named; at least `2` live route examples exist per approved route family or a written rationale explains the missing family; named product owner confirms no open semantic contradiction in approved scope; fail if reviewers still need to reinterpret core lifecycle behavior ad hoc | `not_ready` / `partial` / `ready` | reviewers still need to reinterpret product truth or explain exceptions ad hoc |
| `governance readiness` | HR governance, review authority, continuation authority, closeout authority, escalation handling, and exception handling must be explicit and operable. | governance one-pager; governance review notes; named authority model; evidence that operators can explain who decides what | governance artifact is present and current; named governance owner exists; at least `1` reviewed live or simulated governance case exists for continuation or closeout handling; fail if any authority boundary is unresolved in the current source of record | `not_ready` / `partial` / `ready` | ambiguous authority creates unsafe rollout, buyer mistrust, or hidden founder dependency |
| `tenant/admin readiness` | Tenant-level setup, named admin roles, activation control, permissions assumptions, and operating ownership must be clear enough for customer use without improvisation. | tenant/admin readiness matrix; onboarding checklist; activation records; explicit role definitions for customer-side HR/admin owners | tenant/admin matrix exists and is current; named customer-side HR/admin owner is required in each reviewed context; at least `1` activation record shows the checklist was used end to end; fail if activation depends on undocumented admin assumptions or one-off setup knowledge | `not_ready` / `partial` / `ready` | customer setup depends on undocumented admin assumptions or one-off support work |
| `security/privacy readiness` | Privacy boundaries, bounded evidence rules, dossier avoidance, access expectations, and incident interpretation must be documented and reviewable. | privacy / dossier boundary note; security or privacy review notes; incident log showing no unresolved critical boundary issue; examples of allowed vs prohibited record types | privacy boundary note is present and current; named privacy/governance reviewer or decision owner exists; at least `2` concrete record examples show allowed versus prohibited usage; fail if any unresolved critical boundary ambiguity or prohibited-record dispute remains open | `not_ready` / `partial` / `ready` | product use drifts into monitoring, dossier behavior, or indefensible storage ambiguity |
| `support readiness` | Support intake, issue taxonomy, escalation ownership, response expectations, and failed-rollout handling must exist and be repeatable by non-founder operators. | support and onboarding readiness model; support contact summary; sample issue log; named owner per issue category | support taxonomy artifact is present and current; named owner exists for each issue category; at least `3` example support records or dry-run cases are categorized using the taxonomy; fail if support routing still depends on founder memory to determine the correct owner | `not_ready` / `partial` / `ready` | customers cannot be supported reliably without founder memory or custom rescue work |
| `onboarding readiness` | HR operator onboarding, manager briefing, first-route activation, and first-cycle review must be executable through durable materials and explicit steps. | HR rollout note; manager one-pager; activation checklist; first-cycle review template; evidence that onboarding can run from artifacts instead of narration | required onboarding artifacts are present and current; named onboarding owner exists; at least `1` completed first-route activation record and `1` first-cycle review record exist; fail if critical onboarding explanation still depends on founder-only narration | `not_ready` / `partial` / `ready` | first customer use is fragile because critical explanations live only in people, not materials |
| `commercial readiness` | Commercial conversations must stay bounded to embedded Action Center truth, approved route scope, and readiness language without forcing launch or pricing decisions. | commercial packaging and sales boundaries artifact; approved/prohibited phrase set; example buyer narrative that stays inside current scope | commercial boundary artifact is present and current; named commercial decision owner exists; at least `2` example buyer narratives or review notes stay inside approved scope; fail if the story requires launch language, pricing claims, or route-breadth promises to make sense | `not_ready` / `partial` / `ready` | sales or founder conversations overpromise standalone state, route breadth, or unsupported value proof |
| `evidence readiness` | The live evidence needed for future standalone consideration must be defined, collectible, and interpretable across customer contexts and route instances. | quantified consideration gate; route-level and family-level readback surfaces; defined stale/sprawl/no-progress measures; HR chasing proxy interpretation notes | quantified gate artifact is present and current; named measurement owner exists; metric definitions for completion, stale, sprawl, and no-progress are written down; fail if the review group cannot reconstruct how a reported metric was calculated | `not_ready` / `partial` / `ready` | later gate decisions rely on anecdotes, selective screenshots, or metrics that cannot be interpreted consistently |
| `category readiness` | Action Center must be describable as a bounded follow-through category rather than collapsing into task board, workflow software, or broad HR operations language. | positioning gate; category framing notes; buyer/operator interview feedback showing the bounded category is understandable | category framing artifact is present and current; named owner for category language exists; at least `2` buyer or operator feedback examples show bounded follow-through language was understood; fail if the product only makes sense when widened into a generic category | `not_ready` / `partial` / `ready` | the story only works when broadened into a generic category the product should not enter |
| `positioning readiness` | The product story must remain embedded-in-Loep today while still supporting disciplined future standalone consideration language. | positioning gate; approved phrasing examples; documented corrections for prohibited or drifting language | positioning artifact is present and current; named approver for approved phrasing exists; at least `2` reviewed examples of approved phrasing and `1` correction example exist; fail if stakeholder language still drifts into launch, proof, or route-expansion claims without immediate correction | `not_ready` / `partial` / `ready` | stakeholder language drifts into standalone, launch, proof, or route-expansion claims before the product earns them |

## How To Use This Checklist

Reviewers should evaluate each category in order:

1. confirm the requirement still matches the current approved product boundary
2. inspect the named evidence
3. run each observable pass test
4. assign one status only: `not_ready`, `partial`, or `ready`
5. record the blocking risk in plain language if the status is not `ready`

If one category is scored `not_ready`, the overall checklist result remains `not_ready`.

If all categories are at least `partial` but one or more required pass tests or blocking risks remain open, the overall checklist result is `partial`.

Only when every category is `ready` and no blocking risk remains open should the overall checklist result be `ready for standalone consideration review`.

## Interpretation Notes

- This checklist is for **standalone consideration readiness only**.
- It is not a launch checklist.
- It does not change the current embedded product truth.
- It does not approve route expansion.
- It does not replace the quantified gate; it organizes the operating areas that the quantified gate must be able to support.

## Plain-Language Summary

Action Center is only ready for standalone consideration review when product, governance, tenant/admin, privacy, support, onboarding, commercial, evidence, category, and positioning readiness can all be shown through explicit artifacts, named owners, and concrete examples rather than founder interpretation.
