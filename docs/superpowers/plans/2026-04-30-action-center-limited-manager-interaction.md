## Action Center Limited Manager Interaction Plan

### Task 1: add manager-action contract and tests
- define the canonical manager-action shape
- cover theme, action text, review date, and expected effect rules
- keep the action layer route-bound and small

### Task 2: add HR-open to manager-request route state
- project a visible `open request` state for manager-assigned routes without actions
- keep route activation tied to first manager action
- verify existing route semantics do not regress

### Task 3: add manager action write surface
- add the first manager-facing action form inside Action Center
- require fixed theme selection and the small SMART-like action frame
- allow multiple actions, but no task-board behavior

### Task 4: wire action truth into route semantics
- use manager actions as the primary source for active route action state
- let review and result progression read from real manager actions where available
- keep landing compact and detail-rich

### Task 5: verify and checkpoint
- run focused tests
- lint changed files
- run build
- commit as the manager-interaction phase checkpoint
