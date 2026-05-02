# Action Center Inbedding in Scan -> Route Flow

## Status
Proposed

## Intent
This wave strengthens the product continuity from scan/campaign reading into Action Center so the follow-through layer feels like the next step of the same journey rather than a separate module.

This is intentionally a **handoff and continuity wave**, not a new route system.

---

## 1. Goal

Wave 7 should make it easier for HR to understand:

- when a campaign detail page has reached the point where Action Center becomes the right next surface
- what Action Center will contain for that route
- why the bridge exists without collapsing campaign detail and Action Center into one page

The result should be a stronger commercial read:

scan first, Action Center second.

---

## 2. Product Boundary

This wave may:

- strengthen bridge copy on campaign detail
- make the Action Center handoff more explicit and less generic
- preserve continuity when a route is opened or revisited from campaign detail
- improve scan-to-route deeplink behavior

This wave must not:

- move action authoring into campaign detail
- blur the boundary between campaign reading and follow-through execution
- create a second way of managing routes outside Action Center
- re-open scan semantics or Action Center route truth

---

## 3. Current Runtime Basis

Already present and safe to build on:

- campaign detail has an Action Center bridge
- route opening can happen from the campaign detail page
- Action Center can already focus routes by canonical route/focus identity
- campaign detail copy already states that commitment belongs in Action Center

Still weak in runtime feel:

- the handoff CTA is still fairly generic
- the bridge explains the boundary, but not yet the continuity strongly enough
- the transition from "this campaign tells you what to read" to "Action Center tells you how follow-through starts" can still feel like a module jump

---

## 4. Desired Product Read

The user should experience:

- campaign detail as the place where the signal and route-read are clarified
- Action Center as the place where ownership and follow-through become explicit
- a visible, intentional bridge between the two

That means the bridge should answer:

- why now
- what happens next
- where to continue

without turning into a second workflow panel.

---

## 5. Scope of the Implementation Slice

This wave should stay small and target the actual handoff surfaces:

- campaign detail route bridge presentation
- Action Center landing/focus continuity
- shell tests around campaign detail and Action Center handoff wording

Preferred changes:

- sharpen campaign-detail bridge copy around "read here, follow-through there"
- make the CTA/readback language describe what Action Center will open
- preserve direct focus when jumping from a campaign into Action Center
- reduce the feeling of a generic module switch

---

## 6. Success Criteria

This wave succeeds when:

- the campaign detail page more clearly explains why Action Center is the next step
- opening or revisiting Action Center from campaign detail feels like a continuation, not a context drop
- the boundary between scan reading and route execution remains explicit
- no duplicate route-management surface is introduced

---

## 7. What Stays Unchanged

This wave does **not** change:

- campaign analytics truth
- route truth
- manager action truth
- closeout / reopen / follow-up semantics
- governance or operations layers

It only strengthens how the scan-to-follow-through transition reads in runtime.
