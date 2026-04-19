# INSIGHT_TO_ACTION_IMPLEMENTATION_PLAN

Last updated: 2026-04-19
Status: active
Source of truth: this plan operationalizes the generator design and output canon in the current Verisight backend/frontend architecture.

## Titel

Insight-to-Action Generator - Implementation Plan

## Korte samenvatting

De MVP wordt als render-time derivation ingebouwd in backend en frontend, zonder nieuwe metriclogica of database-opslag. De backend levert generatoroutput mee in de report route-laag. De frontend bouwt dezelfde vorm op uit bestaande productmodules en toont die in de dashboard route-sectie. De shape wordt expliciet getyped en getest.

## Wat is geaudit

- `docs/active/INSIGHT_TO_ACTION_GENERATOR_DESIGN.md`
- `docs/active/INSIGHT_TO_ACTION_OUTPUT_CANON.md`
- `backend/report.py`
- `backend/products/exit/report_content.py`
- `backend/products/retention/report_content.py`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/lib/products/shared/types.ts`
- `frontend/lib/products/shared/registry.ts`
- `frontend/lib/products/exit/index.ts`
- `frontend/lib/products/retention/index.ts`
- `tests/test_scoring.py`
- `tests/test_report_generation_smoke.py`
- `frontend/lib/products/exit/dashboard.test.ts`
- `frontend/lib/products/retention/dashboard.test.ts`

## Belangrijkste bevindingen

- Report generation heeft al een natural trigger moment nadat `management_summary_payload`, `action_hypotheses` en `next_steps_payload` bekend zijn.
- Dashboard rendering heeft al een natural trigger moment nadat `dashboardViewModel`, focus questions en action playbooks beschikbaar zijn.
- Een database- of API-laag toevoegen is voor MVP niet nodig en zou de feature zwaarder maken dan nodig.
- De beste integratiestrategie is nesting:
  - backend: voeg `insight_to_action` toe aan `next_steps_payload`
  - frontend: voeg `insightToAction` toe aan `DashboardViewModel`

## Belangrijkste risico's

- Backend/frontend drift als helpers niet dezelfde shape of dedupe-regels gebruiken.
- Te veel rendercopy in bestaande files kan de onderhoudbaarheid van productmodules verder verslechteren.
- PDF regressies als de route-sectie visueel te groot wordt of paginering onbedoeld verschuift.

## Beslissingen / canonvoorstellen

### Trigger moment

- Backend trigger:
  - direct na opbouw van `next_steps_payload`
  - met toegang tot `action_hypotheses`, `top_factor_labels`, `top_factor_keys`, `scan_type` en pattern-confidence context
- Frontend trigger:
  - tijdens `buildDashboardViewModel(...)` voor `exit` en `retention`
  - met toegang tot `factorAverages`, `hasEnoughData`, focus questions, action playbooks en bestaande follow-through context

### Input mapping

- Backend input map:
  - `scan_type`
  - `top_focus_labels`
  - `top_focus_keys`
  - `next_steps_payload`
  - `action_hypotheses`
  - `has_pattern`
  - optional confidence softener from response thresholds
- Frontend input map:
  - `scan_type`
  - top factor label plus dominant band
  - `followThroughCards`
  - `nextStep`
  - top factor focus questions
  - top factor action playbook
  - `hasEnoughData` / `hasMinDisplay`

### Output schema

- Backend:
  - nested dict under `next_steps_payload["insight_to_action"]`
- Frontend:
  - typed object under `DashboardViewModel["insightToAction"]`
- Shared shape:
  - `management_priorities`
  - `verification_questions`
  - `possible_first_actions`
  - `follow_up_30_60_90`
  - optional `guardrail_note`

### Storage/render strategy

- MVP storage: none
- Strategy: render-time derivation only
- Rationale:
  - avoids schema/migration work
  - keeps truth closest to existing payload builders
  - lowers drift with existing report/dashboard logic

### UI / render locatie

- Report/PDF:
  - inside the existing route page / closeout section
  - after `session_cards`
  - before or alongside the existing numbered action rows
- Dashboard:
  - inside the existing `route` section on `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
  - after `DashboardTimeline`
  - before the "Na de eerste managementsessie" panels

### File-level implementation structure

- Backend:
  - create shared helper, likely `backend/insight_to_action.py`
  - extend `backend/products/exit/report_content.py`
  - extend `backend/products/retention/report_content.py`
  - extend `backend/report.py` rendering for the new block
- Frontend:
  - extend `frontend/lib/products/shared/types.ts`
  - create shared helper, likely `frontend/lib/products/shared/insight-to-action.ts`
  - extend `frontend/lib/products/exit/dashboard.ts`
  - extend `frontend/lib/products/retention/dashboard.ts`
  - add compact render component, likely under `frontend/components/dashboard/`
  - wire into `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- Tests:
  - backend unit tests in `tests/test_scoring.py`
  - PDF smoke assertions in `tests/test_report_generation_smoke.py`
  - frontend dashboard tests in `frontend/lib/products/exit/dashboard.test.ts`
  - frontend dashboard tests in `frontend/lib/products/retention/dashboard.test.ts`

### MVP rollout order

1. Add types and helper contracts
2. Add failing backend and frontend tests for shape and guardrails
3. Implement backend generator helper
4. Implement frontend generator helper
5. Render compact blocks in report and dashboard
6. Re-run unit and smoke checks
7. Write MVP signoff doc

## Concrete wijzigingen

- Nieuw implementatieplan toegevoegd: `docs/active/INSIGHT_TO_ACTION_IMPLEMENTATION_PLAN.md`
- Trigger, mapping, schema, render strategy en file-level landing vastgelegd
- MVP rollout order vastgelegd voor de uitvoeringsfase

## Validatie

- Het plan wijzigt geen ExitScan architectuur, metriclogica of methodische claims.
- Het plan gebruikt bestaande route-slots in plaats van nieuwe page- of storage-lagen.
- Het plan beperkt MVP-scope tot de paden waar al sterke report-to-action contracten bestaan.

## Assumptions / defaults

- `exit` en `retention` blijven de enige MVP-routes.
- Render-time derivation is voldoende zolang tests shape en guardrails borgen.
- Frontend en backend krijgen elk een helper, niet een nieuwe centrale service of API.
- Compacte rendercomponenten verdienen voorkeur boven extra tekstblokken in de bestaande page-file.

## Next gate

MVP Implementation: test-first de generatorhelpers, koppel de output aan report en dashboard, en valideer dat de nieuwe laag management-bruikbaar blijft zonder methodische overreach.
