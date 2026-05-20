# Scoped External Review Prompt

Review this pack as a combined:

- senior code review
- product-governance review
- bounded pilot / launch-readiness review

## Context

- Product: `Loep Culture Assessment / Loep Cultuurbeeld`
- Canonical route id: `culture_assessment`
- Product type: premium boardroom culture and engagement assessment
- V1 posture: annual baseline-first route with governed drilldown and bounded follow-on

This refreshed pack already includes recent scoped hardening for:

- no fabricated fallback gauges in `Verdiepingslagen`
- board-PDF segment rows gated behind governed `segment_deep_dive`
- `segment_summary` export blocked on the public org-key route and forced through the internal governance proxy
- truthful runtime readiness for `board_report_pdf` as `pilot_delivery_ready`
- imported module dependencies and referenced premium-delivery artifacts included in the pack

This route is explicitly:

- not Pulse runtime
- not RetentieScan
- not TeamScan runtime
- not a self-serve survey platform
- not a manager ranking tool
- not benchmark-first
- not an individual prediction or employee-monitoring product

## Review Goals

Please review for:

### 1. Product identity correctness

- Does the implementation still match the locked `culture_assessment` identity?
- Does anything drift toward Pulse, benchmarking, ranking, causal overclaim, or self-serve analytics?

### 2. Governance and release correctness

- Are baseline-only constraints still coherent?
- Are minimum-n, closed-baseline release, governed segment export, manager lock and hidden/suppressed layers handled consistently?
- Does the runtime remain safe when segment deep dive is unavailable, unreleased or role-blocked?

### 3. Premium delivery correctness

- Does the board report / boardroom deck / executive one-pager / HR appendix logic feel like one bounded premium output family?
- Are the readiness states truthful?
- Is the runtime copy aligned with what is pilot-delivery-ready versus still blueprint-only?

### 4. Text and drilldown safety

- Are text-safety states, hidden reasons and HR-governed-analysis boundaries explicit and believable?
- Does the route avoid raw quote behavior, unsafe local interpretation or analyst-sandbox drift?

### 5. Backend / frontend contract alignment

- Are key route contracts mirrored across backend and frontend definitions?
- Do report proxy, campaign page and contract helpers line up cleanly?

### 6. Scoped readiness

- Is this product line materially ready for bounded pilot / PR review in its own scope?
- What real blockers remain inside the current scope?

## Current Verification Context

Scoped verification already run for this refreshed pack:

Frontend:

- `cmd /c npx vitest run --config vitest.config.ts lib/products/culture_assessment/dashboard.test.ts lib/sample-showcase-assets.test.ts lib/products/shared/registry.test.ts lib/client-onboarding.test.ts "app/(dashboard)/campaigns/[id]/page.test.ts" "app/api/campaigns/[id]/report/route.test.ts"`
- Result: `36 passed`

Backend:

- `py -m pytest tests\test_culture_assessment_report_contract.py tests\test_culture_assessment_questionnaire_lock.py tests\test_culture_assessment_route_contract.py tests\test_report_generation_smoke.py -q -k "culture_assessment and not retention"`
- Result: `21 passed, 5 deselected`

Use these as current scoped evidence, not as a repo-wide quality claim.

## Output Format

### 1. Findings

List findings first, ordered by severity.

For each finding include:

- severity
- file(s)
- what is wrong
- why it matters
- recommended fix

### 2. Open questions

Only if something is materially ambiguous.

### 3. Overall verdict

Classify the scoped `culture_assessment` line as:

- not ready
- materially ready with a few fixes
- ready for scoped PR / pilot review

## Review Discipline

- Prefer real bugs, governance gaps and contract drift over style commentary.
- Stay inside current V1 scope.
- Do not ask for benchmark engines, self-serve analytics workspaces or broader EX-platform scope unless a missing piece is truly required for the current product line.
- Treat unrelated retention or broader repo issues as out of scope unless they materially break `culture_assessment` itself.
