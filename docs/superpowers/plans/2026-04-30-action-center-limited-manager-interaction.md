## Action Center Limited Manager Interaction Plan

### Task 1: add manager-response contract and tests
- define the canonical bounded manager-response shape
- cover `confirm`, `sharpen`, `schedule`, and `watch`
- keep the first interaction lighter than full action creation

### Task 2: add HR-open to manager-request route state
- project a visible `open request` state for manager-assigned routes without manager response
- let routes move into bounded follow-through after first manager response
- verify existing route semantics do not regress

### Task 3: add one-primary-action model
- define one primary manager action per route for the cases where real local intervention is needed
- require fixed theme selection plus the small SMART-like action frame
- make explicit how route semantics choose the primary action for review and progression

### Task 4: wire response truth and primary action truth into route semantics
- let review and progression read from bounded manager response where no primary action exists
- let primary action take over as the leading intervention source when present
- keep landing compact and detail-rich

### Task 5: browser and permission verification
- verify manager happy path in browser:
  - manager sees open request
  - manager can add bounded first response
  - route semantics update correctly
- verify HR -> manager handoff remains aligned in browser
- verify permission boundaries between HR view and manager view remain intact

### Task 6: verify and checkpoint
- run focused tests
- lint changed files
- run build
- commit as the manager-interaction phase checkpoint
