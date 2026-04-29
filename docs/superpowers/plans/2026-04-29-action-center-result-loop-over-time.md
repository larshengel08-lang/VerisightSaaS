## Action Center Result Loop Over Time Plan

### Task 1: add result-progression projection tests
- cover authored history with multiple review moments
- verify chronological ordering and follow-through fallback
- keep existing latest-decision semantics intact

### Task 2: add shared result-progression projection
- project compact over-time entries from canonical decision history
- expose the new layer through shared Action Center semantics

### Task 3: render richer detail progression
- add `Resultaat over tijd` to the Action Center detail surface
- keep landing compact and unchanged in density

### Task 4: verify and checkpoint
- run focused tests
- lint changed files
- run build
- commit as phase 3 checkpoint
