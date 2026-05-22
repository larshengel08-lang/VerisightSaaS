# Action Center Live-Evidence Gate

## Audience

Founder/product owner, governance/trust reviewer, buyer-readiness reviewer, route owner

## Purpose

Define the minimum live operating evidence Loep must have before any Action Center route-family expansion can be considered operating-ready for an activation decision.

## Decision Use

Use this artifact after route-fit review and alongside the activation-gate framework. The live-evidence gate does not determine conceptual compatibility. It determines whether Loep has enough real operating evidence to consider a route-family activation decision responsibly.

## Acceptance Test

A reviewer can state exactly what live evidence exists, what is still missing, and whether the evidence is sufficient for operating-readiness review without confusing that judgment with proof of impact or automatic route approval.

## Sign-Off Owner

Primary: governance/trust reviewer
Fallback: founder/product owner if no separate governance/trust reviewer is assigned

## Fixed Rule

No route-family expansion may be approved from roadmap work, conceptual fit, or documentation alone. Later live evidence is required before activation can be considered operating-ready.

## Minimum Live-Evidence Requirements

The evidence set must include at least:

- live Action Center usage across multiple route instances
- evidence from both `exit` and `retention` contexts, unless one context is explicitly excluded with rationale
- manager action completion data
- action review completion data
- stale, sprawl, and repeated-review-without-progress data
- HR chasing proxy data
- buyer or HR-operator feedback from actual usage
- confirmation that no unresolved governance or privacy incident is tied to action execution

## HR Chasing Proxy Data

For this gate, HR chasing proxy data means plain evidence that HR had to repeatedly prompt, follow up, or re-engage managers because actions or reviews were not moving on their own. Examples include repeated reminders before action updates, repeated HR follow-up before reviews are completed, or recurring HR intervention to prevent a route from stalling. This proxy is used to show operating friction, not to judge individual managers.

## Evidence Interpretation Rules

- live evidence proves operating readiness only
- live evidence does not prove causal retention impact or causal exit impact
- live evidence does not prove intervention effectiveness
- live evidence does not prove broad commercial adoption readiness
- absence of governance or privacy incidents is required but not sufficient
- evidence quality depends on seeing both healthy execution and pressure signals such as stale work, sprawl, repeated no-progress, or HR chasing
- route expansion still requires explicit approval through the activation decision framework

## Required Evidence For Operating-Readiness Review

Live evidence is sufficient for operating-readiness review only when all of the following are present:

- Action Center is being used in real route instances rather than simulated examples.
- Managers are completing actions and participating in reviews at a visible operating rhythm.
- HR can interpret stale, sprawl, no-progress, and chasing signals without inventing broader workflow behavior.
- Operators can explain the governance model cleanly under real use.
- No unresolved privacy or governance incident suggests that the operating model is pushing Loep toward dossier, monitoring, or workflow drift.

## Insufficient Evidence

The evidence is insufficient if any required item above is missing. The following are also insufficient on their own:

- a strong route-fit score
- positive buyer reactions to positioning language
- internal confidence or roadmap priority
- measurement-readback readiness without live usage
- absence of incidents in the absence of real activity
- anecdotal success stories without bounded operating evidence

## Gate Outcomes

- `not ready`: live evidence is missing or materially incomplete
- `partially ready`: some live evidence exists, but the set is not yet strong enough for an approval-grade activation review
- `operating-ready for review`: the minimum live evidence exists and can support an activation decision discussion, while still not proving impact

## Handoff To Activation Decision

- The live-evidence gate must produce exactly one documented outcome: `not ready`, `partially ready`, or `operating-ready for review`.
- That exact outcome must be copied into the activation decision record as the `live-evidence gate outcome`.
- If the outcome is `not ready` or `partially ready`, the activation decision should normally remain `parked` or `conditional`.
- If the outcome is `operating-ready for review`, the activation decision may enter approval review, but approval still requires the full activation-gate decision record and explicit sign-off.

## Non-Negotiable Interpretation

- Live evidence is an operating-readiness gate, not an impact-proof gate.
- Operating-readiness evidence is still not activation approval.
- Conceptual fit without live evidence is insufficient.
- Live evidence without explicit activation approval is also insufficient.

## Plain-Language Summary

This gate asks whether Loep has seen enough real Action Center operating behavior to review expansion responsibly. Even if the answer is yes, that only means the route can enter an activation decision with better evidence; it does not mean expansion is already approved.
