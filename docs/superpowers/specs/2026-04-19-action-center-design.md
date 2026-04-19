# Verisight Action Center Design

Date: 2026-04-19
Status: Draft design, approved in conversation
Scope: Product design and architecture direction for a future Action Center track
Primary track context: `codex/mto-track-foundation`

## Purpose

This document defines the intended product shape for the future Verisight Action Center.

The Action Center is not a lightweight task list. It is a management follow-through system that turns survey insights into visible, reviewable improvement cycles. The first operational carrier is MTO, but the design must be shared-capable for later use by other Verisight routes such as RetentieScan and ExitScan.

The core product promise is:

- managers see their own department context first
- they understand which themes need attention and why
- they can open actions directly from those signals
- actions remain visible, trackable, reviewable, and tied to outcomes
- the system stays understandable for leadership while still feeling mature and operationally reliable

## Product Position

The Action Center should be positioned as:

`Verisight Action Center`

A management follow-through layer that sits between insight and improvement.

It should not be framed as:

- a generic project board
- a simple to-do list
- a detached action log with no analytical context
- an MTO-only one-off feature

The Action Center should feel like a serious management product:

- insight-connected
- department-aware
- review-driven
- mature enough for real leadership usage

## Product Principle

The recommended model is:

- department is the cockpit context
- theme is the management lens
- optional question or statement is the precision layer
- action is the execution unit
- dossier-quality history sits underneath each action

This means the system is cockpit-first and dossier-backed.

Managers do not land in a raw action table. They land in a department cockpit that explains:

- what the department signal looks like
- which themes need attention
- what is already in motion
- what requires review now

From there, they can open actions with strong built-in context.

## Primary User Experience

The primary user is a line manager or department owner. HR or central operators have a broader oversight role, but the product should feel immediately understandable for the manager who owns a department outcome.

The Action Center should answer four questions on first load:

1. What in my department needs attention?
2. Which themes already have follow-through?
3. What needs review now?
4. What is stuck, overdue, or still unresolved?

The manager should not need to infer why an action exists. The system should keep the signal and the follow-through visibly connected.

## Main Screen Model

The recommended main screen is an `Afdelingscockpit`.

It should contain four zones.

### 1. Department Overview

This zone gives the manager immediate context:

- department headline result
- top themes needing attention
- action volume
- upcoming reviews
- what is new since last review

This creates orientation before any action management begins.

### 2. Themes Requiring Attention

This is the center of gravity of the experience.

Each theme card or block should show:

- theme name
- signal strength or urgency
- short interpretation
- linked survey questions or statements when available
- number of open actions
- latest update
- next review date

The system default is theme-first. Question-level linkage is available as an optional deeper layer, not the default entry point.

### 3. Actions In Progress

Actions should be visible on the main screen, not hidden in a secondary tab that only project-minded users discover.

This zone should emphasize:

- open actions
- assigned actions
- in-progress actions
- overdue actions
- in-review actions
- follow-up-needed actions

This gives the manager operational awareness without breaking the department context.

### 4. Review and Follow-Through

This zone exists because most action systems fail on follow-through, not on action creation.

It should clearly surface:

- reviews due soon
- overdue reviews
- actions without recent updates
- actions that were closed without a clear effect check
- actions that likely need reopening or continuation

The system should gently create discipline without feeling bureaucratic.

## Action Creation Model

An action should always be connected to a real source context.

Every action must be anchored to:

- source product
- department or scope
- theme
- optional survey question or statement
- source read stage or source measurement context

There should be no floating actions with no analytical origin.

### Default action creation flow

The preferred flow is:

1. Manager opens department cockpit
2. Manager selects a theme that needs attention
3. Manager optionally narrows to a specific question or statement
4. Manager creates an action with minimal required fields
5. Action inherits traceability from the source insight

This is much better than starting with an empty generic action form.

### Minimum fields on create

Required on first creation:

- title
- short management context
- owner
- due date
- review date
- expected outcome

Optional on create:

- question or statement reference
- extra note
- subfocus within the theme

The system should prefer short creation and richer follow-through later.

## Action Data Model

An action is not just a task. It is a `management improvement item`.

Every action should carry at least:

- source product
- source department or scope
- source theme
- optional source question or statement
- source read stage
- title
- decision context
- expected outcome
- measured or observed outcome
- owner
- status
- due date
- review date
- created by
- updated by
- created at
- updated at

Under the action there should also be:

- progress updates
- blockers
- decisions
- evidence or observations
- review outcomes
- reopen or follow-up markers

The current bounded MTO implementation already covers part of this structure and should be treated as the product seed, not the final surface.

