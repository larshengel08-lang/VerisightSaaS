# Action Center Support Access And Incident Matrix

## Status
Draft operating matrix

## Purpose
This matrix defines the bounded response path for support, governance, privacy, and incident questions involving Action Center while keeping the product route-bound and post-scan only.

It exists to answer:

- who owns each case type
- which response path should be used
- what logged artifact is required
- when escalation is mandatory

## Response Matrix

| Case | Owner | Response path | Logged artifact | Escalation |
|---|---|---|---|---|
| Product issue | Product/engineering | fix runtime issue | support access event | engineering |
| Governance issue | HR/governance owner | review route/admin truth | support access event | governance |
| Privacy question | Founder/privacy owner | review boundaries and retention rules | support access event | privacy |
| Support configuration question | Customer success or onboarding owner | review tenant/admin setup and bounded operating instructions | support access event | product/engineering if runtime truth is unclear |
| Incident involving access or record handling | Governance/privacy owner plus engineering | review access event, affected route scope, and retention/deletion constraints | support access event | incident review |

## Case Interpretation Rules

### Product issue

- Use when the question is about incorrect runtime behavior, broken action/review flow, missing access expected by product truth, or route-state defects.
- The goal is to correct bounded Action Center runtime truth, not broaden scope.

### Governance issue

- Use when the question is about who may act, approve, continue, close out, or review within current approved scope.
- Governance review should confirm authority boundaries before any runtime change is requested.

### Privacy question

- Use when the question is about access boundaries, retention, deletion, archival, or whether a record should remain reviewable.
- Privacy review should reference the retention/deletion policy rather than rely on narration alone.

### Support configuration question

- Use when the issue is about onboarding setup, workspace membership interpretation, tenant/admin expectations, or supported operating steps.
- If the issue exposes a missing runtime control, escalate to product/engineering rather than improvising a permanent workaround.

### Incident involving access or record handling

- Use when the issue may affect customer trust, privacy, governance, or explainability of who accessed what and why.
- Incident handling must preserve the relevant support-access event and any related retention/deletion decision trail.

## Logging Requirements

Every case in this matrix requires a support access event that captures at least:

- who accessed the relevant Action Center data or operating surface
- why access occurred
- which case type was being handled
- which route or operating scope was affected when applicable
- when the access occurred

## Escalation Rules

- Escalate to engineering when the bounded runtime truth appears incorrect or incomplete.
- Escalate to governance when authority, approval, or review boundaries are unclear.
- Escalate to privacy when the question involves retention, deletion, archival, or data-boundary interpretation.
- Escalate to incident review when the case affects trust, explainability, or defensibility of access handling.

## Boundaries

- This matrix does not create a generic support desk for all Verisight products.
- This matrix applies only to Action Center operating cases.
- This matrix does not authorize broader workflow operations or unrestricted data access.

## Plain-Language Summary

Every Action Center support, governance, privacy, and incident case should follow an explicit owner-and-escalation path and leave behind a support access event so later reviewers can understand who accessed the operating layer, why they did it, and how the case was handled.
