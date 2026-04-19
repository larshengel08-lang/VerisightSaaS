# Verisight Action Center Improvement Review Design

Date: 2026-04-19
Status: Draft design, approved in conversation
Scope: Review framework for the current Action Center / MTO-cockpit track
Primary track context: `codex/mto-track-foundation`

## Purpose

This document defines how to run a deep review of the current Action Center / MTO-cockpit track.

The review is not intended as a generic quality audit and not as a bug list. Its main purpose is to produce a prioritized improvement backlog for the Action Center, with extra depth on what can be stronger, sharper, more mature, more beautiful, and more useful for real managers.

The review should answer one central question:

Does the Action Center already feel like a mature management product, or does it still feel too much like a technical action log with a cockpit layer on top?

## Review Scope

The review is strictly limited to:

- the Action Center track
- the MTO manager cockpit
- the current MTO-only action loop
- the current product and UX surfaces around actions, reviews, and follow-through
- the current code and architecture supporting those surfaces

The review is explicitly out of scope for:

- the broader Verisight suite
- ExitScan, RetentieScan, or other live product routes
- commercial rollout planning outside the Action Center
- generic platform refactors unrelated to this track

## Review Goal

The review should produce:

- a clear picture of where the current Action Center is already strong
- a clear picture of where it is still too light, too technical, too unclear, or too immature
- a prioritized set of improvements for the next Action Center build phase
- an explicit list of things that should remain bounded and should not be overbuilt yet

This is a dual audit:

- product and UX review
- code and architecture review

But the review emphasis is on improvement opportunities, not just on risk detection.

## Primary Review Lens

The Action Center should be reviewed as a management product.

That means the review should not only ask whether the code is correct or whether screens technically work. It should ask whether the system is genuinely useful and trustworthy for a manager who needs to move from signal to action to review to follow-through.

The strongest lens is:

- Is this clear enough for managers?
- Is it mature enough for management follow-through?
- Is it elegant enough to support adoption?
- Is it structured well enough to grow without becoming fragile?

## Review Structure

The review should be performed in six domains, in this order.

### 1. Cockpit clarity

Review questions:

- Does a manager understand immediately what the screen is for?
- Is department context strong enough?
- Are themes, actions, and review pressure connected clearly enough?
- Does the cockpit feel like one coherent management workspace?

This domain should focus on whether the Action Center truly behaves like an `Afdelingscockpit`.

### 2. Action lifecycle and review discipline

Review questions:

- Do actions feel like real improvement items rather than lightweight tasks?
- Are owner, blocker, update, review, and outcome flows mature enough?
- Is the review cycle visible and strong enough?
- Does follow-through feel reliable or still too thin?

This domain should determine whether the product already supports a credible improvement cycle.

### 3. Manager UX and usability

Review questions:

- Is the path from signal to action creation clear?
- Is the interaction burden low enough for managers?
- Are forms and update flows short and understandable?
- Does the system help users move forward instead of making them administrate too much?

This domain should focus on adoption risk and day-to-day usability.

### 4. Visual maturity and information hierarchy

Review questions:

- Does the screen feel calm, deliberate, and executive enough?
- Is information hierarchy strong enough?
- Is the page easy to scan?
- Are signals, actions, blockers, and reviews visually distinct enough?

This domain should assess whether the interface already looks and feels like a serious management product.

### 5. Code and component architecture

Review questions:

- Are responsibilities split clearly enough?
- Are the contracts stable and understandable?
- Is the current component structure sustainable?
- Is there duplication or orchestration complexity that should be reduced?

This domain should focus on architectural quality, future editability, and testability.

### 6. Suite readiness without premature coupling

Review questions:

- Is the Action Center structurally reusable later?
- Does it stay properly MTO-first right now?
- Are there any signs of premature suite assumptions?
- Are adapters and shared contracts being prepared in a safe way?

This domain should ensure the track remains future-capable without eroding the current MTO boundary.

## Review Output Format

The review should produce four outputs.

### 1. Top findings

The top 5 to 10 findings that most strongly shape whether the Action Center is becoming the right product.

These should be the most important observations, not an exhaustive list.

### 2. Prioritized improvement backlog

This is the main deliverable.

Each improvement item should include:

- domain
- finding
- why it matters
- risk or missed opportunity
- recommended direction
- priority
- whether it should happen now or later

### 3. Do-not-overbuild list

The review should explicitly identify what should remain bounded for now.

This prevents the next build phase from bloating into:

- a generic task system
- a suite-wide workflow engine
- a broad dashboard rewrite
- a too-early cross-product coupling exercise

### 4. Recommended build order

The review should advise what should be improved first, what should wait, and which items deserve their own dedicated phase or wave.

## Priority Model

All improvement items should be classified using four levels.

### P0

Must address before further serious expansion.

Use this when the issue creates:

- product confusion
- adoption risk
- weak management credibility
- dangerous architectural drift

### P1

Strongly recommended in the next build phase.

Use this for improvements that materially strengthen clarity, maturity, or usability.

### P2

Valuable refinement.

Use this for improvements that add polish or better quality but are not blocking.

### P3

Later or optional.

Use this for interesting improvements that should not distract from the stronger priorities.

## Evaluation Criteria

The Action Center should be judged against the following target qualities.

### Manager comprehension

A manager should quickly understand:

- what needs attention
- why it needs attention
- what is already being done
- what requires a decision now

### Follow-through maturity

The product should support:

- action creation
- ownership
- updates
- blockers
- review
- outcome capture
- continuation decisions

### Usability

The product should feel:

- clear
- directed
- lightweight enough to use
- structured enough to trust

### Visual quality

The interface should feel:

- calm
- deliberate
- management-ready
- not overloaded
- not generic

### Architectural quality

The code should be:

- bounded
- readable
- composable
- testable
- safe to extend

### Strategic safety

The track should remain:

- MTO-first
- future-capable
- non-destructive to the current suite

## Review Method

The review should not start by asking "what is wrong here?"

It should start by asking:

- what kind of product is this becoming
- where does it already feel strong
- where does it still feel thinner than it should
- what would make it materially better for managers

This keeps the review constructive and product-oriented instead of purely critical.

## Recommended Tone Of Findings

Findings should be sharp, but not vague and not dramatic.

Each item should explain clearly:

- what the issue is
- why it matters
- what stronger looks like

Avoid low-signal comments such as:

- "UX could be better"
- "component feels big"
- "needs polish"

Prefer findings such as:

- "The cockpit still gives too much equal visual weight to action maintenance and too little to theme-level guidance, which weakens manager orientation."
- "The review loop exists structurally, but the page still does not make overdue or quiet actions feel urgent enough for leadership use."
- "The current component split is better than before, but the orchestration boundary between cockpit view-model and mutation-heavy action surfaces could be cleaner."

## Review Deliverable Shape

The ideal final review document should read like an improvement compass for the next Action Center phase.

It should help answer:

- what to improve first
- what to strengthen most deeply
- what to leave alone for now
- what could become dangerous if overbuilt too early

## Final Recommendation

Run the Action Center / MTO-cockpit review as a prioritized improvement review, not as a general audit.

Keep the scope tight, go deep on product and architecture, and let the outcome be a practical backlog that directly shapes the next Action Center phase.
