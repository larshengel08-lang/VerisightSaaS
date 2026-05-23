# Action Center Tenant And Admin Readiness Matrix

## Status
Proposed

## Purpose

Define the governance-readiness expectations for tenant and administrative operation of Action Center across three maturity states:

- Embedded
- Near-Standalone
- Standalone

This artifact is a readiness matrix only. It does not authorize launch, route expansion, commercial broadening, or product repositioning.

It keeps the current Action Center truth explicit:

- Action Center remains embedded in Loep today
- approved route families remain `exit` and `retention`
- HR remains the governance owner
- Loep remains canonical for route truth
- Action Center remains authoritative for follow-through status, review, continuation, and closeout
- the product remains bounded away from generic workflow, project management, and broad employee-operating-system framing

## Scope Boundary

This matrix evaluates whether Action Center has enough enterprise-governance depth to be operated credibly at different maturity levels.

It does not:

- approve a standalone launch
- approve near-standalone external positioning as a product state
- authorize new route families
- widen manager permissions beyond bounded participation
- change privacy, proof, or category boundaries already established elsewhere

## Roles In Scope

### tenant admin

The tenant admin decides tenant-scoped access, reporting, and retention settings. The tenant admin assigns or removes administrative rights, can inspect the resulting record, and is the primary tenant-side reviewer for governance evidence.

### HR governance admin

The HR governance admin decides route-governance controls inside the approved scope, including review rhythm, continuation, closeout, and sensitive route-level exceptions. This role executes those decisions or delegates them, and the resulting approvals and changes should be recorded for later inspection.

### manager participant

The manager participant executes route-linked follow-through work within assigned scope only. This role does not decide governance policy, and its updates should be visible in the operating record for HR review.

### executive viewer

The executive viewer is a read-oriented role. Access, if allowed, should be limited to approved oversight views, and the role should not be able to change governance settings or operating records.

### Verisight support operator

The Verisight support operator is a controlled support role used only for bounded troubleshooting, incident handling, or evidence reconstruction under explicit support rules. Support access should be approved through the defined support path, recorded, and inspectable afterward.

## Core Control Areas

### role-based visibility

Action Center should state who decides visibility, who receives access, what scope each role can see, what is recorded when access changes, and who can inspect that record. Special attention should remain on route scope, person-sensitive evidence, executive aggregation, and prevention of cross-tenant or cross-route leakage.

### route activation approvals

Action Center should state who may approve route activation, who executes the change, what approval record is kept, and who can inspect the approval history for the approved route families inside a tenant.

### route deactivation and archival controls

Action Center should state who may deactivate a route, who carries out archival handling, what closure or archival record is kept, and who can inspect that history when a route is paused, ended, or no longer permitted.

### audit export

Action Center should state which governance records are exportable, who can request an export, who fulfills the request, and what categories of evidence are expected in the export for oversight review.

### support access logging

Action Center should record when support access occurs, who approved it, who performed it, why it occurred, what scope was accessed, and who can inspect that log afterward.

### data retention controls

Action Center should state who sets retention rules, which records are covered, how exceptions or holds are handled, what reference policy applies, and who can inspect the effective retention setting.

### deletion and archival policy

Action Center should state who may authorize deletion, when archival is used instead of deletion, what record of the action is kept, and who can inspect the resulting history so policy handling does not drift into ambiguity.

### incident process

Action Center should fit within a named incident process that identifies the escalation owner, expected record of the incident, review path for access or privacy exceptions, and who can inspect incident handling afterward.

### environment separation

Where relevant, Action Center should state which environments exist, who may access each one, what support or testing activity is allowed there, what is logged, and how tenant review can distinguish production from non-production handling.

## Capability Matrix

