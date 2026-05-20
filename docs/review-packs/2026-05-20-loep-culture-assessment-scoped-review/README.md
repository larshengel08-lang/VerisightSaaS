# Loep Culture Assessment Scoped Review Pack

This pack contains a **scoped review set** for `Loep Culture Assessment / Loep Cultuurbeeld`.

It is intentionally narrower than a full branch review. The goal is to let an external reviewer assess whether the `culture_assessment` product line is coherent, safe and pilot-review-ready without forcing them through unrelated repo noise.

## Included

- core backend route, report and definition files
- core frontend contract, definition and campaign surfaces
- key shared helpers that materially affect `culture_assessment`
- route-specific tests
- selected product / governance / readiness docs

## Excluded on purpose

- unrelated branch work
- broader repo cleanup work
- generic admin redesign work
- non-Cultuurbeeld product lines except where a shared helper directly affects this route

## Current scoped verdict before external review

See:

- `SCOPE_SUMMARY.md`
- `docs/superpowers/plans/2026-05-20-loep-culture-assessment-scoped-readiness-pass.md`

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

Backend:

`py -m pytest tests\test_culture_assessment_report_contract.py tests\test_culture_assessment_questionnaire_lock.py tests\test_culture_assessment_route_contract.py -q`
