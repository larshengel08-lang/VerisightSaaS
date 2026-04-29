## Action Center Stronger Action Quality Plan

### Task 1: add action-quality tests and shared rules
- add tests for authored step/effect validation
- add shared helpers for step-like versus effect-like text
- keep rules small and decision-aware

### Task 2: enforce stronger action quality in authored write input
- reject clearly weak authored combinations
- improve admin guidance for `currentStep`, `nextStep`, `expectedEffect`

### Task 3: tighten Action Center projection
- keep actionProgress and actionFrame aligned with stronger quality rules
- ensure closing decisions do not regress into open action phrasing

### Task 4: verify and checkpoint
- run focused tests
- lint changed files
- run build
- commit as phase 2 checkpoint
