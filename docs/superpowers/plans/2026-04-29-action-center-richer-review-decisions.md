## Action Center Richer Review Decisions Plan

### Task 1: add decision-profile rules and tests
- extend authored decision tests with decision-specific requirements
- add shared helpers that classify decisions into open vs closing behavior
- add validation rules for `doorgaan`, `bijstellen`, `afronden`, `stoppen`

### Task 2: project richer review-decision semantics into Action Center
- add shared projection for `decisionSummary`, `decisionGuidance`, `nextCheckVisibility`
- apply it in core semantics and decision history rendering
- ensure closeout decisions do not render open follow-up fields

### Task 3: strengthen beheer write-surface
- surface decision-specific guidance in the authored admin editor
- enforce decision-specific behavior in the editor payload
- keep manager-facing Action Center read-only

### Task 4: verify and publish
- run focused tests
- lint changed files
- run build with local env parity if needed
- commit, push, PR, review, merge