## Lifecycle Model

The lifecycle should remain understandable and mature.

Recommended status model:

- open
- assigned
- in progress
- in review
- closed
- follow up needed

This is strong enough for leadership use without turning the system into heavy project management software.

### Review expectations

A review should always ask:

- what was done
- what was observed
- does it appear to have effect
- should we close, continue, or reopen
- is a next measurement or next route needed

This should be built into the mental model of the product, not treated as optional admin.

## UX Principles

The system should feel lightweight while remaining rich.

These principles are mandatory.

### Context before workflow

Managers should start from signals, not from a blank action workspace.

### Theme-first, question-optional

Theme is the default management lens. Question-level targeting is allowed when needed for precision.

### Short forms, rich history

Creation should be short. Maturity should emerge through updates, reviews, blockers, and outcomes.

### Clear language

Prefer:

- action
- owner
- update
- review
- blocker
- outcome
- follow-up needed

Avoid internal or system-heavy wording such as:

- workflow item
- artifact
- resolution state
- operational object

### Signal and action stay together

Managers should always be able to see why an action exists.

### Review discipline is visible

The product must make it easy to see:

- what needs review
- what is late
- what has gone quiet
- what lacks effect validation

### Mature, not rigid

The system should not force a rigid template workflow. It should provide structure, visibility, and reliable traceability while still allowing managers to work flexibly.

## Permissions and Visibility

The recommended first model remains:

- HR or central operators can see all relevant department and action information
- managers only see their own department or assigned scope
- department-level visibility remains governed by conservative privacy and suppression rules

The Action Center must not weaken any existing privacy boundaries already established for MTO department intelligence.

## Relationship To MTO

MTO remains the first operational carrier.

That means:

- the first version should feel native to MTO
- themes and optional question references come from MTO outputs
- department context stays central
- action creation starts from MTO signals

At the same time, the system should not be designed as an MTO dead-end. It should remain shared-capable for later suite use.

## Relationship To Other Products

ExitScan, RetentieScan, and other products should not be connected by default in the first Action Center track.

Instead, the design should assume:

- each product needs an adapter or mapping layer into the shared action model
- existing survey logic, scoring, and dashboard contracts remain protected
- the suite-wide Action Center only opens after explicit governance and product-specific adapter work

This preserves the current safe boundary:

- insights stay product-specific
- follow-through can become shared later

## What Makes The Product Strong

The Action Center becomes genuinely strong if it does five things better than a normal task system.

### 1. Traceability

Every action remains tied to department, theme, optional question, and source insight.

### 2. Management maturity

The product supports real follow-through:

- updates
- blockers
- reviews
- effect checks
- continuation decisions

### 3. High clarity for managers

Managers do not need training to understand the main cockpit.

### 4. Strong review discipline

The system is excellent at surfacing what needs a decision now.

### 5. Suite potential without premature coupling

The product begins MTO-first and grows into a broader Verisight capability later.

## Non-Goals For The First Action Center Track

The next track should explicitly avoid:

- immediate suite-wide activation across all products
- broad dashboard refactors
- changing non-MTO survey methods
- changing scoring logic of existing products
- turning the product into a full project-management suite
- opening generic freeform actions without traceable signal context

## Recommended Future Build Sequence

The next product track should be opened in separate phases.

### Phase 1: Manager cockpit hardening

Focus on:

- stronger department cockpit
- stronger theme presentation
- better review visibility
- cleaner action creation and update flows

### Phase 2: Action quality hardening

Focus on:

- blocker handling
- clearer review outcomes
- better outcome capture
- better distinction between ongoing, stalled, and follow-up-needed work

### Phase 3: Shared action adapter specification

Focus on:

- adapter model for future products
- mapping rules per source product
- governance for later suite expansion

### Phase 4: Suite Action Center

Only after proven value in MTO and at least one safely adapted second product:

- central cross-product action overview
- filters by product, department, owner, and status
- stronger HR oversight

## Recommended Strategic Framing

Internally, this should be treated as one of the most important future Verisight capabilities.

The Action Center is where Verisight stops being only a survey and insight platform and becomes a management follow-through system.

That strategic move is meaningful because:

- it increases practical value after measurement
- it supports manager adoption
- it creates a repeatable improvement loop
- it gives MTO stronger operational depth
- it creates a reusable capability for the broader suite

## Final Recommendation

Build the Action Center as:

- cockpit-first
- dossier-backed
- theme-first
- question-optional
- review-driven
- flexible in use
- mature in structure
- MTO-native at first
- suite-capable later

That combination gives the strongest balance between usability, management quality, and long-term platform value.
