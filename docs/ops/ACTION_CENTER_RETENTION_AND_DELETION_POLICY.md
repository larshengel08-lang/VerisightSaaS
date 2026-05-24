# Action Center Retention And Deletion Policy

## Status
Draft operating policy

## Purpose
This policy defines the bounded retention, archival, and deletion rules for Action Center operating records while Action Center remains embedded, route-bound, and limited to approved route families.

It does not authorize:

- route expansion
- generic workflow retention policy
- silent deletion of reviewable operating records

## Scope

This policy applies to:

- Action Center route truth
- Action Center workspace membership truth
- Action Center approval and support-access records

This policy does not replace broader platform obligations. It defines the Action Center operating layer that enterprise, governance, privacy, and support review should use when evaluating record lifecycle decisions.

## Record Classes

### Operational runtime truth

Includes:

- route records used to track follow-through state
- route review, continuation, and closeout state
- workspace membership records used to determine who may see or act within Action Center

### Support-access records

Includes:

- support access events
- governance review access events
- privacy review access events
- incident access events

### Audit export request records

Includes:

- audit export requests
- export preparation notes
- export approval or denial notes

## Retention Rules

### Operational runtime truth

- Operational runtime truth must be retained as the current source of record for active and reviewable Action Center follow-through.
- Operational runtime truth may be archived only when the record is no longer needed for active follow-through or bounded review.
- Operational runtime truth may not be silently deleted while it is still needed to explain a route, review decision, continuation, closeout, or access boundary.

### Support-access records

- Support-access records must be retained long enough to explain who accessed Action Center data, why the access occurred, and which route or operating scope was involved when applicable.
- Support-access records must remain reviewable for governance, privacy, and incident follow-up.
- Support-access records may not be deleted only because the access later appears routine or low risk.

### Audit export request records

- Audit export request records must be retained long enough to explain what was requested, who approved it, what bounded record set was prepared, and whether delivery occurred.
- Audit export request records must remain distinguishable from the exported contents themselves.
- Audit export request records may not be silently removed when they are the only remaining explanation of why a review export was prepared.

## Deletion And Archival Rules

### What can be archived

- completed or superseded operational records that no longer need to drive active Action Center follow-through
- historical support-access records that no longer require active handling but still need bounded reviewability
- historical audit export request records once the request outcome is settled and the record only needs historical retention

### What cannot be silently deleted

- operational runtime truth still needed to explain a current or recent review decision
- support-access records tied to governance, privacy, or incident follow-up
- audit export request records that provide the only trace of a governance or privacy review package
- records under active incident, privacy, governance, or customer dispute review

### Who approves deletion

- product/engineering owner confirms whether operational runtime truth is still required as current source of record
- governance or privacy owner confirms whether the record is still required for governance, privacy, or incident review
- tenant/customer-side owner is consulted before deleting customer-relevant records that affect explainability of route history or access review

Deletion should be treated as an exception path. If archival preserves explainability while reducing live operating surface, archival is preferred over deletion.

## Archival And Deletion Decision Rules

- archive instead of delete when a record is no longer operationally active but may still be needed for bounded explanation or review
- deny deletion when the record is part of an unresolved governance, privacy, incident, or customer-trust question
- escalate ambiguous requests to governance/privacy review rather than relying on founder memory or ad hoc judgment

## Review And Exceptions

- Any exception to this policy must name the decision owner, the affected record class, the reason for the exception, and the next review date.
- Exceptions do not broaden Action Center scope; they only document why a specific lifecycle decision was made.

## Plain-Language Summary

Action Center records can be archived when they are no longer operationally active, but they cannot be silently deleted if they are still needed to explain route truth, support access, governance review, privacy review, or audit-export decisions.
