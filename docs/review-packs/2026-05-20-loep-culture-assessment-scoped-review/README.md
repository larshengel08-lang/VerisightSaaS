# Loep Culture Assessment Scoped Review Pack

This pack contains a **scoped review set** for `Loep Culture Assessment / Loep Cultuurbeeld`.

It is intentionally narrower than a full branch review. The goal is to let an external reviewer assess whether the `culture_assessment` product line is coherent, safe and pilot-review-ready without forcing them through unrelated repo noise.

## Included

- core backend route, report and definition files
- core frontend contract, definition and campaign surfaces
- key shared helpers that materially affect `culture_assessment`
- route-specific tests
- selected product / governance / readiness docs
- imported `culture_assessment` module dependencies used by the scoped files
- referenced premium-delivery artifacts needed to verify sample/showcase truth

## Excluded on purpose

- unrelated branch work
- broader repo cleanup work
- generic admin redesign work
- non-Cultuurbeeld product lines except where a shared helper directly affects this route

## Current scoped verdict before external review

See:

- `SCOPE_SUMMARY.md`
- `docs/superpowers/plans/2026-05-20-loep-culture-assessment-scoped-readiness-pass.md`

This refreshed pack already includes the latest scoped hardening for:

- culture-specific deepening panels with no fabricated fallback scores
- governed gating of board-PDF segment rows
- internal-only `segment_summary` export path
- truthful `board_report_pdf` pilot-delivery readiness
- explicit V1 runtime-role clarity in the culture contract
- domain presentation as a bestuurlijke leesvolgorde rather than a heavier rank surface
- inclusion of previously missing imported/reference artifacts

## How to use

1. Read `REVIEW_PROMPT.md`
2. Review the included files in place
3. Prefer findings about:
   - product drift
   - governance gaps
   - contract mismatch
   - unsafe export / text behavior
   - premium delivery truthfulness

## Verification already used for this pack

Frontend:

`cmd /c npx vitest run --config vitest.config.ts lib/products/culture_assessment/dashboard.test.ts lib/sample-showcase-assets.test.ts lib/products/shared/registry.test.ts lib/client-onboarding.test.ts "app/(dashboard)/campaigns/[id]/page.test.ts" "app/api/campaigns/[id]/report/route.test.ts"`

Result: `37 passed`

Backend:

`py -m pytest tests\test_culture_assessment_report_contract.py tests\test_culture_assessment_questionnaire_lock.py tests\test_culture_assessment_route_contract.py tests\test_report_generation_smoke.py -q -k "culture_assessment and not retention"`

Result: `21 passed, 5 deselected`

## Scope note

This pack is suitable for a clean scoped external review of the `culture_assessment` line.

It is not a claim that:

- the full branch is clean
- the full repository is merge-ready
- unrelated retention or non-Cultuurbeeld failures are resolved
