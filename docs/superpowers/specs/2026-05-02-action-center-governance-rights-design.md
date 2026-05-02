# Action Center Governance and Rights Hardening

## Goal
Wave 4 hardens Action Center as a pilot-trustworthy follow-through layer by making a small set of authority boundaries and audit roles more canonical in runtime truth.

This is intentionally not a broad RBAC redesign.
It is a focused governance slice for the highest-trust write paths that already exist:
- route closeout
- route reopen
- follow-up route trigger

## Foundation Split

### Canonically decided
- HR / Verisight can perform route-level governance actions above manager-owned execution.
- Closeout, reopen, and follow-up are all explicit write actions with stored actor truth.
- These actions should remain authority-safe and later auditable.

### Product/runtime present
- Runtime APIs already gate closeout, reopen, and follow-up to HR/admin paths.
- Follow-up already persists a more explicit admin role in some cases.
- Closeout and reopen already persist canonical route records.

### Directional but not yet hardened
- Runtime still collapses some governance actor truth too aggressively.
- Similar HR/admin checks are duplicated instead of resolved once.
- Audit truth is not yet consistently preserved across all route-governance writes.

## Scope

### In scope
- Introduce one shared helper for HR/admin write authority resolution.
- Preserve more exact actor truth for governance writes:
  - `verisight_admin`
  - `hr_owner`
  - `hr_member`
- Align closeout, reopen, and follow-up APIs to the same authority resolution model.
- Harden tests around exact audit-role persistence.
- Provide a repo-side Supabase patch for compatible role constraints.

### Not in scope
- Full Action Center permissions redesign.
- New viewer roles or new route-scope models.
- UI redesign of governance surfaces.
- Broad audit timeline features.

## Design Rules

### Shared write resolution
Governance writes should resolve authority through one shared helper, not through ad hoc per-route logic.

Resolution order:
1. `verisight_admin`
2. org owner as `hr_owner`
3. workspace-level `hr_owner` or `hr_member` with `can_update`
4. otherwise deny

### Exact audit truth
Governance writes should preserve the resolved actor role in stored route truth where runtime already stores an actor role.

That means:
- closeout should not always flatten to `hr`
- reopen should not always flatten to `hr`
- follow-up should not flatten org-owner and workspace-member writes into one generic bucket

### Compatibility posture
Legacy values such as `hr` and `manager` remain accepted in projection and read paths for compatibility.
Wave 4 only hardens new writes and constraint compatibility.

## Deliverables
- Shared governance helper in frontend runtime.
- Closeout API aligned to shared HR/admin write resolution.
- Reopen API aligned to shared HR/admin write resolution.
- Follow-up API aligned to shared HR/admin write resolution.
- Focused tests proving exact audit-role persistence.
- Dedicated SQL patch for role-constraint compatibility.

## Pilot-Readiness Contribution
This wave contributes to pilot readiness by making route-governance writes:
- more authority-safe
- less duplicated
- easier to reason about
- more auditable in stored truth

It does not finish all governance work, but it makes the most important route-level write paths materially more trustworthy.
