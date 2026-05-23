# Action Center Tenant/Admin Gap Table

## Status
First-pass internal gap table updated after enterprise-operating gap wave

## Purpose
This table translates the current Action Center near-standalone readiness discussion into a concrete tenant/admin capability view.

It does not authorize:

- standalone launch
- route expansion
- separate GTM

It answers only:

- what tenant/admin capabilities exist today
- what is only partially present
- what is still missing
- which gaps block near-standalone enterprise readiness

## Reading Guide

Status values:

- `ready`: materially present and defensible enough to build on
- `partial`: some real capability exists, but not yet as a coherent enterprise control
- `not_ready`: missing or only implied in docs

## Gap Table

| Capability | Current status | Current evidence | Main gap | Why it matters |
|---|---|---|---|---|
| Tenant admin role | `partial` | Explicit admin-governance capabilities now exist in [action-center-admin-governance.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-admin-governance.ts) and are wired through [suite-access.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/suite-access.ts) | No clear top-level customer admin control model or dedicated tenant-admin surface | Near-standalone positioning needs customer-owned administration |
| HR governance admin role | `partial` | HR/governance write resolution exists in [action-center-governance.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-governance.test.ts) | Present as access logic, not yet as full admin operating package | Enterprise buyers need explicit governance ownership |
| Manager participant role | `partial` | Manager-light route participation exists in runtime and route semantics | Role exists, but not yet packaged as a full governed participant model | Manager role must stay bounded and explainable |
| Executive viewer role | `partial` | Read-only executive readback capability now exists in [action-center-admin-governance.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-admin-governance.ts) | No clear aggregated visibility policy or runtime surface | Needed for safe sponsor/readback access |
| Verisight/support operator role | `partial` | Verisight admin authority is visible in governance helpers and support-access logging now exists in [support-access-events/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/action-center/admin/support-access-events/route.ts) | No explicit customer-safe support role package | Support access must be explainable and auditable |
| Role-based visibility | `partial` | Current route/workspace access logic is real in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/action-center/page.tsx) | Visibility exists, but no complete enterprise access matrix | Near-standalone trust depends on controlled visibility |
| Route activation approvals | `partial` | Bounded approval truth now exists in [route-activation-approvals/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/action-center/admin/route-activation-approvals/route.ts), [action-center-ops-health.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/action-center-ops-health.ts), and `supabase/schema.sql` | Approval flow is still API/admin-first and not yet a complete operator package | Required before multi-route governance can be defended |
| Route deactivation / archival controls | `not_ready` | No explicit archival control package demonstrated | No visible retirement/archive policy | Enterprise operations need controlled lifecycle beyond open/close |
| Audit export | `partial` | Bounded export summary and export-request logging now exist in [audit-exports/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/action-center/admin/audit-exports/route.ts) | Audit export exists, but only as a bounded summary scaffold | Governance reviews often require portable evidence |
| Support access logging | `partial` | Policy layer now exists in [ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md), and runtime logging now exists in [support-access-events/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/action-center/admin/support-access-events/route.ts) | Support involvement is now transparently recordable, but still not a mature operator workflow | Important for privacy and enterprise review |
| Data retention controls | `partial` | Policy layer now exists in [ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md) | Retention is now named as Action Center operating policy, but not yet surfaced as a runtime control package | Needed for privacy and buyer trust |
| Deletion / archival policy | `partial` | Owned policy artifact now exists in [ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md) | Lifecycle policy is now explicit, but not yet backed by visible deletion/archive runtime controls | Required for enterprise-operating maturity |
| Incident process | `partial` | Reliable-ops direction exists in [2026-05-02-action-center-reliable-ops-design.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/superpowers/specs/2026-05-02-action-center-reliable-ops-design.md), and case routing now exists in [ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md) | Ops-health and response routing now exist directionally, but not yet as a full incident runtime model | Near-standalone readiness needs more than telemetry summaries |
| Environment separation | `not_ready` | No explicit Action Center environment separation model was validated here | Separation may exist elsewhere, but not as Action Center readiness truth | Enterprise buyers will ask how isolated operations are handled |

## Immediate Interpretation

### Strongest current signals

- HR/governance access logic is real
- manager-light route participation is real
- route/workspace access is real enough to prove this is not a free-form task board

### Weakest current signals

- tenant admin
- executive viewer
- activation approvals as a packaged operator flow
- audit export as a mature portable evidence flow
- support logging as a lived operating rhythm
- retention/deletion controls

These are the clearest blockers between “bounded product concept” and “near-standalone enterprise-operational readiness”.

## Required Next Moves

1. Use [2026-05-23-action-center-enterprise-operating-verification-sheet.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/superpowers/specs/2026-05-23-action-center-enterprise-operating-verification-sheet.md) as the capability-by-capability verification sheet against current runtime and policies.
2. Separate what already exists elsewhere in the platform from what Action Center can currently claim as its own governed operating package using [ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_RETENTION_AND_DELETION_POLICY.md) and [ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_SUPPORT_ACCESS_AND_INCIDENT_MATRIX.md) as the current policy layer.
3. Resolve the highest-risk blockers first:
   - tenant admin
   - executive viewer packaging
   - route activation approvals as an operator flow
   - support access logging review rhythm
   - retention/deletion policy
   - audit export maturity

## Boundaries

This table does not change Action Center product truth.

It does not authorize:

- standalone launch
- route expansion
- workflow broadening
- broader commercial claims
