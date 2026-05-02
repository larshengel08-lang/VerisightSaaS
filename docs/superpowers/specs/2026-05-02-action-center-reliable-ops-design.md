# Action Center Reliable Operation Design

## Goal
Wave 5 adds a bounded operations layer for Action Center pilots.
The focus is not broad observability, but a compact health and runbook surface for the critical Action Center handoff and closeout flow.

## Foundation Split

### Canonically decided
- Action Center is a post-scan follow-through layer.
- Pilot-ready use requires not only product semantics, but also supportable operations evidence.

### Product/runtime present
- Suite telemetry already records Action Center route open, owner assignment, review scheduling, outcome, and closeout events.
- A Verisight-only health review page already exists.

### Directional but not yet hardened
- Action Center evidence is present, but not yet summarized into a bounded pilot-ops read.
- Support/recovery knowledge still lives too much in branch history and operator memory.

## Scope
- Add a compact Action Center operations snapshot to the existing health page.
- Summarize coverage for critical Action Center events.
- Add a small pilot ops runbook for support and recovery order.

## Not in scope
- Full observability stack
- alerts
- incident automation
- cross-product SRE instrumentation

## Design Rules
- Reuse existing suite telemetry truth.
- Show only the few Action Center events that matter most for pilot support:
  - route opened
  - owner assigned
  - review scheduled
  - closeout recorded
- Keep the health read bounded and admin-facing.

## Deliverables
- `action-center-ops-health` helper
- health page Action Center pilot-ops section
- helper and page tests
- compact Action Center pilot ops runbook