| Control / readiness area | Embedded | Near-Standalone | Standalone |
| --- | --- | --- | --- |
| Governance owner model | HR governance admin decision rights can be described from current embedded practice, though tenant admin separation may still be inferred from broader Loep administration | tenant admin and HR governance admin responsibilities are documented, assignable to named roles, and reviewable by a tenant admin | tenant admin and HR governance admin responsibilities are defined well enough to assess as a hypothetical standalone control model |
| Role catalog | manager participant and executive viewer roles can be described, but some interpretation may still rely on surrounding Loep context | all five roles appear in a documented role matrix with stated scope, decision rights, and inspection expectations | all five roles remain documented in a form that can be assessed without assuming Loep-only administration |
| role-based visibility | current visibility rules can be described for route participation and HR oversight | visibility rules are documented in admin docs, assignable to named roles, and reviewable by tenant admin | visibility rules are defined well enough to assess whether a hypothetical standalone model could preserve the same role boundaries |
| route activation approvals | route activation approvals follow current embedded governance practice, but evidence may rely on surrounding operating records | route activation approvals are tied to named approvers, recorded in an approval log, and reviewable by tenant admin or HR governance admin | route activation approvals are defined well enough to assess as a hypothetical standalone control with named approver, executor, and recorded log |
| route deactivation and archival controls | deactivation path and archival intent can be described, though evidence may depend on surrounding process records | route deactivation and archival controls are documented with named decision owners, expected records, and inspection path | route deactivation and archival controls are defined well enough to assess as a hypothetical standalone lifecycle control |
| audit export | some governance evidence may be retrievable through Loep or support handling, but export scope may not be described in one Action Center-specific artifact | audit export scope is documented, sample output is identifiable, and export can be requested through a named review path | audit export is defined well enough to assess as a hypothetical standalone oversight control |
| support access logging | support handling is controlled, but log review may still rely on surrounding support process evidence | support access logging records approver, operator, reason, scope, and time, and the log is reviewable by tenant admin on request | support access logging is defined well enough to assess as a hypothetical standalone vendor-access control |
| data retention controls | retention handling can be described, though the controlling policy may still be inherited from broader embedded governance | data retention controls point to a named policy reference, covered record types, and a reviewable effective setting | data retention controls are defined well enough to assess as a hypothetical standalone records control |
| deletion and archival policy | deletion and archive handling can be described at policy level, but the inspection path may still rely on surrounding process evidence | deletion and archival policy identifies who authorizes deletion, when archival applies, and what record remains inspectable | deletion and archival policy is defined well enough to assess as a hypothetical standalone disposition control |
| incident process | incident process can be described through current Verisight operating practice | incident process names the escalation owner, expected record, and inspection path for governance review | incident process is defined well enough to assess as a hypothetical standalone incident-handling control |
| environment separation | environment separation may be inherited from the embedded platform context and described through surrounding controls | environment separation is documented where relevant, including who may access production and non-production contexts and what is logged | environment separation is defined well enough to assess as a hypothetical standalone control boundary |
| Buyer-readiness result | assessable as an embedded governance pattern | more assessable in enterprise diligence and more concrete in buyer/operator review while still embedded in Loep | defined narrowly enough to review as a hypothetical standalone control model, without implying launch approval |

## Near-Standalone Must-Haves

Near-Standalone in this batch means governance readiness that is strong enough to withstand buyer diligence while Action Center still remains embedded in Loep.

The near-standalone must-haves are:

- all five in-scope roles are explicitly named, bounded, and evidenced in a role matrix
- role-based visibility is defined tightly enough to distinguish HR governance, tenant administration, manager participation, executive read access, and support exceptions
- route activation approvals are tied to named authority and evidenced in an approval log
- route deactivation and archival controls are documented with clear decision rights and expected evidence handling
- audit export expectations are explicit enough for governance review, with a sample audit export or equivalent evidence path identified
- support access logging is mandatory for bounded support intervention, with a support access log available for review
- data retention controls point to a retention policy reference and covered record types
- deletion and archival policy is written in a way that prevents ambiguity between operational history, archival need, and deletion obligations
- incident process responsibilities are explicit across customer governance and Verisight operating roles, with a named incident escalation owner
- environment separation is clearly stated anywhere customer trust would otherwise depend on assumption

## Role Expectations By Maturity State

### Embedded

- tenant admin may be partially represented through broader Loep administration rather than a fully separate Action Center governance model
- HR governance admin remains the primary operating authority
- manager participant remains tightly bounded to route-linked participation
- executive viewer remains optional and aggregated where appropriate
- Verisight support operator remains exception-based and tightly controlled

### Near-Standalone

- tenant admin becomes an explicit governance actor rather than an implied platform administrator
- HR governance admin responsibilities are clearly separated from tenant-wide administration
- manager participant remains bounded and does not widen into generalized work orchestration
- executive viewer access is explicit, aggregated, and non-operational
- Verisight support operator access requires explicit support rules, support access logging, and incident-aware reviewability

### Standalone

- tenant admin remains the reference decision owner for tenant-scoped controls in any hypothetical standalone control model
- HR governance admin remains the route and follow-through authority
- manager participant remains bounded in any hypothetical standalone assessment
- executive viewer remains read-oriented and bounded away from operational control
- Verisight support operator remains tightly governed so hypothetical standalone review does not assume uncontrolled vendor reach

## Governance Interpretation

This matrix should be read as a diligence aid, not as a shipping gate. A stronger matrix outcome means Action Center can be assessed more concretely in enterprise diligence and discussed more credibly in buyer/operator review within its bounded follow-through role.

It does not mean:

- standalone launch is approved
- broader workflow scope is approved
- route expansion is approved
- separate packaging or GTM is approved

## Plain-Language Summary

Action Center can strengthen buyer and operator review before any standalone decision by making tenant administration, HR governance, support controls, retention handling, audit evidence, and incident responsibilities explicit. Near-Standalone readiness in this sense means clearer and more inspectable governance inside an embedded Action Center, not an approved standalone product state.
