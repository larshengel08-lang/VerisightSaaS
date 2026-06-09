# Admin Ops Surface Simplification Design

Date: 2026-05-17
Owner: Codex
Scope: Admin dashboard workbenches under `/beheer`

## Goal

Reduce the admin information architecture to the smallest stable set of pages needed for:

1. customer and campaign setup
2. lead handoff and intake follow-up
3. customer learnings and delivery lessons

The admin surface should stop presenting three extra registry-style workbenches as primary destinations when they do not carry a distinct daily workflow.

## Primary Decision

Keep these as primary admin pages:

- `/beheer`
- `/beheer/contact-aanvragen`
- `/beheer/klantlearnings`

Do not keep these as primary standalone admin pages:

- `/beheer/billing`
- `/beheer/health`
- `/beheer/proof`

## Why

`billing`, `health`, and `proof` are currently mostly read-oriented registry views:

- `billing` reads contract / payment / assisted launch readiness
- `health` reads telemetry and Action Center follow-through evidence
- `proof` reads proof state and approval ladders

All three expose useful bounded truths, but none of them needs equal navigational weight with setup, leads, or learnings.

## Keep

- the underlying capabilities and data sources behind:
  - billing registry
  - telemetry / ops health
  - proof registry
- admin-only access boundaries
- existing APIs and server helpers
- existing specialist routes during the transition window

## Change

- simplify the admin navigation to a smaller stable set
- move registry-like views into lower-weight admin surfaces
- stop treating `billing`, `health`, and `proof` as primary admin destinations

## Do Not Change

- backend behavior
- database schemas
- registry APIs
- proof, billing, or telemetry truth models
- contact request flow
- customer learning flow

## Final Navigation Model

Primary admin navigation becomes:

- `Setup` -> `/beheer`
- `Leads` -> `/beheer/contact-aanvragen`
- `Learnings` -> `/beheer/klantlearnings`

Remove `billing`, `health`, and `proof` from primary admin navigation.

## Page Roles

### `/beheer`

Remains the setup hub for:

1. organization creation
2. campaign creation
3. respondent import
4. client access activation

Add one collapsed secondary admin section:

- `Operations & registries`

This section may contain compact summary blocks for:

- billing readiness
- health signals
- proof status

Rules:

- compact summaries only
- no large standalone registry tables at primary page weight
- no heavy control-tower framing

### `/beheer/contact-aanvragen`

Keep as standalone.

Reason:

- it has a distinct intake / handoff role
- it is used from multiple existing flows
- it is not just a registry; it is part of the active lead-to-delivery chain

### `/beheer/klantlearnings`

Keep as standalone.

Reason:

- it already acts as a delivery-learning workbench
- it is linked from campaign and checklist flows
- it is the best target surface for proof-oriented follow-up context

## Merge Targets

### Billing

Current route:

- `/beheer/billing`

New primary home:

- compact summary inside `/beheer`

Keep visible there:

- contract state
- billing state
- payment method confirmed
- assisted launch readiness

Interpretation:

- billing remains a real capability
- the dedicated page becomes optional, not primary

### Health

Current route:

- `/beheer/health`

New primary home:

- compact summary inside `/beheer`

Keep visible there:

- owner access confirmed
- first value confirmed
- first management use confirmed
- denied-insight count
- Action Center follow-through signal

Interpretation:

- health remains a bounded ops-evidence layer
- it no longer needs a top-level admin destination by default

### Proof

Current route:

- `/beheer/proof`

New primary home:

- integrated into `/beheer/klantlearnings`

Keep visible there:

- proof state
- approval state
- summary
- lesson / sales / public ladder

Interpretation:

- proof is closer to learnings and case maturation than to setup
- it should stop reading like a separate admin department

## Transition Model

The simplification should happen in two layers.

### Layer 1: Information Architecture Simplification

- remove primary nav exposure for:
  - `/beheer/billing`
  - `/beheer/health`
  - `/beheer/proof`
- add lower-weight summary surfaces in:
  - `/beheer`
  - `/beheer/klantlearnings`

### Layer 2: Route Retirement

Only after summary surfaces and internal references are migrated:

- decide whether the old standalone pages should:
  - remain as deep-link expert pages
  - redirect to their new homes
  - or be removed entirely

Recommended default:

- keep old routes temporarily
- remove them only after link cleanup and capability confirmation

## Link Migration Rules

Update primary admin entrypoints so they no longer advertise:

- `Billing`
- `Health`
- `Proof`

Move users instead toward:

- `/beheer`
- `/beheer/contact-aanvragen`
- `/beheer/klantlearnings`

If any internal link still needs one of the old registry pages during transition:

- keep it as a temporary deep link
- do not treat it as a primary destination

## Acceptance Criteria

The simplification is correct when:

1. the primary admin navigation contains only:
   - `Setup`
   - `Leads`
   - `Learnings`
2. `/beheer` contains setup-first content before any ops/registry layer
3. `billing` and `health` survive only as secondary summary surfaces on `/beheer`
4. `proof` survives as a lower-weight surface inside `/beheer/klantlearnings`
5. no primary admin hero, nav row, or overview card presents `billing`, `health`, or `proof` as equal peers to setup, leads, or learnings
6. no underlying capability is lost:
   - billing registry truth still readable
   - telemetry/health truth still readable
   - proof registry truth still readable

## Out of Scope

- redesigning `contact-aanvragen`
- redesigning `klantlearnings`
- changing Action Center architecture
- changing registry write APIs
- deleting the old routes immediately

## Recommended Next Step

Implement this as an IA simplification pass:

1. admin nav cleanup
2. `/beheer` secondary ops summary section
3. `/beheer/klantlearnings` proof summary integration
4. link cleanup
5. final decision on route retirement for:
   - `/beheer/billing`
   - `/beheer/health`
   - `/beheer/proof`
