# Verisight Action Center Cockpit Redesign

Date: 2026-04-20
Status: Draft design, approved in conversation
Scope: Product and UI redesign direction for the Action Center cockpit
Primary track context: `codex/mto-track-foundation`

## Purpose

This document defines the redesign direction for the current Action Center / MTO manager cockpit.

The current implementation is technically solid enough as a foundation, but it is still too visually dense and too edit-first for line managers. The redesign must turn it into a clear department cockpit that supports management follow-through without feeling like a stack of forms, cards, and operational widgets.

The redesign should preserve the existing strengths:

- strong traceability from action back to source insight
- bounded MTO-first implementation
- suite-capable contracts and adapter seams for later reuse
- explicit lifecycle, owner, review, and update structure

But it must change the surface meaningfully:

- overview first
- navigation before editing
- clearer information hierarchy
- stronger visual calm
- more intentional use of status color

## Core Product Direction

The Action Center should feel like an `afdelingssuite`, not a generic dashboard and not a task management tool.

The manager lands in a department-centered cockpit that answers:

1. How is my department doing?
2. Which themes need management attention now?
3. What follow-through already exists?
4. What should I open next: a theme, a dossier, or a review?

The main screen is therefore not a place to complete work. It is a place to orient, prioritize, and navigate into the next step.

This is the central shift in the redesign:

- current direction: mixed overview plus edit surface
- new direction: structured overview with guided onward navigation

## Visual Narrative

The visual direction is a deliberate combination of:

- `executive calm`
- `alert operational`

That means:

- the base canvas is quiet, spacious, and trustworthy
- urgency is shown only where it matters
- the system should look mature and composed by default
- signal pressure should appear as accents, not as the entire visual language

The screen should support the story:

- the department is stable enough to understand
- management themes are visible and ranked
- follow-through is contained and trackable
- urgent exceptions stand out without making the full cockpit feel stressed

## Screen Model

The redesigned cockpit should contain three primary zones and one secondary navigation layer.

### 1. Department Suite Header

This is the top zone and the first thing a manager sees.

It should include:

- department name
- a short management readout in plain language
- 3 to 4 core indicators only
- one primary summary sentence for what needs attention now

It should not include:

- many equal stat cards
- long operational text blocks
- competing urgency labels

The goal of this zone is orientation, not action handling.

### 2. Priority Themes

This is the main operational reading layer of the cockpit.

Only themes that currently require attention should appear here.

Each priority theme tile should communicate:

- theme label
- short "why this matters now" summary
- action health status
- next important follow-through signal
- one clear navigation CTA

Each tile should feel like a management decision entry point, not a miniature workflow.

The theme tile should never expand into a full create form on the main screen.

### 3. Follow-Through Navigation

Below the priority themes, the manager should see clear navigational blocks to:

- open dossiers
- reviews due
- follow-up needed
- all themes

These are overview links into the next step, not full workflows.

The purpose is to reduce cognitive load:

- see what exists
- know where to go
- click into the next working context

### 4. Secondary Theme Access

All themes should remain available, but not all on the main screen.

The cockpit should provide a quieter entry point such as:

- "all themes"
- "see all department themes"
- a compact lower-priority theme index

This preserves full thematic visibility without overloading the overview surface.

## Interaction Model

The cockpit itself should be overview-first and navigation-led.

Managers should not be asked to:

- create actions inline on the main theme list
- edit long forms inside the overview
- log reviews from a visually disconnected side panel

Instead, the main screen should guide them into focused follow-up contexts:

- theme detail
- action dossier
- review step

The transition model should be:

1. see department state
2. choose the relevant theme or work area
3. enter a focused detail context
4. take action there

This makes the main screen lighter and the working contexts deeper.

## Action Creation Design

Action creation should move off the primary cockpit surface.

The recommended direction is:

- open from a theme CTA
- render in a dedicated detail context, drawer, or modal
- prefill the context from department and theme

The create flow should remain guided and structured, but it should no longer compete with overview content on the main screen.

Minimum visible fields on the first create step:

- action title
- owner
- first review date
- expected outcome
- optional question linkage

The rest of the detail should live in the dossier after creation.

## Dossier Design

The action dossier should become read-first and edit-second.

When a manager opens a dossier, the first read should clearly show:

- what this action is about
- where it came from
- who owns it
- what status it has
- what the next review moment is
- what happened most recently

Only after this overview should editable sections appear.

This is a major maturity shift:

- less "form surface"
- more "management record"

Updates, blockers, reviews, and effect checks should still be present, but visually grouped around the action narrative rather than around input controls.

## Review Design

Review remains a first-class capability, but it should not feel detached from the action context.

The redesigned rule is:

- the cockpit may show review pressure and due items
- but actual review work should happen within the action dossier or an action-linked review step

This avoids the current sense that reviews live in a separate administrative lane.

The review UX should reinforce:

- what was tried
- what was seen
- what the outcome is
- whether to continue, close, reopen, or create follow-up

## Color System

The color system must support meaning, not decoration.

### Base palette

The default palette should be quiet:

- soft neutrals
- restrained blues
- high readability
- low background noise

### Semantic accents

- `blue` means stable, active, controlled
- `amber` means attention now, review pressure, quiet dossier, follow-up needed
- `red` is reserved for true blockers or material risk only
- `green` is optional and subtle, not a dominant success color

### Usage rules

- do not color every card
- do not let urgency colors dominate the full screen
- use accent only at the exact moment of meaning
- preserve a strong visual resting state across the page

This should make the cockpit feel trustworthy and readable, while still making operational pressure clear.

## Layout Principles

The redesign should explicitly reduce visual competition.

Guiding principles:

- fewer equal-sized cards competing for attention
- stronger grouping into zones
- larger contrast between primary and secondary information
- consistent spacing rhythm
- fewer visible form controls on landing
- more meaningful typography hierarchy

The screen should feel scan-friendly at a glance and deeper on click.

## Non-Goals

This redesign does not open:

- live suite activation for ExitScan or RetentieScan
- broad platform-wide dashboard refactors
- survey method changes for other scans
- generic kanban or project management tooling
- a manager homepage that tries to do all work on one screen

The redesign remains:

- MTO-first in use
- suite-capable in contracts and seams
- bounded in rollout

## Technical Direction

The redesign should preserve current architecture strengths while shifting the surface model.

Important technical consequences:

- cockpit view model likely needs clearer separation between overview data and detail data
- inline create/edit components should move behind focused entry points
- review queue should become a navigational signal, not the primary editing surface
- existing suite-capable source and lifecycle contracts should stay intact

This means the next implementation phase should be primarily:

- UI architecture
- interaction flow
- information hierarchy

not a broad data-model rewrite

## Acceptance Criteria

The redesign is successful when:

- a manager understands the screen purpose within a few seconds
- the main screen reads as a department cockpit, not a form-heavy control panel
- the user can clearly see what requires attention without scanning the entire page
- action creation no longer overwhelms the main screen
- dossiers feel like mature management records
- review pressure is visible without feeling administratively detached
- color and layout reinforce meaning instead of adding noise
- the suite-capable technical seams remain intact

## Recommended Next Step

The next step after this spec is a bounded implementation plan for a new Action Center redesign phase, split into waves for:

1. cockpit reframing
2. theme tile redesign
3. navigation-led dossier entry
4. review relocation
5. visual polish and closeout
